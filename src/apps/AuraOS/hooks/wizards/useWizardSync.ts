import { useEffect } from 'react';
import { wizardSessionService } from '../../services/wizardSessionService';

export function useWizardSync(userId: string, history: any, setters: any) {
  // --- Initial Sync from Supabase ---
  useEffect(() => {
    if (!userId) return;

    const loadHistoryFromSupabase = async () => {
      console.log('[useWizardSessions] Syncing history from Supabase for user:', userId);
      
      const typeMap: Record<string, [any[], (val: any) => void, string]> = {
        'three_two_one': [history.history321, setters.setHistory321, 'history321'],
        'ifs_session': [history.historyIFS, setters.setHistoryIFS, 'historyIFS'],
        'bias_detective': [history.historyBias, setters.setHistoryBias, 'historyBias'],
        'bias_finder': [history.historyBiasFinder, setters.setHistoryBiasFinder, 'historyBiasFinder'],
        'subject_object_explorer': [history.historySO, setters.setHistorySO, 'historySO'],
        'perspective_shifter': [history.historyPS, setters.setHistoryPS, 'historyPS'],
        'polarity_mapper': [history.historyPM, setters.setHistoryPM, 'historyPM'],
        'kegan_assessment': [history.historyKegan, setters.setHistoryKegan, 'historyKegan'],
        'role_alignment': [history.historyRoleAlignment, setters.setHistoryRoleAlignment, 'historyRoleAlignment'],
        'memory_reconsolidation': [history.memoryReconHistory, setters.setMemoryReconHistory, 'memoryReconHistory'],
        'eight_zones': [history.eightZonesHistory, setters.setEightZonesHistory, 'eightZonesHistory'],
        'adaptive_cycle': [history.adaptiveCycleHistory, setters.setAdaptiveCycleHistory, 'adaptiveCycleHistory'],
        'somatic_practice': [history.somaticPracticeHistory, setters.setSomaticPracticeHistory, 'somaticPracticeHistory'],
        'attachment_assessment': [history.historyAttachment, setters.setHistoryAttachment, 'historyAttachment'],
        'big_mind_process': [history.historyBigMind, setters.setHistoryBigMind, 'historyBigMind'],
        'shadow_journaling': [history.shadowSessionHistory, setters.setShadowSessionHistory, 'shadowSessionHistory'],
        'integral_body_plan': [history.integralBodyPlans, setters.setIntegralBodyPlans, 'integralBodyPlans'],
        'workout_program': [history.workoutPrograms, setters.setWorkoutPrograms, 'workoutPrograms'],
        'schema_detective': [history.schemaDetectiveSessions, setters.setSchemaDetectiveSessions, 'schemaDetectiveSessions'],
        'bioenergetics': [history.bioenergeneticsHistory, setters.setBioenergeneticsHistory, 'bioenergeneticsHistory'],
        'meditation_finder': [history.meditationWizardHistory, setters.setMeditationWizardHistory, 'meditationWizardHistory'],
        'immunity_to_change': [history.immunityToChangeHistory, setters.setImmunityToChangeHistory, 'immunityToChangeHistory'],
        'context_ai_root_cause': [history.contextAIHistory, setters.setContextAIHistory, 'contextAIHistory'],
        'decision_wizard': [history.decisionWizardHistory, setters.setDecisionWizardHistory, 'decisionWizardHistory'],
        'psychedelic_journey': [history.psychedelicJourneyHistory, setters.setPsychedelicJourneyHistory, 'psychedelicJourneyHistory'],
      };

      for (const [dbType, [localHistory, setter, name]] of Object.entries(typeMap)) {
        try {
          const dbSessions = await wizardSessionService.getSessionsByType(userId, dbType);
          if (dbSessions && dbSessions.length > 0) {
            // Simple merge: DB is source of truth for history
            setter(dbSessions);
            
            // Initial migration: If local has sessions NOT in DB, upload them
            const dbIds = new Set(dbSessions.map(s => s.id));
            const unsynced = localHistory.filter(s => !dbIds.has(s.id));
            
            if (unsynced.length > 0) {
              console.log(`[useWizardSessions] Migrating ${unsynced.length} ${name} sessions to Supabase`);
              for (const session of unsynced) {
                await wizardSessionService.saveSession({
                  user_id: userId,
                  session_id: session.id || `migrated-${Date.now()}`,
                  type: dbType,
                  content: session,
                  created_at: session.date || new Date().toISOString()
                });
              }
            }
          } else if (localHistory.length > 0) {
            // DB empty but local has data -> upload all
            console.log(`[useWizardSessions] Initial migration of ${localHistory.length} ${name} sessions to Supabase`);
            for (const session of localHistory) {
              await wizardSessionService.saveSession({
                user_id: userId,
                session_id: session.id || `migrated-${Date.now()}`,
                type: dbType,
                content: session,
                created_at: session.date || new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.warn(`[useWizardSessions] Failed to sync ${dbType}:`, err);
        }
      }
    };

    loadHistoryFromSupabase();
  }, [userId]);


}
