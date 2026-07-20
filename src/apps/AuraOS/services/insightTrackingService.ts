import { supabase } from './supabaseClient';

export interface InsightTracking {
  id: string;
  userId: string;
  insightId: string;
  status: 'pending' | 'addressed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export const insightTrackingService = {
  // Get tracking status for all user insights
  // Get tracking status for all user insights
  async getTracking(userId: string): Promise<Map<string, InsightTracking>> {
    // Anonymous user IDs are not UUIDs — skip Supabase query
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) {
      return new Map();
    }
    try {
      const { data, error } = await (supabase as any)
        .from('insight_tracking')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[insightTracking] Error fetching:', error);
        return new Map();
      }

      // Return as Map for O(1) lookups: insightId → tracking
      const map = new Map<string, InsightTracking>();
      (data || []).forEach((row: any) => {
        map.set(row.insight_id, {
          id: row.id,
          userId: row.user_id,
          insightId: row.insight_id,
          status: row.status as any,
          createdAt: row.created_at || '',
          updatedAt: row.updated_at || '',
        });
      });
      return map;
    } catch (err) {
      console.error('[insightTracking] Unexpected error:', err);
      return new Map();
    }
  },

  // Mark an insight as addressed
  async markAsAddressed(userId: string, insightId: string): Promise<boolean> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) return false;
    try {
      const { data: existing, error: selectError } = await (supabase as any)
        .from('insight_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('insight_id', insightId)
        .maybeSingle();

      if (selectError && (selectError as any).code !== 'PGRST116') {
        console.error('[insightTracking] Error checking existing:', selectError);
        return false;
      }

      if (existing) {
        // Update existing
        const { error } = await (supabase as any)
          .from('insight_tracking')
          .update({ status: 'addressed', updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) {
          console.error('[insightTracking] Error updating:', error);
          return false;
        }
        return true;
      } else {
        // Create new record
        const { error } = await (supabase as any)
          .from('insight_tracking')
          .insert({
            user_id: userId,
            insight_id: insightId,
            status: 'addressed',
          });

        if (error) {
          console.error('[insightTracking] Error inserting:', error);
          return false;
        }
        return true;
      }
    } catch (err) {
      console.error('[insightTracking] Unexpected error:', err);
      return false;
    }
  },

  // Mark as archived (don't show again)
  async archiveInsight(userId: string, insightId: string): Promise<boolean> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) return false;
    try {
      const { error } = await (supabase as any)
        .from('insight_tracking')
        .upsert({
          user_id: userId,
          insight_id: insightId,
          status: 'archived',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,insight_id',
        });

      if (error) {
        console.error('[insightTracking] Error archiving:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[insightTracking] Unexpected error:', err);
      return false;
    }
  },
};
