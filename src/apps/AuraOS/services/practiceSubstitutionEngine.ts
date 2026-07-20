/**
 * Practice Substitution Engine - Smart practice alternatives
 * When user struggles with recommended practices, suggest effective substitutes
 * that target the same pattern/outcome
 */

import type { AllPractice } from '../types';

export interface PracticeSubstitution {
  originalPracticeId: string;
  originalPracticeName: string;
  substitution: AllPractice;
  reasoning: string;
  effectiveness: 'equivalent' | 'partial' | 'experimental';
  whenToUse: string; // Guidance on when to apply substitution
  expectedOutcome: string;
}

export interface SubstitutionCriteria {
  completionRate: number; // 0-1, how often they complete the practice
  difficultyFelt: 'too_easy' | 'appropriate' | 'too_hard';
  timeAvailable: 'very_limited' | 'limited' | 'adequate' | 'abundant';
  preferredModality?: 'static' | 'movement' | 'mental' | 'relational'; // User's preference
}

const SUBSTITUTION_LIBRARY: Record<string, AllPractice[]> = {
  // Meditation alternatives
  'sitting-meditation': [
    {
      id: 'walking-meditation',
      name: 'Walking Meditation',
      description: 'Meditative walking practice to cultivate presence',
      why: 'Combines movement with contemplation for those who struggle with stillness',
      difficulty: 'Low-Medium',
      roi: 'HIGH',
      timePerWeek: 3,
      affectsSystem: ['mind', 'body'],
      how: [],
    } as AllPractice,
    {
      id: 'body-scan',
      name: 'Body Scan',
      description: 'Progressive attention through body sensations',
      why: 'Grounds attention in somatic experience rather than breath alone',
      difficulty: 'Low',
      roi: 'VERY HIGH',
      timePerWeek: 3,
      affectsSystem: ['body', 'mind'],
      how: [],
    } as AllPractice,
    {
      id: 'loving-kindness',
      name: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion through structured phrases',
      why: 'Adds emotional warmth if sitting meditation feels too austere',
      difficulty: 'Low-Medium',
      roi: 'HIGH',
      timePerWeek: 3,
      affectsSystem: ['spirit', 'mind'],
      how: [],
    } as AllPractice,
  ],

  // Journaling alternatives
  'shadow-journaling': [
    {
      id: 'voice-journaling',
      name: 'Voice Journaling',
      description: 'Record reflections verbally instead of writing',
      why: 'Faster and more intuitive for some; bypasses editing mind',
      difficulty: 'Low',
      roi: 'HIGH',
      timePerWeek: 2,
      affectsSystem: ['shadow', 'mind'],
      how: [],
    } as AllPractice,
    {
      id: 'movement-shadowing',
      name: 'Movement Shadowing',
      description: 'Explore shadow patterns through dance/movement',
      why: 'Somatic expression of shadow content for kinesthetic learners',
      difficulty: 'Medium',
      roi: 'HIGH',
      timePerWeek: 2,
      affectsSystem: ['shadow', 'body', 'spirit'],
      how: [],
    } as AllPractice,
  ],

  // Exercise alternatives
  'strength-training': [
    {
      id: 'yoga',
      name: 'Yoga Practice',
      description: 'Combine strength, flexibility, and mindfulness',
      why: 'Builds strength while integrating somatic awareness',
      difficulty: 'Low-Medium',
      roi: 'VERY HIGH',
      timePerWeek: 4,
      affectsSystem: ['body', 'mind', 'spirit'],
      how: [],
    } as AllPractice,
    {
      id: 'martial-arts',
      name: 'Martial Arts',
      description: 'Build power, precision, and body mastery',
      why: 'Develops strength with focus and presence; more engaging for some',
      difficulty: 'Medium',
      roi: 'VERY HIGH',
      timePerWeek: 3,
      affectsSystem: ['body', 'mind'],
      how: [],
    } as AllPractice,
    {
      id: 'rock-climbing',
      name: 'Rock Climbing',
      description: 'Full-body strength with problem-solving engagement',
      why: 'Builds strength through challenge and play',
      difficulty: 'Medium',
      roi: 'HIGH',
      timePerWeek: 2,
      affectsSystem: ['body', 'mind'],
      how: [],
    } as AllPractice,
  ],

  // Breathwork alternatives
  'pranayama': [
    {
      id: 'humming-breath',
      name: 'Humming Breath',
      description: 'Simple breath with vocalization',
      why: 'Easier than complex pranayama; adds vagal tone benefits',
      difficulty: 'Trivial',
      roi: 'HIGH',
      timePerWeek: 5,
      affectsSystem: ['body', 'mind'],
      how: [],
    } as AllPractice,
    {
      id: 'sigh-practice',
      name: 'Physiological Sigh',
      description: 'Double-inhale then long exhale for nervous system reset',
      why: 'Fastest nervous system regulation; 2 minutes effective',
      difficulty: 'Trivial',
      roi: 'EXTREME',
      timePerWeek: 7,
      affectsSystem: ['body', 'mind'],
      how: [],
    } as AllPractice,
  ],
};

