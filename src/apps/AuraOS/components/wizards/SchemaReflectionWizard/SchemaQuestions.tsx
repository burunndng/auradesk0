/**
 * Schema Reflection Wizard - Questions Step
 * Progressive disclosure of structured multiple-choice questions.
 * Design: stone-950 system, violet secondary, amber interactions.
 */

import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';
import { QuestionResponse } from '../../../services/schemaReflectionService';

interface SchemaQuestionsProps {
  schema: SchemaDefinition;
  questions: QuestionResponse[];
  currentIndex: number;
  onResponseChange: (questionId: string, text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SchemaQuestions({
  schema,
  questions,
  currentIndex,
  onResponseChange,
  onNext,
  onBack
}: SchemaQuestionsProps) {
  const [currentResponse, setCurrentResponse] = useState('');
  const [saveIndicator, setSaveIndicator] = useState(false);

  if (questions.length === 0 || currentIndex >= questions.length) {
    return <div className="text-stone-500 text-sm">No questions available</div>;
  }

  const question = questions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isLastQuestion = currentIndex === questions.length - 1;

  // Load response on question change
  useEffect(() => {
    setCurrentResponse(question.response || '');
  }, [currentIndex, question]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentResponse !== question.response) {
        onResponseChange(question.questionId, currentResponse);
        setSaveIndicator(true);
        setTimeout(() => setSaveIndicator(false), 500);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentResponse, question.questionId, question.response, onResponseChange]);

  // Auto-advance to next question after selection
  const handleSelectAndAdvance = (choice: string) => {
    setCurrentResponse(choice);
    setTimeout(() => {
      onResponseChange(question.questionId, choice);
      if (!isLastQuestion) {
        onNext();
      }
    }, 100);
  };

  // Category styling
  const getCategoryStyle = (category?: string): string => {
    const map: Record<string, string> = {
      'Origins & Development': 'bg-violet-950/30 text-violet-300 border-violet-500/20',
      'How It Shows Up': 'bg-amber-950/30 text-amber-300 border-amber-500/20',
      'Impact on Life': 'bg-red-950/30 text-red-300 border-red-500/20',
      'Coping Strategies': 'bg-emerald-950/30 text-emerald-300 border-emerald-500/20',
      'Self-Awareness': 'bg-indigo-950/30 text-indigo-300 border-indigo-500/20',
      'Moving Forward': 'bg-teal-950/30 text-teal-300 border-teal-500/20',
    };
    return map[category || ''] || 'bg-stone-900/40 text-stone-400 border-stone-700/30';
  };

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <Eye size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">
          {schema.plain_name}
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Select the option that resonates most with your experience.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400">{progress}%</span>
        </div>
        <div className="w-full bg-stone-800 rounded-full h-1 overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-1 justify-start flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i < currentIndex ? 'bg-amber-500' : i === currentIndex ? 'bg-amber-400' : 'bg-stone-800'
              }`}
          />
        ))}
      </div>

      {/* Category Badge */}
      {question.category && (
        <div className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${getCategoryStyle(question.category)}`}>
          {question.category}
        </div>
      )}

      {/* Question Text */}
      <p className="text-base font-serif text-stone-100 leading-relaxed">
        {question.question}
      </p>

      {/* Multiple Choice Options */}
      <div className="space-y-2">
        {question.choices && question.choices.length > 0 ? (
          question.choices.map((choice, idx) => {
            const active = currentResponse === choice;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAndAdvance(choice)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${active
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-stone-900/60 border-stone-700/40 text-stone-300 hover:border-stone-600'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 shrink-0 transition-all ${active ? 'bg-amber-500 border-amber-500' : 'border-stone-600'
                    }`} />
                  <span className="text-sm leading-relaxed">{choice}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-stone-500 text-sm">No options available</div>
        )}
      </div>

      {/* Save Indicator */}
      {currentResponse && (
        <div className="text-center">
          {saveIndicator ? (
            <p className="text-xs text-emerald-400 font-medium">✓ Saved</p>
          ) : (
            <p className="text-xs text-stone-600">
              {isLastQuestion ? 'Selected. Click Next to analyse.' : 'Auto-advancing to next question…'}
            </p>
          )}
        </div>
      )}

      {/* Navigation hint */}
      <p className="text-xs text-stone-600 italic text-center">
        {currentIndex === 0
          ? 'You can go back to adjust any previous response after completing all questions.'
          : 'Click Back to return to the previous question.'}
      </p>
    </div>
  );
}
