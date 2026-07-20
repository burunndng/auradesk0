/**
 * Cross-Modal Symptom Detection
 * Identifies when shadow themes (shame, fear) surface in body/somatic sessions
 * Creates multi-dimensional insights and finds complementary practices
 */

import type {
  AllSessionTypes,
  CrossModalPattern,
  CrossModalInsight,
  IntegratedInsight,
  AllPractice,
  PriorInsightSummary,
} from '../types';
import { practices as allPractices } from '../constants';
import { generateOpenRouterResponse, type OpenRouterMessage } from './openRouterService';
import { StorageManager } from '../.claude/lib/storageManager';

const CROSS_MODAL_STORAGE_KEY = 'crossModalPatterns';

// Keyword mappings for theme detection across modalities
const SHADOW_THEMES = {
  shame: ['shame', 'embarrassed', 'humiliated', 'ashamed', 'unworthy', 'inadequate'],
  fear: ['fear', 'afraid', 'scared', 'anxious', 'worry', 'terrified', 'panic'],
  anger: ['anger', 'angry', 'rage', 'furious', 'resentment', 'irritated', 'hostile'],
  grief: ['grief', 'loss', 'sadness', 'mourning', 'heartbreak', 'sorrow'],
  rejection: ['rejection', 'rejected', 'abandoned', 'unwanted', 'unloved', 'excluded'],
  control: ['control', 'controlling', 'perfectionism', 'micromanage', 'rigid'],
};

const SOMATIC_PATTERNS = {
  tension: ['tension', 'tight', 'clenched', 'contracted', 'rigid', 'stiff'],
  breathing: ['breath', 'breathing', 'shallow', 'holding breath', 'suffocating'],
  pain: ['pain', 'ache', 'hurt', 'discomfort', 'chronic pain'],
  numbness: ['numb', 'disconnected', 'dissociated', 'frozen', 'shut down'],
  activation: ['activated', 'trembling', 'shaking', 'energy', 'buzzing', 'vibration'],
};

const MIND_PATTERNS = {
  bias: ['bias', 'distortion', 'assumption', 'blind spot', 'black-and-white'],
  rumination: ['rumination', 'overthinking', 'spiral', 'obsess', 'looping'],
  avoidance: ['avoid', 'avoidance', 'procrastination', 'deflect', 'escape'],
  rigidity: ['rigid', 'inflexible', 'stuck', 'fixed', 'all-or-nothing'],
};

const SPIRIT_PATTERNS = {
  disconnection: ['disconnected', 'isolated', 'alone', 'separate', 'alienated'],
  resistance: ['resistance', 'resistant', 'blocked', 'closed', 'defended'],
  emptiness: ['empty', 'void', 'meaningless', 'purposeless', 'hollow'],
  seeking: ['seeking', 'longing', 'yearning', 'searching', 'craving'],
};

/**
 * Detect cross-modal patterns across all session types
 * Groups sessions by related themes across Shadow/Body/Mind/Spirit
 *
 * @param sessions - Array of sessions from all modalities
 * @returns Array of detected cross-modal patterns
 */
export function detectCrossModalPatterns(sessions: AllSessionTypes[]): CrossModalPattern[] {
  if (!sessions || sessions.length === 0) {
    console.log('[CrossModalAnalyzer] No sessions to analyze');
    return [];
  }

  // Group sessions by modality
  const sessionsByModality = categorizeSessionsByModality(sessions);

  // Detect patterns in each modality
  const shadowThemes = extractThemes(sessionsByModality.shadow, SHADOW_THEMES);
  const somaticPatterns = extractThemes(sessionsByModality.body, SOMATIC_PATTERNS);
  const mindPatterns = extractThemes(sessionsByModality.mind, MIND_PATTERNS);
  const spiritPatterns = extractThemes(sessionsByModality.spirit, SPIRIT_PATTERNS);

  // Find cross-modal connections (3+ modalities with related themes)
  const patterns: CrossModalPattern[] = [];

  // Match shadow themes with somatic patterns
  for (const [shadowKey, shadowData] of Object.entries(shadowThemes)) {
    // Skip if no shadow sessions for this theme
    if (shadowData.sessions.length === 0) continue;

    const relatedSomatic = findRelatedPatterns(shadowKey, somaticPatterns);
    const relatedMind = findRelatedPatterns(shadowKey, mindPatterns);
    const relatedSpirit = findRelatedPatterns(shadowKey, spiritPatterns);

    // Count how many modalities have related patterns
    const modalityCount =
      1 + // shadow is always present
      (relatedSomatic.length > 0 ? 1 : 0) +
      (relatedMind.length > 0 ? 1 : 0) +
      (relatedSpirit.length > 0 ? 1 : 0);

    // Create pattern if 1+ modalities involved (single-modality patterns are valid for tracking)
    if (modalityCount >= 1) {
      const pattern = createCrossModalPattern(
        shadowKey,
        shadowData,
        relatedSomatic,
        relatedMind,
        relatedSpirit,
        sessionsByModality,
      );
      patterns.push(pattern);
    }
  }

  console.log(`[CrossModalAnalyzer] Detected ${patterns.length} cross-modal patterns`);
  return patterns;
}

