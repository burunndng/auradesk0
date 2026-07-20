/**
 * UltimateConcernWizard.tsx
 * Spirit module (teal accent) — meaning-making observatory.
 * Framework: Tillich's "ultimate concern" + Fowler's Stages of Faith (structural lens).
 * Steps: 5 (Concern → Probing → Analysis → Stretch → Completion)
 */
import React, { useState, useCallback } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { probeUltimateConcern, analyzeUltimateConcern } from '../../services/aiService';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { IntegratedInsight, ConcernDomain, UltimateConcernDraft, CrisisLevel } from '../../types';
import { wizardInsightSchema } from '../../services/ai/wizardSchemas';
import { callGrokThenAIJson } from '../../services/aiService';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { AscensionFlameIcon } from '../visualizations/SacredGeometryIcons';
import { StorageManager } from '../../.claude/lib/storageManager';

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-ultimate-concern';
const HISTORY_KEY = 'aura-ultimateConcernHistory';
const HISTORY_CAP = 75;

// ---------------------------------------------------------------------------
// Initial draft state
// ---------------------------------------------------------------------------
const initialDraft: UltimateConcernDraft = {
  concern: '',
  domain: null,
  probingQuestions: [],
  probeAnswers: [],
  holdingDescription: '',
  meaningMakingStructure: '',
  actionValueGap: '',
  stretchExercise: '',
  stretchResponse: '',
};

// ---------------------------------------------------------------------------
// Domain label map
// ---------------------------------------------------------------------------
const DOMAIN_LABELS: Record<ConcernDomain, { label: string; color: string }> = {
  survival: { label: 'Survival', color: 'text-rose-300 bg-rose-900/30 border-rose-700/40' },
  belonging: { label: 'Belonging', color: 'text-amber-300 bg-amber-900/30 border-amber-700/40' },
  meaning: { label: 'Meaning', color: 'text-teal-300 bg-teal-900/30 border-teal-700/40' },
  legacy: { label: 'Legacy', color: 'text-purple-300 bg-purple-900/30 border-purple-700/40' },
  truth: { label: 'Truth', color: 'text-amber-300 bg-amber-900/30 border-amber-700/40' },
  love: { label: 'Love', color: 'text-pink-300 bg-pink-900/30 border-pink-700/40' },
  freedom: { label: 'Freedom', color: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40' },
};

// ---------------------------------------------------------------------------
// Isolated text input sub-components (INP prevention)
// ---------------------------------------------------------------------------
function ConcernTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-3 text-sm sm:text-base text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed min-h-[120px]"
      placeholder="Describe what matters most — freely, without editing yourself..."
    />
  );
}

function ProbeAnswerInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed min-h-[80px]"
      placeholder={placeholder ?? 'Your response...'}
    />
  );
}

function StretchTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed min-h-[100px]"
      placeholder="Explore the thought experiment..."
    />
  );
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepConcernArticulation({
  value,
  onChange,
  previousConcern,
}: {
  value: string;
  onChange: (v: string) => void;
  previousConcern?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-3">
          <AscensionFlameIcon className="w-14 h-14 text-teal-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-teal-300">
          Your Ultimate Concern
        </h2>
        <p className="text-sm text-slate-400">Spirit Module · Meaning-Making Observatory</p>
      </div>

      <div className="bg-slate-900/50 border border-teal-900/40 rounded-xl p-5 space-y-4">
        <p className="font-serif text-base sm:text-lg text-slate-200 leading-relaxed text-center italic">
          "What matters most to you right now — so much that if it were threatened,
          your world would shake?"
        </p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          This is Paul Tillich's question of ultimate concern — not what you think you <em>should</em> care about,
          but what actually grips you at the deepest level. Don't filter. Write what's true right now.
        </p>
      </div>

      <ConcernTextarea value={value} onChange={onChange} />

      {previousConcern && (
        <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-3 text-xs sm:text-sm text-teal-300/80 space-y-1">
          <span className="font-semibold block text-teal-300">Your concern last session:</span>
          <span className="text-slate-300 italic">"{previousConcern}"</span>
        </div>
      )}
    </div>
  );
}

