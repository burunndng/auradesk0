import React, { useState, useEffect } from 'react';
import { deleteForumThread } from '../../../services/adminService';
import { getFlags, resolveFlag } from '../../../services/forumModerationService';
import type { ForumFlag } from '../../../types';

const REASON_BADGE: Record<string, string> = {
  crisis: 'bg-rose-900/40 text-rose-300 border-rose-700/30',
  harmful: 'bg-red-900/40 text-red-400 border-red-700/30',
  spam: 'bg-stone-800/60 text-stone-400 border-stone-700/30',
  'off-topic': 'bg-stone-800/60 text-stone-500 border-stone-700/30',
};

type SubTab = 'moderation' | 'threads';

export default function ForumTab() {
  const [subTab, setSubTab] = useState<SubTab>('moderation');

  return (
    <div className="space-y-4">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-stone-900/40 rounded-xl p-1 border border-stone-800/40">
        {(['moderation', 'threads'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              subTab === tab
                ? 'bg-stone-800/80 text-stone-200'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {tab === 'moderation' ? '🚩 Moderation Queue' : 'Threads'}
          </button>
        ))}
      </div>

      {subTab === 'moderation' ? <ModerationQueue /> : <ThreadList />}
    </div>
  );
}

// ── Moderation Queue ──────────────────────────────────────────────────────────

function ModerationQueue() {
  const [flags, setFlags] = useState<ForumFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const loadFlags = () => {
    setLoading(true);
    getFlags(showResolved ? undefined : false).then((f) => { setFlags(f); setLoading(false); });
  };

  useEffect(() => { loadFlags(); }, [showResolved]);

  const handleResolve = async (flagId: string, action: 'dismiss' | 'delete_post') => {
    setResolving(flagId);
    const ok = await resolveFlag(flagId, action);
    if (ok) setFlags((prev) => prev.filter((f) => f.id !== flagId));
    setResolving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-stone-500 text-xs">
          {flags.length} flag{flags.length !== 1 ? 's' : ''} {showResolved ? '(all)' : '(unresolved)'}
        </p>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
        >
          {showResolved ? 'Hide resolved' : 'Show all'}
        </button>
      </div>

      {flags.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-stone-500 text-sm">No flags to review.</p>
          <p className="text-stone-600 text-xs">Clean queue — nice.</p>
        </div>
      ) : (
        flags.map((flag) => (
          <div
            key={flag.id}
            className={`rounded-xl border p-4 space-y-2 transition-colors ${
              flag.reason === 'crisis'
                ? 'bg-rose-950/20 border-rose-800/40'
                : 'bg-stone-900/40 border-stone-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md border ${REASON_BADGE[flag.reason] || REASON_BADGE.spam}`}>
                  {flag.reason}
                </span>
                <span className="text-stone-600 text-xs">
                  flagged by {flag.reporter_name || 'unknown'}
                </span>
              </div>
              <span className="text-stone-600 text-xs">
                {new Date(flag.created_at).toLocaleDateString()}
              </span>
            </div>

            {flag.post_content && (
              <div className="bg-stone-950/40 rounded-lg px-3 py-2 border border-stone-800/30">
                <p className="text-stone-300 text-sm leading-relaxed line-clamp-3">
                  {flag.post_content}
                </p>
              </div>
            )}

            {!flag.resolved && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleResolve(flag.id, 'dismiss')}
                  disabled={resolving === flag.id}
                  className="px-3 py-1.5 text-xs bg-stone-800/60 hover:bg-stone-700/60 text-stone-300 rounded-lg border border-stone-700/40 transition-colors disabled:opacity-40"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleResolve(flag.id, 'delete_post')}
                  disabled={resolving === flag.id}
                  className="px-3 py-1.5 text-xs bg-rose-900/30 hover:bg-rose-800/40 text-rose-300 rounded-lg border border-rose-700/30 transition-colors disabled:opacity-40"
                >
                  Delete Post
                </button>
              </div>
            )}

            {flag.resolved && (
              <p className="text-stone-600 text-xs italic">Resolved</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── Thread List ───────────────────────────────────────────────────────────────

function ThreadList() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../../services/forumService').then((mod) => {
      mod.getThreads(undefined, { limit: 50, offset: 0 }).then((res: any) => {
        setThreads(res?.threads || []);
        setLoading(false);
      });
    });
  }, []);

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm('Delete this thread and all its posts?')) return;
    const ok = await deleteForumThread(id);
    if (ok) setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="flex items-center justify-between bg-stone-900/40 border border-stone-800/40 rounded-xl px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-stone-200 text-sm truncate">{thread.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-stone-500 text-xs">{thread.category}</span>
              <span className="text-stone-700 text-xs">·</span>
              <span className="text-stone-500 text-xs">{thread.reply_count || 0} replies</span>
              {thread.is_pinned && (
                <span className="text-amber-500/70 text-xs">📌 pinned</span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDeleteThread(thread.id)}
            className="ml-3 text-xs text-rose-500/70 hover:text-rose-400 border border-rose-900/30 hover:border-rose-700/40 rounded-lg px-3 py-1.5 flex-shrink-0 transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
      {threads.length === 0 && (
        <p className="text-stone-500 text-center py-8 text-sm">No threads.</p>
      )}
    </div>
  );
}
