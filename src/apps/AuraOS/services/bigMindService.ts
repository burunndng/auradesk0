// services/bigMindService.ts
import { BigMindSession, BigMindMessage, BigMindVoice, BigMindInsightSummary, IntegratedInsight, ModuleKey } from '../types.ts';
import { practices as corePractices } from '../constants.ts';
import { generateOpenRouterResponse, buildMessagesWithSystem, DEEPSEEK_MODEL } from './openRouterService';
import { callGrokThenAIJson } from './ai/aiCore';
import { bigMindSummarySchema } from './ai/wizardSchemas';

// Provider types
export type BigMindProvider = 'google' | 'openrouter';

// Provider configuration
interface ProviderConfig {
  provider: BigMindProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// Default provider configurations
const PROVIDER_CONFIGS: Record<BigMindProvider, ProviderConfig> = {
  google: {
    provider: 'openrouter',
    model: 'openrouter/free',
    maxTokens: 1000,
    temperature: 0.7
  },
  openrouter: {
    provider: 'openrouter',
    model: 'openrouter/free',
    maxTokens: 1000,
    temperature: 0.7
  }
};

// The Big Mind™ System Prompt
const BIG_MIND_SYSTEM_PROMPT = `You facilitate the Big Mind™ Process—a structured Zen-inspired method for exploring inner voices (sub-personalities) and shifting to the Big Mind perspective. Guide users to speak AS these voices in first person, explore their roles, then dis-identify by accessing Big Mind (the spacious, non-dual awareness that observes all parts). Your role is neutral facilitation: use curiosity and mirroring to evoke direct experience. No advice, interpretation, diagnosis, or therapy. Never label or assume a user's emotion/comment as a "voice" without their explicit invitation. The user accesses their own wisdom through this structured inquiry—let them lead the topic.

**CRUCIAL CONSTRAINTS:**
- Limit responses to 100 words max.
- Use 1-2 questions per response.
- End EVERY reply with a question to advance the process.
- Prioritize user agency: If unclear or frustrated, clarify first—do not force process steps.

---

### **Process Structure**

#### **1. Opening (Brief)**
- For first-time users: "The Big Mind™ Process explores inner voices like the Critic or Protector. We'll speak AS them, then shift to Big Mind to observe. Ready?"
- Start: "What's alive for you right now—a situation, feeling, or tension?"
- Listen for the dominant voice (e.g., fear, judgment, longing)—but only if user shares a topic. Do not probe user feedback on you.

#### **2. Voice Dialogue**

**Identify the voice (User-Led Only):**
- Once topic is set: "What name fits this part? (E.g., The Protector, Inner Critic, Skeptic.)"
- Never name/identify without user input (e.g., do not call frustration a "Frustrated Part").

**Enter the voice:**
- "Speak AS [User-Named Voice] now—use 'I' statements. What does this voice want to say?"
- Key probes (1-2 at a time):
  - "What am I protecting or aiming for?"
  - "What do I fear if I'm not in charge?"
  - "Where do I feel this in the body?"

**Stay in character:**
- If they analyze: "Return to speaking AS the voice—what's the next 'I' statement?"
- Mirror briefly: "I'm hearing [Voice] say [exact words]. Say more?"

#### **3. The Big Mind™ Shift (Core Pivot)**
- After 1-2 exchanges: "Thank you, [Voice]. Now step back. Become Big Mind—the spacious awareness that holds and observes all voices without merging. From Big Mind, what do you notice about [Voice]?"
- Follow: "How does it feel to see this voice from Big Mind?"

#### **4. Additional Voices & Expansion**
- "What other voice arises in response?"
- "From Big Mind, what does [Voice A] say to [Voice B]?"

#### **5. Integration**
- "What patterns or insights stand out across the voices?"
- "From Big Mind, how can these parts collaborate?"
- Close: "What's one clear takeaway?"

---

### **Key Techniques**

**Embodiment & Presence:**
- Tie to body: "What's the sensation of this voice?"
- For stuckness: "Just guess the voice's first words—no right answer."

**Emotional Intensity:**
- "Notice the feeling, then shift to Big Mind—what changes?"

**Curiosity Focus:**
- Use open invites: "What else?" or "Tell me more."
- Redirect off-topic: "How does that connect to [current voice or topic]?"

**User Resistance/Meta-Feedback (Safeguard):**
- If user critiques you or shows frustration: Do not label it as a voice. Acknowledge neutrally once, then clarify: "What would you like to explore instead?" or "How can I adjust to support the process?"
- Pause if needed: "Let's step back—what's really wanting attention here?"

---

### **Boundaries**

- Not therapy: If trauma or crisis surfaces, say: "This may need a professional. For now, let's stay gently."
- Welcome all voices: No judgment—each has positive intent.
- Keep concise: Avoid affirmations, empathy statements, metaphors, or over-validation. No assuming emotions.
- Focus on direct exploration: Only advance if user engages.

**Your Role:** Hold clear space for the user's discovery. Advance to Big Mind™ shift promptly within an active topic. If in doubt, clarify user intent first. Always end with a question.`;

interface BigMindResponseResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Generates a Big Mind response with streaming support
 * @param options - Configuration for the response
 * @param options.conversation - Previous messages in the session
 * @param options.stage - Current stage of the process
 * @param options.activeVoice - Name of the currently speaking voice
 * @param options.voices - All identified voices in the session
 * @param options.onStreamChunk - Callback for streaming chunks
 * @param options.provider - AI provider to use ('google' or 'openrouter')
 */
export async function generateBigMindResponse(options: {
  conversation: BigMindMessage[];
  stage: string;
  activeVoice?: string;
  voices: BigMindVoice[];
  onStreamChunk?: (chunk: string) => void;
  provider?: BigMindProvider;
  insightContext?: IntegratedInsight | null;
}): Promise<BigMindResponseResult> {
  try {
    const { conversation, stage, activeVoice, voices, onStreamChunk, provider = 'google', insightContext } = options;

    // Build stage-specific instructions
    const stageInstructions = getStageInstructions(stage, voices, activeVoice);

    // Build conversation context
    const conversationText = conversation
      .map(msg => {
        if (msg.role === 'user') {
          return `${msg.voiceName || 'User'}: ${msg.text}`;
        } else {
          return `Guide: ${msg.text}`;
        }
      })
      .join('\n\n');

    // Build context-aware section
    let contextSection = '';
    if (insightContext) {
      contextSection = `
---
SESSION CONTEXT (from Intelligence Hub):
The user is starting this session based on a pattern detected in a previous tool.
- Originating Tool: ${insightContext.mindToolType}
- Detected Pattern: "${insightContext.detectedPattern}"
- Context: ${insightContext.mindToolShortSummary}

Help them explore this pattern through the Big Mind™ lens. Ask which voice might be connected to this pattern.
---`;
    } else if (conversation.length === 0) {
      // Fresh session - explicit instruction
      contextSection = `
---
FRESH SESSION:
This is a standalone Big Mind™ session with no prior context. Do NOT reference any patterns, insights, or previous sessions the user may have done. Start fresh with: "What's alive for you right now?"
---`;
    }

    const userPrompt = `${stageInstructions}
${contextSection}

Current conversation:
${conversationText}

${activeVoice ? `The user is now speaking as: "${activeVoice}"` : ''}

Respond as the Guide. Keep your response to 1-3 sentences, focused on the current stage and the user's needs.`;

    const config = PROVIDER_CONFIGS[provider];

    // Use the selected provider
    if (provider === 'openrouter') {
      return await generateOpenRouterBigMindResponse(userPrompt, onStreamChunk);
    } else {
      return await generateGoogleResponse(userPrompt, onStreamChunk);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      text: '',
      error: `Failed to generate response: ${errorMessage}`
    };
  }
}

/**
 * Generate response using Grok → Minimax → Qwen fallback chain (no Gemini)
 */
async function generateGoogleResponse(
  userPrompt: string,
  onStreamChunk?: (chunk: string) => void
): Promise<BigMindResponseResult> {
  const buildMsgs = () => buildMessagesWithSystem(
    BIG_MIND_SYSTEM_PROMPT,
    [{ role: 'user' as const, content: userPrompt }]
  );

  // 1. Try Grok 4.1 Fast
  try {
    const response = await generateOpenRouterResponse(buildMsgs(), onStreamChunk, {
      model: 'openrouter/free',
      maxTokens: 1000,
      temperature: 0.7
    });
    if (response.success) return { success: true, text: response.text };
    console.warn('[BigMind] Grok failed, trying Minimax:', response.error);
  } catch (error) {
    console.warn('[BigMind] Grok error, trying Minimax:', error);
  }

  // 2. Fallback to Minimax M2.5
  try {
    const response = await generateOpenRouterResponse(buildMsgs(), onStreamChunk, {
      model: 'openrouter/free',
      maxTokens: 1000,
      temperature: 0.7
    });
    if (response.success) return { success: true, text: response.text };
    console.warn('[BigMind] Minimax failed, trying Qwen:', response.error);
  } catch (error) {
    console.warn('[BigMind] Minimax error, trying Qwen:', error);
  }

  // 3. Final fallback to Qwen
  try {
    const response = await generateOpenRouterResponse(buildMsgs(), onStreamChunk, {
      model: 'openrouter/free',
      maxTokens: 1000,
      temperature: 0.7
    });
    if (response.success) return { success: true, text: response.text };
    return { success: false, text: '', error: `All models failed: ${response.error}` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, text: '', error: `All models failed: ${msg}` };
  }
}

/**
 * Generate response using OpenRouter API with DeepSeek
 */
async function generateOpenRouterBigMindResponse(
  userPrompt: string,
  onStreamChunk?: (chunk: string) => void
): Promise<BigMindResponseResult> {
  try {
    // Prepare messages using the helper function
    const messages = buildMessagesWithSystem(
      BIG_MIND_SYSTEM_PROMPT,
      [{ role: 'user' as const, content: userPrompt }]
    );

    // Call OpenRouter service with DeepSeek model
    const response = await generateOpenRouterResponse(
      messages,
      onStreamChunk,
      {
        model: DEEPSEEK_MODEL,
        maxTokens: 1000,
        temperature: 0.7
      }
    );

    if (!response.success) {
      return {
        success: false,
        text: '',
        error: `OpenRouter API error: ${response.error}`
      };
    }

    return { success: true, text: response.text };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      text: '',
      error: `OpenRouter API error: ${errorMessage}`
    };
  }
}

