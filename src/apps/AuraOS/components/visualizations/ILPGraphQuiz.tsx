import React, { useState, useEffect } from 'react';
import {
  ILPGraphQuizSession,
  QuizResult,
  ILPGraphCategory,
  DifficultyLevel,
  QuizQuestion,
} from '../../types';
import {
  getQuizQuestions,
  QUIZ_SESSIONS_STORAGE_KEY,
  QUIZ_RESULTS_STORAGE_KEY,
  getCategoryStats,
} from '../../data/ilpGraphQuizzes';
import { StorageManager } from '../../.claude/lib/storageManager';
import { calculateStreak, processSessionGamification, Achievement } from '../../.claude/lib/quizGamification';
import { generateId } from '../../utils/helpers';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { TabShell } from '../shared/TabShell';
import { MissionControlHub } from '../../src/components/mastery/MissionControlHub';
import { ThemedQuizEnvironment } from '../../src/components/mastery/ThemedQuizEnvironment';
import { EnhancedQuestionCard } from '../../src/components/mastery/EnhancedQuestionCard';
import { MissionDebrief } from '../../src/components/mastery/MissionDebrief';
import { AchievementToast } from '../../src/components/mastery/AchievementToast';

type QuizStep = 'menu' | 'quiz' | 'results' | 'review';

interface QuizStats {
  totalTaken: number;
  averageScore: number;
  bestScore: number;
  streak: number;
  categoryScores: Record<ILPGraphCategory, { attempts: number; bestScore: number }>;
}

const moduleColorHex: Record<ILPGraphCategory, string> = {
  core: '#d6a756',
  body: '#34d399',
  mind: '#60a5fa',
  spirit: '#2dd4bf',
  shadow: '#c084fc',
  'integral-theory': '#a78bfa',
};

const categoryLabel: Record<ILPGraphCategory, string> = {
  core: 'Core Concepts',
  body: 'Body Module',
  mind: 'Mind Module',
  spirit: 'Spirit Module',
  shadow: 'Shadow Module',
  'integral-theory': 'Integral Theory',
};

