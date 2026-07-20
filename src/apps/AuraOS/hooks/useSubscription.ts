/**
 * useSubscription - Freemium tier and quota logic
 *
 * Reads subscription_tier from user_profiles.preferences JSONB (no DB migration needed).
 * No Stripe wired yet — this is the single gate source so payments bolt on cleanly.
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export type SubscriptionTierName = 'free' | 'pro' | 'founding';

const FREE_WIZARD_SESSIONS_PER_DAY = 5;

// Wizards behind Pro gate
export const PREMIUM_WIZARD_IDS = [
  'psychedelic-journey',
  'sexology-coach',
] as const;

export interface SubscriptionState {
  tier: SubscriptionTierName;
  isProOrAbove: boolean;
  isFounding: boolean;
  /** Sessions used today (from preferences) */
  sessionsUsedToday: number;
  /** Remaining wizard sessions today (null = unlimited) */
  sessionsRemaining: number | null;
  canRunWizard: () => boolean;
  canUseIntelligenceHub: () => boolean;
  canExportJournal: () => boolean;
  isPremiumWizard: (wizardId: string) => boolean;
  /** Call on wizard completion to increment daily counter */
  recordWizardSession: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();

  const tier: SubscriptionTierName = useMemo(() => {
    // Check if admin first — admins get founding tier
    if ((user as any)?.isAdmin) return 'founding';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefs = (user as any)?.preferences as Record<string, any> | undefined;
    const t = prefs?.subscription_tier;
    if (t === 'pro' || t === 'founding') return t;
    return 'free';
  }, [user]);

  const sessionsUsedToday: number = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefs = (user as any)?.preferences as Record<string, any> | undefined;
    return Number(prefs?.wizard_session_count) || 0;
  }, [user]);

  const isProOrAbove = tier === 'pro' || tier === 'founding';
  const isFounding = tier === 'founding';
  const sessionsRemaining = isProOrAbove
    ? null
    : Math.max(0, FREE_WIZARD_SESSIONS_PER_DAY - sessionsUsedToday);

  const canRunWizard = () =>
    isProOrAbove || sessionsUsedToday < FREE_WIZARD_SESSIONS_PER_DAY;

  const canUseIntelligenceHub = () => isProOrAbove;
  const canExportJournal = () => isProOrAbove;

  const isPremiumWizard = (wizardId: string) =>
    (PREMIUM_WIZARD_IDS as readonly string[]).includes(wizardId);

  const recordWizardSession = async () => {
    if (!user) return;
    await authService.updateProfile({
      preferences: { wizard_session_count: sessionsUsedToday + 1 },
    } as any);
  };

  return {
    tier,
    isProOrAbove,
    isFounding,
    sessionsUsedToday,
    sessionsRemaining,
    canRunWizard,
    canUseIntelligenceHub,
    canExportJournal,
    isPremiumWizard,
    recordWizardSession,
  };
}
