import { useEffect, useRef } from 'react';
import { preferenceDatabaseService } from '../services/preferenceDatabaseService';
import { AllPractice } from '../types';

/**
 * Hook to synchronize local practice stack and preferences with Supabase
 * Implements a "Cloud-Sync, Local-First" strategy
 */
export function usePreferenceSync(
  userId: string,
  practiceStack: AllPractice[],
  setPracticeStack: (stack: AllPractice[]) => void
) {
  const isInitialLoad = useRef(true);
  const lastSyncedStack = useRef<string>('');

  // 1. Initial Load: Fetch from Supabase
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!userId) return;
      
      console.log('[PreferenceSync] Checking cloud for stack...');
      const cloudPrefs = await preferenceDatabaseService.getPreferences(userId);
      
      if (cloudPrefs && cloudPrefs.active_stack && cloudPrefs.active_stack.length > 0) {
        console.log(`[PreferenceSync] Found cloud stack with ${cloudPrefs.active_stack.length} items. Syncing to local.`);
        
        // Simple strategy: If local is empty, use cloud. 
        // In a real app, we'd use updated_at timestamps to merge.
        if (practiceStack.length === 0) {
          setPracticeStack(cloudPrefs.active_stack);
        }
      }
      
      isInitialLoad.current = false;
      lastSyncedStack.current = JSON.stringify(practiceStack);
    };

    loadFromSupabase();
  }, [userId]); // Only on mount/userId change

  // 2. Background Sync: Push to Supabase when local stack changes
  useEffect(() => {
    if (isInitialLoad.current) return;

    const currentStackJson = JSON.stringify(practiceStack);
    
    // Only sync if stack actually changed to avoid infinite loops or wasted calls
    if (currentStackJson !== lastSyncedStack.current) {
      const syncToCloud = async () => {
        console.log('[PreferenceSync] Pushing stack update to cloud...');
        const success = await preferenceDatabaseService.updateStack(userId, practiceStack);
        if (success) {
          lastSyncedStack.current = currentStackJson;
          console.log('[PreferenceSync] Cloud sync successful');
        }
      };

      // Debounce the cloud push
      const timeout = setTimeout(syncToCloud, 2000);
      return () => clearTimeout(timeout);
    }
  }, [practiceStack, userId]);
}
