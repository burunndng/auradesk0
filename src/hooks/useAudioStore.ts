// Audio Store Hook
// Centralizes Web Audio API state and controls
// Provides real-time audio processing, visualization, and playback control

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioStore {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  analyserNode: AnalyserNode | null;
  audioSource: MediaElementAudioSourceNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  frequencyData: Uint8Array;
  isConnected: boolean;
  isStereo: boolean;
}

const initialStore: AudioStore = {
  audioContext: null,
  gainNode: null,
  analyserNode: null,
  audioSource: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  bass: 0,
  mid: 0,
  treble: 0,
  frequencyData: new Uint8Array(1024),
  isConnected: false,
  isStereo: false,
};

export function useAudioStore() {
  const [store, setStore] = useState<AudioStore>(initialStore);
  const audioRef = useRef<HTMLAudioElement>(null);
  const updateIntervalRef = useRef<number>(0);

  // Initialize AudioContext and nodes
  const initializeAudio = useCallback(() => {
    if (!window.AudioContext && !window.AudioContext) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.8;

    setStore(prev => ({
      ...prev,
      audioContext: ctx,
      gainNode: gain,
      frequencyData: new Uint8Array(ctx.createAnalyser().frequencyBinCount),
    }));

    return ctx;
  }, []);

  // Connect audio source for playback
  const connectAudioSource = useCallback((audioElement: HTMLAudioElement) => {
    if (!store.audioContext || !store.gainNode) return;

    const source = store.audioContext.createMediaElementSource(audioElement);
    source.connect(store.gainNode);
    
    // Create stereo effect if enabled
    if (store.isStereo) {
      const splitter = store.audioContext.createChannelSplitterNode(2);
      const merger = store.audioContext.createChannelMerger(2);
      
      source.connect(splitter);
      splitter.connect(merger, 0, 0);
      splitter.connect(merger, 1, 1);
      
      const leftGain = store.audioContext.createGain();
      const rightGain = store.audioContext.createGain();
      
      merger.connect(leftGain);
      merger.connect(rightGain);
      leftGain.connect(store.gainNode);
      rightGain.connect(store.gainNode);
    } else {
      source.connect(store.gainNode);
    }

    setStore(prev => ({
      ...prev,
      audioSource: source,
      isConnected: true,
    }));

    return source;
  }, [store.audioContext, store.gainNode, store.isStereo]);

  // Audio controls
  const play = useCallback(() => {
    if (audioRef.current && store.audioContext && store.isConnected) {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
      });
      setStore(prev => ({ ...prev, isPlaying: true }));
    }
  }, [store.audioContext, store.isConnected]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStore(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (store.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [store.isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setStore(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (store.gainNode) {
      store.gainNode.gain.value = vol;
      setStore(prev => ({ ...prev, volume: vol }));
    }
  }, [store.gainNode]);

  const setBass = useCallback((bass: number) => {
    setStore(prev => ({ ...prev, bass }));
  }, []);

  const setMid = useCallback((mid: number) => {
    setStore(prev => ({ ...prev, mid }));
  }, []);

  const setTreble = useCallback((treble: number) => {
    setStore(prev => ({ ...prev, treble }));
  }, []);

  const setStereo = useCallback((stereo: boolean) => {
    setStore(prev => ({ ...prev, isStereo: stereo }));
  }, []);

  const loadAudio = useCallback((src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.load();
    }
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setStore(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setStore(prev => ({ ...prev, duration }));
  }, []);

  // Update frequency data and audio analysis
  useEffect(() => {
    if (!store.analyserNode || !store.audioContext) return;

    const updateAnalysis = () => {
      if (store.analyserNode) {
        const data = new Uint8Array(store.analyserNode.frequencyBinCount);
        store.analyserNode.getByteFrequencyData(data);
        
        // Calculate frequency bands
        const bassEnd = data.length / 4;
        const midEnd = data.length * 3 / 4;
        
        const bassData = data.slice(0, bassEnd);
        const midData = data.slice(bassEnd, midEnd);
        const trebleData = data.slice(midEnd);
        
        const bassAvg = bassData.reduce((a, b) => a + b, 0) / bassData.length;
        const midAvg = midData.reduce((a, b) => a + b, 0) / midData.length;
        const trebleAvg = trebleData.reduce((a, b) => a + b, 0) / trebleData.length;

        setStore(prev => ({
          ...prev,
          bass: bassAvg / 255,
          mid: midAvg / 255,
          treble: trebleAvg / 255,
          frequencyData: data,
        }));
      }
    };

    updateIntervalRef.current = setInterval(updateAnalysis, 16);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [store.analyserNode, store.audioContext]);

  // Update timer for playback
  useEffect(() => {
    if (!audioRef.current) return;

    const updateTime = () => {
      if (audioRef.current) {
        setStore(prev => ({
          ...prev,
          currentTime: audioRef.current!.currentTime,
        }));
      }
    };

    const timer = setInterval(updateTime, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const audioElement = () => audioRef.current;

  return {
    ...store,
    initializeAudio,
    connectAudioSource,
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    setBass,
    setMid,
    setTreble,
    setStereo,
    loadAudio,
    setCurrentTime,
    setDuration,
    audioElement,
  };
}