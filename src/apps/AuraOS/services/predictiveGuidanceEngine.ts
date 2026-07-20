/**
 * Predictive Guidance Engine
 * Analyzes user trajectories to predict upcoming challenges and recommend proactive actions
 * Classifies developmental stages and forecasts next growth edges
 */

import type {
  IntegratedInsight,
  PredictiveAlert,
  Forecast,
  GuidanceRecommendation,
  DevelopmentalPhase,
  PatternFamily,
  AllSessionTypes,
  KeganStage,
} from '../types';
import type { WizardSessionSummary } from '../types';
import { StorageManager } from '../.claude/lib/storageManager';

const PREDICTIVE_STORAGE_KEY = 'predictiveGuidance';

// Archetype patterns for trajectory analysis
const CRISIS_ARCHETYPES = {
  'shame-isolation': {
    indicators: ['shame', 'isolated', 'withdrawn', 'alone', 'hide'],
    nextChallenge: 'Disconnection spiral leading to depressive state',
    recommendedModality: 'shadow' as const,
    preparatoryPractices: ['ifs', 'shadow-journaling', 'self-compassion'],
  },
  'fear-avoidance': {
    indicators: ['fear', 'avoid', 'procrastinate', 'escape', 'numb'],
    nextChallenge: 'Avoidance cascade limiting life engagement',
    recommendedModality: 'mind' as const,
    preparatoryPractices: ['cognitive-reframe', 'exposure-therapy', 'somatic-grounding'],
  },
  'perfectionism-burnout': {
    indicators: ['perfectionism', 'exhausted', 'overworking', 'control', 'rigid'],
    nextChallenge: 'Burnout from unsustainable standards',
    recommendedModality: 'body' as const,
    preparatoryPractices: ['somatic-release', 'rest-restoration', 'boundary-setting'],
  },
  'attachment-anxiety': {
    indicators: ['anxious', 'abandonment', 'clingy', 'reassurance', 'rejection'],
    nextChallenge: 'Relationship rupture from anxious patterns',
    recommendedModality: 'shadow' as const,
    preparatoryPractices: ['attachment-work', 'secure-base', 'parts-work'],
  },
};

/**
 * Analyze user trajectories for risk patterns
 * Identifies users heading toward known crisis patterns
 *
 * @param userInsights - All user insights
 * @param recentSessions - Recent wizard sessions (last 30 days)
 * @returns Array of predictive alerts
 */
export function analyzeTrajectoriesForRisk(
  userInsights: IntegratedInsight[],
  recentSessions: WizardSessionSummary[],
): PredictiveAlert[] {
  if (!userInsights || userInsights.length === 0) {
    console.log('[PredictiveGuidance] No insights to analyze');
    return [];
  }

  const alerts: PredictiveAlert[] = [];

  // Extract patterns from recent activity
  const recentPatterns = extractPatternsFromInsights(userInsights.slice(0, 10));
  const sessionIntensity = calculateSessionIntensity(recentSessions);

  // Check against crisis archetypes
  for (const [archetypeKey, archetype] of Object.entries(CRISIS_ARCHETYPES)) {
    const matchScore = calculateArchetypeMatch(recentPatterns, archetype.indicators);

    if (matchScore > 0.6) {
      // High risk detected
      const alert = createRiskAlert(archetypeKey, archetype, matchScore, sessionIntensity);
      alerts.push(alert);
    }
  }

  // Detect escalation patterns
  const escalationAlert = detectEscalationPattern(userInsights, recentSessions);
  if (escalationAlert) {
    alerts.push(escalationAlert);
  }

  console.log(`[PredictiveGuidance] Generated ${alerts.length} risk alerts`);
  return alerts;
}

/**
 * Forecast next challenge based on pattern trends
 * Predicts what challenge comes next based on pattern evolution
 *
 * @param patterns - Pattern families from pattern recognition engine
 * @param recentInsights - Recent insights (last 30 days)
 * @returns Forecast for next challenge
 */
export function forecastNextChallenge(
  patterns: PatternFamily[],
  recentInsights: IntegratedInsight[],
): Forecast | null {
  if (!patterns || patterns.length === 0) {
    console.log('[PredictiveGuidance] No patterns to forecast from');
    return null;
  }

  // Find strongest pattern with increasing trend
  const increasingPatterns = patterns.filter((p) => {
    const latestEvolution = p.evolution_history?.[p.evolution_history.length - 1];
    return latestEvolution?.strength_trend === 'increasing';
  });

  if (increasingPatterns.length === 0) {
    console.log('[PredictiveGuidance] No increasing patterns detected');
    return null;
  }

  // Select strongest increasing pattern
  const strongestPattern = increasingPatterns.sort((a, b) => b.metadata.strength - a.metadata.strength)[0];

  // Determine likely next challenge based on pattern trajectory
  const forecast = createForecastFromPattern(strongestPattern, recentInsights);

  console.log(`[PredictiveGuidance] Forecasted challenge: ${forecast.likelyChallenge}`);
  return forecast;
}

