import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../.claude/lib/storageSchemas';
import { StorageManager } from '../.claude/lib/storageManager';

interface LazyHistoryCache {
  [key: string]: any[] | null;
}

/**
 * Lazy-load wizard histories on demand instead of all at once
 * Prevents blocking mount with 20+ localStorage reads
 */
export function useLazyWizardHistory() {
  const [cache, setCache] = useState<LazyHistoryCache>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  /**
   * Load a specific history array by key (e.g., 'history321')
   * Returns cached value if already loaded
   */
  const loadHistory = useCallback((key: keyof typeof STORAGE_KEYS): any[] => {
    // Return cached if already loaded
    if (cache[key] !== undefined) {
      return cache[key] || [];
    }

    // Return empty array while loading (prevents re-triggers)
    if (loadingKeys.has(key)) {
      return [];
    }

    // Mark as loading
    setLoadingKeys(prev => new Set(prev).add(key));

    // Load asynchronously
    setTimeout(() => {
      try {
        const stored = StorageManager.get(key as any);
        setCache(prev => ({ ...prev, [key]: stored || [] }));
      } catch (err) {
        console.error(`[LazyHistory] Failed to load ${key}:`, err);
        setCache(prev => ({ ...prev, [key]: [] }));
      } finally {
        setLoadingKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }, 0);

    return [];
  }, [cache, loadingKeys]);

  /**
   * Set a history array (saves to storage immediately)
   */
  const setHistory = useCallback((key: keyof typeof STORAGE_KEYS, value: any[] | ((prev: any[]) => any[])) => {
    const currentValue = cache[key] || [];
    const newValue = typeof value === 'function' ? value(currentValue) : value;

    // Update cache
    setCache(prev => ({ ...prev, [key]: newValue }));

    // Persist to storage
    StorageManager.set(key as any, newValue);
  }, [cache]);

  /**
   * Get cached value without triggering load
   */
  const getCached = useCallback((key: keyof typeof STORAGE_KEYS): any[] | null => {
    return cache[key] !== undefined ? (cache[key] || []) : null;
  }, [cache]);

  return { loadHistory, setHistory, getCached };
}
