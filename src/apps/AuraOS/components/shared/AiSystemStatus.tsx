/**
 * AI System Status Indicator
 * Minimal, non-intrusive badge showing if AI is behaving normally
 * Helps users understand when tokenization anomalies may affect responses
 */

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { calculateResilienceMetrics } from '../../.claude/lib/intelligenceHubMetrics';

interface AiSystemStatusProps {
  compact?: boolean; // true = just badge, false = badge + explanation
}

export function AiSystemStatus({ compact = true }: AiSystemStatusProps) {
  const metrics = calculateResilienceMetrics();

  // No anomalies = no message needed
  if (metrics.totalEncounters === 0) {
    return null;
  }

  const isHealthy = metrics.riskLevel === 'safe';
  const icon = isHealthy ? (
    <CheckCircle size={14} className="text-green-400" />
  ) : (
    <AlertCircle size={14} className="text-yellow-400" />
  );

  const badge = (
    <div
      className={`inline-flex items-center gap-2 text-xs font-mono px-2 py-1 rounded border ${
        isHealthy
          ? 'bg-green-900/30 border-green-500/30 text-green-200'
          : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-200'
      }`}
    >
      {icon}
      <span>{isHealthy ? 'AI Operating Normally' : 'Minor Anomalies Detected'}</span>
    </div>
  );

  if (compact) {
    return badge;
  }

  // Expanded version with explanation
  return (
    <div className="space-y-2">
      {badge}
      {!isHealthy && (
        <p className="text-xs text-slate-400 italic">
          Some responses may contain tokenization quirks. This is normal and doesn't mean the system is broken.
        </p>
      )}
    </div>
  );
}
