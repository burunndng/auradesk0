/**
 * AXIS Waiting
 * "Go do your thing" - session active, waiting for user to complete the experience
 *
 * Design: stone-950 base · Violet secondary
 */

import React from 'react';
import { Compass, ChevronLeft } from 'lucide-react';
import type { AXISSession } from '../../../../types';

interface AXISWaitingProps {
  session: AXISSession;
  onReady: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export default function AXISWaiting({ session, onReady, onBack, onCancel }: AXISWaitingProps) {
  return (
    <div className="space-y-6">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><Compass size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">{session.title}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60">Session Active</p>
      </div>

      {/* Session Info */}
      <div className="space-y-3">
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Intention</p>
          <p className="text-sm text-stone-300 leading-relaxed">{session.intention}</p>
        </div>
        {session.successCriteria && (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Success Criteria</p>
            <p className="text-sm text-stone-300 leading-relaxed">{session.successCriteria}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-violet-950/20 to-stone-900/60 border border-violet-500/15 rounded-xl p-5 text-center">
        <p className="text-stone-200 text-base font-serif leading-relaxed mb-1">Go do your thing.</p>
        <p className="text-stone-400 text-sm leading-relaxed">
          When you're ready, come back and capture what mattered.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={onReady}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-900/20"
        >
          I'm Done — Ready to Reflect
        </button>
        <button
          onClick={onCancel}
          className="w-full px-4 py-2.5 bg-stone-900/60 hover:bg-stone-800/60 text-stone-400 hover:text-stone-200 rounded-xl border border-stone-700/30 hover:border-stone-600 transition-all text-sm"
        >
          Cancel Session
        </button>
      </div>
    </div>
  );
}