export const ILPGraphQuiz: React.FC = () => {
  const [step, setStep] = useState<QuizStep>('menu');
  const [selectedCategory, setSelectedCategory] = useState<ILPGraphCategory>('core');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [currentSession, setCurrentSession] = useState<ILPGraphQuizSession | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isQuizDataLoading, setIsQuizDataLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    loadStats();
    // Dynamically import quiz data to reduce main bundle size
    import('../../data/ilpGraphQuizzes').then(module => {
      setAllQuestions(module.ilpGraphQuizzes || []);
    }).catch(err => {
      console.error('[ILPGraphQuiz] Failed to load quiz data:', err);
    }).finally(() => {
      setIsQuizDataLoading(false);
    });
  }, []);

  const loadStats = () => {
    const quizResults = StorageManager.getUntyped(QUIZ_RESULTS_STORAGE_KEY) as QuizResult[] | null;
    if (quizResults) {
      if (quizResults.length > 0) {
        const totalTaken = quizResults.length;
        const averageScore =
          quizResults.reduce((acc, r) => acc + r.score, 0) / totalTaken;
        const bestScore = Math.max(...quizResults.map((r) => r.score));

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastResult = quizResults[quizResults.length - 1];
        const lastResultDate = lastResult.date.split('T')[0];
        const streak =
          lastResultDate === today || lastResultDate === yesterday
            ? Math.min(quizResults.length, 7)
            : 0;

        const categoryStats: Record<
          ILPGraphCategory,
          { attempts: number; totalScore: number }
        > = {
          core: { attempts: 0, totalScore: 0 },
          body: { attempts: 0, totalScore: 0 },
          mind: { attempts: 0, totalScore: 0 },
          spirit: { attempts: 0, totalScore: 0 },
          shadow: { attempts: 0, totalScore: 0 },
          'integral-theory': { attempts: 0, totalScore: 0 },
        };

        quizResults.forEach((result) => {
          if (categoryStats[result.category]) {
            categoryStats[result.category].attempts += 1;
            categoryStats[result.category].totalScore += result.score;
          }
        });

        const categoryScores: Record<
          ILPGraphCategory,
          { attempts: number; bestScore: number }
        > = {
          core: { attempts: 0, bestScore: 0 },
          body: { attempts: 0, bestScore: 0 },
          mind: { attempts: 0, bestScore: 0 },
          spirit: { attempts: 0, bestScore: 0 },
          shadow: { attempts: 0, bestScore: 0 },
          'integral-theory': { attempts: 0, bestScore: 0 },
        };

        Object.keys(categoryStats).forEach((cat) => {
          const stat = categoryStats[cat as ILPGraphCategory];
          categoryScores[cat as ILPGraphCategory] = {
            attempts: stat.attempts,
            bestScore:
              stat.attempts > 0 ? Math.round(stat.totalScore / stat.attempts) : 0,
          };
        });

        setStats({
          totalTaken,
          averageScore: Math.round(averageScore),
          bestScore,
          streak,
          categoryScores,
        });
      }
    }
  };

  const startQuiz = () => {
    // Prevent starting quiz if data is still loading
    if (isQuizDataLoading) {
      return;
    }

    const availableQuestions = getQuizQuestions(selectedCategory, selectedDifficulty, numQuestions);

    if (availableQuestions.length === 0) {
      return;
    }

    if (availableQuestions.length < numQuestions) {
      return;
    }

    const invalidQuestions = availableQuestions.filter(q => !q || !q.id || !q.question || !q.answers || q.answers.length === 0);
    if (invalidQuestions.length > 0) {
      console.error('[ILPGraphQuiz] Invalid question data detected:', invalidQuestions);
      return;
    }

    const questionIds = new Set(availableQuestions.map(q => q?.id).filter(id => id != null));
    if (questionIds.size !== availableQuestions.length) {
      console.warn('Warning: Duplicate questions detected, filtering...');
      return;
    }

    const newSession: ILPGraphQuizSession = {
      id: generateId(),
      date: new Date().toISOString(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now(),
    };

    setQuizQuestions(availableQuestions);
    setCurrentSession(newSession);
    setStep('quiz');
  };

  const startDailyChallenge = (questions: QuizQuestion[]) => {
    if (!questions || questions.length === 0) return;

    const newSession: ILPGraphQuizSession = {
      id: generateId(),
      date: new Date().toISOString(),
      category: 'integral-theory', // Default visual theme for Mixed/Daily
      difficulty: 'intermediate',
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now(),
    };

    setQuizQuestions(questions);
    setCurrentSession(newSession);
    setStep('quiz');
  };

  const selectAnswer = (answerId: string) => {
    if (!currentSession || quizQuestions.length === 0) return;

    setSelectedAnswerId(answerId);
    setShowExplanation(true);
  };

  const continueToNextQuestion = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    if (!currentSession) {
      setIsProcessing(false);
      return;
    }
    if (quizQuestions.length === 0) {
      setIsProcessing(false);
      return;
    }
    if (!selectedAnswerId) {
      setIsProcessing(false);
      return;
    }

    const currentQuestionId = quizQuestions[currentSession.currentQuestionIndex]?.id;
    if (!currentQuestionId) {
      setIsProcessing(false);
      return;
    }

    const updatedSession: ILPGraphQuizSession = {
      ...currentSession,
      answers: [
        ...currentSession.answers,
        {
          questionId: currentQuestionId,
          selectedAnswerId: selectedAnswerId,
        },
      ],
    };

    const isLastQuestion = currentSession.currentQuestionIndex >= quizQuestions.length - 1;

    setShowExplanation(false);
    setSelectedAnswerId(null);

    if (!isLastQuestion) {
      const nextIndex = currentSession.currentQuestionIndex + 1;
      setCurrentSession({
        ...updatedSession,
        currentQuestionIndex: nextIndex,
      });
      setTimeout(() => setIsProcessing(false), 100);
    } else {
      finishQuiz(updatedSession, quizQuestions);
      setIsProcessing(false);
    }
  };

  const finishQuiz = (session: ILPGraphQuizSession, questions: QuizQuestion[]) => {
    if (!session || !questions || questions.length === 0) {
      return;
    }

    let correctCount = 0;
    let totalPoints = 0;

    const categoryBreakdown: Record<ILPGraphCategory, { correct: number; total: number }> = {
      core: { correct: 0, total: 0 },
      body: { correct: 0, total: 0 },
      mind: { correct: 0, total: 0 },
      spirit: { correct: 0, total: 0 },
      shadow: { correct: 0, total: 0 },
      'integral-theory': { correct: 0, total: 0 },
    };

    const answersWithCorrectness = session.answers.map((answer, idx) => {
      const question = questions[idx];
      if (!question || !answer || !question.answers) {
        return { ...answer, isCorrect: false };
      }
      const isCorrect = question.answers.find(
        (a) => a?.id === answer.selectedAnswerId
      )?.isCorrect;

      if (isCorrect) {
        correctCount++;
        totalPoints += question.points || 10;
      }

      const category = question.category;
      if (categoryBreakdown[category]) {
        categoryBreakdown[category].total += 1;
        if (isCorrect) {
          categoryBreakdown[category].correct += 1;
        }
      }

      return { ...answer, isCorrect: !!isCorrect };
    });

    const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
    const score = Math.round((correctCount / questions.length) * 100);

    const quizResult: QuizResult = {
      id: session.id,
      quizId: session.id,
      date: session.date,
      difficulty: session.difficulty,
      category: session.category,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      timeSpent,
      categoryBreakdown,
      answers: answersWithCorrectness,
    };

    const existingResults = (StorageManager.getUntyped(QUIZ_RESULTS_STORAGE_KEY) as QuizResult[] | null) || [];
    const allResults: QuizResult[] = Array.isArray(existingResults) ? existingResults : [];
    allResults.push(quizResult);
    StorageManager.setUntyped(QUIZ_RESULTS_STORAGE_KEY, allResults);

    // Process Gamification (XP, Concepts, Achievements)
    const { newAchievements } = processSessionGamification(quizResult, questions, totalPoints);

    if (newAchievements.length > 0) {
      setToastQueue((prev: Achievement[]) => [...prev, ...newAchievements]);
    }

    setResults(quizResult);
    setCurrentSession(null);
    setStep('results');
    loadStats();
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setQuizQuestions([]);
    setResults(null);
    setStep('menu');
    setReviewIndex(0);
  };

  const goToReview = () => {
    setReviewIndex(0);
    setStep('review');
  };

  const currentQuestion = currentSession && quizQuestions.length > 0
    ? quizQuestions[currentSession.currentQuestionIndex]
    : null;

  return (
    <TabShell
      tab="quiz"
      subtitle="Deepen your integral understanding through contemplative inquiry"
    >
      <div className="w-full">
        {isQuizDataLoading && step === 'menu' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-stone-400">Loading quiz data...</p>
            </div>
          </div>
        ) : step === 'menu' ? (
          <MissionControlHub
            onStartQuiz={(category: ILPGraphCategory, difficulty: DifficultyLevel, numQuestions: number) => {
              if (isQuizDataLoading) return; // Don't start if data is loading
              setSelectedCategory(category);
              setSelectedDifficulty(difficulty);
              setNumQuestions(numQuestions);
              startQuiz();
            }}
            onStartDailyChallenge={startDailyChallenge}
            stats={stats}
            isLoading={isQuizDataLoading}
          />
        ) : null}

        {step === 'quiz' && currentQuestion && currentSession && (
          <ThemedQuizEnvironment category={currentSession.category}>
            <div className="max-w-2xl mx-auto p-6">
              <EnhancedQuestionCard
                question={currentQuestion}
                difficulty={currentSession.difficulty}
                questionNumber={currentSession.currentQuestionIndex + 1}
                totalQuestions={quizQuestions.length}
                moduleColor={moduleColorHex[currentSession.category]}
                onAnswerSelect={selectAnswer}
              />

              {/* Explanation Modal */}
              {showExplanation && selectedAnswerId && (
                <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-stone-900 rounded-xl border border-stone-800 max-w-xl w-full p-4 sm:p-8 space-y-6">
                    {/* Result Indicator */}
                    <div className="flex items-center gap-3">
                      {(() => {
                        const isCorrect = currentQuestion.answers.find((a: any) => a.id === selectedAnswerId)?.isCorrect;
                        return isCorrect ? (
                          <>
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ background: `${moduleColorHex[currentSession.category]}30` }}
                            >
                              <span className="text-lg" style={{ color: moduleColorHex[currentSession.category] }}>✓</span>
                            </div>
                            <span className="text-lg font-medium text-stone-200">Correct</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center">
                              <span className="text-lg text-stone-400">✗</span>
                            </div>
                            <span className="text-lg font-medium text-stone-300">Not quite</span>
                          </>
                        );
                      })()}
                    </div>

                    {/* Explanation */}
                    <div>
                      <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">Understanding</h3>
                      <p className="text-stone-300 leading-relaxed">{currentQuestion.correctExplanation}</p>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={continueToNextQuestion}
                      type="button"
                      disabled={isProcessing}
                      className={`w-full mt-4 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isProcessing
                        ? 'opacity-50 cursor-not-allowed bg-stone-800 text-stone-500'
                        : 'bg-stone-800 border text-stone-200 hover:bg-stone-700 cursor-pointer'
                        }`}
                      style={!isProcessing ? { borderColor: `${moduleColorHex[currentSession.category]}60` } : {}}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ThemedQuizEnvironment>
        )}

        {step === 'results' && results && (
          <div className="py-8">
            <MissionDebrief
              result={results}
              moduleColor={moduleColorHex[results.category]}
              onRetry={resetQuiz}
              onReviewAnswers={goToReview}
            />
          </div>
        )}

        {step === 'review' && results && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-stone-200">Review Session</h2>
              <button
                onClick={resetQuiz}
                className="text-sm px-4 py-2 rounded-lg border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-all"
              >
                Return to Menu
              </button>
            </div>

            {/* Review Navigation */}
            <div className="flex items-center justify-between text-sm text-stone-500">
              <button
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="flex items-center gap-1 disabled:opacity-30 hover:text-stone-300 transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span>Question {reviewIndex + 1} of {results.answers.length}</span>
              <button
                onClick={() => setReviewIndex(Math.min(results.answers.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === results.answers.length - 1}
                className="flex items-center gap-1 disabled:opacity-30 hover:text-stone-300 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Review Content */}
            {(() => {
              const answer = results.answers[reviewIndex];
              const question = allQuestions.find((q: any) => q.id === answer.questionId);
              if (!question) return null;

              const selectedAnswer = question.answers.find((a: any) => a.id === answer.selectedAnswerId);
              const correctAnswer = question.answers.find((a: any) => a.isCorrect);

              return (
                <div className="bg-stone-900/40 rounded-xl p-6 border border-stone-800/50 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${answer.isCorrect
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-stone-800 text-stone-400'
                          }`}
                      >
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-xs text-stone-600">{categoryLabel[question.category]}</span>
                    </div>
                    <h3 className="text-lg font-serif text-stone-200 leading-relaxed">
                      {question.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-stone-500 mb-1">Your answer</div>
                      <div className={`p-3 rounded-lg border ${answer.isCorrect
                        ? 'bg-green-900/20 border-green-800/50 text-stone-200'
                        : 'bg-stone-800/50 border-stone-700 text-stone-400'
                        }`}>
                        {selectedAnswer?.text}
                      </div>
                    </div>

                    {!answer.isCorrect && correctAnswer && (
                      <div>
                        <div className="text-xs text-stone-500 mb-1">Correct answer</div>
                        <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/50 text-stone-200">
                          {correctAnswer.text}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Explanation</div>
                    <p className="text-stone-400 leading-relaxed text-sm">
                      {question.correctExplanation}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Achievement Toasts */}
      {toastQueue.length > 0 && (
        <AchievementToast
          achievement={toastQueue[0]}
          onDismiss={() => setToastQueue((prev: Achievement[]) => prev.slice(1))}
        />
      )}
    </TabShell>
  );
};
