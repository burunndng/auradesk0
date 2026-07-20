/**
 * useAXISAnchor Hook
 * Manages the persistent identity anchor — backed by IndexedDB via AXISStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AXISAnchor, AXISAnchorMode } from '../../../../types';
import { readAnchor, writeAnchor } from '../../../../services/AXISStorage';

export function useAXISAnchor() {
  const [anchor, setAnchor] = useState<AXISAnchor | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    readAnchor().then(data => {
      if (data && typeof data === 'object' && 'content' in data) {
        setAnchor(data as AXISAnchor);
      }
      setLoading(false);
    }).catch(e => {
      console.error('[AXIS] Failed to load anchor:', e);
      setLoading(false);
    });
  }, []);

  // Save anchor to IndexedDB
  const saveAnchor = useCallback((content: string, mode?: AXISAnchorMode) => {
    const newAnchor: AXISAnchor = {
      content,
      updatedAt: new Date().toISOString(),
      ...(mode ? { mode } : {}),
    };
    setAnchor(newAnchor);
    writeAnchor(newAnchor).catch(e =>
      console.error('[AXIS] Failed to save anchor:', e)
    );
  }, []);

  // Create initial anchor if none exists
  const createAnchor = useCallback((content: string, mode?: AXISAnchorMode) => {
    saveAnchor(content, mode);
  }, [saveAnchor]);

  // Update anchor mode only
  const updateAnchorMode = useCallback((mode: AXISAnchorMode) => {
    if (!anchor) return;
    const updated = { ...anchor, mode, updatedAt: new Date().toISOString() };
    setAnchor(updated);
    writeAnchor(updated).catch(e =>
      console.error('[AXIS] Failed to update anchor mode:', e)
    );
  }, [anchor]);

  return {
    anchor,
    loading,
    saveAnchor,
    createAnchor,
    updateAnchorMode,
    hasAnchor: !!anchor?.content,
  };
}
