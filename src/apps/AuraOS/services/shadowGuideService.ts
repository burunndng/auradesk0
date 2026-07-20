/**
 * Shadow Guide AI Service
 * Uses OpenRouter (Grok 4.1 @ temperature 0.5) to provide wise, compassionate reflections on shadow journaling exercises
 * Follows ACKNOWLEDGE → MIRROR → INQUIRE → RETURN AGENCY pattern
 */

import { generateOpenRouterResponse, buildMessagesWithSystem } from './openRouterService';
import type { ShadowExerciseId, ShadowExercisePhase } from '../types';

export const SHADOW_JOURNALING_MODEL = 'openrouter/free';
export const SHADOW_JOURNALING_TEMPERATURE = 0.5;
const SHADOW_JOURNALING_MAX_TOKENS = 800;

export interface ShadowReflectionRequest {
  exerciseId: ShadowExerciseId;
  exerciseName: string;
  exercisePhase: ShadowExercisePhase;
  instructions: string;
  userEntry: string;
}

export interface ShadowReflectionResponse {
  reflection: string;
  success: boolean;
  error?: string;
}

/**
 * System prompt for Shadow Guide
 * Defines the tone, structure, and boundaries of shadow reflections
 */
function buildShadowGuideSystemPrompt(): string {
  return `You are a wise shadow guide—a mirror for the user's inner work, not a therapist. Your role is to reflect, validate, and gently illuminate what they've shared, then return agency to them.

## CORE PRINCIPLES

1. **You are a mirror, not an expert.** Reflect what you see without diagnosing or prescribing.
2. **Honor the user's courage.** Shadow work is difficult. Acknowledge that.
3. **Trust their wisdom.** They know themselves better than you do.
4. **Return agency.** Your job is to support their process, not to lead it.

## REFLECTION STRUCTURE (REQUIRED)

Every reflection must follow this 4-part structure:

### 1. ACKNOWLEDGE (2-3 sentences)
Name what you see. Validate the difficulty or beauty of what they've shared.
- "You're working with X, which is..."
- "It takes courage to..."
- "What stands out is..."

### 2. MIRROR (3-4 sentences)
Reflect back the core patterns, tensions, or insights you notice. Quote their words when relevant.
- "You wrote that [quote]. This suggests..."
- "There's a tension between X and Y..."
- "The pattern I notice is..."

### 3. INQUIRE (2-3 questions)
Offer 2-3 open questions to deepen their exploration. These should be curious, not leading.
- "What might happen if...?"
- "Where else in your life does this show up?"
- "What would it feel like to...?"

### 4. RETURN AGENCY (1-2 sentences)
Close by returning the work to them. Remind them that they are the authority on their own process.
- "You're the expert on your own experience."
- "Trust what emerges as you sit with this."
- "The next step will reveal itself when you're ready."

## TONE RULES

✓ Warm, spacious, contemplative
✓ Grounded in their specific words
✓ Curious, not prescriptive
✓ Validating without being effusive
✓ Serious but not heavy

✗ Never diagnose ("You have X disorder")
✗ Never prescribe ("You should do Y therapy")
✗ Never assume trauma ("This is clearly from your childhood")
✗ Never rush integration ("Just accept yourself!")
✗ Never be cheesy or cliché ("You're so brave! Everything happens for a reason!")

## CRISIS PROTOCOL

If the user's entry contains language suggesting self-harm, suicidal ideation, or severe crisis:
- Do NOT ignore it
- Do NOT escalate alarm
- Gently acknowledge: "I notice you're in significant pain. This reflection isn't a substitute for immediate support. If you're in crisis, please reach out to a crisis line (988 in the US) or a trusted person."
- Then proceed with a gentle, grounding reflection

## EXERCISE-SPECIFIC GUIDANCE

**Discovery exercises (Projection, Golden Shadow):**
- Focus on patterns across entries
- Highlight recurring themes
- Gently invite curiosity about what they're noticing

**Excavation exercises (Trigger, Shame):**
- Honor the pain without dramatizing it
- Reflect the belief underneath
- Ask about self-compassion

**Dialogue exercises (Letter to Shadow):**
- Notice the tone of both letters
- Highlight what the shadow part is protecting
- Ask what would shift if they truly believed the shadow's message

**Integration exercises:**
- Celebrate the readiness to integrate
- Reflect the boundary they're setting
- Ask about small, concrete next steps

## OUTPUT FORMAT

Return ONLY the reflection text, structured into the 4 sections with headers:

---

**Acknowledge**
[2-3 sentences]

**Mirror**
[3-4 sentences]

**Inquire**
[2-3 questions as bullet points]

**Return Agency**
[1-2 sentences]

---

Do NOT add extra commentary, disclaimers, or metadata. Just the reflection.`;
}

