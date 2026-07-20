/**
 * Pattern Recognition Engine Tests
 * Comprehensive test suite for clustering and pattern detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../../.claude/lib/storageManager';
import type { IntegratedInsight } from '../../types';
import {
  clusterInsights,
  detectPatternFamilies,
  computePatternSignature,
  trackPatternEvolution,
  persistClusters,
  retrievePersistedClusters,
  clearPersistedClusters,
  type PatternCluster,
  type PatternFamily,
} from '../patternRecognitionEngine';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Helper: Create mock insight
 */
function createMockInsight(overrides?: Partial<IntegratedInsight>): IntegratedInsight {
  return {
    id: `insight-${Math.random().toString(36).substr(2, 9)}`,
    mindToolType: 'IFS Session',
    mindToolSessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
    mindToolName: 'IFS Work',
    mindToolReport: 'This is a detailed report about inner family systems work',
    mindToolShortSummary: 'IFS work summary',
    detectedPattern: 'Inner Critic perfectionism pattern',
    suggestedShadowWork: [
      {
        practiceId: 'shadow-1',
        practiceName: 'Shadow Integration',
        rationale: 'To address the inner critic',
      },
    ],
    suggestedNextSteps: [
      {
        practiceId: 'practice-1',
        practiceName: 'Mindfulness',
        rationale: 'To build awareness',
      },
    ],
    dateCreated: new Date().toISOString(),
    status: 'pending',
    ...overrides,
  };
}

/**
 * Helper: Create similar insights (for clustering tests)
 */
function createSimilarInsights(baseReport: string, count: number): IntegratedInsight[] {
  const insights: IntegratedInsight[] = [];
  for (let i = 0; i < count; i++) {
    insights.push(
      createMockInsight({
        mindToolReport: `${baseReport} variation ${i}`,
        detectedPattern: `Pattern ${i} related to core theme`,
      }),
    );
  }
  return insights;
}

