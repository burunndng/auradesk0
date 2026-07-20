/**
 * Wizard Resilience Analysis
 * Analyzes which wizards are most/least affected by glitch tokens
 * Provides health scores for each wizard type
 */

import { getGlitchEncounters } from './promptSafetyValidator';

export interface WizardHealth {
  wizardType: string;
  displayName: string;
  totalRuns: number;
  anomalousRuns: number;
  healthScore: number; // 0-100
  riskLevel: 'safe' | 'warning' | 'danger';
  commonIssues: string[];
  anomalyRate: number; // percentage
}

/**
 * Map of wizard internal names to display names
 */
const WIZARD_DISPLAY_NAMES: Record<string, string> = {
  '321-process': '3-2-1 Process',
  'ifs': 'Internal Family Systems',
  'memory-recon': 'Memory Reconsolidation',
  'kegan': 'Kegan Assessment',
  'eight-zones': '8 Zones',
  'bias-detective': 'Bias Detective',
  'bias-finder': 'Bias Finder',
  'subject-object': 'Subject-Object',
  'perspective-shifter': 'Perspective Shifter',
  'polarity-mapper': 'Polarity Mapper',
  'big-mind': 'Big Mind',
  'body-architect': 'Body Architect',
  'bioenergetics': 'Bioenergetics',
  'workout-architect': 'Workout Architect',
  'somatic-generator': 'Somatic Generator',
  'jhana-tracker': 'Jhana Tracker',
  'attachment-assessment': 'Attachment Assessment',
  'relational-pattern': 'Relational Pattern Chatbot',
  'role-alignment': 'Role Alignment',
  'immunity-to-change': 'Immunity to Change',
  'adaptive-cycle': 'Adaptive Cycle'
};

/**
 * List of known wizards for analysis
 */
const KNOWN_WIZARDS = Object.keys(WIZARD_DISPLAY_NAMES);

/**
 * Analyze resilience for a specific wizard type
 */
export function analyzeWizardResilience(wizardType: string): WizardHealth {
  const encounters = getGlitchEncounters();

  // Filter encounters for this wizard
  const wizardEncounters = encounters.filter((enc) =>
    enc.context?.toLowerCase().includes(wizardType.toLowerCase()) ||
    enc.context?.toLowerCase().includes(WIZARD_DISPLAY_NAMES[wizardType]?.toLowerCase() || '')
  );

  if (wizardEncounters.length === 0) {
    return {
      wizardType,
      displayName: WIZARD_DISPLAY_NAMES[wizardType] || wizardType,
      totalRuns: 0,
      anomalousRuns: 0,
      healthScore: 100,
      riskLevel: 'safe',
      commonIssues: [],
      anomalyRate: 0
    };
  }

  const anomalousCount = wizardEncounters.filter((enc) => enc.riskLevel !== 'safe').length;

  // Find most common token issues
  const issueMap = new Map<string, number>();
  wizardEncounters.forEach((enc) => {
    enc.detections.forEach((det) => {
      issueMap.set(det.token, (issueMap.get(det.token) || 0) + 1);
    });
  });

  const commonIssues = Array.from(issueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([token]) => token);

  const healthScore = Math.round(((wizardEncounters.length - anomalousCount) / wizardEncounters.length) * 100);
  const anomalyRate = Math.round((anomalousCount / wizardEncounters.length) * 100);

  // Determine risk level
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  if (anomalyRate > 30) {
    riskLevel = 'danger';
  } else if (anomalyRate > 10) {
    riskLevel = 'warning';
  }

  return {
    wizardType,
    displayName: WIZARD_DISPLAY_NAMES[wizardType] || wizardType,
    totalRuns: wizardEncounters.length,
    anomalousRuns: anomalousCount,
    healthScore,
    riskLevel,
    commonIssues,
    anomalyRate
  };
}

/**
 * Get health scores for all wizards
 * Sorted by healthiness (safest first)
 */
export function getAllWizardHealth(): WizardHealth[] {
  return KNOWN_WIZARDS.map((wt) => analyzeWizardResilience(wt))
    .sort((a, b) => {
      // Prioritize by: has data > health score > alphabetical
      const aHasData = a.totalRuns > 0;
      const bHasData = b.totalRuns > 0;

      if (aHasData && !bHasData) return -1;
      if (!aHasData && bHasData) return 1;
      if (!aHasData && !bHasData) {
        return a.displayName.localeCompare(b.displayName);
      }

      return b.healthScore - a.healthScore;
    });
}

/**
 * Get wizards ranked by riskiness (most problematic first)
 */
export function getProblematicWizards(): WizardHealth[] {
  return getAllWizardHealth()
    .filter((w) => w.totalRuns > 0)
    .sort((a, b) => {
      // Rank by danger, then by anomaly rate
      if (a.riskLevel === 'danger' && b.riskLevel !== 'danger') return -1;
      if (a.riskLevel !== 'danger' && b.riskLevel === 'danger') return 1;
      return b.anomalyRate - a.anomalyRate;
    });
}

/**
 * Get health summary for a wizard
 * Returns formatted string for display
 */
export function getWizardHealthSummary(wizardType: string): string {
  const health = analyzeWizardResilience(wizardType);

  if (health.totalRuns === 0) {
    return 'No usage data yet. All systems nominal.';
  }

  const statusEmoji = health.riskLevel === 'safe' ? '✅' :
                      health.riskLevel === 'warning' ? '⚠️' :
                      '🔴';

  return `${statusEmoji} ${health.healthScore}% healthy (${health.totalRuns} runs, ${health.anomalyRate}% anomaly rate)`;
}

/**
 * Get color for health score (for UI display)
 */
export function getHealthColor(healthScore: number): string {
  if (healthScore >= 80) return 'text-green-400';
  if (healthScore >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get background color for health badge
 */
export function getHealthBgColor(healthScore: number): string {
  if (healthScore >= 80) return 'bg-green-900/30 border-green-500/30';
  if (healthScore >= 50) return 'bg-yellow-900/30 border-yellow-500/30';
  return 'bg-red-900/30 border-red-500/30';
}
