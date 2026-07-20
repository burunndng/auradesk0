
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ThreeTwoOneSession, IntegratedInsight, FaceItAnalysis,
  DialogueEntry, EmbodimentAnalysis, IntegrationPlan
} from '../../types.ts';
import { Eye, Ear, Hand, ArrowRight, Save, ChevronRight, X, AlertTriangle, Info, Loader2 } from 'lucide-react';
import {
  summarizeThreeTwoOneSession, generateSocraticProbe,
  generateReflectiveProbe, generateShadowGift, generateWatchFor,
  generatePhasedSocraticProbe, generateDialogueOpeners,
} from '../../services/aiService.ts';
import type { WizardSequenceContext } from '../../services/wizardSequenceContext.ts';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import VoidBloomIcon from '../visualizations/SacredGeometryIcons/VoidBloomIcon';
import SeedOfLifeIcon from '../visualizations/SacredGeometryIcons/SeedOfLifeIcon';
import EnsoTriunityIcon from '../visualizations/SacredGeometryIcons/EnsoTriunityIcon';
import SomaticPillarIcon from '../visualizations/SacredGeometryIcons/SomaticPillarIcon';

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = 'ONBOARDING' | 'TRIGGER' | 'FACE_IT' | 'TALK_TO_IT' | 'BE_IT' | 'INTEGRATE' | 'SUMMARY';

const STEPS: { id: Step; label: string; sub: string }[] = [
  { id: 'ONBOARDING',  label: 'The Process',  sub: 'orientation'  },
  { id: 'TRIGGER',     label: 'The Trigger',   sub: '3 · recall'   },
  { id: 'FACE_IT',     label: 'Face It',       sub: '3 · observe'  },
  { id: 'TALK_TO_IT',  label: 'Talk to It',    sub: '2 · dialogue' },
  { id: 'BE_IT',       label: 'Be It',         sub: '1 · embody'   },
  { id: 'INTEGRATE',   label: 'Synthesis',     sub: 'integration'  },
  { id: 'SUMMARY',     label: 'Portrait',      sub: 'artifact'     },
];

function stepIdx(s: Step) { return STEPS.findIndex(x => x.id === s); }

// ─── Shared micro-components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</div>;
}

function FieldTextarea({
  label, value, onChange, placeholder, rows = 3, disabled, hint
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; disabled?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <SectionLabel>{label}</SectionLabel>}
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-stone-950/80 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 resize-none transition-all duration-150 disabled:opacity-40"
      />
      {hint && <div className="text-xs text-stone-600 italic">{hint}</div>}
    </div>
  );
}

function FieldInput({
  label, value, onChange, placeholder, disabled, autoFocus
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; autoFocus?: boolean;
}) {
  return (
    <div className="space-y-2">
      {label && <SectionLabel>{label}</SectionLabel>}
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-stone-950/80 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all duration-150 disabled:opacity-40"
      />
    </div>
  );
}

function IntensitySlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <SectionLabel>{label}</SectionLabel>
        <span className={`text-sm font-mono font-bold ${value >= 7 ? 'text-red-400' : 'text-amber-400'}`}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-amber-500"
      />
      <div className="flex justify-between text-[10px] text-stone-600">
        <span>minimal</span><span>overwhelming</span>
      </div>
    </div>
  );
}

function AiCard({ text, label = 'MIRROR' }: { text: string; label?: string }) {
  return (
    <div className="bg-gradient-to-br from-amber-950/20 to-stone-900/60 border border-amber-500/15 rounded-xl p-5">
      <SectionLabel>{label}</SectionLabel>
      <p className="text-sm text-stone-300 leading-relaxed italic">{text}</p>
    </div>
  );
}

function AiThinking({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Loader2 size={14} className="text-amber-500/60 animate-spin shrink-0" />
      <span className="text-xs font-bold uppercase tracking-widest text-amber-500/60">{label}</span>
    </div>
  );
}

