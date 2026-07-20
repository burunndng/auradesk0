import { BioenergeneticsSession } from '../types.ts';
import { StorageManager } from '../.claude/lib/storageManager';

interface BioenergeneticsStats {
  totalSessions: number;
  totalMinutes: number;
  favoritepractices: Array<{ name: string; count: number }>;
  averageSudsReduction: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save a bioenergetics session to localStorage
 */
export async function saveBioenergeneticsSession(session: BioenergeneticsSession): Promise<void> {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, session not saved');
    return;
  }

  try {
    // Get existing sessions
    const existing = StorageManager.getUntyped('bioenergeneticsSessions');
    const sessions: BioenergeneticsSession[] = existing ? (existing as BioenergeneticsSession[]) : [];

    // Add new session
    sessions.push(session);

    // Save back to localStorage
    StorageManager.setUntyped('bioenergeneticsSessions', sessions);

    console.log('Bioenergetics session saved:', session.id);
  } catch (error) {
    console.error('Failed to save bioenergetics session:', error);
    throw new Error('Failed to save session');
  }
}

/**
 * Get all bioenergetics sessions for a user
 */
export function getBioenergeneticsSessionsByUser(userId: string): BioenergeneticsSession[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const existing = StorageManager.getUntyped('bioenergeneticsSessions');
    if (!existing) return [];

    const sessions: BioenergeneticsSession[] = existing as BioenergeneticsSession[];
    return sessions.filter((s) => s.userId === userId);
  } catch (error) {
    console.error('Failed to get bioenergetics sessions:', error);
    return [];
  }
}

/**
 * Get all bioenergetics sessions
 */
export function getAllBioenergeneticsSessions(): BioenergeneticsSession[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const existing = StorageManager.getUntyped('bioenergeneticsSessions');
    if (!existing) return [];

    return existing as BioenergeneticsSession[];
  } catch (error) {
    console.error('Failed to get bioenergetics sessions:', error);
    return [];
  }
}

/**
 * Get a specific session by ID
 */
export function getBioenergeneticsSessionById(id: string): BioenergeneticsSession | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const existing = StorageManager.getUntyped('bioenergeneticsSessions');
    if (!existing) return null;

    const sessions: BioenergeneticsSession[] = existing as BioenergeneticsSession[];
    return sessions.find((s) => s.id === id) || null;
  } catch (error) {
    console.error('Failed to get bioenergetics session:', error);
    return null;
  }
}

/**
 * Delete a bioenergetics session
 */
export function deleteBioenergeneticsSession(id: string): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, session not deleted');
    return;
  }

  try {
    const existing = StorageManager.getUntyped('bioenergeneticsSessions');
    if (!existing) return;

    const sessions: BioenergeneticsSession[] = existing as BioenergeneticsSession[];
    const filtered = sessions.filter((s) => s.id !== id);

    StorageManager.setUntyped('bioenergeneticsSessions', filtered);
    console.log('Bioenergetics session deleted:', id);
  } catch (error) {
    console.error('Failed to delete bioenergetics session:', error);
  }
}

/**
 * Get session statistics for a user
 */
export function getBioenergeneticsStats(userId: string): BioenergeneticsStats {
  const sessions = getBioenergeneticsSessionsByUser(userId);

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      favoritepractices: [],
      averageSudsReduction: 0
    };
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  // Count by practice
  const practiceCount: Record<string, number> = {};
  sessions.forEach((s) => {
    practiceCount[s.practiceName] = (practiceCount[s.practiceName] || 0) + 1;
  });

  const favoritepractices = Object.entries(practiceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Average SUDS reduction
  const sudsReductions = sessions
    .filter((s) => s.sudsAtStart !== undefined && s.sudsAtEnd !== undefined)
    .map((s) => (s.sudsAtStart || 0) - (s.sudsAtEnd || 0));

  const averageSudsReduction =
    sudsReductions.length > 0
      ? Math.round((sudsReductions.reduce((a, b) => a + b, 0) / sudsReductions.length) * 10) / 10
      : 0;

  return {
    totalSessions: sessions.length,
    totalMinutes,
    favoritepractices,
    averageSudsReduction
  };
}
