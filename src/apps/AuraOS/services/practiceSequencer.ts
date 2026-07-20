/**
 * Practice Sequencer - Phase-based practice sequencing
 * Foundation → Core → Integration framework
 *
 * Week 1-2: Foundation (build capacity, grounding)
 * Week 3-6: Core (address primary patterns)
 * Week 7-8: Integration (consolidate gains)
 */

import type { AllPractice, IntegratedInsight } from '../types';

export interface SequencedPractice {
  practice: AllPractice;
  phase: 'foundation' | 'core' | 'integration';
  weeks: string;
  reasoning: string;
  expectedOutcome: string;
  difficulty: string;
  sequenceOrder: number;
}

export interface PracticeSequence {
  practices: SequencedPractice[];
  phases: {
    foundation: SequencedPractice[];
    core: SequencedPractice[];
    integration: SequencedPractice[];
  };
  totalWeeks: number;
  progressionLogic: string;
}

/**
 * Generate phased practice sequence based on detected patterns
 */
export function generatePracticeSequence(
  detectedPatterns: string[],
  currentPractices: AllPractice[],
  recommendedPractices: AllPractice[]
): PracticeSequence {
  const sequence: SequencedPractice[] = [];

  // Phase 1: Foundation (weeks 1-2)
  // Select practices that build capacity and grounding
  const foundationPractices = filterPracticesByPhase(recommendedPractices, 'foundation', currentPractices);
  const foundationSequenced = foundationPractices.map((p, idx) => ({
    practice: p,
    phase: 'foundation' as const,
    weeks: '1-2',
    reasoning: 'Build foundational capacity and stability before deeper pattern work',
    expectedOutcome: 'Increased baseline stability and readiness for intensive practice',
    difficulty: extractDifficulty(p),
    sequenceOrder: idx + 1,
  }));

  // Phase 2: Core (weeks 3-6)
  // Practices that directly address the primary patterns
  const corePractices = filterPracticesByPhase(recommendedPractices, 'core', currentPractices);
  const coreSequenced = corePractices.map((p, idx) => ({
    practice: p,
    phase: 'core' as const,
    weeks: '3-6',
    reasoning: `Address primary detected pattern: "${detectedPatterns[0] || 'developmental edge'}"`,
    expectedOutcome: 'Direct engagement with core transformation edge',
    difficulty: extractDifficulty(p),
    sequenceOrder: foundationSequenced.length + idx + 1,
  }));

  // Phase 3: Integration (weeks 7-8)
  // Practices that consolidate and integrate new capacities
  const integrationPractices = filterPracticesByPhase(recommendedPractices, 'integration', currentPractices);
  const integrationSequenced = integrationPractices.map((p, idx) => ({
    practice: p,
    phase: 'integration' as const,
    weeks: '7-8',
    reasoning: 'Consolidate insights and integrate new capacities across body-mind-spirit',
    expectedOutcome: 'Stabilized transformation, new patterns becoming embodied',
    difficulty: extractDifficulty(p),
    sequenceOrder: foundationSequenced.length + coreSequenced.length + idx + 1,
  }));

  sequence.push(...foundationSequenced, ...coreSequenced, ...integrationSequenced);

  return {
    practices: sequence,
    phases: {
      foundation: foundationSequenced,
      core: coreSequenced,
      integration: integrationSequenced,
    },
    totalWeeks: 8,
    progressionLogic: 'Sequential phases: Foundation stability → Core transformation → Integration consolidation',
  };
}

/**
 * Calculate practice priority based on pattern alignment and current stack
 */
export function calculatePracticePriority(
  practice: AllPractice,
  detectedPatterns: string[],
  currentStack: AllPractice[]
): {
  priority: 'high' | 'medium' | 'low';
  alignment: number; // 0-1
  reasoning: string;
} {
  let alignment = 0;
  const reasons: string[] = [];

  // Check if practice is already in current stack
  const isInStack = currentStack.some(p => p.id === practice.id);
  if (isInStack) {
    return {
      priority: 'low',
      alignment: 0,
      reasoning: 'Practice already in current stack',
    };
  }

  // Higher alignment if practice name/description matches detected pattern
  const practiceText = `${practice.name} ${practice.description}`.toLowerCase();
  const matchedPatterns = detectedPatterns.filter(p =>
    practiceText.includes(p.toLowerCase())
  );

  if (matchedPatterns.length > 0) {
    alignment += 0.5 + (matchedPatterns.length * 0.1);
    reasons.push(`Matches ${matchedPatterns.length} detected pattern(s)`);
  }

  // Check ROI level
  if (practice.roi === 'EXTREME' || practice.roi === 'VERY HIGH') {
    alignment += 0.2;
    reasons.push('High ROI practice');
  }

  // Determine priority based on alignment
  const finalPriority: 'high' | 'medium' | 'low' =
    alignment >= 0.6 ? 'high' :
    alignment >= 0.3 ? 'medium' :
    'low';

  return {
    priority: finalPriority,
    alignment: Math.min(1, alignment),
    reasoning: reasons.join('; ') || 'Moderate relevance to current patterns',
  };
}

/**
 * Determine which phase a practice belongs to
 */
export function determinePracticePhase(practice: AllPractice): 'foundation' | 'core' | 'integration' {
  // Check difficulty level
  const difficulty = extractDifficulty(practice);

  const foundationDifficulties = ['Trivial', 'Very Low', 'Low'];
  const integrationDifficulties = ['High', 'Medium-High'];

  if (foundationDifficulties.includes(difficulty)) {
    return 'foundation';
  }
  if (integrationDifficulties.includes(difficulty)) {
    return 'integration';
  }
  return 'core';
}

/**
 * Filter practices by phase, removing those already in current stack
 */
function filterPracticesByPhase(
  practices: AllPractice[],
  phase: 'foundation' | 'core' | 'integration',
  currentStack: AllPractice[]
): AllPractice[] {
  const currentStackIds = new Set(currentStack.map(p => p.id));

  return practices
    .filter(p => !currentStackIds.has(p.id)) // Remove already-practiced
    .filter(p => determinePracticePhase(p) === phase)
    .slice(0, phase === 'foundation' ? 2 : phase === 'core' ? 3 : 1);
}

/**
 * Extract difficulty string from practice
 */
function extractDifficulty(practice: AllPractice): string {
  return (practice as any).difficulty || 'Medium';
}

/**
 * Generate plain-English sequencing guidance
 */
export function generateSequencingGuidance(sequence: PracticeSequence): string {
  const foundationCount = sequence.phases.foundation.length;
  const coreCount = sequence.phases.core.length;
  const integrationCount = sequence.phases.integration.length;

  return `
Over 8 weeks, you'll move through three phases:

**Foundation (Weeks 1-2):** Start with ${foundationCount} grounding practice(ies) to build stability. These create the capacity for deeper work.

**Core (Weeks 3-6):** Introduce ${coreCount} core practice(ies) targeting your primary patterns. This is where transformation happens.

**Integration (Weeks 7-8):** Practice ${integrationCount} integration exercise(s) to consolidate gains and embody new capacities.

Begin Foundation practices immediately. Complete at least 3-4 sessions before moving to Core. Let each phase stabilize before advancing.
  `.trim();
}
