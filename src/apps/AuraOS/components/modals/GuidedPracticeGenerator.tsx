import React, { useState, useRef, useEffect } from 'react';
import * as aiService from '../../services/aiService.ts';
import { base64ToArrayBuffer } from '../../services/geminiAudioService.ts';
import { StorageManager } from '../../.claude/lib/storageManager';
import VoidBloomIcon from '../visualizations/SacredGeometryIcons/VoidBloomIcon';
import LabyrinthPathIcon from '../visualizations/SacredGeometryIcons/LabyrinthPathIcon';
import RecursionWellIcon from '../visualizations/SacredGeometryIcons/RecursionWellIcon';
import AOSConfirm from '../visualizations/SacredGeometryIcons/AOSConfirm';
import NigredoIcon from '../visualizations/SacredGeometryIcons/NigredoIcon';
import AOSClock from '../visualizations/SacredGeometryIcons/AOSClock';
import ResonatorIcon from '../visualizations/SacredGeometryIcons/ResonatorIcon';
import AOSReject from '../visualizations/SacredGeometryIcons/AOSReject';
import AOSArrow from '../visualizations/SacredGeometryIcons/AOSArrow';
import AscensionFlameIcon from '../visualizations/SacredGeometryIcons/AscensionFlameIcon';
import VesselFrameIcon from '../visualizations/SacredGeometryIcons/VesselFrameIcon';

// --- Local module SVG icons ---

function BodyIcon({ size = 24, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" strokeWidth="2" opacity="1" />
      <path d="M12 3.5 L18 12 L12 20.5 L6 12 Z" strokeWidth="1.5" opacity="0.85" />
      <path d="M10 3.5 Q5.5 7.75 10 12 Q5.5 16.25 10 20.5" strokeWidth="1" opacity="0.6" fill="none" />
      <path d="M14 3.5 Q18.5 7.75 14 12 Q18.5 16.25 14 20.5" strokeWidth="1" opacity="0.6" fill="none" />
      <path d="M12 4.5 Q8.5 8.25 12 12 Q8.5 15.75 12 19.5" strokeWidth="0.5" opacity="0.2" fill="none" />
      <line x1="8.5" y1="21" x2="15.5" y2="21" strokeWidth="0.5" opacity="0.35" />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="0.5" opacity="0.15" />
      <circle cx="12" cy="12" r="1" fill={color} stroke="none" opacity="0.8" />
      <circle cx="12" cy="3.5" r="0.4" fill={color} stroke="none" opacity="0.3" />
      <circle cx="12" cy="20.5" r="0.4" fill={color} stroke="none" opacity="0.3" />
    </svg>
  );
}

function MindIcon({ size = 24, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8.75" cy="12" r="6.5" strokeWidth="2" opacity="0.9" />
      <circle cx="15.25" cy="12" r="6.5" strokeWidth="2" opacity="0.9" />
      <path d="M12 6.37 A6.5 6.5 0 0 0 12 17.63" strokeWidth="1.5" opacity="0.8" fill="none" />
      <path d="M12 17.63 A6.5 6.5 0 0 0 12 6.37" strokeWidth="1.5" opacity="0.8" fill="none" />
      <line x1="12" y1="12" x2="18.18" y2="12" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="16.37" y2="7.63" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="12" y2="5.82" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="7.63" y2="7.63" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="5.82" y2="12" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="7.63" y2="16.37" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="12" y2="18.18" strokeWidth="1" opacity="0.45" />
      <line x1="12" y1="12" x2="16.37" y2="16.37" strokeWidth="1" opacity="0.45" />
      <circle cx="8.75" cy="12" r="2" strokeWidth="0.5" opacity="0.25" />
      <circle cx="8.75" cy="12" r="3.24" strokeWidth="0.5" opacity="0.15" />
      <circle cx="15.25" cy="12" r="2" strokeWidth="0.5" opacity="0.25" />
      <circle cx="15.25" cy="12" r="3.24" strokeWidth="0.5" opacity="0.15" />
      <line x1="12" y1="6.37" x2="12" y2="17.63" strokeWidth="0.5" opacity="0.15" />
      <circle cx="8.75" cy="12" r="0.7" fill={color} stroke="none" opacity="0.65" />
      <circle cx="15.25" cy="12" r="0.7" fill={color} stroke="none" opacity="0.65" />
      <circle cx="12" cy="12" r="0.85" fill={color} stroke="none" opacity="1" />
    </svg>
  );
}

