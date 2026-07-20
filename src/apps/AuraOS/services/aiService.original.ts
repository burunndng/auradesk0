


// services/aiService.ts
// FIX: Add `ThreeTwoOneSession` and `CustomPractice` to type imports.
import OpenAI from 'openai';
import { z } from 'zod';
import { ErrorHandler } from '../.claude/lib/errorHandler';
import { safeJsonParse } from '../.claude/lib/safeJson';
import { Practice, IdentifiedBias, Perspective, AqalReportData, ThreeTwoOneSession, CustomPractice, ModuleKey, IntegratedInsight, KeganResponse, KeganStage, KeganDomain, KeganAssessmentSession, KeganProbeExchange, RelationshipContext, IntelligenceContext, PriorInsightSummary } from '../types.ts';
import { practices as corePractaces } from '../constants.ts';
import { AttachmentStyle, getRecommendedPracticesBySystem } from '../data/attachmentMappings.ts';
import { executeWithFallback, getFallbackModel, shouldUseFallback, logFallbackAttempt } from '../utils/modelFallback';


/**
 * Call OpenRouter API through the proxy endpoint
 * Keeps API key server-side, client sends requests to /api/openrouter-proxy
 */
async function callOpenRouterProxy(model: string, prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetch('/api/openrouter-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter proxy error (${response.status}): ${error.details || error.error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter proxy call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to call OpenRouter API for fallback from Gemini
 */
async function callOpenRouterFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  return callOpenRouterProxy('openai/gpt-oss-120b:exacto', prompt, maxTokens);
}

/**
 * Helper function to call OpenRouter Grok 4.1 as PRIMARY model
 * Used for most text generation tasks where Grok is preferred
 */
async function callOpenRouterGrokPrimary(prompt: string, maxTokens: number = 2000): Promise<string> {
  return callOpenRouterProxy('openrouter/free', prompt, maxTokens);
}

/**
 * Helper function to call OpenRouter Qwen as FALLBACK model
 * Used when Grok 4.1 fails
 */
async function callOpenRouterQwenFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  return callOpenRouterProxy('openrouter/free', prompt, maxTokens);
}

/**
 * Helper function for Gemini fallback (Redirected to Qwen)
 */
async function callGeminiFallback(
  model: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<string> {
  // Redirect all Gemini fallbacks to Qwen via OpenRouter
  return await callOpenRouterQwenFallback(prompt, maxTokens);
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
  _geminiModel: string = 'qwen-fallback-default',  // Kept for backward compatibility but unused
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
    // Try Grok first
    const grokResponse = await callOpenRouterGrokPrimary(prompt);
    return parseAndValidate(grokResponse, 'Grok');
  } catch (grokError) {
    console.warn(`[AI] Grok failed for ${wizardName}, falling back to Qwen:`, grokError);
    // Fallback to Qwen (more reliable than Gemini)
    try {
      const qwenResponse = await callOpenRouterQwenFallback(prompt);
      return parseAndValidate(qwenResponse, 'Qwen');
    } catch (qwenError) {
      throw new Error(
        `Both Grok and Qwen failed for ${wizardName}. ` +
        `Final error: ${String(qwenError).substring(0, 100)}`
      );
    }
  }
}

/**
 * Helper function for safe Gemini API calls with fallback
 * Used for simpler text generation tasks
 */
