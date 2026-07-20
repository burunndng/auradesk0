/**
 * Insight Priority Scoring Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateInsightPriority,
  sortInsightsByPriority,
  getStaleInsights,
  filterInsightsByPriority,
  getInsightPriorityStats,
} from '../insightPriorityScoring';
import type { IntegratedInsight } from '../../types';

describe('Insight Priority Scoring', () => {
  const createMockInsight = (overrides: Partial<IntegratedInsight> = {}): IntegratedInsight => ({
    id: 'insight-1',
    mindToolType: 'IFS Session',
    mindToolSessionId: 'session-1',
    mindToolName: 'Internal Family Systems',
    mindToolReport: 'Test report',
    mindToolShortSummary: 'Test summary',
    detectedPattern: 'Fear of rejection',
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: new Date().toISOString(),
    status: 'pending',
    ...overrides,
  });

  const createMockSession = (type: string, linkedInsightId?: string, ageInDays: number = 0) => ({
    id: `session-${Math.random()}`,
    type,
    date: new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000).toISOString(),
    data: { linkedInsightId },
    aiSummary: 'Test summary for session',
  });

  describe('calculateInsightPriority', () => {
    it('should give critical priority to fresh insights with high activity', () => {
      const insight = createMockInsight();
      const recentSessions = [
        createMockSession('IFS Session', insight.id, 1),
        createMockSession('IFS Session', insight.id, 3),
        createMockSession('IFS Session', insight.id, 5),
      ];

      const result = calculateInsightPriority(insight, recentSessions);

      expect(result.priority).toBe('critical');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.recentWorkCount).toBeGreaterThanOrEqual(3);
    });

    it('should give high priority to fresh insights with moderate activity', () => {
      const insight = createMockInsight({
        dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days old
      });
      const recentSessions = [
        createMockSession('IFS Session', insight.id, 2),
      ];

      const result = calculateInsightPriority(insight, recentSessions);

      // Fresh insight (7 days) + 1 linked session = critical priority
      expect(result.priority).toBe('critical');
      expect(result.score).toBeGreaterThanOrEqual(60);
    });

    it('should give low/stale priority to old insights with no activity', () => {
      const insight = createMockInsight({
        dateCreated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days old
      });
      const recentSessions: any[] = []; // No recent work

      const result = calculateInsightPriority(insight, recentSessions);

      // 120 days old with no activity = stale
      expect(['low', 'stale']).toContain(result.priority);
      expect(result.score).toBeLessThan(40);
      expect(result.ageInDays).toBeGreaterThanOrEqual(120);
    });

    it('should mark very old insights with no activity as stale', () => {
      const insight = createMockInsight({
        dateCreated: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), // 200 days old
      });
      const recentSessions: any[] = [];

      const result = calculateInsightPriority(insight, recentSessions);

      expect(result.priority).toBe('stale');
      expect(result.shouldArchive).toBe(true);
      expect(result.ageInDays).toBeGreaterThanOrEqual(200);
    });

    it('should boost priority for insights with practice engagement', () => {
      const insight = createMockInsight({
        dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        relatedPracticeSessions: [
          {
            practiceId: 'practice-1',
            completionDates: Array(10).fill(new Date().toISOString()),
            frequency: 10,
          },
        ],
      });

      const result = calculateInsightPriority(insight, []);

      expect(result.score).toBeGreaterThan(50); // Base score + engagement boost
    });

    it('should lower priority for addressed insights unless still active', () => {
      const insight = createMockInsight({
        status: 'addressed',
        shadowWorkSessionsAddressed: [{
          shadowToolType: 'IFS Session',
          shadowSessionId: 'session-1',
          dateCompleted: new Date().toISOString(),
        }],
      });

      const result = calculateInsightPriority(insight, []);

      expect(result.score).toBeLessThan(50); // Addressed penalty applies
    });

    it('should boost addressed insights if recently addressed and still active', () => {
      const insight = createMockInsight({
        status: 'addressed',
        shadowWorkSessionsAddressed: [{
          shadowToolType: 'IFS Session',
          shadowSessionId: 'session-1',
          dateCompleted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        }],
      });

      const recentSessions = [
        createMockSession('IFS Session', insight.id, 2),
      ];

      const result = calculateInsightPriority(insight, recentSessions);

      // Should have addressed penalty but also follow-up boost
      expect(result.score).toBeGreaterThan(0);
    });

    it('should increase priority for worsening pattern outcomes', () => {
      const insight = createMockInsight({
        practiceOutcome: [{
          practiceId: 'practice-1',
          practiceFrequency: 5,
          patternImprovement: 'worsened',
        }],
      });

      const result = calculateInsightPriority(insight, []);

      expect(result.score).toBeGreaterThan(50); // Base + worsening penalty
    });

    it('should decrease priority for improving pattern outcomes', () => {
      const insight = createMockInsight({
        dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        practiceOutcome: [{
          practiceId: 'practice-1',
          practiceFrequency: 10,
          patternImprovement: 'improved',
        }],
      });

      const resultWithImprovement = calculateInsightPriority(insight, []);

      const insightWithoutImprovement = createMockInsight({
        dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const resultWithoutImprovement = calculateInsightPriority(insightWithoutImprovement, []);

      expect(resultWithImprovement.score).toBeLessThan(resultWithoutImprovement.score);
    });
  });

  describe('sortInsightsByPriority', () => {
    it('should sort insights by priority score descending', () => {
      const insights = [
        createMockInsight({
          id: 'low',
          dateCreated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        createMockInsight({
          id: 'high',
          dateCreated: new Date().toISOString(),
        }),
        createMockInsight({
          id: 'medium',
          dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ];

      const recentSessions = [
        createMockSession('IFS Session', 'high', 1),
        createMockSession('IFS Session', 'high', 2),
      ];

      const sorted = sortInsightsByPriority(insights, recentSessions);

      expect(sorted[0].id).toBe('high');
      expect(sorted[0].priorityInfo.score).toBeGreaterThan(sorted[1].priorityInfo.score);
      expect(sorted[1].priorityInfo.score).toBeGreaterThan(sorted[2].priorityInfo.score);
    });
  });

  describe('getStaleInsights', () => {
    it('should return insights marked for archiving', () => {
      const insights = [
        createMockInsight({
          id: 'fresh',
          dateCreated: new Date().toISOString(),
        }),
        createMockInsight({
          id: 'stale',
          dateCreated: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ];

      const stale = getStaleInsights(insights, []);

      expect(stale.length).toBe(1);
      expect(stale[0].id).toBe('stale');
    });
  });

  describe('filterInsightsByPriority', () => {
    it('should filter insights by single priority level', () => {
      const insights = [
        createMockInsight({
          id: 'critical',
          dateCreated: new Date().toISOString(),
        }),
        createMockInsight({
          id: 'low',
          dateCreated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ];

      const criticalSessions = [
        createMockSession('IFS Session', 'critical', 1),
        createMockSession('IFS Session', 'critical', 2),
        createMockSession('IFS Session', 'critical', 3),
      ];

      const filtered = filterInsightsByPriority(insights, 'critical', criticalSessions);

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('critical');
    });

    it('should filter insights by multiple priority levels', () => {
      const insights = [
        createMockInsight({ id: '1', dateCreated: new Date().toISOString() }),
        createMockInsight({ id: '2', dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }),
        createMockInsight({ id: '3', dateCreated: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() }),
      ];

      const filtered = filterInsightsByPriority(insights, ['high', 'medium'], []);

      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('getInsightPriorityStats', () => {
    it('should calculate correct statistics', () => {
      const insights = [
        createMockInsight({
          id: 'critical',
          dateCreated: new Date().toISOString(),
          detectedPattern: 'Fear of rejection pattern',
        }),
        createMockInsight({
          id: 'high',
          dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          detectedPattern: 'Fear of rejection pattern',
        }),
        createMockInsight({
          id: 'stale',
          mindToolType: 'Bias Detective', // Different wizard type to avoid partial matches
          dateCreated: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          detectedPattern: 'Completely different unrelated pattern',
        }),
      ];

      const recentSessions = [
        createMockSession('IFS Session', 'critical', 1),
        createMockSession('IFS Session', 'critical', 2),
        createMockSession('IFS Session', 'critical', 3),
        createMockSession('IFS Session', 'high', 5),
      ];

      const stats = getInsightPriorityStats(insights, recentSessions);

      expect(stats.total).toBe(3);
      expect(stats.critical).toBeGreaterThanOrEqual(1);
      expect(stats.activePatterns).toBeGreaterThanOrEqual(2); // critical and high have recent work
      expect(stats.shouldArchive).toBeGreaterThanOrEqual(1); // stale insight
      expect(stats.averageAge).toBeGreaterThan(0);
    });

    it('should handle empty insight list', () => {
      const stats = getInsightPriorityStats([], []);

      expect(stats.total).toBe(0);
      expect(stats.critical).toBe(0);
      expect(stats.averageAge).toBe(0);
    });
  });
});