function ShadowIcon({ size = 24, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10.25" cy="12" r="7" strokeWidth="2" opacity="1" />
      <path d="M12 5.22 A7 7 0 0 1 12 18.78" strokeWidth="1.5" opacity="0.7" fill="none" />
      <path d="M12 5.22 A7 7 0 0 0 12 18.78" strokeWidth="1.5" opacity="0.35" strokeDasharray="1.2 0.8" fill="none" />
      <line x1="12.5" y1="18.78" x2="13" y2="20" strokeWidth="1" opacity="0.55" />
      <line x1="14" y1="18.5" x2="14.8" y2="19.8" strokeWidth="1" opacity="0.45" />
      <line x1="12.8" y1="20.3" x2="13.2" y2="21.2" strokeWidth="1" opacity="0.3" />
      <line x1="14.5" y1="20" x2="14.8" y2="20.8" strokeWidth="1" opacity="0.2" />
      <line x1="13.5" y1="21.2" x2="13.6" y2="21.8" strokeWidth="1" opacity="0.12" />
      <path d="M5 9 A4.5 4.5 0 0 1 9 6.5" strokeWidth="0.5" opacity="0.25" fill="none" />
      <path d="M10.5 6 A4.5 4.5 0 0 1 14 7" strokeWidth="0.5" opacity="0.18" fill="none" />
      <circle cx="13.75" cy="12" r="7" strokeWidth="0.5" opacity="0.08" />
      <line x1="13.75" y1="5" x2="13.25" y2="19" strokeWidth="0.5" opacity="0.1" />
      <circle cx="13.75" cy="12" r="0.85" fill={color} stroke="none" opacity="0.6" />
      <circle cx="10.25" cy="12" r="0.5" fill={color} stroke="none" opacity="0.2" />
    </svg>
  );
}

function SpiritIcon({ size = 24, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="6" strokeWidth="0.5" opacity="0.2" />
      <path d="M 13 12 A 1 1 0 0 0 12 11 A 1.618 1.618 0 0 0 10.382 12 A 2.618 2.618 0 0 0 12 14.618" strokeWidth="1" opacity="0.5" />
      <line x1="14.07" y1="4.28" x2="9.93" y2="19.72" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="9" strokeWidth="2" opacity="1.0" />
      <circle cx="12" cy="12" r="0.8" fill={color} opacity="0.6" />
    </svg>
  );
}

// --- Module config ---

const MODULE_CONFIG = {
  body: {
    label: 'Body',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    category: 'Physical Practice',
    Icon: BodyIcon,
  },
  mind: {
    label: 'Mind',
    accent: 'text-blue-400',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    category: 'Mental Practice',
    Icon: MindIcon,
  },
  shadow: {
    label: 'Shadow',
    accent: 'text-purple-400',
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    category: 'Inner Work',
    Icon: ShadowIcon,
  },
  spirit: {
    label: 'Spirit',
    accent: 'text-amber-400',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    category: 'Contemplative Practice',
    Icon: SpiritIcon,
  },
} as const;

type ModuleKey = keyof typeof MODULE_CONFIG;

// --- Presets ---

