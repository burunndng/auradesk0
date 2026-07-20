/**
 * TonglenWizard.tsx
 * Spirit module (teal accent) — Tibetan compassion meditation with expanding circles.
 * Steps: 1 (Check-In) → 2 (Intention + 3-2-1-T) → 3 (Ground & Prepare) → 4 (Core Practice) → 5 (Integration) → 6 (Dedication + Summary)
 */
import React, { useState, useCallback, useEffect, useRef, memo, ErrorInfo } from 'react';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/aiService';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { IntegratedInsight, CrisisLevel, TonglenReadiness, TonglenFocus, TonglenDevelopmentalFrame, TonglenInsight } from '../../types';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { TonglenGatewayIcon } from '../visualizations/SacredGeometryIcons';
import { generateInsightFromSession as generateSharedInsight } from '../../services/insightGenerator';
import { StorageManager } from '../../.claude/lib/storageManager';
import { practices } from '../../constants';
import { supabase } from '../../services/supabaseClient';
import { wizardSessionService } from '../../services/wizardSessionService';

// ---------------------------------------------------------------------------
// Zod schemas for AI calls
// ---------------------------------------------------------------------------
const checkInAssessmentSchema = z.object({
  readinessLevel: z.enum(['ready', 'gentle', 'defer']),
  developmentalFrame: z.enum(['conventional', 'self-authoring', 'post-conventional']),
  reflectionBack: z.string(),
  suggestedFocus: z.string().optional(),
  safetyFlag: z.boolean().optional(),
});
type CheckInAssessment = z.infer<typeof checkInAssessmentSchema>;

const bridgeInvitationSchema = z.object({
  bridgeInvitation: z.string(),
});

