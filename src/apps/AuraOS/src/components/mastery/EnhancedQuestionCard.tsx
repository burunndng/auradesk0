import React, { useState, useEffect } from 'react';
import { QuizQuestion, DifficultyLevel } from '../../../types';
import { typography, getButtonClass } from '../../../theme';

interface EnhancedQuestionCardProps {
  question: QuizQuestion;
  difficulty: DifficultyLevel;
  questionNumber: number;
  totalQuestions: number;
  moduleColor: string;
  onAnswerSelect: (answerId: string) => void;
}

const depthConfig = {
  beginner: {
    label: 'Foundation',
  },
  intermediate: {
    label: 'Practitioner',
  },
  advanced: {
    label: 'Integration',
  },
  ultra: {
    label: 'Contemplative',
  },
};

export const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({
  question,
  difficulty,
  questionNumber,
  totalQuestions,
  moduleColor,
  onAnswerSelect,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question.id]);

  const config = depthConfig[difficulty];
  const progress = (questionNumber / totalQuestions) * 100;

  const handleAnswerClick = (answerId: string) => {
    setSelectedAnswer(answerId);
    setTimeout(() => {
      onAnswerSelect(answerId);
    }, 150);
  };

  return (
    <div className="space-y-8">
      {/* Progress and Context */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-stone-500">{config.label}</span>
        </div>
        <div className="h-0.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: moduleColor,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-6">
        <h2 className={`${typography.h4} text-stone-100`}>
          {question.question}
        </h2>

        {question.description && (
          <div
            className={`p-4 rounded-lg ${typography.body} text-stone-400 border-l-2`}
            style={{
              background: 'rgba(28, 25, 23, 0.6)',
              borderColor: moduleColor,
            }}
          >
            {question.description}
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.answers.map((answer, idx) => {
          const isSelected = selectedAnswer === answer.id;
          const isCorrect = answer.isCorrect;

          return (
            <button
              key={answer.id}
              onClick={() => handleAnswerClick(answer.id)}
              disabled={selectedAnswer !== null}
              className={`
                relative w-full text-left p-5 rounded-lg
                transition-all duration-300
                border group
                ${isSelected
                  ? isCorrect
                    ? 'border-green-500/50 bg-green-900/20'
                    : 'border-red-500/50 bg-red-900/20 animate-shake'
                  : selectedAnswer
                    ? 'opacity-50 cursor-not-allowed border-stone-800'
                    : 'border-stone-800 hover:border-stone-600 hover:bg-stone-800/30 cursor-pointer hover:shadow-glow-sm'
                }
              `}
              style={{
                borderColor: isSelected
                  ? isCorrect ? '#10B981' : '#EF4444'
                  : undefined,
              }}
            >
              {/* XP Floating indicator */}
              {isSelected && isCorrect && (
                <div className="absolute top-0 right-4 -translate-y-full animate-float-up text-green-400 font-bold text-lg pointer-events-none">
                  +{question.points} XP
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Answer Letter */}
                <div
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center
                    text-sm font-medium shrink-0
                    transition-all duration-200
                    ${isSelected && isCorrect ? 'scale-110' : ''}
                  `}
                  style={{
                    background: isSelected
                      ? isCorrect ? '#10B981' : '#EF4444'
                      : 'rgba(41, 37, 36, 0.8)',
                    color: isSelected ? '#fff' : '#a8a29e',
                  }}
                >
                  {isSelected
                    ? isCorrect ? '✓' : '✗'
                    : String.fromCharCode(65 + idx)
                  }
                </div>

                {/* Answer Text */}
                <span className={`flex-1 pt-0.5 ${typography.body} text-stone-200 transition-colors duration-200 break-words min-w-0 ${isSelected && isCorrect ? 'text-green-100' : ''}`}>
                  {answer.text}
                </span>

                {/* Visual Flair */}
                {isSelected && isCorrect && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/10 blur-xl animate-pulse" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
