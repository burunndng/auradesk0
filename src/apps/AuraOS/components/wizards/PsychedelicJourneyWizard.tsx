/**
 * Psychedelic Journey Wizard
 * 8-step wizard for psychedelic preparation and integration
 * Steps 1-4: Pre-Session Preparation
 * Steps 5-8: Post-Session Integration
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  AlertCircle,
  Check,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { WizardFrame } from '../shared/WizardFrame';
import { useSubscription } from '../../hooks/useSubscription';
import SafetyBanner from '../shared/SafetyBanner';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import {
  reflectAndRefineIntention,
  analyzeNarrative,
  synthesizeIntegration,
} from '../../services/aiService';
import { PsychedelicChatStep } from './PsychedelicChatStep';
import type {
  PsychedelicJourneySession,
  PsychedelicJourneySubstance,
  IntegratedInsight,
  CrisisLevel,
  PsychedelicChatMessage,
} from '../../types';

interface PsychedelicJourneyWizardProps {
  onClose: () => void;
  onSave: (session: PsychedelicJourneySession) => void;
  session?: Partial<PsychedelicJourneySession> | null;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
  mode?: 'prep' | 'integration'; // Which path: preparation only or integration only
}

type WizardPhase =
  | 'substance-context'
  | 'set'
  | 'setting-intentions'
  | 'surrender'
  | 'ready'
  | 'welcome-back'
  | 'narrative'
  | 'meaning-insights'
  | 'integration'
  | 'chat';

// Relative step numbers for prep mode (steps 1-6)
const PREP_PHASE_TO_STEP: Record<WizardPhase, number> = {
  'substance-context': 1,
  'set': 2,
  'setting-intentions': 3,
  'surrender': 4,
  'ready': 5,
  'chat': 6,
  'welcome-back': 0, // Not used in prep
  'narrative': 0,
  'meaning-insights': 0,
  'integration': 0,
};

// Relative step numbers for integration mode (steps 1-5)
const INTEGRATION_PHASE_TO_STEP: Record<WizardPhase, number> = {
  'welcome-back': 1,
  'narrative': 2,
  'meaning-insights': 3,
  'integration': 4,
  'chat': 5,
  'substance-context': 0, // Not used in integration
  'set': 0,
  'setting-intentions': 0,
  'surrender': 0,
  'ready': 0,
};

const EMOTION_PRESETS = [
  'Excited',
  'Nervous',
  'Calm',
  'Anxious',
  'Curious',
  'Grateful',
  'Apprehensive',
  'Open',
  'Resistant',
  'Hopeful',
  'Fearful',
  'Peaceful',
  'Overwhelmed',
  'Confused',
  'Joyful',
  'Sad',
  'Awe',
  'Love',
  'Grief',
  'Bliss',
  'Terror',
  'Dissolution',
  'Unity',
  'Emptiness',
];

const SUBSTANCE_OPTIONS: PsychedelicJourneySubstance[] = [
  'psilocybin',
  'lsd',
  'mdma',
  'ayahuasca',
  'dmt',
  'mescaline',
  'ketamine',
  'cannabis',
  'breathwork',
  'holotropic',
  'other',
];

const SUBSTANCE_LABELS: Record<PsychedelicJourneySubstance, string> = {
  psilocybin: 'Psilocybin (Magic Mushrooms)',
  lsd: 'LSD',
  mdma: 'MDMA (Molly/Ecstasy)',
  ayahuasca: 'Ayahuasca',
  dmt: 'DMT',
  mescaline: 'Mescaline (San Pedro/Peyote)',
  ketamine: 'Ketamine',
  cannabis: 'Cannabis',
  breathwork: 'Breathwork',
  holotropic: 'Holotropic Breathwork',
  other: 'Other',
};

const SAFETY_CHECKLIST_ITEMS: { id: string; label: string; required?: boolean }[] = [
  {
    id: 'sitter',
    label: 'I have a trusted sitter or guide present (or am in a clinical setting)',
    required: true,
  },
  {
    id: 'environment',
    label: 'My environment is safe, comfortable, and free from interruptions',
  },
  {
    id: 'schedule',
    label: 'I have cleared my schedule for the duration plus recovery time',
  },
  {
    id: 'medications',
    label: 'I have reviewed medication interactions (or consulted a provider)',
    required: true,
  },
  {
    id: 'hydration',
    label: 'I have water, light snacks, and comfort items available',
  },
  {
    id: 'emergency',
    label: 'Someone knows my plan and can be reached if needed',
    required: true,
  },
  {
    id: 'mindset',
    label: 'I feel emotionally stable enough to proceed',
  },
  {
    id: 'music',
    label: 'I have a playlist or sound environment prepared (optional)',
  },
];

const REQUIRED_SAFETY_IDS = SAFETY_CHECKLIST_ITEMS.filter(i => i.required).map(i => i.id);

// ============================================================================
// Session Guide Component (Printable)
// ============================================================================

const SessionGuide: React.FC<{ session: Partial<PsychedelicJourneySession> }> = ({
  session,
}) => {
  return (
    <div className="print:p-8 print:bg-white print:text-black print:text-base">
      <h1 className="text-2xl print:text-3xl font-serif font-bold mb-6">
        Psychedelic Journey Session Guide
      </h1>

      <div className="space-y-6 text-sm print:text-base">
        {/* Intention */}
        {session.refinedIntention && (
          <div>
            <h2 className="text-lg font-serif font-bold mb-2">Your Intention</h2>
            <p className="italic">{session.refinedIntention}</p>
          </div>
        )}

        {/* Setting */}
        {session.environment && (
          <div>
            <h2 className="text-lg font-serif font-bold mb-2">Your Setting</h2>
            <p>{session.environment}</p>
          </div>
        )}

        {/* Safety Checklist */}
        {session.safetyChecklist && (
          <div>
            <h2 className="text-lg font-serif font-bold mb-2">Safety Checklist</h2>
            <ul className="space-y-1">
              {SAFETY_CHECKLIST_ITEMS.map(
                item =>
                  session.safetyChecklist?.[item.id] && (
                    <li key={item.id} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{item.label}</span>
                    </li>
                  )
              )}
            </ul>
          </div>
        )}

        {/* Reflection */}
        {session.aiReflection && (
          <div>
            <h2 className="text-lg font-serif font-bold mb-2">Preparation Reflection</h2>
            <p>{session.aiReflection}</p>
          </div>
        )}

        {/* Substance info */}
        <div className="print:border-t pt-4">
          <h3 className="font-bold mb-2">Session Details</h3>
          <p>
            <strong>Substance:</strong> {SUBSTANCE_LABELS[session.substance as PsychedelicJourneySubstance] || session.substance}
          </p>
          {session.dosageDescription && (
            <p>
              <strong>Dosage:</strong> {session.dosageDescription}
            </p>
          )}
          {session.plannedDate && (
            <p>
              <strong>Planned Date:</strong> {new Date(session.plannedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 print:mt-12 text-xs print:text-sm text-gray-600 print:text-gray-800">
        <p>Generated by Aura Operating System</p>
        <p>{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// ============================================================================
// Main Wizard Component
// ============================================================================

export default function PsychedelicJourneyWizard({
  onClose,
  onSave,
  session: initialSession,
  insightContext,
  markInsightAsAddressed,
  mode = 'prep',
}: PsychedelicJourneyWizardProps) {
  const { isProOrAbove, isPremiumWizard } = useSubscription();
  const getInitialPhase = (): WizardPhase => {
    if (mode === 'integration') {
      return 'welcome-back'; // Start at integration
    }
    return 'substance-context'; // Start at prep
  };

  const totalSteps = mode === 'integration' ? 5 : 6;

  const [phase, setPhase] = useState<WizardPhase>(getInitialPhase());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');

  // Bug 1: Intention choice state
  const [showIntentionChoice, setShowIntentionChoice] = useState(false);
  const [pendingRefinedIntention, setPendingRefinedIntention] = useState('');
  const [intentionAccepted, setIntentionAccepted] = useState(false);
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [editedIntention, setEditedIntention] = useState('');

  // Surrender exercise state
  const [surrenderTimerDone, setSurrenderTimerDone] = useState(false);
  const [surrenderTimeLeft, setSurrenderTimeLeft] = useState(30);
  const [surrenderTimerActive, setSurrenderTimerActive] = useState(false);

  // Integration synthesis display state
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<{
    synthesis?: string;
    practices?: string[];
    concreteSteps?: string[];
    suggestedWizards?: string[];
  } | null>(null);

  const [session, setSession] = useState<Partial<PsychedelicJourneySession>>(() => {
    if (initialSession) return initialSession;
    return {
      id: `psychedelic-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'preparing',
      substance: 'psilocybin',
      currentEmotions: [],
      safetyChecklist: {},
      rawIntention: '',
    };
  });

  // Detect crisis in free-text fields
  useEffect(() => {
    const textFields = [
      session.concerns,
      session.mindState,
      session.narrative,
      session.challengingMoments,
    ]
      .filter(Boolean)
      .join(' ');

    if (textFields) {
      const detected = detectCrisisLevel(textFields);
      setCrisisLevel(detected);
    }
  }, [session.concerns, session.mindState, session.narrative, session.challengingMoments]);

  // Surrender breathing timer countdown
  useEffect(() => {
    if (!surrenderTimerActive || surrenderTimerDone) return;
    if (surrenderTimeLeft <= 0) {
      setSurrenderTimerDone(true);
      return;
    }
    const timer = setTimeout(() => setSurrenderTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [surrenderTimerActive, surrenderTimeLeft, surrenderTimerDone]);

  // Use relative step mapping based on mode
  const PHASE_TO_STEP = mode === 'integration' ? INTEGRATION_PHASE_TO_STEP : PREP_PHASE_TO_STEP;
  const currentStep = PHASE_TO_STEP[phase];

  const handleNext = async () => {
    setError(null);

    switch (phase) {
      case 'substance-context':
        if (!session.substance || !session.previousExperience) {
          setError('Please select substance and experience level');
          return;
        }
        setSession(prev => ({ ...prev, status: 'preparing' }));
        setPhase('set');
        break;

      case 'set':
        if (!session.currentEmotions?.length || !session.mindState || !session.concerns) {
          setError('Please complete all fields');
          return;
        }
        setIsLoading(true);
        try {
          const result = await reflectAndRefineIntention(session);
          setSession(prev => ({
            ...prev,
            aiReflection: result.reflection,
            rawIntention: prev.rawIntention || '',
          }));
          // Bug 1: Save refined intention and show choice UI
          if (result.refinedIntention) {
            setPendingRefinedIntention(result.refinedIntention);
            setShowIntentionChoice(true);
            setIntentionAccepted(false);
          }
          setPhase('setting-intentions');
        } catch (err) {
          console.error('Error getting reflection:', err);
          setPhase('setting-intentions');
        } finally {
          setIsLoading(false);
        }
        break;

      case 'setting-intentions':
        if (!session.environment || !session.companions || !session.rawIntention) {
          setError('Please complete all fields');
          return;
        }
        // Bug 1: Block until intention choice is resolved
        if (showIntentionChoice && !intentionAccepted) {
          setError('Please accept or refine your intention before proceeding');
          return;
        }
        // Bug 5: Require all 3 essential safety items
        {
          const checklist = session.safetyChecklist || {};
          const missingRequired = REQUIRED_SAFETY_IDS.some(id => !checklist[id]);
          if (missingRequired) {
            setError('Please confirm the three essential safety items before proceeding.');
            return;
          }
        }
        setPhase('surrender');
        break;

      case 'surrender':
        if (!surrenderTimerDone && !session.surrenderReflection) {
          // Timer hasn't completed and no reflection yet — user must wait or skip
        }
        setPhase('ready');
        break;

      case 'ready':
        setSession(prev => ({
          ...prev,
          status: 'prepared',
          prepCompletedAt: new Date().toISOString(),
        }));
        setPhase('chat');
        break;

      case 'welcome-back':
        if (!session.overallTone) {
          setError('Please select your overall tone');
          return;
        }
        setPhase('narrative');
        break;

      case 'narrative':
        if (!session.narrative) {
          setError('Please describe your experience');
          return;
        }
        setIsLoading(true);
        try {
          const result = await analyzeNarrative(session);
          setSession(prev => ({
            ...prev,
            aiThemes: result.themes,
            quadrantMapping: result.quadrantMapping,
            connectionToIntention: result.connectionToIntention,
          }));
          setPhase('meaning-insights');
        } catch (err) {
          console.error('Error analyzing narrative:', err);
          setPhase('meaning-insights');
        } finally {
          setIsLoading(false);
        }
        break;

      case 'meaning-insights':
        setPhase('integration');
        break;

      case 'integration':
        // Bug 4: Run synthesis before moving to chat
        if (!synthesisResult && !synthesisLoading) {
          setSynthesisLoading(true);
          try {
            const result = await synthesizeIntegration(session);
            const sr = {
              synthesis: result.synthesis,
              practices: result.practices,
              concreteSteps: result.concreteSteps,
              suggestedWizards: result.suggestedWizards,
            };
            setSynthesisResult(sr);
            setSession(prev => ({
              ...prev,
              aiSynthesis: result.synthesis,
              practices: result.practices || [],
              suggestedFollowUpWizards: result.suggestedWizards || [],
            }));
          } catch (err) {
            console.error('Error synthesizing:', err);
            setSynthesisResult({ synthesis: 'Your journey revealed meaningful patterns worth continued exploration.' });
          } finally {
            setSynthesisLoading(false);
          }
          return; // Don't advance — show synthesis inline first
        }
        setPhase('chat');
        break;

      case 'chat':
        // This case is handled by handleChatFinish, not handleNext
        break;
    }
  };

  const handleChatFinish = async (messages: PsychedelicChatMessage[], skipped: boolean, chatSummary?: string) => {
    const effectiveMode = mode || 'prep';

    if (effectiveMode === 'integration') {
      // Integration mode - run synthesis then save
      setIsLoading(true);
      try {
        const result = await synthesizeIntegration(session);
        const completedSession: PsychedelicJourneySession = {
          id: session.id || `psychedelic-${Date.now()}`,
          date: session.date || new Date().toISOString(),
          status: 'complete',
          substance: session.substance as PsychedelicJourneySubstance,
          substanceOther: session.substanceOther,
          dosageDescription: session.dosageDescription,
          plannedDate: session.plannedDate,
          previousExperience: session.previousExperience,
          currentEmotions: session.currentEmotions || [],
          mindState: session.mindState || '',
          bodyState: session.bodyState,
          concerns: session.concerns || '',
          aiReflection: session.aiReflection,
          environment: session.environment || '',
          companions: session.companions,
          companionDetails: session.companionDetails,
          safetyChecklist: session.safetyChecklist || {},
          rawIntention: session.rawIntention || '',
          refinedIntention: session.refinedIntention,
          useRefinedIntention: session.useRefinedIntention,
          sessionGuideGenerated: false,
          prepCompletedAt: session.prepCompletedAt,
          integrationStartedAt: session.integrationStartedAt || new Date().toISOString(),
          daysSinceSession: session.daysSinceSession,
          currentPostEmotions: session.currentPostEmotions,
          overallTone: session.overallTone,
          narrative: session.narrative,
          keyMoments: session.keyMoments,
          emotionsExperienced: session.emotionsExperienced,
          peakDescription: session.peakDescription,
          challengingMoments: session.challengingMoments,
          aiThemes: result.themes || session.aiThemes,
          quadrantMapping: result.quadrantMapping || session.quadrantMapping,
          connectionToIntention: result.connectionToIntention || session.connectionToIntention,
          userInsights: session.userInsights,
          practices: result.practices || [],
          concreteSteps: result.concreteSteps || session.concreteSteps,
          aiSynthesis: result.synthesis || '',
          suggestedFollowUpWizards: result.suggestedWizards || [],
          followUpDate: session.followUpDate,
          completedAt: new Date().toISOString(),
          chatMessages: messages,
          chatSkipped: skipped,
          chatSummary: chatSummary,
          currentIntegrationBodyState: session.currentIntegrationBodyState,
          surrenderReflection: session.surrenderReflection,
          crisisLevel: session.crisisLevel || crisisLevel || 'none',
        };
        onSave(completedSession);
        if (insightContext?.id && markInsightAsAddressed) {
          markInsightAsAddressed(insightContext.id, 'Psychedelic Journey', completedSession.id);
        }
      } catch (err) {
        console.error('Error synthesizing:', err);
        // Save without synthesis on error
        onSave({
          ...session,
          id: session.id || `psychedelic-${Date.now()}`,
          date: session.date || new Date().toISOString(),
          status: 'complete',
          substance: session.substance as PsychedelicJourneySubstance,
          completedAt: new Date().toISOString(),
          chatMessages: messages,
          chatSkipped: skipped,
          chatSummary: chatSummary,
          aiSynthesis: 'Your journey revealed meaningful patterns worth continued exploration.',
          practices: [],
          suggestedFollowUpWizards: [],
          crisisLevel: session.crisisLevel || crisisLevel || 'none',
        } as PsychedelicJourneySession);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Prep mode - save as prepared
      onSave({
        ...session,
        id: session.id || `psychedelic-${Date.now()}`,
        date: session.date || new Date().toISOString(),
        status: 'prepared',
        prepCompletedAt: session.prepCompletedAt || new Date().toISOString(),
        chatMessages: messages,
        chatSkipped: skipped,
        chatSummary: chatSummary,
      } as PsychedelicJourneySession);
    }
  };

  const handleBack = () => {
    switch (phase) {
      case 'set':
        setPhase('substance-context');
        break;
      case 'setting-intentions':
        setPhase('set');
        break;
      case 'surrender':
        setPhase('setting-intentions');
        break;
      case 'ready':
        setPhase('surrender');
        break;
      case 'chat':
        // Back from chat goes to the last wizard step
        if (mode === 'integration') {
          setPhase('integration');
        } else {
          setPhase('ready');
        }
        break;
      case 'welcome-back':
        onClose();
        break;
      case 'narrative':
        setPhase('welcome-back');
        break;
      case 'meaning-insights':
        setPhase('narrative');
        break;
      case 'integration':
        setPhase('meaning-insights');
        break;
      case 'substance-context':
      default:
        onClose();
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStep = () => {
    switch (phase) {
      case 'substance-context':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Substance & Context</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Begin your preparation journey. Which substance will you be working with?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Substance</label>
              <select
                value={session.substance || 'psilocybin'}
                onChange={e =>
                  setSession(prev => ({
                    ...prev,
                    substance: e.target.value as PsychedelicJourneySubstance,
                  }))
                }
                className="w-full bg-stone-900/60 border border-violet-500/40 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {SUBSTANCE_OPTIONS.map(sub => (
                  <option key={sub} value={sub}>
                    {SUBSTANCE_LABELS[sub]}
                  </option>
                ))}
              </select>
            </div>

            {session.substance === 'other' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Please specify
                </label>
                <input
                  type="text"
                  value={session.substanceOther || ''}
                  onChange={e =>
                    setSession(prev => ({ ...prev, substanceOther: e.target.value }))
                  }
                  placeholder="e.g., Ibogaine, ketamine-assisted therapy"
                  className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Dosage (optional)</label>
              <input
                type="text"
                value={session.dosageDescription || ''}
                onChange={e =>
                  setSession(prev => ({ ...prev, dosageDescription: e.target.value }))
                }
                placeholder="e.g., 3g dried, 1 tab, 75mg"
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                When are you planning this? (optional)
              </label>
              <input
                type="date"
                value={session.plannedDate ? session.plannedDate.split('T')[0] : ''}
                onChange={e =>
                  setSession(prev => ({
                    ...prev,
                    plannedDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                  }))
                }
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Previous experience with this substance
              </label>
              <div className="space-y-2">
                {(['none', 'few', 'moderate', 'extensive'] as const).map(level => (
                  <label key={level} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value={level}
                      checked={session.previousExperience === level}
                      onChange={e =>
                        setSession(prev => ({
                          ...prev,
                          previousExperience: e.target.value as any,
                        }))
                      }
                      className="mr-2 accent-violet-500"
                    />
                    <span className="text-xs sm:text-sm capitalize text-stone-300">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'set':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Set: Inner Landscape</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              How are you feeling right now? What's your inner landscape?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                What are you feeling right now? (select all that apply)
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {EMOTION_PRESETS.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => {
                      setSession(prev => {
                        const current = prev.currentEmotions || [];
                        if (current.includes(emotion)) {
                          return {
                            ...prev,
                            currentEmotions: current.filter(e => e !== emotion),
                          };
                        }
                        return { ...prev, currentEmotions: [...current, emotion] };
                      });
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-colors ${
                      session.currentEmotions?.includes(emotion)
                        ? 'bg-violet-600 text-white border border-violet-500'
                        : 'bg-stone-800/60 text-stone-300 border border-stone-700/60 hover:border-violet-500/40'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Describe your mind state
              </label>
              <textarea
                value={session.mindState || ''}
                onChange={e => setSession(prev => ({ ...prev, mindState: e.target.value }))}
                placeholder="My mind feels..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Body state (optional)
              </label>
              <textarea
                value={session.bodyState || ''}
                onChange={e => setSession(prev => ({ ...prev, bodyState: e.target.value }))}
                placeholder="My body feels..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Any concerns or fears about the experience?
              </label>
              <textarea
                value={session.concerns || ''}
                onChange={e => setSession(prev => ({ ...prev, concerns: e.target.value }))}
                placeholder="I'm worried about..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
          </div>
        );

      case 'setting-intentions':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Setting & Intentions</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Describe your physical setting and clarify your intention for this journey.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Describe your setting and environment
              </label>
              <textarea
                value={session.environment || ''}
                onChange={e => setSession(prev => ({ ...prev, environment: e.target.value }))}
                placeholder="I'll be in... (location, lighting, music, atmosphere)"
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Who will be with you?
              </label>
              <div className="space-y-2">
                {(['alone', 'sitter', 'guide', 'group', 'therapist', 'other'] as const).map(c => (
                  <label key={c} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="companion"
                      value={c}
                      checked={session.companions === c}
                      onChange={e => setSession(prev => ({ ...prev, companions: e.target.value as any }))}
                      className="mr-2 accent-violet-500"
                    />
                    <span className="text-xs sm:text-sm capitalize text-stone-300">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {session.companions && session.companions !== 'alone' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Tell us about them (optional)
                </label>
                <input
                  type="text"
                  value={session.companionDetails || ''}
                  onChange={e =>
                    setSession(prev => ({ ...prev, companionDetails: e.target.value }))
                  }
                  placeholder="e.g., trained guide, experienced friend, therapist"
                  className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Safety Checklist
              </label>
              <p className="text-xs text-amber-400 mb-2">* Required items must be confirmed before proceeding.</p>
              <div className="space-y-2">
                {SAFETY_CHECKLIST_ITEMS.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start cursor-pointer min-h-[44px] rounded-xl p-2 ${
                      item.required ? 'border border-amber-500/30 bg-amber-950/10' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={session.safetyChecklist?.[item.id] || false}
                      onChange={e =>
                        setSession(prev => ({
                          ...prev,
                          safetyChecklist: {
                            ...(prev.safetyChecklist || {}),
                            [item.id]: e.target.checked,
                          },
                        }))
                      }
                      className="mt-1 mr-2 w-4 h-4 accent-violet-500"
                    />
                    <span className="text-xs sm:text-sm text-stone-300">
                      {item.required && <span className="text-amber-400 mr-1">*</span>}
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                What is your intention for this journey?
              </label>
              <textarea
                value={session.rawIntention || ''}
                onChange={e => setSession(prev => ({ ...prev, rawIntention: e.target.value }))}
                placeholder="My intention is to..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              {session.aiReflection && (
                <div className="mt-2 p-2 sm:p-3 bg-violet-950/20 border border-violet-500/30 rounded-xl text-xs sm:text-sm">
                  <p className="font-semibold mb-1 text-violet-300">Reflection on your state:</p>
                  <p className="text-stone-300">{session.aiReflection}</p>
                </div>
              )}

              {/* Bug 1: Intention choice UI */}
              {showIntentionChoice && pendingRefinedIntention && !intentionAccepted && (
                <div className="mt-3 p-3 bg-violet-950/30 border border-violet-500/40 rounded-xl space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-violet-300">AI-refined intention:</p>
                  <p className="text-sm text-stone-200 italic">"{pendingRefinedIntention}"</p>
                  {!isEditingIntention ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSession(prev => ({
                            ...prev,
                            refinedIntention: pendingRefinedIntention,
                            useRefinedIntention: true,
                          }));
                          setIntentionAccepted(true);
                        }}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm rounded-lg transition min-h-[36px]"
                      >
                        This resonates
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingIntention(true);
                          setEditedIntention(pendingRefinedIntention);
                        }}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm rounded-lg transition min-h-[36px]"
                      >
                        Let me refine it
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editedIntention}
                        onChange={e => setEditedIntention(e.target.value)}
                        className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[60px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                      <button
                        onClick={() => {
                          setSession(prev => ({
                            ...prev,
                            refinedIntention: editedIntention,
                            useRefinedIntention: true,
                          }));
                          setIntentionAccepted(true);
                          setIsEditingIntention(false);
                        }}
                        disabled={!editedIntention.trim()}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm rounded-lg transition min-h-[36px]"
                      >
                        Confirm intention
                      </button>
                    </div>
                  )}
                </div>
              )}
              {intentionAccepted && session.refinedIntention && (
                <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-xs sm:text-sm text-emerald-300">
                  Intention set: "{session.refinedIntention}"
                </div>
              )}
            </div>

            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
          </div>
        );

      case 'surrender':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Surrender</h2>

            {!surrenderTimerDone ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                {/* Breathing circle with countdown */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                  {/* Outer ambient glow */}
                  <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl" />
                  {/* Countdown ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="rgba(109, 40, 217, 0.2)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.8)"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (surrenderTimeLeft / 30)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  {/* Pulsing circle */}
                  <div
                    className="absolute inset-4 rounded-full bg-indigo-950/80 border border-violet-500/30"
                    style={{
                      animation: surrenderTimerActive ? 'breathe 10s ease-in-out infinite' : 'none',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-serif text-violet-300">{surrenderTimeLeft}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-stone-400 text-center max-w-sm font-serif italic">
                  Breathe. Let go of control for a moment.
                </p>

                {!surrenderTimerActive && (
                  <button
                    onClick={() => setSurrenderTimerActive(true)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition min-h-[44px]"
                  >
                    Begin
                  </button>
                )}

                <button
                  onClick={() => setSurrenderTimerDone(true)}
                  className="text-xs text-stone-600 hover:text-stone-400 transition"
                >
                  Skip this
                </button>

                <style>{`
                  @keyframes breathe {
                    0%, 100% { transform: scale(0.85); opacity: 0.6; }
                    40% { transform: scale(1.15); opacity: 1; }
                  }
                `}</style>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-stone-400">
                  What does surrender mean to you in the context of this upcoming experience?
                </p>
                <textarea
                  value={session.surrenderReflection || ''}
                  onChange={e => setSession(prev => ({ ...prev, surrenderReflection: e.target.value }))}
                  placeholder="Surrender means..."
                  className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            )}
          </div>
        );

      case 'ready':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Ready for Your Journey</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Review your preparation and generate your session guide.
            </p>

            <div className="bg-gradient-to-br from-violet-950/20 to-stone-900/60 border border-violet-500/30 rounded-xl p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
              <div className="text-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-0.5">Substance</span>
                {SUBSTANCE_LABELS[session.substance as PsychedelicJourneySubstance]}
              </div>
              {session.dosageDescription && (
                <div className="text-stone-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-0.5">Dosage</span>
                  {session.dosageDescription}
                </div>
              )}
              <div className="text-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-0.5">Intention</span>
                {session.refinedIntention || session.rawIntention}
              </div>
              <div className="text-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-0.5">Setting</span>
                {session.environment}
              </div>
              <div className="text-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-0.5">Companions</span>
                {session.companions}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Session Guide</label>
              <p className="text-xs text-stone-500 mb-2">
                Print this guide to take with you or review during your preparation.
              </p>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] justify-center"
              >
                <Printer className="w-4 h-4" />
                Print Session Guide
              </button>

              <div className="hidden print:block">
                <SessionGuide session={session} />
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 sm:p-3 text-xs sm:text-sm">
              <p className="mb-1 text-stone-200">
                <strong>Next step:</strong> Have your session, then return to complete the
                integration phase.
              </p>
              <p className="text-emerald-400">You can close this wizard and come back anytime.</p>
            </div>
          </div>
        );

      case 'welcome-back':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Welcome to the integration phase. Let's process and integrate your experience.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                How are you feeling overall?
              </label>
              <div className="space-y-2">
                {(['grateful', 'confused', 'overwhelmed', 'peaceful', 'mixed', 'difficult'] as const).map(
                  tone => (
                    <label key={tone} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tone"
                        value={tone}
                        checked={session.overallTone === tone}
                        onChange={e =>
                          setSession(prev => ({
                            ...prev,
                            overallTone: e.target.value as any,
                          }))
                        }
                        className="mr-2 accent-violet-500"
                      />
                      <span className="text-xs sm:text-sm capitalize text-stone-300">{tone}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                How many days since your session?
              </label>
              <input
                type="number"
                value={session.daysSinceSession || ''}
                onChange={e =>
                  setSession(prev => ({
                    ...prev,
                    daysSinceSession: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="e.g., 1"
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                What emotions are you experiencing now?
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {EMOTION_PRESETS.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => {
                      setSession(prev => {
                        const current = prev.currentPostEmotions || [];
                        if (current.includes(emotion)) {
                          return {
                            ...prev,
                            currentPostEmotions: current.filter(e => e !== emotion),
                          };
                        }
                        return { ...prev, currentPostEmotions: [...current, emotion] };
                      });
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-colors ${
                      session.currentPostEmotions?.includes(emotion)
                        ? 'bg-rose-600/80 text-white border border-rose-500'
                        : 'bg-stone-800/60 text-stone-300 border border-stone-700/60 hover:border-rose-500/40'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {/* Bug 3: Body check-in for integration */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                How does your body feel right now?
              </label>
              <textarea
                value={session.currentIntegrationBodyState || ''}
                onChange={e => setSession(prev => ({ ...prev, currentIntegrationBodyState: e.target.value }))}
                placeholder="My body feels..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        );

      case 'narrative':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">What Happened?</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Tell the story of your journey. What unfolded?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Describe your experience
              </label>
              <textarea
                value={session.narrative || ''}
                onChange={e => setSession(prev => ({ ...prev, narrative: e.target.value }))}
                placeholder="I took the substance and... (describe the journey)"
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[120px] sm:min-h-[150px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Key moments (up to 5)
              </label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <input
                    key={i}
                    type="text"
                    value={session.keyMoments?.[i] || ''}
                    onChange={e => {
                      setSession(prev => {
                        const moments = [...(prev.keyMoments || [])];
                        moments[i] = e.target.value;
                        return { ...prev, keyMoments: moments.filter(m => m) };
                      });
                    }}
                    placeholder={`Moment ${i + 1}...`}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Peak experience (if any)
              </label>
              <textarea
                value={session.peakDescription || ''}
                onChange={e => setSession(prev => ({ ...prev, peakDescription: e.target.value }))}
                placeholder="The most intense or meaningful moment was..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Challenging moments (if any)
              </label>
              <textarea
                value={session.challengingMoments || ''}
                onChange={e =>
                  setSession(prev => ({ ...prev, challengingMoments: e.target.value }))
                }
                placeholder="Things that were difficult..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Emotions during the experience
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {EMOTION_PRESETS.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => {
                      setSession(prev => {
                        const current = prev.emotionsExperienced || [];
                        if (current.includes(emotion)) {
                          return {
                            ...prev,
                            emotionsExperienced: current.filter(e => e !== emotion),
                          };
                        }
                        return { ...prev, emotionsExperienced: [...current, emotion] };
                      });
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-colors ${
                      session.emotionsExperienced?.includes(emotion)
                        ? 'bg-fuchsia-700/80 text-white border border-fuchsia-500'
                        : 'bg-stone-800/60 text-stone-300 border border-stone-700/60 hover:border-fuchsia-500/40'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
          </div>
        );

      case 'meaning-insights':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Meaning & Insights</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              What does your experience mean to you? What have you learned?
            </p>

            {session.aiThemes && session.aiThemes.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Themes we detected:
                </label>
                <div className="bg-gradient-to-br from-violet-950/20 to-stone-900/60 border border-violet-500/30 rounded-xl p-2 sm:p-3">
                  <ul className="space-y-1 text-xs sm:text-sm text-stone-300">
                    {session.aiThemes.map((theme, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-violet-400">·</span>
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {session.quadrantMapping && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Insights across quadrants:
                </label>
                <div className="space-y-2 text-xs sm:text-sm">
                  {session.quadrantMapping.body && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 sm:p-3">
                      <strong className="text-emerald-400">Body:</strong>{' '}
                      <span className="text-stone-300">{session.quadrantMapping.body}</span>
                    </div>
                  )}
                  {session.quadrantMapping.mind && (
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2 sm:p-3">
                      <strong className="text-amber-400">Mind:</strong>{' '}
                      <span className="text-stone-300">{session.quadrantMapping.mind}</span>
                    </div>
                  )}
                  {session.quadrantMapping.spirit && (
                    <div className="bg-teal-950/30 border border-teal-500/30 rounded-xl p-2 sm:p-3">
                      <strong className="text-teal-400">Spirit:</strong>{' '}
                      <span className="text-stone-300">{session.quadrantMapping.spirit}</span>
                    </div>
                  )}
                  {session.quadrantMapping.shadow && (
                    <div className="bg-violet-950/30 border border-violet-500/30 rounded-xl p-2 sm:p-3">
                      <strong className="text-violet-400">Shadow:</strong>{' '}
                      <span className="text-stone-300">{session.quadrantMapping.shadow}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                What do you make of all this? What's your meaning?
              </label>
              <textarea
                value={session.userInsights || ''}
                onChange={e => setSession(prev => ({ ...prev, userInsights: e.target.value }))}
                placeholder="What I'm learning from this experience..."
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {session.connectionToIntention && (
              <div className="bg-gradient-to-br from-violet-950/20 to-stone-900/60 border border-violet-500/30 rounded-xl p-2 sm:p-3 text-xs sm:text-sm">
                <p className="font-semibold mb-1 text-violet-300">Connection to your original intention:</p>
                <p className="text-stone-300">{session.connectionToIntention}</p>
              </div>
            )}
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-light text-stone-100">Integration & Actions</h2>
            <p className="text-xs sm:text-sm text-stone-400">
              How will you integrate this experience into your life?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                Concrete actions you'll take
              </label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <input
                    key={i}
                    type="text"
                    value={session.concreteSteps?.[i] || ''}
                    onChange={e => {
                      setSession(prev => {
                        const steps = [...(prev.concreteSteps || [])];
                        steps[i] = e.target.value;
                        return { ...prev, concreteSteps: steps.filter(s => s) };
                      });
                    }}
                    placeholder={`Action ${i + 1}...`}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                When will you revisit this work? (optional)
              </label>
              <input
                type="date"
                value={session.followUpDate ? session.followUpDate.split('T')[0] : ''}
                onChange={e =>
                  setSession(prev => ({
                    ...prev,
                    followUpDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                  }))
                }
                className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Bug 4: Synthesis display */}
            {synthesisLoading && (
              <div className="bg-violet-950/30 border border-violet-500/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-violet-300">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2">Synthesizing your integration...</span>
                </div>
              </div>
            )}

            {synthesisResult && (
              <div className="space-y-3">
                {synthesisResult.synthesis && (
                  <div className="bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-500/30 rounded-xl p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-serif font-light text-violet-300 mb-2">Integration Synthesis</h3>
                    <p className="text-xs sm:text-sm text-stone-200 whitespace-pre-wrap">{synthesisResult.synthesis}</p>
                  </div>
                )}

                {synthesisResult.practices && synthesisResult.practices.length > 0 && (
                  <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Suggested Practices</h4>
                    <ul className="space-y-1">
                      {synthesisResult.practices.map((p, i) => (
                        <li key={i} className="text-xs sm:text-sm text-stone-300 flex items-start">
                          <span className="mr-2 text-violet-400">·</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {synthesisResult.concreteSteps && synthesisResult.concreteSteps.length > 0 && (
                  <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Concrete Steps</h4>
                    <ul className="space-y-1">
                      {synthesisResult.concreteSteps.map((s, i) => (
                        <li key={i} className="text-xs sm:text-sm text-stone-300 flex items-start">
                          <span className="mr-2 text-emerald-400">·</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {synthesisResult.suggestedWizards && synthesisResult.suggestedWizards.length > 0 && (
                  <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Continue Your Work</h4>
                    <div className="flex flex-wrap gap-2">
                      {synthesisResult.suggestedWizards.map((w, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-violet-600/20 border border-violet-500/30 rounded-lg text-xs text-violet-300"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 sm:p-3 text-xs sm:text-sm">
                  <p className="text-emerald-400">
                    Click "Next" to continue to the conversation step.
                  </p>
                </div>
              </div>
            )}

            {!synthesisResult && !synthesisLoading && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 sm:p-3 text-xs sm:text-sm">
                <p className="mb-1 text-stone-200">
                  <strong>You're ready to complete your journey!</strong>
                </p>
                <p className="text-emerald-400">
                  Click "Next" to generate your integration synthesis.
                </p>
              </div>
            )}
          </div>
        );

      case 'chat':
        return (
          <PsychedelicChatStep
            session={session}
            mode={mode || 'prep'}
            onFinish={handleChatFinish}
            onBack={() => {
              if (mode === 'integration') {
                setPhase('integration');
              } else {
                setPhase('ready');
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <WizardFrame
      title={mode === 'integration' ? 'Psychedelic Integration' : 'Psychedelic Prep'}
      currentStep={currentStep}
      totalSteps={totalSteps}
      accentColor="purple"
      premiumGated={!isProOrAbove && isPremiumWizard('psychedelic-journey')}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      showBackButton={phase !== 'substance-context'}
      nextButtonText={
        phase === 'chat'
          ? null // PsychedelicChatStep handles its own buttons
          : phase === 'integration' || phase === 'ready'
            ? 'Next'
            : 'Next'
      }
    >
      {/* Atmospheric glow — consciousness / inner space */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>
      {renderStep()}
    </WizardFrame>
  );
}
