import { describe, it, expect } from 'vitest';
import { PARAM_REGISTRY, resolveParam, clampParam } from './params';

describe('PARAM_REGISTRY', () => {
  it('exposes the core live params', () => {
    expect(PARAM_REGISTRY['bpm']).toBeDefined();
    expect(PARAM_REGISTRY['delay.feedback']).toBeDefined();
    expect(PARAM_REGISTRY['filter.cutoff']).toBeDefined();
    expect(PARAM_REGISTRY['reverb.mix']).toBeDefined();
  });

  it('each entry has a min/max range', () => {
    for (const ref of Object.values(PARAM_REGISTRY)) {
      expect(ref.min).toBeLessThanOrEqual(ref.max);
      expect(typeof ref.label).toBe('string');
    }
  });
});

describe('resolveParam', () => {
  it('is case-insensitive', () => {
    expect(resolveParam('Delay.Feedback')?.paramKey).toBe('feedback');
    expect(resolveParam('FILTER.CUTOFF')?.paramKey).toBe('cutoff');
  });

  it('returns undefined for unknown params', () => {
    expect(resolveParam('totally-made-up')).toBeUndefined();
  });
});

describe('clampParam', () => {
  it('leaves in-range values untouched', () => {
    const ref = PARAM_REGISTRY['bpm'];
    expect(clampParam(ref, 140)).toBe(140);
  });

  it('clamps below the minimum', () => {
    const ref = PARAM_REGISTRY['bpm']; // min 30
    expect(clampParam(ref, 5)).toBe(30);
  });

  it('clamps above the maximum', () => {
    const ref = PARAM_REGISTRY['bpm']; // max 300
    expect(clampParam(ref, 9999)).toBe(300);
  });
});
