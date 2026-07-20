import React, { useState, useEffect, useRef } from 'react';
import { SomaticPracticeSession, SomaticPacing, SomaticPreset, SafetyLevel, ValidationWarning, ValidationResult, SomaticPracticeType, IntegratedInsight, SomaticDraft } from '../../types.ts';
import { generateSomaticScript, validatePracticeContent } from '../../services/somaticPracticeService.ts';
import { generateAudioWithGemini, arrayBufferToBase64, base64ToArrayBuffer } from '../../services/geminiAudioService.ts';
import { generateInsightFromSession } from '../../services/insightGenerator.ts';
import { X, ArrowRight, Play, Pause, Download, ChevronDown, AlertTriangle } from 'lucide-react';
import SomaticPillarIcon from '../visualizations/SacredGeometryIcons/SomaticPillarIcon';
import PulseMatrixIcon from '../visualizations/SacredGeometryIcons/PulseMatrixIcon';
import AetherBreathIcon from '../visualizations/SacredGeometryIcons/AetherBreathIcon';
import { SOMATIC_PRESETS, PRACTICE_TYPES, practices } from '../../constants.ts';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { WizardFrame } from '../shared/WizardFrame';
import { useAuth } from '../../contexts/AuthContext.tsx';

type WizardStep = 'DEFINE' | 'GENERATING' | 'REVIEW' | 'REFLECTION' | 'HANDOFF';

