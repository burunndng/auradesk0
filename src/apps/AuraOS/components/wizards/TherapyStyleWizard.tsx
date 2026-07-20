import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import {
  therapyAssessmentQuestions,
  THERAPY_ASSESSMENT_STAGES,
} from '../../data/therapyAssessmentQuestions';
import { therapyModalities } from '../../data/therapyModalities';
import { calculateTherapyScores } from '../../services/therapyAssessmentScoring';
import { generateTherapyNarrative } from '../../services/therapyAssessmentAI';
import MoralCompassIcon from '../visualizations/SacredGeometryIcons/MoralCompassIcon';
import type {
  TherapyAssessmentQuestion,
  TherapyAssessmentResults,
  TherapyModalityId,
  TherapyClinicalFlag,
} from '../../types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex justify-between text-xs sm:text-sm text-stone-400 mb-3">
        <span className="font-serif font-medium">Question {current} of {total}</span>
        <span className="font-bold text-purple-400 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 bg-stone-900/80 rounded-full overflow-hidden shadow-inner border border-stone-800">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-purple-500/40"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-4 gap-1.5">
        {THERAPY_ASSESSMENT_STAGES.map((stage) => {
          const stageQuestions = therapyAssessmentQuestions.filter(
            (q) => q.stage === stage.id
          );

          if (stageQuestions.length === 0) {
            return (
              <div key={stage.id} className="text-[10px] sm:text-xs text-stone-700 font-serif">
                {stage.title}
              </div>
            );
          }

          const firstQ = therapyAssessmentQuestions.indexOf(stageQuestions[0]) + 1;
          const isActive = current >= firstQ && current <= firstQ + stageQuestions.length - 1;
          const isComplete = current > firstQ + stageQuestions.length - 1;

          return (
            <div
              key={stage.id}
              className={`text-[10px] sm:text-xs transition-all duration-500 font-serif ${
                isActive
                  ? 'text-purple-300 font-bold drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] scale-105'
                  : isComplete
                  ? 'text-purple-500/50 font-medium'
                  : 'text-stone-700'
              }`}
            >
              {stage.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionStep({
  question,
  selected,
  onSelect,
}: {
  question: TherapyAssessmentQuestion;
  selected: string[];
  onSelect: (values: string[]) => void;
}) {
  const handleOptionClick = (value: string) => {
    if (question.type === 'single') {
      onSelect([value]);
    } else {
      const max = question.maxSelections || Infinity;
      if (selected.includes(value)) {
        onSelect(selected.filter((v) => v !== value));
      } else if (selected.length < max) {
        onSelect([...selected, value]);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="font-serif text-2xl sm:text-3xl text-stone-100 mb-3 leading-tight">
        {question.text}
      </h2>
      {question.subtext && (
        <p className="text-xs sm:text-sm text-stone-400 mb-6 leading-relaxed">{question.subtext}</p>
      )}

      <div className="space-y-2.5 sm:space-y-3">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`group w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300
                min-h-[44px] cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-950/80 to-purple-900/60 border-purple-500/50 text-stone-100 shadow-lg shadow-purple-900/40'
                    : 'bg-stone-900/60 border-stone-700/50 text-stone-300 hover:bg-stone-800/80 hover:border-purple-700/40 hover:shadow-md hover:shadow-purple-950/20'
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isSelected
                      ? 'border-purple-400 bg-purple-500 shadow-sm shadow-purple-500/50'
                      : 'border-stone-600 group-hover:border-purple-600/50'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white animate-in zoom-in duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-xs sm:text-sm leading-relaxed">
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CrisisBanner({ flags }: { flags: TherapyClinicalFlag[] }) {
  const crisisFlag = flags.find((f) => f.type === 'crisis');
  if (!crisisFlag) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-700/50">
      <div className="flex items-start gap-3">
        <span className="text-rose-400 text-lg flex-shrink-0">!</span>
        <div>
          <p className="text-rose-200 text-sm font-medium mb-1">Important</p>
          <p className="text-rose-300/90 text-sm leading-relaxed">
            {crisisFlag.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function ModalityCard({
  modality,
  normalizedScore,
  fitLabel,
  rank,
}: {
  modality: TherapyModalityId;
  normalizedScore: number;
  fitLabel: string;
  rank: number;
}) {
  const info = therapyModalities[modality];
  if (!info) return null;

  const [expanded, setExpanded] = useState(false);

  // Tonal purple palette — no amber, maintains void aesthetic
  const accentColors: Record<number, string> = {
    0: 'from-purple-400 via-purple-300 to-purple-400',
    1: 'from-violet-400 via-violet-300 to-violet-400',
    2: 'from-purple-500/70 via-purple-400/70 to-purple-500/70',
  };

  const borderColors: Record<number, string> = {
    0: 'border-purple-700/40',
    1: 'border-violet-700/30',
    2: 'border-purple-800/30',
  };

  const fitBadgeColors: Record<string, string> = {
    'Excellent fit': 'bg-purple-900/80 text-purple-200 border border-purple-700/50',
    'Strong fit': 'bg-violet-900/60 text-violet-200 border border-violet-700/40',
    'Good fit': 'bg-stone-800/80 text-stone-300 border border-stone-700/50',
    'Possible fit': 'bg-stone-800/80 text-stone-300 border border-stone-700/50',
  };

  return (
    <div className={`bg-gradient-to-br from-stone-900/80 to-stone-950/60 border ${borderColors[rank] || 'border-stone-700/40'} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
         style={{ animationDelay: `${rank * 100}ms` }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                #{rank + 1} Match
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                  fitBadgeColors[fitLabel] || fitBadgeColors['Possible fit']
                }`}
              >
                {fitLabel}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-stone-100 leading-tight">
              {info.name}
            </h3>
            <p className="text-sm text-purple-400/80 italic mt-1.5 leading-relaxed">
              {info.tagline}
            </p>
          </div>
          <div className="text-right ml-4">
            <div
              className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${
                accentColors[rank] || accentColors[2]
              } bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]`}
            >
              {normalizedScore}%
            </div>
          </div>
        </div>

        <div className="h-2 bg-stone-900/80 rounded-full overflow-hidden mt-4 mb-5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-purple-500/30"
            style={{ width: `${normalizedScore}%` }}
          />
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          {info.description}
        </p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 sm:px-6 py-3.5 text-left text-xs sm:text-sm text-purple-400 hover:text-purple-300
          border-t border-stone-800/60 transition-all duration-200 flex items-center justify-between group hover:bg-purple-950/20"
      >
        <span className="font-medium">{expanded ? 'Show less' : 'Learn more about this approach'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-stone-900/50">
          {[
            { label: 'Approach', value: info.approach },
            { label: 'What a session feels like', value: info.sessionFeel },
            { label: 'Typical duration', value: info.typicalDuration },
          ].map(({ label, value }) => (
            <div key={label} className="pt-5 first:pt-5">
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="text-purple-500/60">·</span>
                {label}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{value}</p>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-purple-500/60">·</span>
              Best for
            </h4>
            <div className="flex flex-wrap gap-2">
              {info.bestFor.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 bg-stone-800/80 text-stone-300 rounded-lg border border-stone-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {info.requiresReadiness.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="text-purple-500/60">·</span>
                Works best when you're ready to
              </h4>
              <ul className="text-xs sm:text-sm text-stone-300 space-y-2">
                {info.requiresReadiness.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="text-purple-500/60 mt-0.5">-</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultsView({
  results,
  onRestart,
}: {
  results: TherapyAssessmentResults;
  onRestart: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/15 blur-3xl rounded-full animate-pulse" />
            <MoralCompassIcon size={56} className="relative text-purple-400" />
          </div>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]">
          Your Therapy Style Profile
        </h1>
        <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto leading-relaxed">
          Based on your responses, here's what we recommend
        </p>
      </div>

      <CrisisBanner flags={results.flags} />

      {results.flags
        .filter((f) => f.type === 'modifier' || f.type === 'contraindication')
        .map((flag, i) => (
          <div
            key={i}
            className={`mb-4 p-3.5 rounded-xl border text-sm leading-relaxed ${
              flag.type === 'contraindication'
                ? 'bg-amber-950/30 border-amber-800/30 text-amber-200/80'
                : 'bg-stone-900/60 border-stone-700/40 text-stone-300'
            }`}
          >
            {flag.message}
          </div>
        ))}

      <div className="space-y-4 mb-8">
        {results.recommendations.map((rec, i) => (
          <ModalityCard
            key={rec.modality}
            modality={rec.modality}
            normalizedScore={rec.normalizedScore}
            fitLabel={rec.fitLabel}
            rank={i}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/20 rounded-2xl p-6 sm:p-7 mb-8 shadow-xl">
        <h3 className="font-serif text-xl sm:text-2xl text-stone-100 mb-4">
          Personalized Analysis
        </h3>
        <div className="prose prose-invert prose-sm prose-stone max-w-none">
          {results.narrative.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-stone-700/30 rounded-2xl p-6 sm:p-7 mb-8 shadow-xl">
        <h3 className="font-serif text-xl sm:text-2xl text-stone-100 mb-5">
          All Modality Scores
        </h3>
        <div className="space-y-3.5">
          {Object.entries(results.allScores)
            .sort(([, a], [, b]) => b - a)
            .map(([modality, score], idx) => {
              const maxScore = Math.max(...Object.values(results.allScores), 1);
              const pct = Math.round((score / maxScore) * 100);
              const info = therapyModalities[modality];
              return (
                <div key={modality} className="animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-stone-300 font-medium">
                      {info?.name || modality.toUpperCase()}
                    </span>
                    <span className="text-purple-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 bg-stone-900/80 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 rounded-full transition-all duration-1000 shadow-sm shadow-purple-500/30"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-6 py-3 bg-stone-800/80 border border-stone-700/40 text-stone-300 rounded-xl
          hover:bg-stone-700/80 hover:border-stone-600 transition-all text-sm"
      >
        Retake Assessment
      </button>

      <div className="mt-8 p-4 rounded-xl bg-stone-900/40 border border-stone-800/30">
        <p className="text-xs text-stone-500 leading-relaxed">
          <strong className="text-stone-400">Disclaimer:</strong> This assessment
          is educational and informational only. It is not a clinical diagnosis,
          not therapy, and not a substitute for consultation with a licensed mental
          health professional. Therapy fit depends on many factors including your
          unique history, the therapist's specific training, and the therapeutic
          relationship — which no assessment can measure. If you are in crisis,
          please contact the{' '}
          <span className="text-stone-400">
            988 Suicide & Crisis Lifeline (call or text 988)
          </span>
          .
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/15 blur-3xl rounded-full animate-pulse" />
          <MoralCompassIcon size={64} className="relative text-purple-400" />
        </div>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]">
        Find Your Therapy Style
      </h1>
      <p className="text-stone-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
        This brief assessment will help you understand which psychotherapy
        approaches might be the best fit for your situation, goals, and
        preferences. It takes about 4-5 minutes.
      </p>

      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/20 rounded-2xl p-5 sm:p-6 max-w-md mx-auto text-left shadow-xl shadow-purple-950/10">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wider">
          Before You Begin
        </h3>
        <ul className="text-xs sm:text-sm text-stone-300 space-y-2.5">
          {[
            'There are no right or wrong answers',
            'Your responses are not stored or shared',
            'This is educational — not a clinical recommendation',
            'You\'ll get personalized insights about 10 therapy modalities',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-purple-500/60 mt-0.5">-</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="text-center py-16 animate-in fade-in duration-500">
      <div className="relative mb-6 flex justify-center">
        <div className="absolute inset-0 bg-purple-500/15 blur-3xl rounded-full" />
        <div className="relative inline-block w-16 h-16 border-4 border-purple-900/30 border-t-purple-400 rounded-full animate-spin shadow-lg shadow-purple-500/20" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl text-stone-100 mb-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]">
        Analyzing Your Profile
      </h2>
      <p className="text-sm sm:text-base text-stone-400 animate-pulse">
        Generating your personalized recommendations...
      </p>
      <div className="mt-8 flex justify-center gap-1">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

interface TherapyStyleDraft {
  phase: 'welcome' | 'questions' | 'loading' | 'results';
  currentIndex: number;
  answers: Record<string, string[]>;
}

const DRAFT_INITIAL: TherapyStyleDraft = {
  phase: 'welcome',
  currentIndex: 0,
  answers: {},
};

export default function TherapyStyleWizard({ onClose }: { onClose?: () => void }) {
  const [draft, updateDraft, , clearDraft] = useWizardDraft<TherapyStyleDraft>(
    'aura-draft-therapy-style',
    DRAFT_INITIAL
  );

  const [phase, setPhase] = useState<'welcome' | 'questions' | 'loading' | 'results'>(draft.phase);
  const [currentIndex, setCurrentIndex] = useState(draft.currentIndex);
  const [answers, setAnswers] = useState<Record<string, string[]>>(draft.answers);
  const [results, setResults] = useState<TherapyAssessmentResults | null>(null);

  useEffect(() => {
    updateDraft({ phase, currentIndex, answers });
  }, [phase, currentIndex, answers]);

  const totalQuestions = therapyAssessmentQuestions.length;
  const currentQuestion = therapyAssessmentQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] || [];
  const canProceed = currentAnswer.length > 0;

  const handleSelect = useCallback(
    (values: string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: values,
      }));
    },
    [currentQuestion?.id]
  );

  const handleNext = useCallback(async () => {
    if (phase === 'welcome') {
      setPhase('questions');
      return;
    }
    if (phase === 'questions') {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setPhase('loading');

        const scoringResult = calculateTherapyScores(answers);

        let narrative = '';
        try {
          narrative = await generateTherapyNarrative(
            answers,
            scoringResult.topRecommendations,
            scoringResult.flags,
            ''
          );
        } catch (e) {
          console.error('Narrative generation failed:', e);
          narrative =
            'We were unable to generate a personalized narrative at this time. Please review your modality matches above.';
        }

        setResults({
          narrative,
          recommendations: scoringResult.topRecommendations,
          flags: scoringResult.flags,
          allScores: scoringResult.rawScores,
        });
        setPhase('results');
      }
    }
  }, [phase, currentIndex, totalQuestions, answers]);

  const handleBack = useCallback(() => {
    if (phase === 'questions') {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else {
        setPhase('welcome');
      }
    }
  }, [phase, currentIndex]);

  const handleRestart = useCallback(() => {
    setPhase('welcome');
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
    clearDraft();
  }, [clearDraft]);

  // Phase label for header
  function getPhaseLabel(): string {
    switch (phase) {
      case 'welcome': return 'Introduction';
      case 'questions': return `Question ${currentIndex + 1} of ${totalQuestions}`;
      case 'loading': return 'Analyzing...';
      case 'results': return 'Your Results';
      default: return '';
    }
  }

  // Next button text
  const nextButtonText =
    phase === 'welcome'
      ? 'Begin Assessment'
      : phase === 'questions' && currentIndex === totalQuestions - 1
      ? 'Get Recommendations'
      : phase === 'results'
      ? 'Close'
      : 'Continue';

  const isNextDisabled =
    (phase === 'questions' && !canProceed) || phase === 'loading';

  const showBack = phase === 'questions';
  const showNext = phase !== 'loading';

  // Phase step progress
  const phaseSteps = ['welcome', 'questions', 'loading', 'results'];
  const currentPhaseIndex = phaseSteps.indexOf(phase);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col" style={{ height: '100dvh' }}>
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/4 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-violet-900/3 blur-[140px] rounded-full" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-purple-500/15">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MoralCompassIcon size={28} className="text-purple-400" />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-light text-stone-100">Find Your Therapy Style</h1>
              <p className="text-[11px] text-stone-500 leading-none mt-0.5">{getPhaseLabel()}</p>
            </div>
          </div>
          <button
            onClick={() => onClose?.()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Phase progress */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-2">
          <div className="flex items-center gap-1">
            {phaseSteps.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentPhaseIndex ? 'bg-purple-500' : 'bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {phase === 'welcome' && <WelcomeScreen />}

          {phase === 'questions' && currentQuestion && (
            <>
              <ProgressBar current={currentIndex + 1} total={totalQuestions} />
              <QuestionStep
                key={currentQuestion.id}
                question={currentQuestion}
                selected={currentAnswer}
                onSelect={handleSelect}
              />
            </>
          )}

          {phase === 'loading' && <LoadingScreen />}

          {phase === 'results' && results && (
            <ResultsView results={results} onRestart={handleRestart} />
          )}
        </div>
      </div>

      {/* Bottom nav footer */}
      {showNext && (
        <div className="border-t border-stone-800/60 bg-stone-950/90 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div>
              {showBack && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl border border-stone-700/60 text-stone-400 hover:text-stone-200 hover:border-stone-600 text-sm font-medium transition-all min-h-[44px]"
                >
                  Back
                </button>
              )}
            </div>
            <button
              onClick={phase === 'results' ? () => onClose?.() : handleNext}
              disabled={isNextDisabled}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all min-h-[44px] shadow-lg shadow-purple-900/30"
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
