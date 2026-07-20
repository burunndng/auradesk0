/**
 * Recommendation Learning Service
 *
 * Tracks user actions on Intelligence Hub recommendations and learns from outcomes.
 * Adjusts confidence scoring based on historical accuracy of recommendations.
 * Enables the Intelligence Hub to become more personalized over time.
 */

import type { IntelligentGuidance } from '../types';
import { StorageManager } from '../.claude/lib/storageManager';

export type RecommendationType = 'wizard' | 'practice_add' | 'practice_remove' | 'practice_modify';
export type UserAction = 'accepted' | 'rejected' | 'completed' | 'abandoned' | 'dismissed';
export type OutcomeQuality = 'very_helpful' | 'helpful' | 'neutral' | 'not_helpful' | 'harmful';

export interface RecommendationFeedback {
  id: string;
  recommendationId: string; // Links to the guidance generatedAt timestamp
  type: RecommendationType;
  recommendedItem: string; // Wizard type or practice ID
  userAction: UserAction;
  timestamp: string;

  // Optional outcome tracking (filled in after some time)
  outcome?: {
    quality: OutcomeQuality;
    completionCount?: number; // For practices: how many times completed
    patternImprovement?: 'improved' | 'stable' | 'worsened' | 'unknown';
    userNotes?: string;
    followUpSessions?: string[]; // Related wizard session IDs
  };

  // Context at time of recommendation
  context?: {
    userConfidence: number; // How confident the AI was
    userDataVolume: number; // Number of sessions at time of recommendation
    recommendationReason: string; // Why it was recommended
  };
}

export interface RecommendationAccuracyStats {
  totalRecommendations: number;
  acceptanceRate: number; // % accepted
  completionRate: number; // % accepted then completed
  helpfulnessRate: number; // % rated helpful or very_helpful

  // By type
  byType: Record<RecommendationType, {
    total: number;
    acceptanceRate: number;
    completionRate: number;
    avgQuality: number; // 0-1 score based on OutcomeQuality
  }>;

  // Confidence calibration
  confidenceCalibration: {
    highConfidence: { total: number; successRate: number }; // >= 0.75
    mediumConfidence: { total: number; successRate: number }; // 0.5-0.75
    lowConfidence: { total: number; successRate: number }; // < 0.5
  };
}

const FEEDBACK_STORAGE_KEY = 'recommendationFeedbackHistory';

/**
 * Save recommendation feedback to localStorage
 */
export function recordRecommendationFeedback(feedback: RecommendationFeedback): void {
  try {
    const existing = getAllFeedback();
    existing.push(feedback);

    StorageManager.setUntyped(FEEDBACK_STORAGE_KEY, existing);
    console.log(`[RecommendationLearning] Recorded feedback:`, feedback.type, feedback.userAction);
  } catch (error) {
    console.error('[RecommendationLearning] Failed to record feedback:', error);
  }
}

/**
 * Get all recommendation feedback from localStorage
 */
export function getAllFeedback(): RecommendationFeedback[] {
  try {
    const stored = StorageManager.getUntyped(FEEDBACK_STORAGE_KEY);
    if (!stored) return [];

    return stored as RecommendationFeedback[];
  } catch (error) {
    console.warn('[RecommendationLearning] Failed to load feedback:', error);
    return [];
  }
}

/**
 * Get feedback for a specific recommendation
 */
export function getFeedbackForRecommendation(recommendationId: string): RecommendationFeedback[] {
  return getAllFeedback().filter(f => f.recommendationId === recommendationId);
}

/**
 * Update existing feedback with outcome data
 */
export function updateFeedbackOutcome(
  feedbackId: string,
  outcome: RecommendationFeedback['outcome']
): void {
  try {
    const allFeedback = getAllFeedback();
    const index = allFeedback.findIndex(f => f.id === feedbackId);

    if (index !== -1) {
      allFeedback[index].outcome = outcome;
      StorageManager.setUntyped(FEEDBACK_STORAGE_KEY, allFeedback);
      console.log(`[RecommendationLearning] Updated outcome for feedback ${feedbackId}`);
    }
  } catch (error) {
    console.error('[RecommendationLearning] Failed to update outcome:', error);
  }
}

/**
 * Calculate recommendation accuracy statistics
 */
