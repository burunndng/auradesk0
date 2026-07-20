/**
 * TreeOfLifeWizard.tsx
 * Spirit module (teal accent) — 8-step Kabbalistic pathworking practice.
 *
 * Steps:
 *   1. Challenge Identification
 *   2. Sephira Resonance (select or confirm)
 *   3. Grounding Questions (AI-generated, user responds)
 *   4. Shadow Inquiry (Qliphoth reflection)
 *   5. Pathworking Contemplation (guided visualization)
 *   6. What Emerged (guided conversation)
 *   7. Integration Commitment
 *   8. Synthesis (AI insight generation)
 */
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getIconComponent } from '../../.claude/lib/iconMap.ts';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { TreeOfLifePracticeSession, TreeOfLifeChatMessage } from '../../types';
import { SEPHIROT, QLIPHOTH, getSephira } from '../../constants/treeOfLifePrompts';
import {
  generateSephiraQuestions,
  getPathworkingVisualization,
  generateEmergenceResponse,
  generateTreeOfLifeInsight,
} from '../../services/treeOfLifeCoachingService';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import { practices } from '../../constants';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-tree-of-life';
const TOTAL_STEPS = 8;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface DraftState {
  step: Step;
  session: Partial<TreeOfLifePracticeSession>;
  groundingAnswer: string;
  groundingAnswerIndex: number;
  emergenceInput: string;
  emergenceExchanges: TreeOfLifeChatMessage[];
  insightGenerated: boolean;
}

