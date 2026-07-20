/**
 * Forum Notification Service
 *
 * Handles @mention and reply notifications.
 * Uses forum_notifications Supabase table (gracefully handles table not existing).
 */

import { supabase } from './supabaseClient';
import { ForumNotification } from '../types';

export type ForumNotificationWithMeta = ForumNotification;

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  limit: number = 10
): Promise<ForumNotificationWithMeta[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('forum_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[forumNotifications] Error fetching (table may not exist):', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Enrich with actor names and thread titles
    const actorIds = [...new Set(data.map((n: any) => n.actor_id))].filter(Boolean);
    const threadIds = [...new Set(data.map((n: any) => n.thread_id))].filter(Boolean);

    const actorMap = new Map<string, string>();
    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', actorIds as string[]);
      if (profiles) {
        (profiles as any[]).forEach((p) => actorMap.set(p.id, p.display_name || 'Someone'));
      }
    }

    const threadMap = new Map<string, string>();
    if (threadIds.length > 0) {
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('id, title')
        .in('id', threadIds as string[]);
      if (threads) {
        (threads as any[]).forEach((t) => threadMap.set(t.id, t.title));
      }
    }

    return (data as any[]).map((n: any) => ({
      ...n,
      actor_name: actorMap.get(n.actor_id) || 'Someone',
      thread_title: threadMap.get(n.thread_id) || 'a thread',
    })) as ForumNotificationWithMeta[];
  } catch (err) {
    console.warn('[forumNotifications] Unexpected error:', err);
    return [];
  }
}

/**
 * Mark notifications as read
 */
export async function markRead(ids: string[]): Promise<void> {
  try {
    if (ids.length === 0) return;
    await (supabase as any)
      .from('forum_notifications')
      .update({ read: true })
      .in('id', ids);
  } catch (err) {
    console.warn('[forumNotifications] Error marking read:', err);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await (supabase as any)
      .from('forum_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      // Table may not exist — return 0 silently
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Create a mention notification
 */
export async function createMentionNotification(
  mentionedUserId: string,
  threadId: string,
  postId: string,
  actorId: string
): Promise<void> {
  try {
    if (mentionedUserId === actorId) return; // Don't notify self
    await (supabase as any)
      .from('forum_notifications')
      .insert([
        {
          user_id: mentionedUserId,
          type: 'mention',
          thread_id: threadId,
          post_id: postId,
          actor_id: actorId,
          read: false,
        },
      ]);
  } catch (err) {
    console.warn('[forumNotifications] Error creating mention notification:', err);
  }
}

/**
 * Create a reply notification for thread author
 */
export async function createReplyNotification(
  threadAuthorId: string,
  threadId: string,
  postId: string,
  actorId: string
): Promise<void> {
  try {
    if (threadAuthorId === actorId) return; // Don't notify self
    await (supabase as any)
      .from('forum_notifications')
      .insert([
        {
          user_id: threadAuthorId,
          type: 'reply_to_thread',
          thread_id: threadId,
          post_id: postId,
          actor_id: actorId,
          read: false,
        },
      ]);
  } catch (err) {
    console.warn('[forumNotifications] Error creating reply notification:', err);
  }
}
