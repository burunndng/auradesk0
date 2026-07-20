/**
 * Local Vector Storage (In-Memory)
 * Provides semantic search capabilities using local in-memory storage
 * No external dependencies - uses mock embeddings for development/testing
 */

import { cosineSimilarity } from './embeddings.js';
import type { PineconeVector, QueryResult, PineconeVectorMetadata } from './types.js';

interface VectorIndexClient {
  upsert(vectors: PineconeVector[]): Promise<number>;
  query(embedding: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]>;
  fetch(ids: string[]): Promise<PineconeVector[]>;
  delete(ids: string[]): Promise<void>;
  describeIndexStats(): Promise<{ vectorCount: number; totalVectorCount: number }>;
}

/**
 * Local In-Memory Vector Index
 * Stores vectors in memory for semantic search without external dependencies
 */
class LocalVectorIndex implements VectorIndexClient {
  private vectors: Map<string, PineconeVector> = new Map();

  async upsert(vectors: PineconeVector[]): Promise<number> {
    for (const vector of vectors) {
      this.vectors.set(vector.id, vector);
    }
    console.log(`[LocalVector] Upserted ${vectors.length} vectors (in-memory)`);
    return vectors.length;
  }

  async query(
    embedding: number[],
    topK: number = 5,
    filter?: Record<string, any>,
  ): Promise<QueryResult[]> {
    const results: Array<{ id: string; score: number; metadata: PineconeVectorMetadata }> = [];

    for (const [id, vector] of this.vectors) {
      // Check filter if provided
      if (filter && !this.matchesFilter(vector.metadata, filter)) {
        continue;
      }

      const similarity = cosineSimilarity(embedding, vector.values);
      results.push({
        id,
        score: similarity,
        metadata: vector.metadata,
      });
    }

    // Sort by similarity score (descending) and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async fetch(ids: string[]): Promise<PineconeVector[]> {
    return ids.map((id) => this.vectors.get(id)).filter((v) => v !== undefined) as PineconeVector[];
  }

  async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.vectors.delete(id);
    }
    console.log(`[LocalVector] Deleted ${ids.length} vectors (in-memory)`);
  }

  async describeIndexStats(): Promise<{ vectorCount: number; totalVectorCount: number }> {
    const count = this.vectors.size;
    return {
      vectorCount: count,
      totalVectorCount: count,
    };
  }

  private matchesFilter(metadata: PineconeVectorMetadata, filter: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key as keyof PineconeVectorMetadata] !== value) {
        return false;
      }
    }
    return true;
  }
}

// Singleton instance
let indexInstance: VectorIndexClient | null = null;

/**
 * Initialize Local Vector index (in-memory)
 */
export async function initializeUpstash(): Promise<VectorIndexClient> {
  if (!indexInstance) {
    indexInstance = new LocalVectorIndex();
    console.log('[LocalVector] Index initialized (using local in-memory storage)');
  }
  return indexInstance;
}

/**
 * Get Local Vector index instance
 */
export function getUpstashIndex(): VectorIndexClient {
  if (!indexInstance) {
    throw new Error('Local Vector index not initialized. Call initializeUpstash() first.');
  }
  return indexInstance;
}

/**
 * Upsert vectors to Local Vector storage
 */
export async function upsertVectors(vectors: PineconeVector[]): Promise<number> {
  const index = indexInstance || (await initializeUpstash());
  return index.upsert(vectors);
}

/**
 * Query vectors from Local Vector storage
 */
export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, any>,
): Promise<QueryResult[]> {
  const index = indexInstance || (await initializeUpstash());
  return index.query(embedding, topK, filter);
}

/**
 * Fetch specific vectors by ID
 */
export async function fetchVectors(ids: string[]): Promise<PineconeVector[]> {
  const index = indexInstance || (await initializeUpstash());
  return index.fetch(ids);
}

/**
 * Delete vectors from Local Vector storage
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  const index = indexInstance || (await initializeUpstash());
  await index.delete(ids);
}

/**
 * Get index statistics
 */
export async function getIndexStats(): Promise<{
  vectorCount: number;
  totalVectorCount: number;
}> {
  const index = indexInstance || (await initializeUpstash());
  return index.describeIndexStats();
}

/**
 * Batch upsert with progress tracking
 */
export async function batchUpsertVectors(
  vectors: PineconeVector[],
  batchSize: number = 100,
  onProgress?: (current: number, total: number) => void,
): Promise<number> {
  const index = indexInstance || (await initializeUpstash());
  let totalUpserted = 0;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, Math.min(i + batchSize, vectors.length));
    const upserted = await index.upsert(batch);
    totalUpserted += upserted;

    if (onProgress) {
      onProgress(Math.min(i + batchSize, vectors.length), vectors.length);
    }
  }

  return totalUpserted;
}

/**
 * Semantic search with filters
 */
export async function semanticSearch(
  embedding: number[],
  options: {
    topK?: number;
    type?: 'practice' | 'framework' | 'user_session' | 'insight';
    category?: string;
    difficulty?: string;
    minSimilarity?: number;
  } = {},
): Promise<QueryResult[]> {
  const { topK = 5, type, category, difficulty, minSimilarity = 0 } = options;

  const filter: Record<string, any> = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;

  const results = await queryVectors(embedding, topK, filter);
  return results.filter((result) => result.score >= minSimilarity);
}

/**
 * Health check for Local Vector storage
 */
export async function healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
  try {
    const stats = await getIndexStats();
    return {
      status: 'ok',
      message: `Local Vector storage healthy. Total vectors: ${stats.totalVectorCount}`,
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Local Vector storage error: ${error}`,
    };
  }
}
