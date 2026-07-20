// services/featureFlagService.ts
// Pure TypeScript — no Supabase or external imports. Testable and fast.

export type SubscriptionTier = 'free' | 'premium';

export type Feature =
  | 'wizard_access_basic'       // 5 free wizards
  | 'wizard_access_all'         // all 36+ wizards
  | 'insights_limited'          // last 20 insights
  | 'insights_unlimited'        // unlimited insights
  | 'intelligence_hub_limited'  // 3 requests/month
  | 'intelligence_hub_unlimited'
  | 'cross_modal_analysis'
  | 'predictive_alerts'
  | 'export_json'
  | 'export_pdf'
  | 'coach_basic'
  | 'coach_full'
  | 'forum_read'
  | 'forum_write';

// Which wizards are available on free tier (5 most accessible)
export const FREE_WIZARDS = [
  'meditation',
  'ifs',
  'shadow-journaling',
  'decision-wizard',
  'contemplative-inquiry',
] as const;

export type FreeWizardId = typeof FREE_WIZARDS[number];

// TIER_FEATURES: maps each tier to its set of enabled features
export const TIER_FEATURES: Record<SubscriptionTier, Feature[]> = {
  free: [
    'wizard_access_basic',
    'insights_limited',
    'intelligence_hub_limited',
    'export_json',
    'coach_basic',
    'forum_read',
  ],
  premium: [
    'wizard_access_basic',
    'wizard_access_all',
    'insights_limited',
    'insights_unlimited',
    'intelligence_hub_limited',
    'intelligence_hub_unlimited',
    'cross_modal_analysis',
    'predictive_alerts',
    'export_json',
    'export_pdf',
    'coach_basic',
    'coach_full',
    'forum_read',
    'forum_write',
  ],
};

// TIER_LIMITS: numeric limits per tier
export interface TierLimits {
  maxLlmCallsPerMonth: number;
  maxInsightsStored: number;
  maxWizards: number; // -1 = unlimited
  maxGuidanceRequestsPerMonth: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxLlmCallsPerMonth: 3,
    maxInsightsStored: 20,
    maxWizards: 5,
    maxGuidanceRequestsPerMonth: 3,
  },
  premium: {
    maxLlmCallsPerMonth: 999_999,
    maxInsightsStored: 999_999,
    maxWizards: -1,
    maxGuidanceRequestsPerMonth: 999_999,
  },
};

const UPGRADE_REASONS: Partial<Record<Feature, string>> = {
  wizard_access_all: 'Upgrade to Premium to access all 36+ wizards',
  insights_unlimited: 'Upgrade to Premium for unlimited insight storage',
  intelligence_hub_unlimited: 'Upgrade to Premium for unlimited Intelligence Hub requests',
  cross_modal_analysis: 'Upgrade to Premium to unlock cross-modal analysis',
  predictive_alerts: 'Upgrade to Premium to enable predictive alerts',
  export_pdf: 'Upgrade to Premium to export as PDF',
  coach_full: 'Upgrade to Premium for full AI Coach capabilities',
  forum_write: 'Upgrade to Premium to post in the community forum',
};

/**
 * Returns true if the given tier has the specified feature enabled.
 */
export function isFeatureEnabled(tier: SubscriptionTier, feature: Feature): boolean {
  return TIER_FEATURES[tier].includes(feature);
}

/**
 * Returns true if the wizard is accessible for the given tier.
 * Free tier: only FREE_WIZARDS list. Premium: all wizards.
 */
export function isWizardAccessible(tier: SubscriptionTier, wizardId: string): boolean {
  if (tier === 'premium') return true;
  return (FREE_WIZARDS as readonly string[]).includes(wizardId);
}

/**
 * Returns true if the current usage has reached or exceeded the tier limit.
 * A limit of -1 means unlimited (always returns false).
 */
export function hasReachedLimit(
  tier: SubscriptionTier,
  limitKey: keyof TierLimits,
  currentUsage: number,
): boolean {
  const limit = TIER_LIMITS[tier][limitKey];
  if (limit === -1) return false;
  return currentUsage >= limit;
}

/**
 * Returns a human-readable upgrade reason if the feature requires an upgrade,
 * or null if the feature is already available on the current tier.
 */
export function getUpgradeReason(tier: SubscriptionTier, feature: Feature): string | null {
  if (isFeatureEnabled(tier, feature)) return null;
  return UPGRADE_REASONS[feature] ?? 'Upgrade to Premium to unlock this feature';
}

/**
 * Derives the SubscriptionTier from a user subscription object.
 * Defaults to 'free' if subscription is null or tier_id is unrecognized.
 */
export function getTierForUser(
  userSubscription: { tier_id: string } | null,
): SubscriptionTier {
  if (!userSubscription) return 'free';
  const { tier_id } = userSubscription;
  if (tier_id === 'premium') return 'premium';
  return 'free';
}
