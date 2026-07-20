/**
 * Forum Service
 *
 * Handles all forum-related database operations:
 * - Thread creation, retrieval, updates
 * - Post creation, retrieval, updates
 * - Search and filtering
 * - View tracking
 *
 * All operations respect RLS policies enforced at the database level.
 */

import { supabase } from './supabaseClient';
import {
  ForumThread,
  ForumPost,
  ForumThreadWithPosts,
  ForumAuthor,
  CreateThreadInput,
  CreatePostInput,
  UpdatePostInput,
  ForumCategory,
  ForumPaginationParams,
  ForumReaction,
  ForumReactionType,
  PostReactionCounts,
} from '../types';
import { createMentionNotification, createReplyNotification } from './forumNotificationService';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch user profiles for a list of user IDs with graceful RLS fallback
 * @param userIds - Array of user IDs to fetch profiles for
 * @returns Map of user_id -> ForumAuthor data
 */
async function fetchUserProfiles(userIds: string[]): Promise<Map<string, ForumAuthor>> {
  const profilesMap = new Map<string, ForumAuthor>();

  if (userIds.length === 0) {
    return profilesMap;
  }

  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, display_name, preferences, created_at, bio, practice_focus')
      .in('id', userIds);

    if (!profilesError && profilesData) {
      (profilesData as any[]).forEach((row) => {
        if (row.id) {
          const prefs = row.preferences || {};
          profilesMap.set(row.id, {
            id: row.id,
            display_name: row.display_name || prefs.display_name || null,
            avatar_url: prefs.avatar_url || null,
            created_at: row.created_at,
            subscription_tier: prefs.subscription_tier || undefined,
            bio: row.bio || null,
            practice_focus: row.practice_focus || [],
          });
        }
      });
    } else {
      console.warn('[forumService] Could not fetch user profiles (RLS):', profilesError);
    }
  } catch (err) {
    console.warn('[forumService] Error fetching user profiles:', err);
  }

  return profilesMap;
}

/**
 * Create placeholder author info for when profile fetch fails
 */
function createPlaceholderAuthor(userId: string): ForumAuthor {
  // Check if this is the bot user
  const botUserId = import.meta.env.VITE_BOT_USER_ID;
  const isBot = botUserId && userId === botUserId;

  return {
    id: userId,
    email: undefined,
    display_name: isBot ? 'AI Coach' : 'Anonymous',
    avatar_url: null,
  };
}

// ============================================================================
// THREAD OPERATIONS
// ============================================================================

/**
 * Get paginated list of forum threads
 * @param category - Optional category filter
 * @param params - Pagination parameters (limit, offset)
 */
export const getThreads = async (
  category?: ForumCategory,
  params: ForumPaginationParams = { limit: 20, offset: 0 }
): Promise<{ threads: ForumThread[]; total: number } | null> => {
  try {
    let query = supabase
      .from('forum_threads')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await (query as any)
      .limit(params.limit || 20)
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

    if (error || !data) {
      console.error('Error fetching threads:', error);
      return null;
    }

    // Fetch author profiles with graceful RLS fallback
    const userIds = [...new Set(data.map((thread) => thread.user_id))].filter((id): id is string => !!id);
    const profilesMap = await fetchUserProfiles(userIds);

    // Attach author profiles with fallback to placeholder
    const threadsWithAuthors = data.map((thread) => ({
      ...thread,
      author: profilesMap.get(thread.user_id) || createPlaceholderAuthor(thread.user_id),
    }));

    return {
      threads: threadsWithAuthors as ForumThread[],
      total: count || 0,
    };
  } catch (err) {
    console.error('Unexpected error fetching threads:', err);
    return null;
  }
};

/**
 * Get a single thread by ID with all its posts
 * @param threadId - Thread ID
 * @param postsLimit - Max posts to fetch (default 10)
 */
export const getThread = async (
  threadId: string,
  postsLimit: number = 10,
  skipViewCount: boolean = false
): Promise<ForumThreadWithPosts | null> => {
  try {
    // Fetch thread
    const { data: threadData, error: threadError } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError) {
      console.error('Error fetching thread:', threadError);
      return null;
    }

    // Increment view count via RPC (bypasses RLS owner restriction on UPDATE)
    if (!skipViewCount) {
      try {
        await (supabase as any).rpc('increment_thread_view_count', { thread_id_param: threadId });
      } catch {
        // Non-fatal — view count is cosmetic
      }
    }

    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(postsLimit);

    if (postsError || !postsData) {
      console.error('Error fetching posts:', postsError);
      return threadData;
    }

    // Type guard for posts and thread
    const posts = postsData as ForumPost[];
    const thread = threadData as ForumThread;

    // Fetch author profiles for thread and posts with graceful RLS fallback
    const userIds = [...new Set([thread.user_id, ...posts.map((post) => post.user_id)])].filter((id): id is string => !!id);
    const profilesMap = await fetchUserProfiles(userIds);

    // Attach author profiles with fallback to placeholder
    const postsWithAuthors = posts.map((post) => ({
      ...post,
      author: profilesMap.get(post.user_id) || createPlaceholderAuthor(post.user_id),
    }));

    return {
      ...thread,
      author: profilesMap.get(thread.user_id) || createPlaceholderAuthor(thread.user_id),
      posts: postsWithAuthors as ForumPost[],
    };
  } catch (err) {
    console.error('Unexpected error fetching thread:', err);
    return null;
  }
};

