import { supabase } from './supabaseClient';
import type { IntelligentGuidance } from '../types';

/**
 * Service for managing Intelligent Guidance Cache in Supabase PostgreSQL
 *
 * Uses upsert pattern to avoid race conditions in concurrent environments.
 * Requires unique constraint on (user_id, context_hash) in database.
 */
export const guidanceDatabaseService = {
  /**
   * Save guidance cache to Supabase (insert or update)
   *
   * @throws Error if save fails (DB error, constraint violation, etc.)
   * @param userId User identifier
   * @param contextHash Hash of the analysis context
   * @param guidance The IntelligentGuidance object to cache
   */
  async saveGuidance(userId: string, contextHash: string, guidance: IntelligentGuidance): Promise<void> {
    const dbRow = {
      user_id: userId,
      context_hash: contextHash,
      guidance: guidance,
      updated_at: new Date().toISOString()
    };

    // Type assertion: Supabase types out of sync (run: supabase gen types typescript --project-id <id>)
    // TODO: Regenerate types with: supabase gen types typescript --project-id <your-project-id> > services/database.types.ts
    const { error } = await (supabase
      .from('intelligent_guidance') as any)
      .upsert(dbRow, { onConflict: 'user_id,context_hash' });

    if (error) {
      console.error('[guidanceDatabaseService] Error saving guidance:', error);
      throw error;
    }
  },

  /**
   * Fetch cached guidance for a specific context
   *
   * @returns { guidance, updatedAt } if found; null if not in cache
   * @throws Error if query fails (but not if row not found)
   * @param userId User identifier
   * @param contextHash Hash of the analysis context
   */
  async getGuidance(
    userId: string,
    contextHash: string
  ): Promise<{ guidance: IntelligentGuidance; updatedAt: string } | null> {
    const { data, error } = await supabase
      .from('intelligent_guidance')
      .select('guidance, updated_at')
      .eq('user_id', userId)
      .eq('context_hash', contextHash)
      .maybeSingle();

    if (error) {
      console.error('[guidanceDatabaseService] Error fetching guidance:', error);
      throw error;
    }

    // No row found (maybeSingle returns null, not error)
    if (!data) return null;

    const raw = (data as any);
    const guidance = raw.guidance as IntelligentGuidance;
    // Coerce date strings to Date objects if needed
    const guidanceAny = guidance as any;
    if (guidanceAny && typeof guidanceAny.analysisDate === 'string') {
      guidanceAny.analysisDate = new Date(guidanceAny.analysisDate);
    }
    if (guidanceAny && typeof guidanceAny.expiresAt === 'string') {
      guidanceAny.expiresAt = new Date(guidanceAny.expiresAt);
    }
    return {
      guidance,
      updatedAt: raw.updated_at
    };
  },

  /**
   * Delete all cached guidance for a user
   *
   * @throws Error if delete fails
   * @param userId User identifier
   */
  async deleteGuidance(userId: string): Promise<void> {
    const { error } = await supabase
      .from('intelligent_guidance')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[guidanceDatabaseService] Error deleting guidance:', error);
      throw error;
    }
  }
};
