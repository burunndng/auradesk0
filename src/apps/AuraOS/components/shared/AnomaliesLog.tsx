/**
 * AI Moments Log
 * Shows recent interactions where AI acted unexpectedly
 * Frames anomalies as learning opportunities, not failures
 * Encourages reflection on how you relate to AI limitations
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { getGlitchEncounters } from '../../.claude/lib/promptSafetyValidator';

interface AIMomentsLogProps {
  onExplore?: () => void;
}

export function AIMomentsLog({ onExplore }: AIMomentsLogProps) {
  const encounters = getGlitchEncounters().slice(-3).reverse();

  if (encounters.length === 0) {
    return null;
  }

  const getContextLabel = (context?: string): string => {
    if (!context) return 'AI Interaction';
    if (context.toLowerCase().includes('coach')) return 'Coach';
    if (context.toLowerCase().includes('wizard')) return 'Wizard';
    return 'AI';
  };

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      window.dispatchEvent(new CustomEvent('openMirage'));
    }
  };

  return (
    <div className="bg-slate-800/20 border border-slate-600/30 rounded-lg p-4 space-y-3">
      <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
        <Sparkles size={14} className="text-slate-500" />
        Moments of Discovery
      </h3>

      <div className="space-y-2">
        {encounters.map((enc, idx) => {
          const time = new Date(enc.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          const context = getContextLabel(enc.context);
          const tokenCount = enc.detections.length;

          return (
            <button
              key={idx}
              onClick={handleExplore}
              className="w-full text-left text-xs bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600/20 rounded p-3 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-slate-400">{time}</div>
                  <div className="text-slate-300 text-xs mt-1">
                    {context} encountered unexpected behavior
                    {tokenCount > 1 && ` (${tokenCount} tokens)`}
                  </div>
                </div>
                <div className="text-slate-500 group-hover:text-slate-300 transition-colors ml-2">
                  →
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleExplore}
        className="w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-2 border-t border-slate-600/20 mt-3"
      >
        Explore these moments in MIRAGE
      </button>
    </div>
  );
}
