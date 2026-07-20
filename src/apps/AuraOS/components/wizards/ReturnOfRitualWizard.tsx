import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import type { ReturnOfRitualSession, ReturnOfRitualDraft } from '../../src/types';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { wizardSessionService } from '../../services/wizardSessionService';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { practices } from '../../constants';
import { AscensionFlameIcon } from '../visualizations/SacredGeometryIcons';

// ─── Types ────────────────────────────────────────────────────────
type WizardStep =
  | 'RITUAL_CHECK'
  | 'ROUTINE_REVEAL'
  | 'REFRAME'
  | 'DEFINITION'
  | 'WHY_WORKS'
  | 'WHAT_HAPPENED'
  | 'POSTMODERN_PROBLEM'
  | 'METAMODERN_PROP'
  | 'EXAMPLES'
  | 'RELATIONSHIP'
  | 'YOUR_EXAMPLE'
  | 'AI_REFLECTION'
  | 'PRINCIPLES'
  | 'PRINCIPLE_AUDIT'
  | 'GAP_ANALYSIS'
  | 'INTEGRAL_STATES'
  | 'PRACTICE'
  | 'CLOSE';

const STEP_ORDER: WizardStep[] = [
  'RITUAL_CHECK',
  'ROUTINE_REVEAL',
  'REFRAME',
  'DEFINITION',
  'WHY_WORKS',
  'WHAT_HAPPENED',
  'POSTMODERN_PROBLEM',
  'METAMODERN_PROP',
  'EXAMPLES',
  'RELATIONSHIP',
  'YOUR_EXAMPLE',
  'AI_REFLECTION',
  'PRINCIPLES',
  'PRINCIPLE_AUDIT',
  'GAP_ANALYSIS',
  'INTEGRAL_STATES',
  'PRACTICE',
  'CLOSE',
];

// ─── Constants ────────────────────────────────────────────────────
const ROUTINE_CHECKLIST = [
  { id: 'morning_tea', label: 'Morning tea/coffee ritual' },
  { id: 'walk', label: 'Daily walk or movement' },
  { id: 'meditation', label: 'Meditation or contemplation' },
  { id: 'evening_wind', label: 'Evening wind-down routine' },
  { id: 'bedtime', label: 'Bedtime ritual' },
  { id: 'meals', label: 'Intentional eating practice' },
  { id: 'cleaning', label: 'Tidying or cleaning space' },
  { id: 'journaling', label: 'Writing or journaling' },
  { id: 'music', label: 'Music or sound practice' },
  { id: 'none', label: 'I don\'t have consistent routines' },
];

const EXAMPLE_RITUALS = [
  {
    id: 'morning_light',
    title: 'Morning Light Ritual',
    description: 'Step outside at sunrise with intention. Notice the light, the temperature, your breath. You know light doesn\'t have supernatural power—yet the practice works. The body knows.',
  },
  {
    id: 'tea_ceremony',
    title: 'Tea as Ceremony',
    description: 'Boil water, steep, taste with full attention. You could chug coffee. Instead, you pause. Constructed? Yes. Meaningless? No. The ritual creates a threshold between rush and presence.',
  },
  {
    id: 'threshold_prayer',
    title: 'Threshold Prayer (No Belief Required)',
    description: 'A hand on the doorframe before entering the world, or upon returning home. A pause. You may not believe in God. The gesture itself is the work—a somatic reset.',
  },
  {
    id: 'meal_gathering',
    title: 'Intentional Meal',
    description: 'Food on a table. No phone. Attention to flavors and company. Ritually mundane. The structure—not the supernatural—holds the space.',
  },
];

const PRINCIPLE_DEFINITIONS = [
  {
    id: 'sincerity',
    name: 'Sincerity',
    desc: 'You mean what you do. The ritual is not performed for show or superstition; it expresses what truly matters to you.',
  },
  {
    id: 'container',
    name: 'Container',
    desc: 'The ritual holds a boundary. It separates sacred time from profane time, creates a vessel. Without form, there is no container.',
  },
  {
    id: 'stakes',
    name: 'Stakes',
    desc: 'Something is at risk or valued. The ritual matters to you; you show up for it. Low stakes = it dissolves.',
  },
  {
    id: 'form',
    name: 'Form',
    desc: 'The ritual has a repeatable structure. Form is not rigidity; it is recognizability. You know what comes next.',
  },
  {
    id: 'repetition',
    name: 'Repetition',
    desc: 'You do it again. Ritual lives in return. Once is not ritual; it is event. Five times a week becomes ritual.',
  },
];

