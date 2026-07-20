/**
 * ModerationQueue - Admin-only flagged posts review
 */

import React, { useEffect, useState } from 'react';
import { ForumFlag } from '../../types';
import { getFlags, resolveFlag } from '../../services/forumModerationService';
import { Flag, Trash2, XCircle, Clock } from 'lucide-react';

interface ModerationQueueProps {
  onNavigateToThread?: (threadId: string) => void;
}

export default function ModerationQueue({ onNavigateToThread }: ModerationQueueProps) {
  const [flags, setFlags] = useState<ForumFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    loadFlags();
  }, [showResolved]);

  const loadFlags = async () => {
    setLoading(true);
    const data = await getFlags(showResolved ? undefined : false);
    setFlags(data);
    setLoading(false);
  };

  const handleResolve = async (flagId: string, action: 'dismiss' | 'delete_post') => {
    setResolving(flagId);
    const success = await resolveFlag(flagId, action);
    if (success) {
      await loadFlags(); // Refetch to reflect resolved status
    }
    setResolving(null);
  };

  const reasonColors: Record<string, string> = {
    spam: 'text-amber-400 bg-amber-900/30 border-amber-700/40',
    harmful: 'text-rose-400 bg-rose-900/30 border-rose-700/40',
    'off-topic': 'text-stone-400 bg-stone-800/50 border-stone-700/40',
    crisis: 'text-red-400 bg-red-900/30 border-red-700/40',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-light text-stone-200 flex items-center gap-2">
          <Flag size={18} className="text-amber-400" />
          Moderation Queue
        </h3>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showResolved
              ? 'bg-stone-700 text-stone-300'
              : 'bg-stone-800 text-stone-500 hover:text-stone-300'
          }`}
        >
          {showResolved ? 'Show All' : 'Show Unresolved'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-stone-500 text-sm">Loading flags...</div>
      ) : flags.length === 0 ? (
        <div className="text-center py-8 text-stone-600 text-sm">
          No flagged posts to review.
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 rounded-xl bg-stone-900/50 border border-stone-800 space-y-3"
            >
              {/* Header: reason + reporter + time */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      reasonColors[flag.reason] || reasonColors['off-topic']
                    }`}
                  >
                    {flag.reason}
                  </span>
                  <span className="text-xs text-stone-500">
                    by {flag.reporter_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-600">
                  <Clock size={11} />
                  {new Date(flag.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Post content snippet */}
              <div className="text-sm text-stone-400 bg-stone-950/50 rounded-lg p-3 border border-stone-800/50 line-clamp-3">
                {flag.post_content || '[content unavailable]'}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onNavigateToThread && (
                  <button
                    onClick={() => onNavigateToThread(flag.thread_id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-teal-400 bg-teal-900/20 border border-teal-700/30 hover:bg-teal-900/40 transition-colors"
                  >
                    View Thread
                  </button>
                )}
                {!flag.resolved && (
                  <>
                    <button
                      onClick={() => handleResolve(flag.id, 'dismiss')}
                      disabled={resolving === flag.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={12} />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolve(flag.id, 'delete_post')}
                      disabled={resolving === flag.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-900/20 border border-rose-700/30 hover:bg-rose-900/40 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete Post
                    </button>
                  </>
                )}
                {flag.resolved && (
                  <span className="text-xs text-stone-600 italic">Resolved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
