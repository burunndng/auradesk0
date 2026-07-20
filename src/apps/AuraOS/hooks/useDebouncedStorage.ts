import { useState, useCallback, useRef, useEffect } from 'react';
import { StorageManager } from '../.claude/lib/storageManager';

/**
 * Debounced localStorage hook
 * Batches rapid updates into a single write after a delay
 * Prevents excessive I/O on every keystroke (85+ unnecessary writes)
 *
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @param debounceMs - delay in ms before writing (default: 500ms)
 * @returns [value, setValue] - same API as useState
 */
export function useDebouncedStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((val: T) => T)) => void] {

  // State to store our value (in memory, updated immediately)
  const [storedValue, setStoredValue] = useState<T>(() => {
    const val = StorageManager.getUntyped(key);
    return val !== null ? (val as T) : initialValue;
  });

  // Ref to track debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track pending value (to ensure cleanup writes the latest)
  const pendingValueRef = useRef<T | null>(null);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Write pending value immediately on cleanup
        if (pendingValueRef.current !== null) {
          StorageManager.setUntyped(key, pendingValueRef.current);
        }
      }
    };
  }, [key]);

  // Debounced setter
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((current) => {
      const valueToStore = value instanceof Function ? value(current) : value;

      // Update pending value ref
      pendingValueRef.current = valueToStore;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced write timer
      debounceTimerRef.current = setTimeout(() => {
        StorageManager.setUntyped(key, valueToStore);
        pendingValueRef.current = null; // Clear pending after write
        debounceTimerRef.current = null;
      }, debounceMs);

      return valueToStore;
    });
  }, [key, debounceMs]);

  return [storedValue, setValue];
}

/**
 * Debounced wizard draft hook
 * Drop-in replacement for useWizardDraft with debouncing
 *
 * @param key - localStorage key
 * @param initialValue - default value
 * @param debounceMs - delay before write (default: 500ms)
 */
export function useDebouncedWizardDraft<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
) {
  const [draft, setDraft] = useDebouncedStorage<T>(key, initialValue, debounceMs);

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

  // Explicit save (flush immediately, bypassing debounce)
  const saveDraft = useCallback(() => {
    setDraft((current) => {
      StorageManager.setUntyped(key, current);
      return current;
    });
  }, [key, setDraft]);

  // Clear draft (reset to initial)
  const clearDraft = useCallback(() => {
    setDraft(initialValue);
  }, [initialValue, setDraft]);

  return [draft, updateDraft, saveDraft, clearDraft] as const;
}
