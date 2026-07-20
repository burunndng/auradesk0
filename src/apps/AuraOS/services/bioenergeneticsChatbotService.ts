/**
 * Bioenergetics Practice Chatbot Service
 * Uses OpenRouter API for real-time Q&A about specific practices
 * Primary Model: Qwen 3 Next 80B (fast, efficient responses)
 * Fallback Model: DeepSeek v3.2
 */

import {
  generateOpenRouterResponse,
  buildMessagesWithSystem,
} from './openRouterService';
import { getFallbackModel, shouldUseFallback, logFallbackAttempt } from '../utils/modelFallback';
import { BioenergeneticsPractice, ChatbotMessage } from '../types.ts';

interface ChatResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Build a system prompt for bioenergetics practice Q&A
 */
function buildBioenergeneticsChatbotPrompt(
  practice: BioenergeneticsPractice,
  userQuestion: string,
  allPractices?: BioenergeneticsPractice[]
): string {
  const practicesList = allPractices
    ? allPractices
        .map((p) => `- ${p.name} (${p.difficulty}, ${p.duration.min}-${p.duration.max}m): ${p.intention}`)
        .join('\n')
    : '';

  return `You are a knowledgeable somatic coach specializing in Reichian-Lowenian bioenergetics. You're helping someone during a live practice session.

CURRENT PRACTICE:
- Name: ${practice.name}
- Intention: ${practice.intention}
- Difficulty: ${practice.difficulty}
- Focus: ${practice.focusSegments.join(', ')}
- Mechanism: ${practice.primaryMechanism}

PRACTICE OVERVIEW:
${practice.explanation.overview}

SAFETY GUIDELINES:
- Contraindications: ${practice.contraindications.join('; ')}
- Safety Notes: ${practice.safetyNotes.join('; ')}

${
  practicesList
    ? `AVAILABLE PRACTICES IN WIZARD:
${practicesList}

You can reference other practices when suggesting modifications or alternatives.`
    : ''
}

USER'S QUESTION: "${userQuestion}"

RESPOND AS THE PRACTICE EXPERT:
- Answer from a somatic, body-aware perspective
- Ground everything in nervous system science & Lowen's work
- Be direct, warm, and embodied (never mystical)
- Keep it to 2-3 sentences MAX
- Reference the practice context when relevant
- If they're struggling, offer modifications or suggest pausing (e.g., "Try Standing Meditation to ground first")
- Can suggest other practices if they're overwhelmed
- Never diagnose medical conditions; recommend consulting healthcare providers for health concerns
- Emphasize that their experience (or lack thereof) is normal`;
}

/**
 * Generate a chatbot response for bioenergetics practice questions
 */
export async function generateBioenergeneticsChatbotResponse(
  practice: BioenergeneticsPractice,
  userQuestion: string,
  conversationHistory: ChatbotMessage[],
  onStreamChunk?: (chunk: string) => void,
  allPractices?: BioenergeneticsPractice[]
): Promise<ChatResponse> {
  try {
    const systemPrompt = buildBioenergeneticsChatbotPrompt(practice, userQuestion, allPractices);

    // Convert conversation history to OpenRouter format
    const chatMessages = conversationHistory
      .filter((msg) => msg.role !== 'bot' || msg.text.length > 0)
      .map((msg) => ({
        role: msg.role === 'bot' ? ('assistant' as const) : ('user' as const),
        content: msg.text,
      }));

    // Add current user question
    chatMessages.push({
      role: 'user' as const,
      content: userQuestion,
    });

    const fullMessages = buildMessagesWithSystem(systemPrompt, chatMessages);

    // Primary model for fast, efficient responses
    const primaryModel = 'openrouter/free';
    const fallbackModel = 'openrouter/free';

    // Try primary model (Qwen 3 Next for fast somatic responses)
    try {
      const response = await generateOpenRouterResponse(fullMessages, onStreamChunk, {
        model: primaryModel,
        maxTokens: 100,
        temperature: 0.6,
      });
      return response;
    } catch (primaryError) {
      logFallbackAttempt('BioenergeneticsChatbot', primaryModel, fallbackModel, primaryError);

      // Try fallback model
      try {
        const fallbackResponse = await generateOpenRouterResponse(fullMessages, onStreamChunk, {
          model: fallbackModel,
          maxTokens: 100,
          temperature: 0.6,
        });
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('[BioenergeneticsChatbot] Fallback model also failed:', fallbackError);
        throw new Error(
          `Both models failed. Primary (Qwen): ${String(primaryError).substring(0, 100)}. Fallback (DeepSeek): ${String(fallbackError).substring(0, 100)}`
        );
      }
    }
  } catch (error) {
    console.error('[BioenergeneticsChatbot] Error generating response:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      text: "I'm having trouble responding right now. Try a more specific question, or take a moment to feel into your practice.",
      error: errorMessage,
    };
  }
}
