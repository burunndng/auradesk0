import { useCallback, useRef, useEffect } from 'react';
import { createDebounce } from '../utils/debounce';
import { getIntelligentGuidance } from '../services/intelligenceHub';
import { aggregateUserContext } from '../utils/contextAggregator';
import { startMark, endMark } from '../utils/performanceMonitor';
import type * as coreTypes from '../types';

/**
 * Manages debounced Intelligence Hub refresh.
 * Batches multiple wizard saves into a single AI synthesis every 3 seconds.
 */
export function useIntelligenceRefresh(
  userId: string,
  userProfile: any,
  practiceStack: coreTypes.AllPractice[],
  practiceNotes: Record<string, string>,
  integratedInsights: coreTypes.IntegratedInsight[],
  completedToday: Record<string, boolean>,
  setIntelligentGuidance: (guidance: any) => void
) {
  const debouncedRefreshRef = useRef<ReturnType<typeof createDebounce> | null>(null);

  // Recreate debounced refresh function whenever dependencies change to capture current state
  useEffect(() => {
    debouncedRefreshRef.current = createDebounce(async () => {
      startMark('intelligence-refresh');
      try {
        const context = aggregateUserContext(
          practiceStack,
          practiceNotes,
          integratedInsights,
          completedToday
        );
        const guidance = await getIntelligentGuidance(userId, context, userProfile);
        setIntelligentGuidance(guidance);
      } catch (err) {
        console.warn('[useIntelligenceRefresh] Failed to refresh guidance:', err);
      } finally {
        endMark('intelligence-refresh');
      }
    }, 3000); // 3 second debounce

    return () => {
      debouncedRefreshRef.current?.cancel();
    };
  }, [userId, userProfile, practiceStack, practiceNotes, integratedInsights, completedToday, setIntelligentGuidance]);

  return useCallback(() => {
    if (debouncedRefreshRef.current) {
      debouncedRefreshRef.current();
    }
  }, []);
}
