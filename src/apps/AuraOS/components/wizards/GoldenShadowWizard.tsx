/**
 * GoldenShadowWizard.tsx
 * Shadow module wizard for reclaiming positive projections (golden shadow work).
 * 6 steps: Admiration → Quality Extraction → Ownership Search → Resistance Challenge
 *          → Experiment Design → Completion
 * Accent: purple (Shadow module)
 * Template wizard validating end-to-end patterns.
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { useAuth } from '../../contexts/AuthContext';
import { callInceptionMercuryJson } from '../../services/ai/aiCore';
import { wizardSessionService } from '../../services/wizardSessionService';
import VoidEclipseIcon from '../visualizations/SacredGeometryIcons/VoidEclipseIcon';
import {
  qualityExtractionSchema,
  goldenShadowAnalysisSchema,
  behavioralExperimentSchema,
  wizardInsightSchema,
} from '../../services/ai/wizardSchemas';
import type {
  QualityExtraction,
  GoldenShadowAnalysis,
  BehavioralExperiment,
} from '../../services/ai/wizardSchemas';
import {
  GOLDEN_SHADOW_EXTRACTION_PROMPT,
  GOLDEN_SHADOW_ANALYSIS_PROMPT,
} from '../../services/ai/wizardPrompts';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { IntegratedInsight } from '../../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DRAFT_KEY = 'aura-draft-golden-shadow';
const HISTORY_KEY = 'aura-goldenShadowHistory';
const HISTORY_CAP = 75;
const TOTAL_STEPS = 6;

const STEP_LABELS = [
  'Admiration',
  'Quality Extraction',
  'Ownership Search',
  'Resistance Challenge',
  'Experiment Design',
  'Completion',
] as const;

// ---------------------------------------------------------------------------
// Session state type
// ---------------------------------------------------------------------------

interface GoldenShadowSession {
  id: string;
  dateStarted: string;

  // Step 1 – Admiration
  admiredFigure: string;
  admiredDescription: string;

  // Step 2 – Quality Extraction (AI)
  extractedQualities: string[];
  selectedQualities: string[];
  probingAnswers: string; // user's freeform response to AI probing questions

  // Step 3 – Ownership Search
  ownershipDismissed: string;    // "A time I showed [quality] but dismissed it was..."
  ownershipStory: string;        // "The story I told myself was..."
  ownershipImplication: string;  // "If I accepted that as genuine, it would mean..."
  ownershipEvidence: string; // concrete moments where user embodied the quality

  // Step 4 – Resistance Challenge (AI)
  resistanceAnalysis: GoldenShadowAnalysis | null;
  resistanceReflection: string; // user's reflection after seeing the analysis

  // Step 5 – Experiment Design (AI)
  experiment: BehavioralExperiment | null;
  experimentCommitment: string; // user writes their specific commitment

  // Step 6 – Completion (cross-reference to the generated IntegratedInsight)
  linkedInsightId?: string;
  completedAt?: string;

  // Follow-up (populated from prior session history)
  priorExperimentResult?: string;
}

const makeInitialSession = (): GoldenShadowSession => ({
  id: `golden-shadow-${Date.now()}`,
  dateStarted: new Date().toISOString(),
  admiredFigure: '',
  admiredDescription: '',
  extractedQualities: [],
  selectedQualities: [],
  probingAnswers: '',
  ownershipDismissed: '',
  ownershipStory: '',
  ownershipImplication: '',
  ownershipEvidence: '',
  resistanceAnalysis: null,
  resistanceReflection: '',
  experiment: null,
  experimentCommitment: '',
});

// ---------------------------------------------------------------------------
// Isolated text-input sub-components (prevents INP lag)
// ---------------------------------------------------------------------------

interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

const TextArea = memo(function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  label,
  hint,
}: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[44px]"
      />
      {hint && <p className="text-[10px] sm:text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  label?: string;
}

const TextInput = memo(function TextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  label,
}: TextInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[44px]"
      />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Follow-up banner (prior experiment check-in)
// ---------------------------------------------------------------------------

function FollowUpBanner({
  experiment,
  onRespond,
}: {
  experiment: BehavioralExperiment;
  onRespond: (result: string) => void;
}) {
  const [result, setResult] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-purple-700 bg-purple-950/40 p-3 sm:p-4 mb-4">
        <p className="text-xs sm:text-sm text-purple-200">
          Thank you for reporting back. Your continuity matters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-purple-700 bg-purple-950/40 p-3 sm:p-4 mb-4 space-y-3">
      <p className="text-xs sm:text-sm font-semibold text-purple-200">
        Follow-up from your last session
      </p>
      <p className="text-xs text-slate-300 italic">
        &ldquo;{experiment.proposedAction}&rdquo;
      </p>
      <TextArea
        value={result}
        onChange={setResult}
        placeholder="How did the experiment go? What did you notice?"
        rows={3}
        hint="Optional — press Skip to continue without answering"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (result.trim()) onRespond(result.trim());
            setSubmitted(true);
          }}
          disabled={!result.trim()}
          className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-medium transition min-h-[44px]"
        >
          Submit
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition min-h-[44px]"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function WizardLoadingFallback({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs sm:text-sm text-slate-400">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quality pill selector
// ---------------------------------------------------------------------------

function QualityPills({
  qualities,
  selected,
  onToggle,
}: {
  qualities: string[];
  selected: string[];
  onToggle: (q: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {qualities.map((q) => {
        const isSelected = selected.includes(q);
        return (
          <button
            key={q}
            onClick={() => onToggle(q)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition min-h-[44px] border ${isSelected
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-purple-500 hover:text-purple-300'
              }`}
          >
            {q}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GoldenShadowWizardProps {
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GoldenShadowWizard({ onClose }: GoldenShadowWizardProps) {
  const { setIntegratedInsights } = useInsightsContext();
  const { user } = useAuth();

  // Draft persistence
  const [draft, updateDraft, , clearDraft] = useWizardDraft<GoldenShadowSession>(
    DRAFT_KEY,
    makeInitialSession()
  );

  // Local UI state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');

  // AI results mirrored locally for rendering (also persisted in draft)
  const [extraction, setExtraction] = useState<QualityExtraction | null>(
    draft.extractedQualities.length > 0
      ? { suggestedQualities: draft.extractedQualities, probingQuestions: [] }
      : null
  );
  const [resistanceAnalysis, setResistanceAnalysis] = useState<GoldenShadowAnalysis | null>(
    draft.resistanceAnalysis
  );
  const [experiment, setExperiment] = useState<BehavioralExperiment | null>(draft.experiment);
  const [completionInsight, setCompletionInsight] = useState<IntegratedInsight | null>(null);

  // Follow-up from prior session
  const [priorExperiment, setPriorExperiment] = useState<BehavioralExperiment | null>(null);

  // Load history on mount — check whether last session had an unfollowed-up experiment
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const history: GoldenShadowSession[] = JSON.parse(raw);
        const last = history[history.length - 1];
        if (last?.experiment && !last.priorExperimentResult) {
          setPriorExperiment(last.experiment);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Crisis detection
  // ---------------------------------------------------------------------------

  const checkCrisis = useCallback((text: string) => {
    const level = detectCrisisLevel(text);
    if (level !== 'none') setCrisisLevel(level);
  }, []);

  // ---------------------------------------------------------------------------
  // Field updaters — memoised so isolated inputs never cause parent re-renders
  // ---------------------------------------------------------------------------

  const setAdmiredFigure = useCallback(
    (v: string) => updateDraft({ admiredFigure: v }),
    [updateDraft]
  );

  const setAdmiredDescription = useCallback(
    (v: string) => {
      checkCrisis(v);
      updateDraft({ admiredDescription: v });
    },
    [updateDraft, checkCrisis]
  );

  const setProbingAnswers = useCallback(
    (v: string) => {
      checkCrisis(v);
      updateDraft({ probingAnswers: v });
    },
    [updateDraft, checkCrisis]
  );

  const setOwnershipEvidence = useCallback(
    (v: string) => {
      checkCrisis(v);
      updateDraft({ ownershipEvidence: v });
    },
    [updateDraft, checkCrisis]
  );

  const setOwnershipDismissed = useCallback(
    (v: string) => { checkCrisis(v); updateDraft({ ownershipDismissed: v }); },
    [updateDraft, checkCrisis]
  );
  const setOwnershipStory = useCallback(
    (v: string) => { checkCrisis(v); updateDraft({ ownershipStory: v }); },
    [updateDraft, checkCrisis]
  );
  const setOwnershipImplication = useCallback(
    (v: string) => { checkCrisis(v); updateDraft({ ownershipImplication: v }); },
    [updateDraft, checkCrisis]
  );

  const setResistanceReflection = useCallback(
    (v: string) => {
      checkCrisis(v);
      updateDraft({ resistanceReflection: v });
    },
    [updateDraft, checkCrisis]
  );

  const setExperimentCommitment = useCallback(
    (v: string) => {
      checkCrisis(v);
      updateDraft({ experimentCommitment: v });
    },
    [updateDraft, checkCrisis]
  );

  const toggleQuality = useCallback(
    (q: string) => {
      const current = draft.selectedQualities;
      const next = current.includes(q) ? current.filter((x) => x !== q) : [...current, q];
      updateDraft({ selectedQualities: next });
    },
    [draft.selectedQualities, updateDraft]
  );

  // ---------------------------------------------------------------------------
  // AI functions
  // ---------------------------------------------------------------------------

  const extractGoldenQualities = useCallback(async () => {
    if (!draft.admiredFigure.trim() || !draft.admiredDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `${GOLDEN_SHADOW_EXTRACTION_PROMPT}

Figure being admired: ${draft.admiredFigure}
What the user admires about them: ${draft.admiredDescription}

{
  "probingQuestions": [
    "When you witness this quality in them, what do you feel in your body — envy, longing, inspiration?",
    "Can you recall a specific moment where they expressed this quality that stayed with you?"
  ],
  "suggestedQualities": [
    "Decisive under pressure",
    "Unapologetically visible",
    "Intellectually generous",
    "Radiates authority without seeking approval"
  ]
}`;

      const result = await callInceptionMercuryJson<QualityExtraction>(
        'GoldenShadowWizard.extractGoldenQualities',
        prompt,
        qualityExtractionSchema
      );

      setExtraction(result);
      updateDraft({
        extractedQualities: result.suggestedQualities,
        selectedQualities: result.suggestedQualities,
      });
    } catch (err) {
      console.error('[GoldenShadowWizard] extractGoldenQualities failed:', err);
      const fallback: QualityExtraction = {
        probingQuestions: [
          'What specific moment comes to mind when you think of this quality in them?',
          'When you witness it, what do you feel — inspiration, envy, or longing?',
        ],
        suggestedQualities: [
          'Decisive under pressure',
          'Unapologetically visible',
          'Intellectually generous',
        ],
      };
      setExtraction(fallback);
      updateDraft({
        extractedQualities: fallback.suggestedQualities,
        selectedQualities: fallback.suggestedQualities,
      });
      setError('AI unavailable — using suggested qualities as a starting point.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.admiredFigure, draft.admiredDescription, updateDraft]);

  const analyzeGoldenResistance = useCallback(async () => {
    if (!draft.selectedQualities.length || !draft.ownershipEvidence.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `${GOLDEN_SHADOW_ANALYSIS_PROMPT}

Qualities the user is working to own: ${draft.selectedQualities.join(', ')}
Their ownership evidence (times they embodied these qualities): ${draft.ownershipEvidence}
Probing answer context: ${draft.probingAnswers}

{
  "defensePattern": "A consistent pattern of attributing successes to external circumstances — luck, timing, or others' help — rather than to personal capability. When something goes well, the internal story immediately deflects credit.",
  "minimizationExamples": [
    "That wasn't really me — the timing was just right.",
    "Anyone in my position would have done the same thing."
  ],
  "attributionPattern": "Crediting external factors for successes while internalising failures as personal deficits."
}`;

      const result = await callInceptionMercuryJson<GoldenShadowAnalysis>(
        'GoldenShadowWizard.analyzeGoldenResistance',
        prompt,
        goldenShadowAnalysisSchema
      );

      setResistanceAnalysis(result);
      updateDraft({ resistanceAnalysis: result });
    } catch (err) {
      console.error('[GoldenShadowWizard] analyzeGoldenResistance failed:', err);
      const fallback: GoldenShadowAnalysis = {
        defensePattern:
          'A consistent pattern of attributing your successes to external circumstances rather than to your own capabilities. When you do something well, the story immediately shifts to luck, timing, or others\u2019 help.',
        minimizationExamples: [
          '"That wasn\u2019t really me \u2014 the timing was just right."',
          '"Anyone in my position would have done the same."',
        ],
        attributionPattern:
          'Crediting external factors for successes while internalising failures as personal deficits.',
      };
      setResistanceAnalysis(fallback);
      updateDraft({ resistanceAnalysis: fallback });
      setError('AI unavailable \u2014 using a pattern template as a starting point.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.selectedQualities, draft.ownershipEvidence, draft.probingAnswers, updateDraft]);

  const generateExperiment = useCallback(async () => {
    if (!draft.selectedQualities.length || !resistanceAnalysis) return;
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `You are a shadow work specialist designing a behavioural experiment to help the user embody a previously projected quality.

Quality to embody: ${draft.selectedQualities[0] ?? draft.selectedQualities.join(', ')}
Resistance pattern identified: ${resistanceAnalysis.defensePattern}
User's reflections on resistance: ${draft.resistanceReflection}

Design ONE small, concrete behavioural experiment they can run this week.

{
  "situation": "The next team meeting or social gathering where you have something meaningful to contribute",
  "proposedAction": "Share your perspective clearly and completely without immediately qualifying it with 'but I could be wrong' or 'someone else probably said this better.' Speak it, then stop.",
  "rationale": "Your defence pattern minimises contributions before others can evaluate them. This experiment interrupts that habit at the moment of expression.",
  "successIndicators": [
    "You completed a thought without a self-deprecating qualifier",
    "You noticed the urge to minimise and chose differently",
    "Someone responded to your actual idea rather than your apology for it"
  ]
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

      const result = await callInceptionMercuryJson<BehavioralExperiment>(
        'GoldenShadowWizard.generateExperiment',
        prompt,
        behavioralExperimentSchema
      );

      setExperiment(result);
      updateDraft({ experiment: result });
    } catch (err) {
      console.error('[GoldenShadowWizard] generateExperiment failed:', err);
      const fallback: BehavioralExperiment = {
        situation:
          'In your next team meeting or social gathering where you have something meaningful to contribute.',
        proposedAction:
          'Share your perspective clearly and completely without immediately qualifying it with "but I could be wrong" or "someone else probably said this better." Speak it, then stop.',
        rationale:
          'Your defence pattern minimises your contributions before others can evaluate them. This experiment interrupts that habit at the moment of expression.',
        successIndicators: [
          'You completed a thought without a self-deprecating qualifier',
          'You noticed the urge to minimise and chose differently',
          'Someone responded to your actual idea rather than your apology for it',
        ],
      };
      setExperiment(fallback);
      updateDraft({ experiment: fallback });
      setError('AI unavailable \u2014 using a template experiment as a starting point.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.selectedQualities, resistanceAnalysis, draft.resistanceReflection, updateDraft]);

  const generateInsightFromSession = useCallback(async (): Promise<IntegratedInsight | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionSummary = `
Golden Shadow Work session.
Admired figure: ${draft.admiredFigure}.
Admired qualities: ${draft.selectedQualities.join(', ')}.
What they admire: ${draft.admiredDescription}.
Dismissed ownership moment: ${draft.ownershipDismissed}.
Dismissal story: ${draft.ownershipStory}.
Implication of acceptance: ${draft.ownershipImplication}.
Ownership evidence: ${draft.ownershipEvidence}.
Resistance pattern: ${resistanceAnalysis?.defensePattern ?? 'Not analysed'}.
Experiment designed: ${experiment?.proposedAction ?? 'Not generated'}.
Experiment commitment: ${draft.experimentCommitment}.
      `.trim();

      const prompt = `You are an Integral Life Practice insight synthesiser.

Session data:
${sessionSummary}

Generate a structured insight for the Intelligence Hub.

{
  "detectedPattern": "Consistent positive projection: qualities of decisive leadership and intellectual generosity are experienced as belonging to others rather than as owned capabilities. Ownership evidence exists but is systematically minimised.",
  "suggestedShadowWork": [
    {
      "practiceId": "shadow-journaling",
      "practiceName": "Shadow Journaling",
      "rationale": "Continue mapping the golden qualities you find difficult to own — journaling externalises the internal critic's voice."
    },
    {
      "practiceId": "three-two-one",
      "practiceName": "3-2-1 Shadow Practice",
      "rationale": "Use 3-2-1 to face, talk to, and become the admired quality directly."
    }
  ],
  "suggestedNextSteps": [
    {
      "practiceId": "ifs",
      "practiceName": "IFS Parts Work",
      "rationale": "The part that minimises successes has its own protective function — IFS helps you meet it with curiosity rather than fighting it."
    }
  ]
}

Note: Include 1-3 items in suggestedShadowWork and suggestedNextSteps. Use practice IDs exactly as shown (shadow-journaling, three-two-one, ifs, golden-shadow, etc.).

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

      const raw = await callInceptionMercuryJson<any>(
        'GoldenShadowWizard.generateInsight',
        prompt,
        wizardInsightSchema
      );

      // Calibrate confidence based on session history count
      let sessionCount = 0;
      try {
        const raw2 = localStorage.getItem(HISTORY_KEY);
        if (raw2) sessionCount = (JSON.parse(raw2) as GoldenShadowSession[]).length;
      } catch { /* ignore */ }
      const confidenceScore = Math.min(0.85, 0.6 + sessionCount * 0.05);

      const insight: IntegratedInsight = {
        id: `golden-shadow-insight-${Date.now()}`,
        mindToolType: 'Golden Shadow',
        mindToolSessionId: draft.id,
        mindToolName: 'Golden Shadow Work',
        mindToolReport: sessionSummary,
        mindToolShortSummary: `Reclaiming "${draft.selectedQualities.slice(0, 2).join(', ')}" projected onto ${draft.admiredFigure}.`,
        detectedPattern: raw.detectedPattern,
        suggestedShadowWork: raw.suggestedShadowWork,
        suggestedNextSteps: raw.suggestedNextSteps,
        confidenceScore,
        dateCreated: new Date().toISOString(),
        status: 'pending',
        generatedBy: 'grok',
      };

      return insight;
    } catch (err) {
      console.error('[GoldenShadowWizard] generateInsightFromSession failed:', err);
      // Static fallback — never blocks completion
      const fallback: IntegratedInsight = {
        id: `golden-shadow-insight-${Date.now()}`,
        mindToolType: 'Golden Shadow',
        mindToolSessionId: draft.id,
        mindToolName: 'Golden Shadow Work',
        mindToolReport: `Admired: ${draft.admiredFigure}. Qualities: ${draft.selectedQualities.join(', ')}.`,
        mindToolShortSummary: `Golden shadow work on "${draft.selectedQualities[0] ?? 'positive qualities'}".`,
        detectedPattern: `Positive projection onto ${draft.admiredFigure}: qualities of ${draft.selectedQualities.join(', ')} experienced as external rather than owned internally.`,
        suggestedShadowWork: [
          {
            practiceId: 'shadow-journaling',
            practiceName: 'Shadow Journaling',
            rationale: 'Continue mapping the golden qualities you find difficult to own.',
          },
        ],
        suggestedNextSteps: [
          {
            practiceId: 'three-two-one',
            practiceName: '3-2-1 Shadow Practice',
            rationale: 'Use 3-2-1 to face, talk to, and become the admired quality.',
          },
        ],
        dateCreated: new Date().toISOString(),
        status: 'pending',
        generatedBy: 'grok',
      };
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [draft, resistanceAnalysis, experiment]);

  // ---------------------------------------------------------------------------
  // Save to history (capped at HISTORY_CAP)
  // ---------------------------------------------------------------------------

  const saveToHistory = useCallback((session: GoldenShadowSession) => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const history: GoldenShadowSession[] = raw ? JSON.parse(raw) : [];
      const updated = [...history, session].slice(-HISTORY_CAP);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation guards
  // ---------------------------------------------------------------------------

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 1:
        return draft.admiredFigure.trim().length > 0 && draft.admiredDescription.trim().length > 10;
      case 2:
        return draft.selectedQualities.length > 0;
      case 3:
        return (
          draft.ownershipEvidence.trim().length > 10 ||
          draft.ownershipDismissed.trim().length > 5
        );
      case 4:
        return resistanceAnalysis !== null && draft.resistanceReflection.trim().length > 5;
      case 5:
        return experiment !== null && draft.experimentCommitment.trim().length > 5;
      case 6:
        return true;
      default:
        return false;
    }
  }, [step, draft, resistanceAnalysis, experiment]);

  // ---------------------------------------------------------------------------
  // Step transitions
  // ---------------------------------------------------------------------------

  const handleNext = useCallback(async () => {
    setError(null);

    if (step === 1) {
      setStep(2);
      await extractGoldenQualities();
      return;
    }

    if (step === 3) {
      setStep(4);
      await analyzeGoldenResistance();
      return;
    }

    if (step === 4) {
      setStep(5);
      await generateExperiment();
      return;
    }

    if (step === 5) {
      setStep(6);
      const insight = await generateInsightFromSession();
      if (insight) {
        setCompletionInsight(insight);
        setIntegratedInsights((prev) => [...prev, insight]);
        updateDraft({ linkedInsightId: insight.id, completedAt: new Date().toISOString() });
        saveToHistory({ ...draft, linkedInsightId: insight.id, completedAt: new Date().toISOString() });

        // Persist session to Supabase
        if (user?.id) {
          try {
            await wizardSessionService.saveSession({
              user_id: user.id,
              session_id: draft.id,
              type: 'golden_shadow',
              content: draft,
              created_at: draft.dateStarted,
            });
          } catch (error) {
            console.error('[GoldenShadowWizard] Failed to save session:', error);
          }
        }
      }
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  }, [
    step,
    extractGoldenQualities,
    analyzeGoldenResistance,
    generateExperiment,
    generateInsightFromSession,
    setIntegratedInsights,
    updateDraft,
    draft,
    saveToHistory,
  ]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleClose = useCallback(() => {
    // Draft auto-persisted via useWizardDraft — just close
    onClose();
  }, [onClose]);

  const handleFinish = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-serif text-purple-300 mb-1">
          Who do you admire?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Think of someone — real or fictional — who elicits a strong positive reaction in you.
          It could be awe, inspiration, envy, or longing. The stronger the charge, the more gold
          is available.
        </p>
      </div>

      <TextInput
        value={draft.admiredFigure}
        onChange={setAdmiredFigure}
        placeholder="e.g. Marie Curie, my mentor Sarah, a character from a book..."
        label="The figure you admire"
      />

      <TextArea
        value={draft.admiredDescription}
        onChange={setAdmiredDescription}
        placeholder="Describe what specifically you admire. What do they do, say, or embody that moves you? Give concrete examples or moments..."
        rows={5}
        label="What specifically do you admire about them?"
        hint="Be concrete. 'They're amazing' is a starting point — 'they speak their truth without apologising for taking up space' is gold."
      />

      <SafetyBanner crisisLevel={crisisLevel} />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-serif text-purple-300 mb-1">
          Your quality extraction
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Aura has identified specific qualities from what you shared. Select the ones that
          resonate most — these are your projected gold.
        </p>
      </div>

      {isLoading && <WizardLoadingFallback message="Extracting your golden qualities..." />}

      {!isLoading && extraction && (
        <>
          {extraction.probingQuestions.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                Reflect on these questions before selecting:
              </p>
              <ul className="space-y-1.5">
                {extraction.probingQuestions.map((q, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-400 flex gap-2">
                    <span className="text-purple-400 shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              Deselect any that don't resonate — add your own below if needed:
            </p>
            <QualityPills
              qualities={extraction.suggestedQualities}
              selected={draft.selectedQualities}
              onToggle={toggleQuality}
            />
          </div>

          <TextArea
            value={draft.probingAnswers}
            onChange={setProbingAnswers}
            placeholder="Write your reflections on the probing questions above. What came up for you?"
            rows={4}
            label="Your reflections (optional but recommended)"
          />
        </>
      )}

      {error && (
        <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-700 rounded-lg p-2.5">
          {error}
        </p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-serif text-purple-300 mb-1">
          The ownership search
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The qualities you see in others already live in you — or you would not recognise them.
          Work through the prompts below for{' '}
          <span className="text-purple-300 font-medium">
            {draft.selectedQualities.slice(0, 2).join(', ')}
            {draft.selectedQualities.length > 2 && ` and ${draft.selectedQualities.length - 2} more`}
          </span>
          .
        </p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm font-medium text-purple-300 mb-2">Your selected qualities:</p>
        <div className="flex flex-wrap gap-1.5">
          {draft.selectedQualities.map((q) => (
            <span key={q} className="px-2 py-1 bg-purple-900/50 border border-purple-700 text-purple-200 rounded-full text-xs">
              {q}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
          Scaffold — answer what you can
        </p>
        <TextArea
          value={draft.ownershipDismissed}
          onChange={setOwnershipDismissed}
          placeholder={`A time I showed ${draft.selectedQualities[0] ?? 'this quality'} but immediately dismissed it was...`}
          rows={3}
          label="A moment you showed it — then dismissed"
          hint="Even a small or partial example counts."
        />
        <TextArea
          value={draft.ownershipStory}
          onChange={setOwnershipStory}
          placeholder="The story I told myself to explain it away was..."
          rows={3}
          label="The story you used to explain it away"
        />
        <TextArea
          value={draft.ownershipImplication}
          onChange={setOwnershipImplication}
          placeholder="If I accepted that moment as genuine, it would mean..."
          rows={3}
          label="What accepting it would mean"
          hint="This is where the real resistance lives."
        />
      </div>

      <TextArea
        value={draft.ownershipEvidence}
        onChange={setOwnershipEvidence}
        placeholder="Describe 2-3 specific times you expressed these qualities — at work, in relationships, in how you handled something difficult. Even partial examples count..."
        rows={5}
        label="Additional ownership evidence (optional)"
        hint="The defense system will want to dismiss what you write. Notice that urge and write anyway."
      />

      <SafetyBanner crisisLevel={crisisLevel} />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-serif text-purple-300 mb-1">
          The resistance challenge
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Aura has analysed how you resist owning these qualities. Read the pattern clearly —
          this is your defense structure, not a flaw.
        </p>
      </div>

      {isLoading && <WizardLoadingFallback message="Analysing your resistance pattern..." />}

      {!isLoading && resistanceAnalysis && (
        <>
          <div className="bg-purple-950/40 border border-purple-700 rounded-lg p-3 sm:p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                Your defense pattern
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {resistanceAnalysis.defensePattern}
              </p>
            </div>

            {resistanceAnalysis.minimizationExamples.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                  How it showed up in your ownership search
                </p>
                <ul className="space-y-1">
                  {resistanceAnalysis.minimizationExamples.map((ex, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-300 italic flex gap-2">
                      <span className="text-purple-500 shrink-0">—</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                Attribution pattern
              </p>
              <p className="text-xs sm:text-sm text-slate-300">
                {resistanceAnalysis.attributionPattern}
              </p>
            </div>
          </div>

          <TextArea
            value={draft.resistanceReflection}
            onChange={setResistanceReflection}
            placeholder="What lands for you here? Where do you feel the truth of this pattern in your body or your thinking?"
            rows={4}
            label="Your response to this analysis"
          />
        </>
      )}

      {error && (
        <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-700 rounded-lg p-2.5">
          {error}
        </p>
      )}

      <SafetyBanner crisisLevel={crisisLevel} />
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-serif text-purple-300 mb-1">
          Your behavioural experiment
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The integration happens in action. Aura has designed one small, targeted experiment for
          this week. Commitment is the bridge between insight and embodiment.
        </p>
      </div>

      {isLoading && <WizardLoadingFallback message="Designing your experiment..." />}

      {!isLoading && experiment && (
        <>
          <div className="bg-slate-800/60 border border-purple-800/50 rounded-lg p-3 sm:p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                Context
              </p>
              <p className="text-xs sm:text-sm text-slate-200">{experiment.situation}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                The experiment
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {experiment.proposedAction}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                Why this works
              </p>
              <p className="text-xs sm:text-sm text-slate-300">{experiment.rationale}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                Success looks like
              </p>
              <ul className="space-y-1">
                {experiment.successIndicators.map((si, i) => (
                  <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-300">
                    <span className="text-purple-400 shrink-0">&#10003;</span>
                    <span>{si}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <TextArea
            value={draft.experimentCommitment}
            onChange={setExperimentCommitment}
            placeholder="Write your specific commitment: When exactly will you try this? What is the situation? How will you know you followed through?"
            rows={4}
            label="Your commitment (be specific)"
            hint="'This week' is not specific. 'Tuesday's standup, when I share my proposal' is."
          />
        </>
      )}

      {error && (
        <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-700 rounded-lg p-2.5">
          {error}
        </p>
      )}

      <SafetyBanner crisisLevel={crisisLevel} />
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-5">
      {isLoading && <WizardLoadingFallback message="Generating your insight..." />}

      {!isLoading && (
        <>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-purple-900/50 border border-purple-600 flex items-center justify-center">
              <VoidEclipseIcon size={28} color="currentColor" className="text-purple-400" />
            </div>
            <h3 className="text-base sm:text-xl font-serif text-purple-300">
              Session complete
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your golden shadow insight has been saved to the Intelligence Hub. Come back next
              week to report on your experiment.
            </p>
          </div>

          {completionInsight?.detectedPattern && (
            <div className="bg-purple-950/40 border border-purple-700 rounded-lg p-3 sm:p-4 space-y-1.5">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                Pattern uncovered
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {completionInsight.detectedPattern}
              </p>
            </div>
          )}

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 space-y-3">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
              Session summary
            </p>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Admired figure: </span>
                {draft.admiredFigure}
              </p>
              <p>
                <span className="text-slate-500">Qualities to own: </span>
                {draft.selectedQualities.join(', ')}
              </p>
              {experiment && (
                <p>
                  <span className="text-slate-500">Experiment: </span>
                  {experiment.proposedAction.substring(0, 100)}
                  {experiment.proposedAction.length > 100 ? '...' : ''}
                </p>
              )}
              <p>
                <span className="text-slate-500">Commitment: </span>
                {draft.experimentCommitment.substring(0, 120)}
                {draft.experimentCommitment.length > 120 ? '...' : ''}
              </p>
            </div>
          </div>

          {completionInsight?.suggestedNextSteps && completionInsight.suggestedNextSteps.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4 space-y-2">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                Suggested next practices
              </p>
              <ul className="space-y-2">
                {completionInsight.suggestedNextSteps.map((s, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-300">
                    <span className="text-purple-300 font-medium">{s.practiceName}</span>
                    {s.rationale && (
                      <span className="text-slate-400"> — {s.rationale}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-purple-950/30 border border-purple-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="text-purple-300 font-medium">Remember: </span>
              The gold you see in others is already in you. The experiment is not about becoming
              someone else — it is about stopping the habit of making yourself invisible to
              yourself.
            </p>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition min-h-[44px]"
          >
            Close and return
          </button>
        </>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const stepContent: Record<number, React.ReactNode> = {
    1: renderStep1(),
    2: renderStep2(),
    3: renderStep3(),
    4: renderStep4(),
    5: renderStep5(),
    6: renderStep6(),
  };

  const isLastStep = step === TOTAL_STEPS;
  const nextButtonLabel =
    step === 1 ? 'Extract qualities'
      : step === 3 ? 'Analyse resistance'
        : step === 4 ? 'Design experiment'
          : step === 5 ? 'Generate insight'
            : isLastStep ? 'Done'
              : 'Next';

  return (
    <WizardFrame
      title={`Golden Shadow \u2014 ${STEP_LABELS[step - 1]}`}
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      nextButtonDisabled={!canAdvance()}
      showBackButton={step > 1 && step < TOTAL_STEPS}
      nextButtonText={nextButtonLabel}
      onClose={handleClose}
      onBack={handleBack}
      onNext={isLastStep ? handleFinish : handleNext}
      accentColor="purple"
      errorMessage={error}
      leftFooterSlot={
        step < TOTAL_STEPS ? (
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition min-h-[44px]"
          >
            Save draft &amp; exit
          </button>
        ) : undefined
      }
      headerSlot={
        <>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700">
            <VoidEclipseIcon size={24} color="currentColor" className="text-purple-400" />
            <p className="text-xs text-slate-400">Shadow Module</p>
          </div>
          {priorExperiment && step === 1 ? (
            <FollowUpBanner
              experiment={priorExperiment}
              onRespond={(result) => {
                updateDraft({ priorExperimentResult: result });
                setPriorExperiment(null);
              }}
            />
          ) : undefined}
        </>
      }
    >
      {stepContent[step] ?? null}
    </WizardFrame>
  );
}
