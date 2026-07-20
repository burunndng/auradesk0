import React, { useState, useEffect } from 'react';
import {
  fetchAppStats,
  fetchWizardBreakdown,
  fetchActivityTimeline,
  type WizardBreakdownRow,
  type ActivityTimelinePoint,
} from '../../../services/adminService';

interface Stats {
  totalUsers: number;
  newUsersLast7d: number;
  newUsersLast30d: number;
  totalSessions: number;
  totalInsights: number;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 space-y-1">
      <p className="text-stone-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-semibold ${accent || 'text-stone-100'} font-mono`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ActivityChart({ data }: { data: ActivityTimelinePoint[] }) {
  if (!data.length) return null;
  const maxSessions = Math.max(...data.map(d => d.sessions), 1);

  return (
    <div className="space-y-2">
      <h3 className="text-stone-300 text-sm font-medium">Session Activity (30 days)</h3>
      <div className="flex items-end gap-[2px] h-24 bg-stone-900/30 rounded-xl border border-stone-800/40 p-3">
        {data.map((point) => {
          const height = (point.sessions / maxSessions) * 100;
          return (
            <div
              key={point.date}
              className="flex-1 group relative"
              title={`${point.date}: ${point.sessions} session${point.sessions !== 1 ? 's' : ''}`}
            >
              <div
                className="w-full bg-amber-500/60 hover:bg-amber-400/80 rounded-t-sm transition-colors cursor-default"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-stone-600 text-xs px-1">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function WizardBreakdown({ data }: { data: WizardBreakdownRow[] }) {
  if (!data.length) return null;
  const maxCount = data[0]?.count || 1;

  return (
    <div className="space-y-2">
      <h3 className="text-stone-300 text-sm font-medium">Sessions by Wizard</h3>
      <div className="space-y-1">
        {data.slice(0, 15).map((row) => (
          <div key={row.wizard_type} className="flex items-center gap-3 px-2 py-1">
            <span className="text-stone-400 text-xs w-36 truncate flex-shrink-0">{row.wizard_type}</span>
            <div className="flex-1 h-2 bg-stone-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500/50 rounded-full"
                style={{ width: `${(row.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-stone-500 text-xs font-mono w-8 text-right">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [breakdown, setBreakdown] = useState<WizardBreakdownRow[]>([]);
  const [timeline, setTimeline] = useState<ActivityTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAppStats(),
      fetchWizardBreakdown(),
      fetchActivityTimeline(30),
    ]).then(([s, b, t]) => {
      setStats(s);
      setBreakdown(b);
      setTimeline(t);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Users" value={stats.totalUsers} accent="text-stone-100" />
        <StatCard label="New (7d)" value={stats.newUsersLast7d} accent="text-emerald-400" />
        <StatCard label="New (30d)" value={stats.newUsersLast30d} accent="text-teal-400" />
        <StatCard label="Sessions" value={stats.totalSessions} accent="text-amber-400" />
        <StatCard label="Insights" value={stats.totalInsights} accent="text-purple-400" />
      </div>

      {/* Activity timeline */}
      <ActivityChart data={timeline} />

      {/* Wizard breakdown */}
      <WizardBreakdown data={breakdown} />
    </div>
  );
}
