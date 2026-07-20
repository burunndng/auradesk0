import { IntegratedInsight, PriorInsightSummary } from '../types';

/**
 * Builds a summary of prior insights organized by modality
 * Groups insights and generates concise summaries for each modality
 */
export function buildPriorContext(insights: IntegratedInsight[]): PriorInsightSummary {
  const bodyInsights = insights.filter(i => isBodyModality(i.mindToolType));
  const mindInsights = insights.filter(i => isMindModality(i.mindToolType));
  const spiritInsights = insights.filter(i => isSpiritModality(i.mindToolType));
  const shadowInsights = insights.filter(i => isShadowModality(i.mindToolType));

  return {
    body: summarizeInsightsByModality(bodyInsights, 'body'),
    mind: summarizeInsightsByModality(mindInsights, 'mind'),
    spirit: summarizeInsightsByModality(spiritInsights, 'spirit'),
    shadow: summarizeInsightsByModality(shadowInsights, 'shadow'),
    crossModalPatterns: '', // Filled later by cross-modal analyzer
  };
}

/**
 * Summarizes insights for a single modality
 * Extracts key patterns and themes into concise text (max 250 chars)
 */
export function summarizeInsightsByModality(
  insights: IntegratedInsight[],
  modality: string
): string {
  if (insights.length === 0) {
    return '';
  }

  // Extract unique patterns from detected patterns
  const patterns = new Set<string>();
  insights.forEach(insight => {
    if (insight.detectedPattern) {
      patterns.add(insight.detectedPattern.trim());
    }
  });

  if (patterns.size === 0) {
    return '';
  }

  // Join patterns with commas and truncate to 250 chars
  const summary = Array.from(patterns)
    .slice(0, 5) // Limit to top 5 patterns to stay under char limit
    .join('; ');

  return summary.substring(0, 250);
}

/**
 * Checks if a mindToolType belongs to Body modality
 */
function isBodyModality(mindToolType: string | undefined | null): boolean {
  if (!mindToolType) return false;
  const bodyKeywords = [
    'Bioenergetics',
    'Somatic',
    'Workout',
    'Meditation',
    'Jhana',
    'Integral Body',
    'Interoception',
    'Chronobiology',
    'Attachment',
    'Life Architecture',
    'Polyvagal',
    'Quantified Self',
    'body stance',
  ];
  return bodyKeywords.some(keyword => mindToolType.includes(keyword));
}

/**
 * Checks if a mindToolType belongs to Mind modality
 */
function isMindModality(mindToolType: string | undefined | null): boolean {
  if (!mindToolType) return false;
  const mindKeywords = [
    'Subject-Object',
    'Polarity',
    'Kegan',
    'Perspective',
    'Bias',
    'Decision',
    'Schema',
    'Immunity',
    'Eight Zones',
    'Adaptive Cycle',
    'Consciousness Graph',
    'AXIS',
    'Moral Reasoning',
    'DBT Coach',
    'Coherence Audit',
    '4-Quadrant',
    'Reality Tunnel',
    'cbm',
    'interpretation',
    'Examining Core Belief',
    'Core Belief',
    'Defusion',
    'Daily Integration',
    'Epistemic Crucible',
    'Enneagram',
    'Generativity',
  ];
  return mindKeywords.some(keyword => mindToolType.includes(keyword));
}

/**
 * Checks if a mindToolType belongs to Spirit modality
 */
function isSpiritModality(mindToolType: string | undefined | null): boolean {
  if (!mindToolType) return false;
  const spiritKeywords = [
    'Role Alignment',
    'Context AI',
    'Contemplative Inquiry',
    'Ultimate Concern',
    'Tree of Life',
    'States Training',
    'Advaita',
    'Practice Designer',
    'Therapy Style',
    'Sexology',
    'Generativity Map',
    'Return of Ritual',
    'ritual',
    'Archetypal',
  ];
  return spiritKeywords.some(keyword => mindToolType.includes(keyword));
}

/**
 * Checks if a mindToolType belongs to Shadow modality
 */
function isShadowModality(mindToolType: string | undefined | null): boolean {
  if (!mindToolType) return false;
  const shadowKeywords = [
    'IFS',
    'Big Mind',
    'Shadow Journal',
    '3-2-1',
    'Memory',
    'Relational',
    'Golden Shadow',
    'Psychedelic',
    'Cultural Shadow',
    'Blueprint',
    'Mourning Field',
    'grief',
  ];
  return shadowKeywords.some(keyword => mindToolType.includes(keyword));
}
