import { getContext } from './context';
import { createFx, FxNode } from './fx';
import { FxType, TrackChain } from '../types/daw';

/**
 * Rolling capture of the master output's time-domain samples, read straight
 * from the AnalyserNode. Used by the visualizer as a zero-copy-ish waveform
 * source (falls back to the AnalyserNode directly when unavailable).
 */
export class WaveformRing {
  private analyser: AnalyserNode;
  private size: number;

  constructor(analyser: AnalyserNode, size = 256) {
    this.analyser = analyser;
    this.size = size;
  }

  peek(count: number): number[] {
    const data = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(data);
    const n = Math.min(count, data.length);
    const start = data.length - n;
    return Array.from(data.subarray(start, data.length));
  }
}

export interface LiveTrackChain {
  trackId: string;
  input: GainNode;
  preFaderNode: GainNode;
  output: GainNode;
  slots: TrackChain['slots'];
  fxNodes: (FxNode | null)[];
  gainL: GainNode;
  gainR: GainNode;
  merger: ChannelMergerNode;
  sendGains: GainNode[];
  // Parallel Kick Rumble Channel
  rumbleInput?: GainNode;
  rumbleReverb?: FxNode;
  rumbleLPF?: BiquadFilterNode;
  rumbleSaturator?: WaveShaperNode;
  rumbleDucking?: GainNode;
  rumbleOutput?: GainNode;
}

class PatchGraph {
  private chains: Map<string, LiveTrackChain> = new Map();

  // Shared Aux Send Buses (Tier 2)
  public sendBuses: (FxNode | null)[] = [null, null, null, null];

  // Master Analyser Node
  public analyser: AnalyserNode | null = null;
  public waveformRing: WaveformRing | null = null;

  // Master Bus FX Chain (Tier 3)
  private masterInputNode: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterSaturator: WaveShaperNode | null = null;
  private masterTiltLow: BiquadFilterNode | null = null;
  private masterTiltHigh: BiquadFilterNode | null = null;
  private masterSidechain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private masterLimiterCeiling: GainNode | null = null;
  private masterOutputNode: GainNode | null = null;

  // Master ducking settings
  public masterSidechainAmount = 0.6;
  public masterSidechainRelease = 0.25;
  public masterSidechainEnabled = true;

  init() {
    const ctx = getContext();
    if (this.masterInputNode) return; // already initialized

    // 1. Initialize shared Send Buses (Pre-fader tapped, routed to Master)
    this.sendBuses[0] = createFx('reverb', { roomSize: 0.94, mix: 1.0 }); // Plate/Hall Ambience
    this.sendBuses[1] = createFx('delay', { time: 0.375, feedback: 0.6, mix: 1.0 }); // Ping-Pong Tape Delay
    this.sendBuses[2] = createFx('comb_filter', { delayTime: 0.005, feedback: 0.75, mix: 1.0 }); // Resonant Comb
    this.sendBuses[3] = createFx('modulated_filter', { cutoff: 800, Q: 5, drive: 0.3, lfoRate: 3.5, lfoDepth: 0.75, filterType: 2 }); // Vocal Vocoder

    // 2. Initialize Master Effects Rack (Tier 3)
    this.masterInputNode = ctx.createGain();
    this.masterCompressor = ctx.createDynamicsCompressor();
    this.masterSaturator = ctx.createWaveShaper();
    this.masterTiltLow = ctx.createBiquadFilter();
    this.masterTiltHigh = ctx.createBiquadFilter();
    this.masterSidechain = ctx.createGain();
    this.masterLimiter = ctx.createDynamicsCompressor();
    this.masterLimiterCeiling = ctx.createGain();
    this.masterOutputNode = ctx.createGain();

    this.masterInputNode.gain.setValueAtTime(1.0, ctx.currentTime);

    // VCA Compressor
    this.masterCompressor.threshold.setValueAtTime(-14.0, ctx.currentTime);
    this.masterCompressor.knee.setValueAtTime(6.0, ctx.currentTime);
    this.masterCompressor.ratio.setValueAtTime(2.5, ctx.currentTime);
    this.masterCompressor.attack.setValueAtTime(0.01, ctx.currentTime);
    this.masterCompressor.release.setValueAtTime(0.15, ctx.currentTime);

    // Subtle saturator (Warm Analog curves)
    const satCurve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = (i / 511.5) - 1.0;
      satCurve[i] = Math.tanh(x * 1.25) / 1.15;
    }
    this.masterSaturator.curve = satCurve;

