/**
 * IntegralPracticeDesignerWizard.tsx
 *
 * Capstone meta-wizard for designing personalized integral practice plans.
 * Synthesizes insights from all other wizards to create a balanced 7-day plan.
 *
 * Mode Detection (based on InsightsContext count):
 * - <5 insights → 'prescription' (cold start, sliders + time select)
 * - 5-20 insights → 'collaborative' (AI analyzes insights, proposes + user toggles)
 * - >20 insights → 'self-directed' (user designs, AI challenges)
 *
 * Module: Meta (teal accent)
 * mindToolType: 'Practice Designer'
 * localStorage keys:
 *   - Draft: 'aura-draft-practice-designer'
 *   - History: 'aura-practiceDesignerHistory'
 *   - Active plan: 'aura-currentPracticeDesign' (SEPARATE, not capped, overwrites each session)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { StorageManager } from '../../.claude/lib/storageManager';
import { STORAGE_KEYS } from '../../.claude/lib/storageSchemas';
import { ModuleBalance, PracticeDesign } from '../../services/ai/wizardSchemas';
import { moduleBalanceSchema, practiceDesignSchema } from '../../services/ai/wizardSchemas';
import type { IntegratedInsight } from '../../types';
import { SingularityOrbIcon, PsychopompLanternIcon } from '../visualizations/SacredGeometryIcons';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import type { CrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { practices } from '../../constants';
import { WorldEngineIcon } from '../visualizations/SacredGeometryIcons';

// ============================================================================
// localStorage keys
// ============================================================================
const DRAFT_KEY = 'aura-draft-practice-designer';
const HISTORY_KEY = STORAGE_KEYS.PRACTICE_DESIGNER_HISTORY;
const ACTIVE_PLAN_KEY = STORAGE_KEYS.PRACTICE_DESIGNER_ACTIVE_PLAN;
const HISTORY_CAP = 75;

// ============================================================================
// Type definitions
// ============================================================================
export type DesignMode = 'prescription' | 'collaborative' | 'self-directed';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface PracticeDesignerSession {
  id: string;
  date: string;

  // Step 2: Assessment
  mode: DesignMode;
  bodyScore?: number; // 1-5 for prescription
  mindScore?: number;
  shadowScore?: number;
  spiritScore?: number;
  weeklyMinutes: number;
  moduleBalance?: ModuleBalance;

  // Step 3: Depth Inquiry
  depthInquiry?: {
    pullingForAttention: string;
    activelyAvoiding: string;
    weekComplete: string;
    relationalDimension?: string;
  };

  // Step 4: Plan Generation
  generatedPlan?: PracticeDesign;
  customizedPlan?: PracticeDesign;

  // Step 5: Commitment
  commitmentNotes: string;
  conditionsOfSatisfaction?: string[];
  practicesToggled: Record<string, boolean>;

  // Step 6: Completion
  insight?: IntegratedInsight;
  linkedInsightId?: string;
}

interface AdherenceReview {
  lastPlanDate?: string;
  daysOld?: number;
  adherenceRate: number;
  checkedPractices: Record<string, boolean>;
}

// ============================================================================
// Phase config (metadata-driven)
// ============================================================================
const PHASE_CONFIG = [
  { step: 1, label: 'Orientation',  short: 'Welcome'    },
  { step: 2, label: 'Assessment',   short: 'Balance'    },
  { step: 3, label: 'Inquiry',      short: 'Depth'      },
  { step: 4, label: 'Your Plan',    short: 'Plan'       },
  { step: 5, label: 'Commitment',   short: 'Ritual'     },
  { step: 6, label: 'Activation',   short: 'Activate'   },
];

// ============================================================================
// Helper: Detect design mode
// ============================================================================
function detectDesignMode(insightCount: number): DesignMode {
  if (insightCount < 5) return 'prescription';
  if (insightCount <= 20) return 'collaborative';
  return 'self-directed';
}

// ============================================================================
// Helper: Load adherence review if plan <7 days old
// ============================================================================
function loadAdherenceReview(): AdherenceReview | null {
  const activePlan = StorageManager.get(ACTIVE_PLAN_KEY);
  if (!activePlan || !activePlan.date) return null;

  const planDate = new Date(activePlan.date).getTime();
  const now = Date.now();
  const daysOld = (now - planDate) / (1000 * 60 * 60 * 24);

  if (daysOld > 7) return null;

  const toggled: Record<string, boolean> = activePlan.practicesToggled ?? {};
  const toggledValues = Object.values(toggled);
  const adherenceRate =
    toggledValues.length > 0
      ? toggledValues.filter(Boolean).length / toggledValues.length
      : 0.5;

  return { lastPlanDate: activePlan.date, daysOld, adherenceRate, checkedPractices: {} };
}

// ============================================================================
// Module color map
// ============================================================================
const MODULE_COLORS: Record<string, { bg: string; border: string; badge: string; text: string; accent: string }> = {
  body:   { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', badge: 'bg-emerald-800/60 text-emerald-200', text: 'text-emerald-300', accent: '#10b981' },
  mind:   { bg: 'bg-amber-900/20',   border: 'border-amber-500/30',   badge: 'bg-amber-800/60 text-amber-200',   text: 'text-amber-300',   accent: '#f59e0b' },
  shadow: { bg: 'bg-purple-900/20',  border: 'border-purple-500/30',  badge: 'bg-purple-800/60 text-purple-200', text: 'text-purple-300',  accent: '#a855f7' },
  spirit: { bg: 'bg-teal-900/20',    border: 'border-teal-500/30',    badge: 'bg-teal-800/60 text-teal-200',     text: 'text-teal-300',    accent: '#2dd4bf' },
};

// ============================================================================
// AI Functions
// ============================================================================

async function assessModuleBalance(
  insightsSummary: string,
  userScore?: { body: number; mind: number; shadow: number; spirit: number }
): Promise<ModuleBalance> {
  const prompt = `You are an integral practice designer. Analyze the user's insight history and assess module balance.

${insightsSummary || 'User has minimal insight history.'}

${userScore ? `Initial self-assessment: Body=${userScore.body}/5, Mind=${userScore.mind}/5, Shadow=${userScore.shadow}/5, Spirit=${userScore.spirit}/5` : ''}

Return normalized scores (0.0–1.0) for each module. Identify weakest and strongest, and any avoidance patterns.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "bodyScore": 0.65,
  "mindScore": 0.80,
  "shadowScore": 0.30,
  "spiritScore": 0.55,
  "weakestModule": "shadow",
  "strongestModule": "mind",
  "avoidancePattern": "Shadow work avoided for 3 consecutive weeks"
}
Note: omit avoidancePattern if no clear pattern is present.`;

  return callGrokThenAIJson<ModuleBalance>('ModuleBalance', prompt, undefined, moduleBalanceSchema);
}

async function generatePracticeDesign(
  balance: ModuleBalance,
  weeklyMinutes: number,
  mode: DesignMode,
  insightsSummary?: string,
  adherenceHistory?: AdherenceReview | null,
  depthInquiry?: PracticeDesignerSession['depthInquiry']
): Promise<PracticeDesign> {
  const wizardList = [
    ...(practices.mind ?? []).map(p => `${p.id} (mind)`),
    ...(practices.body ?? []).map(p => `${p.id} (body)`),
    ...(practices.shadow ?? []).map(p => `${p.id} (shadow)`),
    ...(practices.spirit ?? []).map(p => `${p.id} (spirit)`),
  ].join(', ');

  const depthBlock = depthInquiry
    ? `\nUser Depth Inquiry:
- Pulling for attention: "${depthInquiry.pullingForAttention}"
- Actively avoiding: "${depthInquiry.activelyAvoiding}"
- Would make week complete: "${depthInquiry.weekComplete}"${depthInquiry.relationalDimension ? `\n- Relational dimension: "${depthInquiry.relationalDimension}"` : ''}`
    : '';

  const prompt = `You are an integral practice designer. Create a 7-day practice plan that balances Body, Mind, Shadow, and Spirit.

Module Balance:
- Body: ${(balance.bodyScore * 100).toFixed(0)}%
- Mind: ${(balance.mindScore * 100).toFixed(0)}%
- Shadow: ${(balance.shadowScore * 100).toFixed(0)}%
- Spirit: ${(balance.spiritScore * 100).toFixed(0)}%

Weakest: ${balance.weakestModule}, Strongest: ${balance.strongestModule}
${balance.avoidancePattern ? `Avoidance Pattern: ${balance.avoidancePattern}` : ''}

Weekly Time Available: ${weeklyMinutes} minutes
Design Mode: ${mode}
${insightsSummary ? `Recent Insights Context: ${insightsSummary}` : ''}
${adherenceHistory ? `Previous Plan Adherence: ${(adherenceHistory.adherenceRate * 100).toFixed(0)}%` : ''}${depthBlock}

Available Wizard IDs (use exact IDs from this list for wizardType):
${wizardList}

Design a 7-day plan where each day has practices from different modules. Distribute ${weeklyMinutes} minutes across the week.

For each practice, wizardType MUST be an exact ID from the list above (e.g. shadow-journaling, not "Shadow Journaling").
Include an invitation to the user if they seem to be avoiding shadow or difficult work.

For specificFocus: use the user's OWN words and phrases from their depth inquiry and insight history — never translate to clinical or spiritual vocabulary. Each specificFocus must be 1-2 sentences referencing something concrete. If there is no history, write a general but evocative focus prompt appropriate to the practice type.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "weeklyPlan": [
    { "day": "monday", "practices": [{ "wizardType": "shadow-journaling", "duration": 30, "module": "shadow", "specificFocus": "Explore the anger you described as 'the cold wall' — what part of you is maintaining it?" }] },
    { "day": "tuesday", "practices": [{ "wizardType": "somatic-awareness", "duration": 20, "module": "body", "specificFocus": "Notice where you hold the 'tightness' you mentioned — chest or jaw. Stay with it for 5 minutes without trying to change it." }] },
    { "day": "wednesday", "practices": [] },
    { "day": "thursday", "practices": [{ "wizardType": "meditation", "duration": 25, "module": "spirit", "specificFocus": "Sit with the 'groundlessness' you described. Let it be the practice rather than something to fix." }] },
    { "day": "friday", "practices": [{ "wizardType": "polarity-mapper", "duration": 20, "module": "mind", "specificFocus": "Map the polarity between your 'need for control' and 'fear of stagnation' you named last week." }] },
    { "day": "saturday", "practices": [] },
    { "day": "sunday", "practices": [{ "wizardType": "shadow-journaling", "duration": 20, "module": "shadow", "specificFocus": "Revisit Monday's journal. What did you notice in your body as you wrote?" }] }
  ],
  "totalWeeklyMinutes": 115,
  "challengeToUser": "You have avoided shadow work for 3 weeks. What are you protecting yourself from seeing?",
  "adherenceStrategy": "Stack your Monday shadow-journaling directly after your morning coffee before checking email — anchor it to an existing habit."
}
Note: omit challengeToUser if the user is not avoiding difficult work.`;

  return callGrokThenAIJson<PracticeDesign>('PracticeDesign', prompt, undefined, practiceDesignSchema);
}

async function generateInsightFromDesign(
  session: PracticeDesignerSession,
  userId: string
): Promise<IntegratedInsight> {
  const sessionReport = `
Practice Plan Generated:
- Mode: ${session.mode}
- Weekly Minutes: ${session.weeklyMinutes}
- Module Balance: Body=${session.moduleBalance?.bodyScore || 'N/A'}, Mind=${session.moduleBalance?.mindScore || 'N/A'}, Shadow=${session.moduleBalance?.shadowScore || 'N/A'}, Spirit=${session.moduleBalance?.spiritScore || 'N/A'}
- Plan Days: ${session.generatedPlan?.weeklyPlan.length || 0}
- Total Weekly Minutes: ${session.generatedPlan?.totalWeeklyMinutes || 0}
${session.generatedPlan?.challengeToUser ? `- Challenge: ${session.generatedPlan.challengeToUser}` : ''}
${session.depthInquiry ? `- Depth Inquiry: pulling="${session.depthInquiry.pullingForAttention}", avoiding="${session.depthInquiry.activelyAvoiding}"` : ''}
`;

  const sessionSummary = `User designed a ${session.mode} integral practice plan for ${session.weeklyMinutes} minutes per week, targeting module balance.`;

  return generateInsightFromSession({
    wizardType: 'Practice Designer',
    sessionId: session.id,
    sessionName: 'Integral Practice Design',
    sessionReport,
    sessionSummary,
    userId,
    availablePractices: [
      ...(practices.body ?? []).map(p => ({ id: p.id, name: p.name, category: 'body' })),
      ...(practices.mind ?? []).map(p => ({ id: p.id, name: p.name, category: 'mind' })),
      ...(practices.shadow ?? []).map(p => ({ id: p.id, name: p.name, category: 'shadow' })),
      ...(practices.spirit ?? []).map(p => ({ id: p.id, name: p.name, category: 'spirit' })),
    ],
  });
}

// ============================================================================
// Balance Radar (inline SVG, no D3)
// ============================================================================
interface BalanceRadarProps {
  bodyScore: number;
  mindScore: number;
  shadowScore: number;
  spiritScore: number;
  size?: number;
}

function BalanceRadar({ bodyScore, mindScore, shadowScore, spiritScore, size = 180 }: BalanceRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.8;

  const axes = [
    { label: 'Spirit', score: spiritScore, angle: -90, color: '#2dd4bf' },
    { label: 'Mind',   score: mindScore,   angle: 0,   color: '#f59e0b' },
    { label: 'Body',   score: bodyScore,   angle: 90,  color: '#10b981' },
    { label: 'Shadow', score: shadowScore, angle: 180, color: '#a855f7' },
  ];

  function toXY(angle: number, dist: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + dist * Math.cos(rad), y: cy + dist * Math.sin(rad) };
  }

  const rings = [0.25, 0.5, 0.75, 1.0];

  function ringPoints(ratio: number) {
    return axes.map(a => { const pt = toXY(a.angle, r * ratio); return `${pt.x},${pt.y}`; }).join(' ');
  }

  const scorePoints = axes.map(a => { const pt = toXY(a.angle, r * Math.max(0.05, a.score)); return `${pt.x},${pt.y}`; }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {rings.map(ratio => (
        <polygon key={ratio} points={ringPoints(ratio)} fill="none" stroke="rgb(68 64 60 / 0.6)" strokeWidth={0.5} />
      ))}
      {axes.map(a => {
        const end = toXY(a.angle, r);
        return <line key={a.label} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgb(68 64 60 / 0.8)" strokeWidth={0.5} />;
      })}
      <polygon points={scorePoints} fill="rgb(45 212 191 / 0.12)" stroke="rgb(45 212 191 / 0.5)" strokeWidth={1.5} />
      {axes.map(a => {
        const dot = toXY(a.angle, r * Math.max(0.05, a.score));
        const labelPt = toXY(a.angle, r * 1.22);
        return (
          <g key={a.label}>
            <circle cx={dot.x} cy={dot.y} r={3} fill={a.color} />
            <text x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={a.color} fontFamily="sans-serif">{a.label}</text>
            <text x={labelPt.x} y={labelPt.y + 11} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="rgb(168 162 158)" fontFamily="sans-serif">{Math.round(a.score * 100)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// Loading Dots
// ============================================================================
function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-10">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

interface IntegralPracticeDesignerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const IntegralPracticeDesignerWizard: React.FC<IntegralPracticeDesignerWizardProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const { integratedInsights, setIntegratedInsights } = useInsightsContext();
  const [draft, updateDraft, , clearDraft] = useWizardDraft<PracticeDesignerSession>(
    DRAFT_KEY,
    {
      id: `practice-designer-${Date.now()}`,
      date: new Date().toISOString(),
      mode: detectDesignMode(integratedInsights.length),
      weeklyMinutes: 60,
      bodyScore: 3,
      mindScore: 3,
      shadowScore: 3,
      spiritScore: 3,
      commitmentNotes: '',
      conditionsOfSatisfaction: ['', '', ''],
      practicesToggled: {},
      depthInquiry: { pullingForAttention: '', activelyAvoiding: '', weekComplete: '', relationalDimension: '' },
    }
  );

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [adherenceReview, setAdherenceReview] = useState<AdherenceReview | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [showGrounding, setShowGrounding] = useState(false);

  useEffect(() => {
    setAdherenceReview(loadAdherenceReview());
  }, []);

  const insightsSummary = useMemo(() => {
    if (integratedInsights.length === 0) return '';
    return integratedInsights
      .slice(0, 5)
      .map(i => `${i.mindToolType}: ${i.detectedPattern}`)
      .join('\n');
  }, [integratedInsights]);

  // Helper: get practice name from ID
  function getPracticeName(wizardType: string): string {
    const all = [
      ...(practices.body ?? []),
      ...(practices.mind ?? []),
      ...(practices.shadow ?? []),
      ...(practices.spirit ?? []),
    ];
    return all.find(p => p.id === wizardType)?.name ?? wizardType;
  }

  // Step 2 → 3: Assessment
  const handleAssessment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (draft.mode === 'prescription') {
        if (!draft.bodyScore || !draft.mindScore || !draft.shadowScore || !draft.spiritScore) {
          setError('Please set all module scores');
          setIsLoading(false);
          return;
        }
        // Compute weakest/strongest from slider values
        const scores = {
          body: draft.bodyScore / 5,
          mind: draft.mindScore / 5,
          shadow: draft.shadowScore / 5,
          spirit: draft.spiritScore / 5,
        };
        const entries = Object.entries(scores) as [string, number][];
        const weakestModule = entries.reduce((a, b) => a[1] < b[1] ? a : b)[0] as ModuleBalance['weakestModule'];
        const strongestModule = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0] as ModuleBalance['strongestModule'];
        const balance: ModuleBalance = {
          bodyScore: scores.body,
          mindScore: scores.mind,
          shadowScore: scores.shadow,
          spiritScore: scores.spirit,
          weakestModule,
          strongestModule,
        };
        updateDraft({ moduleBalance: balance });
      } else {
        const balance = await assessModuleBalance(insightsSummary, draft.bodyScore ? {
          body: draft.bodyScore,
          mind: draft.mindScore || 3,
          shadow: draft.shadowScore || 3,
          spirit: draft.spiritScore || 3,
        } : undefined);
        updateDraft({ moduleBalance: balance });
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setIsLoading(false);
    }
  }, [draft, updateDraft, insightsSummary]);

  // Step 3 → 4: Depth Inquiry → Plan Generation
  const handleDepthInquiry = useCallback(async (skip: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!draft.moduleBalance) {
        setError('Module balance not assessed');
        setIsLoading(false);
        return;
      }
      const inquiry = skip ? undefined : draft.depthInquiry;
      if (inquiry) {
        const textToScan = [
          inquiry.pullingForAttention,
          inquiry.activelyAvoiding,
          inquiry.weekComplete,
          inquiry.relationalDimension ?? '',
        ].join(' ');
        const detected = detectCrisisLevel(textToScan);
        setCrisisLevel(detected);
      }
      const plan = await generatePracticeDesign(
        draft.moduleBalance,
        draft.weeklyMinutes,
        draft.mode,
        insightsSummary,
        adherenceReview,
        inquiry
      );
      updateDraft({ generatedPlan: plan });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [draft, updateDraft, insightsSummary, adherenceReview]);

  // Step 4 → 5
  const handlePlanReviewed = useCallback(() => {
    setStep(5);
  }, []);

  // Step 5 → 6
  const handleCommitment = useCallback(() => {
    if (!draft.commitmentNotes.trim()) {
      setError('Please write a commitment note');
      return;
    }
    setError(null);
    setStep(6);
  }, [draft.commitmentNotes]);

  // Step 6: Activation
  const handleCompletion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const insight = await generateInsightFromDesign(draft, userId);
      updateDraft({ insight, linkedInsightId: insight.id });

      setIntegratedInsights(prev => [insight, ...prev]);

      const activePlan = {
        ...draft,
        ...draft.generatedPlan,
        date: new Date().toISOString(),
        id: draft.id,
      };
      StorageManager.setUntyped(ACTIVE_PLAN_KEY, activePlan);

      const history = StorageManager.get(HISTORY_KEY) || [];
      const updated = [draft, ...history].slice(0, HISTORY_CAP);
      StorageManager.set(HISTORY_KEY, updated);

      clearDraft();
      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setIsLoading(false);
    }
  }, [draft, updateDraft, setIntegratedInsights, clearDraft, userId]);

  // ============================================================================
  // Step 1: Welcome / Orientation
  // ============================================================================
  const renderWelcome = () => {
    const modeLabel =
      draft.mode === 'prescription' ? 'Prescription' :
      draft.mode === 'collaborative' ? 'Collaborative' : 'Self-Directed';
    const modeDesc =
      draft.mode === 'prescription'
        ? 'You\'re new here. We\'ll use sliders to map your balance and build a plan around them.'
        : draft.mode === 'collaborative'
        ? 'AI will analyze your insight history to locate your balance, then propose a plan.'
        : 'You have rich history. Design your own balance; AI will challenge your assumptions.';

    return (
      <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Ambient glows */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 right-0 w-48 h-48 rounded-full bg-stone-900/20 blur-2xl pointer-events-none" />

        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-teal-500/15 blur-xl" />
            <div className="relative w-20 h-20 rounded-full border border-teal-500/30 bg-stone-900/60 flex items-center justify-center">
              <WorldEngineIcon className="w-10 h-10 text-teal-400" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-serif font-light text-stone-100 tracking-wide">Integral Practice Designer</h2>
            <p className="text-sm text-stone-400 mt-1 tracking-widest uppercase">Capstone synthesis tool</p>
          </div>
        </div>

        {/* What to expect */}
        <div className="rounded-2xl border border-teal-500/15 bg-stone-900/40 p-5">
          <p className="text-xs text-teal-400 tracking-widest uppercase mb-3">What to Expect</p>
          <div className="grid grid-cols-2 gap-2">
            {PHASE_CONFIG.map(ph => (
              <div key={ph.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full border border-teal-500/30 text-teal-400 text-xs flex items-center justify-center font-mono">{ph.step}</span>
                <span className="text-xs text-stone-300">{ph.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode badge */}
        <div className="rounded-xl border border-stone-700/40 bg-stone-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900/50 border border-teal-500/20 text-teal-300 tracking-widest uppercase">{modeLabel}</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mt-1">{modeDesc}</p>
        </div>

        {/* Contraindications */}
        <div className="rounded-xl border border-stone-800/40 bg-stone-950/30 p-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            This tool works best when you're in a stable enough place to reflect. If you're currently in acute mental health crisis or working with unprocessed trauma, consider completing this alongside a therapist rather than independently.
          </p>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Step 2: Assessment
  // ============================================================================
  const renderAssessment = () => {
    const liveBody   = draft.mode === 'prescription' ? (draft.bodyScore   || 3) / 5 : draft.moduleBalance?.bodyScore   ?? 0.5;
    const liveMind   = draft.mode === 'prescription' ? (draft.mindScore   || 3) / 5 : draft.moduleBalance?.mindScore   ?? 0.5;
    const liveShadow = draft.mode === 'prescription' ? (draft.shadowScore || 3) / 5 : draft.moduleBalance?.shadowScore ?? 0.5;
    const liveSpirit = draft.mode === 'prescription' ? (draft.spiritScore || 3) / 5 : draft.moduleBalance?.spiritScore ?? 0.5;

    const sliders = [
      { key: 'bodyScore'   as const, label: 'Body',   color: 'text-emerald-400', bar: 'bg-emerald-500' },
      { key: 'mindScore'   as const, label: 'Mind',   color: 'text-amber-400',   bar: 'bg-amber-500'   },
      { key: 'shadowScore' as const, label: 'Shadow', color: 'text-purple-400',  bar: 'bg-purple-500'  },
      { key: 'spiritScore' as const, label: 'Spirit', color: 'text-teal-400',    bar: 'bg-teal-500'    },
    ];

    const timeOptions = [
      { value: 15,  label: '15m'  },
      { value: 30,  label: '30m'  },
      { value: 60,  label: '1h'   },
      { value: 120, label: '2h'   },
      { value: 180, label: '3h+'  },
    ];

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <BalanceRadar bodyScore={liveBody} mindScore={liveMind} shadowScore={liveShadow} spiritScore={liveSpirit} size={200} />

        {/* Mode explanation */}
        <div className="rounded-xl border border-stone-700/40 bg-stone-900/40 p-4">
          <p className="text-xs font-light text-stone-300 leading-relaxed">
            {draft.mode === 'prescription' && 'Adjust sliders to reflect how much attention each module has had recently. The radar updates live.'}
            {draft.mode === 'collaborative' && 'AI will map your balance from your insight history. You may adjust sliders as a starting hint.'}
            {draft.mode === 'self-directed' && 'You have rich insight history. AI will read it directly; sliders are optional calibration.'}
          </p>
        </div>

        {/* Sliders (prescription always, others optional) */}
        {(draft.mode === 'prescription' || draft.mode !== 'self-directed') && (
          <div className="space-y-4">
            {sliders.map(({ key, label, color, bar }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-medium tracking-widest uppercase ${color}`}>{label}</label>
                  <span className="text-xs text-stone-500 font-mono">{draft[key] || 3}/5</span>
                </div>
                <div className="relative h-1.5 bg-stone-800 rounded-full">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${bar} transition-all`}
                    style={{ width: `${((draft[key] || 3) / 5) * 100}%` }}
                  />
                </div>
                <input
                  type="range" min="1" max="5"
                  value={draft[key] || 3}
                  onChange={e => updateDraft({ [key]: parseInt(e.target.value) } as Partial<PracticeDesignerSession>)}
                  className="w-full accent-teal-400 opacity-0 absolute"
                  style={{ marginTop: '-1.5rem', height: '1.5rem', cursor: 'pointer' }}
                />
                {/* Accessible slider overlay */}
                <input
                  type="range" min="1" max="5"
                  value={draft[key] || 3}
                  onChange={e => updateDraft({ [key]: parseInt(e.target.value) } as Partial<PracticeDesignerSession>)}
                  className="w-full accent-teal-400"
                />
              </div>
            ))}
          </div>
        )}

        {/* Weekly time */}
        <div className="space-y-2">
          <p className="text-xs text-stone-400 tracking-widest uppercase">Weekly Time Commitment</p>
          <div className="flex gap-2 flex-wrap">
            {timeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateDraft({ weeklyMinutes: opt.value })}
                className={`flex-1 min-w-[48px] py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] border ${
                  draft.weeklyMinutes === opt.value
                    ? 'border-teal-500/60 bg-teal-900/40 text-teal-200'
                    : 'border-stone-700/50 bg-stone-900/30 text-stone-400 hover:border-stone-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Step 3: Depth Inquiry
  // ============================================================================
  const renderDepthInquiry = () => {
    const di = draft.depthInquiry || { pullingForAttention: '', activelyAvoiding: '', weekComplete: '', relationalDimension: '' };

    const fields: { key: keyof typeof di; prompt: string; placeholder: string }[] = [
      {
        key: 'pullingForAttention',
        prompt: 'What\'s been pulling for attention this week?',
        placeholder: 'Something in your body, a thought pattern, a relationship dynamic...',
      },
      {
        key: 'activelyAvoiding',
        prompt: 'What have you been actively avoiding?',
        placeholder: 'A conversation, a feeling, a kind of work...',
      },
      {
        key: 'weekComplete',
        prompt: 'What would make this week feel complete?',
        placeholder: 'Name it concretely — not the ideal week, but the real one...',
      },
      {
        key: 'relationalDimension',
        prompt: 'Is there a person or relationship pattern in the background?',
        placeholder: 'You don\'t need to name them — but is something relational pulling at you?',
      },
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
        <div className="rounded-xl border border-stone-700/30 bg-stone-900/30 p-4">
          <p className="text-xs font-light text-stone-400 leading-relaxed italic">
            These three questions feed directly into your plan. The AI will use your own words — not translate them.
          </p>
        </div>

        {/* Somatic grounding prompt — collapsible */}
        <div className="rounded-xl border border-stone-700/30 bg-stone-900/20 p-4">
          <button
            onClick={() => setShowGrounding(v => !v)}
            aria-expanded={showGrounding}
            aria-controls="ipd-grounding-panel"
            className="flex items-center justify-between w-full text-left"
          >
            <p className="text-xs text-stone-500 tracking-widest uppercase">Before You Write</p>
            <span className="text-xs text-teal-400/60 hover:text-teal-300 transition-colors motion-reduce:transition-none font-mono">
              {showGrounding ? 'hide' : 'show'}
            </span>
          </button>
          <div
            id="ipd-grounding-panel"
            role="region"
            aria-hidden={!showGrounding}
            className={`transition-all duration-300 ease-in-out overflow-hidden motion-reduce:transition-none ${showGrounding ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
          >
            <p className="text-sm font-light text-stone-300 leading-relaxed italic">
              Take a breath. Notice your body — where do you feel something right now? Tension, heaviness, warmth, or openness. Let that physical sense be your starting point, even if you don't have words for it yet.
            </p>
          </div>
        </div>

        {fields.map(({ key, prompt, placeholder }) => (
          <div key={key} className="rounded-xl border border-stone-700/40 bg-stone-900/40 p-4 space-y-2">
            <p className="text-sm font-serif font-light text-stone-200">{prompt}</p>
            <textarea
              value={di[key]}
              onChange={e => updateDraft({ depthInquiry: { ...di, [key]: e.target.value } })}
              placeholder={placeholder}
              rows={2}
              className="w-full bg-stone-950/60 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 resize-none focus:outline-none focus:border-teal-500/40"
            />
          </div>
        ))}
      </div>
    );
  };

  // ============================================================================
  // Step 4: Plan Display
  // ============================================================================
  const renderPlanDisplay = () => {
    if (!draft.generatedPlan) {
      return <p className="text-stone-500 text-sm text-center py-8">Generating your plan...</p>;
    }

    const { weeklyPlan, challengeToUser, adherenceStrategy } = draft.generatedPlan;
    const balance = draft.moduleBalance;

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
        {balance && (
          <div className="flex flex-col items-center gap-2">
            <BalanceRadar
              bodyScore={balance.bodyScore}
              mindScore={balance.mindScore}
              shadowScore={balance.shadowScore}
              spiritScore={balance.spiritScore}
              size={160}
            />
            {balance.avoidancePattern && (
              <p className="text-xs text-stone-500 italic text-center max-w-xs">{balance.avoidancePattern}</p>
            )}
          </div>
        )}

        {/* Horizontal divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-800" />
          <span className="text-xs text-stone-600 tracking-widest uppercase">Your Week</span>
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        {/* Invitation (formerly "Challenge") */}
        {challengeToUser && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
            <p className="text-xs font-medium text-rose-400 tracking-widest uppercase mb-2">An Invitation</p>
            <p className="text-sm text-rose-200 leading-relaxed">{challengeToUser}</p>
          </div>
        )}

        {/* Day cards */}
        <div className="space-y-3">
          {weeklyPlan.map((day, idx) => (
            <div key={idx} className="rounded-2xl border border-stone-700/40 bg-stone-900/40 overflow-hidden">
              <div className="px-4 py-2 bg-stone-800/40 border-b border-stone-700/30">
                <span className="text-xs font-medium tracking-widest uppercase text-stone-400 capitalize">{day.day}</span>
              </div>
              {day.practices.length === 0 ? (
                <p className="px-4 py-3 text-xs text-stone-600 italic">Rest & Integration</p>
              ) : (
                <div className="divide-y divide-stone-800/40">
                  {day.practices.map((p, pidx) => {
                    const colors = MODULE_COLORS[p.module] ?? MODULE_COLORS.spirit;
                    return (
                      <div key={pidx} className={`px-4 py-3 ${colors.bg}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors.badge}`}>{p.module}</span>
                          <span className="text-sm font-light text-stone-200">{getPracticeName(p.wizardType)}</span>
                          <span className="ml-auto text-xs text-stone-500 font-mono">{p.duration}m</span>
                        </div>
                        {p.specificFocus && (
                          <p className={`text-xs italic leading-relaxed ${colors.text}`}>{p.specificFocus}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal divider */}
        <div className="h-px bg-stone-800" />

        {adherenceStrategy && (
          <div className="rounded-xl border border-stone-700/30 bg-stone-900/30 p-4">
            <p className="text-xs text-stone-500 tracking-widest uppercase mb-2">Adherence Strategy</p>
            <p className="text-xs text-stone-400 leading-relaxed">{adherenceStrategy}</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // Step 5: Commitment Ritual
  // ============================================================================
  const renderCommitment = () => {
    const conditions = draft.conditionsOfSatisfaction?.length === 3
      ? draft.conditionsOfSatisfaction
      : ['', '', ''];

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {adherenceReview && (
          <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-4">
            <p className="text-sm text-teal-200 leading-relaxed">
              Your previous plan is {adherenceReview.daysOld?.toFixed(0)} days old — {(adherenceReview.adherenceRate * 100).toFixed(0)}% adherence.
            </p>
            <p className="text-xs text-teal-400 mt-1">What shifted? Let that inform what you commit to now.</p>
          </div>
        )}

        <div className="rounded-2xl border border-stone-700/40 bg-stone-900/40 p-5 space-y-3">
          <p className="text-sm font-serif font-light text-stone-200">Your Commitment</p>
          <p className="text-xs text-stone-500 italic">Making a commitment is the practice.</p>
          <textarea
            value={draft.commitmentNotes}
            onChange={e => updateDraft({ commitmentNotes: e.target.value })}
            placeholder="Why are you committing to this plan? What will make it work?"
            rows={5}
            className="w-full bg-stone-950/60 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 resize-none focus:outline-none focus:border-teal-500/40"
          />
        </div>

        {/* Conditions of satisfaction */}
        <div className="rounded-2xl border border-stone-700/40 bg-stone-900/40 p-5 space-y-3">
          <p className="text-sm font-serif font-light text-stone-200">Conditions of Satisfaction</p>
          <p className="text-xs text-stone-500">I will know this week worked if...</p>
          {conditions.map((val, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 text-teal-500/60 text-xs">—</span>
              <input
                type="text"
                value={val}
                onChange={e => {
                  const next = [...conditions];
                  next[i] = e.target.value;
                  updateDraft({ conditionsOfSatisfaction: next });
                }}
                placeholder={`Condition ${i + 1}`}
                className="flex-1 bg-stone-950/60 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 min-h-[44px]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // Step 6: Activation
  // ============================================================================
  const renderActivation = () => {
    const plan = draft.generatedPlan;
    const balance = draft.moduleBalance;
    const activeDays = plan?.weeklyPlan.filter(d => d.practices.length > 0).length ?? 0;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Icon glow */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-teal-500/15 blur-xl" />
            <div className="relative w-16 h-16 rounded-full border border-teal-500/30 bg-stone-900/60 flex items-center justify-center">
              <WorldEngineIcon className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-light text-stone-100">Activate Your Plan</h3>
          <p className="text-xs text-stone-500 text-center max-w-xs leading-relaxed">
            Saving this plan starts your 7-day cycle and adds an integrated insight to your Intelligence Hub.
          </p>
        </div>

        {/* Summary grid */}
        {plan && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-700/40 bg-stone-900/40 p-4">
              <p className="text-xs text-stone-500 tracking-widest uppercase mb-1">Active Days</p>
              <p className="text-2xl font-light text-stone-100">{activeDays}<span className="text-sm text-stone-500"> / 7</span></p>
            </div>
            <div className="rounded-2xl border border-stone-700/40 bg-stone-900/40 p-4">
              <p className="text-xs text-stone-500 tracking-widest uppercase mb-1">Weekly Minutes</p>
              <p className="text-2xl font-light text-stone-100">{plan.totalWeeklyMinutes}</p>
            </div>
            {balance && (
              <>
                <div className={`rounded-2xl border ${MODULE_COLORS.shadow.border} ${MODULE_COLORS.shadow.bg} p-4`}>
                  <p className={`text-xs tracking-widest uppercase mb-1 ${MODULE_COLORS.shadow.text}`}>Shadow</p>
                  <p className="text-2xl font-light text-stone-100">{Math.round(balance.shadowScore * 100)}%</p>
                </div>
                <div className={`rounded-2xl border ${MODULE_COLORS.body.border} ${MODULE_COLORS.body.bg} p-4`}>
                  <p className={`text-xs tracking-widest uppercase mb-1 ${MODULE_COLORS.body.text}`}>Body</p>
                  <p className="text-2xl font-light text-stone-100">{Math.round(balance.bodyScore * 100)}%</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // Success screen
  // ============================================================================
  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md bg-stone-950 border border-teal-500/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 text-center overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-teal-500/3 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-teal-500/8 blur-3xl pointer-events-none" />

          <SingularityOrbIcon size={56} className="text-teal-400 relative" />
          <div className="relative">
            <h3 className="text-2xl font-serif font-light text-stone-100 mb-2">Plan Activated</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Your {draft.weeklyMinutes}-minute weekly practice plan has been saved. An integrated insight has been added to your Intelligence Hub.
            </p>
          </div>
          <button
            onClick={onClose}
            className="relative w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium rounded-xl transition-all min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // WizardFrame config
  // ============================================================================
  const nextButtonLabels: Record<number, string> = {
    1: 'Begin Design',
    2: 'Assess Balance',
    3: 'Generate Plan',
    4: 'Continue',
    5: 'Commit',
    6: 'Activate Plan',
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) handleAssessment();
    else if (step === 3) handleDepthInquiry(false);
    else if (step === 4) handlePlanReviewed();
    else if (step === 5) handleCommitment();
    else if (step === 6) handleCompletion();
  };

  return (
    <WizardFrame
      title="Integral Practice Designer"
      currentStep={step}
      totalSteps={6}
      isLoading={isLoading}
      showBackButton={step > 1}
      nextButtonText={nextButtonLabels[step] ?? 'Next'}
      onClose={() => { clearDraft(); onClose(); }}
      onBack={() => setStep(Math.max(1, step - 1))}
      onNext={handleNext}
      accentColor="teal"
    >
      {error && (
        <div className="bg-rose-900/30 border border-rose-700/40 rounded-xl p-3 mb-4 flex gap-2">
          <PsychopompLanternIcon size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {isLoading && <LoadingDots />}

      {!isLoading && step === 1 && renderWelcome()}
      {!isLoading && step === 2 && renderAssessment()}
      {!isLoading && step === 3 && renderDepthInquiry()}
      {!isLoading && step === 4 && renderPlanDisplay()}
      {!isLoading && step === 5 && renderCommitment()}
      {!isLoading && step === 6 && renderActivation()}

      {/* Skip button for depth inquiry */}
      {!isLoading && step === 3 && (
        <button
          onClick={() => handleDepthInquiry(true)}
          className="w-full mt-3 py-2 text-xs text-stone-600 hover:text-stone-400 transition-colors"
        >
          Skip — generate plan without depth inquiry
        </button>
      )}
    </WizardFrame>
  );
};

export default IntegralPracticeDesignerWizard;