async function safeQwenCall(
  wizardName: string,
  model: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<string> {
  return await executeWithFallback(
    wizardName,
    model,
    async (primaryModel) => {
      // Default to Grok primary if not specified or not Gemini
      return await callOpenRouterGrokPrimary(prompt, maxTokens);
    },
    async (fallbackModel) => {
      // Use Qwen as fallback
      return await callOpenRouterQwenFallback(prompt, maxTokens);
    }
  );
}

// Helper function to generate text
// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Qwen 2.5 72B Instruct via OpenRouter
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

// FIX: Added missing `explainPractice` function called from `App.tsx`.
export async function explainPractice(practice: Practice): Promise<string> {
  const prompt = `Generate a concise explanation of the practice "${practice.name}" for a beginner, formatted using Markdown for clarity. The explanation should be 2-3 *short* paragraphs, providing very clear, condensed information.

**Paragraph 1: Introduction and Mechanics**
Begin with a brief **History/Origin** of the practice, then describe **What it Involves** in simple terms, outlining the basic actions a beginner would take.

**Paragraph 2: Impact and Validation**
Detail the **Core Benefits** and positive impacts for someone practicing it. Conclude with a mention of its **Research/Sources** or key supporting concepts.

Use the following information as context:
- Practice Name: "${practice.name}"
- Description: "${practice.description}"
- Why it's valuable (Core Benefit): "${practice.why}"
- How to do it (Basic Steps): "${practice.how.join('\n- ')}"
- Evidence/Research: "${practice.evidence}"

Ensure the language is accessible and encouraging for a beginner.
Return ONLY the explanation as a string.`;
  return await generateText(prompt);
}

// FIX: Added missing `populateCustomPractice` function called from `CustomPracticeModal.tsx`.
// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
export async function populateCustomPractice(practiceName: string): Promise<{ description: string; why: string; how: string[]; }> {
  const prompt = `A user wants to create a custom practice called "${practiceName}".
    Generate a concise description, a compelling "why" (the core benefit), and an array of 3-4 simple "how-to" steps.
    Return a JSON object with keys: "description" (string), "why" (string), and "how" (array of strings).
    Return ONLY the JSON object.`;

  const defaultFallback = {
    description: 'Could not generate description. Please try again.',
    why: 'Could not generate rationale.',
    how: ['Step 1: Set your intention', 'Step 2: Practice consistently']
  };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      return await executeWithFallback(
        'PopulateCustomPractice',
        'openrouter/free',
        async (primaryModel) => {
          try {
            const responseText = await callOpenRouterGrokPrimary(prompt);
            const parsed = safeJsonParse(responseText, null, 'populateCustomPractice.grok');
            if (!parsed) throw new Error('Failed to parse Grok response');
            return parsed as { description: string; why: string; how: string[]; };
          } catch (error) {
            throw error;
          }
        },
        async (fallbackModel) => {
          try {
            const responseText = await callOpenRouterQwenFallback(prompt, 2000);
            const parsed = safeJsonParse(responseText, null, 'populateCustomPractice.qwen');
            if (!parsed) throw new Error('Failed to parse Qwen response');
            return parsed as { description: string; why: string; how: string[]; };
          } catch (error) {
            throw new Error(`Fallback parsing failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      );
    },
    {
      context: 'aiService.populateCustomPractice',
      fallback: defaultFallback
    }
  );

  return data || defaultFallback;
}

// FIX: Added missing `getDailyReflection` function called from `TrackerTab.tsx`.
export async function getDailyReflection(notes: { practiceName: string; note: string; }[]): Promise<string> {
  const context = notes.map(n => `- ${n.practiceName}: "${n.note}"`).join('\n');
  const prompt = `Based on a user's daily practice notes, generate a short, encouraging 1-2 sentence reflection.
    Look for themes or connections.
    Notes:
    ${context}
    
    Return only the reflection as a string.`;
  return await generateText(prompt);
}

// FIX: Added missing `summarizeThreeTwoOneSession` function called from `ThreeTwoOneWizard.tsx`.
// UPDATED: Now generates a narrative synthesis connecting trigger → dialogue → embodiment → integration
export async function summarizeThreeTwoOneSession(session: ThreeTwoOneSession): Promise<string> {
  const dialogueText = session.dialogueTranscript
    ?.map(entry => `${entry.role === 'user' ? 'You' : 'Quality'}: ${entry.text}`)
    .join('\n') || session.dialogue || '';

  const prompt = `Create a narrative synthesis of this 3-2-1 shadow work session. The synthesis should tell the story of transformation from trigger to integration.

Structure your response as a coherent narrative (3-4 sentences) that connects:
1. The initial trigger and what the user observed objectively
2. The insight discovered through dialogue with the quality (its positive intention/gift)
3. The embodied experience and core message (what was discovered in the "Be It" perspective)
4. The integration plan and how this gift will be re-owned in a healthy way

Make it powerful and memorable - this is a moment of personal insight and transformation.

Session Data:
- Trigger: ${session.trigger}
- Objective Description (Face It): ${session.faceItAnalysis?.objectiveDescription || session.triggerDescription}
- Dialogue:
${dialogueText}
- Embodiment Statement (Be It): ${session.embodimentAnalysis?.embodimentStatement || session.embodiment}
- Core Message: ${session.embodimentAnalysis?.coreMessage || ''}
- Somatic Location: ${session.embodimentAnalysis?.somaticLocation || ''}
- Re-owning Statement: ${session.integrationPlan?.reowningStatement || ''}
- Integration Action: ${session.integrationPlan?.actionableStep || session.integration}

Return ONLY the narrative synthesis as a string. Make it feel like a genuine moment of insight.`;

  return await generateText(prompt);
}

/**
 * Generate a Socratic probe for the TALK_TO_IT step
 * Facilitates dialogue with the projected quality to uncover its positive intention
 */
export async function generateSocraticProbe(dialogueHistory: Array<{ role: string; text: string }>, trigger: string): Promise<string> {
  const conversationContext = dialogueHistory
    .map(entry => `${entry.role === 'user' ? 'User' : 'Quality'}: ${entry.text}`)
    .join('\n');

  const prompt = `You are a compassionate Socratic guide helping someone uncover the positive intention and gift hidden within a projected shadow quality.

The person is in dialogue with: "${trigger}"

Conversation so far:
${conversationContext}

Your role is to ask a gentle, powerful question that:
1. Honors the quality's perspective (never judges it as "bad")
2. Probes deeper toward its POSITIVE INTENTION - what is it trying to protect or give the person?
3. Moves toward the GIFT - how could this quality serve the person if integrated?
4. Is specific and grounded, not abstract

Examples of good probes:
- "What would happen if you weren't here protecting them?"
- "If you had the person's best interests at heart, what would you want them to know?"
- "What strength or courage are you trying to cultivate in them?"

Ask ONE powerful question that takes the dialogue deeper. Respond in the voice of the quality, as if responding to what the user just said.
Return ONLY the response from the quality's perspective.`;

  return await generateText(prompt);
}

/**
 * Generate a reflective probe for FACE_IT or BE_IT steps
 * Deepens the psychological process at key junctures
 */
export async function generateReflectiveProbe(
  step: 'FACE_IT' | 'BE_IT',
  input: {
    objectiveDescription?: string;
    specificActions?: string[];
    triggeredEmotions?: string[];
    embodimentStatement?: string;
  },
  trigger: string
): Promise<string> {
  if (step === 'FACE_IT') {
    const prompt = `A person is doing shadow work on the trigger: "${trigger}"

They've described it objectively as:
${input.objectiveDescription}

Behaviors they noticed:
${input.specificActions?.join(', ') || 'N/A'}

Emotions triggered:
${input.triggeredEmotions?.join(', ') || 'N/A'}

Now, offer a reflective probe that deepens their awareness. Ask them:
"Beyond this specific person/situation, where else in your life does this same pattern or dynamic show up?"

This helps them see the trigger as a recurring pattern, not an isolated incident. This is crucial for shadow work - recognizing where we unconsciously attract or create these situations.

Formulate the probe as a warm, conversational question that invites reflection. Keep it to 2-3 sentences.
Return ONLY the question.`;

    return await generateText(prompt);
  } else if (step === 'BE_IT') {
    const prompt = `A person is embodying a shadow quality: "${trigger}"

They've created this "I am..." statement:
"${input.embodimentStatement}"

Now guide them into the somatic (body-based) experience of this quality. Generate a gentle, guided prompt that:
1. Invites them to feel this quality in their body
2. Helps them locate physical sensations (energy, tension, warmth, etc.)
3. Deepens their embodied understanding
4. Is framed like a mini-meditation

Example tone:
"Now, take a moment. Close your eyes if you feel comfortable. Really feel into that statement. What sensations arise? Where is the energy strongest in your body? Is there heat, cold, expansion, contraction? Describe the physical feeling of being [quality]."

Return ONLY the somatic guidance prompt as a string, ready to be spoken aloud.`;

    return await generateText(prompt);
  }

  return '';
}

/**
 * Generate a one-line crystallization of the shadow's gift
 */
export async function generateShadowGift(session: ThreeTwoOneSession): Promise<string> {
  const prompt = `From this 3-2-1 shadow work session, distill the ONE core gift that was discovered in the shadow.

Trigger: "${session.trigger}"
Embodiment: "${session.embodimentAnalysis?.embodimentStatement || session.embodiment}"
Core message: "${session.embodimentAnalysis?.coreMessage || ''}"
Re-owning: "${session.integrationPlan?.reowningStatement || session.integration}"

Return EXACTLY ONE sentence (max 15 words) that names the gift. Format: "The gift of [quality]: [what it offers]"
Example: "The gift of anger: fierce clarity about what matters most."
Return ONLY the sentence.`;

  return await generateText(prompt);
}

/**
 * Generate a "watch for" warning about when this shadow might re-emerge
 */
export async function generateWatchFor(session: ThreeTwoOneSession): Promise<string> {
  const prompt = `Based on this 3-2-1 shadow work session, predict when this shadow pattern might re-emerge.

Trigger: "${session.trigger}"
Situation: "${session.triggerSituation || session.triggerDescription || ''}"
Emotions triggered: ${session.faceItAnalysis?.triggeredEmotions?.join(', ') || 'N/A'}
Pattern recurrence: "${session.faceItAnalysis?.patternRecurrence || ''}"

Write 1-2 sentences warning the person about specific situations where this shadow projection might return. Be concrete and practical, not abstract.
Example: "Watch for this pattern when someone at work takes credit for your ideas — the old projection of 'arrogance' may flare before you recognize it as your own unowned ambition."
Return ONLY the warning.`;

  return await generateText(prompt);
}

/**
 * Generate 3 trigger-specific dialogue opener questions for the TALK_TO_IT step.
 * Returns exactly 3 short questions tailored to the specific shadow quality.
 * Fallback: caller uses hardcoded defaults.
 */
export async function generateDialogueOpeners(trigger: string): Promise<string[]> {
  const prompt = `A person is about to dialogue with their shadow quality: "${trigger}"

Generate exactly 3 short, powerful questions they can ask this quality to open the dialogue.
Requirements:
- Each question max 8 words
- Questions should fit the SPECIFIC nature of "${trigger}" (not generic)
- Questions should invite the quality to speak about what it wants, why it's here, what it's protecting or offering
- Tone: curious, non-judgmental, genuinely open

Return ONLY a JSON array of 3 strings. No other text. Example:
["What drives you to act this way?", "What are you protecting me from?", "What do you need from me?"]`;

  try {
    const raw = await generateText(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error('No array found');
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed) && parsed.length === 3 && parsed.every((s: unknown) => typeof s === 'string')) {
      return parsed as string[];
    }
    throw new Error('Invalid format');
  } catch {
    return ['What do you want for me?', 'Why are you here?', 'What are you protecting?'];
  }
}

/**
 * Enhanced Socratic probe with dialogue phase awareness
 * Phases: opening (explore), exploring (probe intention), approaching (name gift), gift (confirm integration)
 */
export async function generatePhasedSocraticProbe(
  dialogueHistory: Array<{ role: string; text: string }>,
  trigger: string,
  phase: 'opening' | 'exploring' | 'approaching' | 'gift'
): Promise<string> {
  const conversationContext = dialogueHistory
    .map(entry => `${entry.role === 'user' ? 'User' : 'Quality'}: ${entry.text}`)
    .join('\n');

  const phaseInstructions: Record<string, string> = {
    opening: `You are in the OPENING phase. Ask an open, welcoming question that invites the quality to speak about itself. Be curious, not probing. Example: "Tell me about yourself. What do you do? What's your role?"`,
    exploring: `You are in the EXPLORING phase. The quality has started talking. Now probe deeper toward its MOTIVATION and INTENTION. What is it trying to protect or achieve? Example: "What would happen if you weren't here? What are you guarding?"`,
    approaching: `You are in the APPROACHING phase. The positive intention is becoming visible. Help name the GIFT explicitly. What strength, wisdom, or protection does this quality offer? Example: "So what you're really offering is... Would you say your gift is [X]?"`,
    gift: `You are in the GIFT phase. The gift has been named or is close. Now help the quality express what it needs to feel valued and integrated rather than rejected. Example: "If they accepted you, how would you show up differently? What would integration look like?"`,
  };

  const prompt = `You are facilitating a 3-2-1 shadow dialogue. The person is talking TO the projected quality "${trigger}" in 2nd person.

${phaseInstructions[phase]}

Conversation so far:
${conversationContext}

Respond AS THE QUALITY (in first person from the quality's perspective). Be authentic, not saccharine. Shadow parts can be fierce, protective, or tender — honor whatever energy is present.

Return ONLY the quality's response (1-3 sentences). No meta-commentary.`;

  return await generateText(prompt);
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-flash via Google API
// Generates an AQAL (All Quadrants All Levels) report based on user's practice data
export async function generateAqalReport(practiceData: {
  practices: Array<{ name: string; module: string; completedToday?: boolean }>;
  insights?: string[];
  keganStage?: string;
}): Promise<AqalReportData> {
  const practiceList = practiceData.practices.map(p =>
    `${p.name} (${p.module})${p.completedToday ? ' - completed' : ''}`
  ).join('\n');

  const prompt = `You are an Integral Life Practice analyst using Ken Wilber's AQAL framework.

Analyze this user's practice data and generate an AQAL report:

PRACTICES:
${practiceList}

${practiceData.insights?.length ? `RECENT INSIGHTS:\n${practiceData.insights.join('\n')}` : ''}
${practiceData.keganStage ? `KEGAN STAGE: ${practiceData.keganStage}` : ''}

Generate a JSON object with:
1. "summary": A 2-3 sentence overview of their integral practice balance
2. "quadrantInsights": An object with keys I, It, We, Its - each with a brief insight about their development in that quadrant
3. "quadrantScores": An object with keys I, It, We, Its - each with a score 0-100 based on practice coverage
4. "recommendations": An array of 2-3 specific recommendations for improving integral balance

Return ONLY valid JSON.`;

  const schema = z.object({
    summary: z.string(),
    quadrantInsights: z.object({
      I: z.string(),
      It: z.string(),
      We: z.string(),
      Its: z.string()
    }),
    quadrantScores: z.object({
      I: z.number(),
      It: z.number(),
      We: z.number(),
      Its: z.number()
    }).optional(),
    recommendations: z.array(z.string())
  });

  const fallback: AqalReportData = {
    summary: 'Unable to generate AQAL analysis at this time.',
    quadrantInsights: {
      I: 'Individual interior practices support self-awareness.',
      It: 'Individual exterior practices build physical health.',
      We: 'Collective interior practices foster connection.',
      Its: 'Collective exterior practices engage systemic awareness.'
    },
    recommendations: ['Continue your current practice to gather more data.'],
    generatedAt: new Date().toISOString()
  };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      return await callGrokThenAIJson<AqalReportData>(
        'GenerateAqalReport',
        prompt,
        'openrouter/free',
        schema
      );
    },
    {
      context: 'aiService.generateAqalReport',
      fallback
    }
  );

  return { ...data || fallback, generatedAt: new Date().toISOString() };
}

// Function used in IFSWizard.tsx for conversational coaching
// Uses Grok 4.1 Fast via OpenRouter with proper message formatting
// PRIMARY: Grok 4.1 via OpenRouter
export async function getCoachResponse(
  systemInstruction: { parts: Array<{ text: string }> },
  conversationHistory: Array<{ role: string; content: string }>,
  currentPhase: string
): Promise<string> {
  const { data, error } = await ErrorHandler.wrapAsync(
    async () => {
      // Extract the system instruction text from the Content object
      const systemText = systemInstruction.parts.map(part => part.text).join('\n');

      // Build messages array for OpenRouter
      const messages = [
        {
          role: 'system' as const,
          content: `${systemText}

## CURRENT PHASE: ${currentPhase}

Before writing your response, silently choose ONE strategy that fits this moment (internal reasoning only — do NOT include it in your reply):

FOLLOW — User is actively in their experience; stay close. Reflect, echo, or simply be present. A question may or may not be needed — do not force one.
PROBE — User is describing from a distance or staying surface-level; bring attention to the body or the felt sense not yet touched.
REFLECT — User has made genuine contact with something real; mirror it back with precision and let it land. No question needed — silence after a good reflection is often right.
VALIDATE — User is flooded, in acute distress, or a very raw layer has surfaced; slow down, orient, stabilize. Do not go deeper until the window reopens.
UNBLEND — User is blended (speaking as the part, not toward it); help them find even a small degree of separation before continuing.
CLOSE — A natural resting point or phase completion has arrived; land simply without adding new content.

Your chosen strategy shapes tone, depth, whether you ask a question, whether you stay with a reflection, whether you slow down or follow. Not every turn needs a question. Some of the best turns are one plain sentence with no question at all.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      // Call Grok 4.1 via OpenRouter proxy with proper message format
      const response = await fetch('/api/openrouter-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter proxy error (${response.status}): ${error.details || error.error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    },
    {
      context: 'aiService.getCoachResponse',
      fallback: ''
    }
  );

  return data || '';
}

// Function for PracticeCustomizationModal.tsx
export async function getPersonalizedHowTo(practice: Practice, userAnswer: string): Promise<string[]> {
  const prompt = `A user wants to personalize the practice "${practice.name}".
    Original "how-to" steps:
    - ${practice.how.join('\n- ')}
    
    The customization question was: "${practice.customizationQuestion}"
    The user's answer is: "${userAnswer}"
    
    Based on their answer, generate a new, personalized list of 3-5 "how-to" steps.
    Each step should be actionable and concise.
    Return ONLY the steps, each on a new line. Do not include numbering or bullet points.`;

  const response = await generateText(prompt);
  return response.split('\n').filter(line => line.trim() !== '');
}

// Function for GuidedPracticeGenerator.tsx (Script)
// MIGRATED: Now uses Grok 4.1 via OpenRouter (was gemini-2.5-flash)
// PRIMARY: Grok 4.1 via OpenRouter
export async function generatePracticeScript(userPrompt: string): Promise<{ title: string, script: string }> {
  const fallback = {
    title: 'Guided Practice',
    script: 'OPENING (2 min)\n1. Find a comfortable position, seated or lying down.\n2. Close your eyes and take three slow breaths.\n\nCORE PRACTICE (6 min)\n1. Bring attention to the natural rhythm of your breath (1 minute).\n2. Notice any tension and release it with each exhale (2 minutes).\n3. Rest in open awareness (3 minutes).\n\nCLOSING (2 min)\n1. Gently deepen the breath and return movement to the hands and feet.\n2. Open your eyes slowly before returning to activity.'
  };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      const systemPrompt = `You are generating a structured practice guide — instruction-style, not narration. Write direct commands the practitioner follows themselves. No "you may want to..." or narrator voice. Use timing cues like "(30 seconds)" or "(2 minutes)" inline within steps. Structure the script with exactly three phases: OPENING, CORE PRACTICE, and CLOSING. Each phase has a header line like "OPENING (2 min)" followed by numbered instructions.`;

      const prompt = `${systemPrompt}\n\nUser request: ${userPrompt}\n\nReturn ONLY a JSON object: {"title": "...", "script": "OPENING (X min)\\n1. ...\\n2. ...\\n\\nCORE PRACTICE (X min)\\n1. ...\\n\\nCLOSING (X min)\\n1. ..."}`;

      // Use Grok 4.1 via OpenRouter
      const responseText = await callOpenRouterGrokPrimary(prompt, 2000);
      const parsed = safeJsonParse(responseText, null, 'generatePracticeScript');

      if (!parsed || typeof parsed !== 'object' || !parsed.title || !parsed.script) {
        throw new Error('Invalid response structure - missing title or script');
      }

      return parsed as { title: string, script: string };
    },
    {
      context: 'aiService.generatePracticeScript',
      fallback
    }
  );

  return data || fallback;
}

// Function for GuidedPracticeGenerator.tsx (Speech)
// DISABLED: Gemini API unavailable - TTS requires gemini-2.5-flash-preview-tts
// No alternative available in Grok 4.1 or other OpenRouter models
export async function generateSpeechFromText(text: string, voiceName: string = 'Kore'): Promise<string> {
  throw new Error('Audio generation is temporarily unavailable. Gemini API access is required for text-to-speech features.');
}


// Functions for SubjectObjectWizard.tsx
export async function articulateSubjectTo(pattern: string, feelings: string, somaticSensation?: string): Promise<string> {
  const prompt = `A user is exploring an unconscious pattern.
    - Pattern: "${pattern}"
    - Feelings/beliefs when in it: "${feelings}"
    ${somaticSensation ? `- Somatic Sensation: "${somaticSensation}"` : ''}
    
    Based on this, articulate the core belief they are "subject to" in a concise "I am..." or "The world is..." statement. 
    ${somaticSensation ? 'Include the somatic quality if it adds depth (e.g. "I am a tight knot of needing to be perfect").' : ''}
    Return ONLY the statement as a string.`;
  return await generateText(prompt);
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-flash-lite via Google API
export async function suggestSubjectObjectExperiments(pattern: string, subjectToStatement: string, costs: string[], priorContext?: PriorInsightSummary): Promise<string[]> {
  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      let prompt = `A user is working on making a pattern object.
- Pattern: "${pattern}"
- Subject to: "${subjectToStatement}"
- Costs: "${costs.join(', ')}"

Suggest 3 small, safe, actionable experiments they could try for one week to gently challenge this pattern. Frame them as questions or simple actions.
Return a JSON array of strings.
Example: ["For one day, what if you acted as if the opposite were true?", "Notice the physical sensation just before the pattern starts."]
Return ONLY the JSON array.`;

      if (priorContext && (priorContext.crossModalPatterns || priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow)) {
        prompt += `

PRIOR CONTEXT - Cross-Modal Patterns:
${priorContext.crossModalPatterns || ''}

Recent insights:
- Body: ${priorContext.body || 'None'}
- Mind: ${priorContext.mind || 'None'}
- Spirit: ${priorContext.spirit || 'None'}
- Shadow: ${priorContext.shadow || 'None'}

Consider these patterns when generating your response.`;
      }

      const schema = z.array(z.string());

      const result = await callGrokThenAIJson<string[]>(
        'SuggestSubjectObjectExperiments',
        prompt,
        'openrouter/free',
        schema
      );

      if (!Array.isArray(result)) {
        throw new Error('Invalid response structure - expected an array');
      }

      return result;
    },
    {
      context: 'aiService.suggestSubjectObjectExperiments',
      fallback: []
    }
  );

  return data || [];
}

// FIX: Add new function to provide AI suggestions for tracing the origin of a pattern.
export async function exploreOrigin(pattern: string, subjectToStatement: string): Promise<string> {
  const prompt = `A user is exploring the origin of an unconscious pattern.
    - Their pattern: "${pattern}"
    - The core belief they are subject to: "${subjectToStatement}"

    Suggest a likely origin for this belief in 2-3 probing sentences. Frame it as a gentle hypothesis, possibly relating to childhood experiences, family dynamics, or a key past event.
    The goal is to jog their memory, not to state a definitive fact.
    Example: "This belief often forms in environments where expressing needs was seen as demanding. Does that resonate with any part of your past?"

    Return ONLY the suggested origin as a string.`;
  return await generateText(prompt);
}

// FIX: Add new function to synthesize user input and generate a final integration insight.
export async function generateIntegrationInsight(pattern: string, subjectToStatement: string, cost: string, experiment: string): Promise<string> {
  const prompt = `A user has completed a Subject-Object exploration and is ready for integration.
    - Pattern: "${pattern}"
    - Subject To: "${subjectToStatement}"
    - Cost of Pattern: "${cost}"
    - Their Chosen Experiment: "${experiment}"

    Synthesize this information and generate a powerful, concise (2-3 sentences) integration insight. Articulate the shift from the old belief to a new, more empowering one.
    Example: "By seeing that you are not your defensiveness, but the one who can compassionately observe it, you can shift from a need to be 'right' to a desire to 'connect'."

    Return ONLY the insight as a string.`;
  return await generateText(prompt);
}


// Functions for IFSWizard.tsx
// MIGRATED: Now uses Grok 4.1 via OpenRouter (was gemini-2.5-flash-lite)
// PRIMARY: Grok 4.1 via OpenRouter
export async function extractPartInfo(transcript: string): Promise<{ role: string, fears: string, positiveIntent: string }> {
  const fallback = { role: 'Part', fears: 'Unknown', positiveIntent: 'Positive Intent' };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      const prompt = `Analyze this IFS session transcript to identify the part's role, fears, and positive intent.
    Transcript:
    ---
    ${transcript}
    ---
    Return a JSON object with three keys: "role" (e.g., "Protector," "Critic"), "fears" (what it's afraid of), and "positiveIntent" (what it's trying to achieve for the user).
    Be concise.
    Return ONLY the JSON object.`;

      // Use Grok 4.1 via OpenRouter
      const responseText = await callOpenRouterGrokPrimary(prompt, 2000);
      return safeJsonParse(responseText, fallback, 'extractPartInfo');
    },
    {
      context: 'aiService.extractPartInfo',
      fallback
    }
  );

  return data || fallback;
}

// MIGRATED: Now uses Grok 4.1 via OpenRouter (was gemini-2.5-pro)
// PRIMARY: Grok 4.1 via OpenRouter
export async function summarizeIFSSession(transcript: string, partInfo: { role: string, fears: string, positiveIntent: string }, priorContext?: PriorInsightSummary): Promise<{ summary: string, aiIndications: string[] }> {
  const fallback = { summary: 'Session summary unavailable.', aiIndications: [] };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      let prompt = `Analyze this IFS session transcript and part info.
    Part Info:
    - Role: ${partInfo.role}
    - Fears: ${partInfo.fears}
    - Positive Intent: ${partInfo.positiveIntent}

    Transcript:
    ---
    ${transcript}
    ---
    Provide a 2-3 sentence summary of the session. **Avoid all therapist-speak (e.g., 'it takes courage', 'deeply real').** Stick to the raw data of what occurred. Then, provide 2-3 "AI Indications" - potential themes, connections to other parts, or areas for future exploration.
    Return a JSON object with keys: "summary" (string) and "aiIndications" (array of strings).
    Return ONLY the JSON object.`;

      if (priorContext && (priorContext.crossModalPatterns || priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow)) {
        prompt += `

PRIOR CONTEXT - Cross-Modal Patterns:
${priorContext.crossModalPatterns || ''}

Recent insights:
- Body: ${priorContext.body || 'None'}
- Mind: ${priorContext.mind || 'None'}
- Spirit: ${priorContext.spirit || 'None'}
- Shadow: ${priorContext.shadow || 'None'}

Consider these patterns when generating your response.`;
      }

      // Use Grok 4.1 via OpenRouter
      const responseText = await callOpenRouterGrokPrimary(prompt, 2500);
      return safeJsonParse(responseText, fallback, 'summarizeIFSSession');
    },
    {
      context: 'aiService.summarizeIFSSession',
      fallback
    }
  );

  return data || fallback;
}

// Function for RecommendationsTab.tsx
// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-flash-lite via Google API
export async function generateRecommendations(context: string): Promise<string[]> {
  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      const prompt = `Based on the user's current ILP context, provide 3 actionable recommendations.
Context:
---
${context}
---
Recommendations should be specific and encouraging. They could suggest adding a new practice, modifying an existing one, or using a mind/shadow tool.
Return a JSON array of strings.
Example: ["You're doing great with Body practices. Consider adding 'Daily Meditation' to bring in the Spirit module.", "Your notes mention feeling overwhelmed. The '3-2-1 Process' could help you work with that feeling."]
Return ONLY the JSON array.`;

      const schema = z.array(z.string());

      return await callGrokThenAIJson<string[]>(
        'GenerateRecommendations',
        prompt,
        'openrouter/free',
        schema
      );
    },
    {
      context: 'aiService.generateRecommendations',
      fallback: []
    }
  );

  return data || [];
}

// Wizard to AQAL Quadrant Mapping (MVP)
const WIZARD_QUADRANT_MAP: Record<string, string> = {
  'keganAssessment': 'I',
  'threeTwoOne': 'I',
  'ifsSession': 'I',
  'bigMindSession': 'I',
  'attachmentAssessment': 'We',
  'relationalPatterns': 'We',
  'roleAlignment': 'We',
  'integralBodyArchitect': 'It',
};

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
export async function generatePracticeStructure(goal: string, why: string, timePerWeek: number): Promise<{ name: string, description: string, howSteps: string[], difficulty: 'Low' | 'Medium' | 'High', affectsSystem: string[] }> {
  const prompt = `A user is creating a custom practice.
- Goal: "${goal}"
- Why it's valuable: "${why}"
- Time commitment: ${timePerWeek} hours/week.

Act as a practice designer. Generate a fitting "name", a concise "description" (1 sentence), an array of 3-5 actionable "howSteps", a "difficulty" ('Low', 'Medium', or 'High'), and an array of 3-4 "affectsSystem" (body/mind systems it impacts).
Return a JSON object with these keys.
Return ONLY the JSON object.`;

  const schema = z.object({
    name: z.string(),
    description: z.string(),
    howSteps: z.array(z.string()),
    difficulty: z.enum(['Low', 'Medium', 'High']),
    affectsSystem: z.array(z.string())
  });

  return await callGrokThenAIJson(
    'GeneratePracticeStructure',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
// Generates research-based information about a practice
export async function generatePracticeResearch(practiceName: string): Promise<{
  why: string;
  evidence: string;
  roi: 'HIGH' | 'VERY HIGH' | 'EXTREME';
}> {
  const prompt = `You are a wellness research specialist. Research the practice: "${practiceName}"

Provide:
1. "why": A compelling 2-3 sentence explanation of why this practice is valuable for personal development
2. "evidence": A brief summary of scientific or clinical evidence supporting this practice (cite general sources like "studies show..." or "research indicates...")
3. "roi": Rate the return on investment as 'HIGH', 'VERY HIGH', or 'EXTREME' based on effort-to-benefit ratio

Return ONLY a JSON object with these keys.`;

  const schema = z.object({
    why: z.string(),
    evidence: z.string(),
    roi: z.enum(['HIGH', 'VERY HIGH', 'EXTREME'])
  });

  return await callGrokThenAIJson(
    'GeneratePracticeResearch',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
export async function generateShadowPatternInsights(pattern: string): Promise<{ origin: string, framework: string }> {
  const prompt = `A user is creating a shadow work practice for the pattern: "${pattern}".
Act as a depth psychologist. Suggest a likely "origin" for this pattern (e.g., childhood dynamics, formative experiences) and a relevant psychological "framework" for understanding it (e.g., IFS, Attachment Theory, Jungian archetypes).
Return a JSON object with keys: "origin" (string) and "framework" (string).
Return ONLY the JSON object.`;

  const schema = z.object({
    origin: z.string(),
    framework: z.string()
  });

  return await callGrokThenAIJson(
    'GenerateShadowPatternInsights',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
export async function generateShadowWorkStructure(pattern: string, origin: string): Promise<{ name: string, description: string, inquiryQuestions: string[], affectsSystem: string[] }> {
  const prompt = `A user is creating a shadow work practice.
- Pattern: "${pattern}"
- Likely Origin: "${origin}"

Design a practice structure. Generate a creative "name", a concise "description", an array of 3-4 deep "inquiryQuestions" (instead of steps), and an array of psychological "affectsSystem" it impacts (e.g., 'reactivity', 'self-awareness').
Return a JSON object with these keys.
Return ONLY the JSON object.`;

  const schema = z.object({
    name: z.string(),
    description: z.string(),
    inquiryQuestions: z.array(z.string()),
    affectsSystem: z.array(z.string())
  });

  return await callGrokThenAIJson(
    'GenerateShadowWorkStructure',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-flash-lite via Google API
export async function generateSpiritualContext(aspiration: string): Promise<{ tradition: string, teachings: string }> {
  const prompt = `A user wants to create a spiritual practice for the aspiration: "${aspiration}".
Act as a comparative spirituality expert. Identify the primary contemplative "tradition" this aspiration draws from (e.g., Zen Buddhism, Sufism) and summarize the key "teachings" or principles related to it.
Return a JSON object with keys: "tradition" (string) and "teachings" (string).
Return ONLY the JSON object.`;

  const schema = z.object({
    tradition: z.string(),
    teachings: z.string()
  });

  return await callGrokThenAIJson(
    'GenerateSpiritualContext',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-pro via Google API
export async function generateSpiritualPracticeStructure(aspiration: string, tradition: string): Promise<{ name: string, description: string, stages: string[], consciousnessAspects: string[] }> {
  const prompt = `A user is creating a spiritual practice.
- Aspiration: "${aspiration}"
- Tradition: "${tradition}"

Design a contemplative practice structure. Generate a fitting "name", a poetic "description", an array of 3-4 "stages" or movements for the practice, and an array of "consciousnessAspects" it cultivates (e.g., 'presence', 'non-duality').
Return a JSON object with these keys.
Return ONLY the JSON object.`;

  const schema = z.object({
    name: z.string(),
    description: z.string(),
    stages: z.array(z.string()),
    consciousnessAspects: z.array(z.string())
  });

  return await callGrokThenAIJson(
    'GenerateSpiritualPracticeStructure',
    prompt,
    'openrouter/free',
    schema as any
  );
}

// PRIMARY: Grok 4.1 via OpenRouter
// FALLBACK: Gemini 2.5-flash via Google API
export async function refinePractice(name: string, description: string, why: string, howSteps: string[], timePerWeek: number, module: ModuleKey): Promise<string[]> {
  const prompt = `A user has drafted a custom practice for the "${module}" module.
- Name: ${name}
- Description: ${description}
- Why: ${why}
- Steps/Questions: ${howSteps.join('; ')}
- Time: ${timePerWeek}h/week

Act as a practice design coach. Provide an array of 3 short, actionable suggestions to refine or improve this practice. Focus on clarity, safety, or deepening the impact.
Return a JSON array of strings.
Return ONLY the JSON array.`;

  const schema = z.array(z.string());

  return await callGrokThenAIJson<string[]>(
    'RefinePractice',
    prompt,
    'openrouter/free',
    schema as any
  );
}

/**
 * Detects patterns from a Mind tool session and suggests relevant Shadow work practices.
 * @param mindToolType The type of Mind tool used (e.g., 'BiasDetective').
 * @param mindToolSessionId The ID of the completed Mind tool session.
 * @param mindToolSessionReport A full markdown report of the Mind tool session's key findings.
 * @param availableShadowPractices The list of available shadow practices.
 * @returns An IntegratedInsight object with detected patterns and suggested shadow work, or null if no suggestions.
 */
export async function detectPatternsAndSuggestShadowWork(
  mindToolType: IntegratedInsight['mindToolType'],
  mindToolSessionId: string,
  mindToolSessionReport: string,
  availableShadowPractices: Practice[]
): Promise<IntegratedInsight | null> {
  const shadowPracticeList = availableShadowPractices
    .map(p => `- ID: ${p.id}, Name: ${p.name}, Description: ${p.description}`)
    .join('\n');

  const prompt = `
As an Integral Coach specializing in shadow work integration, analyze the following report from a user's "${mindToolType}" session.

**Mind Tool Session Report:**
"${mindToolSessionReport}"

**VOICE RULES (critical):**
- Use the user's OWN words and register — do not translate into clinical, archetypal, or spiritual vocabulary
- If they said "can't deal with my dad stuff", detectedPattern should reflect that language, not "unresolved paternal attachment dynamics"
- Quote or closely paraphrase their actual words

**Your Task:**
1. Generate a one-sentence summary of the session in their own register.
2. Identify 1-2 core patterns or beliefs operating as potential shadow material. Stay in their language.
3. Recommend 1-3 practices from the list below. Use ONLY the exact IDs provided.
4. Give 1-2 sentences of rationale per practice.

**Available Shadow Work Practices (choose relevant IDs only):**
${shadowPracticeList}

If no clear shadow-related pattern is detected, return null.

{
  "shortSummary": "User explored difficulty setting limits with family without feeling guilty",
  "detectedPattern": "Pattern of shrinking to keep others comfortable — difficulty claiming space without feeling selfish",
  "suggestedShadowWork": [
    {
      "practiceId": "three-two-one",
      "practiceName": "3-2-1 Shadow Process",
      "rationale": "Helps externalize and dialogue with the part that believes taking up space is wrong"
    }
  ]
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const schema = z.object({
      shortSummary: z.string(),
      detectedPattern: z.string(),
      suggestedShadowWork: z.array(z.object({
        practiceId: z.string(),
        practiceName: z.string(),
        rationale: z.string()
      }))
    }).nullable();

    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-pro via Google API
    const result = await callGrokThenAIJson(
      'DetectPatternsAndSuggestShadowWork',
      prompt,
      'openrouter/free',
      schema as any
    );

    // Type assertion for the result
    const typedResult = result as { detectedPattern?: string; shortSummary?: string; suggestedShadowWork?: Array<{ practiceId: string; rationale: string }> } | null;

    if (!typedResult || !typedResult.detectedPattern || !typedResult.shortSummary || !Array.isArray(typedResult.suggestedShadowWork)) {
      return null;
    }

    const validSuggestions = typedResult.suggestedShadowWork
      .map((s: any) => {
        const normalizedPracticeId = s.practiceId?.toLowerCase().trim();
        const foundPractice = availableShadowPractices.find(p => p.id === normalizedPracticeId);
        if (foundPractice) {
          return {
            practiceId: foundPractice.id,
            practiceName: foundPractice.name,
            rationale: s.rationale,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (validSuggestions.length === 0) return null;

    return {
      id: `integrated-insight-${Date.now()}`,
      mindToolType,
      mindToolSessionId,
      mindToolName: `${mindToolType} session on "${typedResult.shortSummary.substring(0, 50)}${typedResult.shortSummary.length > 50 ? '...' : ''}"`,
      mindToolReport: mindToolSessionReport,
      mindToolShortSummary: typedResult.shortSummary,
      detectedPattern: typedResult.detectedPattern,
      suggestedShadowWork: validSuggestions as IntegratedInsight['suggestedShadowWork'],
      suggestedNextSteps: [],
      dateCreated: new Date().toISOString(),
      status: 'pending',
    };
  } catch (error) {
    console.error("Error in detectPatternsAndSuggestShadowWork:", error);
    return null;
  }
}

// Kegan Developmental Stage Assessment Analysis
export async function analyzeKeganStage(responses: KeganResponse[], priorContext?: PriorInsightSummary): Promise<{
  centerOfGravity: KeganStage;
  confidence: 'Low' | 'Medium' | 'High';
  domainVariation: Record<KeganDomain, KeganStage>;
  developmentalEdge: string;
  recommendations: string[];
  fullAnalysis: string;
}> {
  const fallback: {
    centerOfGravity: KeganStage;
    confidence: 'Low' | 'Medium' | 'High';
    domainVariation: Record<KeganDomain, KeganStage>;
    developmentalEdge: string;
    recommendations: string[];
    fullAnalysis: string;
  } = {
    centerOfGravity: 'The Self-Authored Mind',
    confidence: 'Low',
    domainVariation: {
      'Relationships': 'The Self-Authored Mind',
      'Work & Purpose': 'The Self-Authored Mind',
      'Values & Beliefs': 'The Self-Authored Mind',
      'Conflict & Feedback': 'The Self-Authored Mind',
      'Identity & Self': 'The Self-Authored Mind'
    },
    fullAnalysis: 'Analysis could not be completed. Please try again.',
    developmentalEdge: 'Unable to determine at this time.',
    recommendations: [
      'Retake the assessment with more detailed responses',
      'Work with the Subject-Object Explorer tool',
      'Consider working with a developmental coach or therapist',
      'Read "Immunity to Change" by Kegan & Lahey'
    ]
  };

  const { data } = await ErrorHandler.wrapAsync(
    async () => {
      const responsesContext = responses.map(r =>
        `Domain: ${r.domain}\nResponse: ${r.response}`
      ).join('\n\n---\n\n');

      let prompt = `You are a developmental psychologist trained in Robert Kegan's constructive-developmental theory. Analyze these responses from a self-assessment based on Kegan's framework.

# Kegan's Framework Overview

**Socialized Mind (Stage 3):**
- Subject to: relationships, others' expectations, mutually-reciprocal role consciousness
- Object: impulses, needs, perceptions
- Key marker: Cannot step outside relationships to examine them. Identity IS relationships. External validation defines worth.

**Self-Authoring Mind (Stage 4):**
- Subject to: own ideology, internal system, identity, self-authorship
- Object: relationships, expectations, social roles
- Key marker: Has internal compass, can examine relationships objectively, self-governed, but cannot see own ideology as partial.

**Self-Transforming Mind (Stage 5):**
- Subject to: dialectical process, inter-penetration of systems
- Object: ideology, identity, authorship
- Key marker: Can step back from own ideology, holds contradictions, sees all systems as partial, comfort with paradox.

**Transitional Stages:**
- People are often between stages (3/4 or 4/5), showing elements of both.

# Assessment Responses

${responsesContext}

# Your Task

Analyze these responses for:
1. What is SUBJECT (embedded in, cannot see) vs OBJECT (can observe, reflect on)
2. How meaning is being made
3. Center of gravity (most consistent stage)
4. Domain variation (different stages in different areas)
5. Developmental edge (where they're growing)

Return a JSON object with this exact structure:
{
  "centerOfGravity": "Socialized Mind" | "Socialized/Self-Authoring Transition" | "Self-Authoring Mind" | "Self-Authoring/Self-Transforming Transition" | "Self-Transforming Mind",
  "confidence": "Low" | "Medium" | "High",
  "domainVariation": {
    "Relationships": [stage],
    "Work & Purpose": [stage],
    "Values & Beliefs": [stage],
    "Conflict & Feedback": [stage],
    "Identity & Self": [stage]
  },
  "fullAnalysis": "A comprehensive 4-6 paragraph analysis explaining:\n- What you notice about subject-object structure\n- Key indicators in their responses\n- Patterns across domains\n- Where they show consistency and variation\n- Evidence for the center of gravity assessment",
  "developmentalEdge": "2-3 sentences describing where this person appears to be growing and what might support that growth",
  "recommendations": [
    "Specific practice recommendation 1 (e.g., 'Work with the Subject-Object Explorer on [specific pattern]')",
    "Specific practice recommendation 2 (e.g., 'Engage shadow work around [specific theme]')",
    "Specific practice recommendation 3 (e.g., 'Read [book] or work with [type of practitioner]')",
    "Specific practice recommendation 4"
  ]
}

Important:
- Be nuanced. Most people are in transition.
- Look for what they CAN'T see, not just what they say.
- Later stages aren't "better" - be descriptive, not prescriptive.
- Base assessment on actual response content, not assumptions.
- If responses show inconsistency, note lower confidence.`;

      if (priorContext && (priorContext.crossModalPatterns || priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow)) {
        prompt += `

PRIOR CONTEXT - Cross-Modal Patterns:
${priorContext.crossModalPatterns || ''}

Recent insights:
- Body: ${priorContext.body || 'None'}
- Mind: ${priorContext.mind || 'None'}
- Spirit: ${priorContext.spirit || 'None'}
- Shadow: ${priorContext.shadow || 'None'}

Consider these patterns when generating your response.`;
      }

      const schema = z.object({
        centerOfGravity: z.string(),
        confidence: z.enum(['Low', 'Medium', 'High']),
        domainVariation: z.object({
          'Relationships': z.string(),
          'Work & Purpose': z.string(),
          'Values & Beliefs': z.string(),
          'Conflict & Feedback': z.string(),
          'Identity & Self': z.string()
        }),
        fullAnalysis: z.string(),
        developmentalEdge: z.string(),
        recommendations: z.array(z.string())
      });

      // PRIMARY: Grok 4.1 via OpenRouter
      // FALLBACK: Gemini 2.5-flash-lite via Google API
      return await callGrokThenAIJson(
        'AnalyzeKeganStage',
        prompt,
        'openrouter/free',
        schema as any
      );
    },
    {
      context: 'aiService.analyzeKeganStage',
      fallback
    }
  );

  return (data as {
    centerOfGravity: KeganStage;
    confidence: 'Low' | 'Medium' | 'High';
    domainVariation: Record<KeganDomain, KeganStage>;
    developmentalEdge: string;
    recommendations: string[];
    fullAnalysis: string;
  }) || fallback;
}

// Kegan Post-Dialogue Probe Generation Functions

/**
 * Generate a probe that explores contradictions and nuances in the assessment responses
 */
export async function generateContradictionProbe(
  assessmentSession: KeganAssessmentSession
): Promise<string> {
  const responsesContext = assessmentSession.responses.map(r =>
    `Domain: ${r.domain}\nResponse: ${r.response}`
  ).join('\n\n---\n\n');

  const analysisContext = assessmentSession.overallInterpretation
    ? `Center of Gravity: ${assessmentSession.overallInterpretation.centerOfGravity}\n` +
    `Domain Variation: ${JSON.stringify(assessmentSession.overallInterpretation.domainVariation)}\n` +
    `Analysis: ${assessmentSession.overallInterpretation.fullAnalysis}`
    : '';

  const prompt = `You are a skilled developmental interviewer trained in the Subject-Object Interview method. Your role is to probe for contradictions and nuances to reveal the boundaries of someone's meaning-making system.

# Assessment Context

${responsesContext}

# Current Analysis

${analysisContext}

# Your Task

Examine the responses for areas where values, self-perceptions, or commitments might clash or create internal tension. Generate ONE specific, scenario-based question that:

1. Identifies a potential contradiction between two responses or values
2. Creates a specific, high-stakes scenario where this tension becomes impossible to ignore
3. Asks them to resolve the tension and reveal what is ACTUALLY at stake internally
4. Uses the format: "In one response you described X. In another, you described Y. Let's explore that edge. Imagine [specific high-stakes scenario]. What is *actually* at stake for you in that moment? Walk me through the internal conflict."

Requirements:
- Be specific and personal (reference their actual words)
- Make the scenario realistic and emotionally resonant
- Focus on what they CAN'T see (subject) vs what they CAN see (object)
- The goal is to reveal their current developmental structure, not to judge it

Return ONLY the probe question as plain text, no JSON or markdown formatting.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return (await generateText(prompt)).trim();
  } catch (error) {
    console.error('Error generating contradiction probe:', error);
    // Fallback: reference actual assessment content for voice preservation
    const stageLabel = assessmentSession.overallInterpretation?.centerOfGravity || 'your current structure';
    return `Looking at your specific responses, I'm noticing some tension. In one moment you emphasized something, and in another you seemed pulled in a different direction. Can you describe a recent time when these two sides of you were both present? What was actually at stake for you—not in theory, but in that actual moment?`;
  }
}

/**
 * Generate a probe that helps make "subject" into "object"
 */
export async function generateSubjectByObjectProbe(
  assessmentSession: KeganAssessmentSession
): Promise<string> {
  const responsesContext = assessmentSession.responses.map(r =>
    `Domain: ${r.domain}\nResponse: ${r.response}`
  ).join('\n\n---\n\n');

  const analysisContext = assessmentSession.overallInterpretation
    ? `Center of Gravity: ${assessmentSession.overallInterpretation.centerOfGravity}\n` +
    `Analysis: ${assessmentSession.overallInterpretation.fullAnalysis}`
    : '';

  const prompt = `You are a skilled developmental interviewer. Your task is to help someone step back from what they are "subject to" (embedded in, fused with) and begin to see it as "object" (something they can observe and reflect on).

# Assessment Context

${responsesContext}

# Current Analysis

${analysisContext}

# Your Task

Identify something the person appears to be "subject to" - embedded in and unable to step back from. This might be:
- An emotional reaction they describe but can't observe
- A belief or value they ARE rather than HAVE
- A role or identity they're fused with
- A defensive pattern they're inside of

Generate ONE specific probe that:
1. Identifies the pattern/reaction/belief they're subject to
2. Invites them to treat it as an object - something separate from themselves
3. Asks them to analyze its purpose, origin, or protective function
4. Uses the metaphor of "a part of you" or similar externalizing language

Format: "You mentioned [specific reaction/pattern]. Let's step back from that reaction. Imagine that [the pattern] is an object—like a [metaphor: guard dog, shield, voice]. What is that [metaphor] trying to protect? What does it believe will happen if it fails to protect you? What is its origin story?"

Requirements:
- Reference their specific words and patterns
- Use externalizing language ("that part of you" not "you")
- Make it feel curious and compassionate, not judgmental
- Aim to create distance between them and the pattern

Return ONLY the probe question as plain text.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return (await generateText(prompt)).trim();
  } catch (error) {
    console.error('Error generating subject-object probe:', error);
    // Fallback: invite distance from pattern without clinical language
    return "You described something you seem really caught in—something that happens and you're right there in it. Let's step back from that for a moment. Imagine that pattern is like a part of you, doing something. What do you think that part is actually trying to do for you? What's it afraid will happen if it stops?";
  }
}

/**
 * Generate a probe that explores the boundaries of "Big Assumptions"
 */
export async function generateAssumptionBoundaryProbe(
  assessmentSession: KeganAssessmentSession
): Promise<string> {
  const responsesContext = assessmentSession.responses.map(r =>
    `Domain: ${r.domain}\nResponse: ${r.response}`
  ).join('\n\n---\n\n');

  const analysisContext = assessmentSession.overallInterpretation
    ? `Center of Gravity: ${assessmentSession.overallInterpretation.centerOfGravity}\n` +
    `Developmental Edge: ${assessmentSession.overallInterpretation.developmentalEdge}\n` +
    `Analysis: ${assessmentSession.overallInterpretation.fullAnalysis}`
    : '';

  const prompt = `You are a skilled developmental interviewer specializing in uncovering "Big Assumptions" - the hidden beliefs that organize someone's current meaning-making system.

# Assessment Context

${responsesContext}

# Current Analysis

${analysisContext}

# Your Task

Identify a potential "Big Assumption" - an unconscious belief that seems to organize their identity, worth, or safety. Common examples:
- "My value comes from being useful/competent/needed"
- "If I'm not in control, everything will fall apart"
- "Conflict means rejection"
- "I must never be a burden"

Generate ONE specific probe that:
1. Names the suspected big assumption clearly
2. Asks them to imagine a world where it's no longer true (through no fault of their own)
3. Explores what would have to be true for them to still feel okay/whole/worthy
4. Reveals what their identity/worth is currently dependent on

Format: "Your responses suggest a deep connection between [domain] and [self-worth/identity]. It sounds like you operate from an assumption that '[the big assumption]'. Let's test that. Imagine for a moment you woke up tomorrow and, through no fault of your own, [the assumption is no longer available - you can't be competent, can't be in control, etc.]. After the initial panic, what would have to be true for you to still feel [okay/worthy/whole]? Where would your value come from then?"

Requirements:
- Be specific about the identified assumption
- Make the scenario feel impossible but important to explore
- The question should reveal the foundation of their current system
- Frame it as a thought experiment, not a threat
- CRITICAL: Use the user's OWN language and register. Do NOT translate to archetypal labels (e.g., "perfectionism", "rejection sensitivity").

Return ONLY the probe question as plain text.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return (await generateText(prompt)).trim();
  } catch (error) {
    console.error('Error generating assumption boundary probe:', error);
    // Fallback: use user's own language patterns when available
    const userLanguage = assessmentSession.responses?.[0]?.response || 'your responses';
    return `Looking at what you said, it seems like something matters a lot to you — something that feels tied to who you are. Let's explore that. Imagine you woke up tomorrow and, through no fault of your own, that thing was no longer available to you. After the initial shock, what would have to be true for you to still feel like yourself? Where would your sense of identity come from then?`;
  }
}

/**
 * Analyze a user's response to a probe
 */
export async function analyzeProbeResponse(
  probe: KeganProbeExchange,
  assessmentSession: KeganAssessmentSession
): Promise<{
  subjectObjectReveal: string;
  developmentalInsight: string;
  nextProbe?: string;
}> {
  if (!probe.userResponse || probe.userResponse.trim() === '') {
    return {
      subjectObjectReveal: 'No response provided',
      developmentalInsight: 'Unable to analyze without a response',
    };
  }

  const prompt = `You are analyzing a response from a developmental probe in the Kegan framework.

# Probe Type: ${probe.probeType}

# Question Asked:
${probe.question}

# User's Response:
${probe.userResponse}

# Original Assessment Context:
Center of Gravity: ${assessmentSession.overallInterpretation?.centerOfGravity || 'Unknown'}

# Your Task

Analyze this response for:

1. **Subject-Object Structure**: What did this response reveal about what they're subject to (embedded in, can't see) vs object (can observe and reflect on)?

2. **Developmental Insight**: What does their way of answering reveal about their current stage?
   - Did they struggle to answer? (might indicate hitting the edge of their system)
   - Did they quickly resolve the tension with their existing framework? (indicates that framework is subject)
   - Could they step back and examine the assumption/pattern/belief? (indicates it's becoming object)

3. **Next Probe** (optional): If there's a promising edge to explore further with a follow-up question, suggest it.

Return a JSON object:
{
  "subjectObjectReveal": "2-3 sentences about what became visible in terms of subject/object structure",
  "developmentalInsight": "2-3 sentences about what this reveals about their current developmental stage",
  "nextProbe": "Optional follow-up question if there's a promising edge to explore further"
}`;

  try {
    const schema = z.object({
      subjectObjectReveal: z.string(),
      developmentalInsight: z.string(),
      nextProbe: z.string().optional()
    });

    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'AnalyzeProbeResponse',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error analyzing probe response:', error);
    return {
      subjectObjectReveal: 'Analysis unavailable at this time.',
      developmentalInsight: 'Please continue with the exploration.',
    };
  }
}

/**
 * Generate integrated insights after all probes are complete
 */
export async function generateProbeIntegratedInsights(
  assessmentSession: KeganAssessmentSession,
  probeSession: { exchanges: KeganProbeExchange[] }
): Promise<{
  confirmedStage: KeganStage;
  refinedAnalysis: string;
  edgeOfDevelopment: string;
  bigAssumptions: string[];
  subjectStructure: string[];
  objectStructure: string[];
  recommendations: string[];
}> {
  const probesContext = probeSession.exchanges.map(ex =>
    `Type: ${ex.probeType}\nQuestion: ${ex.question}\nResponse: ${ex.userResponse || 'No response'}\n` +
    `Analysis: ${ex.aiAnalysis ? `${ex.aiAnalysis.subjectObjectReveal}\n${ex.aiAnalysis.developmentalInsight}` : 'Not analyzed'}`
  ).join('\n\n---\n\n');

  const originalAnalysis = assessmentSession.overallInterpretation
    ? `Original Center of Gravity: ${assessmentSession.overallInterpretation.centerOfGravity}\n` +
    `Original Analysis: ${assessmentSession.overallInterpretation.fullAnalysis}`
    : '';

  const prompt = `You are completing a developmental assessment that used interactive probing to test the boundaries of someone's meaning-making system.

# Original Assessment

${originalAnalysis}

# Interactive Probes and Responses

${probesContext}

# Your Task

Integrate the original assessment with the insights from the probes to provide a refined developmental analysis.

Return a JSON object:
{
  "confirmedStage": "Socialized Mind" | "Socialized/Self-Authoring Transition" | "Self-Authoring Mind" | "Self-Authoring/Self-Transforming Transition" | "Self-Transforming Mind",
  "refinedAnalysis": "3-4 paragraphs integrating original assessment with probe insights. What became clearer through the interactive exploration?",
  "edgeOfDevelopment": "2-3 sentences describing with more precision where they're growing and what would support that growth",
  "bigAssumptions": [
    "First identified limiting assumption",
    "Second identified limiting assumption",
    "Third identified limiting assumption (if applicable)"
  ],
  "subjectStructure": [
    "First thing they're currently subject to (embedded in)",
    "Second thing they're subject to",
    "Third thing they're subject to (if applicable)"
  ],
  "objectStructure": [
    "First thing they can now hold as object (reflect on)",
    "Second thing they can hold as object",
    "Third thing they can hold as object (if applicable)"
  ],
  "recommendations": [
    "Specific developmental recommendation 1",
    "Specific developmental recommendation 2",
    "Specific developmental recommendation 3",
    "Specific developmental recommendation 4"
  ]
}

Be specific and reference actual content from their responses. The probes should have revealed more nuanced understanding of their current structure.`;

  try {

    const schema = z.object({

      confirmedStage: z.enum([

        "The Socialized Mind",

        "Transitioning: Socialized to Self-Authored",

        "The Self-Authored Mind",

        "Transitioning: Self-Authored to Self-Transforming",

        "The Self-Transforming Mind"

      ]),

      refinedAnalysis: z.string(),

      edgeOfDevelopment: z.string(),

      bigAssumptions: z.array(z.string()),

      subjectStructure: z.array(z.string()),

      objectStructure: z.array(z.string()),

      recommendations: z.array(z.string())

    });



    // PRIMARY: Grok 4.1 via OpenRouter


    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'GenerateProbeIntegratedInsights',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error generating integrated insights:', error);
    return {
      confirmedStage: assessmentSession.overallInterpretation?.centerOfGravity || 'The Self-Authored Mind',
      refinedAnalysis: 'The interactive probes provided additional context for understanding your developmental structure.',
      edgeOfDevelopment: assessmentSession.overallInterpretation?.developmentalEdge || 'Continue exploring the boundaries of your current meaning-making system.',
      bigAssumptions: ['Unable to determine at this time'],
      subjectStructure: ['Analysis incomplete'],
      objectStructure: ['Analysis incomplete'],
      recommendations: assessmentSession.overallInterpretation?.recommendations || [
        'Work with the Subject-Object Explorer tool',
        'Continue developmental practices',
        'Consider working with a developmental coach'
      ]
    };
  }
}

// Relational Pattern Tracking - Chatbot Conversation
export async function getRelationalPatternResponse(
  conversationContext: string,
  userMessage: string,
  exploredRelationships: RelationshipContext[],
  insightContext?: IntegratedInsight | null
): Promise<{
  message: string;
  extractedRelationship?: RelationshipContext;
  shouldOfferAnalysis: boolean;
}> {
  const prompt = `You are a compassionate relational pattern guide helping someone explore how they show up in different relationships and where they're reactive.

# Conversation Context
${conversationContext}

# User's Latest Message
${userMessage}

# Relationships Already Explored
${exploredRelationships.map((r, i) => `${i + 1}. ${r.type}: ${r.pattern || 'In progress'}`).join('\n')}

# Your Role
- Ask gentle, probing questions to help them see patterns
- Help them identify: the trigger situation, their automatic reaction, and the underlying fear/need
- Once you have those three things for a relationship, extract the pattern and move to another relationship type
- Guide them to explore different relationship types (romantic, parent, boss, friend, etc.)
- Look for reactivity: withdrawal, anger, people-pleasing, defensiveness, collapse, controlling behavior
- Be curious, not judgmental
- Keep responses conversational and under 4 sentences

${insightContext ? `
# IMPORTANT CONTEXT (from Intelligence Hub)
The user is starting this session based on an insight:
- Pattern: "${insightContext.detectedPattern}"
- Summary: ${insightContext.mindToolShortSummary}
- Origin: ${insightContext.mindToolType}

Explicitly acknowledge this pattern in your opening/first response if the conversation is just beginning.
` : conversationContext === '' ? `
# STANDALONE SESSION
This is a fresh session with no prior context. Do NOT reference any external patterns or insights. Start by asking: "What relationship dynamic is on your mind today?"
` : ''}

# Instructions
1. Respond to their message
2. If they've given enough info about a relationship (trigger + reaction + fear), summarize the pattern and suggest exploring a different relationship type
3. Ask one clear question to deepen understanding
4. Track whether this conversation has extracted a complete relationship pattern

Return JSON:
{
  "message": "Your conversational response",
  "extractedRelationship": {
    "type": "Boss/Authority" | "Romantic Partner" | etc.,
    "personDescription": "my boss",
    "triggerSituation": "what triggers the reaction",
    "yourReaction": "how they react automatically",
    "underlyingFear": "the fear or need driving it",
    "pattern": "1-2 sentence pattern summary"
  } | null,
  "shouldOfferAnalysis": true if 3+ relationships explored AND user seems ready
}`;

  try {
    const schema = z.object({
      message: z.string(),
      extractedRelationship: z.object({
        type: z.enum([
          'Romantic Partner',
          'Parent',
          'Child',
          'Sibling',
          'Friend',
          'Boss/Authority',
          'Colleague',
          'Direct Report',
          'Stranger/Public'
        ]),
        personDescription: z.string().optional(),
        triggerSituation: z.string().optional(),
        yourReaction: z.string().optional(),
        underlyingFear: z.string().optional(),
        pattern: z.string().optional()
      }).optional().nullable(),
      shouldOfferAnalysis: z.boolean()
    });

    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'GetRelationalPatternResponse',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error getting relational response:', error);
    return {
      message: "Could you tell me more about that?",
      shouldOfferAnalysis: false
    };
  }
}

// Analyze Relational Patterns Across Relationships
export async function analyzeRelationalPatterns(
  relationships: RelationshipContext[],
  conversation: { role: string; text: string }[]
): Promise<{
  corePatterns: string[];
  reactiveSignatures: string[];
  relationshipSpecificPatterns: Record<string, string>;
  developmentalHypothesis: string;
  shadowWork: string;
  recommendations: string[];
}> {
  // Build relationship context from both structured data and conversation
  const relationshipSummaries = relationships.map((r, i) => `
${i + 1}. **${r.type}** ${r.personDescription ? ` (${r.personDescription})` : ''}
  - Trigger: ${r.triggerSituation || 'Not captured'}
  - Reaction: ${r.yourReaction || 'Not captured'}
  - Fear / Need: ${r.underlyingFear || 'Not captured'}
  - Pattern: ${r.pattern || 'Not captured'}
`).join('\n');

  // Include relevant conversation excerpts for additional context
  const conversationContext = conversation
    .filter(m => m.role === 'user')
    .slice(-10) // Last 10 user messages for context
    .map(m => `User: ${m.text.substring(0, 200)}...`)
    .join('\n');

  const prompt = `You are an expert depth psychologist and relational coach. Analyze this relational pattern session and identify recurring themes, reactive signatures, and developmental insights.

# Relationships Explored
${relationshipSummaries}

# Recent Conversation Context (for additional insight)
${conversationContext}

# Your Analysis Task

Analyze the patterns for:
1. **Core patterns** - Recurring themes / beliefs that show up across different relationships (2-3 key patterns)
2. **Reactive signatures** - HOW the person reacts when triggered (e.g., withdraws, gets defensive, people-pleases, collapses, controls, etc.) - list 3-5 signature reactions
3. **Relationship-specific patterns** - Different ways these show up in different contexts
4. **Developmental hypothesis** - What early experiences might have shaped these patterns? (Early attachment, family dynamics, trauma, cultural messaging, etc.)
5. **Shadow work needed** - What's being disowned, rejected, or unconscious? What needs integration?
6. **Recommendations** - 2-3 specific, actionable practices or approaches to work with these patterns

Be specific and psychologically sophisticated. Base your analysis on the actual relationship data provided.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "corePatterns": ["pattern 1", "pattern 2", "pattern 3"],
  "reactiveSignatures": ["signature 1", "signature 2", "signature 3"],
  "relationshipSpecificPatterns": {
    "Romantic Partner": "specific pattern",
    "Boss/Authority": "specific pattern",
    "Friend": "specific pattern"
  },
  "developmentalHypothesis": "2-3 sentences about origins",
  "shadowWork": "2-3 sentences about what needs integration",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  try {
    const schema = {
      type: "object" as const,
      properties: {
        corePatterns: { type: "array" as const, items: { type: "string" as const } },
        reactiveSignatures: { type: "array" as const, items: { type: "string" as const } },
        relationshipSpecificPatterns: {
          type: "object" as const,
          additionalProperties: { type: "string" as const }
        },
        developmentalHypothesis: { type: "string" as const },
        shadowWork: { type: "string" as const },
        recommendations: { type: "array" as const, items: { type: "string" as const } }
      },
      required: ['corePatterns', 'reactiveSignatures', 'relationshipSpecificPatterns', 'developmentalHypothesis', 'shadowWork', 'recommendations']
    };

    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API
    const result = await callGrokThenAIJson<{
      corePatterns: string[];
      reactiveSignatures: string[];
      relationshipSpecificPatterns: Record<string, string>;
      developmentalHypothesis: string;
      shadowWork: string;
      recommendations: string[];
    }>(
      'AnalyzeRelationalPatterns',
      prompt,
      'openrouter/free',
      schema as any
    );

    // Validate that we got good data
    if (result && result.corePatterns?.length > 0 && result.reactiveSignatures?.length > 0) {
      return result;
    }

    // If analysis is empty, throw error to trigger fallback
    throw new Error('Analysis returned empty results');
  } catch (error) {
    console.error('Error analyzing relational patterns:', error);

    // Generate a basic analysis from the data we have
    if (relationships.length > 0) {
      // Extract patterns from the relationship data itself
      const allPatterns = relationships
        .map(r => r.pattern)
        .filter(p => p && p.length > 0);

      const allReactions = relationships
        .map(r => r.yourReaction)
        .filter(r => r && r.length > 0);

      const allFears = relationships
        .map(r => r.underlyingFear)
        .filter(f => f && f.length > 0);

      return {
        corePatterns: allPatterns.length > 0
          ? allPatterns.slice(0, 3)
          : ['Pattern identified across relationships'],
        reactiveSignatures: allReactions.length > 0
          ? Array.from(new Set(allReactions.map(r => {
            // Extract main reactive signature from reaction text
            if (r.toLowerCase().includes('withdraw')) return 'Withdrawal/Avoidance';
            if (r.toLowerCase().includes('defend')) return 'Defensiveness';
            if (r.toLowerCase().includes('please')) return 'People-pleasing';
            if (r.toLowerCase().includes('collapse')) return 'Collapse/Shutdown';
            if (r.toLowerCase().includes('control')) return 'Control/Dominance';
            if (r.toLowerCase().includes('angry') || r.toLowerCase().includes('anger')) return 'Anger/Reactivity';
            return 'Reactive Pattern';
          })))
          : ['Reactive patterns present across relationships'],
        relationshipSpecificPatterns: relationships.reduce((acc, r) => {
          if (r.type) {
            acc[r.type] = r.pattern || r.yourReaction || 'Pattern observed';
          }
          return acc;
        }, {} as Record<string, string>),
        developmentalHypothesis: 'These patterns likely stem from early relational experiences and how safety and connection were established in your family of origin.',
        shadowWork: 'Integration work involves making conscious the reactive patterns that operate automatically, and discovering what needs or fears are being protected by these reactions.',
        recommendations: [
          'Work with a therapist or coach to trace these patterns to their origins',
          'Practice mindfulness to observe reactions before they automatic',
          'Experiment with responding differently in low-stakes situations'
        ]
      };
    }

    // Final fallback if no relationships
    return {
      corePatterns: ['Explore more relationships to identify patterns'],
      reactiveSignatures: ['Please share more details about your reactions'],
      relationshipSpecificPatterns: {},
      developmentalHypothesis: 'Additional relationship contexts would help build a fuller picture of your patterns.',
      shadowWork: 'As patterns emerge across relationships, shadow work will focus on integrating disowned aspects.',
      recommendations: ['Continue exploring different relationship types', 'Share specific triggers and reactions', 'Work with a skilled relational coach or therapist']
    };
  }
}

// Role Alignment Wizard - Gemini Integration Functions

/**
 * Generates a personalized action suggestion for a role based on its alignment score and context
 */
export async function generateRoleActionSuggestion(
  roleName: string,
  why: string,
  goal: string,
  valueScore: number,
  valueNote: string,
  shadowNudge?: string
): Promise<string> {
  const prompt = `You are an integral life coach helping someone align their roles with their deeper values.

# Role Context
    - Role: ${roleName}
  - Why they have this role: ${why}
  - Core goal: ${goal}
  - Value alignment score: ${valueScore}/10
    - Why that score: ${valueNote}
${shadowNudge ? `- Shadow work note: ${shadowNudge}` : ''}

# Your Task
Generate ONE specific, actionable, personalized suggestion for this person to either:
    - If score >= 7: Amplify and celebrate this alignment
      - If score < 7: Make a small shift to increase alignment

  Requirements:
  - Be specific to THEIR role and context(not generic)
    - Make it small and achievable(can be done this week)
      - Frame it positively and encouragingly
        - Keep it to one sentence
          - Start with an action verb

Examples of good suggestions:
  - "Schedule a 15-minute coffee chat with your team to share one win from this role"
    - "Identify one task this week that doesn't align with your core goal and delegate it"
    - "Write down three ways this role connects to your deeper values and place it where you'll see it daily"

Return ONLY the action suggestion as a string.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return (await generateText(prompt)).trim();
  } catch (error) {
    console.error('Error generating role action suggestion:', error);
    // Fallback to original template behavior
    const templates = valueScore >= 7
      ? [
        "Share one win in your next interaction",
        "Amplify: Celebrate this alignment with someone close",
        "Document what's working to reinforce it"
      ]
      : [
        "Try a 5-min boundary: Delegate one task tomorrow",
        "Identify one small shift you can make this week",
        "Say 'no' to one request that doesn't align"
      ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

/**
 * Analyzes a single role and provides insights about its alignment
 */
export async function analyzeRoleAlignment(
  roleName: string,
  why: string,
  goal: string,
  valueScore: number,
  valueNote: string
): Promise<{ insight: string; question: string }> {
  const prompt = `You are an integral coach analyzing how someone's role aligns with their values.

# Role
    - Name: ${roleName}
  - Why they have it: ${why}
  - Core goal: ${goal}
  - Alignment score: ${valueScore}/10
    - Why that score: ${valueNote}

# Your Task
  Provide:
  1. A brief insight(1 - 2 sentences) about what this alignment pattern reveals
  2. A probing question(1 sentence) to deepen their reflection

Focus on:
  - What the score reveals about their relationship to this role
    - Any tension between the goal and the alignment
      - Opportunities for growth or celebration

Return a JSON object:
  {
    "insight": "Your observation about the alignment pattern",
      "question": "A question to deepen reflection"
  } `;

  try {
    const schema = z.object({
      insight: z.string(),
      question: z.string()
    });

    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'AnalyzeRoleAlignment',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error analyzing role alignment:', error);
    return {
      insight: "Every role carries an opportunity for deeper alignment.",
      question: "What would it feel like if this role was in perfect harmony with your values?"
    };
  }
}

/**
 * Generates shadow work insights for low-scoring roles
 */
export async function generateShadowWorkInsight(
  roleName: string,
  valueScore: number,
  valueNote: string
): Promise<string> {
  const prompt = `You are a depth psychologist helping someone explore shadow material in a role that doesn't align with their values.

# Role Context
    - Role: ${roleName}
  - Alignment score: ${valueScore}/10 (low alignment)
    - Why that score: ${valueNote}

# Your Task
Generate ONE insightful, compassionate prompt(2 sentences max) that helps them explore what might be underneath this misalignment.

    Consider:
  - What might they be avoiding ?
    - What need might this role be meeting(even if unconsciously)?
      - What pattern from the past might be playing out ?
        - What would it cost them to let go or transform this role ?

          Be gentle but direct.Use curious language("I wonder if...", "What if...").

Return ONLY the insight as a string.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return (await generateText(prompt)).trim();
  } catch (error) {
    console.error('Error generating shadow work insight:', error);
    return "What might this role be protecting you from? Sometimes misalignment reveals an unconscious need for safety or belonging.";
  }
}

/**
 * Generates an integral reflection by analyzing all roles together
 */
export async function generateIntegralReflection(
  roles: Array<{
    name: string;
    why: string;
    goal: string;
    valueScore: number;
    valueNote: string;
    shadowNudge?: string;
    action?: string;
  }>
): Promise<{
  integralInsight: string;
  quadrantConnections: string;
  recommendations: string[];
}> {
  const rolesContext = roles.map((r, i) => `
${i + 1}. ** ${r.name}** (Alignment: ${r.valueScore}/10)
  - Why: ${r.why}
  - Goal: ${r.goal}
  - Alignment note: ${r.valueNote}
   ${r.shadowNudge ? `- Shadow note: ${r.shadowNudge}` : ''}
   ${r.action ? `- Action: ${r.action}` : ''}
  `).join('\n');

  const prompt = `You are an integral coach analyzing someone's role ecosystem through the AQAL framework (I, We, It, Its quadrants).

# Roles Explored
${rolesContext}

# Your Task

Provide an integral analysis:

  1. ** Integral Insight ** (2 - 3 sentences): What patterns do you see across their roles ? How do the high and low scoring roles relate ? What does their role ecosystem reveal about their current life structure ?

    2. ** Quadrant Connections ** (2 - 3 sentences): How do these Its - quadrant roles(external roles in systems) connect to:
  - I(interior individual): their inner experience, values, consciousness
    - We(interior collective): their relationships, culture, sense of belonging
      - It(exterior individual): their behaviors, practices, health

  3. ** Recommendations ** (3 - 4 specific suggestions): What would create more balance and integration across quadrants ?

    Return JSON:
  {
    "integralInsight": "Pattern analysis across roles",
      "quadrantConnections": "How roles connect to I, We, It quadrants",
        "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  } `;

  try {

    const schema = z.object({

      integralInsight: z.string(),

      quadrantConnections: z.string(),

      recommendations: z.array(z.string())

    });



    // PRIMARY: Grok 4.1 via OpenRouter


    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'GenerateIntegralReflection',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error generating integral reflection:', error);
    return {
      integralInsight: "Your roles form an interconnected system, each influencing your overall alignment.",
      quadrantConnections: "Consider how your external roles (Its) reflect and shape your inner values (I) and relationships (We).",
      recommendations: [
        "Bring more awareness to how your roles affect your inner state",
        "Notice how your relationships influence your role choices",
        "Consider which roles deserve more energy and which might need boundaries"
      ]
    };
  }
}

/**
 * Detect attachment style from relational patterns
 */
export async function detectAttachmentStyle(
  relationshipContexts: RelationshipContext[]
): Promise<AttachmentStyle> {
  if (relationshipContexts.length === 0) {
    return 'secure'; // Default fallback
  }

  const contextSummary = relationshipContexts.map(ctx =>
    `Type: ${ctx.type}, Fear: ${ctx.underlyingFear || 'N/A'}, Pattern: ${ctx.pattern || 'N/A'} `
  ).join('\n');

  const prompt = `Based on these relationship patterns, determine the person's primary attachment style. Return ONLY the style name: "secure", "anxious", "avoidant", or "fearful".

Relationship Contexts:
${contextSummary}

  Analysis: Look for:
    - Secure: Comfortable with intimacy, healthy boundaries, direct conflict management
      - Anxious: Fears abandonment, seeks reassurance, over - focuses on relationships
        - Avoidant: Values independence, distances from emotional intimacy, suppresses feelings
          - Fearful: Oscillates between clinging and withdrawing, fear and shame present

Return only one word: secure | anxious | avoidant | fearful`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    const style = (await generateText(prompt)).toLowerCase().trim() as AttachmentStyle;
    if (['secure', 'anxious', 'avoidant', 'fearful'].includes(style)) {
      return style;
    }
    return 'secure';
  } catch (error) {
    console.error('Error detecting attachment style:', error);
    return 'secure';
  }
}

/**
 * Generate personalized practice recommendations based on attachment style
 */
export async function explainAttachmentPractices(
  attachmentStyle: AttachmentStyle,
  selectedPracticeIds: string[]
): Promise<string> {
  // Get practice details
  const allPractices = { ...corePractaces.body, ...corePractaces.mind, ...corePractaces.spirit, ...corePractaces.shadow };
  const selectedPractices = selectedPracticeIds
    .map(id => allPractices[id as keyof typeof allPractices])
    .filter(Boolean);

  const practicesInfo = selectedPractices
    .map((p: any) => `- ${p.name}: ${p.description} `)
    .join('\n');

  const prompt = `You are a somatic psychology expert.A person with ${attachmentStyle} attachment style is exploring these practices:

${practicesInfo}

  Explain in 2 - 3 sentences why these specific practices help heal ${attachmentStyle} attachment patterns.Focus on:
  1. How each practice addresses their specific attachment wound
  2. The mechanism of change(what shifts in their nervous system / mind)
  3. How they'll feel different as they practice

Be warm, encouraging, and specific to their attachment style.`;

  try {
    // PRIMARY: Grok 4.1 via OpenRouter
    // FALLBACK: Gemini 2.5-flash-lite via Google API (via generateText)
    return await generateText(prompt);
  } catch (error) {
    console.error('Error explaining attachment practices:', error);
    return `These practices support healing your ${attachmentStyle} attachment patterns by helping you develop a more secure nervous system and healthier relationship skills.Regular practice will help you feel safer in intimacy and more grounded in yourself.`;
  }
}

/**
 * Get AI response for attachment exploration dialogue (Phase 3: AI Deepening)
 * Provides conversational depth for exploring attachment patterns after assessment
 */
export async function getAttachmentExplorationResponse(
  conversationHistory: Array<{ role: 'user' | 'bot'; text: string }>,
  userMessage: string,
  attachmentStyle: AttachmentStyle,
  scores: { anxiety: number; avoidance: number }
): Promise<{
  message: string;
  suggestedQuestions?: string[];
}> {
  const conversationContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.text} `)
    .join('\n');

  const styleDescriptions = {
    secure: 'comfortable with intimacy and independence, trusting of self and others',
    anxious: 'sensitive to abandonment cues, seeking closeness and reassurance, may feel not enough',
    avoidant: 'values independence highly, may suppress needs for connection, protective of autonomy',
    fearful: 'oscillates between approach and avoidance, fears both abandonment and intimacy'
  };

  const prompt = `You are a compassionate attachment - aware coach helping someone understand their attachment patterns.You blend psychological insight with warmth.

# Attachment Context
  Style: ${attachmentStyle} (${styleDescriptions[attachmentStyle]})
Anxiety Score: ${scores.anxiety.toFixed(1)}/7 (${scores.anxiety < 3.5 ? 'low' : 'elevated'})
Avoidance Score: ${scores.avoidance.toFixed(1)}/7 (${scores.avoidance < 3.5 ? 'low' : 'elevated'})

# Conversation So Far
${conversationContext || 'This is the start of the conversation.'}

# User's Message
${userMessage}

# Your Task
Respond with:
  1. A warm, insightful response(3 - 5 sentences) that:
  - Acknowledges their experience
    - Provides gentle psychoeducation about their attachment pattern
      - Offers a reframe or perspective shift when helpful
        - Stays curious and non - judgmental
          - Uses phrases like "It makes sense that..." or "This pattern often develops when..."

  2. If appropriate, suggest 1 - 2 follow - up questions they might explore

Keep the tone warm, grounded, and empowering.Avoid clinical jargon.Help them feel understood.

Return JSON:
  {
    "message": "Your response",
      "suggestedQuestions": ["Optional follow-up question 1", "Optional follow-up question 2"]
  } `;

  try {

    const schema = z.object({

      message: z.string(),

      suggestedQuestions: z.array(z.string()).optional()

    });



    // PRIMARY: Grok 4.1 via OpenRouter


    // FALLBACK: Gemini 2.5-flash-lite via Google API
    return await callGrokThenAIJson(
      'GetAttachmentExplorationResponse',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error getting attachment exploration response:', error);
    return {
      message: "Thank you for sharing that. Your attachment patterns developed for good reasons—they were adaptive responses to your early environment. Would you like to explore what might have shaped these patterns, or how you notice them showing up in your life today?",
      suggestedQuestions: [
        "How do you notice this pattern in your current relationships?",
        "What helps you feel safe when this pattern gets activated?"
      ]
    };
  }
}

/**
 * Generate AI synthesis for Polarity Map
 * Analyzes the polarity tension and provides actionable oscillation strategies
 */
export async function generatePolaritySynthesis(
  dilemma: string,
  poleA_name: string,
  poleA_upside: string,
  poleA_downside: string,
  poleB_name: string,
  poleB_upside: string,
  poleB_downside: string,
  priorContext?: PriorInsightSummary
): Promise<{
  keyTension: string;
  oscillationStrategy: string;
  warningSignsA: string[];
  warningSignsB: string[];
  actionSteps: string[];
  recommendedPractices?: { practiceId: string; rationale: string }[];
}> {
  let prompt = `You are an expert in Polarity Management (Barry Johnson's framework). Analyze this polarity map and provide synthesis insights.

# THE POLARITY
**Dilemma:** ${dilemma}

## Pole A: ${poleA_name}
**Upsides (when functioning well):**
${poleA_upside}

**Downsides (when over-focused):**
${poleA_downside}

## Pole B: ${poleB_name}
**Upsides (when functioning well):**
${poleB_upside}

**Downsides (when over-focused):**
${poleB_downside}

---

# YOUR TASK
Generate a practical synthesis using polarity management principles. Remember: polarities aren't problems to solve but tensions to manage through oscillation.

Return JSON with these fields:

{
  "keyTension": "2-3 sentences identifying the core dynamic between the poles. What makes this a true polarity vs a problem to solve?",

  "oscillationStrategy": "3-4 sentences describing HOW to actively manage this polarity. When to lean toward each pole? What rhythms or cycles make sense? How to avoid getting stuck in downsides?",

  "warningSignsA": [
    "Early warning sign that you're over-indexing on ${poleA_name}",
    "Another warning sign specific to ${poleA_name} downside",
    "Third warning sign"
  ],

  "warningSignsB": [
    "Early warning sign that you're over-indexing on ${poleB_name}",
    "Another warning sign specific to ${poleB_name} downside",
    "Third warning sign"
  ],

  "actionSteps": [
    "Concrete action to leverage ${poleA_name} upsides while avoiding downsides",
    "Concrete action to leverage ${poleB_name} upsides while avoiding downsides",
    "Concrete action to actively oscillate between poles"
  ],

  "recommendedPractices": [
    {
      "practiceId": "MUST be one of: 'meditation', 'journaling', 'three-two-one', 'bioenergetics', 'breathwork', 'subject-object', 'focusing', 'somatic-tracking'",
      "rationale": "1 sentence explaining why this practice helps balance this specific polarity"
    }
  ]
}

GUIDELINES:
- Keep language practical and actionable, not theoretical
- Warning signs should be EARLY indicators (before full downside manifests)
- Action steps must be specific and implementable this week
- Oscillation strategy should acknowledge both poles have value
- Recommended practices MUST map to the provided IDs for integration
- Avoid "pick a side" language—emphasize both/and thinking`;

  // Append prior context if provided
  if (priorContext && priorContext.crossModalPatterns) {
    let contextSection = `\n---\n\nPRIOR CONTEXT - Cross-Modal Patterns:\n${priorContext.crossModalPatterns}\n\nRecent insights:`;

    if (priorContext.body) contextSection += `\n- Body: ${priorContext.body}`;
    if (priorContext.mind) contextSection += `\n- Mind: ${priorContext.mind}`;
    if (priorContext.spirit) contextSection += `\n- Spirit: ${priorContext.spirit}`;
    if (priorContext.shadow) contextSection += `\n- Shadow: ${priorContext.shadow}`;

    contextSection += `\n\nConsider these patterns when generating your response.`;
    prompt += contextSection;
  }

  try {
    const schema = z.object({
      keyTension: z.string(),
      oscillationStrategy: z.string(),
      warningSignsA: z.array(z.string()).length(3),
      warningSignsB: z.array(z.string()).length(3),
      actionSteps: z.array(z.string()).length(3),
      recommendedPractices: z.array(z.object({
        practiceId: z.string(),
        rationale: z.string()
      }))
    });

    return await callGrokThenAIJson(
      'GeneratePolaritySynthesis',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error generating polarity synthesis:', error);
    // Fallback response
    return {
      keyTension: `The tension between ${poleA_name} and ${poleB_name} represents a dynamic that requires ongoing attention. Both poles offer unique value and both have potential downsides when over-emphasized.`,
      oscillationStrategy: `Actively manage this polarity by recognizing when you're leaning too heavily toward one pole. Look for the warning signs of each downside and consciously shift toward the other pole when needed. The goal isn't balance but purposeful movement between poles based on current needs.`,
      warningSignsA: [
        `Noticing the downsides of ${poleA_name} becoming prominent`,
        `Feeling the costs of neglecting ${poleB_name}`,
        `Others pointing out imbalance toward ${poleA_name}`
      ],
      warningSignsB: [
        `Noticing the downsides of ${poleB_name} becoming prominent`,
        `Feeling the costs of neglecting ${poleA_name}`,
        `Others pointing out imbalance toward ${poleB_name}`
      ],
      actionSteps: [
        `Schedule regular check-ins to assess which pole you're currently emphasizing`,
        `Identify 2-3 practices that help you access each pole intentionally`,
        `Review this map monthly to refine your oscillation strategy`
      ],
      recommendedPractices: [
        { practiceId: 'meditation', rationale: 'Helps you observe the tension between poles without reactivity.' },
        { practiceId: 'journaling', rationale: 'Allows you to map the oscillation between poles over time.' }
      ]
    };
  }
}

// Function for SubjectObjectWizard evidence step (1B)
export async function suggestCounterEvidence(pattern: string, subjectToStatement: string): Promise<string[]> {
  const prompt = `A user is examining the belief: "${subjectToStatement}" which comes from the pattern: "${pattern}".

Help them find counter-evidence by suggesting 3-4 specific questions or prompts that challenge this belief being 100% true all the time.

Return a JSON array of strings. Each should be a thought-provoking question.
Example: ["Can you think of a time when someone disagreed with you and you didn't lose their respect?", "What would a trusted friend say about whether this belief is always true?"]`;

  try {
    const schema = z.array(z.string()).min(3).max(4);
    return await callGrokThenAIJson(
      'SuggestCounterEvidence',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error generating counter-evidence suggestions:', error);
    return [
      'Think of 3 specific situations where this belief did NOT hold true.',
      'What would someone who disagrees with this belief say?',
      'If your best friend held this belief, what would you tell them?'
    ];
  }
}

// Function for PolarityMapperWizard validation (2A)
export async function validatePolarity(dilemma: string, poleA: string, poleB: string): Promise<{
  isPolarity: boolean;
  explanation: string;
  suggestion?: string;
}> {
  const prompt = `You are an expert in Barry Johnson's Polarity Management framework. A user has defined:

Dilemma: "${dilemma}"
Pole A: "${poleA}"
Pole B: "${poleB}"

Determine if this is a TRUE POLARITY or a SOLVABLE PROBLEM.

A true polarity has these characteristics (Barry Johnson's criteria):
1. The two poles are INTERDEPENDENT - they need each other over time
2. The tension is ONGOING - it can never be fully resolved
3. Over-focusing on either pole creates predictable downsides
4. Both poles have genuine upsides

A solvable problem has:
1. A clear "right answer" or preferred solution
2. One side is clearly better than the other
3. It can be resolved permanently

Return JSON:
{
  "isPolarity": true/false,
  "explanation": "1-2 sentences explaining WHY this is or isn't a true polarity",
  "suggestion": "If NOT a polarity, suggest how to reframe it as one, or suggest it might be a solvable problem to approach differently. Omit if it IS a polarity."
}`;

  try {
    const schema = z.object({
      isPolarity: z.boolean(),
      explanation: z.string(),
      suggestion: z.string().optional()
    });
    return await callGrokThenAIJson(
      'ValidatePolarity',
      prompt,
      'openrouter/free',
      schema
    );
  } catch (error) {
    console.error('Error validating polarity:', error);
    return {
      isPolarity: true,
      explanation: 'Unable to validate at this time. Proceeding as a polarity — you can always revisit whether this is truly a polarity or a solvable problem.'
    };
  }
}

// ============================================================================
// Psychedelic Journey AI Functions
// ============================================================================

function serializeSessionContext(session: Partial<import('../types.ts').PsychedelicJourneySession>): string {
  const lines: string[] = [];

  const substance = session.substance === 'other' ? (session.substanceOther || 'other') : session.substance;
  if (substance) lines.push(`Substance: ${substance}`);
  if (session.dosageDescription) lines.push(`Dose: ${session.dosageDescription}`);
  if (session.previousExperience) lines.push(`Previous experience: ${session.previousExperience}`);
  if (session.currentEmotions?.length) lines.push(`Current emotions: ${session.currentEmotions.join(', ')}`);
  if (session.bodyState) lines.push(`Body state: ${session.bodyState}`);
  if (session.mindState) lines.push(`Mind state: ${session.mindState}`);
  if (session.concerns) lines.push(`Concerns: ${session.concerns}`);
  if (session.environment) lines.push(`Environment: ${session.environment}`);
  if (session.companions) {
    lines.push(`Companions: ${session.companions}${session.companionDetails ? ` — ${session.companionDetails}` : ''}`);
  }
  if (session.rawIntention) lines.push(`Raw intention: ${session.rawIntention}`);
  if (session.refinedIntention) lines.push(`Refined intention: ${session.refinedIntention}`);
  if (session.daysSinceSession !== undefined) lines.push(`Days since session: ${session.daysSinceSession}`);
  if (session.overallTone) lines.push(`Overall tone: ${session.overallTone}`);
  if (session.aiThemes?.length) lines.push(`Identified themes: ${session.aiThemes.join(', ')}`);
  if (session.quadrantMapping) {
    const qm = session.quadrantMapping;
    if (qm.body) lines.push(`Quadrant — Body: ${qm.body}`);
    if (qm.mind) lines.push(`Quadrant — Mind: ${qm.mind}`);
    if (qm.spirit) lines.push(`Quadrant — Spirit: ${qm.spirit}`);
    if (qm.shadow) lines.push(`Quadrant — Shadow: ${qm.shadow}`);
  }
  if (session.userInsights) lines.push(`User insights: ${session.userInsights}`);

  return lines.join('\n');
}

function getSubstanceGuidance(substance: string | undefined): string {
  const s = substance?.toLowerCase() || '';

  if (s === 'psilocybin' || s === 'psilocybin mushrooms' || s === 'mushrooms') {
    return `SUBSTANCE CONTEXT — Psilocybin:
Duration: 4-6 hours. Character: emotionally amplifying, visually rich, deeply introspective. Integration focus: emotion processing, meaning-making, relationship patterns. Common challenges: ego dissolution anxiety, emotional intensity, difficult memories surfacing. Harm reduction: ensure safe set and setting, trusted guide if needed, no mixing with SSRIs (serotonin risk), avoid if personal/family history of psychosis.`;
  }

  if (s === 'mdma') {
    return `SUBSTANCE CONTEXT — MDMA:
Duration: 3-5 hours. Character: empathogenic, heart-opening, reduced fear response, enhanced communication. Integration focus: emotional processing, relational healing, self-compassion. Common challenges: comedown (days 2-5), depleted serotonin, emotional rawness. Harm reduction: hydration (not over-hydration), temperature regulation, rest after.
SAFETY FLAG: If the user mentions SSRIs, SNRIs, or MAOIs, address serotonin syndrome risk BEFORE any other content — this is a medical safety issue.`;
  }

  if (s === 'ketamine') {
    return `SUBSTANCE CONTEXT — Ketamine:
Duration: 45-90 minutes (IM/IV), 1-2 hours (oral/nasal). Character: dissociative, ego-dissolving, can produce k-hole experiences, non-linear time perception. Integration focus: depression relief consolidation, perspective shifts on self-concept, somatic releasing. Common challenges: difficulty remembering content, disorientation, integration without clear narrative. Harm reduction: frequency limits (addiction risk), avoid with alcohol, ensure trusted support.`;
  }

  if (s === 'ayahuasca' || s === 'dmt' || s === 'n,n-dmt') {
    const isAyahuasca = s === 'ayahuasca';
    return `SUBSTANCE CONTEXT — ${isAyahuasca ? 'Ayahuasca' : 'DMT'}:
Duration: ${isAyahuasca ? '4-8 hours' : '15-30 minutes (smoked/vaporized)'}. Character: ${isAyahuasca ? 'purging, ceremonial, profound visionary, entity contact common' : 'intense rapid onset, entity contact, geometric visuals, ego dissolution'}. Integration focus: shadow confrontation, ancestral/relational healing, fundamental worldview shifts. Common challenges: ${isAyahuasca ? 'purging process, multi-night ceremonies, difficult reliving' : 'shock of intensity, ineffability, difficulty grounding afterward'}.
SAFETY FLAG: Ayahuasca contains MAOIs. Any psychiatric medication (SSRIs, SNRIs, antipsychotics, stimulants, lithium) is a serious drug interaction risk — address this BEFORE any other content if medications are mentioned.`;
  }

  if (s === 'lsd' || s === 'acid') {
    return `SUBSTANCE CONTEXT — LSD:
Duration: 8-12 hours. Character: cognitively expansive, pattern-recognition amplified, time distortion, sustained introspection. Integration focus: belief system examination, creative and intellectual insights, long-arc meaning making. Common challenges: length of experience, cognitive loops, delayed integration (insights surface days-weeks later). Harm reduction: plan for full-day container, safe environment, trusted companions.`;
  }

  if (s === 'mescaline' || s === 'peyote' || s === 'san pedro') {
    return `SUBSTANCE CONTEXT — Mescaline:
Duration: 8-12 hours. Character: heart-centered, nature-connective, gentle compared to other classical psychedelics, sustained warmth. Integration focus: reconnection with nature, somatic presence, gratitude and love. Common challenges: nausea, long duration, cultural context (particularly for peyote/indigenous ceremony). Harm reduction: if peyote, respect indigenous ceremonial context.`;
  }

  if (s === 'cannabis') {
    return `SUBSTANCE CONTEXT — Cannabis:
Duration: 2-4 hours. Character: highly variable by strain and dose, anxiety amplifying at high doses, introspective, sensory enhancement. Integration focus: somatic awareness, present-moment access, creative insight. Common challenges: anxiety spirals, paranoia at high doses, difficult to direct intentionally. Harm reduction: lower doses more predictable, CBD ratio matters, avoid if anxiety-prone.`;
  }

  if (s === 'breathwork' || s === 'holotropic' || s === 'holotropic breathwork') {
    return `SUBSTANCE CONTEXT — Breathwork/Holotropic:
Duration: 2-3 hours. Character: endogenous, no pharmacological risk, can produce intense visionary and emotional states comparable to psychedelics. Integration focus: trauma release, somatic healing, non-ordinary states without substance risk. Common challenges: hyperventilation effects, emotional intensity, body activation (tingling, tetany). Harm reduction: avoid with cardiovascular conditions, pregnancy, history of psychosis; facilitator support recommended.`;
  }

  return `SUBSTANCE CONTEXT:
Approach this experience with respect for its character and duration. Focus on set (inner state), setting (environment), and intention. Integration is as important as the experience itself — what you do in the days and weeks after determines lasting benefit.`;
}

function getTimingGuidance(days: number | undefined): string {
  if (days === undefined || days <= 0) {
    return 'Same-day: Gentle grounding is the priority. Avoid rushing toward meaning or conclusions — let the experience settle. Hydration, rest, and being in a safe environment matter most right now.';
  }
  if (days <= 2) {
    return '1-2 days post-session: Still in the immediate aftermath. Be gentle — rest, nourishment, and light movement support integration. Avoid over-analyzing. Journaling is fine; interpretation can wait.';
  }
  if (days <= 7) {
    return '3-7 days post-session: Peak integration window. This is when deeper patterns are most accessible. Go into the challenging material now — journaling, therapy, somatic work, and meaningful conversation all have heightened value in this window.';
  }
  if (days <= 21) {
    return '8-21 days post-session: Focus on what is recurring or stuck — what has not yet resolved, what insight has not yet landed in the body. This is a good time for shadow work and embodied practices.';
  }
  return 'More than 3 weeks post-session: Shift from processing toward embodiment. The question now is not "what did I learn?" but "what has actually changed in how I live, relate, and act?"';
}

export async function reflectAndRefineIntention(
  session: Partial<import('../types.ts').PsychedelicJourneySession>
): Promise<{ reflection: string; refinedIntention: string }> {
  const prompt = `You are a psychedelic preparation coach specializing in harm reduction and intention-setting.

THE USER'S FULL CONTEXT:
${serializeSessionContext(session)}

${getSubstanceGuidance(session.substance)}

Your task: Reflect back their stated intention warmly and offer a refined version.

CRITICAL RULES:
- Use the user's OWN language — do not translate into clinical or spiritual vocabulary
- Clarify and focus; do not elaborate or elevate
- Refined intention should be SHORTER and CLEARER than the original, not longer
- If the original is already clear, return it nearly unchanged
- Do not add psychological frameworks, archetypal language, or therapeutic concepts

Return JSON:
{
  "reflection": "2-3 sentence warm grounded response validating their state",
  "refinedIntention": "Their intention in their own words, more focused if needed"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const schema = z.object({
    reflection: z.string(),
    refinedIntention: z.string(),
  });

  try {
    return await callGrokThenAIJson('PsychedelicJourney', prompt, 'fallback', schema);
  } catch (error) {
    console.error('[PsychedelicJourney] reflectAndRefineIntention error:', error);
    return {
      reflection: 'Your preparation shows thoughtful self-awareness. Trust in the work you have done to ready yourself for this experience.',
      refinedIntention: session.rawIntention || 'To be present with whatever arises.',
    };
  }
}

export async function analyzeNarrative(
  session: Partial<import('../types.ts').PsychedelicJourneySession>
): Promise<{
  themes: string[];
  quadrantMapping: {
    body?: string;
    mind?: string;
    spirit?: string;
    shadow?: string;
  };
  connectionToIntention: string;
}> {
  const prompt = `You are a psychedelic integration specialist.

THE USER'S FULL CONTEXT (including preparation data):
${serializeSessionContext(session)}

${getSubstanceGuidance(session.substance)}

Their experience narrative:
"${session.narrative}"

Key moments:
${session.keyMoments?.filter(Boolean).join('\n') || 'None specified'}

THEME EXTRACTION RULES (critical):
- Use DESCRIPTIVE labels only — what the user actually said or experienced
- Use the user's own words and images, not your interpretations
- Do NOT add mythological, archetypal, or spiritual interpretations
- Do NOT use psychological framework labels
- "An encounter with a serpent" stays "an encounter with a serpent"
- Themes: 3-7 words max, grounded in the actual narrative

Return JSON:
{
  "themes": ["theme1", "theme2"],
  "quadrantMapping": {
    "body": "body-level experience in user's language",
    "mind": "cognitive/perceptual in user's language",
    "spirit": "peak/transcendent moments if present, else omit",
    "shadow": "challenging or shadow material if present, else omit"
  },
  "connectionToIntention": "1-2 sentences on how experience related to stated intention"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const schema = z.object({
    themes: z.array(z.string()),
    quadrantMapping: z.object({
      body: z.string().optional(),
      mind: z.string().optional(),
      spirit: z.string().optional(),
      shadow: z.string().optional(),
    }),
    connectionToIntention: z.string(),
  });

  try {
    return await callGrokThenAIJson('PsychedelicJourney', prompt, 'fallback', schema);
  } catch (error) {
    console.error('[PsychedelicJourney] analyzeNarrative error:', error);
    return {
      themes: ['Personal transformation', 'Self-discovery'],
      quadrantMapping: {},
      connectionToIntention: 'Your experience contained elements that connect to your stated intention.',
    };
  }
}

export async function synthesizeIntegration(
  session: Partial<import('../types.ts').PsychedelicJourneySession>
): Promise<{
  synthesis: string;
  practices: string[];
  suggestedWizards: string[];
  themes?: string[];
  quadrantMapping?: Record<string, string>;
  connectionToIntention?: string;
  concreteSteps?: string[];
}> {
  const prompt = `You are a psychedelic integration specialist.

THE USER'S FULL CONTEXT:
${serializeSessionContext(session)}

${getSubstanceGuidance(session.substance)}

TIMING GUIDANCE:
${getTimingGuidance(session.daysSinceSession)}

Synthesize a personalized integration response weaving together the themes, intention, and insights above.

Return JSON:
{
  "synthesis": "3-4 sentences weaving themes, intention, and insights",
  "practices": ["practice1", "practice2", "practice3"],
  "suggestedWizards": ["wizard-id1", "wizard-id2"]
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const schema = z.object({
    synthesis: z.string(),
    practices: z.array(z.string()),
    suggestedWizards: z.array(z.string()),
  });

  try {
    return await callGrokThenAIJson('PsychedelicJourney', prompt, 'fallback', schema);
  } catch (error) {
    console.error('[PsychedelicJourney] synthesizeIntegration error:', error);
    return {
      synthesis: 'Your journey revealed meaningful patterns worth continued exploration. The integration work you do now will help these insights take root.',
      practices: ['Journaling', 'Meditation', 'Body awareness'],
      suggestedWizards: ['shadow-journaling', 'ifs'],
    };
  }
}

// ============================================================================
// Ultimate Concern Wizard AI Functions
// ============================================================================

import {
  ultimateConcernProbeSchema,
  ultimateConcernAnalysisSchema,
  UltimateConcernProbe,
  UltimateConcernAnalysis,
} from './ai/wizardSchemas';
import {
  ULTIMATE_CONCERN_PROBE_PROMPT,
  ULTIMATE_CONCERN_ANALYSIS_PROMPT,
} from './ai/wizardPrompts';

/**
 * Classifies user's ultimate concern into a domain and generates probing questions.
 */
export async function probeUltimateConcern(concern: string): Promise<UltimateConcernProbe> {
  const prompt = `${ULTIMATE_CONCERN_PROBE_PROMPT}\n\nUltimate concern: "${concern}"`;
  try {
    return await callGrokThenAIJson('UltimateConcern', prompt, 'openrouter/free', ultimateConcernProbeSchema);
  } catch (error) {
    console.error('[UltimateConcern] probeUltimateConcern error:', error);
    return {
      domain: 'meaning',
      probingQuestions: [
        'How would your life change if this concern were suddenly resolved?',
        'What would have to be true about the world for this concern to disappear?',
      ],
    };
  }
}

/**
 * Analyzes meaning-making structure of user's ultimate concern and probe answers.
 */
export async function analyzeUltimateConcern(
  concern: string,
  domain: string,
  probeAnswers: string[],
  previousConcern?: string
): Promise<UltimateConcernAnalysis> {
  const userMsg = `Ultimate concern: "${concern}"
Domain: ${domain}
${previousConcern ? `Previous concern (3 months ago): "${previousConcern}"` : ''}

Probe answers:
${probeAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

  const prompt = `${ULTIMATE_CONCERN_ANALYSIS_PROMPT}\n\n${userMsg}`;
  try {
    return await callGrokThenAIJson('UltimateConcern', prompt, 'openrouter/free', ultimateConcernAnalysisSchema);
  } catch (error) {
    console.error('[UltimateConcern] analyzeUltimateConcern error:', error);
    return {
      holdingDescription: 'Your concern reveals a deeply held value about how life should be structured and what gives it meaning.',
      meaningMakingStructure: 'You hold this concern with self-aware reflection, examining it critically while still feeling its weight.',
      actionValueGap: 'There may be moments where daily choices don\'t fully reflect this stated ultimate concern.',
      stretchExercise: 'Consider: what would it mean to hold this concern lightly — not abandoning it, but no longer needing it to be resolved for life to feel whole?',
    };
  }
}

// ============================================================================
// Coherence Audit Wizard AI Functions
// ============================================================================

export async function getCoherenceAuditResponse(
  conversationContext: string,
  userMessage: string,
  espousedValues: string[],
  behavioralFindings: string[],
  turnCount: number
): Promise<{ message: string; extractedValues: string[]; shouldOfferAnalysis: boolean }> {
  const schema = z.object({
    message: z.string(),
    extractedValues: z.array(z.string()),
    shouldOfferAnalysis: z.boolean(),
  });

  const hasBehavioralData = behavioralFindings.length > 0
    && !behavioralFindings[0].startsWith('(');

  const prompt = `You are a compassionate, non-judgmental mirror for values coherence work. Your role is NOT to shame the user, but to help them see the gap between espoused values and operative values through curious reflection.

KEY FRAMING: "You are not hypocritical. You are loyal. The question is whether what you're loyal to still deserves it."

SAFETY OVERRIDE — Supersedes all other instructions:
If the user shows acute shame ("I'm a fraud", "I've wasted my life", "I'm a failure"), identity collapse ("I don't know who I am anymore", "nothing I believe is real"), or significant distress about the gap discovered:
  1. STOP surfacing new gaps immediately.
  2. Respond with warmth, not analysis: "This kind of discovery can feel disorienting. That's completely normal — it means something real shifted."
  3. Do NOT continue the audit. Do NOT offer analysis.
  4. "You don't have to resolve this today. The Shadow module or a therapist can help you sit with this safely when you're ready."
  5. Suggest the Body module for grounding if distress is acute.
  6. Set shouldOfferAnalysis to false.

User's stated values so far (${espousedValues.length} extracted):
${espousedValues.length > 0 ? espousedValues.map((v, i) => (i + 1) + '. ' + v).join('\n') : '(none yet — ask what matters most to them)'}

Behavioral evidence from their session history:
${hasBehavioralData ? behavioralFindings.map((f, i) => (i + 1) + '. ' + f).join('\n') : '(Not available — use SELF-REPORT MODE below)'}

Current turn count: ${turnCount}

Conversation so far:
${conversationContext}

User's latest message: "${userMessage}"

VALUE EXTRACTION: If the user names or implies values in their message, extract ALL of them as an array. Use short labels (1-3 words). If unsure whether something is a core value vs. a preference, extract it anyway — the user can remove it. Return an empty array if no values are found in this message.

CONVERSATIONAL APPROACH:
Turn 1-2: Ask what they value most. Accept their answer without challenging.
Turn 3-4: Probe depth. "When you say [value], what does that look like in your daily life?" or "What would someone watching your last week say you prioritize?"
Turn 5+: If behavioral evidence is available, gently surface any gaps. If not, ask them to self-report where their time and energy actually went this week.
Turn 7+: You may set shouldOfferAnalysis to true if you have enough material (at least 3 values explored with some depth).

SOMATIC INQUIRY: Once during the session (not every turn), invite embodied sensing: "Where do you feel that in your body right now — expansive or constricted?" Values alignment has a felt sense; incongruence registers somatically.

RELATIONAL INQUIRY: If the user mentions a relationship or another person, ask: "Where does [value] show up — or fail to show up — in that relationship specifically?"

SELF-REPORT MODE (when behavioral data is unavailable): Build the behavioral picture through conversation instead. Ask concrete questions: "In the last week, what got your time before anything else? What did you say no to? What felt non-negotiable?" This is MORE valuable than app usage data — the user's honest self-report reveals actual operative values.

shouldOfferAnalysis RULE: Set to true ONLY when turnCount >= 7 AND at least 3 values have been extracted AND you have some behavioral material (either from session history or from the user's self-report during conversation). Otherwise false.

RESPONSE LENGTH: Keep replies to ~75 words unless the user's message is emotionally complex or asks a genuinely layered question — then up to 150 words maximum. Never use markdown formatting (no **bold**, no bullet lists, no headers).

Respond with ONLY valid JSON (no markdown in the JSON values, no explanation):
{ "message": "Your response here", "extractedValues": ["Integrity", "Authenticity"], "shouldOfferAnalysis": false }`;

  try {
    return await callGrokThenAIJson('GetCoherenceAuditResponse', prompt, 'openrouter/free', schema);
  } catch (error) {
    console.error('[CoherenceAudit] getCoherenceAuditResponse error:', error);
    return {
      message: 'Tell me more about that value.',
      extractedValues: [],
      shouldOfferAnalysis: false,
    };
  }
}

export async function analyzeCoherenceAudit(
  espousedValues: string[],
  behavioralFindings: string[],
  conversation: { role: string; text: string }[]
): Promise<{
  espousedVsOperativeGaps: { value: string; evidence: string; gap: string }[];
  loyaltyReframe: string;
  shadowWork: string;
  recommendations: string[];
}> {
  const schema = z.object({
    espousedVsOperativeGaps: z.array(
      z.object({
        value: z.string(),
        evidence: z.string(),
        gap: z.string(),
      })
    ),
    loyaltyReframe: z.string(),
    shadowWork: z.string(),
    recommendations: z.array(z.string()),
  });

  const conversationSummary = conversation
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`)
    .join('\n\n');

  const prompt = `You are an integral life practice guide analyzing the gap between espoused values and operative values.

User's stated values:
${espousedValues.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Evidence of operative values (from their actual session history):
${behavioralFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Conversation excerpt:
${conversationSummary}

Analyze the coherence audit through an ILP lens:

1. **Espoused vs Operative Gaps**: For each stated value, identify if there's a gap between what they say and what they do. What are they actually loyal to?

2. **Loyalty Reframe**: Frame the gap not as hypocrisy but as misaligned loyalty. What values are they actually living that might compete with their espoused values? This is shadow work.

3. **Shadow Work**: What disowned parts of themselves does the gap reveal? What needs are being met by the operative values?

4. **Recommendations**: Suggest 2-3 practices for resolving the coherence gap. For EACH practice, provide: (a) the practice name, (b) one sentence on why it fits this specific gap, and (c) the literal first move — e.g., "Shadow journaling: Complete this sentence for 5 minutes without stopping — 'I resist committing to [value] because part of me believes...' " / "IFS dialogue: Close your eyes and ask: 'Which part of me keeps choosing [operative value] over [espoused value]? What does it need?' Let an image or sense arise." / "Polarity mapping: Draw two columns — '[value A]' and '[value B]'. List what you'd gain and lose by going all-in on each. Notice which column feels more dangerous to fill in." Give the first concrete move, not just the modality name.

Use second-tier integral language. Be compassionate but honest.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "espousedVsOperativeGaps": [
    { "value": "espoused value", "evidence": "behavioral evidence showing operative value", "gap": "description of gap" }
  ],
  "loyaltyReframe": "Reframe of what they're loyal to",
  "shadowWork": "What shadow work this reveals",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  try {
    return await callGrokThenAIJson('AnalyzeCoherenceAudit', prompt, 'openrouter/free', schema);
  } catch (error) {
    console.error('[CoherenceAudit] analyzeCoherenceAudit error:', error);
    return {
      espousedVsOperativeGaps: [
        {
          value: 'integration',
          evidence: 'Session history shows varied practice engagement',
          gap: 'There may be a gap between wanting integrated development and selective focus',
        },
      ],
      loyaltyReframe:
        'You are loyal to growth on your own terms, which is a valid value — the question is whether this aligns with your espoused commitment to integral practice.',
      shadowWork: 'What part of yourself resists full commitment? What fear or need does partial engagement protect?',
      recommendations: ['Shadow journaling on resistance patterns', 'IFS dialogue with the part that sabotages commitment', 'Polarity mapping: freedom vs structure'],
    };
  }
}

