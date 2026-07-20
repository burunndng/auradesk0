import React, { lazy, Suspense } from 'react';
import type { Practice, IntegratedInsight, IFSPart, BaseWizardSession } from '../types';
import type { WizardSequenceContext } from '../services/wizardSequenceContext';
import WizardErrorBoundary from './shared/WizardErrorBoundary';

// Wizard components
const AXISWizard = lazy(() => import('./wizards/AXIS/AXISWizard')); // Fixed: Moved to lazy load
const ThreeTwoOneWizard = lazy(() => import('./wizards/ThreeTwoOneWizard.tsx'));
const IFSWizard = lazy(() => import('./wizards/IFSWizard'));
const MourningFieldWizard = lazy(() => import('./wizards/MourningFieldWizard'));
const BiasDetectiveWizard = lazy(() => import('./wizards/BiasDetectiveWizard.tsx'));
const BiasFinderWizard = lazy(() => import('./wizards/BiasFinderWizard.tsx'));
const SubjectObjectWizard = lazy(() => import('./wizards/SubjectObjectWizard.tsx'));
const PerspectiveShifterWizard = lazy(() => import('./wizards/PerspectiveShifterWizard.tsx'));
const PolarityMapperWizard = lazy(() => import('./wizards/PolarityMapperWizard.tsx'));
const KeganAssessmentWizard = lazy(() => import('./wizards/KeganAssessmentWizard.tsx'));
const JhanaTracker = lazy(() => import('./wizards/JhanaTracker.tsx'));
const SomaticGeneratorWizard = lazy(() => import('./wizards/SomaticGeneratorWizard.tsx'));
const BioenergeneticsWizard = lazy(() => import('./wizards/BioenergeneticsWizard.tsx'));
const MeditationWizard = lazy(() => import('./wizards/MeditationWizard.tsx'));
const ConsciousnessGraph = lazy(() => import('./visualizations/ConsciousnessGraph.tsx'));
const SOTADashboard = lazy(() => import('./shared/SOTADashboard.tsx'));
const RoleAlignmentWizard = lazy(() => import('./wizards/RoleAlignmentWizard.tsx'));
const EightZonesWizard = lazy(() => import('./wizards/EightZonesWizard.tsx'));
const AdaptiveCycleWizard = lazy(() => import('./wizards/AdaptiveCycleWizard'));
const BigMindProcessWizard = lazy(() => import('./wizards/BigMindProcessWizard.tsx'));
const MemoryReconsolidationWizard = lazy(() => import('./wizards/MemoryReconsolidationWizard.tsx'));
const ShadowJournalingWizard = lazy(() => import('./wizards/ShadowJournalingWizard.tsx'));
const IntegralBodyArchitectWizard = lazy(() => import('./wizards/IntegralBodyArchitectWizard.tsx'));
const DynamicWorkoutArchitectWizard = lazy(() => import('./wizards/DynamicWorkoutArchitectWizard.tsx'));
const InsightOuroborosVisualizer = lazy(() => import('./visualizations/InsightOuroborosVisualizer.tsx'));
const SchemaDetectiveWizard = lazy(() => import('./wizards/SchemaDetectiveWizard.tsx'));
const ContextAIRootCauseWizard = lazy(() => import('./wizards/ContextAIRootCauseWizard.tsx'));
const ImmunityToChangeWizard = lazy(() => import('./wizards/ImmunityToChangeWizard.tsx'));
const DecisionWizard = lazy(() => import('./wizards/DecisionWizard.tsx'));
const ExaminingCoreBeliefWizard = lazy(() => import('./wizards/ExaminingCoreBeliefWizard.tsx'));
const SchemaReflectionWizard = lazy(() => import('./wizards/SchemaReflectionWizard/index.tsx'));
const PsychedelicJourneyHub = lazy(() => import('./wizards/PsychedelicJourneyHub.tsx'));
const SexologyCoachWizard = lazy(() => import('./wizards/SexologyCoachWizard.tsx'));
const TreeOfLifeWrapper = lazy(() => import('./wizards/TreeOfLifeWrapper.tsx'));
const AdvaitaMasterCoach = lazy(() => import('./wizards/AdvaitaMasterCoach.tsx'));
const DBTCoachWizard = lazy(() => import('./wizards/DBTCoachWizard.tsx'));
const TherapyStyleWizard = lazy(() => import('./wizards/TherapyStyleWizard.tsx'));
const MoralReasoningWizard = lazy(() => import('./wizards/MoralReasoningWizard.tsx'));
const StatesTrainingWizard = lazy(() => import('./wizards/StatesTrainingWizard.tsx'));
const GoldenShadowWizard = lazy(() => import('./wizards/GoldenShadowWizard.tsx'));
const AttachmentPracticeWizard = lazy(() => import('./wizards/AttachmentPracticeWizard.tsx'));
const ContemplativeInquiryWizard = lazy(() => import('./wizards/ContemplativeInquiryWizard.tsx'));
const InteroceptionWizard = lazy(() => import('./wizards/InteroceptionWizard.tsx'));
const SomaticCartographyWizard = lazy(() => import('./wizards/SomaticCartographyWizard.tsx'));
const IntegralPracticeDesignerWizard = lazy(() => import('./wizards/IntegralPracticeDesignerWizard.tsx'));
const UltimateConcernWizard = lazy(() => import('./wizards/UltimateConcernWizard.tsx'));
const GenerativityMapWizard = lazy(() => import('./wizards/GenerativityMapWizard.tsx'));
const CoherenceAuditWizard = lazy(() => import('./wizards/CoherenceAuditWizard.tsx'));
const RelationalFieldMapper = lazy(() => import('./wizards/RelationalFieldMapper.tsx'));
const LifeArchitectureWizard = lazy(() => import('./wizards/LifeArchitectureWizard.tsx'));
const CulturalShadowExcavator = lazy(() => import('./wizards/CulturalShadowExcavator.tsx'));
const FourQuadrantCatalystWizard = lazy(() => import('./wizards/FourQuadrantCatalystWizard.tsx'));
const ChronobiologyProtocolWizard = lazy(() => import('./wizards/ChronobiologyProtocolWizard.tsx'));
const RelationalBlueprintWizard = lazy(() => import('./wizards/RelationalBlueprintWizard.tsx'));
const PolyvagalWizard = lazy(() => import('./wizards/PolyvagalWizard'));
const RealityTunnelWizard = lazy(() => import('./wizards/RealityTunnelWizard.tsx'));
const RelationalPatternTracker = lazy(() => import('./wizards/RelationalPatternTracker.tsx'));
const InterpretationLensWizard = lazy(() => import('./wizards/InterpretationLensWizard.tsx'));
const DailyCheckinWizard = lazy(() => import('./wizards/DailyCheckinWizard.tsx'));
const DefusionLabWizard = lazy(() => import('./wizards/DefusionLabWizard.tsx'));
const EnneagramCompassWizard = lazy(() => import('./wizards/EnneagramCompassWizard.tsx'));
const EpistemicCrucibleWizard = lazy(() => import('./wizards/EpistemicCrucibleWizard.tsx'));
const TonglenWizard = lazy(() => import('./wizards/TonglenWizard.tsx'));
const IntegralCivicPracticeWizard = lazy(() => import('./wizards/IntegralCivicPracticeWizard.tsx'));
const StructureOfFeelingWizard = lazy(() => import('./wizards/StructureOfFeelingWizard.tsx'));
const PhenomenonMapperWizard = lazy(() => import('./wizards/PhenomenonMapperWizard'));
const ReturnOfRitualWizard = lazy(() => import('./wizards/ReturnOfRitualWizard.tsx'));
const QuantifiedSelfWizard = lazy(() => import('./wizards/QuantifiedSelfWizard.tsx'));
const InnerCompassWizard = lazy(() => import('./wizards/InnerCompassWizard.tsx'));
const ArchetypalContemplationWizard = lazy(() => import('./wizards/ArchetypalContemplationWizard.tsx'));

