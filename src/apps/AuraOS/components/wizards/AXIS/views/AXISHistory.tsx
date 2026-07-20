/**
 * AXIS History
 * Session history with filtering and session cards
 *
 * Design: stone-950 base · Violet secondary
 */

import React, { useState } from 'react';
import { ChevronLeft, History as HistoryIcon } from 'lucide-react';
import type { AXISSession } from '../../../../types';
import AXISSessionCard from '../components/AXISSessionCard';

interface AXISHistoryProps {
  sessions: AXISSession[];
  onBack: () => void;
  onSelectSession: (session: AXISSession) => void;
}

type FilterTab = 'main' | 'open' | 'closed' | 'off-axis';

export default function AXISHistory({ sessions, onBack, onSelectSession }: AXISHistoryProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('main');

  const mainSessions = sessions.filter(s => !s.isOffAxis);
  const offAxisSessions = sessions.filter(s => s.isOffAxis);

  const filteredSessions = (() => {
    if (filterTab === 'open') return mainSessions.filter(s => s.status !== 'closed');
    if (filterTab === 'closed') return mainSessions.filter(s => s.status === 'closed');
    if (filterTab === 'off-axis') return offAxisSessions;
    return mainSessions;
  })();

  const openCount = mainSessions.filter(s => s.status !== 'closed').length;
  const closedCount = mainSessions.filter(s => s.status === 'closed').length;

  const tabs: Array<{ value: FilterTab; label: string; count: number }> = [
    { value: 'main', label: 'Main', count: mainSessions.length },
    { value: 'open', label: 'Open', count: openCount },
    { value: 'closed', label: 'Closed', count: closedCount },
    { value: 'off-axis', label: 'Side Quests', count: offAxisSessions.length },
  ];

  return (
    <div className="space-y-6">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><HistoryIcon size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Session History</h2>
        <p className="text-sm text-stone-400">Review your past reflections and open sessions</p>
      </div>

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-all"
      >
        <ChevronLeft size={16} />
        <span className="text-sm">Back</span>
      </button>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterTab(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 ${filterTab === tab.value
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
              }`}
          >
            {tab.label} <span className="opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-stone-500">
            {filterTab === 'main' && 'No sessions yet. Start one to begin.'}
            {filterTab === 'open' && 'No open sessions.'}
            {filterTab === 'closed' && 'No closed sessions yet.'}
            {filterTab === 'off-axis' && 'No side quest sessions yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(session => (
              <AXISSessionCard
                key={session.id}
                session={session}
                onSelect={() => onSelectSession(session)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
