import { callGrokThenAIJson } from './ai/aiCore.ts';
import { textRefinementSchema } from './ai/wizardSchemas.ts';

const FALLBACK_RESULT = { result: "Service temporarily unavailable. Please edit manually." };

export async function clarifyWithoutElevating(text: string): Promise<string> {
  const prompt = `Rewrite this in simpler, more direct language. Use the user's own words. Do not translate to clinical or spiritual vocabulary. Keep their register.
  
Original text:
"${text}"

CRITICAL: Respond with ONLY valid JSON matching the textRefinementSchema:
{ "result": "the refined text" }`;

  try {
    const response = await callGrokThenAIJson(
      'Clarify Without Elevating',
      prompt,
      'openrouter/free',
      textRefinementSchema
    );
    return response.result || text;
  } catch (err) {
    console.error('[FourQuadrantService] Error clarifying text:', err);
    return text; // fallback to original
  }
}

export async function makeClearerNotNicer(text: string): Promise<string> {
  const prompt = `Rewrite this message to be clearer, without trying to make it 'nicer' or overly polite. Be direct, factual, and honest. Keep the user's register.
  
Original message:
"${text}"

CRITICAL: Respond with ONLY valid JSON matching the textRefinementSchema:
{ "result": "the refined message" }`;

  try {
    const response = await callGrokThenAIJson(
      'Make Clearer Not Nicer',
      prompt,
      'openrouter/free',
      textRefinementSchema
    );
    return response.result || text;
  } catch (err) {
    console.error('[FourQuadrantService] Error refining message:', err);
    return text;
  }
}

export async function removeBlameKeepTruth(text: string): Promise<string> {
  const prompt = `Rewrite this message to remove any blame, accusation, or 'you' statements. Keep the absolute truth of the situation, but phrase it as 'I' statements and observable facts. Keep the user's register.
  
Original message:
"${text}"

CRITICAL: Respond with ONLY valid JSON matching the textRefinementSchema:
{ "result": "the refined message" }`;

  try {
    const response = await callGrokThenAIJson(
      'Remove Blame Keep Truth',
      prompt,
      'openrouter/free',
      textRefinementSchema
    );
    return response.result || text;
  } catch (err) {
    console.error('[FourQuadrantService] Error removing blame:', err);
    return text;
  }
}

export async function shortenBy30Percent(text: string): Promise<string> {
  const prompt = `Rewrite this message to be roughly 30% shorter. Remove filler words, unnecessary preambles, and redundancies. Do not change the core meaning. Keep the user's register.
  
Original message:
"${text}"

CRITICAL: Respond with ONLY valid JSON matching the textRefinementSchema:
{ "result": "the shortened message" }`;

  try {
    const response = await callGrokThenAIJson(
      'Shorten By 30 Percent',
      prompt,
      'openrouter/free',
      textRefinementSchema
    );
    return response.result || text;
  } catch (err) {
    console.error('[FourQuadrantService] Error shortening text:', err);
    return text;
  }
}
