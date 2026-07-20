/**
 * ContemplativeInquiryWizard.tsx
 * Spirit module (teal accent) — multi-turn phenomenological inquiry.
 * Steps: 1 (Presenting Concern) + 3-6 Inquiry Rounds + 1 Summary = 5-8 total.
 */
import React, { useState, useCallback, ErrorInfo, memo } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import PhenomenologicalReportInput, {
  PhenomenologicalReport,
} from '../shared/PhenomenologicalReportInput';
import { callGrokThenAIJson } from '../../services/aiService';
import {
  inquiryReflectionSchema,
  InquiryReflection,
  contemplativeInquiryInsightSchema,
  ContemplativeInquiryInsight,
} from '../../services/ai/wizardSchemas';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { IntegratedInsight, CrisisLevel } from '../../types';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { InquiryVortexIcon } from '../visualizations/SacredGeometryIcons';
import { generateInsightFromSession as generateSharedInsight } from '../../services/insightGenerator';
import { StorageManager } from '../../.claude/lib/storageManager';
import { practices } from '../../constants';
import { supabase } from '../../services/supabaseClient';
import { wizardSessionService } from '../../services/wizardSessionService';

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-contemplative-inquiry';
const HISTORY_KEY = 'aura-contemplativeInquiryHistory';

// ---------------------------------------------------------------------------
// Layer types — depth ordering
// ---------------------------------------------------------------------------
type LayerType = 'defense' | 'emotion' | 'deeper-emotion' | 'essential-quality';

const LAYER_META: Record<
  LayerType,
  { label: string; borderClass: string; textClass: string; glowClass?: string }
> = {
  defense: {
    label: 'Defense',
    borderClass: 'border-slate-500',
    textClass: 'text-slate-300',
  },
  emotion: {
    label: 'Emotion',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-300',
  },
  'deeper-emotion': {
    label: 'Deeper Emotion',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-300',
  },
  'essential-quality': {
    label: 'Essential Quality',
    borderClass: 'border-teal-400',
    textClass: 'text-teal-300',
    glowClass: 'shadow-[0_0_12px_rgba(45,212,191,0.35)]',
  },
};

// ---------------------------------------------------------------------------
// Round data structure
// ---------------------------------------------------------------------------
interface InquiryRound {
  roundNumber: number;
  prompt: string;
  report: PhenomenologicalReport;
  reflection: InquiryReflection;
}

// ---------------------------------------------------------------------------
// Draft shape
// ---------------------------------------------------------------------------
interface ContemplativeInquiryDraft {
  sessionId: string;
  concern: string;
  rounds: InquiryRound[];
  summaryInsight?: ContemplativeInquiryInsight;
  linkedInsightId?: string;
  integrationReflection?: string;
}