    // Tilt shelving EQ
    this.masterTiltLow.type = 'lowshelf';
    this.masterTiltLow.frequency.setValueAtTime(600, ctx.currentTime);
    this.masterTiltLow.gain.setValueAtTime(0.0, ctx.currentTime);

    this.masterTiltHigh.type = 'highshelf';
    this.masterTiltHigh.frequency.setValueAtTime(1400, ctx.currentTime);
    this.masterTiltHigh.gain.setValueAtTime(0.0, ctx.currentTime);

    this.masterSidechain.gain.setValueAtTime(1.0, ctx.currentTime);

    // Brickwall Limiter
    this.masterLimiter.threshold.setValueAtTime(-2.0, ctx.currentTime);
    this.masterLimiter.attack.setValueAtTime(0.001, ctx.currentTime);
    this.masterLimiter.release.setValueAtTime(0.05, ctx.currentTime);
    this.masterLimiter.ratio.setValueAtTime(20.0, ctx.currentTime);
    this.masterLimiter.knee.setValueAtTime(0.0, ctx.currentTime);

    this.masterLimiterCeiling.gain.setValueAtTime(0.95, ctx.currentTime); // -0.4dB FS safe margin
    this.masterOutputNode.gain.setValueAtTime(0.8, ctx.currentTime);

    // Master Connection: Input -> Comp -> Sat -> TiltL -> TiltH -> SC -> Limiter -> Ceiling -> Out -> Analyser -> Speakers
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;

    this.masterInputNode.connect(this.masterCompressor);
    this.masterCompressor.connect(this.masterSaturator);
    this.masterSaturator.connect(this.masterTiltLow);
    this.masterTiltLow.connect(this.masterTiltHigh);
    this.masterTiltHigh.connect(this.masterSidechain);
    this.masterSidechain.connect(this.masterLimiter);
    this.masterLimiter.connect(this.masterLimiterCeiling);
    this.masterLimiterCeiling.connect(this.masterOutputNode);
    this.masterOutputNode.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    this.waveformRing = new WaveformRing(this.analyser);