const makeInitialDraft = (): DraftState => ({
  step: 1,
  session: {
    id: `tree-${Date.now()}`,
    date: new Date().toISOString(),
    challengeText: '',
    groundingResponses: [],
    generatedQuestions: [],
    qliphothReflection: '',
    pathworkingVisualization: '',
    pathworkingReport: '',
    emergenceExchanges: [],
    integrationCommitment: '',
    sephiraId: '',
    sephiraName: '',
  },
  groundingAnswer: '',
  groundingAnswerIndex: 0,
  emergenceInput: '',
  emergenceExchanges: [],
  insightGenerated: false,
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TreeOfLifeWizardProps {
  onClose: () => void;
  userId?: string;
  initialSephiraId?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TreeOfLifeWizard({ onClose, userId, initialSephiraId }: TreeOfLifeWizardProps) {
  const [draft, updateDraft, , clearDraft] = useWizardDraft<DraftState>(DRAFT_KEY, makeInitialDraft());

  const [isLoading, setIsLoading] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState<string | null>(null);

  // Step-local text inputs kept in top-level state (Rules of Hooks compliance)
  const [challengeInput, setChallengeInput] = useState('');
  const [qliphothInput, setQliphothInput] = useState('');
  const [pathworkingInput, setPathworkingInput] = useState('');
  const [pathworkingRead, setPathworkingRead] = useState(false);
  const [commitmentInput, setCommitmentInput] = useState('');

  const emergenceEndRef = useRef<HTMLDivElement>(null);

  // Auto-select sephira if provided from D3 viz
  useEffect(() => {
    if (initialSephiraId && !draft.session.sephiraId) {
      const s = getSephira(initialSephiraId);
      if (s) {
        updateDraft(prev => ({
          ...prev,
          session: { ...prev.session, sephiraId: s.id, sephiraName: s.name },
        }));
      }
    }
  }, [initialSephiraId]);

  // Scroll emergence chat to bottom
  useEffect(() => {
    emergenceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [draft.emergenceExchanges]);

  // Reset step-local inputs when step changes so they start fresh
  useEffect(() => {
    setQliphothInput('');
    setPathworkingInput('');
    setPathworkingRead(false);
    setCommitmentInput('');
    setCrisisMessage(null);
  }, [draft.step]);

  // ---------------------------------------------------------------------------
  // Crisis check
  // ---------------------------------------------------------------------------
  function checkCrisis(text: string) {
    const level = detectCrisisLevel(text);
    if (level === 'high') {
      setCrisisMessage(
        'I\'m noticing some distress in what you\'ve written. If you\'re in crisis, please reach out to a mental health professional or crisis line (e.g. 988 Suicide & Crisis Lifeline). This practice is not a substitute for professional support.'
      );
    } else if (level === 'concern') {
      setCrisisMessage(
        'It sounds like you may be going through something difficult. This practice can support reflection, but please also consider reaching out to a therapist or counselor.'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  function goToStep(step: Step) {
    updateDraft(prev => ({ ...prev, step }));
  }

  // ---------------------------------------------------------------------------
  // Step 1 → next: challenge confirmed
  // ---------------------------------------------------------------------------
  function handleChallengeNext() {
    const text = challengeInput.trim();
    if (!text) return;
    checkCrisis(text);
    const nextStep: Step = draft.session.sephiraId ? 3 : 2;
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, challengeText: text },
      step: nextStep,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 2: sephira selected
  // ---------------------------------------------------------------------------
  function handleSephiraSelect(sephiraId: string) {
    const s = getSephira(sephiraId);
    if (!s) return;
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, sephiraId: s.id, sephiraName: s.name },
      step: 3,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 3: load AI questions
  // ---------------------------------------------------------------------------
  async function loadGroundingQuestions() {
    const { sephiraId, challengeText } = draft.session;
    if (!sephiraId || !challengeText) return;
    setIsLoading(true);
    const result = await generateSephiraQuestions(sephiraId, challengeText);
    setIsLoading(false);
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, generatedQuestions: result.questions },
      groundingAnswerIndex: 0,
      groundingAnswer: '',
    }));
  }

  function handleGroundingAnswer() {
    const answer = draft.groundingAnswer.trim();
    if (!answer) return;
    checkCrisis(answer);

    const currentResponses = draft.session.groundingResponses ?? [];
    const newResponses = [...currentResponses, answer];
    const nextIndex = draft.groundingAnswerIndex + 1;
    const questions = draft.session.generatedQuestions ?? [];

    if (nextIndex >= questions.length) {
      updateDraft(prev => ({
        ...prev,
        session: { ...prev.session, groundingResponses: newResponses },
        groundingAnswer: '',
        groundingAnswerIndex: nextIndex,
        step: 4,
      }));
    } else {
      updateDraft(prev => ({
        ...prev,
        session: { ...prev.session, groundingResponses: newResponses },
        groundingAnswer: '',
        groundingAnswerIndex: nextIndex,
      }));
    }
  }

  // ---------------------------------------------------------------------------
  // Step 4: qliphoth reflection
  // ---------------------------------------------------------------------------
  function handleQliphothNext() {
    if (!qliphothInput.trim()) return;
    checkCrisis(qliphothInput);
    const viz = getPathworkingVisualization(
      draft.session.sephiraId ?? '',
      draft.session.challengeText ?? ''
    );
    updateDraft(prev => ({
      ...prev,
      session: {
        ...prev.session,
        qliphothReflection: qliphothInput.trim(),
        pathworkingVisualization: viz,
      },
      step: 5,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 5: pathworking report
  // ---------------------------------------------------------------------------
  function handlePathworkingNext() {
    if (!pathworkingInput.trim()) return;
    checkCrisis(pathworkingInput);
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, pathworkingReport: pathworkingInput.trim() },
      step: 6,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 6: emergence conversation
  // ---------------------------------------------------------------------------
  async function handleEmergenceSend() {
    const text = draft.emergenceInput.trim();
    if (!text || isLoading) return;
    checkCrisis(text);

    const userMsg: TreeOfLifeChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newExchanges = [...draft.emergenceExchanges, userMsg];
    updateDraft(prev => ({ ...prev, emergenceInput: '', emergenceExchanges: newExchanges }));

    setIsLoading(true);
    const response = await generateEmergenceResponse(
      draft.session.sephiraId ?? '',
      draft.session.challengeText ?? '',
      draft.session.pathworkingReport ?? ''
    );
    setIsLoading(false);

    if (response.success) {
      const assistantMsg: TreeOfLifeChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };
      updateDraft(prev => ({
        ...prev,
        emergenceExchanges: [...prev.emergenceExchanges, assistantMsg],
      }));
    }
  }

  function handleEmergenceProceed() {
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, emergenceExchanges: prev.emergenceExchanges },
      step: 7,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 7: integration commitment
  // ---------------------------------------------------------------------------
  function handleIntegrationNext() {
    if (!commitmentInput.trim()) return;
    updateDraft(prev => ({
      ...prev,
      session: { ...prev.session, integrationCommitment: commitmentInput.trim() },
      step: 8,
    }));
  }

  // ---------------------------------------------------------------------------
  // Step 8: generate insight
  // ---------------------------------------------------------------------------
  async function handleGenerateInsight() {
    if (draft.insightGenerated) return;
    setIsLoading(true);

    const allPractices = [
      ...(Array.isArray(practices.body) ? practices.body : Object.values(practices.body ?? {})),
      ...(Array.isArray(practices.mind) ? practices.mind : Object.values(practices.mind ?? {})),
      ...(Array.isArray(practices.spirit) ? practices.spirit : Object.values(practices.spirit ?? {})),
      ...(Array.isArray(practices.shadow) ? practices.shadow : Object.values(practices.shadow ?? {})),
    ].flat().filter((p): p is { id: string; name: string; category?: string } =>
      p != null && typeof p === 'object' && 'id' in p && 'name' in p
    );

    const insight = await generateTreeOfLifeInsight({
      sephiraId: draft.session.sephiraId ?? '',
      challengeText: draft.session.challengeText ?? '',
      groundingResponses: draft.session.groundingResponses ?? [],
      qliphothReflection: draft.session.qliphothReflection ?? '',
      pathworkingReport: draft.session.pathworkingReport ?? '',
      integrationCommitment: draft.session.integrationCommitment ?? '',
      availablePractices: allPractices,
    });

    setIsLoading(false);
    updateDraft(prev => ({
      ...prev,
      insightGenerated: true,
      session: { ...prev.session, linkedInsightId: insight ? `tol-${Date.now()}` : undefined },
    }));
  }

  function handleFinish() {
    clearDraft();
    onClose();
  }

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const STEP_LABELS: Record<Step, string> = {
    1: 'Challenge',
    2: 'Sephira',
    3: 'Grounding',
    4: 'Shadow',
    5: 'Pathworking',
    6: 'Emergence',
    7: 'Integration',
    8: 'Synthesis',
  };

  const selectedSephira = draft.session.sephiraId ? getSephira(draft.session.sephiraId) : null;
  const qliphoth = draft.session.sephiraId ? QLIPHOTH[draft.session.sephiraId] : null;
  const questions = draft.session.generatedQuestions ?? [];
  const currentQuestion = questions[draft.groundingAnswerIndex];
  const answeredResponses = draft.session.groundingResponses ?? [];
  const viz = draft.session.pathworkingVisualization
    ?? (draft.session.sephiraId ? getPathworkingVisualization(draft.session.sephiraId, draft.session.challengeText ?? '') : '');

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <WizardFrame
      title={`Tree of Life — ${STEP_LABELS[draft.step]}`}
      currentStep={draft.step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      accentColor="teal"
      onClose={onClose}
      onBack={() => { if (draft.step > 1) goToStep((draft.step - 1) as Step); }}
      showBackButton={draft.step > 1 && draft.step < 8}
      onNext={() => { /* controlled per-step */ }}
      nextButtonText=""
    >
      <div className="p-4 sm:p-6 space-y-6">

        {/* Crisis message */}
        {crisisMessage && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300">
            {crisisMessage}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Challenge Identification */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">What are you carrying?</h3>
              <p className="text-sm text-slate-400">
                Name a current challenge, area of growth, or question that calls for deeper attention.
                This anchors the practice in your real life, not abstraction.
              </p>
            </div>
            <textarea
              value={challengeInput}
              onChange={e => setChallengeInput(e.target.value)}
              placeholder="Describe what's alive for you right now..."
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 resize-none"
            />
            {initialSephiraId && getSephira(initialSephiraId) && (
              <p className="text-xs text-teal-400/70">
                Sephira selected: {getSephira(initialSephiraId)!.name}
              </p>
            )}
            <button
              onClick={handleChallengeNext}
              disabled={!challengeInput.trim()}
              className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 disabled:opacity-40 transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: Sephira Resonance */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">Choose your Sephira</h3>
              <p className="text-sm text-slate-400">
                Each Sephira represents a different quality of consciousness.
                Which resonates with your challenge?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEPHIROT.map(sephira => (
                <button
                  key={sephira.id}
                  onClick={() => handleSephiraSelect(sephira.id)}
                  className="p-3 rounded-lg border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/60 transition text-left"
                >
                  <p className="text-sm font-semibold text-slate-200">{sephira.name}</p>
                  <p className="text-xs text-slate-500">{sephira.hebrew} · {sephira.archetype}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: Grounding Questions */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 3 && (
          <div className="space-y-5">
            {selectedSephira && (
              <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
                <p className="text-xs text-teal-400 font-semibold">{selectedSephira.name} · {selectedSephira.archetype}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedSephira.description}</p>
              </div>
            )}

            {questions.length === 0 && !isLoading && (
              <div className="text-center py-6">
                <button
                  onClick={loadGroundingQuestions}
                  className="px-6 py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 transition"
                >
                  Generate grounding questions
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating questions for your challenge...
              </div>
            )}

            {/* Previously answered */}
            {answeredResponses.map((resp, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs text-teal-400/80 font-medium">{questions[i]}</p>
                <p className="text-sm text-slate-300 bg-slate-800/40 rounded p-2">{resp}</p>
              </div>
            ))}

            {/* Current question */}
            {currentQuestion && (
              <div className="space-y-3">
                <p className="text-sm text-slate-200 font-medium leading-relaxed">{currentQuestion}</p>
                <textarea
                  value={draft.groundingAnswer}
                  onChange={e => updateDraft(prev => ({ ...prev, groundingAnswer: e.target.value }))}
                  placeholder="Respond with genuine reflection..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 resize-none"
                />
                <p className="text-xs text-slate-500">Question {draft.groundingAnswerIndex + 1} of {questions.length}</p>
                <button
                  onClick={handleGroundingAnswer}
                  disabled={!draft.groundingAnswer.trim()}
                  className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 disabled:opacity-40 transition"
                >
                  {draft.groundingAnswerIndex + 1 < questions.length ? 'Next question' : 'Proceed to Shadow Inquiry'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: Shadow Inquiry */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-purple-300 mb-2">Shadow Inquiry</h3>
              <p className="text-sm text-slate-400">
                Every Sephira has a shadow pole — the Qliphoth. This is where the work gets real.
              </p>
            </div>

            {qliphoth && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-purple-300">{qliphoth.name}</p>
                <p className="text-sm text-slate-300 italic">{qliphoth.theme}</p>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">How this shadow manifests:</p>
                  {qliphoth.manifestations.map((m, i) => (
                    <p key={i} className="text-xs text-slate-400">• {m}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-slate-200 font-medium">
                Where might the shadow of {selectedSephira?.name} be active in your challenge right now?
              </p>
              <p className="text-xs text-slate-500">
                Be specific. The shadow hides in what feels justified.
              </p>
              <textarea
                value={qliphothInput}
                onChange={e => setQliphothInput(e.target.value)}
                placeholder="Reflect on where this shadow is present..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 resize-none"
              />
              <button
                onClick={handleQliphothNext}
                disabled={!qliphothInput.trim()}
                className="w-full py-3 bg-purple-800/30 border border-purple-500/40 rounded-lg text-sm text-purple-200 hover:bg-purple-800/50 disabled:opacity-40 transition"
              >
                Enter the Pathworking
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 5: Pathworking Contemplation */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">Pathworking</h3>
              <p className="text-sm text-slate-400">
                Read this slowly. Let it land. You may close your eyes and visualize as you go.
              </p>
            </div>

            <div className="rounded-lg border border-teal-500/20 bg-slate-800/40 p-5">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viz}</p>
            </div>

            {!pathworkingRead ? (
              <button
                onClick={() => setPathworkingRead(true)}
                className="w-full py-3 bg-teal-700/30 border border-teal-500/30 rounded-lg text-sm text-teal-300 hover:bg-teal-700/50 transition"
              >
                I have completed the visualization — reflect on what emerged
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-200 font-medium">What arose during the contemplation?</p>
                <p className="text-xs text-slate-500">Images, feelings, resistances, insights — whatever is real for you.</p>
                <textarea
                  value={pathworkingInput}
                  onChange={e => setPathworkingInput(e.target.value)}
                  placeholder="Describe what you experienced..."
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 resize-none"
                />
                <button
                  onClick={handlePathworkingNext}
                  disabled={!pathworkingInput.trim()}
                  className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 disabled:opacity-40 transition"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 6: What Emerged — guided conversation */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">What Emerged</h3>
              <p className="text-sm text-slate-400">
                Continue exploring with {selectedSephira?.name ?? 'the Sephira'} as your guide.
                When you feel complete, proceed to integration.
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/40 border border-slate-700 p-3">
              <p className="text-xs text-slate-500 mb-1">What emerged in your pathworking:</p>
              <p className="text-sm text-slate-300">{draft.session.pathworkingReport}</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {draft.emergenceExchanges.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-teal-700/30 text-slate-200'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 px-3 py-2 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  </div>
                </div>
              )}
              <div ref={emergenceEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={draft.emergenceInput}
                onChange={e => updateDraft(prev => ({ ...prev, emergenceInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEmergenceSend(); } }}
                placeholder="Continue the inquiry..."
                disabled={isLoading}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 disabled:opacity-50"
              />
              <button
                onClick={handleEmergenceSend}
                disabled={isLoading || !draft.emergenceInput.trim()}
                className="px-3 py-2 bg-teal-700/30 border border-teal-500/40 rounded-lg hover:bg-teal-700/50 disabled:opacity-40 transition"
              >
                {React.createElement(getIconComponent('PsychopompLantern') || 'div', { className: 'w-4 h-4 text-teal-300' })}
              </button>
            </div>

            <button
              onClick={handleEmergenceProceed}
              className="w-full py-3 border border-teal-500/30 rounded-lg text-sm text-teal-300 hover:bg-teal-800/20 transition"
            >
              Proceed to Integration →
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 7: Integration Commitment */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 7 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">Grounding in Malkuth</h3>
              <p className="text-sm text-slate-400">
                The final Sephira is Malkuth — the Kingdom, embodied reality.
                All insight must land in the world of action.
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/40 border border-slate-700 p-4">
              <p className="text-sm text-slate-300 font-medium">
                One thing I commit to this week that embodies {selectedSephira?.name ?? 'this Sephira'}'s quality:
              </p>
            </div>

            <textarea
              value={commitmentInput}
              onChange={e => setCommitmentInput(e.target.value)}
              placeholder="State a specific, concrete action — not a concept..."
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 resize-none"
            />

            <button
              onClick={handleIntegrationNext}
              disabled={!commitmentInput.trim()}
              className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 disabled:opacity-40 transition"
            >
              Complete the Practice
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 8: Synthesis */}
        {/* ------------------------------------------------------------------ */}
        {draft.step === 8 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-teal-300 mb-2">Synthesis</h3>
              <p className="text-sm text-slate-400">
                Your practice with {selectedSephira?.name} is complete.
                Generate an insight to capture what emerged and connect it to the Intelligence Hub.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <div>
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-wide mb-1">Challenge</p>
                <p className="text-sm text-slate-300">{draft.session.challengeText}</p>
              </div>
              <div>
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide mb-1">Shadow Inquiry</p>
                <p className="text-sm text-slate-300">{draft.session.qliphothReflection}</p>
              </div>
              <div>
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-wide mb-1">What Emerged</p>
                <p className="text-sm text-slate-300">{draft.session.pathworkingReport}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Commitment</p>
                <p className="text-sm text-slate-300">{draft.session.integrationCommitment}</p>
              </div>
            </div>

            {!draft.insightGenerated ? (
              <button
                onClick={handleGenerateInsight}
                disabled={isLoading}
                className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing insight...
                  </>
                ) : (
                  'Generate Synthesis Insight'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-teal-500/30 bg-teal-950/20 p-4">
                  <p className="text-sm text-teal-300">
                    ✦ Insight generated and recorded in your Intelligence Hub.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-teal-700/40 border border-teal-500/40 rounded-lg text-sm text-teal-200 hover:bg-teal-700/60 transition"
                >
                  Complete & Close
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </WizardFrame>
  );
}
