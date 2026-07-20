import { ErrorHandler } from './errorHandler';

export function safeJsonParse<T = any>(
  text: string,
  fallback: T,
  context: string
): T {
  try {
    if (!text || typeof text !== 'string') {
      return fallback;
    }

    // Clean markdown code blocks if present (common in LLM responses)
    let cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Remove markdown headers/other content before JSON
    // Match pattern: remove lines that start with # or other markdown until we hit {
    // Try to find JSON in the text if it's not pure JSON or has trailing garbage
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    const appError = ErrorHandler.handle(error, `SafeJson:${context}`);
    ErrorHandler.log(appError);
    return fallback;
  }
}

export function safeJsonStringify<T = any>(
  value: T,
  context: string
): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    const appError = ErrorHandler.handle(error, `SafeJson:${context}`);
    ErrorHandler.log(appError);
    return null;
  }
}
