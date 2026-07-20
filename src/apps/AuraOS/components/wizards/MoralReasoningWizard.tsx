/**
 * MoralReasoningWizard.tsx
 *
 * 9-step wizard for exploring moral reasoning structure via AI-generated dilemmas.
 * Module: Mind (amber accent)
 *
 * Steps:
 *  1. Context Setup     - domain/profession dropdown + optional context textarea
 *  2. Dilemma 1         - AI-generated first scenario
 *  3. Your POV 1        - user responds from own perspective
 *  4. Stakeholder POV 1 - user reasons AS dilemma1.keyStakeholder
 *  5. Dilemma 2         - AI-generated contrasting scenario (loaded during step 4)
 *  6. Your POV 2        - user responds from own perspective
 *  7. Opposing POV 2    - user reasons AS dilemma2.keyStakeholder
 *  8. Structural Analysis - AI synthesizes all 4 reasoning texts
 *  9. Stretch & Completion - stretch exercise, response, insight generation, save
 *
 * CRITICAL: Stage numbers are NEVER displayed. dominantStage is a descriptive string.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import SafetyBanner from '../shared/SafetyBanner';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { practices } from '../../constants';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import type { IntegratedInsight, CrisisLevel } from '../../types';
import { AlgorithmIcon } from '../visualizations/SacredGeometryIcons';
import {
  moralDilemmaSchema,
  moralAnalysisSchema,
  type MoralDilemma,
  type MoralAnalysis,
} from '../../services/ai/wizardSchemas';

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-moral-reasoning';
const HISTORY_KEY = 'aura-moralReasoningHistory';

// ---------------------------------------------------------------------------
// Domain options
// ---------------------------------------------------------------------------
const DOMAIN_OPTIONS = [
  { value: 'healthcare', label: 'Healthcare / Medicine' },
  { value: 'law', label: 'Law / Legal Practice' },
  { value: 'business', label: 'Business / Management' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology / Engineering' },
  { value: 'government', label: 'Government / Public Policy' },
  { value: 'nonprofit', label: 'Nonprofit / Social Work' },
  { value: 'journalism', label: 'Journalism / Media' },
  { value: 'research', label: 'Research / Academia' },
  { value: 'personal', label: 'Personal / Family Life' },
  { value: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Schemas imported from services/ai/wizardSchemas.ts

// ---------------------------------------------------------------------------
// Session shape stored in localStorage
// ---------------------------------------------------------------------------
interface MoralReasoningDraft {
  sessionId: string;
  step: number;
  domain: string;
  customContext: string;
  dilemma: MoralDilemma | null;
  reasoning: string;
  stakeholderPov1: string;
  dilemma2: MoralDilemma | null;
  reasoning2: string;
  stakeholderPov2: string;
  probeAnswers: Record<string, string>;
  additionalProbes: string[];
  analysis: MoralAnalysis | null;
  stretchResponse: string;
  linkedInsightId?: string;
}

const INITIAL_DRAFT: MoralReasoningDraft = {
  sessionId: `moral-${Date.now()}`,
  step: 1,
  domain: '',
  customContext: '',
  dilemma: null,
  reasoning: '',
  stakeholderPov1: '',
  dilemma2: null,
  reasoning2: '',
  stakeholderPov2: '',
  probeAnswers: {},
  additionalProbes: [],
  analysis: null,
  stretchResponse: '',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MoralReasoningWizardProps {
  onClose: () => void;
  onSave?: (insight: IntegratedInsight) => void;
  userId?: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

// ---------------------------------------------------------------------------
// AI functions
// ---------------------------------------------------------------------------
async function generateMoralDilemma(
  domain: string,
  customContext: string,
  previousDilemma?: MoralDilemma | null,
): Promise<MoralDilemma> {
  const domainLabel = DOMAIN_OPTIONS.find(d => d.value === domain)?.label || domain;
  const contextNote = customContext.trim()
    ? `Additional context from the user: "${customContext.trim()}".`
    : '';

  const contrastNote = previousDilemma
    ? `Generate a CONTRASTING dilemma that explores a different ethical axis and stakeholder tension than this previous dilemma: "${previousDilemma.scenario.substring(0, 200)}...". The new dilemma should probe a distinctly different moral orientation.`
    : '';

  const prompt = `You are a moral philosophy educator creating a realistic, nuanced ethical dilemma for developmental reflection.

Domain: ${domainLabel}
${contextNote}
${contrastNote}

Generate a moral dilemma that is:
- Grounded in the specified domain with realistic details
- Genuinely difficult — no easy answer exists
- Structured around a real tension between competing values (justice vs care, individual vs collective, honesty vs loyalty, etc.)
- Appropriate for adult self-reflection (not clinical/therapeutic)

Return a JSON object:
{
  "scenario": "A nurse discovers her supervisor falsified a patient's medication records to avoid a malpractice report. Reporting it will protect future patients but may end the supervisor's career and destabilize the ward. Staying silent protects the team but leaves a dangerous precedent.",
  "domainTag": "Healthcare Ethics",
  "stakeholders": ["Nurse", "Supervisor", "Patients", "Hospital Administration"],
  "coreConflict": "Institutional loyalty and team stability versus patient safety and professional integrity.",
  "probe": "What would you do in this situation, and what values or principles guide that choice?",
  "keyStakeholder": "The Supervisor"
}

The keyStakeholder field must name a specific role whose perspective would most sharpen the ethical tension — someone whose interests and reasoning would differ meaningfully from the user's natural viewpoint.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  return callGrokThenAIJson('MoralReasoningWizard', prompt, 'qwen-fallback-default', moralDilemmaSchema);
}

async function analyzeMoralReasoning(
  dilemma1: MoralDilemma,
  reasoning1: string,
  stakeholderPov1: string,
  dilemma2: MoralDilemma,
  reasoning2: string,
  stakeholderPov2: string,
  probeAnswers: Record<string, string>,
): Promise<MoralAnalysis> {
  const probeText = Object.entries(probeAnswers)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `Probe "${k}": ${v}`)
    .join('\n');

  const prompt = `You are an expert in moral development theory (Kohlberg, Gilligan, Rest, Haidt). Analyze the user's moral reasoning across two dilemmas and two stakeholder perspective exercises WITHOUT mentioning stage numbers at all.

DILEMMA 1:
${dilemma1.scenario}

USER RESPONSE (own perspective):
${reasoning1}

USER RESPONSE (as ${dilemma1.keyStakeholder}):
${stakeholderPov1}

DILEMMA 2:
${dilemma2.scenario}

USER RESPONSE (own perspective):
${reasoning2}

USER RESPONSE (as ${dilemma2.keyStakeholder}):
${stakeholderPov2}

ADDITIONAL PROBE ANSWERS:
${probeText || '(none)'}

Analyze the structure of this reasoning across all four texts and return a JSON object:
{
  "dominantStage": "Conventional Role-Conforming",
  "structureDescription": "The person frames both dilemmas through institutional obligations and role expectations, prioritizing what a 'good professional' would do over abstract principles or relational care.",
  "reasoningIndicators": ["References to professional duty in both dilemmas", "Appeals to what colleagues would expect", "Discomfort with rule-breaking even when harm is clear"],
  "justiceCareBalance": 0.35,
  "blindSpots": ["Systemic causes of the dilemmas are not examined", "Emotional and relational costs to vulnerable parties are minimized"],
  "stretchExercise": "Imagine you are the least powerful stakeholder in each scenario. Write two sentences from their perspective about what a just outcome would look and feel like for them.",
  "stretchRationale": "Your reasoning consistently centers authority figures and institutional norms. Foregrounding the least powerful stakeholder would expand your moral field.",
  "crossSituationalPattern": "Across both dilemmas the user defaults to deferring to institutional frameworks rather than challenging them, even when individual harm is evident.",
  "perspectiveTakingScore": 0.52,
  "perspectiveTakingNotes": "The stakeholder responses show moderate perspective-taking — the user captures surface-level interests of the role but does not fully inhabit the emotional stakes or value conflicts the stakeholder would feel."
}

For justiceCareBalance: use -1.0 (pure care) to 1.0 (pure justice), with 0.0 as balanced.
For perspectiveTakingScore: 0.0 = no genuine perspective shift, 1.0 = fully inhabited the other's viewpoint.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  return callGrokThenAIJson('MoralReasoningWizard', prompt, 'qwen-fallback-default', moralAnalysisSchema);
}

// ---------------------------------------------------------------------------
// Sub-component: isolated text input to prevent INP lag
// ---------------------------------------------------------------------------
interface DraftTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
  maxLength?: number;
}

function DraftTextArea({ value, onChange, placeholder, rows = 5, label, hint, maxLength }: DraftTextAreaProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Justice / Care Balance Bar
// ---------------------------------------------------------------------------
function JusticeCareBar({ value }: { value: number }) {
  // value: -1 = pure care, 0 = balanced, +1 = pure justice
  const clamp = Math.max(-1, Math.min(1, value));
  // Convert [-1, 1] to [0%, 100%] for position
  const pct = ((clamp + 1) / 2) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Care / Relational</span>
        <span>Justice / Rights</span>
      </div>
      <div className="relative h-3 bg-slate-700 rounded-full overflow-visible">
        {/* Gradient fill */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700 via-slate-600 to-amber-700 opacity-40" />
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg bg-amber-400 z-10 transition-all duration-700"
          style={{ left: `${pct}%` }}
          title={`Balance: ${clamp > 0.2 ? 'Justice-leaning' : clamp < -0.2 ? 'Care-leaning' : 'Balanced'}`}
        />
      </div>
      <p className="text-center text-xs text-slate-400 italic">
        {clamp > 0.5
          ? 'Strong justice / rights orientation'
          : clamp > 0.2
            ? 'Moderate justice lean'
            : clamp < -0.5
              ? 'Strong care / relational orientation'
              : clamp < -0.2
                ? 'Moderate care lean'
                : 'Balanced justice-care orientation'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------
export default function MoralReasoningWizard({
  onClose,
  onSave,
  userId = 'anonymous',
  insightContext,
  markInsightAsAddressed,
}: MoralReasoningWizardProps) {
  const { setIntegratedInsights } = useInsightsContext();

  const [draft, updateDraft, , clearDraft] = useWizardDraft<MoralReasoningDraft>(
    DRAFT_KEY,
    {
      ...INITIAL_DRAFT,
      sessionId: `moral-${Date.now()}`,
      linkedInsightId: insightContext?.id,
    },
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedInsight, setSavedInsight] = useState<IntegratedInsight | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');

  const step = draft.step;
  const TOTAL_STEPS = 9;

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------
  const goBack = useCallback(() => {
    if (step > 1) updateDraft({ step: step - 1 });
  }, [step, updateDraft]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ---------------------------------------------------------------------------
  // Step 1 -> 2: generate dilemma
  // ---------------------------------------------------------------------------
  const handleStep1Next = useCallback(async () => {
    if (!draft.domain) {
      setError('Please select a domain before continuing.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const dilemma = await generateMoralDilemma(draft.domain, draft.customContext);
      updateDraft({ dilemma, step: 2 });
    } catch (err) {
      console.error('[MoralReasoning] generateMoralDilemma failed:', err);
      setError('Could not generate a dilemma. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.domain, draft.customContext, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 2 -> 3
  // ---------------------------------------------------------------------------
  const handleStep2Next = useCallback(() => {
    if (!draft.dilemma) return;
    updateDraft({ step: 3 });
  }, [draft.dilemma, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 3 -> 4: validate reasoning, crisis check, move on
  // ---------------------------------------------------------------------------
  const handleStep3Next = useCallback(() => {
    if (!draft.reasoning.trim()) {
      setError('Please describe what you would do and why before continuing.');
      return;
    }
    const detectedCrisisLevel = detectCrisisLevel(draft.reasoning);
    setCrisisLevel(detectedCrisisLevel);
    updateDraft({ step: 4 });
  }, [draft.reasoning, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 4 -> 5: validate stakeholderPov1, generate dilemma2, move on
  // ---------------------------------------------------------------------------
  const handleStep4Next = useCallback(async () => {
    if (!draft.stakeholderPov1.trim()) {
      setError('Please write your reasoning as the stakeholder before continuing.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const dilemma2 = await generateMoralDilemma(draft.domain, draft.customContext, draft.dilemma);
      updateDraft({ dilemma2, step: 5 });
    } catch (err) {
      console.error('[MoralReasoning] generateMoralDilemma (2) failed:', err);
      setError('Could not generate second dilemma. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [draft.stakeholderPov1, draft.domain, draft.customContext, draft.dilemma, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 5 -> 6
  // ---------------------------------------------------------------------------
  const handleStep5Next = useCallback(() => {
    if (!draft.dilemma2) return;
    updateDraft({ step: 6 });
  }, [draft.dilemma2, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 6 -> 7: validate reasoning2
  // ---------------------------------------------------------------------------
  const handleStep6Next = useCallback(() => {
    if (!draft.reasoning2.trim()) {
      setError('Please describe what you would do and why before continuing.');
      return;
    }
    updateDraft({ step: 7 });
  }, [draft.reasoning2, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 7 -> 8: validate stakeholderPov2, run full analysis
  // ---------------------------------------------------------------------------
  const handleStep7Next = useCallback(async () => {
    if (!draft.stakeholderPov2.trim()) {
      setError('Please write your reasoning as the stakeholder before continuing.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const analysis = await analyzeMoralReasoning(
        draft.dilemma!,
        draft.reasoning,
        draft.stakeholderPov1,
        draft.dilemma2!,
        draft.reasoning2,
        draft.stakeholderPov2,
        draft.probeAnswers,
      );
      updateDraft({ analysis, step: 8 });
    } catch (err) {
      console.error('[MoralReasoning] analyzeMoralReasoning failed:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    draft.stakeholderPov2,
    draft.dilemma,
    draft.reasoning,
    draft.stakeholderPov1,
    draft.dilemma2,
    draft.reasoning2,
    draft.probeAnswers,
    updateDraft,
  ]);

  // ---------------------------------------------------------------------------
  // Step 8 -> 9
  // ---------------------------------------------------------------------------
  const handleStep8Next = useCallback(() => {
    if (!draft.analysis) return;
    updateDraft({ step: 9 });
  }, [draft.analysis, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 9: generate insight + save
  // ---------------------------------------------------------------------------
  const handleComplete = useCallback(async () => {
    if (isSaving || savedInsight) return;
    setIsSaving(true);
    setError(null);

    try {
      const {
        analysis,
        dilemma,
        dilemma2,
        reasoning,
        reasoning2,
        stakeholderPov1,
        stakeholderPov2,
        stretchResponse,
        domain,
        sessionId,
      } = draft;

      const report = [
        `Domain: ${DOMAIN_OPTIONS.find(d => d.value === domain)?.label || domain}`,
        '',
        `Dilemma 1: ${dilemma?.scenario || ''}`,
        `Core Conflict 1: ${dilemma?.coreConflict || ''}`,
        '',
        `User Response (own POV): ${reasoning}`,
        `User Response (as ${dilemma?.keyStakeholder || 'stakeholder'}): ${stakeholderPov1}`,
        '',
        `Dilemma 2: ${dilemma2?.scenario || ''}`,
        `Core Conflict 2: ${dilemma2?.coreConflict || ''}`,
        '',
        `User Response 2 (own POV): ${reasoning2}`,
        `User Response 2 (as ${dilemma2?.keyStakeholder || 'stakeholder'}): ${stakeholderPov2}`,
        '',
        `Reasoning Structure: ${analysis?.dominantStage || ''} — ${analysis?.structureDescription || ''}`,
        `Justice-Care Balance: ${analysis?.justiceCareBalance?.toFixed(2) || '0.00'}`,
        `Blind Spots: ${analysis?.blindSpots.join('; ') || ''}`,
        `Cross-Situational Pattern: ${analysis?.crossSituationalPattern || ''}`,
        `Perspective-Taking Score: ${analysis?.perspectiveTakingScore !== undefined ? Math.round(analysis.perspectiveTakingScore * 100) + '%' : 'N/A'}`,
        '',
        `Stretch Exercise: ${analysis?.stretchExercise || ''}`,
        `Stretch Response: ${stretchResponse}`,
      ].join('\n');

      const summary = `Explored two ${DOMAIN_OPTIONS.find(d => d.value === domain)?.label || domain} dilemmas with stakeholder perspective exercises. Reasoning structure: ${analysis?.dominantStage || 'unknown'}. Key blind spots: ${analysis?.blindSpots.slice(0, 2).join(', ') || 'none identified'}.`;

      const insight = await generateInsightFromSession({
        wizardType: 'Moral Reasoning',
        sessionId,
        sessionName: 'Moral Reasoning Session',
        sessionReport: report,
        sessionSummary: summary,
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

      if (draft.linkedInsightId && markInsightAsAddressed) {
        markInsightAsAddressed(draft.linkedInsightId, 'Moral Reasoning', sessionId);
      }

      // Save to history (capped at 75)
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const history: MoralReasoningDraft[] = raw ? JSON.parse(raw) : [];
        history.unshift({ ...draft });
        if (history.length > 75) history.splice(75);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch {
        // Non-fatal
      }

      // Add insight to context
      setIntegratedInsights(prev => [insight, ...prev]);
      setSavedInsight(insight);

      if (onSave) onSave(insight);

      clearDraft();
    } catch (err) {
      console.error('[MoralReasoning] handleComplete failed:', err);
      setError('Could not save your session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [draft, isSaving, savedInsight, userId, markInsightAsAddressed, setIntegratedInsights, onSave, clearDraft]);

  // ---------------------------------------------------------------------------
  // WizardFrame next dispatcher
  // ---------------------------------------------------------------------------
  const handleNext = useCallback(() => {
    setError(null);
    if (step === 1) return handleStep1Next();
    if (step === 2) return handleStep2Next();
    if (step === 3) return handleStep3Next();
    if (step === 4) return handleStep4Next();
    if (step === 5) return handleStep5Next();
    if (step === 6) return handleStep6Next();
    if (step === 7) return handleStep7Next();
    if (step === 8) return handleStep8Next();
    if (step === 9) return handleComplete();
  }, [
    step,
    handleStep1Next,
    handleStep2Next,
    handleStep3Next,
    handleStep4Next,
    handleStep5Next,
    handleStep6Next,
    handleStep7Next,
    handleStep8Next,
    handleComplete,
  ]);

  const nextButtonText = (() => {
    if (step === 1) return isLoading ? 'Generating Dilemma...' : 'Generate Dilemma';
    if (step === 2) return 'Begin Reflection';
    if (step === 3) return 'Next: Stakeholder Perspective';
    if (step === 4) return isLoading ? 'Generating Dilemma 2...' : 'Next: Second Dilemma';
    if (step === 5) return 'Begin Reflection';
    if (step === 6) return 'Next: Stakeholder Perspective';
    if (step === 7) return isLoading ? 'Analyzing...' : 'Analyze My Reasoning';
    if (step === 8) return 'Stretch Exercise';
    if (step === 9) return isSaving ? 'Saving...' : savedInsight ? 'Saved' : 'Complete Session';
    return 'Next';
  })();

  // ---------------------------------------------------------------------------
  // Step renders
  // ---------------------------------------------------------------------------
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <AlgorithmIcon className="w-16 h-16 text-amber-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
          Set Your Context
        </h3>
        <p className="text-sm text-slate-400">
          Choose the domain where you face ethical decisions. The AI will craft two dilemmas grounded in your context.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Domain / Profession <span className="text-rose-400">*</span>
        </label>
        <select
          value={draft.domain}
          onChange={e => updateDraft({ domain: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select a domain...</option>
          {DOMAIN_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DraftTextArea
        label="Additional context (optional)"
        value={draft.customContext}
        onChange={val => updateDraft({ customContext: val })}
        placeholder="Describe your specific role, situation, or any constraints you'd like the dilemmas to reflect..."
        rows={4}
        hint="This helps tailor both dilemmas to your real-world circumstances."
      />

      {insightContext && (
        <div className="bg-amber-950/30 border border-amber-700/40 rounded-lg p-3 text-xs text-amber-200 space-y-1">
          <p className="font-semibold">Linked Insight Context</p>
          <p className="text-amber-300/80">{insightContext.detectedPattern}</p>
          <p className="text-amber-400/60">From: {insightContext.mindToolType}</p>
        </div>
      )}
    </div>
  );

  const renderDilemmaCard = (d: MoralDilemma, label: string) => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
          {label}
        </h3>
        <p className="text-sm text-slate-400">
          Read the scenario carefully. There is no single right answer — the tension is intentional.
        </p>
      </div>

      {/* Domain tag */}
      <div>
        <span className="inline-block bg-amber-900/50 border border-amber-700/50 text-amber-300 text-xs font-mono px-2.5 py-0.5 rounded-full">
          {d.domainTag}
        </span>
      </div>

      {/* Scenario prose block */}
      <div className="bg-slate-800/70 border border-slate-600 rounded-xl p-5 text-slate-200 text-sm sm:text-base leading-relaxed font-serif shadow-inner">
        {d.scenario}
      </div>

      {/* Stakeholders */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stakeholders</p>
        <div className="flex flex-wrap gap-2">
          {d.stakeholders.map(s => (
            <span key={s} className="bg-slate-700/60 border border-slate-600 text-slate-300 text-xs px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Core conflict */}
      <div className="bg-amber-950/20 border-l-4 border-amber-600 pl-4 py-2">
        <p className="text-xs font-semibold text-amber-400 mb-1">Core Ethical Tension</p>
        <p className="text-sm text-amber-200 italic">{d.coreConflict}</p>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const d = draft.dilemma;
    if (!d) return null;
    return renderDilemmaCard(d, 'Dilemma 1');
  };

  const renderStep3 = () => {
    const d = draft.dilemma;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Your Reasoning — Dilemma 1
          </h3>
          <p className="text-sm text-slate-400">
            Respond in your own words. The AI will analyze the structure of your moral reasoning — not judge it.
          </p>
        </div>

        {/* Opening probe from AI */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-400 mb-1.5">Reflection Prompt</p>
          <p className="text-sm text-slate-200 italic">{d.probe}</p>
        </div>

        <DraftTextArea
          label="What would you do, and why?"
          value={draft.reasoning}
          onChange={val => updateDraft({ reasoning: val })}
          placeholder="Describe your decision and the values, principles, or considerations driving it..."
          rows={7}
          hint="Write freely. Depth of reasoning matters more than length."
        />

        {crisisLevel !== 'none' && (
          <SafetyBanner crisisLevel={crisisLevel} />
        )}
      </div>
    );
  };

  const renderStep4 = () => {
    const d = draft.dilemma;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Reason as: {d.keyStakeholder}
          </h3>
          <p className="text-sm text-slate-400">
            Set aside your own perspective. Step into the role of {d.keyStakeholder}. What would they prioritize and why?
          </p>
        </div>

        {/* Condensed dilemma reference */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Dilemma 1 — Brief Summary</p>
          <p className="text-sm text-slate-300 leading-relaxed font-serif">{d.scenario}</p>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-amber-400/80 italic">{d.coreConflict}</p>
          </div>
        </div>

        <DraftTextArea
          label={`Reasoning as ${d.keyStakeholder}...`}
          value={draft.stakeholderPov1}
          onChange={val => updateDraft({ stakeholderPov1: val })}
          placeholder={`From ${d.keyStakeholder}'s perspective, what matters most here? What pressures, values, and interests would shape their decision?`}
          rows={6}
          hint="Inhabit this role as fully as you can — their fears, loyalties, and priorities."
        />
      </div>
    );
  };

  const renderStep5 = () => {
    const d = draft.dilemma2;
    if (!d) return null;
    return renderDilemmaCard(d, 'Dilemma 2');
  };

  const renderStep6 = () => {
    const d = draft.dilemma2;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Your Reasoning — Dilemma 2
          </h3>
          <p className="text-sm text-slate-400">
            Respond from your own perspective again. This second dilemma is designed to probe a different ethical axis.
          </p>
        </div>

        {/* Opening probe from AI */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-400 mb-1.5">Reflection Prompt</p>
          <p className="text-sm text-slate-200 italic">{d.probe}</p>
        </div>

        <DraftTextArea
          label="What would you do, and why?"
          value={draft.reasoning2}
          onChange={val => updateDraft({ reasoning2: val })}
          placeholder="Describe your decision and the values, principles, or considerations driving it..."
          rows={7}
          hint="Write freely. Compare your instincts here with your response to the first dilemma."
        />
      </div>
    );
  };

  const renderStep7 = () => {
    const d = draft.dilemma2;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Reason as: {d.keyStakeholder}
          </h3>
          <p className="text-sm text-slate-400">
            Set aside your own perspective. Step into the role of {d.keyStakeholder}. What would they prioritize and why?
          </p>
        </div>

        {/* Condensed dilemma reference */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Dilemma 2 — Brief Summary</p>
          <p className="text-sm text-slate-300 leading-relaxed font-serif">{d.scenario}</p>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-amber-400/80 italic">{d.coreConflict}</p>
          </div>
        </div>

        <DraftTextArea
          label={`Reasoning as ${d.keyStakeholder}...`}
          value={draft.stakeholderPov2}
          onChange={val => updateDraft({ stakeholderPov2: val })}
          placeholder={`From ${d.keyStakeholder}'s perspective, what matters most here? What pressures, values, and interests would shape their decision?`}
          rows={6}
          hint="Inhabit this role as fully as you can — their fears, loyalties, and priorities."
        />
      </div>
    );
  };

  const renderStep8 = () => {
    const a = draft.analysis;
    if (!a) return null;

    const ptPct = a.perspectiveTakingScore !== undefined
      ? Math.round(a.perspectiveTakingScore * 100)
      : null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Structural Analysis
          </h3>
          <p className="text-sm text-slate-400">
            Here is how the AI mapped the structure of your moral reasoning across both dilemmas.
          </p>
        </div>

        {/* Dominant orientation — descriptive only, no stage numbers */}
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Reasoning Orientation</p>
          <p className="text-base sm:text-lg font-serif font-medium text-amber-200">{a.dominantStage}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{a.structureDescription}</p>
        </div>

        {/* Reasoning indicators */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence in Your Reasoning</p>
          <ul className="space-y-2">
            {a.reasoningIndicators.map((indicator, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {indicator}
              </li>
            ))}
          </ul>
        </div>

        {/* Justice / Care balance bar */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Justice-Care Balance</p>
          <JusticeCareBar value={a.justiceCareBalance} />
        </div>

        {/* Blind spots */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potential Blind Spots</p>
          <div className="space-y-2">
            {a.blindSpots.map((spot, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
                {spot}
              </div>
            ))}
          </div>
        </div>

        {/* Cross-situational pattern */}
        {a.crossSituationalPattern && (
          <div className="bg-slate-800/50 border-l-4 border-purple-500 pl-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Cross-Situational Pattern</p>
            <p className="text-sm text-slate-300 leading-relaxed">{a.crossSituationalPattern}</p>
          </div>
        )}

        {/* Perspective-taking score */}
        {ptPct !== null && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perspective-Taking</p>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 text-lg font-bold font-mono shrink-0 ${ptPct >= 70
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                    : ptPct >= 40
                      ? 'border-amber-500 text-amber-300 bg-amber-950/40'
                      : 'border-rose-500 text-rose-300 bg-rose-950/40'
                  }`}
              >
                {ptPct}%
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">{a.perspectiveTakingNotes}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep9 = () => {
    const a = draft.analysis;
    if (!a) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-amber-300">
            Stretch Exercise
          </h3>
          <p className="text-sm text-slate-400">
            Growth happens at the edge of your current way of seeing. This exercise invites a perspective you may not have considered.
          </p>
        </div>

        {/* Stretch rationale */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-400">Why This Stretch Matters</p>
          <p className="text-sm text-slate-300 italic">{a.stretchRationale}</p>
        </div>

        {/* Stretch exercise */}
        <div className="bg-amber-950/20 border-l-4 border-amber-500 pl-4 py-3">
          <p className="text-sm sm:text-base text-amber-200 font-serif leading-relaxed">{a.stretchExercise}</p>
        </div>

        <DraftTextArea
          label="Your response to the stretch exercise"
          value={draft.stretchResponse}
          onChange={val => updateDraft({ stretchResponse: val })}
          placeholder="Write any thoughts, feelings, or shifts that arose as you engaged with this perspective..."
          rows={6}
          hint="Even a brief response helps ground the insight."
        />

        {savedInsight ? (
          <div className="bg-emerald-950/40 border border-emerald-700 rounded-lg p-4 text-sm text-emerald-300 space-y-1">
            <p className="font-semibold">Session saved.</p>
            <p className="text-emerald-400/80 text-xs">Your insight has been added to the Intelligence Hub.</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/40 border border-rose-700 rounded-lg p-3 text-xs text-rose-300">
            {error}
          </div>
        ) : null}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <WizardFrame
      title="Moral Reasoning"
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading || isSaving}
      showBackButton={step > 1 && !savedInsight}
      onClose={handleClose}
      onBack={goBack}
      onNext={handleNext}
      accentColor="amber"
      errorMessage={error}
      nextButtonText={nextButtonText}
      leftFooterSlot={
        step > 1 && !savedInsight ? (
          <button
            onClick={handleClose}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
          >
            Save Draft & Exit
          </button>
        ) : undefined
      }
    >
      {error && step !== 9 && (
        <div className="mb-4 bg-rose-950/40 border border-rose-700 rounded-lg p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
      {step === 7 && renderStep7()}
      {step === 8 && renderStep8()}
      {step === 9 && renderStep9()}
    </WizardFrame>
  );
}
