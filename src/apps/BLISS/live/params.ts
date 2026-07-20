export type ParamDomain = 'fx' | 'clock' | 'track';

export interface ParamRef {
  domain: ParamDomain;
  fxType?: string;
  paramKey: string;
  label: string;
  min: number;
  max: number;
}

export const PARAM_REGISTRY: Record<string, ParamRef> = {
  // Clock
  'bpm':              { domain: 'clock', paramKey: 'bpm', label: 'BPM', min: 30, max: 300 },
  'swing':            { domain: 'clock', paramKey: 'swing', label: 'Swing', min: 0, max: 1 },

  // Delay
  'delay.time':       { domain: 'fx', fxType: 'delay', paramKey: 'time', label: 'Delay Time', min: 0.05, max: 1.5 },
  'delay.feedback':   { domain: 'fx', fxType: 'delay', paramKey: 'feedback', label: 'Delay Feedback', min: 0, max: 0.95 },
  'delay.mix':        { domain: 'fx', fxType: 'delay', paramKey: 'mix', label: 'Delay Mix', min: 0, max: 1 },

  // Reverb
  'reverb.size':      { domain: 'fx', fxType: 'reverb', paramKey: 'roomSize', label: 'Reverb Size', min: 0, max: 0.98 },
  'reverb.mix':       { domain: 'fx', fxType: 'reverb', paramKey: 'mix', label: 'Reverb Mix', min: 0, max: 1 },

  // Modulated filter
  'filter.cutoff':    { domain: 'fx', fxType: 'modulated_filter', paramKey: 'cutoff', label: 'Filter Cutoff', min: 40, max: 12000 },
  'filter.q':         { domain: 'fx', fxType: 'modulated_filter', paramKey: 'Q', label: 'Filter Q', min: 0.1, max: 10 },
  'filter.drive':     { domain: 'fx', fxType: 'modulated_filter', paramKey: 'drive', label: 'Filter Drive', min: 0, max: 1 },
  'filter.lfo':       { domain: 'fx', fxType: 'modulated_filter', paramKey: 'lfoRate', label: 'Filter LFO Rate', min: 0.1, max: 20 },
  'filter.depth':     { domain: 'fx', fxType: 'modulated_filter', paramKey: 'lfoDepth', label: 'Filter LFO Depth', min: 0, max: 1 },

  // Saturation
  'sat.drive':        { domain: 'fx', fxType: 'saturation_wavefolder', paramKey: 'drive', label: 'Saturation Drive', min: 0.01, max: 1 },
  'sat.mix':          { domain: 'fx', fxType: 'saturation_wavefolder', paramKey: 'mix', label: 'Saturation Mix', min: 0, max: 1 },

  // Bitcrusher
  'crush.bits':       { domain: 'fx', fxType: 'bitcrusher', paramKey: 'bits', label: 'Bit Depth', min: 1, max: 16 },
  'crush.down':       { domain: 'fx', fxType: 'bitcrusher', paramKey: 'downsample', label: 'Downsample', min: 1, max: 40 },
  'crush.mix':        { domain: 'fx', fxType: 'bitcrusher', paramKey: 'mix', label: 'Crush Mix', min: 0, max: 1 },

  // Freq shifter
  'shift.freq':       { domain: 'fx', fxType: 'freq_shifter', paramKey: 'shift', label: 'Freq Shift', min: -1000, max: 1000 },
  'shift.mix':        { domain: 'fx', fxType: 'freq_shifter', paramKey: 'mix', label: 'Shift Mix', min: 0, max: 1 },

  // Comb filter
  'comb.delay':       { domain: 'fx', fxType: 'comb_filter', paramKey: 'delayTime', label: 'Comb Delay', min: 0.001, max: 0.05 },
  'comb.feedback':    { domain: 'fx', fxType: 'comb_filter', paramKey: 'feedback', label: 'Comb Feedback', min: 0, max: 0.95 },
  'comb.mix':         { domain: 'fx', fxType: 'comb_filter', paramKey: 'mix', label: 'Comb Mix', min: 0, max: 1 },

  // Transient shaper
  'trans.attack':     { domain: 'fx', fxType: 'transient_shaper', paramKey: 'attack', label: 'Transient Attack', min: -1, max: 1 },
  'trans.sustain':    { domain: 'fx', fxType: 'transient_shaper', paramKey: 'sustain', label: 'Transient Sustain', min: -1, max: 1 },

  // Generic FX aliases
  'feedback':         { domain: 'fx', fxType: 'delay', paramKey: 'feedback', label: 'Delay Feedback', min: 0, max: 0.95 },
  'mix':              { domain: 'fx', fxType: 'delay', paramKey: 'mix', label: 'Mix', min: 0, max: 1 },
};

export function resolveParam(name: string): ParamRef | undefined {
  return PARAM_REGISTRY[name.toLowerCase()];
}

export function clampParam(ref: ParamRef, value: number): number {
  return Math.min(ref.max, Math.max(ref.min, value));
}