function WarningBanner({ variant, children }: { variant: 'info' | 'danger'; children: React.ReactNode }) {
  const Icon = variant === 'danger' ? AlertTriangle : Info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
      variant === 'danger'
        ? 'bg-purple-950/30 border-purple-500/30 text-purple-300'
        : 'bg-amber-950/20 border-amber-500/20 text-stone-300'
    }`}>
      <Icon size={16} className={`${variant === 'danger' ? 'text-purple-400' : 'text-amber-500'} shrink-0 mt-0.5`} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StuckLink({ onHelp }: { onHelp: () => void }) {
  return (
    <button onClick={onHelp} className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-300 transition-colors mt-1">
      I can't find words — let the mirror help
    </button>
  );
}

function DialogueDepth({ count }: { count: number }) {
  const phase = count < 2 ? 'Opening' : count < 4 ? 'Exploring' : count < 6 ? 'Nearing the gift' : 'Gift territory';
  const ready = count >= 2;
  return (
    <div className="flex items-center gap-3 text-xs mt-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${count >= i ? 'bg-violet-400' : 'bg-stone-800'}`} />
        ))}
      </div>
      <span className={count >= 5 ? 'text-emerald-400' : count >= 2 ? 'text-violet-400' : 'text-stone-500'}>{phase}</span>
      {ready && <span className="text-stone-600">· ready to continue</span>}
    </div>
  );
}


// ─── Props ────────────────────────────────────────────────────────────────────

