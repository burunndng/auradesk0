import { supabase } from './supabaseClient';

export interface UserPreferences {
  user_id: string;
  theme: string;
  preferences: Record<string, any>;
  active_stack: any[];
  updated_at?: string;
}

/**
 * Service for managing user preferences and practice stack sync in Supabase
 */
export const preferenceDatabaseService = {
  /**
   * Fetch preferences for a specific user
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await (supabase
        .from('user_preferences') as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[preferenceDatabaseService] Error fetching preferences:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[preferenceDatabaseService] Unexpected error fetching preferences:', err);
      return null;
    }
  },

  /**
   * Save or update user preferences
   */
  async savePreferences(prefs: UserPreferences): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('user_preferences') as any)
        .upsert({
          ...prefs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('[preferenceDatabaseService] Error saving preferences:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[preferenceDatabaseService] Unexpected error saving preferences:', err);
      return false;
    }
  },

  /**
   * Update specifically the active stack
   */
  async updateStack(userId: string, stack: any[]): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('user_preferences') as any)
        .upsert({
          user_id: userId,
          active_stack: stack,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('[preferenceDatabaseService] Error updating stack:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[preferenceDatabaseService] Unexpected error updating stack:', err);
      return false;
    }
  }
};
