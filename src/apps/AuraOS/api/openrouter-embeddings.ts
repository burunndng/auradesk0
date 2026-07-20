/**
 * Vercel Serverless Function: OpenRouter Embeddings API Proxy
 *
 * Securely proxies OpenRouter embeddings API calls from the client, keeping the API key server-side.
 * The OPENROUTER_API_KEY is kept server-side only and never exposed to the client.
 *
 * Endpoint: POST /api/openrouter-embeddings
 * Request body: {
 *   model: string,
 *   input: string or string[],
 * }
 * Response: OpenRouter embeddings response
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Request validation schema
const OpenRouterEmbeddingsRequestSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  input: z.union([
    z.string().min(1),
    z.array(z.string().min(1))
  ], { message: 'Input must be a string or array of strings' }),
});

type OpenRouterEmbeddingsRequest = z.infer<typeof OpenRouterEmbeddingsRequestSchema>;

const ALLOWED_ORIGINS = new Set(['https://auraos.space']);

// CORS helper — mirrors the main proxy: only set Allow-Origin for explicitly allowed origins
function setCorsHeaders(res: VercelResponse, origin?: string): void {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  setCorsHeaders(res, origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate request body
    let parsed: OpenRouterEmbeddingsRequest;
    try {
      parsed = OpenRouterEmbeddingsRequestSchema.parse(req.body);
    } catch (validationErr) {
      const zodErr = validationErr as z.ZodError;
      return res.status(400).json({
        error: 'Invalid request',
        details: zodErr.issues,
      });
    }

    // Read server-side API key
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('[openrouter-embeddings] Missing OPENROUTER_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Prepare OpenRouter request
    const openRouterUrl = 'https://openrouter.ai/api/v1/embeddings';
    const requestBody = {
      model: parsed.model,
      input: parsed.input,
    };

    // Call OpenRouter API
    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[openrouter-embeddings] OpenRouter API error: ${response.status}`,
        errorText
      );
      return res.status(response.status).json({
        error: 'OpenRouter API error',
        status: response.status,
        details: errorText,
      });
    }

    // Return response
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[openrouter-embeddings] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
