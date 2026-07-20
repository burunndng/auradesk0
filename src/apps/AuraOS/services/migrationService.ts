/**
 * Migration Service - localStorage → Supabase Data Migration
 *
 * Handles one-time migration of user data from localStorage to Supabase
 * when a user signs up or logs in for the first time.
 *
 * What gets migrated:
 * - Integrated insights (wizard session outputs)
 * - Intelligent guidance cache
 * - User preferences (practice stack, theme, etc.)
 *
 * What stays local (AI Coach privacy exception):
 * - Coach conversations
 * - Coach unlocks
 * - Coach analytics
 *
 * Flow:
 * 1. User signs up/in for the first time
 * 2. Check if migration already completed (user_profiles.preferences.migration_completed)
 * 3. If not, detect old localStorage userId
 * 4. Copy data from localStorage to Supabase with auth_user_id
 * 5. Mark migration complete
 */

import { supabase } from './supabaseClient';
import type { MigrationSummary } from '../types';
import { StorageManager } from '../.claude/lib/storageManager';

// ============================================================================
// MIGRATION STATUS
// ============================================================================

/**
 * Check if migration has already been completed for this user
 */
export const isMigrationCompleted = async (authUserId: string): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('preferences')
      .eq('id', authUserId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.preferences?.migration_completed === true;
  } catch (err) {
    console.error('Error checking migration status:', err);
    return false;
  }
};

/**
 * Mark migration as completed
 */
export const markMigrationCompleted = async (authUserId: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        id: authUserId,
        preferences: {
          migration_completed: true,
          migration_date: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Error marking migration complete:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error marking migration complete:', err);
    return false;
  }
};

// ============================================================================
// DETECT OLD USER ID
// ============================================================================

/**
 * Get the old localStorage userId
 * Returns null if not found
 */
export const getOldUserId = (): string | null => {
  try {
    const storedUserId = StorageManager.getUntyped('userId');
    if (storedUserId) {
      // Remove quotes if present
      const userIdStr = String(storedUserId);
      return userIdStr.replace(/^"|"$/g, '');
    }
    return null;
  } catch (err) {
    console.error('Error getting old userId:', err);
    return null;
  }
};

// ============================================================================
// MIGRATE DATA
// ============================================================================

/**
 * Migrate integrated insights from localStorage to Supabase
 */
const migrateInsights = async (
  oldUserId: string,
  newAuthUserId: string
): Promise<number> => {
  try {
    // Get insights from localStorage
    const storedInsights = StorageManager.getUntyped('aura-insights');
    if (!storedInsights) {
      return 0;
    }

    const insights = Array.isArray(storedInsights) ? storedInsights : [];
    if (!Array.isArray(insights) || insights.length === 0) {
      return 0;
    }

    // Filter insights that belong to the old user
    const userInsights = insights.filter((insight: any) => insight.user_id === oldUserId);

    if (userInsights.length === 0) {
      return 0;
    }

    // Add auth_user_id to each insight
    const migratedInsights = userInsights.map((insight: any) => ({
      ...insight,
      auth_user_id: newAuthUserId,
    }));

    // Insert into Supabase (use upsert to handle duplicates)
    const { error } = await (supabase as any)
      .from('integrated_insights')
      .upsert(migratedInsights, { onConflict: 'id' });

    if (error) {
      console.error('Error migrating insights:', error);
      return 0;
    }

    return migratedInsights.length;
  } catch (err) {
    console.error('Unexpected error migrating insights:', err);
    return 0;
  }
};

/**
 * Migrate intelligent guidance cache from localStorage to Supabase
 */
