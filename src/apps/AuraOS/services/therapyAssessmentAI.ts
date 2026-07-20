import type {
  TherapyRecommendation,
  TherapyClinicalFlag,
} from '../types';

const SYSTEM_PROMPT = `You are a clinical psychology consultant creating a personalized therapy modality recommendation. You speak with warmth, precision, and respect for the user's autonomy.

ABSOLUTE RULES:
- You do NOT diagnose or pathologize. Never use diagnostic labels.
- You NEVER claim certainty about what someone needs.
- You always frame recommendations as "based on what you've shared, these approaches tend to be a good fit for people with similar profiles."
- You emphasize that therapeutic alliance (the relationship with the therapist) matters MORE than modality selection. Research consistently shows this.
VOICE:
- Warm but not saccharine. Think: trusted advisor who respects your intelligence.
- Use "you" language, not clinical third-person.
- Write in flowing paragraphs, not bullet lists.
- 400–600 words total.

STRUCTURE:
1. REFLECTION (2–3 sentences): Mirror back what the person shared — validate without diagnosing. Show that you heard them. Use phrases like "It sounds like..." and "What comes through clearly is..."

2. TOP RECOMMENDATIONS (one paragraph each for the top 2–3 modalities):
   - Name the modality in plain language with its full name
   - Explain in 2–3 sentences why it fits THIS person specifically, referencing their actual answers
   - One sentence about what a session might feel like
   - If recommended modalities are related (e.g., CBT and ACT are both cognitive-behavioral), briefly note the relationship and distinction

3. PRACTICAL NEXT STEPS (2–3 sentences): How to find a therapist trained in these modalities — Psychology Today directory filters, asking about training/certification in initial consultations, professional directories (EMDRIA for EMDR, IFS Institute for IFS, etc.)

4. IMPORTANT CAVEAT (2 sentences): The therapeutic relationship matters more than technique. A skilled therapist you connect with deeply, even using a different modality, will likely serve you better than one using the "right" modality without a strong connection.`;

const PROXY_URL = '/api/openrouter-proxy';

export async function generateTherapyNarrative(
  answers: Record<string, string[]>,
  topRecommendations: TherapyRecommendation[],
  flags: TherapyClinicalFlag[],
  apiKey: string
): Promise<string> {
  const userPrompt = `Assessment results:

ANSWERS: ${JSON.stringify(answers, null, 2)}

TOP MODALITY MATCHES:
${topRecommendations
  .map(
    (r) =>
      `- ${r.modality.toUpperCase()} (${r.normalizedScore}% match — ${r.fitLabel}). Key drivers: ${r.contributingFactors.join('; ')}`
  )
  .join('\n')}

${
  flags.length > 0
    ? `CLINICAL FLAGS:\n${flags.map((f) => `- [${f.type.toUpperCase()}] ${f.message}`).join('\n')}`
    : ''
}

Generate the personalized results narrative.`;

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Proxy API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    return content;
  } catch (error) {
    console.error('Therapy narrative generation failed:', error);
    return generateFallbackNarrative(topRecommendations, flags);
  }
}

function generateFallbackNarrative(
  recommendations: TherapyRecommendation[],
  flags: TherapyClinicalFlag[]
): string {
  const crisisFlag = flags.find((f) => f.type === 'crisis');

  let narrative = '';

  narrative += `Based on your responses, here are your top therapy style recommendations:\n\n`;

  for (const rec of recommendations) {
    narrative += `**${rec.modality.toUpperCase()}** — ${rec.normalizedScore}% match (${rec.fitLabel})\n\n`;
  }

  narrative += `\n\nThe therapeutic relationship matters more than any specific technique. When reaching out to therapists, ask about their training and approach, and trust your sense of connection during the first few sessions.`;

  return narrative;
}
