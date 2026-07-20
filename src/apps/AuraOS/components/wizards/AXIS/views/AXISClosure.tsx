/**
 * AXIS Closure
 * Session completion - close or keep open
 *
 * Design: stone-950 base · Violet secondary
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { AXISSession } from '../../../../types';

interface AXISClosureProps {
  session: AXISSession;
  onClose: () => void;
  onKeepOpen: () => void;
}

export default function AXISClosure({ session, onClose, onKeepOpen }: AXISClosureProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Success Indicator */}
      <div className="inline-block text-emerald-400 mb-1">
        <CheckCircle size={48} strokeWidth={1.5} />
      </div>

      {/* Message */}
      <div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Reflection Saved</h2>
        <p className="text-sm text-stone-400">Your insight has been captured.</p>
      </div>

      {/* Session Info */}
      <div className="bg-stone-900/40 border border-violet-500/15 rounded-xl p-4 text-left">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">Session</p>
        <p className="text-stone-100 font-serif text-lg mb-2">{session.title}</p>
        <p className="text-sm text-stone-400 leading-relaxed">{session.intention}</p>
      </div>

      {/* Decision */}
      <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-5">
        <p className="text-sm text-stone-300 mb-4">Is this session complete?</p>
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-900/20"
          >
            Close Session
          </button>
          <button
            onClick={onKeepOpen}
            className="w-full px-4 py-2.5 bg-stone-800/60 hover:bg-stone-800 text-stone-300 hover:text-stone-100 rounded-xl border border-stone-700/30 hover:border-stone-600 transition-all"
          >
            Keep Open
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mt-3">
          <div className="text-center">This topic is resolved for now.</div>
          <div className="text-center">I'll return to this later.</div>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-stone-600 italic">
        Your reflection is saved to your Insights. You can return anytime.
      </p>
    </div>
  );
}
