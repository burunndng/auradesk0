import { supabase } from './supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from './database.types';

export interface WizardSessionDTO {
  user_id: string;
  session_id: string;
  type: string;
  content: any;
  insights?: any[];
  created_at?: string;
  completed_at?: string;
}

/**
 * Service for managing Wizard Sessions in Supabase PostgreSQL
 */
export const wizardSessionService = {
  /**
   * Save a single wizard session to Supabase
   */
  async saveSession(session: WizardSessionDTO): Promise<boolean> {
    try {
      // Sanitize content: JSON round-trip strips `undefined` values which Supabase rejects with 400
      const sanitizedContent = JSON.parse(JSON.stringify(session.content ?? {}));
      const sanitizedInsights = JSON.parse(JSON.stringify(session.insights ?? []));

      const dbRow: Database['public']['Tables']['wizard_sessions']['Insert'] = {
        user_id: session.user_id,
        session_id: session.session_id,
        type: session.type,
        content: sanitizedContent,
        insights: sanitizedInsights as any,
        created_at: session.created_at || new Date().toISOString(),
        completed_at: session.completed_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try upsert first; fall back to insert-only if constraint doesn't exist yet
      let error: PostgrestError | null = null;
      const upsertResult = await (supabase
        .from('wizard_sessions') as any)
        .upsert([dbRow as any], { onConflict: 'session_id', ignoreDuplicates: false });

      if (upsertResult.error?.code === '42P10') {
        // Constraint doesn't exist yet; do plain insert
        const insertResult = await supabase.from('wizard_sessions').insert([dbRow]);
        error = insertResult.error;
      } else {
        error = upsertResult.error;
      }

      if (error) {
        console.error('[wizardSessionService] Error saving session:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[wizardSessionService] Unexpected error saving session:', err);
      return false;
    }
  },

  /**
   * Fetch all sessions of a specific type for a user
   */
  async getSessionsByType(userId: string, type: string): Promise<any[]> {
    try {
      const { data, error } = await (supabase
        .from('wizard_sessions') as any)
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[wizardSessionService] Error fetching sessions:', error);
        return [];
      }

      // Map back to application format (extract content and merge metadata)
      return (data || []).map((row: any) => ({
        ...row.content,
        id: row.session_id, // Ensure ID consistency
        date: row.created_at,
        // We preserve other fields from content, but row metadata (created_at) is authoritative
      }));
    } catch (err) {
      console.error('[wizardSessionService] Unexpected error fetching sessions:', err);
      return [];
    }
  },

  /**
   * Delete a session
   */
  async getUserStats(userId: string): Promise<{ sessionCount: number; insightCount: number }> {
    try {
      const [{ count: sessions }, { count: insights }] = await Promise.all([
        supabase.from('wizard_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('integrated_insights').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);
      return { sessionCount: sessions ?? 0, insightCount: insights ?? 0 };
    } catch {
      return { sessionCount: 0, insightCount: 0 };
    }
  },

  async getTopPractices(userId: string, limit = 5): Promise<{ wizardType: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('wizard_sessions')
        .select('type')
        .eq('user_id', userId);

      if (error || !data) return [];

      // Count by type
      const counts: Record<string, number> = {};
      for (const row of data) {
        if ((row as any).type) {
          counts[(row as any).type] = (counts[(row as any).type] || 0) + 1;
        }
      }

      return Object.entries(counts)
        .map(([wizardType, count]) => ({ wizardType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wizard_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('[wizardSessionService] Error deleting session:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[wizardSessionService] Unexpected error deleting session:', err);
      return false;
    }
  }
};