function StepProbing({
  domain,
  probingQuestions,
  probeAnswers,
  onAnswerChange,
}: {
  domain: ConcernDomain | null;
  probingQuestions: string[];
  probeAnswers: string[];
  onAnswerChange: (i: number, v: string) => void;
}) {
  const domainMeta = domain ? DOMAIN_LABELS[domain] : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-teal-300">Probing Questions</h3>
        {domainMeta && (
          <span className={`inline-block text-xs px-2 py-0.5 rounded border ${domainMeta.color}`}>
            Domain: {domainMeta.label}
          </span>
        )}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          These questions are designed to reveal <em>how</em> you hold this concern —
          not just what it is, but the structure of your relationship to it.
        </p>
      </div>

      <div className="space-y-5">
        {probingQuestions.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-snug">{q}</p>
            <ProbeAnswerInput
              value={probeAnswers[i] ?? ''}
              onChange={(v) => onAnswerChange(i, v)}
              placeholder="Write openly — there are no right answers..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAnalysis({
  domain,
  holdingDescription,
  meaningMakingStructure,
  actionValueGap,
}: {
  domain: ConcernDomain | null;
  holdingDescription: string;
  meaningMakingStructure: string;
  actionValueGap: string;
}) {
  const domainMeta = domain ? DOMAIN_LABELS[domain] : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-teal-300">Structural Analysis</h3>
        <p className="text-xs text-slate-400">How you hold your concern — structurally, not evaluatively.</p>
      </div>

      {domainMeta && (
        <div className={`inline-block text-xs px-3 py-1 rounded-full border ${domainMeta.color}`}>
          {domainMeta.label} domain
        </div>
      )}

      <div className="bg-slate-900/60 border border-teal-800/30 rounded-xl p-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-teal-400/70">How you hold this</p>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{holdingDescription}</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-slate-400">Meaning-making structure</p>
        <p className="text-sm text-slate-300 leading-relaxed">{meaningMakingStructure}</p>
      </div>

      <div className="bg-rose-950/20 border border-rose-700/30 rounded-xl p-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-rose-400/70">Action / value gap</p>
        <p className="text-sm text-slate-300 leading-relaxed">{actionValueGap}</p>
        <p className="text-xs text-slate-500">Where daily behavior diverges from stated concern.</p>
      </div>
    </div>
  );
}

function StepStretch({
  stretchExercise,
  stretchResponse,
  onResponseChange,
}: {
  stretchExercise: string;
  stretchResponse: string;
  onResponseChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-teal-300">Stretch Exercise</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          A thought experiment from one structural level beyond your current holding.
          Don't aim for the "right" answer — aim for genuine exploration.
        </p>
      </div>

      <div className="bg-teal-900/20 border border-teal-700/40 rounded-xl p-5 space-y-2">
        <p className="text-xs uppercase tracking-wider text-teal-400/70">The experiment</p>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">{stretchExercise}</p>
      </div>

      <StretchTextarea value={stretchResponse} onChange={onResponseChange} />
    </div>
  );
}

