/**
 * Safely parse JSON with fallback handling
 * Prevents "Unexpected token" errors when API returns HTML error pages
 */
export function safeJsonParse<T = any>(jsonString: string, fallback?: T): T | null {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      console.warn('[safeJsonParse] Invalid input:', typeof jsonString);
      return fallback ?? null;
    }

    const trimmed = jsonString.trim();

    // Check if it looks like JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      console.warn('[safeJsonParse] Not valid JSON (doesn\'t start with { or [):', trimmed.slice(0, 50));
      return fallback ?? null;
    }

    return JSON.parse(trimmed) as T;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[safeJsonParse] JSON parse error:', errorMsg);
    console.error('[safeJsonParse] Input (first 100 chars):', jsonString.slice(0, 100));
    return fallback ?? null;
  }
}

/**
 * Parse response as JSON with error handling
 */
export async function parseResponseJson<T = any>(response: Response, fallback?: T): Promise<T | null> {
  try {
    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.warn('[parseResponseJson] Non-JSON response type:', contentType);
      console.warn('[parseResponseJson] Response text (first 100 chars):', text.slice(0, 100));
      return fallback ?? null;
    }

    return await response.json() as T;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[parseResponseJson] Error parsing response:', errorMsg);
    return fallback ?? null;
  }
}

/**
 * Clean and parse AI service responses that might be wrapped in markdown code blocks
 */
export function parseAiResponse<T = any>(text: string, fallback?: T): T | null {
  try {
    // Remove markdown code blocks
    let cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to find JSON in the text if it's not pure JSON
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      } else {
        console.warn('[parseAiResponse] No JSON found in response:', text.slice(0, 100));
        return fallback ?? null;
      }
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[parseAiResponse] Error parsing AI response:', errorMsg);
    console.error('[parseAiResponse] Input (first 100 chars):', text.slice(0, 100));
    return fallback ?? null;
  }
}
