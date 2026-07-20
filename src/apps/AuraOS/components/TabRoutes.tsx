import React, { lazy, useCallback, useState } from 'react';
import { ActiveTab, Practice, AttachmentAssessmentSession, IntegratedInsight } from '../types.ts';
import { ModuleKey, AllPractice } from '../types.ts';
import { practices as corePractices } from '../constants.ts';
import * as aiService from '../services/aiService';
import {
  usePracticeContext,
  useNavigationContext,
  useUserContext,
  useInsightsContext,
  useAIContext,
  useWizardContext,
  useModalContext
} from '../contexts';
import { useToast } from './shared/ToastContext.tsx';
import { JourneyProgress } from '../types.ts';

// Tab components
const DashboardTab = lazy(() => import('./tabs/DashboardTab.tsx'));
const PracticeHubTab = lazy(() => import('./tabs/PracticeHubTab.tsx'));
const StackTab = lazy(() => import('./tabs/StackTab.tsx'));
const BrowseTab = lazy(() => import('./tabs/BrowseTab.tsx'));
const TrackerTab = lazy(() => import('./tabs/TrackerTab.tsx'));
const InsightsHubTab = lazy(() => import('./tabs/InsightsHubTab.tsx'));
const RecommendationsTab = lazy(() => import('./tabs/RecommendationsTab.tsx'));
const AqalTab = lazy(() => import('./tabs/AqalTab.tsx'));
const AQALLearningTab = lazy(() => import('./tabs/AQALLearningTab.tsx'));
const IntegralTheoryTab = lazy(() => import('../src/components/learning/IntegralTheory.tsx'));
const IntegralHistoryTab = lazy(() => import('../src/components/learning/IntegralHistory.tsx'));
const MetamodernBridgeBuilder = lazy(() => import('../src/components/learning/MetamodernBridgeBuilder.tsx'));
const MetamodernFrameworksDeepDive = lazy(() => import('../src/components/learning/MetamodernFrameworksDeepDive.tsx'));
const PracticeEcologyMap = lazy(() => import('../src/components/learning/PracticeEcologyMap.tsx'));
const SensemakingLab = lazy(() => import('../src/components/learning/SensemakingLab.tsx'));
const FrameworkEncyclopedia = lazy(() => import('../src/components/learning/FrameworkEncyclopedia.tsx'));
const LearnHubTab = lazy(() => import('./tabs/LearnHubTab.tsx'));
const ToolsHubTab = lazy(() => import('./tabs/ToolsHubTab.tsx'));
const ToolGuideTab = lazy(() => import('./tabs/ToolGuideTab.tsx'));
const MindToolsTab = lazy(() => import('./tabs/MindToolsTab.tsx'));
const ShadowToolsTab = lazy(() => import('./tabs/ShadowToolsTab.tsx'));
const BodyToolsTab = lazy(() => import('./tabs/BodyToolsTab.tsx'));
const SpiritToolsTab = lazy(() => import('./tabs/SpiritToolsTab.tsx'));
const LibraryTab = lazy(() => import('./tabs/LibraryTab.tsx'));
const OutroTab = lazy(() => import('./tabs/OutroTab.tsx'));
const JourneyTab = lazy(() => import('./tabs/JourneyTab.tsx'));
const PrintReportTab = lazy(() => import('./tabs/PrintReportTab.tsx'));
const MyInsightsTab = lazy(() => import('./tabs/MyInsightsTab.tsx'));
const ForumTab = lazy(() => import('./tabs/ForumTab.tsx'));
const ProfileTab = lazy(() => import('./tabs/ProfileTab.tsx'));
const ILPGraphQuiz = lazy(() => import('./visualizations/ILPGraphQuiz.tsx').then(module => ({ default: module.ILPGraphQuiz })));