/**
 * Create a new forum thread
 * @param input - Thread creation data
 */
export const createThread = async (input: CreateThreadInput): Promise<ForumThread | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return null;
    }

    const { data, error } = await (supabase as any)
      .from('forum_threads')
      .insert([
        {
          user_id: userData.user.id,
          title: input.title,
          description: input.description || null,
          category: input.category,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating thread:', error);
      return null;
    }

    return data as ForumThread;
  } catch (err) {
    console.error('Unexpected error creating thread:', err);
    return null;
  }
};

/**
 * Update a forum thread (title, description, category)
 * Only the thread author can update their own thread
 * @param threadId - Thread ID
 * @param updates - Fields to update
 */
export const updateThread = async (
  threadId: string,
  updates: Partial<Pick<ForumThread, 'title' | 'description' | 'category'>>
): Promise<ForumThread | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('forum_threads')
      .update(updates)
      .eq('id', threadId)
      .select()
      .single();

    if (error) {
      console.error('Error updating thread:', error);
      return null;
    }

    return data as ForumThread;
  } catch (err) {
    console.error('Unexpected error updating thread:', err);
    return null;
  }
};

/**
 * Archive a forum thread (soft delete)
 * @param threadId - Thread ID
 */
export const archiveThread = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('forum_threads')
      .update({ is_archived: true })
      .eq('id', threadId);

    if (error) {
      console.error('Error archiving thread:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error archiving thread:', err);
    return false;
  }
};

/**
 * Pin/unpin a forum thread (admin action)
 * @param threadId - Thread ID
 * @param isPinned - Pin status
 */
export const setPinThread = async (threadId: string, isPinned: boolean): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('forum_threads')
      .update({ is_pinned: isPinned })
      .eq('id', threadId);

    if (error) {
      console.error('Error pinning thread:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error pinning thread:', err);
    return false;
  }
};

// ============================================================================
// POST OPERATIONS
// ============================================================================

/**
 * Get posts for a thread with pagination
 * @param threadId - Thread ID
 * @param params - Pagination parameters
 */
export const getThreadPosts = async (
  threadId: string,
  params: ForumPaginationParams = { limit: 20, offset: 0 }
): Promise<{ posts: ForumPost[]; total: number } | null> => {
  try {
    const { data, count, error } = await (supabase as any)
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(params.limit || 20)
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return null;
    }

    return {
      posts: (data || []) as ForumPost[],
      total: count || 0,
    };
  } catch (err) {
    console.error('Unexpected error fetching posts:', err);
    return null;
  }
};

/**
 * Create a new post in a thread
 * @param input - Post creation data
 */
