import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AttachmentAssessmentSession, IntegratedInsight } from '../../types.ts';
import { attachmentQuestions, calculateAttachmentScores, determineAttachmentStyle, getScoreLabel } from '../../data/attachmentAssessment.ts';
import CelestialRoseIcon from '../visualizations/SacredGeometryIcons/CelestialRoseIcon';
import { useWizardDraft } from '../../hooks/useWizardDraft';

interface AttachmentAssessmentWizardProps {
  onClose: () => void;
  onComplete: (session: AttachmentAssessmentSession) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

type WizardStep = 'intro' | 'questions' | 'results';

const STEPS: WizardStep[] = ['intro', 'questions', 'results'];

export default function AttachmentAssessmentWizard({
  onClose,
  onComplete,
  userId,
  insightContext,
  markInsightAsAddressed,
}: AttachmentAssessmentWizardProps) {
  const [step, setStep] = useState<WizardStep>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [draft, updateDraft] = useWizardDraft<{ answers: Record<string, number> }>(
    'attachment-assessment',
    { answers: {} }
  );
  const [answers, setAnswers] = useState<Record<string, number>>(draft?.answers || {});

  const totalQuestions = attachmentQuestions.length;
  const question = attachmentQuestions[currentQuestion];

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);
    updateDraft({ answers: newAnswers });

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment(newAnswers);
    }
  };

  const completeAssessment = (finalAnswers: Record<string, number>) => {
    const scores = calculateAttachmentScores(finalAnswers);
    const result = determineAttachmentStyle(scores);

    const session: AttachmentAssessmentSession = {
      id: `attachment-${Date.now()}`,
      date: new Date().toISOString(),
      answers: finalAnswers,
      scores,
      style: result.style,
      assessedStyle: result.style,
      description: result.description,
      linkedInsightId: insightContext?.id,
    };

    onComplete(session);

    if (session.linkedInsightId && markInsightAsAddressed) {
      markInsightAsAddressed(session.linkedInsightId, 'Attachment Assessment', session.id);
    }

    setStep('results');
  };

  const handleBack = () => {
    if (step === 'intro') return;
    if (step === 'questions' && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (step === 'questions') {
      setStep('intro');
    } else if (step === 'results') {
      setStep('questions');
    }
  };

  const currentStepIndex = STEPS.indexOf(step);
  const showBackButton = !(step === 'intro') && step !== 'results';

  // ── Intro ────────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-y-auto" style={{ height: '100dvh' }}>
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[280px] bg-amber-900/4 blur-[140px] rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-300 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4">
            <CelestialRoseIcon size={48} className="text-rose-400" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-light text-stone-100">Attachment Assessment</h1>
              <p className="text-sm text-stone-500 mt-1">30-question relational pattern assessment</p>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl p-5 space-y-3">
            <p className="text-sm text-stone-400 leading-relaxed">
              Attachment styles describe how we relate to others emotionally — the patterns of closeness, distance, and trust we carry from early life into all our relationships.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-3">You will learn</p>
            <ul className="space-y-2">
              {[
                'Your primary attachment style',
                'How anxiety and avoidance show up in your relationships',
                'Personalized practices to support secure attachment',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone-400">
                  <span className="text-rose-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timing note */}
          <div className="bg-rose-950/20 border border-rose-500/15 rounded-2xl p-4">
            <p className="text-sm text-stone-300 leading-relaxed">
              This takes about 5–10 minutes. Answer honestly — there are no right answers.
            </p>
          </div>

          {/* Begin button */}
          <button
            onClick={() => setStep('questions')}
            className="w-full py-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 font-medium hover:bg-rose-900/60 hover:border-rose-400/50 transition-all"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  // ── Questions ─────────────────────────────────────────────────────────────────
  if (step === 'questions') {
    const isAnswered = answers[question.id] !== undefined;

    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col" style={{ height: '100dvh' }}>
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/5 blur-[160px] rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-rose-500/15">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CelestialRoseIcon size={26} className="text-rose-400" />
              <div>
                <h1 className="font-serif text-base sm:text-lg font-light text-stone-100">Attachment Assessment</h1>
                <p className="text-[11px] text-stone-500 leading-none mt-0.5">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-stone-800">
            <div
              className="h-full bg-gradient-to-r from-rose-900 via-rose-500 to-rose-300 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
            <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-100 leading-snug">
              {question.question}
            </h2>

            {/* Scale */}
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(score => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                      answers[question.id] === score
                        ? 'bg-rose-950/60 border border-rose-400/60 text-rose-200 shadow-md shadow-red-900/20'
                        : 'bg-stone-900/50 border border-stone-700/30 text-stone-500 hover:border-rose-500/30 hover:text-stone-300 hover:bg-rose-950/20'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Disagree</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Agree</span>
              </div>
            </div>

            {isAnswered && (
              <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-2xl text-xs text-center px-3 py-2">
                · Recorded — tap a number to change or use Back to revisit
              </div>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-stone-800/60 bg-stone-950/90 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-stone-700/40 text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-colors text-sm"
            >
              Back
            </button>
            {isAnswered && currentQuestion < totalQuestions - 1 && (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 hover:bg-rose-900/60 hover:border-rose-400/50 transition-all text-sm font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────
  if (step === 'results') {
    const scores = calculateAttachmentScores(answers);
    const result = determineAttachmentStyle(scores);

    const styleTitles: Record<string, string> = {
      secure: 'Secure Attachment',
      anxious: 'Anxious-Preoccupied',
      avoidant: 'Dismissive-Avoidant',
      fearful: 'Fearful-Avoidant',
    };

    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-y-auto" style={{ height: '100dvh' }}>
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/6 blur-[160px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[280px] bg-amber-900/5 blur-[140px] rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6">
          {/* Result header */}
          <div className="bg-stone-900/60 border border-rose-500/20 rounded-2xl p-6 text-center space-y-3 overflow-hidden relative">
            <div className="absolute inset-0 bg-rose-500/4 blur-[60px] rounded-2xl pointer-events-none" />
            <div className="relative">
              <CelestialRoseIcon size={40} className="text-rose-400 mx-auto mb-3" />
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100">
                {styleTitles[result.style] ?? result.style}
              </h2>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-stone-400">
                  Anxiety: <span className="text-rose-300">{result.anxiety.toFixed(1)}</span>
                  <span className="text-stone-600 mx-1">·</span>
                  {getScoreLabel(result.anxiety)}
                </p>
                <p className="text-stone-400">
                  Avoidance: <span className="text-amber-300">{result.avoidance.toFixed(1)}</span>
                  <span className="text-stone-600 mx-1">·</span>
                  {getScoreLabel(result.avoidance)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl p-5">
            <p className="text-sm text-stone-400 leading-relaxed">{result.description}</p>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Anxiety</p>
              <p className="text-2xl font-serif font-light text-stone-100">{result.anxiety.toFixed(2)}</p>
              <p className="text-xs text-stone-500">
                {result.anxiety < 3.5 ? 'Relatively secure' : 'Worry about closeness'}
              </p>
            </div>
            <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Avoidance</p>
              <p className="text-2xl font-serif font-light text-stone-100">{result.avoidance.toFixed(2)}</p>
              <p className="text-xs text-stone-500">
                {result.avoidance < 3.5 ? 'Comfortable with closeness' : 'Prefer emotional distance'}
              </p>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl p-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore practices designed for your attachment style in the section below.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 font-medium hover:bg-rose-900/60 hover:border-rose-400/50 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
