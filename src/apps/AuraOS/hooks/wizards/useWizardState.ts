import { useStorage as useLocalStorage } from '../useStorage';
import * as coreTypes from '../../types';

export function useWizardState() {
  // --- Draft Sessions ---

  const [draft321, setDraft321] = useLocalStorage<Partial<coreTypes.ThreeTwoOneSession> | null>('draft321', null);
  const [draftIFS, setDraftIFS] = useLocalStorage<coreTypes.IFSSession | null>('draftIFS', null);
  const [draftBias, setDraftBias] = useLocalStorage<coreTypes.BiasDetectiveSession | null>('draftBias', null);
  const [draftBiasFinder, setDraftBiasFinder] = useLocalStorage<coreTypes.BiasFinderSession | null>('draftBiasFinder', null);
  const [draftSO, setDraftSO] = useLocalStorage<coreTypes.SubjectObjectSession | null>('draftSO', null);
  const [draftPS, setDraftPS] = useLocalStorage<coreTypes.PerspectiveShifterSession | null>('draftPS', null);
  const [draftPM, setDraftPM] = useLocalStorage<coreTypes.PolarityMapDraft | null>('draftPM', null);
  const [draftKegan, setDraftKegan] = useLocalStorage<coreTypes.KeganAssessmentSession | null>('draftKegan', null);
  const [draftAttachment, setDraftAttachment] = useLocalStorage<coreTypes.AttachmentAssessmentSession | null>('draftAttachment', null);
  const [draftRoleAlignment, setDraftRoleAlignment] = useLocalStorage<coreTypes.RoleAlignmentSession | null>('draftRoleAlignment', null);
  const [draftBigMind, setDraftBigMind] = useLocalStorage<Partial<coreTypes.BigMindSession> | null>('draftBigMind', null);
  const [draftMemoryRecon, setDraftMemoryRecon] = useLocalStorage<coreTypes.MemoryReconsolidationDraft | null>('memoryReconDraft', null);
  const [draftEightZones, setDraftEightZones] = useLocalStorage<coreTypes.EightZonesDraft | null>('draftEightZones', null);
  const [draftSchemaSession, setDraftSchemaSession] = useLocalStorage<coreTypes.SchemaSession | null>('draftSchemaSession', null);
  const [_draftAdaptiveCycle, setDraftAdaptiveCycle] = useLocalStorage<coreTypes.AdaptiveCycleSession | null>('draftAdaptiveCycle', null);
  const [draftBioenergetics, setDraftBioenergetics] = useLocalStorage<coreTypes.BioenergeneticsSession | null>('draftBioenergetics', null);
  const [draftMeditation, setDraftMeditation] = useLocalStorage<any | null>('draftMeditation', null);
  const [draftDecision, setDraftDecision] = useLocalStorage<coreTypes.DecisionSession | null>('draftDecision', null);
  const [draftExaminingCoreBelief, setDraftExaminingCoreBelief] = useLocalStorage<coreTypes.ExaminingCoreBeliefSession | null>('draftExaminingCoreBelief', null);
  const [draftPsychedelicJourney, setDraftPsychedelicJourney] = useLocalStorage<Partial<coreTypes.PsychedelicJourneySession> | null>('draftPsychedelicJourney', null);
  const [draftCoherenceAudit, setDraftCoherenceAudit] = useLocalStorage<coreTypes.CoherenceAuditSession | null>('draftCoherenceAudit', null);
  const [draftLifeArch, setDraftLifeArch] = useLocalStorage<coreTypes.LifeArchSession | null>('draftLifeArch', null);
  const [draftRealityTunnel, setDraftRealityTunnel] = useLocalStorage<coreTypes.RealityTunnelDraft | null>('aura-draft-reality-tunnel', null);
  const [draftStructureOfFeeling, setDraftStructureOfFeeling] = useLocalStorage<coreTypes.StructureOfFeelingDraft | null>('aura-draft-structure-of-feeling', null);

  // --- Session History ---
  const [history321, setHistory321] = useLocalStorage<coreTypes.ThreeTwoOneSession[]>('history321', []);
  const [historyIFS, setHistoryIFS] = useLocalStorage<coreTypes.IFSSession[]>('historyIFS', []);
  const [historyBias, setHistoryBias] = useLocalStorage<coreTypes.BiasDetectiveSession[]>('historyBias', []);
  const [historyBiasFinder, setHistoryBiasFinder] = useLocalStorage<coreTypes.BiasFinderSession[]>('historyBiasFinder', []);
  const [historySO, setHistorySO] = useLocalStorage<coreTypes.SubjectObjectSession[]>('historySO', []);
  const [historyPS, setHistoryPS] = useLocalStorage<coreTypes.PerspectiveShifterSession[]>('historyPS', []);
  const [historyPM, setHistoryPM] = useLocalStorage<coreTypes.PolarityMap[]>('historyPM', []);
  const [historyKegan, setHistoryKegan] = useLocalStorage<coreTypes.KeganAssessmentSession[]>('historyKegan', []);
  const [historyRoleAlignment, setHistoryRoleAlignment] = useLocalStorage<coreTypes.RoleAlignmentSession[]>('historyRoleAlignment', []);
  const [historyJhana, setHistoryJhana] = useLocalStorage<coreTypes.JhanaSession[]>('historyJhana', []);
  const [memoryReconHistory, setMemoryReconHistory] = useLocalStorage<coreTypes.MemoryReconsolidationSession[]>('memoryReconHistory', []);
  const [eightZonesHistory, setEightZonesHistory] = useLocalStorage<coreTypes.EightZonesSession[]>('eightZonesHistory', []);
  const [adaptiveCycleHistory, setAdaptiveCycleHistory] = useLocalStorage<coreTypes.AdaptiveCycleSession[]>('adaptiveCycleHistory', []);
  const [somaticPracticeHistory, setSomaticPracticeHistory] = useLocalStorage<coreTypes.SomaticPracticeSession[]>('somaticPracticeHistory', []);
  const [historyAttachment, setHistoryAttachment] = useLocalStorage<coreTypes.AttachmentAssessmentSession[]>('historyAttachment', []);
  const [historyBigMind, setHistoryBigMind] = useLocalStorage<coreTypes.BigMindSession[]>('historyBigMind', []);
  const [shadowSessionHistory, setShadowSessionHistory] = useLocalStorage<coreTypes.ShadowSessionResult[]>('shadowSessions', []);
  const [integralBodyPlans, setIntegralBodyPlans] = useLocalStorage<coreTypes.IntegralBodyPlan[]>('integralBodyPlans', []);
  const [workoutPrograms, setWorkoutPrograms] = useLocalStorage<coreTypes.WorkoutProgram[]>('workoutPrograms', []);
  const [schemaDetectiveSessions, setSchemaDetectiveSessions] = useLocalStorage<coreTypes.SchemaSession[]>('schemaDetectiveSessions', []);
  const [partsLibrary, setPartsLibrary] = useLocalStorage<coreTypes.IFSPart[]>('partsLibrary', []);
  const [integralBodyPlanHistory, setIntegralBodyPlanHistory] = useLocalStorage<coreTypes.PlanHistoryEntry[]>('integralBodyPlanHistory', []);
  const [planProgressByDay, setPlanProgressByDay] = useLocalStorage<coreTypes.PlanProgressByDay>('planProgressByDay', {});
  const [bioenergeneticsHistory, setBioenergeneticsHistory] = useLocalStorage<coreTypes.BioenergeneticsSession[]>('bioenergeneticsHistory', []);
  const [meditationWizardHistory, setMeditationWizardHistory] = useLocalStorage<any[]>('meditationWizardHistory', []);
  const [immunityToChangeHistory, setImmunityToChangeHistory] = useLocalStorage<any[]>('aura-immunity-to-change-sessions', []);
  const [contextAIHistory, setContextAIHistory] = useLocalStorage<any[]>('aura-context-ai-sessions', []);
  const [decisionWizardHistory, setDecisionWizardHistory] = useLocalStorage<coreTypes.DecisionSession[]>('decisionWizardHistory', []);
  const [examiningCoreBeliefHistory, setExaminingCoreBeliefHistory] = useLocalStorage<coreTypes.ExaminingCoreBeliefSession[]>('examiningCoreBeliefHistory', []);
  const [psychedelicJourneyHistory, setPsychedelicJourneyHistory] = useLocalStorage<coreTypes.PsychedelicJourneySession[]>('psychedelicJourneyHistory', []);
  const [lifeArchHistory, setLifeArchHistory] = useLocalStorage<coreTypes.LifeArchSession[]>('lifeArchHistory', []);
  const [realityTunnelHistory, setRealityTunnelHistory] = useLocalStorage<coreTypes.RealityTunnelSession[]>('aura-reality-tunnel-history', []);
  const [structureOfFeelingHistory, setStructureOfFeelingHistory] = useLocalStorage<coreTypes.StructureOfFeelingSession[]>('aura-history-structure-of-feeling', []);
  const [dailyCheckinHistory, setDailyCheckinHistory] = useLocalStorage<coreTypes.DailyCheckinSession[]>('aura-history-daily-checkin', []);


  return {
    drafts: {
      draft321, setDraft321, draftIFS, setDraftIFS, draftBias, setDraftBias,
      draftBiasFinder, setDraftBiasFinder, draftSO, setDraftSO, draftPS, setDraftPS,
      draftPM, setDraftPM, draftKegan, setDraftKegan,
      draftAttachment, setDraftAttachment, draftRoleAlignment, setDraftRoleAlignment,
      draftBigMind, setDraftBigMind, draftMemoryRecon, setDraftMemoryRecon,
      draftEightZones, setDraftEightZones, draftSchemaSession, setDraftSchemaSession,
      draftAdaptiveCycle: _draftAdaptiveCycle, setDraftAdaptiveCycle, draftBioenergetics, setDraftBioenergetics, draftMeditation, setDraftMeditation,
      draftDecision, setDraftDecision, draftExaminingCoreBelief, setDraftExaminingCoreBelief,
      draftPsychedelicJourney, setDraftPsychedelicJourney, draftCoherenceAudit, setDraftCoherenceAudit,
      draftLifeArch, setDraftLifeArch,
      draftRealityTunnel, setDraftRealityTunnel,
      draftStructureOfFeeling, setDraftStructureOfFeeling,
    },
    history: {
      history321, historyIFS, historyBias, historyBiasFinder, historySO, historyPS,
      historyPM, historyKegan, historyRoleAlignment, historyJhana,
      memoryReconHistory, eightZonesHistory, adaptiveCycleHistory, somaticPracticeHistory,
      historyAttachment, historyBigMind, shadowSessionHistory, integralBodyPlans,
      workoutPrograms, schemaDetectiveSessions, partsLibrary, integralBodyPlanHistory,
      planProgressByDay, bioenergeneticsHistory, meditationWizardHistory, decisionWizardHistory,
      examiningCoreBeliefHistory, psychedelicJourneyHistory, immunityToChangeHistory, contextAIHistory,
      lifeArchHistory,
      realityTunnelHistory,
      dailyCheckinHistory,
      structureOfFeelingHistory,
    },
    setters: {
      setHistory321, setHistoryIFS, setHistoryBias, setHistoryBiasFinder, setHistorySO,
      setHistoryPS, setHistoryPM, setHistoryKegan, setHistoryRoleAlignment,
      setHistoryJhana, setMemoryReconHistory, setEightZonesHistory, setAdaptiveCycleHistory,
      setSomaticPracticeHistory, setHistoryAttachment, setHistoryBigMind, setShadowSessionHistory,
      setIntegralBodyPlans, setWorkoutPrograms, setSchemaDetectiveSessions, setPartsLibrary,
      setIntegralBodyPlanHistory, setPlanProgressByDay, setDecisionWizardHistory, setExaminingCoreBeliefHistory,
      setBioenergeneticsHistory, setMeditationWizardHistory, setPsychedelicJourneyHistory, setImmunityToChangeHistory,
      setContextAIHistory, setLifeArchHistory, setDraft321, setDraftIFS, setDraftBias, setDraftBiasFinder, setDraftSO, setDraftPS,
      setDraftPM, setDraftKegan, setDraftAttachment, setDraftRoleAlignment,
      setDraftBigMind, setDraftEightZones, setDraftSchemaSession, setDraftAdaptiveCycle, setDraftBioenergetics, setDraftMeditation,
      setDraftDecision, setDraftExaminingCoreBelief, setDraftPsychedelicJourney, setDraftCoherenceAudit, setDraftLifeArch,
      setDraftRealityTunnel, setRealityTunnelHistory,
      setDailyCheckinHistory,
      setStructureOfFeelingHistory,
      setDraftStructureOfFeeling,
    }
  };
}
