import { getContext } from './context';
import { VoiceType } from '../types/daw';

// Canned white noise buffer cached for Hi-hat and Snare synthesis to avoid clicky garbage collection pauses
let cachedNoiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;

  const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  cachedNoiseBuffer = buffer;
  return cachedNoiseBuffer;
}

function playKick(ctx: AudioContext, dest: AudioNode, time: number, velocity: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Rapid pitch sweep from 160Hz down to 45Hz for that heavy kick thump
  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

  const level = Math.max(0.001, velocity / 127);
  gain.gain.setValueAtTime(level * 1.1, time);
  // Percussive exponential volume decay
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  // Transient pitch click layer
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(800, time);
  clickOsc.frequency.exponentialRampToValueAtTime(100, time + 0.02);
  clickGain.gain.setValueAtTime(level * 0.4, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

  clickOsc.connect(clickGain);
  clickGain.connect(dest);
  osc.connect(gain);
  gain.connect(dest);

  clickOsc.start(time);
  clickOsc.stop(time + 0.03);

  osc.start(time);
  osc.stop(time + 0.25);
}

function playSnare(ctx: AudioContext, dest: AudioNode, time: number, velocity: number) {
  const level = Math.max(0.001, velocity / 127);

  // Layer 1: Filtered Noise (the wire snares)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1600, time);
  noiseFilter.Q.setValueAtTime(1.5, time);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(level * 0.8, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);

  // Layer 2: Mid-range pitch drum body (the shell tone)
  const bodyOsc = ctx.createOscillator();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(180, time);
  bodyOsc.frequency.exponentialRampToValueAtTime(120, time + 0.08);

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(level * 0.5, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(dest);

  noiseSource.start(time);
  noiseSource.stop(time + 0.25);

  bodyOsc.start(time);
  bodyOsc.stop(time + 0.15);
}

function playHat(ctx: AudioContext, dest: AudioNode, time: number, velocity: number) {
  const level = Math.max(0.001, velocity / 127);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx);

  // Highpass filter out all lows/mids to isolate bright metallic top-end sizzle
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(7500, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(level * 0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06); // Quick closed hihat click

  noiseSource.connect(highpass);
  highpass.connect(gain);
  gain.connect(dest);

  noiseSource.start(time);
  noiseSource.stop(time + 0.08);
}

function playBass(ctx: AudioContext, dest: AudioNode, time: number, velocity: number, freq: number, gateEnd: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Low heavy sawtooth bass voice
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(Math.max(20, freq), time);

  // Ladder filter sweep to make the bass feel analog and warm
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, time);
  filter.frequency.exponentialRampToValueAtTime(150, gateEnd);
  filter.Q.setValueAtTime(2.0, time);

  const level = Math.max(0.001, velocity / 127);
  gain.gain.setValueAtTime(0.001, time);
  // Linear short attack to avoid sharp click popping
  gain.gain.linearRampToValueAtTime(level * 0.5, time + 0.008);
  gain.gain.setValueAtTime(level * 0.5, gateEnd);
  gain.gain.exponentialRampToValueAtTime(0.001, gateEnd + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(gateEnd + 0.06);
}

function playLead(ctx: AudioContext, dest: AudioNode, time: number, velocity: number, freq: number, gateEnd: number) {
  // Dual detuned oscillator lead for a gorgeous wide super-saw/square lead sound
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'square';

  // Detune them by 8 cents for chorus thickness
  osc1.frequency.setValueAtTime(Math.max(40, freq), time);
  osc2.frequency.setValueAtTime(Math.max(40, freq * 1.005), time);

  const level = Math.max(0.001, velocity / 127);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(level * 0.25, time + 0.015); // Slightly softer attack
  gain.gain.setValueAtTime(level * 0.25, gateEnd);
  gain.gain.exponentialRampToValueAtTime(0.001, gateEnd + 0.08); // Rings out a bit longer

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(dest);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(gateEnd + 0.1);
  osc2.stop(gateEnd + 0.1);
}

export const sampleCache = new Map<string, AudioBuffer>();

export async function loadSample(ctx: AudioContext, url: string): Promise<void> {
  if (sampleCache.has(url)) return;
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sampleCache.set(url, audioBuffer);
  } catch (err) {
    console.error('Error loading sample', err);
  }
}

function playSampler(ctx: AudioContext, dest: AudioNode, time: number, velocity: number, gateEnd: number, pitchOffset: number, sampleUrl?: string) {
  if (!sampleUrl) return;
  const buffer = sampleCache.get(sampleUrl);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  // Detune sample by pitchOffset semitones
  source.playbackRate.value = Math.pow(2, pitchOffset / 12);

  const gain = ctx.createGain();
  const level = Math.max(0.001, velocity / 127);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.005);
  gain.gain.setValueAtTime(level, gateEnd);
  gain.gain.exponentialRampToValueAtTime(0.001, gateEnd + 0.1);

  source.connect(gain);
  gain.connect(dest);

  source.start(time);
  source.stop(gateEnd + 0.2);
}