const PRACTICE_TEMPLATES: Record<string, string> = {
  sincerity: 'Write: Why does this routine truly matter to you? Not why you think it should, but what it actually provides.',
  container: 'Add one boundary marker—opening and closing gesture. Candle, bell, hand gesture. Something that says "now we are here."',
  stakes: 'Commit to this routine for 40 days. Stakes are the commitment. Track it. See what happens.',
  form: 'Write down the exact sequence. Every step. Then follow it exactly for two weeks. Notice what the repetition reveals.',
  repetition: 'Choose the time and day this happens. Same time, same place. Consistency is the ritual\'s skeleton.',
};

const POSTMODERN_COST = `Postmodernism deconstructed rituals. If it's constructed, is it real? If there's no objective truth, why follow form? Irony infected even our sacred acts. The ritual became suspect precisely because we could see it was made.`;

const METAMODERN_PATH = `Metamodernism says: Yes, it is constructed. Yes, you made it up. Proceed anyway. Hold both truths: it is artificial AND it works. The oscillation between knowing and not-knowing is where ritual lives now.`;

// ─── AI Schema ────────────────────────────────────────────────────
const ritualReflectionSchema = z.object({
  reflection: z.string().min(50).max(400),
  keyInsight: z.string().min(10).max(150),
});

// ─── Component ────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  userId?: string;
}

