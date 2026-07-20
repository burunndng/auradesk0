/**
 * AXIS Meta-Mirror
 * Macro-synthesis trajectory report — auto-triggers after every 5th closed session.
 * Surfaces emerging patterns, stuck points, language shifts, outgrown beliefs, and arc.
 *
 * Design: stone-950 base · Violet secondary
 */

import React, { useEffect, useState } from 'react';
import { Loader2, Eye } from 'lucide-react';
import type { AXISSession, AXISAnchor, AXISMetaSynthesis as AXISMetaSynthesisType } from '../../../../types';
import { generateMetaSynthesis } from '../../../../services/AXISService';

interface AXISMetaSynthesisProps {
  sessions: AXISSession[];
  anchor: AXISAnchor;
  onComplete: () => void;
}

export default function AXISMetaSynthesisView({
  sessions,
  anchor,
  onComplete,
}: AXISMetaSynthesisProps) {
  const [report, setReport] = useState<AXISMetaSynthesisType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Collect the last 5 closed, non-off-axis briefs
        const briefs = sessions
          .filter(s => s.status === 'closed' && !s.isOffAxis && s.synthesisBrief)
          .sort((a, b) => new Date(b.closedAt ?? b.createdAt).getTime() - new Date(a.closedAt ?? a.createdAt).getTime())
          .slice(0, 5)
          .map(s => s.synthesisBrief!);

        if (briefs.length === 0) {
          if (!cancelled) { setError(true); setLoading(false); }
          return;
        }

        const generated = await generateMetaSynthesis(briefs, anchor);
        if (!cancelled) {
          setReport(generated);
          setLoading(false);
        }
      } catch (err) {
        console.error('[AXISMetaSynthesis] Error generating meta-synthesis:', err);
        if (!cancelled) { setError(true); setLoading(false); }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [sessions, anchor, retryCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={28} className="text-amber-500 animate-spin" />
        <p className="text-sm text-stone-400 italic">Synthesising your trajectory report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 px-4">
        <p className="text-sm text-stone-300 text-center">
          Trajectory report failed. You can skip and continue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setError(false); setLoading(true); setRetryCount(c => c + 1); }}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-900/20"
          >
            Retry
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-700/60 text-stone-300 text-sm border border-stone-700/30 transition-all"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><Eye size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Trajectory Report</h2>
        <p className="text-xs text-stone-500">Meta-mirror across your last sessions</p>
      </div>

      {/* Overall Arc */}
      {report.trajectoryReport && (
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-stone-900/60 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Your Arc</p>
          <p className="text-sm text-stone-200 leading-relaxed">{report.trajectoryReport}</p>
        </div>
      )}

      {/* Emerging Patterns */}
      {report.emergingPatterns && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Emerging Patterns</p>
          <p className="text-sm text-stone-300 leading-relaxed">{report.emergingPatterns}</p>
        </div>
      )}

      {/* Stuck Points */}
      {report.stuckPoints && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-1.5">Stuck Points</p>
          <p className="text-sm text-stone-300 leading-relaxed">{report.stuckPoints}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Language Shift */}
        {report.languageShift && (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Language Shift</p>
            <p className="text-xs text-stone-300 leading-relaxed">{report.languageShift}</p>
          </div>
        )}

        {/* Outgrown Beliefs */}
        {report.outgrownBeliefs && (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Outgrown</p>
            <p className="text-xs text-stone-300 leading-relaxed">{report.outgrownBeliefs}</p>
          </div>
        )}
      </div>

      {/* Anchor Review Prompt */}
      {report.anchorReviewPrompt && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">Anchor Check-in</p>
          <p className="text-sm text-amber-200/90 font-serif italic">"{report.anchorReviewPrompt}"</p>
        </div>
      )}

      {/* Meta-awareness footnote */}
      <div className="text-center py-2">
        <p className="text-xs text-stone-600 italic">"The urge to find an arc in everything is itself a pattern worth examining."</p>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          onClick={onComplete}
          className="px-8 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-900/20"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