const integrationSynthesisSchema = z.object({
  bodyObservation: z.string(),
  insightNote: z.string(),
  forwardEdge: z.string(),
  nextSessionSuggestion: z.string(),
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-tonglen';
const HISTORY_KEY = 'aura-tonglenHistory';
const TOTAL_STEPS = 6;

const CIRCLE_LABELS = [
  'Self',
  'Loved One',
  'Neutral/Difficult',
  'All Beings',
] as const;

const CIRCLE_GUIDANCE = [
  'Call to mind your own suffering right now. Breathe it in — the heaviness, the difficulty. Breathe out relief, spaciousness, ease.',
  'Bring to mind someone you love. Feel their struggles. Breathe in their suffering. Breathe out the relief you wish for them.',
  'Bring this person to mind as a full human being, capable of suffering. Breathe in their pain. Breathe out care.',
  'Expand to all beings everywhere who share this same suffering. You are breathing for all of them. Take in. Give relief.',
] as const;

const DEDICATION_TEXT: Record<TonglenDevelopmentalFrame, string> = {
  conventional: 'May the compassion you practiced today ripple outward, one breath, one moment at a time.',
  'self-authoring': "You've strengthened the neural pathways of compassion. This practice, done repeatedly, reshapes how you meet difficulty.",
  'post-conventional': 'The boundary between breathing in and breathing out — between self and other — dissolves here. What remains?',
};

// ---------------------------------------------------------------------------
// Draft shape
// ---------------------------------------------------------------------------
interface TonglenDraft {
  sessionId: string;
  checkInResponse: string;
  readinessLevel: TonglenReadiness;
  developmentalFrame: TonglenDevelopmentalFrame;
  focusType: TonglenFocus;
  focusTarget: string;
  shadow321Completed: boolean;
  shadow321Notes: string;
  circlesReached: number;
  practiceNotes: string;
  integrationReflection: string;
  microCommitment: string;
  sessionInsight?: TonglenInsight;
  linkedInsightId?: string;
  aiReflectionBack?: string;
  aiBridgeInvitation?: string;
}

const INITIAL_DRAFT: TonglenDraft = {
  sessionId: '',
  checkInResponse: '',
  readinessLevel: 'ready',
  developmentalFrame: 'conventional',
  focusType: 'self',
  focusTarget: '',
  shadow321Completed: false,
  shadow321Notes: '',
  circlesReached: 0,
  practiceNotes: '',
  integrationReflection: '',
  microCommitment: '',
};

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------
interface ErrorBoundaryState { hasError: boolean; message: string; }

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
    console.error('[TonglenWizard] Error:', error, info);
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
// Memoized text inputs
// ---------------------------------------------------------------------------
const TextAreaInput = memo(({
  value, onChange, placeholder, rows = 4,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-none"
  />
));
TextAreaInput.displayName = 'TextAreaInput';

// ---------------------------------------------------------------------------
// Tonglen Breathing Visual
// ---------------------------------------------------------------------------
function TonglenBreathingVisual({ phase }: { phase: 'in' | 'out' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        data-phase={phase}
        className="rounded-full transition-all duration-[4000ms] ease-in-out"
        style={{
          width: phase === 'in' ? 160 : 80,
          height: phase === 'in' ? 160 : 80,
          background: phase === 'in'
            ? 'radial-gradient(circle, oklch(0.25 0.05 280deg), oklch(0.12 0.02 260deg))'
            : 'radial-gradient(circle, oklch(0.70 0.14 185deg / 0.6), oklch(0.40 0.10 185deg / 0.3))',
          boxShadow: phase === 'out'
            ? '0 0 40px oklch(0.70 0.14 185deg / 0.3)'
            : '0 0 20px oklch(0.25 0.05 280deg / 0.2)',
        }}
      />
      <p className="text-sm text-slate-300 font-medium">
        {phase === 'in' ? 'Breathing in suffering' : 'Breathing out relief'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Circle Expansion Display
// ---------------------------------------------------------------------------
function CircleExpansionDisplay({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full border-2 transition-all duration-500 ${
            i < current
              ? 'border-teal-400 bg-teal-400/20'
              : i === current
                ? 'border-teal-500 bg-teal-500/10 animate-pulse'
                : 'border-slate-700 bg-slate-800/50'
          }`}
          style={{ width: 20 + i * 8, height: 20 + i * 8 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TonglenWizardProps {
  onClose: () => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (id: string, wizardType: string, sessionId: string) => void;
  onSave?: (insight: IntegratedInsight) => void;
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
function TonglenWizardInner({
  onClose,
  userId,
  insightContext,
  markInsightAsAddressed,
  onSave,
}: TonglenWizardProps) {
  const [draft, updateDraft, , clearDraft] = useWizardDraft<TonglenDraft>(
    DRAFT_KEY,
    {
      ...INITIAL_DRAFT,
      sessionId: `tonglen-${Date.now()}`,
      linkedInsightId: insightContext?.id,
    },
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');

  // Step 1 state
  const [checkInResponse, setCheckInResponse] = useState(draft.checkInResponse || '');
  const [aiAssessment, setAiAssessment] = useState<CheckInAssessment | null>(null);

  // Step 2 state
  const [shadow321Third, setShadow321Third] = useState('');
  const [shadow321Second, setShadow321Second] = useState('');
  const [shadow321First, setShadow321First] = useState('');
  const [show321, setShow321] = useState(false);

  // Step 3 state
  const [groundTimerDone, setGroundTimerDone] = useState(false);
  const groundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 4 state
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [currentCircle, setCurrentCircle] = useState(draft.circlesReached);
  const [roundNotes, setRoundNotes] = useState('');
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 5 state
  const [bodyObservation, setBodyObservation] = useState('');
  const [emotionalCheck, setEmotionalCheck] = useState('');
  const [difficultyInquiry, setDifficultyInquiry] = useState('');
  const [integrationReflection, setIntegrationReflection] = useState(draft.integrationReflection || '');
  const [microCommitment, setMicroCommitment] = useState(draft.microCommitment || '');

  const maxCircles = draft.readinessLevel === 'gentle' ? 2 : 4;

  // Ground timer for step 3
  useEffect(() => {
    if (currentStep === 2 && !groundTimerDone) {
      groundTimerRef.current = setTimeout(() => setGroundTimerDone(true), 10000);
      return () => { if (groundTimerRef.current) clearTimeout(groundTimerRef.current); };
    }
  }, [currentStep, groundTimerDone]);

  // Breathing animation for step 4
  useEffect(() => {
    if (currentStep === 3) {
      breathIntervalRef.current = setInterval(() => {
        setBreathPhase((p) => (p === 'in' ? 'out' : 'in'));
      }, 4000);
      return () => { if (breathIntervalRef.current) clearInterval(breathIntervalRef.current); };
    }
  }, [currentStep]);

  // -------------------------------------------------------------------------
  // AI Call 1: Check-In Assessment
  // -------------------------------------------------------------------------
  const handleCheckInSubmit = useCallback(async () => {
    const trimmed = checkInResponse.trim();
    if (!trimmed) {
      setError('Please share how you are arriving before continuing.');
      return;
    }
    setError('');
    const crisis = detectCrisisLevel(trimmed);
    setCrisisLevel(crisis);

    setIsLoading(true);
    try {
      const prompt = `You are a skilled Tonglen meditation guide trained in Lojong tradition (Atisha, Chogyam Trungpa, Pema Chodron lineage) and Integral Life Practice. You are NOT a therapist and do NOT diagnose.

SAFETY (OVERRIDES ALL): If the user's check-in contains suicidal ideation, active self-harm, dissociation, emotional flooding, or acute trauma (<48hr), set readinessLevel to 'defer' and safetyFlag to true.

DEVELOPMENTAL CALIBRATION:
- conventional: permission language, clear structure, relatable framing
- self-authoring: skill/evidence framing (Singer & Klimecki 2014, Weng 2013), agency
- post-conventional: minimal guidance, open inquiry, nondual framing

Assess the user's check-in and respond with:
- readinessLevel: 'ready' (stable, open), 'gentle' (some activation — proceed carefully), 'defer' (contraindicated today)
- developmentalFrame: your best read of their center of gravity
- reflectionBack: 2-3 sentences reflecting back what you heard, warmly and precisely
- suggestedFocus: optional — if their check-in points toward a specific Tonglen focus

User check-in: ${trimmed}`;

      const result = await callGrokThenAIJson<CheckInAssessment>(
        'Tonglen',
        prompt,
        undefined,
        checkInAssessmentSchema,
      );

      setAiAssessment(result);
      updateDraft({
        checkInResponse: trimmed,
        readinessLevel: result.readinessLevel,
        developmentalFrame: result.developmentalFrame,
        aiReflectionBack: result.reflectionBack,
      });

      if (result.safetyFlag || result.readinessLevel === 'defer') {
        setCrisisLevel('high');
      }

      setCurrentStep(1);
    } catch (err) {
      console.error('[Tonglen] check-in assessment error:', err);
      setError('Failed to assess check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [checkInResponse, updateDraft]);

  // -------------------------------------------------------------------------
  // AI Call 2: 3-2-1-T Bridge (optional)
  // -------------------------------------------------------------------------
  const handleGenerateBridge = useCallback(async () => {
    if (!shadow321Third.trim() || !shadow321Second.trim() || !shadow321First.trim()) {
      setError('Please complete all three perspectives before generating the bridge.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const prompt = `You are a Tonglen guide. The user has just completed a 3-2-1 shadow integration process with a difficult person or aspect.

3rd person (Face it): ${shadow321Third}
2nd person (Talk to it): ${shadow321Second}
1st person (Be it): ${shadow321First}

Generate a single, evocative "bridge invitation" phrase (1-2 sentences) that transitions from this shadow work into Tonglen practice. The phrase should name the specific quality they encountered and invite them to breathe compassion toward it. Do not be generic. Ground it in what they actually wrote.`;

      const result = await callGrokThenAIJson<{ bridgeInvitation: string }>(
        'Tonglen',
        prompt,
        undefined,
        bridgeInvitationSchema,
      );

      updateDraft({
        shadow321Completed: true,
        shadow321Notes: `3rd: ${shadow321Third}\n2nd: ${shadow321Second}\n1st: ${shadow321First}`,
        aiBridgeInvitation: result.bridgeInvitation,
      });
    } catch (err) {
      console.error('[Tonglen] bridge generation error:', err);
      setError('Failed to generate bridge invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [shadow321Third, shadow321Second, shadow321First, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 2 → Step 3
  // -------------------------------------------------------------------------
  const handleIntentionNext = useCallback(() => {
    updateDraft({
      focusType: draft.focusType,
      focusTarget: draft.focusTarget,
    });
    setCurrentStep(2);
  }, [draft.focusType, draft.focusTarget, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 4: advance circle
  // -------------------------------------------------------------------------
  const handleAdvanceCircle = useCallback(() => {
    const nextCircle = currentCircle + 1;
    const allNotes = draft.practiceNotes
      ? `${draft.practiceNotes}\nRound ${currentCircle + 1}: ${roundNotes}`
      : `Round ${currentCircle + 1}: ${roundNotes}`;
    setCurrentCircle(nextCircle);
    updateDraft({ circlesReached: nextCircle, practiceNotes: allNotes });
    setRoundNotes('');
  }, [currentCircle, roundNotes, draft.practiceNotes, updateDraft]);

  // -------------------------------------------------------------------------
  // AI Call 3: Integration Synthesis (Step 5 submit)
  // -------------------------------------------------------------------------
  const handleIntegrationSubmit = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const prompt = `You are a Tonglen integration guide. Synthesize this session into meaningful insight.

Check-in: ${draft.checkInResponse}
Focus: ${draft.focusType} — ${draft.focusTarget || 'unspecified'}
Circles reached: ${draft.circlesReached} of ${maxCircles}
Practice notes: ${draft.practiceNotes || 'none'}
Integration reflection: ${integrationReflection}

Generate:
- bodyObservation: what somatic shift likely occurred (2-3 sentences, grounded in their data)
- insightNote: the key insight or opening from this session (2-3 sentences)
- forwardEdge: what to carry forward into life/practice (1-2 sentences, specific)
- nextSessionSuggestion: suggested next Tonglen focus or variation (1 sentence)`;

      const result = await callGrokThenAIJson<TonglenInsight>(
        'Tonglen',
        prompt,
        undefined,
        integrationSynthesisSchema,
      );

      updateDraft({
        integrationReflection,
        microCommitment,
        sessionInsight: result,
      });

      setCurrentStep(5);
    } catch (err) {
      console.error('[Tonglen] integration synthesis error:', err);
      setError('Failed to generate synthesis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft, integrationReflection, microCommitment, maxCircles, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 6: Complete
  // -------------------------------------------------------------------------
  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const sessionId = draft.sessionId || `tonglen-${Date.now()}`;

      const sessionReport = [
        `Check-in: "${draft.checkInResponse}"`,
        `Readiness: ${draft.readinessLevel}, Frame: ${draft.developmentalFrame}`,
        `Focus: ${draft.focusType} — ${draft.focusTarget || 'unspecified'}`,
        `Shadow 3-2-1 completed: ${draft.shadow321Completed}`,
        `Circles reached: ${draft.circlesReached} of ${maxCircles}`,
        draft.practiceNotes ? `Practice notes: ${draft.practiceNotes}` : '',
        draft.integrationReflection ? `Integration: "${draft.integrationReflection}"` : '',
        draft.microCommitment ? `Micro-commitment: "${draft.microCommitment}"` : '',
        draft.sessionInsight ? `AI insight: ${draft.sessionInsight.insightNote}` : '',
      ].filter(Boolean).join('\n');

      // Save session to Supabase
      if (userId) {
        try {
          await wizardSessionService.saveSession({
            user_id: userId,
            session_id: sessionId,
            type: 'tonglen',
            content: {
              checkInResponse: draft.checkInResponse,
              readinessLevel: draft.readinessLevel,
              developmentalFrame: draft.developmentalFrame,
              focusType: draft.focusType,
              focusTarget: draft.focusTarget,
              shadow321Completed: draft.shadow321Completed,
              circlesReached: draft.circlesReached,
              practiceNotes: draft.practiceNotes,
              integrationReflection: draft.integrationReflection,
              microCommitment: draft.microCommitment,
              sessionInsight: draft.sessionInsight,
            },
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[Tonglen] Failed to save session:', err);
        }
      }

      const availablePractices = Object.values(practices).flatMap((category) =>
        Array.isArray(category) ? category.map((p) => ({ id: p.id, name: p.name })) : [],
      );

      // Fetch session context
      let totalSessions = 1;
      let sessionsInLastWeek = 1;
      let existingInsights = 0;
      if (userId) {
        try {
          // @ts-ignore -- Supabase type instantiation depth exceeded
          const { data: allSessions } = await supabase
            .from('wizard_sessions')
            .select('created_at', { count: 'exact' })
            .eq('user_id', userId)
            .eq('type', 'Tonglen');
          if (allSessions) totalSessions = allSessions.length + 1;

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          // @ts-ignore -- Supabase type instantiation depth exceeded
          const { data: recentSessions } = await supabase
            .from('wizard_sessions')
            .select('created_at', { count: 'exact' })
            .eq('user_id', userId)
            .eq('wizard_type', 'Tonglen')
            .gte('created_at', sevenDaysAgo.toISOString());
          if (recentSessions) sessionsInLastWeek = recentSessions.length + 1;

          // @ts-ignore -- Supabase type instantiation depth exceeded
          const { data: insights } = await supabase
            .from('integrated_insights')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('mind_tool_type', 'Tonglen');
          if (insights) existingInsights = insights.length;
        } catch (err) {
          console.warn('[Tonglen] Failed to fetch session context:', err);
        }
      }

      const integratedInsight = await generateSharedInsight({
        wizardType: 'Tonglen',
        sessionId,
        sessionName: `Tonglen — ${draft.circlesReached} circles`,
        sessionReport,
        sessionSummary: draft.sessionInsight?.insightNote || 'Tonglen session completed.',
        userId,
        availablePractices,
        dataContext: {
          totalSessions,
          sessionsInLastWeek,
          existingInsights,
        },
      });

      // Persist history
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

      if (onSave) onSave(integratedInsight);
      if (insightContext?.id && markInsightAsAddressed) {
        markInsightAsAddressed(insightContext.id, 'Tonglen', sessionId);
      }

      clearDraft();
      onClose();
    } catch (err) {
      console.error('[Tonglen] handleComplete error:', err);
      setError('Failed to complete session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft, userId, maxCircles, onSave, insightContext, markInsightAsAddressed, clearDraft, onClose]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setError('');
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSaveDraftAndClose = useCallback(() => {
    updateDraft({ checkInResponse });
    onClose();
  }, [checkInResponse, updateDraft, onClose]);

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------

  // STEP 1: Check-In
  const renderStep0 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-center mb-4">
        <TonglenGatewayIcon size={64} className="w-16 h-16 text-teal-400" />
      </div>
      <div>
        <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-1 sm:mb-2">
          Arriving
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          How are you arriving today? What is alive right now?
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-600/60 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
        This practice involves breathing in the suffering of others and breathing out relief. It can surface strong emotions. If you are currently in acute crisis or have unprocessed trauma without professional support, consider reaching out to a therapist first.
      </div>

      <p className="text-xs text-slate-500 italic">
        Take one breath before writing. Notice where attention lands.
      </p>

      {insightContext && (
        <div className="bg-teal-900/20 border border-teal-700/40 rounded-lg p-3 text-xs sm:text-sm text-teal-300 space-y-1">
          <span className="font-semibold block">Context from prior insight:</span>
          <span className="text-slate-300">{insightContext.detectedPattern}</span>
          <span className="block text-slate-500 text-[10px]">
            From: {insightContext.mindToolType}
          </span>
        </div>
      )}

      <TextAreaInput
        value={checkInResponse}
        onChange={setCheckInResponse}
        placeholder="How are you arriving today? What's alive right now?"
        rows={5}
      />

      {error && (
        <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
          {error}
        </p>
      )}
    </div>
  );

  // STEP 2: Intention + 3-2-1-T
  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}

      {draft.readinessLevel === 'defer' && (
        <div className="bg-rose-900/30 border border-rose-700/40 rounded-lg p-4 text-sm text-rose-300 leading-relaxed">
          Based on your check-in, this may not be the right time for Tonglen. This practice asks you to breathe in suffering, and doing so while in acute distress can be re-traumatizing. Please consider reaching out to a therapist or trusted person first.
        </div>
      )}

      {aiAssessment?.reflectionBack && (
        <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-4">
          <p className="text-sm text-slate-200 leading-relaxed italic">
            {aiAssessment.reflectionBack}
          </p>
        </div>
      )}

      {draft.readinessLevel === 'gentle' && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs sm:text-sm text-amber-300">
          Some activation detected. The practice will proceed gently, limiting to two expanding circles.
        </div>
      )}

      <div>
        <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-2">
          Set Your Intention
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Who or what will you hold in this practice?
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Focus
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['self', 'loved-one', 'neutral', 'difficult', 'collective'] as TonglenFocus[]).map((f) => (
            <button
              key={f}
              onClick={() => updateDraft({ focusType: f })}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                draft.focusType === f
                  ? 'border-teal-500 bg-teal-900/30 text-teal-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {f === 'loved-one' ? 'Loved One' : f === 'neutral' ? 'Neutral Person' : f === 'difficult' ? 'Difficult Person' : f === 'collective' ? 'Collective' : 'Self'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Focus Target (optional)
        </label>
        <input
          type="text"
          value={draft.focusTarget}
          onChange={(e) => updateDraft({ focusTarget: e.target.value })}
          placeholder="Name or describe who/what you'll hold..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
        />
      </div>

      {draft.focusType === 'difficult' && (
        <div className="space-y-3">
          <button
            onClick={() => setShow321(!show321)}
            className="text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
          >
            {show321 ? 'Hide' : 'Optional: 3-2-1-T Shadow Integration'}
          </button>

          {show321 && (
            <div className="space-y-3 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400">
                Face this person through three perspectives before breathing compassion toward them.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">3rd person — Face it</label>
                <TextAreaInput value={shadow321Third} onChange={setShadow321Third} placeholder="Describe this person/quality from the outside..." rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">2nd person — Talk to it</label>
                <TextAreaInput value={shadow321Second} onChange={setShadow321Second} placeholder="Address them directly..." rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">1st person — Be it</label>
                <TextAreaInput value={shadow321First} onChange={setShadow321First} placeholder="Speak as them, from their perspective..." rows={3} />
              </div>

              <button
                onClick={handleGenerateBridge}
                disabled={isLoading}
                className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Bridge'}
              </button>

              {draft.aiBridgeInvitation && (
                <div className="bg-teal-900/30 border border-teal-700/30 rounded-lg p-3 text-sm text-teal-200 italic">
                  {draft.aiBridgeInvitation}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {draft.readinessLevel !== 'defer' && (
        <button
          onClick={handleIntentionNext}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
        >
          Continue to Practice
        </button>
      )}

      {error && (
        <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
          {error}
        </p>
      )}
    </div>
  );

  // STEP 3: Ground & Prepare
  const renderStep2 = () => (
    <div className="space-y-5 sm:space-y-7">
      <div>
        <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-2">
          Ground and Prepare
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Before entering the practice, settle into your body.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 sm:p-5 space-y-4 text-sm text-slate-300 leading-relaxed">
        <div>
          <p className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-2">Posture</p>
          <p>Sit upright but not rigid. Let your spine find its natural length. Rest your hands on your thighs or in your lap. Soften your shoulders down and back. Close your eyes or lower your gaze.</p>
        </div>

        <div>
          <p className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-2">Body Scan</p>
          <p>Bring attention to the crown of your head. Let it flow downward — forehead, jaw, throat, shoulders, chest, belly, hips, thighs, knees, feet. Notice without changing. Wherever there is tension, breathe into it once.</p>
        </div>

        <div>
          <p className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-2">Breathing Container</p>
          <p>Begin breathing naturally through your nose. On the in-breath, imagine you are breathing through every pore of your body — open, porous, receptive. On the out-breath, imagine sending relief outward through every pore. This is the container for Tonglen.</p>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-600/40 rounded-lg p-3 text-xs text-slate-500 italic leading-relaxed">
        This practice comes from the Lojong tradition, as transmitted through Atisha (11th c.), Chogyam Trungpa, and Pema Chodron.
      </div>

      <button
        onClick={() => setCurrentStep(3)}
        disabled={!groundTimerDone}
        className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all min-h-[44px] text-sm ${
          groundTimerDone
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {groundTimerDone ? 'I am settled. Begin practice.' : 'Settling...'}
      </button>
    </div>
  );

  // STEP 4: Core Practice
  const renderStep3 = () => {
    const practiceComplete = currentCircle >= maxCircles;
    const circleIndex = Math.min(currentCircle, maxCircles - 1);

    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-1">
            {practiceComplete ? 'Practice Complete' : `Circle ${currentCircle + 1}: ${CIRCLE_LABELS[circleIndex]}`}
          </h2>
          {!practiceComplete && (
            <p className="text-xs sm:text-sm text-slate-400">
              Round {currentCircle + 1} of {maxCircles}
            </p>
          )}
        </div>

        <CircleExpansionDisplay current={currentCircle} total={maxCircles} />

        {!practiceComplete && (
          <>
            <div className="bg-slate-800/60 border border-teal-700/30 rounded-lg p-4 text-sm text-slate-200 leading-relaxed">
              {currentCircle < CIRCLE_GUIDANCE.length
                ? (currentCircle === 2 && draft.focusTarget
                  ? CIRCLE_GUIDANCE[2].replace('this person', draft.focusTarget)
                  : CIRCLE_GUIDANCE[currentCircle])
                : CIRCLE_GUIDANCE[3]}
            </div>

            <TonglenBreathingVisual phase={breathPhase} />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Notes for this round (optional)
              </label>
              <TextAreaInput
                value={roundNotes}
                onChange={setRoundNotes}
                placeholder="What do you notice?"
                rows={2}
              />
            </div>

            <button
              onClick={handleAdvanceCircle}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
            >
              I am ready to continue
            </button>
          </>
        )}

        {practiceComplete && (
          <div className="space-y-4">
            <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">
              You have completed all {maxCircles} circles. Take a moment to rest in whatever is here before moving to integration.
            </div>
            <button
              onClick={() => setCurrentStep(4)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
            >
              Continue to Integration
            </button>
          </div>
        )}
      </div>
    );
  };

  // STEP 5: Integration
  const renderStep4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-2">
          Integration
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Return to your body. Notice what has shifted.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Body Observation</label>
          <TextAreaInput value={bodyObservation} onChange={setBodyObservation} placeholder="What do you notice in your body now?" rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Emotional Check</label>
          <TextAreaInput value={emotionalCheck} onChange={setEmotionalCheck} placeholder="What emotions are present?" rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Inquiry</label>
          <TextAreaInput value={difficultyInquiry} onChange={setDifficultyInquiry} placeholder="Was there a moment you wanted to pull away? What was that?" rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Integration Reflection</label>
          <TextAreaInput value={integrationReflection} onChange={setIntegrationReflection} placeholder="What do you want to carry from this session?" rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Micro-commitment</label>
          <input
            type="text"
            value={microCommitment}
            onChange={(e) => setMicroCommitment(e.target.value)}
            placeholder="One small thing you will do differently today..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
          {error}
        </p>
      )}

      <button
        onClick={handleIntegrationSubmit}
        disabled={isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Synthesizing...
          </>
        ) : 'Generate Session Insight'}
      </button>
    </div>
  );

  // STEP 6: Dedication + Summary
  const renderStep5 = () => {
    const si = draft.sessionInsight;
    return (
      <div className="space-y-5 sm:space-y-7">
        <div>
          <h2 className="text-base sm:text-xl font-serif font-bold text-teal-300 mb-2">
            Dedication
          </h2>
        </div>

        <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-4 sm:p-5">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
            {DEDICATION_TEXT[draft.developmentalFrame]}
          </p>
        </div>

        {si && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Body Observation</p>
                <p className="text-sm text-slate-200">{si.bodyObservation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Key Insight</p>
                <p className="text-sm text-slate-200">{si.insightNote}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Forward Edge</p>
                <p className="text-sm text-teal-200">{si.forwardEdge}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Next Session</p>
                <p className="text-sm text-slate-300">{si.nextSessionSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/40 border border-slate-600/40 rounded-lg p-3 text-xs text-slate-500 italic leading-relaxed">
          This session was held in the lineage of Lojong practice.
        </div>

        {error && (
          <p className="text-rose-400 text-xs sm:text-sm bg-rose-900/20 border border-rose-700/40 rounded-lg p-2">
            {error}
          </p>
        )}

        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Completing...
            </>
          ) : 'Complete Session'}
        </button>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const renderContent = () => {
    switch (currentStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep0();
    }
  };

  const showFrameNextButton = currentStep === 0;

  const handleNext = useCallback(() => {
    if (currentStep === 0) handleCheckInSubmit();
  }, [currentStep, handleCheckInSubmit]);

  const nextButtonText = (): string => {
    if (currentStep === 0) return 'Begin';
    return '';
  };

  return (
    <WizardFrame
      title="Tonglen"
      currentStep={currentStep + 1}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      accentColor="teal"
      errorMessage={error}
      showBackButton={currentStep > 0 && currentStep < 5}
      onClose={handleSaveDraftAndClose}
      onBack={handleBack}
      onNext={showFrameNextButton ? handleNext : () => {}}
      nextButtonText={nextButtonText()}
      leftFooterSlot={
        currentStep < 5 ? (
          <button
            onClick={handleSaveDraftAndClose}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            Save draft & exit
          </button>
        ) : undefined
      }
    >
      {renderContent()}
    </WizardFrame>
  );
}

// ---------------------------------------------------------------------------
// Exported component — wrapped in ErrorBoundary
// ---------------------------------------------------------------------------
export default function TonglenWizard(props: TonglenWizardProps) {
  return (
    <WizardErrorBoundary>
      <TonglenWizardInner {...props} />
    </WizardErrorBoundary>
  );
}