function StepCompletion({
  domain,
  holdingDescription,
  isLoading,
}: {
  domain: ConcernDomain | null;
  holdingDescription: string;
  isLoading: boolean;
}) {
  const domainMeta = domain ? DOMAIN_LABELS[domain] : null;
  const history = React.useMemo(() => loadHistory(), []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Generating your insight...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <AscensionFlameIcon className="w-12 h-12 text-teal-400 opacity-80" />
      </div>
      <h3 className="text-base sm:text-xl font-serif text-teal-300">Session Complete</h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        Your concern has been recorded in your meaning-making observatory.
        Return periodically — watching how your ultimate concern shifts is itself a practice.
      </p>
      {domainMeta && (
        <span className={`inline-block text-sm px-3 py-1 rounded-full border ${domainMeta.color}`}>
          {domainMeta.label} domain
        </span>
      )}
      {holdingDescription && (
        <div className="bg-slate-900/60 border border-teal-800/30 rounded-xl p-4 text-left">
          <p className="text-xs uppercase tracking-wider text-teal-400/60 mb-2">How you hold it</p>
          <p className="text-sm text-slate-300 leading-relaxed">{holdingDescription}</p>
        </div>
      )}

      {/* Historical Shifts Timeline */}
      {history.length > 1 && (
        <div className="mt-6 text-left">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Historical Shifts
          </h4>
          <div className="relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-teal-800/40" />
            <div className="space-y-2">
              {history.slice(0, 8).map((entry, i) => {
                const entryDomain = entry.domain ? DOMAIN_LABELS[entry.domain] : null;
                const date = entry.completedAt
                  ? new Date(entry.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
                  : '—';
                return (
                  <div key={i} className={`relative pl-4 border-l-2 ${i === 0 ? 'border-teal-400' : 'border-slate-700'} rounded-r-lg bg-slate-800/40 p-2 transition-all`}>
                    <div className={`absolute -left-[7px] top-3 w-3 h-3 rounded-full border-2 ${i === 0 ? 'border-teal-400 bg-teal-900' : 'border-slate-600 bg-slate-900'}`} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-500">{date}</span>
                      {entryDomain && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${entryDomain.color}`}>
                          {entryDomain.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">
                      {entry.concern.length > 60 ? entry.concern.slice(0, 60) + '…' : entry.concern}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// History helpers
// ---------------------------------------------------------------------------
function loadHistory(): UltimateConcernDraft[] {
  try {
    const history = StorageManager.getUntyped(HISTORY_KEY);
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveToHistory(entry: UltimateConcernDraft) {
  try {
    const history = loadHistory();
    history.unshift(entry);
    if (history.length > HISTORY_CAP) history.length = HISTORY_CAP;
    StorageManager.setUntyped(HISTORY_KEY, history);
  } catch {
    // silent fail
  }
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
interface UltimateConcernWizardProps {
  onClose: () => void;
}

export default function UltimateConcernWizard({ onClose }: UltimateConcernWizardProps) {
  const { setIntegratedInsights } = useInsightsContext();
  const [draft, updateDraft, , clearDraft] = useWizardDraft<UltimateConcernDraft>(DRAFT_KEY, initialDraft);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');

  const TOTAL_STEPS = 5;

  // Previous concern from history for reference
  const previousConcern = React.useMemo(() => {
    const history = loadHistory();
    return history.length > 0 ? history[0].concern : undefined;
  }, []);

  // -------------------------------------------------------------------------
  // Step 1 → 2: Probe
  // -------------------------------------------------------------------------
  const handleProbe = useCallback(async () => {
    if (!draft.concern.trim()) return;
    setIsLoading(true);
    setError(null);
    const crisisCheck = detectCrisisLevel(draft.concern);
    setCrisisLevel(crisisCheck);
    try {
      const result = await probeUltimateConcern(draft.concern);
      updateDraft({
        domain: result.domain,
        probingQuestions: result.probingQuestions,
        probeAnswers: new Array(result.probingQuestions.length).fill(''),
      });
      setStep(2);
    } catch (err) {
      console.error('[UltimateConcernWizard] probe error:', err);
      setError('Failed to generate probing questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.concern, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 2 → 3: Analysis
  // -------------------------------------------------------------------------
  const handleAnalyze = useCallback(async () => {
    const filledAnswers = draft.probeAnswers.filter((a) => a.trim().length > 0);
    if (filledAnswers.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeUltimateConcern(
        draft.concern,
        draft.domain ?? 'meaning',
        draft.probeAnswers,
        previousConcern
      );
      updateDraft({
        holdingDescription: result.holdingDescription,
        meaningMakingStructure: result.meaningMakingStructure,
        actionValueGap: result.actionValueGap,
        stretchExercise: result.stretchExercise,
      });
      setStep(3);
    } catch (err) {
      console.error('[UltimateConcernWizard] analyze error:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft, previousConcern, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 3 → 4: Stretch (no AI call)
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Step 4 → 5: Generate insight and complete
  // -------------------------------------------------------------------------
  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const crisisCheck = detectCrisisLevel(draft.stretchResponse);
    setCrisisLevel(crisisCheck);
    setStep(5);

    const probeAnswersText = draft.probingQuestions
      .map((q, i) => `Q: ${q}\nA: ${draft.probeAnswers[i] || '(no answer)'}`)
      .join('\n\n');

    const sessionSummary = `Ultimate concern: "${draft.concern}"
Domain: ${draft.domain}
Meaning-making structure: ${draft.meaningMakingStructure}
Action/value gap: ${draft.actionValueGap}
Stretch response: ${draft.stretchResponse}
${draft.analysisResponse ? `Response to analysis: ${draft.analysisResponse}` : ''}
${probeAnswersText ? `Probe answers:\n${probeAnswersText}` : ''}
${previousConcern ? `Previous concern: "${previousConcern}"` : ''}`;

    try {
      const INSIGHT_PROMPT = `Generate an IntegratedInsight for a user who completed the UltimateConcernWizard.
This wizard uses Tillich's "ultimate concern" concept and Fowler's Stages of Faith as structural lens.
Capture: the concern's domain, meaning-making structure, and developmental edge revealed.
Do not evaluate the concern's content — only the structure of how it's held.

Session data:
${sessionSummary}`;

      const raw = await callGrokThenAIJson(
        'UltimateConcernWizard.insight',
        INSIGHT_PROMPT,
        'qwen/qwen3-30b-a3b-instruct-2507',
        wizardInsightSchema
      );

      const insight: IntegratedInsight = {
        id: `ultimate-concern-insight-${Date.now()}`,
        mindToolType: 'Ultimate Concern',
        mindToolSessionId: `uc-${Date.now()}`,
        mindToolName: 'Ultimate Concern',
        mindToolReport: sessionSummary,
        mindToolShortSummary: `Ultimate concern: "${draft.concern.slice(0, 80)}"`,
        dateCreated: new Date().toISOString(),
        status: 'pending',
        detectedPattern: raw.detectedPattern,
        suggestedShadowWork: raw.suggestedShadowWork,
        suggestedNextSteps: raw.suggestedNextSteps,
      };

      setIntegratedInsights((prev) => [...prev, insight]);
    } catch (err) {
      console.error('[UltimateConcernWizard] insight generation failed:', err);
      setError('Failed to generate insight, but your session was saved.');
    } finally {
      const completed = { ...draft, completedAt: new Date().toISOString() };
      updateDraft({ completedAt: completed.completedAt });
      saveToHistory(completed);
      clearDraft();
      setIsLoading(false);
    }
  }, [draft, previousConcern, setIntegratedInsights, updateDraft, clearDraft]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const canProceed = (() => {
    switch (step) {
      case 1: return draft.concern.trim().length > 20;
      case 2: return draft.probeAnswers.filter((a) => a.trim().length > 20).length >= Math.ceil(draft.probingQuestions.length * 0.66);
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  })();

  const handleNext = () => {
    if (step === 1) { handleProbe(); return; }
    if (step === 2) { handleAnalyze(); return; }
    if (step === 3) { setStep(4); return; }
    if (step === 4) { handleComplete(); return; }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-2">
              <AscensionFlameIcon className="w-16 h-16 text-teal-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-teal-300">Ultimate Concern</h2>
            <p className="text-sm text-slate-400">Spirit Module · 5 steps · 15-20 min</p>
            <div className="bg-slate-900/60 border border-teal-900/30 rounded-xl p-5 text-left space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                Paul Tillich observed that every person has an <em>ultimate concern</em> —
                something that functions as the organizing center of their life, whether
                they're conscious of it or not.
              </p>
              <p>
                This practice uses Tillich's framework alongside James Fowler's Stages of Faith
                to examine not just <em>what</em> you care about most, but <em>how</em> you hold it —
                and what that structure reveals about your meaning-making development.
              </p>
              <p className="text-slate-400 text-xs">
                This is not therapy. It is a developmental reflection practice.
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <StepConcernArticulation
              value={draft.concern}
              onChange={(v) => updateDraft({ concern: v })}
              previousConcern={previousConcern}
            />
          </div>
        );
      case 2:
        return (
          <StepProbing
            domain={draft.domain}
            probingQuestions={draft.probingQuestions}
            probeAnswers={draft.probeAnswers}
            onAnswerChange={(i, v) => {
              const next = [...draft.probeAnswers];
              next[i] = v;
              updateDraft({ probeAnswers: next });
            }}
          />
        );
      case 3:
        return (
          <div className="space-y-4">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <div className="space-y-5">
              <StepAnalysis
                domain={draft.domain}
                holdingDescription={draft.holdingDescription}
                meaningMakingStructure={draft.meaningMakingStructure}
                actionValueGap={draft.actionValueGap}
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Response (optional)
                </label>
                <textarea
                  value={draft.analysisResponse || ''}
                  onChange={(e) => updateDraft({ analysisResponse: e.target.value })}
                  placeholder="Does this analysis resonate? Where does it miss or surprise you?"
                  rows={3}
                  className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <StepStretch
              stretchExercise={draft.stretchExercise}
              stretchResponse={draft.stretchResponse}
              onResponseChange={(v) => updateDraft({ stretchResponse: v })}
            />
          </div>
        );
      case 5:
        return (
          <StepCompletion
            domain={draft.domain}
            holdingDescription={draft.holdingDescription}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardFrame
      title="Ultimate Concern"
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      onClose={onClose}
      onBack={handleBack}
      showBackButton={step > 1 && step < 5}
      onNext={step === 0 ? () => setStep(1) : step < 5 ? handleNext : onClose}
      nextButtonText={
        step === 0 ? 'Begin' :
          step === 4 ? 'Complete & Save' :
            step === 5 ? 'Close' :
              isLoading ? 'Please wait...' :
                'Continue'
      }
      isLoading={isLoading && step > 0}
      accentColor="teal"
      errorMessage={error}
    >
      {error && (
        <div className="mb-4 bg-rose-900/20 border border-rose-700/40 rounded-lg px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}
      {renderStep()}
    </WizardFrame>
  );
}
