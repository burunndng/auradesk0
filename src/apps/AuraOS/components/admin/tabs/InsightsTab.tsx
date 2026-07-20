import React, { useState, useEffect } from 'react';
import { fetchGlobalInsights, type GlobalInsightRow } from '../../../services/adminService';

const wizardColor = (type: string): string => {
  const lower = type.toLowerCase();
  if (['ifs', 'shadow', '3-2-1', 'golden', 'psychedelic', 'memory', 'relational', 'big mind', 'cultural'].some(k => lower.includes(k)))
    return 'text-purple-400';
  if (['body', 'somatic', 'bioenergetics', 'interoception', 'jhana', 'meditation', 'workout', 'polyvagal', 'chronobiology'].some(k => lower.includes(k)))
    return 'text-emerald-400';
  if (['states', 'contemplative', 'tree of life', 'ultimate', 'role alignment', 'advaita', 'sexology'].some(k => lower.includes(k)))
    return 'text-teal-400';
  return 'text-amber-400'; // Mind default
};

const confidenceBadge = (score: number | null) => {
  if (score === null || score === undefined) return null;
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-stone-500';
  return <span className={`${color} font-mono`}>{pct}%</span>;
};

export default function InsightsTab() {
  const [insights, setInsights] = useState<GlobalInsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchGlobalInsights(50).then((rows) => { setInsights(rows); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Count by wizard type
  const typeCounts = new Map<string, number>();
  for (const ins of insights) {
    const t = ins.mind_tool_type || 'Unknown';
    typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
  }
  const sortedTypes = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedTypes.length ? sortedTypes[0][1] : 1;

  const filtered = filterType
    ? insights.filter(i => i.mind_tool_type === filterType)
    : insights;

  return (
    <div className="space-y-6">
      {/* Wizard type distribution */}
      <div>
        <h3 className="text-stone-300 text-sm font-medium mb-3">Insights by Wizard Type</h3>
        <div className="space-y-1.5">
          {sortedTypes.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? '' : type)}
              className={`w-full flex items-center gap-3 group transition-colors rounded-lg px-3 py-1.5 ${
                filterType === type ? 'bg-stone-800/60' : 'hover:bg-stone-900/40'
              }`}
            >
              <span className={`text-xs truncate flex-1 text-left ${wizardColor(type)}`}>{type}</span>
              <div className="flex-1 h-1.5 bg-stone-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500/50 rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-stone-500 text-xs font-mono w-6 text-right">{count}</span>
            </button>
          ))}
        </div>
        {sortedTypes.length === 0 && (
          <p className="text-stone-500 text-sm text-center py-4">No insights in database.</p>
        )}
      </div>

      {/* Filter indicator */}
      {filterType && (
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-xs">Filtered:</span>
          <span className={`text-xs ${wizardColor(filterType)}`}>{filterType}</span>
          <button onClick={() => setFilterType('')} className="text-stone-500 hover:text-stone-300 text-xs">✕ Clear</button>
        </div>
      )}

      {/* Recent insights feed */}
      <div>
        <h3 className="text-stone-300 text-sm font-medium mb-3">
          Recent Insights {filterType && <span className="text-stone-500 font-normal">({filtered.length})</span>}
        </h3>
        <div className="space-y-2">
          {filtered.map((ins) => (
            <div key={ins.id} className="bg-stone-900/40 border border-stone-800/40 rounded-xl px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${wizardColor(ins.mind_tool_type)}`}>
                  {ins.mind_tool_type || 'Unknown'}
                </span>
                <div className="flex items-center gap-3">
                  {confidenceBadge(ins.confidence_score)}
                  <span className="text-stone-600 text-xs">
                    {new Date(ins.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {ins.detected_pattern && (
                <p className="text-stone-300 text-sm leading-relaxed">
                  {ins.detected_pattern}
                </p>
              )}
              <p className="text-stone-600 text-xs font-mono">{ins.user_id.slice(0, 8)}…</p>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-stone-500 text-sm text-center py-4">
            {filterType ? 'No insights for this wizard type.' : 'No insights found.'}
          </p>
        )}
      </div>
    </div>
  );
}