/**
 * Recommend proactive action for forecast
 * Suggests practices and wizards before crisis hits
 *
 * @param forecast - Forecast to address
 * @returns Guidance recommendation
 */
export function recommendProactiveAction(forecast: Forecast): GuidanceRecommendation {
  const recommendation: GuidanceRecommendation = {
    action: `Prepare for ${forecast.likelyChallenge.toLowerCase()} by building skills now`,
    priority: forecast.confidence > 0.75 ? 'high' : 'medium',
    practices: [],
    wizards: [],
    timing: `Start within ${forecast.timeframe}`,
  };

  // Map practices from forecast
  recommendation.practices = forecast.preparatoryPractices.map((practiceId) => ({
    practiceId,
    practiceName: practiceId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    rationale: `Builds capacity to handle ${forecast.likelyChallenge.toLowerCase()}`,
    frequency: 'daily',
  }));

  // Recommend wizards based on modality
  const wizardsByModality = {
    shadow: [
      { type: 'ifs', name: 'IFS Explorer', focus: 'Parts work for emotional resilience' },
      { type: 'threeTwoOne', name: '3-2-1 Process', focus: 'Integration of shadow material' },
    ],
    body: [
      { type: 'somaticGenerator', name: 'Somatic Practice', focus: 'Body-based stress regulation' },
      { type: 'bioenergetics', name: 'Bioenergetics', focus: 'Release chronic tension patterns' },
    ],
    mind: [
      { type: 'biasDetective', name: 'Bias Detective', focus: 'Cognitive pattern awareness' },
      { type: 'subjectObject', name: 'Subject-Object Explorer', focus: 'Developmental decentering' },
    ],
    spirit: [
      { type: 'meditationWizard', name: 'Meditation Finder', focus: 'Contemplative stabilization' },
      { type: 'jhanaTracker', name: 'Jhana Tracker', focus: 'Deep concentration practice' },
    ],
    'multi-modal': [
      { type: 'adaptiveCycle', name: 'Adaptive Cycle', focus: 'Systems-level understanding' },
      { type: 'eightZones', name: '8 Zones of Knowing', focus: 'Multi-perspective analysis' },
    ],
  };

  const suggestedWizards = wizardsByModality[forecast.recommendedModality] || [];
  recommendation.wizards = suggestedWizards.map((w) => ({
    wizardType: w.type,
    wizardName: w.name,
    reason: `Addresses ${forecast.likelyChallenge.toLowerCase()}`,
    focus: w.focus,
  }));

  return recommendation;
}

/**
 * Predict developmental stage from session history
 * Estimates where user is in recovery/growth journey
 *
 * @param sessions - All wizard sessions
 * @param insights - All integrated insights
 * @returns Developmental phase classification
 */
export function predictDevelopmentalStage(
  sessions: WizardSessionSummary[],
  insights: IntegratedInsight[],
): DevelopmentalPhase {
  // Early stabilization: < 10 sessions, basic practice building
  if (sessions.length < 10) {
    return 'early_stabilization';
  }

  // Pattern recognition: 10-30 sessions, identifying recurring themes
  if (sessions.length < 30) {
    const addressedInsights = insights.filter((i) => i.status === 'addressed');
    if (addressedInsights.length < 5) {
      return 'pattern_recognition';
    }
  }

  // Integration: 30+ sessions, actively working with patterns
  if (sessions.length < 50) {
    const addressedInsights = insights.filter((i) => i.status === 'addressed');
    if (addressedInsights.length >= 5 && addressedInsights.length < 15) {
      return 'integration';
    }
  }

  // Advanced practice: 50+ sessions, sophisticated multi-modal work
  const modalityDiversity = calculateModalityDiversity(sessions);
  const addressedInsights = insights.filter((i) => i.status === 'addressed');

  if (modalityDiversity > 0.6 && addressedInsights.length >= 15) {
    return 'advanced_practice';
  }

  // Default to integration if metrics are mixed
  return 'integration';
}

/**
 * Store predictive guidance in localStorage
 *
 * @param alerts - Alerts to persist
 * @param forecasts - Forecasts to persist
 */
