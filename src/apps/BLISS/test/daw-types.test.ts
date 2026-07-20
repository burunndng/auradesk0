import { describe, it, expect } from 'vitest';
import { clipKey, makeStep, makeClip } from '../types/daw';

// ─── clipKey ─────────────────────────────────────────────────────────────────
describe('clipKey', () => {
  it('produces a colon-separated composite key', () => {
    expect(clipKey('scene-groove', 'track-kick')).toBe('scene-groove:track-kick');
  });

  it('is deterministic', () => {
    expect(clipKey('scene-intro', 'track-acid')).toBe(clipKey('scene-intro', 'track-acid'));
  });

  it('differentiates reversed arguments', () => {
    expect(clipKey('a', 'b')).not.toBe(clipKey('b', 'a'));
  });
});

// ─── makeStep ────────────────────────────────────────────────────────────────
describe('makeStep', () => {
  it('is inactive by default', () => {
    expect(makeStep().active).toBe(false);
  });

  it('has sensible defaults', () => {
    const s = makeStep();
    expect(s.velocity).toBe(100);
    expect(s.probability).toBe(1.0);
    expect(s.pitchOffset).toBe(0);
    expect(s.gateLength).toBe(0.5);
    expect(s.leadLag).toBe(0);
  });

  it('applies overrides', () => {
    const s = makeStep({ active: true, velocity: 75, pitchOffset: 7 });
    expect(s.active).toBe(true);
    expect(s.velocity).toBe(75);
    expect(s.pitchOffset).toBe(7);
    // non-overridden fields still use defaults
    expect(s.probability).toBe(1.0);
  });
});

// ─── makeClip ────────────────────────────────────────────────────────────────
describe('makeClip', () => {
  it('creates the requested number of steps', () => {
    const clip = makeClip('track-kick', 'scene-groove', 16);
    expect(clip.steps).toHaveLength(16);
    expect(clip.stepCount).toBe(16);
  });

  it('all steps start inactive', () => {
    const clip = makeClip('track-kick', 'scene-groove', 16);
    expect(clip.steps.every(s => !s.active)).toBe(true);
  });

  it('stores trackId and sceneId', () => {
    const clip = makeClip('track-acid', 'scene-melodic', 16);
    expect(clip.trackId).toBe('track-acid');
    expect(clip.sceneId).toBe('scene-melodic');
  });

  it('initial state is empty', () => {
    expect(makeClip('track-lead', 'scene-outro', 16).state).toBe('empty');
  });

  it('each call produces a unique id', () => {
    const a = makeClip('track-kick', 'scene-groove', 16);
    const b = makeClip('track-kick', 'scene-groove', 16);
    expect(a.id).not.toBe(b.id);
  });

  it('respects custom step counts', () => {
    expect(makeClip('track-kick', 'scene-groove', 32).steps).toHaveLength(32);
  });
});
