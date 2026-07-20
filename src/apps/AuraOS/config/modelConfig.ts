/**
 * Centralized AI Model Configuration
 * Single source of truth for all model identifiers used across AOS
 */

/**
 * Primary models - used for most AI generation tasks
 */
export const PRIMARY_MODELS = {
  /** OpenRouter Free - Default model for all tasks */
  FREE: 'openrouter/free',

  /** Grok 4.1 Fast - Default primary model for most tasks */
  GROK_4_1_FAST: 'openrouter/free',

  /** Grok 4.1 Non-Reasoning - For tasks that don't need chain-of-thought */
  GROK_4_1_NON_REASONING: 'openrouter/free',

  /** GPT OSS 120B - Used in some specialized services */
  GPT_OSS_120B: 'openrouter/free',

  /** GPT OSS 120B Exacto - Used in bias detection */
  GPT_OSS_120B_EXACTO: 'openrouter/free',

  /** GPT OSS 120B Nitro - Used in Integral Practice Designer (fast) */
  GPT_OSS_120B_NITRO: 'openrouter/free',

  /** DeepSeek V3.2 - Used in DBT Coach */
  DEEPSEEK_V3_2: 'openrouter/free',

  /** Inception Mercury 2 - Used for slow multi-step wizards */
  INCEPTION_MERCURY_2: 'openrouter/free',
} as const;

/**
 * Fallback models - used when primary models fail
 */
export const FALLBACK_MODELS = {
  /** Qwen 3 30B - Default fallback for most tasks */
  QWEN_3_30B: 'openrouter/free',

  /** MiMo V2 Flash - Fallback for Relational Blueprint wizard */
  MIMO_V2_FLASH_NITRO: 'openrouter/free',
} as const;

/**
 * Default model configuration
 */
export const DEFAULT_MODELS = {
  /** Standard primary model */
  PRIMARY: 'openrouter/free',

  /** Standard fallback model */
  FALLBACK: 'openrouter/free',
} as const;

/**
 * Model type for TypeScript type safety
 */
export type PrimaryModel = typeof PRIMARY_MODELS[keyof typeof PRIMARY_MODELS];
export type FallbackModel = typeof FALLBACK_MODELS[keyof typeof FALLBACK_MODELS];
export type AIModel = PrimaryModel | FallbackModel | string;

/**
 * Checks if a model string is a valid primary model
 */
export function isPrimaryModel(model: string): model is PrimaryModel {
  return Object.values(PRIMARY_MODELS).includes(model as PrimaryModel);
}

/**
 * Checks if a model string is a valid fallback model
 */
export function isFallbackModel(model: string): model is FallbackModel {
  return Object.values(FALLBACK_MODELS).includes(model as FallbackModel);
}

/**
 * Checks if a model string is a valid model
 */
export function isValidModel(model: string): model is AIModel {
  return isPrimaryModel(model) || isFallbackModel(model);
}
