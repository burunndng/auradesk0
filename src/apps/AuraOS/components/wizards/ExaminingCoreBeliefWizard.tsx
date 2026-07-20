import React, { useState, useMemo } from 'react';
import { IntegratedInsight, ExaminingCoreBeliefSession } from '../../types.ts';
import { callGrokThenAIJson } from '../../services/ai/aiCore.ts';
import { examiningCoreBeliefSchema } from '../../services/ai/wizardSchemas.ts';
import { detectCrisisLevel } from '../../utils/crisisDetection.ts';
import SafetyBanner from '../shared/SafetyBanner.tsx';
import { WizardFrame } from '../shared/WizardFrame.tsx';
import { useWizardDraft } from '../../hooks/useWizardDraft.ts';
import { wizardSessionService } from '../../services/wizardSessionService.ts';
import { insightDatabaseService } from '../../services/insightDatabaseService.ts';
import { ConsciousNodeIcon, FocusApertureIcon } from '../visualizations/SacredGeometryIcons/index.ts';

// ============================================================
// TYPES
// ============================================================

interface ExaminingCoreBeliefWizardProps {
  onClose: () => void;
  onSave: (session: ExaminingCoreBeliefSession, insight?: IntegratedInsight) => void;
  session: ExaminingCoreBeliefSession | null;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const TOTAL_STEPS = 8;

const STEP_TITLES = [
  'Ground & Name',
  'Articulate Belief',
  'Examine Evidence',
  'Trace Origin',
  'Honor the Old Belief',
  'Update Belief',
  'Test Plan',
  'AI Analysis',
];

// ============================================================
// AI PROMPT
// ============================================================

function buildPrompt(session: ExaminingCoreBeliefSession): string {
  const evidenceForSample = session.evidenceFor.slice(0, 3).join('; ') || 'none listed';
  const evidenceAgainstSample = session.evidenceAgainst.slice(0, 3).join('; ') || 'none listed';

  return `You are an ILP (Integral Life Practice) facilitator analyzing a core belief examination session.

The user worked through the following:

OLD BELIEF: "${session.beliefStatement}"
TRIGGER EMOTION: "${session.triggerEmotion}" (intensity ${session.emotionIntensity}/10)

EVIDENCE FOR this belief (${session.evidenceFor.length} items): ${evidenceForSample}
EVIDENCE AGAINST this belief (${session.evidenceAgainst.length} items): ${evidenceAgainstSample}

ORIGIN STORY: ${session.originStory || 'Not explored'}
INHERITED BELIEF: ${session.isInheritedBelief ? 'Yes — identified as absorbed from family/culture' : 'No'}
RELATIONAL CONTEXT: ${session.relationalContext || 'Not explored'}

WHAT THIS BELIEF WAS PROTECTING: ${session.oldBeliefProtection || 'Not yet explored'}

NEW BELIEF: "${session.newBelief}"
NEW BELIEF REASONING: "${session.newBeliefReasoning || 'Not provided'}"

TEST PLAN: "${session.testPlan}"
TEST DURATION: ${session.testDuration}
SPECIFIC COMMITMENT: ${session.specificSituation || 'Not specified'}

Based on this session, provide:
1. detectedPattern: Name the core psychological pattern (e.g., "Shame-based perfectionism", "Abandonment schema"). Be specific to their material.
2. beliefOriginInsight: Insight into how this belief formed relationally/developmentally. Reference their actual words.
3. shadowDimension: What shadow dimension does this belief represent? What aspect of self has been disowned or projected?
4. somaticAwareness: A somatic observation — where this pattern lives in the body, what physical release or settling the new belief might invite.
5. updatedBeliefStrength: Estimate 0.0–1.0 how grounded the new belief appears based on their evidence and reasoning.
6. integrationCommitment: A personalized integration statement weaving their test plan and new belief together.
7. recommendedPractice: One specific ILP practice that would deepen this work (name + rationale referencing their material).

Respond with valid JSON matching the schema exactly.`;
}

// ============================================================
// COMPONENT
// ============================================================

const ExaminingCoreBeliefWizard: React.FC<ExaminingCoreBeliefWizardProps> = ({
  onClose,
  onSave,
  session: savedSession,
  userId,
  insightContext,
  markInsightAsAddressed,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ExaminingCoreBeliefSession['aiAnalysis'] | null>(null);

  const initialSession: ExaminingCoreBeliefSession = savedSession || {
    id: `ecb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    linkedInsightId: insightContext?.id,
    triggerEmotion: '',
    emotionIntensity: 5,
    beliefStatement: '',
    evidenceFor: [],
    evidenceAgainst: [],
    originStory: '',
    isInheritedBelief: false,
    relationalContext: '',
    oldBeliefProtection: '',
    newBelief: '',
    newBeliefReasoning: '',
    testPlan: '',
    testDuration: '1 week',
    specificSituation: '',
    status: 'input',
  };

  const [session, updateSession] = useWizardDraft<ExaminingCoreBeliefSession>(
    'aura-draft-examining-core-belief',
    initialSession
  );

  // Crisis detection — computed, not stateful
  const crisisLevel = useMemo(
    () => detectCrisisLevel(session.triggerEmotion + ' ' + session.beliefStatement),
    [session.triggerEmotion, session.beliefStatement]
  );

  // Step validation
  const isNextDisabled = useMemo(() => {
    if (isLoading) return true;
    switch (currentStep) {
      case 0: return session.triggerEmotion.trim().length === 0 || crisisLevel !== 'none';
      case 1: return session.beliefStatement.trim().length === 0 || crisisLevel !== 'none';
      case 4: return (session.oldBeliefProtection ?? '').trim().length === 0;
      case 5: return session.newBelief.trim().length === 0;
      case 6: return session.testPlan.trim().length === 0;
      default: return false;
    }
  }, [currentStep, session, crisisLevel, isLoading]);

  // Evidence helpers
  const [evidenceForInput, setEvidenceForInput] = useState('');
  const [evidenceAgainstInput, setEvidenceAgainstInput] = useState('');

  const handleAddEvidence = (type: 'for' | 'against', text: string) => {
    if (!text.trim()) return;
    updateSession(prev => ({
      ...prev,
      [type === 'for' ? 'evidenceFor' : 'evidenceAgainst']: [
        ...(type === 'for' ? prev.evidenceFor : prev.evidenceAgainst),
        text.trim(),
      ],
    }));
    if (type === 'for') setEvidenceForInput('');
    else setEvidenceAgainstInput('');
  };

  const handleRemoveEvidence = (type: 'for' | 'against', index: number) => {
    updateSession(prev => ({
      ...prev,
      [type === 'for' ? 'evidenceFor' : 'evidenceAgainst']: (
        type === 'for' ? prev.evidenceFor : prev.evidenceAgainst
      ).filter((_, i) => i !== index),
    }));
  };

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS - 1) {
      await handleComplete();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const AI_FALLBACK = {
        detectedPattern: 'Core belief pattern identified through emotional inquiry',
        beliefOriginInsight: 'This belief likely formed early as a way of making sense of your environment.',
        shadowDimension: 'The old belief may have served a protective function worth honoring.',
        somaticAwareness: 'Notice where the new belief settles in your body differently than the old one.',
        updatedBeliefStrength: 0.6,
        integrationCommitment: session.testPlan || 'Act as if the new belief is true and notice what shifts.',
        recommendedPractice: {
          practiceName: 'Belief Test Practice',
          rationale: `Live test: "${session.newBelief}" over ${session.testDuration} and return to review.`,
        },
      };

      const aiAnalysis = await callGrokThenAIJson(
        'ExaminingCoreBeliefWizard',
        buildPrompt(session),
        undefined,
        examiningCoreBeliefSchema,
        AI_FALLBACK
      );

      setAiResult(aiAnalysis);

      const completedSession: ExaminingCoreBeliefSession = {
        ...session,
        aiAnalysis,
        status: 'complete',
      };

      const insight: IntegratedInsight = {
        id: `ecb-insight-${Date.now()}`,
        mindToolType: 'Examining Core Belief',
        mindToolSessionId: session.id,
        mindToolName: 'Examining Core Belief',
        mindToolReport: [
          `Trigger: "${session.triggerEmotion}" (intensity ${session.emotionIntensity}/10)`,
          `Old belief: "${session.beliefStatement}"`,
          `Pattern: ${aiAnalysis.detectedPattern}`,
          `Origin insight: ${aiAnalysis.beliefOriginInsight}`,
          `Shadow dimension: ${aiAnalysis.shadowDimension}`,
          `New belief: "${session.newBelief}"`,
          `Integration: ${aiAnalysis.integrationCommitment}`,
        ].join('\n'),
        mindToolShortSummary: `${aiAnalysis.detectedPattern} — "${session.newBelief.slice(0, 60)}"`,
        dateCreated: new Date().toISOString(),
        status: 'pending',
        detectedPattern: aiAnalysis.detectedPattern,
        suggestedShadowWork: [{
          practiceId: 'ecb-shadow',
          practiceName: aiAnalysis.recommendedPractice.practiceName,
          rationale: aiAnalysis.recommendedPractice.rationale,
        }],
        suggestedNextSteps: [{
          practiceId: 'ecb-integration',
          practiceName: 'Integration Commitment',
          rationale: aiAnalysis.integrationCommitment,
        }],
      };

      if (userId) {
        try {
          await wizardSessionService.saveSession({
            user_id: userId,
            session_id: session.id,
            type: 'Examining Core Belief',
            content: completedSession,
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[ExaminingCoreBelief] Failed to save session:', err);
        }
        try {
          await insightDatabaseService.saveInsight(userId, insight);
        } catch (err) {
          console.warn('[ExaminingCoreBelief] Failed to save insight:', err);
        }
        if (markInsightAsAddressed && insightContext?.id) {
          markInsightAsAddressed(insightContext.id, 'Examining Core Belief', session.id);
        }
      }

      onSave(completedSession, insight);
    } catch (err) {
      updateSession(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Save failed',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // STEP RENDERERS
  // ============================================================

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="bg-stone-800/40 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-stone-300 leading-relaxed">
                Before you name the emotion, take three slow breaths. Notice where you feel it in your body — chest, throat, stomach. Stay with the sensation for a moment. Now name what happened.
              </p>
              <p className="text-xs text-stone-500 italic mt-2">
                This is a self-reflection tool, not a substitute for therapy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                What strong emotion or situation triggered this inquiry?
              </label>
              <input
                type="text"
                value={session.triggerEmotion}
                onChange={e => updateSession(prev => ({ ...prev, triggerEmotion: e.target.value }))}
                placeholder="e.g., 'Shame when I made a mistake at work'"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-stone-400 mt-2">Be specific about the situation and feeling.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2" id="intensity-label">
                Intensity: {session.emotionIntensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={session.emotionIntensity}
                onChange={e => updateSession(prev => ({ ...prev, emotionIntensity: parseInt(e.target.value) }))}
                aria-label="Emotion intensity"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={session.emotionIntensity}
                aria-labelledby="intensity-label"
                className="w-full accent-amber-500"
              />
            </div>

            {crisisLevel !== 'none' && (
              <SafetyBanner crisisLevel={crisisLevel} className="mt-4" />
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="bg-stone-800/40 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-stone-300 leading-relaxed">
                Beneath every strong emotion is a belief that makes it make sense. Ask yourself: what would have to be true about me, others, or the world for this emotion to be the only reasonable response?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                What core belief is driving this emotion?
              </label>
              <textarea
                value={session.beliefStatement}
                onChange={e => updateSession(prev => ({ ...prev, beliefStatement: e.target.value }))}
                placeholder="e.g., 'I am not good enough. If I fail, I am worthless.'"
                className="w-full h-28 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-stone-400 mt-2">This is likely an unconscious belief. Write what you sense beneath the emotion.</p>
            </div>

            {crisisLevel !== 'none' && (
              <SafetyBanner crisisLevel={crisisLevel} className="mt-4" />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-stone-400">
              Examine the belief like a scientist. What facts actually support or contradict it? Press Enter to add each item.
            </p>

            <div>
              <h4 className="text-sm font-semibold text-stone-200 mb-3">Evidence FOR this belief</h4>
              <div className="space-y-2 mb-3">
                {session.evidenceFor.map((evidence, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    <span className="text-amber-400 mt-0.5 text-xs">—</span>
                    <span className="text-sm text-stone-300 flex-1">{evidence}</span>
                    <button
                      onClick={() => handleRemoveEvidence('for', idx)}
                      aria-label="Remove this evidence item"
                      className="text-stone-500 hover:text-stone-300 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={evidenceForInput}
                onChange={e => setEvidenceForInput(e.target.value)}
                placeholder="Why does this belief feel true? (Enter to add)"
                onKeyDown={e => {
                  if (e.key === 'Enter' && evidenceForInput.trim()) {
                    handleAddEvidence('for', evidenceForInput);
                  }
                }}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stone-200 mb-3">Evidence AGAINST this belief</h4>
              <div className="space-y-2 mb-3">
                {session.evidenceAgainst.map((evidence, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-stone-700/40 border border-stone-600/40 rounded-lg p-2">
                    <span className="text-stone-400 mt-0.5 text-xs">—</span>
                    <span className="text-sm text-stone-300 flex-1">{evidence}</span>
                    <button
                      onClick={() => handleRemoveEvidence('against', idx)}
                      aria-label="Remove this evidence item"
                      className="text-stone-500 hover:text-stone-300 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={evidenceAgainstInput}
                onChange={e => setEvidenceAgainstInput(e.target.value)}
                placeholder="What facts contradict this belief? (Enter to add)"
                onKeyDown={e => {
                  if (e.key === 'Enter' && evidenceAgainstInput.trim()) {
                    handleAddEvidence('against', evidenceAgainstInput);
                  }
                }}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <p className="text-sm text-stone-400 leading-relaxed">
              Beliefs have origins. They were learned — from early experiences, from what people did or didn't do, from what was rewarded or punished. Tracing the root can loosen the grip.
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                When did you first learn this? Where did it come from?
              </label>
              <textarea
                value={session.originStory}
                onChange={e => updateSession(prev => ({ ...prev, originStory: e.target.value }))}
                placeholder="What early experience shaped this belief? A moment, a pattern, a message you absorbed..."
                className="w-full h-24 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                Who taught you this? What were they afraid of?
              </label>
              <textarea
                value={session.relationalContext ?? ''}
                onChange={e => updateSession(prev => ({ ...prev, relationalContext: e.target.value }))}
                placeholder="Think about the people who shaped your early environment. What were they carrying that got passed to you?"
                className="w-full h-20 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div
              className="flex items-center gap-3 bg-stone-800/50 p-3 rounded-lg border border-stone-700"
              aria-describedby="inherited-desc"
            >
              <input
                type="checkbox"
                checked={session.isInheritedBelief}
                onChange={e => updateSession(prev => ({ ...prev, isInheritedBelief: e.target.checked }))}
                id="inherited"
                className="accent-amber-500"
              />
              <label htmlFor="inherited" className="text-sm text-stone-300 cursor-pointer">
                This is a belief I absorbed from family or culture, not one I chose
              </label>
            </div>
            <p id="inherited-desc" className="sr-only">
              Check if this belief was inherited rather than consciously formed
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="bg-stone-800/40 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-stone-300 leading-relaxed">
                Before releasing a belief, honor what it gave you. Every belief — even a painful one — once served a purpose. It helped you survive, belong, stay safe, or make sense of things. Dismissing it without acknowledgment often makes it return stronger.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                What was this belief protecting you from? What did it help you do or avoid?
              </label>
              <textarea
                value={session.oldBeliefProtection ?? ''}
                onChange={e => updateSession(prev => ({ ...prev, oldBeliefProtection: e.target.value }))}
                placeholder="e.g., 'It kept me working hard so I wouldn't be rejected. It helped me fit in by not standing out.'"
                className="w-full h-28 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-stone-400 mt-2">
                Can you offer gratitude to this part of you before letting it update?
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <p className="text-sm text-stone-400 leading-relaxed">
              Based on the evidence and your reflection, what is a more accurate or compassionate belief? Not a forced affirmation — something that actually holds up.
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                Updated belief
              </label>
              <textarea
                value={session.newBelief}
                onChange={e => updateSession(prev => ({ ...prev, newBelief: e.target.value }))}
                placeholder="e.g., 'I sometimes make mistakes. That's part of being human, not a measure of my worth.'"
                className="w-full h-24 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                Why does this feel more true?
              </label>
              <textarea
                value={session.newBeliefReasoning}
                onChange={e => updateSession(prev => ({ ...prev, newBeliefReasoning: e.target.value }))}
                placeholder="What evidence or realizations support this shift?"
                className="w-full h-20 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-stone-800/40 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-300 leading-relaxed">
                Place a hand on your chest. Read the old belief silently, then the new one. Which lands differently in your body? Trust that felt sense.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <p className="text-sm text-stone-400 leading-relaxed">
              Beliefs change through action, not just insight. How will you live as if the new belief is true?
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                What's your test plan?
              </label>
              <textarea
                value={session.testPlan}
                onChange={e => updateSession(prev => ({ ...prev, testPlan: e.target.value }))}
                placeholder="e.g., 'I'll speak up in the next team meeting without over-preparing, and notice what happens'"
                className="w-full h-20 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                One specific situation this week
              </label>
              <input
                type="text"
                value={session.specificSituation ?? ''}
                onChange={e => updateSession(prev => ({ ...prev, specificSituation: e.target.value }))}
                placeholder="Name a concrete moment where you'll act from the new belief"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">Test duration</label>
              <select
                value={session.testDuration}
                onChange={e => updateSession(prev => ({ ...prev, testDuration: e.target.value }))}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 focus:ring-2 focus:ring-amber-500"
              >
                <option>24 hours</option>
                <option>3 days</option>
                <option>1 week</option>
                <option>2 weeks</option>
              </select>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <ConsciousNodeIcon size={48} className="text-amber-400 animate-pulse" />
                <p className="text-stone-400 text-sm">Synthesizing your insight...</p>
              </div>
            ) : aiResult ? (
              <div className="space-y-5">
                <div className="text-center">
                  <FocusApertureIcon size={40} className="text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-stone-100">Belief Examination Complete</h3>
                </div>

                <div className="bg-stone-800/50 border border-amber-500/30 rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Pattern Identified</p>
                    <p className="text-stone-200 text-sm">{aiResult.detectedPattern}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Origin Insight</p>
                    <p className="text-stone-300 text-sm">{aiResult.beliefOriginInsight}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Shadow Dimension</p>
                    <p className="text-stone-300 text-sm">{aiResult.shadowDimension}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Somatic Awareness</p>
                    <p className="text-stone-300 text-sm">{aiResult.somaticAwareness}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Integration Commitment</p>
                    <p className="text-stone-300 text-sm">{aiResult.integrationCommitment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">Recommended Practice</p>
                    <p className="text-stone-200 text-sm font-medium">{aiResult.recommendedPractice.practiceName}</p>
                    <p className="text-stone-400 text-xs mt-1">{aiResult.recommendedPractice.rationale}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">New Belief Grounding</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                          style={{ width: `${Math.round(aiResult.updatedBeliefStrength * 100)}%` }}
                        />
                      </div>
                      <span className="text-stone-300 text-sm">{Math.round(aiResult.updatedBeliefStrength * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-800/30 border border-stone-700 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-stone-400"><span className="text-stone-300 font-medium">Old belief:</span> "{session.beliefStatement}"</p>
                  <p className="text-stone-400"><span className="text-stone-300 font-medium">New belief:</span> "{session.newBelief}"</p>
                  <p className="text-stone-400"><span className="text-stone-300 font-medium">Test period:</span> {session.testDuration}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-stone-400 text-sm">Ready to synthesize your session. Click "Save & Complete" to generate your insight.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardFrame
      title="Examining Core Beliefs"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      accentColor="amber"
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      isLoading={isLoading}
      showBackButton={currentStep > 0}
      nextButtonDisabled={isNextDisabled}
      nextButtonText={currentStep === TOTAL_STEPS - 1 ? 'Save & Complete' : 'Next'}
      errorMessage={session.status === 'error' ? session.error : null}
    >
      {renderStep()}
    </WizardFrame>
  );
};

export default ExaminingCoreBeliefWizard;
