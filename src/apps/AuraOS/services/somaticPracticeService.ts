import { z } from 'zod';
import { callGrokThenAIJson } from './ai/aiCore';
import { SomaticPacing, ValidationResult, ValidationWarning, WarningType, SomaticPracticeType } from "../types.ts";
import { PRACTICE_TYPES } from "../constants.ts";

interface SomaticScriptSegment {
    instruction: string;
    duration_seconds: number;
}

export interface SomaticScript {
    title: string;
    total_duration_minutes: number;
    script: SomaticScriptSegment[];
    safety_notes?: string[]; // AI-generated safety considerations
}

const PROBLEMATIC_PHRASES: { pattern: RegExp; type: WarningType; issue: string; suggestion: string; }[] = [
    { pattern: /massage.*vagus nerve/i, type: 'Misleading claim', issue: 'Misleading anatomical claim regarding vagus nerve', suggestion: 'Use "may influence vagal tone through slow breathing" or "stimulate the vagal nerve indirectly"' },
    { pattern: /release.*trauma/i, type: 'Overpromising effect', issue: 'Overpromising therapeutic effect for trauma', suggestion: 'Avoid claiming to release trauma; instead, use "may support emotional processing" or "create a sense of safety"' },
    { pattern: /\btoxins?\b/i, type: 'Pseudoscientific language', issue: 'Pseudoscientific language regarding toxins', suggestion: 'Remove references to toxins; focus on observable physiological processes' },
    { pattern: /cure|heal|fix/i, type: 'Medical claim', issue: 'Medical claims', suggestion: 'Use "support," "promote," or "may help with" instead of medical claims' },
    { pattern: /always|guaranteed|definitely/i, type: 'Overgeneralization', issue: 'Overgeneralization', suggestion: 'Acknowledge individual variation; use "you may notice" or "some people experience"' },
    { pattern: /energy block/i, type: 'Unverified construct', issue: 'Unverified construct of energy blocks', suggestion: 'Use observable sensations like "tension," "restriction," or "stagnation" instead of "energy block"' },
    { pattern: /vagal tone/i, type: 'Misleading claim', issue: 'Directly "toning" the vagal nerve through simple exercises is an oversimplification', suggestion: 'Rephrase to "may support the regulation of vagal tone" or "promote a sense of calm associated with vagal activation" for accuracy.' },
    { pattern: /chakras|meridians|aura/i, type: 'Unverified construct', issue: 'References to unverified constructs in scientific context', suggestion: 'While valid in specific traditions, avoid these terms in a general scientific/somatic context unless explicitly requested by user in prompt.' },
    { pattern: /flush.*lymph/i, type: 'Misleading claim', issue: 'Misleading claim about direct lymphatic flushing', suggestion: 'Use "may support lymphatic flow" or "promote circulation" instead.' },
    { pattern: /strengthen.*immune system/i, type: 'Overpromising effect', issue: 'Overpromising immune system strengthening', suggestion: 'Use "may support immune function" or "promote overall well-being that benefits immunity."'},
];

const somaticScriptSegmentSchema = z.object({
  instruction: z.string(),
  duration_seconds: z.number(),
});

export const somaticScriptSchema = z.object({
  title: z.string(),
  total_duration_minutes: z.number(),
  script: z.array(somaticScriptSegmentSchema).min(1),
  safety_notes: z.array(z.string()).optional(),
});

const SOMATIC_SCRIPT_FALLBACK: SomaticScript = {
  title: 'Gentle Body Awareness Practice',
  total_duration_minutes: 10,
  script: [
    {
      instruction: 'Find a comfortable position, either seated or lying down. Close your eyes gently, or soften your gaze downward. Take a slow, natural breath in through your nose, and exhale fully through your mouth. Allow your body to begin to settle.',
      duration_seconds: 60,
    },
    {
      instruction: 'Bring your attention to the contact points between your body and the surface beneath you. Notice the weight of your body, the support of the ground or chair. You may notice areas of tension or ease — simply observe without needing to change anything.',
      duration_seconds: 90,
    },
    {
      instruction: 'Take three slow, full breaths. On each exhale, allow your jaw, shoulders, and hands to soften a little more. You are not trying to force relaxation — simply inviting your body to settle at its own pace.',
      duration_seconds: 90,
    },
    {
      instruction: 'When you feel ready, gently begin to deepen your breath. Notice the rise and fall of your chest and belly. Place one hand on your heart and one on your belly if that feels comfortable. Stay here for a few more breaths.',
      duration_seconds: 120,
    },
    {
      instruction: 'Take your time returning to full awareness. Wiggle your fingers and toes. Take one more full breath. Open your eyes when ready.',
      duration_seconds: 60,
    },
  ],
  safety_notes: [
    'Move gently and within your comfortable range of motion.',
    'Stop if you experience any sharp pain or discomfort.',
    'If you feel dizzy or lightheaded, return to your natural breathing rhythm.',
  ],
};

