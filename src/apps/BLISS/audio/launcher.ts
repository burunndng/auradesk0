import { clock } from './clock';
import { Clip, Session, clipKey, Quantization, VoiceType } from '../types/daw';
import { patchGraph } from './patchgraph';


export type ClipNoteOnCallback = (
  trackId: string,
  voice: VoiceType,
  baseFreq: number,
  velocity: number,
  pitchOffset: number,
  audioTime: number,
  gateEnd: number,
  sampleUrl?: string
) => void;

class Launcher {
  private session: Session | null = null;
  private queued: Set<string> = new Set();      // Keys of clips queued to play: "sceneId:trackId"
  private stopping: Set<string> = new Set();    // Keys of clips queued to stop: "sceneId:trackId"
  private queuedQuantization: Map<string, Quantization> = new Map();
  private stoppingQuantization: Map<string, Quantization> = new Map();
  private clipSteps: Map<string, number> = new Map(); // Key -> current step index
  private noteOnCallbacks: Set<ClipNoteOnCallback> = new Set();
  private unsubClock: (() => void) | null = null;

  attach(session: Session) {
    this.detach();
    this.session = session;

    // Listen to the high-precision clock
    this.unsubClock = clock.onStep((globalStep, audioTime) => {
      if (!this.session) return;

      const stepInBar = globalStep % 16;
      const isBarBoundary = stepInBar === 0;
      const isBeatBoundary = stepInBar % 4 === 0;

      // 1. Resolve queued and stopping clips on quantization boundaries
      this.session.tracks.forEach((track) => {
        this.session!.scenes.forEach((scene) => {
          const key = clipKey(scene.id, track.id);
          const clip = this.session!.clips[key];
          if (!clip) return;

          // Stop handling
          const stopQuant = this.stoppingQuantization.get(key) ?? 'bar';
          const isStopBoundary =
            stopQuant === 'immediate' ||
            (stopQuant === 'beat' && isBeatBoundary) ||
            (stopQuant === 'bar' && isBarBoundary);

          if (this.stopping.has(key) && isStopBoundary) {
            clip.state = 'stopped';
            this.stopping.delete(key);
            this.stoppingQuantization.delete(key);
          }

          // Play/Launch handling
          const playQuant = this.queuedQuantization.get(key) ?? 'bar';
          const isPlayBoundary =
            playQuant === 'immediate' ||
            (playQuant === 'beat' && isBeatBoundary) ||
            (playQuant === 'bar' && isBarBoundary);

          if (this.queued.has(key) && isPlayBoundary) {
            // Stop other clips on the same track first (exclusive track launch)
            this.session!.scenes.forEach((otherScene) => {
              const otherKey = clipKey(otherScene.id, track.id);
              const otherClip = this.session!.clips[otherKey];
              if (otherClip && otherClip.state === 'playing') {
                otherClip.state = 'stopped';
                this.clipSteps.delete(otherKey);
              }
            });

            clip.state = 'playing';
            this.clipSteps.set(key, 0); // Reset clip index on play
            this.queued.delete(key);
            this.queuedQuantization.delete(key);
          }
        });
      });

      // 2. Play active steps for all "playing" clips
      const secondsPerStep = 60.0 / clock.bpm / clock.stepsPerBeat;

      this.session.tracks.forEach((track) => {
        this.session!.scenes.forEach((scene) => {
          const key = clipKey(scene.id, track.id);
          const clip = this.session!.clips[key];
          if (!clip || clip.state !== 'playing') return;

          const trackStep = this.clipSteps.get(key) ?? 0;
          const stepIndex = trackStep % clip.stepCount;
          const step = clip.steps[stepIndex];

          // 1. Apply Per-Step Parameter Locks (Automation)
          if (step && step.paramLocks) {
            Object.entries(step.paramLocks).forEach(([lockKey, val]) => {
              if (lockKey.startsWith('insert-')) {
                const parts = lockKey.split('-');
                const slotIdx = parseInt(parts[1]);
                const paramName = parts[2];
                try {
                  patchGraph.updateParam(track.id, slotIdx, paramName, val);
                } catch (e) {}
              } else if (lockKey.startsWith('send-')) {
                const parts = lockKey.split('-');
                const sendIdx = parseInt(parts[1]);
                try {
                  patchGraph.setTrackSend(track.id, sendIdx, val);
                } catch (e) {}
              }
            });
          }

          if (step && step.active && Math.random() <= step.probability) {
            // Apply SWING to even step indices (1, 3, 5, 7, 9, 11, 13, 15)
            let playTime = audioTime;
            if (stepIndex % 2 === 1) {
              const swingDelay = clock.swing * secondsPerStep * 0.5; // up to 50% of step length
              playTime += swingDelay;
            }

            // Apply TIMING HUMANIZE (up to 20% of a step length jitter)
            if (clock.humanizeTime > 0) {
              const timingOffset = (Math.random() - 0.5) * clock.humanizeTime * secondsPerStep * 0.25;
              playTime += timingOffset;
            }

            // Apply VELOCITY HUMANIZE (deviate up to 35 units from original velocity)
            let finalVelocity = step.velocity;
            if (clock.humanizeVelocity > 0) {
              const velOffset = (Math.random() - 0.5) * clock.humanizeVelocity * 35;
              finalVelocity = Math.max(1, Math.min(127, Math.round(finalVelocity + velOffset)));
            }

            // Apply Lead / Lag (per-note microtiming shift: up to 15ms scaled with tempo)
            if (step.leadLag && step.leadLag !== 0) {
              const leadLagRange = 0.015 * (120 / clock.bpm); // ±15ms at 120bpm
              playTime += step.leadLag * leadLagRange;
            }

            const gateEnd = playTime + secondsPerStep * step.gateLength;
            this.noteOnCallbacks.forEach((cb) => {
              cb(
                track.id,
                track.voice,
                track.baseFreq,
                finalVelocity,
                step.pitchOffset,
                playTime,
                gateEnd,
                track.sampleUrl
              );
            });

            // 2. Trigger Kick Pumping ducking on Master Sidechain + parallel Rumble Ducking
            if (track.voice === 'kick' || track.id === 'track-kick') {
              try {
                patchGraph.triggerMasterSidechain(playTime);
                patchGraph.triggerRumbleDucking(track.id, playTime);
              } catch (e) {}
            }
          }

          // Advance clip step pointer
          this.clipSteps.set(key, (trackStep + 1) % clip.stepCount);
        });
      });
    });
  }

