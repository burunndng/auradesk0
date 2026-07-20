import { describe, it, expect, vi } from 'vitest';
import { clampedParam } from '../audio/fx';

/**
 * Regression tests for the safety-clamp layer that wraps feedback gains, delay
 * times, and filter Q. These params are exposed for live step-param-lock /
 * slider writes; without clamping a value >= 1.0 on a feedback loop causes
 * runaway resonance (howl/ring/clipping), and a delayTime beyond its buffer max
 * throws InvalidStateError. See audio-dsp / sound-engineer robustness audit.
 */

function makeFakeCtx() {
  return { currentTime: 0 } as unknown as AudioContext;
}

function makeFakeParam() {
  return { setTargetAtTime: vi.fn(), value: 0 } as unknown as AudioParam;
}

describe('clampedParam — feedback safety clamp', () => {
  it('clamps feedback above max down to the safe ceiling (prevents runaway)', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.97);
    wrapped.setValue(1.5);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0.97, 0, 0.015);
  });

  it('clamps feedback at exactly 1.0 down below unity', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.95);
    wrapped.setValue(1.0);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0.95, 0, 0.015);
  });

  it('clamps negative feedback to min', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.85);
    wrapped.setValue(-0.3);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0, 0, 0.015);
  });

  it('coerces NaN to min (corrupted / hand-edited session data)', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.85);
    wrapped.setValue(NaN);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0, 0, 0.015);
  });

  it('coerces Infinity to min (non-finite = corrupt data -> safest value)', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.97);
    wrapped.setValue(Infinity);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0, 0, 0.015);
  });

  it('passes in-range values through unchanged', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0, 0.97);
    wrapped.setValue(0.42);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0.42, 0, 0.015);
  });

  it('clamps comb delayTime under the createDelay buffer max (prevents InvalidStateError)', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0.0001, 0.099);
    wrapped.setValue(0.5); // would exceed createDelay(0.1)
    expect(param.setTargetAtTime).toHaveBeenCalledWith(0.099, 0, 0.015);
  });

  it('clamps filter Q away from negative / extreme self-oscillation values', () => {
    const param = makeFakeParam();
    const wrapped = clampedParam(makeFakeCtx(), param, 0.0001, 20);
    wrapped.setValue(40);
    expect(param.setTargetAtTime).toHaveBeenCalledWith(20, 0, 0.015);
    wrapped.setValue(-5);
    expect(param.setTargetAtTime).toHaveBeenLastCalledWith(0.0001, 0, 0.015);
  });
});
