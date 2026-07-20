import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initAudio, suspendAudio, getContext } from '../audio/context';
import { clock } from '../audio/clock';
import { launcher } from '../audio/launcher';
import { patchGraph } from '../audio/patchgraph';
import { getBackend } from '../audio/backends';
import { parse } from '../live/parser';
import { compile } from '../live/compiler';
import { execute } from '../live/runtime';
import { isLiveError } from '../live/errors';
import type { LiveCommandHistoryItem, LiveRuntimeHost } from '../live/types';
import {
  Session,
  TrackChain,
  Quantization,
  FxType,
  VoiceType,
  clipKey,
  makeClip,
  makeStep,
  Step,
  Clip,
  SceneTrack
} from '../types/daw';

interface DawContextType {
  session: Session;
  bpm: number;
  playing: boolean;
  quantization: Quantization;
  selectedTrackId: string | null;
  selectedSceneId: string | null;
  activeSteps: Record<string, number>; // key: sceneId:trackId -> stepIndex
  fxChains: Record<string, TrackChain>;
  audioStatus: 'uninitialized' | 'running' | 'suspended';
  startAudioEngine: () => Promise<void>;
  togglePlay: () => void;
  setBpm: (val: number) => void;
  setQuantization: (val: Quantization) => void;
  setSelectedCell: (trackId: string | null, sceneId: string | null) => void;
  toggleStep: (sceneId: string, trackId: string, stepIndex: number) => void;
  updateStepParam: (sceneId: string, trackId: string, stepIndex: number, field: keyof Step, val: any) => void;
  updateClipSteps: (sceneId: string, trackId: string, newSteps: Step[]) => void;
  launchClip: (sceneId: string, trackId: string) => void;
  stopClip: (sceneId: string, trackId: string) => void;
  launchScene: (sceneId: string) => void;
  stopAll: () => void;
  addTrack: (name: string, voice: VoiceType, baseFreq: number, color: string, sampleUrl?: string) => void;
  updateTrackParam: (trackId: string, field: keyof SceneTrack, val: any) => void;
  setFxType: (trackId: string, slotIndex: number, type: FxType) => void;
  setFxParam: (trackId: string, slotIndex: number, paramName: string, value: number) => void;
  importSession: (imported: Session, fx: Record<string, TrackChain>) => void;
  
  // Track Volume/Pan/Mute
  trackVolumes: Record<string, number>;
  trackMutes: Record<string, boolean>;
  trackPans: Record<string, number>;
  panLaw: 'balance' | 'constantPower' | 'constantSum';
  setTrackVolume: (trackId: string, vol: number) => void;
  setTrackMute: (trackId: string, mute: boolean) => void;
  setTrackSolo: (trackId: string, solo: boolean) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  setPanLaw: (law: 'balance' | 'constantPower' | 'constantSum') => void;

  // Solo state
  trackSolos: Record<string, boolean>;

  // Live command DSL
  runCommand: (raw: string) => Promise<void>;
  liveHistory: LiveCommandHistoryItem[];
  clearLiveHistory: () => void;
  
  // Shared Send aux mixes
  trackSends: Record<string, [number, number, number, number]>;
  setTrackSend: (trackId: string, sendIndex: number, val: number) => void;

  // Kick Rumble Engine
  kickRumble: { amount: number; decay: number; filterFreq: number; };
  setKickRumbleParams: (amount: number, decay: number, filterFreq: number) => void;

  // Master dynamics rack (Tier 3)
  masterCompressor: { threshold: number; ratio: number; attack: number; release: number; enabled: boolean; };
  setMasterCompressorParams: (p: Partial<DawContextType['masterCompressor']>) => void;
  masterSaturatorTilt: { drive: number; tilt: number; enabled: boolean; };
  setMasterSaturatorTiltParams: (p: Partial<DawContextType['masterSaturatorTilt']>) => void;
  masterSidechain: { amount: number; release: number; enabled: boolean; };
  setMasterSidechainParams: (p: Partial<DawContextType['masterSidechain']>) => void;
  masterLimiter: { gain: number; enabled: boolean; };
  setMasterLimiterParams: (p: Partial<DawContextType['masterLimiter']>) => void;

  swing: number;
  setSwing: (val: number) => void;
  humanizeTime: number;
  setHumanizeTime: (val: number) => void;
  humanizeVelocity: number;
  setHumanizeVelocity: (val: number) => void;

