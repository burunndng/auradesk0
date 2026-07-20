// services/ai/aiCore.ts
// Core LLM functions extracted from aiService.ts
// All LLM calls route through /api/openrouter-proxy (server-side key, never exposed to browser)
import { z } from 'zod';
import { ErrorHandler } from '../../.claude/lib/errorHandler';
import { safeJsonParse } from '../../.claude/lib/safeJson';
import { executeWithFallback } from '../../utils/modelFallback';
import { PRIMARY_MODELS, FALLBACK_MODELS } from '../../config/modelConfig';

const PROXY_URL = '/api/openrouter-proxy';
const AI_TIMEOUT_MS = 30_000;

/** fetch with 30s timeout — prevents hung AI requests */
async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('AI request timed out after 15s');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Helper function to call proxy for fallback model
 */
export async function callOpenRouterFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: PRIMARY_MODELS.GPT_OSS_120B_EXACTO,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to call GPT OSS 120B Nitro as PRIMARY model
 * Used for Integral Practice Designer (fast structured output)
 */
export async function callOpenRouterGPTOssNitro(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: PRIMARY_MODELS.GPT_OSS_120B_NITRO,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`GPT OSS Nitro failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * JSON schema call using Inception Mercury 2 as primary, Grok → MiMo as fallback
 * Used for slow multi-step wizards (GoldenShadow, MemoryRecon, Interoception, ContextAIRootCause, Chronobiology)
 */
export async function callInceptionMercuryJson<T>(
  wizardName: string,
  prompt: string,
  responseSchema?: z.ZodSchema<T>
): Promise<T> {
  const parseAndValidate = (text: string, source: string): T => {
    const parsed = safeJsonParse(text, null, `${wizardName}.${source}`);
    if (!parsed) throw new Error(`${source} JSON parsing failed`);

    if (responseSchema) {
      const result = responseSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[AI] ${source} validation failed for ${wizardName}:`, result.error);
        throw new Error(`${source} schema validation failed`);
      }
      return result.data;
    }
    return parsed as T;
  };

  try {
    const mercuryResponse = await callProxyWithProviderConfig(PRIMARY_MODELS.INCEPTION_MERCURY_2, prompt, 2000, !!responseSchema);
    return parseAndValidate(mercuryResponse, 'InceptionMercury2');
  } catch (mercuryError) {
    console.warn(`[AI] Inception Mercury 2 failed for ${wizardName}, falling back to Grok:`, mercuryError);
    try {
      const grokResponse = await callProxyWithProviderConfig(PRIMARY_MODELS.GROK_4_1_FAST, prompt, 2000, !!responseSchema);
      return parseAndValidate(grokResponse, 'Grok4.1Fast');
    } catch (grokError) {
      console.warn(`[AI] Grok failed for ${wizardName}, falling back to MiMo:`, grokError);
      try {
        const mimoResponse = await callProxyWithProviderConfig(FALLBACK_MODELS.MIMO_V2_FLASH_NITRO, prompt, 2000, !!responseSchema);
        return parseAndValidate(mimoResponse, 'MiMoFlash');
      } catch (mimoError) {
        throw new Error(
          `All models failed for ${wizardName}. Final error: ${String(mimoError).substring(0, 100)}`
        );
      }
    }
  }
}

/**
 * JSON schema call using GPT OSS 120B Nitro as primary, Qwen as fallback
 * Used for Integral Practice Designer to reduce latency
 */
