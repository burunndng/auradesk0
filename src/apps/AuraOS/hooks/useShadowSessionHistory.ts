import { useState, useEffect } from 'react';
import { wizardSessionService } from '../services/wizardSessionService';

export interface WizardSessionSummary {
  lastPracticed: string | null;  // ISO date string
  sessionCount: number;
}

/** All wizard IDs that belong to the Shadow module */
const SHADOW_WIZARD_IDS = [
  'shadow-journaling',
  '321',
  'ifs',
  'memory-recon',
  'golden-shadow',
  'schema-detective',
  'schema-reflection',
  'attachment-assessment',
  'attachment-practice',
  'relational',
  'relational-blueprint',
  'cultural-shadow',
  'mourning-field',
  'axis',
  'psychedelic',
  'dbt-coach',
  'therapy-style',
] as const;

const LS_KEY = 'aura-shadow-session-history';

/**
 * Fetches per-wizard session counts and last-practiced dates for all shadow wizards.
 * Uses Supabase for authenticated users, localStorage fallback for anonymous.
 */
export function useShadowSessionHistory(userId?: string): Map<string, WizardSessionSummary> {
  const [history, setHistory] = useState<Map<string, WizardSessionSummary>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = new Map<string, WizardSessionSummary>();

      if (userId) {
        // Authenticated: fetch from Supabase
        try {
          const results = await Promise.all(
            SHADOW_WIZARD_IDS.map(async (wizardId) => {
              const sessions = await wizardSessionService.getSessionsByType(userId, wizardId);
              return {
                wizardId,
                sessionCount: sessions.length,
                lastPracticed: sessions.length > 0 ? sessions[0].date || null : null,
              };
            })
          );

          if (cancelled) return;

          for (const r of results) {
            if (r.sessionCount > 0) {
              result.set(r.wizardId, {
                lastPracticed: r.lastPracticed,
                sessionCount: r.sessionCount,
              });
            }
          }
        } catch (err) {
          console.warn('[useShadowSessionHistory] Supabase fetch failed, falling back to localStorage', err);
          loadFromLocalStorage(result);
        }
      } else {
        // Anonymous: localStorage only
        loadFromLocalStorage(result);
      }

      if (!cancelled) setHistory(result);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return history;
}

function loadFromLocalStorage(result: Map<string, WizardSessionSummary>): void {
  try {
    for (const wizardId of SHADOW_WIZARD_IDS) {
      const key = `aura-${wizardId}-history`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const sessions = JSON.parse(raw);
        if (Array.isArray(sessions) && sessions.length > 0) {
          // Newest first (most localStorage arrays are ordered newest-first)
          const newest = sessions[0]?.date || sessions[0]?.created_at || null;
          result.set(wizardId, {
            lastPracticed: newest,
            sessionCount: sessions.length,
          });
        }
      }
    }
  } catch {
    // Silently fail
  }
}
