import { supabase } from './supabaseClient';
import {
  CbmProfile,
  BiasFingerprint,
  CbmSession,
  WeeklyReviewData,
  CbmWeeklyReviewAI,
  TrialMetrics,
  QuadrantScores,
  Quadrant,
  CbmBankScenario
} from '../types';

export async function getCbmProfile(userId: string): Promise<CbmProfile | null> {
  const { data, error } = await (supabase as any)
    .from('cbm_profiles' as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    console.error('Error fetching CBM profile:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    biasFingerprint: data.bias_fingerprint as BiasFingerprint,
    currentPhase: data.current_phase,
    sessionCount: data.session_count,
    lastSessionAt: data.last_session_at,
    streak: data.streak,
    seenScenarioIds: data.seen_scenario_ids
  };
}

export async function createCbmProfile(userId: string, fingerprint: BiasFingerprint): Promise<CbmProfile> {
  const { data, error } = await (supabase as any)
    .from('cbm_profiles' as any)
    .insert({
      user_id: userId,
      bias_fingerprint: fingerprint,
      current_phase: 1,
      session_count: 0,
      streak: 0,
      seen_scenario_ids: []
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    biasFingerprint: data.bias_fingerprint as BiasFingerprint,
    currentPhase: data.current_phase,
    sessionCount: data.session_count,
    lastSessionAt: data.last_session_at,
    streak: data.streak,
    seenScenarioIds: data.seen_scenario_ids
  };
}

export async function updateCbmProfile(userId: string, updates: Partial<CbmProfile>): Promise<void> {
  const dbUpdates: any = {};
  if (updates.biasFingerprint) dbUpdates.bias_fingerprint = updates.biasFingerprint;
  if (updates.currentPhase !== undefined) dbUpdates.current_phase = updates.currentPhase;
  if (updates.sessionCount !== undefined) dbUpdates.session_count = updates.sessionCount;
  if (updates.lastSessionAt !== undefined) dbUpdates.last_session_at = updates.lastSessionAt;
  if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
  if (updates.seenScenarioIds) dbUpdates.seen_scenario_ids = updates.seenScenarioIds;
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await (supabase as any)
    .from('cbm_profiles' as any)
    .update(dbUpdates)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function saveCbmSession(userId: string, session: Omit<CbmSession, 'id' | 'createdAt'>): Promise<CbmSession> {
  const { data, error } = await (supabase as any)
    .from('cbm_sessions' as any)
    .insert({
      user_id: userId,
      session_number: session.sessionNumber,
      phase: session.phase,
      trials: session.trials,
      accuracy_score: session.accuracyScore,
      quadrant_scores: session.quadrantScores,
      reflection_text: session.reflectionText || null
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    sessionNumber: data.session_number,
    phase: data.phase,
    trials: data.trials as TrialMetrics[],
    accuracyScore: data.accuracy_score,
    quadrantScores: data.quadrant_scores as QuadrantScores,
    reflectionText: data.reflection_text,
    createdAt: data.created_at
  };
}

export async function getRecentSessions(userId: string, limit: number): Promise<CbmSession[]> {
  const { data, error } = await (supabase as any)
    .from('cbm_sessions' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent CBM sessions:', error);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    sessionNumber: d.session_number,
    phase: d.phase,
    trials: d.trials as TrialMetrics[],
    accuracyScore: d.accuracy_score,
    quadrantScores: d.quadrant_scores as QuadrantScores,
    reflectionText: d.reflection_text,
    createdAt: d.created_at
  }));
}

export async function saveWeeklyReview(userId: string, data: WeeklyReviewData, aiReview: CbmWeeklyReviewAI, sessionIds: string[]): Promise<void> {
  const { error } = await (supabase as any)
    .from('cbm_weekly_reviews' as any)
    .insert({
      user_id: userId,
      week_number: data.weekNumber,
      sessions_included: sessionIds,
      review_data: data,
      ai_review: aiReview
    });

  if (error) throw error;
}

export async function getLatestWeeklyReview(userId: string): Promise<CbmWeeklyReviewAI | null> {
  const { data, error } = await (supabase as any)
    .from('cbm_weekly_reviews' as any)
    .select('ai_review')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching latest CBM weekly review:', error);
    return null;
  }

  return data.ai_review as CbmWeeklyReviewAI;
}

export function computeAccuracyScore(trials: TrialMetrics[]): number {
  if (trials.length === 0) return 0;
  return trials.reduce((sum, t) => {
    if (t.selectedType === 'growth') return sum + 1;
    if (t.selectedType === 'neutral') return sum + 0.5;
    return sum;
  }, 0) / trials.length;
}

export function computeQuadrantScores(trials: TrialMetrics[]): QuadrantScores {
  const scores: QuadrantScores = {
    UL: { flexScore: 0, trialCount: 0 },
    UR: { flexScore: 0, trialCount: 0 },
    LL: { flexScore: 0, trialCount: 0 },
    LR: { flexScore: 0, trialCount: 0 }
  };

  trials.forEach(t => {
    scores[t.quadrant].trialCount += 1;
    if (t.selectedType === 'growth') scores[t.quadrant].flexScore += 1;
    else if (t.selectedType === 'neutral') scores[t.quadrant].flexScore += 0.5;
  });

  // Normalize scores
  (['UL', 'UR', 'LL', 'LR'] as Quadrant[]).forEach(q => {
    if (scores[q].trialCount > 0) {
      scores[q].flexScore = scores[q].flexScore / scores[q].trialCount;
    }
  });

  return scores;
}

export function shouldTriggerWeeklyReview(sessionCount: number): boolean {
  return sessionCount > 0 && sessionCount % 4 === 0;
}

export function shouldFlagForShadowWork(sessions: CbmSession[], domain: Quadrant): boolean {
  const recentTrials = sessions.slice(-3).flatMap(s => s.trials).filter(t => t.quadrant === domain);
  if (recentTrials.length < 6) return false;
  return (recentTrials.filter(t => t.selectedType === 'threat').length / recentTrials.length) >= 0.7;
}

export function isSessionBlockedToday(lastSessionAt: string | null): boolean {
  if (!lastSessionAt) return false;
  const lastDate = new Date(lastSessionAt);
  const today = new Date();
  return lastDate.getUTCFullYear() === today.getUTCFullYear() &&
         lastDate.getUTCMonth() === today.getUTCMonth() &&
         lastDate.getUTCDate() === today.getUTCDate();
}

export function selectSessionScenarios(
  bank: CbmBankScenario[],
  profile: CbmProfile,
  recentSessionIds: string[][],
): CbmBankScenario[] {
  const recentlyUsed = new Set(recentSessionIds.flat());
  const available = [...bank.filter(s => !recentlyUsed.has(s.id) && s.difficulty === 1)];

  const selected: CbmBankScenario[] = [];
  const QUADRANT_SEQUENCE: Quadrant[] = ['UL', 'LL', 'UR', 'LR'];

  for (let i = 0; i < 14; i++) {
    const quadrant = (i % 5 < 3 && profile.biasFingerprint.highBiasDomains.length > 0)
      ? profile.biasFingerprint.highBiasDomains[i % profile.biasFingerprint.highBiasDomains.length]
      : QUADRANT_SEQUENCE[i % 4];

    const candidates = available.filter(s => s.quadrant === quadrant);
    const pool = candidates.length > 0 ? candidates : available;
    if (pool.length === 0) break;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    selected.push(pick);
    available.splice(available.indexOf(pick), 1);
  }

  return selected;
}