export function calculateAccuracyStats(
  feedbackList?: RecommendationFeedback[]
): RecommendationAccuracyStats {
  const feedback = feedbackList || getAllFeedback();

  if (feedback.length === 0) {
    return {
      totalRecommendations: 0,
      acceptanceRate: 0,
      completionRate: 0,
      helpfulnessRate: 0,
      byType: {
        wizard: { total: 0, acceptanceRate: 0, completionRate: 0, avgQuality: 0 },
        practice_add: { total: 0, acceptanceRate: 0, completionRate: 0, avgQuality: 0 },
        practice_remove: { total: 0, acceptanceRate: 0, completionRate: 0, avgQuality: 0 },
        practice_modify: { total: 0, acceptanceRate: 0, completionRate: 0, avgQuality: 0 },
      },
      confidenceCalibration: {
        highConfidence: { total: 0, successRate: 0 },
        mediumConfidence: { total: 0, successRate: 0 },
        lowConfidence: { total: 0, successRate: 0 },
      },
    };
  }

  const accepted = feedback.filter(f => f.userAction === 'accepted' || f.userAction === 'completed');
  const completed = feedback.filter(f => f.userAction === 'completed');
  const withQuality = feedback.filter(f => f.outcome?.quality);
  const helpful = withQuality.filter(f =>
    f.outcome?.quality === 'helpful' || f.outcome?.quality === 'very_helpful'
  );

  const acceptanceRate = accepted.length / feedback.length;
  const completionRate = completed.length / accepted.length || 0;
  const helpfulnessRate = withQuality.length > 0 ? helpful.length / withQuality.length : 0;

  // By type
  const types: RecommendationType[] = ['wizard', 'practice_add', 'practice_remove', 'practice_modify'];
  const byType: RecommendationAccuracyStats['byType'] = {} as any;

  for (const type of types) {
    const typeFeedback = feedback.filter(f => f.type === type);
    const typeAccepted = typeFeedback.filter(f => f.userAction === 'accepted' || f.userAction === 'completed');
    const typeCompleted = typeFeedback.filter(f => f.userAction === 'completed');
    const typeWithQuality = typeFeedback.filter(f => f.outcome?.quality);

    const qualityScore = typeWithQuality.reduce((sum, f) => {
      const quality = f.outcome!.quality;
      const scoreMap: Record<OutcomeQuality, number> = {
        very_helpful: 1.0,
        helpful: 0.75,
        neutral: 0.5,
        not_helpful: 0.25,
        harmful: 0,
      };
      return sum + scoreMap[quality];
    }, 0) / (typeWithQuality.length || 1);

    byType[type] = {
      total: typeFeedback.length,
      acceptanceRate: typeFeedback.length > 0 ? typeAccepted.length / typeFeedback.length : 0,
      completionRate: typeAccepted.length > 0 ? typeCompleted.length / typeAccepted.length : 0,
      avgQuality: qualityScore,
    };
  }

  // Confidence calibration
  const highConf = feedback.filter(f => (f.context?.userConfidence || 0) >= 0.75);
  const medConf = feedback.filter(f => {
    const conf = f.context?.userConfidence || 0;
    return conf >= 0.5 && conf < 0.75;
  });
  const lowConf = feedback.filter(f => (f.context?.userConfidence || 0) < 0.5);

  const calcSuccessRate = (list: RecommendationFeedback[]) => {
    if (list.length === 0) return 0;
    const successful = list.filter(f =>
      f.userAction === 'accepted' || f.userAction === 'completed' ||
      (f.outcome?.quality === 'helpful' || f.outcome?.quality === 'very_helpful')
    );
    return successful.length / list.length;
  };

  return {
    totalRecommendations: feedback.length,
    acceptanceRate,
    completionRate,
    helpfulnessRate,
    byType,
    confidenceCalibration: {
      highConfidence: { total: highConf.length, successRate: calcSuccessRate(highConf) },
      mediumConfidence: { total: medConf.length, successRate: calcSuccessRate(medConf) },
      lowConfidence: { total: lowConf.length, successRate: calcSuccessRate(lowConf) },
    },
  };
}

/**
 * Adjust confidence score based on historical accuracy
 *
 * If the Intelligence Hub has historically been accurate for this type of recommendation,
 * boost confidence. If historically inaccurate, reduce confidence.
 */