export default function TabRoutes() {
  const {
    activeTab,
    setActiveTab,
    setActiveWizardAndLink,
    setActiveWizard,
  } = useNavigationContext();

  const { userId } = useUserContext();

  const {
    practiceStack,
    removeFromStack,
    practiceNotes,
    updatePracticeNote,
    addToStack,
    completedToday,
    togglePracticeCompletion,
    dailyNotes,
    updateDailyNote,
    findModuleKey,
    completionHistory,
    setPracticeStack,
  } = usePracticeContext();

  const {
    aiLoading,
    intelligentGuidance,
    isGuidanceLoading,
    handleGenerateIntelligentGuidance,
    aqalReport,
    generateAqalReport,
    aiError,
    guidanceError,
    clearGuidanceCache,
  } = useAIContext();

  const {
    integratedInsights,
    setIntegratedInsights,
    markInsightAsAddressedByPractice,
    markInsightAsAddressed,
  } = useInsightsContext();

  const {
    history,
    drafts,
    setters,
  } = useWizardContext();

  const { addToast } = useToast();

  // Journey progress — persisted to localStorage
  const JOURNEY_KEY = 'aura-journey-progress';
  const [journeyProgress, setJourneyProgressState] = useState<JourneyProgress>(() => {
    try {
      const raw = localStorage.getItem(JOURNEY_KEY);
      return raw ? JSON.parse(raw) : { visitedRegions: [], completedCards: [], earnedBadges: [] };
    } catch {
      return { visitedRegions: [], completedCards: [], earnedBadges: [] };
    }
  });

  const updateJourneyProgress = useCallback((progress: JourneyProgress) => {
    setJourneyProgressState(progress);
    try {
      localStorage.setItem(JOURNEY_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('[TabRoutes] Failed to persist journey progress:', e);
    }
  }, []);

  const {
    setIsGuidedPracticeGeneratorOpen,
    setIsCustomPracticeModalOpen,
    setCustomizationModalPractice,
    setIsEnergyWorkGuideOpen,
    setViewingShadowSession,
    setExplanationModal,
  } = useModalContext();

  const allPractices = Object.values(corePractices).flat();

  // Handlers brought from App.tsx
  const applyStarterStack = useCallback((practiceIds: string[]) => {
    const practicesToAdd = allPractices.filter(p => practiceIds.includes(p.id));
    setPracticeStack(prev => [...prev, ...practicesToAdd.filter(p => !prev.some(existing => existing.id === p.id))]);
    setActiveTab('stack');
  }, [allPractices, setPracticeStack, setActiveTab]);

  const handleExplainPractice = useCallback(async (practiceObj: any) => {
    setExplanationModal({ isOpen: true, title: practiceObj.name, explanation: "Aura is thinking..." });
    try {
      const explanation = await aiService.explainPractice(practiceObj);
      setExplanationModal({ isOpen: true, title: practiceObj.name, explanation });
    } catch (e) {
      setExplanationModal({ isOpen: true, title: practiceObj.name, explanation: "Sorry, I couldn't generate an explanation." });
    }
  }, [setExplanationModal]);

  const onStart321 = useCallback(() => {
    drafts.setDraft321(null);
    setActiveWizardAndLink('321');
  }, [drafts, setActiveWizardAndLink]);

  const onResume321 = useCallback((id: string) => {
    setActiveWizardAndLink('321', id);
  }, [setActiveWizardAndLink]);

  const onStartIFS = useCallback(() => {
    drafts.setDraftIFS(null);
    setActiveWizardAndLink('ifs');
  }, [drafts, setActiveWizardAndLink]);

  const onResumeIFS = useCallback((id: string) => {
    setActiveWizardAndLink('ifs', id);
  }, [setActiveWizardAndLink]);

  const onStartMemoryRecon = useCallback(() => {
    drafts.setDraftMemoryRecon(null);
    setActiveWizardAndLink('memory-reconsolidation');
  }, [drafts, setActiveWizardAndLink]);

  const onResumeMemoryRecon = useCallback((id: string) => {
    setActiveWizardAndLink('memory-reconsolidation', id);
  }, [setActiveWizardAndLink]);

  const onStartShadowJournal = useCallback(() => {
    setActiveWizardAndLink('shadow-journaling');
  }, [setActiveWizardAndLink]);

  const onOpenPsychedelicHub = useCallback(() => {
    setActiveWizardAndLink('psychedelic-hub');
  }, [setActiveWizardAndLink]);

  // NOTE: ReturnOfRitual and QuantifiedSelf wizards are not yet implemented in the draft system
  // These are placeholder handlers for future implementation
  const handleSaveReturnOfRitual = useCallback(async (session: any) => {
    console.log('[TabRoutes] Return of Ritual session save not yet implemented');
    setActiveWizardAndLink(null);
  }, [setActiveWizardAndLink]);

  const handleSaveQuantifiedSelf = useCallback(async (session: any) => {
    console.log('[TabRoutes] Quantified Self session save not yet implemented');
    setActiveWizardAndLink(null);
  }, [setActiveWizardAndLink]);

  // Dummy functions & static variables to match App.tsx's placeholders
  const highlightPracticeId = undefined;
  const linkedInsightIdForBrowse = undefined;
  const handleSaveAttachmentAssessment = (session: any) => { };
  const openEnergyWorkGuide = () => setIsEnergyWorkGuideOpen(true);
  const logPlanFeedback = useCallback((
    planId: string,
    dayDate: string,
    dayName: string,
    feedback: {
      completedWorkout: boolean;
      completedYinPractices: string[];
      intensityFelt: number;
      energyLevel: number;
      blockers?: string;
      notes?: string;
    }
  ) => {
    try {
      const key = 'aura-plan-feedback';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ planId, dayDate, dayName, ...feedback, loggedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing.slice(-100))); // keep last 100 entries
    } catch (e) {
      console.warn('[TabRoutes] Failed to log plan feedback:', e);
    }
  }, []);
  const getPlanProgress = () => null;
  const updatePlanStatus = useCallback((planId: string, status: 'active' | 'completed' | 'abandoned') => {
    setters.setIntegralBodyPlans((prev: any[]) =>
      prev.map(plan => plan.id === planId ? { ...plan, status } : plan)
    );
  }, [setters]);
  const onShowCelebration = useCallback(() => {
    addToast('🎉 Practice complete! Keep up the great work.', 'success');
  }, [addToast]);
  const historyAttachment = history.historyAttachment;
  const attachmentAssessmentHistory = history.historyAttachment;
  const history321 = history.history321;
  const historyIFS = history.historyIFS;
  const memoryReconHistory = history.memoryReconHistory;
  const shadowSessionHistory = history.shadowSessionHistory;
  const draft321 = drafts.draft321;
  const draftIFS = drafts.draftIFS;
  const draftMemoryRecon = drafts.draftMemoryRecon;
  const draftPsychedelicJourney = drafts.draftPsychedelicJourney;
  const setDraft321 = drafts.setDraft321;
  const setDraftIFS = drafts.setDraftIFS;
  const partsLibrary = history.partsLibrary;
  const integralBodyPlans = history.integralBodyPlans;
  const workoutPrograms = history.workoutPrograms;
  const planHistory = history.integralBodyPlanHistory;
  const personalizationSummary = null;
  const handleClearGuidanceCache = clearGuidanceCache;
  const openGuidedPracticeGenerator = () => setIsGuidedPracticeGeneratorOpen(true);
  const openCustomPracticeModal = () => setIsCustomPracticeModalOpen(true);
  const onViewShadowSession = (session: any) => setViewingShadowSession(session);
  const starterStacks = {}; // Placeholder if needed


  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab openGuidedPracticeGenerator={openGuidedPracticeGenerator} setActiveTab={setActiveTab} />;
    case 'practice-hub':
      return <PracticeHubTab setActiveTab={setActiveTab} />;
    case 'stack':
      return <StackTab practiceStack={practiceStack} removeFromStack={removeFromStack} practiceNotes={practiceNotes} updatePracticeNote={updatePracticeNote} openCustomPracticeModal={openCustomPracticeModal} openGuidedPracticeGenerator={openGuidedPracticeGenerator} starterStacks={starterStacks} applyStarterStack={applyStarterStack} completionHistory={completionHistory} findModuleKey={findModuleKey} />;
    case 'browse':
      return <BrowseTab practiceStack={practiceStack} addToStack={addToStack} onExplainClick={handleExplainPractice} onPersonalizeClick={setCustomizationModalPractice} highlightPracticeId={highlightPracticeId} linkedInsightId={linkedInsightIdForBrowse} markInsightAsAddressedByPractice={markInsightAsAddressedByPractice} attachmentAssessment={attachmentAssessmentHistory.length > 0 ? attachmentAssessmentHistory[attachmentAssessmentHistory.length - 1] : undefined} onLaunchWizard={setActiveWizardAndLink} />;
    case 'tracker':
      return <TrackerTab practiceStack={practiceStack} completedPractices={completedToday} togglePracticeCompletion={togglePracticeCompletion} dailyNotes={dailyNotes} updateDailyNote={updateDailyNote} findModuleKey={findModuleKey} />;
    case 'insights-hub':
      return <InsightsHubTab setActiveTab={setActiveTab} />;
    case 'my-insights':
      return <MyInsightsTab integratedInsights={integratedInsights} userId={userId} allPractices={allPractices} />;
    case 'recommendations':
      return <RecommendationsTab userId={userId} starterStacks={starterStacks} applyStarterStack={applyStarterStack} isLoading={aiLoading} error={aiError} intelligentGuidance={intelligentGuidance} isGuidanceLoading={isGuidanceLoading} guidanceError={guidanceError} onGenerateGuidance={async () => { await handleGenerateIntelligentGuidance(); }} onClearGuidanceCache={() => handleClearGuidanceCache(userId)} integratedInsights={integratedInsights} allPractices={allPractices} addToStack={addToStack} personalizationSummary={personalizationSummary} setActiveTab={setActiveTab} onLaunchWizard={setActiveWizardAndLink} />;
    case 'aqal':
      return <AqalTab report={aqalReport} isLoading={aiLoading} error={aiError} onGenerate={generateAqalReport} />;
    case 'aqal-learning':
      return <AQALLearningTab />;
    case 'learn-hub':
      return <LearnHubTab setActiveTab={setActiveTab} />;
    case 'integral-theory':
      return <IntegralTheoryTab onNavigateToBrowse={() => setActiveTab('browse')} />;
    case 'integral-history':
      return <IntegralHistoryTab />;
    case 'metamodern-bridge':
      return <MetamodernBridgeBuilder />;
    case 'metamodern-frameworks-deep-dive':
      return <MetamodernFrameworksDeepDive />;
    case 'practice-ecology':
      return <PracticeEcologyMap />;
    case 'framework-encyclopedia':
      return <FrameworkEncyclopedia />;
    case 'sensemaking-lab':
      return <SensemakingLab onLaunchEightZonesWizard={() => setActiveWizardAndLink('eight-zones')} />;
    case 'tools':
      return <ToolsHubTab setActiveTab={setActiveTab} />;
    case 'tool-guide':
      return <ToolGuideTab setActiveWizard={setActiveWizardAndLink} />;
    case 'mind-tools':
      return <MindToolsTab setActiveWizard={setActiveWizardAndLink} addToStack={addToStack} practiceStack={practiceStack} />;
    case 'shadow-tools':
      return (
        <ShadowToolsTab
          onStart321={onStart321}
          onResume321={onResume321}
          onStartIFS={onStartIFS}
          onResumeIFS={onResumeIFS}
          onStartMemoryRecon={onStartMemoryRecon}
          onStartShadowJournal={onStartShadowJournal}
          onOpenPsychedelicHub={onOpenPsychedelicHub}
          setActiveWizard={setActiveWizardAndLink}
          draft321Session={draft321}
          draftIFSSession={draftIFS}
          attachmentAssessment={historyAttachment.length > 0 ? historyAttachment[historyAttachment.length - 1] : undefined}
          onCompleteAttachmentAssessment={handleSaveAttachmentAssessment}
          addToStack={addToStack}
          practiceStack={practiceStack}
          userId={userId}
        />
      );
    case 'body-tools':
      return <BodyToolsTab setActiveWizard={setActiveWizardAndLink} integralBodyPlans={integralBodyPlans} workoutPrograms={workoutPrograms} planHistory={planHistory} onLogPlanFeedback={logPlanFeedback} getPlanProgress={getPlanProgress} onUpdatePlanStatus={updatePlanStatus} />;
    case 'spirit-tools':
      return <SpiritToolsTab setActiveWizard={setActiveWizardAndLink} historyBigMind={[]} />;
    case 'library':
      return <LibraryTab />;
    case 'outro':
      return <OutroTab />;
    case 'quiz':
      return <ILPGraphQuiz />;
    case 'journey':
      return <JourneyTab journeyProgress={journeyProgress} updateJourneyProgress={updateJourneyProgress} />;
    case 'forum':
      return <ForumTab setActiveTab={setActiveTab} />;
    case 'profile':
      return <ProfileTab />;
    case 'print-report':
      return <PrintReportTab />;
    default:
      return <DashboardTab openGuidedPracticeGenerator={openGuidedPracticeGenerator} setActiveTab={setActiveTab} />;
  }
}
