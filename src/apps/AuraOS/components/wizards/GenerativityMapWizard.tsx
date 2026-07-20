/**
 * GenerativityMapWizard.tsx
 * Spirit module (teal accent) — Showing Up / Generativity practice.
 *
 * Framework: Erikson's Stage 7 (Generativity vs. Stagnation) + Wilber's
 * "Showing Up" (the integration of earned development into expressed contribution).
 *
 * Steps: 8 (Intro → Intake → Blueprint → Yang → Yin → Synthesis → Delivery → Reflection)
 *
 * NOTE: This wizard is insight-generative and practice-orienting — not a clinical
 * intervention. Tier 3 evidence (Erikson foundational developmental theory;
 * Wilber Showing Up Tier 4 — theoretically grounded, no empirical base).
 */
import React, { useState, useCallback } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import {
  ContributionForm,
  GenerativityMapDraft,
  IntegratedInsight,
  LifeChapter,
  CrisisLevel,
} from '../../types';
import {
  generativityPortraitSchema,
  GenerativityPortrait,
  wizardInsightSchema,
  WizardInsight,
} from '../../services/ai/wizardSchemas';
import { callGrokThenAIJson } from '../../services/aiService';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import { useAuth } from '../../contexts/AuthContext';
import { wizardSessionService } from '../../services/wizardSessionService';
import { insightDatabaseService } from '../../services/insightDatabaseService';
import SafetyBanner from '../shared/SafetyBanner';
import { EvolutionaryUnfoldingIcon } from '../visualizations/SacredGeometryIcons';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-generativity-map';
const HISTORY_KEY = 'aura-generativityMapHistory';
const HISTORY_CAP = 30;
const WIZARD_NAME = 'Generativity Map';
const TOTAL_STEPS = 7;

// ---------------------------------------------------------------------------
// Initial draft
// ---------------------------------------------------------------------------
const initialDraft: GenerativityMapDraft = {
  lifeChapter: null,
  ilpModulesEngaged: [],
  readinessScore: 3,
  hardestLesson: '',
  earnedWisdom: ['', ''],
  contributionForms: [],
  somaticLocation: '',
  somaticPhrase: '',
  somaticQuality: null,
  generativityPortrait: '',
  clarityBefore: 5,
  clarityAfter: 5,
  selectedPortraitLine: '',
  commitmentAction: '',
};

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------
const CHAPTER_LABELS: Record<LifeChapter, string> = {
  early: 'Early adulthood (20s–30s)',
  middle: 'Middle life (40s–50s)',
  later: 'Later life (60s+)',
  'in-transition': 'In transition between chapters',
};

const READINESS_LABELS: Record<number, string> = {
  1: 'Still deep in the work',
  2: 'Mostly in process',
  3: 'Beginning to integrate',
  4: 'Mostly ready to give',
  5: 'Ready to offer what I\'ve earned',
};

const CONTRIBUTION_LABELS: Record<ContributionForm, string> = {
  teaching: 'Teaching',
  creating: 'Creating',
  protecting: 'Protecting',
  mentoring: 'Mentoring',
  building: 'Building',
  'holding-space': 'Holding Space',
  translating: 'Translating',
  modeling: 'Modeling',
};

const ILP_MODULE_OPTIONS = ['Body', 'Mind', 'Shadow', 'Spirit'];

// ---------------------------------------------------------------------------
// History helpers
// ---------------------------------------------------------------------------
function saveToHistory(draft: GenerativityMapDraft) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: GenerativityMapDraft[] = raw ? JSON.parse(raw) : [];
    history.unshift(draft);
    if (history.length > HISTORY_CAP) history.length = HISTORY_CAP;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // non-critical
  }
}

