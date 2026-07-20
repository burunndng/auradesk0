import { LiveCommand, LiveRuntimeHost } from './types';
import { LiveRuntimeError } from './errors';
import { resolveParam, clampParam } from './params';
import { euclidean } from './euclidean';
import { clock } from '../audio/clock';

export async function execute(cmd: LiveCommand, host: LiveRuntimeHost): Promise<string> {
  const session = host.getSession();

  switch (cmd.type) {
    case 'panic':
      host.panic();
      return 'Panic: all notes off';

    case 'play': {
      const { sceneId, trackId } = cmd.target;
      const scene = session.scenes.find(s => s.id === sceneId);
      const track = session.tracks.find(t => t.id === trackId);
      if (!scene || !track) throw new LiveRuntimeError(`play: target not found`);
      host.launchClip(sceneId, trackId);
      return `Playing ${track.name} in ${scene.name}`;
    }

    case 'stop': {
      if (cmd.target === 'all') {
        host.stopAll();
        return 'Stopped all clips';
      }
      if ('trackId' in cmd.target && 'sceneId' in cmd.target) {
        const { sceneId, trackId } = cmd.target;
        host.stopClip(sceneId, trackId);
        const track = session.tracks.find(t => t.id === trackId);
        return `Stopped ${track?.name ?? trackId}`;
      }
      host.stopAll();
      return 'Stopped all clips';
    }

    case 'mute': {
      const { trackId } = cmd.target;
      const track = session.tracks.find(t => t.id === trackId);
      host.setTrackMute(trackId, true);
      return `Muted ${track?.name ?? trackId}`;
    }

    case 'unmute': {
      const { trackId } = cmd.target;
      const track = session.tracks.find(t => t.id === trackId);
      host.setTrackMute(trackId, false);
      return `Unmuted ${track?.name ?? trackId}`;
    }

    case 'solo': {
      const { trackId } = cmd.target;
      const track = session.tracks.find(t => t.id === trackId);
      host.setTrackSolo(trackId, true);
      return `Solo ${track?.name ?? trackId}`;
    }

    case 'bpm': {
      host.setBpm(cmd.value);
      return `BPM → ${cmd.value}`;
    }

    case 'scene': {
      if (cmd.bpm !== undefined) {
        host.setBpm(cmd.bpm);
      }
      host.launchScene(cmd.target.sceneId);
      const scene = session.scenes.find(s => s.id === cmd.target.sceneId);
      const bpmNote = cmd.bpm !== undefined ? ` @ ${cmd.bpm} BPM` : '';
      return `Launched scene ${scene?.name ?? cmd.target.sceneId}${bpmNote}`;
    }

    case 'set': {
      const ref = resolveParam(cmd.param);
      if (!ref) throw new LiveRuntimeError(`Unknown parameter "${cmd.param}". Try: delay.feedback, filter.cutoff, reverb.mix, bpm, swing…`);
      const clamped = clampParam(ref, cmd.value);

      if (ref.domain === 'clock') {
        if (ref.paramKey === 'bpm') host.setBpm(clamped);
        else if (ref.paramKey === 'swing') clock.swing = clamped;
        return `${ref.label} → ${clamped}`;
      }

      if (ref.domain === 'fx' && ref.fxType) {
        const fxChains = host.getFxChains();
        let applied = 0;
        for (const chain of fxChains) {
          chain.slots.forEach((slot, idx) => {
            if (slot.type === ref.fxType) {
              host.setFxParam(chain.trackId, idx, ref.paramKey, clamped);
              applied++;
            }
          });
        }
        if (applied === 0) {
          throw new LiveRuntimeError(`No active "${ref.fxType}" FX found. Load it in the Effects tab first.`);
        }
        return `${ref.label} → ${clamped} (on ${applied} track${applied > 1 ? 's' : ''})`;
      }

      throw new LiveRuntimeError(`Cannot set parameter "${cmd.param}"`);
    }

    case 'ramp': {
      const ref = resolveParam(cmd.param);
      if (!ref) throw new LiveRuntimeError(`Unknown parameter "${cmd.param}"`);
      const clamped = clampParam(ref, cmd.to);

      // Ramp over N bars using requestAnimationFrame
      const bpm = host.getBpm();
      const secondsPerBar = (60 / bpm) * 4;
      const totalMs = cmd.ramp.duration * secondsPerBar * 1000;

      const fxChains = host.getFxChains();
      const targets: Array<{ trackId: string; slotIdx: number }> = [];

      let startVal: number;
      if (ref.domain === 'clock' && ref.paramKey === 'bpm') {
        startVal = host.getBpm();
      } else if (ref.domain === 'fx' && ref.fxType) {
        for (const chain of fxChains) {
          chain.slots.forEach((slot, idx) => {
            if (slot.type === ref.fxType) {
              targets.push({ trackId: chain.trackId, slotIdx: idx });
            }
          });
        }
        if (targets.length === 0) {
          throw new LiveRuntimeError(`No active "${ref.fxType}" FX found`);
        }
        // Read the current value from the first matching slot so the ramp
        // is continuous instead of jumping up from 0.
        const first = fxChains.find(c => c.trackId === targets[0].trackId);
        startVal = (first?.slots[targets[0].slotIdx]?.params?.[ref.paramKey]) ?? ref.min;
      } else {
        throw new LiveRuntimeError(`Cannot ramp parameter "${cmd.param}"`);
      }

      const startTime = performance.now();
      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / totalMs);
        const current = startVal + (clamped - startVal) * t;
        if (ref.domain === 'clock' && ref.paramKey === 'bpm') {
          host.setBpm(current);
        } else {
          for (const { trackId, slotIdx } of targets) {
            host.setFxParam(trackId, slotIdx, ref.paramKey, current);
          }
        }
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      return `Ramping ${ref.label} → ${clamped} over ${cmd.ramp.duration} bars`;
    }

    case 'euclid': {
      const { sceneId, trackId } = cmd.target;
      const { hits, steps, offset } = cmd;
      const clip = session.clips[`${sceneId}:${trackId}`];
      if (!clip) throw new LiveRuntimeError('euclid: clip not found');
      const pattern = euclidean(hits, steps, offset);
      const newSteps = clip.steps.map((s, i) => {
        const on = i < steps && pattern[i];
        if (on && !s.active) {
          return { ...s, active: true, velocity: 100, probability: 1, pitchOffset: 0 };
        }
        return { ...s, active: !!on };
      });
      host.updateClipSteps(sceneId, trackId, newSteps);
      const track = session.tracks.find(t => t.id === trackId);
      const offNote = offset ? ` offset ${offset}` : '';
      return `Euclid ${hits}:${steps}${offNote} → ${track?.name ?? trackId}`;
    }

    case 'prob': {
      const { sceneId, trackId } = cmd.target;
      const { probability, steps } = cmd;
      const clip = session.clips[`${sceneId}:${trackId}`];
      if (!clip) throw new LiveRuntimeError('prob: clip not found');
      // null steps → target every currently-active step
      const targetSet = new Set<number>(
        steps ?? clip.steps.map((s, i) => (s.active ? i : -1)).filter(i => i >= 0)
      );
      if (targetSet.size === 0) {
        const track = session.tracks.find(t => t.id === trackId);
        throw new LiveRuntimeError(
          `No active steps on ${track?.name ?? trackId} — activate some first, or pass explicit indices`
        );
      }
      let changed = 0;
      const newSteps = clip.steps.map((s, i) => {
        if (targetSet.has(i)) { changed++; return { ...s, probability }; }
        return s;
      });
      host.updateClipSteps(sceneId, trackId, newSteps);
      const track = session.tracks.find(t => t.id === trackId);
      return `Probability ${probability} → ${track?.name ?? trackId} (${changed} step${changed > 1 ? 's' : ''})`;
    }

    case 'vel': {
      const { sceneId, trackId } = cmd.target;
      const { velocity, steps } = cmd;
      const clip = session.clips[`${sceneId}:${trackId}`];
      if (!clip) throw new LiveRuntimeError('vel: clip not found');
      const targetSet = new Set<number>(
        steps ?? clip.steps.map((s, i) => (s.active ? i : -1)).filter(i => i >= 0)
      );
      if (targetSet.size === 0) {
        const track = session.tracks.find(t => t.id === trackId);
        throw new LiveRuntimeError(
          `No active steps on ${track?.name ?? trackId} — activate some first, or pass explicit indices`
        );
      }
      let changed = 0;
      const newSteps = clip.steps.map((s, i) => {
        if (targetSet.has(i)) { changed++; return { ...s, velocity }; }
        return s;
      });
      host.updateClipSteps(sceneId, trackId, newSteps);
      const track = session.tracks.find(t => t.id === trackId);
      return `Velocity ${velocity} → ${track?.name ?? trackId} (${changed} step${changed > 1 ? 's' : ''})`;
    }

    case 'notes': {
      const { sceneId, trackId } = cmd.target;
      const { notes } = cmd;
      const clip = session.clips[`${sceneId}:${trackId}`];
      if (!clip) throw new LiveRuntimeError('notes: clip not found');
      const activeIdx: number[] = [];
      clip.steps.forEach((s, i) => { if (s.active) activeIdx.push(i); });
      if (activeIdx.length === 0) {
        const track = session.tracks.find(t => t.id === trackId);
        throw new LiveRuntimeError(
          `No active steps on ${track?.name ?? trackId} — use "euclid"/"play" first`
        );
      }
      const newSteps = clip.steps.map((s, i) => {
        const pos = activeIdx.indexOf(i);
        if (pos === -1) return s;
        return { ...s, pitchOffset: notes[pos % notes.length] };
      });
      host.updateClipSteps(sceneId, trackId, newSteps);
      const track = session.tracks.find(t => t.id === trackId);
      return `Notes [${notes.join(' ')}] → ${track?.name ?? trackId} (${activeIdx.length} steps)`;
    }

    case 'swing': {
      clock.swing = cmd.value;
      return `Swing → ${cmd.value}`;
    }

    default:
      throw new LiveRuntimeError('Unknown command type');
  }
}