/**
 * Validates the generated practice content for scientific accuracy and safe language.
 */
export function validatePracticeContent(scriptText: string): ValidationResult {
    const warnings: ValidationWarning[] = [];
    
    PROBLEMATIC_PHRASES.forEach(phrase => {
        if (phrase.pattern.test(scriptText)) {
            warnings.push({
                type: phrase.type,
                issue: phrase.issue,
                suggestion: phrase.suggestion
            });
        }
    });

    return {
        isValid: warnings.length === 0,
        warnings
    };
}


export async function generateSomaticScript(
    intention: string,
    practiceType: SomaticPracticeType,
    duration: number,
    focusArea: string,
    pacing: SomaticPacing
): Promise<SomaticScript> {
    const typeInfo = PRACTICE_TYPES.find(pt => pt.name === practiceType);
    if (!typeInfo) {
        console.error(`Unknown somatic practice type: "${practiceType}"`);
        return SOMATIC_SCRIPT_FALLBACK;
    }

    const prompt = `You are an expert somatic practice instructor guiding a real-time practice session.

Generate a complete, ready-to-follow script for a "${practiceType}" somatic practice.

PRACTICE TYPE:
- Type: "${typeInfo.name}"
- Description: "${typeInfo.description}"
- Primary Mechanism: "${typeInfo.primaryMechanism}"
- Best For: ${typeInfo.bestFor.join(', ')}
- Techniques: ${typeInfo.exampleTechniques.join(', ')}
- Contraindications: ${typeInfo.contraindications?.join('; ') || 'None specific'}

SCIENTIFIC ACCURACY (STRICTLY ADHERE):
- Avoid "energy blockages", "toxin release", "unblocking chakras", "massage the vagus nerve"
- For nervous system effects: "may influence parasympathetic activation", "support nervous system regulation"
- Acknowledge individual variation: "you may notice" or "some people experience" NOT "you will feel"
- Never claim to "release trauma", "cure", "fix", or provide medical advice

SAFETY:
- Include: "Stop if you experience any sharp pain or discomfort"
- Emphasize: "Move gently and within your comfortable range of motion"
- For breath work: "If you feel dizzy, return to your natural breathing rhythm"

USER REQUEST:
- Intention: "${intention}"
- Total Duration: ${duration} minutes
- Focus Area: "${focusArea}"
- Pacing: "${pacing}"

{
  "title": "Grounded Presence Practice",
  "total_duration_minutes": 10,
  "script": [
    {
      "instruction": "Find a comfortable seated position, feet flat on the floor. Take a slow breath in through your nose for four counts, and exhale through your mouth for six counts. Feel the weight of your body settling.",
      "duration_seconds": 90
    },
    {
      "instruction": "Bring your attention to your shoulders. Notice any areas of holding or ease — simply observe without needing to change anything. You may notice warmth, tension, or subtle movement.",
      "duration_seconds": 120
    }
  ],
  "safety_notes": ["Move gently and within your comfortable range of motion.", "Stop if you experience any sharp pain or discomfort."]
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

    try {
        const result = await callGrokThenAIJson<SomaticScript>(
            'SomaticPracticeGenerator',
            prompt,
            'unused',
            somaticScriptSchema
        );
        return result;
    } catch (error) {
        console.error('[SomaticPracticeService] AI generation failed, using fallback:', error);
        return SOMATIC_SCRIPT_FALLBACK;
    }
}