/**
 * Create IntegratedInsight from cross-modal pattern
 * Generates insight card showing multi-dimensional view
 *
 * @param pattern - Cross-modal pattern to convert
 * @param relatedInsights - Existing insights related to this pattern
 * @returns CrossModalInsight
 */
export function createCrossModalInsight(
  pattern: CrossModalPattern,
  relatedInsights: IntegratedInsight[] = [],
): CrossModalInsight {
  const modalitiesInvolved: Array<'shadow' | 'body' | 'mind' | 'spirit'> = [];
  if (pattern.shadowTheme) modalitiesInvolved.push('shadow');
  if (pattern.somaticPattern) modalitiesInvolved.push('body');
  if (pattern.mindPattern) modalitiesInvolved.push('mind');
  if (pattern.spiritPattern) modalitiesInvolved.push('spirit');

  // Build synthesis narrative
  const synthesisNarrative = buildSynthesisNarrative(pattern);

  // Build detailed report
  const mindToolReport = buildDetailedReport(pattern, relatedInsights);

  // Generate suggested practices
  const suggestedPractices = findComplementaryPractices(pattern);

  const insight: CrossModalInsight = {
    id: `cross-modal-${pattern.id}`,
    mindToolType: 'Cross-Modal',
    mindToolSessionId: pattern.id,
    mindToolName: `Cross-Modal Pattern: ${pattern.shadowTheme || 'Multi-Dimensional'}`,
    mindToolReport: mindToolReport,
    mindToolShortSummary: synthesisNarrative,
    detectedPattern: pattern.shadowTheme || 'Multi-dimensional pattern',
    suggestedShadowWork: suggestedPractices.shadow,
    suggestedNextSteps: suggestedPractices.nextSteps,
    dateCreated: pattern.firstDetected,
    status: 'pending',
    crossModalPattern: pattern,
    modalitiesInvolved,
    synthesisNarrative,
  };

  return insight;
}

/**
 * Find complementary practices from different modalities
 * Recommends practices that work together to address the pattern
 *
 * @param pattern - Cross-modal pattern to address
 * @returns Suggested shadow work and next steps
 */
