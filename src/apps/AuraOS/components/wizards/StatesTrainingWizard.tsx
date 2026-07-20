import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import { IntegratedInsight } from '../../types.ts';
import { callGrokThenAIJson } from '../../services/aiService.ts';
import { statePracticeSchema, stateAnalysisSchema, statesTrainingDraftSchema } from '../../services/ai/wizardSchemas.ts';
import {
  STATES_TRAINING_PRACTICE_PROMPT,
  STATES_TRAINING_ANALYSIS_PROMPT,
} from '../../services/ai/wizardPrompts.ts';
import { detectCrisisLevel } from '../../utils/crisisDetection.ts';
import SafetyBanner from '../shared/SafetyBanner.tsx';
import { WizardFrame } from '../shared/WizardFrame.tsx';
import { WizardLoadingFallback } from '../shared/LoadingFallback.tsx';
import PhenomenologicalReportInput, {
  PhenomenologicalReport,
} from '../shared/PhenomenologicalReportInput.tsx';
import { useWizardDraft } from '../../hooks/useWizardDraft.ts';
import { useInsightsContext } from '../../contexts/InsightsContext.tsx';
import { generateInsightFromSession } from '../../services/insightGenerator.ts';
import { practices } from '../../constants.ts';
import { StorageManager } from '../../.claude/lib/storageManager.ts';
import AscensionFlameIcon from '../visualizations/SacredGeometryIcons/AscensionFlameIcon.tsx';

// ============================================================================
// Types
// ============================================================================

type StateTrack = 'gross' | 'subtle' | 'causal' | 'nondual';

type StatePractice = z.infer<typeof statePracticeSchema>;
type StateAnalysis = z.infer<typeof stateAnalysisSchema>;

interface StatesTrainingDraft {
  selectedTrack: StateTrack | null;
  practice: StatePractice | null;
  phenomenologicalReport: PhenomenologicalReport | null;
  analysis: StateAnalysis | null;
  sessionId: string;
  linkedInsightId?: string;
}