interface WizardRoutesProps {
  activeWizard: string | null;
  linkedInsightId?: string;
  navigateBack: () => void;
  getActiveInsightContext: () => IntegratedInsight | null;
  getWizardSequenceContext: (name: string, history: BaseWizardSession[], insights: IntegratedInsight[], linkedId?: string) => WizardSequenceContext;
  handlers: { [key: string]: (session: BaseWizardSession) => void | Promise<void>; };
  drafts: { [key: string]: unknown; };
  history: { [key: string]: BaseWizardSession[]; };
  partsLibrary: IFSPart[];
  markInsightAsAddressed: (insightId: string, shadowToolType: string, shadowSessionId: string) => void;
  userId: string;
  practiceStack: Practice[];
  completionHistory: Record<string, string[]>;
  addToStack: (practice: Practice) => void;
  integratedInsights: IntegratedInsight[];
  corePractices: Record<string, Practice[]>;
  currentPersonalizationSummary: unknown;
}

export default React.memo(function WizardRoutes(props: WizardRoutesProps) {
  const {
    activeWizard,
    linkedInsightId,
    navigateBack,
    getActiveInsightContext,
    getWizardSequenceContext,
    handlers,
    drafts,
    history,
    partsLibrary,
    markInsightAsAddressed,
    userId,
    practiceStack,
    completionHistory,
    addToStack,
    integratedInsights,
    corePractices,
    currentPersonalizationSummary,
  } = props;

  if (!activeWizard) return null;

  const insightContext = getActiveInsightContext();

  let sequenceContext = null;
  if (activeWizard === '321') {
    sequenceContext = getWizardSequenceContext(
      '3-2-1 Reflection',
      history.history321 || [],
      integratedInsights,
      linkedInsightId
    );
  }

  return (
    <WizardErrorBoundary wizardName={activeWizard} onClose={navigateBack}>
      <Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}>
        {(() => {
          switch (activeWizard) {
            case 'axis':
              return (
                <AXISWizard
                  onClose={() => navigateBack()}
                  userId={userId || 'anonymous'}
                  authUserId={userId}
                />
              );
            case '321':
              return (
                <ThreeTwoOneWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSave321Session as any}
                  session={drafts.draft321}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  sequenceContext={sequenceContext}
                />
              );
            case 'ifs':
              return (
                <IFSWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  onSaveSession={handlers.handleSaveIFSSession as any}
                  draft={drafts.draftIFS}
                  partsLibrary={partsLibrary}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  userId={userId}
                />
              );
            case 'bias':
              return (
                <BiasDetectiveWizard
                  userId={userId}
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveBiasSession as any}
                  session={drafts.draftBias}
                  setDraft={drafts.setDraftBias}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'biasfinder':
              return (
                <BiasFinderWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveBiasFinderSession}
                  session={drafts.draftBiasFinder}
                  setDraft={drafts.setDraftBiasFinder}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'so':
              return (
                <SubjectObjectWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveSOSession}
                  session={drafts.draftSO}
                  setDraft={drafts.setDraftSO}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'ps':
              return (
                <PerspectiveShifterWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSavePSSession}
                  session={drafts.draftPS}
                  setDraft={drafts.setDraftPS}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'pm':
              return (
                <PolarityMapperWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSavePMSession}
                  draft={drafts.draftPM}
                  setDraft={drafts.setDraftPM}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'kegan':
              return (
                <KeganAssessmentWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveKeganSession}
                  session={drafts.draftKegan}
                  setDraft={drafts.setDraftKegan}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'jhana':
              return (
                <JhanaTracker
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveJhanaSession}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'somatic':
              return (
                <SomaticGeneratorWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveSomaticPractice}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'bioenergetics':
              return (
                <BioenergeneticsWizard
                  onClose={() => navigateBack()}
                  onSessionSave={handlers.handleSaveBioenergetics}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'meditation':
              return (
                <MeditationWizard
                  onClose={() => navigateBack()}
                  onSessionSave={handlers.handleSaveMeditationWizard}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'consciousness-graph':
              return <ConsciousnessGraph onClose={() => navigateBack()} />;
            case 'sota-dashboard':
              return <SOTADashboard onClose={() => navigateBack()} />;
            case 'role-alignment':
              return (
                <RoleAlignmentWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveRoleAlignmentSession}
                  session={drafts.draftRoleAlignment}
                  setDraft={drafts.setDraftRoleAlignment}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'eight-zones':
              return (
                <EightZonesWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveEightZonesSession}
                  session={drafts.draftEightZones}
                  setDraft={drafts.setDraftEightZones}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'adaptive-cycle':
              return (
                <AdaptiveCycleWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveAdaptiveCycleSession}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'big-mind':
              return (
                <BigMindProcessWizard
                  onClose={(draft: any) => { drafts.setDraftBigMind(draft); navigateBack(); }}
                  onSave={handlers.handleSaveBigMindSession}
                  session={drafts.draftBigMind}
                  practiceStack={practiceStack.map(p => p.id)}
                  completionHistory={completionHistory}
                  addPracticeToStack={(practiceId: string) => {
                    const practice = Object.values(corePractices).flat().find(p => p.id === practiceId);
                    if (practice && !practiceStack.some(p => p.id === practiceId)) {
                      addToStack(practice);
                    }
                  }}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'memory-reconsolidation':
              return (
                <MemoryReconsolidationWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveMemoryReconSession}
                  session={drafts.draftMemoryRecon}
                  setDraft={drafts.setDraftMemoryRecon}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'shadow-journaling':
              return (
                <ShadowJournalingWizard
                  onClose={() => navigateBack()}
                  onComplete={handlers.handleSaveShadowSession}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'integral-body-architect':
              return (
                <IntegralBodyArchitectWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveIntegralBodyPlan}
                  onLaunchYangPractice={handlers.handleLaunchYangPractice}
                  onLaunchYinPractice={handlers.handleLaunchYinPractice}
                  personalizationSummary={currentPersonalizationSummary}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'dynamic-workout-architect':
              return (
                <DynamicWorkoutArchitectWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveWorkoutProgram}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'insight-practice-map':
              return (
                <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col">
                  <div className="border-b border-neutral-800/50 px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-100">Progress of Insight</h1>
                    <button onClick={() => navigateBack()} className="text-neutral-600 hover:text-neutral-300 transition-colors">✕</button>
                  </div>
                  <div className="flex-1 overflow-hidden p-8">
                    <InsightOuroborosVisualizer />
                  </div>
                </div>
              );
            case 'schema-detective':
              return (
                <SchemaDetectiveWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveSchemaSession}
                  session={drafts.draftSchemaSession}
                  setDraft={drafts.setDraftSchemaSession}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'context-ai':
              return (
                <ContextAIRootCauseWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  onSave={handlers.handleSaveContextAIRootCause}
                />
              );
            case 'immunity-to-change':
              return (
                <ImmunityToChangeWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  onSave={handlers.handleSaveImmunityToChange}
                />
              );
            case 'decision-wizard':
              return (
                <DecisionWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveDecisionSession}
                  session={drafts.draftDecision}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'examining-core-belief':
              return (
                <ExaminingCoreBeliefWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveExaminingCoreBelief}
                  session={drafts.draftExaminingCoreBelief}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'schema-reflection':
              return (
                <SchemaReflectionWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'psychedelic-hub':
              return (
                <PsychedelicJourneyHub
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSavePsychedelicJourneySession}
                  draft={drafts.draftPsychedelicJourney}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'sexology-coach':
              return (
                <SexologyCoachWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'tree-of-life':
              return (
                <TreeOfLifeWrapper
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'dbt-coach':
              return <DBTCoachWizard onClose={() => navigateBack()} userId={userId} />;

            case 'advaita':
              return (
                <AdvaitaMasterCoach
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'therapy-style':
              return (
                <TherapyStyleWizard onClose={() => navigateBack()} />
              );
            case 'moral-reasoning':
              return (
                <MoralReasoningWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'states-training':
              return (
                <StatesTrainingWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  onSave={handlers.handleSaveStatesTrainingSession}
                />
              );
            case 'golden-shadow':
              return (
                <GoldenShadowWizard
                  onClose={() => navigateBack()}
                />
              );
            case 'attachment-practice':
              return (
                <AttachmentPracticeWizard
                  onClose={() => navigateBack()}
                />
              );
            case 'contemplative-inquiry':
              return (
                <ContemplativeInquiryWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'tonglen':
              return (
                <TonglenWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'integral-civic-practice':
              return (
                <IntegralCivicPracticeWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'ultimate-concern':
              return (
                <UltimateConcernWizard
                  onClose={() => navigateBack()}
                />
              );
            case 'generativity-map':
              return (
                <GenerativityMapWizard
                  onClose={() => navigateBack()}
                />
              );
            case 'interoception':
              return (
                <InteroceptionWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                />
              );
            case 'somatic-cartography':
              return (
                <SomaticCartographyWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId ?? ''}
                />
              );
            case 'integral-practice-designer':
            case 'practice-designer':
              return (
                <IntegralPracticeDesignerWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'cbm-interpretation-lens':
              return (
                <InterpretationLensWizard
                  onClose={() => navigateBack()}
                />
              );
            case 'coherence-audit':
              return (
                <CoherenceAuditWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveCoherenceAuditSession}
                  draft={drafts.draftCoherenceAudit}
                  setDraft={drafts.setDraftCoherenceAudit}
                  userId={userId}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                />
              );
            case 'relational-field':
              return (
                <RelationalFieldMapper
                  isOpen={true}
                  onClose={() => navigateBack()}
                  onSaveSession={handlers.handleSaveRelationalFieldSession}
                  draft={drafts.draftRelationalField}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  userId={userId}
                />
              );
            case 'life-arch':
              return (
                <LifeArchitectureWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  onSaveSession={handlers.handleSaveLifeArchSession}
                  draft={drafts.draftLifeArch}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  userId={userId}
                />
              );
            case 'cultural-shadow':
              return (
                <CulturalShadowExcavator
                  isOpen={true}
                  onClose={() => navigateBack()}
                  onSaveSession={handlers.handleSaveCulturalShadowSession}
                  draft={drafts.draftCulturalShadow}
                  insightContext={insightContext}
                  markInsightAsAddressed={markInsightAsAddressed}
                  userId={userId}
                />
              );
            case '4-quadrant-catalyst':
              return (
                <FourQuadrantCatalystWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'chronobiology':
              return (
                <ChronobiologyProtocolWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                />
              );
            case 'relational':
              return (
                <RelationalPatternTracker
                  isOpen={true}
                  onClose={() => navigateBack()}
                />
              );
            case 'relational-blueprint':
              return (
                <RelationalBlueprintWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                />
              );
            case 'polyvagal-trainer':
              return (
                <PolyvagalWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'reality-tunnel':
              return (
                <RealityTunnelWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  draft={drafts.draftRealityTunnel ?? null}
                  onSave={handlers.handleSaveRealityTunnelSession}
                  userId={userId}
                />
              );
            case 'defusion-lab':
              return (
                <DefusionLabWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'daily-checkin':
              return (
                <DailyCheckinWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveDailyCheckin}
                  userId={userId}
                />
              );
            case 'enneagram-compass':
              return (
                <EnneagramCompassWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'epistemic-crucible':
              return (
                <EpistemicCrucibleWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'mourning-field':
              return (
                <MourningFieldWizard
                  isOpen={true}
                  onClose={() => navigateBack()}
                  insightContext={insightContext}
                  userId={userId}
                />
              );
            case 'phenomenon-mapper':
              return (
                <PhenomenonMapperWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'structure-of-feeling':
              return (
                <StructureOfFeelingWizard
                  onClose={() => navigateBack()}
                  onSave={handlers.handleSaveStructureOfFeeling}
                  draft={drafts.draftStructureOfFeeling}
                  setDraft={drafts.setDraftStructureOfFeeling}
                  userId={userId}
                />
              );
            case 'return-of-ritual':
              return (
                <ReturnOfRitualWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'quantified-self':
              return (
                <QuantifiedSelfWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'inner-compass':
              return (
                <InnerCompassWizard
                  onClose={() => navigateBack()}
                  userId={userId}
                />
              );
            case 'archetypal-contemplation':
              return (
                <ArchetypalContemplationWizard
                  onComplete={() => navigateBack()}
                  onExit={() => navigateBack()}
                  insightContext={insightContext}
                />
              );
            default:
              return null;
          }
        })()}
      </Suspense>
    </WizardErrorBoundary>
  );
});

