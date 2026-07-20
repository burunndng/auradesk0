/**
 * Shadow Journaling Wizard
 * Migrated to WizardFrame for UI consistency
 * 6-step wizard: Welcome → Choose Exercise → Form → AI Reflection → Closing → Complete
 */

import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { BookOpen, Heart, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import NigredoIcon from '../visualizations/SacredGeometryIcons/NigredoIcon';
import { SHADOW_EXERCISES } from '../../services/shadowExercises';
import { getShadowReflection, normalizeUserEntry } from '../../services/shadowGuideService';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import { WizardFrame } from '../shared/WizardFrame';
import type {
  ShadowSessionResult,
  ShadowExerciseId,
  ShadowExerciseTemplate,
  CrisisLevel,
  IntegratedInsight,
  ShadowJournalingDraft
} from '../../types';

interface ShadowJournalingWizardProps {
  onClose: () => void;
  onComplete: (session: ShadowSessionResult) => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

// Map phases to step numbers for progress tracking
const PHASE_TO_STEP: Record<string, number> = {
  'welcome': 1,
  'choose-exercise': 2,
  'exercise-form': 3,
  'reflection': 4,
  'closing': 5,
  'complete': 6
};

type WizardPhase = 'welcome' | 'choose-exercise' | 'exercise-form' | 'reflection' | 'closing';
const TOTAL_STEPS = 5;

const INITIAL_DRAFT: ShadowJournalingDraft = {
  phase: 'welcome',
  selectedExerciseId: null,
  userEntry: {},
  reflection: '',
  wordToCarry: '',
  selfCompassionStatement: '',
};

export default function ShadowJournalingWizard({
  onClose,
  onComplete,
  insightContext,
  markInsightAsAddressed,
}: ShadowJournalingWizardProps) {
  const { recordWizardSession } = useSubscription();

  // Draft persistence
  const [draft, updateDraft, , clearDraft] = useWizardDraft<ShadowJournalingDraft>(
    'aura-draft-shadow-journaling',
    INITIAL_DRAFT
  );

  const [phase, setPhase] = useState<WizardPhase>(draft.phase);
  const [selectedExercise, setSelectedExercise] = useState<ShadowExerciseTemplate | null>(
    draft.selectedExerciseId ? (SHADOW_EXERCISES[draft.selectedExerciseId as ShadowExerciseId] ?? null) : null
  );
  const [userEntry, setUserEntry] = useState<Record<string, string | number>>(draft.userEntry);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(insightContext?.id);

  // Reflection phase state
  const [reflection, setReflection] = useState<string>(draft.reflection);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [wordToCarry, setWordToCarry] = useState<string>(draft.wordToCarry);
  const [selfCompassionStatement, setSelfCompassionStatement] = useState<string>(draft.selfCompassionStatement);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext]);

  const currentStep = PHASE_TO_STEP[phase] || 1;

  const handleExerciseSelect = (exerciseId: ShadowExerciseId) => {
    const exercise = SHADOW_EXERCISES[exerciseId];
    setSelectedExercise(exercise);
    setPhase('exercise-form');
    updateDraft({ selectedExerciseId: exerciseId, phase: 'exercise-form' });
  };

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setUserEntry(prev => {
      const next = { ...prev, [fieldId]: value };
      updateDraft({ userEntry: next });
      return next;
    });
  };

  const validateForm = (): boolean => {
    if (!selectedExercise) return false;

    for (const field of selectedExercise.fields) {
      if (field.required) {
        const value = userEntry[field.id];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmitExercise = async () => {
    if (!selectedExercise || !validateForm()) {
      setError('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Normalize entry for AI
      const normalizedEntry = normalizeUserEntry(selectedExercise.id, userEntry);

      // Detect crisis level
      const detected = detectCrisisLevel(normalizedEntry);
      setCrisisLevel(detected);

      // Get AI reflection
      const response = await getShadowReflection({
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        exercisePhase: selectedExercise.phase,
        instructions: selectedExercise.longInstructions,
        userEntry: normalizedEntry
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate reflection');
      }

      setReflection(response.reflection);
      setPhase('reflection');
      updateDraft({ reflection: response.reflection, phase: 'reflection' });
    } catch (err) {
      console.error('[ShadowJournaling] Error submitting exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate reflection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedExercise) return;

    const normalizedEntry = normalizeUserEntry(selectedExercise.id, userEntry);

    const session: ShadowSessionResult = {
      id: `shadow-${Date.now()}`,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      exercisePhase: selectedExercise.phase,
      createdAt: new Date().toISOString(),
      userEntry,
      normalizedEntry,
      guideReflection: reflection,
      crisisLevel,
      wordToCarry: wordToCarry.trim() || undefined,
      selfCompassionStatement: selfCompassionStatement.trim() || undefined,
      linkedInsightId
    };

    void recordWizardSession();
    clearDraft();

    // Generate insight from session (graceful degradation if it fails)
    try {
      await generateInsightFromSession({
        wizardType: 'Shadow Journaling',
        sessionId: session.id,
        sessionName: `${selectedExercise.name} (${selectedExercise.phase})`,
        sessionReport: `Exercise: ${selectedExercise.name}\n\nUser Entry:\n${normalizedEntry}\n\nGuide Reflection:\n${reflection}`,
        sessionSummary: `Shadow journaling session: ${selectedExercise.name} phase`,
        userId: '', // Anonymous users supported
        availablePractices: [],
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });
    } catch (err) {
      console.error('[ShadowJournalingWizard] Insight generation failed:', err);
      // Continue regardless — insight generation is non-blocking
    }

    onComplete(session);

    // Mark Intelligence Hub insight as addressed
    if (linkedInsightId && markInsightAsAddressed) {
      markInsightAsAddressed(linkedInsightId, 'Shadow Journaling', session.id);
    }

    onClose();
  };

  const downloadTranscript = () => {
    if (!selectedExercise) return;

    const normalizedEntry = normalizeUserEntry(selectedExercise.id, userEntry);
    const transcript = `Shadow Journaling Session
${new Date().toLocaleDateString()}

Exercise: ${selectedExercise.name} (${selectedExercise.phase})
─────────────────────────────────────────────

YOUR ENTRY:

${normalizedEntry}

─────────────────────────────────────────────

GUIDE REFLECTION:

${reflection}

─────────────────────────────────────────────

${wordToCarry ? `WORD TO CARRY: ${wordToCarry}\n\n` : ''}${selfCompassionStatement ? `SELF-COMPASSION STATEMENT: ${selfCompassionStatement}` : ''}`;

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadow-journal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Navigation handlers for WizardFrame
  const handleBack = () => {
    switch (phase) {
      case 'choose-exercise':
        setPhase('welcome');
        updateDraft({ phase: 'welcome' });
        break;
      case 'exercise-form':
        setPhase('choose-exercise');
        setSelectedExercise(null);
        setUserEntry({});
        updateDraft({ phase: 'choose-exercise', selectedExerciseId: null, userEntry: {} });
        break;
      case 'reflection':
        setPhase('exercise-form');
        updateDraft({ phase: 'exercise-form' });
        break;
      case 'closing':
        setPhase('reflection');
        updateDraft({ phase: 'reflection' });
        break;
      default:
        break;
    }
  };

  const handleNext = () => {
    switch (phase) {
      case 'welcome':
        setPhase('choose-exercise');
        updateDraft({ phase: 'choose-exercise' });
        break;
      case 'choose-exercise':
        // This phase uses cards, not the Next button
        break;
      case 'exercise-form':
        handleSubmitExercise();
        break;
      case 'reflection':
        setPhase('closing');
        updateDraft({ phase: 'closing' });
        break;
      case 'closing':
        handleComplete();
        break;
      default:
        break;
    }
  };

  // Get step-specific button text
  const getNextButtonText = (): string => {
    switch (phase) {
      case 'welcome':
        return 'Begin';
      case 'exercise-form':
        return 'Submit & Get Reflection';
      case 'reflection':
        return 'Continue';
      case 'closing':
        return 'Complete Session';
      default:
        return 'Next';
    }
  };

  // Insight context banner for headerSlot
  const headerSlot = insightContext ? (
    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
      <p className="text-sm text-purple-200">
        <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
      </p>
    </div>
  ) : undefined;

  const renderContent = () => {
    switch (phase) {
      case 'welcome':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <NigredoIcon size={40} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Welcome to Shadow Journaling
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Shadow work is the practice of bringing unconscious patterns into awareness.
                These structured exercises help you explore projections, triggers, shame, and disowned qualities
                with the support of an AI guide that reflects back what it sees—without judgment.
              </p>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold text-slate-200">How it works:</h4>
              <ol className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Choose a structured exercise (6 available)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Complete the journaling prompts honestly</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>Receive an AI reflection that mirrors, questions, and returns agency</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                  <span>Choose a word to carry forward and a self-compassion statement</span>
                </li>
              </ol>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/40 rounded-lg p-4">
              <p className="text-amber-200 text-sm">
                <strong>Note:</strong> Shadow work can bring up difficult emotions. Go at your own pace.
                This is not therapy—it's a reflective tool. If you need clinical support, please reach out to a mental health professional.
              </p>
            </div>
          </div>
        );

      case 'choose-exercise':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-100">Choose an Exercise</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(SHADOW_EXERCISES).map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise.id)}
                  className="bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/60 rounded-lg p-5 text-left transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-100 group-hover:text-purple-300 transition">
                      {exercise.name}
                    </h4>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${exercise.phase === 'discovery' ? 'bg-purple-500/20 text-purple-300' : ''}
                      ${exercise.phase === 'excavation' ? 'bg-amber-500/20 text-amber-300' : ''}
                      ${exercise.phase === 'dialogue' ? 'bg-purple-500/20 text-purple-300' : ''}
                      ${exercise.phase === 'integration' ? 'bg-emerald-500/20 text-emerald-300' : ''}
                    `}>
                      {exercise.phase}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    {exercise.shortDescription}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{exercise.estimatedTime}</span>
                    <span>•</span>
                    <span className="capitalize">{exercise.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'exercise-form':
        return selectedExercise ? (
          <ExerciseForm
            exercise={selectedExercise}
            userEntry={userEntry}
            onFieldChange={handleFieldChange}
            error={error}
          />
        ) : null;

      case 'reflection':
        return selectedExercise ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {crisisLevel !== 'none' && (
              <SafetyBanner crisisLevel={crisisLevel} />
            )}

            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <NigredoIcon size={24} className="text-purple-400" />
                <h3 className="text-xl font-bold text-slate-100">Guide Reflection</h3>
              </div>

              <div className="prose prose-invert prose-slate max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {reflection}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={downloadTranscript}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-slate-200 rounded-lg transition text-sm"
              >
                <Download size={16} />
                Download Transcript
              </button>
            </div>
          </div>
        ) : null;

      case 'closing':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-emerald-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                One More Thing...
              </h3>
              <p className="text-slate-300">
                Before you go, take a moment to distill this session into something you can carry with you.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  One word to carry forward
                </label>
                <p className="text-slate-400 text-sm mb-3">
                  If you could take one word from this session—a quality, an insight, a reminder—what would it be?
                </p>
                <input
                  type="text"
                  value={wordToCarry}
                  onChange={(e) => { setWordToCarry(e.target.value); updateDraft({ wordToCarry: e.target.value }); }}
                  placeholder="e.g., courage, compassion, wholeness"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Self-compassion statement
                </label>
                <p className="text-slate-400 text-sm mb-3">
                  What do you need to hear right now? Write a kind, compassionate statement to yourself.
                </p>
                <textarea
                  value={selfCompassionStatement}
                  onChange={(e) => { setSelfCompassionStatement(e.target.value); updateDraft({ selfCompassionStatement: e.target.value }); }}
                  placeholder="e.g., 'I am doing my best. It's okay to be imperfect. I am allowed to take up space.'"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 h-24 resize-none"
                  maxLength={300}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardFrame
      title="Shadow Journaling"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      showBackButton={phase !== 'welcome'}
      nextButtonText={getNextButtonText()}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="purple"
      headerSlot={headerSlot}
      errorMessage={error}
    >
      {renderContent()}
    </WizardFrame>
  );
}

// Exercise Form Sub-Component (simplified without own navigation)
interface ExerciseFormProps {
  exercise: ShadowExerciseTemplate;
  userEntry: Record<string, string | number>;
  onFieldChange: (fieldId: string, value: string | number) => void;
  error: string | null;
}

function ExerciseForm({
  exercise,
  userEntry,
  onFieldChange,
  error
}: ExerciseFormProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-100">{exercise.name}</h3>
      </div>

      {showInstructions && (
        <div className="bg-purple-900/20 border border-purple-500/40 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold text-purple-300">Instructions</h4>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Hide
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {exercise.longInstructions}
            </div>
          </div>
        </div>
      )}

      {!showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          Show Instructions
        </button>
      )}

      <div className="space-y-5">
        {exercise.fields.map(field => (
          <div key={field.id}>
            <label className="block text-slate-200 font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-slate-400 text-sm mb-2">{field.description}</p>
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={(userEntry[field.id] as string) || ''}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                maxLength={field.maxLength}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={(userEntry[field.id] as string) || ''}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 h-32 resize-none"
                maxLength={field.maxLength}
              />
            )}

            {field.type === 'scale' && field.scaleMin !== undefined && field.scaleMax !== undefined && (
              <div className="space-y-3">
                <input
                  type="range"
                  min={field.scaleMin}
                  max={field.scaleMax}
                  value={(userEntry[field.id] as number) || field.scaleMin}
                  onChange={(e) => onFieldChange(field.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  {field.scaleLabels && (
                    <>
                      <span className="text-slate-400">{field.scaleLabels.min}</span>
                      <span className="text-purple-400 font-semibold">
                        {userEntry[field.id] || field.scaleMin}
                      </span>
                      <span className="text-slate-400">{field.scaleLabels.max}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
