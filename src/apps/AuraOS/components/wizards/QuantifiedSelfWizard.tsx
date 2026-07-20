import React, { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import type { QuantifiedSelfSession, QuantifiedSelfDraft } from '../../src/types';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { wizardSessionService } from '../../services/wizardSessionService';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { practices } from '../../constants';
import { PulseMatrixIcon } from '../visualizations/SacredGeometryIcons';

// ─── Types ────────────────────────────────────────────────────────
type WizardStep =
  | 'BODY_CHECKING'
  | 'BODY_BEING'
  | 'CULTURAL_INTRO'
  | 'STANCE_VESSEL'
  | 'STANCE_MACHINE'
  | 'STANCE_CONSTRUCT'
  | 'STANCE_HOME'
  | 'PROFILE_REVEAL'
  | 'PROFILE_INTERPRETATION'
  | 'HIGHEST_COST'
  | 'LOWEST_CARRIES'
  | 'ABSENT_BODY'
  | 'METAMODERN_BODY'
  | 'YOUR_EXAMPLE'
  | 'AI_REFLECTION'
  | 'INTEGRAL_BODY'
  | 'BODY_LAYERS_ACCESS'
  | 'INTEGRATION'
  | 'PRACTICE'
  | 'CLOSE';

const STEP_ORDER: WizardStep[] = [
  'BODY_CHECKING',
  'BODY_BEING',
  'CULTURAL_INTRO',
  'STANCE_VESSEL',
  'STANCE_MACHINE',
  'STANCE_CONSTRUCT',
  'STANCE_HOME',
  'PROFILE_REVEAL',
  'PROFILE_INTERPRETATION',
  'HIGHEST_COST',
  'LOWEST_CARRIES',
  'ABSENT_BODY',
  'METAMODERN_BODY',
  'YOUR_EXAMPLE',
  'AI_REFLECTION',
  'INTEGRAL_BODY',
  'BODY_LAYERS_ACCESS',
  'INTEGRATION',
  'PRACTICE',
  'CLOSE',
];

// ─── Profile Interpretation ────────────────────────────────────────
type StanceKey = 'vessel' | 'machine' | 'construct' | 'home';

interface ProfileResult {
  pattern: string;
  headline: string;
  description: string;
  highestCost: string;
  practice: string;
}

function interpretProfile(scores: Record<StanceKey, number>): ProfileResult {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [highest, highestScore] = sorted[0] as [StanceKey, number];
  const [lowest, lowestScore] = sorted[sorted.length - 1] as [StanceKey, number];
  const allLow = Object.values(scores).every(v => v < 35);
  const allMedium = Object.values(scores).every(v => v >= 35 && v <= 65);

  // Pattern keys
  const patterns: Record<string, ProfileResult> = {
    machine_construct: {
      pattern: 'machine_construct',
      headline: 'Optimization through Quantification',
      description: 'You measure and optimize the body as a system. The body is data to be understood and improved.',
      highestCost: 'Losing felt experience in pursuit of objective metrics. The lived body becomes secondary to its representation.',
      practice: 'Somatic check-ins: pause measurement and simply sense your aliveness for 5 minutes daily.',
    },
    construct_machine: {
      pattern: 'construct_machine',
      headline: 'Architecture before Mechanism',
      description: 'You understand your body as a designed system — intentional, constructed, serviceable.',
      highestCost: 'Over-engineering your body as a project. Missing the spontaneity and wisdom of not-planning.',
      practice: 'Improv movement: dance or move without a plan for 10 minutes, following sensation rather than design.',
    },
    machine_only: {
      pattern: 'machine_only',
      headline: 'Pure Optimization',
      description: 'You relate to the body almost entirely through performance metrics and functional improvement.',
      highestCost: 'The body becomes a problem to solve. You never arrive at satisfaction; there is always more to optimize.',
      practice: 'Meditation on acceptance: sit with one thing you cannot change about your body and notice what arises.',
    },
    construct_only: {
      pattern: 'construct_only',
      headline: 'Architecture as Identity',
      description: 'Your body is primarily a project: what you build, design, and present to the world.',
      highestCost: 'Disconnection from bodily wisdom. You may override hunger, fatigue, or pleasure in service of the design.',
      practice: 'Attunement practice: listen to your body\'s wants (not shoulds) for one week and honor at least one daily.',
    },
    vessel_high: {
      pattern: 'vessel_high',
      headline: 'The Body as Instrument',
      description: 'Your body is a vessel for larger forces — spirit, energy, presence, or wisdom. You trust it to know.',
      highestCost: 'Potential passivity. You may not claim agency when the body needs your conscious direction.',
      practice: 'Embodied decision-making: for one decision, sit in your body and listen before thinking it through.',
    },
    home_high: {
      pattern: 'home_high',
      headline: 'Dwelling in the Body',
      description: 'The body is home — a place to rest, return to, know yourself through. Comfort and belonging matter.',
      highestCost: 'Resistance to growth or change. Home can become too familiar; you may miss expansion.',
      practice: 'Somatic risk: try one movement or sensation that feels slightly foreign or uncomfortable (safely).',
    },
    low_all: {
      pattern: 'low_all',
      headline: 'Ambivalence toward the Body',
      description: 'You have low resonance with all stances. The body may feel abstract, distant, or not primary to your sense of self.',
      highestCost: 'Potential dissociation. Living mentally while the body goes unattended.',
      practice: 'Embodiment grounding: spend 5 minutes daily noticing one sensation (texture, temperature, weight, breath).',
    },
    unresolved: {
      pattern: 'unresolved',
      headline: 'Integrated Tension',
      description: 'Your stances are relatively balanced. You hold multiple relationships to your body simultaneously.',
      highestCost: 'Possible lack of clear direction. Which stance guides you when they conflict?',
      practice: 'Stance dialogue: when pulled in different directions, have an internal conversation between your stances.',
    },
  };

  // Determine pattern
  let patternKey = 'unresolved';
  if (allLow) {
    patternKey = 'low_all';
  } else if (highest === 'vessel' && scores.vessel > scores.machine + 15) {
    patternKey = 'vessel_high';
  } else if (highest === 'home' && scores.home > scores.machine + 15) {
    patternKey = 'home_high';
  } else if ((highest === 'machine' || highest === 'construct') && sorted[1][0] === (highest === 'machine' ? 'construct' : 'machine') && highestScore - lowestScore > 30) {
    patternKey = scores.machine > scores.construct ? 'machine_construct' : 'construct_machine';
  } else if (highest === 'machine' && scores.construct < 30) {
    patternKey = 'machine_only';
  } else if (highest === 'construct' && scores.machine < 30) {
    patternKey = 'construct_only';
  }

  return patterns[patternKey];
}

const ABSENT_BODY_PANELS = [
  {
    title: 'The Absent Body',
    text: 'When measurement dominates, the lived body can fade. You optimize for metrics while neglecting sensation, pleasure, or the quiet wisdom of simply being in your skin.',
  },
  {
    title: 'Why It Happens',
    text: 'The quantified self began with sincere intent—self-knowledge through data. But data cannot capture the felt sense of embodiment: the warmth of sun, the texture of breath, the aliveness of movement without agenda.',
  },
  {
    title: 'The Metamodern Path',
    text: 'Measure what you can measure. Collect data. AND simultaneously cultivate direct sensing. Hold the tension: the body is both knowable (through metrics) and ultimately mysterious (in direct experience).',
  },
];

const INTEGRAL_BODY_PANELS = [
  {
    title: 'Gross Body',
    text: 'Physical form, tissue, measurable structures. What you see in the mirror, what the scale reads, what movement can be tracked.',
  },
  {
    title: 'Subtle Body',
    text: 'Energy, sensation, aliveness. The felt-sense of your embodiment. This is where you feel emotion in your chest, intuition in your belly, presence in your whole skin.',
  },
  {
    title: 'Causal Body',
    text: 'The deepest sense of embodied presence — not as an object you have, but as the ground of your being. What Advaita calls the "witness body." Pure aliveness without a watcher.',
  },
];

const BODY_LAYERS_OPTIONS = [
  { id: 'gross', label: 'Gross/physical' },
  { id: 'subtle', label: 'Subtle/energetic' },
  { id: 'causal', label: 'Causal/witnessing' },
  { id: 'multiple', label: 'All three together' },
];

const LOWEST_COST_RESPONSES: Record<string, string> = {
  vessel: 'The cost of pure receptivity is passivity. You may not claim the agency needed to direct your body when it needs conscious will.',
  machine: 'The cost of pure optimization is fatigue and dissatisfaction. There is always more to improve; the goal line never arrives.',
  construct: 'The cost of pure design is rigidity and disconnection. You may override your body\'s actual needs in service of the project.',
  home: 'The cost of pure dwelling is stagnation. Comfort can calcify; the body needs challenge to grow and evolve.',
};

// ─── AI Schema ────────────────────────────────────────────────────
const bodyStanceSchema = z.object({
  reflection: z.string().min(50).max(400),
  tensionName: z.string().min(10).max(100),
});

// ─── Component ────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  userId?: string;
}