// ---------------------------------------------------------------------------
// Fallback portrait assembly
// ---------------------------------------------------------------------------
function buildFallbackPortrait(draft: GenerativityMapDraft): string {
  const wisdoms = [draft.earnedWisdom[0], draft.earnedWisdom[1], draft.earnedWisdom[2]]
    .filter(Boolean)
    .map((w, i) => `${i + 1}. ${w}`)
    .join('\n');
  const forms = draft.contributionForms
    .map(f => CONTRIBUTION_LABELS[f])
    .join(', ') || 'not yet specified';
  const somatic = draft.somaticLocation
    ? `A felt sense lives in your ${draft.somaticLocation}${draft.somaticPhrase ? ` — ${draft.somaticPhrase}` : ''}.`
    : '';
  return `[Generated from your reflections — AI was unavailable]\n\nYou have been forged by what you've lived. The chapter you are in now is not a detour — it is the culmination of all that came before it. What you carry as wisdom is hard-won, not theoretical:\n\n${wisdoms}\n\nThe forms through which you are called to contribute are: ${forms}. These are not random — they map directly to what you have been asked to hold, learn, and become.\n\n${somatic} This is where your generativity lives in the body — a guide you can return to when the question arises: is this mine to give?`;
}

// ---------------------------------------------------------------------------
// Isolated input sub-components (INP prevention)
// ---------------------------------------------------------------------------
function EarnedWisdomInput({
  value,
  onChange,
  placeholder,
  index,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  index: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-teal-400 uppercase tracking-wider font-medium">
        Earned wisdom {index + 1}{index === 2 && ' (optional)'}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed min-h-[80px]"
        placeholder={placeholder}
      />
    </div>
  );
}

function HardestLessonInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none leading-relaxed min-h-[100px]"
      placeholder="What experience or period most shaped who you are now? What did it cost you, and what did it give you?"
    />
  );
}

// ---------------------------------------------------------------------------
// Pill components
// ---------------------------------------------------------------------------
function PillSelect<T extends string>({
  options,
  value,
  onChange,
  accentClass = 'bg-teal-700/60 border-teal-500 text-teal-200',
  inactiveClass = 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-teal-700/50 hover:text-slate-300',
  labelMap,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  accentClass?: string;
  inactiveClass?: string;
  labelMap?: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            value === opt ? accentClass : inactiveClass
          }`}
        >
          {labelMap ? labelMap[opt] : opt}
        </button>
      ))}
    </div>
  );
}

function MultiPillSelect<T extends string>({
  options,
  values,
  onChange,
  labelMap,
}: {
  options: readonly T[];
  values: T[];
  onChange: (v: T[]) => void;
  labelMap?: Record<T, string>;
}) {
  const toggle = (opt: T) => {
    onChange(
      values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            values.includes(opt)
              ? 'bg-teal-700/60 border-teal-500 text-teal-200'
              : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-teal-700/50 hover:text-slate-300'
          }`}
        >
          {labelMap ? labelMap[opt] : opt}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------
