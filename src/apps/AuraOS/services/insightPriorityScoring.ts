/**
 * Insight Priority Scoring Service
 *
 * Calculates priority scores for IntegratedInsights based on:
 * - Age (freshness vs staleness)
 * - Recent activity (wizard sessions, practice completions)
 * - Pattern persistence (recurring vs one-time)
 * - User engagement (how often user works with this pattern)
 */

import type { IntegratedInsight } from '../types';

export type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'stale';

export interface InsightPriorityResult {
  priority: InsightPriority;
  score: number; // 0-100
  reason: string;
  ageInDays: number;
  recentWorkCount: number;
  shouldArchive: boolean;
}

/**
 * Calculate days since a date string
 */
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Count recent wizard sessions related to this insight
 */
function countRecentRelatedWork(
  insight: IntegratedInsight,
  recentSessions: any[], // Wizard sessions from last 30 days
): number {
  // Count sessions that:
  // 1. Have linkedInsightId matching this insight
  // 2. Are same wizard type as the insight
  // 3. Mention similar patterns in their summaries

  let count = 0;

  for (const session of recentSessions) {
    // Direct link
    if (session.data?.linkedInsightId === insight.id) {
      count++;
      continue;
    }

    // Same wizard type (user is still working in this modality)
    if (session.type === insight.mindToolType) {
      count += 0.5; // Half weight for same type without direct link
    }

    // Pattern similarity (check if insight pattern appears in session summary)
    if (session.aiSummary || session.summary) {
      const summaryText = (session.aiSummary || session.summary).toLowerCase();
      const patternKeywords = insight.detectedPattern.toLowerCase().split(' ').filter(w => w.length > 4);

      const matchCount = patternKeywords.filter(keyword => summaryText.includes(keyword)).length;
      if (matchCount >= 2) {
        count += 0.3; // Partial weight for pattern similarity
      }
    }
  }

  return Math.round(count * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate priority score for an insight
 */
export function calculateInsightPriority(
  insight: IntegratedInsight,
  recentSessions: any[] = [], // Last 30 days of wizard sessions
): InsightPriorityResult {
  const ageInDays = daysSince(insight.dateCreated);
  const recentWorkCount = countRecentRelatedWork(insight, recentSessions);

  // Base score starts at 50
  let score = 50;

  // AGE FACTOR: Freshness vs Staleness
  if (ageInDays <= 7) {
    score += 30; // Very fresh, boost priority
  } else if (ageInDays <= 30) {
    score += 20; // Fresh, moderate boost
  } else if (ageInDays <= 60) {
    score += 10; // Recent, slight boost
  } else if (ageInDays <= 90) {
    score -= 10; // Getting old, slight penalty
  } else if (ageInDays <= 180) {
    score -= 30; // Old, significant penalty
  } else {
    score -= 50; // Stale, major penalty
  }

  // ACTIVITY FACTOR: Recent work on this pattern
  if (recentWorkCount >= 3) {
    score += 40; // High activity = critical priority
  } else if (recentWorkCount >= 2) {
    score += 25; // Moderate activity
  } else if (recentWorkCount >= 1) {
    score += 15; // Some activity
  } else if (ageInDays > 90) {
    score -= 20; // No activity + old = very stale
  }

  // ENGAGEMENT FACTOR: Practice completions
  const practiceEngagement = insight.relatedPracticeSessions?.reduce((sum, ps) => {
    return sum + ps.completionDates.length;
  }, 0) || 0;

  if (practiceEngagement >= 10) {
    score += 20; // High engagement with suggested practices
  } else if (practiceEngagement >= 5) {
    score += 10;
  } else if (practiceEngagement >= 1) {
    score += 5;
  }

  // OUTCOME FACTOR: Pattern improvement
  if (insight.practiceOutcome && insight.practiceOutcome.length > 0) {
    const improvements = insight.practiceOutcome.filter(o => o.patternImprovement === 'improved').length;
    const worsenings = insight.practiceOutcome.filter(o => o.patternImprovement === 'worsened').length;

    if (improvements > 0 && worsenings === 0) {
      score -= 15; // Pattern improving, lower priority (it's being handled)
    } else if (worsenings > 0) {
      score += 25; // Pattern worsening, raise priority (needs attention)
    }
  }

  // STATUS FACTOR: Already addressed insights
  if (insight.status === 'addressed') {
    score -= 40; // Addressed insights are lower priority

    // But if addressed recently and still active, boost back up
    if (insight.shadowWorkSessionsAddressed && insight.shadowWorkSessionsAddressed.length > 0) {
      const lastAddressed = insight.shadowWorkSessionsAddressed[insight.shadowWorkSessionsAddressed.length - 1];
      const daysSinceAddressed = daysSince(lastAddressed.dateCompleted);

      if (daysSinceAddressed <= 14 && recentWorkCount >= 1) {
        score += 20; // Recently addressed but still active = needs follow-up
      }
    }
  }

  // Clamp score to 0-100 range
  score = Math.max(0, Math.min(100, score));

  // Determine priority level
  let priority: InsightPriority;
  let reason: string;
  let shouldArchive = false;

  if (score >= 80) {
    priority = 'critical';
    reason = recentWorkCount >= 3
      ? `Active work on this pattern (${recentWorkCount} recent sessions)`
      : `Fresh insight requiring attention`;
  } else if (score >= 60) {
    priority = 'high';
    reason = recentWorkCount >= 1
      ? `Ongoing work with moderate activity`
      : `Recent insight worth prioritizing`;
  } else if (score >= 40) {
    priority = 'medium';
    reason = ageInDays <= 60
      ? `Standard priority for recent insight`
      : `Some activity but aging (${ageInDays} days old)`;
  } else if (score >= 20) {
    priority = 'low';
    reason = recentWorkCount > 0
      ? `Old insight with minimal recent activity`
      : `Aging insight (${ageInDays} days old) with no recent work`;
  } else {
    priority = 'stale';
    reason = ageInDays > 180
      ? `Stale insight (${ageInDays} days old, no recent activity)`
      : `No engagement with this pattern`;
    shouldArchive = ageInDays > 180 && recentWorkCount === 0;
  }

  return {
    priority,
    score,
    reason,
    ageInDays,
    recentWorkCount,
    shouldArchive,
  };
}

/**
 * Sort insights by priority
 */
export function sortInsightsByPriority(
  insights: IntegratedInsight[],
  recentSessions: any[] = []
): Array<IntegratedInsight & { priorityInfo: InsightPriorityResult }> {
  const insightsWithPriority = insights.map(insight => ({
    ...insight,
    priorityInfo: calculateInsightPriority(insight, recentSessions),
  }));

  // Sort by score descending (highest priority first)
  return insightsWithPriority.sort((a, b) => b.priorityInfo.score - a.priorityInfo.score);
}

/**
 * Get insights that should be archived
 */
export function getStaleInsights(
  insights: IntegratedInsight[],
  recentSessions: any[] = []
): IntegratedInsight[] {
  return insights.filter(insight => {
    const priority = calculateInsightPriority(insight, recentSessions);
    return priority.shouldArchive;
  });
}

/**
 * Filter insights by priority level
 */
export function filterInsightsByPriority(
  insights: IntegratedInsight[],
  priorityLevel: InsightPriority | InsightPriority[],
  recentSessions: any[] = []
): IntegratedInsight[] {
  const levels = Array.isArray(priorityLevel) ? priorityLevel : [priorityLevel];

  return insights.filter(insight => {
    const priority = calculateInsightPriority(insight, recentSessions);
    return levels.includes(priority.priority);
  });
}

/**
 * Get priority statistics for a set of insights
 */
export interface InsightPriorityStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  stale: number;
  shouldArchive: number;
  averageAge: number;
  activePatterns: number; // Insights with recent work
}

export function getInsightPriorityStats(
  insights: IntegratedInsight[],
  recentSessions: any[] = []
): InsightPriorityStats {
  const stats: InsightPriorityStats = {
    total: insights.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    stale: 0,
    shouldArchive: 0,
    averageAge: 0,
    activePatterns: 0,
  };

  if (insights.length === 0) return stats;

  let totalAge = 0;

  for (const insight of insights) {
    const priorityResult = calculateInsightPriority(insight, recentSessions);

    stats[priorityResult.priority]++;

    if (priorityResult.shouldArchive) {
      stats.shouldArchive++;
    }

    if (priorityResult.recentWorkCount > 0) {
      stats.activePatterns++;
    }

    totalAge += priorityResult.ageInDays;
  }

  stats.averageAge = Math.round(totalAge / insights.length);

  return stats;
}