export function adjustConfidenceBasedOnHistory(
  baseConfidence: number,
  recommendationType: RecommendationType,
  recommendedItem?: string
): number {
  const feedback = getAllFeedback();

  if (feedback.length < 5) {
    // Not enough data to adjust
    return baseConfidence;
  }

  const stats = calculateAccuracyStats(feedback);
  const typeStats = stats.byType[recommendationType];

  if (typeStats.total < 3) {
    // Not enough data for this type
    return baseConfidence;
  }

  // Calculate adjustment factor based on historical success
  let adjustmentFactor = 1.0;

  // Factor 1: Type-specific acceptance rate
  if (typeStats.acceptanceRate >= 0.8) {
    adjustmentFactor += 0.1; // High acceptance = boost confidence
  } else if (typeStats.acceptanceRate <= 0.4) {
    adjustmentFactor -= 0.15; // Low acceptance = reduce confidence
  }

  // Factor 2: Type-specific quality
  if (typeStats.avgQuality >= 0.75) {
    adjustmentFactor += 0.1; // High quality = boost confidence
  } else if (typeStats.avgQuality <= 0.4) {
    adjustmentFactor -= 0.1; // Low quality = reduce confidence
  }

  // Factor 3: Item-specific history (if provided)
  if (recommendedItem) {
    const itemFeedback = feedback.filter(f => f.recommendedItem === recommendedItem);
    if (itemFeedback.length >= 2) {
      const itemSuccessRate = itemFeedback.filter(f =>
        f.userAction === 'accepted' || f.userAction === 'completed'
      ).length / itemFeedback.length;

      if (itemSuccessRate >= 0.8) {
        adjustmentFactor += 0.15; // This specific item works well for user
      } else if (itemSuccessRate <= 0.3) {
        adjustmentFactor -= 0.2; // User doesn't respond well to this item
      }
    }
  }

  // Apply adjustment
  const adjustedConfidence = baseConfidence * adjustmentFactor;

  // Clamp to valid range
  return Math.max(0.1, Math.min(0.95, adjustedConfidence));
}

/**
 * Get personalized insights from recommendation history
 */
export function getPersonalizedInsights(): string[] {
  const stats = calculateAccuracyStats();
  const insights: string[] = [];

  if (stats.totalRecommendations < 5) {
    insights.push("Building your recommendation profile. Keep engaging with suggestions!");
    return insights;
  }

  // Acceptance rate insights
  if (stats.acceptanceRate >= 0.7) {
    insights.push(`You've accepted ${Math.round(stats.acceptanceRate * 100)}% of recommendations. The Intelligence Hub is learning your preferences well.`);
  } else if (stats.acceptanceRate <= 0.3) {
    insights.push(`You've accepted ${Math.round(stats.acceptanceRate * 100)}% of recommendations. Consider providing feedback to help improve future suggestions.`);
  }

  // Type-specific insights
  if (stats.byType.wizard.acceptanceRate >= 0.8 && stats.byType.wizard.total >= 3) {
    insights.push(`Wizard recommendations have been particularly accurate for you (${Math.round(stats.byType.wizard.acceptanceRate * 100)}% acceptance rate).`);
  }

  if (stats.byType.practice_add.acceptanceRate >= 0.7 && stats.byType.practice_add.total >= 3) {
    insights.push(`Practice additions have been well-received (${Math.round(stats.byType.practice_add.acceptanceRate * 100)}% acceptance rate).`);
  }

  // Confidence calibration insights
  const { highConfidence, mediumConfidence } = stats.confidenceCalibration;

  if (highConfidence.total >= 5 && highConfidence.successRate >= 0.85) {
    insights.push(`High-confidence recommendations have been ${Math.round(highConfidence.successRate * 100)}% successful. Trust them!`);
  }

  if (mediumConfidence.total >= 5 && mediumConfidence.successRate <= 0.4) {
    insights.push(`Medium-confidence recommendations haven't been hitting the mark. We're recalibrating.`);
  }

  // Completion insights
  if (stats.completionRate >= 0.6) {
    insights.push(`You complete ${Math.round(stats.completionRate * 100)}% of accepted recommendations. Excellent follow-through!`);
  }

  return insights;
}

/**
 * Generate a unique feedback ID
 */
export function generateFeedbackId(): string {
  return `feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Clear all recommendation feedback (for testing or reset)
 */
export function clearAllFeedback(): void {
  StorageManager.delete(FEEDBACK_STORAGE_KEY);
  console.log('[RecommendationLearning] Cleared all feedback');
}