function LabeledSlider({
  value,
  min,
  max,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-teal-500"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{leftLabel}</span>
        <span className="text-teal-400 font-medium">{value}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Portrait display
// ---------------------------------------------------------------------------
function PortraitDisplay({
  portrait,
  isFallback,
}: {
  portrait: string;
  isFallback: boolean;
}) {
  const lines = portrait.split('\n\n').filter(Boolean);
  return (
    <div
      className={`rounded-xl p-5 space-y-4 border ${
        isFallback
          ? 'bg-slate-900/40 border-slate-700/50'
          : 'bg-teal-950/40 border-teal-800/30'
      }`}
    >
      {isFallback && (
        <p className="text-xs text-amber-400/80 border border-amber-800/30 bg-amber-950/30 rounded-lg px-3 py-2">
          Portrait assembled from your reflections — AI generation was unavailable.
        </p>
      )}
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-slate-200 leading-relaxed font-light italic">
          {line}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
interface GenerativityMapWizardProps {
  onClose: () => void;
}

export default function GenerativityMapWizard({ onClose }: GenerativityMapWizardProps) {
  const { user } = useAuth();
  const { setIntegratedInsights } = useInsightsContext();
  const [draft, updateDraft, , clearDraft] = useWizardDraft<GenerativityMapDraft>(
    DRAFT_KEY,
    initialDraft
  );
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [isFallbackPortrait, setIsFallbackPortrait] = useState(false);

  // -------------------------------------------------------------------------
  // Crisis detection helpers (run on every relevant free-text change)
  // -------------------------------------------------------------------------
  const checkCrisis = useCallback((...texts: string[]) => {
    let highest: CrisisLevel = 'none';
    for (const t of texts) {
      const c = detectCrisisLevel(t);
      if (c === 'high') { highest = 'high'; break; }
      if (c === 'concern') highest = 'concern';
    }
    setCrisisLevel(highest);
  }, []);

  // -------------------------------------------------------------------------
  // Step 5: Generate Generativity Portrait
  // -------------------------------------------------------------------------
  const handleGeneratePortrait = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsFallbackPortrait(false);
    setStep(5);

    const wisdoms = [draft.earnedWisdom[0], draft.earnedWisdom[1], draft.earnedWisdom[2]]
      .filter(Boolean)
      .map((w, i) => `Wisdom ${i + 1}: "${w}"`)
      .join('\n');

    const formsText = draft.contributionForms
      .map(f => CONTRIBUTION_LABELS[f])
      .join(', ');

    const PORTRAIT_PROMPT = `You are a developmental guide helping a person understand their generativity profile.

Write a three-paragraph Generativity Portrait for this person. Each paragraph should feel true to their actual words — grounded, earned, not inflated.

Life chapter: ${CHAPTER_LABELS[draft.lifeChapter ?? 'middle']}
ILP modules engaged: ${draft.ilpModulesEngaged.join(', ') || 'not specified'}
Readiness for contribution (1=still in work, 5=ready to give): ${draft.readinessScore}/5
Hardest lesson lived: "${draft.hardestLesson}"
Earned wisdoms:
${wisdoms}
Contribution forms they feel called to: ${formsText || 'not yet specified'}
Somatic location of generativity: ${draft.somaticLocation || 'not specified'}
Somatic phrase: ${draft.somaticPhrase || 'not specified'}
Somatic quality: ${draft.somaticQuality || 'not specified'}

Guidelines:
- Para 1: WHO they have become through what they have lived. Use their own language from the wisdoms.
- Para 2: The specific FORM their contribution takes. Reference their chosen contribution forms concretely.
- Para 3: WHO needs what they carry — the beneficiary. Write in second person ("You carry...").
- Do NOT inflate. Do NOT use spiritual bypassing. Do NOT tell them they have "arrived."
- Keep each paragraph under 100 words.`;

    try {
      const raw = await callGrokThenAIJson<GenerativityPortrait>(
        'GenerativityMapWizard.portrait',
        PORTRAIT_PROMPT,
        'qwen/qwen3-30b-a3b-instruct-2507',
        generativityPortraitSchema
      );
      const portrait = `${raw.para1}\n\n${raw.para2}\n\n${raw.para3}`;
      updateDraft({ generativityPortrait: portrait });
      setStep(6);
    } catch (err) {
      console.error('[GenerativityMapWizard] portrait generation failed:', err);
      // Graceful fallback — assemble from user inputs
      const fallback = buildFallbackPortrait(draft);
      updateDraft({ generativityPortrait: fallback });
      setIsFallbackPortrait(true);
      setError('Portrait assembled from your reflections — AI was unavailable.');
      setStep(6);
    } finally {
      setIsLoading(false);
    }
  }, [draft, updateDraft]);

  // -------------------------------------------------------------------------
  // Step 7: Complete — generate insight, save history
  // -------------------------------------------------------------------------
  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Crisis check on all final free-text
    checkCrisis(draft.selectedPortraitLine, draft.commitmentAction);

    const sessionSummary = `Life chapter: ${draft.lifeChapter}
Readiness score: ${draft.readinessScore}/5
Hardest lesson: "${draft.hardestLesson}"
Earned wisdoms: ${[draft.earnedWisdom[0], draft.earnedWisdom[1], draft.earnedWisdom[2]].filter(Boolean).join(' | ')}
Contribution forms: ${draft.contributionForms.map(f => CONTRIBUTION_LABELS[f]).join(', ')}
Somatic anchor: ${draft.somaticLocation} — ${draft.somaticPhrase} (${draft.somaticQuality})
Generativity portrait: ${draft.generativityPortrait.slice(0, 300)}...
Selected portrait line: "${draft.selectedPortraitLine}"
Commitment action: "${draft.commitmentAction}"
Clarity before: ${draft.clarityBefore}/10 → after: ${draft.clarityAfter}/10`;

    const INSIGHT_PROMPT = `Generate an IntegratedInsight for a user who completed the GenerativityMapWizard.
This wizard uses Erikson's Stage 7 (Generativity vs. Stagnation) and Wilber's Showing Up framing.
Capture: what developmental edge emerged, what contribution patterns are becoming conscious, and any shadow around giving vs. stagnation.
Do NOT evaluate the quality of their wisdom — only the structure of how they hold their generativity.

Session data:
${sessionSummary}`;

    try {
      const raw = await callGrokThenAIJson<WizardInsight>(
        'GenerativityMapWizard.insight',
        INSIGHT_PROMPT,
        'qwen/qwen3-30b-a3b-instruct-2507',
        wizardInsightSchema
      );

      const insight: IntegratedInsight = {
        id: `generativity-map-insight-${Date.now()}`,
        mindToolType: WIZARD_NAME,
        mindToolSessionId: `gm-${Date.now()}`,
        mindToolName: WIZARD_NAME,
        mindToolReport: sessionSummary,
        mindToolShortSummary: `Generativity portrait completed. Chapter: ${draft.lifeChapter}. Forms: ${draft.contributionForms.slice(0, 2).map(f => CONTRIBUTION_LABELS[f]).join(', ')}.`,
        dateCreated: new Date().toISOString(),
        status: 'pending',
        detectedPattern: raw.detectedPattern,
        suggestedShadowWork: raw.suggestedShadowWork,
        suggestedNextSteps: raw.suggestedNextSteps,
      };

      setIntegratedInsights(prev => [...prev, insight]);

      if (user?.id) {
        try {
          await wizardSessionService.saveSession({
            user_id: user.id,
            session_id: insight.mindToolSessionId,
            type: WIZARD_NAME,
            content: { draft },
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[GenerativityMapWizard] Failed to save session:', err);
        }
        try {
          await insightDatabaseService.saveInsight(user.id, insight);
        } catch (err) {
          console.warn('[GenerativityMapWizard] Failed to save insight:', err);
        }
      }
    } catch (err) {
      console.error('[GenerativityMapWizard] insight generation failed:', err);
      // Non-blocking — session still saved
    } finally {
      const completed = { ...draft, completedAt: new Date().toISOString() };
      updateDraft({ completedAt: completed.completedAt });
      saveToHistory(completed);
      clearDraft();
      setIsLoading(false);
      setStep(7);
    }
  }, [draft, updateDraft, clearDraft, checkCrisis, setIntegratedInsights]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const canProceed = (() => {
    switch (step) {
      case 1: return (
        draft.lifeChapter !== null &&
        draft.hardestLesson.trim().length > 20
      );
      case 2: return true;
      case 3: return (
        draft.earnedWisdom[0].trim().length > 10 &&
        draft.earnedWisdom[1].trim().length > 10 &&
        draft.contributionForms.length > 0
      );
      case 4: return (
        draft.somaticLocation.trim().length > 3 &&
        draft.somaticQuality !== null
      );
      case 6: return draft.clarityAfter > 0;
      case 7: return (
        draft.selectedPortraitLine.trim().length > 5 &&
        draft.commitmentAction.trim().length > 10
      );
      default: return false;
    }
  })();

  const handleNext = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }
    if (step === 3) { setStep(4); return; }
    if (step === 4) { handleGeneratePortrait(); return; }
    if (step === 5) { return; } // loading — no-op
    if (step === 6) { handleComplete(); return; }
  };

  const handleBack = () => {
    if (step === 5 || step === 7) return; // no back from loading / completion
    if (step > 0) setStep(s => s - 1);
  };

  // -------------------------------------------------------------------------
  // Render steps
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {

      // ── Step 0: Intro ──────────────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-2">
              <EvolutionaryUnfoldingIcon className="w-16 h-16 text-teal-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-teal-300">The Generativity Map</h2>
            <p className="text-sm text-slate-400">Spirit Module · 8 steps · 20–30 min</p>
            <div className="bg-slate-900/60 border border-teal-900/30 rounded-xl p-5 text-left space-y-3 text-sm text-slate-300 leading-relaxed">
              <p className="text-center text-teal-200/70 italic text-xs border-b border-teal-900/30 pb-3">
                "What you care for shall carry on after you."
                <span className="text-slate-500 not-italic"> — Erik Erikson</span>
              </p>
              <p>
                Erik Erikson named the central developmental task of mature adulthood:
                moving from self-absorption into <em>generativity</em> — the care for the
                generation that follows and the structures they will inherit.
              </p>
              <p>
                Ken Wilber's Integral Life Practice calls this <em>Showing Up</em>: not just
                what you've attained internally, but how your development is expressed
                outward as offering. The inner work earns the capacity. Generativity is how
                that capacity meets the world.
              </p>
              <p>
                This wizard helps you map what you've earned, where it lives in the body,
                and what form your contribution is being called to take.
              </p>
              <p className="text-slate-400 text-xs border-t border-slate-800/50 pt-3">
                This is a developmental reflection practice — not therapy. It is
                insight-generative, not diagnostic.
              </p>
            </div>
          </div>
        );

      // ── Step 1: Intake ─────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-6">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">Where are you in the arc?</h3>
              <p className="text-xs text-slate-500 mb-3">
                Life chapters are not fixed by age — they are defined by what the chapter is <em>asking of you</em>.
              </p>
              <PillSelect<LifeChapter>
                options={['early', 'middle', 'later', 'in-transition']}
                value={draft.lifeChapter}
                onChange={v => updateDraft({ lifeChapter: v })}
                labelMap={CHAPTER_LABELS}
              />
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">ILP modules you've worked in</h3>
              <p className="text-xs text-slate-500 mb-3">Which domains of practice have shaped you most?</p>
              <MultiPillSelect<string>
                options={ILP_MODULE_OPTIONS}
                values={draft.ilpModulesEngaged}
                onChange={v => updateDraft({ ilpModulesEngaged: v })}
              />
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">
                Readiness to give — {READINESS_LABELS[draft.readinessScore]}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Not all of us are ready to give fully. Honest placement is more useful than aspiration.
              </p>
              <LabeledSlider
                value={draft.readinessScore}
                min={1}
                max={5}
                onChange={v => updateDraft({ readinessScore: v })}
                leftLabel="Still in the work"
                rightLabel="Ready to give"
              />
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-2">The hardest thing you've been through</h3>
              <p className="text-xs text-slate-500 mb-3">
                The passage that most forged who you are now. Not the worst thing — the most formative.
              </p>
              <HardestLessonInput
                value={draft.hardestLesson}
                onChange={v => {
                  updateDraft({ hardestLesson: v });
                  checkCrisis(v);
                }}
              />
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">Clarity of direction right now</h3>
              <p className="text-xs text-slate-500 mb-2">Before this practice — how clearly do you feel your generative direction?</p>
              <LabeledSlider
                value={draft.clarityBefore}
                min={1}
                max={10}
                onChange={v => updateDraft({ clarityBefore: v })}
                leftLabel="No clarity"
                rightLabel="Complete clarity"
              />
            </div>
          </div>
        );

      // ── Step 2: Blueprint (psychoeducation) ────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-base font-serif text-teal-300">The Developmental Frame</h3>
              <p className="text-xs text-slate-500">Read before continuing</p>
            </div>

            <div className="bg-slate-900/60 border border-teal-900/30 rounded-xl p-5 space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <p className="text-teal-300/80 font-medium text-xs uppercase tracking-wider mb-2">Erikson: Generativity vs. Stagnation</p>
                <p>
                  Erikson's seventh developmental stage asks: will I leave something that outlasts me,
                  or will I stagnate in self-absorption? The question is not whether you will die —
                  it's whether anything of you will continue to grow forward through others.
                </p>
                <p className="text-slate-400 mt-2">
                  Generativity is not altruism. It is the developmental capacity to care for structures,
                  people, and ideas beyond your own lifespan — because you have lived enough to know
                  what is worth caring for.
                </p>
              </div>

              <div className="border-t border-teal-900/30 pt-4">
                <p className="text-teal-300/80 font-medium text-xs uppercase tracking-wider mb-2">Wilber: Showing Up</p>
                <p>
                  "Showing Up" in ILP means integrating your development across all lines — cognitive,
                  emotional, somatic, relational, spiritual — and expressing that integration outward.
                  It is the difference between having depth and <em>being</em> depth in the world.
                </p>
                <p className="text-slate-400 mt-2">
                  What you carry is not a credential. It is a formed capacity that others cannot yet
                  access on their own — and that is what makes it a genuine offering.
                </p>
              </div>

              <div className="border-t border-teal-900/30 pt-4 text-xs text-amber-300/70 bg-amber-950/20 rounded-lg p-3">
                <strong>A note on state vs. stage:</strong> The portrait you will generate in this
                wizard reflects <em>where you are now</em> — not a permanent arrival. Generativity
                deepens through sustained practice and expression, not through recognition of it.
                The map is not the territory.
              </div>
            </div>
          </div>
        );

      // ── Step 3: Yang — Earned Wisdom + Contribution Forms ─────────────────
      case 3:
        return (
          <div className="space-y-6">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">What you have earned</h3>
              <p className="text-xs text-slate-500 mb-4">
                What do you now know — deeply, not theoretically — that you did not know before?
                These are not lessons from books. They are things you had to live to understand.
              </p>
              <div className="space-y-4">
                <EarnedWisdomInput
                  value={draft.earnedWisdom[0]}
                  onChange={v => {
                    updateDraft({ earnedWisdom: [v, draft.earnedWisdom[1], draft.earnedWisdom[2]] });
                    checkCrisis(v, draft.earnedWisdom[1], draft.earnedWisdom[2] ?? '');
                  }}
                  placeholder="Something I know now because I lived it..."
                  index={0}
                />
                <EarnedWisdomInput
                  value={draft.earnedWisdom[1]}
                  onChange={v => {
                    updateDraft({ earnedWisdom: [draft.earnedWisdom[0], v, draft.earnedWisdom[2]] });
                    checkCrisis(draft.earnedWisdom[0], v, draft.earnedWisdom[2] ?? '');
                  }}
                  placeholder="Another thing I carry that took years to understand..."
                  index={1}
                />
                <EarnedWisdomInput
                  value={draft.earnedWisdom[2] ?? ''}
                  onChange={v => {
                    updateDraft({ earnedWisdom: [draft.earnedWisdom[0], draft.earnedWisdom[1], v || undefined] });
                    checkCrisis(draft.earnedWisdom[0], draft.earnedWisdom[1], v);
                  }}
                  placeholder="Optional: a third earned wisdom..."
                  index={2}
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">How you are called to contribute</h3>
              <p className="text-xs text-slate-500 mb-3">
                Select all that feel true. These are the modes through which your generativity wants to move.
              </p>
              <MultiPillSelect<ContributionForm>
                options={[
                  'teaching', 'creating', 'protecting', 'mentoring',
                  'building', 'holding-space', 'translating', 'modeling',
                ]}
                values={draft.contributionForms}
                onChange={v => updateDraft({ contributionForms: v })}
                labelMap={CONTRIBUTION_LABELS}
              />
              {draft.contributionForms.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">Select at least one to continue.</p>
              )}
            </div>
          </div>
        );

      // ── Step 4: Yin — Somatic Inquiry ──────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">The body knows first</h3>
              <p className="text-xs text-slate-500 mb-4">
                Before the mind can name generativity, the body has already sensed it.
                This step drops beneath language into felt knowing.
              </p>

              <div className="bg-slate-900/50 border border-teal-900/20 rounded-xl p-4 text-sm text-slate-300 leading-relaxed space-y-3 mb-5">
                <p className="italic text-slate-400">
                  Take a breath. Settle. Now bring to mind one of the wisdoms you just wrote —
                  the one that feels most alive right now. Don't think about it — feel for where
                  it lives in your body. Chest? Belly? Hands? Throat?
                </p>
                <p className="italic text-slate-400">
                  Notice the quality of the sensation. Does it want to expand outward? Does it
                  feel held, or contracted? Is it warm, heavy, buzzing?
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs text-teal-400 uppercase tracking-wider font-medium block mb-2">
                Where in the body?
              </label>
              <textarea
                value={draft.somaticLocation}
                onChange={e => {
                  updateDraft({ somaticLocation: e.target.value });
                  checkCrisis(e.target.value);
                }}
                className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none min-h-[60px]"
                placeholder="e.g. chest, solar plexus, hands, throat..."
              />
            </div>

            <div>
              <label className="text-xs text-teal-400 uppercase tracking-wider font-medium block mb-2">
                Two-word description of the sensation
              </label>
              <input
                type="text"
                value={draft.somaticPhrase}
                onChange={e => updateDraft({ somaticPhrase: e.target.value })}
                className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60"
                placeholder="e.g. steady warmth, quiet readiness, bright pressure..."
                maxLength={40}
              />
            </div>

            <div>
              <label className="text-xs text-teal-400 uppercase tracking-wider font-medium block mb-2">
                Quality of the felt sense
              </label>
              <div className="flex flex-wrap gap-2">
                {(['expansive', 'obligatory', 'neutral'] as const).map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => updateDraft({ somaticQuality: q })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      draft.somaticQuality === q
                        ? 'bg-teal-700/60 border-teal-500 text-teal-200'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-teal-700/50 hover:text-slate-300'
                    }`}
                  >
                    {q === 'expansive' ? 'Expansive — wants to flow outward'
                     : q === 'obligatory' ? 'Contracted / obligatory'
                     : 'Neutral / unclear'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                If the sensation feels obligatory, that is important data — not a failure.
              </p>
            </div>
          </div>
        );

      // ── Step 5: Synthesis (loading) ────────────────────────────────────────
      case 5:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <EvolutionaryUnfoldingIcon className="w-16 h-16 text-teal-400/30 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-teal-300 font-serif text-lg">Composing your portrait…</p>
              <p className="text-slate-500 text-sm max-w-xs">
                Drawing together your wisdoms, forms, and somatic anchor into language.
              </p>
            </div>
          </div>
        );

      // ── Step 6: Delivery — Portrait + clarityAfter ─────────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-serif text-teal-300">Your Generativity Portrait</h3>
              <p className="text-xs text-slate-500">Read slowly. Let it land.</p>
            </div>

            {error && (
              <p className="text-xs text-amber-400/80 border border-amber-800/30 bg-amber-950/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <PortraitDisplay
              portrait={draft.generativityPortrait}
              isFallback={isFallbackPortrait}
            />

            <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-3">
              <p className="text-xs text-teal-400 uppercase tracking-wider font-medium">Your map</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">Chapter</p>
                  <p className="text-slate-200">{draft.lifeChapter ? CHAPTER_LABELS[draft.lifeChapter] : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Readiness</p>
                  <p className="text-slate-200">{READINESS_LABELS[draft.readinessScore]}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Contribution forms</p>
                  <p className="text-slate-200">
                    {draft.contributionForms.map(f => CONTRIBUTION_LABELS[f]).join(' · ') || '—'}
                  </p>
                </div>
                {draft.somaticLocation && (
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-1">Somatic anchor</p>
                    <p className="text-slate-200">
                      {draft.somaticLocation}{draft.somaticPhrase ? ` — "${draft.somaticPhrase}"` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-serif text-teal-300 mb-1">Clarity after this practice</h3>
              <p className="text-xs text-slate-500 mb-2">
                How clearly do you feel your generative direction now?
              </p>
              <LabeledSlider
                value={draft.clarityAfter}
                min={1}
                max={10}
                onChange={v => updateDraft({ clarityAfter: v })}
                leftLabel="No clarity"
                rightLabel="Complete clarity"
              />
              {(() => {
                const delta = draft.clarityAfter - draft.clarityBefore;
                if (delta > 0) return (
                  <p className="text-xs text-teal-400 mt-1">
                    +{delta} points from before the practice. Something shifted.
                  </p>
                );
                if (delta < 0) return (
                  <p className="text-xs text-slate-400 mt-1">
                    {delta} points — surfacing the complexity is part of the work.
                    Decreased clarity after naming something real is not failure.
                  </p>
                );
                return (
                  <p className="text-xs text-slate-500 mt-1">
                    Clarity unchanged — the portrait may need more time to integrate.
                  </p>
                );
              })()}
            </div>
          </div>
        );

      // ── Step 7: Reflection + Handoff ───────────────────────────────────────
      case 7:
        return (
          <div className="space-y-6">
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <div className="text-center space-y-1">
              <h3 className="text-base font-serif text-teal-300">Anchoring the portrait</h3>
              <p className="text-xs text-slate-500">Two final reflections to bring this into the body and week</p>
            </div>

            <div>
              <label className="text-xs text-teal-400 uppercase tracking-wider font-medium block mb-2">
                One line from the portrait that is most true
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Copy or paraphrase the phrase that landed hardest. This becomes your anchor.
              </p>
              <textarea
                value={draft.selectedPortraitLine}
                onChange={e => {
                  updateDraft({ selectedPortraitLine: e.target.value });
                  checkCrisis(e.target.value, draft.commitmentAction);
                }}
                className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none min-h-[70px]"
                placeholder="The line or phrase that felt most true..."
              />
            </div>

            <div>
              <label className="text-xs text-teal-400 uppercase tracking-wider font-medium block mb-2">
                One action this week
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Generativity becomes real in small, specific acts — not declarations.
                What is one concrete thing this week that expresses your contribution form?
              </p>
              <textarea
                value={draft.commitmentAction}
                onChange={e => {
                  updateDraft({ commitmentAction: e.target.value });
                  checkCrisis(draft.selectedPortraitLine, e.target.value);
                }}
                className="w-full bg-slate-900/60 border border-teal-800/40 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-600/60 resize-none min-h-[80px]"
                placeholder="This week I will... (specific, achievable, connected to your contribution form)"
              />
            </div>

            <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
              <p className="text-xs text-teal-400 uppercase tracking-wider font-medium">Continue the work</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Generativity Map pairs well with <strong className="text-slate-300">Shadow Journaling</strong> (what
                stops you from giving), <strong className="text-slate-300">Contemplative Inquiry</strong> (the source
                beneath your offering), and <strong className="text-slate-300">Role Alignment</strong> (whether your
                roles support your generative direction).
              </p>
            </div>

            <div className="bg-teal-950/30 border border-teal-900/30 rounded-xl p-4">
              <p className="text-xs text-teal-300/70 italic leading-relaxed">
                A note on state and stage: the clarity you feel now is a state — a real shift in
                how you see. Whether it becomes a permanent stage capacity depends on whether
                you continue to act from this portrait, not on having completed this practice.
              </p>
            </div>

            {draft.completedAt && (
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Portrait completed · {new Date(draft.completedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-teal-400 mt-1">
                  Insight saved to Intelligence Hub
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // -------------------------------------------------------------------------
  // Frame
  // -------------------------------------------------------------------------
  const isIntroStep = step === 0;
  const isCompletionStep = step === 7;
  const isSynthesisStep = step === 5;

  return (
    <WizardFrame
      title="The Generativity Map"
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      showBackButton={step > 0 && !isSynthesisStep && !isCompletionStep}
      nextButtonText={
        isIntroStep ? 'Begin' :
        step === 4 ? 'Generate Portrait' :
        step === 6 ? 'Complete Practice' :
        isCompletionStep ? 'Done' :
        'Continue'
      }
      nextButtonDisabled={
        isSynthesisStep ||
        isCompletionStep ||
        (!isIntroStep && !canProceed)
      }
      onClose={onClose}
      onBack={handleBack}
      onNext={isCompletionStep ? onClose : handleNext}
      accentColor="teal"
      errorMessage={error && !isFallbackPortrait ? error : null}
    >
      {renderStep()}
    </WizardFrame>
  );
}
