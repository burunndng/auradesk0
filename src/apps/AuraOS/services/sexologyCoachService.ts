/**
 * Sexology Coach Service
 *
 * Handles AI calls to Scarlett Vex via OpenRouter with response post-processing.
 * Enforces length limits, removes hedging, strips markdown.
 */

import { generateOpenRouterResponse, OpenRouterMessage } from './openRouterService';
import { SCARLETT_VEX_SYSTEM_PROMPT } from '../config/scarlettVexPrompt';

interface SexologyResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Post-process Grok response:
 * 1. Remove Grok hedging phrases
 * 2. Remove markdown formatting
 * 3. Enforce 130-word hard limit
 */
function postProcessResponse(text: string): string {
  // 1. Remove Grok hedging at start of response
  let cleaned = text.replace(/^(Well|Ah|Look|So),?\s+/i, '');
  cleaned = cleaned.replace(/^(Yeah|Actually|Actually,|I mean),?\s+/i, '');

  // 2. Remove markdown formatting
  // Bold: **text** -> text
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  // Italic: *text* -> text (but be careful with single asterisks in contractions)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  // Headers: # text -> text (all header levels)
  cleaned = cleaned.replace(/^#+\s+(.+)$/gm, '$1');
  // Remove markdown lists
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');

  // 3. Enforce 130-word hard limit
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 130) {
    cleaned = words.slice(0, 130).join(' ');
    // If it ends mid-sentence, try to end at a period
    const lastPeriod = cleaned.lastIndexOf('.');
    if (lastPeriod > cleaned.length - 20) {
      cleaned = cleaned.substring(0, lastPeriod + 1);
    } else {
      cleaned += '...';
    }
  }

  return cleaned.trim();
}

/**
 * Call Scarlett Vex with conversation history
 */
export async function callScarlettVex(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<SexologyResponse> {
  try {
    // Fix 1: Trim to last 30 messages to prevent context window overflow
    const recentMessages = messages.slice(-30);

    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'system', content: SCARLETT_VEX_SYSTEM_PROMPT },
      ...recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    ];

    // Fix 2: Model fallback — Grok first, then Qwen on failure
    let response = await generateOpenRouterResponse(openRouterMessages, undefined, {
      model: 'openrouter/free',
      maxTokens: 200,
      temperature: 0.5,
    });

    if (!response.success) {
      // Fallback to Qwen
      response = await generateOpenRouterResponse(openRouterMessages, undefined, {
        model: 'openrouter/free',
        maxTokens: 200,
        temperature: 0.5,
      });
    }

    if (!response.success) {
      return {
        success: false,
        text: '',
        error: response.error || 'Failed to get response from Scarlett'
      };
    }

    const processedText = postProcessResponse(response.text);

    return {
      success: true,
      text: processedText
    };
  } catch (error) {
    console.error('[SexologyCoach] Error calling Scarlett:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