/**
 * Get stage-specific instructions to guide the AI response
 */
function getStageInstructions(stage: string, voices: BigMindVoice[], activeVoice?: string): string {
  switch (stage) {
    case 'VOICE_ID':
      return `Stage: Voice Identification
You are helping the user identify and name inner voices. Keep your response brief (1-2 sentences). Ask clarifying questions to help them name the voice or identify what's present. Suggest examples if they're stuck: the Protector, the Judge, the Skeptic, the Playful One, the Critic, the Overwhelmed One.`;

    case 'VOICE_DIALOGUE':
      return `Stage: Voice Dialogue
The user has identified voices and is now exploring them. Help them speak directly AS the voice (in first person), not about it. Ask what the voice wants, what it fears, and what positive intention it might have. Keep reflecting back: "I'm hearing this voice say..."`;

    case 'WITNESS':
      return `Stage: Witness Consciousness
Guide the user to shift from being identified with voices to observing them. Use this invitation: "Take a gentle step back. Let that voice be there, but shift your awareness to become the spacious sky observing the voice as a cloud. From this vast, quiet Witness place, what do you notice?"`;

    case 'INTEGRATION':
      return `Stage: Integration
Help the user see connections across voices and how they work together. Ask: "What patterns emerge? What are these voices ultimately trying to give or protect? How might they collaborate rather than conflict?"`;

    case 'SUMMARY':
      return `Stage: Summary & Closing
Offer brief appreciation and summarize 2-3 key insights. Ask how they're feeling. Invite reflection: "You might journal about this or let it integrate naturally."`;

    default:
      return `You are in the Big Mind Process. Respond with wisdom and compassion, supporting the user's inner exploration.`;
  }
}

