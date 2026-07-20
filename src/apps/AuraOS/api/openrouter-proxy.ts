/**
 * Vercel Serverless Function: OpenRouter API Proxy
 *
 * Securely proxies OpenRouter API calls from the client, keeping the API key server-side.
 * The OPENROUTER_API_KEY is kept server-side only and never exposed to the client.
 *
 * Endpoint: POST /api/openrouter-proxy
 * Request body: {
 *   model: string,
 *   messages: Array<{ role: string, content: string }>,
 *   temperature?: number,
 *   max_tokens?: number,
 *   response_format?: { type: string }
 * }
 * Response: OpenRouter chat completion response
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Simple in-memory rate limiter (scoped to this specific serverless instance)
// Resets on cold start, but effectively prevents burst abuse from a single attacker
// on the same edge node.
// Note: As pointed out in PR review, this is stateless per-invocation. 
// A robust production solution requires a distributed cache (like Vercel KV, Upstash, or Redis)
// to maintain a centralized rate limit counter across all function instances.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  record.count += 1;
  return true;
}

// Allowed model whitelist — prevent clients from routing to expensive or unauthorized models
const ALLOWED_MODELS = new Set([
  'openrouter/free',
  'deepseek/deepseek-v4-pro', // AI Intelligence Hub
  'inception/mercury-2', // AI Coach primary model
  'grok/grok-4.1-fast',
  'deepseek/deepseek-v3.2-exp',
  'qwen/qwen3-30b-a3b-instruct-2507',
  'deepseek/deepseek-v3.2',
  'minimax/minimax-m2.5',
  'minimax/minimax-m2-her',
  'minimax/minimax-m2',
  'openai/gpt-oss-120b',
  // Legacy / preset variants
  'openai/gpt-oss-120b:exacto',
  'openai/gpt-oss-120b:nitro',
  'grok-4.1-fast-non-reasoning',
  'deepseek-v3.2@preset/32exp',
  'deepseek/deepseek-v3.2@preset/32exp',
  'x-ai/grok-4.1-fast',
  // STT / multimodal
  'google/gemini-3.1-flash-lite-preview',
  // AXIS + fallback models
  'moonshotai/kimi-k2.5',
  'xiaomi/mimo-v2-flash:nitro',
  'xiaomi/mimo-v2-flash',
]);

// Multimodal content part schema
const ContentPartSchema = z.union([
  z.string().min(1),
  z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
      image_url: z.object({ url: z.string() }).optional(),
      input_audio: z.object({ data: z.string(), format: z.string() }).optional(),
    })
  ),
]);

// Request validation schema
const OpenRouterRequestSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  messages: z
    .array(
      z.object({
        role: z.string().min(1),
        content: ContentPartSchema,
      })
    )
    .min(1, 'Messages array cannot be empty'),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
  preset: z.string().optional(),
  reasoning: z.object({
    enabled: z.boolean().optional(),
    effort: z.string().optional(),
  }).optional(),
  response_format: z.object({ type: z.string() }).optional(),
  provider: z.object({
    quantizations: z.array(z.string()).optional(),
    sort: z.string().optional(),
  }).optional(),
});

type OpenRouterRequest = z.infer<typeof OpenRouterRequestSchema>;

// CORS helper — only sets Allow-Origin when the request origin is explicitly allowed
const ALLOWED_ORIGINS = new Set(['https://auraos.space']);

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

  // Rate Limiting
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    console.warn(`[openrouter-proxy] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ error: 'Too Many Requests', details: 'Rate limit exceeded. Try again later.' });
  }

  try {
    // Validate request body
    let parsed: OpenRouterRequest;
    try {
      parsed = OpenRouterRequestSchema.parse(req.body);
    } catch (validationErr) {
      const zodErr = validationErr as z.ZodError;
      return res.status(400).json({
        error: 'Invalid request',
        details: zodErr.issues,
      });
    }

    // Enforce max_tokens limit
    if (parsed.max_tokens && parsed.max_tokens > 4000) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'max_tokens cannot exceed 4000',
      });
    }

    // Model whitelist check
    if (!ALLOWED_MODELS.has(parsed.model)) {
      return res.status(400).json({ error: 'Model not allowed', details: `Model '${parsed.model}' is not in the allowed list` });
    }

    // Prompt length guard (~8000 tokens)
    // For array content (multimodal), sum only the text parts; binary data (audio/image) excluded from char count
    const totalChars = parsed.messages.reduce((sum, m) => {
      if (typeof m.content === 'string') return sum + m.content.length;
      return sum + m.content.reduce((s, part) => s + (part.text?.length ?? 0), 0);
    }, 0);
    if (totalChars > 32_000) {
      return res.status(400).json({ error: 'Prompt too long' });
    }

    // Read server-side API key
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('[openrouter-proxy] Missing OPENROUTER_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Prepare OpenRouter request
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const requestBody = {
      model: parsed.model,
      messages: parsed.messages,
      ...(parsed.temperature !== undefined && { temperature: parsed.temperature }),
      ...(parsed.max_tokens && { max_tokens: parsed.max_tokens }),
      ...(parsed.stream !== undefined && { stream: parsed.stream }),
      ...(parsed.preset && { preset: parsed.preset }),
      ...(parsed.reasoning && { reasoning: parsed.reasoning }),
      ...(parsed.response_format && { response_format: parsed.response_format }),
      ...(parsed.provider && { provider: parsed.provider }),
    };

    // 25-second timeout on upstream fetch (Vercel function maxDuration is 30s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    // Call OpenRouter API
    let response: Response;
    try {
      response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[openrouter-proxy] OpenRouter API error: ${response.status}`,
        errorText
      );
      return res.status(response.status).json({
        error: 'OpenRouter API error',
        status: response.status,
        details: errorText,
      });
    }

    // Pipe SSE stream or return JSON
    if (parsed.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (!response.body) {
        return res.status(502).json({ error: 'No stream body from upstream' });
      }

      const reader = (response.body as unknown as ReadableStream<Uint8Array>).getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
      return;
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway Timeout', details: 'Upstream AI service took too long' });
    }
    console.error('[openrouter-proxy] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
