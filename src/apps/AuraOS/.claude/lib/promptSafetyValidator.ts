/**
 * Prompt Safety Validator
 * Scans prompts for glitch tokens before LLM calls
 * Logs encounters to localStorage for research purposes
 */

import { detectGlitchTokens, DetectionResult, GLITCH_TOKEN_CATALOG } from './glitchTokenCatalog';
import { StorageManager } from './storageManager';

export interface PromptValidationResult {
  safe: boolean;
  riskLevel: 'safe' | 'warning' | 'danger';
  detections: DetectionResult[];
  severeTokens: string[];
  recommendation: string;
  sanitized?: string;
}

// High-risk behaviors that could break LLM calls
const SEVERE_BEHAVIORS = ['CONTEXT_CORRUPTOR', 'LOOP_INDUCER', 'IDENTITY_DISRUPTOR'];

/**
 * Validate prompt for glitch tokens
 * @param prompt The prompt text to validate
 * @param options Validation options
 * @returns Validation result with recommendations
 */
export function validatePromptSafety(
  prompt: string,
  options?: {
    strictMode?: boolean; // Log all detections, not just severe
    autoSanitize?: boolean; // Automatically sanitize severe tokens
  }
): PromptValidationResult {
  const { strictMode = false, autoSanitize = false } = options || {};

  // Detect glitch tokens in prompt
  const detections = detectGlitchTokens(prompt);

  // Find severe tokens
  const severeTokens = detections
    .filter((d) => SEVERE_BEHAVIORS.includes(d.behavior))
    .map((d) => d.token);

  // Determine risk level
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  if (severeTokens.length > 0) {
    riskLevel = 'danger';
  } else if (detections.length > 0) {
    riskLevel = 'warning';
  }

  // Log encounters if any tokens found or in strict mode
  if (detections.length > 0 || strictMode) {
    logGlitchEncounter({
      prompt,
      detections,
      riskLevel,
      timestamp: new Date().toISOString()
    });
  }

  // Generate recommendation
  let recommendation = '';
  if (riskLevel === 'danger') {
    recommendation = `RISK: ${severeTokens.length} potentially harmful token(s) detected (${severeTokens.join(
      ', '
    )}). LLM behavior may be unpredictable. ${autoSanitize ? 'Prompt will be sanitized.' : 'Consider sanitizing prompt.'}`;
  } else if (riskLevel === 'warning') {
    recommendation = `INFO: ${detections.length} glitch token(s) detected. Monitor response quality. Safe to proceed but be aware of potential quirks.`;
  } else {
    recommendation = 'Prompt is safe to send to LLM.';
  }

  // Optionally sanitize severe tokens
  let sanitized: string | undefined;
  if (autoSanitize && severeTokens.length > 0) {
    sanitized = sanitizePrompt(prompt, severeTokens);
  }

  return {
    safe: riskLevel === 'safe',
    riskLevel,
    detections,
    severeTokens,
    recommendation,
    sanitized
  };
}

/**
 * Sanitize prompt by replacing glitch tokens with safe alternatives
 */
function sanitizePrompt(prompt: string, tokensToRemove: string[]): string {
  let sanitized = prompt;

  tokensToRemove.forEach((token) => {
    // Replace token with placeholder
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    sanitized = sanitized.replace(regex, '[SANITIZED]');
  });

  return sanitized;
}

/**
 * Log a glitch token encounter to localStorage
 */
export interface GlitchEncounter {
  prompt: string;
  detections: DetectionResult[];
  riskLevel: 'safe' | 'warning' | 'danger';
  timestamp: string;
  context?: string; // Optional context (wizard name, etc.)
}

export function logGlitchEncounter(encounter: GlitchEncounter): void {
  try {
    // Get existing encounters
    const storageKey = 'aura-glitch-research-encounters';
    const raw = StorageManager.getUntyped(storageKey) as GlitchEncounter[] | null;
    const encounters: GlitchEncounter[] = Array.isArray(raw) ? raw : [];

    // Add new encounter (keep last 100)
    encounters.push(encounter);
    if (encounters.length > 100) {
      encounters.shift();
    }

    // Save back
    StorageManager.setUntyped(storageKey, encounters);
  } catch (e) {
    // Silently fail if localStorage unavailable
    console.warn('Could not log glitch encounter:', e);
  }
}

/**
 * Get all logged glitch encounters
 */
export function getGlitchEncounters(): GlitchEncounter[] {
  try {
    const storageKey = 'aura-glitch-research-encounters';
    const raw = StorageManager.getUntyped(storageKey) as GlitchEncounter[] | null;
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    console.warn('Could not retrieve glitch encounters:', e);
    return [];
  }
}

/**
 * Get statistics about glitch token encounters
 */
export function getGlitchStatistics(): {
  totalEncounters: number;
  riskBreakdown: Record<string, number>;
  mostCommonTokens: Array<{ token: string; count: number }>;
  dangerousEncounters: number;
} {
  const encounters = getGlitchEncounters();

  const riskBreakdown = { safe: 0, warning: 0, danger: 0 };
  const tokenCounts = new Map<string, number>();

  encounters.forEach((enc) => {
    riskBreakdown[enc.riskLevel]++;
    enc.detections.forEach((det) => {
      tokenCounts.set(det.token, (tokenCounts.get(det.token) || 0) + 1);
    });
  });

  const mostCommonTokens = Array.from(tokenCounts.entries())
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEncounters: encounters.length,
    riskBreakdown,
    mostCommonTokens,
    dangerousEncounters: riskBreakdown.danger
  };
}

/**
 * Clear glitch encounter history
 */
export function clearGlitchHistory(): void {
  try {
    StorageManager.delete('aura-glitch-research-encounters');
  } catch (e) {
    console.warn('Could not clear glitch history:', e);
  }
}

/**
 * Get research summary for user display
 */
export function getGlitchResearchSummary(): string {
  const stats = getGlitchStatistics();

  if (stats.totalEncounters === 0) {
    return 'No glitch tokens encountered yet. Your prompts are clean!';
  }

  const dangerWarning = stats.dangerousEncounters > 0
    ? `⚠️ ${stats.dangerousEncounters} dangerous encounter(s) detected. `
    : '';

  const topTokens = stats.mostCommonTokens
    .slice(0, 3)
    .map((t) => `"${t.token}" (${t.count}x)`)
    .join(', ');

  return `${dangerWarning}Analyzed ${stats.totalEncounters} prompt(s). Most common: ${topTokens}`;
}