export default function QuantifiedSelfWizard({ onClose, userId }: Props) {
  const { setIntegratedInsights } = useInsightsContext();
  const [draft, updateDraft, , clearDraft] = useWizardDraft<Partial<QuantifiedSelfDraft>>(
    'aura-draft-quantified-self',
    {}
  );
  const [bodyChecking, setBodyChecking] = useState(draft?.bodyChecking ?? '');
  const [bodyBeing, setBodyBeing] = useState(draft?.bodyBeing ?? '');
  const [stanceVessel, setStanceVessel] = useState(draft?.stanceVessel ?? 50);
  const [stanceMachine, setStanceMachine] = useState(draft?.stanceMachine ?? 50);
  const [stanceConstruct, setStanceConstruct] = useState(draft?.stanceConstruct ?? 50);
  const [stanceHome, setStanceHome] = useState(draft?.stanceHome ?? 50);
  const [profileReaction, setProfileReaction] = useState<'resonates' | 'curious' | 'pushback' | ''>(draft?.profileReaction ?? '');
  const [lowestStanceResponse, setLowestStanceResponse] = useState(draft?.lowestStanceResponse ?? '');
  const [absentBodyReaction, setAbsentBodyReaction] = useState<'resonates' | 'curious' | 'pushback' | ''>(draft?.absentBodyReaction ?? '');
  const [userExample, setUserExample] = useState(draft?.userExample ?? '');
  const [aiReflection, setAiReflection] = useState(draft?.aiReflection ?? '');
  const [aiTensionName, setAiTensionName] = useState('');
  const [aiReaction, setAiReaction] = useState<'resonates' | 'curious' | 'pushback' | ''>(draft?.aiReaction ?? '');
  const [bodyLayersAccess, setBodyLayersAccess] = useState<string[]>(draft?.bodyLayersAccess ?? []);
  const [shiftNote, setShiftNote] = useState(draft?.shiftNote ?? '');
  const [openQuestion, setOpenQuestion] = useState(draft?.openQuestion ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [absentSubStep, setAbsentSubStep] = useState(0);
  const [integralSubStep, setIntegralSubStep] = useState(0);

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;

  const scores = { vessel: stanceVessel, machine: stanceMachine, construct: stanceConstruct, home: stanceHome };
  const profile = interpretProfile(scores);
  const sortedStances = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const highest = sortedStances[0][0] as StanceKey;
  const lowest = sortedStances[sortedStances.length - 1][0] as StanceKey;

  const saveDraftLocal = useCallback((updates: Partial<QuantifiedSelfDraft> = {}) => {
    updateDraft({
      bodyChecking,
      bodyBeing,
      stanceVessel,
      stanceMachine,
      stanceConstruct,
      stanceHome,
      profileReaction,
      lowestStanceResponse,
      absentBodyReaction,
      userExample,
      aiReflection,
      aiReaction,
      bodyLayersAccess,
      shiftNote,
      openQuestion,
      ...updates,
    });
  }, [bodyChecking, bodyBeing, stanceVessel, stanceMachine, stanceConstruct, stanceHome, profileReaction, lowestStanceResponse, absentBodyReaction, userExample, aiReflection, aiReaction, bodyLayersAccess, shiftNote, openQuestion, updateDraft]);

  const handleAIReflection = useCallback(async () => {
    if (aiReflection) return;
    setIsLoading(true);
    try {
      const prompt = `You are reflecting with someone exploring the tension between quantifying and sensing their body.

Context:
- How they check in with body: ${bodyChecking}
- What they prioritize: ${bodyBeing}
- Body stances (0-100): Vessel ${stanceVessel}, Machine ${stanceMachine}, Construct ${stanceConstruct}, Home ${stanceHome}
- Their specific example: "${userExample}"
- Lowest stance: ${lowest}

Generate a JSON response with TWO fields:
1. "reflection": A 3-4 sentence reflection (50-400 chars) that:
   - Names their specific tension (e.g., "the tracking-critique impasse")
   - Works with their example
   - Avoids judgment — this is their navigation, not a problem

2. "tensionName": A precise name for their tension (10-100 chars), e.g., "the analytics-aliveness gap"

Return ONLY valid JSON, no markdown, no explanation.`;

      const result = await callGrokThenAIJson(
        'QuantifiedSelf-AIReflection',
        prompt,
        undefined,
        bodyStanceSchema
      );

      setAiReflection(result.reflection);
      setAiTensionName(result.tensionName);
      saveDraftLocal({ aiReflection: result.reflection });
    } catch (err) {
      console.error('AI reflection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bodyChecking, bodyBeing, stanceVessel, stanceMachine, stanceConstruct, stanceHome, userExample, lowest, aiReflection, saveDraftLocal]);

  const handleNext = useCallback(() => {
    saveDraftLocal();
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
      setAbsentSubStep(0);
      setIntegralSubStep(0);
    }
  }, [stepIndex, totalSteps, saveDraftLocal]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }, [stepIndex]);

  const handleComplete = useCallback(async () => {
    saveDraftLocal();
    const sessionId = `quantified-self-${Date.now()}`;
    const sessionDraft = {
        bodyChecking,
        bodyBeing,
        stanceVessel,
        stanceMachine,
        stanceConstruct,
        stanceHome,
        profileReaction,
        lowestStanceResponse,
        absentBodyReaction,
        userExample,
        aiReflection,
        aiReaction,
        bodyLayersAccess,
        shiftNote,
        openQuestion,
    };
    
    const session: QuantifiedSelfSession = {
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
          type: 'Quantified Self',
          content: session,
          created_at: new Date(session.createdAt).toISOString(),
        });

        const insight = await generateInsightFromSession({
          wizardType: 'Quantified Self',
          sessionId: sessionId,
          sessionName: 'Quantified Self Practice',
          sessionReport: JSON.stringify(sessionDraft),
          sessionSummary: `Completed Quantified Self process. Highest stance: ${highest}, Lowest stance: ${lowest}. Explored integrating ${lowestStanceResponse.substring(0, 50)}...`,
          userId,
          availablePractices: Object.values(practices).flatMap(category =>
              Array.isArray(category) ? category.map((p: any) => ({ id: p.id, name: p.name })) : []
          ),
        });

        if (insight) {
          setIntegratedInsights(prev => [insight, ...prev]);
        }
      } catch (err) {
        console.error('[QuantifiedSelf] save/insight error:', err);
        // Still close the wizard even if save fails, but show a warning
        alert('Warning: Session may not have been saved. Check console for details.');
      }
    } else {
      // No userId - still close but warn
      console.warn('[QuantifiedSelf] No userId, not saving to Supabase');
    }

    clearDraft();
    onClose();
  }, [saveDraftLocal, userId, highest, lowest, bodyChecking, bodyBeing, stanceVessel, stanceMachine, stanceConstruct, stanceHome, profileReaction, lowestStanceResponse, absentBodyReaction, userExample, aiReflection, aiReaction, bodyLayersAccess, shiftNote, openQuestion, clearDraft, onClose, setIntegratedInsights]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <WizardFrame
      title="The Quantified Self and Its Limits"
      headerSlot={<p className="text-sm text-slate-400 mt-1">Map your cultural stances toward your body — machine, construct, vessel, home.</p>}
      onClose={onClose}
      currentStep={stepIndex + 1}
      totalSteps={totalSteps}
      onNext={handleNext}
      onBack={handleBack}
      isLoading={isLoading}
      accentColor="emerald"
    >
      {currentStep === 'BODY_CHECKING' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">How do you typically check in with your body? What do you notice first?</p>
          <textarea
            value={bodyChecking}
            onChange={(e) => setBodyChecking(e.target.value)}
            placeholder="E.g., 'I start with my energy level and how I slept. Then breathing...'"
            className="w-full h-24 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'BODY_BEING' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">What matters most to you when it comes to your body? Health? Feeling? Appearance? Power?</p>
          <textarea
            value={bodyBeing}
            onChange={(e) => setBodyBeing(e.target.value)}
            placeholder="E.g., 'Strength and how I feel, not the scale...'"
            className="w-full h-24 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'CULTURAL_INTRO' && (
        <div className="space-y-6">
          <p className="text-slate-200">We carry four cultural stances toward our bodies, often in tension:</p>
          <div className="space-y-4 text-sm text-slate-300">
            <div><strong>Vessel:</strong> The body as instrument for something larger — spirit, energy, presence.</div>
            <div><strong>Machine:</strong> The body as system to optimize and improve through data and effort.</div>
            <div><strong>Construct:</strong> The body as a design — something you build, present, architect.</div>
            <div><strong>Home:</strong> The body as place to dwell, return to, rest in. Belonging, not project.</div>
          </div>
          <p className="text-xs text-slate-400 pt-4">On the next four screens, you'll rate how much each stance feels like you.</p>
        </div>
      )}

      {currentStep === 'STANCE_VESSEL' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>Vessel:</strong> Your body is an instrument for larger forces — spirit, energy, presence, wisdom.
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={stanceVessel}
              onChange={(e) => setStanceVessel(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-sm text-slate-400">{stanceVessel}% — {stanceVessel < 30 ? 'Not me' : stanceVessel < 70 ? 'Sometimes' : 'Very much me'}</div>
          </div>
        </div>
      )}

      {currentStep === 'STANCE_MACHINE' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>Machine:</strong> Your body is a system to understand, measure, and optimize.
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={stanceMachine}
              onChange={(e) => setStanceMachine(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-sm text-slate-400">{stanceMachine}% — {stanceMachine < 30 ? 'Not me' : stanceMachine < 70 ? 'Sometimes' : 'Very much me'}</div>
          </div>
        </div>
      )}

      {currentStep === 'STANCE_CONSTRUCT' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>Construct:</strong> Your body is a design — something you intentionally build and present.
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={stanceConstruct}
              onChange={(e) => setStanceConstruct(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-sm text-slate-400">{stanceConstruct}% — {stanceConstruct < 30 ? 'Not me' : stanceConstruct < 70 ? 'Sometimes' : 'Very much me'}</div>
          </div>
        </div>
      )}

      {currentStep === 'STANCE_HOME' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>Home:</strong> Your body is a place to dwell, return to, belong. Not a project.
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={stanceHome}
              onChange={(e) => setStanceHome(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="text-sm text-slate-400">{stanceHome}% — {stanceHome < 30 ? 'Not me' : stanceHome < 70 ? 'Sometimes' : 'Very much me'}</div>
          </div>
        </div>
      )}

      {currentStep === 'PROFILE_REVEAL' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">Your stance profile:</p>
          <div className="space-y-4">
            {[
              { stance: 'Vessel', score: stanceVessel, color: 'bg-teal-500' },
              { stance: 'Machine', score: stanceMachine, color: 'bg-emerald-500' },
              { stance: 'Construct', score: stanceConstruct, color: 'bg-amber-500' },
              { stance: 'Home', score: stanceHome, color: 'bg-rose-500' },
            ].map(({ stance, score, color }) => (
              <div key={stance}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{stance}</span>
                  <span>{score}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'PROFILE_INTERPRETATION' && (
        <div className="space-y-6">
          <h3 className="text-lg text-slate-100 font-serif">{profile.headline}</h3>
          <p className="text-sm text-slate-300">{profile.description}</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">Does this land?</p>
            <div className="flex gap-2 flex-wrap">
              {['resonates', 'curious', 'pushback'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => setProfileReaction(reaction as 'resonates' | 'curious' | 'pushback')}
                  className={`px-3 py-2 rounded text-xs font-medium transition ${
                    profileReaction === reaction
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {reaction === 'resonates' ? '✓ Resonates' : reaction === 'curious' ? '? Curious' : '✕ Push back'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'HIGHEST_COST' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>{highest.charAt(0).toUpperCase() + highest.slice(1)}</strong> is your dominant stance.
          </p>
          <p className="text-sm text-slate-200 bg-slate-700/50 p-3 rounded border border-slate-600">
            {profile.highestCost}
          </p>
        </div>
      )}

      {currentStep === 'LOWEST_CARRIES' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            <strong>{lowest.charAt(0).toUpperCase() + lowest.slice(1)}</strong> is your least resonant stance. Yet it carries a gift.
          </p>
          <p className="text-sm text-slate-200 bg-slate-700/50 p-3 rounded border border-slate-600 mb-4">
            {LOWEST_COST_RESPONSES[lowest]}
          </p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">How does this feel?</p>
            <div className="flex gap-2 flex-wrap">
              {['resonates', 'curious', 'pushback'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => setLowestStanceResponse(reaction)}
                  className={`px-3 py-2 rounded text-xs font-medium transition ${
                    lowestStanceResponse === reaction
                      ? 'bg-emerald-600 text-white'
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

      {currentStep === 'ABSENT_BODY' && (
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">{ABSENT_BODY_PANELS[absentSubStep].title}</h4>
            <p className="text-sm text-slate-300">{ABSENT_BODY_PANELS[absentSubStep].text}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setAbsentSubStep(Math.max(0, absentSubStep - 1))}
              disabled={absentSubStep === 0}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">{absentSubStep + 1} / 3</span>
            <button
              onClick={() => setAbsentSubStep(Math.min(2, absentSubStep + 1))}
              disabled={absentSubStep === 2}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">Reaction?</p>
            <div className="flex gap-2 flex-wrap">
              {['resonates', 'curious', 'pushback'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => setAbsentBodyReaction(reaction as 'resonates' | 'curious' | 'pushback')}
                  className={`px-3 py-2 rounded text-xs font-medium transition ${
                    absentBodyReaction === reaction
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {reaction === 'resonates' ? '✓ Resonates' : reaction === 'curious' ? '? Curious' : '✕ Push back'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'METAMODERN_BODY' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">
            Both paths have truth. Measure what you can. Sense what you cannot. Hold the oscillation.
          </p>
        </div>
      )}

      {currentStep === 'YOUR_EXAMPLE' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Bring one specific moment where you felt the tension between quantifying and sensing your body.</p>
          <textarea
            value={userExample}
            onChange={(e) => setUserExample(e.target.value)}
            placeholder="E.g., 'Running on the treadmill, watching the distance counter, but not feeling my breath...'"
            className="w-full h-24 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'AI_REFLECTION' && (
        <div className="space-y-6">
          {!aiReflection ? (
            <button
              onClick={handleAIReflection}
              disabled={isLoading || !userExample}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Reflecting...' : 'Generate Reflection'}
            </button>
          ) : (
            <>
              <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                <p className="text-sm text-slate-300">{aiReflection}</p>
                {aiTensionName && <p className="text-xs text-slate-400 mt-2 italic">"{aiTensionName}"</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">How does this land?</p>
                <div className="flex gap-2 flex-wrap">
                  {['resonates', 'curious', 'pushback'].map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => setAiReaction(reaction as 'resonates' | 'curious' | 'pushback')}
                      className={`px-3 py-2 rounded text-xs font-medium transition ${
                        aiReaction === reaction
                          ? 'bg-emerald-600 text-white'
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

      {currentStep === 'INTEGRAL_BODY' && (
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">{INTEGRAL_BODY_PANELS[integralSubStep].title}</h4>
            <p className="text-sm text-slate-300">{INTEGRAL_BODY_PANELS[integralSubStep].text}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setIntegralSubStep(Math.max(0, integralSubStep - 1))}
              disabled={integralSubStep === 0}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">{integralSubStep + 1} / 3</span>
            <button
              onClick={() => setIntegralSubStep(Math.min(2, integralSubStep + 1))}
              disabled={integralSubStep === 2}
              className="px-3 py-2 text-xs rounded bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentStep === 'BODY_LAYERS_ACCESS' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">Which layers of body do you most easily access?</p>
          <div className="space-y-3">
            {BODY_LAYERS_OPTIONS.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bodyLayersAccess.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBodyLayersAccess([...bodyLayersAccess, id]);
                    } else {
                      setBodyLayersAccess(bodyLayersAccess.filter(x => x !== id));
                    }
                  }}
                  className="accent-emerald-500"
                />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'INTEGRATION' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">One shift you notice about your relationship to your body:</p>
          <textarea
            value={shiftNote}
            onChange={(e) => setShiftNote(e.target.value)}
            placeholder="E.g., 'I'm measuring less and noticing more...'"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
        </div>
      )}

      {currentStep === 'PRACTICE' && (
        <div className="space-y-6">
          <p className="text-slate-200 text-sm">Suggested practice:</p>
          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
            <p className="text-sm text-slate-300">{profile.practice}</p>
          </div>
        </div>
      )}

      {currentStep === 'CLOSE' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">One open question you're sitting with:</p>
          <textarea
            value={openQuestion}
            onChange={(e) => setOpenQuestion(e.target.value)}
            placeholder="What are you still wondering?"
            className="w-full h-20 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 p-3"
          />
          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
          >
            Complete Session
          </button>
        </div>
      )}
    </WizardFrame>
  );
}
