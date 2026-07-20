/**
 * Schema Reflection Wizard - Step 1: Intro
 * Introduces schemas and sets expectations.
 * Design: stone-950 system, violet secondary accent, serif headings.
 */

import React from 'react';
import { Layers, Info } from 'lucide-react';

export default function SchemaIntro() {
  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-6">
        <div className="inline-block text-amber-400/60 mb-3">
          <Layers size={44} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Welcome to Schema Reflection</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Schemas are emotional blueprints formed in childhood. They're patterns of beliefs, feelings, and behaviors that shape how you experience relationships, your own capabilities, and your worth.
        </p>
      </div>

      {/* What you'll explore */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">What You'll Explore</p>
        <div className="space-y-2">
          {[
            '7 common emotional schemas across different life domains',
            'How each pattern might show up in your own life',
            'A personalised reflection on the pattern that resonates most',
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 bg-stone-900/40 border border-stone-700/30 rounded-xl text-sm text-stone-300">
              <span className="text-amber-400 shrink-0">◆</span>
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important notes */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Important Notes</p>
        <div className="space-y-2">
          {[
            'This is reflection, not diagnosis. Schemas exist on a spectrum.',
            'No schema is "bad." Each developed as a way to protect you.',
            'Awareness is the first step toward change and healing.',
          ].map((item, i) => (
            <div key={i} className="flex gap-3 text-sm text-stone-400">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-4 flex items-start gap-3">
        <Info size={14} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-xs text-stone-500 italic leading-relaxed">
          Schema Therapy is a structured, evidence-based approach developed by Dr. Jeffrey Young. If you find these patterns deeply affecting your life, working with a trained therapist can be transformative.
        </p>
      </div>
    </div>
  );
}
