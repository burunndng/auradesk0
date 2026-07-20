import { ParsedCommand, parseNumber, parseTrackRef, parseSceneRef } from './parser';
import { LiveCommand } from './types';
import { LiveCompileError } from './errors';
import type { Session, Clip } from '../types/daw';

function findTrack(session: Session, ref: string) {
  const id = parseTrackRef(ref);
  const t = session.tracks.find(t => t.id === id || t.name.toLowerCase() === ref.toLowerCase());
  if (!t) {
    throw new LiveCompileError(
      `Unknown track "${ref}". Available: ${session.tracks.map(t => t.name).join(', ')}`
    );
  }
  return t;
}

function findScene(session: Session, ref: string) {
  const id = parseSceneRef(ref);
  const s = session.scenes.find(s => s.id === id || s.name.toLowerCase() === ref.toLowerCase());
  if (!s) {
    throw new LiveCompileError(
      `Unknown scene "${ref}". Available: ${session.scenes.map(s => s.name).join(', ')}`
    );
  }
  return s;
}

// Pick the scene a track should act in: the scene where the track is currently
// playing/queued, falling back to the first scene. Keeps `play`/`stop` working
// without forcing the user to name a scene every time.
function resolveSceneForTrack(session: Session, trackId: string) {
  if (session.scenes.length === 0) return undefined;
  return (
    session.scenes.find(s => {
      const c = session.clips[`${s.id}:${trackId}`];
      return c && (c.state === 'playing' || c.state === 'queued');
    }) ?? session.scenes[0]
  );
}

// Resolve the concrete clip a pattern command should mutate.
function resolveClip(session: Session, trackId: string): { sceneId: string; trackId: string; clip: Clip } {
  const scene = resolveSceneForTrack(session, trackId);
  if (!scene) throw new LiveCompileError('No scenes exist to edit');
  const clip = session.clips[`${scene.id}:${trackId}`];
  if (!clip) throw new LiveCompileError('No clip found for that track in the active scene');
  return { sceneId: scene.id, trackId, clip };
}

// Parse trailing step-index arguments (e.g. "0 4 8 12"), validating each
// falls within the clip's step range.
function parseStepIndices(args: string[], clip: Clip, label: string): number[] {
  return args.map((raw, i) => {
    const idx = parseNumber(raw, `${label} index`);
    if (!Number.isInteger(idx) || idx < 0 || idx >= clip.stepCount) {
      throw new LiveCompileError(
        `${label} index ${raw} out of range (clip has ${clip.stepCount} steps, 0–${clip.stepCount - 1})`
      );
    }
    return idx;
  });
}

