/**
 * Intelligence Cache Service - Granular Cache Invalidation
 * Tracks 5 separate cache sections with independent timestamps for surgical invalidation
 */

import type { IntelligentGuidance, IntelligenceContext } from '../types';
import { StorageManager } from '../.claude/lib/storageManager';

export type CacheSection =
  | 'synthesis'
  | 'wizard_recommendations'
  | 'practice_recommendations'
  | 'reasoning'
  | 'stack_balance';

interface CacheSectionMetadata {
  cachedAt: number; // timestamp
}

interface CacheMetadata {
  synthesis: CacheSectionMetadata;
  wizard_recommendations: CacheSectionMetadata;
  practice_recommendations: CacheSectionMetadata;
  reasoning: CacheSectionMetadata;
  stack_balance: CacheSectionMetadata;
  lastUpdate: number; // overall cache timestamp
  insightHash: string; // hash of insights for change detection
  practiceStackHash?: string; // hash of practice stack for change detection
}

interface CacheData {
  guidance: IntelligentGuidance;
  metadata: CacheMetadata;
}

const CACHE_KEY = 'intelligenceHubCache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate hash from insight context for change detection
 */
function generateInsightHashFromContext(context: IntelligenceContext): string {
  const contextData = JSON.stringify({
    insightsCount: context.integratedInsights.length,
    pendingPatternsCount: context.pendingPatterns.length,
    wizardSessionsCount: context.wizardSessions.length,
    lastWizardDate: context.wizardSessions[0]?.date || '',
    topPatterns: context.integratedInsights.slice(0, 3).map(i => i.detectedPattern),
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < contextData.length; i++) {
    const char = contextData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache guidance with per-section timestamps
 */
export function cacheGuidance(context: IntelligenceContext, guidance: IntelligentGuidance): void {
  try {
    const now = Date.now();
    const practiceStackHash = JSON.stringify(context.currentPracticeStack.map(p => p.id).sort());
    const cacheData: CacheData = {
      guidance,
      metadata: {
        synthesis: { cachedAt: now },
        wizard_recommendations: { cachedAt: now },
        practice_recommendations: { cachedAt: now },
        reasoning: { cachedAt: now },
        stack_balance: { cachedAt: now },
        lastUpdate: now,
        insightHash: generateInsightHashFromContext(context),
        practiceStackHash,
      },
    };

    StorageManager.setUntyped(CACHE_KEY, cacheData);
  } catch (err) {
    console.warn('[CacheService] Failed to cache guidance:', err);
  }
}

/**
 * Get cached guidance (returns null if expired or missing)
 */
export function getCachedGuidance(): IntelligentGuidance | null {
  try {
    const data = StorageManager.getUntyped(CACHE_KEY);
    if (!data) return null;

    const cacheData: CacheData = data as CacheData;

    // Check if overall cache is expired
    const age = Date.now() - cacheData.metadata.lastUpdate;
    if (age > CACHE_DURATION_MS) {
      return null;
    }

    return cacheData.guidance;
  } catch (err) {
    console.warn('[CacheService] Failed to get cached guidance:', err);
    return null;
  }
}

/**
 * Get cache metadata for inspection
 */
export function getCacheMetadata(): CacheMetadata | null {
  try {
    const data = StorageManager.getUntyped(CACHE_KEY);
    if (!data) return null;

    const cacheData: CacheData = data as CacheData;
    return cacheData.metadata;
  } catch (err) {
    console.warn('[CacheService] Failed to get cache metadata:', err);
    return null;
  }
}

/**
 * Invalidate specific section by resetting its timestamp
 */
export function invalidateSection(context: IntelligenceContext, section: CacheSection): void {
  try {
    const data = StorageManager.getUntyped(CACHE_KEY);
    if (!data) return;

    const cacheData: CacheData = data as CacheData;
    cacheData.metadata[section].cachedAt = 0;

    StorageManager.setUntyped(CACHE_KEY, cacheData);
    console.log(`[CacheService] Invalidated section: ${section}`);
  } catch (err) {
    console.warn('[CacheService] Failed to invalidate section:', err);
  }
}

/**
 * Determine which sections need regeneration based on context changes
 */
export function shouldRegenerate(context: IntelligenceContext): {
  shouldRegenerate: boolean;
  sectionsToRegenerate: CacheSection[];
  cachedGuidance?: IntelligentGuidance;
} {
  try {
    const data = StorageManager.getUntyped(CACHE_KEY);
    if (!data) {
      return {
        shouldRegenerate: true,
        sectionsToRegenerate: [
          'synthesis',
          'wizard_recommendations',
          'practice_recommendations',
          'reasoning',
          'stack_balance',
        ],
      };
    }

    const cacheData: CacheData = data as CacheData;
    const now = Date.now();
    const sectionsToRegenerate: CacheSection[] = [];

    // Check if overall cache expired
    if (now - cacheData.metadata.lastUpdate > CACHE_DURATION_MS) {
      return {
        shouldRegenerate: true,
        sectionsToRegenerate: [
          'synthesis',
          'wizard_recommendations',
          'practice_recommendations',
          'reasoning',
          'stack_balance',
        ],
      };
    }

    // Check if insights changed (triggers synthesis and reasoning regeneration)
    const currentHash = generateInsightHashFromContext(context);
    if (currentHash !== cacheData.metadata.insightHash) {
      sectionsToRegenerate.push('synthesis', 'reasoning');
    }

    // Check if practice stack changed (triggers practice recommendations)
    const currentPracticeStackHash = JSON.stringify(context.currentPracticeStack.map(p => p.id).sort());
    if (currentPracticeStackHash !== (cacheData.metadata as any).practiceStackHash) {
      if (!sectionsToRegenerate.includes('practice_recommendations')) {
        sectionsToRegenerate.push('practice_recommendations');
      }
    }

    // Check individual section expiration (24h per section)
    const checkSectionAge = (section: CacheSection) => {
      const age = now - cacheData.metadata[section].cachedAt;
      return age > CACHE_DURATION_MS;
    };

    if (checkSectionAge('synthesis') && !sectionsToRegenerate.includes('synthesis')) {
      sectionsToRegenerate.push('synthesis');
    }
    if (checkSectionAge('wizard_recommendations') && !sectionsToRegenerate.includes('wizard_recommendations')) {
      sectionsToRegenerate.push('wizard_recommendations');
    }
    if (checkSectionAge('practice_recommendations') && !sectionsToRegenerate.includes('practice_recommendations')) {
      sectionsToRegenerate.push('practice_recommendations');
    }
    if (checkSectionAge('reasoning') && !sectionsToRegenerate.includes('reasoning')) {
      sectionsToRegenerate.push('reasoning');
    }
    if (checkSectionAge('stack_balance') && !sectionsToRegenerate.includes('stack_balance')) {
      sectionsToRegenerate.push('stack_balance');
    }

    return {
      shouldRegenerate: sectionsToRegenerate.length > 0,
      sectionsToRegenerate,
      cachedGuidance: sectionsToRegenerate.length === 0 ? cacheData.guidance : undefined,
    };
  } catch (err) {
    console.warn('[CacheService] Failed to check regeneration status:', err);
    return {
      shouldRegenerate: true,
      sectionsToRegenerate: [
        'synthesis',
        'wizard_recommendations',
        'practice_recommendations',
        'reasoning',
        'stack_balance',
      ],
    };
  }
}

/**
 * Update specific sections in cache without full regeneration
 */
export function updateCachedSections(
  context: IntelligenceContext,
  updates: Partial<Record<CacheSection, any>>
): void {
  try {
    const data = StorageManager.getUntyped(CACHE_KEY);
    if (!data) {
      console.warn('[CacheService] No cache to update');
      return;
    }

    const cacheData: CacheData = data as CacheData;
    const now = Date.now();

    // Update guidance sections
    if (updates.synthesis) {
      cacheData.guidance.synthesis = updates.synthesis;
      cacheData.metadata.synthesis.cachedAt = now;
    }

    if (updates.wizard_recommendations) {
      cacheData.guidance.recommendations.nextWizard = updates.wizard_recommendations;
      cacheData.metadata.wizard_recommendations.cachedAt = now;
    }

    if (updates.practice_recommendations) {
      cacheData.guidance.recommendations.practiceChanges = updates.practice_recommendations;
      cacheData.metadata.practice_recommendations.cachedAt = now;
    }

    if (updates.reasoning) {
      cacheData.guidance.reasoning = updates.reasoning;
      cacheData.metadata.reasoning.cachedAt = now;
    }

    if (updates.stack_balance) {
      cacheData.guidance.recommendations.stackBalance = updates.stack_balance;
      cacheData.metadata.stack_balance.cachedAt = now;
    }

    StorageManager.setUntyped(CACHE_KEY, cacheData);
    console.log('[CacheService] Updated cache sections:', Object.keys(updates));
  } catch (err) {
    console.warn('[CacheService] Failed to update cache sections:', err);
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  try {
    StorageManager.delete(CACHE_KEY);
    console.log('[CacheService] Cache cleared');
  } catch (err) {
    console.warn('[CacheService] Failed to clear cache:', err);
  }
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(guidance: IntelligentGuidance): number {
  if (!guidance.generatedAt) {
    return Infinity;
  }
  return Date.now() - new Date(guidance.generatedAt).getTime();
}

/**
 * Check if cache is fresh enough to use
 */
export function isCacheFresh(guidance: IntelligentGuidance, maxAgeMs: number = CACHE_DURATION_MS): boolean {
  return getCacheAge(guidance) < maxAgeMs;
}
