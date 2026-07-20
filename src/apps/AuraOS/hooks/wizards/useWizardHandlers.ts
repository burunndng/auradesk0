import { useCallback } from 'react';
import * as coreTypes from '../../types';
import { practices as corePractices } from '../../constants';
import { wizardSessionService } from '../../services/wizardSessionService';

export function useWizardHandlers(
  userId: string,
  userProfile: any,
  generateInsightAndRefreshGuidance: any,
  navigateBack: any,
  setActiveTab: any,
  setIntegratedInsights: any,
  history: any,
  setters: any,
  integratedInsights: coreTypes.IntegratedInsight[] = []
) {
  /**
   * PERFORMANCE NOTE:
   * All dependencies in handlers' useCallback deps array are stable references:
   * - userId, userProfile: from parent context (stable)
   * - generateInsightAndRefreshGuidance: wrapped in useCallback in useWizardSessions
   * - navigateBack, setActiveTab: from NavigationContext (stable)
   * - setIntegratedInsights: from InsightsContext (stable)
   * - All history setters: from useLocalStorage (stable)
   *
   * This prevents unnecessary handler recreation on parent re-renders.
   */
  const {
    psychedelicJourneyHistory = [],
    historyJhana = [],
    history321 = [],
    historyIFS = [],
    eightZonesHistory = [],
    adaptiveCycleHistory = [],
    memoryReconHistory = [],
    shadowSessionHistory = [],
    historyBias = [],
    historyBiasFinder = [],
    historySO = [],
    historyPS = [],
    historyPM = [],
    historyKegan = [],
    historyAttachment = [],
    historyRoleAlignment = [],
    somaticPracticeHistory = [],
    integralBodyPlanHistory = [],
    historyBigMind = [],
    workoutPrograms = [],
    schemaDetectiveSessions = [],
    bioenergeneticsHistory = [],
    meditationWizardHistory = [],
    immunityToChangeHistory = [],
    contextAIHistory = [],
    decisionWizardHistory = [],
    realityTunnelHistory = [],
    dailyCheckinHistory = [],
    structureOfFeelingHistory = [],
  } = history;

  const {
    setHistory321, setHistoryIFS, setHistoryBias, setHistoryBiasFinder, setHistorySO,
    setHistoryPS, setHistoryPM, setHistoryKegan, setHistoryRoleAlignment,
    setHistoryJhana, setMemoryReconHistory, setEightZonesHistory, setAdaptiveCycleHistory,
    setSomaticPracticeHistory, setHistoryAttachment, setHistoryBigMind, setShadowSessionHistory,
    setIntegralBodyPlans, setWorkoutPrograms, setSchemaDetectiveSessions, setPartsLibrary,
    setIntegralBodyPlanHistory, setPlanProgressByDay, setDecisionWizardHistory, setExaminingCoreBeliefHistory,
    setBioenergeneticsHistory, setMeditationWizardHistory, setPsychedelicJourneyHistory, setImmunityToChangeHistory,
    setContextAIHistory, setDraft321, setDraftIFS, setDraftBias, setDraftBiasFinder, setDraftSO, setDraftPS,
    setDraftPM, setDraftKegan, setDraftAttachment, setDraftRoleAlignment,
    setDraftBigMind, setDraftEightZones, setDraftSchemaSession, setDraftAdaptiveCycle, setDraftBioenergetics, setDraftMeditation,
    setDraftDecision, setDraftExaminingCoreBelief, setDraftPsychedelicJourney, setDraftCoherenceAudit, setDraftMemoryRecon,
    setLifeArchHistory, setDraftLifeArch,
    setRealityTunnelHistory, setDraftRealityTunnel,
    setDailyCheckinHistory,
    setStructureOfFeelingHistory,
    setDraftStructureOfFeeling,
  } = setters;

  // --- Session Handlers ---
  const handleSaveBiasSession = useCallback(async (session: coreTypes.BiasDetectiveSession) => {
    setHistoryBias(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftBias(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'bias_detective',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Bias Detective] Failed to save session:', error);
        throw error;
      }
    }

    const biasNames = session.identifiedBiases.map(b => b.name).join(', ') || 'None identified';
    const scenarios = session.scenarios?.map(s => `  - ${s.biasName}: ${s.howItInfluenced}`).join('\n') || 'None recorded';
    const report = `# Bias Detective: ${session.decisionText}
- Reasoning captured: ${session.reasoning || 'Not provided'}
- Alternatives considered: ${session.discoveryAnswers.alternativesConsidered}
- Information sources: ${session.discoveryAnswers.informationSources}
- Time pressure: ${session.discoveryAnswers.timePressure}
- Emotional state: ${session.discoveryAnswers.emotionalState}
- Influencers: ${session.discoveryAnswers.influencers}
- Biases identified: ${biasNames}
- Alternative framings: ${session.alternativeFramings.join('; ') || 'None'}
${session.scenarios?.length ? `- How biases influenced decision:\n${scenarios}` : ''}
- Diagnosis: ${session.diagnosis || 'Not completed'}
- Next-time action: ${session.nextTimeAction || 'Not recorded'}
- Key takeaway: ${session.oneThingToRemember}`;
    const summary = `Identified bias in decision: ${session.decisionText} — biases: ${biasNames}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Bias Detective',
        sessionId: session.id,
        sessionName: 'Bias Detective Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyBias.length,
          sessionsInLastWeek: historyBias.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Bias Detective] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryBias, setDraftBias, setIntegratedInsights, historyBias, integratedInsights]);

  const handleSaveBiasFinderSession = useCallback(async (session: coreTypes.BiasFinderSession) => {
    setHistoryBiasFinder(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftBiasFinder(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'bias_finder',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Bias Finder] Failed to save session:', error);
        throw error;
      }
    }

    const confirmedHypotheses = session.hypotheses.filter(h => h.confidence);
    const biasesSummary = confirmedHypotheses.map(h => `${h.biasName} (${h.confidence}%)`).join(', ') || 'None confirmed';
    const biasDetails = confirmedHypotheses.map(h =>
      `  - ${h.biasName} (${h.confidence}%): ${h.evidence?.join('; ') || 'No evidence recorded'}`
    ).join('\n');
    const report = `# Bias Finder: ${session.targetDecision}
- Stakes: ${session.parameters?.stakes || 'Not specified'}
- Time pressure: ${session.parameters?.timePressure || 'Not specified'}
- Emotional state: ${session.parameters?.emotionalState || 'Not specified'}
- Decision type: ${session.parameters?.decisionType || 'Not specified'}
- Context: ${session.parameters?.context || 'Not specified'}
- Biases confirmed (${confirmedHypotheses.length}): ${biasesSummary}
${biasDetails ? `- Evidence per bias:\n${biasDetails}` : ''}
- Recommendations: ${session.diagnosticReport?.recommendations.join('; ') || 'None generated'}
- Next-time checklist: ${session.diagnosticReport?.nextTimeChecklist?.join('; ') || 'None'}`;
    const summary = `Found ${confirmedHypotheses.length} biases in decision: ${session.targetDecision.substring(0, 60)}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Bias Finder',
        sessionId: session.id,
        sessionName: 'Bias Finder Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyBiasFinder.length,
          sessionsInLastWeek: historyBiasFinder.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Bias Finder] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryBiasFinder, setDraftBiasFinder, setIntegratedInsights, historyBiasFinder, integratedInsights]);

  const handleSaveSOSession = useCallback(async (session: coreTypes.SubjectObjectSession) => {
    setHistorySO(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftSO(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'subject_object_explorer',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Subject-Object Explorer] Failed to save session:', error);
        throw error;
      }
    }

    const report = `# Subject-Object Explorer: ${session.pattern}
- Truth/feelings about pattern: ${session.truthFeelings || 'Not recorded'}
- Currently subject to: ${session.subjectToStatement}
- Evidence (supporting): ${session.evidenceChecks?.pro || 'None noted'}
- Evidence (against): ${session.evidenceChecks?.con || 'None noted'}
- Origin of pattern: ${session.origin || 'Not explored'}
- Cost of remaining subject: ${session.cost || 'Not assessed'}
- First observation experiment: ${session.firstObservation || 'Not chosen'}
${session.smallExperimentChosen ? `- Small experiment chosen: ${session.smallExperimentChosen}` : ''}
- Integration shift: ${session.integrationShift}
- Ongoing practice: ${session.ongoingPracticePlan?.join('; ') || 'None recorded'}`;
    const summary = `Subject-Object shift on: ${session.pattern} — integration: ${session.integrationShift?.substring(0, 80)}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Subject-Object Explorer',
        sessionId: session.id,
        sessionName: 'Subject-Object Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historySO.length,
          sessionsInLastWeek: historySO.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Subject-Object Explorer] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistorySO, setDraftSO, setIntegratedInsights, historySO, integratedInsights]);

  const handleSavePSSession = useCallback(async (session: coreTypes.PerspectiveShifterSession) => {
    setHistoryPS(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftPS(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'perspective_shifter',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Perspective-Shifter] Failed to save session:', error);
        throw error;
      }
    }

    const perspectiveLines = session.perspectives.map(p =>
      `  - ${p.type}: ${p.description}${p.reflection ? ` | Reflection: ${p.reflection}` : ''}`
    ).join('\n');
    const report = `# Perspective-Shifter: ${session.stuckSituation}
- Perspectives explored (${session.perspectives.length}):
${perspectiveLines || '  None recorded'}
- Synthesis: ${session.synthesis || 'Not completed'}
- Reality-check refinement / action plan: ${session.realityCheckRefinement || 'Not recorded'}`;
    const summary = `Shifted perspective on: ${session.stuckSituation} — synthesis: ${session.synthesis?.substring(0, 80)}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Perspective-Shifter',
        sessionId: session.id,
        sessionName: 'Perspective-Shifter Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyPS.length,
          sessionsInLastWeek: historyPS.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Perspective-Shifter] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryPS, setDraftPS, setIntegratedInsights, historyPS, integratedInsights]);

  const handleSavePMSession = useCallback(async (map: coreTypes.PolarityMap) => {
    setHistoryPM(prev => [...prev.filter(m => m.id !== map.id), map]);
    setDraftPM(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: map.id,
          type: 'polarity_mapper',
          content: map,
          created_at: map.date
        });
      } catch (error) {
        console.error('[Polarity Mapper] Failed to save session:', error);
        throw error;
      }
    }

    const report = `# Polarity Map: ${map.dilemma}
- Pole A (${map.poleA_name}): Upside — ${map.poleA_upside} | Downside — ${map.poleA_downside}
- Pole B (${map.poleB_name}): Upside — ${map.poleB_upside} | Downside — ${map.poleB_downside}
${map.currentPosition !== undefined ? `- Current position on spectrum: ${map.currentPosition}/10 toward ${map.poleA_name}` : ''}
${map.positionDuration ? `- Time in current position: ${map.positionDuration}` : ''}
${map.synthesis ? `- Key tension: ${map.synthesis.keyTension}\n- Oscillation strategy: ${map.synthesis.oscillationStrategy}\n- Warning signs A: ${map.synthesis.warningSignsA?.join(', ') || 'None'}\n- Warning signs B: ${map.synthesis.warningSignsB?.join(', ') || 'None'}` : ''}
- Committed actions: ${map.committedActions?.join('; ') || 'None recorded'}`;
    const summary = `Polarity map: ${map.dilemma} — ${map.poleA_name} vs ${map.poleB_name}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Polarity Mapper',
        sessionId: map.id,
        sessionName: 'Polarity Mapper Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyPM.length,
          sessionsInLastWeek: historyPM.filter(m =>
            Date.now() - new Date(m.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Polarity Mapper] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryPM, setDraftPM, setIntegratedInsights, historyPM, integratedInsights]);

  const handleSaveKeganSession = useCallback(async (session: coreTypes.KeganAssessmentSession) => {
    setHistoryKegan(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftKegan(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'kegan_assessment',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Kegan Assessment] Failed to save session:', error);
        throw error;
      }
    }

    const interp = session.overallInterpretation;
    const stage = interp?.centerOfGravityLabel || interp?.centerOfGravity || 'Pending';
    const recommendations = interp?.recommendations?.map(r => `  - ${r}`).join('\n') || '  None recorded';
    const report = `# Kegan Assessment
