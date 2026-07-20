/**
 * Recommendation Learning Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageManager } from '../../.claude/lib/storageManager';
import {
  recordRecommendationFeedback,
  getAllFeedback,
  getFeedbackForRecommendation,
  updateFeedbackOutcome,
  calculateAccuracyStats,
  adjustConfidenceBasedOnHistory,
  getPersonalizedInsights,
  generateFeedbackId,
  clearAllFeedback,
  type RecommendationFeedback,
} from '../recommendationLearning';

describe('Recommendation Learning Service', () => {
  beforeEach(() => {
    clearAllFeedback();
    StorageManager.clearAll();
  });

  afterEach(() => {
    clearAllFeedback();
  });

  const createMockFeedback = (overrides: Partial<RecommendationFeedback> = {}): RecommendationFeedback => ({
    id: generateFeedbackId(),
    recommendationId: 'rec-123',
    type: 'wizard',
    recommendedItem: 'IFSWizard',
    userAction: 'accepted',
    timestamp: new Date().toISOString(),
    context: {
      userConfidence: 0.8,
      userDataVolume: 10,
      recommendationReason: 'Test reason',
    },
    ...overrides,
  });

  describe('recordRecommendationFeedback', () => {
    it('should save feedback to localStorage', () => {
      const feedback = createMockFeedback();
      recordRecommendationFeedback(feedback);

      const stored = getAllFeedback();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(feedback.id);
    });

    it('should append to existing feedback', () => {
      const feedback1 = createMockFeedback({ id: 'feedback-1' });
      const feedback2 = createMockFeedback({ id: 'feedback-2' });

      recordRecommendationFeedback(feedback1);
      recordRecommendationFeedback(feedback2);

      const stored = getAllFeedback();
      expect(stored).toHaveLength(2);
    });
  });

  describe('getFeedbackForRecommendation', () => {
    it('should filter feedback by recommendation ID', () => {
      const feedback1 = createMockFeedback({ recommendationId: 'rec-1' });
      const feedback2 = createMockFeedback({ recommendationId: 'rec-2' });
      const feedback3 = createMockFeedback({ recommendationId: 'rec-1' });

      recordRecommendationFeedback(feedback1);
      recordRecommendationFeedback(feedback2);
      recordRecommendationFeedback(feedback3);

      const filtered = getFeedbackForRecommendation('rec-1');
      expect(filtered).toHaveLength(2);
    });
  });

  describe('updateFeedbackOutcome', () => {
    it('should update outcome for existing feedback', () => {
      const feedback = createMockFeedback();
      recordRecommendationFeedback(feedback);

      const outcome: RecommendationFeedback['outcome'] = {
        quality: 'very_helpful',
        completionCount: 10,
        patternImprovement: 'improved',
      };

      updateFeedbackOutcome(feedback.id, outcome);

      const updated = getAllFeedback()[0];
      expect(updated.outcome).toEqual(outcome);
    });
  });

  describe('calculateAccuracyStats', () => {
    it('should return zero stats for empty feedback', () => {
      const stats = calculateAccuracyStats([]);

      expect(stats.totalRecommendations).toBe(0);
      expect(stats.acceptanceRate).toBe(0);
    });

    it('should calculate acceptance rate correctly', () => {
      const feedbackList = [
        createMockFeedback({ userAction: 'accepted' }),
        createMockFeedback({ userAction: 'rejected' }),
        createMockFeedback({ userAction: 'accepted' }),
        createMockFeedback({ userAction: 'dismissed' }),
      ];

      feedbackList.forEach(f => recordRecommendationFeedback(f));

      const stats = calculateAccuracyStats();

      expect(stats.totalRecommendations).toBe(4);
      expect(stats.acceptanceRate).toBe(0.5); // 2 accepted out of 4
    });

    it('should calculate completion rate correctly', () => {
      const feedbackList = [
        createMockFeedback({ userAction: 'accepted' }),
        createMockFeedback({ userAction: 'completed' }),
        createMockFeedback({ userAction: 'completed' }),
      ];

      feedbackList.forEach(f => recordRecommendationFeedback(f));

      const stats = calculateAccuracyStats();

      expect(stats.completionRate).toBeCloseTo(2 / 3); // 2 completed out of 3 accepted
    });

    it('should calculate helpfulness rate correctly', () => {
      const feedbackList = [
        createMockFeedback({
          userAction: 'completed',
          outcome: { quality: 'very_helpful' },
        }),
        createMockFeedback({
          userAction: 'completed',
          outcome: { quality: 'helpful' },
        }),
        createMockFeedback({
          userAction: 'completed',
          outcome: { quality: 'not_helpful' },
        }),
      ];

      feedbackList.forEach(f => recordRecommendationFeedback(f));

      const stats = calculateAccuracyStats();

      expect(stats.helpfulnessRate).toBeCloseTo(2 / 3); // 2 helpful out of 3 with quality
    });

    it('should calculate stats by type', () => {
      const feedbackList = [
        createMockFeedback({ type: 'wizard', userAction: 'accepted' }),
        createMockFeedback({ type: 'wizard', userAction: 'accepted' }),
        createMockFeedback({ type: 'practice_add', userAction: 'rejected' }),
      ];

      feedbackList.forEach(f => recordRecommendationFeedback(f));

      const stats = calculateAccuracyStats();

      expect(stats.byType.wizard.total).toBe(2);
      expect(stats.byType.wizard.acceptanceRate).toBe(1.0);
      expect(stats.byType.practice_add.total).toBe(1);
      expect(stats.byType.practice_add.acceptanceRate).toBe(0);
    });

    it('should calculate confidence calibration', () => {
      const feedbackList = [
        createMockFeedback({
          userAction: 'accepted',
          context: { userConfidence: 0.9, userDataVolume: 10, recommendationReason: 'test' },
        }),
        createMockFeedback({
          userAction: 'rejected',
          context: { userConfidence: 0.9, userDataVolume: 10, recommendationReason: 'test' },
        }),
        createMockFeedback({
          userAction: 'accepted',
          context: { userConfidence: 0.6, userDataVolume: 5, recommendationReason: 'test' },
        }),
      ];

      feedbackList.forEach(f => recordRecommendationFeedback(f));

      const stats = calculateAccuracyStats();

      expect(stats.confidenceCalibration.highConfidence.total).toBe(2);
      expect(stats.confidenceCalibration.highConfidence.successRate).toBe(0.5);
      expect(stats.confidenceCalibration.mediumConfidence.total).toBe(1);
      expect(stats.confidenceCalibration.mediumConfidence.successRate).toBe(1.0);
    });
  });

  describe('adjustConfidenceBasedOnHistory', () => {
    it('should return base confidence when insufficient data', () => {
      const adjusted = adjustConfidenceBasedOnHistory(0.7, 'wizard');

      expect(adjusted).toBe(0.7);
    });

    it('should boost confidence for high acceptance rate', () => {
      // Create 10 accepted wizard recommendations
      for (let i = 0; i < 10; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            userAction: 'accepted',
            outcome: { quality: 'very_helpful' },
          })
        );
      }

      const adjusted = adjustConfidenceBasedOnHistory(0.6, 'wizard');

      expect(adjusted).toBeGreaterThan(0.6);
    });

    it('should reduce confidence for low acceptance rate', () => {
      // Create 10 rejected wizard recommendations
      for (let i = 0; i < 10; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            userAction: 'rejected',
            outcome: { quality: 'not_helpful' },
          })
        );
      }

      const adjusted = adjustConfidenceBasedOnHistory(0.7, 'wizard');

      expect(adjusted).toBeLessThan(0.7);
    });

    it('should boost confidence for item-specific success', () => {
      // Create history where IFSWizard is always accepted
      for (let i = 0; i < 5; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            recommendedItem: 'IFSWizard',
            userAction: 'accepted',
          })
        );
      }

      const adjusted = adjustConfidenceBasedOnHistory(0.6, 'wizard', 'IFSWizard');

      expect(adjusted).toBeGreaterThan(0.6);
    });

    it('should reduce confidence for item-specific failure', () => {
      // Create history where BiasDetective is always rejected
      for (let i = 0; i < 5; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            recommendedItem: 'BiasDetective',
            userAction: 'rejected',
          })
        );
      }

      const adjusted = adjustConfidenceBasedOnHistory(0.7, 'wizard', 'BiasDetective');

      expect(adjusted).toBeLessThan(0.7);
    });

    it('should clamp adjusted confidence to valid range', () => {
      // Create scenario that would push confidence very high
      for (let i = 0; i < 20; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            userAction: 'accepted',
            outcome: { quality: 'very_helpful' },
          })
        );
      }

      const adjusted = adjustConfidenceBasedOnHistory(0.9, 'wizard');

      expect(adjusted).toBeLessThanOrEqual(0.95);
      expect(adjusted).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('getPersonalizedInsights', () => {
    it('should return building profile message with insufficient data', () => {
      const insights = getPersonalizedInsights();

      expect(insights).toHaveLength(1);
      expect(insights[0]).toContain('Building your recommendation profile');
    });

    it('should provide acceptance rate insights', () => {
      // Create 10 recommendations with 80% acceptance
      for (let i = 0; i < 8; i++) {
        recordRecommendationFeedback(createMockFeedback({ userAction: 'accepted' }));
      }
      for (let i = 0; i < 2; i++) {
        recordRecommendationFeedback(createMockFeedback({ userAction: 'rejected' }));
      }

      const insights = getPersonalizedInsights();

      expect(insights.some(i => i.includes('80%'))).toBe(true);
      expect(insights.some(i => i.includes('learning your preferences'))).toBe(true);
    });

    it('should provide type-specific insights', () => {
      // Create highly successful wizard recommendations
      for (let i = 0; i < 5; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            type: 'wizard',
            userAction: 'accepted',
          })
        );
      }

      const insights = getPersonalizedInsights();

      expect(insights.some(i => i.includes('Wizard recommendations'))).toBe(true);
    });

    it('should provide confidence calibration insights', () => {
      // Create many high-confidence successful recommendations
      for (let i = 0; i < 10; i++) {
        recordRecommendationFeedback(
          createMockFeedback({
            userAction: 'accepted',
            context: {
              userConfidence: 0.9,
              userDataVolume: 10,
              recommendationReason: 'test',
            },
          })
        );
      }

      const insights = getPersonalizedInsights();

      expect(insights.some(i => i.includes('High-confidence'))).toBe(true);
    });
  });

  describe('generateFeedbackId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateFeedbackId();
      const id2 = generateFeedbackId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^feedback-/);
    });
  });
});
