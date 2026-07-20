/**
 * Tests for DawContext session initialisation logic.
 * Audio modules are mocked so no Web Audio API is required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// ── Mock all audio singletons ───────────────────────────────────────────────
vi.mock('../audio/context',  () => ({ initAudio: vi.fn(), suspendAudio: vi.fn(), getContext: vi.fn() }));
vi.mock('../audio/clock',    () => ({ clock: { bpm: 132, swing: 0, humanizeTime: 0, humanizeVelocity: 0, start: vi.fn(), stop: vi.fn() } }));
vi.mock('../audio/launcher', () => ({
  launcher: {
    attach: vi.fn(), detach: vi.fn(), onNoteOn: vi.fn(),
    launchClip: vi.fn(), stopClip: vi.fn(), launchScene: vi.fn(),
    stopAll: vi.fn(), getClipStepIndex: vi.fn(() => -1),
  },
}));
vi.mock('../audio/patchgraph', () => ({
  patchGraph: {
    init: vi.fn(), addTrack: vi.fn(), removeTrack: vi.fn(),
    getLiveChain: vi.fn(() => null), getTrackInput: vi.fn(() => null),
    setSlotFx: vi.fn(), updateParam: vi.fn(),
    setTrackPan: vi.fn(), setTrackSend: vi.fn(),
    setKickRumble: vi.fn(), setMasterCompressor: vi.fn(),
    setMasterSaturatorTilt: vi.fn(), setMasterLimiter: vi.fn(),
    masterSidechainAmount: 0, masterSidechainRelease: 0, masterSidechainEnabled: false,
  },
}));
vi.mock('../audio/synth', () => ({ playNote: vi.fn(), loadSample: vi.fn() }));

import { DawProvider, useDaw } from '../context/DawContext';
import { clipKey } from '../types/daw';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(DawProvider, null, children);

// ── Track roster ─────────────────────────────────────────────────────────────
describe('BLISS default session — tracks', () => {
  it('starts with exactly 8 preset tracks', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    expect(result.current.session.tracks).toHaveLength(8);
  });

  it('has all expected track IDs', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const ids = result.current.session.tracks.map(t => t.id);
    expect(ids).toEqual([
      'track-kick', 'track-snare', 'track-clap',
      'track-hat',  'track-ohat',  'track-bass',
      'track-acid', 'track-lead',
    ]);
  });

  it('hat tracks share mute group 1', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const { tracks } = result.current.session;
    const chat = tracks.find(t => t.id === 'track-hat')!;
    const ohat = tracks.find(t => t.id === 'track-ohat')!;
    expect(chat.muteGroup).toBe(1);
    expect(ohat.muteGroup).toBe(1);
  });

  it('open hat has autoStopNote enabled', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const ohat = result.current.session.tracks.find(t => t.id === 'track-ohat')!;
    expect(ohat.autoStopNote).toBe(true);
  });
});

// ── Scene roster ──────────────────────────────────────────────────────────────
describe('BLISS default session — scenes', () => {
  it('has exactly 4 preset scenes', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    expect(result.current.session.scenes).toHaveLength(4);
  });

  it('scene names match the expected set', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const names = result.current.session.scenes.map(s => s.name);
    expect(names).toEqual(['Intro Build', 'Dark Groove', 'Peak Hour', 'Breakdown']);
  });
});

// ── Clip population ───────────────────────────────────────────────────────────
describe('BLISS default session — clips', () => {
  it('creates a clip for every scene × track combination', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const { session } = result.current;
    session.scenes.forEach(scene => {
      session.tracks.forEach(track => {
        expect(session.clips[clipKey(scene.id, track.id)]).toBeDefined();
      });
    });
  });

  it('all clips start in stopped state', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const { clips } = result.current.session;
    Object.values(clips).forEach((clip: { state: string }) => {
      expect(clip.state).toBe('stopped');
    });
  });
});

// ── Dark Groove patterns ──────────────────────────────────────────────────────
describe('Dark Groove patterns', () => {
  it('kick has four-on-the-floor pattern', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const clip = result.current.session.clips[clipKey('scene-groove', 'track-kick')];
    expect(clip.steps[0].active).toBe(true);
    expect(clip.steps[4].active).toBe(true);
    expect(clip.steps[8].active).toBe(true);
    expect(clip.steps[12].active).toBe(true);
    // off-beats silent
    expect(clip.steps[2].active).toBe(false);
  });

  it('snare hits on beats 2 and 4', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const clip = result.current.session.clips[clipKey('scene-groove', 'track-snare')];
    expect(clip.steps[4].active).toBe(true);
    expect(clip.steps[12].active).toBe(true);
    expect(clip.steps[0].active).toBe(false);
  });

  it('closed hat plays 8th notes', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const clip = result.current.session.clips[clipKey('scene-groove', 'track-hat')];
    [0,2,4,6,8,10,12,14].forEach(i => expect(clip.steps[i].active).toBe(true));
    [1,3,5,7,9,11,13,15].forEach(i => expect(clip.steps[i].active).toBe(false));
  });

  it('sub bass rolls on offbeats', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const clip = result.current.session.clips[clipKey('scene-groove', 'track-bass')];
    [1,3,5,7,9,11,13,15].forEach(i => expect(clip.steps[i].active).toBe(true));
    [0,4,8,12].forEach(i => expect(clip.steps[i].active).toBe(false));
  });

  it('acid has pitch offsets on active steps', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const clip = result.current.session.clips[clipKey('scene-groove', 'track-acid')];
    const active = clip.steps.filter(s => s.active);
    expect(active.length).toBeGreaterThan(0);
    // Not all pitchOffsets are zero (the acid line has variety)
    const offsets = active.map(s => s.pitchOffset);
    expect(new Set(offsets).size).toBeGreaterThan(1);
  });
});

// ── addScene ─────────────────────────────────────────────────────────────────
describe('addScene', () => {
  it('adds a new scene to the session', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const before = result.current.session.scenes.length;
    act(() => { result.current.addScene('Test Scene'); });
    expect(result.current.session.scenes).toHaveLength(before + 1);
  });

  it('new scene has the correct name', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    act(() => { result.current.addScene('My Break'); });
    const last = result.current.session.scenes.at(-1)!;
    expect(last.name).toBe('My Break');
  });

  it('creates empty clips for every existing track in the new scene', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    act(() => { result.current.addScene('Extra'); });
    const { session } = result.current;
    const newScene = session.scenes.at(-1)!;
    session.tracks.forEach(track => {
      expect(session.clips[clipKey(newScene.id, track.id)]).toBeDefined();
    });
  });
});

// ── addTrack ─────────────────────────────────────────────────────────────────
describe('addTrack', () => {
  it('adds a new track', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    const before = result.current.session.tracks.length;
    act(() => { result.current.addTrack('FX Sweep', 'lead', 440, '#EC4899'); });
    expect(result.current.session.tracks).toHaveLength(before + 1);
  });

  it('creates empty clips for all existing scenes', () => {
    const { result } = renderHook(() => useDaw(), { wrapper });
    act(() => { result.current.addTrack('Noise', 'hat', 8000, '#ffffff'); });
    const { session } = result.current;
    const newTrack = session.tracks.at(-1)!;
    session.scenes.forEach(scene => {
      expect(session.clips[clipKey(scene.id, newTrack.id)]).toBeDefined();
    });
  });
});