- Center of gravity: ${stage}
${interp?.numericScore ? `- Numeric score: ${interp.numericScore}` : ''}
- Subject-to (currently embedded in): ${interp?.subjectObjectMap?.subjectTo || 'Not assessed'}
- Object-to (can reflect on): ${interp?.subjectObjectMap?.objectTo || 'Not assessed'}
- Domain split: ${interp?.domainSplit || 'Not analyzed'}
- Growth / developmental edge: ${interp?.growthEdge || interp?.developmentalEdge || 'Not identified'}
- Confidence: ${interp?.confidence || 'Not specified'}
- Recommendations:
${recommendations}
${session.selfReflection ? `- Self-reflection: ${session.selfReflection}` : ''}
${session.stressTest ? `- Stress test response: ${session.stressTest.userResponse}` : ''}`;
    const summary = `Kegan stage assessed: ${stage}${interp?.growthEdge ? ` — edge: ${interp.growthEdge.substring(0, 60)}` : ''}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Kegan Assessment',
        sessionId: session.id,
        sessionName: 'Kegan Assessment Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyKegan.length,
          sessionsInLastWeek: historyKegan.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Kegan Assessment] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryKegan, setDraftKegan, setIntegratedInsights, historyKegan, integratedInsights]);

  const handleSaveAttachmentAssessment = useCallback(async (session: coreTypes.AttachmentAssessmentSession) => {
    setHistoryAttachment(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftAttachment(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'attachment_assessment',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Attachment Assessment] Failed to save session:', error);
        throw error;
      }
    }

    const report = `# Attachment Assessment
- Attachment style: ${session.style}
- Anxiety score: ${session.scores.anxiety}/7
- Avoidance score: ${session.scores.avoidance}/7
- Style description: ${session.description}
${session.notes ? `- Notes: ${session.notes}` : ''}`;
    const summary = `Attachment style: ${session.style} (anxiety: ${session.scores.anxiety}, avoidance: ${session.scores.avoidance})`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Attachment Assessment',
        sessionId: session.id,
        sessionName: 'Attachment Assessment Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyAttachment.length,
          sessionsInLastWeek: historyAttachment.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Attachment Assessment] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryAttachment, setDraftAttachment, setIntegratedInsights, historyAttachment, integratedInsights]);

  const handleSaveRoleAlignmentSession = useCallback(async (session: coreTypes.RoleAlignmentSession) => {
    setHistoryRoleAlignment(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftRoleAlignment(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'role_alignment',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Role Alignment] Failed to save session:', error);
        throw error;
      }
    }

    const activeRoles = session.roles.filter(r => r.name.trim());
    const avgScore = activeRoles.reduce((sum, r) => sum + r.valueScore, 0) / Math.max(1, activeRoles.length);
    const roleLines = activeRoles.map(r =>
      `  - ${r.name} (score ${r.valueScore}/10): goal="${r.goal}"${r.action ? `, action="${r.action}"` : ''}${r.shadowNudge ? `, shadow="${r.shadowNudge}"` : ''}`
    ).join('\n');
    const lowestRole = activeRoles.sort((a, b) => a.valueScore - b.valueScore)[0];
    const report = `# Role Alignment
- Roles assessed (${activeRoles.length}):
${roleLines || '  None recorded'}
- Average alignment score: ${avgScore.toFixed(1)}/10
- Lowest-alignment role: ${lowestRole ? `${lowestRole.name} (${lowestRole.valueScore}/10)` : 'N/A'}
${session.integralNote ? `- Integral note: ${session.integralNote}` : ''}
${session.aiIntegralReflection ? `- Integral insight: ${session.aiIntegralReflection.integralInsight}\n- Quadrant connections: ${session.aiIntegralReflection.quadrantConnections}\n- Recommendations: ${session.aiIntegralReflection.recommendations.join('; ')}` : ''}`;
    const summary = `Role alignment across ${activeRoles.length} roles — avg ${avgScore.toFixed(1)}/10, lowest: ${lowestRole?.name || 'N/A'}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Role Alignment',
        sessionId: session.id,
        sessionName: 'Role Alignment Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyRoleAlignment.length,
          sessionsInLastWeek: historyRoleAlignment.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Role Alignment] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryRoleAlignment, setDraftRoleAlignment, setIntegratedInsights, historyRoleAlignment, integratedInsights]);

  const handleSaveJhanaSession = useCallback(async (session: coreTypes.JhanaSession) => {
    setHistoryJhana(prev => [...prev.filter(s => s.id !== session.id), session]);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'jhana_tracker',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Jhana Tracker] Failed to save session:', error);
        throw error;
      }
    }

    const hindranceStr = session.hindrances?.join(', ') || 'none noted';
    const report = `# Jhana Session: ${session.practice}
- Jhana Level: ${session.jhanaLevel}
- Duration: ${session.duration}min (${session.timeInState}min in state)
- Body: ${session.bodyExperience}
- Mind quality: ${session.mindQuality}
- Hindrances: ${hindranceStr}
${session.nimittaPresent ? `- Nimitta: ${session.nimittaType || 'present'}` : ''}
${session.insights ? `- Insights: ${session.insights}` : ''}
${session.comparison ? `- Compared to previous: ${session.comparison}` : ''}`.trim();
    const summary = `Jhana session: ${session.practice}, reached ${session.jhanaLevel}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Jhana Guide',
        sessionId: session.id,
        sessionName: 'Jhana Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyJhana.length,
          sessionsInLastWeek: historyJhana.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Jhana Guide] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryJhana, setIntegratedInsights]);

  const handleSave321Session = useCallback(async (session: coreTypes.ThreeTwoOneSession) => {
    setHistory321(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraft321(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'three_two_one',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[3-2-1 Reflection] Failed to save session:', error);
        throw error;
      }
    }

    const dialogueLine = session.dialogueTranscript?.length
      ? `\n## Talk To It — Dialogue (${session.dialogueTranscript.length} exchanges)\n${session.dialogueTranscript.map(d => `${d.role === 'user' ? 'Me' : 'Shadow'}: ${d.text}`).join('\n')}`
      : '';

    const report = `# 3-2-1 Shadow Reflection: ${session.trigger}
${session.triggerSituation ? `Situation: ${session.triggerSituation}` : ''}
${session.triggerReminder ? `Reminds me of: ${session.triggerReminder}` : ''}
${session.faceItAnalysis ? `Shadow traits faced: ${Array.isArray(session.faceItAnalysis) ? session.faceItAnalysis.join(', ') : (session.faceItAnalysis.specificActions?.join(', ') || String(session.faceItAnalysis))}` : ''}${dialogueLine}
${session.shadowGift ? `Shadow gift: ${session.shadowGift}` : ''}
${session.integrationPlan ? `Integration: ${typeof session.integrationPlan === 'string' ? session.integrationPlan : (session.integrationPlan.actionableStep || session.integrationPlan.reowningStatement || 'See plan')}` : ''}
${session.aiSummary || ''}`.trim();
    const summary = `3-2-1 shadow work on: ${session.trigger}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: '3-2-1 Reflection',
        sessionId: session.id,
        sessionName: '3-2-1 Reflection Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: history321.length,
          sessionsInLastWeek: history321.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[3-2-1 Reflection] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistory321, setDraft321, setIntegratedInsights]);

  const handleSaveIFSSession = useCallback(async (session: coreTypes.IFSSession) => {
    setHistoryIFS(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftIFS(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'ifs_session',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[IFS Session] Failed to save session:', error);
        throw error;
      }
    }

    if (session.partId && session.partName) {
      setPartsLibrary(prev => {
        const existing = prev.find(p => p.id === session.partId);
        if (existing) return prev.map(p => p.id === session.partId ? { ...p, lastSessionDate: session.date } : p);
        return [...prev, { id: session.partId!, name: session.partName!, role: 'Unknown', fears: '', positiveIntent: '', lastSessionDate: session.date }];
      });
    }

    // Build rich report from session data
    const transcriptSummary = session.transcript.slice(-10).map(t => `${t.role}: ${t.text.substring(0, 200)}`).join('\n');
    const partDetails = session.partRole || session.partFears || session.partPositiveIntent
      ? `\n## Part Profile
- Role: ${session.partRole || 'Not identified'}
- Fears: ${session.partFears || 'Not explored'}
- Positive Intent: ${session.partPositiveIntent || 'Not uncovered'}`
      : '';
    const aiSummarySection = session.summary ? `\n## AI Session Summary\n${session.summary}` : '';
    const indicationsSection = session.aiIndications?.length ? `\n## Key Indications\n${session.aiIndications.map(i => `- ${i}`).join('\n')}` : '';

    const report = `# IFS Session: ${session.partName || 'Unnamed Part'}
## Phase Reached: ${session.currentPhase}${partDetails}

## Recent Dialogue (last 10 exchanges)
${transcriptSummary || 'No dialogue recorded'}${aiSummarySection}${indicationsSection}

## Integration Note
${session.integrationNote || 'No integration note recorded'}`;

    const summary = `IFS session with "${session.partName}" - explored ${session.partRole || 'unknown role'}, phase: ${session.currentPhase}`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'IFS Session',
        sessionId: session.id,
        sessionName: 'IFS Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyIFS.length,
          sessionsInLastWeek: historyIFS.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[IFS Session] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryIFS, setDraftIFS, setPartsLibrary, setIntegratedInsights, historyIFS, integratedInsights]);

  const handleSaveSomaticPractice = useCallback(async (session: coreTypes.SomaticPracticeSession) => {
    setSomaticPracticeHistory(prev => [...prev.filter(s => s.id !== session.id), session]);

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'somatic_practice',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Somatic Generator] Failed to save session:', error);
        throw error;
      }
    }

    // Enhanced report with somatic findings (cross-modal validation)
    let report = `# Somatic Practice: ${session.title}
## Intention
${session.intention}

## Practice Type
${session.practiceType}

## Duration
${session.duration} minutes

## Focus Area
${session.focusArea || 'Not specified'}`;

    // Include somatic findings if available
    if (session.somaticFindings) {
      if (session.somaticFindings.bodyLocations?.length) {
        report += `\n\n## Body Locations Engaged\n${session.somaticFindings.bodyLocations.map((l, i) => `${i + 1}. ${l}`).join('\n')}`;
      }
      if (session.somaticFindings.sensationQualities?.length) {
        report += `\n\n## Sensation Qualities Experienced\n${session.somaticFindings.sensationQualities.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      }
      if (session.somaticFindings.emotionalTone?.length) {
        report += `\n\n## Associated Emotions\n${session.somaticFindings.emotionalTone.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
      }
      if (session.somaticFindings.blockTypes?.length) {
        report += `\n\n## Blocks Detected\n${session.somaticFindings.blockTypes.map((b, i) => `${i + 1}. ${b}`).join('\n')}`;
      }
      if (session.somaticFindings.discoveries?.length) {
        report += `\n\n## Key Discoveries\n${session.somaticFindings.discoveries.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
      }
    }

    const summary = `Somatic practice "${session.title}" - Focus: ${session.focusArea || 'whole body'}${session.somaticFindings?.discoveries?.length ? ` | Key findings: ${session.somaticFindings.discoveries.slice(0, 2).join('; ')}` : ''}`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Somatic Practice',
        sessionId: session.id,
        sessionName: session.title,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: somaticPracticeHistory.length,
          sessionsInLastWeek: somaticPracticeHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Somatic Generator] Failed to generate insight:', err);
    }
    alert(`Practice "${session.title}" saved!`);
    setActiveTab('library');
  }, [userId, userProfile, generateInsightAndRefreshGuidance, setActiveTab, setSomaticPracticeHistory, setIntegratedInsights, somaticPracticeHistory, integratedInsights]);

  const handleSaveIntegralBodyPlan = useCallback(async (plan: coreTypes.IntegralBodyPlan) => {
    setIntegralBodyPlans(prev => [...prev.filter(p => p.id !== plan.id), plan]);

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: plan.id,
          type: 'integral_body_plan',
          content: plan,
          created_at: plan.date
        });
      } catch (error) {
        console.error('[Integral Body Architect] Failed to save session:', error);
        throw error;
      }
    }

    setIntegralBodyPlanHistory(prev => {
      const existingEntry = prev.find(entry => entry.planId === plan.id);
      if (existingEntry) return prev;
      return [...prev, { planId: plan.id, planDate: plan.date, weekStartDate: plan.weekStartDate, goalStatement: plan.goalStatement, startedAt: new Date().toISOString(), status: 'active', dailyFeedback: [] }];
    });
    setPlanProgressByDay(prev => ({ ...prev, [plan.id]: prev[plan.id] || {} }));
    const yangInfo = plan.yangConstraints;
    const yinInfo = plan.yinPreferences;
    const report = `# Integral Body Plan: ${plan.goalStatement}
- Week starting: ${plan.weekStartDate}
- Weekly targets: protein ${plan.dailyTargets.proteinGrams}g/day, sleep ${plan.dailyTargets.sleepHours}h/night, workouts ${plan.dailyTargets.workoutDays}x/week, yin ${plan.dailyTargets.yinPracticeMinutes}min/week
${yangInfo ? `- Training experience: ${yangInfo.strengthTrainingExperience || 'Not specified'}, primary goal: ${yangInfo.primaryGoal || 'Not specified'}, equipment: ${yangInfo.equipment?.join(', ') || 'Not specified'}` : ''}
${yinInfo ? `- Yin goal: ${yinInfo.goal || 'Not specified'}, experience: ${yinInfo.experienceLevel || 'Not specified'}${yinInfo.intentions?.length ? `, intentions: ${yinInfo.intentions.join(', ')}` : ''}` : ''}
- Week summary: ${plan.weekSummary}
${plan.synthesisMetadata ? `- Plan confidence: ${plan.synthesisMetadata.llmConfidenceScore}/100\n- Yang/Yin balance score: ${plan.synthesisMetadata.synergyScoring?.yangYinPairingScore}/100` : ''}`;
    const summary = `Created integral body plan: ${plan.goalStatement.substring(0, 80)}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Integral Body Plan',
        sessionId: plan.id,
        sessionName: plan.goalStatement,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: integralBodyPlanHistory.length,
          sessionsInLastWeek: integralBodyPlanHistory.filter(s =>
            Date.now() - new Date(s.weekStartDate || s.planDate).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Integral Body Architect] Failed to generate insight:', err);
    }
    alert(`Your Integral Week has been saved!`);
  }, [userId, userProfile, generateInsightAndRefreshGuidance, setIntegralBodyPlans, setIntegralBodyPlanHistory, setPlanProgressByDay, setIntegratedInsights, integralBodyPlanHistory, integratedInsights]);

  const handleSaveBigMindSession = useCallback(async (session: coreTypes.BigMindSession) => {
    setHistoryBigMind(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftBigMind(null);
    navigateBack();

    // Build rich report from session data
    const voicesExplored = session.voices.map(v => v.name).join(', ') || 'No voices identified';
    const dialogueSummary = session.messages.slice(-15).map(m =>
      `${m.role === 'user' ? (m.voiceName || 'User') : 'Witness'}: ${m.text.substring(0, 250)}`
    ).join('\n');

    const witnessPerspectiveSection = session.summary?.witnessPerspective
      ? `\n## Witness Perspective\n${session.summary.witnessPerspective}`
      : '';
    const commitmentsSection = session.summary?.integrationCommitments?.length
      ? `\n## Integration Commitments\n${session.summary.integrationCommitments.map(c => `- ${c}`).join('\n')}`
      : '';
    const recommendationsSection = session.summary?.recommendedPractices?.length
      ? `\n## Recommended Practices\n${session.summary.recommendedPractices.map(p => `- ${p.practiceName}: ${p.rationale}`).join('\n')}`
      : '';

    const report = `# Big Mind Process Session
## Stage Reached: ${session.currentStage}
## Voices Explored: ${voicesExplored}

## Dialogue (last 15 exchanges)
${dialogueSummary || 'No dialogue recorded'}${witnessPerspectiveSection}${commitmentsSection}${recommendationsSection}`;

    const primaryVoices = session.summary?.primaryVoices?.join(', ') || voicesExplored;
    const summary = `Big Mind session exploring voices: ${primaryVoices} - reached ${session.currentStage} stage`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Big Mind Process',
        sessionId: session.id,
        sessionName: 'Big Mind Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: historyBigMind.length,
          sessionsInLastWeek: historyBigMind.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);

      // Persist session to Supabase
      if (userId) {
        try {
          await wizardSessionService.saveSession({
            user_id: userId,
            session_id: session.id,
            type: 'big_mind_process',
            content: session,
            created_at: session.date,
          });
        } catch (error) {
          console.error('[Big Mind Process] Failed to save session:', error);
        }
      }
    } catch (err) {
      console.error('[Big Mind Process] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setHistoryBigMind, setDraftBigMind, setIntegratedInsights, historyBigMind, integratedInsights]);

  const handleSaveEightZonesSession = useCallback(async (session: coreTypes.EightZonesSession) => {
    setEightZonesHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftEightZones(null);
    navigateBack();
    const zonesSummary = Object.entries(session.zoneAnalyses || {})
      .map(([z, a]) => `- Zone ${z}: ${(a as { summary?: string; observation?: string }).summary || (a as { summary?: string; observation?: string }).observation || ''}`)
      .filter(line => line.length > 10)
      .join('\n');
    const report = `# Eight Zones Analysis: ${session.focalQuestion}
${session.focalQuestionContext ? `Context: ${session.focalQuestionContext}` : ''}
${zonesSummary}
${session.blindSpots?.length ? `Blind spots: ${session.blindSpots.join(', ')}` : ''}
${session.synthesisReport || ''}`.trim();
    const summary = `Analyzed 8 zones of consciousness around: ${session.focalQuestion}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Eight Zones',
        sessionId: session.id,
        sessionName: session.focalQuestion,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: eightZonesHistory.length,
          sessionsInLastWeek: eightZonesHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('Failed to generate insight for Eight Zones session:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setEightZonesHistory, setDraftEightZones, setIntegratedInsights]);

  const handleSaveAdaptiveCycleSession = useCallback(async (session: coreTypes.AdaptiveCycleSession) => {
    setAdaptiveCycleHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftAdaptiveCycle(null);
    navigateBack();
    const report = session.fullReport ||
      `# Adaptive Cycle Map: ${session.systemToAnalyze}
- Conservation (K): ${session.cycleMap?.K?.points?.[0] || ''}
- Release (Ω): ${session.cycleMap?.Ω?.points?.[0] || ''}
- Reorganization (α): ${session.cycleMap?.α?.points?.[0] || ''}
- Growth (r): ${session.cycleMap?.r?.points?.[0] || ''}`.trim();
    const summary = `Mapped adaptive cycle for: ${session.systemToAnalyze}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Adaptive Cycle Lens',
        sessionId: session.id,
        sessionName: session.systemToAnalyze,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: adaptiveCycleHistory.length,
          sessionsInLastWeek: adaptiveCycleHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Adaptive Cycle] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setAdaptiveCycleHistory, setDraftAdaptiveCycle, setIntegratedInsights]);

  const handleSaveWorkoutProgram = useCallback(async (program: coreTypes.WorkoutProgram) => {
    setWorkoutPrograms(prev => [...prev.filter(p => p.id !== program.id), program]);
    navigateBack();
    const workoutLines = program.workouts.map(w =>
      `  - ${w.name} (${w.intensity}, ${w.duration}min, ${w.difficulty}): ${w.muscleGroupsFocused?.join(', ') || 'N/A'}`
    ).join('\n');
    const report = `# Workout Program: ${program.title}
- Summary: ${program.summary}
- Total workouts: ${program.workouts.length}
- Workouts:
${workoutLines || '  None recorded'}
${program.personalizationNotes ? `- Personalization notes: ${program.personalizationNotes}` : ''}
${program.progressionRecommendations?.length ? `- Progression: ${program.progressionRecommendations.join('; ')}` : ''}`;
    const summary = `Created workout program: ${program.title} — ${program.workouts.length} workouts`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Workout Program',
        sessionId: program.id,
        sessionName: program.title,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: workoutPrograms.length,
          sessionsInLastWeek: workoutPrograms.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Dynamic Workout Architect] Failed to generate insight:', err);
    }
    alert(`Your personalized workout program has been saved!`);
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setWorkoutPrograms, setIntegratedInsights, workoutPrograms, integratedInsights]);

  const handleSaveMemoryReconSession = useCallback(async (session: coreTypes.MemoryReconsolidationSession) => {
    setMemoryReconHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftMemoryRecon(null);
    navigateBack();
    const beliefs = session.implicitBeliefs?.map(b => `- "${b.belief}" (intensity: ${b.emotionalCharge})`).join('\n') || '';
    const report = `# Memory Reconsolidation Session
Implicit beliefs worked on:
${beliefs}
${session.contradictionInsights?.length ? `Contradictions discovered: ${session.contradictionInsights.map(c => c.anchors.join(', ')).join('; ')}` : ''}
${session.completionSummary ? `Summary: ${typeof session.completionSummary === 'string' ? session.completionSummary : (session.completionSummary.userInsights || session.completionSummary.notes || 'Session complete')}` : ''}
${session.sessionNotes ? `Notes: ${session.sessionNotes}` : ''}`.trim();
    const summary = `Memory reconsolidation: ${session.implicitBeliefs?.[0]?.belief || 'core belief'}`;
    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'memory_reconsolidation',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Memory Reconsolidation] Failed to save session:', error);
      }
    }

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Memory Reconsolidation',
        sessionId: session.id,
        sessionName: 'Memory Reconsolidation Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: memoryReconHistory.length,
          sessionsInLastWeek: memoryReconHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      if (insight) {
        setIntegratedInsights(prev => [...prev, insight]);
      }
    } catch (err) {
      console.error('[Memory Reconsolidation] Failed to generate insight:', err);
    }
    alert('Memory Reconsolidation session saved!');
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setMemoryReconHistory, setDraftMemoryRecon, setIntegratedInsights, memoryReconHistory, integratedInsights]);

  const handleSaveShadowSession = useCallback(async (session: coreTypes.ShadowSessionResult) => {
    setShadowSessionHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    navigateBack();
    const report = `# Shadow Journaling: ${session.exerciseName}
Phase: ${session.exercisePhase}
User entry: ${session.normalizedEntry}
${session.guideReflection ? `Guide reflection: ${session.guideReflection}` : ''}
${session.wordToCarry ? `Word to carry: ${session.wordToCarry}` : ''}
${session.selfCompassionStatement ? `Self-compassion: ${session.selfCompassionStatement}` : ''}`.trim();
    const summary = `Shadow journaling on ${session.exerciseName} (phase: ${session.exercisePhase})`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Shadow Journaling',
        sessionId: session.id,
        sessionName: session.exerciseName,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: shadowSessionHistory.length,
          sessionsInLastWeek: shadowSessionHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);

      // Persist session to Supabase
      if (userId) {
        try {
          await wizardSessionService.saveSession({
            user_id: userId,
            session_id: session.id,
            type: 'shadow_journaling',
            content: session,
            created_at: session.createdAt,
          });
        } catch (error) {
          console.error('[Shadow Journaling] Failed to save session:', error);
        }
      }
    } catch (err) {
      console.error('[Shadow Journaling] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setShadowSessionHistory, setIntegratedInsights]);

  const handleSaveSchemaSession = useCallback(async (session: coreTypes.SchemaSession) => {
    setSchemaDetectiveSessions(prev => [...prev.filter(s => s.sessionId !== session.sessionId), session]);
    setDraftSchemaSession(null);
    navigateBack();
    const completedTests = session.completedTests ?? [];
    const profile = session.unifiedProfile;
    const topSchemas = profile?.dominantSchemas?.slice(0, 3).map(s => `${s.schema} (strength: ${s.strength})`).join(', ') || 'None identified';
    const dominantModes = profile?.dominantModes?.slice(0, 2).map(m => `${m.mode} (${m.category})`).join(', ') || 'None identified';
    const copingStyle = profile?.primaryCopingStyles?.[0]?.style || 'Not assessed';
    const report = [
      `# Schema Detective Session`,
      `## Tests Completed: ${completedTests.join(', ') || 'None'}`,
      `## Top Early Maladaptive Schemas: ${topSchemas}`,
      `## Dominant Schema Modes: ${dominantModes}`,
      `## Primary Coping Style: ${copingStyle}`,
      `## Coping Flexibility Score: ${profile?.copingFlexibilityScore ?? 'N/A'}/100`,
      profile?.synthesisNarrative ? `## Synthesis\n${profile.synthesisNarrative}` : '',
      session.userNotes ? `## User Notes\n${session.userNotes}` : '',
    ].filter(Boolean).join('\n');
    const summary = `Schema Detective: ${completedTests.length} test(s) completed. Top schemas: ${topSchemas}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Schema Detective',
        sessionId: session.sessionId,
        sessionName: 'Schema Therapy Assessment',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: schemaDetectiveSessions.length,
          sessionsInLastWeek: schemaDetectiveSessions.filter(s =>
            Date.now() - new Date(s.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Schema Detective] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setSchemaDetectiveSessions, setDraftSchemaSession, setIntegratedInsights, schemaDetectiveSessions, integratedInsights]);

  const handleSaveBioenergetics = useCallback(async (session: coreTypes.BioenergeneticsSession) => {
    setBioenergeneticsHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftBioenergetics(null);
    navigateBack();
    const report = `# Bioenergetic Practice Session\n- Exercise: ${session.practiceName || 'Custom Exercise'}\n- Duration: ${session.durationMinutes || 'Not specified'}`;
    const summary = `Completed bioenergetic practice: ${session.practiceName || 'Custom Exercise'}`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Bioenergetics',
        sessionId: session.id,
        sessionName: `Bioenergetic Practice: ${session.practiceName || 'Custom'}`,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: bioenergeneticsHistory.length,
          sessionsInLastWeek: bioenergeneticsHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Bioenergetics] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setBioenergeneticsHistory, setDraftBioenergetics, setIntegratedInsights, bioenergeneticsHistory, integratedInsights]);

  const handleSaveMeditationWizard = useCallback(async (session: any) => {
    setMeditationWizardHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftMeditation(null);
    navigateBack();
    const meditationType = session.selectedMeditation?.name || 'Meditation Practice';
    const report = [
      `# Meditation Finder Assessment`,
      `- Selected practice: ${meditationType}`,
      `- Tradition: ${session.selectedMeditation?.tradition || 'Not specified'}`,
      `- Recommended duration: ${session.selectedMeditation?.duration || 'Not specified'}`,
      `- Experience level: ${session.experienceLevel || 'Not specified'}`,
      `- Assessment date: ${session.date}`,
      session.selectedMeditation?.description ? `- Description: ${session.selectedMeditation.description}` : null,
      session.userGoals ? `- User goals: ${Array.isArray(session.userGoals) ? session.userGoals.join(', ') : session.userGoals}` : null,
      session.obstacles ? `- Obstacles noted: ${Array.isArray(session.obstacles) ? session.obstacles.join(', ') : session.obstacles}` : null,
      session.insights ? `- Insights: ${session.insights}` : null,
    ].filter(Boolean).join('\n');
    const summary = `Selected meditation practice: ${meditationType}${session.selectedMeditation?.tradition ? ` (${session.selectedMeditation.tradition})` : ''}`;
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Meditation Finder',
        sessionId: session.id,
        sessionName: `Meditation Practice Selection: ${meditationType}`,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: meditationWizardHistory.length,
          sessionsInLastWeek: meditationWizardHistory.filter((s: any) =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Meditation Finder] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setMeditationWizardHistory, setDraftMeditation, setIntegratedInsights, meditationWizardHistory, integratedInsights]);

  const handleSaveImmunityToChange = useCallback(async (session: any) => {
    // Store session in history
    setImmunityToChangeHistory(prev => [...prev.filter((s: any) => s.id !== session.id), session]);
    navigateBack();

    const report = `# Immunity to Change Analysis
## Improvement Goal
${session.improvementGoal}

## Behaviors (What I'm Doing Instead)
${session.behaviors.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}

## Hidden Competing Commitments
${session.hiddenCommitments.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

## Big Assumptions
${session.bigAssumptions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}`;

    const summary = `Immunity architecture revealed: goal="${session.improvementGoal}" | hidden commitments="${session.hiddenCommitments.join(', ')}"`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Immunity to Change',
        sessionId: session.id,
        sessionName: `Immunity Map: ${session.improvementGoal}`,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: immunityToChangeHistory.length,
          sessionsInLastWeek: immunityToChangeHistory.filter((s: any) =>
            Date.now() - new Date(s.date || s.id).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Immunity to Change] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setIntegratedInsights, immunityToChangeHistory, integratedInsights]);

  const handleSaveContextAIRootCause = useCallback(async (session: any) => {
    // Store session in history
    setContextAIHistory(prev => [...prev.filter((s: any) => s.id !== session.id), session]);
    navigateBack();

    const quadrantBreakdown = {
      'individual-internal': session.causes.filter((c: any) => c.quadrant === 'individual-internal').map((c: any) => c.text),
      'individual-external': session.causes.filter((c: any) => c.quadrant === 'individual-external').map((c: any) => c.text),
      'collective-internal': session.causes.filter((c: any) => c.quadrant === 'collective-internal').map((c: any) => c.text),
      'collective-external': session.causes.filter((c: any) => c.quadrant === 'collective-external').map((c: any) => c.text),
    };

    const report = `# Context AI Root Cause Analysis (AQAL)
## Problem Statement
${session.problemStatement}

## Individual-Internal (Personal Beliefs, Psychology)
${quadrantBreakdown['individual-internal'].map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') || 'None identified'}

## Individual-External (Personal Actions, Behaviors, Environment)
${quadrantBreakdown['individual-external'].map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') || 'None identified'}

## Collective-Internal (Shared Values, Culture, Worldview)
${quadrantBreakdown['collective-internal'].map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') || 'None identified'}

## Collective-External (Systems, Structures, Processes)
${quadrantBreakdown['collective-external'].map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') || 'None identified'}`;

    const summary = `AQAL Root Cause Analysis: ${session.problemStatement.substring(0, 60)}... | Causes found in ${Object.values(quadrantBreakdown).filter((arr: any) => arr.length > 0).length}/4 quadrants`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Context AI Root Cause',
        sessionId: session.id,
        sessionName: `Context Analysis: ${session.problemStatement.substring(0, 50)}...`,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: contextAIHistory.length,
          sessionsInLastWeek: contextAIHistory.filter((s: any) =>
            Date.now() - new Date(s.date || s.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Context AI Root Cause] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setIntegratedInsights, contextAIHistory, integratedInsights]);

  const handleSaveDecisionSession = useCallback(async (session: coreTypes.DecisionSession) => {
    // Store session in history
    setDecisionWizardHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftDecision(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'decision_wizard',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Decision Wizard] Failed to save session:', error);
        throw error;
      }
    }

    // Build report from session
    const report = `# Decision Analysis: ${session.topic}

## Motivations
${session.selectedMotivations.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## Challenges
${session.selectedChallenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Advantages
${session.selectedAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## Analysis
${session.analysis ? `
### Synthesis
${session.analysis.synthesis}

### Integral Framing
${session.analysis.integralFraming}

### Key Contemplations
${session.analysis.contemplations.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### Closing
${session.analysis.closing}
` : 'No analysis generated'}`;

    const summary = session.analysis?.synthesis || `Decision analysis for: ${session.topic.substring(0, 60)}...`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Decision Wizard' as any,
        sessionId: session.id,
        sessionName: `Decision: ${session.topic.substring(0, 50)}...`,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: decisionWizardHistory.length,
          sessionsInLastWeek: decisionWizardHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Decision Wizard] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setDecisionWizardHistory, setDraftDecision, setIntegratedInsights, decisionWizardHistory, integratedInsights]);

  const handleSaveExaminingCoreBelief = useCallback(async (session: coreTypes.ExaminingCoreBeliefSession, insight?: coreTypes.IntegratedInsight) => {
    setExaminingCoreBeliefHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftExaminingCoreBelief(null);
    navigateBack();

    if (insight) {
      setIntegratedInsights(prev => [...prev, insight]);
    }

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'examining_core_belief',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Examining Core Belief] Failed to save session:', error);
        throw error;
      }
    }
  }, [userId, navigateBack, setExaminingCoreBeliefHistory, setDraftExaminingCoreBelief, setIntegratedInsights]);

  const handleSavePsychedelicJourneySession = useCallback(async (session: coreTypes.PsychedelicJourneySession) => {
    // Save to history, clear draft
    setPsychedelicJourneyHistory(prev => [
      ...prev.filter(s => s.id !== session.id),
      session
    ]);
    setDraftPsychedelicJourney(null);
    navigateBack();

    // Supabase sync (if authenticated)
    if (userId) {
      await wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.id,
        type: 'psychedelic_journey',
        content: session,
        created_at: session.date
      });
    }

    // Build report for IntegratedInsight
    const report = buildPsychedelicJourneyReport(session);
    const summary = `${session.substance} journey - ${session.useRefinedIntention ? session.refinedIntention?.substring(0, 80) : session.rawIntention.substring(0, 80)}...`;

    // Generate IntegratedInsight
    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Psychedelic Journey',
        sessionId: session.id,
        sessionName: 'Psychedelic Journey Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: psychedelicJourneyHistory.length,
          sessionsInLastWeek: psychedelicJourneyHistory.filter(
            s => Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.filter(
            i => i.mindToolType === 'Psychedelic Journey'
          ).length
        }
      });

      if (insight) {
        setIntegratedInsights(prev => [...prev, insight]);
      }
    } catch (err) {
      console.error('[Psychedelic Journey] Failed to generate insight:', err);
    }
  }, [
    userId,
    userProfile,
    generateInsightAndRefreshGuidance,
    navigateBack,
    setPsychedelicJourneyHistory,
    setDraftPsychedelicJourney,
    setIntegratedInsights,
    psychedelicJourneyHistory,
    integratedInsights
  ]);

  const handleSaveCoherenceAuditSession = useCallback(async (session: coreTypes.CoherenceAuditSession) => {
    setDraftCoherenceAudit(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'Coherence Audit',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Coherence Audit] Failed to save session:', error);
        throw error;
      }
    }

    const gapLines = session.coherenceAnalysis?.espousedVsOperativeGaps?.map(g =>
      `  - "${g.value}": ${g.gap} (evidence: ${g.evidence})`
    ).join('\n') || '  None identified';
    const report = `# Coherence Audit
## Espoused Values (${session.espousedValues.length})
${session.espousedValues.map(v => `- ${v}`).join('\n') || 'None recorded'}
## Behavioral Findings / Operative Values
${session.behavioralFindings.map(f => `- ${f}`).join('\n') || 'None recorded'}
${session.loyaltyObjects?.length ? `## Loyalty Objects\n${session.loyaltyObjects.map(l => `- ${l}`).join('\n')}` : ''}
${session.coherenceAnalysis ? `## Coherence Gaps\n${gapLines}\n## Loyalty Reframe\n${session.coherenceAnalysis.loyaltyReframe}\n## Shadow Work\n${session.coherenceAnalysis.shadowWork}` : ''}`;
    const summary = `Coherence audit: ${session.espousedValues.length} values, ${session.coherenceAnalysis?.espousedVsOperativeGaps?.length || 0} gaps identified`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Coherence Audit',
        sessionId: session.id,
        sessionName: 'Coherence Audit Session',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: integratedInsights.filter(i => i.mindToolType === 'Coherence Audit').length,
          sessionsInLastWeek: integratedInsights.filter(i => i.mindToolType === 'Coherence Audit' && (Date.now() - new Date(i.dateCreated).getTime() < 7 * 24 * 60 * 60 * 1000)).length,
          existingInsights: integratedInsights.length,
        }
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Coherence Audit] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setDraftCoherenceAudit, setIntegratedInsights, integratedInsights]);

  // Helper function to build markdown report
  function buildPsychedelicJourneyReport(session: coreTypes.PsychedelicJourneySession): string {
    return `
