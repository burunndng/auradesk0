/**
 * useAXISSessions Hook
 * Manages AXIS session lifecycle — backed by IndexedDB via AXISStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AXISSession, AXISActivityType } from '../../../../types';
import { readSessions, writeSessions } from '../../../../services/AXISStorage';

// Helper for generating IDs without external dependencies
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);

export function useAXISSessions() {
  const [sessions, setSessions] = useState<AXISSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from IndexedDB on mount; auto-close stale active sessions (orphaned from prior browser sessions)
  useEffect(() => {
    readSessions().then(data => {
      const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();
      const recovered = data.map(s => {
        if (s.status === 'active' && (now - new Date(s.createdAt).getTime()) > STALE_THRESHOLD_MS) {
          return { ...s, status: 'closed' as const, closedAt: s.closedAt ?? new Date().toISOString() };
        }
        return s;
      });
      const hadStale = recovered.some((s, i) => s !== data[i]);
      if (hadStale) writeSessions(recovered).catch(() => {});
      setSessions(recovered);
      setLoading(false);
    }).catch(e => {
      console.error('[AXIS] Failed to load sessions:', e);
      setLoading(false);
    });
  }, []);

  // Persist to IndexedDB (no strip limit — IndexedDB handles large data)
  const persistSessions = useCallback((updatedSessions: AXISSession[]) => {
    writeSessions(updatedSessions).catch(e =>
      console.error('[AXIS] Failed to save sessions:', e)
    );
  }, []);

  // Create new session
  const createSession = useCallback(
    (activityType: AXISActivityType, title: string, intention: string, successCriteria?: string) => {
      const newSession: AXISSession = {
        id: generateId(),
        activityType,
        title,
        intention,
        successCriteria,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setSessions(prev => {
        const updated = [...prev, newSession];
        persistSessions(updated);
        return updated;
      });
      return newSession;
    },
    [persistSessions]
  );

  // Update session status
  const updateSessionStatus = useCallback(
    (sessionId: string, status: AXISSession['status']) => {
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === sessionId
            ? { ...s, status, closedAt: status === 'closed' ? new Date().toISOString() : s.closedAt }
            : s
        );
        persistSessions(updated);
        return updated;
      });
    },
    [persistSessions]
  );

  // Update refined intention on session
  const updateRefinedIntention = useCallback(
    (sessionId: string, refinedIntention: string) => {
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === sessionId ? { ...s, refinedIntention } : s
        );
        persistSessions(updated);
        return updated;
      });
    },
    [persistSessions]
  );

  // Link insight to session
  const linkInsight = useCallback(
    (sessionId: string, insightId: string) => {
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === sessionId ? { ...s, insightId } : s
        );
        persistSessions(updated);
        return updated;
      });
    },
    [persistSessions]
  );

  // Update session data (conversationHistory, preparationHistory, synthesisBrief, refinedIntention, contextData)
  const updateSessionData = useCallback(
    (sessionId: string, data: Partial<Pick<AXISSession, 'conversationHistory' | 'preparationHistory' | 'synthesisBrief' | 'refinedIntention' | 'contextData'>>) => {
      setSessions(prev => {
        const updated = prev.map(s => s.id === sessionId ? { ...s, ...data } : s);
        persistSessions(updated);
        return updated;
      });
    },
    [persistSessions]
  );

  return {
    sessions: sessions || [], // Guarantee an array
    loading,
    openSessions: (sessions || []).filter(s => s.status !== 'closed'),
    createSession,
    updateSessionStatus,
    updateRefinedIntention,
    linkInsight,
    updateSessionData,
  };
}
