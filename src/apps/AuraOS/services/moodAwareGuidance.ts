/**
 * Mood-Aware Guidance Service
 *
 * Enhances Intelligence Hub recommendations based on user's emotional state.
 * Provides mood-sensitive practice recommendations and burnout risk detection.
 */

import type { AllPractice, IntelligenceContext } from '../types';
import type { UserProfile } from '../utils/contextAggregator';

export type MoodState = 'thriving' | 'stable' | 'struggling' | 'declining' | 'unknown';
export type BurnoutRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface MoodAwareRecommendation {
  moodState: MoodState;
  burnoutRisk: BurnoutRisk;
  toneAdjustment: 'supportive' | 'neutral' | 'challenging';
  recommendedPracticeTypes: string[];
  practiceIntensityGuidance: 'reduce' | 'maintain' | 'increase';
  celebrationsIfAny: string[];
  warningsIfAny: string[];
  moodCorrelations: Array<{
    practice: string;
    correlation: 'positive' | 'negative' | 'neutral';
    strength: number; // 0-1
    insight: string;
  }>;
}

/**
 * Determine current mood state from sentiment summary
 */
export function determineMoodState(sentimentSummary?: UserProfile['sentimentSummary']): MoodState {
  if (!sentimentSummary) return 'unknown';

  const { averageMoodScore, moodTrend } = sentimentSummary;

  // Thriving: positive mood with improving or stable trend
  if (averageMoodScore >= 0.4 && (moodTrend === 'improving' || moodTrend === 'stable')) {
    return 'thriving';
  }

  // Declining: declining trend (mood getting worse)
  if (moodTrend === 'declining') {
    return 'declining';
  }

  // Struggling: low mood but not actively declining
  if (averageMoodScore < -0.1) {
    return 'struggling';
  }

  // Stable: moderate mood, stable or variable trend
  return 'stable';
}

/**
 * Calculate burnout risk based on mood + practice intensity + completion rate
 */
export function calculateBurnoutRisk(
  moodState: MoodState,
  practiceStack: AllPractice[],
  completionHistory: { practiceId: string; date: string; completed: boolean }[],
  userProfile?: UserProfile
): BurnoutRisk {
  if (moodState === 'unknown') return 'none';

  let riskScore = 0;

  // Factor 1: Mood state
  if (moodState === 'declining') riskScore += 40;
  if (moodState === 'struggling') riskScore += 25;

  // Factor 2: Practice stack size
  if (practiceStack.length >= 10) riskScore += 20;
  if (practiceStack.length >= 15) riskScore += 15;

  // Factor 3: Recent completion rate (last 7 days)
  const recentCompletions = completionHistory.filter(c => {
    const date = new Date(c.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date > weekAgo;
  });

  if (recentCompletions.length > 0) {
    const completionRate = recentCompletions.filter(c => c.completed).length / recentCompletions.length;

    if (completionRate < 0.3) riskScore += 20; // Very low completion = overwhelm
    if (completionRate > 0.9 && practiceStack.length >= 8) riskScore += 10; // High completion + many practices = overworking
  }

  // Factor 4: User profile indicators
  if (userProfile?.sentimentSummary?.moodTrend === 'declining') {
    riskScore += 15;
  }

  if (userProfile?.sentimentSummary?.recentMoodKeywords) {
    const stressKeywords = ['stress', 'anxiety', 'overwhelm', 'exhausted', 'tired', 'burnout'];
    const hasStressKeywords = userProfile.sentimentSummary.recentMoodKeywords.some(k =>
      stressKeywords.some(s => k.toLowerCase().includes(s))
    );
    if (hasStressKeywords) riskScore += 25;
  }

  // Determine risk level
  if (riskScore >= 70) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 30) return 'medium';
  if (riskScore >= 15) return 'low';
  return 'none';
}

/**
 * Generate mood-aware recommendations
 */