const INITIAL_DRAFT: ContemplativeInquiryDraft = {
  sessionId: '',
  concern: '',
  rounds: [],
};

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------
interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class WizardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ContemplativeInquiryWizard] Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-red-700 rounded-xl p-6 max-w-md text-center space-y-4">
            <p className="text-red-400 font-semibold">Something went wrong</p>
            <p className="text-slate-400 text-sm">{this.state.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------
async function generateInquiryReflection(
  concern: string,
  previousRounds: InquiryRound[],
  currentReport: PhenomenologicalReport,
): Promise<InquiryReflection> {
  const roundContext = previousRounds
    .map(
      (r) =>
        `Round ${r.roundNumber}:\n  Prompt: ${r.prompt}\n  Body: ${r.report.bodySensation} (${r.report.bodyLocation})\n  Emotion: ${r.report.emotion}\n  Thought: ${r.report.thought}\n  Layer: ${r.reflection.layerType}`,
    )
    .join('\n\n');

  const prompt = `You are a contemplative inquiry guide whose method draws from A.H. Almaas's Diamond Heart phenomenological inquiry, Gendlin's Focusing, and classical vipassana discrimination training. You have spent decades guiding practitioners through the layered territory between defense and essential nature. Your precision is your primary tool — you distinguish sensation from emotion from thought with surgical care, and you never allow a practitioner to mistake a concept for a direct experience. You do not offer warmth as a substitute for depth. When a practitioner touches something real, you stay with it; when they defend, you name the defense without drama and invite contact again. You ask one question at a time, and your questions are never rhetorical.

The practitioner is exploring this presenting concern:
"${concern}"

${previousRounds.length > 0 ? `Prior inquiry rounds:\n${roundContext}\n\n` : ''}Current phenomenological report (round ${previousRounds.length + 1}):
- Body sensation: ${currentReport.bodySensation}
- Body location: ${currentReport.bodyLocation}
- Emotion: ${currentReport.emotion}
- Imagery: ${currentReport.imagery}
- Thought: ${currentReport.thought}
- Hard to sense: ${currentReport.hardToSense}

Before writing your response, choose ONE strategy for this round (internal reasoning — do NOT include this reasoning in your JSON output):
- PROBE: The practitioner is at surface level or has described something vaguely; go deeper into sensation or emotion not yet touched
- REFLECT: The practitioner has made genuine contact with something real; mirror it back precisely without adding interpretation
- VALIDATE: The practitioner is encountering a very raw layer or acute distress; stabilize and ground before going deeper
- REFRAME: The practitioner is intellectualizing, looping, or has wrapped things up prematurely; introduce a new angle or phenomenological distinction

Your chosen strategy must directly shape the tone and depth of your reflection and nextPrompt.

Your task:
1. Write a reflection (2-4 sentences) that mirrors the essence of this report back to the practitioner — not interpreting, but amplifying what is present.
2. Identify which phenomenological layer has been surfaced: defense (avoidance/contraction), emotion (surface feeling), deeper-emotion (grief, shame, rage beneath the surface emotion), or essential-quality (love, peace, spaciousness, clarity — ground nature).
3. Write a single open inquiry question to invite deeper contact. Do NOT lead with "What if…" or suggest answers.
4. Decide shouldDeepen: true if there is more to explore; false if essential quality has been reached or closure is natural.
5. Write a one-line layerSummary (max 80 chars) capturing this round's discovery.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "reflection": "2-4 sentence contemplative reflection mirroring the essence of what is present",
  "nextPrompt": "A single open inquiry question to deepen contact. One sentence maximum.",
  "layerType": "defense",
  "layerSummary": "One-line summary of what was discovered this round (max 80 chars)",
  "shouldDeepen": true
}
Note: layerType must be exactly one of: defense, emotion, deeper-emotion, essential-quality. Set shouldDeepen to false when essential quality is reached or closure is natural. Only include "essentialQuality" when layerType is "essential-quality". Omit the field entirely otherwise.`;

  const fallback: InquiryReflection = {
    reflection:
      'There is something present here that wants to be known more fully. The body is speaking.',
    nextPrompt: 'What happens when you stay with what is here, without trying to change it?',
    layerType: 'emotion',
    layerSummary: 'Emotional layer present',
    shouldDeepen: true,
  };

  try {
    return await callGrokThenAIJson<InquiryReflection>(
      'ContemplativeInquiry',
      prompt,
      'qwen/qwen3-30b-a3b-instruct-2507',
      inquiryReflectionSchema,
    );
  } catch (err) {
    console.error('[ContemplativeInquiry] generateInquiryReflection error:', err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Layer Map Visualization
// ---------------------------------------------------------------------------
function LayerMap({ rounds }: { rounds: InquiryRound[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (rounds.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Inquiry Layer Map
        </h3>
        {rounds.length > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            {isExpanded ? 'Collapse History' : 'Expand History'}
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      <div className="relative pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-700" />
        <div className="space-y-2">
          {rounds.map((round, index) => {
            const meta = LAYER_META[round.reflection.layerType];
            const isLast = index === rounds.length - 1;
            const isCollapsed = !isExpanded && !isLast;

            return (
              <div
                key={round.roundNumber}
                className={`relative pl-4 border-l-2 ${meta.borderClass} ${!isCollapsed && meta.glowClass ? meta.glowClass : ''} rounded-r-lg bg-slate-800/60 transition-all duration-300 ${isCollapsed ? 'p-1.5 sm:p-2 opacity-60' : 'p-2 sm:p-3'}`}
              >
                <div
                  className={`absolute -left-[7px] ${isCollapsed ? 'top-2.5' : 'top-3'} w-3 h-3 rounded-full border-2 ${meta.borderClass} bg-slate-900 transition-all duration-300`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-mono text-slate-500">
                        R{round.roundNumber}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-semibold ${meta.textClass}`}>
                        {meta.label}
                      </span>
                      {isCollapsed && (
                        <p className="text-[10px] sm:text-xs text-slate-300 truncate opacity-80 pl-2 border-l border-slate-700">
                          {round.reflection.layerSummary}
                        </p>
                      )}
                    </div>
                    {!isCollapsed && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">
                        {round.reflection.layerSummary}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Isolated concern textarea (prevents INP lag)
// ---------------------------------------------------------------------------
const ConcernInput = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe the situation, question, or feeling you want to explore..."
      rows={5}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-none"
    />
  ),
);
ConcernInput.displayName = 'ConcernInput';

// ---------------------------------------------------------------------------
// Memoized integration reflection textarea (prevents INP lag on summary step)
// ---------------------------------------------------------------------------
const IntegrationReflectionInput = memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What did you discover? What shifted in you through this inquiry?"
      rows={4}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-none"
    />
  ),
);
IntegrationReflectionInput.displayName = 'IntegrationReflectionInput';

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
interface ContemplativeInquiryWizardProps {
  onClose: () => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
  onSave?: (insight: IntegratedInsight) => void;
}

function ContemplativeInquiryWizardInner({
  onClose,
  userId,
  insightContext,
  markInsightAsAddressed,
  onSave,
}: ContemplativeInquiryWizardProps) {
  // -------------------------------------------------------------------------
  // Draft persistence
  // -------------------------------------------------------------------------
  const [draft, updateDraft, , clearDraft] = useWizardDraft<ContemplativeInquiryDraft>(
    DRAFT_KEY,
    {
      ...INITIAL_DRAFT,
      sessionId: `ci-${Date.now()}`,
      linkedInsightId: insightContext?.id,
    },
  );

  // -------------------------------------------------------------------------
  // Local UI state
  // -------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);
  const [concern, setConcern] = useState(draft.concern || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');

  const [activePrompt, setActivePrompt] = useState<string>(
    'Before we begin — take three slow breaths. Place one hand on your chest or belly. Notice what is already present in your body before you name anything.',
  );
  const [pendingReflection, setPendingReflection] = useState<InquiryReflection | null>(null);
  const [showingReflection, setShowingReflection] = useState(false);

  const rounds = draft.rounds;
  const MIN_ROUNDS = 3;
  const MAX_ROUNDS = 6;

  const summaryReached =
    draft.summaryInsight !== undefined ||
    (rounds.length >= MIN_ROUNDS &&
      (rounds.length >= MAX_ROUNDS ||
        (rounds.length > 0 && !rounds[rounds.length - 1]?.reflection.shouldDeepen)));

  // totalSteps: concern(1) + rounds + summary(1), min 5, max 8
  const totalSteps = Math.max(5, Math.min(8, 1 + rounds.length + 1));
  const wizardFrameStep = currentStep + 1;

  const isSummaryStep = currentStep > 0 && currentStep > rounds.length && rounds.length >= MIN_ROUNDS;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleConcernNext = useCallback(() => {
    const trimmed = concern.trim();
    if (!trimmed) {
      setError('Please describe your presenting concern before continuing.');
      return;
    }
    setError('');
    const crisisCheck = detectCrisisLevel(trimmed);
    setCrisisLevel(crisisCheck);
    updateDraft({ concern: trimmed });
    setCurrentStep(1);
    setActivePrompt(
      'Notice what is present in your body and mind as you hold this concern. What do you sense?',
    );
    setShowingReflection(false);
    setPendingReflection(null);
  }, [concern, updateDraft]);

  const handleRoundSubmit = useCallback(
    async (report: PhenomenologicalReport) => {
      setIsLoading(true);
      setError('');
      const crisisCheck = detectCrisisLevel(report.emotion + ' ' + report.thought);
      setCrisisLevel(crisisCheck);
      try {
        const reflection = await generateInquiryReflection(
          draft.concern || concern,
          draft.rounds,
          report,
        );

        const newRound: InquiryRound = {
          roundNumber: draft.rounds.length + 1,
          prompt: activePrompt,
          report,
          reflection,
        };

        const updatedRounds = [...draft.rounds, newRound];
        updateDraft({ rounds: updatedRounds });
        setPendingReflection(reflection);
        setShowingReflection(true);
      } catch (err) {
        console.error('[ContemplativeInquiry] round submit error:', err);
        setError('Failed to generate reflection. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [draft.concern, draft.rounds, concern, activePrompt, updateDraft],
  );

  const handleContinueToNextRound = useCallback(() => {
    if (!pendingReflection) return;

    const updatedRounds = draft.rounds;
    const shouldStop =
      !pendingReflection.shouldDeepen || updatedRounds.length >= MAX_ROUNDS;

    if (shouldStop && updatedRounds.length >= MIN_ROUNDS) {
      setCurrentStep(updatedRounds.length + 1);
      setShowingReflection(false);
      setPendingReflection(null);
    } else {
      setActivePrompt(pendingReflection.nextPrompt);
      setCurrentStep(updatedRounds.length + 1);
      setShowingReflection(false);
      setPendingReflection(null);
    }
  }, [pendingReflection, draft.rounds]);

  const handleEndEarly = useCallback(() => {
    if (rounds.length < MIN_ROUNDS) {
      setError(`Please complete at least ${MIN_ROUNDS} rounds before ending early.`);
      return;
    }
    setCurrentStep(rounds.length + 1);
    setShowingReflection(false);
    setPendingReflection(null);
    setError('');
  }, [rounds.length]);

  const handleGenerateSummary = useCallback(async () => {
    if (rounds.length === 0) return;
    setIsLoading(true);
    setError('');
    try {
      const sessionId = draft.sessionId || `ci-${Date.now()}`;
      const concernText = draft.concern || concern;

      // Build session report for the shared insight pipeline
      const roundsSummary = rounds
        .map(
          (r) =>
            `Round ${r.roundNumber} [${r.reflection.layerType}]: ${r.reflection.layerSummary} | Body: ${r.report.bodySensation} (${r.report.bodyLocation}) | Emotion: ${r.report.emotion} | Imagery: ${r.report.imagery}`,
        )
        .join('\n');

      const lastRound = rounds[rounds.length - 1];
      const essentialHint =
        lastRound?.reflection.layerType === 'essential-quality'
          ? lastRound.reflection.layerSummary
          : 'not explicitly reached';

      const sessionReport = [
        `Presenting concern: "${concernText}"`,
        `Inquiry arc (${rounds.length} rounds):`,
        roundsSummary,
        `Essential quality reached: ${essentialHint}`,
        draft.integrationReflection
          ? `User's integration reflection: "${draft.integrationReflection}"`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const availablePractices = Object.values(practices).flatMap((category) =>
        Array.isArray(category) ? category.map((p) => ({ id: p.id, name: p.name })) : [],
      );

      // Save session to Supabase for history tracking
      if (userId) {
        try {
          await wizardSessionService.saveSession({
            user_id: userId,
            session_id: sessionId,
            type: 'contemplative_inquiry',
            content: { rounds, concern: draft.concern || concern, integrationReflection: draft.integrationReflection },
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[ContemplativeInquiry] Failed to save session:', err);
        }
      }

      // Fetch real session counts for accurate insight calibration
      let totalSessions = 1;
      let sessionsInLastWeek = 1;
      let existingInsights = 0;
      if (userId) {
        try {
          // @ts-ignore -- Supabase type instantiation depth exceeded on chained select
          const { data: allSessions } = await supabase
            .from('wizard_sessions')
            .select('created_at', { count: 'exact' })
            .eq('user_id', userId)
            .eq('wizard_type', 'Contemplative Inquiry');
          if (allSessions) totalSessions = allSessions.length + 1;

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          // @ts-ignore -- Supabase type instantiation depth exceeded on chained select
          const { data: recentSessions } = await supabase
            .from('wizard_sessions')
            .select('created_at', { count: 'exact' })
            .eq('user_id', userId)
            .eq('wizard_type', 'Contemplative Inquiry')
            .gte('created_at', sevenDaysAgo.toISOString());
          if (recentSessions) sessionsInLastWeek = recentSessions.length + 1;

          // @ts-ignore -- Supabase type instantiation depth exceeded on chained select
          const { data: insights } = await supabase
            .from('integrated_insights')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('mind_tool_type', 'Contemplative Inquiry');
          if (insights) existingInsights = insights.length;
        } catch (err) {
          console.warn('[ContemplativeInquiry] Failed to fetch session context:', err);
        }
      }

      // Use shared pipeline — handles Supabase + localStorage + Intelligence Hub
      const integratedInsight = await generateSharedInsight({
        wizardType: 'Contemplative Inquiry',
        sessionId,
        sessionName: `Contemplative Inquiry — ${rounds.length} rounds`,
        sessionReport,
        sessionSummary: essentialHint !== 'not explicitly reached'
          ? `Essential quality reached: ${essentialHint}`
          : 'Contemplative inquiry session completed.',
        userId,
        availablePractices,
        dataContext: {
          totalSessions,
          sessionsInLastWeek,
          existingInsights,
        },
      });

      // Store a local summary insight for display (mapped from IntegratedInsight fields)
      const displayInsight: ContemplativeInquiryInsight = {
        mindToolReport: integratedInsight.mindToolReport,
        mindToolShortSummary: integratedInsight.mindToolShortSummary,
        detectedPattern: integratedInsight.detectedPattern,
        essentialQuality: essentialHint !== 'not explicitly reached' ? essentialHint : 'Presence',
        suggestedShadowWork: integratedInsight.suggestedShadowWork,
        suggestedNextSteps: integratedInsight.suggestedNextSteps,
      };
      updateDraft({ summaryInsight: displayInsight });

      // Persist history via StorageManager (untyped — key not in schema registry)
      try {
        const existing = (StorageManager.getUntyped(HISTORY_KEY) as Array<unknown>) ?? [];
        const capped = [
          { sessionId, date: integratedInsight.dateCreated, insight: integratedInsight },
          ...existing,
        ].slice(0, 75);
        StorageManager.setUntyped(HISTORY_KEY, capped);
      } catch {
        // storage errors are non-fatal
      }

      if (onSave) {
        onSave(integratedInsight);
      }

      if (insightContext?.id && markInsightAsAddressed) {
        markInsightAsAddressed(insightContext.id, 'Contemplative Inquiry', sessionId);
      }
    } catch (err) {
      console.error('[ContemplativeInquiry] handleGenerateSummary error:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    rounds,
    draft.concern,
    draft.sessionId,
    draft.integrationReflection,
    concern,
    userId,
    updateDraft,
    onSave,
    insightContext,
    markInsightAsAddressed,
  ]);

  const handleIntegrationReflectionChange = useCallback(
    (v: string) => updateDraft({ integrationReflection: v }),
    [updateDraft],
  );

  const handleSaveDraftAndClose = useCallback(() => {
    updateDraft({ concern });
    onClose();
  }, [concern, updateDraft, onClose]);

  const handleFinish = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  // -------------------------------------------------------------------------
  // WizardFrame navigation
  // -------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setError('');
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep === 0) {
      handleConcernNext();
    } else if (isSummaryStep) {
      if (!draft.summaryInsight) {
        handleGenerateSummary();
      } else {
        handleFinish();
      }
    }
  }, [currentStep, isSummaryStep, handleConcernNext, handleGenerateSummary, handleFinish, draft.summaryInsight]);

  const nextButtonText = (): string => {
    if (currentStep === 0) return 'Begin Inquiry';
    if (isSummaryStep) {
      if (!draft.summaryInsight) return 'Generate Summary';
      return 'Finish';
    }
    // Round steps: PhenomenologicalReportInput has its own submit — hide WizardFrame button
    return '';
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------
  const renderStep0 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-center mb-4">
        <InquiryVortexIcon className="w-16 h-16 text-teal-400" />
      </div>
      <div>
        <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-1 sm:mb-2">
          Presenting Concern
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Begin by naming what is alive in you. This could be a question, a feeling, a situation,
          or a sense of something unresolved. Write freely — this is the seed of the inquiry.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-600/60 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
        This practice can surface strong emotions, including grief, shame, or rage. If you are currently in acute crisis, experiencing dissociation, or have active trauma without professional support, consider pausing and reaching out to a therapist first.
      </div>

      {insightContext && (
        <div className="bg-teal-900/20 border border-teal-700/40 rounded-lg p-3 text-xs sm:text-sm text-teal-300 space-y-1">
          <span className="font-semibold block">Context from prior insight:</span>
          <span className="text-slate-300">{insightContext.detectedPattern}</span>
          <span className="block text-slate-500 text-[10px]">
            From: {insightContext.mindToolType}
          </span>
        </div>
      )}

      <ConcernInput value={concern} onChange={setConcern} />

      {error && (
        <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
          {error}
        </p>
      )}
    </div>
  );

  const renderRoundStep = () => {
    if (showingReflection && pendingReflection) {
      return (
        <div className="space-y-4 sm:space-y-6">
          {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300">
                Round {rounds.length} — Reflection
              </h2>
              <span
                className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${LAYER_META[pendingReflection.layerType].borderClass} ${LAYER_META[pendingReflection.layerType].textClass} bg-slate-900`}
              >
                {LAYER_META[pendingReflection.layerType].label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Take a moment to receive this before continuing.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-teal-700/30 rounded-lg p-4 sm:p-5 space-y-3">
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
              {pendingReflection.reflection}
            </p>
            <p className="text-xs text-slate-500 border-t border-slate-700 pt-3">
              {pendingReflection.layerSummary}
            </p>
          </div>

          <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-teal-400 mb-1">Next inquiry:</p>
            <p className="text-sm sm:text-base text-slate-200">{pendingReflection.nextPrompt}</p>
          </div>

          {!pendingReflection.shouldDeepen && rounds.length >= MIN_ROUNDS && (
            <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-3 text-xs sm:text-sm text-slate-300">
              The inquiry has reached natural ground. You may continue or move to summary.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleContinueToNextRound}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
            >
              {!pendingReflection.shouldDeepen && rounds.length >= MIN_ROUNDS
                ? 'Continue to Summary'
                : 'Continue Inquiry'}
            </button>
            {rounds.length >= MIN_ROUNDS && pendingReflection.shouldDeepen && (
              <button
                onClick={handleEndEarly}
                className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
              >
                End Inquiry
              </button>
            )}
          </div>

          {rounds.length > 0 && (
            <div className="mt-2">
              <LayerMap rounds={rounds} />
            </div>
          )}

          {error && (
            <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300">
              Inquiry Round {rounds.length + 1}
            </h2>
            {rounds.length >= MIN_ROUNDS && (
              <button
                onClick={handleEndEarly}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
              >
                End early
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Respond from direct experience — not analysis or story.
          </p>
        </div>

        <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-teal-400 mb-1">Inquiry prompt:</p>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{activePrompt}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Generating reflection...</p>
          </div>
        ) : (
          <PhenomenologicalReportInput onSubmit={handleRoundSubmit} compact />
        )}

        {rounds.length > 0 && (
          <div className="mt-4">
            <LayerMap rounds={rounds} />
          </div>
        )}

        {error && (
          <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderSummaryStep = () => {
    const si = draft.summaryInsight;
    const lastRound = rounds[rounds.length - 1];
    const essentialQuality =
      si?.essentialQuality ??
      (lastRound?.reflection.layerType === 'essential-quality'
        ? lastRound.reflection.layerSummary
        : null);

    return (
      <div className="space-y-5 sm:space-y-7">
        <div>
          <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-1">
            Session Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''} of inquiry completed.
          </p>
        </div>

        <LayerMap rounds={rounds} />

        {rounds.length >= MIN_ROUNDS && rounds.every(r => r.reflection.layerType === 'defense') && (
          <div className="bg-slate-800/50 border border-amber-700/40 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-amber-300 leading-relaxed">
            This session stayed at the defense layer throughout. That's meaningful data — sometimes the psyche isn't ready to go deeper alone. You might consider working with a therapist or somatic practitioner to explore what's held here.
          </div>
        )}

        {si ? (
          <div className="space-y-4">
            {essentialQuality && (
              <div className="bg-teal-900/30 border border-teal-500/40 rounded-lg p-4 shadow-[0_0_16px_rgba(45,212,191,0.2)]">
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
                  Essential Quality Reached
                </p>
                <p className="text-sm sm:text-base text-teal-200 font-medium">{essentialQuality}</p>
              </div>
            )}

            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Detected Pattern
                </p>
                <p className="text-sm text-slate-200">{si.detectedPattern}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Session Report
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{si.mindToolReport}</p>
              </div>
            </div>

            {si.suggestedNextSteps.length > 0 && (
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Suggested Next Steps
                </p>
                <ul className="space-y-2">
                  {si.suggestedNextSteps.map((step, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-300">
                      <span className="font-semibold text-teal-400">{step.practiceName}:</span>{' '}
                      {step.rationale}
                      {step.microHabit && (
                        <span className="block text-slate-500 text-[11px] mt-0.5 italic">
                          Micro-habit: {step.microHabit}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
              You might also consider: does what you touched here show up in any of your relationships? Is there someone this inquiry connects to?
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px]"
            >
              Complete Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-400">
              Ready to generate an integrated insight from your session?
            </p>

            <div className="bg-slate-800/50 border border-slate-600/60 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Before writing, take a moment. Where do you feel this session in your body right now? What has settled, and what remains alive?
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Integration Reflection (optional)
              </label>
              <IntegrationReflectionInput
                value={draft.integrationReflection || ''}
                onChange={handleIntegrationReflectionChange}
              />
            </div>

            {error && (
              <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating summary...
                </>
              ) : (
                'Generate Insight Summary'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (currentStep === 0) return renderStep0();
    if (isSummaryStep) return renderSummaryStep();
    return renderRoundStep();
  };

  // Round steps: PhenomenologicalReportInput owns submission; WizardFrame next button is hidden
  const showFrameNextButton = currentStep === 0 || isSummaryStep;

  return (
    <WizardFrame
      title="Contemplative Inquiry"
      currentStep={wizardFrameStep}
      totalSteps={totalSteps}
      isLoading={isLoading}
      accentColor="teal"
      errorMessage={error}
      showBackButton={currentStep > 0 && !isSummaryStep}
      onClose={handleSaveDraftAndClose}
      onBack={handleBack}
      onNext={showFrameNextButton ? handleNext : () => { }}
      nextButtonText={nextButtonText()}
      leftFooterSlot={
        isSummaryStep ? undefined : (
          <button
            onClick={handleSaveDraftAndClose}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            Save draft & exit
          </button>
        )
      }
    >
      {renderContent()}
    </WizardFrame>
  );
}

// ---------------------------------------------------------------------------
// Exported component — wrapped in ErrorBoundary
// ---------------------------------------------------------------------------
export default function ContemplativeInquiryWizard(props: ContemplativeInquiryWizardProps) {
  return (
    <WizardErrorBoundary>
      <ContemplativeInquiryWizardInner {...props} />
    </WizardErrorBoundary>
  );
}
