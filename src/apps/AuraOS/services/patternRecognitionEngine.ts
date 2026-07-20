/**
 * Pattern Clustering & Recognition Engine
 * Groups related IntegratedInsights by semantic similarity
 * Enables the Intelligence Hub to synthesize cross-cutting patterns
 */

import type { IntegratedInsight } from '../types';
import { generateEmbedding, generateEmbeddings, cosineSimilarity } from '../.claude/lib/embeddings';
import { StorageManager } from '../.claude/lib/storageManager';

/**
 * Pattern Cluster - group of semantically similar insights
 */
export interface PatternCluster {
  id: string;
  insights: IntegratedInsight[];
  centroid: number[]; // Average embedding of the cluster
  similarity_scores: Record<string, number>; // id -> similarity score for each insight
  metadata: {
    theme: string; // Identified theme across insights
    strength: number; // 0-1, based on average similarity
    representative_insight_id: string; // Most representative insight
  };
}

/**
 * Pattern Family - related clusters grouped by theme
 */
export interface PatternFamily {
  id: string;
  name: string;
  clusters: PatternCluster[];
  evolution_history: PatternEvolution[];
  timestamp: string;
  metadata: {
    total_insights: number;
    primary_theme: string;
    related_themes: string[];
    strength: number; // Overall family strength
  };
}

/**
 * Pattern Evolution - tracks how patterns change over time
 */
export interface PatternEvolution {
  emerged_at: string; // ISO timestamp
  evolved_at: string; // ISO timestamp
  strength_trend: 'increasing' | 'stable' | 'decreasing';
  related_patterns: string[]; // IDs of related pattern families
  description: string; // How this pattern evolved
}

const STORAGE_KEY = 'patternClusters';
const SIMILARITY_THRESHOLD = 0.75;
const MIN_CLUSTER_SIZE = 2; // Minimum insights per cluster

/**
 * Main clustering function - groups insights by semantic similarity
 *
 * @param insights - Array of IntegratedInsights to cluster
 * @returns Array of PatternClusters
 * @throws Error if embeddings fail to generate
 */
export async function clusterInsights(insights: IntegratedInsight[]): Promise<PatternCluster[]> {
  // Handle edge cases
  if (!insights || insights.length === 0) {
    console.log('[PatternRecognition] No insights to cluster');
    return [];
  }

  if (insights.length === 1) {
    // Single insight becomes a trivial cluster
    return [await createTrivialCluster(insights[0])];
  }

  // Validate all insights have required fields
  const validInsights = insights.filter((i) => {
    if (!i.id || !i.mindToolReport) {
      console.warn('[PatternRecognition] Skipping invalid insight:', i.id);
      return false;
    }
    return true;
  });

  if (validInsights.length === 0) {
    throw new Error('No valid insights with required fields (id, mindToolReport)');
  }

  // Generate embeddings for all insights
  console.log(`[PatternRecognition] Generating embeddings for ${validInsights.length} insights`);
  const embeddingTexts = validInsights.map((i) => generateEmbeddingText(i));
  const embeddings = await generateEmbeddings(embeddingTexts);

  if (embeddings.length === 0) {
    throw new Error('Failed to generate embeddings');
  }

  // Create insight-embedding pairs
  const insightEmbeddings = validInsights.map((insight, index) => ({
    insight,
    embedding: embeddings[index],
  }));

  // Cluster using hierarchical agglomerative clustering
  const clusters = performClustering(insightEmbeddings);

  console.log(`[PatternRecognition] Created ${clusters.length} clusters from ${validInsights.length} insights`);
  return clusters;
}

/**
 * Detect pattern families - group related clusters
 *
 * @param clusters - Array of PatternClusters
 * @returns Array of PatternFamilies
 */