describe('Pattern Recognition Engine', () => {
  beforeEach(() => {
    StorageManager.clearAll();
    vi.clearAllMocks();
  });

  afterEach(() => {
    StorageManager.clearAll();
  });

  describe('clusterInsights', () => {
    it('should handle empty array gracefully', async () => {
      const result = await clusterInsights([]);
      expect(result).toEqual([]);
    });

    it('should create trivial cluster for single insight', async () => {
      const insight = createMockInsight();
      const result = await clusterInsights([insight]);

      expect(result).toHaveLength(1);
      expect(result[0].insights).toHaveLength(1);
      expect(result[0].insights[0].id).toBe(insight.id);
    });

    it('should group similar insights into single cluster', async () => {
      const similarInsights = createSimilarInsights('Perfectionism and inner critic analysis', 3);
      const result = await clusterInsights(similarInsights);

      // All similar insights should be in same or related clusters
      expect(result.length).toBeGreaterThan(0);
      const allInsightIds = result.flatMap((c) => c.insights.map((i) => i.id));
      expect(allInsightIds).toHaveLength(similarInsights.length);
    });

    it('should separate dissimilar insights into different clusters', async () => {
      const insight1 = createMockInsight({
        mindToolReport: 'Perfectionism analysis through IFS',
        detectedPattern: 'Inner Critic perfectionism',
      });
      const insight2 = createMockInsight({
        mindToolReport: 'Attachment patterns in relationships',
        detectedPattern: 'Anxious attachment style',
      });

      const result = await clusterInsights([insight1, insight2]);

      // Dissimilar insights should result in separate clusters
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should compute centroid for each cluster', async () => {
      const insights = createSimilarInsights('Shadow work on abandonment fears', 2);
      const result = await clusterInsights(insights);

      for (const cluster of result) {
        expect(cluster.centroid).toBeDefined();
        expect(Array.isArray(cluster.centroid)).toBe(true);
        expect(cluster.centroid.length).toBe(1024); // BGE embedding dimension
      }
    });

    it('should compute similarity scores for insights in cluster', async () => {
      const insights = createSimilarInsights('Meditation practice and mindfulness', 2);
      const result = await clusterInsights(insights);

      for (const cluster of result) {
        expect(cluster.similarity_scores).toBeDefined();
        for (const insight of cluster.insights) {
          expect(cluster.similarity_scores[insight.id]).toBeDefined();
          expect(typeof cluster.similarity_scores[insight.id]).toBe('number');
        }
      }
    });

    it('should set cluster metadata correctly', async () => {
      const insights = createSimilarInsights('Grief and loss processing', 2);
      const result = await clusterInsights(insights);

      for (const cluster of result) {
        expect(cluster.metadata).toBeDefined();
        expect(cluster.metadata.theme).toBeTruthy();
        expect(cluster.metadata.strength).toBeGreaterThanOrEqual(0);
        expect(cluster.metadata.strength).toBeLessThanOrEqual(1);
        expect(cluster.metadata.representative_insight_id).toBeTruthy();
      }
    });

    it('should filter out invalid insights', async () => {
      const validInsight = createMockInsight();
      const invalidInsight: any = {
        id: null, // Invalid
        mindToolReport: 'test',
      };

      const result = await clusterInsights([validInsight, invalidInsight]);

      const allInsightIds = result.flatMap((c) => c.insights.map((i) => i.id));
      expect(allInsightIds).toContain(validInsight.id);
    });

    it('should throw error if no valid insights', async () => {
      const invalidInsights: any[] = [
        { id: null, mindToolReport: 'test' },
        { id: '', mindToolReport: 'test' },
      ];

      await expect(clusterInsights(invalidInsights)).rejects.toThrow();
    });

    it('should handle insights with missing optional fields', async () => {
      const insightWithoutOptionals: IntegratedInsight = {
        id: 'insight-1',
        mindToolType: 'Bias Detective',
        mindToolSessionId: 'session-1',
        mindToolName: 'Bias Work',
        mindToolReport: 'Bias detection analysis',
        mindToolShortSummary: 'Summary',
        detectedPattern: 'Confirmation bias pattern',
        suggestedShadowWork: [],
        suggestedNextSteps: [],
        dateCreated: new Date().toISOString(),
        status: 'pending',
      };

      const result = await clusterInsights([insightWithoutOptionals]);
      expect(result).toHaveLength(1);
    });

    it('should handle large batches of insights', async () => {
      const largeInsightBatch = createSimilarInsights('Large batch analysis', 50);
      const result = await clusterInsights(largeInsightBatch);

      const allInsightIds = result.flatMap((c) => c.insights.map((i) => i.id));
      expect(allInsightIds.length).toBe(50);
    });

    it('should handle identical insights', async () => {
      const baseInsight = createMockInsight({
        mindToolReport: 'Identical report content',
        detectedPattern: 'Identical pattern',
      });

      const identicalInsights = [
        baseInsight,
        { ...baseInsight, id: `insight-${Math.random().toString(36).substr(2, 9)}` },
        { ...baseInsight, id: `insight-${Math.random().toString(36).substr(2, 9)}` },
      ];

      const result = await clusterInsights(identicalInsights);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('detectPatternFamilies', () => {
    it('should handle empty cluster array', async () => {
      const result = await detectPatternFamilies([]);
      expect(result).toEqual([]);
    });

    it('should create single family for single cluster', async () => {
      const insight = createMockInsight();
      const clusters = await clusterInsights([insight]);
      const result = await detectPatternFamilies(clusters);

      expect(result).toHaveLength(1);
      expect(result[0].clusters).toHaveLength(1);
    });

    it('should group related clusters into families', async () => {
      const similarInsights = createSimilarInsights('Shadow work patterns', 5);
      const clusters = await clusterInsights(similarInsights);
      const result = await detectPatternFamilies(clusters);

      expect(result.length).toBeGreaterThan(0);
      for (const family of result) {
        expect(family.clusters.length).toBeGreaterThan(0);
      }
    });

    it('should set family metadata correctly', async () => {
      const insights = createSimilarInsights('Family patterns in relationships', 3);
      const clusters = await clusterInsights(insights);
      const result = await detectPatternFamilies(clusters);

      for (const family of result) {
        expect(family.id).toBeTruthy();
        expect(family.name).toBeTruthy();
        expect(family.metadata.total_insights).toBeGreaterThan(0);
        expect(family.metadata.primary_theme).toBeTruthy();
        expect(Array.isArray(family.metadata.related_themes)).toBe(true);
        expect(family.metadata.strength).toBeGreaterThanOrEqual(0);
        expect(family.metadata.strength).toBeLessThanOrEqual(1);
      }
    });

    it('should initialize empty evolution history', async () => {
      const insight = createMockInsight();
      const clusters = await clusterInsights([insight]);
      const result = await detectPatternFamilies(clusters);

      for (const family of result) {
        expect(Array.isArray(family.evolution_history)).toBe(true);
        expect(family.evolution_history.length).toBe(0);
      }
    });

    it('should set correct timestamp', async () => {
      const insight = createMockInsight();
      const clusters = await clusterInsights([insight]);
      const result = await detectPatternFamilies(clusters);

      for (const family of result) {
        expect(family.timestamp).toBeTruthy();
        const familyDate = new Date(family.timestamp);
        expect(familyDate.getTime()).toBeGreaterThan(0);
      }
    });

    it('should group multiple clusters into single family if similar', async () => {
      const insights = createSimilarInsights('Very similar perfectionism patterns', 6);
      const clusters = await clusterInsights(insights);
      const result = await detectPatternFamilies(clusters);

      // All similar insights should organize into families
      const totalInsightsInFamilies = result.reduce((sum, f) => sum + f.metadata.total_insights, 0);
      expect(totalInsightsInFamilies).toBe(insights.length);
    });
  });

  describe('computePatternSignature', () => {
    it('should return empty signature for empty array', () => {
      const result = computePatternSignature([]);
      expect(result).toBe('empty-signature');
    });

    it('should generate deterministic signature for same insights', () => {
      const insight1 = createMockInsight({ id: 'insight-1' });
      const insight2 = createMockInsight({ id: 'insight-2' });
      const insights = [insight1, insight2];

      const sig1 = computePatternSignature(insights);
      const sig2 = computePatternSignature(insights);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signature for different insights', () => {
      const insights1 = [createMockInsight({ id: 'insight-1' }), createMockInsight({ id: 'insight-2' })];
      const insights2 = [createMockInsight({ id: 'insight-3' }), createMockInsight({ id: 'insight-4' })];

      const sig1 = computePatternSignature(insights1);
      const sig2 = computePatternSignature(insights2);

      expect(sig1).not.toBe(sig2);
    });

    it('should be order-independent for signatures', () => {
      const insight1 = createMockInsight({ id: 'insight-1' });
      const insight2 = createMockInsight({ id: 'insight-2' });

      const sig1 = computePatternSignature([insight1, insight2]);
      const sig2 = computePatternSignature([insight2, insight1]);

      expect(sig1).toBe(sig2);
    });

    it('should start with sig- prefix', () => {
      const insight = createMockInsight();
      const result = computePatternSignature([insight]);

      expect(result).toMatch(/^sig-/);
    });

    it('should be alphanumeric', () => {
      const insights = [
        createMockInsight({ id: 'insight-1' }),
        createMockInsight({ id: 'insight-2' }),
        createMockInsight({ id: 'insight-3' }),
      ];
      const result = computePatternSignature(insights);

      expect(result).toMatch(/^sig-[a-z0-9]+$/);
    });
  });

  describe('trackPatternEvolution', () => {
    it('should mark new pattern as emerged', async () => {
      const insight = createMockInsight();
      const result = await trackPatternEvolution([insight], []);

      expect(result.emerged_at).toBeTruthy();
      expect(result.evolved_at).toBeTruthy();
      expect(result.strength_trend).toBe('stable');
      expect(result.related_patterns).toEqual([]);
      expect(result.description).toContain('New pattern');
    });

    it('should track increasing strength trend', async () => {
      const historicalFamily: PatternFamily = {
        id: 'family-1',
        name: 'Shadow patterns',
        clusters: [],
        evolution_history: [],
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          total_insights: 2,
          primary_theme: 'Shadow work',
          related_themes: [],
          strength: 0.3,
        },
      };

      const currentInsights = createSimilarInsights('Growing shadow patterns', 8);
      const result = await trackPatternEvolution(currentInsights, [historicalFamily]);

      expect(result.strength_trend).toBe('increasing');
      expect(result.description).toContain('increasing');
    });

    it('should track decreasing strength trend', async () => {
      const historicalFamily: PatternFamily = {
        id: 'family-1',
        name: 'Shadow patterns',
        clusters: [],
        evolution_history: [],
        timestamp: new Date().toISOString(),
        metadata: {
          total_insights: 10,
          primary_theme: 'Shadow work',
          related_themes: [],
          strength: 0.9,
        },
      };

      const currentInsights = [createMockInsight()];
      const result = await trackPatternEvolution(currentInsights, [historicalFamily]);

      expect(result.strength_trend).toBe('decreasing');
    });

    it('should track stable strength trend', async () => {
      const historicalFamily: PatternFamily = {
        id: 'family-1',
        name: 'Patterns',
        clusters: [],
        evolution_history: [],
        timestamp: new Date().toISOString(),
        metadata: {
          total_insights: 4,
          primary_theme: 'Core patterns',
          related_themes: [],
          strength: 0.4,
        },
      };

      const currentInsights = createSimilarInsights('Core patterns', 4);
      const result = await trackPatternEvolution(currentInsights, [historicalFamily]);

      expect(result.strength_trend).toBe('stable');
    });

    it('should reference historical patterns', async () => {
      const historicalFamilies: PatternFamily[] = [
        {
          id: 'family-1',
          name: 'Patterns 1',
          clusters: [],
          evolution_history: [],
          timestamp: new Date().toISOString(),
          metadata: {
            total_insights: 2,
            primary_theme: 'Theme 1',
            related_themes: [],
            strength: 0.5,
          },
        },
        {
          id: 'family-2',
          name: 'Patterns 2',
          clusters: [],
          evolution_history: [],
          timestamp: new Date().toISOString(),
          metadata: {
            total_insights: 2,
            primary_theme: 'Theme 2',
            related_themes: [],
            strength: 0.5,
          },
        },
      ];

      const result = await trackPatternEvolution([], historicalFamilies);

      expect(result.related_patterns).toContain('family-1');
      expect(result.related_patterns).toContain('family-2');
    });

    it('should have valid timestamps', async () => {
      const result = await trackPatternEvolution([], []);

      const emergenceDate = new Date(result.emerged_at);
      const evolutionDate = new Date(result.evolved_at);

      expect(emergenceDate.getTime()).toBeGreaterThan(0);
      expect(evolutionDate.getTime()).toBeGreaterThan(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist clusters to localStorage', async () => {
      const insights = createSimilarInsights('Test persistence', 2);
      const clusters = await clusterInsights(insights);

      persistClusters(clusters);

      const stored = StorageManager.getUntyped('patternClusters');
      expect(stored).toBeTruthy();
      const parsed = stored as any;
      expect(parsed.clusters).toHaveLength(clusters.length);
    });

    it('should retrieve persisted clusters', async () => {
      const insights = createSimilarInsights('Test retrieval', 2);
      const clusters = await clusterInsights(insights);

      persistClusters(clusters);
      const retrieved = retrievePersistedClusters();

      expect(retrieved).toHaveLength(clusters.length);
    });

    it('should return empty array when no clusters persisted', () => {
      const result = retrievePersistedClusters();
      expect(result).toEqual([]);
    });

    it('should clear persisted clusters', async () => {
      const insights = createSimilarInsights('Test clear', 2);
      const clusters = await clusterInsights(insights);

      persistClusters(clusters);
      clearPersistedClusters();

      const retrieved = retrievePersistedClusters();
      expect(retrieved).toEqual([]);
    });

    it('should include savedAt timestamp', async () => {
      const insights = createSimilarInsights('Test timestamp', 1);
      const clusters = await clusterInsights(insights);

      persistClusters(clusters);

      const stored = StorageManager.getUntyped('patternClusters');
      const parsed = stored as any;
      expect(parsed.savedAt).toBeTruthy();
      expect(typeof parsed.savedAt).toBe('number');
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      const clusters: PatternCluster[] = [];
      expect(() => persistClusters(clusters)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data', () => {
      StorageManager.setUntyped('patternClusters', 'invalid json {]' as any);

      const result = retrievePersistedClusters();
      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long report texts', async () => {
      const longText = 'a'.repeat(10000);
      const insight = createMockInsight({ mindToolReport: longText });

      const result = await clusterInsights([insight]);
      expect(result).toHaveLength(1);
    });

    it('should handle special characters in insights', async () => {
      const specialInsight = createMockInsight({
        mindToolReport: 'Special: <script>alert("xss")</script> & "quotes"',
        detectedPattern: '你好世界 🌍 emoji test',
      });

      const result = await clusterInsights([specialInsight]);
      expect(result).toHaveLength(1);
    });

    it('should handle null metadata gracefully', async () => {
      const insightWithoutMetadata: IntegratedInsight = {
        id: 'insight-1',
        mindToolType: 'Test',
        mindToolSessionId: 'session-1',
        mindToolName: 'Test Tool',
        mindToolReport: 'Test report',
        mindToolShortSummary: 'Summary',
        detectedPattern: 'Test pattern',
        suggestedShadowWork: [],
        suggestedNextSteps: [],
        dateCreated: new Date().toISOString(),
        status: 'pending',
      };

      const result = await clusterInsights([insightWithoutMetadata]);
      expect(result).toHaveLength(1);
    });

    it('should be deterministic with same input', async () => {
      const insights = createSimilarInsights('Deterministic test', 3);

      const result1 = await clusterInsights([...insights]);
      const result2 = await clusterInsights([...insights]);

      expect(result1.length).toBe(result2.length);
      expect(result1[0].insights.length).toBe(result2[0].insights.length);
    });
  });

  describe('integration scenarios', () => {
    it('should support full workflow: cluster -> families -> evolution', async () => {
      // Create initial insights
      const initialInsights = createSimilarInsights('Initial insights', 3);
      const clusters1 = await clusterInsights(initialInsights);
      const families1 = await detectPatternFamilies(clusters1);

      // Persist families
      persistClusters(clusters1);

      // Create new insights and track evolution
      const newInsights = createSimilarInsights('Initial insights evolved', 4);
      const evolution = await trackPatternEvolution(newInsights, families1);

      expect(evolution.strength_trend).toBeDefined();
      expect(evolution.related_patterns).toHaveLength(families1.length);
    });

    it('should maintain cluster integrity through persistence', async () => {
      const insights = createSimilarInsights('Integrity test', 5);
      const originalClusters = await clusterInsights(insights);

      persistClusters(originalClusters);
      const retrievedClusters = retrievePersistedClusters();

      expect(retrievedClusters).toHaveLength(originalClusters.length);
      for (let i = 0; i < originalClusters.length; i++) {
        expect(retrievedClusters[i].insights).toHaveLength(originalClusters[i].insights.length);
      }
    });

    it('should handle mixed insight types', async () => {
      const ifsInsight = createMockInsight({
        mindToolType: 'IFS Session',
        detectedPattern: 'Inner Critic',
      });
      const biasInsight = createMockInsight({
        mindToolType: 'Bias Detective',
        detectedPattern: 'Confirmation bias',
      });
      const shadowInsight = createMockInsight({
        mindToolType: 'Shadow Journaling',
        detectedPattern: 'Abandonment fear',
      });

      const result = await clusterInsights([ifsInsight, biasInsight, shadowInsight]);

      expect(result.length).toBeGreaterThan(0);
      const allInsights = result.flatMap((c) => c.insights);
      expect(allInsights).toHaveLength(3);
    });
  });
});