interface SomaticGeneratorWizardProps {
  onClose: () => void;
  onSave: (session: SomaticPracticeSession) => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const FOCUS_AREAS = [
    "Whole Body", "Upper Body (shoulders, neck, arms)", "Lower Body (hips, legs, feet)",
    "Spine (back, core)", "Head & Face (jaw, eyes)", "Nervous System"
];

const PACING_OPTIONS: { value: SomaticPacing; label: string; }[] = [
    { value: 'slow', label: 'Slow & Gentle' },
    { value: 'moderate', label: 'Moderate Flow' },
    { value: 'fluid', label: 'Fluid & Continuous' },
    { value: 'dynamic', label: 'Dynamic & Energizing' },
];

const SafetyRating = ({ level }: { level?: SafetyLevel }) => {
  if (!level) return null;
  const config = {
    strong: { colorClass: 'text-emerald-400', label: 'Strong Evidence' },
    moderate: { colorClass: 'text-yellow-400', label: 'Moderate Evidence' },
    low: { colorClass: 'text-rose-400', label: 'Emerging / Low Evidence' }
  };
  const { colorClass, label } = config[level];
  return (
    <div className={`flex items-center gap-1 ${colorClass} text-xs mt-1`} role="img" aria-label={`Evidence level: ${label}`}>
      <AetherBreathIcon size={14} className={colorClass} />
      <span>{label}</span>
    </div>
  );
};

const PracticeTypeSelector = ({ 
    selected, 
    onSelect 
  }: { 
    selected: SomaticPracticeType; 
    onSelect: (type: SomaticPracticeType) => void;
  }) => {
    const [showInfo, setShowInfo] = useState<SomaticPracticeType | null>(null);
  
    return (
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Practice Type
          <button 
            onClick={(e) => {e.preventDefault(); setShowInfo(showInfo ? null : selected);}}
            className="ml-2 text-xs text-emerald-400 hover:text-emerald-300"
          >
            (What's this?)
          </button>
        </label>
        
        {showInfo && (
          <div className="mb-3 p-3 bg-neutral-900/50 border border-neutral-700 rounded-md text-xs text-slate-300 space-y-2 animate-fade-in">
            {PRACTICE_TYPES.find(pt => pt.name === showInfo) && (() => {
              const info = PRACTICE_TYPES.find(pt => pt.name === showInfo)!;
              return (
                <>
                  <p><strong>Description:</strong> {info.description}</p>
                  <p><strong>Primary Mechanism:</strong> {info.primaryMechanism}</p>
                  <p><strong>Best For:</strong> {info.bestFor.join(', ')}</p>
                  <p><strong>Evidence:</strong> {info.evidenceBase}</p>
                  {info.exampleTechniques && (
                    <p><strong>Techniques:</strong> {info.exampleTechniques.join(', ')}</p>
                  )}
                  {info.contraindications && info.contraindications.length > 0 && (
                      <p><strong className="text-red-300">Contraindications:</strong> {info.contraindications.join(', ')}</p>
                  )}
                </>
              );
            })()}
          </div>
        )}
  
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRACTICE_TYPES.map(pt => (
            <button
              key={pt.name}
              onClick={() => onSelect(pt.name)}
              className={`p-2 rounded-md text-sm font-medium transition text-left ${
                selected === pt.name 
                  ? 'bg-accent text-slate-900' 
                  : 'bg-neutral-700 text-slate-300 hover:bg-neutral-600'
              }`}
            >
              <div className="font-semibold">{pt.name}</div>
              <div className="text-xs opacity-75 mt-1">{pt.bestFor[0]}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

// Smart suggestion based on intention keywords
function suggestPracticeType(intention: string): SomaticPracticeType | null {
    const lower = intention.toLowerCase();
    
    if (/(anxiety|nervous|calm|stress|worry)/i.test(lower)) {
      if (/breath/i.test(lower)) return 'Breath-Centered';
      return 'Grounding & Stability';
    }
    
    if (/(tension|tight|stiff|sore|release)/i.test(lower)) {
      return 'Gentle Movement';
    }
    
    if (/(sleep|rest|relax|wind down)/i.test(lower)) {
      return 'Progressive Relaxation';
    }
    
    if (/(energy|awaken|vital|invigorate)/i.test(lower)) {
      return 'Dynamic Activation';
    }
    
    if (/(balance|focus|mindful|meditate|flow)/i.test(lower)) {
      return 'Mindful Flow';
    }
    
    return null; // No strong suggestion
}

export default function SomaticGeneratorWizard({ onClose, onSave, insightContext, markInsightAsAddressed }: SomaticGeneratorWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>('DEFINE');
  const [showPresets, setShowPresets] = useState(true);

  // Form State
  const [intention, setIntention] = useState('');
  const [practiceType, setPracticeType] = useState<SomaticPracticeType>('Gentle Movement'); // Changed from 'style'
  const [duration, setDuration] = useState(10);
  const [focusArea, setFocusArea] = useState('Whole Body');
  const [pacing, setPacing] = useState<SomaticPacing>('slow');
  const [selectedPreset, setSelectedPreset] = useState<SomaticPreset | null>(null); // To display preset info
  const [suggestedType, setSuggestedType] = useState<SomaticPracticeType | null>(null);

  // Integration & Handoff State
  const [bodyNoticing, setBodyNoticing] = useState('');
  const [willCarryForward, setWillCarryForward] = useState('');

  // Generation & Playback State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [practice, setPractice] = useState<SomaticPracticeSession | null>(null);
  const [audioBase64, setAudioBase64] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null); // NEW for validation
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(insightContext?.id);

  // Draft persistence
  const DRAFT_KEY = 'aura-somatic-generator-draft';
  const DRAFT_INITIAL: SomaticDraft = { intention: '', practiceType: 'Gentle Movement', duration: 10, focusArea: 'Whole Body', pacing: 'slow' };
  const [draft, updateDraft, , clearDraft] = useWizardDraft<SomaticDraft>(DRAFT_KEY, DRAFT_INITIAL);

  // Refs for audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext, linkedInsightId]);

  useEffect(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return () => { // Cleanup audio on unmount
      audioSourceRef.current?.stop();
      audioSourceRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (intention.length > 20) { // Only suggest after substantial input
      const newSuggestedType = suggestPracticeType(intention);
      if (newSuggestedType && newSuggestedType !== practiceType) {
        setSuggestedType(newSuggestedType);
      } else {
        setSuggestedType(null); // Clear suggestion if it matches or is null
      }
    } else {
      setSuggestedType(null); // Clear suggestion for short intentions
    }
  }, [intention, practiceType]);

  // Restore draft state on mount
  useEffect(() => {
    if (draft && step === 'DEFINE') {
      if (draft.intention) setIntention(draft.intention);
      if (draft.practiceType) setPracticeType(draft.practiceType);
      if (draft.duration) setDuration(draft.duration);
      if (draft.focusArea) setFocusArea(draft.focusArea);
      if (draft.pacing) setPacing(draft.pacing);
    }
  }, []); // run once on mount only

  // Auto-save DEFINE state
  useEffect(() => {
    if (step === 'DEFINE') {
      updateDraft({ intention, practiceType, duration, focusArea, pacing });
    }
  }, [intention, practiceType, duration, focusArea, pacing, step]);

  const handlePresetSelect = (preset: SomaticPreset) => {
    setIntention(preset.intention);
    setPracticeType(preset.practiceType); // Changed from setStyle
    setDuration(preset.duration);
    setFocusArea(preset.focusArea || 'Whole Body');
    setPacing(preset.pacing || 'slow');
    setSelectedPreset(preset); // Store the selected preset for info display
    setShowPresets(false);
    setSuggestedType(null); // Clear suggestion when a preset is selected
  };

  const handleGenerateScript = async () => {
    if (!intention.trim()) {
      setError('Please define your intention for the practice.');
      return;
    }
    setError('');
    setIsLoading(true);
    setStep('GENERATING');
    setValidationResult(null); // Clear previous validation results
    try {
      const scriptData = await generateSomaticScript(intention, practiceType, duration, focusArea, pacing);
      
      const fullScriptText = scriptData.script.map(s => s.instruction).join(' ');
      const validation = validatePracticeContent(fullScriptText);
      setValidationResult(validation);

      const newPractice: SomaticPracticeSession = {
        id: `somatic-${Date.now()}`,
        date: new Date().toISOString(),
        title: scriptData.title,
        intention,
        practiceType, // Changed from style
        duration,
        script: scriptData.script,
        focusArea,
        pacing,
        safetyNotes: scriptData.safety_notes, // Store AI-generated safety notes
        validationWarnings: validation.warnings, // Store validation warnings
      };
      setPractice(newPractice);
      setStep('REVIEW');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate script.");
      setStep('DEFINE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!practice) return;
    setIsLoading(true);
    setError('');
    setAudioError(null);
    try {
      const fullScriptText = practice.script.map(s => s.instruction).join('\n\n');

      // Generate audio using Gemini 2.5 Flash TTS
      // Using default "Kore" voice (calm, therapeutic tone)
      const audioBuffer = await generateAudioWithGemini(fullScriptText, { voiceName: 'Kore' });

      // Convert to base64 for storage
      const base64 = arrayBufferToBase64(audioBuffer);
      setAudioBase64(base64);
    } catch(e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to generate audio.";
      setAudioError(errorMsg);
      console.error('[SomaticGenerator] Audio generation error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!audioBase64 || !audioContextRef.current) return;
    if (isPlaying && audioSourceRef.current) {
        audioSourceRef.current.stop();
        setIsPlaying(false);
        return;
    }
    const audioCtx = audioContextRef.current;

    // Decode base64 to ArrayBuffer (Gemini returns proper audio format)
    const audioArrayBuffer = base64ToArrayBuffer(audioBase64);
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    audioSourceRef.current = source;
    setIsPlaying(true);
  };
  
  const handleDownload = () => {
    if (!audioBase64 || !practice) return;

    // Gemini returns proper audio format, just decode and download
    const audioArrayBuffer = base64ToArrayBuffer(audioBase64);
    const blob = new Blob([audioArrayBuffer], { type: 'audio/wav' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${practice.title.replace(/\s+/g, '_')}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!practice) return;

    const session = { ...practice, linkedInsightId };
    onSave(session);

    // Generate insight asynchronously — never block save on AI failure
    try {
      const availablePractices = Object.values(practices).flatMap((category) =>
        Array.isArray(category) ? category.map((p) => ({ id: p.id, name: p.name })) : [],
      );

      await generateInsightFromSession({
        wizardType: 'Somatic Practice',
        sessionId: practice.id,
        sessionName: `Somatic Practice — ${practice.title}`,
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
        sessionReport: [
          `Intention: ${practice.intention}.`,
          `Practice type: ${practice.practiceType}.`,
          `Focus area: ${practice.focusArea}.`,
          `Duration: ${practice.duration} minutes.`,
          `Pacing: ${practice.pacing}.`,
          bodyNoticing ? `Body noticing after practice: ${bodyNoticing}` : '',
          willCarryForward ? `What user will carry forward: ${willCarryForward}` : '',
        ].filter(Boolean).join(' '),
        sessionSummary: willCarryForward || `Completed ${practice.duration}-minute somatic practice.`,
        userId: user?.id || 'anonymous',
        availablePractices,
      });
    } catch (err) {
      console.warn('[SomaticGenerator] Insight generation failed (non-blocking):', err);
    }

    if (linkedInsightId) {
      markInsightAsAddressed(linkedInsightId, 'Somatic Generator', practice.id || '');
    }
    clearDraft();
    onClose();
  };

  const renderContent = () => {
    switch(step) {
      case 'DEFINE':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-neutral-900/40 border border-neutral-700 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-slate-300">
                <p className="font-semibold mb-2">What is an "Intention" for Somatic Practice?</p>
                <p>It's your desired inner state or physical outcome. Instead of just "exercise," think about what you want to **feel** or **release**. Examples: "To feel more grounded," "to release tension in my neck," "to cultivate energetic flow."</p>
            </div>

            <div>
                <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3 hover:text-slate-100"
                >
                    <ChevronDown size={16} className={`transition ${showPresets ? 'rotate-0' : '-rotate-90'}`} />
                    Intention Presets
                </button>
                {showPresets && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {SOMATIC_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => handlePresetSelect(preset)}
                                className="p-3 bg-neutral-700/50 hover:bg-neutral-700 rounded-lg border border-neutral-600 hover:border-accent transition text-left"
                            >
                                <p className="text-sm font-medium text-slate-200">{preset.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                                <SafetyRating level={preset.evidenceLevel} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedPreset && (
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-md p-4 text-sm text-emerald-200 space-y-2 animate-fade-in">
                    <p className="font-bold">{selectedPreset.name} Preset Details:</p>
                    <p>{selectedPreset.description}</p>
                    {selectedPreset.evidenceLevel && <SafetyRating level={selectedPreset.evidenceLevel} />}
                    {selectedPreset.contraindications && selectedPreset.contraindications.length > 0 && (
                        <div>
                            <p className="font-semibold text-red-300 flex items-center gap-1"><AlertTriangle size={14}/> Contraindications:</p>
                            <ul className="list-disc list-inside ml-4">
                                {selectedPreset.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    )}
                    {selectedPreset.safetyNotes && selectedPreset.safetyNotes.length > 0 && (
                        <div>
                            <p className="font-semibold text-yellow-300 flex items-center gap-1"><AetherBreathIcon size={14} className="text-yellow-300" /> Specific Safety Notes:</p>
                            <ul className="list-disc list-inside ml-4">
                                {selectedPreset.safetyNotes.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {selectedPreset.citations && selectedPreset.citations.length > 0 && (
                        <div>
                            <p className="font-semibold text-emerald-300 flex items-center gap-1"><AetherBreathIcon size={14} className="text-emerald-300" /> Citations:</p>
                            <ul className="list-disc list-inside ml-4 text-xs">
                                {selectedPreset.citations.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Specific Intention</label>
                <textarea value={intention} onChange={e => setIntention(e.target.value)} rows={3} placeholder="e.g., 'To feel more grounded and release tension in my shoulders'" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>

            {suggestedType && suggestedType !== practiceType && (
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-md p-3 flex items-start gap-2 animate-fade-in">
                    <AetherBreathIcon size={16} className="text-emerald-400 mt-0.5" />
                    <div className="flex-1 text-sm text-emerald-200">
                        <p>Based on your intention, <strong>{suggestedType}</strong> might work well.</p>
                        <button 
                            onClick={() => setPracticeType(suggestedType)}
                            className="mt-1 text-xs underline hover:text-emerald-100"
                        >
                            Use this suggestion
                        </button>
                    </div>
                    <button onClick={() => setSuggestedType(null)} className="text-emerald-400 hover:text-emerald-300">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div>
                <PracticeTypeSelector selected={practiceType} onSelect={setPracticeType} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Focus Area</label>
                <select value={focusArea} onChange={e => setFocusArea(e.target.value)} className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent text-slate-100">
                    {FOCUS_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pacing</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PACING_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPacing(opt.value)}
                        aria-pressed={pacing === opt.value}
                        className={`p-2 rounded-md text-sm font-medium transition min-h-[44px] ${pacing === opt.value ? 'bg-accent text-slate-900' : 'bg-neutral-700 text-slate-300 hover:bg-neutral-600'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration: {duration} minutes</label>
                <input type="range" min="5" max="30" step="5" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-accent" />
            </div>
          </div>
        );
      case 'GENERATING':
          return (
              <div className="text-center py-12" role="status" aria-live="polite" aria-label="Generating your somatic practice">
                  <PulseMatrixIcon size={48} className="mx-auto text-emerald-400 animate-pulse" />
                  <h3 className="text-lg font-semibold font-mono mt-4 text-emerald-400">Generating Your Practice...</h3>
                  <p className="text-slate-400 text-sm mt-2">Crafting precise, spatially-aware instructions.</p>
              </div>
          );
      case 'REFLECTION':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
              <h3 className="font-serif text-lg text-emerald-200 mb-2">Reflection</h3>
              <p className="text-sm text-slate-300">
                Take a moment to notice what has shifted. Integration is how the practice lands in your body and life.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What do you notice in your body right now?
              </label>
              <textarea
                value={bodyNoticing}
                onChange={e => setBodyNoticing(e.target.value)}
                rows={3}
                placeholder="e.g., 'My shoulders feel softer. There's a warmth in my chest I didn't notice before.'"
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-100 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What will you carry forward from this practice?
              </label>
              <textarea
                value={willCarryForward}
                onChange={e => setWillCarryForward(e.target.value)}
                rows={3}
                placeholder="e.g., 'The sense of ground beneath me. A reminder to breathe before reacting.'"
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
        );
      case 'HANDOFF':
        const getRecommendedPractices = () => {
          const recommendations = [];

          // Base recommendations for all users
          recommendations.push(
            { name: 'Meditation', desc: 'Settle the stillness you cultivated into mindful awareness', module: 'Body', id: 'meditation' }
          );

          // Conditional on pacing
          if (pacing === 'slow') {
            recommendations.push(
              { name: 'Bioenergetics', desc: 'Release stored tension through gentle expressive movement', module: 'Body', id: 'bioenergetics' }
            );
          } else if (pacing === 'dynamic') {
            recommendations.push(
              { name: 'IFS Session', desc: 'Bring somatic awareness into parts-based inner work', module: 'Shadow', id: 'ifs' }
            );
          } else {
            // Moderate or fluid pacing
            recommendations.push(
              { name: 'Interoception', desc: 'Deepen body-signal awareness with structured check-ins', module: 'Body', id: 'interoception' }
            );
          }

          return recommendations;
        };

        const recommendations = getRecommendedPractices();

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
              <h3 className="font-serif text-lg text-emerald-200 mb-2">Next Steps</h3>
              <p className="text-sm text-slate-300">
                Based on your <strong>{pacing}</strong> pacing, here are complementary practices to deepen what you've explored today.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map(p => (
                <div key={p.id} className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                      <p className="text-xs text-emerald-300 mt-2">
                        {pacing === 'slow' && p.id === 'bioenergetics' && '→ Complements slow, grounded work'}
                        {pacing === 'dynamic' && p.id === 'ifs' && '→ Pairs well with energizing movement'}
                        {(pacing === 'moderate' || pacing === 'fluid') && p.id === 'interoception' && '→ Natural next step for flowing practices'}
                        {p.id === 'meditation' && '→ Grounds any somatic work'}
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{p.module}</span>
                  </div>
                </div>
              ))}
            </div>
            {(bodyNoticing || willCarryForward) && (
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Integration Notes</p>
                {bodyNoticing && <p className="text-sm text-slate-300"><span className="text-emerald-400">Body: </span>{bodyNoticing}</p>}
                {willCarryForward && <p className="text-sm text-slate-300"><span className="text-emerald-400">Carrying forward: </span>{willCarryForward}</p>}
              </div>
            )}
          </div>
        );
      case 'REVIEW':
          return practice && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-emerald-400">{practice.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300">
                    <div><span className="text-slate-400">Intention:</span> {practice.intention}</div>
                    <div><span className="text-slate-400">Practice Type:</span> {practice.practiceType}</div>
                    <div><span className="text-slate-400">Duration:</span> {practice.duration} min</div>
                    <div><span className="text-slate-400">Focus Area:</span> {practice.focusArea}</div>
                    <div><span className="text-slate-400">Pacing:</span> {practice.pacing}</div>
                </div>

                {validationResult && !validationResult.isValid && (
                    <div
                      className="bg-red-900/30 border border-red-700 rounded-lg p-4 space-y-2 animate-fade-in"
                      role="alert"
                      aria-label="Content warnings detected in generated practice"
                    >
                        <p className="font-bold text-red-300 flex items-center gap-2"><AlertTriangle size={20}/> Content Warnings Detected!</p>
                        <p className="text-sm text-red-200">Aura found some potentially unscientific or overpromising language. Please review the suggestions before proceeding or regenerating.</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-red-100">
                            {validationResult.warnings.map((warning, i) => (
                                <li key={i} className="text-xs">
                                    <span className="font-semibold">{warning.type}:</span> {warning.issue}. <span className="italic">Suggestion: "{warning.suggestion}"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700 max-h-64 overflow-y-auto">
                    {practice.script.map((segment, i) => (
                        <p key={i} className="text-slate-300 mb-3 text-sm leading-relaxed">{segment.instruction} <span className="text-slate-500 text-xs">({segment.duration_seconds}s)</span></p>
                    ))}
                </div>

                {practice.safetyNotes && practice.safetyNotes.length > 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-sm text-yellow-200 space-y-1">
                        <p className="font-bold flex items-center gap-2"><AetherBreathIcon size={16} className="text-yellow-300" /> General Safety Notes:</p>
                        <ul className="list-disc list-inside ml-4">
                            {practice.safetyNotes.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                      <button onClick={handleGenerateAudio} disabled={isLoading} className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition ${audioBase64 ? 'bg-neutral-700 hover:bg-neutral-600' : 'btn-luminous'}`}>{isLoading ? 'Generating Audio...' : audioBase64 ? 'Re-generate Audio' : 'Generate Guided Audio'}</button>
                      {audioBase64 && <>
                          <button onClick={togglePlayback} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md">{isPlaying ? <Pause size={20}/> : <Play size={20}/>}</button>
                          <button onClick={handleDownload} className="bg-neutral-600 hover:bg-neutral-700 text-white p-2 rounded-md"><Download size={20}/></button>
                      </>}
                  </div>

                  {audioError && (
                    <div className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg">
                      <p className="text-amber-300 text-sm mb-2">
                        Audio guidance unavailable
                      </p>
                      <button
                        onClick={() => {
                          setAudioError(null);
                          setStep('REFLECTION');
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition"
                      >
                        Continue Without Audio
                      </button>
                    </div>
                  )}
                </div>
              </div>
          );
    }
  };

  const STEP_INDEX: Record<WizardStep, number> = {
    DEFINE: 0,
    GENERATING: 0,
    REVIEW: 1,
    REFLECTION: 2,
    HANDOFF: 3,
  };

  const NEXT_BUTTON_TEXT: Partial<Record<WizardStep, string>> = {
    DEFINE: 'Generate Practice',
    REVIEW: 'Continue to Reflection',
    REFLECTION: 'See Next Steps',
    HANDOFF: 'Save & Complete',
  };

  const handleNext = () => {
    if (step === 'DEFINE') { handleGenerateScript(); return; }
    if (step === 'REVIEW') { setStep('REFLECTION'); return; }
    if (step === 'REFLECTION') { setStep('HANDOFF'); return; }
    if (step === 'HANDOFF') { handleSave(); return; }
  };

  const handleBack = () => {
    if (step === 'REVIEW') { setStep('DEFINE'); return; }
    if (step === 'REFLECTION') { setStep('REVIEW'); return; }
    if (step === 'HANDOFF') { setStep('REFLECTION'); return; }
  };

  return (
    <WizardFrame
      title="Somatic Practice Generator"
      currentStep={STEP_INDEX[step]}
      totalSteps={4}
      isLoading={isLoading}
      showBackButton={step !== 'DEFINE' && step !== 'GENERATING'}
      nextButtonText={NEXT_BUTTON_TEXT[step]}
      nextButtonDisabled={step === 'DEFINE' && !intention.trim()}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="emerald"
      errorMessage={error || undefined}
    >
      {insightContext && (
        <div className="mb-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-emerald-200">
            <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
          </p>
        </div>
      )}
      {renderContent()}
    </WizardFrame>
  );
}