/**
 * Cross-Modal Analyzer — Pure synchronous functions only
 * Safe to import in a Web Worker (no network calls, no StorageManager, no openRouterService)
 *
 * Contains: detectCrossModalPatterns and all its helper functions.
 * AI-enhanced variant (detectCrossModalPatternsWithAI) remains in crossModalAnalyzer.ts.
 */

import type { AllSessionTypes, CrossModalPattern } from '../types';
import { practices as allPractices } from '../constants';

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

// ============================================================================
// Internal Helper Functions
// ============================================================================

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

function inferSessionModality(session: any): 'shadow' | 'body' | 'mind' | 'spirit' {
  if (
    'trigger' in session ||
    'partName' in session ||
    'implicitBeliefs' in session ||
    'exerciseId' in session ||
    'guideReflection' in session
  ) {
    return 'shadow';
  }

  if ('script' in session || 'practiceType' in session || 'focusArea' in session) {
    return 'body';
  }

  if ('jhanaLevel' in session || 'practice' in session || 'factors' in session) {
    return 'spirit';
  }

  return 'mind';
}

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

function extractSessionText(session: any): string {
  const parts: string[] = [];

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

function inferSessionType(session: any): string {
  if ('trigger' in session) return '3-2-1 Reflection';
  if ('partName' in session) return 'IFS Session';
  if ('implicitBeliefs' in session) return 'Memory Reconsolidation';
  if ('script' in session) return 'Somatic Practice';
  if ('jhanaLevel' in session) return 'Jhana Guide';
  return 'Unknown';
}

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

  for (const session of shadowData.sessions) {
    relatedSessions.push({
      sessionId: (session as any).id,
      sessionType: inferSessionType(session),
      modality: 'shadow',
      date: (session as any).date,
    });
  }

  const dates = relatedSessions.map((s) => new Date(s.date).getTime());
  const firstDetected = new Date(Math.min(...dates)).toISOString();
  const lastObserved = new Date(Math.max(...dates)).toISOString();

  const modalityCount =
    1 +
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