interface ThreeTwoOneWizardProps {
  onClose: () => void;
  onSave: (session: ThreeTwoOneSession) => void;
  session: Partial<ThreeTwoOneSession> | null;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, shadowToolType: string, shadowSessionId: string) => void;
  sequenceContext?: WizardSequenceContext | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ThreeTwoOneWizard({
  onClose, onSave, session: initialSession, insightContext, markInsightAsAddressed,
}: ThreeTwoOneWizardProps) {
  const [session, updateSession, , clearDraft] = useWizardDraft<Partial<ThreeTwoOneSession>>(
    'aura-draft-321', initialSession || {}
  );

  const [step, setStep] = useState<Step>(() => {
    const s = initialSession;
    if (!s?.trigger) return 'ONBOARDING';
    if (!s?.faceItAnalysis) return 'FACE_IT';
    if (!s?.dialogueTranscript?.length) return 'TALK_TO_IT';
    if (!s?.embodimentAnalysis) return 'BE_IT';
    if (!s?.integrationPlan) return 'INTEGRATE';
    return 'SUMMARY';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProbe, setIsLoadingProbe] = useState(false);

  const [faceItAnalysis, setFaceItAnalysis] = useState<Partial<FaceItAnalysis>>(
    initialSession?.faceItAnalysis || { intensityRating: 5 }
  );
  const [dialogueTranscript, setDialogueTranscript] = useState<DialogueEntry[]>(
    initialSession?.dialogueTranscript || []
  );
  const [embodimentAnalysis, setEmbodimentAnalysis] = useState<Partial<EmbodimentAnalysis>>(
    initialSession?.embodimentAnalysis || { intensityRating: 5 }
  );
  const [integrationPlan, setIntegrationPlan] = useState<Partial<IntegrationPlan>>(
    initialSession?.integrationPlan || {}
  );

  const [faceItProbe, setFaceItProbe] = useState(initialSession?.faceItProbe || '');
  const [beItSomaticPrompt, setBeItSomaticPrompt] = useState(initialSession?.beItSomaticPrompt || '');
  const [dialogueInput, setDialogueInput] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [initialIntensity, setInitialIntensity] = useState(initialSession?.initialIntensity || 5);
  const [dialogueOpeners, setDialogueOpeners] = useState<string[]>([
    'What do you want for me?', 'Why are you here?', 'What are you trying to protect?'
  ]);
  const [faceItStuckMode, setFaceItStuckMode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const exchangeCount = dialogueTranscript.filter(e => e.role === 'user').length;
  const intensityDelta = embodimentAnalysis.intensityRating
    ? embodimentAnalysis.intensityRating - initialIntensity : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueTranscript]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const setSessionField = (field: keyof ThreeTwoOneSession, value: unknown) =>
    updateSession({ [field]: value });

  const getDialoguePhase = (): 'opening' | 'exploring' | 'approaching' | 'gift' => {
    if (exchangeCount < 2) return 'opening';
    if (exchangeCount < 4) return 'exploring';
    if (exchangeCount < 6) return 'approaching';
    return 'gift';
  };

  // ─── Dialogue handler ───────────────────────────────────────────────────────
  const handleDialogueSubmit = async (msg: string) => {
    if (!msg.trim()) return;
    const detected = detectCrisisLevel(msg);
    setCrisisLevel(detected);

    const updated = [...dialogueTranscript, { role: 'user' as const, text: msg }];
    setDialogueTranscript(updated);
    setDialogueInput('');

    if (detected === 'high') return;

    setIsLoadingProbe(true);
    try {
      const resp = await generatePhasedSocraticProbe(updated, session?.trigger || '', getDialoguePhase());
      setDialogueTranscript(prev => [...prev, { role: 'bot', text: resp }]);
    } catch {
      try {
        const fb = await generateSocraticProbe(updated, session?.trigger || '');
        setDialogueTranscript(prev => [...prev, { role: 'bot', text: fb }]);
      } catch {
        setDialogueTranscript(prev => [...prev, {
          role: 'bot',
          text: `I received that. There is more here than words can hold. What question would you ask me if you weren't afraid of the answer?`
        }]);
      }
    } finally {
      setIsLoadingProbe(false);
    }
  };

  // ─── AI helpers ─────────────────────────────────────────────────────────────
  const fetchFaceItProbe = useCallback(async () => {
    if (isLoadingProbe || faceItProbe) return;
    setIsLoadingProbe(true);
    try {
      const probe = await generateReflectiveProbe('FACE_IT', faceItAnalysis, session?.trigger || '');
      setFaceItProbe(probe);
      updateSession({ faceItProbe: probe });
    } catch {
      const fallback = `You describe ${session?.trigger || 'this quality'} emerging in response to ${faceItAnalysis.triggeredEmotions?.join(' and ')}. Notice: is there any situation in your own life where you have acted from a similar place?`;
      setFaceItProbe(fallback);
    } finally {
      setIsLoadingProbe(false);
    }
  }, [faceItAnalysis, session?.trigger, faceItProbe, isLoadingProbe]);

  const fetchBeItPrompt = useCallback(async () => {
    if (isLoadingProbe || beItSomaticPrompt) return;
    setIsLoadingProbe(true);
    try {
      const prompt = await generateReflectiveProbe('BE_IT', embodimentAnalysis, session?.trigger || '');
      setBeItSomaticPrompt(prompt);
      updateSession({ beItSomaticPrompt: prompt });
    } catch {
      const fallback = `You have spoken as ${session?.trigger || 'the quality'}. Now let that voice settle. Where in your body does its energy still live? Place one hand there, and breathe into it for three cycles.`;
      setBeItSomaticPrompt(fallback);
    } finally {
      setIsLoadingProbe(false);
    }
  }, [embodimentAnalysis, session?.trigger, beItSomaticPrompt, isLoadingProbe]);

  // Auto-fetch probes when fields are populated
  useEffect(() => {
    if (step === 'FACE_IT' && faceItAnalysis.objectiveDescription && faceItAnalysis.triggeredEmotions?.length && !faceItProbe && !isLoadingProbe) {
      const t = setTimeout(fetchFaceItProbe, 1200);
      return () => clearTimeout(t);
    }
  }, [step, faceItAnalysis.objectiveDescription, faceItAnalysis.triggeredEmotions]);

  useEffect(() => {
    if (step === 'BE_IT' && embodimentAnalysis.embodimentStatement && !beItSomaticPrompt && !isLoadingProbe) {
      const t = setTimeout(fetchBeItPrompt, 1500);
      return () => clearTimeout(t);
    }
  }, [step, embodimentAnalysis.embodimentStatement]);

  useEffect(() => {
    if (step === 'TALK_TO_IT' && session?.trigger && dialogueTranscript.length === 0) {
      generateDialogueOpeners(session.trigger).then(setDialogueOpeners).catch(() => {});
    }
  }, [step, session?.trigger]);

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = async () => {
    switch (step) {
      case 'ONBOARDING': setStep('TRIGGER'); break;
      case 'TRIGGER':
        updateSession({ trigger: session?.trigger, triggerSituation: session?.triggerSituation, initialIntensity });
        setStep('FACE_IT');
        break;
      case 'FACE_IT':
        if (!faceItProbe) await fetchFaceItProbe();
        updateSession({ faceItAnalysis: faceItAnalysis as FaceItAnalysis });
        setStep('TALK_TO_IT');
        break;
      case 'TALK_TO_IT':
        if (exchangeCount < 2) return;
        updateSession({ dialogueTranscript, dialogueDepth: exchangeCount });
        setStep('BE_IT');
        break;
      case 'BE_IT':
        if (!beItSomaticPrompt) await fetchBeItPrompt();
        updateSession({ embodimentAnalysis: embodimentAnalysis as EmbodimentAnalysis });
        setStep('INTEGRATE');
        break;
      case 'INTEGRATE': {
        if (!integrationPlan.reowningStatement) return;
        setIsLoading(true);
        const finalData: ThreeTwoOneSession = {
          id: session?.id || `321-${Date.now()}`,
          date: session?.date || new Date().toISOString(),
          trigger: session?.trigger || '',
          triggerDescription: session?.triggerDescription || '',
          triggerSituation: session?.triggerSituation,
          dialogue: session?.dialogue || '',
          embodiment: session?.embodiment || '',
          integration: integrationPlan.reowningStatement || '',
          faceItAnalysis: faceItAnalysis as FaceItAnalysis,
          dialogueTranscript,
          embodimentAnalysis: embodimentAnalysis as EmbodimentAnalysis,
          integrationPlan: integrationPlan as IntegrationPlan,
          dialogueDepth: exchangeCount,
          initialIntensity,
          faceItProbe,
          beItSomaticPrompt,
          linkedInsightId: session?.linkedInsightId,
        };
        try {
          const [summary, shadowGift, watchFor] = await Promise.all([
            summarizeThreeTwoOneSession(finalData),
            generateShadowGift(finalData).catch(() => `The capacity for ${session?.trigger} in its fullest expression belongs to you.`),
            generateWatchFor(finalData).catch(() => `Watch for moments when ${session?.trigger} appears in others and notice your internal response.`),
          ]);
          updateSession({ ...finalData, aiSummary: summary, shadowGift, watchFor });
        } catch {
          const fallback = `You moved from observer of ${session?.trigger || 'this quality'} to embodying it — and found within it the gift of ${integrationPlan.reowningStatement}. This is shadow work in its truest form: not conquering the darkness, but retrieving what was cast into it.`;
          updateSession({ ...finalData, aiSummary: fallback, shadowGift: integrationPlan.giftClaimed || 'wholeness', watchFor: `Notice ${session?.trigger} arising in others as a mirror of your own disowned capacity.` });
        } finally {
          setIsLoading(false);
          setStep('SUMMARY');
        }
        break;
      }
      case 'SUMMARY': {
        const toSave: ThreeTwoOneSession = {
          id: session?.id || `321-${Date.now()}`,
          date: session?.date || new Date().toISOString(),
          trigger: session?.trigger || '',
          triggerDescription: session?.triggerDescription || '',
          dialogue: session?.dialogue || '',
          embodiment: session?.embodiment || '',
          integration: integrationPlan.reowningStatement || '',
          faceItAnalysis: faceItAnalysis as FaceItAnalysis,
          dialogueTranscript,
          embodimentAnalysis: embodimentAnalysis as EmbodimentAnalysis,
          integrationPlan: integrationPlan as IntegrationPlan,
          aiSummary: session?.aiSummary,
          shadowGift: session?.shadowGift,
          watchFor: session?.watchFor,
          dialogueDepth: exchangeCount,
          initialIntensity,
          faceItProbe,
          beItSomaticPrompt,
          linkedInsightId: session?.linkedInsightId,
        };
        onSave(toSave);
        if (toSave.linkedInsightId) {
          markInsightAsAddressed(toSave.linkedInsightId, '3-2-1 Process', toSave.id);
        }
        clearDraft();
        break;
      }
    }
  };

  const handleBack = () => {
    const idx = stepIdx(step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 'TRIGGER': return !!(session?.trigger?.trim());
      case 'FACE_IT': return !!(faceItAnalysis.objectiveDescription?.trim());
      case 'TALK_TO_IT': return exchangeCount >= 2;
      case 'BE_IT': return !!(embodimentAnalysis.embodimentStatement?.trim());
      case 'INTEGRATE': return !!(integrationPlan.reowningStatement?.trim());
      default: return true;
    }
  };

  const footerButtonLabel = () => {
    if (step === 'SUMMARY') return 'save';
    if (step === 'INTEGRATE') return 'synthesise';
    return 'continue';
  };


  // ─── Rendering ──────────────────────────────────────────────────────────────

  const marginalia = (
    <div className="mt-auto space-y-4 pt-6 border-t border-stone-800/60">
      {session?.trigger && (
        <div className="space-y-1">
          <SectionLabel>The Shadow</SectionLabel>
          <div className="text-sm font-serif text-stone-200">{session.trigger}</div>
        </div>
      )}
      {integrationPlan.reowningStatement && (
        <div className="space-y-1">
          <SectionLabel>Integration</SectionLabel>
          <div className="text-xs text-stone-400 italic leading-relaxed truncate">"{integrationPlan.reowningStatement}"</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col lg:flex-row text-stone-300">
      {/* GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5 z-10">
        <div className="flex items-center gap-3 mb-10">
          <VoidBloomIcon className="text-violet-400/80" size={24} />
          <div>
            <SectionLabel>Shadow Tool</SectionLabel>
            <h2 className="text-lg font-serif font-light text-stone-200 leading-tight">3-2-1 Process</h2>
          </div>
        </div>
        
        <div className="space-y-1">
          {STEPS.slice(0, 6).map((s, i) => {
            const isActive = s.id === step;
            const isDone = stepIdx(s.id) < stepIdx(step);
            return (
              <div key={s.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isActive ? 'bg-amber-500/10 border border-amber-500/20' : ''
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : isDone ? 'bg-amber-600/50' : 'bg-stone-800'}`} />
                <span className={`text-sm ${isActive ? 'text-amber-300 font-medium' : isDone ? 'text-stone-500' : 'text-stone-700'}`}>{s.sub}</span>
              </div>
            );
          })}
        </div>
        {marginalia}
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0 bg-stone-950/80">
          {/* Mobile: show current step label */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Shadow Tool</span>
            <span className="text-stone-700">·</span>
            <span className="text-xs text-amber-300/80 font-serif">{STEPS.find(s => s.id === step)?.label ?? ''}</span>
          </div>
          {/* Desktop: progress dots */}
          <div className="hidden lg:flex gap-1.5">
            {STEPS.slice(0, 6).map((s, i) => (
              <div key={i} className={`h-0.5 w-6 rounded-full ${i <= stepIdx(step) ? 'bg-amber-600' : 'bg-stone-800'}`} />
            ))}
          </div>
          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8" ref={contentRef}>
          <div className="max-w-2xl mx-auto space-y-8">
            
            {crisisLevel !== 'none' && (
              <WarningBanner variant={crisisLevel === 'high' ? 'danger' : 'info'}>
                {crisisLevel === 'high'
                  ? 'This territory seems deeply activating. Please ensure you have support. You can save and exit at any time.'
                  : 'Notice the activation arising. Keep your breathing steady as you proceed.'}
              </WarningBanner>
            )}

            {step === 'ONBOARDING' && (
              <div className="space-y-6 animate-fade-in text-center pt-8 pb-10">
                <VoidBloomIcon size={64} className="text-violet-400/80 mx-auto" />
                <h1 className="text-3xl font-serif font-light text-stone-100">The 3-2-1 Shadow Process</h1>
                <p className="text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
                  What triggers you in others often holds a disowned part of yourself. 
                  Not because you *are* that quality, but because it carries a gift you haven't claimed yet.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6">
                  <div className="p-5 rounded-xl border border-stone-800/60 bg-stone-900/40 opacity-80">
                    <Eye className="text-amber-500/60 mb-3" size={20} />
                    <SectionLabel>Face It</SectionLabel>
                    <p className="text-xs text-stone-400">Observe the trigger objectively as if watching a stranger.</p>
                  </div>
                  <div className="p-5 rounded-xl border border-stone-800/60 bg-stone-900/40 opacity-80">
                    <Ear className="text-violet-400/60 mb-3" size={20} />
                    <SectionLabel>Talk to It</SectionLabel>
                    <p className="text-xs text-stone-400">Dialogue directly with the quality to uncover its hidden need.</p>
                  </div>
                  <div className="p-5 rounded-xl border border-stone-800/60 bg-stone-900/40 opacity-80">
                    <Hand className="text-teal-400/60 mb-3" size={20} />
                    <SectionLabel>Be It</SectionLabel>
                    <p className="text-xs text-stone-400">Embody the quality from the inside to reclaim its raw energy.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'TRIGGER' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center pb-6">
                  <SomaticPillarIcon size={40} className="text-amber-400/60 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Identify the Disowned</h2>
                  <p className="text-sm text-stone-400">Think of someone whose behavior deeply disturbs or irritates you.</p>
                </div>
                {insightContext && (
                  <AiCard label="FROM YOUR JOURNEY" text={`We are investigating: "${insightContext.detectedPattern}"`} />
                )}
                <div className="bg-stone-900/40 border border-stone-800/60 p-5 rounded-xl">
                  <SectionLabel>The Quality</SectionLabel>
                  <input
                    autoFocus
                    className="w-full bg-transparent text-stone-100 text-lg placeholder-stone-600 focus:outline-none py-1"
                    placeholder="e.g. Arrogance, helplessness, control..."
                    value={session?.trigger || ''}
                    onChange={e => setSessionField('trigger', e.target.value)}
                  />
                </div>
                <FieldTextarea 
                  label="Specific Incident (Optional)"
                  placeholder="Briefly describe what happened..."
                  value={session?.triggerSituation || ''}
                  onChange={v => setSessionField('triggerSituation', v)}
                />
                <IntensitySlider
                  label="How intense is your reaction?"
                  value={initialIntensity}
                  onChange={setInitialIntensity}
                />
              </div>
            )}

            {step === 'FACE_IT' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center pb-6">
                  <Eye size={40} className="text-amber-400/60 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Face It (3rd Person)</h2>
                  <p className="text-sm text-stone-400">Observe "{session?.trigger}" factually. Step back from the story.</p>
                </div>

                <div className="space-y-2">
                  <FieldTextarea 
                    label="Objective Description"
                    placeholder="What does it actually do? How does it behave?"
                    value={faceItStuckMode 
                      ? "I can't find the objectivity right now. I just know it feels overwhelming." 
                      : (faceItAnalysis.objectiveDescription || '')
                    }
                    onChange={v => setFaceItAnalysis(p => ({...p, objectiveDescription: v}))}
                    disabled={faceItStuckMode}
                  />
                  {!faceItStuckMode && !faceItAnalysis.objectiveDescription && (
                    <StuckLink onHelp={() => setFaceItStuckMode(true)} />
                  )}
                </div>

                <FieldInput 
                  label="Triggered Emotions"
                  placeholder="e.g. Anger, smallness, fear..."
                  value={faceItAnalysis.triggeredEmotions?.join(', ') || ''}
                  onChange={v => setFaceItAnalysis(p => ({...p, triggeredEmotions: v.split(',').map(s=>s.trim())}))}
                />
                
                {faceItProbe && <AiCard text={faceItProbe} />}
                {isLoadingProbe && !faceItProbe && <AiThinking label="Holding your mirror..." />}
              </div>
            )}

            {step === 'TALK_TO_IT' && (
              <div className="space-y-6 animate-fade-in flex flex-col h-full min-h-[500px]">
                <div className="text-center pb-4 shrink-0">
                  <Ear size={40} className="text-violet-400/60 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Talk to It (2nd Person)</h2>
                  <p className="text-sm text-stone-400">Speak directly to "{session?.trigger}". Ask it what it wants.</p>
                </div>

                <div className="flex-1 bg-stone-900/20 border border-stone-800/60 rounded-xl p-4 overflow-y-auto space-y-4">
                  {dialogueTranscript.length === 0 && (
                    <div className="text-center text-sm text-stone-500 italic mt-10">
                      Begin the dialogue below...
                    </div>
                  )}
                  {dialogueTranscript.map((entry, idx) => (
                    <div key={idx} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-4 ${entry.role === 'user' ? 'bg-stone-800 text-stone-200' : 'bg-violet-950/20 border border-violet-500/20 text-violet-200'}`}>
                        <SectionLabel>{entry.role === 'user' ? 'You' : session?.trigger}</SectionLabel>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</div>
                      </div>
                    </div>
                  ))}
                  {isLoadingProbe && (
                    <div className="flex justify-start">
                      <div className="bg-violet-950/20 border border-violet-500/20 rounded-xl p-4">
                        <SectionLabel>{session?.trigger}</SectionLabel>
                        <AiThinking label="Responding..." />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="shrink-0 pt-4">
                  {dialogueTranscript.length === 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dialogueOpeners.map(q => (
                        <button key={q} onClick={() => handleDialogueSubmit(q)} className="text-xs px-3 py-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition">
                          "{q}"
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-stone-950/80 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      placeholder="Say something..."
                      value={dialogueInput}
                      onChange={e => setDialogueInput(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter' && dialogueInput.trim()) handleDialogueSubmit(dialogueInput); }}
                      disabled={isLoadingProbe}
                    />
                    <button onClick={() => handleDialogueSubmit(dialogueInput)} disabled={!dialogueInput.trim() || isLoadingProbe} className="px-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 rounded-xl transition">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <DialogueDepth count={exchangeCount} />
                </div>
              </div>
            )}

            {step === 'BE_IT' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center pb-6">
                  <Hand size={40} className="text-teal-400/60 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Be It (1st Person)</h2>
                  <p className="text-sm text-stone-400">Let the resistance drop. Speak as "I am {session?.trigger}".</p>
                </div>

                <div className="bg-teal-950/10 border border-teal-500/20 p-5 rounded-xl space-y-4">
                  <SectionLabel>Speak from inside it</SectionLabel>
                  <FieldInput 
                    label="What I need from you is..."
                    value={embodimentAnalysis.qualityNeed || ''}
                    onChange={v => setEmbodimentAnalysis(p => ({...p, qualityNeed: v}))}
                  />
                  <FieldInput 
                    label="The gift I trace back to you is..."
                    value={embodimentAnalysis.qualityGift || ''}
                    onChange={v => setEmbodimentAnalysis(p => ({...p, qualityGift: v}))}
                  />
                </div>

                <FieldTextarea 
                  label="I am... Statement"
                  placeholder={`"I am ${session?.trigger}. I..."`}
                  value={embodimentAnalysis.embodimentStatement || ''}
                  onChange={v => setEmbodimentAnalysis(p => ({...p, embodimentStatement: v}))}
                  hint="Speak fully as the quality to claim its raw energy."
                />
                
                <IntensitySlider
                  label="How intense is the body mapping?"
                  value={embodimentAnalysis.intensityRating || 5}
                  onChange={v => setEmbodimentAnalysis(p=>({...p, intensityRating: v}))}
                />

                {beItSomaticPrompt && <AiCard label="SOMA" text={beItSomaticPrompt} />}
                {isLoadingProbe && !beItSomaticPrompt && <AiThinking label="Somatic grounding..." />}
              </div>
            )}

            {step === 'INTEGRATE' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center pb-6">
                  <EnsoTriunityIcon size={44} className="text-amber-400/60 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Synthesis</h2>
                  <p className="text-sm text-stone-400">Claim the raw energy of the shadow without its destructive expression.</p>
                </div>

                <FieldTextarea 
                  label="The Re-owning"
                  placeholder="How will you honor this quality's gift while keeping it healthy? 'I can embrace __ by...'"
                  value={integrationPlan.reowningStatement || ''}
                  onChange={v => setIntegrationPlan(p => ({...p, reowningStatement: v}))}
                />

                <FieldTextarea 
                  label="Concrete Action"
                  placeholder="One small, specific action to practice this integration this week..."
                  rows={2}
                  value={integrationPlan.actionableStep || ''}
                  onChange={v => setIntegrationPlan(p => ({...p, actionableStep: v}))}
                />
              </div>
            )}

            {step === 'SUMMARY' && (
              <div className="space-y-8 animate-fade-in pb-10">
                <div className="text-center">
                  <SeedOfLifeIcon size={44} className="text-amber-400/80 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Your Shadow Portrait</h2>
                  <p className="text-sm text-stone-400">The journey from projection to wholeness.</p>
                </div>

                <div className="bg-stone-950/40 border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/5">
                  <div className="p-6 md:p-8 space-y-8">
                    
                    <div className="text-center space-y-4 pb-6 border-b border-stone-800">
                      {intensityDelta !== null && (
                        <div className={`text-xl font-mono tracking-widest ${intensityDelta < 0 ? 'text-emerald-400' : 'text-stone-500'}`}>
                          Δ {intensityDelta > 0 ? '+' : ''}{intensityDelta} INTENSITY
                        </div>
                      )}
                      <SectionLabel>The Hidden Gift</SectionLabel>
                      <div className="text-xl font-serif text-amber-300 italic">
                        "{session?.shadowGift}"
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <SectionLabel>The Projection</SectionLabel>
                        <p className="text-sm text-stone-300">{session?.trigger}</p>
                      </div>
                      <div className="space-y-2">
                        <SectionLabel>The Embodiment</SectionLabel>
                        <p className="text-sm text-stone-300 italic">"{embodimentAnalysis.embodimentStatement}"</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-6 border-t border-stone-800">
                      <SectionLabel>Guide's Synthesis</SectionLabel>
                      <p className="text-sm text-stone-300 leading-relaxed">{session?.aiSummary}</p>
                    </div>

                    <div className="space-y-2 pt-6 border-t border-stone-800">
                      <SectionLabel>Watch Notice</SectionLabel>
                      <p className="text-sm text-amber-500/70">{session?.watchFor}</p>
                    </div>

                    <div className="pt-8 text-center text-[10px] text-stone-600 italic">
                      "This process assumes all qualities that disturb are disowned. That assumption is itself a model."
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-stone-500">Suggested continuations:</span>
                  <div className="flex gap-4">
                    <div className="text-xs text-stone-400 border border-stone-800 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-stone-900 cursor-pointer transition">
                      IFS Parts Work <ArrowRight size={12}/>
                    </div>
                    <div className="text-xs text-stone-400 border border-stone-800 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-stone-900 cursor-pointer transition">
                      Golden Shadow <ArrowRight size={12}/>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        <footer className="shrink-0 border-t border-stone-800/60 px-5 py-4 flex items-center justify-between bg-stone-950/80 z-20">
          <button 
            onClick={handleBack} 
            disabled={step === 'ONBOARDING' || isLoading}
            className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400 transition"
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!canAdvance() || isLoading}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              step === 'SUMMARY' ? 'bg-amber-500 hover:bg-amber-400 text-stone-950' : 
              step === 'INTEGRATE' ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20' : 
              'bg-stone-800 hover:bg-stone-700 text-stone-100'
            } disabled:opacity-50`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin text-amber-950" />}
            {!isLoading && step === 'SUMMARY' ? <><Save size={16} /> Save Session</> : 
             !isLoading && step === 'INTEGRATE' ? <>Synthesise <Loader2 size={14} className="opacity-0" /></> :
             !isLoading && <>Continue <ChevronRight size={16} /></>}
          </button>
        </footer>
        
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <EnsoTriunityIcon className="text-amber-500/60 mx-auto animate-spin" size={48} />
              <div className="text-amber-500/80 text-sm tracking-widest uppercase font-bold">Weaving the portrait...</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

