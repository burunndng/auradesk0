/**
 * Print Report Service
 *
 * Handles data redaction and text report generation for the Print Report tab.
 * Removes PII before sending to LLM.
 */

/**
 * Redact exported localStorage data to remove PII
 * Returns a plain text summary safe to send to LLM
 */
export function redactAndSummarizeData(exportedData: Record<string, any>): string {
  const lines: string[] = [];

  lines.push('=== AURA OS DATA EXPORT SUMMARY ===');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('NOTE: This data has been redacted of personal identifiers.\n');

  // Practice Stack
  const practiceStack = exportedData['practiceStack'];
  if (practiceStack && Array.isArray(practiceStack)) {
    lines.push(`PRACTICE STACK: ${practiceStack.length} practices`);
    practiceStack.forEach((p: any) => {
      lines.push(`  - ${p.name || 'Unknown'} (${p.module || 'unknown'})`);
    });
    lines.push('');
  }

  // Practice Notes
  const practiceNotes = exportedData['practiceNotes'];
  if (practiceNotes && typeof practiceNotes === 'object') {
    const noteCount = Object.keys(practiceNotes).length;
    if (noteCount > 0) {
      lines.push(`PRACTICE NOTES: ${noteCount} notes`);
      lines.push('');
    }
  }

  // Completion History
  const completionHistory = exportedData['completionHistory'];
  if (completionHistory && typeof completionHistory === 'object') {
    const totalCompletions = Object.values(completionHistory).reduce((sum: number, dates: any) => {
      return sum + (Array.isArray(dates) ? dates.length : 0);
    }, 0);
    lines.push(`COMPLETION HISTORY: ${totalCompletions} total completions`);
    lines.push('');
  }

  // Session Histories (count only, no details)
  const sessionHistories = [
    'history321',
    'historyIFS',
    'historyBias',
    'historyBiasFinder',
    'historySO',
    'historyPS',
    'historyPM',
    'historyKegan',
    'historyRoleAlignment',
    'historyJhana',
    'memoryReconHistory',
    'eightZonesHistory',
    'adaptiveCycleHistory',
    'somaticPracticeHistory',
    'historyAttachment',
    'historyBigMind',
    'shadowSessions',
    'schemaDetectiveSessions',
  ];

  lines.push('WIZARD SESSION COUNTS:');
  sessionHistories.forEach(key => {
    const sessions = exportedData[key];
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      const wizardName = key.replace('history', '').replace('Sessions', '').toUpperCase();
      lines.push(`  - ${wizardName}: ${sessions.length} session(s)`);
    }
  });
  lines.push('');

  // Integrated Insights
  const integratedInsights = exportedData['integratedInsights'];
  if (integratedInsights && Array.isArray(integratedInsights)) {
    lines.push(`INTEGRATED INSIGHTS: ${integratedInsights.length} insights`);
    lines.push('');
  }

  // Plans
  const integralBodyPlans = exportedData['integralBodyPlans'];
  if (integralBodyPlans && Array.isArray(integralBodyPlans)) {
    lines.push(`INTEGRAL BODY PLANS: ${integralBodyPlans.length} plan(s)`);
    lines.push('');
  }

  // Workout Programs
  const workoutPrograms = exportedData['workoutPrograms'];
  if (workoutPrograms && Array.isArray(workoutPrograms)) {
    lines.push(`WORKOUT PROGRAMS: ${workoutPrograms.length} program(s)`);
    lines.push('');
  }

  // Intelligence Hub Cache
  const hubCache = exportedData['aura-hub-cache'];
  if (hubCache) {
    lines.push('INTELLIGENCE HUB: Cached guidance available');
    lines.push('');
  }

  // AQAL Report
  const aqalReport = exportedData['aqalReport'];
  if (aqalReport) {
    lines.push('AQAL REPORT: Generated');
    lines.push('');
  }

  lines.push('=== END SUMMARY ===');

  return lines.join('\n');
}