# Psychedelic Journey Report

**Substance:** ${session.substance}${session.substanceOther ? ` (${session.substanceOther})` : ''}
**Date:** ${new Date(session.date).toLocaleDateString()}
**Dosage:** ${session.dosageDescription || 'Not specified'}

## Intention
${session.useRefinedIntention ? session.refinedIntention : session.rawIntention}

## Set & Setting
- **Environment:** ${session.environment}
- **Companions:** ${session.companions}${session.companionDetails ? ` - ${session.companionDetails}` : ''}
- **Concerns prior:** ${session.concerns}

## Experience

${session.narrative || 'No narrative provided'}

### Key Moments
${session.keyMoments?.map(m => `- ${m}`).join('\n') || 'None recorded'}

### Peak Experience
${session.peakDescription || 'Not described'}

${session.challengingMoments ? `### Challenging Moments\n${session.challengingMoments}` : ''}

## Integration Insights

### Themes
${session.aiThemes?.map(t => `- ${t}`).join('\n') || 'No themes identified'}

### Quadrant Mapping
- **Body:** ${session.quadrantMapping?.body || 'None noted'}
- **Mind:** ${session.quadrantMapping?.mind || 'None noted'}
- **Spirit:** ${session.quadrantMapping?.spirit || 'None noted'}
- **Shadow:** ${session.quadrantMapping?.shadow || 'None noted'}

