import React, { createContext, useContext, ReactNode } from 'react';
import { useWizardSessions } from '../hooks/useWizardSessions';
import { useUserContext } from './UserContext';
import { useInsightsContext } from './InsightsContext';
import { usePracticeContext } from './PracticeContext';
import { useAIContext } from './AIContext';
import { useNavigationContext } from './NavigationContext';

const WizardContext = createContext<ReturnType<typeof useWizardSessions> | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const { userId, userProfile } = useUserContext();
  const { practiceStack, practiceNotes, completedToday } = usePracticeContext();
  const { setIntelligentGuidance } = useAIContext();
  const { integratedInsights, setIntegratedInsights } = useInsightsContext();
  const { navigateBack, setActiveTab, setActiveWizard } = useNavigationContext();

  const wizardSessions = useWizardSessions(
    userId,
    practiceStack,
    practiceNotes,
    completedToday,
    userProfile,
    setIntelligentGuidance,
    setIntegratedInsights,
    integratedInsights,
    navigateBack,
    setActiveTab,
    setActiveWizard
  );

  return (
    <WizardContext.Provider value={wizardSessions}>
      {children}
    </WizardContext.Provider>
  );
}

// Default context value (used before WizardProvider mounts)
const defaultContext: ReturnType<typeof useWizardSessions> = {
  // Draft sessions (empty)
  drafts: {
    draft321: null,
    setDraft321: () => {},
    draftIFS: null,
    setDraftIFS: () => {},
    draftBias: null,
    setDraftBias: () => {},
    draftBiasFinder: null,
    setDraftBiasFinder: () => {},
    draftSO: null,
    setDraftSO: () => {},
    draftPS: null,
    setDraftPS: () => {},
    draftPM: null,
    setDraftPM: () => {},
    draftKegan: null,
    setDraftKegan: () => {},
    draftAttachment: null,
    setDraftAttachment: () => {},
    draftRoleAlignment: null,
    setDraftRoleAlignment: () => {},
    draftBigMind: null,
    setDraftBigMind: () => {},
    draftMemoryRecon: null,
    setDraftMemoryRecon: () => {},
    draftEightZones: null,
    setDraftEightZones: () => {},
    draftSchemaSession: null,
    setDraftSchemaSession: () => {},
    draftAdaptiveCycle: null,
    setDraftAdaptiveCycle: () => {},
    draftBioenergetics: null,
    setDraftBioenergetics: () => {},
    draftMeditation: null,
    setDraftMeditation: () => {},
    draftDecision: null,
    setDraftDecision: () => {},
    draftPsychedelicJourney: null,
    setDraftPsychedelicJourney: () => {},
    draftCoherenceAudit: null,
    setDraftCoherenceAudit: () => {},
    draftLifeArch: null,
    setDraftLifeArch: () => {},
  },
  // History arrays (empty)
  history: {
    history321: [],
    setHistory321: () => {},
    historyIFS: [],
    setHistoryIFS: () => {},
    historyBias: [],
    setHistoryBias: () => {},
    historyBiasFinder: [],
    setHistoryBiasFinder: () => {},
    historySO: [],
    setHistorySO: () => {},
    historyPS: [],
    setHistoryPS: () => {},
    historyPM: [],
    setHistoryPM: () => {},
    historyKegan: [],
    setHistoryKegan: () => {},
    historyRoleAlignment: [],
    setHistoryRoleAlignment: () => {},
    historyJhana: [],
    setHistoryJhana: () => {},
    memoryReconHistory: [],
    setMemoryReconHistory: () => {},
    eightZonesHistory: [],
    setEightZonesHistory: () => {},
    adaptiveCycleHistory: [],
    setAdaptiveCycleHistory: () => {},
    somaticPracticeHistory: [],
    setSomaticPracticeHistory: () => {},
    historyAttachment: [],
    setHistoryAttachment: () => {},
    historyBigMind: [],
    setHistoryBigMind: () => {},
    shadowSessionHistory: [],
    setShadowSessionHistory: () => {},
    integralBodyPlans: [],
    setIntegralBodyPlans: () => {},
    workoutPrograms: [],
    setWorkoutPrograms: () => {},
    schemaDetectiveSessions: [],
    setSchemaDetectiveSessions: () => {},
    partsLibrary: [],
    setPartsLibrary: () => {},
    integralBodyPlanHistory: [],
    setIntegralBodyPlanHistory: () => {},
    planProgressByDay: {},
    setPlanProgressByDay: () => {},
    bioenergeneticsHistory: [],
    setBioenergeneticsHistory: () => {},
    meditationWizardHistory: [],
    setMeditationWizardHistory: () => {},
    immunityToChangeHistory: [],
    setImmunityToChangeHistory: () => {},
    contextAIHistory: [],
    setContextAIHistory: () => {},
    decisionWizardHistory: [],
    setDecisionWizardHistory: () => {},
    psychedelicJourneyHistory: [],
    setPsychedelicJourneyHistory: () => {},
  },
  // Handlers (no-ops)
  handlers: {
    handleSave321: async () => {},
    handleSaveIFS: async () => {},
    handleSaveBiasSession: async () => {},
    handleSaveBiasFinderSession: async () => {},
    handleSaveSOSession: async () => {},
    handleSavePSSession: async () => {},
    handleSavePMSession: async () => {},
    handleSaveKeganSession: async () => {},
    handleSaveAttachmentSession: async () => {},
    handleSaveRoleAlignmentSession: async () => {},
    handleSaveJhanaSession: async () => {},
    handleSaveMemoryReconSession: async () => {},
    handleSaveEightZonesSession: async () => {},
    handleSaveAdaptiveCycleSession: async () => {},
    handleSaveSomaticPracticeSession: async () => {},
    handleSaveSchemaSession: async () => {},
    handleSaveBigMindSession: async () => {},
    handleSaveShadowSession: async () => {},
    handleSaveBodyPlan: async () => {},
    handleSaveWorkoutProgram: async () => {},
    handleBioenergeneticsSubmit: async () => {},
    handleMeditationWizardSubmit: async () => {},
    handleImmunityToChangeSubmit: async () => {},
    handleContextAISubmit: async () => {},
    handleSaveDecisionSession: async () => {},
    handleSavePsychedelicJourneySession: async () => {},
    handleSaveCoherenceAuditSession: async () => {},
    handleSaveLifeArchSession: async () => {},
    handleSaveRelationalFieldSession: async () => {},
    handleSaveCulturalShadowSession: async () => {},
  },
} as any;

export function useWizardContext() {
  const context = useContext(WizardContext);
  // Return default values if provider not mounted yet
  return context || defaultContext;
}
