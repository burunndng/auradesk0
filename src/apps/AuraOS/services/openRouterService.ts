// services/openRouterService.ts
import { executeWithFallback, getFallbackModel, shouldUseFallback, logFallbackAttempt } from '../utils/modelFallback';
import { validatePromptSafety } from '../.claude/lib/promptSafetyValidator';

// Default model
export const DEFAULT_MODEL = 'openrouter/free';

// Fast model alias for consistency
export const QWEN_FAST_MODEL = 'openrouter/free';

// Default fallback model (kept for backward compatibility)
export const DEEPSEEK_MODEL = 'openrouter/free';

const OPENROUTER_URL = '/api/openrouter-proxy';
const OPENROUTER_HEADERS = () => ({
  'Content-Type': 'application/json',
});

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  preset?: string;
  reasoning?: {
    enabled?: boolean;
  };
  provider?: {
    quantizations?: string[];
    sort?: string;
  };
}

interface ChatResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Helper function to call Qwen as fallback via proxy
 */
async function callQwenFallback(
  messages: OpenRouterMessage[],
  maxTokens: number = 1000,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: OPENROUTER_HEADERS(),
      body: JSON.stringify({
        model: QWEN_FAST_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`Qwen fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a response using proxy with streaming support
 */
export async function generateOpenRouterResponse(
  messages: OpenRouterMessage[],
  onStreamChunk?: (chunk: string) => void,
  options: OpenRouterOptions = {}
): Promise<ChatResponse> {
  const {
    model = DEEPSEEK_MODEL,
    maxTokens = 1000,
    temperature = 0.7,
    preset,
    reasoning,
    provider,
    systemPrompt,
  } = options;

  // Prepend system message if provided
  if (systemPrompt) {
    messages = [{ role: 'system', content: systemPrompt }, ...messages];
  }

  // Validate messages for glitch tokens and log encounters
  messages.forEach((msg, idx) => {
    const validation = validatePromptSafety(msg.content, { strictMode: false });
    if (validation.detections.length > 0) {
      console.log(`[GlitchValidator] Message ${idx} (${msg.role}): ${validation.recommendation}`);
      if (validation.riskLevel === 'danger') {
        console.warn(`[GlitchValidator] ⚠️ DANGER: Severe tokens detected in message ${idx}`);
      }
    }
  });

  // Use executeWithFallback for automatic fallback handling
  return await executeWithFallback(
    'OpenRouter',
    model,
    async (primaryModel) => {
      try {
        console.log('[OpenRouter] Proxy call started');
        console.log('[OpenRouter] Model:', primaryModel);
        console.log('[OpenRouter] Messages:', messages.length);
        console.log('[OpenRouter] Max tokens:', maxTokens);

        console.log('[OpenRouter] Proxy configured');

        // Use streaming if callback provided
        if (onStreamChunk) {
          console.log('[OpenRouter] Using streaming mode');
          console.log('[OpenRouter] Creating stream...');

          const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: OPENROUTER_HEADERS(),
            body: JSON.stringify({
              model: primaryModel,
              messages,
              max_tokens: maxTokens,
              temperature,
              stream: true,
              ...(preset ? { preset } : {}),
              ...(reasoning ? { reasoning } : {}),
              ...(provider ? { provider } : {}),
            })
          });

          if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
          }

          console.log('[OpenRouter] Stream created, reading chunks...');
          let fullText = '';
          let chunkCount = 0;
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream available');

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              if (!data) continue; // Skip empty lines

              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices[0]?.delta?.content || '';
                fullText += text;
                chunkCount++;
                if (text) {
                  onStreamChunk(text);
                }
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }

          console.log('[OpenRouter] Stream completed. Chunks:', chunkCount, 'Total length:', fullText.length);
          return { success: true, text: fullText };
        } else {
          // Fallback to non-streaming
          console.log('[OpenRouter] Using non-streaming mode');
          console.log('[OpenRouter] Making proxy call...');

          const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: OPENROUTER_HEADERS(),
            body: JSON.stringify({
              model: primaryModel,
              messages,
              max_tokens: maxTokens,
              temperature,
              ...(preset ? { preset } : {}),
              ...(reasoning ? { reasoning } : {}),
              ...(provider ? { provider } : {}),
            })
          });

          if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
          }

          const data = await response.json();
          const text = data.choices[0]?.message?.content || '';
          console.log('[OpenRouter] Response received. Length:', text.length);
          return { success: true, text };
        }
      } catch (error) {
        console.error('Proxy API error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
          success: false,
          text: 'Unable to generate response. Please try again.',
          error: errorMessage
        };
      }
    },
    async (fallbackModel) => {
      try {
        console.log('[OpenRouter] Attempting fallback to Qwen:', fallbackModel);
        const text = await callQwenFallback(messages, maxTokens, temperature);
        console.log('[OpenRouter] Qwen fallback succeeded. Length:', text.length);
        return { success: true, text };
      } catch (error) {
        console.error('Proxy Qwen fallback error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          text: 'Unable to generate response. Please try again.',
          error: errorMessage
        };
      }
    }
  );
}

/**
 * Helper function to build messages array with system prompt
 */
export function buildMessagesWithSystem(
  systemPrompt: string,
  conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }>
): OpenRouterMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...conversationMessages
  ];
}

/**
 * Generate a print report using Deepseek-v3.2-speciale via proxy
 */
export async function callDeepseekReport(dataText: string): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are an analysis assistant that generates concise practice reports. Analyze the provided user practice data and generate a brief, actionable report. Focus on patterns, progress, and recommendations.'
    },
    {
      role: 'user',
      content: `Please analyze this practice data and generate a concise report with insights and recommendations:\n\n${dataText}`
    }
  ];

  const response = await generateOpenRouterResponse(messages, undefined, {
    model: 'openrouter/free',
    maxTokens: 2000,
    temperature: 0.7
  });

  if (!response.success) {
    throw new Error(`Report generation failed: ${response.error}`);
  }

  return response.text;
}
