import React, { useState, useEffect } from 'react';
import { JourneyCard } from '../../types.ts';
import { CheckCircle2, Circle, ArrowRight, BookOpen } from 'lucide-react';

interface LearningCardProps {
  card: JourneyCard;
  isCompleted: boolean;
  onComplete: () => void;
}

export default function LearningCard({ card, isCompleted, onComplete }: LearningCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setJustCompleted(false);
  }, [card.id]);

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (card.check && index === card.check.correctIndex) {
      setJustCompleted(true);
      setTimeout(() => {
        setJustCompleted(false);
        onComplete();
      }, 1000);
    }
  };

  return (
    <article className="animate-in fade-in duration-500 ease-out">
      
      {/* 1. TITLE & CONCEPT */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-stone-100 mb-6 leading-tight tracking-tight drop-shadow-sm">
          {card.title}
        </h1>
        <div className="text-xl md:text-2xl text-amber-200/90 font-light leading-relaxed border-l-2 border-amber-500/40 pl-6">
          {card.keyIdea}
        </div>
      </header>

      {/* 2. EXPLANATION (Editorial Style) */}
      <section className="mb-12 space-y-6">
        {card.explain.map((point, idx) => (
          <p key={idx} className="text-lg text-stone-300 leading-relaxed font-sans group hover:text-stone-200 transition-colors">
            {point}
          </p>
        ))}
      </section>

      {/* 3. EXAMPLE (Blockquote - Crimson/Rose) */}
      <section className="mb-12 pl-6 border-l-2 border-rose-500/30">
        <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Example</h3>
        <p className="text-lg text-stone-400 italic font-serif">
          "{card.example}"
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* 4. TRY IT (Action Card - Amber/Stone) */}
        <div className="bg-stone-900/50 rounded-lg p-6 border border-amber-900/20 hover:border-amber-700/40 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 relative z-10">Micro-Practice</h3>
          <p className="text-stone-200 font-medium relative z-10">
            {card.tryIt}
          </p>
        </div>

        {/* 5. CHECK (Quiz - Stone/Emerald) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between">
            Knowledge Check
            {isCompleted && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Complete</span>}
          </h3>
          
          <p className="text-sm text-stone-300 font-medium">
            {card.check.question}
          </p>

          <div className="space-y-2">
            {card.check.answers.map((answer, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === card.check.correctIndex;
              const showResult = isSelected;

              let style = "border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200 hover:border-stone-700";
              if (showResult) {
                if (isCorrect) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]";
                else style = "border-red-500/50 bg-red-500/10 text-red-300";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  disabled={isCompleted && isCorrect}
                  className={`w-full text-left py-3 px-4 rounded border text-sm transition-all duration-200 ${style}`}
                >
                  {answer}
                </button>
              );
            })}
          </div>
          {selectedAnswer !== null && selectedAnswer !== card.check.correctIndex && (
            <p className="text-xs text-rose-400/70 pt-1">Not quite — try again.</p>
          )}
        </div>
      </div>

    </article>
  );
}