export function findComplementaryPractices(pattern: CrossModalPattern): {
  shadow: Array<{ practiceId: string; practiceName: string; rationale: string }>;
  nextSteps: Array<{ practiceId: string; practiceName: string; rationale: string }>;
} {
  const suggestions = {
    shadow: [] as Array<{ practiceId: string; practiceName: string; rationale: string }>,
    nextSteps: [] as Array<{ practiceId: string; practiceName: string; rationale: string }>,
  };

  // Shadow work practices
  if (pattern.shadowTheme) {
    const shadowPractices = allPractices.shadow.filter((p) =>
      matchesPracticeToTheme(p, pattern.shadowTheme!),
    );
    suggestions.shadow = shadowPractices.slice(0, 2).map((p) => ({
      practiceId: p.id,
      practiceName: p.name,
      rationale: `Addresses ${pattern.shadowTheme} with ${p.description}`,
    }));
  }

  // Body practices for somatic patterns
  if (pattern.somaticPattern) {
    const bodyPractices = allPractices.body.filter((p) =>
      matchesPracticeToSomatic(p, pattern.somaticPattern!),
    );
    suggestions.nextSteps.push(
      ...bodyPractices.slice(0, 1).map((p) => ({
        practiceId: p.id,
        practiceName: p.name,
        rationale: `Releases ${pattern.somaticPattern} through embodied practice`,
      })),
    );
  }

  // Mind practices for cognitive patterns
  if (pattern.mindPattern) {
    const mindPractices = allPractices.mind.filter((p) =>
      matchesPracticeToMind(p, pattern.mindPattern!),
    );
    suggestions.nextSteps.push(
      ...mindPractices.slice(0, 1).map((p) => ({
        practiceId: p.id,
        practiceName: p.name,
        rationale: `Works with ${pattern.mindPattern} using cognitive tools`,
      })),
    );
  }

  // Spirit practices for spiritual patterns
  if (pattern.spiritPattern) {
    const spiritPractices = allPractices.spirit.filter((p) =>
      matchesPracticeToSpirit(p, pattern.spiritPattern!),
    );
    suggestions.nextSteps.push(
      ...spiritPractices.slice(0, 1).map((p) => ({
        practiceId: p.id,
        practiceName: p.name,
        rationale: `Addresses ${pattern.spiritPattern} through contemplative practice`,
      })),
    );
  }

  return suggestions;
}

/**
 * Store cross-modal patterns in localStorage
 *
 * @param patterns - Array of patterns to persist
 */
export function persistCrossModalPatterns(patterns: CrossModalPattern[]): void {
  try {
    StorageManager.setUntyped(
      CROSS_MODAL_STORAGE_KEY,
      {
        patterns,
        savedAt: Date.now(),
      },
    );
    console.log(`[CrossModalAnalyzer] Persisted ${patterns.length} patterns`);
  } catch (error) {
    console.error('[CrossModalAnalyzer] Failed to persist patterns:', error);
  }
}

/**
 * Retrieve cross-modal patterns from localStorage
 *
 * @returns Array of stored patterns
 */
export function retrieveCrossModalPatterns(): CrossModalPattern[] {
  try {
    const stored = StorageManager.getUntyped(CROSS_MODAL_STORAGE_KEY);
    if (!stored) return [];

    const data = stored as any;
    return data.patterns || [];
  } catch (error) {
    console.error('[CrossModalAnalyzer] Failed to retrieve patterns:', error);
    return [];
  }
}

/**
 * Detect cross-modal patterns using AI analysis
 * Analyzes summaries from all 4 modalities and uses Grok to identify connecting patterns
 *
 * @param priorContext - Summaries of prior insights organized by modality
 * @returns Concise summary of detected cross-modal patterns (max 500 chars)
 */
