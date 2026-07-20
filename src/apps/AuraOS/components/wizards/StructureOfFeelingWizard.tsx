import React, { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import type { StructureOfFeelingSession, StructureOfFeelingDraft } from '../../types';
import ParadoxGateIcon from '../visualizations/SacredGeometryIcons/ParadoxGateIcon';

// ─── Types ────────────────────────────────────────────────────────
type WizardStep =
  | 'MODE_SELECT'
  | 'TRANSPARENT_OPENING'
  | 'OPENING_QUESTION'
  | 'RECOGNITION_SEQUENCE'
  | 'BARNUM_TRANSPARENCY'
  | 'CONCEPT_REVEAL'
  | 'BRING_EXAMPLE'
  | 'AI_REFLECTION'
  | 'DOMAIN_SELECT'
  | 'FRAMEWORK_COMPARE'
  | 'PRACTICE_GENERATION'
  | 'CLOSING';

const STAGE_ORDER_CORE: WizardStep[] = [
  'MODE_SELECT',
  'TRANSPARENT_OPENING',
  'OPENING_QUESTION',
  'RECOGNITION_SEQUENCE',
  'BARNUM_TRANSPARENCY',
  'CONCEPT_REVEAL',
  'BRING_EXAMPLE',
  'AI_REFLECTION',
  'CLOSING',
];

const STAGE_ORDER_DEEP: WizardStep[] = [
  'MODE_SELECT',
  'TRANSPARENT_OPENING',
  'OPENING_QUESTION',
  'RECOGNITION_SEQUENCE',
  'BARNUM_TRANSPARENCY',
  'CONCEPT_REVEAL',
  'BRING_EXAMPLE',
  'AI_REFLECTION',
  'DOMAIN_SELECT',
  'FRAMEWORK_COMPARE',
  'PRACTICE_GENERATION',
  'CLOSING',
];

// ─── Constants ────────────────────────────────────────────────────
const RECOGNITION_STATEMENTS = [
  {
    id: 'irony_commitment',
    text: 'I hold ironic distance and genuine commitment at the same time — I mean what I say while knowing it could be otherwise.',
  },
  {
    id: 'oscillation',
    text: 'I oscillate between cynicism and sincerity, not because I\'m confused, but because both feel true depending on the moment.',
  },
  {
    id: 'earnest_knowing',
    text: 'I engage earnestly with frameworks or causes while remaining epistemically aware that they are constructs.',
  },
  {
    id: 'both_and',
    text: 'I can experience nostalgia, hope, or grief with full intensity without believing these feelings correspond to objective facts.',
  },
];

const CONCEPTS = [
  {
    id: 'oscillation',
    title: 'Oscillation',
    body: 'Metamodernism describes a structure of feeling that oscillates between modernist sincerity and postmodern irony — not resolving the tension, but inhabiting it as a generative space. The oscillation is not failure to commit; it is the form of commitment available after postmodernity.',
  },
  {
    id: 'informed_naivety',
    title: 'Informed Naivety',
    body: 'The metamodern subject adopts what Vermeulen and van den Akker call "informed naivety" — a strategic innocence that knows better but proceeds as if hope were possible. This is not delusion. It is the pragmatic embrace of a stance that permits action.',
  },
  {
    id: 'pragmatic_romanticism',
    title: 'Pragmatic Romanticism',
    body: 'Metamodernism recovers romantic sensibilities — depth, longing, the numinous — without surrendering ironic awareness. Grand narratives return not as totalities but as orientations: partial, useful, held lightly.',
  },
  {
    id: 'metaxis',
    title: 'Metaxis',
    body: 'The condition of standing between two worlds without fully belonging to either. In metamodernism, metaxis is not a problem to be solved but the structure of the position itself. You are neither pre-critical nor post-committed — you are between, and that betweenness is where you work.',
  },
];

const BARNUM_CHOICES = [
  { id: 'barnum', label: 'Barnum effect', desc: 'These statements could resonate with anyone — the Barnum/Forer effect.' },
  { id: 'pattern', label: 'Genuine pattern', desc: 'I notice a real pattern in myself that fits these descriptions.' },
  { id: 'both', label: 'Both are true', desc: 'The statements are general AND they map something specific for me.' },
  { id: 'unsure', label: 'I\'m not sure', desc: 'I need more context before I can evaluate this.' },
];

const DOMAINS = [
  { id: 'academic', label: 'Academic / research' },
  { id: 'creative', label: 'Creative practice' },
  { id: 'activism', label: 'Activism / civic engagement' },
  { id: 'professional', label: 'Professional / organizational' },
  { id: 'relational', label: 'Relational / personal' },
  { id: 'spiritual', label: 'Spiritual / contemplative' },
];

const FRAMEWORKS = [
  { id: 'integral', label: 'Integral Theory (Wilber)' },
  { id: 'dialectical', label: 'Hegelian dialectic' },
  { id: 'phenomenology', label: 'Phenomenology (Merleau-Ponty, Heidegger)' },
  { id: 'complexity', label: 'Complexity theory / emergence' },
  { id: 'none', label: 'I work without a named framework' },
];

const CRITIQUE_RESPONSES: Record<string, string> = {
  too_generic: `Fair. The "structure of feeling" concept (Raymond Williams, 1977) was developed to describe culturally shared sensibilities that precede articulation — not individual psychology. The oscillation model may describe a generational or disciplinary formation rather than you specifically. The question is whether it maps anything useful for your own practice, not whether it is universally valid.`,
  wrong_situation: `The metamodernism thesis emerged from analysis of contemporary art and cultural production. If your domain is highly technical, pre-theoretical, or explicitly anti-humanist, the framework may have limited traction. Consider whether the tension you actually navigate resembles the irony/sincerity axis or something else: precision vs. interpretation, loyalty vs. critique, discipline vs. improvisation.`,
  reject_framework: `Vermeulen and van den Akker acknowledge that "metamodernism" is itself a metanarrative, subject to the same critique it applies to modernism. Tim Vermeulen has noted the irony of naming a post-ironic condition. The strongest critique is that it aestheticizes contradiction rather than resolving it, potentially legitimizing indefinite deferral. If you work from a more committed epistemological position — realist, Marxist, pragmatist, or otherwise — the oscillation model may be too comfortable with its own equivocation.`,
};

// ─── AI Schemas ───────────────────────────────────────────────────
const reflectionSchema = z.object({
  reflection: z.string().min(50).max(400),
  question: z.string().min(10).max(200),
});

const practiceSchema = z.object({
  practice: z.string().min(30).max(300),
});

// ─── Component ────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSave: (session: StructureOfFeelingSession) => void;
  draft?: StructureOfFeelingDraft | null;
  setDraft?: (d: StructureOfFeelingDraft | null) => void;
  userId?: string;
}

