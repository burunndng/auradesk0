import { describe, it, expect } from 'vitest';
import { compile } from './compiler';
import { parse } from './parser';
import { LiveCompileError } from './errors';
import { clipKey, makeClip, type Session, type SceneTrack, type Scene, type Clip } from '../types/daw';

function makeTestSession(): Session {
  const tracks: SceneTrack[] = [
    { id: 'track-kick', name: 'Kick', voice: 'kick', baseFreq: 50, color: '#fff' },
    { id: 'track-acid', name: 'Acid', voice: 'bass', baseFreq: 110, color: '#fff' },
    { id: 'track-1',    name: 'One',  voice: 'lead', baseFreq: 220, color: '#fff' },
  ];
  const scenes: Scene[] = [
    { id: 'scene-groove', name: 'Groove' },
    { id: 'scene-peak',   name: 'Peak' },
  ];
  const clips: Record<string, Clip> = {};
  scenes.forEach(s => tracks.forEach(t => {
    clips[clipKey(s.id, t.id)] = makeClip(t.id, s.id, 16);
  }));
  return { tracks, scenes, clips };
}

const session = makeTestSession();
const C = (src: string) => compile(parse(src), session);

describe('compile — transport & mixer', () => {
  it('panic', () => {
    expect(C('panic')).toEqual({ type: 'panic' });
  });

  it('play <track> defaults to the first scene', () => {
    expect(C('play kick')).toEqual({
      type: 'play',
      target: { sceneId: 'scene-groove', trackId: 'track-kick' },
    });
  });

  it('play <track> in <scene> picks the named scene', () => {
    expect(C('play acid in peak')).toEqual({
      type: 'play',
      target: { sceneId: 'scene-peak', trackId: 'track-acid' },
    });
  });

  it('play accepts numeric track shorthand', () => {
    expect(C('play 1')).toEqual({
      type: 'play',
      target: { sceneId: 'scene-groove', trackId: 'track-1' },
    });
  });

  it('stop all', () => {
    expect(C('stop all')).toEqual({ type: 'stop', target: 'all' });
  });

  it('stop <track> targets the first scene when nothing is playing', () => {
    expect(C('stop kick')).toEqual({
      type: 'stop',
      target: { sceneId: 'scene-groove', trackId: 'track-kick' },
    });
  });

  it('mute / unmute / un / solo', () => {
    expect(C('mute kick')).toEqual({ type: 'mute', target: { trackId: 'track-kick' } });
    expect(C('unmute acid')).toEqual({ type: 'unmute', target: { trackId: 'track-acid' } });
    expect(C('un acid')).toEqual({ type: 'unmute', target: { trackId: 'track-acid' } });
    expect(C('solo kick')).toEqual({ type: 'solo', target: { trackId: 'track-kick' } });
  });
});

describe('compile — tempo & scenes', () => {
  it('bpm <n>', () => {
    expect(C('bpm 140')).toEqual({ type: 'bpm', value: 140 });
  });

  it('rejects out-of-range bpm', () => {
    expect(() => C('bpm 10')).toThrow(LiveCompileError);
    expect(() => C('bpm 999')).toThrow(LiveCompileError);
  });

  it('scene <name>', () => {
    expect(C('scene peak')).toEqual({ type: 'scene', target: { sceneId: 'scene-peak' }, bpm: undefined });
  });

  it('scene <name> @ <bpm>', () => {
    expect(C('scene peak @ 138')).toEqual({
      type: 'scene',
      target: { sceneId: 'scene-peak' },
      bpm: 138,
    });
  });
});

describe('compile — params', () => {
  it('set <param> <value>', () => {
    expect(C('set delay.feedback 0.5')).toEqual({
      type: 'set',
      param: 'delay.feedback',
      value: 0.5,
    });
  });

  it('ramp <param> to <value> over <bars>', () => {
    expect(C('ramp filter.cutoff to 800 over 2')).toEqual({
      type: 'ramp',
      param: 'filter.cutoff',
      to: 800,
      ramp: { duration: 2 },
    });
  });

  it('ramp requires both "to" and "over"', () => {
    expect(() => C('ramp filter.cutoff 800 over 2')).toThrow(LiveCompileError);
    expect(() => C('ramp filter.cutoff to 800')).toThrow(LiveCompileError);
  });
});

