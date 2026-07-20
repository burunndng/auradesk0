/**
 * Intelligence Hub Metrics
 * Calculate AI resilience and health metrics from glitch token encounters
 */

import { getGlitchEncounters, GlitchEncounter } from './promptSafetyValidator';

export interface ResilienceMetrics {
  totalEncounters: number;
  dangerousEncounters: number;
  warningEncounters: number;
  glitchTokenFrequency: Map<string, number>;
  avgCoachResponseQuality: number; // 0-1 scale
  riskLevel: 'safe' | 'warning' | 'danger';
  recentTokens: string[];
  lastAnomalyTime?: string;
}

/**
 * Calculate comprehensive resilience metrics
 */
export function calculateResilienceMetrics(): ResilienceMetrics {
  const encounters = getGlitchEncounters();

  if (encounters.length === 0) {
    return {
      totalEncounters: 0,
      dangerousEncounters: 0,
      warningEncounters: 0,
      glitchTokenFrequency: new Map(),
      avgCoachResponseQuality: 1.0,
      riskLevel: 'safe',
      recentTokens: []
    };
  }

  const tokenFreq = new Map<string, number>();
  let dangerCount = 0;
  let warningCount = 0;
  let qualitySum = 0;
  const recentTokenSet = new Set<string>();

  // Process encounters (most recent first for priority)
  const sortedEncounters = [...encounters].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  sortedEncounters.forEach((enc, idx) => {
    if (enc.riskLevel === 'danger') {
      dangerCount++;
    } else if (enc.riskLevel === 'warning') {
      warningCount++;
    }

    enc.detections.forEach((det) => {
      tokenFreq.set(det.token, (tokenFreq.get(det.token) || 0) + 1);
      // Track recent tokens (last 5 encounters)
      if (idx < 5) {
        recentTokenSet.add(det.token);
      }
    });

    // Quality proxy: inverse of detection severity
    const severeTokenCount = enc.detections.filter((d) =>
      ['CONTEXT_CORRUPTOR', 'LOOP_INDUCER', 'IDENTITY_DISRUPTOR'].includes(d.behavior)
    ).length;
    qualitySum += 1 - (severeTokenCount / Math.max(5, enc.detections.length || 1));
  });

  const avgQuality = encounters.length > 0 ? qualitySum / encounters.length : 1.0;

  // Determine risk level
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  if (dangerCount > 0) {
    riskLevel = 'danger';
  } else if (warningCount > 0 || encounters.length > 5) {
    riskLevel = 'warning';
  }

  return {
    totalEncounters: encounters.length,
    dangerousEncounters: dangerCount,
    warningEncounters: warningCount,
    glitchTokenFrequency: tokenFreq,
    avgCoachResponseQuality: avgQuality,
    riskLevel,
    recentTokens: Array.from(recentTokenSet).slice(0, 5),
    lastAnomalyTime: sortedEncounters[0]?.timestamp
  };
}

/**
 * Get health percentage (0-100)
 */
export function getHealthPercentage(): number {
  const metrics = calculateResilienceMetrics();
  return Math.round(metrics.avgCoachResponseQuality * 100);
}

/**
 * Get top anomalous tokens
 */
export function getTopAnomalousTokens(limit: number = 3): Array<{ token: string; count: number }> {
  const metrics = calculateResilienceMetrics();
  return Array.from(metrics.glitchTokenFrequency.entries())
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get summary text for display
 */
export function getResilienceSummary(): string {
  const metrics = calculateResilienceMetrics();
  const health = getHealthPercentage();

  if (metrics.totalEncounters === 0) {
    return 'No anomalies detected. System running smoothly.';
  }

  const topTokens = getTopAnomalousTokens(2)
    .map((t) => `"${t.token}" (${t.count}x)`)
    .join(', ');

  const statusEmoji = metrics.riskLevel === 'safe' ? '✅' :
                      metrics.riskLevel === 'warning' ? '⚠️' :
                      '🔴';

  return `${statusEmoji} ${health}% healthy. Analyzed ${metrics.totalEncounters} response(s). Common: ${topTokens}`;
}

/**
 * Check if system is healthy enough for critical operations
 */
export function isSystemHealthy(threshold: number = 0.7): boolean {
  const metrics = calculateResilienceMetrics();
  return metrics.avgCoachResponseQuality >= threshold && metrics.dangerousEncounters === 0;
}
