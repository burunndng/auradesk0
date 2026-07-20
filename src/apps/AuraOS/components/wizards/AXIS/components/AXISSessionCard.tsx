/**
 * AXIS Session Card
 * Display session summary in history
 *
 * Design: stone-950 base
 */

import React from 'react';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';
import type { AXISSession } from '../../../../types';

const ACTIVITY_LABELS: Record<AXISSession['activityType'], string> = {
  'ai-conversation': 'AI Chat',
  'journal': 'Journal',
  'therapy': 'Therapy',
  'difficult-conversation': 'Conversation',
  'meditation': 'Meditation',
  'other': 'Reflection',
};

interface AXISSessionCardProps {
  session: AXISSession;
  onSelect: () => void;
}

export default function AXISSessionCard({ session, onSelect }: AXISSessionCardProps) {
  const createdDate = new Date(session.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeAgo = '';
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      timeAgo = diffMins === 0 ? 'just now' : `${diffMins}m ago`;
    } else {
      timeAgo = `${diffHours}h ago`;
    }
  } else if (diffDays === 1) {
    timeAgo = 'yesterday';
  } else if (diffDays < 7) {
    timeAgo = `${diffDays}d ago`;
  } else {
    timeAgo = createdDate.toLocaleDateString();
  }

  const activityLabel = ACTIVITY_LABELS[session.activityType];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 bg-stone-900/40 border border-stone-700/30 rounded-xl hover:border-stone-600 hover:bg-stone-900/60 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title & Status */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-serif text-stone-100 text-base truncate">{session.title}</h3>
            {session.status === 'closed' && (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {session.status === 'active' && (
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span className="px-1.5 py-0.5 bg-stone-800/60 border border-stone-700/30 rounded-lg text-stone-400 text-[10px]">
              {activityLabel}
            </span>
            <span>·</span>
            <span>{timeAgo}</span>
            {session.status === 'closed' && (
              <>
                <span>·</span>
                <span className="text-emerald-400/70">Closed</span>
              </>
            )}
            {session.status === 'active' && (
              <>
                <span>·</span>
                <span className="text-amber-400/70">Open</span>
              </>
            )}
          </div>

          {/* Intention Preview */}
          <p className="text-sm text-stone-400 line-clamp-2">{session.intention}</p>
        </div>

        <ChevronRight className="w-5 h-5 text-stone-600 flex-shrink-0" />
      </div>
    </button>
  );
}