const migrateGuidance = async (
  oldUserId: string,
  newAuthUserId: string
): Promise<number> => {
  try {
    // Get guidance cache from localStorage
    const storedGuidance = StorageManager.getUntyped('aura-guidance-cache');
    if (!storedGuidance) {
      return 0;
    }

    const guidanceCache = Array.isArray(storedGuidance) ? storedGuidance : [];
    if (!Array.isArray(guidanceCache) || guidanceCache.length === 0) {
      return 0;
    }

    // Filter guidance that belongs to the old user
    const userGuidance = guidanceCache.filter((guidance: any) => guidance.user_id === oldUserId);

    if (userGuidance.length === 0) {
      return 0;
    }

    // Add auth_user_id to each guidance entry
    const migratedGuidance = userGuidance.map((guidance: any) => ({
      ...guidance,
      auth_user_id: newAuthUserId,
    }));

    // Insert into Supabase (use upsert to handle duplicates)
    const { error } = await (supabase as any)
      .from('intelligent_guidance')
      .upsert(migratedGuidance, { onConflict: 'id' });

    if (error) {
      console.error('Error migrating guidance:', error);
      return 0;
    }

    return migratedGuidance.length;
  } catch (err) {
    console.error('Unexpected error migrating guidance:', err);
    return 0;
  }
};

/**
 * Migrate user preferences (practice stack, theme, etc.)
 */
const migratePreferences = async (newAuthUserId: string): Promise<number> => {
  try {
    // Get practice stack from localStorage
    const storedStack = StorageManager.getUntyped('aura-stack');
    const practiceStack = storedStack ? (storedStack as any[]) : [];

    // Get other preferences
    const themeValue = StorageManager.getUntyped('aura-theme');
    const theme = themeValue ? String(themeValue) : 'auto';

    // Upsert user_profiles — create row if not yet exists (new user)
    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        id: newAuthUserId,
        preferences: {
          migration_completed: true,
          migration_date: new Date().toISOString(),
          practice_stack: practiceStack.map((p: any) => p.id),
          theme,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Error migrating preferences:', error);
      return 0;
    }

    return practiceStack.length > 0 ? 1 : 0;
  } catch (err) {
    console.error('Unexpected error migrating preferences:', err);
    return 0;
  }
};

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Perform complete data migration from localStorage to Supabase
 *
 * @param authUserId - Authenticated user ID (from auth.users)
 * @returns Migration summary with counts
 */
export const migrateUserData = async (
  authUserId: string
): Promise<MigrationSummary | null> => {
  try {
    console.log('[MigrationService] Starting migration for user:', authUserId);

    // Check if migration already completed
    const alreadyMigrated = await isMigrationCompleted(authUserId);
    if (alreadyMigrated) {
      console.log('[MigrationService] Migration already completed, skipping');
      return null;
    }

    // Get old userId from localStorage
    const oldUserId = getOldUserId();
    if (!oldUserId) {
      console.log('[MigrationService] No old userId found in localStorage');
      // Still mark as complete to avoid prompting again
      await markMigrationCompleted(authUserId);
      return null;
    }

    console.log('[MigrationService] Migrating from old userId:', oldUserId);

    // Migrate data
    const [insightsMigrated, guidanceMigrated, preferencesMigrated] = await Promise.all([
      migrateInsights(oldUserId, authUserId),
      migrateGuidance(oldUserId, authUserId),
      migratePreferences(authUserId),
    ]);

    // Mark migration complete
    await markMigrationCompleted(authUserId);

    const summary: MigrationSummary = {
      insights_migrated: insightsMigrated,
      guidance_migrated: guidanceMigrated,
      preferences_migrated: preferencesMigrated,
      total_migrated: insightsMigrated + guidanceMigrated + preferencesMigrated,
      old_user_id: oldUserId,
      new_auth_user_id: authUserId,
      completed_at: new Date().toISOString(),
    };

    console.log('[MigrationService] Migration complete:', summary);

    return summary;
  } catch (err) {
    console.error('[MigrationService] Migration failed:', err);
    return null;
  }
};

// ============================================================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================================================

export const migrationService = {
  isMigrationCompleted,
  markMigrationCompleted,
  getOldUserId,
  migrateUserData,
};

export default migrationService;