  triggerPanic: () => void;
  recoverEngine: () => Promise<void>;
  activeTab: 'intro' | 'grid' | 'mixer' | 'fx' | 'viz' | 'editor';
  setActiveTab: (tab: 'intro' | 'grid' | 'mixer' | 'fx' | 'viz' | 'editor') => void;
}

const DawContext = createContext<DawContextType | undefined>(undefined);

// Initial Presets optimized for immediate dark electronic gratification
const PRESET_TRACKS = [
  { id: 'track-kick',  name: 'Kick',   voice: 'kick'  as const, baseFreq: 50,   color: '#EF4444' },
  { id: 'track-snare', name: 'Snare',  voice: 'snare' as const, baseFreq: 180,  color: '#F97316' },
  { id: 'track-clap',  name: 'Clap',   voice: 'snare' as const, baseFreq: 1000, color: '#FB923C' },
  { id: 'track-hat',   name: 'Cl.Hat', voice: 'hat'   as const, baseFreq: 8000, color: '#FBBF24', muteGroup: 1 },
  { id: 'track-ohat',  name: 'Op.Hat', voice: 'hat'   as const, baseFreq: 9000, color: '#FDE047', muteGroup: 1, autoStopNote: true },
  { id: 'track-bass',  name: 'Sub',    voice: 'bass'  as const, baseFreq: 55,   color: '#10B981' }, // A1
  { id: 'track-acid',  name: 'Acid',   voice: 'bass'  as const, baseFreq: 55,   color: '#22D3EE' }, // A1
  { id: 'track-lead',  name: 'Lead',   voice: 'lead'  as const, baseFreq: 220,  color: '#3B82F6' }  // A3
];

const PRESET_SCENES = [
  { id: 'scene-intro', name: 'Intro Build' },
  { id: 'scene-groove', name: 'Dark Groove' },
  { id: 'scene-melodic', name: 'Peak Hour' },
  { id: 'scene-outro', name: 'Breakdown' }
];

function createInitialSession(): Session {
  const clips: Record<string, Clip> = {};

  PRESET_SCENES.forEach((scene) => {
    PRESET_TRACKS.forEach((track) => {
      const key = clipKey(scene.id, track.id);
      clips[key] = makeClip(track.id, scene.id, 16);
      clips[key].state = 'stopped';
    });
  });

  // --- Seed Intro Beat Patterns ---
  const introKick = clips[clipKey('scene-intro', 'track-kick')];
  [0, 8].forEach(i => { introKick.steps[i].active = true; });

  const introSnare = clips[clipKey('scene-intro', 'track-snare')];
  [4, 12].forEach(i => { introSnare.steps[i].active = true; });

  const introHat = clips[clipKey('scene-intro', 'track-hat')];
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => {
    introHat.steps[i].active = true;
    introHat.steps[i].velocity = i % 4 === 0 ? 90 : 40;
  });

  // --- Seed Main Groove Patterns ---
  const grooveKick = clips[clipKey('scene-groove', 'track-kick')];
  [0, 4, 8, 12].forEach(i => { grooveKick.steps[i].active = true; });

  const grooveSnare = clips[clipKey('scene-groove', 'track-snare')];
  [4, 12].forEach(i => { grooveSnare.steps[i].active = true; });

  const grooveHat = clips[clipKey('scene-groove', 'track-hat')];
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => {
    grooveHat.steps[i].active = true;
    grooveHat.steps[i].velocity = i % 4 === 0 ? 110 : 50;
  });

  const grooveBass = clips[clipKey('scene-groove', 'track-bass')];
  // Dynamic rolling psytrance bassline: 16th notes
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach(i => {
    if (i % 4 !== 0) { // Offbeat bass syncopation
      grooveBass.steps[i].active = true;
      grooveBass.steps[i].pitchOffset = 0; // standard low root G/A
      grooveBass.steps[i].gateLength = 0.35;
      grooveBass.steps[i].velocity = 95;
    }
  });

  const grooveAcid = clips[clipKey('scene-groove', 'track-acid')];
  // Squelchy acid line: offbeat 16ths with a wandering pitch offset
  const acidPitches = [0, 3, 5, 7, 0, 3, 10, 7, 0, 5, 3, 12, 0, 7, 5, 10];
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach(i => {
    if (i % 2 === 1) {
      grooveAcid.steps[i].active = true;
      grooveAcid.steps[i].pitchOffset = acidPitches[i];
      grooveAcid.steps[i].gateLength = 0.2;
      grooveAcid.steps[i].velocity = 100;
    }
  });

  // --- Seed Melodic Patterns (Build Up) ---
  const melodicKick = clips[clipKey('scene-melodic', 'track-kick')];
  [0, 4, 8, 12].forEach(i => { melodicKick.steps[i].active = true; });

  const melodicSnare = clips[clipKey('scene-melodic', 'track-snare')];
  [4, 10, 12, 14, 15].forEach(i => { melodicSnare.steps[i].active = true; });

  const melodicHat = clips[clipKey('scene-melodic', 'track-hat')];
  Array.from({ length: 16 }, (_, i) => i).forEach(i => {
    melodicHat.steps[i].active = true;
    melodicHat.steps[i].velocity = 80;
  });

  const melodicBass = clips[clipKey('scene-melodic', 'track-bass')];
  [0, 2, 3, 5, 8, 10, 13, 14].forEach(i => {
    melodicBass.steps[i].active = true;
    melodicBass.steps[i].pitchOffset = i % 8 === 0 ? 0 : 3;
    melodicBass.steps[i].gateLength = 0.5;
  });

  const melodicLead = clips[clipKey('scene-melodic', 'track-lead')];
  const leadPitches = [12, 15, 19, 24, 12, 15, 19, 24, 14, 17, 21, 26, 14, 17, 21, 26];
  Array.from({ length: 16 }, (_, i) => i).forEach(i => {
    if (i % 2 === 0) {
      melodicLead.steps[i].active = true;
      melodicLead.steps[i].pitchOffset = leadPitches[i];
      melodicLead.steps[i].gateLength = 0.25;
    }
  });

  return {
    tracks: PRESET_TRACKS,
    scenes: PRESET_SCENES,
    clips
  };
}

