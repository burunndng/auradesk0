/**
 * ThreadView - Single Forum Thread Display
 * Shows thread details + all replies with reply input
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ForumThreadWithPosts, ForumPost } from '../../types';
import { getThread, createPost, updatePost, deletePost, getPostReactions } from '../../services/forumService';
import { supabase } from '../../services/supabaseClient';
import { forumAIService } from '../../services/forumAIService';
import { flagPost } from '../../services/forumModerationService';
import { detectCrisisLevel, CrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Eye, Clock, Edit2, Trash2, X, EyeIcon } from 'lucide-react';
import PostCard from './PostCard';
import FlagPostModal from './FlagPostModal';
import InlineReplyForm from './InlineReplyForm';
import UserProfileModal from './UserProfileModal';
import { formatTimeAgo } from '../../utils/formatters';

interface ThreadViewProps {
  threadId: string;
  onClose: () => void;
}

export default function ThreadView({ threadId, onClose }: ThreadViewProps) {
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThreadWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const draftKey = `aura-forum-reply-draft-${threadId}`;
  const [replyContent, setReplyContent] = useState(() => {
    try { return localStorage.getItem(draftKey) || ''; } catch { return ''; }
  });
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const currentUserId = user?.id ?? null;
  const [showPreview, setShowPreview] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [crisisConfirmed, setCrisisConfirmed] = useState(false);
  const [flagReason, setFlagReason] = useState<'spam' | 'harmful' | 'off-topic' | 'crisis' | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flaggingPostId, setFlagggingPostId] = useState<string | null>(null);
  const [flaggingThreadId, setFlagggingThreadId] = useState<string | null>(null);
  const [flagging, setFlagging] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Track component mount/unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Persist draft to localStorage
  useEffect(() => {
    try {
      if (replyContent) {
        localStorage.setItem(draftKey, replyContent);
      } else {
        localStorage.removeItem(draftKey);
      }
    } catch { /* quota exceeded — ignore */ }
  }, [replyContent, draftKey]);


  // Load thread + mark as read
  useEffect(() => {
    const loadThread = async () => {
      setLoading(true);
      const data = await getThread(threadId, 100);
      if (data) {
        // Load reactions for all posts
        const postIds = data.posts?.map((p) => p.id) || [];
        if (postIds.length > 0) {
          const reactionsMap = await getPostReactions(postIds, currentUserId);
          const postsWithReactions = data.posts?.map((p) => ({
            ...p,
            reactions: reactionsMap.get(p.id)?.counts,
            user_reactions: reactionsMap.get(p.id)?.userReactions,
          }));
          setThread({ ...data, posts: postsWithReactions });
        } else {
          setThread(data);
        }
      }
      setLoading(false);
      // Mark thread as read for unread indicators
      try {
        localStorage.setItem('aura-forum-last-read-' + threadId, new Date().toISOString());
      } catch { /* ignore */ }
    };
    loadThread();
  }, [threadId, currentUserId]);

  // Realtime subscription — append new posts from other users/bots as they arrive
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          if (!isMounted.current) return;
          const newPost = payload.new as ForumPost;
          // Refetch thread to get post with author info attached (skip view count — internal refetch)
          const updated = await getThread(threadId, 100, true);
          if (updated && isMounted.current) {
            setThread(updated);
          } else {
            // Fallback: append without author (shows as "User" until next load)
            setThread((prev) => {
              if (!prev) return prev;
              const alreadyPresent = prev.posts?.some((p) => p.id === newPost.id);
              if (alreadyPresent) return prev;
              return {
                ...prev,
                posts: [...(prev.posts || []), newPost],
                reply_count: prev.reply_count + 1,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const handleQuote = (content: string, authorName: string) => {
    const truncated = content.length > 200 ? content.slice(0, 200) + '…' : content;
    const quoted = `> **${authorName}:** ${truncated}\n\n`;
    setReplyContent((prev) => quoted + prev);
    setTimeout(() => {
      replyTextareaRef.current?.focus();
      replyTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Crisis detection on reply content
  const handleReplyChange = (value: string) => {
    setReplyContent(value);
    const level = detectCrisisLevel(value);
    setCrisisLevel(level);
    if (level !== 'concern') setCrisisConfirmed(false);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || posting) return;

    // Crisis gate
    const level = detectCrisisLevel(replyContent);
    if (level === 'high') {
      setCrisisLevel('high');
      return; // Block submission
    }
    if (level === 'concern' && !crisisConfirmed) {
      setCrisisLevel('concern');
      return; // Need confirmation
    }

    setPosting(true);
    setErrorMsg(null);
    const newPost = await createPost({
      thread_id: threadId,
      content: replyContent.trim(),
      parent_post_id: null,
    });

    if (newPost && thread) {
      const postWithAuthor: ForumPost = {
        ...newPost,
        author: {
          id: user?.id || currentUserId || '',
          display_name: user?.displayName || null,
          avatar_url: user?.avatarUrl || null,
        },
      };
      setThread({
        ...thread,
        posts: [...(thread.posts || []), postWithAuthor],
        reply_count: thread.reply_count + 1,
      });
      setReplyContent('');
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }

      // Trigger AI response (async, don't wait)
      setTimeout(async () => {
        const mentioned = forumAIService.detectMentionedPersonas(newPost.content);
        let responded = false;
        if (mentioned.length > 0) {
          // @mention — each named persona must respond
          for (const personaName of mentioned) {
            const ok = await forumAIService.autoRespondToThread(threadId, personaName);
            if (ok) responded = true;
          }
        } else {
          responded = await forumAIService.autoRespondToThread(threadId);
        }
        if (responded && isMounted.current) {
          const updated = await getThread(threadId, 100, true);
          if (updated) setThread(updated);
        }
      }, 1000); // Wait 1s before AI responds
    } else if (!newPost) {
      setErrorMsg('Failed to post reply. Please try again.');
    }
    setPosting(false);
  };

  const handleEditPost = async (postId: string, newContent: string) => {
    setErrorMsg(null);
    const updated = await updatePost(postId, newContent);
    if (updated && thread) {
      setThread({
        ...thread,
        posts: thread.posts?.map((p) => (p.id === postId ? updated : p)),
      });
    } else if (!updated) {
      setErrorMsg('Failed to edit post. Please try again.');
    }
  };

  const handleFlag = (postId: string, flagThreadId: string) => {
    setFlagggingPostId(postId);
    setFlagggingThreadId(flagThreadId);
    setFlagModalOpen(true);
  };

  const handleFlagSubmit = async (reason: 'spam' | 'harmful' | 'off-topic' | 'crisis') => {
    if (!flaggingPostId || !flaggingThreadId) return;
    setFlagging(true);
    setErrorMsg(null);
    const success = await flagPost(flaggingPostId, flaggingThreadId, reason);
    if (success) {
      setErrorMsg('Post has been flagged for review. Thank you.');
      setFlagModalOpen(false);
      setFlagggingPostId(null);
      setFlagggingThreadId(null);
    } else {
      setErrorMsg('Could not flag post. Please try again later.');
    }
    setFlagging(false);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleDeletePost = async (postId: string) => {
    setErrorMsg(null);
    const success = await deletePost(postId);
    if (success && thread) {
      setThread({
        ...thread,
        posts: thread.posts?.filter((p) => p.id !== postId),
        reply_count: Math.max(0, thread.reply_count - 1),
      });
    } else if (!success) {
      setErrorMsg('Failed to delete post. Please try again.');
    }
  };

  const handleReply = (parentPostId: string, parentAuthorName: string) => {
    setReplyingTo(parentPostId);
    // Focus inline reply form (optional)
  };

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId);
  };

  const handleInlineReplySubmit = async (content: string) => {
    if (!replyingTo) return;
    setErrorMsg(null);
    const newPost = await createPost({
      thread_id: threadId,
      content,
      parent_post_id: replyingTo,
    });

    if (newPost && thread) {
      const postWithAuthor: ForumPost = {
        ...newPost,
        author: {
          id: user?.id || currentUserId || '',
          display_name: user?.displayName || null,
          avatar_url: user?.avatarUrl || null,
        },
      };
      setThread({
        ...thread,
        posts: [...(thread.posts || []), postWithAuthor],
        reply_count: thread.reply_count + 1,
      });
      setReplyingTo(null);
    } else {
      setErrorMsg('Failed to post reply. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95">
        <div className="text-stone-400">Loading thread...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95">
        <div className="text-center">
          <p className="text-stone-400 mb-4">Thread not found</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <X size={20} />
          <span>Back to Forum</span>
        </button>

        {/* Thread Header */}
        <div className="mb-8 p-6 rounded-xl bg-stone-900/50 border border-stone-800">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">
              {thread.category.replace('-', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-serif font-light text-stone-100 mb-3">
            {thread.is_pinned && (
              <span className="text-purple-500 mr-2" title="Pinned">
                📌
              </span>
            )}
            {thread.title}
          </h1>

          {/* Description */}
          {thread.description && (
            <p className="text-stone-400 text-lg leading-relaxed mb-4">{thread.description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{thread.reply_count} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{thread.view_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatTimeAgo(thread.created_at)}</span>
              </div>
            </div>
            {/* Author Info */}
            <div className="text-xs text-stone-600">
              Started by <span className="text-stone-400 font-medium">
                {thread.author?.display_name || thread.author?.email?.split('@')[0] || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-medium text-stone-200 mb-4">
            {thread.reply_count === 0
              ? 'No replies yet'
              : `${thread.reply_count} ${thread.reply_count === 1 ? 'Reply' : 'Replies'}`}
          </h2>

          {thread.posts && thread.posts.length > 0 ? (
            thread.posts
              .filter((p) => !p.parent_post_id)
              .map((post) => {
                const replies = thread.posts?.filter((p) => p.parent_post_id === post.id) || [];
                return (
                  <div key={post.id}>
                    <PostCard
                      post={post}
                      currentUserId={currentUserId}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onQuote={currentUserId ? handleQuote : undefined}
                      onFlag={currentUserId ? handleFlag : undefined}
                      onReply={currentUserId ? handleReply : undefined}
                      onViewProfile={handleViewProfile}
                      replies={replies}
                    />
                    {replyingTo === post.id && currentUserId && (
                      <div className="ml-6 mt-3">
                        <InlineReplyForm
                          threadId={threadId}
                          parentPostId={post.id}
                          onSubmit={handleInlineReplySubmit}
                          onCancel={() => setReplyingTo(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-stone-500">
              <p>Be the first to reply to this discussion.</p>
            </div>
          )}
        </div>

        {/* Error Toast */}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rose-900/40 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-4 text-rose-400 hover:text-rose-200">✕</button>
          </div>
        )}

        {/* Reply Form */}
        {currentUserId ? (
          <div className="sticky bottom-0 bg-stone-950 pt-4 pb-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-stone-300">Add Your Reply</h3>
              {/* Placeholder for backward compatibility - actual form is now InlineReplyForm */}
              <div className="p-4 rounded-lg bg-stone-900/50 border border-stone-800 text-stone-300 text-sm">
                <p>Use the reply button on any post to respond directly, or post a thread-level reply below:</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800 text-center">
            <p className="text-stone-400">
              <span className="text-purple-400 font-medium">Sign in</span> to reply to this
              discussion.
            </p>
          </div>
        )}

        {/* Flag Post Modal */}
        <FlagPostModal
          isOpen={flagModalOpen}
          onClose={() => setFlagModalOpen(false)}
          onSubmit={handleFlagSubmit}
          isLoading={flagging}
        />

        {/* User Profile Modal */}
        {profileUserId && (
          <UserProfileModal
            userId={profileUserId}
            onClose={() => setProfileUserId(null)}
          />
        )}
      </div>
    </div>
  );
}
