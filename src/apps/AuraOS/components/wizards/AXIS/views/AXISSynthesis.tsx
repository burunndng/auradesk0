import React, { useEffect, useState } from 'react';
import { AXISSession, AXISAnchor, AXISConversationMessage, AXISSynthesisBrief, MemoryItem, MemoryItemKind } from '../../../../types';
import { generateSynthesisBrief, saveSessionToSupabase, UUID_RE } from '../../../../services/AXISService';
import { writeLatestSynthesis, writeMemoryItem } from '../../../../services/AXISStorage';
import ChronolithIcon from '../../../../components/visualizations/SacredGeometryIcons/ChronolithIcon';
import NonDualEyeIcon from '../../../../components/visualizations/SacredGeometryIcons/NonDualEyeIcon';

/**
 * AXIS Synthesis — Weighted session artifact
 * Design: stone-950 base · Violet secondary
 */

const EMPTY_BRIEF: AXISSynthesisBrief = {
  userPatterns: { coreDynamic: '', typicalDefenses: '', blindSpots: '', triggers: '' },
  sessionFindings: { presentingToRoot: '', keyInsight: '', shift: 'No', successCriteriaMet: 'Unmet' },
  analystNotes: { effective: '', avoid: '' },
  openThreads: [],
  nextSession: { entryPoint: '', hypothesisToTest: '' },
  cumulativeContext: '',
  generatedAt: new Date().toISOString(),
};

interface AXISSynthesisProps {
  session: AXISSession;
  anchor: AXISAnchor;
  conversationHistory: AXISConversationMessage[];
  userId: string;
  previousSynthesis?: AXISSynthesisBrief | null;
  onComplete: (brief: AXISSynthesisBrief) => void;
}