export function compile(cmd: ParsedCommand, session: Session): LiveCommand {
  const { verb, args } = cmd;

  switch (verb) {
    case 'panic':
      return { type: 'panic' };

    case 'play': {
      // play <track> [in <scene>]
      if (!args[0]) throw new LiveCompileError('"play" requires a track name or number');
      const track = findTrack(session, args[0]);
      const inIdx = args.indexOf('in');
      let scene;
      if (inIdx !== -1 && args[inIdx + 1]) {
        scene = findScene(session, args[inIdx + 1]);
      } else {
        scene = resolveSceneForTrack(session, track.id);
      }
      if (!scene) throw new LiveCompileError('No scenes exist to play into');
      return { type: 'play', target: { sceneId: scene.id, trackId: track.id } };
    }

    case 'stop': {
      // stop all | stop <track>
      if (!args[0] || args[0] === 'all') return { type: 'stop', target: 'all' };
      const track = findTrack(session, args[0]);
      const scene = resolveSceneForTrack(session, track.id);
      if (!scene) throw new LiveCompileError('No scenes to stop from');
      return { type: 'stop', target: { sceneId: scene.id, trackId: track.id } };
    }

    case 'mute': {
      if (!args[0]) throw new LiveCompileError('"mute" requires a track name or number');
      const track = findTrack(session, args[0]);
      return { type: 'mute', target: { trackId: track.id } };
    }

    case 'unmute':
    case 'un': {
      if (!args[0]) throw new LiveCompileError('"unmute" requires a track name or number');
      const track = findTrack(session, args[0]);
      return { type: 'unmute', target: { trackId: track.id } };
    }

    case 'solo': {
      if (!args[0]) throw new LiveCompileError('"solo" requires a track name or number');
      const track = findTrack(session, args[0]);
      return { type: 'solo', target: { trackId: track.id } };
    }

    case 'bpm': {
      if (!args[0]) throw new LiveCompileError('"bpm" requires a number');
      const value = parseNumber(args[0], 'bpm');
      if (value < 30 || value > 300) throw new LiveCompileError(`BPM must be 30–300, got ${value}`);
      return { type: 'bpm', value };
    }

    case 'scene': {
      // scene <name|n> [@ <bpm>]
      if (!args[0]) throw new LiveCompileError('"scene" requires a scene name or number');
      const scene = findScene(session, args[0]);
      let bpm: number | undefined;
      const atIdx = args.indexOf('@');
      if (atIdx !== -1 && args[atIdx + 1]) {
        bpm = parseNumber(args[atIdx + 1], 'bpm');
        if (bpm < 30 || bpm > 300) throw new LiveCompileError(`BPM must be 30–300, got ${bpm}`);
      }
      return { type: 'scene', target: { sceneId: scene.id }, bpm };
    }

    case 'set': {
      // set <param> <value>
      if (args.length < 2) {
        throw new LiveCompileError('"set" requires a parameter name and value');
      }
      const param = args[0];
      const value = parseNumber(args[1], param);
      return { type: 'set', param, value };
    }

    case 'ramp': {
      // ramp <param> to <value> over <bars>
      if (args.length < 4) {
        throw new LiveCompileError('"ramp" requires: ramp <param> to <value> over <bars>');
      }
      const param = args[0];
      const toIdx = args.indexOf('to');
      const overIdx = args.indexOf('over');
      if (toIdx === -1) throw new LiveCompileError('"ramp" missing "to" keyword');
      if (overIdx === -1) throw new LiveCompileError('"ramp" missing "over" keyword');
      const to = parseNumber(args[toIdx + 1], param);
      const duration = parseNumber(args[overIdx + 1], 'duration');
      return { type: 'ramp', param, to, ramp: { duration } };
    }

    case 'euclid': {
      // euclid <track> <hits> [steps] [offset]
      if (!args[0]) throw new LiveCompileError('"euclid" requires a track and a hit count');
      if (args[1] === undefined) throw new LiveCompileError('"euclid" requires a hit count');
      const track = findTrack(session, args[0]);
      const { sceneId, clip } = resolveClip(session, track.id);
      const hits = parseNumber(args[1], 'hits');
      if (hits < 0) throw new LiveCompileError('hits must be >= 0');
      const steps = args[2] !== undefined ? parseNumber(args[2], 'steps') : clip.stepCount;
      if (!Number.isInteger(steps) || steps < 1) throw new LiveCompileError('steps must be a positive integer');
      if (steps > clip.stepCount) {
        throw new LiveCompileError(`pattern length ${steps} exceeds clip length ${clip.stepCount}`);
      }
      if (hits > steps) throw new LiveCompileError(`hits (${hits}) cannot exceed steps (${steps})`);
      const offset = args[3] !== undefined ? parseNumber(args[3], 'offset') : 0;
      return { type: 'euclid', target: { sceneId, trackId: track.id }, hits, steps, offset };
    }

    case 'prob': {
      // prob <track> <prob> [step...]
      if (!args[0]) throw new LiveCompileError('"prob" requires a track and a value');
      if (args[1] === undefined) throw new LiveCompileError('"prob" requires a probability value');
      const track = findTrack(session, args[0]);
      const { sceneId, clip } = resolveClip(session, track.id);
      const probability = parseNumber(args[1], 'probability');
      if (probability < 0 || probability > 1) {
        throw new LiveCompileError('probability must be 0–1');
      }
      const steps = args.length > 2 ? parseStepIndices(args.slice(2), clip, 'step') : null;
      return { type: 'prob', target: { sceneId, trackId: track.id }, probability, steps };
    }

    case 'vel': {
      // vel <track> <velocity> [step...]
      if (!args[0]) throw new LiveCompileError('"vel" requires a track and a value');
      if (args[1] === undefined) throw new LiveCompileError('"vel" requires a velocity value');
      const track = findTrack(session, args[0]);
      const { sceneId, clip } = resolveClip(session, track.id);
      const velocity = parseNumber(args[1], 'velocity');
      if (velocity < 1 || velocity > 127) {
        throw new LiveCompileError('velocity must be 1–127');
      }
      const steps = args.length > 2 ? parseStepIndices(args.slice(2), clip, 'step') : null;
      return { type: 'vel', target: { sceneId, trackId: track.id }, velocity, steps };
    }

    case 'notes': {
      // notes <track> <n1> [n2 ...]
      if (!args[0]) throw new LiveCompileError('"notes" requires a track and at least one note');
      if (args[1] === undefined) throw new LiveCompileError('"notes" requires at least one semitone offset');
      const track = findTrack(session, args[0]);
      const { sceneId } = resolveClip(session, track.id);
      const notes = args.slice(1).map((raw, i) => {
        const n = parseNumber(raw, `note ${i + 1}`);
        if (!Number.isInteger(n)) throw new LiveCompileError(`note "${raw}" must be an integer (semitones)`);
        return n;
      });
      return { type: 'notes', target: { sceneId, trackId: track.id }, notes };
    }

    case 'swing': {
      // swing <amount>
      if (args[0] === undefined) throw new LiveCompileError('"swing" requires an amount (0–1)');
      const value = parseNumber(args[0], 'swing');
      if (value < 0 || value > 1) throw new LiveCompileError('swing must be 0–1');
      return { type: 'swing', value };
    }

    default:
      throw new LiveCompileError(
        `Unknown command "${verb}". Try: play, stop, mute, unmute, solo, bpm, scene, set, ramp, euclid, prob, vel, notes, swing, panic`
      );
  }
}
