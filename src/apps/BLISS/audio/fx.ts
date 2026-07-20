/**
 * FX graph factory. Each effect is built as a small audio sub-graph exposed
 * through a uniform `FxNode` shape (input → internal graph → output) so the
 * patch graph can wire effects serially without knowing their internals.
 *
 * Dangerous params (feedback loops, delay times, resonant Q) are wrapped in
 * `clampedParam` so live slider / step-param-lock writes can never push the
 * graph into runaway resonance or throw InvalidStateError on a DelayNode.
 */

export interface ClampedParam {
  setValue(value: number): void;
}

export function clampedParam(
  ctx: { currentTime: number },
  param: { setTargetAtTime: (value: number, startTime: number, timeConstant: number) => void },
  min: number,
  max: number,
): ClampedParam {
  const clamp = (v: number): number => {
    if (!Number.isFinite(v)) return min;
    return Math.min(max, Math.max(min, v));
  };
  return {
    setValue(value: number): void {
      const safe = clamp(value);
      param.setTargetAtTime(safe, ctx.currentTime, 0.015);
    },
  };
}

export interface FxNode {
  type: FxType;
  input: AudioNode;
  output: AudioNode;
  params: Record<string, AudioParam | ((value: number) => void) | ClampedParam>;
  dispose(): void;
}

import { FxType } from '../types/daw';
import { getContext } from './context';

