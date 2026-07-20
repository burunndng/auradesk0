import { useCallback } from 'react';
import { useStorage } from './useStorage';

/**
 * Hook for managing wizard drafts with auto-save
 * Wraps useStorage to provide a simpler API for wizards
 */
export function useWizardDraft<T>(key: string, initialValue: T) {
  const [draft, setDraft] = useStorage<T>(key, initialValue);

  // Update draft with partial data (merges with existing) or new state
  const updateDraft = useCallback((newData: Partial<T> | ((prev: T) => T)) => {
    setDraft((prev) => {
      if (typeof newData === 'function') {
        return (newData as (prev: T) => T)(prev);
      }
      // If both are objects, merge them
      if (typeof prev === 'object' && prev !== null && typeof newData === 'object' && newData !== null) {
        return { ...prev, ...newData };
      }
      // Otherwise replace
      return newData as T;
    });
  }, [setDraft]);

  // Explicit save (noop since updateDraft auto-saves, but kept for API compatibility)
  const saveDraft = useCallback(() => {
    // Already saved in state/storage
  }, []);

  // Clear draft (reset to initial)
  const clearDraft = useCallback(() => {
    setDraft(initialValue);
  }, [initialValue, setDraft]);

  return [draft, updateDraft, saveDraft, clearDraft] as const;
}
