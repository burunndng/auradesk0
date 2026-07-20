/**
 * AXIS Mode Picker
 * Choose between native AI conversation or bridge to external AI
 *
 * Design: stone-950 base · Violet secondary
 */

import React from 'react';
import { ChevronLeft, MessageSquare, ExternalLink, Layers } from 'lucide-react';
import type { AXISSynthesisBrief } from '../../../../types';

interface Props {
  previousSynthesis?: AXISSynthesisBrief | null;
  onStartNative: () => void;
  onStartBridge: () => void;
  onBack: () => void;
}

export default function AXISModePicker({
  previousSynthesis,
  onStartNative,
  onStartBridge,
  onBack,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Chapter heading */}
      <div className="text-center mb-4">
        <div className="inline-block text-violet-400/60 mb-3"><Layers size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Choose Your Mode</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          How would you like to work with AXIS today?
        </p>
      </div>

      {/* Mode Options */}
      <div className="space-y-3">
        <button
          onClick={onStartNative}
          className="w-full px-5 py-4 bg-gradient-to-br from-violet-950/30 to-stone-900/60 border border-violet-500/25 hover:border-violet-400/40 rounded-xl text-left transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5 text-violet-400/80 group-hover:text-violet-400 transition-colors">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-100 mb-1">Chat in AXIS</p>
              <p className="text-xs text-stone-400 leading-relaxed">AI-guided Socratic session inside the app. Your context, anchor, and prior briefs are injected automatically.</p>
            </div>
          </div>
        </button>

        <button
          onClick={onStartBridge}
          className="w-full px-5 py-4 bg-stone-900/40 border border-stone-700/30 hover:border-stone-600 rounded-xl text-left transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5 text-stone-500 group-hover:text-stone-300 transition-colors">
              <ExternalLink size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-200 mb-1">Bridge to External AI</p>
              <p className="text-xs text-stone-400 leading-relaxed">Copy formatted prompts to Claude, ChatGPT, or any other AI. Full context package and synthesis prompt included.</p>
            </div>
          </div>
        </button>
      </div>

      {/* Previous Synthesis Card */}
      {previousSynthesis && (
        <div className="bg-gradient-to-br from-violet-950/20 to-stone-900/60 border border-violet-500/15 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 block mb-1.5">Last Session Insight</span>
          <p className="text-sm text-stone-300 leading-relaxed">{previousSynthesis.sessionFindings?.keyInsight}</p>
          {previousSynthesis.openThreads?.[0] && (
            <p className="text-xs text-stone-500 mt-2 italic">Still open: {previousSynthesis.openThreads[0]}</p>
          )}
        </div>
      )}

      {/* Back */}
      <div className="pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-all"
        >
          <ChevronLeft size={14} /> Back to framing
        </button>
      </div>
    </div>
  );
}