export const createPost = async (input: CreatePostInput): Promise<ForumPost | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return null;
    }

    // Verify thread exists
    const { data: threadData, error: threadError } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('id', input.thread_id)
      .single();

    if (threadError || !threadData) {
      console.error('Thread not found');
      return null;
    }

    // Create post — include explicit defaults for columns that may lack DB-level defaults
    const { data, error } = await (supabase as any)
      .from('forum_posts')
      .insert([
        {
          thread_id: input.thread_id,
          user_id: userData.user.id,
          content: input.content,
          is_edited: false,
          likes_count: 0,
          is_deleted: false,
          parent_post_id: input.parent_post_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    // Increment reply_count via RPC (bypasses RLS owner restriction on UPDATE)
    // Falls back gracefully if the function doesn't exist yet — trigger will handle it
    try {
      await (supabase as any).rpc('increment_thread_reply_count', { thread_id_param: input.thread_id });
    } catch {
      // Non-fatal: a database trigger on forum_posts handles this automatically
    }

    // Parse @mentions and send notifications (async, non-blocking)
    const postId = (data as any).id;
    const posterId = userData.user.id;
    try {
      const mentions = [...input.content.matchAll(/@(\w+)/g)].map((m) => m[1].toLowerCase());
      if (mentions.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from('user_profiles')
          .select('id, username')
          .in('username', mentions);
        if (mentionedUsers) {
          for (const mu of mentionedUsers as any[]) {
            if (mu.id !== posterId) {
              createMentionNotification(mu.id, input.thread_id, postId, posterId).catch(() => {});
            }
          }
        }
      }

      // Notify thread author of reply
      const { data: threadData2 } = await supabase
        .from('forum_threads')
        .select('user_id')
        .eq('id', input.thread_id)
        .single();
      if (threadData2 && (threadData2 as any).user_id !== posterId) {
        createReplyNotification((threadData2 as any).user_id, input.thread_id, postId, posterId).catch(() => {});
      }
    } catch (notifErr) {
      console.warn('[forumService] Notification error (non-fatal):', notifErr);
    }

    return data as ForumPost;
  } catch (err) {
    console.error('Unexpected error creating post:', err);
    return null;
  }
};

/**
 * Update a post (edit content)
 * Only the post author can edit their own posts
 * @param postId - Post ID
 * @param content - New content
 */
export const updatePost = async (postId: string, content: string): Promise<ForumPost | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('forum_posts')
      .update({
        content,
        is_edited: true,
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return null;
    }

    return data as ForumPost;
  } catch (err) {
    console.error('Unexpected error updating post:', err);
    return null;
  }
};

/**
 * Soft-delete a post (mark as deleted but keep record)
 * Only the post author can delete their own posts
 * @param postId - Post ID
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('forum_posts')
      .update({ is_deleted: true })
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting post:', err);
    return false;
  }
};

/**
 * Like a post (increment likes_count)
 * @param postId - Post ID
 */
export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return false;
    }

    // Insert into post_likes to track the like
    // Database trigger automatically increments forum_posts.likes_count
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userData.user.id }]);

    if (likeError) {
      console.error('Error liking post:', likeError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error liking post:', err);
    return false;
  }
};

/**
 * Unlike a post (decrement likes_count via trigger)
 * @param postId - Post ID
 */
export const unlikePost = async (postId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return false;
    }

    // Delete from post_likes to remove the like
    // Database trigger automatically decrements forum_posts.likes_count
    const { error: likeError } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userData.user.id);

    if (likeError) {
      console.error('Error unliking post:', likeError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error unliking post:', err);
    return false;
  }
};

// ============================================================================
// SEARCH & DISCOVERY
// ============================================================================

/**
 * Search threads by title and description
 * @param query - Search query
 * @param category - Optional category filter
 */
export const searchThreads = async (
  query: string,
  category?: ForumCategory
): Promise<ForumThread[] | null> => {
  try {
    let search = supabase
      .from('forum_threads')
      .select('*')
      .eq('is_archived', false);

    if (category) {
      search = search.eq('category', category);
    }

    // Simple substring search (Supabase doesn't have full-text search in free tier)
    // For production, consider upgrading to Postgres full-text search
    const { data, error } = await search
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching threads:', error);
      return null;
    }

    return (data || []) as ForumThread[];
  } catch (err) {
    console.error('Unexpected error searching threads:', err);
    return null;
  }
};

/**
 * Get trending threads (by view_count)
 * @param category - Optional category filter
 * @param days - Number of days to look back (default: 7)
 */
export const getTrendingThreads = async (
  category?: ForumCategory,
  days: number = 7
): Promise<ForumThread[] | null> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('forum_threads')
      .select('*')
      .eq('is_archived', false)
      .gte('created_at', startDate.toISOString());

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('view_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching trending threads:', error);
      return null;
    }

    return (data || []) as ForumThread[];
  } catch (err) {
    console.error('Unexpected error fetching trending threads:', err);
    return null;
  }
};

/**
 * Get user's own threads
 * @param limit - Max threads to fetch
 */
export const getUserThreads = async (limit: number = 50): Promise<ForumThread[] | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user threads:', error);
      return null;
    }

    return (data || []) as ForumThread[];
  } catch (err) {
    console.error('Unexpected error fetching user threads:', err);
    return null;
  }
};

/**
 * Get user's own posts
 * @param limit - Max posts to fetch
 */
export const getUserPosts = async (limit: number = 50): Promise<ForumPost[] | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user posts:', error);
      return null;
    }

    return (data || []) as ForumPost[];
  } catch (err) {
    console.error('Unexpected error fetching user posts:', err);
    return null;
  }
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get forum statistics
 */
