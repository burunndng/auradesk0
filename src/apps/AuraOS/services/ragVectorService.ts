/**
 * RAG Vector Service
 *
 * Handles storage and retrieval of document embeddings in Supabase pgvector
 * Provides semantic search for AI Coach knowledge base
 *
 * Architecture:
 * - Embeddings stored in user_document_embeddings table (pgvector)
 * - User uploads doc → Chunk → Embed → Store
 * - User asks question → Embed question → Search similar chunks → Return to LLM
 */

import { supabase } from './supabaseClient';
import { embeddingService } from './embeddingService';
import { authService } from './authService';

export interface DocumentChunk {
  id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface SearchResult {
  content: string;
  fileName: string;
  chunkIndex: number;
  similarity: number;
}

/**
 * Store embeddings for a document in Supabase pgvector
 *
 * @param fileName - Name of the uploaded file
 * @param filePath - S3 path to the file
 * @param chunks - Array of chunks with embeddings
 * @returns Success status
 */
export async function storeDocumentEmbeddings(
  fileName: string,
  filePath: string,
  chunks: Array<{ content: string; chunkIndex: number; embedding: number[] }>
): Promise<boolean> {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Prepare records for insertion
    const records: DocumentChunk[] = chunks.map(chunk => ({
      user_id: user.id,
      file_name: fileName,
      file_path: filePath,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: {
        uploadedAt: new Date().toISOString(),
        chunkSize: chunk.content.length,
      },
    }));

    // Insert in batches (Supabase has a 1000 row limit per insert)
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { error } = await (supabase as any)
        .from('user_document_embeddings')
        .insert(batch);

      if (error) {
        console.error('[RAG Vector] Batch insert failed:', error);
        throw error;
      }
    }

    console.log(`[RAG Vector] Stored ${records.length} embeddings for ${fileName}`);
    return true;
  } catch (error: any) {
    console.error('[RAG Vector] Failed to store embeddings:', error);
    return false;
  }
}

/**
 * Search for similar document chunks using vector similarity
 *
 * @param query - User's question/query
 * @param limit - Number of results to return (default: 5)
 * @param similarityThreshold - Minimum similarity score (0-1, default: 0.7)
 * @returns Array of relevant chunks, sorted by similarity
 */
