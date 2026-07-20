export type VoiceType = 'kick' | 'snare' | 'hat' | 'bass' | 'lead' | 'sampler';

export type FxType =
  | 'none'
  | 'gain'
  | 'lowpass'
  | 'highpass'
  | 'bandpass'
  | 'delay'
  | 'reverb'
  | 'saturation_wavefolder'
  | 'modulated_filter'
  | 'transient_shaper'
  | 'distortion'
  | 'modulated_filter'
  | 'compressor';

export type ClipState = 'empty' | 'stopped' | 'queued' | 'playing';

export interface Step {
  active: boolean;
  velocity: number;      // 0–127
  probability: number;   // 0–1
  pitchOffset: number;   // semitones relative to track's base pitch
  gateLength: number;    // 0.1–1.5 (fraction of step duration, >1 allows legato stretch)
  leadLag: number;       // -1.0 to 1.0 (microtiming shift ±10ms scaled by tempo)
  paramLocks?: Record<string, number>; // parameter name -> value
}

export interface Clip {
  id: string;
  trackId: string;
  sceneId: string;
  steps: Step[];
  stepCount: number;     // e.g. 16
  state: ClipState;
}

export interface SceneTrack {
  id: string;
  name: string;
  voice: VoiceType;
  baseFreq: number;      // base frequency in Hz (e.g. 55Hz for Bass)
  color: string;         // Hex color for UI representation
  sampleUrl?: string;    // Object URL for the loaded sample
  muteGroup?: number;    // 0 is none, 1-256 for exclusive groups
  autoStopNote?: boolean;// stop previous note on trigger
  applyVelocity?: boolean;// velocity affects gain
  velocitySelectionMode?: 'first' | 'roundRobin' | 'random';
}

export interface Scene {
  id: string;
  name: string;
  bpm?: number;          // optional tempo override
}

export interface Session {
  tracks: SceneTrack[];
  scenes: Scene[];
  clips: Record<string, Clip>; // key: `${sceneId}:${trackId}`
}

export interface FxSlot {
  type: FxType;
  params: Record<string, number>;
}

export interface TrackChain {
  trackId: string;
  slots: [FxSlot, FxSlot, FxSlot];
}

export type Quantization = 'immediate' | 'beat' | 'bar';

export const FX_DEFAULT_PARAMS: Record<FxType, Record<string, number>> = {
  none: {},
  gain: { gain: 0.8 },
  lowpass: { frequency: 1000, Q: 1 },
  highpass: { frequency: 500, Q: 1 },
  bandpass: { frequency: 1000, Q: 2 },
  delay: { time: 0.25, feedback: 0.4, mix: 0.3 },
  reverb: { roomSize: 0.85, mix: 0.3 },
  saturation_wavefolder: { drive: 0.3, mode: 0, mix: 0.8 },
  modulated_filter: { cutoff: 1000, Q: 2, drive: 0.1, lfoRate: 1.0, lfoDepth: 0.3, filterType: 0 },
  transient_shaper: { attack: 0.0, sustain: 0.0, gain: 0.8 },
  bitcrusher: { bits: 8, downsample: 4, jitter: 0.1, mix: 0.8 },
  freq_shifter: { shift: 50, feedback: 0.2, mix: 0.4 },
  comb_filter: { delayTime: 0.015, feedback: 0.6, mix: 0.5 }
};

export const FX_PARAM_RANGES: Record<string, { min: number; max: number; step: number; label: string; unit?: string }> = {
  gain: { min: 0, max: 1.2, step: 0.01, label: 'Gain' },
  frequency: { min: 40, max: 15000, step: 1, label: 'Freq', unit: 'Hz' },
  Q: { min: 0.1, max: 10, step: 0.1, label: 'Q' },
  time: { min: 0.05, max: 1.5, step: 0.01, label: 'Time', unit: 's' },
  feedback: { min: 0, max: 0.95, step: 0.01, label: 'Feedback' },
  mix: { min: 0, max: 1, step: 0.01, label: 'Mix' },
  roomSize: { min: 0, max: 0.98, step: 0.01, label: 'Size' },
  
  // Saturation & Wavefolder
  drive: { min: 0.01, max: 1.0, step: 0.01, label: 'Drive' },
  mode: { min: 0, max: 2, step: 1, label: 'Type (0=Tube, 1=Tape, 2=Fold)' },
  
  // Modulated Filter
  cutoff: { min: 40, max: 12000, step: 1, label: 'Cutoff', unit: 'Hz' },
  lfoRate: { min: 0.1, max: 20.0, step: 0.1, label: 'LFO Rate', unit: 'Hz' },
  lfoDepth: { min: 0, max: 1, step: 0.01, label: 'LFO Depth' },
  filterType: { min: 0, max: 2, step: 1, label: 'Mode (0=LP, 1=HP, 2=BP)' },
  
  // Transient Shaper
  attack: { min: -1.0, max: 1.0, step: 0.01, label: 'Attack' },
  sustain: { min: -1.0, max: 1.0, step: 0.01, label: 'Sustain' },
  
  // Bitcrusher
  bits: { min: 1, max: 16, step: 1, label: 'Bit Depth', unit: 'bit' },
  downsample: { min: 1, max: 40, step: 1, label: 'Downsample' },
  jitter: { min: 0, max: 1.0, step: 0.01, label: 'Jitter/Drift' },
  
  // Freq Shifter
  shift: { min: -1000, max: 1000, step: 1, label: 'Freq Shift', unit: 'Hz' },
  
  // Comb Filter
  delayTime: { min: 0.001, max: 0.05, step: 0.001, label: 'Comb Delay', unit: 's' }
};

export function clipKey(sceneId: string, trackId: string): string {
  return `${sceneId}:${trackId}`;
}

export function makeStep(overrides: Partial<Step> = {}): Step {
  return {
    active: false,
    velocity: 100,
    probability: 1.0,
    pitchOffset: 0,
    gateLength: 0.5,
    leadLag: 0,
    paramLocks: {},
    ...overrides
  };
}

export function makeClip(trackId: string, sceneId: string, stepCount = 16): Clip {
  return {
    id: `clip-${crypto.randomUUID()}`,
    trackId,
    sceneId,
    steps: Array.from({ length: stepCount }, () => makeStep()),
    stepCount,
    state: 'empty'
  };
}
