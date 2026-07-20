import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { X, ArrowLeft, ArrowRight, Download, Lock, ChevronRight, Check } from 'lucide-react';
import { callGrokThenAIJson } from '../../services/aiService.ts';
import { IntegratedInsight, ImmunityToChangeSession } from '../../types.ts';
import { getIconComponent, IconName } from '../../.claude/lib/iconMap.ts';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { practices as allPractices } from '../../constants';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';

/* =========================================================
   TYPES
   ========================================================= */

interface ImmunityToChangeWizardProps {
  onClose: () => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
  onSave?: (session: ImmunityToChangeSession) => void;
}

type WizardStep =
  | 'INTRODUCTION'
  | 'GOAL_CATEGORY'
  | 'GOAL_DETAILS'
  | 'BEHAVIORS'
  | 'REVELATION'
  | 'ASSUMPTION_TEST'
  | 'COMPLETE';

type ExperimentState = {
  testText: string;
  expectedSurprise: string;
  date: string;
};

/* =========================================================
   UTILS
   ========================================================= */

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* =========================================================
   CONSTANTS
   ========================================================= */

// Zod schema for AI response validation
const AIRevealedDataSchema = z.object({
  hiddenCommitments: z.array(z.string()).min(1),
  bigAssumptions: z.array(z.string()).min(1),
});
type AIRevealedData = z.infer<typeof AIRevealedDataSchema>;

const STORAGE_KEY = 'aura-immunity-to-change-sessions';

const GOAL_CATEGORIES = [
  {
    id: 'relationships',
    label: 'Relational Systems & Communication',
    iconName: 'PulseMatrix',
    goals: [
      'Establish and maintain relational boundaries with greater consistency',
      'Increase authentic self-expression in interpersonal contexts',
      'Articulate genuine needs and preferences in relationships',
      'Develop greater psychological vulnerability and authentic presence',
      'Reduce compensatory people-pleasing behavioral patterns',
    ],
  },
  {
    id: 'work',
    label: 'Organizational & Professional Development',
    iconName: 'Algorithm',
    goals: [
      'Distribute task authority and delegation more strategically',
      'Assume expanded leadership roles and decision-making responsibilities',
      'Request instrumental support and collaborative resources',
      'Establish boundaries around work intensity and productivity expectations',
      'Increase voice and perspective contribution in professional settings',
    ],
  },
  {
    id: 'habits',
    label: 'Embodied Practices & Health Integration',
    iconName: 'AscensionFlame',
    goals: [
      'Establish consistent physical practice routines (3+ sessions weekly)',
      'Optimize nutritional patterns and dietary consistency',
      'Achieve adequate restorative sleep (7-8 hours nightly)',
      'Reduce screen-mediated stimulation and attentional fragmentation',
      'Develop sustained contemplative or somatic practice',
    ],
  },
  {
    id: 'growth',
    label: 'Developmental Expansion & Self-Authorship',
    iconName: 'TransformativeArc',
    goals: [
      'Engage with novel experiences beyond established comfort zones',
      'Develop greater capacity for emotional processing and integration',
      'Transcend perfectionist cognitive patterns and associated paralysis',
      'Increase willingness to assume uncertainty and appropriate risk',
      'Cultivate constructive receptivity to critical feedback and perspective',
    ],
  },
];

const BEHAVIOR_PATTERNS = [
  { id: 'avoidance', label: 'Systematic avoidance of change-relevant contexts', iconName: 'VoidEclipse' },
  { id: 'delay', label: 'Chronic postponement and temporal displacement', iconName: 'Chronolith' },
  { id: 'distraction', label: 'Attentional redirection toward competing demands', iconName: 'FocusAperture' },
  { id: 'rationalize', label: 'Constructive rationalization and cognitive justification', iconName: 'Algorithm' },
  { id: 'perfectionism', label: 'Perfectionist paralysis and conditional readiness', iconName: 'Crucible' },
  { id: 'busy', label: 'Excessive commitments and strategic overload', iconName: 'PulseMatrix' },
  { id: 'undermine', label: 'Self-sabotage and unconscious contradictory action', iconName: 'ParadoxGate' },
  { id: 'forget', label: 'Deprioritization and strategic amnesia', iconName: 'EngramArchive' },
];

const STEPS: { label: string; value: WizardStep }[] = [
  { label: 'Introduction', value: 'INTRODUCTION' },
  { label: 'Domain', value: 'GOAL_CATEGORY' },
  { label: 'Goal', value: 'GOAL_DETAILS' },
  { label: 'Behaviors', value: 'BEHAVIORS' },
  { label: 'Revelation', value: 'REVELATION' },
  { label: 'Experiment', value: 'ASSUMPTION_TEST' },
  { label: 'Complete', value: 'COMPLETE' },
];

/* =========================================================
   PROGRESS BAR
   ========================================================= */

