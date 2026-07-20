import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { GeminiLiveClient, AUDIO_CONFIG } from '../../services/geminiLiveService';
import ResonatorIcon from '../visualizations/SacredGeometryIcons/ResonatorIcon';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInstruction: string;
  practiceName: string;
}

interface TranscriptEntry {
  text: string;
  speaker: 'user' | 'ai';
  timestamp: number;
}

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  systemInstruction,
  practiceName
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const isRecordingRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Keep isRecordingRef in sync with isRecording state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Scroll to bottom when transcript updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: AUDIO_CONFIG.OUTPUT_SAMPLE_RATE });
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Start microphone recording
  const startRecording = useCallback(async () => {
    try {
      await initAudioContext();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: AUDIO_CONFIG.INPUT_SAMPLE_RATE,
          channelCount: AUDIO_CONFIG.INPUT_CHANNELS,
        }
      });

      mediaStreamRef.current = stream;

      if (!audioContextRef.current) return;

      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create analyser for audio level visualization
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Create processor for audio streaming
      // NOTE: createScriptProcessor is deprecated. Consider migrating to AudioWorklet for better performance.
      // AudioWorklet runs in a separate thread and won't block the UI thread.
      // Migration plan: Create audioWorklet.ts processor and use audioContext.audioWorklet.addModule()
      const processor = audioContextRef.current.createScriptProcessor(256, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        // Use ref to avoid stale closure - captures current isRecording state
        if (!isRecordingRef.current || !clientRef.current?.isReady()) return;

        const inputData = event.inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (PCM 16-bit)
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send to Gemini
        clientRef.current.sendAudio(int16Data.buffer);

        // Update audio level for visualization
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('[VoiceChat] Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, [initAudioContext]);

  // Stop microphone recording
  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  // Play audio from Gemini
  const playAudio = useCallback(async (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    setIsSpeaking(true);

    source.onended = () => {
      setIsSpeaking(false);
      isPlayingRef.current = false;

      // Play next in queue
      if (audioQueueRef.current.length > 0) {
        const nextBuffer = audioQueueRef.current.shift();
        if (nextBuffer) {
          playAudio(nextBuffer);
        }
      }
    };

    source.start(0);
    isPlayingRef.current = true;
  }, []);

  // Connect to Gemini Live API
  const connectToGemini = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await initAudioContext();

      const client = new GeminiLiveClient({
        systemInstruction,
        voiceName: 'Kore', // Calm, therapeutic voice
        onSetupComplete: () => {
          console.log('[VoiceChat] Setup complete');
          setIsConnected(true);
          setIsConnecting(false);
        },
        onAudioReceived: async (audioData) => {
          if (!audioContextRef.current) return;

          try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.slice(0));

            if (isPlayingRef.current) {
              audioQueueRef.current.push(audioBuffer);
            } else {
              playAudio(audioBuffer);
            }
          } catch (err) {
            console.error('[VoiceChat] Error decoding audio:', err);
          }
        },
        onTextReceived: (text) => {
          setTranscript(prev => [...prev, {
            text,
            speaker: 'ai',
            timestamp: Date.now()
          }]);
        },
        onError: (err) => {
          console.error('[VoiceChat] Client error:', err);
          setError(err.message);
          setIsConnecting(false);
          setIsConnected(false);
        },
        onClose: () => {
          console.log('[VoiceChat] Connection closed');
          setIsConnected(false);
          stopRecording();
        }
      });

      clientRef.current = client;
      await client.connect();

    } catch (err) {
      console.error('[VoiceChat] Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Gemini');
      setIsConnecting(false);
    }
  }, [systemInstruction, initAudioContext, playAudio, stopRecording]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    stopRecording();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioQueueRef.current = [];
    setTranscript([]);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);

    onClose();
  }, [onClose, stopRecording]);

  // Connect on mount
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      connectToGemini();
    }
  }, [isOpen, isConnected, isConnecting, connectToGemini]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      stopRecording();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopRecording]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`${isSpeaking ? 'animate-pulse' : ''}`}>
              <ResonatorIcon size={32} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-100">
                Voice Practice Session
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{practiceName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Connection Status */}
        {isConnecting && (
          <div className="p-4 bg-teal-500/10 border-b border-teal-500/20 flex items-center gap-2 text-sm text-teal-400">
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting to AI guide...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-950/50">
          {transcript.length === 0 && isConnected && (
            <div className="text-center text-slate-500 text-sm py-8">
              <p>Start speaking to begin the practice session.</p>
              <p className="mt-2">The AI guide will respond with voice guidance.</p>
            </div>
          )}

          {transcript.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  entry.speaker === 'user'
                    ? 'bg-teal-500/20 text-slate-200 border border-teal-500/30'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {entry.speaker === 'user' ? 'You' : 'AI Guide'}
                  </span>
                  {entry.speaker === 'ai' && isSpeaking && index === transcript.length - 1 && (
                    <Volume2 size={12} className="text-teal-400 animate-pulse" />
                  )}
                </div>
                <p className="text-sm leading-relaxed">{entry.text}</p>
              </div>
            </div>
          ))}

          <div ref={transcriptEndRef} />
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-stone-900/50">
          <div className="flex flex-col items-center gap-4">
            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">Listening...</p>
              </div>
            )}

            {/* Microphone Toggle */}
            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              disabled={!isConnected}
              className={`p-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <MicOff size={32} className="text-white" />
              ) : (
                <Mic size={32} className="text-white" />
              )}
            </button>

            <p className="text-xs sm:text-sm text-slate-400 text-center">
              {isRecording
                ? 'Tap to stop speaking'
                : isConnected
                ? 'Tap to start speaking'
                : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
