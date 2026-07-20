import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { StorageManager } from '../.claude/lib/storageManager';
import { STORAGE_KEYS } from '../.claude/lib/storageSchemas';
import { IntegratedInsight } from '../types';
import { insightDatabaseService } from '../services/insightDatabaseService';
import { useUserContext } from './UserContext';

interface InsightsContextValue {
  integratedInsights: IntegratedInsight[];
  setIntegratedInsights: React.Dispatch<React.SetStateAction<IntegratedInsight[]>>;
  isLoading: boolean;
  syncWithDatabase: () => Promise<void>;
  markInsightAsAddressed: (insightId: string, toolType: string, sessionId: string) => void;
  markInsightAsAddressedByPractice: (insightId: string, practiceId: string, practiceName: string) => void;
}

const InsightsContext = createContext<InsightsContextValue | undefined>(undefined);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const [integratedInsights, setIntegratedInsightsState] = useState<IntegratedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We'll get userId from useUserContext inside a nested component or via a side effect
  // Since InsightsProvider is often a parent of UserProvider, we might need to handle this carefully.
  // In App.tsx: Navigation -> Practice -> User -> Insights -> AI -> Wizard -> Modal
  // Wait, App.tsx shows UserProvider is a PARENT of InsightsProvider!
  // <UserProvider> <InsightsProvider> <AIProvider> ...

  const { userId } = useUserContext();

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    console.time('[InsightsProvider] Loading integratedInsights');

    try {
      // 1. Try to load from localStorage first (fast cache)
      const localInsights = StorageManager.get(STORAGE_KEYS.INTEGRATED_INSIGHTS) || [];
      setIntegratedInsightsState(localInsights);

      // 2. If we have a userId, sync with Supabase
      if (userId) {
        const dbInsights = await insightDatabaseService.getInsights(userId);

        if (dbInsights.length > 0) {
          // Merge logic: For now, if DB has data, it's the source of truth
          // In a more complex app, we'd do a timestamp-based merge
          setIntegratedInsightsState(dbInsights);

          // Update cache
          StorageManager.set(STORAGE_KEYS.INTEGRATED_INSIGHTS, dbInsights);

          // Migration check: If local has insights NOT in DB, upload them
          const dbIds = new Set(dbInsights.map(i => i.id));
          const unsynced = localInsights.filter(i => !dbIds.has(i.id));

          if (unsynced.length > 0) {
            console.log('[InsightsProvider] Migrating unsynced local insights to DB:', unsynced.length);
            await insightDatabaseService.saveInsights(userId, unsynced);
          }
        } else if (localInsights.length > 0) {
          // DB is empty but local has data -> Initial migration to Supabase
          console.log('[InsightsProvider] Initial migration to Supabase for user:', userId);
          await insightDatabaseService.saveInsights(userId, localInsights);
        }
      }
    } catch (err) {
      console.error('[InsightsProvider] Error loading insights:', err);
    } finally {
      console.timeEnd('[InsightsProvider] Loading integratedInsights');
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Wrapper that persists integratedInsights to both Supabase and localStorage
  const setIntegratedInsights = useCallback(async (
    value: IntegratedInsight[] | ((prev: IntegratedInsight[]) => IntegratedInsight[])
  ) => {
    // We update state immediately for UI responsiveness
    setIntegratedInsightsState(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;

      // 1. Persist to localStorage (cache/offline fallback)
      StorageManager.set(STORAGE_KEYS.INTEGRATED_INSIGHTS, newValue);

      // 2. Persist to Supabase if userId is available (async, non-blocking)
      if (userId) {
        // Fire-and-forget database persistence (doesn't block state update)
        (async () => {
          try {
            // Detect single new insight: one more item than before, and the first item is new
            const isSingleNewInsight =
              newValue.length === prev.length + 1 &&
              newValue[0]?.id &&
              !prev.find(i => i.id === newValue[0].id);
            if (isSingleNewInsight) {
              await insightDatabaseService.saveInsight(userId, newValue[0]);
            } else {
              // Bulk save for other operations (delete, addressed status update, etc.)
              await insightDatabaseService.saveInsights(userId, newValue);
            }
          } catch (err) {
            console.error('[InsightsContext] Failed to save insights to database:', err);
          }
        })();
      }

      return newValue;
    });
  }, [userId]);

  const syncWithDatabase = useCallback(async () => {
    await loadInsights();
  }, [loadInsights]);

  const markInsightAsAddressed = useCallback((insightId: string, toolType: string, sessionId: string) => {
    setIntegratedInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? {
            ...insight,
            status: 'addressed' as const,
            shadowWorkSessionsAddressed: [
              ...(insight.shadowWorkSessionsAddressed ?? []),
              { shadowToolType: toolType, shadowSessionId: sessionId, dateCompleted: new Date().toISOString() }
            ]
          }
        : insight
    ));
  }, [setIntegratedInsights]);

  const markInsightAsAddressedByPractice = useCallback((insightId: string, practiceId: string, practiceName: string) => {
    setIntegratedInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? {
            ...insight,
            status: 'addressed' as const,
            shadowWorkSessionsAddressed: [
              ...(insight.shadowWorkSessionsAddressed ?? []),
              { shadowToolType: practiceName, shadowSessionId: practiceId, dateCompleted: new Date().toISOString() }
            ]
          }
        : insight
    ));
  }, [setIntegratedInsights]);

  return (
    <InsightsContext.Provider value={{
      integratedInsights,
      setIntegratedInsights,
      isLoading,
      syncWithDatabase,
      markInsightAsAddressed,
      markInsightAsAddressedByPractice
    }}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsightsContext() {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error('useInsightsContext must be used within an InsightsProvider');
  }
  return context;
}