export async function detectCrossModalPatternsWithAI(
  priorContext: PriorInsightSummary,
): Promise<string> {
  try {
    // Check if all 4 modalities have content
    const hasAllModalities =
      priorContext.body.trim().length > 0 &&
      priorContext.mind.trim().length > 0 &&
      priorContext.spirit.trim().length > 0 &&
      priorContext.shadow.trim().length > 0;

    if (!hasAllModalities) {
      console.log('[CrossModalAnalyzer] Not all modalities have content, using keyword-based fallback');
      return keywordBasedCrossModalFallback(priorContext);
    }

    // Build AI prompt
    const prompt = `Analyze these practice insights across 4 modalities and identify 1-2 key cross-modal patterns:

Body: ${priorContext.body}
Mind: ${priorContext.mind}
Spirit: ${priorContext.spirit}
Shadow: ${priorContext.shadow}

Respond in 1-2 sentences (max 500 chars) identifying the main pattern connecting these modalities.`;

    // Call OpenRouter with Grok 4.1 Fast
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await generateOpenRouterResponse(messages, undefined, {
      model: 'openrouter/free',
      maxTokens: 200,
      temperature: 0.3,
    });

    if (response.success && response.text.trim().length > 0) {
      // Truncate to max 500 chars as specified
      const result = response.text.trim().substring(0, 500);
      console.log('[CrossModalAnalyzer] AI detected cross-modal pattern:', result);
      return result;
    }

    // Fall back to keyword-based if AI response is empty
    console.log('[CrossModalAnalyzer] AI response empty, using keyword-based fallback');
    return keywordBasedCrossModalFallback(priorContext);
  } catch (error) {
    console.error('[CrossModalAnalyzer] AI cross-modal detection failed:', error);
    // Use keyword-based fallback on error
    return keywordBasedCrossModalFallback(priorContext);
  }
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Keyword-based fallback for detecting cross-modal patterns
 * Used when AI is unavailable or all modalities don't have content
 */
function keywordBasedCrossModalFallback(priorContext: PriorInsightSummary): string {
  const patterns: string[] = [];
  const allText = `${priorContext.body} ${priorContext.mind} ${priorContext.spirit} ${priorContext.shadow}`.toLowerCase();

  // Look for common theme keywords
  const commonThemes = {
    control: ['control', 'rigid', 'perfectionism', 'stuck'],
    connection: ['disconnected', 'isolated', 'separate', 'alone'],
    release: ['tension', 'holding', 'contracted', 'blocked'],
    expansion: ['open', 'flow', 'expansion', 'freedom'],
    fear: ['fear', 'anxiety', 'scared', 'unsafe'],
    shame: ['shame', 'inadequate', 'unworthy', 'embarrassed'],
    grief: ['grief', 'loss', 'sadness', 'mourning'],
  };

  // Detect which themes appear across the modalities
  for (const [theme, keywords] of Object.entries(commonThemes)) {
    const count = keywords.filter((k) => allText.includes(k)).length;
    if (count >= 2) {
      patterns.push(theme);
    }
  }

  if (patterns.length === 0) {
    return 'Multiple dimensions of practice are developing. Continue integrating insights across modalities.';
  }

  const mainTheme = patterns[0];
  const themeName =
    mainTheme.charAt(0).toUpperCase() +
    mainTheme.slice(1);

  return `${themeName} is showing up as a key pattern across your body, mind, spirit, and shadow practices. Integrated work addressing this theme across all dimensions may accelerate transformation.`;
}

/**
 * Categorize sessions by modality (Shadow/Body/Mind/Spirit)
 */
function categorizeSessionsByModality(sessions: AllSessionTypes[]): {
  shadow: AllSessionTypes[];
  body: AllSessionTypes[];
  mind: AllSessionTypes[];
  spirit: AllSessionTypes[];
} {
  const categorized = {
    shadow: [] as AllSessionTypes[],
    body: [] as AllSessionTypes[],
    mind: [] as AllSessionTypes[],
    spirit: [] as AllSessionTypes[],
  };

  for (const session of sessions) {
    const modality = inferSessionModality(session);
    categorized[modality].push(session);
  }

  return categorized;
}

/**
 * Infer modality from session type
 */
function inferSessionModality(session: any): 'shadow' | 'body' | 'mind' | 'spirit' {
  const sessionType = session.constructor?.name || '';

  // Shadow work sessions
  if (
    'trigger' in session ||
    'partName' in session ||
    'implicitBeliefs' in session ||
    'exerciseId' in session ||
    'guideReflection' in session
  ) {
    return 'shadow';
  }

  // Body/somatic sessions
  if ('script' in session || 'practiceType' in session || 'focusArea' in session) {
    return 'body';
  }

  // Spirit sessions
  if ('jhanaLevel' in session || 'practice' in session || 'factors' in session) {
    return 'spirit';
  }

  // Mind sessions (default)
  return 'mind';
}

/**
 * Extract themes from sessions based on keyword matching
 */
function extractThemes(
  sessions: AllSessionTypes[],
  themeKeywords: Record<string, string[]>,
): Record<string, { count: number; sessions: AllSessionTypes[] }> {
  const themes: Record<string, { count: number; sessions: AllSessionTypes[] }> = {};

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    themes[theme] = { count: 0, sessions: [] };

    for (const session of sessions) {
      const sessionText = extractSessionText(session).toLowerCase();
      const hasTheme = keywords.some((keyword) => sessionText.includes(keyword));

      if (hasTheme) {
        themes[theme].count++;
        themes[theme].sessions.push(session);
      }
    }
  }

  return themes;
}