    // Route Send Buses to Master Input
    this.sendBuses.forEach((bus) => {
      if (bus) {
        bus.output.connect(this.masterInputNode!);
      }
    });
  }

  getMasterGainNode(): GainNode {
    if (!this.masterInputNode) {
      this.init();
    }
    return this.masterInputNode!;
  }

  getMasterOutputNode(): GainNode {
    if (!this.masterOutputNode) {
      this.init();
    }
    return this.masterOutputNode!;
  }

  addTrack(trackId: string): LiveTrackChain {
    const ctx = getContext();
    if (!this.masterInputNode) {
      this.init();
    }

    const input = ctx.createGain();
    const preFaderNode = ctx.createGain();
    const output = ctx.createGain();
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    const merger = ctx.createChannelMerger(2);

    input.gain.setValueAtTime(1.0, ctx.currentTime);
    preFaderNode.gain.setValueAtTime(1.0, ctx.currentTime);
    output.gain.setValueAtTime(1.0, ctx.currentTime);
    gainL.gain.setValueAtTime(Math.SQRT1_2, ctx.currentTime);
    gainR.gain.setValueAtTime(Math.SQRT1_2, ctx.currentTime);

    preFaderNode.connect(output);

    const slots: TrackChain['slots'] = [
      { type: 'none', params: {} },
      { type: 'none', params: {} },
      { type: 'none', params: {} }
    ];

    const fxNodes: (FxNode | null)[] = [null, null, null];

    // Pre-fader Send gain nodes (linked preFaderNode -> sends -> sendBuses)
    const sendGains = Array.from({ length: 4 }, () => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, ctx.currentTime);
      return g;
    });

    const liveChain: LiveTrackChain = {
      trackId,
      input,
      preFaderNode,
      output,
      slots,
      fxNodes,
      gainL,
      gainR,
      merger,
      sendGains
    };

    // If Kick drum track, wire up parallel sub-bass Rumble Engine!
    if (trackId === 'track-kick') {
      const rumbleInput = ctx.createGain();
      const rumbleLPF = ctx.createBiquadFilter();
      const rumbleSaturator = ctx.createWaveShaper();
      const rumbleDucking = ctx.createGain();
      const rumbleOutput = ctx.createGain();

      rumbleInput.gain.setValueAtTime(1.0, ctx.currentTime);

      // Deep, cavernous parallel reverb
      const rumbleReverb = createFx('reverb', { roomSize: 0.98, mix: 1.0 });

      // Clean lowpass for low-end rumble only
      rumbleLPF.type = 'lowpass';
      rumbleLPF.frequency.setValueAtTime(80, ctx.currentTime);
      rumbleLPF.Q.setValueAtTime(1.0, ctx.currentTime);

      // Saturator to add grit & harmonic thickness
      const rCurve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i / 255.5) - 1.0;
        rCurve[i] = Math.tanh(x * 2.2);
      }
      rumbleSaturator.curve = rCurve;

      rumbleDucking.gain.setValueAtTime(1.0, ctx.currentTime);
      rumbleOutput.gain.setValueAtTime(0.0, ctx.currentTime); // Off by default (0)

      // Parallel Rumble routing
      input.connect(rumbleInput);
      rumbleInput.connect(rumbleReverb.input);
      rumbleReverb.output.connect(rumbleLPF);
      rumbleLPF.connect(rumbleSaturator);
      rumbleSaturator.connect(rumbleDucking);
      rumbleDucking.connect(rumbleOutput);
      
      // Rumble blends post-inserts directly into track output
      rumbleOutput.connect(output);

      liveChain.rumbleInput = rumbleInput;
      liveChain.rumbleReverb = rumbleReverb;
      liveChain.rumbleLPF = rumbleLPF;
      liveChain.rumbleSaturator = rumbleSaturator;
      liveChain.rumbleDucking = rumbleDucking;
      liveChain.rumbleOutput = rumbleOutput;
    }

    this.chains.set(trackId, liveChain);
    this.rewire(liveChain);

    // Wire up panning subgraph
    output.connect(gainL);
    output.connect(gainR);

    // Merge to stereo stream
    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    // Connect stereo stream to Master Gain Input
    merger.connect(this.masterInputNode!);

    // Connect pre-fader tap directly to send nodes (Pre-Fader Send Topology)
    sendGains.forEach((sg, idx) => {
      preFaderNode.connect(sg);
      const bus = this.sendBuses[idx];
      if (bus) {
        sg.connect(bus.input);
      }
    });

    return liveChain;
  }

  removeTrack(trackId: string) {
    const chain = this.chains.get(trackId);
    if (!chain) return;

    chain.fxNodes.forEach((fx) => {
      if (fx) {
        fx.dispose();
      }
    });

    if (chain.rumbleReverb) {
      chain.rumbleReverb.dispose();
    }

    try {
      chain.input.disconnect();
      chain.preFaderNode.disconnect();
      chain.output.disconnect();
      chain.gainL.disconnect();
      chain.gainR.disconnect();
      chain.merger.disconnect();
      chain.sendGains.forEach(sg => sg.disconnect());
      if (chain.rumbleInput) chain.rumbleInput.disconnect();
      if (chain.rumbleLPF) chain.rumbleLPF.disconnect();
      if (chain.rumbleSaturator) chain.rumbleSaturator.disconnect();
      if (chain.rumbleDucking) chain.rumbleDucking.disconnect();
      if (chain.rumbleOutput) chain.rumbleOutput.disconnect();
    } catch (e) {}

    this.chains.delete(trackId);
  }

  setTrackPan(trackId: string, pan: number, law: 'balance' | 'constantPower' | 'constantSum') {
    const chain = this.chains.get(trackId);
    if (!chain) return;

    const ctx = getContext();
    const now = ctx.currentTime;

    let coefL = 1.0;
    let coefR = 1.0;

    if (law === 'balance') {
      if (pan <= 0) {
        coefL = 1.0;
        coefR = pan + 1.0;
      } else {
        coefL = 1.0 - pan;
        coefR = 1.0;
      }
    } else if (law === 'constantSum') {
      coefL = (1.0 - pan) * 0.5;
      coefR = (1.0 + pan) * 0.5;
    } else {
      // constantPower (default)
      const angle = (pan + 1.0) * (Math.PI / 4.0);
      coefL = Math.cos(angle);
      coefR = Math.sin(angle);
    }

    chain.gainL.gain.setTargetAtTime(coefL, now, 0.015);
    chain.gainR.gain.setTargetAtTime(coefR, now, 0.015);
  }

  getTrackInput(trackId: string): GainNode {
    const chain = this.chains.get(trackId);
    if (!chain) {
      return this.addTrack(trackId).input;
    }
    return chain.input;
  }

  setSlotFx(trackId: string, slotIndex: number, type: FxType, params: Record<string, number> = {}): boolean {
    const chain = this.chains.get(trackId);
    if (!chain) return false;
    if (slotIndex < 0 || slotIndex >= 3) return false;

    // Dispose old effect
    if (chain.fxNodes[slotIndex]) {
      chain.fxNodes[slotIndex]!.dispose();
      chain.fxNodes[slotIndex] = null;
    }

    chain.slots[slotIndex] = { type, params };
    this.rewire(chain);
    return true;
  }

  updateParam(trackId: string, slotIndex: number, paramName: string, value: number) {
    const chain = this.chains.get(trackId);
    if (!chain) return;
    if (slotIndex < 0 || slotIndex >= 3) return;

    const fx = chain.fxNodes[slotIndex];
    if (!fx) return;

    const param = fx.params[paramName];
    if (param) {
      const ctx = getContext();
      if ('setTargetAtTime' in param) {
        param.setTargetAtTime(value, ctx.currentTime, 0.015);
      } else if (typeof param === 'function') {
        (param as Function)(value);
      } else if (param && 'setValue' in param) {
        param.setValue(value);
      }
    }
    // Update cached parameters
    chain.slots[slotIndex].params[paramName] = value;
  }

  setTrackSend(trackId: string, sendIndex: number, level: number) {
    const chain = this.chains.get(trackId);
    if (!chain || sendIndex < 0 || sendIndex >= 4) return;
    const ctx = getContext();
    chain.sendGains[sendIndex].gain.setTargetAtTime(level, ctx.currentTime, 0.015);
  }

  setSendBusParam(busIndex: number, paramName: string, value: number) {
    const bus = this.sendBuses[busIndex];
    if (!bus) return;
    const param = bus.params[paramName];
    if (param) {
      const ctx = getContext();
      if ('setTargetAtTime' in param) {
        param.setTargetAtTime(value, ctx.currentTime, 0.015);
      } else if (typeof param === 'function') {
        (param as Function)(value);
      } else if (param && 'setValue' in param) {
        param.setValue(value);
      }
    }
  }

  setKickRumble(trackId: string, amount: number, decay: number, filterFreq: number) {
    const chain = this.chains.get(trackId);
    if (!chain || !chain.rumbleOutput || !chain.rumbleLPF) return;
    const ctx = getContext();
    const now = ctx.currentTime;
    chain.rumbleOutput.gain.setTargetAtTime(amount, now, 0.015);
    chain.rumbleLPF.frequency.setTargetAtTime(filterFreq, now, 0.015);
    // Also update ducking threshold or reverb decay slightly if desired
  }

  triggerMasterSidechain(audioTime: number) {
    if (!this.masterSidechainEnabled || !this.masterSidechain) return;
    const now = audioTime;
    
    // Smooth duck down, then exponential recovery
    this.masterSidechain.gain.cancelScheduledValues(now);
    this.masterSidechain.gain.setValueAtTime(1.0, now);
    this.masterSidechain.gain.exponentialRampToValueAtTime(
      Math.max(0.01, 1.0 - this.masterSidechainAmount),
      now + 0.015
    );
    this.masterSidechain.gain.exponentialRampToValueAtTime(
      1.0,
      now + 0.015 + this.masterSidechainRelease
    );
  }

  triggerRumbleDucking(trackId: string, audioTime: number) {
    const chain = this.chains.get(trackId);
    if (!chain || !chain.rumbleDucking) return;
    const now = audioTime;

    // Instant duck on transient kick attack to avoid rumble muddying, then swell back in
    chain.rumbleDucking.gain.cancelScheduledValues(now);
    chain.rumbleDucking.gain.setValueAtTime(0.0, now);
    chain.rumbleDucking.gain.linearRampToValueAtTime(1.0, now + 0.16);
  }

  setMasterCompressor(threshold: number, ratio: number, attack: number, release: number, enabled: boolean) {
    if (!this.masterCompressor) return;
    const ctx = getContext();
    const now = ctx.currentTime;
    if (enabled) {
      this.masterCompressor.threshold.setTargetAtTime(threshold, now, 0.015);
      this.masterCompressor.ratio.setTargetAtTime(ratio, now, 0.015);
      this.masterCompressor.attack.setTargetAtTime(attack, now, 0.015);
      this.masterCompressor.release.setTargetAtTime(release, now, 0.015);
    } else {
      this.masterCompressor.threshold.setTargetAtTime(0, now, 0.015);
      this.masterCompressor.ratio.setTargetAtTime(1.0, now, 0.015);
    }
  }

  setMasterSaturatorTilt(drive: number, tilt: number, enabled: boolean) {
    if (!this.masterTiltLow || !this.masterTiltHigh || !this.masterSaturator) return;
    const ctx = getContext();
    const now = ctx.currentTime;

    // update master saturation curve depth
    const satCurve = new Float32Array(512);
    const scale = 1.0 + drive * 3.0;
    for (let i = 0; i < 512; i++) {
      const x = (i / 255.5) - 1.0;
      satCurve[i] = Math.tanh(x * scale) / (scale * 0.9 + 0.1);
    }
    this.masterSaturator.curve = satCurve;

    if (enabled) {
      const diff = tilt - 0.5; // -0.5 to 0.5
      const lowGain = -diff * 14.0;
      const highGain = diff * 14.0;
      this.masterTiltLow.gain.setTargetAtTime(lowGain, now, 0.015);
      this.masterTiltHigh.gain.setTargetAtTime(highGain, now, 0.015);
    } else {
      this.masterTiltLow.gain.setTargetAtTime(0, now, 0.015);
      this.masterTiltHigh.gain.setTargetAtTime(0, now, 0.015);
    }
  }

  setMasterLimiter(gainVal: number, enabled: boolean) {
    if (!this.masterLimiter || !this.masterOutputNode) return;
    const ctx = getContext();
    const now = ctx.currentTime;
    const finalVolume = enabled ? 0.8 * gainVal : 0.8;
    this.masterOutputNode.gain.setTargetAtTime(finalVolume, now, 0.015);
  }

  private rewire(chain: LiveTrackChain) {
    // 1. Disconnect current connections in the chain
    try {
      chain.input.disconnect(chain.preFaderNode);
    } catch (e) {}

    chain.fxNodes.forEach((fx) => {
      if (fx) {
        try {
          fx.output.disconnect();
          chain.input.disconnect(fx.input);
        } catch (e) {}
      }
    });

    // 2. Instantiate and connect the active serial chain
    chain.slots.forEach((slot, i) => {
      if (slot.type === 'none') {
        chain.fxNodes[i] = null;
      } else {
        if (!chain.fxNodes[i] || chain.fxNodes[i]!.type !== slot.type) {
          chain.fxNodes[i] = createFx(slot.type, slot.params);
        }
      }
    });

    // 3. Chain up live nodes
    const activeNodes: FxNode[] = [];
    chain.fxNodes.forEach((node) => {
      if (node) activeNodes.push(node);
    });

    if (activeNodes.length === 0) {
      chain.input.connect(chain.preFaderNode);
    } else {
      chain.input.connect(activeNodes[0].input);
      for (let i = 0; i < activeNodes.length - 1; i++) {
        activeNodes[i].output.connect(activeNodes[i + 1].input);
      }
      activeNodes[activeNodes.length - 1].output.connect(chain.preFaderNode);
    }
  }

  getLiveChain(trackId: string): LiveTrackChain | undefined {
    return this.chains.get(trackId);
  }
}

export const patchGraph = new PatchGraph();