export const getForumStats = async (): Promise<{
  totalThreads: number;
  totalPosts: number;
  categories: Record<string, number>;
} | null> => {
  try {
    const { count: threadCount, error: threadError } = await supabase
      .from('forum_threads')
      .select('*', { count: 'exact' })
      .eq('is_archived', false);

    const { count: postCount, error: postError } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    if (threadError || postError) {
      console.error('Error fetching stats:', threadError || postError);
      return null;
    }

    // Get category breakdown
    const { data: categoryData, error: categoryError } = await supabase
      .from('forum_threads')
      .select('category')
      .eq('is_archived', false);

    let categories: Record<string, number> = {
      'practice-sharing': 0,
      insights: 0,
      questions: 0,
      community: 0,
    };

    if (!categoryError && categoryData) {
      categoryData.forEach((item: any) => {
        categories[item.category] = (categories[item.category] || 0) + 1;
      });
    }

    return {
      totalThreads: threadCount || 0,
      totalPosts: postCount || 0,
      categories,
    };
  } catch (err) {
    console.error('Unexpected error fetching stats:', err);
    return null;
  }
};

// ============================================================================
// REACTIONS
// ============================================================================

export const addReaction = async (postId: string, reactionType: ForumReactionType): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('forum_reactions')
      .insert([
        {
          post_id: postId,
          user_id: userData.user.id,
          reaction_type: reactionType,
        },
      ]);

    if (error) {
      console.error('Error adding reaction:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error adding reaction:', err);
    return false;
  }
};

export const removeReaction = async (postId: string, reactionType: ForumReactionType): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('forum_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userData.user.id)
      .eq('reaction_type', reactionType);

    if (error) {
      console.error('Error removing reaction:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error removing reaction:', err);
    return false;
  }
};

export const getPostReactions = async (
  postIds: string[],
  currentUserId: string | null
): Promise<Map<string, { counts: PostReactionCounts; userReactions: ForumReactionType[] }>> => {
  const reactionsMap = new Map<
    string,
    { counts: PostReactionCounts; userReactions: ForumReactionType[] }
  >();

  if (postIds.length === 0) {
    return reactionsMap;
  }

  try {
    const { data, error } = await supabase
      .from('forum_reactions')
      .select('*')
      .in('post_id', postIds);

    if (error) {
      console.error('Error fetching reactions:', error);
      return reactionsMap;
    }

    if (!data) {
      return reactionsMap;
    }

    // Initialize counts for each post
    postIds.forEach((postId) => {
      reactionsMap.set(postId, {
        counts: {
          resonates: 0,
          'sits-with-me': 0,
          'challenges-me': 0,
          grateful: 0,
        },
        userReactions: [],
      });
    });

    // Aggregate reactions
    (data as any[]).forEach((reaction) => {
      const postId = reaction.post_id;
      if (reactionsMap.has(postId)) {
        const entry = reactionsMap.get(postId)!;
        entry.counts[reaction.reaction_type as ForumReactionType]++;

        if (currentUserId && reaction.user_id === currentUserId) {
          entry.userReactions.push(reaction.reaction_type);
        }
      }
    });

    return reactionsMap;
  } catch (err) {
    console.error('Unexpected error fetching reactions:', err);
    return reactionsMap;
  }
};

// ============================================================================
// USER FORUM PROFILES
// ============================================================================

export const getUserForumProfile = async (
  userId: string
): Promise<(ForumAuthor & { recentPosts: ForumPost[] }) | null> => {
  try {
    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name, preferences, created_at, bio, practice_focus, subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    const prefs = (profileData as any).preferences || {};
    const author: ForumAuthor = {
      id: (profileData as any).id,
      display_name: (profileData as any).display_name || prefs.display_name || null,
      avatar_url: prefs.avatar_url || null,
      created_at: (profileData as any).created_at,
      subscription_tier: prefs.subscription_tier || undefined,
      bio: (profileData as any).bio || null,
      practice_focus: (profileData as any).practice_focus || [],
    };

    // Fetch recent non-deleted posts
    const { data: postsData, error: postsError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (postsError) {
      console.error('Error fetching recent posts:', postsError);
      return { ...author, recentPosts: [] };
    }

    return {
      ...author,
      recentPosts: (postsData as ForumPost[]) || [],
    };
  } catch (err) {
    console.error('Unexpected error fetching user forum profile:', err);
    return null;
  }
};

export const updateUserForumProfile = async (
  userId: string,
  updates: { bio?: string; practice_focus?: string[] }
): Promise<void> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || userData.user.id !== userId) {
      console.error('Unauthorized: can only update own profile');
      return;
    }

    const { error } = await supabase.from('user_profiles').update(updates).eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
    }
  } catch (err) {
    console.error('Unexpected error updating user profile:', err);
  }
};