export default function StructureOfFeelingWizard({ onClose, onSave, draft, setDraft, userId }: Props) {
  const [mode, setMode] = useState<'core' | 'deep'>(draft?.mode ?? 'core');
  const [openingAnswer, setOpeningAnswer] = useState(draft?.openingAnswer ?? '');
  const [recognitionResponses, setRecognitionResponses] = useState<Record<string, string>>(draft?.recognitionResponses ?? {});
  const [barnumChoice, setBarnumChoice] = useState(draft?.barnumChoice ?? '');
  const [conceptIndex, setConceptIndex] = useState(0);
  const [userExample, setUserExample] = useState(draft?.userExample ?? '');
  const [userContext, setUserContext] = useState(draft?.userContext ?? '');
  const [domainChoice, setDomainChoice] = useState(draft?.domainChoice ?? '');
  const [frameworkChoice, setFrameworkChoice] = useState(draft?.frameworkChoice ?? '');
  const [practiceReflection, setPracticeReflection] = useState(draft?.practiceReflection ?? '');

  const [aiReflection, setAiReflection] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiPractice, setAiPractice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPushback, setShowPushback] = useState(false);
  const [pushbackKey, setPushbackKey] = useState<string | null>(null);

  const stageOrder = mode === 'deep' ? STAGE_ORDER_DEEP : STAGE_ORDER_CORE;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = stageOrder[stepIndex];
  const totalSteps = stageOrder.length;

  const saveDraft = useCallback((updates: Partial<StructureOfFeelingDraft>) => {
    if (!setDraft) return;
    setDraft({
      mode,
      openingAnswer,
      recognitionResponses,
      barnumChoice,
      userExample,
      userContext,
      domainChoice,
      frameworkChoice,
      practiceReflection,
      updatedAt: Date.now(),
      ...updates,
    });
  }, [mode, openingAnswer, recognitionResponses, barnumChoice, userExample, userContext, domainChoice, frameworkChoice, practiceReflection, setDraft]);

  const recognitionCount = Object.values(recognitionResponses).filter(v => v === 'me').length;

  const handleAIReflection = useCallback(async () => {
    if (aiReflection) return;
    setIsLoading(true);
    try {
      const prompt = `You are engaging with a practitioner exploring metamodernism's "structure of feeling" (Vermeulen & van den Akker).

Their context: ${userContext || 'not specified'}
Recognition responses (me/sometimes/not_me): ${JSON.stringify(recognitionResponses)}
Example from their work: "${userExample}"

Generate a JSON response with TWO fields:
1. "reflection": A reflection (50-400 chars) that:
   - Identifies the specific oscillation pattern evident in their example
   - Names how their example instantiates (or departs from) metamodern sensibility
   - Does NOT simply validate — find the productive tension or ambiguity in their case

2. "question": One follow-up question (10-200 chars) that opens the example further without closing it

Return ONLY valid JSON, no markdown, no explanation.`;

      const result = await callGrokThenAIJson('Structure of Feeling', prompt, undefined, reflectionSchema);
      setAiReflection(result.reflection);
      setAiQuestion(result.question);
    } catch (err) {
      console.error('[StructureOfFeeling] AI reflection failed:', err);
      setAiReflection('Unable to generate reflection. Please proceed — your example will be captured in the session.');
      setAiQuestion('What does holding this tension allow you to do that resolving it would not?');
    } finally {
      setIsLoading(false);
    }
  }, [aiReflection, recognitionResponses, userExample, userContext]);

  const handleAIPractice = useCallback(async (signal?: string) => {
    setIsLoading(true);
    try {
      const prompt = `Generate a JSON response with ONE field:
"practice": A concrete practice (30-300 chars) for a practitioner working in ${domainChoice || 'their domain'} with a ${frameworkChoice || 'unnamed'} framework background, using metamodern oscillation as a lens.

Their example: "${userExample}"
${signal ? `They found a previous suggestion too abstract or wrong domain. Refine accordingly: ${signal}` : ''}

The practice should be specific, actionable within 1 week, and require holding the irony/sincerity tension — not resolve it.

Return ONLY valid JSON, no markdown, no explanation.`;

      const result = await callGrokThenAIJson('Structure of Feeling Practice', prompt, undefined, practiceSchema);
      setAiPractice(result.practice);
    } catch (err) {
      console.error('[StructureOfFeeling] Practice generation failed:', err);
      setAiPractice('Unable to generate practice. Proceed to closing — your session will be saved.');
    } finally {
      setIsLoading(false);
    }
  }, [domainChoice, frameworkChoice, userExample]);

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 'MODE_SELECT': return true;
      case 'TRANSPARENT_OPENING': return true;
      case 'OPENING_QUESTION': return !!openingAnswer;
      case 'RECOGNITION_SEQUENCE': return Object.keys(recognitionResponses).length === RECOGNITION_STATEMENTS.length;
      case 'BARNUM_TRANSPARENCY': return !!barnumChoice;
      case 'CONCEPT_REVEAL': return conceptIndex >= CONCEPTS.length - 1;
      case 'BRING_EXAMPLE': return userExample.trim().split(/\s+/).length >= 30;
      case 'AI_REFLECTION': return !!aiReflection && !isLoading;
      case 'DOMAIN_SELECT': return !!domainChoice;
      case 'FRAMEWORK_COMPARE': return !!frameworkChoice;
      case 'PRACTICE_GENERATION': return !!aiPractice && !isLoading;
      case 'CLOSING': return true;
      default: return true;
    }
  };

  // Trigger AI calls when entering the relevant steps
  useEffect(() => {
    if (currentStep === 'AI_REFLECTION' && !aiReflection && !isLoading) {
      handleAIReflection();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentStep === 'PRACTICE_GENERATION' && !aiPractice && !isLoading) {
      handleAIPractice();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(async () => {
    if (currentStep === 'BRING_EXAMPLE') {
      saveDraft({ userExample, userContext });
      setStepIndex(i => i + 1);
      return;
    }
    if (currentStep === 'CLOSING') {
      const session: StructureOfFeelingSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode,
        openingAnswer,
        recognitionCount,
        barnumChoice,
        userExample,
        aiReflection,
        aiQuestion,
        practiceReflection: practiceReflection || undefined,
        ...(mode === 'deep' ? { aiPractice, domainChoice, frameworkChoice } : {}),
      };
      onSave(session);
      return;
    }
    setStepIndex(i => i + 1);
  }, [currentStep, mode, openingAnswer, recognitionCount, barnumChoice, userExample, userContext, aiReflection, aiQuestion, aiPractice, domainChoice, frameworkChoice, practiceReflection, onSave, saveDraft]);

  const handleBack = () => {
    if (stepIndex === 0) { onClose(); return; }
    setStepIndex(i => i - 1);
  };

  const nextButtonText = (() => {
    if (currentStep === 'CLOSING') return 'Complete';
    if (currentStep === 'BRING_EXAMPLE') return 'Reflect with AI';
    if (currentStep === 'FRAMEWORK_COMPARE') return 'Generate Practice';
    return 'Next';
  })();

  return (
    <WizardFrame
      title="Structure of Feeling"
      currentStep={stepIndex + 1}
      totalSteps={totalSteps}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      nextButtonText={nextButtonText}
      nextButtonDisabled={!canAdvance()}
      isLoading={isLoading}
      accentColor="teal"
    >
      <div className="space-y-6">
        {currentStep === 'MODE_SELECT' && (
          <ModeSelect mode={mode} setMode={(m) => { setMode(m); saveDraft({ mode: m }); }} />
        )}
        {currentStep === 'TRANSPARENT_OPENING' && (
          <TransparentOpening mode={mode} />
        )}
        {currentStep === 'OPENING_QUESTION' && (
          <OpeningQuestion value={openingAnswer} onChange={(v) => { setOpeningAnswer(v); saveDraft({ openingAnswer: v }); }} />
        )}
        {currentStep === 'RECOGNITION_SEQUENCE' && (
          <RecognitionSequence responses={recognitionResponses} onChange={(id, val) => {
            const updated = { ...recognitionResponses, [id]: val };
            setRecognitionResponses(updated);
            saveDraft({ recognitionResponses: updated });
          }} />
        )}
        {currentStep === 'BARNUM_TRANSPARENCY' && (
          <BarnumTransparency count={recognitionCount} choice={barnumChoice} onChange={(v) => { setBarnumChoice(v); saveDraft({ barnumChoice: v }); }} />
        )}
        {currentStep === 'CONCEPT_REVEAL' && (
          <ConceptReveal index={conceptIndex} onNext={() => setConceptIndex(i => Math.min(i + 1, CONCEPTS.length - 1))} />
        )}
        {currentStep === 'BRING_EXAMPLE' && (
          <BringExample
            example={userExample}
            context={userContext}
            onExampleChange={(v) => setUserExample(v)}
            onContextChange={(v) => setUserContext(v)}
          />
        )}
        {currentStep === 'AI_REFLECTION' && (
          <AIReflectionStep
            isLoading={isLoading}
            reflection={aiReflection}
            question={aiQuestion}
            showPushback={showPushback}
            pushbackKey={pushbackKey}
            onShowPushback={() => setShowPushback(true)}
            onSelectPushback={(k) => setPushbackKey(k)}
          />
        )}
        {currentStep === 'DOMAIN_SELECT' && (
          <DomainSelect value={domainChoice} onChange={(v) => { setDomainChoice(v); saveDraft({ domainChoice: v }); }} />
        )}
        {currentStep === 'FRAMEWORK_COMPARE' && (
          <FrameworkCompare value={frameworkChoice} onChange={(v) => { setFrameworkChoice(v); saveDraft({ frameworkChoice: v }); }} />
        )}
        {currentStep === 'PRACTICE_GENERATION' && (
          <PracticeGeneration
            isLoading={isLoading}
            practice={aiPractice}
            onRegenerate={() => handleAIPractice('too abstract or wrong domain — please adjust')}
            practiceReflection={practiceReflection}
            onReflectionChange={(v) => { setPracticeReflection(v); saveDraft({ practiceReflection: v }); }}
          />
        )}
        {currentStep === 'CLOSING' && (
          <Closing mode={mode} aiQuestion={aiQuestion} practiceReflection={practiceReflection} onReflectionChange={(v) => { setPracticeReflection(v); saveDraft({ practiceReflection: v }); }} />
        )}
      </div>
    </WizardFrame>
  );
}

// ─── Shared decorative elements ───────────────────────────────────

function TealDivider() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-700/40 to-transparent" />
    </div>
  );
}

