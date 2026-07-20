/**
 * Model Fallback Utility
 * Manages fallback models for wizards and key features
 *
 * Updated Model Hierarchy:
 * PRIMARY: Grok 4.1 (x-ai/grok-4.1-fast) via OpenRouter
 * FALLBACK: DeepSeek Chat (deepseek/deepseek-chat) via OpenRouter
 *
 * Fallback Rules:
 * - Grok 4.1 --> Fallback to: DeepSeek Chat (OpenRouter)
 * - DeepSeek --> Fallback to: Grok 4.1 (as before)
 * - Gemini Model --> Fallback to: Grok 4.1 (reversed from original)
 */

import { PRIMARY_MODELS } from '../config/modelConfig';

export type ModelProvider = 'google' | 'openrouter' | 'groq' | 'grok' | 'anthropic';

export interface ModelConfig {
  model: string;
  provider: ModelProvider;
}

export interface FallbackConfig extends ModelConfig {
  fallbackModel: string;
  fallbackProvider: ModelProvider;
}

/**
 * Determine if a model is a DeepSeek or Grok model
 */
export function isDeepSeekOrGrokModel(model: string): boolean {
  const lowerModel = model.toLowerCase();
  return (
    lowerModel.includes('deepseek') ||
    lowerModel.includes('grok') ||
    lowerModel.includes('deepseek-v3')
  );
}

/**
 * Determine if a model is a Gemini model
 */
export function isGeminiModel(model: string): boolean {
  const lowerModel = model.toLowerCase();
  return lowerModel.includes('gemini');
}

/**
 * Get the fallback model for a given primary model
 *
 * Updated Rules:
 * - Grok 4.1 (x-ai/grok-4.1-fast) --> deepseek/deepseek-chat (OpenRouter)
 * - DeepSeek / Grok (other) --> xai/grok-4.1-fast (OpenRouter)
 * - Gemini --> xai/grok-4.1-fast (OpenRouter) [reversed from original]
 * - Other --> returns the original model
 */
export function getFallbackModel(primaryModel: string): FallbackConfig {
  const lowerModel = primaryModel.toLowerCase();

  // Grok 4.1 as primary --> fallback to DeepSeek (OpenRouter)
  if (lowerModel.includes('grok-4.1') || lowerModel.includes('grok-4')) {
    return {
      model: primaryModel,
      provider: 'openrouter',
      fallbackModel: 'deepseek/deepseek-chat',
      fallbackProvider: 'openrouter',
    };
  }

  // Other DeepSeek/Grok models --> fallback to Grok 4.1
  if (isDeepSeekOrGrokModel(primaryModel)) {
    return {
      model: primaryModel,
      provider: 'openrouter',
      fallbackModel: PRIMARY_MODELS.GROK_4_1_FAST,
      fallbackProvider: 'openrouter',
    };
  }

  // Gemini (legacy) --> fallback to Grok 4.1
  if (isGeminiModel(primaryModel)) {
    return {
      model: primaryModel,
      provider: 'google',
      fallbackModel: PRIMARY_MODELS.GROK_4_1_FAST,
      fallbackProvider: 'openrouter',
    };
  }

  // No fallback needed for other models
  return {
    model: primaryModel,
    provider: 'openrouter',
    fallbackModel: primaryModel,
    fallbackProvider: 'openrouter',
  };
}

/**
 * Check if we should attempt fallback based on error
 */
export function shouldUseFallback(error: unknown): boolean {
  const errorStr = String(error).toLowerCase();

  // Rate limit errors
  if (errorStr.includes('429') || errorStr.includes('rate limit')) {
    return true;
  }

  // Quota errors
  if (errorStr.includes('quota') || errorStr.includes('out of quota')) {
    return true;
  }

  // Service unavailable
  if (errorStr.includes('503') || errorStr.includes('service unavailable')) {
    return true;
  }

  // Timeout errors
  if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
    return true;
  }

  // Resource exhausted
  if (errorStr.includes('resource exhausted') || errorStr.includes('exhausted')) {
    return true;
  }

  // API Key issues (might indicate service unavailable)
  if (errorStr.includes('api key') && errorStr.includes('invalid')) {
    return false; // Don't fallback, this is a config issue
  }

  return false;
}

/**
 * Log fallback attempt for monitoring
 */
export function logFallbackAttempt(
  wizardName: string,
  primaryModel: string,
  fallbackModel: string,
  error: unknown
): void {
  console.warn(
    `[Model Fallback] ${wizardName}: Switching from ${primaryModel} to ${fallbackModel}`,
    `Error: ${String(error).substring(0, 200)}`
  );
}

/**
 * Create a retry config with fallback
 */
export function createRetryConfig(
  primaryModel: string,
  maxRetries: number = 3,
  fallbackEnabled: boolean = true
) {
  const fallbackConfig = getFallbackModel(primaryModel);

  return {
    primaryModel,
    fallbackModel: fallbackEnabled ? fallbackConfig.fallbackModel : primaryModel,
    maxRetries,
    fallbackEnabled,
    models: fallbackEnabled ? [primaryModel, fallbackConfig.fallbackModel] : [primaryModel],
  };
}

/**
 * Safe model execution with automatic fallback
 */
export async function executeWithFallback<T>(
  wizardName: string,
  primaryModel: string,
  primaryFn: (model: string) => Promise<T>,
  fallbackFn?: (model: string) => Promise<T>
): Promise<T> {
  try {
    return await primaryFn(primaryModel);
  } catch (primaryError) {
    if (!shouldUseFallback(primaryError)) {
      throw primaryError;
    }

    const fallbackConfig = getFallbackModel(primaryModel);
    const fallbackModel = fallbackConfig.fallbackModel;

    logFallbackAttempt(wizardName, primaryModel, fallbackModel, primaryError);

    if (!fallbackFn) {
      throw new Error(
        `Fallback to ${fallbackModel} not implemented for ${wizardName}`
      );
    }

    try {
      return await fallbackFn(fallbackModel);
    } catch (fallbackError) {
      // Attach original error context
      const combinedError = new Error(
        `Both primary (${primaryModel}) and fallback (${fallbackModel}) models failed. ` +
        `Primary: ${String(primaryError).substring(0, 100)}. ` +
        `Fallback: ${String(fallbackError).substring(0, 100)}`
      );
      throw combinedError;
    }
  }
}
