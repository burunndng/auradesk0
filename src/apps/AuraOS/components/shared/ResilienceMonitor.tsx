/**
 * Resilience Monitor Card
 * Displays AI health metrics and anomaly summary for Intelligence Hub
 * Shows when glitch tokens are affecting system performance
 */

import React from 'react';
import { AlertCircle, TrendingUp, Database, Zap } from 'lucide-react';
import {
  calculateResilienceMetrics,
  getHealthPercentage,
  getTopAnomalousTokens,
  getResilienceSummary
} from '../../.claude/lib/intelligenceHubMetrics';

interface ResilienceMonitorProps {
  onOpenMirage?: () => void;
}

export function ResilienceMonitor({ onOpenMirage }: ResilienceMonitorProps) {
  const metrics = calculateResilienceMetrics();
  const healthPercentage = getHealthPercentage();
  const topTokens = getTopAnomalousTokens(3);

  if (metrics.totalEncounters === 0) {
    return (
      <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm font-bold text-green-200 flex items-center gap-2">
            <Zap size={16} />
            AI RESILIENCE: NOMINAL
          </h3>
          <span className="text-xs font-mono px-2 py-1 rounded bg-green-900/50 text-green-200">
            100% HEALTHY
          </span>
        </div>
        <p className="text-xs text-slate-400">
          No anomalies detected this session. System operating normally.
        </p>
      </div>
    );
  }

  const healthColor =
    healthPercentage > 80
      ? 'from-green-500 to-green-600'
      : healthPercentage > 50
        ? 'from-yellow-500 to-yellow-600'
        : 'from-red-500 to-red-600';

  const riskColor =
    metrics.riskLevel === 'safe'
      ? 'bg-green-900/50 text-green-200'
      : metrics.riskLevel === 'warning'
        ? 'bg-yellow-900/50 text-yellow-200'
        : 'bg-red-900/50 text-red-200';

  const riskIcon =
    metrics.riskLevel === 'safe'
      ? '✅'
      : metrics.riskLevel === 'warning'
        ? '⚠️'
        : '🔴';

  return (
    <div className="bg-slate-800/50 border border-teal-500/30 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold text-teal-200 flex items-center gap-2">
          <Database size={16} />
          AI RESILIENCE MONITOR
        </h3>
        <span className={`text-xs font-mono px-2 py-1 rounded ${riskColor}`}>
          {riskIcon} {metrics.riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Health Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Response Quality</span>
          <span className="font-mono font-bold">{healthPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600">
          <div
            className={`h-full transition-all duration-500 bg-gradient-to-r ${healthColor}`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-700/30 rounded p-3 border border-slate-600/50">
          <div className="text-slate-400 text-xs">Analyzed</div>
          <div className="font-bold text-teal-200 text-sm">{metrics.totalEncounters}</div>
        </div>

        <div className="bg-slate-700/30 rounded p-3 border border-slate-600/50">
          <div className="text-slate-400 text-xs">Anomalies</div>
          <div className="font-bold text-yellow-200 text-sm">
            {metrics.dangerousEncounters + metrics.warningEncounters}
          </div>
        </div>

        <div className="bg-slate-700/30 rounded p-3 border border-slate-600/50">
          <div className="text-slate-400 text-xs">Unique Tokens</div>
          <div className="font-bold text-slate-200 text-sm">{metrics.glitchTokenFrequency.size}</div>
        </div>
      </div>

      {/* Most Common Tokens */}
      {topTokens.length > 0 && (
        <div className="pt-4 border-t border-slate-600">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            <AlertCircle size={12} />
            Most Common Anomalies
          </div>
          <div className="space-y-2">
            {topTokens.map(({ token, count }) => (
              <div key={token} className="flex justify-between items-center text-xs bg-slate-700/20 rounded px-3 py-2">
                <code className="text-amber-300 font-mono text-xs">{token}</code>
                <span className="text-slate-400 text-xs">{count} encounter{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Message */}
      {metrics.riskLevel !== 'safe' && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 text-xs text-yellow-200">
          <p>
            Some responses may contain tokenization anomalies. This is normal and doesn't mean the system is broken.
            Learn more by exploring the <strong>Tokenization Researcher (MIRAGE)</strong>.
          </p>
        </div>
      )}

      {/* Learn Button */}
      <button
        onClick={onOpenMirage}
        className="w-full mt-4 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/50 rounded px-3 py-2 text-xs text-teal-300 transition-colors font-mono font-bold"
      >
        Explore in MIRAGE Tokenization Researcher →
      </button>

      {/* Info Footer */}
      <div className="text-xs text-slate-500 italic pt-2 border-t border-slate-700">
        Last anomaly: {metrics.lastAnomalyTime ? new Date(metrics.lastAnomalyTime).toLocaleTimeString() : 'none'}
      </div>
    </div>
  );
}
