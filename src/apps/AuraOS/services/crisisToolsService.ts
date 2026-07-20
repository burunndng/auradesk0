/**
 * Crisis Tools Service
 * Handles specialist agent sessions for addiction crisis intervention
 */

import { generateOpenRouterResponse, buildMessagesWithSystem } from './openRouterService';
import {
  CRISIS_BASE_SYSTEM_PROMPT,
  getProtocolPrompt,
  getAgentById,
  type SpecialistAgentConfig,
} from '../config/specialistAgents';
import { SHADOW_JOURNALING_MODEL, SHADOW_JOURNALING_TEMPERATURE } from './shadowGuideService';

export type SpecialistSessionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface SpecialistSession {
  id: string;
  agent: SpecialistAgentConfig;
  protocolPrompt: string;
  systemPrompt: string;
  messages: SpecialistSessionMessage[];
  createdAt: number;
}

const CRISIS_TOOLS_MAX_TOKENS = 400;

export function createSpecialistSession(agentId: string): SpecialistSession | null {
  const agent = getAgentById(agentId);
  if (!agent) {
    console.error(`[CrisisTools] Agent not found: ${agentId}`);
    return null;
  }

  const protocolPrompt = getProtocolPrompt(agent.protocolId);
  const systemPrompt = `${CRISIS_BASE_SYSTEM_PROMPT}\n\n${protocolPrompt}`;

  const session: SpecialistSession = {
    id: `specialist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    agent,
    protocolPrompt,
    systemPrompt,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: agent.openingMessage },
    ],
    createdAt: Date.now(),
  };

  return session;
}

export async function getSpecialistAgentReply(
  session: SpecialistSession,
  userMessage: string
): Promise<{ success: boolean; text: string; error?: string }> {
  try {
    const updatedMessages: SpecialistSessionMessage[] = [
      ...session.messages,
      { role: 'user', content: userMessage },
    ];

    const conversationMessages = updatedMessages.filter(
      msg => msg.role !== 'system'
    ) as Array<{ role: 'user' | 'assistant'; content: string }>;

    const messages = buildMessagesWithSystem(session.systemPrompt, conversationMessages);

    const response = await generateOpenRouterResponse(
      messages,
      undefined,
      {
        model: SHADOW_JOURNALING_MODEL,
        maxTokens: CRISIS_TOOLS_MAX_TOKENS,
        temperature: SHADOW_JOURNALING_TEMPERATURE,
      }
    );

    if (!response.success || !response.text) {
      return {
        success: false,
        text: '',
        error: response.error || 'Failed to generate response',
      };
    }

    return {
      success: true,
      text: response.text.trim(),
    };
  } catch (error) {
    console.error('[CrisisTools] Error generating specialist reply:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function detectAlreadyUsed(text: string): boolean {
  const normalizedText = text.toLowerCase();
  
  const alreadyUsedPatterns = [
    'already used',
    'i used',
    "i've used",
    'just used',
    'i did use',
    'i took',
    'i snorted',
    'i drank',
    'i smoked',
    'relapsed',
    'i relapse',
  ];

  return alreadyUsedPatterns.some(pattern => normalizedText.includes(pattern));
}
