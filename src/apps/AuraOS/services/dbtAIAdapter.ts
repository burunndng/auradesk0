import { z } from 'zod';
import {
  callGrokThenAIJson,
  callOpenRouterGrokPrimary,
  callOpenRouterMimoFallback,
  callOpenRouterQwenFallback,
} from './ai/aiCore';

/**
 * Structured JSON call for DBT Coach using Grok → MiMo → Qwen fallback chain
 * Routes through /api/openrouter-proxy to keep API key server-side.
 */
export async function dbtAICall<T>(
  systemPrompt: string,
  userMessage: string,
  schema: z.ZodSchema<T>,
  options?: { model?: string; temperature?: number }
): Promise<T> {
  return callGrokThenAIJson<T>(
    'DBTCoach',
    systemPrompt + '\n\n' + userMessage,
    'unused-param',
    schema
  );
}

/**
 * Conversational text call for DBT Coach chat using Grok → MiMo → Qwen fallback chain.
 * Uses plain-text generation (no response_format: json_object) so all three models work.
 * Delivers the full response via onChunk callback when done.
 */
export async function dbtAIStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  options?: { model?: string; temperature?: number; reasoning?: boolean }
): Promise<string> {
  const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

  let text: string;
  try {
    text = await callOpenRouterGrokPrimary(fullPrompt);
  } catch (grokErr) {
    console.warn('[DBT] Grok failed for stream, trying MiMo:', grokErr);
    try {
      text = await callOpenRouterMimoFallback(fullPrompt);
    } catch (mimoErr) {
      console.warn('[DBT] MiMo failed for stream, trying Qwen:', mimoErr);
      text = await callOpenRouterQwenFallback(fullPrompt);
    }
  }

  onChunk(text);
  return text;
}