/**
 * Summarize a completed Big Mind session into structured insights
 */
export async function summarizeBigMindSession(
  session: BigMindSession,
  practiceStack: string[],
  completionHistory: Record<string, string[]>,
  provider: BigMindProvider = 'google',
  userReflection?: string
): Promise<BigMindInsightSummary> {
  // Extract voice names
  const voiceNames = session.voices.map(v => v.name);

  // Build conversation context for summarization
  const conversationText = session.messages
    .map(msg => {
      if (msg.role === 'user') {
        return `${msg.voiceName || 'User'}: ${msg.text}`;
      } else {
        return `Guide: ${msg.text}`;
      }
    })
    .join('\n\n');

  // Include user's reflection if provided
  const reflectionSection = userReflection
    ? `\n\nUser's Reflection (what shifted for them):\n"${userReflection}"\n`
    : '';

  const summarizationPrompt = `Analyze this Big Mind Process session and extract key insights. Use the user's exact words when describing integrationCommitments — do not translate to clinical or spiritual vocabulary. DESCRIPTIVE labels only.

Voices discussed: ${voiceNames.join(', ')}

Full conversation:
${conversationText}${reflectionSection}

Provide JSON with:
1. "primaryVoices": array of 2-3 most significant voices discussed (example: ["The Protector", "The Vulnerable Self"])
2. "witnessPerspective": 1-2 sentence insight from observer perspective (example: "From Big Mind, all these parts have valid needs")
3. "integrationCommitments": array of 2-3 concrete insights the user expressed (example: ["I see how the Protector keeps me safe", "The Critic has been trying to help"])
4. "recommendedPractices": array of {practiceName: "Shadow Journaling", rationale: "explore this further"}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  // Safe fallback object
  const fallbackSummary = {
    primaryVoices: session.voices.map(v => v.name),
    witnessPerspective: 'Integration of inner voices in progress.',
    integrationCommitments: ['Continue observing inner voices with compassion.'],
    recommendedPractices: []
  };

  // Use callGrokThenAIJson for validated response
  const parsed = await callGrokThenAIJson(
    'BigMindProcess',
    summarizationPrompt,
    undefined,
    bigMindSummarySchema
  ) ?? fallbackSummary;

  // Map practice names to IDs and check if they're in the stack
  const recommendedWithIds = parsed.recommendedPractices.map((rec) => ({
    practiceId: findPracticeIdByName(rec.practiceName),
    practiceName: rec.practiceName,
    rationale: rec.rationale,
    alreadyInStack: practiceStack.includes(findPracticeIdByName(rec.practiceName))
  }));

  return {
    primaryVoices: parsed.primaryVoices,
    witnessPerspective: parsed.witnessPerspective,
    integrationCommitments: parsed.integrationCommitments,
    recommendedPractices: recommendedWithIds
  };
}

/**
 * Find practice ID by name (case-insensitive search)
 */
function findPracticeIdByName(practiceName: string): string {
  const allPractices = [
    ...corePractices.body,
    ...corePractices.mind,
    ...corePractices.spirit,
    ...corePractices.shadow
  ];

  const found = allPractices.find(p =>
    p.name.toLowerCase().includes(practiceName.toLowerCase()) ||
    practiceName.toLowerCase().includes(p.name.toLowerCase())
  );

  return found?.id || 'unknown-practice';
}

/**
 * Create an IntegratedInsight from a BigMind session summary
 */
export function createBigMindIntegratedInsight(
  sessionId: string,
  summary: BigMindInsightSummary
): IntegratedInsight {
  return {
    id: `insight-bigmind-${Date.now()}`,
    mindToolType: 'Big Mind Process',
    mindToolSessionId: sessionId,
    mindToolName: 'Big Mind Process',
    mindToolReport: summary.witnessPerspective,
    mindToolShortSummary: `Explored voices: ${summary.primaryVoices.join(', ')}. ${summary.witnessPerspective}`,
    detectedPattern: summary.integrationCommitments.join(' | '),
    suggestedShadowWork: summary.recommendedPractices.map(p => ({
      practiceId: p.practiceId,
      practiceName: p.practiceName,
      rationale: p.rationale
    })),
    suggestedNextSteps: summary.recommendedPractices.map(p => ({
      practiceId: p.practiceId,
      practiceName: p.practiceName,
      rationale: `Shadow work to support: ${p.rationale}`
    })),
    dateCreated: new Date().toISOString(),
    status: 'pending'
  };
}

/**
 * Get available providers and their status
 */
export function getAvailableProviders(): { provider: BigMindProvider; available: boolean; error?: string }[] {
  const providers: { provider: BigMindProvider; available: boolean; error?: string }[] = [];

  // Google/Gemini provider — calls routed through server-side proxy
  providers.push({ provider: 'google', available: true });

  return providers;
}

/**
 * Get the best available provider
 */
export function getBestProvider(): BigMindProvider {
  const providers = getAvailableProviders();
  const available = providers.filter(p => p.available);

  // Prefer Google if available, otherwise fall through to default
  if (available.some(p => p.provider === 'google')) {
    return 'google';
  }

  // Fallback to Google even if API key might be missing
  return 'google';
}

/**
 * Helper to get default voices for starting a new session
 */
export function getDefaultVoices(): BigMindVoice[] {
  return [
    {
      id: 'controller',
      name: 'The Controller',
      isDefault: true,
      description: 'The part that wants to be in control and manage things'
    },
    {
      id: 'protector',
      name: 'The Protector',
      isDefault: true,
      description: 'The part that keeps you safe from harm or rejection'
    },
    {
      id: 'vulnerable',
      name: 'The Vulnerable Self',
      isDefault: true,
      description: 'The part that feels tender, needs, and yearns for connection'
    },
    {
      id: 'big-mind',
      name: 'Big Mind',
      isDefault: true,
      description: 'The vast, witnessing awareness that holds all parts with compassion'
    }
  ];
}