/**
 * Extract searchable text from session
 */
function extractSessionText(session: any): string {
  const parts: string[] = [];

  // Extract text from various session fields
  if (session.trigger) parts.push(session.trigger);
  if (session.integration) parts.push(session.integration);
  if (session.summary) parts.push(session.summary);
  if (session.aiSummary) parts.push(session.aiSummary);
  if (session.notes) parts.push(session.notes);
  if (session.userNotes) parts.push(session.userNotes);
  if (session.intention) parts.push(session.intention);
  if (session.integrationNote) parts.push(session.integrationNote);
  if (session.sessionNotes) parts.push(session.sessionNotes);
  if (session.decisionText) parts.push(session.decisionText);

  return parts.join(' ');
}

/**
 * Find related patterns across modalities
 */
function findRelatedPatterns(
  primaryTheme: string,
  patterns: Record<string, { count: number; sessions: AllSessionTypes[] }>,
): string[] {
  const primaryKeywords = primaryTheme.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const related: string[] = [];

  for (const [theme, data] of Object.entries(patterns)) {
    if (data.count > 0 && theme !== primaryTheme) {
      const themeKeywords = theme.toLowerCase().split(/\s+/);
      const hasSharedKeyword = primaryKeywords.some(kw => themeKeywords.some(tw => tw.includes(kw) || kw.includes(tw)));
      if (hasSharedKeyword) {
        related.push(theme);
      }
    }
  }

  return related;
}

/**
 * Create cross-modal pattern from detected themes
 */
function createCrossModalPattern(
  shadowKey: string,
  shadowData: { count: number; sessions: AllSessionTypes[] },
  relatedSomatic: string[],
  relatedMind: string[],
  relatedSpirit: string[],
  sessionsByModality: {
    shadow: AllSessionTypes[];
    body: AllSessionTypes[];
    mind: AllSessionTypes[];
    spirit: AllSessionTypes[];
  },
): CrossModalPattern {
  const relatedSessions: Array<{
    sessionId: string;
    sessionType: string;
    modality: 'shadow' | 'body' | 'mind' | 'spirit';
    date: string;
  }> = [];

  // Add shadow sessions
  for (const session of shadowData.sessions) {
    relatedSessions.push({
      sessionId: (session as any).id,
      sessionType: inferSessionType(session),
      modality: 'shadow',
      date: (session as any).date,
    });
  }

  // Calculate dates
  const dates = relatedSessions.map((s) => new Date(s.date).getTime());
  const firstDetected = new Date(Math.min(...dates)).toISOString();
  const lastObserved = new Date(Math.max(...dates)).toISOString();

  // Calculate strength based on consistency across modalities
  const modalityCount =
    1 + // shadow
    (relatedSomatic.length > 0 ? 1 : 0) +
    (relatedMind.length > 0 ? 1 : 0) +
    (relatedSpirit.length > 0 ? 1 : 0);
  const strength = Math.min(1, (modalityCount / 4) * (shadowData.count / 5));

  return {
    id: `pattern-${Date.now()}-${shadowKey}`,
    shadowTheme: shadowKey,
    somaticPattern: relatedSomatic[0],
    mindPattern: relatedMind[0],
    spiritPattern: relatedSpirit[0],
    strength,
    relatedInsights: [],
    relatedSessions,
    firstDetected,
    lastObserved,
  };
}

/**
 * Infer session type name
 */
function inferSessionType(session: any): string {
  if ('trigger' in session) return '3-2-1 Reflection';
  if ('partName' in session) return 'IFS Session';
  if ('implicitBeliefs' in session) return 'Memory Reconsolidation';
  if ('script' in session) return 'Somatic Practice';
  if ('jhanaLevel' in session) return 'Jhana Guide';
  return 'Unknown';
}

/**
 * Build synthesis narrative from pattern
 */
