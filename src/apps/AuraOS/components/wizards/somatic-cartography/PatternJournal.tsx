/**
 * Somatic Cartography — PatternJournal
 * Longitudinal view: heat map + top zones + word frequency + context co-occurrence + timeline.
 */

import React, { useState, useMemo } from 'react';
import type { BodyMapHistoryEntry, ZoneStats, WordFrequencyItem } from './types';
import { ZONE_LABELS, type SomaticBodyZone } from './constants';
import BodyMapHeatMap from './BodyMapHeatMap';

interface PatternJournalProps {
  history: BodyMapHistoryEntry[];
  onBack: () => void;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'is', 'was', 'it', 'i', 'my', 'me', 'that', 'this',
  'some', 'feel', 'feeling', 'felt', 'have', 'had', 'been', 'just',
  'like', 'very', 'more', 'bit', 'little', 'lot', 'also', 'when',
  'not', 'no', 'yes', 'still', 'bit', 'today', 'day', 'time',
]);

function wordFrequency(entries: BodyMapHistoryEntry[]): WordFrequencyItem[] {
  const freq: Record<string, number> = {};
  entries.forEach((e) => {
    if (!e.freeText) return;
    e.freeText
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
      .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));
}

function computeZoneStats(entries: BodyMapHistoryEntry[]): ZoneStats[] {
  const zoneData: Record<string, { count: number; totalIntensity: number; qualities: string[]; contextTags: string[] }> = {};
  entries.forEach((e) => {
    e.marks.forEach((m) => {
      if (!zoneData[m.zone]) {
        zoneData[m.zone] = { count: 0, totalIntensity: 0, qualities: [], contextTags: [] };
      }
      zoneData[m.zone].count++;
      zoneData[m.zone].totalIntensity += m.intensity;
      zoneData[m.zone].qualities.push(...m.qualities);
      zoneData[m.zone].contextTags.push(...e.contextTags);
    });
  });

  return Object.entries(zoneData)
    .map(([zone, data]) => {
      const qualityFreq: Record<string, number> = {};
      data.qualities.forEach((q) => { qualityFreq[q] = (qualityFreq[q] || 0) + 1; });
      const contextFreq: Record<string, number> = {};
      data.contextTags.forEach((t) => { contextFreq[t] = (contextFreq[t] || 0) + 1; });

      return {
        zone,
        label: ZONE_LABELS[zone as SomaticBodyZone] ?? zone.replace(/_/g, ' '),
        count: data.count,
        avgIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
        commonQualities: Object.entries(qualityFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([q]) => q),
        commonContextTags: Object.entries(contextFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
      };
    })
    .sort((a, b) => b.count - a.count);
}

function filterByRange(history: BodyMapHistoryEntry[], range: DateRange): BodyMapHistoryEntry[] {
  if (range === 'all') return history;
  const msMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const days = msMap[range];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return history.filter((e) => new Date(e.completedAt).getTime() >= cutoff);
}

export default function PatternJournal({ history, onBack }: PatternJournalProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const filtered = useMemo(() => filterByRange(history, dateRange), [history, dateRange]);
  const zoneStats = useMemo(() => computeZoneStats(filtered), [filtered]);
  const words = useMemo(() => wordFrequency(filtered), [filtered]);
  const selectedZoneData = selectedZone ? zoneStats.find((z) => z.zone === selectedZone) : null;

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="text-2xl font-serif text-neutral-100">Pattern Journal</h2>
      </div>

      {history.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">No check-ins yet.</p>
          <p className="text-neutral-600 text-xs mt-2">Patterns will appear here after a few check-ins.</p>
        </div>
      ) : (
        <>
          {/* Date range selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wide border transition-all duration-150 ${
                  dateRange === r
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Check-ins" value={filtered.length} />
            <StatTile label="Zones touched" value={zoneStats.length} />
            <StatTile label="Avg intensity" value={
              filtered.length > 0
                ? String(Math.round(
                    filtered.reduce((s, e) => s + (e.overallIntensity ?? 0), 0) / filtered.filter(e => e.overallIntensity).length * 10
                  ) / 10 || '–')
                : '–'
            } />
          </div>

          {/* Heat map */}
          <section className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Body map — tap to explore</p>
            <BodyMapHeatMap
              history={filtered}
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
            />
          </section>

          {/* Zone detail */}
          {selectedZoneData && (
            <section className="bg-neutral-900/60 border border-emerald-500/15 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif text-neutral-100">{selectedZoneData.label}</h3>
                <button onClick={() => setSelectedZone(null)} className="text-neutral-600 hover:text-neutral-400 transition-colors text-sm">dismiss</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-wide mb-0.5">Frequency</p>
                  <p className="text-neutral-200">{selectedZoneData.count} time{selectedZoneData.count > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-wide mb-0.5">Avg intensity</p>
                  <p className="text-neutral-200">{selectedZoneData.avgIntensity}</p>
                </div>
              </div>
              {selectedZoneData.commonQualities.length > 0 && (
                <div>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-wide mb-1.5">Common qualities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZoneData.commonQualities.map((q) => (
                      <span key={q} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/15 rounded-md text-xs text-emerald-400">{q}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedZoneData.commonContextTags.length > 0 && (
                <div>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-wide mb-1.5">Common contexts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZoneData.commonContextTags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded-md text-xs text-neutral-400">{t.replace(/-/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Top zones list */}
          {zoneStats.length > 0 && (
            <section className="space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Most frequent zones</p>
              <div className="space-y-2">
                {zoneStats.slice(0, 6).map((z, i) => (
                  <button
                    key={z.zone}
                    onClick={() => setSelectedZone(selectedZone === z.zone ? null : z.zone)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      selectedZone === z.zone
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[11px] font-mono text-neutral-600 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate">{z.label}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 rounded-full bg-emerald-500/60" style={{ width: `${Math.max(16, (z.count / (zoneStats[0]?.count ?? 1)) * 60)}px` }} />
                      <span className="text-xs font-mono text-neutral-500">{z.count}×</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Word frequency */}
          {words.length > 0 && (
            <section className="space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                Words in your notes
                <span className="text-neutral-600 ml-1 normal-case font-sans tracking-normal">(appearing 2+ times)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {words.map(({ word, count }) => (
                  <div key={word} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                    <span className="text-sm text-neutral-300">{word}</span>
                    <span className="text-xs font-mono text-neutral-600">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent timeline */}
          <section className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Recent check-ins</p>
            <div className="space-y-2">
              {history.slice(0, 8).map((entry) => {
                const date = new Date(entry.completedAt);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl">
                    <div className="flex-shrink-0 text-right min-w-[54px]">
                      <p className="text-xs text-neutral-400 font-mono">{dateStr}</p>
                      <p className="text-[10px] text-neutral-600 font-mono">{timeStr}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {entry.nothingNotable ? (
                        <p className="text-sm text-neutral-500">Nothing notable</p>
                      ) : (
                        <p className="text-sm text-neutral-300">
                          {entry.marks.length} zone{entry.marks.length > 1 ? 's' : ''}
                          {entry.marks.length > 0 && (
                            <span className="text-neutral-500"> · {entry.marks.slice(0, 2).map(m => ZONE_LABELS[m.zone as SomaticBodyZone] ?? m.zone).join(', ')}{entry.marks.length > 2 ? '…' : ''}</span>
                          )}
                        </p>
                      )}
                      {entry.postSessionState && (
                        <p className="text-xs text-neutral-600 mt-0.5">{entry.postSessionState.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
      <p className="text-xl font-serif text-emerald-400">{value}</p>
      <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}
