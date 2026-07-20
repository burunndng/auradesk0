/**
 * Tree of Life Coaching Service
 *
 * Handles AI calls for the structured 8-step Kabbalistic pathworking practice.
 * Functions:
 *   - callTreeOfLifeCoach: original chat function (kept for step 6 conversation)
 *   - generateSephiraQuestions: generates 3 grounding questions for step 3
 *   - generatePathworkingVisualization: fills pathworking template for step 5
 *   - generateTreeOfLifeInsight: generates IntegratedInsight at session end
 */

import { generateOpenRouterResponse, OpenRouterMessage } from './openRouterService';
import {
  buildSystemPrompt,
  getSephira,
  buildGroundingQuestionsPrompt,
  buildEmergenceReflectionPrompt,
  PATHWORKING_TEMPLATES,
} from '../constants/treeOfLifePrompts';
import { callGrokThenAIJson } from './ai/aiCore';
import { treeOfLifeInsightSchema, TreeOfLifeInsight } from './ai/wizardSchemas';

interface TreeOfLifeCoachingResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Post-process Tree of Life coaching response
 * Removes hedging, cleans markdown, enforces length limits
 */
function postProcessResponse(text: string): string {
  let cleaned = text.replace(/^(Well|Ah|Look|So|Hmm),?\s+/i, '');
  cleaned = cleaned.replace(/^(Yeah|Actually|I mean|You know),?\s+/i, '');

  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');
  cleaned = cleaned.replace(/^#+\s+(.+)$/gm, '$1');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 130) {
    cleaned = words.slice(0, 130).join(' ');
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
 * Call Tree of Life Coach for Step 6 (guided conversation after pathworking)
 */
export async function callTreeOfLifeCoach(
  sephiraId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<TreeOfLifeCoachingResponse> {
  try {
    const sephira = getSephira(sephiraId);
    if (!sephira) {
      return { success: false, text: '', error: `Unknown Sephira: ${sephiraId}` };
    }

    const systemPrompt = buildSystemPrompt(sephira);

    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
    ];

    const response = await generateOpenRouterResponse(openRouterMessages, undefined, {
      model: 'openrouter/free',
      maxTokens: 300,
      temperature: 0.6,
    });

    if (!response.success) {
      return { success: false, text: '', error: response.error || `Failed for ${sephira.name}` };
    }

    return { success: true, text: postProcessResponse(response.text) };
  } catch (error) {
    console.error('[TreeOfLifeCoach] Error:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate 3 grounding questions for Step 3
 * Specific to the chosen Sephira + user's stated challenge
 */
export async function generateSephiraQuestions(
  sephiraId: string,
  challengeText: string
): Promise<{ success: boolean; questions: string[]; error?: string }> {
  const sephira = getSephira(sephiraId);
  if (!sephira) {
    return { success: false, questions: [], error: `Unknown Sephira: ${sephiraId}` };
  }

  const prompt = buildGroundingQuestionsPrompt(sephira, challengeText);

  try {
    const result = await callGrokThenAIJson<{ questions: string[] }>(
      'TreeOfLife-GroundingQuestions',
      prompt,
      'qwen-fallback-default'
    );
    if (result.questions && Array.isArray(result.questions) && result.questions.length === 3) {
      return { success: true, questions: result.questions };
    }
    throw new Error('Invalid questions format');
  } catch (error) {
    console.error('[TreeOfLifeCoach] generateSephiraQuestions failed:', error);
    // Fallback: generic but sephira-appropriate questions
    return {
      success: true,
      questions: [
        `Through the lens of ${sephira.name}, what is this challenge really asking of you?`,
        `Where might you be avoiding what ${sephira.name} demands in this situation?`,
        `What would shift if you fully embodied ${sephira.archetype} in relation to this challenge?`,
      ],
    };
  }
}

/**
 * Get pathworking visualization for Step 5
 * Returns the pre-written template with the challenge interpolated
 */
export function getPathworkingVisualization(
  sephiraId: string,
  challengeText: string
): string {
  const template = PATHWORKING_TEMPLATES[sephiraId];
  if (!template) {
    return `You enter the space of ${sephiraId} with your challenge — "${challengeText}" — and rest in the qualities of this Sephira. Allow whatever arises to surface without directing it.`;
  }
  // Replace {challenge} placeholder with truncated challenge text
  const shortChallenge = challengeText.length > 80
    ? challengeText.substring(0, 80) + '...'
    : challengeText;
  return template.replace(/\{challenge\}/g, shortChallenge);
}

/**
 * Generate the Step 6 guided conversation response
 */
export async function generateEmergenceResponse(
  sephiraId: string,
  challengeText: string,
  pathworkingReport: string
): Promise<TreeOfLifeCoachingResponse> {
  const sephira = getSephira(sephiraId);
  if (!sephira) {
    return { success: false, text: '', error: `Unknown Sephira: ${sephiraId}` };
  }

  const prompt = buildEmergenceReflectionPrompt(sephira, challengeText, pathworkingReport);

  try {
    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'user', content: prompt },
    ];

    const response = await generateOpenRouterResponse(openRouterMessages, undefined, {
      model: 'openrouter/free',
      maxTokens: 200,
      temperature: 0.65,
    });

    if (!response.success) {
      return { success: false, text: '', error: response.error };
    }

    return { success: true, text: postProcessResponse(response.text) };
  } catch (error) {
    return { success: false, text: '', error: String(error) };
  }
}

/**
 * Generate IntegratedInsight for the Intelligence Hub at session completion (Step 8)
 */
export async function generateTreeOfLifeInsight(params: {
  sephiraId: string;
  challengeText: string;
  groundingResponses: string[];
  qliphothReflection: string;
  pathworkingReport: string;
  integrationCommitment: string;
  availablePractices: Array<{ id: string; name: string; category?: string }>;
}): Promise<TreeOfLifeInsight | null> {
  const sephira = getSephira(params.sephiraId);
  if (!sephira) return null;

  const practiceList = params.availablePractices
    .slice(0, 20)
    .map(p => `- ${p.id}: ${p.name} (${p.category || 'General'})`)
    .join('\n');

  const sessionSummary = `
SEPHIRA: ${sephira.name} (${sephira.hebrew}) — ${sephira.archetype}
CHALLENGE BROUGHT: ${params.challengeText}
GROUNDING REFLECTION: ${params.groundingResponses.join(' | ')}
SHADOW INQUIRY (Qliphoth): ${params.qliphothReflection}
PATHWORKING - WHAT EMERGED: ${params.pathworkingReport}
INTEGRATION COMMITMENT: ${params.integrationCommitment}
`.trim();

  const prompt = `You are generating a developmental insight for the AOS Intelligence Hub from a Tree of Life Kabbalistic practice session.

SESSION DATA:
${sessionSummary}

AVAILABLE PRACTICES FOR RECOMMENDATIONS:
${practiceList}

Generate a structured insight that captures what emerged, identifies the developmental pattern, and recommends next steps.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "mindToolReport": "Two-to-three sentence paragraph summarising what this practitioner worked with and what shifted during their ${sephira.name} pathworking session.",
  "mindToolShortSummary": "One sentence capturing the session essence in under 120 characters.",
  "detectedPattern": "The core developmental or spiritual pattern that surfaced — stated plainly.",
  "sephiraicLesson": "The specific teaching of ${sephira.name} as it manifested in this practitioner's work today.",
  "qliphothicInsight": "What shadow material was identified and how it relates to their pattern.",
  "suggestedShadowWork": [
    { "practiceId": "shadow-journaling", "practiceName": "Shadow Journaling", "rationale": "Specific rationale tied to what emerged." }
  ],
  "suggestedNextSteps": [
    { "practiceId": "contemplative-inquiry", "practiceName": "Contemplative Inquiry", "rationale": "Specific rationale tied to what emerged." }
  ],
  "integrationTheme": "Core integration theme in 3-5 words, e.g. 'Boundaries as Sacred Discernment'",
  "confidenceScore": 0.72
}`;

  try {
    const result = await callGrokThenAIJson<TreeOfLifeInsight>(
      'TreeOfLife-Insight',
      prompt,
      'qwen-fallback-default',
      treeOfLifeInsightSchema
    );
    return result;
  } catch (error) {
    console.error('[TreeOfLifeCoach] generateTreeOfLifeInsight failed:', error);
    return null;
  }
}