export async function detectPatternFamilies(clusters: PatternCluster[]): Promise<PatternFamily[]> {
  if (!clusters || clusters.length === 0) {
    console.log('[PatternRecognition] No clusters to group into families');
    return [];
  }

  if (clusters.length === 1) {
    // Single cluster becomes trivial family
    return [
      {
        id: `family-${clusters[0].id}`,
        name: clusters[0].metadata.theme,
        clusters: [clusters[0]],
        evolution_history: [],
        timestamp: new Date().toISOString(),
        metadata: {
          total_insights: clusters[0].insights.length,
          primary_theme: clusters[0].metadata.theme,
          related_themes: [],
          strength: clusters[0].metadata.strength,
        },
      },
    ];
  }

  // Generate embeddings for cluster centroids
  console.log(`[PatternRecognition] Grouping ${clusters.length} clusters into families`);
  const clusterCentroids = clusters.map((c) => c.centroid);
  const familyClusters: PatternCluster[][] = [];
  const clustered = new Set<number>();

  // Group clusters with high similarity
  for (let i = 0; i < clusters.length; i++) {
    if (clustered.has(i)) continue;

    const family = [clusters[i]];
    clustered.add(i);

    // Find related clusters
    for (let j = i + 1; j < clusters.length; j++) {
      if (clustered.has(j)) continue;

      const similarity = cosineSimilarity(clusterCentroids[i], clusterCentroids[j]);
      if (similarity > SIMILARITY_THRESHOLD) {
        family.push(clusters[j]);
        clustered.add(j);
      }
    }

    familyClusters.push(family);
  }

  // Convert to PatternFamily objects
  const families: PatternFamily[] = familyClusters.map((familyClusters, index) => {
    const totalInsights = familyClusters.reduce((sum, c) => sum + c.insights.length, 0);
    const themes = familyClusters.map((c) => c.metadata.theme);
    const primaryTheme = themes[0] || 'Unknown Theme';
    const relatedThemes = themes.slice(1);
    const avgStrength = familyClusters.reduce((sum, c) => sum + c.metadata.strength, 0) / familyClusters.length;

    return {
      id: `family-${index}-${Date.now()}`,
      name: primaryTheme,
      clusters: familyClusters,
      evolution_history: [],
      timestamp: new Date().toISOString(),
      metadata: {
        total_insights: totalInsights,
        primary_theme: primaryTheme,
        related_themes: relatedThemes,
        strength: avgStrength,
      },
    };
  });

  return families;
}

/**
 * Generate unique identifier for pattern group
 *
 * @param insights - Array of IntegratedInsights
 * @returns Unique signature string
 */
export function computePatternSignature(insights: IntegratedInsight[]): string {
  if (!insights || insights.length === 0) {
    return 'empty-signature';
  }

  // Sort IDs for consistent ordering
  const sortedIds = insights.map((i) => i.id).sort();

  // Create hash from sorted IDs and metadata
  const combined = sortedIds.join('|');
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `sig-${Math.abs(hash).toString(36)}`;
}

/**
 * Track pattern evolution over time
 *
 * @param currentInsights - Current batch of insights
 * @param historicalPatterns - Previous pattern families from history
 * @returns Pattern evolution information
 */
export async function trackPatternEvolution(
  currentInsights: IntegratedInsight[],
  historicalPatterns: PatternFamily[],
): Promise<PatternEvolution> {
  const now = new Date().toISOString();

  if (!historicalPatterns || historicalPatterns.length === 0) {
    // First emergence
    return {
      emerged_at: now,
      evolved_at: now,
      strength_trend: 'stable',
      related_patterns: [],
      description: 'New pattern detected',
    };
  }

  // Calculate current pattern strength
  const currentStrength = currentInsights.length > 0 ? Math.min(1, currentInsights.length / 10) : 0;

  // Compare with historical average
  const historicalAvgStrength =
    historicalPatterns.reduce((sum, p) => sum + p.metadata.strength, 0) / historicalPatterns.length;

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (currentStrength > historicalAvgStrength * 1.1) {
    trend = 'increasing';
  } else if (currentStrength < historicalAvgStrength * 0.9) {
    trend = 'decreasing';
  }

  return {
    emerged_at: historicalPatterns[0]?.timestamp || now,
    evolved_at: now,
    strength_trend: trend,
    related_patterns: historicalPatterns.map((p) => p.id),
    description: `Pattern ${trend} over time. Current strength: ${currentStrength.toFixed(2)}`,
  };
}

/**
 * Store clusters in localStorage
 *
 * @param clusters - Array of PatternClusters to store
 */
export function persistClusters(clusters: PatternCluster[]): void {
  try {
    const data = {
      clusters,
      savedAt: Date.now(),
    };
    StorageManager.setUntyped(STORAGE_KEY, data);
    console.log(`[PatternRecognition] Persisted ${clusters.length} clusters to localStorage`);
  } catch (error) {
    console.error('[PatternRecognition] Failed to persist clusters:', error);
  }
}

/**
 * Retrieve clusters from localStorage
 *
 * @returns Array of stored PatternClusters or empty array
 */
export function retrievePersistedClusters(): PatternCluster[] {
  try {
    const stored = StorageManager.getUntyped(STORAGE_KEY);
    if (!stored) {
      console.log('[PatternRecognition] No persisted clusters found');
      return [];
    }

    const data = stored as any;
    console.log(`[PatternRecognition] Retrieved ${data.clusters?.length || 0} clusters from localStorage`);
    return data.clusters || [];
  } catch (error) {
    console.error('[PatternRecognition] Failed to retrieve persisted clusters:', error);
    return [];
  }
}