export async function searchSimilarChunks(
  query: string,
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    const user = await authService.getCurrentUser();

    // Generate embedding for the query
    if (!embeddingService.isConfigured()) {
      console.warn('[RAG Vector] ⚠️ Embedding service NOT configured - embedding proxy endpoint is unavailable');
      console.warn('[RAG Vector] Coach will respond without knowledge base context');
      return []; // Return empty results instead of throwing
    }

    console.log('[RAG Vector] 🔍 Generating embedding for query:', query.substring(0, 50) + '...');
    const embeddingResult = await embeddingService.generateEmbedding(query);

    if (!embeddingResult.success) {
      console.error('[RAG Vector] ❌ Embedding generation FAILED:', embeddingResult.error);
      throw new Error(embeddingResult.error || 'Failed to generate query embedding');
    }

    if (!embeddingResult.embedding) {
      console.error('[RAG Vector] ❌ Embedding returned null/undefined');
      throw new Error('Embedding returned null');
    }

    console.log('[RAG Vector] ✅ Embedding generated successfully (' + embeddingResult.embedding.length + ' dimensions)');

    // Convert number array to pgvector string format "[1,2,3,...]"
    const queryEmbedding = JSON.stringify(embeddingResult.embedding);
    let results: SearchResult[] = [];

    // 1. Search user-uploaded documents (if authenticated)
    // Note: Currently using match_documents for both user and ILP docs
    // User docs stored in 'documents' table with user metadata
    if (user) {
      console.log('[RAG Vector] 🔍 Searching user-uploaded documents...');
      try {
        const { data, error } = await supabase.rpc('match_documents', {
          query_embedding: queryEmbedding,
          match_count: Math.ceil(limit / 2),
          match_threshold: similarityThreshold,
        });

        if (error) {
          console.warn('[RAG Vector] ⚠️ User document search failed:', error.message || error);
        } else if (!data) {
          console.log('[RAG Vector] ℹ️ No user documents found');
        } else if (data.length > 0) {
          const userResults: SearchResult[] = data
            .filter((row: any) => row.metadata?.user_id === user.id) // Filter by user in metadata
            .map((row: any) => ({
              content: row.content,
              fileName: row.metadata?.source || 'User Document',
              chunkIndex: 0,
              similarity: row.similarity,
            }));
          results.push(...userResults);
          console.log(`[RAG Vector] ✅ Found ${userResults.length} user document chunks`);
        }
      } catch (error) {
        console.error('[RAG Vector] ❌ User document search error:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('[RAG Vector] ℹ️ User not authenticated, skipping user document search');
    }

    // 2. Search ILP documentation (public, always available)
    console.log('[RAG Vector] 🔍 Searching ILP documentation...');
    try {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: Math.ceil(limit / 2), // Split limit between user docs and ILP docs
        match_threshold: similarityThreshold,
      });

      if (error) {
        console.error('[RAG Vector] ❌ ILP RPC call failed:', error.message || error);
      } else if (!data) {
        console.warn('[RAG Vector] ⚠️ ILP RPC returned null data');
      } else if (data.length === 0) {
        console.log('[RAG Vector] ℹ️ No ILP documents found (threshold may be too strict)');
      } else {
        const ilpResults: SearchResult[] = data.map((row: any) => ({
          content: row.content,
          fileName: row.metadata?.source || 'ILP Docs',
          chunkIndex: 0,
          similarity: row.similarity,
        }));
        results.push(...ilpResults);
        console.log(`[RAG Vector] ✅ Found ${ilpResults.length} ILP documentation chunks with similarities:`, data.map((r: any) => `${(r.similarity * 100).toFixed(0)}%`).join(', '));
      }
    } catch (error) {
      console.error('[RAG Vector] ❌ ILP search error:', error instanceof Error ? error.message : error);
    }

    // Filter by threshold and limit
    results = results
      .filter(r => r.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    if (results.length === 0) {
      console.log('[RAG Vector] No similar chunks found across all sources');
      return [];
    }

    console.log(`[RAG Vector] Found ${results.length} total similar chunks (threshold: ${similarityThreshold})`);
    return results;
  } catch (error: any) {
    console.error('[RAG Vector] Search failed:', error);
    return [];
  }
}

/**
 * Delete all embeddings for a specific file
 *
 * @param fileName - Name of the file
 * @returns Success status
 */
export async function deleteDocumentEmbeddings(fileName: string): Promise<boolean> {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await (supabase as any)
      .from('user_document_embeddings')
      .delete()
      .eq('user_id', user.id)
      .eq('file_name', fileName);

    if (error) {
      console.error('[RAG Vector] Delete failed:', error);
      throw error;
    }

    console.log(`[RAG Vector] Deleted embeddings for ${fileName}`);
    return true;
  } catch (error: any) {
    console.error('[RAG Vector] Delete failed:', error);
    return false;
  }
}

/**
 * Get statistics about the user's knowledge base
 *
 * @returns Stats object with document count, chunk count, etc.
 */
export async function getKnowledgeBaseStats(): Promise<{
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}> {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return { documentCount: 0, chunkCount: 0, totalSize: 0 };
    }

    const { data, error } = await (supabase as any)
      .from('user_document_embeddings')
      .select('file_name, content')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { documentCount: 0, chunkCount: 0, totalSize: 0 };
    }

    const uniqueFiles = new Set(data.map(row => row.file_name));
    const totalSize = data.reduce((sum, row) => sum + row.content.length, 0);

    return {
      documentCount: uniqueFiles.size,
      chunkCount: data.length,
      totalSize,
    };
  } catch (error: any) {
    console.error('[RAG Vector] Failed to get stats:', error);
    return { documentCount: 0, chunkCount: 0, totalSize: 0 };
  }
}

/**
 * Build context string from search results for LLM
 *
 * @param results - Search results from vector search
 * @returns Formatted context string
 */
export function buildContextFromResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const contextParts = results.map((result, index) => {
    return `[Source ${index + 1}: ${result.fileName}, chunk ${result.chunkIndex}, relevance: ${(result.similarity * 100).toFixed(0)}%]\n${result.content}`;
  });

  return contextParts.join('\n\n---\n\n');
}

// Export service object
export const ragVectorService = {
  storeDocumentEmbeddings,
  searchSimilarChunks,
  deleteDocumentEmbeddings,
  getKnowledgeBaseStats,
  buildContextFromResults,
};

export default ragVectorService;
