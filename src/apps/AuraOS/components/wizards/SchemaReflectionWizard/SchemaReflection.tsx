/**
 * Schema Reflection Wizard - Legacy Reflection Step
 * Journaling and reflection on primary schema.
 * Design: stone-950 system, violet secondary.
 */

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';

interface SchemaReflectionProps {
  schema: SchemaDefinition;
  questions: string[];
  reflectionText: string;
  onReflectionChange: (text: string) => void;
}

export default function SchemaReflection({
  schema,
  questions,
  reflectionText,
  onReflectionChange
}: SchemaReflectionProps) {
  const [showQuestions, setShowQuestions] = useState(true);

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <Eye size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">
          Reflect on {schema.plain_name}
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          This is the pattern that resonated most strongly with you. Take time to explore what comes up.
        </p>
      </div>

      {/* Reflection Questions */}
      {showQuestions && questions.length > 0 && (
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Reflection Questions</p>
            <button
              onClick={() => setShowQuestions(false)}
              className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-3 text-sm text-stone-300">
                <span className="text-amber-400 font-mono shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-600 mt-3 italic">
            You don't need to answer these directly — let them guide your reflection.
          </p>
        </div>
      )}

      {!showQuestions && (
        <button
          onClick={() => setShowQuestions(true)}
          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Show questions
        </button>
      )}

      {/* Reflection Textarea */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Your Reflection</p>
        <textarea
          value={reflectionText}
          onChange={e => onReflectionChange(e.target.value)}
          placeholder={`What comes up for you as you explore this pattern?

You might consider:
• When you first noticed this pattern
• How it shows up in your relationships
• What it costs you
• What you'd like to be different
• Any insights or memories that arise

This is private reflection. There's no 'right' answer.`}
          className="w-full h-48 bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all leading-relaxed"
        />
        <p className="text-xs text-stone-600 mt-1">
          <span className="font-mono text-stone-500">{reflectionText.length}</span> characters
        </p>
      </div>

      {/* Optional Note */}
      <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-4">
        <p className="text-xs text-stone-500 italic leading-relaxed">
          Your reflection will be saved as a private insight in your account. You can return to it anytime to track how your relationship with this pattern evolves.
        </p>
      </div>

      <p className="text-xs text-stone-600 italic text-center">Take your time. There's no rush.</p>
    </div>
  );
}
