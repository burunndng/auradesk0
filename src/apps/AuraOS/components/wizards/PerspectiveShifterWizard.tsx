
import React, { useState, useEffect } from 'react';
import { PerspectiveShifterSession, Perspective, IntegratedInsight } from '../../types.ts';
import { WizardFrame } from '../shared/WizardFrame.tsx';
import { useWizardDraft } from '../../hooks/useWizardDraft.ts';
import {
  generatePerspectiveReflection,
  synthesizeAllPerspectives,
  generateActionPlanFromPerspectives
} from '../../services/perspectiveShifterService.ts';

interface PerspectiveShifterWizardProps {
  onClose: () => void;
  onSave: (session: PerspectiveShifterSession) => void;
  session: PerspectiveShifterSession | null;
  setDraft: (session: PerspectiveShifterSession | null) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

type SimplifiedStep = 'SITUATION' | 'FIRST_PERSON' | 'SECOND_PERSON' | 'THIRD_PERSON' | 'WITNESS' | 'MAP' | 'ACTION' | 'COMPLETE';

const STEP_LABELS: Record<SimplifiedStep, string> = {
  SITUATION: 'The Stuck Situation',
  FIRST_PERSON: 'Your Perspective',
  SECOND_PERSON: 'Their Perspective',
  THIRD_PERSON: 'Observer View',
  WITNESS: 'Witness View',
  MAP: 'Perspective Map',
  ACTION: 'Your Action Plan',
  COMPLETE: 'Complete'
};

const STEPS: SimplifiedStep[] = ['SITUATION', 'FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON', 'WITNESS', 'MAP', 'ACTION', 'COMPLETE'];

// Guiding questions for each perspective
const GUIDANCE: Record<string, string[]> = {
  FIRST_PERSON: [
    'What do I need or want in this situation?',
    'What am I afraid of?',
    'What am I protecting?',
    'What would feel fair or right to me?'
  ],
  SECOND_PERSON: [
    'What might they need or want?',
    'What might they be afraid of?',
    'What are they protecting?',
    'What would feel fair or right to them?'
  ],
  THIRD_PERSON: [
    'What is the pattern I notice?',
    'What are both sides defending?',
    'Where is there real disagreement vs. misunderstanding?',
    'What is each side not seeing?'
  ],
  WITNESS: [
    'What remains when you stop defending any position?',
    'What is simply here, without needing to be resolved?',
    'Where is there shared longing beneath the conflict?',
    'What would compassion — not agreement — look like right now?'
  ]
};

// Observer lenses — belong on the THIRD_PERSON (Observer) step
interface PerspectiveTemplate {
  name: string;
  description: string;
  prompt: string;
}

const OBSERVER_LENSES: PerspectiveTemplate[] = [
  {
    name: "Devil's Advocate",
    description: "Challenge assumptions with opposing viewpoints",
    prompt: "What if the opposite were true? What arguments challenge my current position?"
  },
  {
    name: "Empathetic Observer",
    description: "Deep understanding of emotional states",
    prompt: "What emotions are present? What unspoken needs lie beneath the surface?"
  },
  {
    name: "Future Self",
    description: "Wisdom from your future perspective",
    prompt: "Looking back a year from now, what would I wish I had understood about this situation?"
  },
  {
    name: "Wise Mentor",
    description: "Guidance from a trusted advisor",
    prompt: "What would someone I deeply respect say about this? What wisdom applies here?"
  }
];

interface PerspectiveCardProps {
  type: Perspective['type'];
  description: string;
  reflection?: string;
  isActive: boolean;
}

const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ type, description, reflection, isActive }) => {
  const colors: Record<Perspective['type'], { bg: string; border: string; text: string }> = {
    'First Person (You)': { bg: 'bg-neutral-900/40', border: 'border-neutral-600', text: 'text-neutral-300' },
    'Second Person (Them)': { bg: 'bg-neutral-900/40', border: 'border-neutral-600', text: 'text-neutral-300' },
    'Third Person (Observer)': { bg: 'bg-amber-900/40', border: 'border-amber-600', text: 'text-amber-300' },
    'Witness (Pure Awareness)': { bg: 'bg-neutral-900/40', border: 'border-neutral-600', text: 'text-neutral-300' }
  };
  const color = colors[type];
  return (
    <div className={`${color.bg} border-2 ${color.border} rounded-lg p-4 ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800' : ''}`}>
      <h4 className={`font-bold text-sm mb-2 ${color.text}`}>{type}</h4>
      <p className="text-slate-300 text-sm mb-3 leading-relaxed">{description || '[Empty]'}</p>
      {reflection && (
        <div className="bg-neutral-900/50 p-2 rounded border border-neutral-700">
          <p className="text-xs text-slate-400 italic">Aura: {reflection}</p>
        </div>
      )}
    </div>
  );
};

