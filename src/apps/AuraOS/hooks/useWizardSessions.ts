import { useCallback, useEffect, useTransition } from 'react';
import { useStorage as useLocalStorage } from './useStorage';
import * as coreTypes from '../types';
import { practices as corePractices } from '../constants';
import { generateInsightFromSession } from '../services/insightGenerator';
import { syncUserSession } from '../services/ragService';
import { getIntelligentGuidance } from '../services/intelligenceHub';
import { aggregateUserContext } from '../utils/contextAggregator';
import { logPlanDayFeedback, calculatePlanAggregates } from '../utils/planHistoryUtils';
import { wizardSessionService } from '../services/wizardSessionService';
import { useWizardState } from './wizards/useWizardState';
import { useWizardSync } from './wizards/useWizardSync';
import { useWizardHandlers } from './wizards/useWizardHandlers';
import { useToast } from '../components/shared/ToastContext';

import { useIntelligenceRefresh } from './useIntelligenceRefresh';

export function useWizardSessions(
  userId: string,
  practiceStack: coreTypes.AllPractice[],
  practiceNotes: Record<string, string>,
  completedToday: Record<string, boolean>,
  userProfile: any,
  setIntelligentGuidance: (guidance: any) => void,
  setIntegratedInsights: React.Dispatch<React.SetStateAction<coreTypes.IntegratedInsight[]>>,
  integratedInsights: coreTypes.IntegratedInsight[],
  navigateBack: () => void,
  setActiveTab: (tab: coreTypes.ActiveTab) => void,
  setActiveWizard: (wizard: string | null) => void
) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  // Debounced Intelligence Hub refresh
  const triggerIntelligenceRefresh = useIntelligenceRefresh(
    userId,
    userProfile,
    practiceStack,
    practiceNotes,
    integratedInsights,
    completedToday,
    setIntelligentGuidance
  );

  // Helper: Generate insight and trigger debounced refresh
  const generateInsightAndRefreshGuidance = useCallback(async (
    input: Parameters<typeof generateInsightFromSession>[0]
  ): Promise<coreTypes.IntegratedInsight | null> => {
    try {
      const insight = await generateInsightFromSession(input);

      // Trigger debounced refresh (won't fire immediately)
      triggerIntelligenceRefresh();

      return insight;
    } catch (err: any) {
      // Check if this is a policy skip error
      if (err?.message?.startsWith('POLICY_SKIP')) {
        console.log('[generateInsightAndRefreshGuidance] Insight generation skipped by policy:', err.message);
        return null;
      }
      console.error('[generateInsightAndRefreshGuidance] Error:', err);
      addToast('AI Generation failed. The network might be busy.', 'error');
      throw err;
    }
  }, [triggerIntelligenceRefresh, addToast]);


  const { drafts, history, setters } = useWizardState();

  useWizardSync(userId, history, setters);

  const handlers = useWizardHandlers(
    userId,
    userProfile,
    generateInsightAndRefreshGuidance,
    navigateBack,
    setActiveTab,
    setIntegratedInsights,
    history,
    setters,
    integratedInsights
  );

  return {
    drafts,
    history,
    setters,
    handlers
  };
}