interface StatesTrainingWizardProps {
  onClose: () => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
  onSave?: (session: StatesTrainingDraft) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DRAFT_KEY = 'aura-draft-states-training';
const HISTORY_KEY = 'aura-statesTrainingHistory';
const MAX_HISTORY = 75;
const TOTAL_STEPS = 5;

const TRACK_META: Record<
  StateTrack,
  { label: string; description: string; detail: string; icon: string }
> = {
  gross: {
    label: 'Gross',
    description: 'Physical & sensory awareness',
    detail:
      'Body scan, breath counting, sensory anchoring. Anchored in the physical senses and external environment.',
    icon: '○',
  },
  subtle: {
    label: 'Subtle',
    description: 'Internal luminosity & energy',
    detail:
      'Visualization, energy channels, light and color imagery. The realm of dreams, visions, and inner light.',
    icon: '◈',
  },
  causal: {
    label: 'Causal',
    description: 'Formless witnessing',
    detail:
      'Awareness of awareness, spaciousness, objectless meditation. Pure witness consciousness with no content.',
    icon: '◇',
  },
  nondual: {
    label: 'Nondual',
    description: 'Observer/observed collapse',
    detail:
      'Headless Way experiments, pure seeing, non-separation. The ground of being prior to subject/object split.',
    icon: '✦',
  },
};

// ============================================================================
// Isolated text input to prevent INP lag
// ============================================================================

const IsolatedJournalArea = React.memo(
  ({
    value,
    onChange,
    placeholder,
    rows = 4,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    rows?: number;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-none"
    />
  )
);
IsolatedJournalArea.displayName = 'IsolatedJournalArea';

// ============================================================================
// Countdown Timer
// ============================================================================

function CountdownTimer({
  durationMinutes,
  onComplete,
}: {
  durationMinutes: number;
  onComplete: () => void;
}) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            onComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (!running && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={secondsLeft === 0 ? '#10b981' : '#14b8a6'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold text-slate-100">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!running && secondsLeft === totalSeconds && (
          <button
            onClick={() => setRunning(true)}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          >
            Begin Practice
          </button>
        )}
        {running && (
          <button
            onClick={() => setRunning(false)}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          >
            Pause
          </button>
        )}
        {!running && secondsLeft < totalSeconds && secondsLeft > 0 && (
          <button
            onClick={() => setRunning(true)}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          >
            Resume
          </button>
        )}
        {secondsLeft === 0 && (
          <span className="px-5 py-2 bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-sm font-medium rounded-lg">
            Practice Complete
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Stability Meter
// ============================================================================

function StabilityMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.7 ? 'bg-emerald-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-rose-500';
  const label =
    score >= 0.7 ? 'Stable' : score >= 0.4 ? 'Developing' : 'Emerging';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">State Stability</span>
        <span className="text-xs font-mono text-slate-300">
          {pct}% — {label}
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Wizard Component
// ============================================================================

const INITIAL_DRAFT: StatesTrainingDraft = {
  selectedTrack: null,
  practice: null,
  phenomenologicalReport: null,
  analysis: null,
  sessionId: `states-${Date.now()}`,
  linkedInsightId: undefined,
};

export default function StatesTrainingWizard({
  onClose,
  userId,
  insightContext,
  markInsightAsAddressed,
  onSave,
}: StatesTrainingWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [enableBell, setEnableBell] = useState(true);

  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');

  const [draft, updateDraft, , clearDraft] = useWizardDraft<StatesTrainingDraft>(
    DRAFT_KEY,
    { ...INITIAL_DRAFT, sessionId: `states-${Date.now()}` }
  );

  const { setIntegratedInsights } = useInsightsContext();

  // On mount: read last session history for suggestedAdjustment hint
  const [lastSuggestedAdjustment, setLastSuggestedAdjustment] = useState<StateTrack | null>(null);

  useEffect(() => {
    try {
      const history: StatesTrainingDraft[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (history.length > 0) {
        const last = history[history.length - 1];
        if (last?.analysis?.suggestedAdjustment) {
          setLastSuggestedAdjustment(last.analysis.suggestedAdjustment);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Seed linkedInsightId from insightContext
  useEffect(() => {
    if (insightContext?.id && !draft.linkedInsightId) {
      updateDraft({ linkedInsightId: insightContext.id });
    }
  }, [insightContext]);

  // ── Step navigation helpers ────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    setError(null);

    if (step === 1) {
      // Track selected — generate practice
      if (!draft.selectedTrack) {
        setError('Please select a state track.');
        return;
      }
      setIsLoading(true);
      try {
        const prompt = `${STATES_TRAINING_PRACTICE_PROMPT}\n\nTrack: ${draft.selectedTrack}\n\nRespond with JSON matching the statePracticeSchema.`;
        const practice = await callGrokThenAIJson<StatePractice>(
          'StatesTraining.generatePractice',
          prompt,
          '',
          statePracticeSchema
        );
        updateDraft({ practice });
        setStep(2);
      } catch (err) {
        console.error('[StatesTraining] generatePractice failed:', err);
        setError('Failed to generate practice. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 2) {
      // Guided practice — user must at least start the timer
      setStep(3);
      return;
    }

    if (step === 3) {
      // Phenomenological report submitted via onSubmit callback — do nothing here
      // The submit button is inside PhenomenologicalReportInput; we intercept via handleReportSubmit
      return;
    }

    if (step === 4) {
      // Analysis shown — proceed to completion
      await handleCompletion();
      return;
    }
  }, [step, draft]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  // ── Report submission (Step 3 → 4) ────────────────────────────────────────

  const handleReportSubmit = useCallback(
    async (report: PhenomenologicalReport) => {
      setError(null);
      updateDraft({ phenomenologicalReport: report });
      const crisisCheck = detectCrisisLevel(
        [report.bodySensation, report.emotion, report.thought].filter(Boolean).join(' ')
      );
      setCrisisLevel(crisisCheck);
      setIsLoading(true);
      try {
        const reportText = [
          `Body sensation: ${report.bodySensation} (location: ${report.bodyLocation})`,
          `Emotion: ${report.emotion}`,
          `Imagery: ${report.imagery}`,
          `Thought: ${report.thought}`,
          report.hardToSense ? 'Hard to sense anything.' : '',
        ]
          .filter(Boolean)
          .join('\n');

        const prompt = `${STATES_TRAINING_ANALYSIS_PROMPT}\n\nSelected track: ${draft.selectedTrack}\n\nPhenomenological report:\n${reportText}\n\nRespond with JSON matching the stateAnalysisSchema.`;

        const analysis = await callGrokThenAIJson<StateAnalysis>(
          'StatesTraining.analyzeReport',
          prompt,
          '',
          stateAnalysisSchema
        );
        updateDraft({ analysis });
        setStep(4);
      } catch (err) {
        console.error('[StatesTraining] analyzeReport failed:', err);
        setError('Analysis failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [draft.selectedTrack, updateDraft]
  );

  // ── Completion (Step 5) ────────────────────────────────────────────────────

  const handleCompletion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build session report text for insight generator
      const reportText = [
        `Track selected: ${draft.selectedTrack}`,
        `Assessed state: ${draft.analysis?.assessedState}`,
        `Stability score: ${draft.analysis?.stabilityScore}`,
        `Developmental edge: ${draft.analysis?.developmentalEdge}`,
        `Next practice suggestion: ${draft.analysis?.nextPracticeSuggestion}`,
        draft.analysis?.calibrationNote
          ? `Calibration note: ${draft.analysis.calibrationNote}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      // Generate integrated insight
      const insight = await generateInsightFromSession({
        wizardType: 'States Training',
        sessionId: draft.sessionId,
        sessionName: `States Training — ${TRACK_META[draft.selectedTrack!]?.label ?? draft.selectedTrack}`,
        sessionReport: reportText,
        sessionSummary: draft.analysis?.developmentalEdge ?? 'States training session completed.',
        userId,
        availablePractices: Object.values(practices).flatMap(category =>
          Array.isArray(category) ? category.map(p => ({ id: p.id, name: p.name })) : []
        ),
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });

      // Persist insight to context
      setIntegratedInsights((prev) => {
        const updated = [insight, ...prev].slice(0, 200);
        return updated;
      });

      // Mark linked insight addressed
      if (draft.linkedInsightId && markInsightAsAddressed) {
        markInsightAsAddressed(draft.linkedInsightId, 'States Training', draft.sessionId);
      }

      // Save to history with schema validation
      const history: StatesTrainingDraft[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const updatedHistory = [...history, draft].slice(-MAX_HISTORY);
      StorageManager.setUntyped(HISTORY_KEY, updatedHistory);

      // External save callback
      if (onSave) onSave(draft);

      // Clear draft
      clearDraft();

      setStep(5);
    } catch (err) {
      console.error('[StatesTraining] completion failed:', err);
      // Still show step 5 on insight gen failure — don't block user
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  }, [draft, userId, markInsightAsAddressed, onSave, clearDraft, setIntegratedInsights]);

  // ── Step titles ────────────────────────────────────────────────────────────

  const stepTitles = [
    'Track Selection',
    'Guided Practice',
    'Phenomenological Report',
    'Analysis',
    'Integration',
  ];

  const nextButtonLabels: Record<number, string> = {
    1: 'Generate Practice',
    2: 'Continue to Report',
    3: 'Submit Report', // Overridden — button is inside PhenomenologicalReportInput
    4: 'Complete Session',
    5: 'Close',
  };

  // ── Render steps ───────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="flex justify-center mb-4">
        <AscensionFlameIcon className="w-16 h-16 text-teal-400" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-serif text-slate-100 mb-1">
          Choose Your State Track
        </h3>
        <p className="text-sm text-slate-400">
          Select the state level you want to practice. Aura will generate a calibrated exercise.
        </p>
        {lastSuggestedAdjustment && (
          <div className="mt-3 px-3 py-2 bg-teal-950/60 border border-teal-800 rounded-lg text-xs text-teal-300">
            Your last session suggested practicing:{' '}
            <span className="font-semibold capitalize">{lastSuggestedAdjustment}</span>. Consider
            starting there.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(TRACK_META) as StateTrack[]).map((track) => {
          const meta = TRACK_META[track];
          const isSelected = draft.selectedTrack === track;
          const isSuggested = lastSuggestedAdjustment === track;
          return (
            <button
              key={track}
              onClick={() => updateDraft({ selectedTrack: track })}
              className={`relative text-left p-4 rounded-xl border transition-all ${isSelected
                ? 'border-teal-500 bg-teal-950/50 ring-1 ring-teal-500/40'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
            >
              {isSuggested && (
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-teal-700 text-teal-100 rounded-full font-medium">
                  Suggested
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-xl text-teal-400 mt-0.5 select-none" aria-hidden="true">{meta.icon}</span>
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{meta.label}</p>
                  <p className="text-xs text-teal-300 mt-0.5">{meta.description}</p>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{meta.detail}</p>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1.5 text-teal-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {insightContext && (
        <div className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-slate-200">From Insight Context:</p>
          <p className="text-slate-400">{insightContext.detectedPattern}</p>
          <p className="text-slate-500">Source: {insightContext.mindToolType}</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    if (!draft.practice) return <WizardLoadingFallback />;
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-1">
            {TRACK_META[draft.selectedTrack!]?.label} Practice
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-serif text-slate-100">Guided Practice</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBell}
                onChange={(e) => setEnableBell(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500/50 bg-slate-800 transition-colors"
              />
              <span className="text-xs text-slate-400 font-medium select-none">Enable bell chime</span>
            </label>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Follow the instructions below, then use the timer to track your practice duration.
          </p>
        </div>

        {/* Practice instructions */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Duration: {draft.practice.durationMinutes} minutes
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {draft.practice.practiceInstructions}
          </p>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center py-2">
          <CountdownTimer
            durationMinutes={draft.practice.durationMinutes}
            onComplete={() => {
              setTimerComplete(true);
              if (enableBell) {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const oscillator = audioCtx.createOscillator();
                  const gainNode = audioCtx.createGain();

                  oscillator.type = 'sine';
                  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

                  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);

                  oscillator.connect(gainNode);
                  gainNode.connect(audioCtx.destination);

                  oscillator.start();
                  oscillator.stop(audioCtx.currentTime + 2);
                } catch (e) {
                  console.error('Audio chime failed', e);
                }
              }
            }}
          />
          {timerComplete && (
            <p className="mt-3 text-xs text-emerald-400 text-center">
              Timer complete. When you are ready, continue to the report.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-5">
      {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
      <div>
        <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-1">
          Step 3 of {TOTAL_STEPS}
        </p>
        <h3 className="text-lg sm:text-xl font-serif text-slate-100">Phenomenological Report</h3>
        <p className="text-sm text-slate-400 mt-1">
          Describe your direct experience during the practice. Be precise — avoid
          interpretations. What did you actually sense, feel, and perceive?
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Analyzing your report...</p>
        </div>
      ) : (
        <PhenomenologicalReportInput
          onSubmit={handleReportSubmit}
          initialData={draft.phenomenologicalReport ?? undefined}
        />
      )}

      {error && (
        <div className="px-3 py-2 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const analysis = draft.analysis;
    if (!analysis) return <WizardLoadingFallback />;

    const mismatch =
      draft.selectedTrack !== analysis.assessedState && analysis.calibrationNote;

    return (
      <div className="space-y-5">
        {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
        <div>
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-1">
            Analysis
          </p>
          <h3 className="text-lg sm:text-xl font-serif text-slate-100">State Assessment</h3>
        </div>

        {/* Stability meter */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-4">
          <StabilityMeter score={analysis.stabilityScore} />

          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            <div className="flex-1 space-y-1">
              <p className="text-slate-400 font-medium">Selected Track</p>
              <p className="text-slate-100 capitalize font-semibold">
                {TRACK_META[draft.selectedTrack!]?.label}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-slate-400 font-medium">Assessed State</p>
              <p
                className={`capitalize font-semibold ${mismatch ? 'text-amber-400' : 'text-teal-400'
                  }`}
              >
                {TRACK_META[analysis.assessedState]?.label}
              </p>
            </div>
          </div>
        </div>

        {/* Calibration note (mismatch) */}
        {mismatch && (
          <div className="px-3 py-3 bg-amber-950/40 border border-amber-800 rounded-xl space-y-1.5">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Calibration Note
            </p>
            <p className="text-sm text-amber-200">{analysis.calibrationNote}</p>
            {analysis.suggestedAdjustment && (
              <p className="text-xs text-amber-300 mt-1">
                Suggested next track:{' '}
                <span className="font-semibold capitalize">
                  {TRACK_META[analysis.suggestedAdjustment]?.label}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Developmental edge */}
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Developmental Edge
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{analysis.developmentalEdge}</p>
        </div>

        {/* Next practice suggestion */}
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Next Practice Suggestion
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">
            {analysis.nextPracticeSuggestion}
          </p>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="flex flex-col items-center text-center space-y-6 py-6">
      <div className="w-16 h-16 rounded-full bg-teal-900/60 border border-teal-700 flex items-center justify-center">
        <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-serif text-slate-100 mb-2">Session Complete</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          Your states training session has been saved. An integrated insight has been generated and
          added to your Intelligence Hub.
        </p>
      </div>

      {draft.analysis && (
        <div className="w-full max-w-sm bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-left space-y-3">
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest">
            Session Summary
          </p>
          <StabilityMeter score={draft.analysis.stabilityScore} />
          {draft.analysis.suggestedAdjustment && (
            <p className="text-xs text-slate-300">
              Next session track:{' '}
              <span className="text-teal-400 font-semibold capitalize">
                {TRACK_META[draft.analysis.suggestedAdjustment]?.label}
              </span>
            </p>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
      >
        Close
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  // Step 3 uses its own submit button (inside PhenomenologicalReportInput),
  // so WizardFrame's Next button is hidden on step 3.
  const hideNextOnStep3 = step === 3;

  return (
    <WizardFrame
      title="States Training"
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      showBackButton={step > 1 && step < 5}
      nextButtonText={
        step === 5
          ? 'Close'
          : hideNextOnStep3
            ? ''
            : nextButtonLabels[step]
      }
      onClose={() => {
        clearDraft();
        onClose();
      }}
      onBack={goBack}
      onNext={step === 5 ? onClose : hideNextOnStep3 ? () => { } : goNext}
      accentColor="teal"
      errorMessage={error}
      leftFooterSlot={
        step > 1 && step < 5 ? (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
          >
            Save Draft & Close
          </button>
        ) : undefined
      }
    >
      {error && step !== 3 && (
        <div className="mb-4 px-3 py-2 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </WizardFrame>
  );
}