export interface VoiceInstance {
  id: string;
  trackId: string;
  muteGroup: number;
  gainNode: GainNode;
  triggerTime: number;
}

let activeVoices: VoiceInstance[] = [];
const trackRrIndices = new Map<string, number>();

export function playNote(
  voice: VoiceType,
  velocity: number,
  audioTime: number,
  gateEnd: number,
  freq = 0,
  dest: AudioNode,
  sampleUrl?: string,
  pitchOffset = 0,
  trackId = 'default',
  muteGroup = 0,
  autoStop = false,
  applyVelocity = true,
  velocitySelectionMode: 'first' | 'roundRobin' | 'random' = 'first'
) {
  const ctx = getContext();
  const now = ctx.currentTime;

  // Clean up old ended voices
  activeVoices = activeVoices.filter(v => v.triggerTime + 3.0 > now);

  // Apply choking for Mute Groups and Auto-Stop-Note
  activeVoices.forEach((v) => {
    const isSameTrack = v.trackId === trackId;
    const isSameMuteGroup = muteGroup > 0 && v.muteGroup === muteGroup;

    if ((isSameTrack && autoStop) || isSameMuteGroup) {
      try {
        // Smooth fast fade-out (15ms)
        v.gainNode.gain.cancelScheduledValues(audioTime);
        v.gainNode.gain.setValueAtTime(v.gainNode.gain.value, audioTime);
        v.gainNode.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.015);
      } catch (e) {
        // Ignored
      }
    }
  });

  // Create voice wrapping gain node
  const voiceGain = ctx.createGain();
  
  // Decide volume/gain level based on applyVelocity
  const level = applyVelocity ? Math.max(0.001, velocity / 127) : 1.0;
  voiceGain.gain.setValueAtTime(level, audioTime);
  voiceGain.connect(dest);

  // Apply velocity selection modes (modulate sound parameters based on selection algorithm!)
  let rrVal = 0;
  if (velocitySelectionMode === 'roundRobin') {
    const idx = trackRrIndices.get(trackId) ?? 0;
    rrVal = (idx % 3) - 1; // cycles: -1, 0, 1
    trackRrIndices.set(trackId, idx + 1);
  } else if (velocitySelectionMode === 'random') {
    rrVal = (Math.random() * 2) - 1; // random -1.0 to 1.0
  }

  // Adjust synthesis parameters based on selection mode modulation:
  let modFreq = freq;
  let modPitchOffset = pitchOffset;
  if (rrVal !== 0) {
    modPitchOffset += rrVal * 0.5; // slight microtonal pitch variations
    modFreq *= Math.pow(2, (rrVal * 0.25) / 12);
  }

  const playVelocity = applyVelocity ? velocity : 127;

  switch (voice) {
    case 'kick':
      playKick(ctx, voiceGain, audioTime, playVelocity);
      break;
    case 'snare':
      playSnare(ctx, voiceGain, audioTime, playVelocity);
      break;
    case 'hat':
      playHat(ctx, voiceGain, audioTime, playVelocity);
      break;
    case 'bass':
      playBass(ctx, voiceGain, audioTime, playVelocity, modFreq, gateEnd);
      break;
    case 'lead':
      playLead(ctx, voiceGain, audioTime, playVelocity, modFreq, gateEnd);
      break;
    case 'sampler':
      playSampler(ctx, voiceGain, audioTime, playVelocity, gateEnd, modPitchOffset, sampleUrl);
      break;
  }

  // Register in active list
  activeVoices.push({
    id: crypto.randomUUID(),
    trackId,
    muteGroup,
    gainNode: voiceGain,
    triggerTime: audioTime
  });
}

/**
 * Hard silence every active voice. Cancels scheduled gain ramps, fast-fades
 * each voice's gain node to silence, disconnects it, and clears the active
 * list. Used by the Panic path and by safe backend switches (allNotesOff on
 * the outgoing engine). No-ops safely if the AudioContext isn't initialised.
 */
export function allNotesOff(): void {
  let now = 0;
  try { now = getContext().currentTime; } catch { /* engine not up */ }
  activeVoices.forEach((v) => {
    try {
      v.gainNode.gain.cancelScheduledValues(now);
      v.gainNode.gain.setValueAtTime(v.gainNode.gain.value, now);
      v.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    } catch { /* node already gone */ }
    try { v.gainNode.disconnect(); } catch { /* ignore */ }
  });
  activeVoices = [];
}