const PRESETS: Record<ModuleKey, Array<{ label: string; seed: string }>> = {
  body: [
    { label: 'Tension Release', seed: 'Guide a full-body tension release practice starting from the feet and moving upward.' },
    { label: 'Breath Reset', seed: 'Guide a breath regulation practice to calm the nervous system.' },
    { label: 'Body Scan', seed: 'Guide a systematic body scan for awareness and relaxation.' },
    { label: 'Energy Activation', seed: 'Guide an energizing practice to awaken and mobilize physical vitality.' },
    { label: 'Grounding & Settling', seed: 'Guide a grounding practice to establish a stable, present physical foundation.' },
  ],
  mind: [
    { label: 'Focused Attention', seed: 'Guide a focused attention practice to train single-pointed concentration.' },
    { label: 'Perspective Shift', seed: 'Guide a practice for stepping outside a current perspective to see a situation freshly.' },
    { label: 'Thought Observation', seed: 'Guide a practice for watching thoughts arise and pass without identification.' },
    { label: 'Mental Clarity', seed: 'Guide a practice for clearing mental noise and arriving at cognitive stillness.' },
    { label: 'Decision Space', seed: 'Guide a practice for creating inner spaciousness before making an important decision.' },
  ],
  shadow: [
    { label: 'Inner Critic Meeting', seed: 'Guide a practice for meeting and dialoguing with the inner critic.' },
    { label: 'Emotional Release', seed: 'Guide a practice for safely feeling and releasing a difficult emotion.' },
    { label: 'Pattern Recognition', seed: 'Guide a practice for identifying a recurring behavioral or emotional pattern.' },
    { label: 'Self-Compassion', seed: 'Guide a self-compassion practice for softening harsh self-judgment.' },
    { label: 'Projection Awareness', seed: 'Guide a practice for recognizing a quality in others that may belong to oneself.' },
  ],
  spirit: [
    { label: 'Open Presence', seed: 'Guide a practice of resting in open, objectless awareness.' },
    { label: 'Witnessing Awareness', seed: 'Guide a practice of observing experience from the position of the witness.' },
    { label: 'Gratitude Cultivation', seed: 'Guide a gratitude practice that opens the heart.' },
    { label: 'Loving-Kindness', seed: 'Guide a loving-kindness practice extending warmth to self and others.' },
    { label: 'Silent Sitting', seed: 'Guide a simple silent sitting practice with minimal instruction.' },
  ],
};

// --- Styles ---