export default function ReturnOfRitualWizard({ onClose, userId }: Props) {
  const { setIntegratedInsights } = useInsightsContext();
  const [draft, updateDraft, , clearDraft] = useWizardDraft<Partial<ReturnOfRitualDraft>>(
    'aura-draft-return-of-ritual',
    {}
  );
  const [hasRituals, setHasRituals] = useState(draft?.hasRituals ?? '');
  const [routineChecklist, setRoutineChecklist] = useState<string[]>(draft?.routineChecklist ?? []);
  const [postDeconstructionFeeling, setPostDeconstructionFeeling] = useState(draft?.postDeconstructionFeeling ?? '');
  const [ritualRelationship, setRitualRelationship] = useState(draft?.ritualRelationship ?? '');
  const [userRoutine, setUserRoutine] = useState(draft?.userRoutine ?? '');
  const [routineFunction, setRoutineFunction] = useState(draft?.routineFunction ?? '');
  const [aiReflection, setAiReflection] = useState(draft?.aiReflection ?? '');
  const [aiKeyInsight, setAiKeyInsight] = useState('');
  const [aiReaction, setAiReaction] = useState<'resonates' | 'curious' | 'pushback' | ''>(draft?.aiReaction ?? '');
  const [principlesPresent, setPrinciplesPresent] = useState<string[]>(draft?.principlesPresent ?? []);
  const [gapResponse, setGapResponse] = useState(draft?.gapResponse ?? '');
  const [integralReaction, setIntegralReaction] = useState<'resonates' | 'curious' | 'pushback' | ''>(draft?.integralReaction ?? '');
  const [shiftNote, setShiftNote] = useState(draft?.shiftNote ?? '');
  const [openQuestion, setOpenQuestion] = useState(draft?.openQuestion ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [whyWorksSubStep, setWhyWorksSubStep] = useState(0);
  const [expandedExampleCard, setExpandedExampleCard] = useState<string | null>(null);
  const [principleIndex, setPrincipleIndex] = useState(0);

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;

  const checklistCount = routineChecklist.length;
  const missingPrinciples = PRINCIPLE_DEFINITIONS.filter(p => !principlesPresent.includes(p.id));
  const dominantMissing = missingPrinciples[0];

  const saveDraftLocal = useCallback((updates: Partial<ReturnOfRitualDraft> = {}) => {
    updateDraft({
      hasRituals,
      routineChecklist,
      postDeconstructionFeeling,
      ritualRelationship,
      userRoutine,
      routineFunction,
      aiReflection,
      aiReaction,
      principlesPresent,
      gapResponse,
      integralReaction,
      shiftNote,
      openQuestion,
      ...updates,
    });
  }, [hasRituals, routineChecklist, postDeconstructionFeeling, ritualRelationship, userRoutine, routineFunction, aiReflection, aiReaction, principlesPresent, gapResponse, integralReaction, shiftNote, openQuestion, updateDraft]);

  const handleAIReflection = useCallback(async () => {
    if (aiReflection) return;
    setIsLoading(true);
    try {
      const prompt = `You are reflecting with someone exploring ritual after postmodern deconstruction.

Their routine: "${userRoutine}"
What it provides: ${routineFunction}
Relationship to ritual: ${ritualRelationship}
Feeling after deconstruction: ${postDeconstructionFeeling}
Principles they notice: ${principlesPresent.join(', ') || 'none identified yet'}

Generate a JSON response with TWO fields:
1. "reflection": A 3-4 sentence reflection (50-400 chars) that:
   - Names specifically what their routine is doing (e.g., "your morning tea is holding a threshold")
   - Acknowledges it is constructed AND works
   - Works with their actual practice

2. "keyInsight": A precise name for one key insight (10-150 chars), e.g., "the ceremony is the medicine" or "form is freedom now"

Return ONLY valid JSON, no markdown, no explanation.`;

      const result = await callGrokThenAIJson(
        'ReturnOfRitual-AIReflection',
        prompt,
        undefined,
        ritualReflectionSchema
      );

      setAiReflection(result.reflection);
      setAiKeyInsight(result.keyInsight);
      saveDraftLocal({ aiReflection: result.reflection });
    } catch (err) {
      console.error('AI reflection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userRoutine, routineFunction, ritualRelationship, postDeconstructionFeeling, principlesPresent, aiReflection, saveDraftLocal]);

  const handleNext = useCallback(() => {
    saveDraftLocal();
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
      setWhyWorksSubStep(0);
      setExpandedExampleCard(null);
      setPrincipleIndex(0);
    }
  }, [stepIndex, totalSteps, saveDraftLocal]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }, [stepIndex]);

  const handleComplete = useCallback(async () => {
    saveDraftLocal();
    const sessionId = `return-of-ritual-${Date.now()}`;
    const sessionDraft = {
        hasRituals,
        routineChecklist,
        postDeconstructionFeeling,
        ritualRelationship,
        userRoutine,
        routineFunction,
        aiReflection,
        aiReaction,
        principlesPresent,
        gapResponse,
        integralReaction,
        shiftNote,
        openQuestion,
    };
    
    const session: ReturnOfRitualSession = {
      id: sessionId,
      createdAt: Date.now(),
      userId,
      draft: sessionDraft,
    };
    
    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: sessionId,
          type: 'Return of Ritual',
          content: session,
          created_at: new Date(session.createdAt).toISOString(),
        });

        const insight = await generateInsightFromSession({
          wizardType: 'Return of Ritual',
          sessionId: sessionId,
          sessionName: 'Return of Ritual Process',
          sessionReport: JSON.stringify(sessionDraft),
          sessionSummary: `Completed Return of Ritual. Current ritual status: ${sessionDraft.hasRituals}. Explored routine: ${sessionDraft.userRoutine.substring(0, 50)}...`,
          userId,
          availablePractices: Object.values(practices).flatMap(category =>
              Array.isArray(category) ? category.map((p: any) => ({ id: p.id, name: p.name })) : []
          ),
        });

        if (insight) {
          setIntegratedInsights(prev => [insight, ...prev]);
        }
      } catch (err) {
        console.error('[ReturnOfRitual] save/insight error:', err);
        alert('Warning: Session may not have been saved. Check console for details.');
      }
    } else {
      console.warn('[ReturnOfRitual] No userId, not saving to Supabase');
    }

    clearDraft();
    onClose();
  }, [saveDraftLocal, userId, hasRituals, routineChecklist, postDeconstructionFeeling, ritualRelationship, userRoutine, routineFunction, aiReflection, aiReaction, principlesPresent, gapResponse, integralReaction, shiftNote, openQuestion, clearDraft, onClose, setIntegratedInsights]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <WizardFrame
      title="The Return of Ritual"
      headerSlot={<p className="text-sm text-slate-400 mt-1">Design sacred space after deconstruction — knowing it's constructed, letting it work anyway.</p>}
      onClose={onClose}
      currentStep={stepIndex + 1}
      totalSteps={totalSteps}
      onNext={handleNext}
      onBack={handleBack}
      isLoading={isLoading}
      accentColor="teal"
    >
      {currentStep === 'RITUAL_CHECK' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Do you have rituals or routines in your life right now?</p>
          <div className="space-y-3">
            {['Yes, several', 'A few', 'Almost nothing'].map((option) => (
              <button
                key={option}
                onClick={() => setHasRituals(option)}
                className={`w-full px-4 py-3 rounded text-sm font-medium transition text-left ${
                  hasRituals === option
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'ROUTINE_REVEAL' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Which of these do you have?</p>
          <div className="space-y-3">
            {ROUTINE_CHECKLIST.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={routineChecklist.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRoutineChecklist([...routineChecklist, id]);
                    } else {
                      setRoutineChecklist(routineChecklist.filter(x => x !== id));
                    }
                  }}
                  className="accent-teal-500"
                />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-slate-400 pt-2">
            {checklistCount === 0 ? 'Almost nothing checked.' : `You checked ${checklistCount} routines.`}
          </div>
        </div>
      )}

      {currentStep === 'REFRAME' && (
        <div className="space-y-6">
          <p className="text-slate-200 font-serif text-lg">
            {checklistCount === 0
              ? 'You have almost nothing — yet.'
              : `You checked ${checklistCount} things. These are seeds.`}
          </p>
          <p className="text-sm text-slate-300">A ritual is more than a habit. It's a practice with meaning, form, and intention.</p>
        </div>
      )}

      {currentStep === 'DEFINITION' && (
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <p className="text-sm text-slate-200">
              A <strong>ritual</strong> is a repeated practice with:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li><strong>Form</strong> — a recognizable structure</li>
              <li><strong>Intention</strong> — it means something to you</li>
              <li><strong>Repetition</strong> — you return to it</li>
              <li><strong>Stakes</strong> — it matters; you show up for it</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'WHY_WORKS' && (
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">
              {whyWorksSubStep === 0 && 'Rituals Create Containers'}
              {whyWorksSubStep === 1 && 'Form Enables Transformation'}
              {whyWorksSubStep === 2 && 'Return Deepens Meaning'}
            </h4>
            <p className="text-sm text-slate-300">
              {whyWorksSubStep === 0 && 'A ritual marks a boundary. Before the ritual / after the ritual. This separation is not magic; it is psychological. The form itself signals a shift.'}
              {whyWorksSubStep === 1 && 'Repetition rewires the nervous system. Your body recognizes the sequence and enters a state. The form is the invitation your body learns to accept.'}
              {whyWorksSubStep === 2 && 'You do it again. And again. Each repetition layers meaning. The ritual becomes a conversation between your conscious self and your deeper knowing.'}
            </p>
          </div>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setWhyWorksSubStep(Math.max(0, whyWorksSubStep - 1))}
              disabled={whyWorksSubStep === 0}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">{whyWorksSubStep + 1} / 3</span>
            <button
              onClick={() => setWhyWorksSubStep(Math.min(2, whyWorksSubStep + 1))}
              disabled={whyWorksSubStep === 2}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentStep === 'WHAT_HAPPENED' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">What happened to ritual in the postmodern world?</p>
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <p className="text-sm text-slate-300">{POSTMODERN_COST}</p>
          </div>
        </div>
      )}

      {currentStep === 'POSTMODERN_PROBLEM' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">You can see your rituals are constructed. Does that make them false or less real?</p>
          <div className="space-y-3">
            {['Yes, the construction ruins it', 'No, the form still works', 'I\'m not sure'].map((option) => (
              <button
                key={option}
                onClick={() => setPostDeconstructionFeeling(option)}
                className={`w-full px-4 py-3 rounded text-sm font-medium transition text-left ${
                  postDeconstructionFeeling === option
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'METAMODERN_PROP' && (
        <div className="space-y-6">
          <p className="text-slate-200 font-serif text-lg">The metamodern answer:</p>
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <p className="text-sm text-slate-300">{METAMODERN_PATH}</p>
          </div>
        </div>
      )}

      {currentStep === 'EXAMPLES' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Examples of rituals that work because they are constructed:</p>
          <div className="space-y-3">
            {EXAMPLE_RITUALS.map(({ id, title, description }) => (
              <button
                key={id}
                onClick={() => setExpandedExampleCard(expandedExampleCard === id ? null : id)}
                className={`w-full p-3 rounded text-left text-sm transition ${
                  expandedExampleCard === id
                    ? 'bg-slate-600 border border-teal-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                <span className="font-semibold text-slate-100">{title}</span>
                {expandedExampleCard === id && (
                  <p className="mt-2 text-slate-300 text-xs">{description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'RELATIONSHIP' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">What is your relationship to ritual now?</p>
          <textarea
            value={ritualRelationship}
            onChange={(e) => setRitualRelationship(e.target.value)}
            placeholder="E.g., 'I want rituals but feel like they are too constructed to be real...'"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'YOUR_EXAMPLE' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Bring one routine you have (or want to build). Describe it.</p>
          <textarea
            value={userRoutine}
            onChange={(e) => setUserRoutine(e.target.value)}
            placeholder="E.g., 'Morning tea, same mug, by the window, before checking my phone...'"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
          <p className="text-sm text-slate-300">What does this routine provide or could provide?</p>
          <textarea
            value={routineFunction}
            onChange={(e) => setRoutineFunction(e.target.value)}
            placeholder="E.g., 'A moment of slowness, a pause before the day...'"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'AI_REFLECTION' && (
        <div className="space-y-6">
          {!aiReflection ? (
            <button
              onClick={handleAIReflection}
              disabled={isLoading || !userRoutine}
              className="w-full px-4 py-3 bg-teal-600 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Reflecting...' : 'Generate Reflection'}
            </button>
          ) : (
            <>
              <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                <p className="text-sm text-slate-300">{aiReflection}</p>
                {aiKeyInsight && <p className="text-xs text-slate-400 mt-2 italic">"{aiKeyInsight}"</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">Does this land?</p>
                <div className="flex gap-2 flex-wrap">
                  {['resonates', 'curious', 'pushback'].map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => setAiReaction(reaction as 'resonates' | 'curious' | 'pushback')}
                      className={`px-3 py-2 rounded text-xs font-medium transition ${
                        aiReaction === reaction
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {reaction === 'resonates' ? '✓ Resonates' : reaction === 'curious' ? '? Curious' : '✕ Push back'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {currentStep === 'PRINCIPLES' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Ritual principles. Navigate through them.</p>
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">{PRINCIPLE_DEFINITIONS[principleIndex].name}</h4>
            <p className="text-sm text-slate-300">{PRINCIPLE_DEFINITIONS[principleIndex].desc}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setPrincipleIndex(Math.max(0, principleIndex - 1))}
              disabled={principleIndex === 0}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">{principleIndex + 1} / {PRINCIPLE_DEFINITIONS.length}</span>
            <button
              onClick={() => setPrincipleIndex(Math.min(PRINCIPLE_DEFINITIONS.length - 1, principleIndex + 1))}
              disabled={principleIndex === PRINCIPLE_DEFINITIONS.length - 1}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentStep === 'PRINCIPLE_AUDIT' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Which principles are already present in your routine?</p>
          <div className="space-y-3">
            {PRINCIPLE_DEFINITIONS.map(({ id, name }) => (
              <label key={id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={principlesPresent.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPrinciplesPresent([...principlesPresent, id]);
                    } else {
                      setPrinciplesPresent(principlesPresent.filter(x => x !== id));
                    }
                  }}
                  className="accent-teal-500"
                />
                <span className="text-sm text-slate-300">{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'GAP_ANALYSIS' && (
        <div className="space-y-6">
          {missingPrinciples.length > 0 ? (
            <>
              <p className="text-sm text-slate-300">Principles not yet present in your routine:</p>
              <div className="bg-slate-700/50 p-4 rounded border border-slate-600 space-y-2">
                {missingPrinciples.map(({ name }) => (
                  <p key={name} className="text-sm text-slate-300">• {name}</p>
                ))}
              </div>
              <p className="text-sm text-slate-300">What would it take to bring {dominantMissing?.name.toLowerCase()} into your routine?</p>
              <textarea
                value={gapResponse}
                onChange={(e) => setGapResponse(e.target.value)}
                placeholder="E.g., 'Add an opening gesture...'"
                className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
              />
            </>
          ) : (
            <p className="text-sm text-slate-300">All principles are present. Your routine is already ritually complete.</p>
          )}
        </div>
      )}

      {currentStep === 'INTEGRAL_STATES' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">The ritual allows you to move between states: gross embodiment, subtle presence, and causal awareness.</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">Does this resonate?</p>
            <div className="flex gap-2 flex-wrap">
              {['resonates', 'curious', 'pushback'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => setIntegralReaction(reaction as 'resonates' | 'curious' | 'pushback')}
                  className={`px-3 py-2 rounded text-xs font-medium transition ${
                    integralReaction === reaction
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {reaction === 'resonates' ? '✓ Yes' : reaction === 'curious' ? '?' : '✕ No'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'PRACTICE' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">One practice for deepening your ritual:</p>
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <p className="text-sm text-slate-300">
              {dominantMissing ? PRACTICE_TEMPLATES[dominantMissing.id] : PRACTICE_TEMPLATES.sincerity}
            </p>
          </div>
        </div>
      )}

      {currentStep === 'CLOSE' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">One shift in how you hold ritual:</p>
          <textarea
            value={shiftNote}
            onChange={(e) => setShiftNote(e.target.value)}
            placeholder="E.g., 'I can construct ritual and it still works...'"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
          <p className="text-sm text-slate-300">One open question you're sitting with:</p>
          <textarea
            value={openQuestion}
            onChange={(e) => setOpenQuestion(e.target.value)}
            placeholder="What are you still wondering?"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded font-medium hover:bg-teal-700"
          >
            Complete Session
          </button>
        </div>
      )}
    </WizardFrame>
  );
}