export function persistPredictiveGuidance(alerts: PredictiveAlert[], forecasts: Forecast[]): void {
  try {
    StorageManager.setUntyped(
      PREDICTIVE_STORAGE_KEY,
      {
        alerts,
        forecasts,
        savedAt: Date.now(),
      },
    );
    console.log(`[PredictiveGuidance] Persisted ${alerts.length} alerts, ${forecasts.length} forecasts`);
  } catch (error) {
    console.error('[PredictiveGuidance] Failed to persist guidance:', error);
  }
}

/**
 * Retrieve predictive guidance from localStorage
 *
 * @returns Stored alerts and forecasts
 */
export function retrievePredictiveGuidance(): { alerts: PredictiveAlert[]; forecasts: Forecast[] } {
  try {
    const stored = StorageManager.getUntyped(PREDICTIVE_STORAGE_KEY);
    if (!stored) return { alerts: [], forecasts: [] };

    const data = stored as any;
    return {
      alerts: data.alerts || [],
      forecasts: data.forecasts || [],
    };
  } catch (error) {
    console.error('[PredictiveGuidance] Failed to retrieve guidance:', error);
    return { alerts: [], forecasts: [] };
  }
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Extract patterns from insights
 */
function extractPatternsFromInsights(insights: IntegratedInsight[]): string[] {
  const patterns: string[] = [];

  for (const insight of insights) {
    if (insight.detectedPattern) {
      patterns.push(insight.detectedPattern.toLowerCase());
    }
    // Extract from short summary
    if (insight.mindToolShortSummary) {
      patterns.push(insight.mindToolShortSummary.toLowerCase());
    }
  }

  return patterns;
}

/**
 * Calculate session intensity (frequency and recency)
 */
function calculateSessionIntensity(sessions: WizardSessionSummary[]): number {
  if (sessions.length === 0) return 0;

  // Count sessions in last 7 days
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentCount = sessions.filter((s) => new Date(s.date).getTime() > oneWeekAgo).length;

  // Intensity = sessions per week, normalized
  return Math.min(1, recentCount / 5);
}

/**
 * Calculate match score against archetype indicators
 */
function calculateArchetypeMatch(patterns: string[], indicators: string[]): number {
  let matchCount = 0;

  for (const pattern of patterns) {
    for (const indicator of indicators) {
      if (pattern.includes(indicator)) {
        matchCount++;
        break; // Count each pattern once
      }
    }
  }

  return matchCount / indicators.length;
}

/**
 * Create risk alert from archetype match
 */
function createRiskAlert(
  archetypeKey: string,
  archetype: (typeof CRISIS_ARCHETYPES)[keyof typeof CRISIS_ARCHETYPES],
  matchScore: number,
  sessionIntensity: number,
): PredictiveAlert {
  const severity: 'low' | 'medium' | 'high' = matchScore > 0.8 ? 'high' : matchScore > 0.7 ? 'medium' : 'low';

  const timeframe = sessionIntensity > 0.6 ? 'next 1-2 weeks' : 'next 2-4 weeks';

  const recommendation: GuidanceRecommendation = {
    action: `Address ${archetypeKey.replace(/-/g, ' ')} pattern proactively`,
    priority: severity === 'high' ? 'critical' : 'high',
    practices: archetype.preparatoryPractices.map((p) => ({
      practiceId: p,
      practiceName: p.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      rationale: `Builds resilience against ${archetype.nextChallenge.toLowerCase()}`,
      frequency: 'daily',
    })),
    wizards: [],
    timing: timeframe,
  };

  return {
    id: `alert-${Date.now()}-${archetypeKey}`,
    type: 'risk',
    severity,
    timeframe,
    title: `Risk: ${archetype.nextChallenge}`,
    description: `Based on recent patterns (${archetype.indicators.join(', ')}), you may be heading toward ${archetype.nextChallenge.toLowerCase()}.`,
    triggerIndicators: archetype.indicators,
    recommendation,
    confidence: matchScore,
    generatedAt: new Date().toISOString(),
    recommendedModality: archetype.recommendedModality,
  };
}

/**
 * Detect escalation pattern in insights
 */
function detectEscalationPattern(
  insights: IntegratedInsight[],
  recentSessions: WizardSessionSummary[],
): PredictiveAlert | null {
  // Check if same pattern appearing with increasing frequency
  const patternCounts: Record<string, number[]> = {};

  for (const insight of insights.slice(0, 20)) {
    const pattern = insight.detectedPattern?.toLowerCase() || 'unknown';
    if (!patternCounts[pattern]) {
      patternCounts[pattern] = [];
    }
    patternCounts[pattern].push(new Date(insight.dateCreated).getTime());
  }

  // Find patterns with increasing frequency
  for (const [pattern, timestamps] of Object.entries(patternCounts)) {
    if (timestamps.length >= 3) {
      // Check if timestamps getting closer together (escalation)
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      if (intervals.length === 0) return null;
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const recentInterval = intervals[intervals.length - 1];

      if (recentInterval < avgInterval * 0.7) {
        // Escalating pattern detected
        return {
          id: `escalation-${Date.now()}`,
          type: 'risk',
          severity: 'high',
          timeframe: 'next 1-2 weeks',
          title: `Escalation: ${pattern}`,
          description: `The "${pattern}" pattern is appearing more frequently, suggesting escalation.`,
          triggerIndicators: ['increasing frequency', 'pattern repetition'],
          recommendation: {
            action: `Address escalating ${pattern} pattern urgently`,
            priority: 'critical',
            practices: [],
            wizards: [],
            timing: 'immediately',
          },
          confidence: 0.8,
          generatedAt: new Date().toISOString(),
          recommendedModality: 'multi-modal',
        };
      }
    }
  }

  return null;
}

/**
 * Create forecast from pattern family
 */
function createForecastFromPattern(pattern: PatternFamily, recentInsights: IntegratedInsight[]): Forecast {
  const theme = pattern.metadata.primary_theme;
  const strength = pattern.metadata.strength;

  // Map theme to likely challenge
  const challengeMapping: Record<string, string> = {
    shame: 'Self-worth crisis or withdrawal',
    fear: 'Avoidance cascade limiting engagement',
    anger: 'Relational conflict or rupture',
    grief: 'Unprocessed loss overwhelming system',
    control: 'Perfectionism-driven burnout',
    attachment: 'Relationship instability',
  };

  const likelyChallenge = challengeMapping[theme] || 'Developmental transition point';

  // Determine timeframe based on pattern strength
  const timeframe = strength > 0.7 ? '14-21 days' : '1-2 months';

  // Extract trigger indicators from pattern
  const triggerIndicators = pattern.metadata.related_themes.slice(0, 3);

  return {
    timeframe,
    likelyChallenge,
    confidence: strength,
    triggerIndicators: triggerIndicators.length > 0 ? triggerIndicators : [theme],
    recommendedModality: mapThemeToModality(theme),
    preparatoryPractices: getPracticesForTheme(theme),
    rationale: `Pattern "${theme}" showing increasing strength (${(strength * 100).toFixed(0)}%) across ${pattern.clusters.length} clusters`,
  };
}

/**
 * Map theme to primary modality
 */
function mapThemeToModality(theme: string): 'shadow' | 'body' | 'mind' | 'spirit' | 'multi-modal' {
  const modalityMap: Record<string, 'shadow' | 'body' | 'mind' | 'spirit' | 'multi-modal'> = {
    shame: 'shadow',
    fear: 'shadow',
    anger: 'body',
    grief: 'shadow',
    control: 'mind',
    attachment: 'shadow',
    tension: 'body',
    breathing: 'body',
    bias: 'mind',
    rumination: 'mind',
    disconnection: 'spirit',
    emptiness: 'spirit',
  };

  return modalityMap[theme] || 'multi-modal';
}

/**
 * Get preparatory practices for theme
 */
function getPracticesForTheme(theme: string): string[] {
  const practiceMap: Record<string, string[]> = {
    shame: ['self-compassion', 'shadow-journaling', 'ifs'],
    fear: ['somatic-grounding', 'exposure-work', 'parts-dialogue'],
    anger: ['somatic-release', 'boundary-setting', 'anger-work'],
    grief: ['grief-ritual', 'body-work', 'witness-presence'],
    control: ['somatic-softening', 'self-compassion', 'boundary-flexibility'],
    attachment: ['secure-base-practice', 'relationship-repair', 'parts-work'],
  };

  return practiceMap[theme] || ['mindfulness', 'self-reflection', 'integration'];
}

/**
 * Calculate modality diversity in sessions
 */
function calculateModalityDiversity(sessions: WizardSessionSummary[]): number {
  const modalities = new Set<string>();

  for (const session of sessions) {
    if (session.type.includes('ifs') || session.type.includes('321') || session.type.includes('shadow')) {
      modalities.add('shadow');
    } else if (session.type.includes('somatic') || session.type.includes('body')) {
      modalities.add('body');
    } else if (session.type.includes('jhana') || session.type.includes('meditation')) {
      modalities.add('spirit');
    } else {
      modalities.add('mind');
    }
  }

  return modalities.size / 4; // Normalized 0-1
}