export const DawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>(createInitialSession);
  const [bpm, setBpmState] = useState(132); // Darkprog & Techno tempo
  const [playing, setPlaying] = useState(false);
  const [quantization, setQuantization] = useState<Quantization>('bar');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('track-kick');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>('scene-groove');
  const [activeSteps, setActiveSteps] = useState<Record<string, number>>({});
  const [audioStatus, setAudioStatus] = useState<'uninitialized' | 'running' | 'suspended'>('uninitialized');
  const [activeTab, setActiveTab] = useState<'intro' | 'grid' | 'mixer' | 'fx' | 'viz' | 'editor'>('intro');

  const [swing, setSwingState] = useState(0.0);
  const [humanizeTime, setHumanizeTimeState] = useState(0.0);
  const [humanizeVelocity, setHumanizeVelocityState] = useState(0.0);

  // FX inserts per track (Tier 1)
  const [fxChains, setFxChains] = useState<Record<string, TrackChain>>(() => {
    const chains: Record<string, TrackChain> = {};
    PRESET_TRACKS.forEach((track) => {
      // Default some tracks with neat starting insert slots
      chains[track.id] = {
        trackId: track.id,
        slots: [
          track.id === 'track-kick' 
            ? { type: 'saturation_wavefolder', params: { drive: 0.15, mode: 0, mix: 0.3 } }
            : { type: 'none', params: {} },
          track.id === 'track-bass'
            ? { type: 'modulated_filter', params: { cutoff: 800, Q: 3.5, drive: 0.1, lfoRate: 3.0, lfoDepth: 0.4, filterType: 0 } }
            : { type: 'none', params: {} },
          { type: 'none', params: {} }
        ]
      };
    });
    return chains;
  });

  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>(() => {
    const vols: Record<string, number> = {};
    PRESET_TRACKS.forEach(t => { vols[t.id] = t.id === 'track-kick' ? 0.95 : 0.8; });
    return vols;
  });

  const [trackMutes, setTrackMutes] = useState<Record<string, boolean>>(() => {
    const mutes: Record<string, boolean> = {};
    PRESET_TRACKS.forEach(t => { mutes[t.id] = false; });
    return mutes;
  });

  const [trackSolos, setTrackSolos] = useState<Record<string, boolean>>(() => {
    const solos: Record<string, boolean> = {};
    PRESET_TRACKS.forEach(t => { solos[t.id] = false; });
    return solos;
  });

  const [liveHistory, setLiveHistory] = useState<LiveCommandHistoryItem[]>([]);

  const [trackPans, setTrackPans] = useState<Record<string, number>>(() => {
    const pans: Record<string, number> = {};
    PRESET_TRACKS.forEach(t => { pans[t.id] = 0.0; });
    return pans;
  });

  const [panLaw, setPanLawState] = useState<'balance' | 'constantPower' | 'constantSum'>('constantPower');

  // Shared Aux Send Mixes (Plate/Hall Reverb, Ping-Pong Delay, Resonant Comb, Modulated Sweep Formant)
  const [trackSends, setTrackSends] = useState<Record<string, [number, number, number, number]>>(() => {
    const sends: Record<string, [number, number, number, number]> = {};
    PRESET_TRACKS.forEach(t => {
      if (t.id === 'track-hat') sends[t.id] = [0.15, 0.1, 0.0, 0.05];
      else if (t.id === 'track-snare') sends[t.id] = [0.1, 0.25, 0.0, 0.0];
      else if (t.id === 'track-lead') sends[t.id] = [0.25, 0.15, 0.05, 0.1];
      else sends[t.id] = [0.0, 0.0, 0.0, 0.0];
    });
    return sends;
  });

  // Dedicated Cavernous Kick Rumble Engine
  const [kickRumble, setKickRumble] = useState({
    amount: 0.35, // default thick techno rumble active!
    decay: 0.45,
    filterFreq: 85
  });

  // Master dynamics rack (Tier 3)
  const [masterCompressor, setMasterCompressor] = useState({
    threshold: -14,
    ratio: 2.5,
    attack: 0.01,
    release: 0.15,
    enabled: true
  });

  const [masterSaturatorTilt, setMasterSaturatorTilt] = useState({
    drive: 0.15,
    tilt: 0.5,
    enabled: true
  });

  const [masterSidechain, setMasterSidechain] = useState({
    amount: 0.6,
    release: 0.22,
    enabled: true
  });

  const [masterLimiter, setMasterLimiter] = useState({
    gain: 1.0,
    enabled: true
  });

  const setTrackVolume = (trackId: string, vol: number) => {
    setTrackVolumes(prev => ({ ...prev, [trackId]: vol }));
    const chain = patchGraph.getLiveChain(trackId);
    if (chain && audioStatus !== 'uninitialized') {
      const isMuted = trackMutes[trackId] || false;
      const finalGain = isMuted ? 0 : vol;
      try {
        chain.output.gain.setValueAtTime(finalGain, chain.output.context.currentTime);
      } catch (err) {}
    }
  };

  const setTrackMute = (trackId: string, mute: boolean) => {
    setTrackMutes(prev => ({ ...prev, [trackId]: mute }));
    const chain = patchGraph.getLiveChain(trackId);
    if (chain && audioStatus !== 'uninitialized') {
      const vol = trackVolumes[trackId] ?? 1.0;
      const finalGain = mute ? 0 : vol;
      try {
        chain.output.gain.setValueAtTime(finalGain, chain.output.context.currentTime);
      } catch (err) {}
    }
  };

  const setTrackSolo = (trackId: string, solo: boolean) => {
    const nextSolos = { ...trackSolos, [trackId]: solo };
    setTrackSolos(nextSolos);
    // Any soloed track silences all non-soloed tracks (unified with mute).
    if (audioStatus !== 'uninitialized') {
      const anySoloed = Object.values(nextSolos).some(Boolean);
      session.tracks.forEach(t => {
        const chain = patchGraph.getLiveChain(t.id);
        if (!chain) return;
        const muted = trackMutes[t.id] || false;
        const vol = trackVolumes[t.id] ?? 1.0;
        const silenced = (anySoloed && !nextSolos[t.id]) || muted;
        const finalGain = silenced ? 0 : vol;
        try {
          chain.output.gain.setValueAtTime(finalGain, chain.output.context.currentTime);
        } catch {}
      });
    }
  };

  const setTrackPan = (trackId: string, pan: number) => {
    setTrackPans(prev => ({ ...prev, [trackId]: pan }));
    if (audioStatus !== 'uninitialized') {
      patchGraph.setTrackPan(trackId, pan, panLaw);
    }
  };

  const setPanLaw = (law: 'balance' | 'constantPower' | 'constantSum') => {
    setPanLawState(law);
    if (audioStatus !== 'uninitialized') {
      session.tracks.forEach((track) => {
        const pan = trackPans[track.id] ?? 0.0;
        patchGraph.setTrackPan(track.id, pan, law);
      });
    }
  };

  const setTrackSend = (trackId: string, sendIndex: number, val: number) => {
    setTrackSends((prev) => {
      const current = prev[trackId] ?? [0, 0, 0, 0];
      const next = [...current] as [number, number, number, number];
      next[sendIndex] = val;
      return { ...prev, [trackId]: next };
    });
    if (audioStatus !== 'uninitialized') {
      patchGraph.setTrackSend(trackId, sendIndex, val);
    }
  };

  const setKickRumbleParams = (amount: number, decay: number, filterFreq: number) => {
    setKickRumble({ amount, decay, filterFreq });
    if (audioStatus !== 'uninitialized') {
      patchGraph.setKickRumble('track-kick', amount, decay, filterFreq);
    }
  };

  const setMasterCompressorParams = (p: Partial<typeof masterCompressor>) => {
    setMasterCompressor((prev) => {
      const next = { ...prev, ...p };
      if (audioStatus !== 'uninitialized') {
        patchGraph.setMasterCompressor(next.threshold, next.ratio, next.attack, next.release, next.enabled);
      }
      return next;
    });
  };

  const setMasterSaturatorTiltParams = (p: Partial<typeof masterSaturatorTilt>) => {
    setMasterSaturatorTilt((prev) => {
      const next = { ...prev, ...p };
      if (audioStatus !== 'uninitialized') {
        patchGraph.setMasterSaturatorTilt(next.drive, next.tilt, next.enabled);
      }
      return next;
    });
  };

  const setMasterSidechainParams = (p: Partial<typeof masterSidechain>) => {
    setMasterSidechain((prev) => {
      const next = { ...prev, ...p };
      if (audioStatus !== 'uninitialized') {
        patchGraph.masterSidechainAmount = next.amount;
        patchGraph.masterSidechainRelease = next.release;
        patchGraph.masterSidechainEnabled = next.enabled;
      }
      return next;
    });
  };

  const setMasterLimiterParams = (p: Partial<typeof masterLimiter>) => {
    setMasterLimiter((prev) => {
      const next = { ...prev, ...p };
      if (audioStatus !== 'uninitialized') {
        patchGraph.setMasterLimiter(next.gain, next.enabled);
      }
      return next;
    });
  };

  const animFrameId = useRef<number | null>(null);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Sync clock BPM
  useEffect(() => {
    clock.bpm = bpm;
  }, [bpm]);

  useEffect(() => {
    clock.swing = swing;
  }, [swing]);

  useEffect(() => {
    clock.humanizeTime = humanizeTime;
  }, [humanizeTime]);

  useEffect(() => {
    clock.humanizeVelocity = humanizeVelocity;
  }, [humanizeVelocity]);

  const setSwing = (val: number) => {
    setSwingState(Math.min(1.0, Math.max(0.0, val)));
  };

  const setHumanizeTime = (val: number) => {
    setHumanizeTimeState(Math.min(1.0, Math.max(0.0, val)));
  };

  const setHumanizeVelocity = (val: number) => {
    setHumanizeVelocityState(Math.min(1.0, Math.max(0.0, val)));
  };

  // Handle active step visual display polling
  useEffect(() => {
    if (playing) {
      let lastSteps: Record<string, number> = {};
      const poll = () => {
        const steps: Record<string, number> = {};
        let changed = false;
        session.tracks.forEach((track) => {
          session.scenes.forEach((scene) => {
            const key = clipKey(scene.id, track.id);
            const val = launcher.getClipStepIndex(scene.id, track.id);
            steps[key] = val;
            if (val !== lastSteps[key]) {
              changed = true;
            }
          });
        });
        if (changed) {
          lastSteps = steps;
          setActiveSteps(steps);
        }
        animFrameId.current = requestAnimationFrame(poll);
      };
      animFrameId.current = requestAnimationFrame(poll);
    } else {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      setActiveSteps({});
    }

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [playing, session.tracks, session.scenes]);

  const startAudioEngine = async () => {
    const ctx = await initAudio();
    patchGraph.init();

    // Re-apply master bus config parameters first
    patchGraph.masterSidechainAmount = masterSidechain.amount;
    patchGraph.masterSidechainRelease = masterSidechain.release;
    patchGraph.masterSidechainEnabled = masterSidechain.enabled;

    patchGraph.setMasterCompressor(
      masterCompressor.threshold,
      masterCompressor.ratio,
      masterCompressor.attack,
      masterCompressor.release,
      masterCompressor.enabled
    );
    patchGraph.setMasterSaturatorTilt(
      masterSaturatorTilt.drive,
      masterSaturatorTilt.tilt,
      masterSaturatorTilt.enabled
    );
    patchGraph.setMasterLimiter(
      masterLimiter.gain,
      masterLimiter.enabled
    );

    // Wire up patch graph nodes for all loaded tracks
    session.tracks.forEach((track) => {
      patchGraph.addTrack(track.id);

      // Apply track volume, mute and pan
      const chainNode = patchGraph.getLiveChain(track.id);
      if (chainNode) {
        const vol = trackVolumes[track.id] ?? 1.0;
        const mute = trackMutes[track.id] ?? false;
        chainNode.output.gain.setValueAtTime(mute ? 0 : vol, chainNode.output.context.currentTime);
        const pan = trackPans[track.id] ?? 0.0;
        patchGraph.setTrackPan(track.id, pan, panLaw);
      }

      // Re-apply any existing effects config in our state to the patchGraph
      const chain = fxChains[track.id];
      if (chain) {
        chain.slots.forEach((slot, idx) => {
          if (slot.type !== 'none') {
            patchGraph.setSlotFx(track.id, idx, slot.type, slot.params);
          }
        });
      }

      // Re-apply track shared aux sends
      const sends = trackSends[track.id] ?? [0, 0, 0, 0];
      sends.forEach((sendLvl, idx) => {
        patchGraph.setTrackSend(track.id, idx, sendLvl);
      });

      // Re-apply kick rumble engine parameters
      if (track.id === 'track-kick') {
        patchGraph.setKickRumble('track-kick', kickRumble.amount, kickRumble.decay, kickRumble.filterFreq);
      }
    });

    // Wire synthesized note trigger callback from launcher -> synth
    launcher.attach(session);
    launcher.onNoteOn((trackId, voice, baseFreq, velocity, pitchOffset, audioTime, gateEnd, sampleUrl) => {
      const currentSession = sessionRef.current;
      const track = currentSession.tracks.find(t => t.id === trackId);
      // Notes route through the active audio backend (see BackendsPanel /
      // BackendSelector). Switching the backend via setBackend() takes effect
      // immediately for subsequent notes — no context teardown required.
      getBackend().noteOn(
        { trackId, voice, baseFreq, velocity, pitchOffset, audioTime, gateEnd, sampleUrl },
        {
          trackId,
          muteGroup: track?.muteGroup ?? 0,
          autoStopNote: track?.autoStopNote ?? false,
          applyVelocity: track?.applyVelocity ?? true,
          velocitySelectionMode: track?.velocitySelectionMode ?? 'first',
        }
      );
    });

    setAudioStatus(ctx.state as any);
    setActiveTab('grid');
  };

  const togglePlay = () => {
    if (audioStatus === 'uninitialized') {
      startAudioEngine().then(() => {
        setPlaying((prev) => {
          if (prev) {
            clock.stop();
            return false;
          } else {
            clock.start();
            return true;
          }
        });
      });
      return;
    }

    setPlaying((prev) => {
      if (prev) {
        clock.stop();
        return false;
      } else {
        try {
          const ctx = getContext();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        } catch (e) {}
        clock.start();
        return true;
      }
    });
  };

  const setBpm = (val: number) => {
    setBpmState(Math.min(300, Math.max(30, val)));
  };

  const setSelectedCell = (trackId: string | null, sceneId: string | null) => {
    setSelectedTrackId(trackId);
    setSelectedSceneId(sceneId);
  };

  const toggleStep = (sceneId: string, trackId: string, stepIndex: number) => {
    setSession((prev) => {
      const key = clipKey(sceneId, trackId);
      const clip = prev.clips[key];
      if (!clip) return prev;

      const newSteps = [...clip.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        active: !newSteps[stepIndex].active
      };

      const newClip = {
        ...clip,
        steps: newSteps,
        state: clip.state === 'empty' ? 'stopped' : clip.state
      };

      return {
        ...prev,
        clips: {
          ...prev.clips,
          [key]: newClip
        }
      };
    });
  };

  const updateStepParam = (
    sceneId: string,
    trackId: string,
    stepIndex: number,
    field: keyof Step,
    val: any
  ) => {
    setSession((prev) => {
      const key = clipKey(sceneId, trackId);
      const clip = prev.clips[key];
      if (!clip) return prev;

      const newSteps = [...clip.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        [field]: val
      };

      return {
        ...prev,
        clips: {
          ...prev.clips,
          [key]: {
            ...clip,
            steps: newSteps
          }
        }
      };
    });
  };

  const updateClipSteps = (sceneId: string, trackId: string, newSteps: Step[]) => {
    setSession((prev) => {
      const key = clipKey(sceneId, trackId);
      const clip = prev.clips[key];
      if (!clip) return prev;

      return {
        ...prev,
        clips: {
          ...prev.clips,
          [key]: {
            ...clip,
            steps: newSteps,
            state: clip.state === 'empty' && newSteps.some(s => s.active) ? 'stopped' : clip.state
          }
        }
      };
    });
  };

  const launchClip = (sceneId: string, trackId: string) => {
    if (audioStatus === 'uninitialized') {
      startAudioEngine().then(() => {
        launcher.launchClip(sceneId, trackId, quantization);
      });
      return;
    }
    launcher.launchClip(sceneId, trackId, quantization);
  };

  const stopClip = (sceneId: string, trackId: string) => {
    launcher.stopClip(sceneId, trackId, quantization);
  };

  const launchScene = (sceneId: string) => {
    if (audioStatus === 'uninitialized') {
      startAudioEngine().then(() => {
        launcher.launchScene(sceneId, quantization);
      });
      return;
    }
    launcher.launchScene(sceneId, quantization);
  };

  const stopAll = () => {
    launcher.stopAll(quantization);
  };

  const addTrack = (name: string, voice: VoiceType, baseFreq: number, color: string, sampleUrl?: string) => {
    const newTrackId = `track-${crypto.randomUUID()}`;
    const newTrack = { id: newTrackId, name, voice, baseFreq, color, sampleUrl };

    setSession((prev) => {
      const newClips = { ...prev.clips };
      // Generate empty clips for all existing scenes
      prev.scenes.forEach((scene) => {
        const key = clipKey(scene.id, newTrackId);
        newClips[key] = makeClip(newTrackId, scene.id, 16);
        newClips[key].state = 'stopped';
      });

      return {
        ...prev,
        tracks: [...prev.tracks, newTrack],
        clips: newClips
      };
    });

    setFxChains((prev) => ({
      ...prev,
      [newTrackId]: {
        trackId: newTrackId,
        slots: [
          { type: 'none', params: {} },
          { type: 'none', params: {} },
          { type: 'none', params: {} }
        ]
      }
    }));

    setTrackVolumes(prev => ({ ...prev, [newTrackId]: 1.0 }));
    setTrackMutes(prev => ({ ...prev, [newTrackId]: false }));
    setTrackSends(prev => ({ ...prev, [newTrackId]: [0, 0, 0, 0] }));

    if (audioStatus !== 'uninitialized') {
      patchGraph.addTrack(newTrackId);
    }
  };

  const updateTrackParam = (trackId: string, field: keyof SceneTrack, val: any) => {
    setSession((prev) => {
      const newTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          return { ...t, [field]: val };
        }
        return t;
      });
      return { ...prev, tracks: newTracks };
    });
  };

  const addScene = (name: string) => {
    const newSceneId = `scene-${crypto.randomUUID()}`;
    const newScene = { id: newSceneId, name };

    setSession((prev) => {
      const newClips = { ...prev.clips };
      prev.tracks.forEach((track) => {
        const key = clipKey(newSceneId, track.id);
        newClips[key] = makeClip(track.id, newSceneId, 16);
        newClips[key].state = 'stopped';
      });

      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
        clips: newClips
      };
    });
  };

  const setFxType = (trackId: string, slotIndex: number, type: FxType) => {
    setFxChains((prev) => {
      const chain = prev[trackId];
      if (!chain) return prev;

      const newSlots = [...chain.slots] as TrackChain['slots'];
      newSlots[slotIndex] = {
        type,
        params: {}
      };

      return {
        ...prev,
        [trackId]: {
          ...chain,
          slots: newSlots
        }
      };
    });

    if (audioStatus !== 'uninitialized') {
      patchGraph.setSlotFx(trackId, slotIndex, type);
    }
  };

  const setFxParam = (trackId: string, slotIndex: number, paramName: string, value: number) => {
    setFxChains((prev) => {
      const chain = prev[trackId];
      if (!chain) return prev;

      const newSlots = [...chain.slots] as TrackChain['slots'];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        params: {
          ...newSlots[slotIndex].params,
          [paramName]: value
        }
      };

      return {
        ...prev,
        [trackId]: {
          ...chain,
          slots: newSlots
        }
      };
    });

    if (audioStatus !== 'uninitialized') {
      patchGraph.updateParam(trackId, slotIndex, paramName, value);
    }
  };

  const importSession = (imported: Session, fx: Record<string, TrackChain>) => {
    setSession(imported);
    setFxChains(fx);
    if (audioStatus !== 'uninitialized') {
      try {
        launcher.detach();
        session.tracks.forEach(t => patchGraph.removeTrack(t.id));

        imported.tracks.forEach((track) => {
          patchGraph.addTrack(track.id);
          const chain = fx[track.id];
          if (chain) {
            chain.slots.forEach((slot, idx) => {
              if (slot.type !== 'none') {
                patchGraph.setSlotFx(track.id, idx, slot.type, slot.params);
              }
            });
          }
        });

        launcher.attach(imported);
      } catch (err) {
        console.error('Error re-routing imported session:', err);
      }
    }
  };

  const triggerPanic = () => {
    try {
      const ctx = getContext();
      if (ctx && ctx.state === 'running') {
        ctx.suspend();
        setAudioStatus('suspended');
      }
    } catch (e) {}
    clock.stop();
    launcher.stopAll('immediate');
    setPlaying(false);
    console.warn("SYSTEM INTERRUPT: Audio Context Suspended via Panic Protocol.");
  };

  const recoverEngine = async () => {
    try {
      const ctx = getContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
        setAudioStatus('running');
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (audioStatus !== 'uninitialized') {
      launcher.attach(session);
    }
  }, [session, audioStatus]);

  // ── Live command DSL host ────────────────────────────────────────────────
  // Bridges parsed/compiled commands to the DAW. getFxChains returns the chain
  // array the runtime iterates (Record → values). launchClip/launchScene reuse
  // the existing context functions (which apply quantization + engine-boot guard).
  const liveHost: LiveRuntimeHost = {
    getSession: () => sessionRef.current,
    getFxChains: () => Object.values(fxChains),
    getBpm: () => bpm,
    getQuantization: () => quantization,
    launchClip,
    stopClip,
    launchScene,
    stopAll,
    setBpm,
    setTrackMute,
    setTrackSolo,
    setFxParam,
    updateClipSteps,
    panic: triggerPanic,
  };

  const runCommand = async (raw: string) => {
    const source = raw.trim();
    if (!source) return;
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const base = { id, timestamp: Date.now(), source };
    try {
      const parsed = parse(source);
      const cmd = compile(parsed, sessionRef.current);
      const message = await execute(cmd, liveHost);
      setLiveHistory(prev => [...prev, { ...base, ok: true, message, command: cmd }]);
    } catch (e) {
      const error = isLiveError(e)
        ? e.message
        : (e instanceof Error ? e.message : String(e));
      setLiveHistory(prev => [...prev, { ...base, ok: false, error }]);
    }
  };

  const clearLiveHistory = () => setLiveHistory([]);

  return (
    <DawContext.Provider
      value={{
        session,
        bpm,
        playing,
        quantization,
        selectedTrackId,
        selectedSceneId,
        activeSteps,
        fxChains,
        audioStatus,
        startAudioEngine,
        activeTab,
        setActiveTab,
        togglePlay,
        setBpm,
        setQuantization,
        setSelectedCell,
        toggleStep,
        updateStepParam,
        updateClipSteps,
        launchClip,
        stopClip,
        launchScene,
        stopAll,
        addTrack,
        updateTrackParam,
        addScene,
        setFxType,
        setFxParam,
        importSession,
        
        trackVolumes,
        trackMutes,
        trackSolos,
        trackPans,
        panLaw,
        setTrackVolume,
        setTrackMute,
        setTrackSolo,
        setTrackPan,
        setPanLaw,

        trackSends,
        setTrackSend,

        kickRumble,
        setKickRumbleParams,

        masterCompressor,
        setMasterCompressorParams,
        masterSaturatorTilt,
        setMasterSaturatorTiltParams,
        masterSidechain,
        setMasterSidechainParams,
        masterLimiter,
        setMasterLimiterParams,

        swing: swing,
        setSwing: setSwing,
        humanizeTime: humanizeTime,
        setHumanizeTime: setHumanizeTime,
        humanizeVelocity: humanizeVelocity,
        setHumanizeVelocity: setHumanizeVelocity,

        triggerPanic: triggerPanic,
        recoverEngine: recoverEngine,

        runCommand,
        liveHistory,
        clearLiveHistory
      }}
    >
      {children}
    </DawContext.Provider>
  );
};

export const useDaw = () => {
  const context = useContext(DawContext);
  if (!context) {
    throw new Error('useDaw must be used within a DawProvider');
  }
  return context;
};
