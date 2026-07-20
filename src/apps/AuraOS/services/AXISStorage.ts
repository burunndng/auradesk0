/**
 * AXISStorage — IndexedDB-backed storage for AXIS wizard data via localforage.
 * Replaces direct localStorage usage to handle large conversation histories
 * without hitting the 5MB quota. 
 */

import localforage from 'localforage';
import type { AXISSession, AXISAnchor, AXISSynthesisBrief, MemoryItem } from '../types';

// Dedicated store instance (isolates AXIS data from other app stores)
const axisStore = localforage.createInstance({
  name: 'AuraOS',
  storeName: 'axis',
  description: 'AXIS wizard sessions, anchor, and synthesis data',
});

const KEYS = {
  SESSIONS: 'axis-sessions',
  ANCHOR: 'axis-anchor',
  RPL_COOLDOWNS: 'axis-rpl-cooldowns',
  LATEST_SYNTHESIS: 'axis-synthesis-latest',
  MEMORY_ITEMS: 'axis-memory-items',
} as const;

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function readSessions(): Promise<AXISSession[]> {
  try {
    const data = await axisStore.getItem<AXISSession[]>(KEYS.SESSIONS);
    return data ?? [];
  } catch (e) {
    console.error('[AXISStorage] readSessions failed:', e);
    return [];
  }
}

export async function writeSessions(sessions: AXISSession[]): Promise<void> {
  try {
    await axisStore.setItem(KEYS.SESSIONS, sessions);
  } catch (e) {
    console.error('[AXISStorage] writeSessions failed:', e);
  }
}

// ─── Anchor ──────────────────────────────────────────────────────────────────

export async function readAnchor(): Promise<AXISAnchor | null> {
  try {
    return await axisStore.getItem<AXISAnchor>(KEYS.ANCHOR);
  } catch (e) {
    console.error('[AXISStorage] readAnchor failed:', e);
    return null;
  }
}

export async function writeAnchor(anchor: AXISAnchor): Promise<void> {
  try {
    await axisStore.setItem(KEYS.ANCHOR, anchor);
  } catch (e) {
    console.error('[AXISStorage] writeAnchor failed:', e);
  }
}

// ─── Latest Synthesis (anon fallback) ────────────────────────────────────────

export async function readLatestSynthesis(): Promise<AXISSynthesisBrief | null> {
  try {
    return await axisStore.getItem<AXISSynthesisBrief>(KEYS.LATEST_SYNTHESIS);
  } catch (e) {
    console.error('[AXISStorage] readLatestSynthesis failed:', e);
    return null;
  }
}

export async function writeLatestSynthesis(brief: AXISSynthesisBrief): Promise<void> {
  try {
    await axisStore.setItem(KEYS.LATEST_SYNTHESIS, brief);
  } catch (e) {
    console.error('[AXISStorage] writeLatestSynthesis failed:', e);
  }
}

// ─── Memory Items ─────────────────────────────────────────────────────────────
// Phase 1: IndexedDB only (anon-first pattern).
// TODO (Phase 3): Add Supabase sync for authenticated users so memory persists across devices.

export async function readMemoryItems(): Promise<MemoryItem[]> {
  try {
    const data = await axisStore.getItem<MemoryItem[]>(KEYS.MEMORY_ITEMS);
    return data ?? [];
  } catch (e) {
    console.error('[AXISStorage] readMemoryItems failed:', e);
    return [];
  }
}

export async function writeMemoryItem(item: MemoryItem): Promise<void> {
  try {
    const existing = await readMemoryItems();
    const idx = existing.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      existing[idx] = item;
    } else {
      existing.push(item);
    }
    await axisStore.setItem(KEYS.MEMORY_ITEMS, existing);
  } catch (e) {
    console.error('[AXISStorage] writeMemoryItem failed:', e);
  }
}

export async function updateMemoryItem(id: string, updates: Partial<MemoryItem>): Promise<void> {
  try {
    const existing = await readMemoryItems();
    const idx = existing.findIndex(i => i.id === id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
      await axisStore.setItem(KEYS.MEMORY_ITEMS, existing);
    }
  } catch (e) {
    console.error('[AXISStorage] updateMemoryItem failed:', e);
  }
}

// ─── RPL Cooldowns ───────────────────────────────────────────────────────────

interface RPLCooldown {
  patternType: string;
  expiresAt: string;
}

export function readRPLCooldowns(): RPLCooldown[] {
  // RPL cooldowns are read synchronously in useMemo — keep in localStorage
  try {
    const raw = localStorage.getItem('aura-AXIS-rpl-cooldowns');
    if (raw) return JSON.parse(raw) as RPLCooldown[];
  } catch { /* ignore */ }
  return [];
}

export function writeRPLCooldowns(cooldowns: RPLCooldown[]): void {
  try {
    localStorage.setItem('aura-AXIS-rpl-cooldowns', JSON.stringify(cooldowns));
  } catch { /* ignore */ }
}

// ─── Export / Import ─────────────────────────────────────────────────────────

export interface AXISExportData {
  version: 1;
  exportedAt: string;
  sessions: AXISSession[];
  anchor: AXISAnchor | null;
  latestSynthesis: AXISSynthesisBrief | null;
}

export async function exportAllData(): Promise<AXISExportData> {
  const [sessions, anchor, latestSynthesis] = await Promise.all([
    readSessions(),
    readAnchor(),
    readLatestSynthesis(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    anchor,
    latestSynthesis,
  };
}

export async function importAllData(data: AXISExportData): Promise<void> {
  if (data.version !== 1) {
    throw new Error(`Unsupported AXIS export version: ${data.version}`);
  }
  const existing = await readSessions();
  // Merge: keep existing sessions, add imported ones that don't conflict by id
  const existingIds = new Set(existing.map(s => s.id));
  const merged = [...existing, ...data.sessions.filter(s => !existingIds.has(s.id))];
  await writeSessions(merged);
  if (data.anchor && !await readAnchor()) {
    await writeAnchor(data.anchor);
  }
  if (data.latestSynthesis) {
    await writeLatestSynthesis(data.latestSynthesis);
  }
}

export function downloadExportJSON(data: AXISExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `axis-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
