/**
 * Forum Moderation Service
 *
 * Handles post flagging and moderation queue for admins.
 * Uses forum_flags Supabase table (gracefully handles table not existing).
 */

import { supabase } from './supabaseClient';
import { ForumFlag } from '../types';

type FlagReason = 'spam' | 'harmful' | 'off-topic' | 'crisis';

/**
 * Flag a post for moderator review
 */
export async function flagPost(
  postId: string,
  threadId: string,
  reason: FlagReason
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('[forumModeration] Not authenticated');
      return false;
    }

    const { error } = await (supabase as any)
      .from('forum_flags')
      .insert([
        {
          post_id: postId,
          thread_id: threadId,
          reporter_id: userData.user.id,
          reason,
          resolved: false,
        },
      ]);

    if (error) {
      console.warn('[forumModeration] Error flagging post (table may not exist):', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[forumModeration] Unexpected error flagging post:', err);
    return false;
  }
}

/**
 * Get flagged posts (admin only)
 */
export async function getFlags(resolved?: boolean): Promise<ForumFlag[]> {
  try {
    let query = (supabase as any)
      .from('forum_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.warn('[forumModeration] Error fetching flags (table may not exist):', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Enrich with post content and reporter names
    const postIds = [...new Set(data.map((f: any) => f.post_id))];
    const reporterIds = [...new Set(data.map((f: any) => f.reporter_id))];

    // Fetch post content
    const postContentMap = new Map<string, string>();
    if (postIds.length > 0) {
      const { data: posts } = await supabase
        .from('forum_posts')
        .select('id, content')
        .in('id', postIds as string[]);
      if (posts) {
        (posts as any[]).forEach((p) => postContentMap.set(p.id, p.content));
      }
    }

    // Fetch reporter names
    const reporterNameMap = new Map<string, string>();
    if (reporterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', reporterIds as string[]);
      if (profiles) {
        (profiles as any[]).forEach((p) => reporterNameMap.set(p.id, p.display_name || 'Anonymous'));
      }
    }

    return (data as any[]).map((flag: any) => ({
      ...flag,
      post_content: postContentMap.get(flag.post_id) || '[deleted]',
      reporter_name: reporterNameMap.get(flag.reporter_id) || 'Unknown',
    })) as ForumFlag[];
  } catch (err) {
    console.warn('[forumModeration] Unexpected error fetching flags:', err);
    return [];
  }
}

/**
 * Resolve a flag (admin action)
 */
export async function resolveFlag(
  flagId: string,
  action: 'dismiss' | 'delete_post'
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    // Mark flag as resolved
    const { error } = await (supabase as any)
      .from('forum_flags')
      .update({ resolved: true, resolved_by: userData.user.id })
      .eq('id', flagId);

    if (error) {
      console.warn('[forumModeration] Error resolving flag:', error.message);
      return false;
    }

    // If action is delete_post, soft-delete the post
    if (action === 'delete_post') {
      // Get the flag to find the post_id
      const { data: flagData } = await (supabase as any)
        .from('forum_flags')
        .select('post_id')
        .eq('id', flagId)
        .single();

      if (flagData?.post_id) {
        await (supabase as any)
          .from('forum_posts')
          .update({ is_deleted: true })
          .eq('id', flagData.post_id);
      }
    }

    return true;
  } catch (err) {
    console.warn('[forumModeration] Unexpected error resolving flag:', err);
    return false;
  }
}
