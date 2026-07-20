import { describe, it, expect } from 'vitest';
import {
  isFeatureEnabled,
  isWizardAccessible,
  hasReachedLimit,
  getUpgradeReason,
  getTierForUser,
  FREE_WIZARDS,
} from '../featureFlagService';

describe('isFeatureEnabled', () => {
  it('free tier has forum_read', () => {
    expect(isFeatureEnabled('free', 'forum_read')).toBe(true);
  });

  it('free tier does NOT have forum_write', () => {
    expect(isFeatureEnabled('free', 'forum_write')).toBe(false);
  });

  it('free tier does NOT have wizard_access_all', () => {
    expect(isFeatureEnabled('free', 'wizard_access_all')).toBe(false);
  });

  it('premium tier has wizard_access_all', () => {
    expect(isFeatureEnabled('premium', 'wizard_access_all')).toBe(true);
  });

  it('premium tier has coach_full', () => {
    expect(isFeatureEnabled('premium', 'coach_full')).toBe(true);
  });

  it('premium tier has export_pdf', () => {
    expect(isFeatureEnabled('premium', 'export_pdf')).toBe(true);
  });

  it('premium tier has all free features plus more', () => {
    expect(isFeatureEnabled('premium', 'forum_read')).toBe(true);
    expect(isFeatureEnabled('premium', 'export_json')).toBe(true);
    expect(isFeatureEnabled('premium', 'coach_basic')).toBe(true);
  });
});

describe('isWizardAccessible', () => {
  it('free tier can access a free wizard', () => {
    expect(isWizardAccessible('free', 'meditation')).toBe(true);
    expect(isWizardAccessible('free', 'ifs')).toBe(true);
    expect(isWizardAccessible('free', 'shadow-journaling')).toBe(true);
    expect(isWizardAccessible('free', 'decision-wizard')).toBe(true);
    expect(isWizardAccessible('free', 'contemplative-inquiry')).toBe(true);
  });

  it('free tier blocks non-free wizards', () => {
    expect(isWizardAccessible('free', 'polarity-mapper')).toBe(false);
    expect(isWizardAccessible('free', 'kegan-assessment')).toBe(false);
    expect(isWizardAccessible('free', 'jhana-tracker')).toBe(false);
    expect(isWizardAccessible('free', 'bioenergetics')).toBe(false);
  });

  it('premium tier can access any wizard', () => {
    expect(isWizardAccessible('premium', 'meditation')).toBe(true);
    expect(isWizardAccessible('premium', 'polarity-mapper')).toBe(true);
    expect(isWizardAccessible('premium', 'jhana-tracker')).toBe(true);
    expect(isWizardAccessible('premium', 'some-future-wizard')).toBe(true);
  });

  it('FREE_WIZARDS list has exactly 5 entries', () => {
    expect(FREE_WIZARDS.length).toBe(5);
  });
});

describe('hasReachedLimit', () => {
  it('returns false when usage is below the limit', () => {
    expect(hasReachedLimit('free', 'maxLlmCallsPerMonth', 2)).toBe(false);
    expect(hasReachedLimit('free', 'maxInsightsStored', 0)).toBe(false);
    expect(hasReachedLimit('free', 'maxGuidanceRequestsPerMonth', 1)).toBe(false);
  });

  it('returns true when usage equals the limit', () => {
    expect(hasReachedLimit('free', 'maxLlmCallsPerMonth', 3)).toBe(true);
    expect(hasReachedLimit('free', 'maxInsightsStored', 20)).toBe(true);
    expect(hasReachedLimit('free', 'maxGuidanceRequestsPerMonth', 3)).toBe(true);
    expect(hasReachedLimit('free', 'maxWizards', 5)).toBe(true);
  });

  it('returns true when usage exceeds the limit', () => {
    expect(hasReachedLimit('free', 'maxLlmCallsPerMonth', 10)).toBe(true);
    expect(hasReachedLimit('free', 'maxInsightsStored', 100)).toBe(true);
  });

  it('premium tier with -1 (unlimited maxWizards) always returns false', () => {
    expect(hasReachedLimit('premium', 'maxWizards', 9999)).toBe(false);
    // maxLlmCallsPerMonth for premium is 999_999; usage below that is not at limit
    expect(hasReachedLimit('premium', 'maxLlmCallsPerMonth', 1000)).toBe(false);
  });

  it('premium numeric limits behave correctly', () => {
    // 999_999 is the cap but usage below it should return false
    expect(hasReachedLimit('premium', 'maxInsightsStored', 500)).toBe(false);
  });
});

describe('getUpgradeReason', () => {
  it('returns null when feature is already available', () => {
    expect(getUpgradeReason('free', 'forum_read')).toBeNull();
    expect(getUpgradeReason('free', 'coach_basic')).toBeNull();
    expect(getUpgradeReason('premium', 'forum_write')).toBeNull();
    expect(getUpgradeReason('premium', 'export_pdf')).toBeNull();
  });

  it('returns a string when feature requires upgrade', () => {
    const reason = getUpgradeReason('free', 'forum_write');
    expect(typeof reason).toBe('string');
    expect(reason!.length).toBeGreaterThan(0);
  });

  it('returns specific upgrade message for wizard_access_all', () => {
    const reason = getUpgradeReason('free', 'wizard_access_all');
    expect(reason).toContain('Premium');
    expect(reason).toContain('wizard');
  });

  it('returns specific upgrade message for export_pdf', () => {
    const reason = getUpgradeReason('free', 'export_pdf');
    expect(reason).toContain('Premium');
    expect(reason).toContain('PDF');
  });

  it('returns specific upgrade message for forum_write', () => {
    const reason = getUpgradeReason('free', 'forum_write');
    expect(reason).toContain('Premium');
  });

  it('returns a fallback string for features with no specific message', () => {
    // cross_modal_analysis has a specific message, but coach_full is an example
    const reason = getUpgradeReason('free', 'coach_full');
    expect(reason).not.toBeNull();
    expect(typeof reason).toBe('string');
  });
});

describe('getTierForUser', () => {
  it('returns free when subscription is null', () => {
    expect(getTierForUser(null)).toBe('free');
  });

  it('returns free when tier_id is unknown', () => {
    expect(getTierForUser({ tier_id: 'enterprise' })).toBe('free');
    expect(getTierForUser({ tier_id: '' })).toBe('free');
    expect(getTierForUser({ tier_id: 'basic' })).toBe('free');
  });

  it('returns premium when tier_id is premium', () => {
    expect(getTierForUser({ tier_id: 'premium' })).toBe('premium');
  });

  it('returns free when tier_id is free', () => {
    expect(getTierForUser({ tier_id: 'free' })).toBe('free');
  });
});