/**
 * Get AI reflection on a shadow journaling exercise
 */
export async function getShadowReflection(
  request: ShadowReflectionRequest
): Promise<ShadowReflectionResponse> {
  try {
    const { exerciseName, exercisePhase, instructions, userEntry } = request;

    const systemPrompt = buildShadowGuideSystemPrompt();

    const userPrompt = `**Exercise:** ${exerciseName} (${exercisePhase} phase)

**Instructions the user received:**
${instructions}

**User's entry:**
${userEntry}

---

Provide a reflection following the ACKNOWLEDGE → MIRROR → INQUIRE → RETURN AGENCY structure.`;

    const messages = buildMessagesWithSystem(systemPrompt, [
      { role: 'user', content: userPrompt }
    ]);

    const response = await generateOpenRouterResponse(
      messages,
      undefined, // no streaming
      {
        model: SHADOW_JOURNALING_MODEL,
        maxTokens: SHADOW_JOURNALING_MAX_TOKENS,
        temperature: SHADOW_JOURNALING_TEMPERATURE,
      }
    );

    if (!response.success || !response.text) {
      return {
        reflection: '',
        success: false,
        error: response.error || 'Failed to generate reflection'
      };
    }

    return {
      reflection: response.text.trim(),
      success: true
    };
  } catch (error) {
    console.error('[ShadowGuide] Error generating reflection:', error);
    return {
      reflection: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format user entry for reflection
 * Normalizes structured form data into readable text
 */
export function normalizeUserEntry(
  exerciseId: ShadowExerciseId,
  userEntry: Record<string, string | number>
): string {
  const lines: string[] = [];

  // Exercise-specific formatting
  switch (exerciseId) {
    case 'projection-inventory':
    case 'golden-shadow-inventory':
      // Group by person
      for (let i = 1; i <= 3; i++) {
        const person = userEntry[`person${i}`];
        const quality = userEntry[`quality${i}`];
        const reaction = userEntry[`reaction${i}`] || userEntry[`feeling${i}`];
        const why = userEntry[`why${i}`] || userEntry[`owned${i}`];
        
        if (person && quality) {
          lines.push(`\n**Person ${i}:** ${person}`);
          lines.push(`Quality: ${quality}`);
          if (reaction) lines.push(`Reaction/Feeling: ${reaction}`);
          if (why) lines.push(`Notes: ${why}`);
        }
      }
      break;

    case 'trigger-tracking':
      lines.push(`**Trigger Event:** ${userEntry.trigger_event || ''}`);
      lines.push(`**Emotion:** ${userEntry.trigger_emotion || ''}`);
      if (userEntry.trigger_intensity) {
        lines.push(`**Intensity:** ${userEntry.trigger_intensity}/10`);
      }
      lines.push(`\n**Story:** ${userEntry.trigger_story || ''}`);
      lines.push(`\n**Core Belief:** ${userEntry.trigger_belief || ''}`);
      lines.push(`\n**Unmet Need:** ${userEntry.trigger_need || ''}`);
      break;

    case 'shame-archaeology':
      lines.push(`**Shame Memory:** ${userEntry.shame_memory || ''}`);
      lines.push(`\n**Feelings:** ${userEntry.shame_feeling || ''}`);
      lines.push(`\n**Belief Formed:** ${userEntry.shame_belief || ''}`);
      lines.push(`\n**Impact on Life:** ${userEntry.shame_impact || ''}`);
      lines.push(`\n**Message to Younger Self:** ${userEntry.shame_compassion || ''}`);
      break;

    case 'letter-to-shadow':
      lines.push(`**Shadow Quality:** ${userEntry.shadow_quality || ''}`);
      lines.push(`\n**Letter TO Shadow:**\n${userEntry.letter_to_shadow || ''}`);
      lines.push(`\n**Letter FROM Shadow:**\n${userEntry.letter_from_shadow || ''}`);
      break;

    case 'integration-statement':
      lines.push(`**Quality Being Integrated:** ${userEntry.quality || ''}`);
      lines.push(`\n**How I've Rejected It:** ${userEntry.rejection || ''}`);
      lines.push(`\n**Re-owning Statement:** ${userEntry.reowning || ''}`);
      lines.push(`\n**Boundary:** ${userEntry.boundary || ''}`);
      lines.push(`\n**Action This Week:** ${userEntry.action || ''}`);
      break;

    default:
      // Fallback: just list all fields
      Object.entries(userEntry).forEach(([key, value]) => {
        if (value) {
          lines.push(`**${key}:** ${value}`);
        }
      });
  }

  return lines.join('\n');
}
