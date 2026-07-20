export const TIER_LIMITS = {
  free: {
    wizardSessionsPerMonth: 10,
    hubAnalysesPerMonth: 3,
    coachMessagesPerDay: 10,
  },
  premium: {
    wizardSessionsPerMonth: Infinity,
    hubAnalysesPerMonth: Infinity,
    coachMessagesPerDay: Infinity,
  },
  anonymous: {
    aiCallsPerDay: 3,
  },
} as const;

export type Tier = 'anonymous' | 'free' | 'premium' | 'trialing';