  detach() {
    if (this.unsubClock) {
      this.unsubClock();
      this.unsubClock = null;
    }
    this.session = null;
    this.queued.clear();
    this.stopping.clear();
    this.queuedQuantization.clear();
    this.stoppingQuantization.clear();
    this.clipSteps.clear();
  }

  onNoteOn(cb: ClipNoteOnCallback): () => void {
    this.noteOnCallbacks.add(cb);
    return () => {
      this.noteOnCallbacks.delete(cb);
    };
  }

  launchClip(sceneId: string, trackId: string, quantization: Quantization = 'bar') {
    if (!this.session) return;
    const key = clipKey(sceneId, trackId);
    const clip = this.session.clips[key];
    if (!clip) return;

    if (quantization === 'immediate') {
      // Stop other playing clips on the same track first
      this.session.scenes.forEach((otherScene) => {
        const otherKey = clipKey(otherScene.id, trackId);
        const otherClip = this.session.clips[otherKey];
        if (otherClip && otherClip.state === 'playing') {
          otherClip.state = 'stopped';
          this.clipSteps.delete(otherKey);
        }
      });

      clip.state = 'playing';
      this.clipSteps.set(key, 0);
      this.queuedQuantization.delete(key);
      this.stoppingQuantization.delete(key);
    } else {
      clip.state = 'queued';
      this.queued.add(key);
      this.queuedQuantization.set(key, quantization);
      this.stopping.delete(key);
      this.stoppingQuantization.delete(key);
    }
  }

  stopClip(sceneId: string, trackId: string, quantization: Quantization = 'bar') {
    if (!this.session) return;
    const key = clipKey(sceneId, trackId);
    const clip = this.session.clips[key];
    if (!clip) return;

    if (quantization === 'immediate') {
      clip.state = 'stopped';
      this.clipSteps.delete(key);
      this.stoppingQuantization.delete(key);
      this.queuedQuantization.delete(key);
    } else {
      this.stopping.add(key);
      this.stoppingQuantization.set(key, quantization);
      this.queued.delete(key);
      this.queuedQuantization.delete(key);
    }
  }

  launchScene(sceneId: string, quantization: Quantization = 'bar') {
    if (!this.session) return;
    this.session.tracks.forEach((track) => {
      const key = clipKey(sceneId, track.id);
      const clip = this.session.clips[key];
      if (clip && clip.state !== 'empty') {
        this.launchClip(sceneId, track.id, quantization);
      }
    });
  }

  stopAll(quantization: Quantization = 'bar') {
    if (!this.session) return;
    this.session.tracks.forEach((track) => {
      this.session!.scenes.forEach((scene) => {
        const key = clipKey(scene.id, track.id);
        const clip = this.session!.clips[key];
        if (clip && (clip.state === 'playing' || clip.state === 'queued')) {
          this.stopClip(scene.id, track.id, quantization);
        }
      });
    });
  }

  getClipStepIndex(sceneId: string, trackId: string): number {
    const key = clipKey(sceneId, trackId);
    return (this.clipSteps.get(key) ?? 0) % 16;
  }
}

export const launcher = new Launcher();