describe('compile — errors', () => {
  it('unknown verb', () => {
    expect(() => C('wibble')).toThrow(LiveCompileError);
  });

  it('unknown track', () => {
    expect(() => C('play nobody')).toThrow(LiveCompileError);
  });

  it('unknown scene', () => {
    expect(() => C('play kick in nowhere')).toThrow(LiveCompileError);
  });

  it('missing required arguments', () => {
    expect(() => C('play')).toThrow(LiveCompileError);
    expect(() => C('bpm')).toThrow(LiveCompileError);
    expect(() => C('set')).toThrow(LiveCompileError);
  });
});

describe('compile — pattern commands', () => {
  it('euclid <track> <hits> defaults steps to clip length, offset 0', () => {
    expect(C('euclid kick 4')).toEqual({
      type: 'euclid',
      target: { sceneId: 'scene-groove', trackId: 'track-kick' },
      hits: 4, steps: 16, offset: 0,
    });
  });

  it('euclid with explicit steps + offset (acid)', () => {
    expect(C('euclid acid 5 8 2')).toEqual({
      type: 'euclid',
      target: { sceneId: 'scene-groove', trackId: 'track-acid' },
      hits: 5, steps: 8, offset: 2,
    });
  });

  it('euclid rejects steps > clip length', () => {
    expect(() => C('euclid kick 4 32')).toThrow(LiveCompileError);
  });

  it('euclid rejects hits > steps', () => {
    expect(() => C('euclid kick 20 8')).toThrow(LiveCompileError);
  });

  it('euclid requires a track', () => {
    expect(() => C('euclid')).toThrow(LiveCompileError);
    expect(() => C('euclid kick')).toThrow(LiveCompileError);
  });

  it('prob <track> <p> with no indices → null (all active)', () => {
    expect(C('prob acid 0.5')).toEqual({
      type: 'prob',
      target: { sceneId: 'scene-groove', trackId: 'track-acid' },
      probability: 0.5, steps: null,
    });
  });

  it('prob with explicit step indices', () => {
    expect(C('prob acid 0.3 0 4 8 12')).toEqual({
      type: 'prob',
      target: { sceneId: 'scene-groove', trackId: 'track-acid' },
      probability: 0.3, steps: [0, 4, 8, 12],
    });
  });

  it('prob rejects out-of-range probability', () => {
    expect(() => C('prob acid 1.5')).toThrow(LiveCompileError);
    expect(() => C('prob acid -0.1')).toThrow(LiveCompileError);
  });

  it('prob rejects out-of-range step indices', () => {
    expect(() => C('prob acid 0.5 16')).toThrow(LiveCompileError); // clip has 16 steps (0–15)
  });

  it('vel <track> <v> with no indices → null', () => {
    expect(C('vel kick 110')).toEqual({
      type: 'vel',
      target: { sceneId: 'scene-groove', trackId: 'track-kick' },
      velocity: 110, steps: null,
    });
  });

  it('vel rejects out-of-range velocity', () => {
    expect(() => C('vel kick 0')).toThrow(LiveCompileError);
    expect(() => C('vel kick 200')).toThrow(LiveCompileError);
  });

  it('notes <track> <offsets…>', () => {
    expect(C('notes acid 0 3 7 0')).toEqual({
      type: 'notes',
      target: { sceneId: 'scene-groove', trackId: 'track-acid' },
      notes: [0, 3, 7, 0],
    });
  });

  it('notes accepts negative offsets', () => {
    expect(C('notes acid -5 0 7')).toEqual({
      type: 'notes',
      target: { sceneId: 'scene-groove', trackId: 'track-acid' },
      notes: [-5, 0, 7],
    });
  });

  it('notes requires at least one offset', () => {
    expect(() => C('notes acid')).toThrow(LiveCompileError);
  });

  it('swing <amount>', () => {
    expect(C('swing 0.55')).toEqual({ type: 'swing', value: 0.55 });
  });

  it('swing rejects out-of-range', () => {
    expect(() => C('swing 1.5')).toThrow(LiveCompileError);
  });
});