type ModeType = 'free' | 'guided';

const initialSession: PerspectiveShifterSession = {
  id: '',
  date: '',
  currentStep: 'SITUATION',
  stuckSituation: '',
  perspectives: [],
  synthesis: '',
  realityCheckRefinement: '',
  dailyTracking: {}
};

export default function PerspectiveShifterWizard({
  onClose,
  onSave,
  session: externalDraft,
  setDraft: setExternalDraft,
  userId,
  insightContext,
  markInsightAsAddressed
}: PerspectiveShifterWizardProps) {
  const [draft, updateDraft, , clearDraft] = useWizardDraft<PerspectiveShifterSession>(
    'aura-draft-perspective-shifter',
    externalDraft ?? initialSession
  );

  const [step, setStep] = useState<SimplifiedStep>((externalDraft?.currentStep as SimplifiedStep) || 'SITUATION');
  const [mode, setMode] = useState<ModeType>('guided');
  const [situation, setSituation] = useState(externalDraft?.stuckSituation || draft.stuckSituation || '');
  const [perspectives, setPerspectives] = useState<Record<Perspective['type'], { description: string; reflection?: string }>>(() => {
    const base: Record<Perspective['type'], { description: string; reflection?: string }> = {
      'First Person (You)': { description: '' },
      'Second Person (Them)': { description: '' },
      'Third Person (Observer)': { description: '' },
      'Witness (Pure Awareness)': { description: '' }
    };
    const source = externalDraft ?? draft;
    if (source.perspectives?.length > 0) {
      source.perspectives.forEach(p => {
        base[p.type] = { description: p.description, reflection: p.reflection };
      });
    }
    return base;
  });
  const [synthesis, setSynthesis] = useState(externalDraft?.synthesis || draft.synthesis || '');
  const [actionPlan, setActionPlan] = useState(externalDraft?.realityCheckRefinement || draft.realityCheckRefinement || '');
  const [integrationNote, setIntegrationNote] = useState(externalDraft?.integrationNote || draft.integrationNote || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedInsightId] = useState<string | undefined>(externalDraft?.linkedInsightId || insightContext?.id);

  // Keep external draft prop in sync
  useEffect(() => {
    if (externalDraft) {
      setSituation(externalDraft.stuckSituation);
      if (externalDraft.perspectives.length > 0) {
        const map: Record<Perspective['type'], { description: string; reflection?: string }> = {
          'First Person (You)': { description: '' },
          'Second Person (Them)': { description: '' },
          'Third Person (Observer)': { description: '' },
          'Witness (Pure Awareness)': { description: '' }
        };
        externalDraft.perspectives.forEach(p => {
          map[p.type] = { description: p.description, reflection: p.reflection };
        });
        setPerspectives(map);
      }
      if (externalDraft.synthesis) setSynthesis(externalDraft.synthesis);
      if (externalDraft.realityCheckRefinement) setActionPlan(externalDraft.realityCheckRefinement);
      if (externalDraft.integrationNote) setIntegrationNote(externalDraft.integrationNote);
    }
  }, [externalDraft]);

  const buildSession = (overrides: Partial<PerspectiveShifterSession> = {}): PerspectiveShifterSession => {
    const perspectivesList: Perspective[] = Object.entries(perspectives).map(([type, data]) => ({
      type: type as Perspective['type'],
      description: data.description,
      reflection: data.reflection
    }));
    return {
      id: externalDraft?.id || draft.id || `ps-${Date.now()}`,
      date: externalDraft?.date || draft.date || new Date().toISOString(),
      currentStep: step,
      stuckSituation: situation,
      perspectives: perspectivesList,
      synthesis,
      realityCheckRefinement: actionPlan,
      dailyTracking: {},
      linkedInsightId,
      integrationNote,
      ...overrides
    };
  };

  const handleSaveDraft = () => {
    const s = buildSession();
    updateDraft(s);
    setExternalDraft(s);
    onClose();
  };

  const currentPerspectiveType = (): Perspective['type'] | null => {
    const map: Record<SimplifiedStep, Perspective['type'] | null> = {
      SITUATION: null,
      FIRST_PERSON: 'First Person (You)',
      SECOND_PERSON: 'Second Person (Them)',
      THIRD_PERSON: 'Third Person (Observer)',
      WITNESS: 'Witness (Pure Awareness)',
      MAP: null,
      ACTION: null,
      COMPLETE: null
    };
    return map[step];
  };

  const handleNext = async () => {
    setError('');

    if (step === 'SITUATION' && !situation.trim()) {
      setError('Please describe your stuck situation.');
      return;
    }

    if (['FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON', 'WITNESS'].includes(step)) {
      const perspectiveType = currentPerspectiveType()!;
      if (!perspectives[perspectiveType]?.description.trim()) {
        setError(`Please describe the ${perspectiveType} perspective.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (['FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON', 'WITNESS'].includes(step)) {
        const perspectiveType = currentPerspectiveType()!;
        const reflection = await generatePerspectiveReflection(
          situation,
          perspectiveType,
          perspectives[perspectiveType].description
        );
        setPerspectives(prev => ({
          ...prev,
          [perspectiveType]: { ...prev[perspectiveType], reflection }
        }));

        if (step === 'WITNESS') {
          const perspectivesList = Object.entries(perspectives).map(([type, data]) => ({
            type: type as Perspective['type'],
            description: data.description,
            reflection: data.reflection
          }));
          const synth = await synthesizeAllPerspectives(situation, perspectivesList);
          setSynthesis(synth);
          setStep('MAP');
        } else {
          const stepOrder: SimplifiedStep[] = ['FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON', 'WITNESS'];
          const nextIdx = stepOrder.indexOf(step as SimplifiedStep) + 1;
          setStep(stepOrder[nextIdx]);
        }
      } else if (step === 'MAP') {
        const plan = await generateActionPlanFromPerspectives(situation, synthesis);
        setActionPlan(plan);
        setStep('ACTION');
      } else if (step === 'ACTION') {
        const perspectivesList: Perspective[] = Object.entries(perspectives).map(([type, data]) => ({
          type: type as Perspective['type'],
          description: data.description,
          reflection: data.reflection
        }));
        const session: PerspectiveShifterSession = {
          id: externalDraft?.id || draft.id || `ps-${Date.now()}`,
          date: new Date().toISOString(),
          currentStep: 'COMPLETE',
          stuckSituation: situation,
          perspectives: perspectivesList,
          synthesis,
          realityCheckRefinement: actionPlan,
          dailyTracking: {},
          linkedInsightId,
          integrationNote
        };
        onSave(session);
        if (linkedInsightId) {
          markInsightAsAddressed(linkedInsightId, 'Perspective Shifter', session.id);
        }
        clearDraft();
        setStep('COMPLETE');
      } else if (step === 'SITUATION') {
        setStep('FIRST_PERSON');
      } else {
        const currentIndex = STEPS.indexOf(step);
        if (currentIndex < STEPS.length - 1) {
          setStep(STEPS[currentIndex + 1]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const currentIdx = STEPS.indexOf(step);
    if (currentIdx > 0) {
      setStep(STEPS[currentIdx - 1]);
    }
  };

  const handleDownload = () => {
    const content = `# Perspective Shifter Session
Date: ${new Date().toLocaleDateString()}

## The Stuck Situation
${situation}

---

## Perspectives

### Your Perspective (1st Person)
${perspectives['First Person (You)'].description}

**Aura's Reflection**: ${perspectives['First Person (You)'].reflection || 'None yet'}

---

### Their Perspective (2nd Person)
${perspectives['Second Person (Them)'].description}

**Aura's Reflection**: ${perspectives['Second Person (Them)'].reflection || 'None yet'}

---

### Observer Perspective (3rd Person)
${perspectives['Third Person (Observer)'].description}

**Aura's Reflection**: ${perspectives['Third Person (Observer)'].reflection || 'None yet'}

---

### Witness Perspective (Pure Awareness)
${perspectives['Witness (Pure Awareness)'].description}

**Aura's Reflection**: ${perspectives['Witness (Pure Awareness)'].reflection || 'None yet'}

---

## Synthesis
${synthesis}

---

## Your Action Plan
${actionPlan}

---

## Integration Note
${integrationNote || '(none)'}

---

Generated by Aura ILP
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perspective-shifter-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stepIndex = STEPS.indexOf(step);
  const canProceed =
    (step === 'SITUATION' && !!situation.trim()) ||
    (step === 'FIRST_PERSON' && !!perspectives['First Person (You)'].description.trim()) ||
    (step === 'SECOND_PERSON' && !!perspectives['Second Person (Them)'].description.trim()) ||
    (step === 'THIRD_PERSON' && !!perspectives['Third Person (Observer)'].description.trim()) ||
    (step === 'WITNESS' && !!perspectives['Witness (Pure Awareness)'].description.trim()) ||
    step === 'MAP' ||
    (step === 'ACTION' && !!actionPlan.trim()) ||
    step === 'COMPLETE';

  const isCompleteStep = step === 'COMPLETE';
  const nextButtonText =
    isCompleteStep ? 'Done' :
    step === 'ACTION' ? 'Complete & Save' :
    isLoading ? 'Processing...' : 'Next';

  return (
    <WizardFrame
      title="Perspective Shifter"
      currentStep={stepIndex + 1}
      totalSteps={STEPS.length}
      isLoading={isLoading}
      showBackButton={step !== 'SITUATION' && step !== 'COMPLETE'}
      nextButtonText={nextButtonText}
      onClose={isCompleteStep ? onClose : handleSaveDraft}
      onBack={handleBack}
      onNext={isCompleteStep ? onClose : handleNext}
      accentColor="amber"
      nextButtonDisabled={!canProceed || isLoading}
      errorMessage={error || null}
      headerSlot={
        insightContext ? (
          <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3">
            <p className="text-xs text-teal-200 break-words">
              <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
            </p>
          </div>
        ) : undefined
      }
      leftFooterSlot={
        !isCompleteStep ? (
          <button onClick={handleSaveDraft} className="text-xs text-slate-400 hover:text-white transition">
            Save & Exit
          </button>
        ) : undefined
      }
    >
      {/* SITUATION */}
      {step === 'SITUATION' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">Describe Your Stuck Situation</h3>
            <p className="text-slate-400 text-xs sm:text-sm">A situation where you feel stuck or misunderstood. Who is involved? What's the conflict or confusion?</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setMode('guided')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                mode === 'guided' ? 'bg-amber-600 text-white' : 'bg-neutral-700/50 text-slate-400 hover:bg-neutral-700'
              }`}
            >
              Guided Mode
            </button>
            <button
              onClick={() => setMode('free')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                mode === 'free' ? 'bg-amber-600 text-white' : 'bg-neutral-700/50 text-slate-400 hover:bg-neutral-700'
              }`}
            >
              Free Form
            </button>
          </div>

          {/* Contraindication framing */}
          <p className="text-xs text-stone-400 italic bg-stone-900/30 border border-stone-700/40 rounded p-2">
            Perspective-taking works best with some emotional distance. If you're in acute conflict or tend to prioritize others' needs over your own, spend extra time on the First Person step — your own experience matters most here.
          </p>

          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            rows={5}
            placeholder="E.g., 'I want to set boundaries with my partner about work stress, but they think I'm being cold...'"
            className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm"
          />

          <p className="text-xs text-stone-500 italic">
            This practice draws on integral perspectivalism — inhabiting 1st, 2nd, 3rd, and Witness views to find new movement in stuck situations.
          </p>
        </div>
      )}

      {/* PERSPECTIVE STEPS */}
      {['FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON', 'WITNESS'].includes(step) && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">
              {STEP_LABELS[step]}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              {step === 'FIRST_PERSON' && 'From your own eyes, what is true? What do you need?'}
              {step === 'SECOND_PERSON' && 'Genuinely imagine you are them. What is their experience?'}
              {step === 'THIRD_PERSON' && 'Step back as a caring observer. What is the pattern?'}
              {step === 'WITNESS' && "The Witness isn't another opinion — it's the awareness that holds all views simultaneously. Not what you think from above, but what is simply present when you stop needing to be right."}
            </p>
          </div>

          {/* Somatic settling — Witness step only */}
          {step === 'WITNESS' && (
            <div className="bg-stone-900/40 border border-stone-700/50 rounded-lg p-3 text-xs text-stone-300 italic mb-1">
              Before writing, pause. Feel the weight of your body in your seat. Notice your breath without changing it. From this settled place — aware of the situation but not caught in it — what do you notice?
            </div>
          )}

          {/* Observer Lenses — THIRD_PERSON + guided mode only */}
          {mode === 'guided' && step === 'THIRD_PERSON' && (
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-slate-400 font-semibold mb-2">Observer Lenses (optional):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OBSERVER_LENSES.map((lens, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const perspectiveType = currentPerspectiveType()!;
                      setPerspectives(prev => ({
                        ...prev,
                        [perspectiveType]: { ...prev[perspectiveType], description: lens.prompt }
                      }));
                    }}
                    className="bg-stone-900/50 hover:bg-stone-800 border border-stone-700 hover:border-amber-600 rounded-lg p-2 sm:p-3 text-left transition group"
                  >
                    <p className="text-xs sm:text-sm font-semibold text-amber-300 group-hover:text-amber-200 mb-1">{lens.name}</p>
                    <p className="text-xs text-slate-400">{lens.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guiding Questions — guided mode */}
          {mode === 'guided' && (
            <div className="bg-neutral-900/30 border border-neutral-700 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-slate-400 font-semibold mb-2">Guiding questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {GUIDANCE[step]?.map((q, i) => {
                  const perspectiveType = currentPerspectiveType()!;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const current = perspectives[perspectiveType]?.description || '';
                        const addition = current ? `\n\n${q}\n` : `${q}\n`;
                        setPerspectives(prev => ({
                          ...prev,
                          [perspectiveType]: { ...prev[perspectiveType], description: current + addition }
                        }));
                      }}
                      className="bg-stone-900/40 hover:bg-stone-800/60 border border-stone-700/50 hover:border-rose-600/50 rounded-md p-2 text-left transition group"
                    >
                      <p className="text-xs sm:text-sm text-rose-200 group-hover:text-rose-100">{q}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(() => {
            const perspectiveType = currentPerspectiveType()!;
            return (
              <textarea
                value={perspectives[perspectiveType]?.description || ''}
                onChange={e => {
                  setPerspectives(prev => ({
                    ...prev,
                    [perspectiveType]: { ...prev[perspectiveType], description: e.target.value }
                  }));
                }}
                rows={5}
                placeholder="Write from this perspective..."
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm"
              />
            );
          })()}

          {(() => {
            const perspectiveType = currentPerspectiveType()!;
            return perspectives[perspectiveType]?.reflection && !isLoading && (
              <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4 animate-fade-in">
                <p className="text-xs text-orange-300 font-semibold mb-1">Aura's Reflection</p>
                <p className="text-sm text-slate-300">{perspectives[perspectiveType].reflection}</p>
              </div>
            );
          })()}

          {isLoading && <p className="text-slate-400 text-sm animate-pulse">Aura is reflecting...</p>}
        </div>
      )}

      {/* MAP */}
      {step === 'MAP' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">Your Perspective Map</h3>
            <p className="text-slate-400 text-xs sm:text-sm">All four perspectives, showing how they fit together:</p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-400 animate-pulse text-xs sm:text-sm">Synthesizing perspectives...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <PerspectiveCard type="First Person (You)" description={perspectives['First Person (You)'].description} reflection={perspectives['First Person (You)'].reflection} isActive={false} />
                <PerspectiveCard type="Second Person (Them)" description={perspectives['Second Person (Them)'].description} reflection={perspectives['Second Person (Them)'].reflection} isActive={false} />
                <PerspectiveCard type="Third Person (Observer)" description={perspectives['Third Person (Observer)'].description} reflection={perspectives['Third Person (Observer)'].reflection} isActive={false} />
                <PerspectiveCard type="Witness (Pure Awareness)" description={perspectives['Witness (Pure Awareness)'].description} reflection={perspectives['Witness (Pure Awareness)'].reflection} isActive={false} />
              </div>

              <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-slate-200 mb-2 text-xs sm:text-sm">Integration Synthesis</h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed break-words">{synthesis}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ACTION */}
      {step === 'ACTION' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">Your Action Plan</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Now that you can hold all perspectives, here's a concrete approach:
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-400 animate-pulse text-xs sm:text-sm">Generating action plan...</p>
            </div>
          ) : (
            <>
              {actionPlan && (
                <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{actionPlan}</p>
                </div>
              )}
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Refine it or write your own:</label>
              <textarea
                value={actionPlan}
                onChange={e => setActionPlan(e.target.value)}
                rows={5}
                placeholder="E.g., 'I will tell them: I value our connection. When work gets stressful, I need some quiet time to recharge...'"
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm"
              />
            </>
          )}
        </div>
      )}

      {/* COMPLETE */}
      {step === 'COMPLETE' && (
        <div className="space-y-6 py-4 sm:py-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-900/30 border border-green-600/40 flex items-center justify-center">
              <span className="text-green-400 text-2xl">✓</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-100">Session Complete</h3>
            <p className="text-slate-400 max-w-md mx-auto text-xs sm:text-sm px-4">
              You've mapped all perspectives and created an action plan.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-300">
              Before you close — what will you carry from this session?
            </label>
            <textarea
              value={integrationNote}
              onChange={e => setIntegrationNote(e.target.value)}
              rows={3}
              placeholder="One thing I noticed, or want to try, is..."
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm"
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition text-xs sm:text-sm"
            >
              Download session
            </button>
          </div>
        </div>
      )}
    </WizardFrame>
  );
}