export function generateMoodAwareRecommendations(
  context: IntelligenceContext,
  userProfile?: UserProfile
): MoodAwareRecommendation {
  const moodState = determineMoodState(userProfile?.sentimentSummary);
  const burnoutRisk = calculateBurnoutRisk(
    moodState,
    context.currentPracticeStack,
    context.completionHistory,
    userProfile
  );

  // Default values
  const recommendation: MoodAwareRecommendation = {
    moodState,
    burnoutRisk,
    toneAdjustment: 'neutral',
    recommendedPracticeTypes: [],
    practiceIntensityGuidance: 'maintain',
    celebrationsIfAny: [],
    warningsIfAny: [],
    moodCorrelations: [],
  };

  // Adjust based on mood state
  switch (moodState) {
    case 'thriving':
      recommendation.toneAdjustment = 'challenging';
      recommendation.recommendedPracticeTypes = [
        'growth-oriented',
        'edge-work',
        'advanced meditation',
        'complex shadow work',
      ];
      recommendation.practiceIntensityGuidance = 'increase';
      recommendation.celebrationsIfAny.push(
        `Your mood has been positive (${userProfile?.sentimentSummary?.averageMoodScore.toFixed(2)}/1.0). Great time to tackle growth edges!`
      );
      break;

    case 'stable':
      recommendation.toneAdjustment = 'neutral';
      recommendation.recommendedPracticeTypes = [
        'balanced practices',
        'skill-building',
        'moderate intensity',
      ];
      recommendation.practiceIntensityGuidance = 'maintain';
      break;

    case 'struggling':
      recommendation.toneAdjustment = 'supportive';
      recommendation.recommendedPracticeTypes = [
        'restorative practices',
        'gentle movement',
        'self-compassion work',
        'grounding exercises',
      ];
      recommendation.practiceIntensityGuidance = 'reduce';
      recommendation.warningsIfAny.push(
        `Your mood has been lower recently (${userProfile?.sentimentSummary?.averageMoodScore.toFixed(2)}/1.0). Consider restorative practices.`
      );
      break;

    case 'declining':
      recommendation.toneAdjustment = 'supportive';
      recommendation.recommendedPracticeTypes = [
        'rest and recovery',
        'gentle practices only',
        'self-care',
        'support-seeking',
      ];
      recommendation.practiceIntensityGuidance = 'reduce';
      recommendation.warningsIfAny.push(
        `Your mood trend is declining. Prioritize rest and gentle practices. Consider reducing stack size.`
      );
      break;
  }

  // Adjust for burnout risk
  if (burnoutRisk === 'high' || burnoutRisk === 'critical') {
    recommendation.toneAdjustment = 'supportive';
    recommendation.practiceIntensityGuidance = 'reduce';
    recommendation.warningsIfAny.push(
      `Burnout risk detected (${burnoutRisk}). Consider removing 30-50% of practices from your stack and focusing on rest.`
    );
  }

  // Detect mood correlations with practices
  if (userProfile?.sentimentSummary) {
    recommendation.moodCorrelations = detectMoodCorrelations(
      context.currentPracticeStack,
      context.completionHistory,
      userProfile.sentimentSummary
    );

    // Add celebrations for positive correlations
    const positiveCorrelations = recommendation.moodCorrelations.filter(c => c.correlation === 'positive' && c.strength >= 0.6);
    if (positiveCorrelations.length > 0) {
      recommendation.celebrationsIfAny.push(
        `${positiveCorrelations[0].practice} correlates with mood improvements! Keep it up.`
      );
    }
  }

  return recommendation;
}

/**
 * Detect correlations between practices and mood changes
 * (Simplified heuristic - in production would use time-series analysis)
 */
function detectMoodCorrelations(
  practiceStack: AllPractice[],
  completionHistory: { practiceId: string; date: string; completed: boolean }[],
  sentimentSummary: UserProfile['sentimentSummary']
): MoodAwareRecommendation['moodCorrelations'] {
  if (!sentimentSummary) return [];

  const correlations: MoodAwareRecommendation['moodCorrelations'] = [];

  for (const practice of practiceStack) {
    const practiceCompletions = completionHistory.filter(
      h => h.practiceId === practice.id && h.completed
    );

    if (practiceCompletions.length < 3) continue; // Need at least 3 completions

    // Simple heuristic: if mood is improving and practice has high completion, positive correlation
    // If mood declining and practice has high completion, negative correlation
    const completionRate = practiceCompletions.length / completionHistory.filter(h => h.practiceId === practice.id).length;

    let correlation: 'positive' | 'negative' | 'neutral' = 'neutral';
    let strength = 0;

    if (sentimentSummary.moodTrend === 'improving' && completionRate >= 0.7) {
      correlation = 'positive';
      strength = completionRate * 0.8; // High completion during improvement
    } else if (sentimentSummary.moodTrend === 'declining' && completionRate >= 0.7) {
      correlation = 'negative';
      strength = 0.5; // Might not be helping
    } else if (sentimentSummary.moodTrend === 'stable' && completionRate >= 0.8) {
      correlation = 'positive';
      strength = 0.6; // Consistent practice during stability
    }

    if (strength > 0.3) {
      correlations.push({
        practice: practice.name,
        correlation,
        strength,
        insight: generateCorrelationInsight(practice.name, correlation, sentimentSummary.moodTrend),
      });
    }
  }

  return correlations.sort((a, b) => b.strength - a.strength).slice(0, 3);
}

/**
 * Generate human-readable insight from correlation
 */