### User Insights
${session.userInsights || 'None recorded'}

### Connection to Intention
${session.connectionToIntention || 'Not analyzed'}

## Integration Plan

### Practices
${session.practices?.map(p => `- ${p}`).join('\n') || 'None specified'}

### Concrete Steps
${session.concreteSteps?.map(s => `- ${s}`).join('\n') || 'None committed'}

### AI Synthesis
${session.aiSynthesis || 'Not generated'}

${session.followUpDate ? `**Follow-up scheduled:** ${new Date(session.followUpDate).toLocaleDateString()}` : ''}
    `.trim();
  }


  const handleSaveLifeArchSession = useCallback(async (session: coreTypes.LifeArchSession) => {
    setLifeArchHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftLifeArch(null);

    if (userId) {
      wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.id,
        type: 'Life Architecture Wizard',
        content: session,
        created_at: session.date
      });
    }
    // Insight generation and navigation handled by the wizard component itself
  }, [userId, setLifeArchHistory, setDraftLifeArch]);

  const handleSaveRelationalFieldSession = useCallback(async (session: coreTypes.RelationalFieldSession) => {
    if (userId) {
      wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.id,
        type: 'Relational Field Mapper',
        content: session,
        created_at: session.date
      });
    }
    // Insight generation and navigation handled by the wizard component itself
  }, [userId]);

  const handleSaveCulturalShadowSession = useCallback(async (session: coreTypes.CulturalShadowSession) => {
    if (userId) {
      wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.id,
        type: 'Cultural Shadow Excavator',
        content: session,
        created_at: session.date
      });
    }
    // Insight generation and navigation handled by the wizard component itself
  }, [userId]);

  const handleSaveStatesTrainingSession = useCallback(async (session: any) => {
    if (userId && session?.sessionId) {
      wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.sessionId,
        type: 'States Training',
        content: session,
        created_at: new Date().toISOString()
      });
    }
  }, [userId]);

  const handleLaunchYangPractice = useCallback((_payload: any) => {
    navigateBack();
  }, [navigateBack]);

  const handleLaunchYinPractice = useCallback((_payload: any) => {
    navigateBack();
  }, [navigateBack]);

  const handleSaveRealityTunnelSession = useCallback(async (session: coreTypes.RealityTunnelSession) => {
    setRealityTunnelHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftRealityTunnel(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'reality_tunnel',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Reality Tunnel] Failed to save session:', error);
      }
    }

    const report = [
      `# Reality Tunnel Flexibility Session`,
      `- Tunnel: ${session.tunnelName}`,
      `- Counter-tunnel: ${session.counterTunnelName}`,
      `- Belief: ${session.belief}`,
      `- Certainty shift: ${session.certaintyBefore} → ${session.certaintyAfter}`,
      `- Relationship shift: ${session.relationshipShift}`,
      `- Somatic flag: ${session.conservationFlag}`,
      `- Weekly practice: ${session.weeklyPractice}`,
      `- Flexibility insight: ${session.flexibilityInsight}`,
      `- Routing: ${JSON.stringify(session.routing)}`,
    ].join('\n');

    const summary = `Reality Tunnel explored: "${session.tunnelName}" → certainty ${session.certaintyBefore}→${session.certaintyAfter}. Insight: ${session.flexibilityInsight}`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Reality Tunnel',
        sessionId: session.id,
        sessionName: session.tunnelName,
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: realityTunnelHistory.length,
          sessionsInLastWeek: realityTunnelHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        },
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Reality Tunnel] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setRealityTunnelHistory, setDraftRealityTunnel, setIntegratedInsights, realityTunnelHistory, integratedInsights]);

  const handleSaveDailyCheckin = useCallback(async (session: coreTypes.DailyCheckinSession) => {
    setDailyCheckinHistory(prev => [...prev.filter((s: coreTypes.DailyCheckinSession) => s.id !== session.id), session]);
    navigateBack();

    const report = [
      `# Daily Integration Check-in`,
      `Date: ${session.date}`,
      `Energy: ${session.energy}/10 | Clarity: ${session.clarity}/10 | Openness: ${session.openness}/10`,
      `What is present: ${session.whatIsPresent}`,
      `Since last practice: ${session.enactmentSince}`,
      `Related practice: ${session.relatedPractice || 'not specified'}`,
      `Patterns noticed: ${session.patternsNoticed}`,
      `Growing edge: ${session.growingEdge}`,
      `Today's intention: ${session.todayIntention}`,
      `AI reflection: ${session.aiReflection}`,
    ].join('\n');

    const summary = `Daily check-in: energy ${session.energy}/10, enactment: "${session.enactmentSince.slice(0, 100)}". Growing edge: "${session.growingEdge.slice(0, 80)}". Intention: "${session.todayIntention}".`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Daily Integration Check-in',
        sessionId: session.id,
        sessionName: 'Daily Integration Check-in',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: dailyCheckinHistory.length,
          sessionsInLastWeek: dailyCheckinHistory.filter((s: coreTypes.DailyCheckinSession) =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        },
      });
      if (insight) {
        setIntegratedInsights(prev => [...prev, insight]);
      }
    } catch (err) {
      console.error('[DailyCheckin] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setDailyCheckinHistory, setIntegratedInsights, dailyCheckinHistory, integratedInsights]);

  const handleSaveStructureOfFeeling = useCallback(async (session: coreTypes.StructureOfFeelingSession) => {
    setStructureOfFeelingHistory(prev => [...prev.filter(s => s.id !== session.id), session]);
    setDraftStructureOfFeeling(null);
    navigateBack();

    if (userId) {
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'structure_of_feeling',
          content: session,
          created_at: session.date
        });
      } catch (error) {
        console.error('[Structure of Feeling] Failed to save session:', error);
      }
    }

    const report = [
      `# Structure of Feeling Session (${session.mode} mode)`,
      `- Opening answer: ${session.openingAnswer}`,
      `- Recognition count: ${session.recognitionCount}/4`,
      `- Barnum assessment: ${session.barnumChoice}`,
      `- Example: ${session.userExample}`,
      `- AI reflection: ${session.aiReflection}`,
      ...(session.domainChoice ? [`- Domain: ${session.domainChoice}`] : []),
      ...(session.frameworkChoice ? [`- Framework: ${session.frameworkChoice}`] : []),
      ...(session.aiPractice ? [`- Practice: ${session.aiPractice}`] : []),
    ].join('\n');

    const summary = `Explored metamodern structure of feeling (${session.mode} mode). Recognition: ${session.recognitionCount}/4. ${session.aiReflection.slice(0, 120)}`;

    try {
      const insight = await generateInsightAndRefreshGuidance({
        wizardType: 'Structure of Feeling',
        sessionId: session.id,
        sessionName: 'Structure of Feeling',
        sessionReport: report,
        sessionSummary: summary,
        userId,
        availablePractices: Object.values(corePractices).flat(),
        userProfile,
        dataContext: {
          totalSessions: structureOfFeelingHistory.length,
          sessionsInLastWeek: structureOfFeelingHistory.filter(s =>
            Date.now() - new Date(s.date).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          existingInsights: integratedInsights.length,
        },
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch (err) {
      console.error('[Structure of Feeling] Failed to generate insight:', err);
    }
  }, [userId, userProfile, generateInsightAndRefreshGuidance, navigateBack, setStructureOfFeelingHistory, setDraftStructureOfFeeling, setIntegratedInsights, structureOfFeelingHistory, integratedInsights]);

  return {
    handleSaveBiasSession, handleSaveBiasFinderSession, handleSaveSOSession, handleSavePSSession,
    handleSavePMSession, handleSaveKeganSession, handleSaveAttachmentAssessment,
    handleSaveRoleAlignmentSession, handleSaveJhanaSession, handleSave321Session, handleSaveIFSSession,
    handleSaveSomaticPractice, handleSaveIntegralBodyPlan, handleSaveBigMindSession, handleSaveEightZonesSession,
    handleSaveAdaptiveCycleSession, handleSaveWorkoutProgram, handleSaveMemoryReconSession, handleSaveShadowSession,
    handleSaveSchemaSession, handleSaveBioenergetics, handleSaveMeditationWizard, handleSaveImmunityToChange,
    handleSaveContextAIRootCause, handleSaveDecisionSession, handleSaveExaminingCoreBelief, handleSavePsychedelicJourneySession,
    handleSaveCoherenceAuditSession, handleSaveLifeArchSession, handleSaveRelationalFieldSession, handleSaveCulturalShadowSession,
    handleSaveStatesTrainingSession, handleLaunchYangPractice, handleLaunchYinPractice,
    handleSaveRealityTunnelSession,
    handleSaveDailyCheckin,
    handleSaveStructureOfFeeling,
  };
}
