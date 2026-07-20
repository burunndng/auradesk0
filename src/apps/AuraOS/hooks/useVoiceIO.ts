// hooks/useVoiceIO.ts
// Integrated voice IO for IFS wizard:
//   mic → silence detection → MediaRecorder → DeepInfra STT (Whisper large v3) → onTranscript()
//   speakText() → DeepInfra TTS (Kokoro-82M) → AudioContext playback
// Both routes via /api/deepinfra-proxy (DEEPINFRA_API_KEY kept server-side)

import { useState, useRef, useCallback } from 'react';

const DEEPINFRA_PROXY = '/api/deepinfra-proxy';
const SILENCE_THRESHOLD = 0.01; // RMS below this = silence
const SILENCE_DURATION_MS = 1500; // auto-stop after 1.5s silence

export type VoiceIOState = 'idle' | 'recording' | 'transcribing' | 'speaking' | 'error';

interface UseVoiceIOOptions {
  onTranscript: (text: string) => void;
  onError?: (err: string) => void;
  voiceId?: string; // DeepInfra voice preset, default: af_bella
}

export function useVoiceIO({ onTranscript, onError, voiceId }: UseVoiceIOOptions) {
  const [state, setState] = useState<VoiceIOState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64Audio = btoa(binary);

    const response = await fetch(DEEPINFRA_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'stt',
        audioData: base64Audio,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    if (!response.ok) throw new Error(`STT error: ${response.status}`);
    const data = await response.json() as { transcript?: string; error?: string };
    if (data.error) throw new Error(data.error);
    return data.transcript?.trim() || '';
  }, []);

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || isPlayingRef.current) return;
    isPlayingRef.current = true;
    setState('speaking');

    try {
      const response = await fetch(DEEPINFRA_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tts',
          text,
          voice: voiceId || 'af_bella',
          format: 'mp3',
        }),
      });

      if (!response.ok) throw new Error(`TTS error: ${response.status}`);
      const data = await response.json() as { audioData?: string; error?: string };
      if (data.error) throw new Error(data.error);
      if (!data.audioData) throw new Error('No audio returned');

      // Decode base64 mp3 → ArrayBuffer
      const binaryStr = atob(data.audioData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));

      const source = ctx.createBufferSource();
      sourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        sourceRef.current = null;
        setState('idle');
      };
      source.start(0);
    } catch (err) {
      isPlayingRef.current = false;
      sourceRef.current = null;
      setState('idle');
      console.error('[VoiceIO] TTS error:', err);
      onError?.(err instanceof Error ? err.message : 'TTS failed');
    }
  }, [voiceId, onError]);

  const startRecording = useCallback(async () => {
    if (state !== 'idle') return;
    chunksRef.current = [];
    setState('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });

      // Silence detection
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);

      const detectSilence = () => {
        const buf = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buf);
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);

        if (rms < SILENCE_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              stopRecording();
              ctx.close();
            }, SILENCE_DURATION_MS);
          }
        } else {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        if (mediaRecorderRef.current?.state === 'recording') requestAnimationFrame(detectSilence);
      };

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setState('transcribing');
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const transcript = await transcribeAudio(blob);
          if (transcript) {
            onTranscript(transcript);
          }
          setState('idle');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Transcription failed';
          onError?.(msg);
          setState('error');
          setTimeout(() => setState('idle'), 2000);
        }
      };

      recorder.start(100);
      requestAnimationFrame(detectSilence);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access failed';
      onError?.(msg);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [state, stopRecording, transcribeAudio, onTranscript, onError]);

  const cancelSpeaking = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    isPlayingRef.current = false;
    setState('idle');
  }, []);

  return { state, startRecording, stopRecording, speakText, cancelSpeaking };
}