const ProgressBar = ({ currentStep }: { currentStep: WizardStep }) => {
  const currentIndex = STEPS.findIndex(s => s.value === currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-stone-300">{STEPS[currentIndex]?.label}</span>
        <span className="text-[10px] text-stone-500">{currentIndex + 1} of {STEPS.length}</span>
      </div>
      <div className="h-0.5 w-full bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function ImmunityToChangeWizard({
  onClose,
  userId,
  insightContext,
  markInsightAsAddressed,
  onSave,
}: ImmunityToChangeWizardProps) {

  /* ======================================================
     STEP CONTROL
     ====================================================== */

  const [currentStep, setCurrentStep] = useState<WizardStep>('INTRODUCTION');

  /* ======================================================
     CORE STATE
     ====================================================== */

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [goalClarification, setGoalClarification] = useState('');

  const [behaviorReflection, setBehaviorReflection] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [customBehavior, setCustomBehavior] = useState('');
  const [relationalContext, setRelationalContext] = useState('');

  const [hiddenCommitments, setHiddenCommitments] = useState<string[]>([]);
  const [bigAssumptions, setBigAssumptions] = useState<string[]>([]);

  const [somaticAnchor, setSomaticAnchor] = useState('');

  // Grouped experiment state
  const [experiment, setExperiment] = useState<ExperimentState>({
    testText: '',
    expectedSurprise: '',
    date: '',
  });

  const updateExperiment = useCallback(
    (field: keyof ExperimentState, value: string) =>
      setExperiment(prev => ({ ...prev, [field]: value })),
    []
  );

  /* ======================================================
     PAST SESSION REVIEW
     ====================================================== */

  const [pastSessionPendingReview, setPastSessionPendingReview] =
    useState<ImmunityToChangeSession | null>(null);
  const [reviewingPast, setReviewingPast] = useState(false);
  const [pastResultText, setPastResultText] = useState('');

  useEffect(() => {
    try {
      const existingSessions: ImmunityToChangeSession[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );
      const pending = [...existingSessions]
        .reverse()
        .find(s => s.assumptionTest && !s.experimentResult);
      if (pending) setPastSessionPendingReview(pending);
    } catch (e) {
      console.error('Failed to load past sessions', e);
    }
  }, []);

  /* ======================================================
     AI + ERRORS
     ====================================================== */

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  /* ======================================================
     MISC
     ====================================================== */

  const [linkedInsightId] = useState<string | undefined>(insightContext?.id);
  const [draft, updateDraft, , clearDraft] = useWizardDraft<Partial<ImmunityToChangeSession>>(
    'aura-immunity-draft',
    {}
  );
  const { setIntegratedInsights } = useInsightsContext();

  // Restore from draft on mount
  useEffect(() => {
    if (!draft || Object.keys(draft).length === 0) return;
    if (draft.goalCategory) setSelectedCategory(draft.goalCategory);
    if (draft.behaviorPatterns?.length) setSelectedPatterns(draft.behaviorPatterns);
    if (draft.hiddenCommitments?.length) setHiddenCommitments(draft.hiddenCommitments);
    if (draft.bigAssumptions?.length) setBigAssumptions(draft.bigAssumptions);
    if (draft.somaticAnchor) setSomaticAnchor(draft.somaticAnchor);
    if (draft.assumptionTest || draft.expectedSurprise || draft.experimentDate) {
      setExperiment({
        testText: draft.assumptionTest ?? '',
        expectedSurprise: draft.expectedSurprise ?? '',
        date: draft.experimentDate ?? '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft as user progresses
  useEffect(() => {
    if (!selectedCategory && !hiddenCommitments.length && !experiment.testText) return;
    updateDraft({
      goalCategory: selectedCategory || undefined,
      behaviorPatterns: selectedPatterns,
      hiddenCommitments,
      bigAssumptions,
      somaticAnchor: somaticAnchor || undefined,
      assumptionTest: experiment.testText || undefined,
      expectedSurprise: experiment.expectedSurprise || undefined,
      experimentDate: experiment.date || undefined,
    });
  }, [selectedCategory, selectedPatterns, hiddenCommitments, bigAssumptions, somaticAnchor, experiment]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ======================================================
     CRISIS DETECTION (DEBOUNCED)
     ====================================================== */

  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');

  const combinedText = useMemo(
    () =>
      [
        customGoal,
        goalClarification,
        behaviorReflection,
        relationalContext,
        customBehavior,
        somaticAnchor,
        experiment.testText,
        experiment.expectedSurprise,
      ].join(' '),
    [customGoal, goalClarification, behaviorReflection, relationalContext, customBehavior, somaticAnchor, experiment.testText, experiment.expectedSurprise]
  );

  const runCrisisCheck = useCallback(
    debounce((text: string) => {
      setCrisisLevel(detectCrisisLevel(text));
    }, 300),
    []
  );

  useEffect(() => {
    runCrisisCheck(combinedText);
  }, [combinedText, runCrisisCheck]);

  /* ======================================================
     DERIVED VALUES
     ====================================================== */

  const behaviorPatternsMap = useMemo(
    () => new Map(BEHAVIOR_PATTERNS.map(p => [p.id, p])),
    []
  );

  const selectedCategoryGoals = useMemo(
    () => GOAL_CATEGORIES.find(c => c.id === selectedCategory)?.goals ?? [],
    [selectedCategory]
  );

  const getFullGoalText = useCallback(() => {
    if (selectedGoal === 'custom') return customGoal;
    const goal = GOAL_CATEGORIES.find(c => c.id === selectedCategory)?.goals.find(
      g => g === selectedGoal
    );
    return goalClarification ? `${goal}: ${goalClarification}` : (goal || '');
  }, [selectedCategory, selectedGoal, customGoal, goalClarification]);

  const getBehaviorDescriptions = useCallback((): string[] => {
    const behaviors: string[] = [];
    if (behaviorReflection.trim()) behaviors.push(behaviorReflection.trim());
    if (relationalContext.trim()) behaviors.push(`Social reinforcement: ${relationalContext.trim()}`);
    selectedPatterns.forEach(id => {
      const p = behaviorPatternsMap.get(id);
      if (p) behaviors.push(p.label);
    });
    if (customBehavior.trim()) behaviors.push(customBehavior);
    return behaviors;
  }, [behaviorReflection, relationalContext, selectedPatterns, behaviorPatternsMap, customBehavior]);

  const togglePattern = useCallback((patternId: string) => {
    setSelectedPatterns(prev =>
      prev.includes(patternId) ? prev.filter(id => id !== patternId) : [...prev, patternId]
    );
  }, []);

  /* ======================================================
     AI REVEAL
     ====================================================== */

  const revealHiddenCommitmentsAndAssumptions = async (): Promise<boolean> => {
    setIsGenerating(true);
    setError('');
    try {
      const fullGoal = getFullGoalText();
      const behaviors = getBehaviorDescriptions();

      const prompt = `You are an expert in Robert Kegan & Lisa Lahey's "Immunity to Change" framework. Based on the user's improvement goal and observed behaviors, reveal their hidden competing commitments and big assumptions.

**Framework Context:**
- Column 1: Improvement Goal (what they want)
- Column 2: Behaviors (what they're doing/not doing instead)
- Column 3: Hidden Competing Commitments (what they're unconsciously committed to that blocks change)
- Column 4: Big Assumptions (the beliefs that make the competing commitment feel necessary)

**User's Input:**
Improvement Goal: "${fullGoal}"

Behaviors (what I'm doing/not doing instead):
${behaviors.map((b, i) => `${i + 1}. ${b}`).join('\n')}

**Your Task:**
Generate 2-3 hidden competing commitments and 2-3 big assumptions that reveal why this person's immunity to change persists.

Hidden commitments should:
- Be unconscious commitments that protect the person
- Directly conflict with the stated improvement goal
- Feel emotionally resonant and "true" when revealed

Big assumptions should:
- Be deep beliefs that make the competing commitments feel necessary
- Start with "If..." or "I can't..." or similar framing
- Challenge fundamental beliefs about self, others, or the world

Be specific, insightful, and compassionate. The goal is breakthrough awareness, not judgment.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "hiddenCommitments": ["I am committed to maintaining control to ensure quality", "I am committed to being seen as capable without needing help"],
  "bigAssumptions": ["If I delegate, the work will fall below my standards and I'll be responsible for failure", "If I ask for support, others will conclude I'm not competent enough for this role"]
}`;

      const result = await callGrokThenAIJson<AIRevealedData>(
        'ImmunityToChangeWizard',
        prompt,
        undefined,
        AIRevealedDataSchema
      );

      setHiddenCommitments(result.hiddenCommitments);
      setBigAssumptions(result.bigAssumptions);
      return true;
    } catch (err) {
      console.error('Error revealing immunity:', err);
      setError('Failed to reveal hidden commitments and assumptions. Please try again or adjust your inputs.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  /* ======================================================
     PAST SESSION SAVE
     ====================================================== */

  const savePastSessionReview = () => {
    if (!pastSessionPendingReview || !pastResultText.trim()) return;
    try {
      const existingSessions: ImmunityToChangeSession[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );
      const updated = existingSessions.map(s =>
        s.id === pastSessionPendingReview.id ? { ...s, experimentResult: pastResultText } : s
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPastSessionPendingReview(null);
      setReviewingPast(false);
      setPastResultText('');
    } catch (e) {
      console.error('Failed to update past session', e);
    }
  };

  /* ======================================================
     SAVE SESSION
     ====================================================== */

  const saveSession = useCallback(() => {
    const session: ImmunityToChangeSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      improvementGoal: getFullGoalText(),
      goalCategory: selectedCategory,
      behaviors: getBehaviorDescriptions(),
      behaviorFrequencies: {},
      behaviorPatterns: selectedPatterns,
      hiddenCommitments,
      bigAssumptions,
      assumptionTest: experiment.testText || undefined,
      expectedSurprise: experiment.expectedSurprise || undefined,
      experimentDate: experiment.date || undefined,
      somaticAnchor: somaticAnchor || undefined,
      linkedInsightId,
    };

    if (onSave) {
      onSave(session);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        existing.push(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        console.error('[ImmunityToChangeWizard] Failed to persist session:', e);
      }
      if (linkedInsightId && markInsightAsAddressed) {
        markInsightAsAddressed(linkedInsightId, 'immunity-to-change', session.id);
      }
    }

    generateInsightFromSession({
      wizardType: 'Immunity to Change',
      sessionId: session.id,
      sessionName: `Immunity Map: ${session.improvementGoal.slice(0, 50)}`,
      sessionReport: `Goal: ${session.improvementGoal}\nBehaviors: ${session.behaviors.join(', ')}\nHidden Commitments: ${session.hiddenCommitments.join('; ')}\nBig Assumptions: ${session.bigAssumptions.join('; ')}\nSomatic Anchor: ${session.somaticAnchor || 'None'}${session.assumptionTest ? `\nAssumption Test: ${session.assumptionTest}` : ''}`,
      sessionSummary: `Mapped immunity to change for: ${session.improvementGoal.slice(0, 80)}`,
      userId: userId || 'anonymous',
      availablePractices: [
        ...(allPractices.mind ?? []).map(p => ({ id: p.id, name: p.name, category: 'mind' })),
        ...(allPractices.shadow ?? []).map(p => ({ id: p.id, name: p.name, category: 'shadow' })),
        ...(allPractices.body ?? []).map(p => ({ id: p.id, name: p.name, category: 'body' })),
        ...(allPractices.spirit ?? []).map(p => ({ id: p.id, name: p.name, category: 'spirit' })),
      ],
      dataContext: {
        totalSessions: 1,
        sessionsInLastWeek: 1,
        existingInsights: hiddenCommitments.length + bigAssumptions.length,
      },
    })
      .then(insight => setIntegratedInsights(prev => [...prev, insight]))
      .catch(err => console.warn('[ImmunityToChangeWizard] Insight gen failed:', err));

    clearDraft();
    return session;
  }, [
    getFullGoalText,
    getBehaviorDescriptions,
    selectedCategory,
    selectedPatterns,
    hiddenCommitments,
    bigAssumptions,
    experiment,
    somaticAnchor,
    linkedInsightId,
    onSave,
    markInsightAsAddressed,
    userId,
    setIntegratedInsights,
    updateDraft,
  ]);

  /* ======================================================
     EXPORT
     ====================================================== */

  const exportToMarkdown = () => {
    const markdown = `# Immunity to Change Analysis

**Date**: ${new Date().toLocaleDateString()}

## Column 1: Articulated Improvement Goal
${getFullGoalText()}

## Column 2: Observable Behavioral Patterns & Contradictions
${getBehaviorDescriptions().map((b, i) => `${i + 1}. ${b}`).join('\n')}

## Column 3: Hidden Competing Commitments
${hiddenCommitments.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Column 4: Underlying Big Assumptions
${bigAssumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## Column 5: Assumption Test Experiment
${experiment.testText ? `**Experiment:** ${experiment.testText}` : '*(not yet designed)*'}
${experiment.expectedSurprise ? `**Expected surprise:** ${experiment.expectedSurprise}` : ''}
${experiment.date ? `**When:** ${experiment.date}` : ''}

---

*Framework: Robert Kegan & Lisa Lahey's "Immunity to Change" Model*
*Purpose: Revealing the unconscious dynamics that maintain homeostasis and resist developmental change*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `immunity-to-change-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ======================================================
     NAVIGATION
     ====================================================== */

  const handleNext = async () => {
    setError('');
    switch (currentStep) {
      case 'INTRODUCTION':
        setCurrentStep('GOAL_CATEGORY');
        break;

      case 'GOAL_CATEGORY':
        if (!selectedCategory) { setError('Please select a developmental domain.'); return; }
        setCurrentStep('GOAL_DETAILS');
        break;

      case 'GOAL_DETAILS':
        if (!selectedGoal) { setError('Please select or specify your improvement goal.'); return; }
        if (selectedGoal === 'custom' && !customGoal.trim()) {
          setError('Please articulate your improvement goal.');
          return;
        }
        setCurrentStep('BEHAVIORS');
        break;

      case 'BEHAVIORS':
        if (!behaviorReflection.trim() && selectedPatterns.length === 0 && !customBehavior.trim()) {
          setError('Please describe a situation or select at least one behavioral pattern.');
          return;
        }
        const ok = await revealHiddenCommitmentsAndAssumptions();
        if (ok) setCurrentStep('REVELATION');
        break;

      case 'REVELATION':
        setCurrentStep('ASSUMPTION_TEST');
        break;

      case 'ASSUMPTION_TEST':
        if (!somaticAnchor.trim()) {
          setError('Please describe your physical sensation when reading the assumption.');
          return;
        }
        if (!experiment.testText.trim()) {
          setError('Please describe an experiment you will try this week.');
          return;
        }
        saveSession();
        setCurrentStep('COMPLETE');
        break;

      case 'COMPLETE':
        onClose();
        break;
    }
  };

  const handleBack = () => {
    setError('');
    const backMap: Partial<Record<WizardStep, WizardStep>> = {
      GOAL_CATEGORY: 'INTRODUCTION',
      GOAL_DETAILS: 'GOAL_CATEGORY',
      BEHAVIORS: 'GOAL_DETAILS',
      REVELATION: 'BEHAVIORS',
      ASSUMPTION_TEST: 'REVELATION',
      COMPLETE: 'ASSUMPTION_TEST',
    };
    const prev = backMap[currentStep];
    if (prev) setCurrentStep(prev);
  };

  /* ======================================================
     RENDER
     ====================================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-2xl lg:max-w-5xl h-full sm:h-auto max-h-full sm:max-h-[90dvh] bg-stone-950 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border-x sm:border border-amber-500/20">

        {/* Header */}
        <div className="relative bg-stone-950 text-white p-3 sm:p-6 border-b border-amber-500/15">
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            aria-label="Close wizard"
          >
            <X size={20} />
          </button>
          <h1 className="text-xl sm:text-3xl font-serif font-light text-stone-100 truncate pr-8">
            Immunity to Change
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70 mt-1">
            Kegan & Lahey · Hidden Competing Commitments
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-4 bg-stone-950">
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-950">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
            >

          {/* ── INTRODUCTION ── */}
          {currentStep === 'INTRODUCTION' && (
            <div className="space-y-6 max-w-4xl mx-auto">

              {pastSessionPendingReview && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-base font-serif font-light text-stone-100 mb-2">Experiment Follow-up</h3>
                      <p className="text-sm text-stone-400 mb-4">
                        In a previous session, you designed an experiment to test this big assumption:
                        <br />
                        <span className="italic text-stone-200 mt-2 block">"{pastSessionPendingReview.bigAssumptions[0]}"</span>
                      </p>
                      {!reviewingPast ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setReviewingPast(true)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium rounded-lg text-sm transition-colors"
                          >
                            Log Result
                          </button>
                          <button
                            onClick={() => setPastSessionPendingReview(null)}
                            className="px-4 py-2 border border-stone-700 hover:border-amber-500/40 text-stone-400 rounded-lg text-sm transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-4">
                          <label className="block text-sm text-stone-200 font-medium">
                            What happened when you ran the experiment?
                          </label>
                          <textarea
                            value={pastResultText}
                            onChange={e => setPastResultText(e.target.value)}
                            placeholder="e.g., I asked them to do it and they actually did a decent job. It didn't fall apart like I assumed."
                            rows={3}
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg text-sm text-stone-200 focus:outline-none focus:border-amber-500/40 placeholder:text-stone-600"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={savePastSessionReview}
                              disabled={!pastResultText.trim()}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium rounded-lg text-sm disabled:opacity-50 transition-colors"
                            >
                              Save Result
                            </button>
                            <button
                              onClick={() => setReviewingPast(false)}
                              className="px-4 py-2 border border-stone-700 text-stone-400 rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-stone-900/30 border border-stone-700/30 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-100 mb-4">
                  The Architecture of Immunity to Change
                </h2>
                <p className="text-stone-400 leading-relaxed mb-4 text-sm sm:text-base">
                  Persistent, contradictory behavioral patterns often reflect not a lack of commitment or willpower, but rather hidden competing commitments—unconscious allegiances that protect us from perceived threats while simultaneously preventing desired development.
                </p>
                <p className="text-stone-400 leading-relaxed mb-6 text-sm sm:text-base">
                  This assessment reveals the four-column structure that illuminates the psychological homeostasis maintaining your current state, enabling genuine transformation through conscious engagement with your system's deeper logic.
                </p>

                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {[
                    { num: 'I', label: 'Goal', desc: 'What you aspire to' },
                    { num: 'II', label: 'Behaviors', desc: 'What you do instead' },
                    { num: 'III', label: 'Commitments', desc: 'Unconscious protection', locked: true },
                    { num: 'IV', label: 'Assumptions', desc: 'Foundational beliefs', locked: true },
                  ].map(col => (
                    <div
                      key={col.num}
                      className={`flex-1 min-w-[100px] bg-stone-900/60 border ${col.locked ? 'border-amber-500/20' : 'border-stone-700/30'} rounded-xl p-3 text-center`}
                    >
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${col.locked ? 'text-amber-500/60' : 'text-stone-500'}`}>{col.num}</div>
                      <div className="text-stone-200 text-xs font-medium">{col.label}</div>
                      <div className="text-stone-600 text-[10px] mt-0.5">{col.desc}</div>
                      {col.locked && <Lock size={10} className="text-amber-500/40 mx-auto mt-1" />}
                    </div>
                  ))}
                </div>

                <div className="mt-5 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-stone-400">
                    <strong className="text-amber-400/80">Example:</strong> Goal: "Delegate more" → Hidden Commitment: "Maintaining control safeguards quality" → Big Assumption: "If I don't do it, it won't meet my standards, which means I've failed"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── GOAL CATEGORY ── */}
          {currentStep === 'GOAL_CATEGORY' && (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              <div className="bg-stone-900/30 border border-stone-700/30 rounded-2xl p-4 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-light text-stone-100 mb-2">
                  Select Developmental Domain
                </h2>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <p className="text-stone-500 text-xs sm:text-sm">
                    Which life domain contains the improvement goal you want to explore?
                  </p>
                  <button
                    onClick={() => {
                      setSelectedGoal('custom');
                      setCurrentStep('GOAL_DETAILS');
                    }}
                    className="text-[10px] text-amber-500/60 hover:text-amber-400 underline underline-offset-2 transition-colors shrink-0 ml-4"
                  >
                    Skip — define my own
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {GOAL_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedGoal('');
                      }}
                      className={`text-left p-5 sm:p-6 rounded-2xl border transition-all ${
                        selectedCategory === category.id
                          ? 'border-amber-500/60 bg-amber-500/8 shadow-[0_0_20px_rgba(245,158,11,0.07)]'
                          : 'bg-stone-900/40 border-stone-700/30 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="w-10 h-10 text-amber-400/60 mb-3">
                        {React.createElement(getIconComponent(category.iconName as IconName) || 'div', { size: 40 })}
                      </div>
                      <h3 className="font-serif font-light text-stone-100 text-base sm:text-lg mb-1">{category.label}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        {category.goals.length} practice areas
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── GOAL DETAILS ── */}
          {currentStep === 'GOAL_DETAILS' && (
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <div className="bg-stone-900/30 border border-stone-700/30 rounded-2xl p-4 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-light text-stone-100 mb-2">
                  Specify Your Goal
                </h2>
                <p className="text-stone-500 mb-4 sm:mb-6 text-xs sm:text-sm">
                  Select the specific improvement you seek, or articulate your own developmental aim.
                </p>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {selectedCategoryGoals.map(goal => (
                    <button
                      key={goal}
                      onClick={() => { setSelectedGoal(goal); setCustomGoal(''); }}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all text-xs sm:text-sm ${
                        selectedGoal === goal
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-100'
                          : 'bg-stone-900/40 border-stone-700/30 text-stone-300 hover:border-amber-500/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedGoal('custom')}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all text-xs sm:text-sm ${
                      selectedGoal === 'custom'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-100'
                        : 'bg-stone-900/40 border-stone-700/30 text-stone-300 hover:border-amber-500/50'
                    }`}
                  >
                    ✎ Articulate a custom goal...
                  </button>
                </div>

                {selectedGoal === 'custom' && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                      Specify your improvement goal:
                    </label>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={e => setCustomGoal(e.target.value)}
                      placeholder="e.g., Increase epistemic humility in decision-making"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                      maxLength={100}
                    />
                  </div>
                )}

                {selectedGoal && selectedGoal !== 'custom' && (
                  <div>
                    <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                      Contextual specification <span className="text-stone-600">(optional)</span>:
                    </label>
                    <input
                      type="text"
                      value={goalClarification}
                      onChange={e => setGoalClarification(e.target.value)}
                      placeholder="e.g., specifically within professional hierarchies"
                      className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                      maxLength={80}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BEHAVIORS ── */}
          {currentStep === 'BEHAVIORS' && (
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <div className="bg-stone-900/30 border border-stone-700/30 rounded-2xl p-4 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-light text-stone-100 mb-2">
                  Behavioral Patterns & Contradictions
                </h2>
                <p className="text-stone-500 mb-5 sm:mb-6 text-xs sm:text-sm">
                  Column II of the ITC map: what you do (or don't do) instead of acting on your goal.
                </p>

                <div className="mb-5 sm:mb-6">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    Describe a recent specific situation where you tried to act on this goal but didn't. What did you do instead?
                  </label>
                  <textarea
                    value={behaviorReflection}
                    onChange={e => setBehaviorReflection(e.target.value)}
                    placeholder="e.g., Last Monday my manager asked for volunteers to lead the project. I stayed silent and then spent the afternoon reorganizing my task list, telling myself I wasn't ready yet..."
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-stone-900/50 border border-stone-700/40 rounded-xl focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 resize-none"
                  />
                </div>

                <div className="mb-5 sm:mb-6">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    How does your social environment reinforce this pattern? <span className="text-stone-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={relationalContext}
                    onChange={e => setRelationalContext(e.target.value)}
                    placeholder="e.g., My team expects me to have all the answers, so delegating feels like admitting weakness"
                    className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                    maxLength={200}
                  />
                </div>

                <div className="mb-4">
                  <p className="text-stone-500 text-xs sm:text-sm mb-3">
                    Do any of these patterns also apply? <span className="text-stone-600">(optional)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-4">
                    {BEHAVIOR_PATTERNS.map(pattern => (
                      <button
                        key={pattern.id}
                        onClick={() => togglePattern(pattern.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all ${
                          selectedPatterns.includes(pattern.id)
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : 'bg-stone-900/40 border-stone-700/30 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 text-amber-400/60 flex-shrink-0">
                            {React.createElement(getIconComponent(pattern.iconName as IconName) || 'div', { size: 16 })}
                          </div>
                          <span className={`text-xs ${selectedPatterns.includes(pattern.id) ? 'text-amber-100' : 'text-stone-400'}`}>
                            {pattern.label}
                          </span>
                          {selectedPatterns.includes(pattern.id) && (
                            <Check size={12} className="text-amber-400 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-900/50 rounded-xl p-3 sm:p-4 border border-stone-800">
                  <label className="block text-stone-400 text-xs sm:text-sm mb-2 font-medium">
                    Anything else you notice? <span className="text-stone-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customBehavior}
                    onChange={e => setCustomBehavior(e.target.value)}
                    placeholder="e.g., I start strong but find reasons to stop after a few days"
                    className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                    maxLength={120}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── REVELATION ── */}
          {currentStep === 'REVELATION' && (
            <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
              {isGenerating ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400/60 mb-4 animate-pulse mx-auto">
                    {React.createElement(getIconComponent('OuroborosGlyph' as IconName) || getIconComponent('TransformativeArc' as IconName) || 'div', { size: 64 })}
                  </div>
                  <p className="text-stone-300 text-base sm:text-lg">Analyzing psychological homeostasis patterns...</p>
                  <p className="text-stone-500 text-xs sm:text-sm mt-2">Revealing hidden competing commitments</p>
                </div>
              ) : (
                <>
                  {/* Desktop: horizontal 4-column map */}
                  <div className="hidden sm:flex gap-3 items-stretch">
                    <div className="flex-1 bg-stone-900/40 border border-stone-700/30 rounded-2xl p-5 flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50 mb-2">I</div>
                      <h3 className="font-serif font-light text-stone-200 text-sm mb-3">Improvement Goal</h3>
                      <p className="text-stone-400 text-xs leading-relaxed flex-1">{getFullGoalText()}</p>
                    </div>
                    <div className="flex items-center text-stone-700"><ChevronRight size={16} /></div>
                    <div className="flex-1 bg-stone-900/40 border border-stone-700/30 rounded-2xl p-5 flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50 mb-2">II</div>
                      <h3 className="font-serif font-light text-stone-200 text-sm mb-3">Behavioral Patterns</h3>
                      <ul className="text-stone-400 text-xs space-y-1.5 flex-1">
                        {getBehaviorDescriptions().slice(0, 5).map((b, i) => (
                          <li key={i} className="leading-relaxed">• {b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 text-stone-600">
                      <ChevronRight size={16} />
                      <div className="w-3 h-3 text-amber-500/40 animate-pulse">
                        {React.createElement(getIconComponent('TransformativeArc' as IconName) || 'div', { size: 12 })}
                      </div>
                    </div>
                    <div className="flex-1 bg-stone-900/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col shadow-[0_0_16px_rgba(245,158,11,0.05)]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">III</div>
                      <h3 className="font-serif font-light text-amber-100/80 text-sm mb-3">Hidden Competing Commitments</h3>
                      <ul className="text-stone-400 text-xs space-y-2.5 flex-1">
                        {hiddenCommitments.map((c, i) => (
                          <li key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 leading-relaxed">{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center text-stone-600"><ChevronRight size={16} /></div>
                    <div className="flex-1 bg-stone-900/40 border border-amber-500/40 rounded-2xl p-5 flex flex-col shadow-[0_0_20px_rgba(245,158,11,0.07)]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">IV</div>
                      <h3 className="font-serif font-light text-amber-100 text-sm mb-3">Big Assumptions</h3>
                      <ul className="text-stone-300 text-xs space-y-2.5 flex-1">
                        {bigAssumptions.map((a, i) => (
                          <li key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 leading-relaxed">{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mobile: vertical stack */}
                  <div className="sm:hidden space-y-3">
                    <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50 mb-1">I · Goal</div>
                      <p className="text-stone-300 text-xs leading-relaxed">{getFullGoalText()}</p>
                    </div>
                    <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50 mb-2">II · Behavioral Patterns</div>
                      <ul className="text-stone-400 text-xs space-y-1">
                        {getBehaviorDescriptions().slice(0, 5).map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-stone-900/40 border border-amber-500/30 rounded-xl p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">III · Hidden Competing Commitments</div>
                      <ul className="text-stone-400 text-xs space-y-2">
                        {hiddenCommitments.map((c, i) => (
                          <li key={i} className="bg-amber-500/5 border border-amber-500/15 rounded p-2">{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-stone-900/40 border border-amber-500/40 rounded-xl p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">IV · Big Assumptions</div>
                      <ul className="text-stone-300 text-xs space-y-2">
                        {bigAssumptions.map((a, i) => (
                          <li key={i} className="bg-amber-500/10 border border-amber-500/20 rounded p-2">{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div className="text-xs sm:text-sm text-stone-400 space-y-2">
                        <p>
                          <strong className="text-amber-400/80">Developmental Engagement:</strong> The goal is not elimination of these commitments—they serve protective functions—but rather conscious exploration and potential evolution of the underlying assumptions that make them feel necessary.
                        </p>
                        <p className="text-stone-600 text-xs">
                          <strong>Reference:</strong> Kegan, R., & Lahey, L. L. (2009). Immunity to Change: How to Overcome It and Unlock Potential in Yourself and Your Organization. Harvard Business School Press.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={exportToMarkdown}
                      className="px-3 sm:px-4 py-2 border border-stone-700 hover:border-amber-500/40 hover:text-amber-400 text-stone-400 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Download size={16} />
                      Export Analysis
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ASSUMPTION TEST ── */}
          {currentStep === 'ASSUMPTION_TEST' && (
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <div className="bg-stone-900/30 border border-stone-700/30 rounded-2xl p-4 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-light text-stone-100 mb-2">
                  Designing Your Assumption Test
                </h2>
                <p className="text-stone-500 mb-5 sm:mb-6 text-xs sm:text-sm">
                  Big assumptions feel like facts. The way to loosen their grip is to treat them as hypotheses and design small, safe experiments.
                </p>

                {bigAssumptions.length > 0 && (
                  <div className="bg-stone-900/50 border border-stone-700/40 rounded-xl p-4 mb-5 sm:mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">Your first big assumption</p>
                    <p className="text-stone-200 text-sm font-serif italic">"{bigAssumptions[0]}"</p>
                  </div>
                )}

                <div className="mb-5 sm:mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    Read your first Big Assumption aloud. Take a slow breath and notice what happens in your body. Name the physical sensation (e.g., tightness in chest, shallow breath) that accompanies this belief.
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={somaticAnchor}
                    onChange={e => setSomaticAnchor(e.target.value)}
                    placeholder="e.g., My stomach drops and my shoulders tense up"
                    className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 mt-2"
                  />
                </div>

                <div className="mb-4 sm:mb-5">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    What is one small action you could take <strong className="text-stone-200">this week</strong> that would give you real data about whether this assumption is actually true?
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  <textarea
                    value={experiment.testText}
                    onChange={e => updateExperiment('testText', e.target.value)}
                    placeholder="e.g., Ask one colleague to take ownership of the client summary draft — without revising it afterward — and observe what actually happens to the quality."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-stone-900/50 border border-stone-700/40 rounded-xl focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 resize-none"
                  />
                </div>

                <div className="mb-4 sm:mb-5">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    What outcome would surprise you most?
                  </label>
                  <input
                    type="text"
                    value={experiment.expectedSurprise}
                    onChange={e => updateExperiment('expectedSurprise', e.target.value)}
                    placeholder="e.g., That the work comes back better than I would have done it"
                    className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-stone-300 text-xs sm:text-sm mb-2 font-medium">
                    When will you try this? <span className="text-stone-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={experiment.date}
                    onChange={e => updateExperiment('date', e.target.value)}
                    placeholder="e.g., Tuesday morning, this weekend, next team meeting"
                    className="w-full px-3 sm:px-4 py-2 bg-stone-900/50 border border-stone-700/40 rounded-lg focus:outline-none focus:border-amber-500/40 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600"
                  />
                </div>

                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-stone-400">
                      <strong className="text-amber-400/80">Key principle:</strong> The experiment doesn't need to prove the assumption wrong. It simply needs to generate real data — information you currently don't have because the assumption has prevented you from looking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── COMPLETE ── */}
          {currentStep === 'COMPLETE' && (
            <div className="text-center space-y-4 sm:space-y-6 max-w-2xl mx-auto py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                {React.createElement(getIconComponent('TransformativeArc' as IconName) || Check, { size: 36, className: 'text-amber-400' })}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100">
                System Revealed
              </h2>
              <p className="text-stone-400 leading-relaxed text-sm sm:text-base">
                Your Immunity to Change analysis has been saved. You now possess explicit visibility into the psychological homeostasis that maintains your current equilibrium—the foundation for genuine developmental transformation.
              </p>
              <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4 sm:p-6">
                <p className="text-stone-400 text-xs sm:text-sm">
                  <strong className="text-amber-400/80">Integration Path:</strong> These competing commitments are not obstacles to overcome but wisdom to integrate. Test your big assumptions through small experiments. What becomes possible when you no longer believe these foundational assumptions to be unquestionable truth?
                </p>
              </div>
            </div>
          )}

            </motion.div>
          </AnimatePresence>

          {/* Safety Banner */}
          {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-xs sm:text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-stone-950 border-t border-stone-800 p-3 sm:p-6 flex items-center justify-between gap-2">
          <button
            onClick={handleBack}
            disabled={currentStep === 'INTRODUCTION' || isGenerating}
            className="px-3 sm:px-6 py-2 border border-stone-700 text-stone-400 rounded-lg hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="px-3 sm:px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            {currentStep === 'COMPLETE' ? 'Close' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