export default function AXISSynthesis({
  session,
  anchor,
  conversationHistory,
  userId,
  previousSynthesis,
  onComplete,
}: AXISSynthesisProps) {
  const [brief, setBrief] = useState<AXISSynthesisBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'failed' | null>(null);
  const [userAnnotation, setUserAnnotation] = useState('');
  const [enactment, setEnactment] = useState({ ul: '', ur: '', ll: '', lr: '' });
  // Save candidates: tracks which proposedUserSaves have been dismissed or saved
  const [dismissedCandidates, setDismissedCandidates] = useState<Set<number>>(new Set());
  const [savedCandidates, setSavedCandidates] = useState<Set<number>>(new Set());
  // Per-candidate kind overrides (defaults from AI suggestion)
  const [candidateKinds, setCandidateKinds] = useState<Record<number, MemoryItemKind>>({});

  const handleSaveCandidate = async (idx: number, text: string, kind: MemoryItemKind) => {
    const item: MemoryItem = {
      id: crypto.randomUUID(),
      text,
      kind,
      scope: 'global',
      status: 'active',
      source: 'user',
      userApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeMemoryItem(item);
    setSavedCandidates(prev => new Set([...prev, idx]));
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryCount(c => c + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const generated = await generateSynthesisBrief(
          conversationHistory,
          session.refinedIntention || session.intention,
          anchor,
          session.successCriteria,
          session.activityType,
          previousSynthesis,
        );
        if (cancelled) return;

        const updatedSession: AXISSession = {
          ...session,
          synthesisBrief: generated,
          status: 'closed',
          closedAt: new Date().toISOString(),
        };

        if (UUID_RE.test(userId)) {
          setSaveStatus('saving');
          // Synthesis is saved to Supabase via saveSessionToSupabase (includes synthesisBrief field)
          const saved = await saveSessionToSupabase(updatedSession, userId);
          if (cancelled) return;
          setSaveStatus(saved ? 'saved' : 'failed');
        } else {
          // Anon user — persist to IndexedDB so loadPreviousSynthesis can find it
          await writeLatestSynthesis(generated);
          setSaveStatus('saved');
        }

        setBrief(generated);
      } catch (err) {
        console.error('[AXISSynthesis] Error generating synthesis:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, anchor.content, conversationHistory, userId, retryCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ChronolithIcon size={28} className="text-amber-500 animate-spin" />
        <p className="text-sm text-stone-400 italic">Synthesising your session brief…</p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 px-4">
        <p className="text-sm text-stone-300 text-center">
          Brief generation failed. Your session data is preserved.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-900/20"
          >
            Retry
          </button>
          <button
            onClick={() => onComplete({ ...EMPTY_BRIEF, generatedAt: new Date().toISOString() })}
            className="px-6 py-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-700/60 text-stone-300 text-sm border border-stone-700/30 transition-all"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  const downloadBriefAsMarkdown = () => {
    if (!brief) return;

    const content = `# AXIS Session Brief: ${session.title || 'Untitled Session'}
Date: ${new Date(brief.generatedAt || Date.now()).toLocaleDateString()}

## Key Insight
${brief.sessionFindings?.keyInsight || 'N/A'}

## Presenting → Root
${brief.sessionFindings?.presentingToRoot || 'N/A'}

## Shift
${brief.sessionFindings?.shift || 'N/A'}

## Success Criteria Met
${brief.sessionFindings?.successCriteriaMet || 'N/A'}

## Open Threads
${brief.openThreads?.map(t => `- ${t}`).join('\n') || 'None'}

## Next Session
Entry Point: ${brief.nextSession?.entryPoint || 'N/A'}
Hypothesis: ${brief.nextSession?.hypothesisToTest || 'N/A'}

## Behavioral Commitment
${brief.behavioralCommitment || 'None'}

## User Patterns
Core Dynamic: ${brief.userPatterns?.coreDynamic || 'N/A'}
Blind Spots: ${brief.userPatterns?.blindSpots || 'N/A'}
Protective Patterns: ${brief.userPatterns?.typicalDefenses || 'N/A'}
Triggers: ${brief.userPatterns?.triggers || 'N/A'}

## Patterns You've Named
${brief.persistentCoreTruths?.map(t => `- ${t}`).join('\n') || 'None'}

## Analyst Notes
What Worked: ${brief.analystNotes?.effective || 'N/A'}
What to Avoid: ${brief.analystNotes?.avoid || 'N/A'}

## Enactment Map
I (UL): ${brief.enactmentMap?.ul || '—'}
It (UR): ${brief.enactmentMap?.ur || '—'}
We (LL): ${brief.enactmentMap?.ll || '—'}
Its (LR): ${brief.enactmentMap?.lr || '—'}

${userAnnotation.trim() ? `## User Note\n${userAnnotation.trim()}\n` : ''}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axis-brief-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sf = brief.sessionFindings;
  const up = brief.userPatterns;
  const ns = brief.nextSession;
  const an = brief.analystNotes;

  return (
    <div className="space-y-5">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><NonDualEyeIcon size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Session Brief</h2>
        <p className="text-xs text-stone-500">{session.title}</p>
      </div>

      {/* Key Insight — hero card */}
      {sf?.keyInsight && (
        <div className="bg-gradient-to-br from-violet-950/25 to-stone-900/60 border border-violet-500/20 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Key Insight</p>
          <p className="text-base font-serif text-amber-300 leading-relaxed">"{sf.keyInsight}"</p>
        </div>
      )}

      {/* Presenting → Root */}
      {sf?.presentingToRoot && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Presenting → Root</p>
          <p className="text-sm text-stone-300 leading-relaxed">{sf.presentingToRoot}</p>
        </div>
      )}

      {/* Shift + Success */}
      <div className="grid grid-cols-2 gap-3">
        {sf?.shift && (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Shift</p>
            <p className="text-sm text-stone-300">{sf.shift}</p>
          </div>
        )}
        {sf?.successCriteriaMet && (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Criteria</p>
            <p className="text-sm text-stone-300">{sf.successCriteriaMet}</p>
          </div>
        )}
      </div>

      {/* Open Threads */}
      {brief.openThreads?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Open Threads</p>
          <ul className="space-y-1">
            {brief.openThreads.map((t, i) => (
              <li key={i} className="text-sm text-stone-300 pl-3 border-l-2 border-violet-500/20">{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Session */}
      {(ns?.entryPoint || ns?.hypothesisToTest) && (
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-stone-900/60 px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60">Next Session</p>
          {ns.entryPoint && (
            <p className="text-sm text-stone-200 italic">"{ns.entryPoint}"</p>
          )}
          {ns.hypothesisToTest && (
            <p className="text-xs text-stone-400">Hypothesis: {ns.hypothesisToTest}</p>
          )}
        </div>
      )}

      {/* Behavioral Commitment */}
      {brief.behavioralCommitment && (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-1.5">Behavioral Commitment</p>
          <p className="text-sm text-stone-300 leading-relaxed">{brief.behavioralCommitment}</p>
        </div>
      )}

      {/* User Patterns (collapsed summary) */}
      {up?.coreDynamic && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Core Dynamic</p>
          <p className="text-sm text-stone-400">{up.coreDynamic}</p>
        </div>
      )}

      {/* New observations — surfaced by synthesis, written to memory store */}
      {brief.proposedNewTruths && brief.proposedNewTruths.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">New Observations</p>
          <ul className="space-y-1">
            {brief.proposedNewTruths.map((t, i) => (
              <li key={i} className="text-sm text-violet-300/80 pl-3 border-l-2 border-violet-500/20">{t}</li>
            ))}
          </ul>
          <p className="text-xs text-stone-600 mt-1">Added to your memory map automatically.</p>
        </div>
      )}

      {/* Analyst Notes */}
      {(an?.effective || an?.avoid) && (
        <div className="grid grid-cols-2 gap-3">
          {an.effective && (
            <div className="bg-emerald-950/20 border border-emerald-800/20 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-1">Worked</p>
              <p className="text-xs text-stone-300 leading-relaxed">{an.effective}</p>
            </div>
          )}
          {an.avoid && (
            <div className="bg-red-950/20 border border-red-800/20 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 mb-1">Avoid</p>
              <p className="text-xs text-stone-300 leading-relaxed">{an.avoid}</p>
            </div>
          )}
        </div>
      )}

      {/* AQAL Enactment Map */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Enactment Map</p>
          <p className="text-xs text-stone-600 mb-3">How this session moves into all four dimensions of your life.</p>
        </div>
        {[
          { key: 'ul', label: 'I (UL)', placeholder: 'What I now understand differently is…' },
          { key: 'ur', label: 'It (UR)', placeholder: 'One thing I will do differently this week is…' },
          { key: 'll', label: 'We (LL)', placeholder: 'One relationship or conversation this calls me toward is…' },
          { key: 'lr', label: 'Its (LR)', placeholder: 'One structure/environment/system I need to change or protect is…' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex gap-2 items-center">
            <span className="text-xs text-violet-400/80 font-mono w-14 shrink-0">{label}</span>
            <input
              value={enactment[key as keyof typeof enactment]}
              onChange={e => setEnactment(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 bg-stone-950/80 border border-stone-700/50 rounded-xl px-3 py-2 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
            />
          </div>
        ))}
      </div>

      {/* Meta-awareness footnote */}
      <div className="text-center py-2">
        <p className="text-xs text-stone-600 italic">"The drive to structure every insight is itself a pattern worth noticing."</p>
      </div>

      {/* Save Candidates — user-authored items the AI surfaced */}
      {brief.proposedUserSaves && brief.proposedUserSaves.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Worth naming from this session</p>
          {brief.proposedUserSaves.map((candidate, idx) => {
            if (dismissedCandidates.has(idx)) return null;
            const isSaved = savedCandidates.has(idx);
            const resolvedKind: MemoryItemKind = candidateKinds[idx] ?? candidate.kind ?? 'insight';
            const kindOptions: MemoryItemKind[] = ['insight', 'pattern', 'commitment', 'belief', 'definition', 'other'];
            return (
              <div key={idx} className="bg-stone-900/50 border border-violet-500/15 rounded-xl p-3 space-y-2">
                <p className="text-sm text-stone-200 leading-relaxed">{candidate.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={resolvedKind}
                    onChange={e => setCandidateKinds(prev => ({ ...prev, [idx]: e.target.value as MemoryItemKind }))}
                    disabled={isSaved}
                    className="text-xs bg-stone-800/80 border border-stone-700/40 rounded-lg px-2 py-1 text-stone-300 focus:outline-none focus:ring-1 focus:ring-violet-500/40 disabled:opacity-50"
                  >
                    {kindOptions.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {isSaved ? (
                    <span className="text-xs text-emerald-400">Saved to map</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSaveCandidate(idx, candidate.text, resolvedKind)}
                        className="text-xs px-3 py-1 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 text-violet-200 border border-violet-500/20 transition-all"
                      >
                        Save to my map
                      </button>
                      <button
                        onClick={() => setDismissedCandidates(prev => new Set([...prev, idx]))}
                        className="text-xs px-3 py-1 rounded-lg text-stone-500 hover:text-stone-400 transition-all"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Annotation */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Your Note (optional)</p>
        <textarea
          value={userAnnotation}
          onChange={e => setUserAnnotation(e.target.value)}
          placeholder="Add a correction, context, or note about this brief…"
          rows={2}
          className="w-full bg-stone-950/80 border border-stone-700/50 rounded-xl px-4 py-3 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 resize-none transition-all"
        />
      </div>

      <div className="pt-2 flex flex-col items-center gap-3">
        {saveStatus === 'saved' && (
          <p className="text-xs text-emerald-400">✓ Session saved to your history</p>
        )}
        {saveStatus === 'failed' && (
          <p className="text-xs text-amber-400">⚠ Couldn't save — copy your brief before closing</p>
        )}
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={downloadBriefAsMarkdown}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/25 hover:bg-violet-950/30 text-violet-200 text-sm font-medium transition-all"
          >
            Download .md
          </button>
          <button
            onClick={() => {
              const enactmentMap = (enactment.ul || enactment.ur || enactment.ll || enactment.lr)
                ? enactment : undefined;
              onComplete({ ...brief, userAnnotation: userAnnotation.trim() || undefined, enactmentMap });
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-900/20"
          >
            Complete Session
          </button>
        </div>
      </div>
    </div>
  );
}
