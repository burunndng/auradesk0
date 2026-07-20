/**
 * Embedding Service
 *
 * Generates vector embeddings for text using Qwen via OpenRouter
 * Used for RAG (Retrieval-Augmented Generation) with AI Coach
 *
 * Flow:
 * 1. User uploads document → Split into chunks
 * 2. Generate embedding for each chunk → Store in Supabase pgvector
 * 3. User asks question → Generate embedding → Search similar chunks
 * 4. Send chunks to LLM for context-aware response
 */

const OPENROUTER_PROXY_URL = '/api/openrouter-proxy';
const EMBEDDING_MODEL = 'qwen/qwen3-embedding-8b'; // High-quality, cost-effective embeddings

// Chunk configuration
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks for context preservation

export interface EmbeddingResult {
  success: boolean;
  embedding?: number[];
  error?: string;
}

export interface ChunkWithEmbedding {
  content: string;
  chunkIndex: number;
  embedding: number[];
}

/**
 * Generate embedding for a single piece of text
 *
 * @param text - Text to generate embedding for
 * @returns Embedding vector (4096 dimensions)
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    console.log('[EmbeddingService] 🔄 Calling Qwen embeddings API through proxy...');

    // Call embeddings endpoint through proxy
    // Note: The proxy at /api/openrouter-proxy is designed for chat completions
    // For embeddings, we need to make a direct call to a dedicated embeddings proxy
    // Fallback: Use the chat proxy to call the embeddings endpoint
    const response = await fetch('/api/openrouter-embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000), // Limit input size
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMsg = error.error?.message || `Embedding API request failed (${response.status})`;
      console.error('[EmbeddingService] ❌ API Error:', errorMsg, 'Response:', error);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('[EmbeddingService] ❌ Invalid response format:', data);
      throw new Error('Invalid embedding response format');
    }

    let embedding = data.data[0].embedding;
    console.log('[EmbeddingService] ✅ Embedding received:', embedding.length, 'dimensions');

    return {
      success: true,
      embedding,
    };
  } catch (error: any) {
    console.error('[EmbeddingService] ❌ Failed to generate embedding:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to generate embedding',
    };
  }
}

/**
 * Split text into chunks with overlap
 *
 * @param text - Full text to split
 * @param chunkSize - Size of each chunk (characters)
 * @param overlap - Overlap between chunks (characters)
 * @returns Array of text chunks
 */
export function splitIntoChunks(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const chunks: string[] = [];
  let position = 0;

  while (position < text.length) {
    const end = Math.min(position + chunkSize, text.length);
    const chunk = text.slice(position, end);
    chunks.push(chunk);

    // Move position forward, accounting for overlap
    position += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Process a document: split into chunks and generate embeddings
 *
 * @param text - Full document text
 * @param onProgress - Callback for progress updates (chunk index, total chunks)
 * @returns Array of chunks with embeddings
 */
export async function processDocument(
  text: string,
  onProgress?: (current: number, total: number) => void
): Promise<ChunkWithEmbedding[]> {
  const chunks = splitIntoChunks(text);
  const results: ChunkWithEmbedding[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    const result = await generateEmbedding(chunk);

    if (result.success && result.embedding) {
      results.push({
        content: chunk,
        chunkIndex: i,
        embedding: result.embedding,
      });
    } else {
      console.warn(`[Embedding Service] Failed to embed chunk ${i}:`, result.error);
    }

    // Rate limiting: wait 100ms between requests to avoid hitting OpenAI rate limits
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two vectors
 * Used for finding similar chunks in vector search
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Check if embedding service is configured
 * Since we're using the proxy, this is always true if the proxy endpoint exists
 */
export function isConfigured(): boolean {
  return true;
}

// Export service object
export const embeddingService = {
  generateEmbedding,
  splitIntoChunks,
  processDocument,
  cosineSimilarity,
  isConfigured,
};

export default embeddingService;
