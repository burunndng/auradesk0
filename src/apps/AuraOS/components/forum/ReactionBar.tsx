/**
 * ReactionBar - Forum Post Reactions
 * Shows counts for: resonates, sits-with-me, challenges-me, grateful
 * Handles optimistic updates when user reacts
 */

import React, { useState } from 'react';
import { PostReactionCounts, ForumReactionType } from '../../types';
import { addReaction, removeReaction } from '../../services/forumService';

interface ReactionBarProps {
  postId: string;
  counts: PostReactionCounts;
  userReactions: ForumReactionType[];
  currentUserId: string | null;
  onReact?: (reactionType: ForumReactionType, added: boolean) => void;
}

const REACTION_CONFIG: Record<
  ForumReactionType,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  resonates: {
    label: 'Resonates',
    emoji: '✨',
    color: 'amber',
    bgColor: 'bg-amber-900/40',
  },
  'sits-with-me': {
    label: 'Sits With Me',
    emoji: '🫂',
    color: 'teal',
    bgColor: 'bg-teal-900/40',
  },
  'challenges-me': {
    label: 'Challenges Me',
    emoji: '⚡',
    color: 'purple',
    bgColor: 'bg-purple-900/40',
  },
  grateful: {
    label: 'Grateful',
    emoji: '🙏',
    color: 'emerald',
    bgColor: 'bg-emerald-900/40',
  },
};

export default function ReactionBar({
  postId,
  counts,
  userReactions,
  currentUserId,
  onReact,
}: ReactionBarProps) {
  const [loading, setLoading] = useState<ForumReactionType | null>(null);
  const [optimisticCounts, setOptimisticCounts] = useState<PostReactionCounts>(counts);
  const [optimisticUserReactions, setOptimisticUserReactions] =
    useState<ForumReactionType[]>(userReactions);

  const handleReaction = async (reactionType: ForumReactionType) => {
    if (!currentUserId || loading) return;

    const isActive = optimisticUserReactions.includes(reactionType);
    setLoading(reactionType);

    if (isActive) {
      // Remove reaction (optimistic update)
      setOptimisticCounts({
        ...optimisticCounts,
        [reactionType]: Math.max(0, optimisticCounts[reactionType] - 1),
      });
      setOptimisticUserReactions(
        optimisticUserReactions.filter((r) => r !== reactionType)
      );

      const success = await removeReaction(postId, reactionType);
      if (!success) {
        // Revert optimistic update
        setOptimisticCounts({
          ...optimisticCounts,
          [reactionType]: optimisticCounts[reactionType] + 1,
        });
        setOptimisticUserReactions([...optimisticUserReactions, reactionType]);
      } else {
        onReact?.(reactionType, false);
      }
    } else {
      // Add reaction (optimistic update)
      setOptimisticCounts({
        ...optimisticCounts,
        [reactionType]: optimisticCounts[reactionType] + 1,
      });
      setOptimisticUserReactions([...optimisticUserReactions, reactionType]);

      const success = await addReaction(postId, reactionType);
      if (!success) {
        // Revert optimistic update
        setOptimisticCounts({
          ...optimisticCounts,
          [reactionType]: Math.max(0, optimisticCounts[reactionType] - 1),
        });
        setOptimisticUserReactions(
          optimisticUserReactions.filter((r) => r !== reactionType)
        );
      } else {
        onReact?.(reactionType, true);
      }
    }

    setLoading(null);
  };

  const reactions: ForumReactionType[] = [
    'resonates',
    'sits-with-me',
    'challenges-me',
    'grateful',
  ];

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-800">
      {reactions.map((reactionType) => {
        const config = REACTION_CONFIG[reactionType];
        const isActive = optimisticUserReactions.includes(reactionType);
        const count = optimisticCounts[reactionType];

        return (
          <button
            key={reactionType}
            onClick={() => handleReaction(reactionType)}
            disabled={!currentUserId || loading === reactionType}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all ${
              isActive
                ? `${config.bgColor} border border-${config.color}-600/50 text-${config.color}-300`
                : 'border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600'
            } ${!currentUserId || (loading === reactionType) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={config.label}
          >
            <span className="text-sm">{config.emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