/**
 * Suggest substitutions for a practice based on completion challenges
 */
export function suggestPracticeSubstitutions(
  originalPractice: AllPractice,
  criteria: SubstitutionCriteria
): PracticeSubstitution[] {
  const substitutions: PracticeSubstitution[] = [];

  // Only suggest if completion rate is very low or practice is rated too hard
  if (criteria.completionRate > 0.5 && criteria.difficultyFelt !== 'too_hard') {
    return substitutions; // Practice is working fine
  }

  // Look up substitutions for this practice
  const alternatives = SUBSTITUTION_LIBRARY[originalPractice.id] || [];

  // Filter based on user preferences and difficulty feedback
  const suitableAlternatives = alternatives.filter(alt => {
    if (criteria.difficultyFelt === 'too_hard') {
      const altDifficulty = alt.difficulty as string;
      const origDifficulty = originalPractice.difficulty as string;
      // Suggest easier alternatives
      return isDifficultyLower(altDifficulty, origDifficulty);
    }

    if (criteria.timeAvailable === 'very_limited' && alt.timePerWeek > 4) {
      return false; // Skip time-intensive practices
    }

    return true;
  });

  // Build substitution objects
  for (const alt of suitableAlternatives) {
    const effectiveness =
      criteria.completionRate < 0.2 ? 'experimental' :
      criteria.completionRate < 0.4 ? 'partial' :
      'equivalent';

    substitutions.push({
      originalPracticeId: originalPractice.id,
      originalPracticeName: originalPractice.name,
      substitution: alt,
      reasoning: generateSubstitutionReasoning(originalPractice, alt, criteria),
      effectiveness,
      whenToUse: generateWhenToUseGuidance(criteria),
      expectedOutcome: alt.description,
    });
  }

  return substitutions;
}

/**
 * Check if difficulty level is lower
 */
function isDifficultyLower(altDifficulty: string, origDifficulty: string): boolean {
  const difficultyRank: Record<string, number> = {
    'Trivial': 1,
    'Very Low': 2,
    'Low': 3,
    'Low-Medium': 4,
    'Medium': 5,
    'Medium-High': 6,
    'High': 7,
  };

  return (difficultyRank[altDifficulty] || 5) < (difficultyRank[origDifficulty] || 5);
}

/**
 * Generate reasoning for why this substitution makes sense
 */
function generateSubstitutionReasoning(
  original: AllPractice,
  substitute: AllPractice,
  criteria: SubstitutionCriteria
): string {
  const reasons: string[] = [];

  if (criteria.completionRate < 0.3) {
    reasons.push(`Low completion rate suggests "${original.name}" may not match your current capacity`);
  }

  if (criteria.difficultyFelt === 'too_hard') {
    reasons.push(`"${substitute.name}" offers an easier entry point to the same benefits`);
  }

  if (criteria.timeAvailable === 'very_limited') {
    reasons.push(`Requires ${substitute.timePerWeek} times/week vs ${original.timePerWeek} for "${original.name}"`);
  }

  return reasons.join('. ') || `"${substitute.name}" targets the same developmental area differently`;
}

/**
 * Generate guidance on when to apply the substitution
 */
function generateWhenToUseGuidance(criteria: SubstitutionCriteria): string {
  if (criteria.completionRate < 0.2) {
    return 'Immediate: Try substitution right away if original is not working';
  }

  if (criteria.difficultyFelt === 'too_hard') {
    return 'Suggested: Use substitution as primary practice until you feel more capacity';
  }

  if (criteria.timeAvailable === 'very_limited') {
    return 'Consider: Use shorter version if available, or rotate with other practices';
  }

  return 'Optional: Consider if original feels stale or ineffective';
}

/**
 * Analyze completion patterns to identify struggling practices
 */
export function identifyStrugglingPractices(
  completionHistory: Array<{ practiceId: string; date: string | number; completed: boolean }>,
  threshold: number = 0.3 // Below 30% completion = struggling
): Array<{ practiceId: string; completionRate: number; needsSupport: boolean }> {
  const grouped = new Map<string, { completed: number; total: number }>();

  for (const record of completionHistory) {
    const stats = grouped.get(record.practiceId) || { completed: 0, total: 0 };
    if (record.completed) stats.completed++;
    stats.total++;
    grouped.set(record.practiceId, stats);
  }

  const results: Array<{ practiceId: string; completionRate: number; needsSupport: boolean }> = [];

  for (const [practiceId, stats] of grouped) {
    const completionRate = stats.completed / stats.total;
    results.push({
      practiceId,
      completionRate,
      needsSupport: completionRate < threshold,
    });
  }

  return results;
}
