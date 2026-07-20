import { describe, it, expect, vi } from 'vitest';
import { execute } from './runtime';
import type { LiveRuntimeHost } from './types';
import {
  clipKey, makeClip, makeStep,
  type Session, type SceneTrack, type Scene, type Clip, type Step,
} from '../types/daw';

function makeSession(clipMutator?: (clip: Clip, trackId: string, sceneId: string) => void): Session {
  const tracks: SceneTrack[] = [
    { id: 'track-kick', name: 'Kick', voice: 'kick', baseFreq: 50, color: '#fff' },
    { id: 'track-acid', name: 'Acid', voice: 'bass', baseFreq: 110, color: '#fff' },
  ];
  const scenes: Scene[] = [{ id: 'scene-a', name: 'A' }];
  const clips: Record<string, Clip> = {};
  for (const s of scenes) for (const t of tracks) {
    const clip = makeClip(t.id, s.id, 16);
    clipMutator?.(clip, t.id, s.id);
    clips[clipKey(s.id, t.id)] = clip;
  }
  return { tracks, scenes, clips };
}

function makeHost(session: Session) {
  const updates: Array<{ sceneId: string; trackId: string; steps: Step[] }> = [];
  const host: LiveRuntimeHost = {
    getSession: () => session,
    getFxChains: () => [],
    getBpm: () => 120,
    getQuantization: () => 'bar',
    launchClip: vi.fn(),
    stopClip: vi.fn(),
    launchScene: vi.fn(),
    stopAll: vi.fn(),
    setBpm: vi.fn(),
    setTrackMute: vi.fn(),
    setTrackSolo: vi.fn(),
    setFxParam: vi.fn(),
    updateClipSteps: (sceneId, trackId, steps) => updates.push({ sceneId, trackId, steps }),
    panic: vi.fn(),
  };
  return { host, updates };
}

const run = async (src: string, session: Session) => {
  const { host, updates } = makeHost(session);
  const { compile } = await import('./compiler');
  const { parse } = await import('./parser');
  const msg = await execute(compile(parse(src), session), host);
  return { msg, updates };
};

describe('runtime — euclid', () => {
  it('writes the canonical pattern into the clip', async () => {
    const session = makeSession();
    const { msg, updates } = await run('euclid kick 4', session);
    expect(updates).toHaveLength(1);
    const active = updates[0].steps.map((s, i) => (s.active ? i : -1)).filter(i => i >= 0);
    expect(active).toEqual([0, 4, 8, 12]);
    expect(msg).toContain('Euclid');
  });

  it('newly-activated steps get default velocity 100', async () => {
    const session = makeSession();
    const { updates } = await run('euclid kick 4', session);
    expect(updates[0].steps[0].velocity).toBe(100);
    expect(updates[0].steps[0].active).toBe(true);
  });

  it('clears steps beyond the pattern length', async () => {
    const session = makeSession(clip => {
      clip.steps[14].active = true;
      clip.steps[15].active = true;
    });
    const { updates } = await run('euclid kick 4 8', session);
    expect(updates[0].steps[14].active).toBe(false);
    expect(updates[0].steps[15].active).toBe(false);
  });
});

describe('runtime — prob / vel', () => {
  it('prob with no indices targets all active steps', async () => {
    const session = makeSession(clip => {
      if (clip.trackId !== 'track-kick') return;
      [0, 4, 8].forEach(i => { clip.steps[i].active = true; });
    });
    const { msg, updates } = await run('prob kick 0.5', session);
    expect(updates).toHaveLength(1);
    expect(updates[0].steps[0].probability).toBe(0.5);
    expect(updates[0].steps[4].probability).toBe(0.5);
    expect(updates[0].steps[8].probability).toBe(0.5);
    expect(updates[0].steps[1].probability).toBe(1); // untouched
    expect(msg).toContain('3 step');
  });

  it('prob with explicit indices targets only those', async () => {
    const session = makeSession();
    const { updates } = await run('prob kick 0.3 0 8', session);
    expect(updates[0].steps[0].probability).toBe(0.3);
    expect(updates[0].steps[8].probability).toBe(0.3);
    expect(updates[0].steps[4].probability).toBe(1);
  });

  it('prob on a clip with no active steps + no indices → error', async () => {
    const session = makeSession(); // all inactive
    await expect(run('prob kick 0.5', session)).rejects.toThrow(/No active steps/);
  });

  it('vel sets velocity on targeted steps', async () => {
    const session = makeSession(clip => {
      if (clip.trackId !== 'track-kick') return;
      [0, 4].forEach(i => { clip.steps[i].active = true; });
    });
    const { updates } = await run('vel kick 127', session);
    expect(updates[0].steps[0].velocity).toBe(127);
    expect(updates[0].steps[4].velocity).toBe(127);
  });
});

describe('runtime — notes', () => {
  it('assigns semitone offsets to active steps (cycling)', async () => {
    const session = makeSession(clip => {
      if (clip.trackId !== 'track-acid') return;
      [0, 4, 8, 12].forEach(i => { clip.steps[i].active = true; });
    });
    const { msg, updates } = await run('notes acid 0 3 7', session);
    expect(updates[0].steps[0].pitchOffset).toBe(0);
    expect(updates[0].steps[4].pitchOffset).toBe(3);
    expect(updates[0].steps[8].pitchOffset).toBe(7);
    expect(updates[0].steps[12].pitchOffset).toBe(0); // cycles back
    expect(msg).toContain('4 steps');
  });

  it('notes on a clip with no active steps → error', async () => {
    const session = makeSession();
    await expect(run('notes acid 0 3', session)).rejects.toThrow(/No active steps/);
  });
});

describe('runtime — swing', () => {
  it('sets clock.swing directly', async () => {
    const { clock } = await import('../audio/clock');
    const session = makeSession();
    const { host } = makeHost(session);
    const { compile } = await import('./compiler');
    const { parse } = await import('./parser');
    const before = clock.swing;
    await execute(compile(parse('swing 0.6'), session), host);
    expect(clock.swing).toBe(0.6);
    clock.swing = before; // restore
  });
});