function buildSynthesisNarrative(pattern: CrossModalPattern): string {
  const parts: string[] = [];

  if (pattern.shadowTheme) {
    parts.push(`Your ${pattern.shadowTheme} is showing up across multiple dimensions of your practice`);
  }

  if (pattern.somaticPattern) {
    parts.push(`manifesting as ${pattern.somaticPattern} in your body`);
  }

  if (pattern.mindPattern) {
    parts.push(`appearing as ${pattern.mindPattern} in your thinking`);
  }

  if (pattern.spiritPattern) {
    parts.push(`and creating ${pattern.spiritPattern} in your spiritual practice`);
  }

  return parts.join(', ') + '. This multi-dimensional pattern suggests an opportunity for integrated work.';
}

/**
 * Build detailed report from pattern
 */
function buildDetailedReport(pattern: CrossModalPattern, relatedInsights: IntegratedInsight[]): string {
  let report = `# Cross-Modal Pattern Analysis\n\n`;

  report += `## Pattern Overview\n`;
  report += `**Strength**: ${(pattern.strength * 100).toFixed(0)}%\n`;
  report += `**First Detected**: ${new Date(pattern.firstDetected).toLocaleDateString()}\n`;
  report += `**Last Observed**: ${new Date(pattern.lastObserved).toLocaleDateString()}\n\n`;

  report += `## Manifestations Across Modalities\n\n`;

  if (pattern.shadowTheme) {
    report += `**Shadow**: ${pattern.shadowTheme}\n`;
  }
  if (pattern.somaticPattern) {
    report += `**Body**: ${pattern.somaticPattern}\n`;
  }
  if (pattern.mindPattern) {
    report += `**Mind**: ${pattern.mindPattern}\n`;
  }
  if (pattern.spiritPattern) {
    report += `**Spirit**: ${pattern.spiritPattern}\n`;
  }

  report += `\n## Related Sessions\n`;
  report += `${pattern.relatedSessions.length} sessions across ${new Set(pattern.relatedSessions.map((s) => s.modality)).size} modalities\n\n`;

  if (relatedInsights.length > 0) {
    report += `## Related Insights\n`;
    for (const insight of relatedInsights) {
      report += `- ${insight.mindToolName}: ${insight.mindToolShortSummary}\n`;
    }
  }

  return report;
}

/**
 * Match practice to shadow theme
 */
function matchesPracticeToTheme(practice: AllPractice, theme: string): boolean {
  const practiceText = `${practice.name} ${practice.description} ${practice.why}`.toLowerCase();
  return practiceText.includes(theme) || SHADOW_THEMES[theme as keyof typeof SHADOW_THEMES]?.some((k) => practiceText.includes(k));
}

/**
 * Match practice to somatic pattern
 */
function matchesPracticeToSomatic(practice: AllPractice, pattern: string): boolean {
  const practiceText = `${practice.name} ${practice.description} ${practice.why}`.toLowerCase();
  
  // Direct pattern match
  if (practiceText.includes(pattern)) return true;
  
  // Match any keyword from the pattern category
  const keywords = SOMATIC_PATTERNS[pattern as keyof typeof SOMATIC_PATTERNS];
  if (keywords && keywords.some((k) => practiceText.includes(k))) return true;
  
  // General body/somatic practices are relevant for any somatic pattern
  if (practiceText.includes('body') || practiceText.includes('somatic') || practiceText.includes('physical')) {
    return true;
  }
  
  return false;
}

/**
 * Match practice to mind pattern
 */
function matchesPracticeToMind(practice: AllPractice, pattern: string): boolean {
  const practiceText = `${practice.name} ${practice.description} ${practice.why}`.toLowerCase();
  
  // Direct pattern match
  if (practiceText.includes(pattern)) return true;
  
  // General cognitive/mind practices
  if (practiceText.includes('cognitive') || practiceText.includes('thinking') || practiceText.includes('mental')) {
    return true;
  }
  
  return false;
}

/**
 * Match practice to spirit pattern
 */
function matchesPracticeToSpirit(practice: AllPractice, pattern: string): boolean {
  const practiceText = `${practice.name} ${practice.description} ${practice.why}`.toLowerCase();
  
  // Direct pattern match
  if (practiceText.includes(pattern)) return true;
  
  // General contemplative/spirit practices
  if (practiceText.includes('meditation') || practiceText.includes('contemplative') || practiceText.includes('spiritual')) {
    return true;
  }
  
  return false;
}
