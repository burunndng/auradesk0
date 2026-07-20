/**
 * PostCard - Individual Forum Post Display
 * Shows post content, author, timestamp, with edit/delete for own posts
 * Marks AI-generated posts with a badge
 */

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ForumPost, PostReactionCounts, ForumReactionType } from '../../types';
import { Clock, Edit2, Trash2, Save, X, Star, Crown, Quote, Heart, Flag } from 'lucide-react';
import { forumAIService, PERSONA_ACCENT, PERSONA_COLOR_CLASS } from '../../services/forumAIService';
import { likePost, unlikePost } from '../../services/forumService';
import { formatTimeAgo } from '../../utils/formatters';
import TiptapEditor from './TiptapEditor';
import ReactionBar from './ReactionBar';

// Per-persona avatar gradients — each bot gets a distinct visual identity
const PERSONA_GRADIENTS: Record<string, string> = {
  Mara: 'from-rose-700 to-orange-800',
  Theo: 'from-indigo-700 to-violet-800',
  Rin: 'from-teal-700 to-emerald-900',
  Sola: 'from-amber-600 to-yellow-800',
  Jules: 'from-sky-700 to-blue-900',
};

const DEFAULT_BOT_GRADIENT = 'from-amber-600 to-amber-800';

const WIZARD_SLUGS = new Set([
  'subject-object', 'polarity-mapper', 'kegan-assessment', 'perspective-shifter',
  'adaptive-cycle', 'bias-detective', 'bias-finder', 'decision', 'schema-detective',
  'immunity-to-change', 'eight-zones', 'examining-core-belief', 'dbt-coach',
  'moral-reasoning', 'coherence-audit', 'axis', 'four-quadrant-catalyst',
  'ifs', 'big-mind-process', 'shadow-journaling', 'three-two-one',
  'memory-reconsolidation', 'relational-pattern-chatbot', 'golden-shadow',
  'psychedelic-journey', 'relational-blueprint',
  'bioenergetics', 'integral-body-architect', 'dynamic-workout-architect',
  'somatic-generator', 'meditation', 'jhana-tracker', 'attachment-assessment',
  'attachment-practice', 'interoception', 'life-architecture',
  'role-alignment', 'context-ai-root-cause', 'states-training', 'contemplative-inquiry',
  'ultimate-concern', 'tree-of-life', 'integral-practice-designer', 'sexology-coach',
  'therapy-style', 'chronobiology-protocol',
]);