function generateCorrelationInsight(
  practiceName: string,
  correlation: 'positive' | 'negative' | 'neutral',
  moodTrend: 'improving' | 'declining' | 'stable' | 'variable'
): string {
  if (correlation === 'positive' && moodTrend === 'improving') {
    return `${practiceName} appears to support your mood improvement`;
  }
  if (correlation === 'positive' && moodTrend === 'stable') {
    return `${practiceName} helps maintain mood stability`;
  }
  if (correlation === 'negative' && moodTrend === 'declining') {
    return `${practiceName} may not be helping during this difficult period - consider pausing`;
  }
  return `${practiceName} shows neutral correlation with mood`;
}

/**
 * Build mood-aware system prompt enhancement
 */
export function buildMoodAwarePromptEnhancement(
  recommendation: MoodAwareRecommendation
): string {
  const parts: string[] = [];

  parts.push('## MOOD-AWARE GUIDANCE');
  parts.push('');
  parts.push(`User's current mood state: ${recommendation.moodState.toUpperCase()}`);
  parts.push(`Burnout risk: ${recommendation.burnoutRisk.toUpperCase()}`);
  parts.push('');

  // Tone guidance
  if (recommendation.toneAdjustment === 'supportive') {
    parts.push('TONE: Be gentle, supportive, and reassuring. Avoid pushing too hard.');
    parts.push('Emphasize self-compassion and rest. Normalize struggle.');
  } else if (recommendation.toneAdjustment === 'challenging') {
    parts.push('TONE: Be encouraging and challenging. User is thriving and can handle growth edges.');
    parts.push('Suggest ambitious practices and deeper work.');
  } else {
    parts.push('TONE: Balanced and neutral. Standard guidance.');
  }
  parts.push('');

  // Practice intensity
  parts.push(`PRACTICE INTENSITY: ${recommendation.practiceIntensityGuidance.toUpperCase()}`);
  if (recommendation.practiceIntensityGuidance === 'reduce') {
    parts.push('- Suggest removing 2-4 practices from current stack');
    parts.push('- Focus on gentle, restorative practices only');
    parts.push('- Shorter duration practices (5-10 min max)');
  } else if (recommendation.practiceIntensityGuidance === 'increase') {
    parts.push('- Can suggest adding 2-3 challenging practices');
    parts.push('- Longer duration practices acceptable (20-30 min)');
    parts.push('- Edge-work and growth-oriented practices recommended');
  }
  parts.push('');

  // Recommended practice types
  if (recommendation.recommendedPracticeTypes.length > 0) {
    parts.push('RECOMMENDED PRACTICE TYPES:');
    recommendation.recommendedPracticeTypes.forEach(type => {
      parts.push(`- ${type}`);
    });
    parts.push('');
  }

  // Warnings
  if (recommendation.warningsIfAny.length > 0) {
    parts.push('⚠️ IMPORTANT WARNINGS TO INCLUDE IN GUIDANCE:');
    recommendation.warningsIfAny.forEach(warning => {
      parts.push(`- ${warning}`);
    });
    parts.push('');
  }

  // Celebrations
  if (recommendation.celebrationsIfAny.length > 0) {
    parts.push('✨ CELEBRATE WITH USER:');
    recommendation.celebrationsIfAny.forEach(celebration => {
      parts.push(`- ${celebration}`);
    });
    parts.push('');
  }

  // Mood correlations
  if (recommendation.moodCorrelations.length > 0) {
    parts.push('PRACTICE-MOOD CORRELATIONS:');
    recommendation.moodCorrelations.forEach(corr => {
      parts.push(`- ${corr.insight} (${(corr.strength * 100).toFixed(0)}% confidence)`);
    });
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Get burnout prevention recommendations
 */
export function getBurnoutPreventionRecommendations(
  burnoutRisk: BurnoutRisk,
  practiceStack: AllPractice[]
): string[] {
  const recommendations: string[] = [];

  if (burnoutRisk === 'none' || burnoutRisk === 'low') {
    return recommendations;
  }

  if (burnoutRisk === 'medium') {
    recommendations.push('Consider taking 1-2 rest days per week from all practices');
    recommendations.push('Reduce practice stack by 20-30% (remove 2-3 practices)');
    recommendations.push('Focus on practices you genuinely enjoy, not "should" practices');
  }

  if (burnoutRisk === 'high') {
    recommendations.push('URGENT: Reduce practice stack by 40-50% immediately');
    recommendations.push('Take 2-3 full rest days this week with zero practices');
    recommendations.push('Keep only the 3-4 most restorative practices');
    recommendations.push('Consider seeking support from a therapist or coach');
  }

  if (burnoutRisk === 'critical') {
    recommendations.push('CRITICAL: Stop all practices for 1 full week');
    recommendations.push('Focus solely on rest, sleep, gentle movement, and joy');
    recommendations.push('After rest week, resume with max 2-3 gentle practices');
    recommendations.push('Strongly consider professional support - burnout is serious');
  }

  return recommendations;
}