const STYLES = [
  { value: 'grounding', label: 'Grounding', description: 'stabilizing, anchoring, earth-focused' },
  { value: 'energizing', label: 'Energizing', description: 'activating, vigorous, mobilizing' },
  { value: 'contemplative', label: 'Contemplative', description: 'spacious, unhurried, inquiry-based' },
  { value: 'somatic', label: 'Somatic', description: 'body-sensation focused, felt-sense oriented' },
  { value: 'precise', label: 'Precise', description: 'minimal words, maximum clarity, no elaboration' },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

// --- Audio helpers ---

async function generateAudioWithKokoro(text: string): Promise<string> {
  const response = await fetch('/api/deepinfra-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'tts', text, voice: 'af_bella', format: 'mp3' }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS error: ${err}`);
  }
  const { audioData } = await response.json();
  return audioData;
}

// --- Script renderer ---

function renderScript(script: string, moduleKey: string) {
  const config = MODULE_CONFIG[moduleKey as ModuleKey] || MODULE_CONFIG.body;
  const sections = script.split(/\n\n+/);
  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n');
        const header = lines[0];
        const steps = lines.slice(1);
        const isHeader = /^(OPENING|CORE PRACTICE|CLOSING)/i.test(header);
        return (
          <div key={i}>
            {isHeader && (
              <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${config.accent}`}>
                {header}
              </p>
            )}
            {!isHeader && <p className="text-sm text-white/70 mb-1">{header}</p>}
            {steps.length > 0 && (
              <ol className="space-y-1.5 list-none">
                {steps.map((step, j) => (
                  <li key={j} className="text-sm text-white/80 leading-relaxed pl-0">
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Types ---

interface GuidedPracticeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPractice: () => void;
}

interface GeneratedPractice {
  id: string;
  title: string;
  script: string;
  audioBase64: string;
  createdAt: string;
  duration: number;
  tone: string;
  prompt: string;
  module: string;
}

// --- Component ---

export default function GuidedPracticeGenerator({ isOpen, onClose, onLogPractice }: GuidedPracticeGeneratorProps) {
  const [step, setStep] = useState<'create' | 'preview' | 'history'>('create');
  const [selectedModule, setSelectedModule] = useState<ModuleKey | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [duration, setDuration] = useState(10);
  const [style, setStyle] = useState('grounding');
  const [customDuration, setCustomDuration] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPractices, setGeneratedPractices] = useState<GeneratedPractice[]>([]);
  const [currentPractice, setCurrentPractice] = useState<GeneratedPractice | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackAnimationRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      if (playbackAnimationRef.current) {
        cancelAnimationFrame(playbackAnimationRef.current);
      }
      setIsPlaying(false);
    };
  }, [isOpen]);

  useEffect(() => {
    try {
      const saved = StorageManager.getUntyped('generatedPractices') as any[] | null;
      if (saved) {
        const historyItems = Array.isArray(saved) ? saved : [];
        const practicesWithEmptyAudio = historyItems.map((item: Omit<GeneratedPractice, 'audioBase64'>) => ({
          ...item,
          audioBase64: '',
        }));
        setGeneratedPractices(practicesWithEmptyAudio);
      }
    } catch (err) {
      console.error('Failed to load practice history:', err);
    }
  }, []);

  useEffect(() => {
    if (generatedPractices.length === 0 && !StorageManager.getUntyped('generatedPractices')) return;
    try {
      const practicesForStorage = generatedPractices.map(({ audioBase64, ...rest }) => rest);
      StorageManager.setUntyped('generatedPractices', practicesForStorage.slice(0, 20));
    } catch (err) {
      console.error('Failed to save practice history:', err);
      setError("Could not save practice history. Your browser's storage might be full.");
    }
  }, [generatedPractices]);

  const buildPromptWithSettings = (): string => {
    const basePrompt = prompt.trim();
    if (!basePrompt) return '';
    const styleObj = STYLES.find(s => s.value === style);
    const styleDescription = styleObj ? styleObj.description : style;
    const moduleName = selectedModule ? MODULE_CONFIG[selectedModule].label : 'General';
    return `${basePrompt} Duration: ${duration} minutes. Style: ${styleDescription}. Module: ${moduleName}.`;
  };

  const handleGenerate = async () => {
    const enhancedPrompt = buildPromptWithSettings();
    if (!enhancedPrompt) {
      setError('Please enter a prompt or select a preset.');
      return;
    }
    setError('');
    setIsLoading(true);
    setCurrentPractice(null);
    audioBufferRef.current = null;

    try {
      const { title, script } = await aiService.generatePracticeScript(enhancedPrompt);
      const newPractice: GeneratedPractice = {
        id: `practice-${Date.now()}`,
        title,
        script,
        audioBase64: '',
        createdAt: new Date().toISOString(),
        duration,
        tone: style,
        prompt: enhancedPrompt,
        module: selectedModule || 'mind',
      };
      setCurrentPractice(newPractice);
      setGeneratedPractices(prev => [newPractice, ...prev]);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!currentPractice) return;
    setPrompt(currentPractice.prompt);
    setStep('create');
  };

  const togglePlayback = async () => {
    if (!currentPractice || !audioContextRef.current) return;
    const audioCtx = audioContextRef.current;

    if (isPlaying && audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setIsPlaying(false);
      cancelAnimationFrame(playbackAnimationRef.current);
      return;
    }

    try {
      let audioDataToPlay = currentPractice.audioBase64;

      if (!audioDataToPlay) {
        setIsLoading(true);
        setError('');
        try {
          const newAudioBase64 = await generateAudioWithKokoro(currentPractice.script);
          audioDataToPlay = newAudioBase64;
          const updatedPractice = { ...currentPractice, audioBase64: newAudioBase64 };
          setCurrentPractice(updatedPractice);
          setGeneratedPractices(prev => prev.map(p => p.id === updatedPractice.id ? updatedPractice : p));
        } catch (genErr) {
          setError('Failed to generate audio for this practice. Please try again.');
          console.error('Audio generation error:', genErr);
          setIsLoading(false);
          return;
        } finally {
          setIsLoading(false);
        }
      }

      if (!audioBufferRef.current) {
        const audioArrayBuffer = base64ToArrayBuffer(audioDataToPlay);
        audioBufferRef.current = await audioCtx.decodeAudioData(audioArrayBuffer);
        setDurationSeconds(audioBufferRef.current.duration);
      }

      const source = audioCtx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioCtx.destination);

      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
        if (playbackTime >= (audioBufferRef.current?.duration || 0) - 0.1) {
          setPlaybackTime(0);
        }
        cancelAnimationFrame(playbackAnimationRef.current);
      };

      const offset = playbackTime % (audioBufferRef.current.duration || Infinity);
      playbackStartTimeRef.current = audioCtx.currentTime - offset;
      source.start(0, offset);
      audioSourceRef.current = source;
      setIsPlaying(true);

      const animate = () => {
        if (audioSourceRef.current) {
          const elapsed = audioCtx.currentTime - playbackStartTimeRef.current;
          if (elapsed <= (audioBufferRef.current?.duration || 0)) {
            setPlaybackTime(elapsed);
          }
          playbackAnimationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();

    } catch (err) {
      setError('Failed to play audio. Please try again.');
      console.error('Audio playback error:', err);
    }
  };

  const downloadAudio = () => {
    if (!currentPractice || !currentPractice.audioBase64) {
      alert("Audio data is not available for download. Please play the track first to generate it.");
      return;
    }
    const audioArrayBuffer = base64ToArrayBuffer(currentPractice.audioBase64);
    const blob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPractice.title.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/10 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[70dvh] sm:max-h-[80dvh] md:max-h-[90dvh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-white/90 flex items-center gap-2">
              <VoidBloomIcon size={18} className="text-white/50" />
              Generate Guided Practice
            </h2>
            <p className="text-white/40 text-sm mt-1">Create ILP practices from the Integral Life Platform</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <AOSReject size={16} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-white/10 flex gap-4">
          <button
            onClick={() => setStep('create')}
            className={`pb-3 px-2 border-b-2 text-sm font-medium transition ${step === 'create' ? 'border-white/40 text-white/80' : 'border-transparent text-white/40 hover:text-white/60'}`}
          >
            Create
          </button>
          <button
            onClick={() => setStep('history')}
            className={`pb-3 px-2 border-b-2 text-sm font-medium transition flex items-center gap-2 ${step === 'history' ? 'border-white/40 text-white/80' : 'border-transparent text-white/40 hover:text-white/60'}`}
          >
            <LabyrinthPathIcon size={14} />
            History {generatedPractices.length > 0 && `(${generatedPractices.length})`}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {/* CREATE STEP */}
          {step === 'create' && (
            <div className="space-y-6">
              {/* Module selector */}
              <div>
                <label className="text-xs font-mono tracking-widest uppercase text-white/40 mb-3 block">Module</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(MODULE_CONFIG) as [ModuleKey, typeof MODULE_CONFIG.body][]).map(([key, config]) => {
                    const isSelected = selectedModule === key;
                    const { Icon } = config;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedModule(key); setPrompt(''); setSelectedPreset(null); }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? `${config.border} ${config.bg}`
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        }`}
                      >
                        <Icon size={22} color={isSelected ? 'oklch(0.78 0.12 75deg)' : 'oklch(0.65 0.09 75deg)'} />
                        <span className={`text-xs font-medium tracking-wide ${isSelected ? config.accent : 'text-white/75'}`}>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets */}
              {selectedModule && (
                <div>
                  <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${MODULE_CONFIG[selectedModule].accent}`}>
                    {MODULE_CONFIG[selectedModule].category}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {PRESETS[selectedModule].map((preset) => {
                      const isSelected = prompt === preset.seed;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => { setPrompt(preset.seed); setSelectedPreset(preset.label); }}
                          className={`text-left px-3 py-2 rounded-md text-xs border transition-all ${
                            isSelected
                              ? `${MODULE_CONFIG[selectedModule].border} ${MODULE_CONFIG[selectedModule].bg} ${MODULE_CONFIG[selectedModule].accent}`
                              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/20'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom prompt */}
              <div>
                <label htmlFor="practice-prompt" className="block text-xs font-mono tracking-widest uppercase text-white/40 mb-2">
                  Custom Prompt
                </label>
                <textarea
                  id="practice-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-white/5 border border-white/10 rounded-md p-3 text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="Describe the practice you'd like to create..."
                  disabled={isLoading}
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AOSClock size={14} className="text-white/40" />
                  <label className="text-xs font-mono tracking-widest uppercase text-white/40">Duration</label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DURATION_OPTIONS.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => { setDuration(dur); setCustomDuration(false); }}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${!customDuration && duration === dur ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                    >
                      {dur}m
                    </button>
                  ))}
                  <input
                    type="number" min="1" max="120"
                    value={customDuration ? duration : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= 120) { setDuration(val); setCustomDuration(true); }
                    }}
                    placeholder="Custom"
                    className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>

              {/* Style */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ResonatorIcon size={14} className="text-white/40" />
                  <label className="text-xs font-mono tracking-widest uppercase text-white/40">Style</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {STYLES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStyle(option.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition text-center ${style === option.value ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                      title={option.description}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 flex gap-3">
                  <NigredoIcon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300">{error}</p>
                    <p className="text-xs text-red-400/70 mt-1">Try rewording your prompt or select a preset.</p>
                  </div>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full btn-luminous font-medium py-3 px-4 rounded-md transition flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><VoidBloomIcon size={16} /> Generate Practice</>
                )}
              </button>
            </div>
          )}

          {/* PREVIEW STEP */}
          {step === 'preview' && currentPractice && (
            <div className="space-y-6 animate-fade-in">
              {/* Title row */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {(() => {
                    const modKey = currentPractice.module as ModuleKey;
                    const cfg = MODULE_CONFIG[modKey] || MODULE_CONFIG.mind;
                    const { Icon } = cfg;
                    return <Icon size={22} color="currentColor" className={cfg.accent} />;
                  })()}
                  <div>
                    <h3 className="text-lg font-bold text-white/90">{currentPractice.title}</h3>
                    <p className={`text-xs font-mono tracking-widest uppercase ${MODULE_CONFIG[currentPractice.module as ModuleKey]?.accent || 'text-white/40'}`}>
                      {MODULE_CONFIG[currentPractice.module as ModuleKey]?.label || currentPractice.module}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/30 ml-9">
                  {currentPractice.duration}m &middot; {currentPractice.tone} &middot; {new Date(currentPractice.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Audio section */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                {currentPractice.audioBase64 ? (
                  <>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayback}
                        disabled={isLoading}
                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition flex-shrink-0 disabled:opacity-50"
                      >
                        {isLoading
                          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : isPlaying
                            ? <VesselFrameIcon size={18} />
                            : <AscensionFlameIcon size={18} />
                        }
                      </button>
                      <p className="text-sm text-white/70">
                        {isLoading ? 'Generating Audio...' : isPlaying ? 'Playing...' : 'Listen to Your Practice'}
                      </p>
                    </div>
                    {durationSeconds > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                          <div className="bg-white/40 h-full transition-all" style={{ width: `${(playbackTime / durationSeconds) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-white/30">
                          <span>{formatTime(playbackTime)}</span>
                          <span>{formatTime(durationSeconds)}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-white/30 text-center py-2">Audio generation coming soon</p>
                )}
              </div>

              {/* Script */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-3">Practice Script</p>
                <div className="max-h-48 overflow-y-auto">
                  {renderScript(currentPractice.script, currentPractice.module)}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={downloadAudio}
                  className="bg-white/5 hover:bg-white/10 text-white/70 font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <AOSArrow size={16} className="rotate-90" />
                  <span className="hidden sm:inline text-sm">Download</span>
                </button>
                <button
                  onClick={handleRegenerate}
                  className="bg-white/5 hover:bg-white/10 text-white/70 font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <RecursionWellIcon size={16} />
                  <span className="hidden sm:inline text-sm">Regenerate</span>
                </button>
                <button
                  onClick={onLogPractice}
                  className="bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                >
                  <AOSConfirm size={16} />
                  <span className="hidden sm:inline text-sm">Log</span>
                </button>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 flex gap-3">
                  <NigredoIcon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* HISTORY STEP */}
          {step === 'history' && (
            <div className="space-y-3">
              {generatedPractices.length === 0 ? (
                <div className="text-center py-8">
                  <LabyrinthPathIcon size={32} className="text-white/20 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">No practices generated yet</p>
                </div>
              ) : (
                generatedPractices.map((practice) => {
                  const modKey = practice.module as ModuleKey;
                  const cfg = MODULE_CONFIG[modKey] || MODULE_CONFIG.mind;
                  const { Icon } = cfg;
                  return (
                    <button
                      key={practice.id}
                      onClick={() => {
                        setCurrentPractice(practice);
                        audioBufferRef.current = null;
                        setPlaybackTime(0);
                        setDurationSeconds(0);
                        setStep('preview');
                      }}
                      className="w-full p-4 bg-white/5 hover:bg-white/8 rounded-lg border border-white/10 hover:border-white/20 transition text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Icon size={20} color="currentColor" className={cfg.accent} />
                          <div>
                            <p className="font-medium text-white/80 text-sm">{practice.title}</p>
                            <p className="text-xs text-white/30 mt-0.5">
                              {cfg.label} &middot; {practice.duration}m &middot; {new Date(practice.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <AscensionFlameIcon size={14} className="text-white/20 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-white/10 flex justify-end bg-slate-900/50">
          <button onClick={onClose} className="text-sm text-white/30 hover:text-white/60 transition">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
