import { useState, useCallback } from 'react';
import * as aiService from '../services/aiService';
import { generateEnhancedRecommendationsForApp } from '../services/enhancedRecommendationHelper';
import { getIntelligentGuidance, clearGuidanceCache } from '../services/intelligenceHub';
import { aggregateUserContext } from '../utils/contextAggregator';
import { AllPractice, IntegratedInsight, EnhancedRecommendationSet, IntelligentGuidance, AqalReportData, Practice } from '../types';

export function useAIServices(

  practiceStack: AllPractice[],

  integratedInsights: IntegratedInsight[],

  corePractices: any,

  practiceNotes: Record<string, string>,

  completedToday: Record<string, boolean>,

  userProfile: any,

  userId: string // Add userId parameter

) {

  const [recommendations, setRecommendations] = useState<string[]>([]);

  const [enhancedRecommendations, setEnhancedRecommendations] = useState<EnhancedRecommendationSet | null>(null);

  const [intelligentGuidance, setIntelligentGuidance] = useState<IntelligentGuidance | null>(null);

  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);

  const [guidanceError, setGuidanceError] = useState<string | null>(null);

  const [aqalReport, setAqalReport] = useState<AqalReportData | null>(null); // Note: Could be persistent if needed

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState<string | null>(null);



  const generateRecommendations = useCallback(async () => {

    setAiLoading(true);

    setAiError(null);

    try {

      const stackInfo = practiceStack.map(p => `- ${p.name}: ${practiceNotes[p.id] || 'No notes.'}`).join('\n');

      const completionInfo = `Completed today: ${Object.values(completedToday).filter(Boolean).length}/${practiceStack.length}`;

      const context = `Current Stack:\n${stackInfo}\n\n${completionInfo}`;



      const recs = await aiService.generateRecommendations(context);

      setRecommendations(recs);

    } catch (e) {

      setAiError(e instanceof Error ? e.message : "Failed to get recommendations.");

    } finally {

      setAiLoading(false);

    }

  }, [practiceStack, practiceNotes, completedToday]);



  const handleGenerateEnhancedRecommendations = useCallback(async () => {

    setAiLoading(true);

    setAiError(null);

    try {

      const enhanced = await generateEnhancedRecommendationsForApp(

        practiceStack,

        integratedInsights,

        Object.values(corePractices).flat() as AllPractice[],

        practiceNotes,

        completedToday

      );

      setEnhancedRecommendations(enhanced);

    } catch (e) {

      setAiError(e instanceof Error ? e.message : "Failed to generate enhanced recommendations.");

    } finally {

      setAiLoading(false);

    }

  }, [practiceStack, integratedInsights, corePractices, practiceNotes, completedToday]);



  const handleGenerateIntelligentGuidance = useCallback(async () => {

    setIsGuidanceLoading(true);

    setGuidanceError(null);

    try {

      const context = aggregateUserContext(

        practiceStack,

        practiceNotes,

        integratedInsights,

        completedToday

      );

      // DEBUG: Log extracted sessions
      if (import.meta.env.DEV) {
        console.log('[useAIServices] Wizard sessions extracted:', context.wizardSessions.length);
        console.log('[useAIServices] Session types:', context.wizardSessions.map(s => s.type).join(', '));
      }

      const guidance = await getIntelligentGuidance(userId, context, userProfile); // Pass userId

      setIntelligentGuidance(guidance);

    } catch (e) {

      setGuidanceError(e instanceof Error ? e.message : "Failed to generate intelligent guidance.");

    } finally {

      setIsGuidanceLoading(false);

    }

  }, [practiceStack, practiceNotes, integratedInsights, completedToday, userProfile, userId]); // Add userId to dependency array



  const generateAqalReport = useCallback(async () => {

    console.log('[AQAL] Starting report generation...');

    setAiLoading(true);

    setAiError(null);

    try {

      const richContext = aggregateUserContext(

        practiceStack,

        practiceNotes,

        integratedInsights,

        completedToday

      );



      console.log('[AQAL] Aggregated context:', {

        practiceCount: richContext.currentPracticeStack.length,

        insightCount: richContext.integratedInsights.length,

        completionCount: richContext.completionHistory.length,

        developmentalStage: richContext.developmentalStage

      });



      // Transform IntelligenceContext to the format expected by generateAqalReport

      const practiceData = {

        practices: richContext.currentPracticeStack.map(p => ({

          name: p.name,

          module: (p as any).module || 'unknown',

          completedToday: richContext.completionHistory.some(

            c => c.practiceId === p.id && c.completed

          )

        })),

        insights: richContext.integratedInsights.map(i => i.detectedPattern),

        keganStage: richContext.developmentalStage

      };



      console.log('[AQAL] Practice data prepared:', practiceData);



      const report = await aiService.generateAqalReport(practiceData);

      console.log('[AQAL] Report generated:', report);

      setAqalReport(report);

    } catch (e) {

      console.error('[AQAL] Error:', e);

      setAiError(e instanceof Error ? e.message : "Failed to generate AQAL report.");

    } finally {

      setAiLoading(false);

    }

  }, [practiceStack, practiceNotes, integratedInsights, completedToday]);



  return {

    recommendations,

    enhancedRecommendations,

    intelligentGuidance,

    setIntelligentGuidance,

    isGuidanceLoading,

    guidanceError,

    aqalReport,

    setAqalReport,

    aiLoading,

    aiError,

    generateRecommendations,

    handleGenerateEnhancedRecommendations,

    handleGenerateIntelligentGuidance,

    generateAqalReport,

    clearGuidanceCache

  };

}