export async function callGPTOssNitroJson<T>(
  wizardName: string,
  prompt: string,
  responseSchema?: z.ZodSchema<T>
): Promise<T> {
  const parseAndValidate = (text: string, source: string): T => {
    const parsed = safeJsonParse(text, null, `${wizardName}.${source}`);
    if (!parsed) throw new Error(`${source} JSON parsing failed`);

    if (responseSchema) {
      const result = responseSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[AI] ${source} validation failed for ${wizardName}:`, result.error);
        throw new Error(`${source} schema validation failed`);
      }
      return result.data;
    }
    return parsed as T;
  };

  try {
    const nitroResponse = await callProxyWithProviderConfig(PRIMARY_MODELS.GPT_OSS_120B_NITRO, prompt, 2000, !!responseSchema);
    return parseAndValidate(nitroResponse, 'GPTOssNitro');
  } catch (nitroError) {
    console.warn(`[AI] GPT OSS Nitro failed for ${wizardName}, falling back to Qwen:`, nitroError);
    try {
      const qwenResponse = await callProxyWithProviderConfig(FALLBACK_MODELS.QWEN_3_30B, prompt, 2000, !!responseSchema);
      return parseAndValidate(qwenResponse, 'Qwen');
    } catch (qwenError) {
      throw new Error(
        `Both GPT OSS Nitro and Qwen failed for ${wizardName}. ` +
        `Final error: ${String(qwenError).substring(0, 100)}`
      );
    }
  }
}

/**
 * Enhanced fetch to support OpenRouter specific options
 */
async function callProxyWithProviderConfig(
  model: string,
  prompt: string,
  maxTokens: number = 2000,
  requireJson: boolean = false,
  temperature: number = 0.7
): Promise<string> {
  const payload: any = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    provider: { sort: "throughput" }
  };

  if (requireJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetchWithTimeout(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Helper function to call proxy for Grok 4.1 as PRIMARY model
 * Used for most text generation tasks where Grok is preferred
 */
export async function callOpenRouterGrokPrimary(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: PRIMARY_MODELS.GROK_4_1_FAST,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter Grok 4.1 call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to call proxy for Qwen as FALLBACK model
 * Used when Grok 4.1 fails
 */
export async function callOpenRouterQwenFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FALLBACK_MODELS.QWEN_3_30B,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter Qwen fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to call proxy for DeepSeek v3.2
 * Used for automated forum posts and creative content generation
 */
export async function callOpenRouterDeepSeek(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter DeepSeek call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function for Gemini fallback (DEPRECATED - use Qwen instead)
 */
export async function callGeminiFallback(
  model: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<string> {
  // Redirect all Gemini fallbacks to Qwen via proxy
  return await callOpenRouterQwenFallback(prompt, maxTokens);
}

/**
 * Helper function to call MiMo V2 Flash Nitro as fallback
 * Used for Relational Blueprint wizard
 */
export async function callOpenRouterMimoFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FALLBACK_MODELS.MIMO_V2_FLASH_NITRO,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { sort: "throughput" }
      })
    });
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter MiMo fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * JSON schema calls with GPT OSS 120B Exacto primary, MiMo V2 Flash Nitro fallback
 * Used exclusively for Relational Blueprint wizard
 */
export async function callGPTOssExactoThenMimoJson<T>(
  wizardName: string,
  prompt: string,
  responseSchema?: z.ZodSchema<T>
): Promise<T> {
  const parseAndValidate = (text: string, source: string): T => {
    const parsed = safeJsonParse(text, null, `${wizardName}.${source}`);
    if (!parsed) throw new Error(`${source} JSON parsing failed`);
    if (responseSchema) {
      const result = responseSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[AI] ${source} validation failed for ${wizardName}:`, result.error);
        throw new Error(`${source} schema validation failed`);
      }
      return result.data;
    }
    return parsed as T;
  };

  try {
    const responseText = await callProxyWithProviderConfig(
      PRIMARY_MODELS.GPT_OSS_120B_EXACTO,
      prompt,
      2000,
      !!responseSchema
    );
    return parseAndValidate(responseText || '', 'GPTOssExacto');
  } catch (primaryError) {
    console.warn(`[AI] GPT OSS Exacto failed for ${wizardName}, falling back to MiMo:`, primaryError);
    try {
      const mimoResponse = await callProxyWithProviderConfig(
        FALLBACK_MODELS.MIMO_V2_FLASH_NITRO,
        prompt,
        2000,
        !!responseSchema
      );
      return parseAndValidate(mimoResponse, 'MiMo');
    } catch (mimoError) {
      throw new Error(
        `Both GPT OSS Exacto and MiMo failed for ${wizardName}. ` +
        `Final error: ${String(mimoError).substring(0, 100)}`
      );
    }
  }
}

/**
 * Helper function for JSON schema calls with Grok primary, Qwen fallback
 * Tries Grok 4.1 first, falls back to Qwen for JSON parsing
 * (Gemini deprecated in favor of Qwen for better reliability)
 * @exported for use by wizards requiring structured JSON responses
 */
export async function callGrokThenAIJson<T>(
  wizardName: string,
  prompt: string,
  _geminiModel: string = 'qwen-fallback-default', // Ignored, kept for compat
  responseSchema?: z.ZodSchema<T>,
  staticFallback?: T,
  maxTokens: number = 2000
): Promise<T> {
  const parseAndValidate = (text: string, source: string): T => {
    const parsed = safeJsonParse(text, null, `${wizardName}.${source}`);
    if (!parsed) throw new Error(`${source} JSON parsing failed`);

    if (responseSchema) {
      const result = responseSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[AI] ${source} validation failed for ${wizardName}:`, result.error);
        throw new Error(`${source} schema validation failed`);
      }
      return result.data;
    }
    return parsed as T;
  };

  try {
    // Try Grok first
    const grokResponse = await callProxyWithProviderConfig(
      PRIMARY_MODELS.GROK_4_1_FAST,
      prompt,
      maxTokens,
      !!responseSchema
    );
    return parseAndValidate(grokResponse, 'Grok');
  } catch (grokError) {
    console.warn(`[AI] Grok failed for ${wizardName}, falling back to MiMo:`, grokError);
    try {
      const mimoResponse = await callProxyWithProviderConfig(
        FALLBACK_MODELS.MIMO_V2_FLASH_NITRO,
        prompt,
        maxTokens,
        !!responseSchema
      );
      return parseAndValidate(mimoResponse, 'MiMo');
    } catch (mimoError) {
      console.warn(`[AI] MiMo failed for ${wizardName}, falling back to Qwen:`, mimoError);
      try {
        const qwenResponse = await callProxyWithProviderConfig(
          FALLBACK_MODELS.QWEN_3_30B,
          prompt,
          maxTokens,
          !!responseSchema
        );
        return parseAndValidate(qwenResponse, 'Qwen');
      } catch (qwenError) {
        const finalError = new Error(
          `Grok, MiMo, and Qwen all failed for ${wizardName}. ` +
          `Final error: ${String(qwenError).substring(0, 100)}`
        );
        console.error(`[AI] All models exhausted for ${wizardName}:`, finalError.message);
        if (staticFallback !== undefined) {
          console.warn(`[AI] Using static fallback for ${wizardName}`);
          return staticFallback;
        }
        throw finalError;
      }
    }
  }
}

// Helper function to generate text
// PRIMARY: Grok 4.1 via proxy
// FALLBACK: Qwen 2.5 72B Instruct via proxy
export async function generateText(prompt: string): Promise<string> {
  const { data, error } = await ErrorHandler.wrapAsync(
    async () => {
      return await executeWithFallback(
        'GeminiService',
        'openrouter/free',
        async (primaryModel) => {
          // Call Grok 4.1 as primary
          return await callOpenRouterGrokPrimary(prompt);
        },
        async (fallbackModel) => {
          // Fallback to Qwen (was Gemini)
          return await callOpenRouterQwenFallback(prompt);
        }
      );
    },
    {
      context: 'aiService.generateText',
      fallback: ''
    }
  );

  return data || '';
}
