import { supabase } from './supabaseClient';
import { IntegratedInsight } from '../types';
import { Database } from './database.types';

/**
 * Service for managing Integrated Insights in Supabase PostgreSQL
 */
export const insightDatabaseService = {
  /**
   * Fetch all integrated insights for the current user
   */
  async getInsights(userId: string): Promise<IntegratedInsight[]> {
    try {
      const { data, error } = await supabase
        .from('integrated_insights')
        .select('*')
        .eq('user_id', userId)
        .order('date_created', { ascending: false });

      if (error) {
        console.error('[insightDatabaseService] Error fetching insights:', error);
        return [];
      }

      // Map snake_case database fields to camelCase TypeScript fields if necessary
      // Using explicit typing for the row from Supabase
      return (data || []).map((row: any) => ({
        id: row.id,
        mindToolType: row.mind_tool_type,
        mindToolSessionId: row.mind_tool_session_id,
        mindToolName: row.mind_tool_name,
        mindToolReport: row.mind_tool_report,
        mindToolShortSummary: row.mind_tool_short_summary,
        detectedPattern: row.detected_pattern,
        suggestedShadowWork: (row.suggested_shadow_work as any) ?? [],
        suggestedNextSteps: (row.suggested_next_steps as any) ?? [],
        dateCreated: row.date_created,
        status: row.status as 'pending' | 'addressed',
        shadowWorkSessionsAddressed: (row.shadow_work_sessions_addressed as any) ?? [],
        relatedPracticeSessions: (row.related_practice_sessions as any) ?? [],
        practiceOutcome: (row.practice_outcome as any) ?? null,
        patternEvolutionNotes: row.pattern_evolution_notes,
        lineageId: row.lineage_id,
        generatedBy: row.generated_by as any,
        confidenceScore: row.confidence_score,
      })) as IntegratedInsight[];
    } catch (err) {
      console.error('[insightDatabaseService] Unexpected error fetching insights:', err);
      return [];
    }
  },

  /**
   * Save a single integrated insight to Supabase
   */
  async saveInsight(userId: string, insight: IntegratedInsight): Promise<boolean> {
    try {
      const dbRow: Database['public']['Tables']['integrated_insights']['Insert'] = {
        id: insight.id,
        user_id: userId,
        mind_tool_type: insight.mindToolType,
        mind_tool_session_id: insight.mindToolSessionId,
        mind_tool_name: insight.mindToolName,
        mind_tool_report: insight.mindToolReport,
        mind_tool_short_summary: insight.mindToolShortSummary,
        detected_pattern: insight.detectedPattern,
        suggested_shadow_work: insight.suggestedShadowWork as any,
        suggested_next_steps: insight.suggestedNextSteps as any,
        date_created: insight.dateCreated,
        status: insight.status,
        shadow_work_sessions_addressed: insight.shadowWorkSessionsAddressed as any,
        related_practice_sessions: insight.relatedPracticeSessions as any,
        practice_outcome: insight.practiceOutcome as any,
        pattern_evolution_notes: insight.patternEvolutionNotes,
        lineage_id: insight.lineageId,
        generated_by: insight.generatedBy,
        confidence_score: insight.confidenceScore,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('integrated_insights')
        .upsert(dbRow as any, { onConflict: 'id' });

      if (error) {
        console.error('[insightDatabaseService] Error saving insight:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[insightDatabaseService] Unexpected error saving insight:', err);
      return false;
    }
  },

  /**
   * Bulk save multiple insights (useful for initial migration)
   */
  async saveInsights(userId: string, insights: IntegratedInsight[]): Promise<boolean> {
    try {
      const dbRows: Database['public']['Tables']['integrated_insights']['Insert'][] = insights.map(insight => ({
        id: insight.id,
        user_id: userId,
        mind_tool_type: insight.mindToolType,
        mind_tool_session_id: insight.mindToolSessionId,
        mind_tool_name: insight.mindToolName,
        mind_tool_report: insight.mindToolReport,
        mind_tool_short_summary: insight.mindToolShortSummary,
        detected_pattern: insight.detectedPattern,
        suggested_shadow_work: insight.suggestedShadowWork as any,
        suggested_next_steps: insight.suggestedNextSteps as any,
        date_created: insight.dateCreated,
        status: insight.status,
        shadow_work_sessions_addressed: insight.shadowWorkSessionsAddressed as any,
        related_practice_sessions: insight.relatedPracticeSessions as any,
        practice_outcome: insight.practiceOutcome as any,
        pattern_evolution_notes: insight.patternEvolutionNotes,
        lineage_id: insight.lineageId,
        generated_by: insight.generatedBy,
        confidence_score: insight.confidenceScore,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('integrated_insights')
        .upsert(dbRows as any, { onConflict: 'id' });

      if (error) {
        console.error('[insightDatabaseService] Error bulk saving insights:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[insightDatabaseService] Unexpected error bulk saving insights:', err);
      return false;
    }
  },

  /**
   * Delete an insight from Supabase
   */
  async deleteInsight(insightId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('integrated_insights')
        .delete()
        .eq('id', insightId);

      if (error) {
        console.error('[insightDatabaseService] Error deleting insight:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[insightDatabaseService] Unexpected error deleting insight:', err);
      return false;
    }
  }
};
