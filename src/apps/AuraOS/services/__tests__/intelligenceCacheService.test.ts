/**
 * Tests for Intelligence Cache Service
 * Tests granular cache invalidation and delta detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { IntelligentGuidance, IntelligenceContext } from '../../types';
import {
  cacheGuidance,
  invalidateSection,
  shouldRegenerate,
  getCachedGuidance,
  updateCachedSections,
  clearCache,
  getCacheMetadata,
  type CacheSection,
} from '../intelligenceCacheService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
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

describe('Intelligence Cache Service', () => {
  const testGuidance: IntelligentGuidance = {
    synthesis: 'Test synthesis of user progress',
    primaryFocus: 'Focus on emotional regulation',
    recommendations: {
      nextWizard: {
        type: 'ifs',
        name: 'IFS Wizard',
        reason: 'Helps with internal conflicts',
        focus: 'Understanding parts',
        priority: 'high',
        confidence: 0.8,
        evidence: ['session-123'],
        timing: 'this_week',
      },
      practiceChanges: {
        add: [
          {
            practice: { id: 'meditation', name: 'Meditation', description: '', why: '', evidence: '', timePerWeek: 30, roi: 'HIGH', difficulty: 'Low', affectsSystem: [], how: [] },
            reason: 'Builds emotional awareness',
            priority: 'high',
            startTiming: 'now',
            timeCommitment: '10 min/day',
            sequenceWeek: 1,
            sequenceGuidance: 'Start with guided meditation',
            expectedBenefits: 'Better emotional regulation',
            integrationTips: 'Practice after morning routine',
          },
        ],
        remove: [],
        modify: [],
      },
      stackBalance: {
        body: '25%',
        mind: '35%',
        spirit: '20%',
        shadow: '20%',
      },
    },
    reasoning: {
      whatINoticed: ['Pattern of emotional reactivity', 'Growth in self-awareness'],
      whyThisMatters: ['Emotional regulation affects all areas of life'],
      howItConnects: ['Meditation supports IFS work'],
    },
    cautions: ['Be patient with emotional work'],
    generatedAt: '2024-01-01T00:00:00.000Z',
  };

  const testContext: IntelligenceContext = {
    currentPracticeStack: [
      { id: 'meditation', name: 'Meditation', description: '', why: '', evidence: '', timePerWeek: 30, roi: 'HIGH', difficulty: 'Low', affectsSystem: [], how: [] }
    ],
    practiceNotes: { meditation: 'Helps with anxiety' },
    completionHistory: [
      { practiceId: 'meditation', date: '2024-01-01', completed: true }
    ],
    wizardSessions: [
      { type: 'ifs', date: '2024-01-01', keyInsights: ['Discovered protector part'] }
    ],
    integratedInsights: [
      { id: 'insight-1', detectedPattern: 'Emotional reactivity', mindToolType: 'IFS', status: 'pending', createdAt: '2024-01-01', suggestedShadowWork: [] }
    ],
    pendingPatterns: ['Emotional reactivity'],
    primaryChallenges: ['Emotional regulation'],
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Cache Storage and Retrieval', () => {
    it('should cache guidance with metadata', () => {
      cacheGuidance(testContext, testGuidance);

      const cached = getCachedGuidance();
      expect(cached).toEqual(testGuidance);
    });

    it('should store cache metadata with section timestamps', () => {
      cacheGuidance(testContext, testGuidance);

      const metadata = getCacheMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.synthesis.cachedAt).toBeGreaterThan(0);
      expect(metadata?.wizard_recommendations.cachedAt).toBeGreaterThan(0);
      expect(metadata?.practice_recommendations.cachedAt).toBeGreaterThan(0);
      expect(metadata?.reasoning.cachedAt).toBeGreaterThan(0);
      expect(metadata?.stack_balance.cachedAt).toBeGreaterThan(0);
      expect(metadata?.lastUpdate).toBeGreaterThan(0);
      expect(metadata?.insightHash).toBeDefined();
    });

    it('should return null for empty cache', () => {
      const cached = getCachedGuidance();
      expect(cached).toBeNull();
    });

    it('should return null for metadata when cache is empty', () => {
      const metadata = getCacheMetadata();
      expect(metadata).toBeNull();
    });
  });

  describe('Partial Invalidation', () => {
    beforeEach(() => {
      cacheGuidance(testContext, testGuidance);
    });

    it('should invalidate specific section without clearing entire cache', async () => {
      const originalMetadata = getCacheMetadata();
      const originalSynthesisTime = originalMetadata!.synthesis.cachedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Invalidate a section — sets cachedAt to 0 to mark it stale
      invalidateSection(testContext, 'synthesis');

      const newMetadata = getCacheMetadata();
      expect(newMetadata?.synthesis.cachedAt).toBe(0);
      
      // Other sections should remain unchanged
      expect(newMetadata?.wizard_recommendations.cachedAt).toEqual(originalMetadata!.wizard_recommendations.cachedAt);
      expect(newMetadata?.practice_recommendations.cachedAt).toEqual(originalMetadata!.practice_recommendations.cachedAt);
      expect(newMetadata?.reasoning.cachedAt).toEqual(originalMetadata!.reasoning.cachedAt);
      expect(newMetadata?.stack_balance.cachedAt).toEqual(originalMetadata!.stack_balance.cachedAt);
    });

    it('should handle invalidation when no cache exists', () => {
      clearCache();
      invalidateSection(testContext, 'synthesis');
      // Should not throw error
      expect(getCachedGuidance()).toBeNull();
    });
  });

  describe('Delta Detection', () => {
    beforeEach(() => {
      cacheGuidance(testContext, testGuidance);
    });

    it('should detect cache miss when no cache exists', () => {
      clearCache();
      const result = shouldRegenerate(testContext);
      
      expect(result.shouldRegenerate).toBe(true);
      expect(result.sectionsToRegenerate).toContain('synthesis');
      expect(result.sectionsToRegenerate).toContain('wizard_recommendations');
      expect(result.sectionsToRegenerate).toContain('practice_recommendations');
      expect(result.sectionsToRegenerate).toContain('reasoning');
      expect(result.sectionsToRegenerate).toContain('stack_balance');
    });

    it('should return cache hit when no changes detected', () => {
      // Cache with the same context that we'll check against
      cacheGuidance(testContext, testGuidance);
      
      // Get the cached metadata to extract the insight hash that was stored
      const metadata = getCacheMetadata();
      const storedInsightHash = metadata!.insightHash;
      
      // Manually set the cache to use the same insight hash that context would generate
      const contextInsightHash = JSON.stringify({
        insightsCount: testContext.integratedInsights.length,
        pendingPatternsCount: testContext.pendingPatterns.length,
        wizardSessionsCount: testContext.wizardSessions.length,
        lastWizardDate: testContext.wizardSessions[0]?.date || '',
        topPatterns: testContext.integratedInsights.slice(0, 3).map(i => i.detectedPattern),
      });
      
      // Simple hash function (same as in generateInsightHashFromContext)
      let hash = 0;
      for (let i = 0; i < contextInsightHash.length; i++) {
        const char = contextInsightHash.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const expectedInsightHash = Math.abs(hash).toString(36);
      
      // Update cache with matching insight hash
      const cacheData = JSON.parse(localStorageMock.getItem('intelligenceHubCache')!);
      cacheData.metadata.insightHash = expectedInsightHash;
      localStorageMock.setItem('intelligenceHubCache', JSON.stringify(cacheData));
      
      const result = shouldRegenerate(testContext);
      
      expect(result.shouldRegenerate).toBe(false);
      expect(result.sectionsToRegenerate).toHaveLength(0);
      expect(result.cachedGuidance).toEqual(testGuidance);
    });

    it('should detect insight changes and trigger relevant section regeneration', () => {
      // Modify context to have different insights
      const modifiedContext = {
        ...testContext,
        integratedInsights: [
          ...testContext.integratedInsights,
          { id: 'insight-2', detectedPattern: 'New pattern', mindToolType: 'Shadow', status: 'pending', createdAt: '2024-01-02', suggestedShadowWork: [] }
        ]
      };

      const result = shouldRegenerate(modifiedContext);
      
      expect(result.shouldRegenerate).toBe(true);
      expect(result.sectionsToRegenerate).toContain('reasoning');
      expect(result.sectionsToRegenerate).toContain('synthesis');
    });

    it('should detect context changes for specific sections', () => {
      // Modify context in a way that would affect practice recommendations
      const modifiedContext = {
        ...testContext,
        currentPracticeStack: [], // Empty practice stack
      };

      const result = shouldRegenerate(modifiedContext);
      
      expect(result.shouldRegenerate).toBe(true);
      // Should trigger regeneration of sections that depend on practice stack
      expect(result.sectionsToRegenerate.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Updates', () => {
    beforeEach(() => {
      cacheGuidance(testContext, testGuidance);
    });

    it('should update specific sections in cache', () => {
      const newSynthesis = 'Updated synthesis text';
      const newReasoning = {
        whatINoticed: ['New observation'],
        whyThisMatters: ['New significance'],
        howItConnects: ['New connection'],
      };

      updateCachedSections(testContext, {
        synthesis: newSynthesis,
        reasoning: newReasoning,
      });

      const cached = getCachedGuidance();
      expect(cached?.synthesis).toBe(newSynthesis);
      expect(cached?.reasoning).toEqual(newReasoning);

      // Other sections should remain unchanged
      expect(cached?.recommendations.nextWizard).toEqual(testGuidance.recommendations.nextWizard);
    });

    it('should handle updates when no cache exists', () => {
      clearCache();
      updateCachedSections(testContext, {
        synthesis: 'New synthesis',
      });

      const cached = getCachedGuidance();
      expect(cached).toBeNull();
    });

    it('should update wizard recommendations', () => {
      const newWizardRec = {
        type: 'bias',
        name: 'Bias Detective',
        reason: 'Identify cognitive biases',
        focus: 'Thought patterns',
        priority: 'medium' as const,
        confidence: 0.7,
        evidence: ['insight-456'],
        timing: 'next_week' as const,
      };

      updateCachedSections(testContext, {
        wizard_recommendations: newWizardRec,
      });

      const cached = getCachedGuidance();
      expect(cached?.recommendations.nextWizard).toEqual(newWizardRec);
    });

    it('should update practice recommendations', () => {
      const newPracticeChanges = {
        add: [
          {
            practice: { id: 'journaling', name: 'Journaling', description: '', why: '', evidence: '', timePerWeek: 20, roi: 'MEDIUM', difficulty: 'Low', affectsSystem: [], how: [] },
            reason: 'Process emotions',
            priority: 'medium' as const,
            startTiming: 'week 2',
            timeCommitment: '15 min/day',
            sequenceWeek: 2,
            sequenceGuidance: 'Start after establishing meditation',
            expectedBenefits: 'Emotional clarity',
            integrationTips: 'Write after meditation',
          },
        ],
        remove: ['old-practice'],
        modify: [],
      };

      updateCachedSections(testContext, {
        practice_recommendations: newPracticeChanges,
      });

      const cached = getCachedGuidance();
      expect(cached?.recommendations.practiceChanges).toEqual(newPracticeChanges);
    });

    it('should update stack balance', () => {
      const newStackBalance = {
        body: '30%',
        mind: '30%',
        spirit: '25%',
        shadow: '15%',
      };

      updateCachedSections(testContext, {
        stack_balance: newStackBalance,
      });

      const cached = getCachedGuidance();
      expect(cached?.recommendations.stackBalance).toEqual(newStackBalance);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache completely', () => {
      cacheGuidance(testContext, testGuidance);
      expect(getCachedGuidance()).toEqual(testGuidance);

      clearCache();
      expect(getCachedGuidance()).toBeNull();
      expect(getCacheMetadata()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      // Should not throw error
      expect(() => {
        cacheGuidance(testContext, testGuidance);
      }).not.toThrow();

      // Restore original function
      localStorageMock.setItem = originalSetItem;
    });

    it('should handle corrupted cache data gracefully', () => {
      cacheGuidance(testContext, testGuidance);
      
      // Corrupt the cache
      localStorageMock.setItem('intelligenceHubCache', 'invalid json');

      // Should not throw error and should return null
      expect(getCachedGuidance()).toBeNull();
      expect(getCacheMetadata()).toBeNull();
    });
  });

  describe('Cache Hit/Miss Scenarios', () => {
    it('should detect expired cache', () => {
      cacheGuidance(testContext, testGuidance);
      
      // Manually set cache to be expired
      const cacheData = JSON.parse(localStorageMock.getItem('intelligenceHubCache')!);
      cacheData.metadata.lastUpdate = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      localStorageMock.setItem('intelligenceHubCache', JSON.stringify(cacheData));

      const result = shouldRegenerate(testContext);
      expect(result.shouldRegenerate).toBe(true);
      expect(result.sectionsToRegenerate).toContain('synthesis');
      expect(result.sectionsToRegenerate).toContain('wizard_recommendations');
      expect(result.sectionsToRegenerate).toContain('practice_recommendations');
      expect(result.sectionsToRegenerate).toContain('reasoning');
      expect(result.sectionsToRegenerate).toContain('stack_balance');
    });

    it('should detect partially expired cache', () => {
      cacheGuidance(testContext, testGuidance);
      
      // Manually set only synthesis section to be expired (25 hours ago)
      const cacheData = JSON.parse(localStorageMock.getItem('intelligenceHubCache')!);
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      cacheData.metadata.synthesis.cachedAt = twentyFiveHoursAgo;
      // Keep other sections recent
      cacheData.metadata.wizard_recommendations.cachedAt = Date.now();
      cacheData.metadata.practice_recommendations.cachedAt = Date.now();
      cacheData.metadata.reasoning.cachedAt = Date.now();
      cacheData.metadata.stack_balance.cachedAt = Date.now();
      // Keep overall lastUpdate recent to avoid full cache expiration
      cacheData.metadata.lastUpdate = Date.now();
      
      // Update insight hash to match what context would generate
      const contextInsightHash = JSON.stringify({
        insightsCount: testContext.integratedInsights.length,
        pendingPatternsCount: testContext.pendingPatterns.length,
        wizardSessionsCount: testContext.wizardSessions.length,
        lastWizardDate: testContext.wizardSessions[0]?.date || '',
        topPatterns: testContext.integratedInsights.slice(0, 3).map(i => i.detectedPattern),
      });
      
      let hash = 0;
      for (let i = 0; i < contextInsightHash.length; i++) {
        const char = contextInsightHash.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      cacheData.metadata.insightHash = Math.abs(hash).toString(36);
      
      localStorageMock.setItem('intelligenceHubCache', JSON.stringify(cacheData));

      const result = shouldRegenerate(testContext);
      expect(result.shouldRegenerate).toBe(true);
      expect(result.sectionsToRegenerate).toContain('synthesis');
      expect(result.sectionsToRegenerate).not.toContain('wizard_recommendations');
      expect(result.sectionsToRegenerate).not.toContain('practice_recommendations');
      expect(result.sectionsToRegenerate).not.toContain('reasoning');
      expect(result.sectionsToRegenerate).not.toContain('stack_balance');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty guidance object', () => {
      const minimalGuidance: IntelligentGuidance = {
        synthesis: '',
        primaryFocus: '',
        recommendations: {},
        reasoning: {
          whatINoticed: [],
          whyThisMatters: [],
          howItConnects: [],
        },
        cautions: [],
        generatedAt: new Date().toISOString(),
      };

      expect(() => {
        cacheGuidance(testContext, minimalGuidance);
      }).not.toThrow();

      const cached = getCachedGuidance();
      expect(cached).toEqual(minimalGuidance);
    });

    it('should handle guidance with missing optional sections', () => {
      const partialGuidance: IntelligentGuidance = {
        synthesis: 'Test synthesis',
        primaryFocus: 'Test focus',
        recommendations: {
          // Missing nextWizard
          practiceChanges: {
            add: [],
            remove: [],
            modify: [],
          },
          // Missing stackBalance
        },
        reasoning: {
          whatINoticed: ['Test observation'],
          whyThisMatters: ['Test significance'],
          howItConnects: ['Test connection'],
        },
        cautions: [],
        generatedAt: new Date().toISOString(),
      };

      expect(() => {
        cacheGuidance(testContext, partialGuidance);
      }).not.toThrow();

      const cached = getCachedGuidance();
      expect(cached?.synthesis).toBe('Test synthesis');
      expect(cached?.recommendations.nextWizard).toBeUndefined();
      expect(cached?.recommendations.stackBalance).toBeUndefined();
    });
  });
});