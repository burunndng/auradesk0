/**
 * Somatic Cartography — GroundingPractice
 * Standalone text-based grounding. No timer pressure. No AI.
 */

import React, { useState } from 'react';
import { ResonanceFieldIcon } from '../../visualizations/SacredGeometryIcons';

interface GroundingPracticeProps {
  onBack: () => void;
}

const practices = [
  {
    id: '5-4-3-2-1',
    title: '5-4-3-2-1 Sensory',
    steps: [
      'Name 5 things you can see right now',
      'Notice 4 things you can physically feel (feet on floor, temperature, texture of clothing)',
      'Listen for 3 things you can hear',
      'Notice 2 things you can smell (or remember a familiar scent)',
      'Notice 1 thing you can taste',
    ],
  },
  {
    id: 'feet-chest',
    title: 'Feet & Chest',
    steps: [
      'Feel the surface beneath your feet — the weight, the pressure, the temperature',
      'Place one hand on your chest',
      'Take one slow breath into your chest, feel the rise and fall',
      'Stay here for a moment — you are here, in a body, on solid ground',
    ],
  },
  {
    id: 'orient',
    title: 'Orient to the Room',
    steps: [
      'Slowly look around the room',
      'Name 3 objects out loud or in your mind',
      'Notice their colors, shapes, distances',
      'Let your eyes land on something that feels neutral or pleasant and stay there for a breath',
    ],
  },
  {
    id: 'three-breaths',
    title: 'Three Slow Breaths',
    steps: [
      'Breathe in slowly — count to 4',
      'Hold briefly — count to 2',
      'Breathe out slowly — count to 6',
      'Repeat two more times',
      'Return to natural breath',
    ],
  },
];

export default function GroundingPractice({ onBack }: GroundingPracticeProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ResonanceFieldIcon size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-neutral-100">Grounding Practice</h2>
          <p className="text-neutral-500 text-sm">Choose one or try them all — no timer, no pressure</p>
        </div>
      </div>

      <div className="space-y-4">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className={`bg-neutral-900/50 border rounded-xl overflow-hidden transition-all duration-200 ${
              completed.has(practice.id) ? 'border-emerald-500/20' : 'border-neutral-800'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-neutral-200 font-medium">{practice.title}</h3>
                <button
                  onClick={() => toggleCompleted(practice.id)}
                  className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    completed.has(practice.id)
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {completed.has(practice.id) ? 'Done ✓' : 'I did this'}
                </button>
              </div>
              <ol className="space-y-2">
                {practice.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-400">
                    <span className="text-emerald-600 font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>

      {completed.size > 0 && (
        <div className="text-center py-4">
          <p className="text-neutral-500 text-sm">
            {completed.size === practices.length
              ? 'All done. Take a moment before moving on.'
              : `${completed.size} practice${completed.size > 1 ? 's' : ''} complete.`}
          </p>
        </div>
      )}
    </div>
  );
}
