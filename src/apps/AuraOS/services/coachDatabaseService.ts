/**
 * Coach Database Service (Client-Side Only)
 * Stores Coach conversations, unlock states, and analytics in localStorage
 * Supabase integration is disabled as per user request to keep AI Coach data local.
 */

import { StorageManager } from '../.claude/lib/storageManager';

export interface CoachConversation {
  id?: string;
  user_id: string;
  role: 'user' | 'coach';
  message: string;
  timestamp: string;
  had_action: boolean;
  action_type?: string;
  action_payload?: any;
  session_id?: string;
}

export interface CoachUnlock {
  id?: string;
  user_id: string;
  unlock_type: string;
  unlock_key: string;
  unlocked_at: string;
  unlocked_via: 'conversation' | 'manual' | 'milestone' | 'easter_egg';
  metadata?: any;
}

export interface CoachAnalytics {
  id?: string;
  user_id: string;
  event_type: string;
  event_data?: any;
  timestamp: string;
}

const LOCAL_STORAGE_KEYS = {
  HISTORY: (userId: string) => `aura-coach-history-${userId}`,
  UNLOCKS: (userId: string) => `aura-coach-unlocks-${userId}`,
  ANALYTICS: (userId: string) => `aura-coach-analytics-${userId}`,
};

/**
 * No-op for table initialization
 */
export async function initializeCoachTables() {
  console.log('[CoachDB] Initialized in local-only mode.');
}

/**
 * Save a conversation message to LocalStorage
 */
export async function saveConversation(
  userId: string,
  role: 'user' | 'coach',
  message: string,
  hadAction: boolean = false,
  actionType?: string,
  actionPayload?: any,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = LOCAL_STORAGE_KEYS.HISTORY(userId);
    const stored = StorageManager.getUntyped(key);
    const history = stored ? (stored as any[]) : [];

    history.push({
      user_id: userId,
      role,
      message,
      timestamp: new Date().toISOString(),
      had_action: hadAction,
      action_type: actionType,
      action_payload: actionPayload,
      session_id: sessionId,
    });

    // Keep last 100 messages
    const trimmed = history.slice(-100);
    StorageManager.setUntyped(key, trimmed);
    return { success: true };
  } catch (err) {
    console.error('[CoachDB] Error saving to localStorage:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get conversation history for a user from LocalStorage
 */
export async function getConversationHistory(
  userId: string,
  limit: number = 50,
  sessionId?: string
): Promise<{ success: boolean; conversations: CoachConversation[]; error?: string }> {
  try {
    const key = LOCAL_STORAGE_KEYS.HISTORY(userId);
    const stored = StorageManager.getUntyped(key);
    let history = stored ? (stored as any[]) : [];

    if (sessionId) {
      history = history.filter((m: any) => m.session_id === sessionId);
    }

    return { success: true, conversations: history.slice(-limit) };
  } catch (err) {
    console.error('[CoachDB] Error reading history from localStorage:', err);
    return { success: false, conversations: [], error: String(err) };
  }
}

/**
 * Save an unlock event to LocalStorage
 */
export async function saveUnlock(
  userId: string,
  unlockType: string,
  unlockKey: string,
  unlockedVia: 'conversation' | 'manual' | 'milestone' | 'easter_egg',
  metadata?: any
): Promise<{ success: boolean; error?: string; alreadyUnlocked?: boolean }> {
  try {
    const key = LOCAL_STORAGE_KEYS.UNLOCKS(userId);
    const stored = StorageManager.getUntyped(key);
    const unlocks = stored ? (stored as any[]) : [];

    if (unlocks.find((u: any) => u.unlock_key === unlockKey)) {
      return { success: true, alreadyUnlocked: true };
    }

    unlocks.push({
      user_id: userId,
      unlock_type: unlockType,
      unlock_key: unlockKey,
      unlocked_at: new Date().toISOString(),
      unlocked_via: unlockedVia,
      metadata,
    });

    StorageManager.setUntyped(key, unlocks);
    return { success: true, alreadyUnlocked: false };
  } catch (err) {
    console.error('[CoachDB] Error saving unlock to localStorage:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Check if user has an unlock in LocalStorage
 */
export async function hasUnlock(
  userId: string,
  unlockKey: string
): Promise<{ hasUnlock: boolean; unlock?: CoachUnlock }> {
  try {
    const key = LOCAL_STORAGE_KEYS.UNLOCKS(userId);
    const stored = StorageManager.getUntyped(key);
    const unlocks = stored ? (stored as any[]) : [];
    const unlock = unlocks.find((u: any) => u.unlock_key === unlockKey);

    return { hasUnlock: !!unlock, unlock };
  } catch (err) {
    return { hasUnlock: false };
  }
}

/**
 * Get all unlocks for a user from LocalStorage
 */
export async function getUserUnlocks(
  userId: string
): Promise<{ success: boolean; unlocks: CoachUnlock[]; error?: string }> {
  try {
    const key = LOCAL_STORAGE_KEYS.UNLOCKS(userId);
    const stored = StorageManager.getUntyped(key);
    const unlocks = stored ? (stored as CoachUnlock[]) : [];
    return { success: true, unlocks };
  } catch (err) {
    return { success: false, unlocks: [], error: String(err) };
  }
}

/**
 * Log an analytics event to LocalStorage
 */
export async function logAnalyticsEvent(
  userId: string,
  eventType: string,
  eventData?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = LOCAL_STORAGE_KEYS.ANALYTICS(userId);
    const stored = StorageManager.getUntyped(key);
    const analytics = stored ? (stored as any[]) : [];

    analytics.push({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
    });

    // Keep last 200 events
    const trimmed = analytics.slice(-200);
    StorageManager.setUntyped(key, trimmed);
    return { success: true };
  } catch (err) {
    console.error('[CoachDB] Error saving analytics to localStorage:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get analytics summary from LocalStorage
 */
export async function getAnalyticsSummary(
  userId: string
): Promise<{
  success: boolean;
  summary: {
    totalMessages: number;
    totalActions: number;
    totalUnlocks: number;
    commonEventTypes: Array<{ event_type: string; count: number }>;
  };
  error?: string;
}> {
  try {
    const histKey = LOCAL_STORAGE_KEYS.HISTORY(userId);
    const unlockKey = LOCAL_STORAGE_KEYS.UNLOCKS(userId);
    const analyticKey = LOCAL_STORAGE_KEYS.ANALYTICS(userId);

    const history = (StorageManager.getUntyped(histKey) as any[]) || [];
    const unlocks = (StorageManager.getUntyped(unlockKey) as any[]) || [];
    const events = (StorageManager.getUntyped(analyticKey) as any[]) || [];

    const eventCounts = (events || []).reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonEventTypes = Object.entries(eventCounts)
      .map(([event_type, count]) => ({ event_type, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      summary: {
        totalMessages: history.length,
        totalActions: history.filter((m: any) => m.had_action).length,
        totalUnlocks: unlocks.length,
        commonEventTypes,
      },
    };
  } catch (err) {
    return {
      success: false,
      summary: { totalMessages: 0, totalActions: 0, totalUnlocks: 0, commonEventTypes: [] },
      error: String(err),
    };
  }
}

/**
 * Hybrid save: Only use localStorage for conversations as per user request.
 */
export async function saveConversationHybrid(
  userId: string,
  role: 'user' | 'coach',
  message: string,
  hadAction?: boolean,
  actionType?: string,
  actionPayload?: any
): Promise<void> {
  await saveConversation(userId, role, message, !!hadAction, actionType, actionPayload);
}