function extractPracticeMentions(content: string): string[] {
  const matches = [...content.matchAll(/#([a-z][a-z0-9-]*)/g)];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    const slug = m[1];
    if (WIZARD_SLUGS.has(slug) && !seen.has(slug)) {
      seen.add(slug);
      result.push(slug);
    }
  }
  return result;
}

interface PostCardProps {
  post: ForumPost;
  currentUserId: string | null;
  onEdit: (postId: string, newContent: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onQuote?: (content: string, authorName: string) => void;
  onFlag?: (postId: string, threadId: string) => void;
  onReply?: (parentPostId: string, parentAuthorName: string) => void;
  onViewProfile?: (userId: string) => void;
  replies?: ForumPost[];
}

export default function PostCard({ post, currentUserId, onEdit, onDelete, onQuote, onFlag, onReply, onViewProfile, replies }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<PostReactionCounts>(
    post.reactions || { resonates: 0, 'sits-with-me': 0, 'challenges-me': 0, grateful: 0 }
  );
  const [userReactions, setUserReactions] = useState<ForumReactionType[]>(post.user_reactions || []);

  const isOwnPost = currentUserId === post.user_id;
  const isAIPost = forumAIService.isAIPost(post.user_id);
  const practiceMentions = extractPracticeMentions(post.content);

  const handleLike = async () => {
    if (liking || isOwnPost || !currentUserId) return;
    setLiking(true);

    if (liked) {
      // Unlike
      setLikesCount((c) => Math.max(0, c - 1));
      setLiked(false);
      const success = await unlikePost(post.id);
      if (!success) {
        setLikesCount((c) => c + 1);
        setLiked(true);
      }
    } else {
      // Like
      setLikesCount((c) => c + 1);
      setLiked(true);
      const success = await likePost(post.id);
      if (!success) {
        setLikesCount((c) => c - 1);
        setLiked(false);
      }
    }
    setLiking(false);
  };

  const handleSave = async () => {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    await onEdit(post.id, editContent.trim());
    setIsEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    await onDelete(post.id);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (post.author?.display_name) {
      return post.author.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (post.author?.email) {
      return post.author.email.slice(0, 2).toUpperCase();
    }
    return 'AN';
  };

  const getUserName = () => {
    if (isAIPost && post.bot_persona_name) return post.bot_persona_name;
    return post.author?.display_name || post.author?.email?.split('@')[0] || 'Anonymous';
  };

  return (
    <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 transition-colors">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <button
            onClick={() => onViewProfile?.(post.user_id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br transition-opacity hover:opacity-80 ${
              isAIPost
                ? (PERSONA_GRADIENTS[post.bot_persona_name ?? ''] ?? DEFAULT_BOT_GRADIENT)
                : 'from-cyan-600 to-cyan-800'
            } ${onViewProfile ? 'cursor-pointer' : ''}`}>
            {isAIPost
              ? (post.bot_persona_name ? post.bot_persona_name[0].toUpperCase() : '?')
              : getUserInitials()}
          </button>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <button
                onClick={() => onViewProfile?.(post.user_id)}
                className={`text-sm font-medium transition-colors ${
                  isAIPost ? 'text-amber-300 hover:text-amber-200' : 'text-stone-200 hover:text-cyan-300'
                } ${onViewProfile ? 'cursor-pointer' : ''}`}>
                {getUserName()}
              </button>
              {isAIPost && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  post.bot_persona_name && PERSONA_ACCENT[post.bot_persona_name]
                    ? PERSONA_COLOR_CLASS[PERSONA_ACCENT[post.bot_persona_name]] || PERSONA_COLOR_CLASS.golden
                    : PERSONA_COLOR_CLASS.golden
                }`}>
                  {post.bot_persona_name ? `${post.bot_persona_name} · AI` : 'AI'}
                </span>
              )}
              {!isAIPost && post.author?.subscription_tier === 'pro' && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-900/30 border border-amber-700/40 text-xs font-medium text-amber-400 flex items-center gap-1">
                  <Star size={9} />
                  Pro
                </span>
              )}
              {!isAIPost && post.author?.subscription_tier === 'founding' && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-900/30 border border-purple-600/40 text-xs font-medium text-purple-300 flex items-center gap-1">
                  <Crown size={9} />
                  Founding
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Clock size={12} />
              <span>{formatTimeAgo(post.created_at)}</span>
              {post.is_edited && <span className="text-stone-600">(edited)</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onQuote && !isEditing && (
            <button
              onClick={() => onQuote(post.content, getUserName())}
              className="p-2 rounded-lg text-stone-500 hover:text-cyan-400 hover:bg-stone-800 transition-colors"
              title="Quote reply"
            >
              <Quote size={15} />
            </button>
          )}
          {isOwnPost && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg text-stone-400 hover:text-purple-400 hover:bg-stone-800 transition-colors"
                title="Edit post"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors disabled:opacity-50"
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Practice mention badges */}
      {practiceMentions.length > 0 && !isEditing && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {practiceMentions.map((slug) => (
            <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-700/30 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          ))}
        </div>
      )}

      {/* Post Content */}
      {isEditing ? (
        <div className="space-y-3">
          <TiptapEditor
            content={editContent}
            onChange={setEditContent}
            placeholder="Edit your post..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!editContent.trim() || saving}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-purple-600 text-white
                hover:bg-purple-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                flex items-center gap-2
              "
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-stone-800 text-stone-300
                hover:bg-stone-700
                transition-colors
                flex items-center gap-2
              "
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-stone-300 leading-relaxed prose prose-invert prose-sm max-w-none
          [&_blockquote]:border-l-2 [&_blockquote]:border-stone-600 [&_blockquote]:pl-3 [&_blockquote]:text-stone-400 [&_blockquote]:italic [&_blockquote]:my-2
          [&_em]:text-stone-400
          [&_strong]:text-stone-200
          [&_code]:bg-stone-800 [&_code]:text-amber-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
          [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
        ">
          <ReactMarkdown
            components={{
              // Highlight @mentions as amber spans
              p: ({ children, ...props }) => {
                const processChildren = (child: React.ReactNode): React.ReactNode => {
                  if (typeof child !== 'string') return child;
                  const parts = child.split(/(@\w+)/g);
                  if (parts.length === 1) return child;
                  return parts.map((part, i) =>
                    part.startsWith('@') ? (
                      <span key={i} className="text-amber-400 font-medium">{part}</span>
                    ) : (
                      part
                    )
                  );
                };
                const processed = Array.isArray(children)
                  ? children.map(processChildren)
                  : processChildren(children);
                return <p {...props}>{processed}</p>;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Reactions & Actions */}
      {!isEditing && (
        <div className="space-y-2 mt-3">
          {/* Reaction Bar */}
          <ReactionBar
            postId={post.id}
            counts={reactionCounts}
            userReactions={userReactions}
            currentUserId={currentUserId}
            onReact={(type, added) => {
              // Update local state on reaction
              if (added) {
                setReactionCounts({
                  ...reactionCounts,
                  [type]: reactionCounts[type] + 1,
                });
                setUserReactions([...userReactions, type]);
              } else {
                setReactionCounts({
                  ...reactionCounts,
                  [type]: Math.max(0, reactionCounts[type] - 1),
                });
                setUserReactions(userReactions.filter((r) => r !== type));
              }
            }}
          />

          {/* Reply & Flag Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800/50">
            {onReply && (
              <button
                onClick={() => {
                  const authorName = post.author?.display_name || post.author?.email?.split('@')[0] || 'Anonymous';
                  onReply(post.id, authorName);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-stone-500 hover:text-cyan-400 hover:bg-stone-800/50 transition-colors"
                title="Reply to this post"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Reply
              </button>
            )}

            {/* Flag (non-authors only) */}
            {onFlag && !isOwnPost && currentUserId && (
              <button
                onClick={() => onFlag(post.id, post.thread_id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-stone-600 hover:text-rose-400 hover:bg-stone-800/50 transition-colors"
                title="Flag post"
              >
                <Flag size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nested Replies (one level deep) */}
      {replies && replies.length > 0 && (
        <div className="mt-4 ml-6 space-y-3 border-l border-stone-800 pl-4">
          {replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuote={onQuote}
              onFlag={onFlag}
              onViewProfile={onViewProfile}
              // Don't pass onReply or replies for nested posts (only 1 level deep)
            />
          ))}
        </div>
      )}
    </div>
  );
}