function OscillationDots({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            i < count ? 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.4)]' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Sub-screens ──────────────────────────────────────────────────

function ModeSelect({ mode, setMode }: { mode: 'core' | 'deep'; setMode: (m: 'core' | 'deep') => void }) {
  return (
    <div className="space-y-6 animate-sof-fadeInUp">
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="animate-sof-oscillate mb-5">
          <ParadoxGateIcon size={48} className="text-teal-400/80" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal-500/50 mb-2">Metamodernism</p>
        <h2 className="text-3xl font-display text-slate-100 tracking-wide">Structure of Feeling</h2>
        <p className="text-sm text-slate-400 mt-3 max-w-md leading-relaxed">
          An inquiry into the oscillating sensibility that holds irony and sincerity simultaneously — the defining structure of the metamodern moment.
        </p>
      </div>

      <TealDivider />

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {([
          { id: 'core' as const, label: 'Core', time: '~5 min', desc: 'Recognition, concept introduction, and a single AI reflection on your example.' },
          { id: 'deep' as const, label: 'Deep', time: '~12 min', desc: 'Full core sequence plus domain mapping, framework comparison, and a practice generation.' },
        ]).map(opt => (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id)}
            className={`p-5 rounded-xl border text-left transition-all duration-300 ${
              mode === opt.id
                ? 'border-teal-500/50 bg-gradient-to-br from-teal-950/30 to-slate-900/60 shadow-lg shadow-teal-950/20'
                : 'border-slate-700/50 bg-slate-900/20 hover:border-teal-800/40 hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-100">{opt.label}</span>
              <span className="text-xs font-mono text-teal-500/50">{opt.time}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TransparentOpening({ mode }: { mode: 'core' | 'deep' }) {
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <h3 className="text-lg font-display text-slate-100">A note on method</h3>
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          This wizard uses a recognition sequence — statements that may resonate with your experience. Before we begin, it's worth naming that recognition-based tools carry a known artifact: the <span className="text-teal-300/90">Barnum effect</span> (or Forer effect). Statements phrased at moderate generality tend to feel personally accurate to most people.
        </p>
        <p>
          We'll work with this openly. The goal isn't to convince you that you fit a category, but to use the metamodern framework as a <span className="text-teal-300/90">lens for examining your actual practice</span>.
        </p>
        {mode === 'deep' && (
          <p>
            In Deep mode, we'll also compare metamodernism with your existing theoretical frameworks — looking for resonances and productive tensions rather than substitutions.
          </p>
        )}

        <TealDivider />

        <div className="pl-4 border-l-2 border-teal-800/40">
          <p className="text-slate-400 text-sm italic leading-relaxed font-serif">
            "Metamodernism may be conceived of as a kind of informed naivety, a pragmatic idealism, a moderate fanaticism, oscillating between a modern enthusiasm and a postmodern irony."
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">Vermeulen & van den Akker, 2010</p>
        </div>
      </div>
    </div>
  );
}

function OpeningQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { id: 'yes', label: 'Yes, consistently', desc: 'I navigate this tension regularly in my work.' },
    { id: 'often', label: 'Sometimes', desc: 'I recognize it in certain domains but not uniformly.' },
    { id: 'no', label: 'Not really', desc: 'This doesn\'t map my experience well, or I resolve the tension rather than inhabit it.' },
  ];
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div>
        <h3 className="text-lg font-display text-slate-100 mb-2">Opening check</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Do you regularly hold <span className="text-teal-300/90">ironic awareness and genuine commitment simultaneously</span> — knowing that your frameworks are constructs while still working from within them?
        </p>
      </div>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all duration-300 animate-sof-fadeInUp sof-stagger-${i + 1} ${
              value === opt.id
                ? 'border-teal-500/50 bg-gradient-to-r from-teal-950/30 to-slate-900/40 shadow-[0_0_12px_rgba(45,212,191,0.08)]'
                : 'border-slate-700/40 bg-slate-900/20 hover:border-slate-600/60'
            }`}
          >
            <div className="font-medium text-sm text-slate-200 mb-0.5">{opt.label}</div>
            <div className="text-xs text-slate-400">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecognitionSequence({ responses, onChange }: {
  responses: Record<string, string>;
  onChange: (id: string, val: string) => void;
}) {
  const meCount = Object.values(responses).filter(v => v === 'me').length;
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-display text-slate-100 mb-1">Recognition sequence</h3>
          <p className="text-xs text-slate-500">For each statement, mark how accurately it describes your experience.</p>
        </div>
        <OscillationDots count={answeredCount} total={RECOGNITION_STATEMENTS.length} />
      </div>
      <div className="space-y-4">
        {RECOGNITION_STATEMENTS.map((stmt, idx) => {
          const selected = responses[stmt.id];
          const isMe = selected === 'me';
          return (
            <div
              key={stmt.id}
              className={`p-4 rounded-xl border transition-all duration-500 animate-sof-fadeInUp sof-stagger-${idx + 1} ${
                isMe
                  ? 'border-teal-600/40 bg-gradient-to-r from-teal-950/20 to-slate-900/30 shadow-[0_0_16px_rgba(45,212,191,0.06)]'
                  : selected
                    ? 'border-slate-700/50 bg-slate-900/30'
                    : 'border-slate-800/60 bg-slate-900/20'
              } space-y-3`}
            >
              <p className="text-sm text-slate-300 leading-relaxed italic">"{stmt.text}"</p>
              <div className="flex gap-2 flex-wrap">
                {(['me', 'sometimes', 'not_me'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => onChange(stmt.id, opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                      responses[stmt.id] === opt
                        ? opt === 'me'
                          ? 'bg-teal-600/30 border border-teal-500/50 text-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.15)]'
                          : 'bg-teal-600/20 border border-teal-500/40 text-teal-300'
                        : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {opt === 'not_me' ? 'not me' : opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Cumulative resonance indicator */}
      {answeredCount > 0 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-mono">{meCount} of {RECOGNITION_STATEMENTS.length} recognized</span>
        </div>
      )}
    </div>
  );
}

function BarnumTransparency({ count, choice, onChange }: {
  count: number;
  choice: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div>
        <h3 className="text-lg font-display text-slate-100 mb-2">Barnum check</h3>
        {/* Large numeral treatment */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl font-display text-teal-400">{count}</span>
          <span className="text-lg font-display text-slate-600">/4</span>
          <span className="text-sm text-slate-400 ml-2">statements resonated as "me."</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Before we continue — what's your read on why?
        </p>
      </div>

      {/* Epistemic checkpoint divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-700/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-teal-500/40" />
        <div className="h-px flex-1 bg-slate-700/50" />
      </div>

      <div className="space-y-3">
        {BARNUM_CHOICES.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all duration-300 animate-sof-fadeInUp sof-stagger-${i + 1} ${
              choice === opt.id
                ? 'border-teal-500/50 bg-gradient-to-r from-teal-950/30 to-slate-900/40'
                : 'border-slate-700/40 bg-slate-900/20 hover:border-slate-600/60'
            }`}
          >
            <div className="font-medium text-sm text-slate-200 mb-0.5">{opt.label}</div>
            <div className="text-xs text-slate-400">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Footnote with accent border */}
      <div className="pl-3 border-l-2 border-teal-800/30">
        <p className="text-xs text-slate-500 italic">
          This isn't a trick — your meta-awareness about the tool is itself part of the inquiry.
        </p>
      </div>
    </div>
  );
}

function ConceptReveal({ index, onNext }: { index: number; onNext: () => void }) {
  const concept = CONCEPTS[index];
  const isLast = index === CONCEPTS.length - 1;

  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-teal-500/50 uppercase tracking-[0.15em]">Concepts</p>
        <OscillationDots count={index + 1} total={CONCEPTS.length} />
      </div>

      {/* Previously viewed concepts — compact references */}
      {index > 0 && (
        <div className="flex flex-wrap gap-2">
          {CONCEPTS.slice(0, index).map(c => (
            <span key={c.id} className="text-xs font-mono text-slate-500 bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-700/30">
              {c.title}
            </span>
          ))}
        </div>
      )}

      {/* Active concept card */}
      <div
        key={concept.id}
        className="p-6 rounded-xl border-l-4 border-l-teal-500/60 border border-teal-800/20 bg-gradient-to-br from-teal-950/15 to-slate-900/40 space-y-3 animate-sof-fadeInUp"
      >
        <h3 className="text-2xl font-display text-teal-100 tracking-wide">{concept.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{concept.body}</p>
      </div>

      {!isLast && (
        <button
          onClick={onNext}
          className="text-xs text-teal-400/60 hover:text-teal-300 font-mono transition-colors"
        >
          Next concept &rarr;
        </button>
      )}
      {isLast && (
        <p className="text-xs text-slate-500 italic">All four concepts introduced. Continue to bring your own example.</p>
      )}
    </div>
  );
}

function BringExample({ example, context, onExampleChange, onContextChange }: {
  example: string;
  context: string;
  onExampleChange: (v: string) => void;
  onContextChange: (v: string) => void;
}) {
  const wordCount = example.trim().split(/\s+/).filter(Boolean).length;
  const isReady = wordCount >= 30;

  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div>
        <h3 className="text-lg font-display text-slate-100 mb-1">Your example</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Describe a specific situation from your work or practice where you held the irony/sincerity tension — not resolved it. What were you doing, and what did the tension feel like to navigate?
        </p>
      </div>
      <div>
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Brief context (optional)</label>
        <input
          value={context}
          onChange={e => onContextChange(e.target.value)}
          placeholder="e.g., PhD research, teaching, creative practice..."
          className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-600/50 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Your example</label>
        <textarea
          value={example}
          onChange={e => onExampleChange(e.target.value)}
          placeholder="Describe the situation in concrete detail..."
          rows={6}
          className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-600/50 resize-none leading-relaxed transition-colors"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className={`text-xs transition-all duration-500 ${
            isReady ? 'text-teal-400' : wordCount > 15 ? 'text-slate-500' : 'text-slate-600'
          }`}>
            {wordCount} / 30 words minimum
          </p>
          {isReady && (
            <span className="text-xs text-teal-500/60 font-mono animate-sof-fadeInUp">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}

function AIReflectionStep({ isLoading, reflection, question, showPushback, pushbackKey, onShowPushback, onSelectPushback }: {
  isLoading: boolean;
  reflection: string;
  question: string;
  showPushback: boolean;
  pushbackKey: string | null;
  onShowPushback: () => void;
  onSelectPushback: (k: string) => void;
}) {
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!isLoading) { setLoadingPhase(0); return; }
    const timer = setTimeout(() => setLoadingPhase(1), 2500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const loadingMessages = [
    'Analyzing your example...',
    'Finding the oscillation pattern...',
  ];

  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <h3 className="text-lg font-display text-slate-100">AI reflection</h3>
      {isLoading && (
        <div className="flex items-center gap-3 py-8">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-slate-400 font-mono transition-all duration-300">
            {loadingMessages[loadingPhase]}
          </p>
        </div>
      )}
      {!isLoading && reflection && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-700/40 bg-slate-900/40 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap animate-sof-fadeInUp">
            {reflection}
          </div>
          {question && (
            <div className="p-4 rounded-xl border-l-4 border-l-teal-500/50 border border-teal-800/20 bg-gradient-to-r from-teal-950/15 to-transparent animate-sof-fadeInUp sof-stagger-1">
              <p className="text-xs font-mono text-teal-500/50 uppercase tracking-wider mb-1.5">Open question</p>
              <p className="text-base text-teal-200/90 italic font-serif leading-relaxed">{question}</p>
            </div>
          )}

          <TealDivider />

          {!showPushback && (
            <button onClick={onShowPushback} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              I push back on this
            </button>
          )}
          {showPushback && !pushbackKey && (
            <div className="space-y-2 animate-sof-fadeInUp">
              <p className="text-xs text-slate-500 mb-2">Select your objection:</p>
              {[
                { key: 'too_generic', label: 'Too generic — this could apply to anyone' },
                { key: 'wrong_situation', label: 'This misreads my actual situation' },
                { key: 'reject_framework', label: 'I reject the metamodern framework itself' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => onSelectPushback(opt.key)}
                  className="w-full p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 text-left text-xs text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {pushbackKey && CRITIQUE_RESPONSES[pushbackKey] && (
            <div className="p-4 rounded-xl border-l-4 border-l-amber-600/40 border border-amber-800/20 bg-gradient-to-r from-amber-950/15 to-transparent animate-sof-fadeInUp">
              <p className="text-xs font-mono text-amber-500/50 uppercase tracking-wider mb-2">Critique acknowledged</p>
              <p className="text-sm text-slate-300 leading-relaxed">{CRITIQUE_RESPONSES[pushbackKey]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DomainSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div>
        <h3 className="text-lg font-display text-slate-100 mb-1">Your primary domain</h3>
        <p className="text-sm text-slate-400">Where does this structure of feeling show up most visibly in your work?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className={`p-3.5 rounded-xl border text-sm text-left transition-all duration-300 ${
              value === d.id
                ? 'border-teal-500/50 bg-gradient-to-r from-teal-950/30 to-slate-900/40 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.06)]'
                : 'border-slate-700/40 bg-slate-900/20 text-slate-400 hover:border-slate-600/60'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FrameworkCompare({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <div>
        <h3 className="text-lg font-display text-slate-100 mb-1">Framework comparison</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Select your primary existing framework. We'll examine how metamodernism sits alongside it.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {FRAMEWORKS.map(f => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`p-3.5 rounded-xl border text-sm text-left transition-all duration-300 ${
              value === f.id
                ? 'border-teal-500/50 bg-gradient-to-r from-teal-950/30 to-slate-900/40 text-teal-200'
                : 'border-slate-700/40 bg-slate-900/20 text-slate-400 hover:border-slate-600/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {value && value !== 'none' && (
        <div className="mt-4 rounded-xl border border-slate-700/40 bg-slate-900/30 overflow-hidden animate-sof-fadeInUp">
          <div className="grid grid-cols-2 divide-x divide-slate-700/40">
            <div className="p-4 space-y-2">
              <p className="text-xs font-mono text-teal-500/60 uppercase tracking-wider">Metamodernism</p>
              <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5"><span className="text-teal-600 mt-0.5">&#183;</span> Oscillation as structural feature</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-600 mt-0.5">&#183;</span> Irony + sincerity held simultaneously</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-600 mt-0.5">&#183;</span> Informed naivety as posture</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-600 mt-0.5">&#183;</span> Cultural/aesthetic frame primarily</li>
              </ul>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-mono text-slate-400/60 uppercase tracking-wider">{FRAMEWORKS.find(f => f.id === value)?.label}</p>
              {value === 'integral' && (
                <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Developmental altitude model</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> All quadrants, all levels</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Transcend and include</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Comprehensive map aspiration</li>
                </ul>
              )}
              {value === 'dialectical' && (
                <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Thesis &rarr; antithesis &rarr; synthesis</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Contradiction drives progress</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Historical materialism</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Resolution as telos</li>
                </ul>
              )}
              {value === 'phenomenology' && (
                <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Lived experience as ground</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Intentionality and perception</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Suspension of natural attitude</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Embodied knowing</li>
                </ul>
              )}
              {value === 'complexity' && (
                <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Emergence from simple rules</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Non-linear causality</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Edge of chaos dynamics</li>
                  <li className="flex items-start gap-1.5"><span className="text-slate-600 mt-0.5">&#183;</span> Attractor states</li>
                </ul>
              )}
              {value === 'none' && (
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  Without a named framework, the metamodern lens operates as an orientation rather than a comparison point — pay attention to moments of oscillation in your practice as they arise.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeGeneration({ isLoading, practice, onRegenerate, practiceReflection, onReflectionChange }: {
  isLoading: boolean;
  practice: string;
  onRegenerate: () => void;
  practiceReflection: string;
  onReflectionChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5 animate-sof-fadeInUp">
      <h3 className="text-lg font-display text-slate-100">Practice generation</h3>
      {isLoading && (
        <div className="flex items-center gap-3 py-8">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-slate-400 font-mono">Generating practice...</p>
        </div>
      )}
      {!isLoading && practice && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border-l-4 border-l-teal-500/50 border border-teal-800/20 bg-gradient-to-r from-teal-950/15 to-slate-900/40 text-sm text-slate-300 leading-relaxed animate-sof-fadeInUp">
            {practice}
          </div>
          <button onClick={onRegenerate} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Too abstract / wrong domain &mdash; regenerate
          </button>
          <div>
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Your response to this practice (optional)</label>
            <textarea
              value={practiceReflection}
              onChange={e => onReflectionChange(e.target.value)}
              placeholder="How does this sit? What would you adjust?"
              rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-600/50 resize-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Closing({ mode, aiQuestion, practiceReflection, onReflectionChange }: {
  mode: 'core' | 'deep';
  aiQuestion: string;
  practiceReflection: string;
  onReflectionChange: (v: string) => void;
}) {
  const prompts = mode === 'deep'
    ? [
        'What would it mean to formalize the oscillation rather than conceal it in your work?',
        aiQuestion || 'Where does inhabiting the tension open possibilities that resolution would foreclose?',
        'What is the minimum change in practice that would make the structure of feeling visible to collaborators?',
      ]
    : [aiQuestion || 'Where does inhabiting the tension open possibilities that resolution would foreclose?'];

  return (
    <div className="space-y-6 animate-sof-fadeInUp">
      <div className="flex items-center gap-3">
        <ParadoxGateIcon size={20} className="text-teal-500/40" />
        <h3 className="text-lg font-display text-slate-100">Closing</h3>
      </div>

      {/* Expanding center line */}
      <div className="flex justify-center">
        <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent animate-sof-expandCenter" />
      </div>

      <div className="space-y-4">
        {prompts.map((p, i) => (
          <div key={i} className={`p-5 rounded-xl border border-slate-700/40 bg-slate-900/30 animate-sof-fadeInUp sof-stagger-${i + 1}`}>
            <p className="text-base text-slate-200 italic leading-relaxed font-serif">{p}</p>
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">
          {mode === 'deep' ? 'Reflection on all three prompts (optional)' : 'Brief response (optional)'}
        </label>
        <textarea
          value={practiceReflection}
          onChange={e => onReflectionChange(e.target.value)}
          placeholder="What emerges as you sit with these questions..."
          rows={4}
          className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-600/50 resize-none transition-colors"
        />
      </div>
      <p className="text-xs text-slate-500">
        Session will be saved to your Intelligence Hub for cross-practice synthesis.
      </p>
    </div>
  );
}