/**
 * Clear persisted clusters from localStorage
 */
export function clearPersistedClusters(): void {
  try {
    StorageManager.delete(STORAGE_KEY);
    console.log('[PatternRecognition] Cleared persisted clusters');
  } catch (error) {
    console.error('[PatternRecognition] Failed to clear persisted clusters:', error);
  }
}

/**
 * Internal: Generate text for embedding from insight
 */
function generateEmbeddingText(insight: IntegratedInsight): string {
  const parts = [
    insight.mindToolType,
    insight.detectedPattern,
    insight.mindToolReport,
    insight.mindToolShortSummary,
    (insight.suggestedShadowWork || []).map((s) => s.rationale).join(' '),
  ];

  return parts.filter((p) => p).join(' ');
}

/**
 * Internal: Create trivial single-insight cluster
 */
async function createTrivialCluster(insight: IntegratedInsight): Promise<PatternCluster> {
  const embedding = await generateEmbedding(generateEmbeddingText(insight));
  return {
    id: `cluster-${insight.id}`,
    insights: [insight],
    centroid: embedding,
    similarity_scores: { [insight.id]: 1.0 },
    metadata: {
      theme: insight.mindToolType,
      strength: 0.5, // Single insight = moderate strength
      representative_insight_id: insight.id,
    },
  };
}

/**
 * Internal: Hierarchical agglomerative clustering
 * Groups insights by semantic similarity with threshold
 */
function performClustering(
  insightEmbeddings: Array<{ insight: IntegratedInsight; embedding: number[] }>,
): PatternCluster[] {
  // Start with single-insight clusters
  let clusters = insightEmbeddings.map((ie) => ({
    insights: [ie.insight],
    centroid: ie.embedding,
    lastMergeSimilarity: 1.0, // Track merge similarity for each cluster
  }));

  // Iteratively merge closest clusters
  while (clusters.length > 1) {
    let bestI = -1;
    let bestJ = -1;
    let bestSimilarity = SIMILARITY_THRESHOLD;

    // Find most similar pair
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = cosineSimilarity(clusters[i].centroid, clusters[j].centroid);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestI = i;
          bestJ = j;
        }
      }
    }

    // No more mergeable pairs
    if (bestI === -1) break;

    // Merge clusters
    const mergedInsights = [...clusters[bestI].insights, ...clusters[bestJ].insights];

    // Compute new centroid
    const newCentroid = computeCentroid(clusters[bestI].centroid, clusters[bestJ].centroid);

    // Create merged cluster
    clusters[bestI] = {
      insights: mergedInsights,
      centroid: newCentroid,
      lastMergeSimilarity: bestSimilarity,
    };

    // Remove merged cluster
    clusters.splice(bestJ, 1);
  }

  // Convert to PatternCluster with metadata
  return clusters.map((cluster, index) => {
    const similarity_scores: Record<string, number> = {};
    for (const insight of cluster.insights) {
      similarity_scores[insight.id] = 1.0; // All insights in cluster are similar to centroid
    }

    // Identify most representative insight (closest to centroid)
    if (cluster.insights.length === 0) {
      return {
        id: `cluster-${index}-${Date.now()}`,
        insights: cluster.insights,
        centroid: cluster.centroid,
        similarity_scores,
        metadata: {
          theme: 'Unknown',
          strength: 0,
          representative_insight_id: '',
        },
      };
    }

    let representative = cluster.insights[0].id;
    let maxSimilarity = -Infinity;
    for (const insight of cluster.insights) {
      const embedding = insightEmbeddings.find(ie => ie.insight.id === insight.id)?.embedding;
      if (!embedding) continue;
      const similarity = cosineSimilarity(embedding, cluster.centroid);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        representative = insight.id;
      }
    }

    return {
      id: `cluster-${index}-${Date.now()}`,
      insights: cluster.insights,
      centroid: cluster.centroid,
      similarity_scores,
      metadata: {
        theme: cluster.insights[0].mindToolType,
        strength: Math.min(1, (cluster.insights.length / 5) * cluster.lastMergeSimilarity),
        representative_insight_id: representative,
      },
    };
  });
}

/**
 * Internal: Compute average of two embeddings
 */
function computeCentroid(emb1: number[], emb2: number[]): number[] {
  return emb1.map((val, i) => (val + emb2[i]) / 2);
}
