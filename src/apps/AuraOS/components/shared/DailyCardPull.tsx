import React, { useState, useMemo } from 'react';
import { CARD_LIBRARY } from '../../data/fishbowlConfig';

interface DailyCardPullProps {
  setActiveWizard: (wizardId: string) => void;
}

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export const DailyCardPull: React.FC<DailyCardPullProps> = ({ setActiveWizard }) => {
  const today = new Date().toISOString().split('T')[0];
  const baseIndex = useMemo(() => hashDate(today) % CARD_LIBRARY.length, [today]);
  const card = CARD_LIBRARY[baseIndex];

  const [counterIndex, setCounterIndex] = useState<number | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  const maxCycles = card.counters.length;
  const canSeeMore = counterIndex === null || counterIndex < maxCycles - 1;

  const handleSeeMore = () => {
    setFadeKey(k => k + 1);
    setCounterIndex(prev => prev === null ? 0 : prev + 1);
  };

  const currentContent = counterIndex === null
    ? card.primary
    : card.counters[counterIndex];

  return (
    <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-teal-400/60">Daily Card</span>
        <span className="text-xs text-slate-500">{currentContent.tradition}</span>
      </div>
      <div
        key={fadeKey}
        className="mb-4 text-sm leading-relaxed text-slate-300"
        style={{ animation: 'fadeIn 0.3s ease-in' }}
      >
        &ldquo;{currentContent.content}&rdquo;
      </div>
      <div className="flex items-center gap-3">
        {canSeeMore && (
          <button
            onClick={handleSeeMore}
            className="text-xs text-teal-400/70 hover:text-teal-300 transition-colors"
          >
            See a different take
          </button>
        )}
        <button
          onClick={() => setActiveWizard('inner-compass')}
          className="ml-auto rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs text-teal-300 hover:bg-teal-500/20 transition-colors"
        >
          Start a session
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
};
