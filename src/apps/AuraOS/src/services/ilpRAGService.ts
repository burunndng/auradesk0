/**
 * ILP RAG Service - AI Coach document retrieval
 * Enables the AI Coach to access ILP documentation when answering questions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Support both Vite (import.meta.env) and Node.js (process.env) environments
    const supabaseUrl =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
      process.env.VITE_SUPABASE_URL;

    const supabaseKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase credentials: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY required'
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    section: string;
  };
  similarity?: number;
}

/**
 * Generate embedding for a query using Qwen model
 */
async function generateQueryEmbedding(text: string): Promise<number[]> {
  // In production, this would call OpenRouter API with Qwen model
  // For now, use deterministic hashing for client-side queries
  // TODO: Implement actual API call when available on client

  const embedding: number[] = [];
  const seed = text.length;

  // Generate 1536-dimensional vector from text hash
  for (let i = 0; i < 1536; i++) {
    let hash = seed;
    for (let j = 0; j < Math.min(text.length, 10); j++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(j);
      hash = hash & hash;
    }
    hash = Math.abs(hash + i * 73856093) ^ (seed << 13);
    const value = Math.sin(hash / 1000) * Math.cos((hash + i) / 2000);
    embedding.push(value);
  }

  let norm = 0;
  for (const v of embedding) norm += v * v;
  norm = Math.sqrt(norm);

  return embedding.map(v => v / (norm || 1));
}

/**
 * Search documents using vector similarity (or text fallback)
 */
export async function searchDocuments(query: string, limit: number = 5): Promise<Document[]> {
  try {
    const supabase = getSupabaseClient();
    const queryEmbedding = await generateQueryEmbedding(query);

    // Call the match_documents RPC function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: limit,
    });

    if (error) {
      console.error('[RAG] Vector search failed:', error);
      // Fallback to text search
      return await textSearch(query, limit);
    }

    return (data || []).map((doc: any) => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      similarity: doc.similarity,
    }));
  } catch (error) {
    console.error('[RAG] Search error:', error);
    return [];
  }
}

/**
 * Fallback: Simple text search if vector search fails
 */
async function textSearch(query: string, limit: number): Promise<Document[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .textSearch('content', query, { type: 'websearch' })
      .limit(limit);

    if (error) {
      console.error('[RAG] Text search failed:', error);
      return [];
    }

    return (data || []).map((doc: any) => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
    }));
  } catch (error) {
    console.error('[RAG] Text search error:', error);
    return [];
  }
}

/**
 * Format documents for LLM prompt injection
 */
export function formatDocsForPrompt(docs: Document[]): string {
  if (docs.length === 0) {
    return 'No relevant reference materials found.';
  }

  return `Reference Materials:\n${docs
    .map(
      (doc, i) =>
        `[${i + 1}. ${doc.metadata.section}]\n${doc.content.slice(0, 300)}...`
    )
    .join('\n\n')}`;
}

/**
 * Check if documents are available in database
 */
export async function hasDocuments(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[RAG] Check failed:', error);
      return false;
    }

    return (count || 0) > 0;
  } catch (error) {
    console.error('[RAG] Availability check error:', error);
    return false;
  }
}
