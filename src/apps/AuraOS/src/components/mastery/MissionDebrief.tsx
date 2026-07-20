import React from 'react';
import { QuizResult, ILPGraphCategory } from '../../../types';
import { BookOpen, RefreshCw } from 'lucide-react';
import { typography, getButtonClass } from '../../../theme';

interface MissionDebriefProps {
  result: QuizResult;
  moduleColor: string;
  onRetry: () => void;
  onReviewAnswers: () => void;
}

const getUnderstandingLevel = (score: number) => {
  if (score >= 90) {
    return {
      level: 'Deep Understanding',
      message: 'You demonstrate contemplative fluency with these concepts.',
      encouragement: 'Consider exploring more advanced dimensions or related topics to deepen your integration.',
    };
  } else if (score >= 80) {
    return {
      level: 'Strong Grasp',
      message: 'You show solid understanding of these principles.',
      encouragement: 'Review the areas where your understanding wavered to strengthen your foundation.',
    };
  } else if (score >= 70) {
    return {
      level: 'Developing Understanding',
      message: 'You have a working knowledge of these concepts.',
      encouragement: 'Spend time with the explanations to deepen your comprehension of the nuances.',
    };
  } else if (score >= 60) {
    return {
      level: 'Emerging Familiarity',
      message: 'You are building foundational awareness.',
      encouragement: 'Consider revisiting the source materials before exploring further questions.',
    };
  } else {
    return {
      level: 'Beginning Exploration',
      message: 'These concepts are new territory for you.',
      encouragement: 'Take time to sit with the explanations. Understanding comes through patient reflection.',
    };
  }
};

const categoryLabels: Record<ILPGraphCategory, string> = {
  core: 'Core Concepts',
  body: 'Body Module',
  mind: 'Mind Module',
  spirit: 'Spirit Module',
  shadow: 'Shadow Module',
  'integral-theory': 'Integral Theory',
};

const reflectionPrompts = [
  "What concept from this session surprised you or challenged your assumptions?",
  "How might you apply one insight from this session to your daily practice?",
  "Which question revealed a gap in your understanding worth exploring?",
  "What connection did you notice between different concepts?",
  "Where do you sense your understanding is most integrated? Most fragmented?",
];

export const MissionDebrief: React.FC<MissionDebriefProps> = ({
  result,
  moduleColor,
  onRetry,
  onReviewAnswers,
}) => {
  const understanding = getUnderstandingLevel(result.score);
  const reflectionPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
  const timeMinutes = Math.floor(result.timeSpent / 60);
  const timeSeconds = result.timeSpent % 60;

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={`text-stone-100 ${typography.h3}`}>
          Session Complete
        </h1>
        <p className={`${typography.body} text-stone-500`}>
          {categoryLabels[result.category]} · {timeMinutes > 0 ? `${timeMinutes}m ` : ''}{timeSeconds}s
        </p>
      </div>

      {/* Score Summary */}
      <div className="bg-stone-900/40 rounded-xl p-8 border border-stone-800/50 text-center space-y-4">
        <div
          className="text-5xl font-serif"
          style={{ color: moduleColor }}
        >
          {result.score}%
        </div>
        <div className={`${typography.h4} text-stone-200`}>
          {understanding.level}
        </div>
        <div className={`${typography.body} text-stone-400 max-w-md mx-auto`}>
          {result.correctAnswers} of {result.totalQuestions} questions answered correctly
        </div>
      </div>

      {/* Understanding Message */}
      <div className="space-y-3">
        <p className={`${typography.body} text-stone-300 text-center`}>
          {understanding.message}
        </p>
        <p className={`${typography.body} text-stone-500 text-center`}>
          {understanding.encouragement}
        </p>
      </div>

      {/* Reflection Prompt */}
      <div className="bg-stone-900/30 rounded-lg p-6 border border-stone-800/30">
        <h3 className={`${typography.label} text-stone-500 uppercase tracking-wider mb-3`}>
          Invitation to Reflect
        </h3>
        <p className={`${typography.body} text-stone-300 italic`}>
          "{reflectionPrompt}"
        </p>
      </div>

      {/* Category Breakdown */}
      {Object.entries(result.categoryBreakdown).filter(([_, data]) => data.total > 0).length > 1 && (
        <div className="space-y-4">
          <h3 className={`${typography.label} text-stone-400`}>
            Understanding by Domain
          </h3>
          <div className="space-y-3">
            {Object.entries(result.categoryBreakdown)
              .filter(([_, data]) => data.total > 0)
              .map(([category, data]) => {
                const percentage = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className={`flex justify-between ${typography.label}`}>
                      <span className="text-stone-400">{categoryLabels[category as ILPGraphCategory]}</span>
                      <span className="text-stone-300">{data.correct}/{data.total}</span>
                    </div>
                    <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          background: moduleColor,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onReviewAnswers}
          className={`w-full ${getButtonClass('lg', 'primary')} flex items-center justify-center gap-2`}
        >
          <BookOpen size={18} />
          Review Explanations
        </button>

        <button
          onClick={onRetry}
          className={`w-full ${getButtonClass('lg', 'secondary')} flex items-center justify-center gap-2`}
        >
          <RefreshCw size={18} />
          Begin New Session
        </button>
      </div>

      {/* Closing Note */}
      <p className={`text-center ${typography.caption} text-stone-600 italic pt-4`}>
        "Understanding deepens through patient inquiry, not rapid accumulation."
      </p>
    </div>
  );
};