// Build a short noise impulse response for a convolver-based reverb.
function makeImpulseResponse(sampleRate: number, seconds: number, decay: number): AudioBuffer {
  const length = Math.max(1, Math.floor(sampleRate * seconds));
  const buffer = new AudioBuffer({ length, sampleRate, numberOfChannels: 2 });
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

function makeDistortionCurve(amount: number): Float32Array {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 100;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * Math.PI) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function createFx(type: FxType, params: Record<string, number> = {}): FxNode {
  const audio = getContext();
  const input = audio.createGain();
  const output = audio.createGain();
  const internals: AudioNode[] = [input, output];
  const fxParams: FxNode['params'] = {};

  const track = <T extends AudioNode>(node: T): T => {
    internals.push(node);
    return node;
  };

  switch (type) {
    case 'none': {
      input.connect(output);
      break;
    }

    case 'gain': {
      const g = track(audio.createGain());
      const value = params.gain ?? 0.8;
      g.gain.value = value;
      input.connect(g);
      g.connect(output);
      fxParams.gain = g.gain;
      break;
    }

    case 'lowpass':
    case 'highpass':
    case 'bandpass': {
      const filter = track(audio.createBiquadFilter());
      filter.type = type;
      filter.frequency.value = params.frequency ?? 1000;
      filter.Q.value = params.Q ?? 1;
      input.connect(filter);
      filter.connect(output);
      fxParams.frequency = filter.frequency;
      fxParams.Q = clampedParam(audio, filter.Q, 0.0001, 30);
      break;
    }

    case 'delay': {
      const delay = track(audio.createDelay(5.0));
      delay.delayTime.value = Math.min(params.time ?? 0.25, 4.99);
      const feedback = track(audio.createGain());
      const wet = track(audio.createGain());
      const dry = track(audio.createGain());
      const mix = params.mix ?? 0.3;
      wet.gain.value = mix;
      dry.gain.value = 1 - mix;
      input.connect(dry);
      dry.connect(output);
      input.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(output);
      fxParams.time = clampedParam(audio, delay.delayTime, 0.0001, 4.99);
      fxParams.feedback = clampedParam(audio, feedback.gain, 0, 0.97);
      fxParams.mix = wet.gain;
      break;
    }

    case 'reverb': {
      const convolver = track(audio.createConvolver());
      convolver.buffer = makeImpulseResponse(audio.sampleRate, params.roomSize ?? 0.85, 2.5);
      const wet = track(audio.createGain());
      const dry = track(audio.createGain());
      const mix = params.mix ?? 0.3;
      wet.gain.value = mix;
      dry.gain.value = 1 - mix;
      const roomSize = params.roomSize ?? 0.85;
      input.connect(dry);
      dry.connect(output);
      input.connect(convolver);
      convolver.connect(wet);
      wet.connect(output);
      fxParams.mix = wet.gain;
      fxParams.roomSize = ((value: number) => {
        convolver.buffer = makeImpulseResponse(audio.sampleRate, value, 2.5);
      }) as unknown as (v: number) => void;
      void roomSize;
      break;
    }

    case 'saturation_wavefolder': {
      const shaper = track(audio.createWaveShaper());
      shaper.curve = makeDistortionCurve(params.drive ?? 0.3);
      shaper.oversample = '4x';
      const wet = track(audio.createGain());
      const dry = track(audio.createGain());
      const mix = params.mix ?? 0.8;
      wet.gain.value = mix;
      dry.gain.value = 1 - mix;
      input.connect(dry);
      dry.connect(output);
      input.connect(shaper);
      shaper.connect(wet);
      wet.connect(output);
      fxParams.drive = ((value: number) => {
        shaper.curve = makeDistortionCurve(value);
      }) as unknown as (v: number) => void;
      fxParams.mix = wet.gain;
      break;
    }

    case 'modulated_filter': {
      const filter = track(audio.createBiquadFilter());
      filter.type = 'lowpass';
      filter.frequency.value = params.cutoff ?? 1000;
      filter.Q.value = params.Q ?? 2;
      const lfo = track(audio.createOscillator());
      const lfoGain = track(audio.createGain());
      lfo.frequency.value = params.lfoRate ?? 1.0;
      lfoGain.gain.value = (params.lfoDepth ?? 0.3) * (params.cutoff ?? 1000);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      const shaper = track(audio.createWaveShaper());
      shaper.curve = makeDistortionCurve(params.drive ?? 0.1);
      input.connect(filter);
      filter.connect(shaper);
      shaper.connect(output);
      fxParams.cutoff = filter.frequency;
      fxParams.Q = clampedParam(audio, filter.Q, 0.0001, 30);
      fxParams.drive = ((value: number) => {
        shaper.curve = makeDistortionCurve(value);
      }) as unknown as (v: number) => void;
      fxParams.lfoRate = lfo.frequency;
      fxParams.lfoDepth = lfoGain.gain;
      break;
    }

    case 'transient_shaper': {
      const attack = track(audio.createGain());
      attack.gain.value = 1 + (params.attack ?? 0.0);
      const body = track(audio.createBiquadFilter());
      body.type = 'lowshelf';
      body.gain.value = (params.sustain ?? 0.0) * 12;
      const out = track(audio.createGain());
      out.gain.value = params.gain ?? 0.8;
      input.connect(attack);
      attack.connect(body);
      body.connect(out);
      out.connect(output);
      fxParams.attack = attack.gain;
      fxParams.sustain = body.gain;
      fxParams.gain = out.gain;
      break;
    }

    case 'bitcrusher': {
      // Approximation: hard clip via wave shaper + gain staging (no worklet).
      const shaper = track(audio.createWaveShaper());
      shaper.curve = makeDistortionCurve((params.bits ?? 8) / 32);
      const out = track(audio.createGain());
      out.gain.value = params.gain ?? 0.8;
      input.connect(shaper);
      shaper.connect(out);
      out.connect(output);
      fxParams.gain = out.gain;
      fxParams.bits = ((value: number) => {
        shaper.curve = makeDistortionCurve(value / 32);
      }) as unknown as (v: number) => void;
      fxParams.downsample = ((_value: number) => {}) as unknown as (v: number) => void;
      fxParams.jitter = ((_value: number) => {}) as unknown as (v: number) => void;
      fxParams.mix = out.gain;
      break;
    }

    case 'freq_shifter': {
      // Ring modulation approximation of a frequency shift.
      const osc = track(audio.createOscillator());
      const ring = track(audio.createGain());
      const feedback = track(audio.createGain());
      const wet = track(audio.createGain());
      const dry = track(audio.createGain());
      const mix = params.mix ?? 0.4;
      osc.frequency.value = params.shift ?? 50;
      wet.gain.value = mix;
      dry.gain.value = 1 - mix;
      feedback.gain.value = params.feedback ?? 0.2;
      input.connect(dry);
      dry.connect(output);
      input.connect(ring);
      osc.connect(ring.gain);
      ring.connect(feedback);
      feedback.connect(ring);
      ring.connect(wet);
      wet.connect(output);
      osc.start();
      fxParams.shift = osc.frequency;
      fxParams.feedback = clampedParam(audio, feedback.gain, 0, 0.95);
      fxParams.mix = wet.gain;
      break;
    }

    case 'comb_filter': {
      const delay = track(audio.createDelay(0.1));
      delay.delayTime.value = Math.min(params.delayTime ?? 0.015, 0.099);
      const feedback = track(audio.createGain());
      const wet = track(audio.createGain());
      const dry = track(audio.createGain());
      const mix = params.mix ?? 0.5;
      wet.gain.value = mix;
      dry.gain.value = 1 - mix;
      input.connect(dry);
      dry.connect(output);
      input.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(output);
      fxParams.delayTime = clampedParam(audio, delay.delayTime, 0.0001, 0.099);
      fxParams.feedback = clampedParam(audio, feedback.gain, 0, 0.97);
      fxParams.mix = wet.gain;
      break;
    }
  }

  return {
    type,
    input,
    output,
    params: fxParams,
    dispose(): void {
      internals.forEach((node) => {
        try {
          node.disconnect();
        } catch (e) {}
      });
    },
  };
}
