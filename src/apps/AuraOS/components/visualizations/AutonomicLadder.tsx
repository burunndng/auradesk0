import React from 'react';
import type { PolyvagalStateValue } from '../../types';
import { STATE_MARKERS } from '../../data/polyvagalInterventions';

interface Props {
  value: PolyvagalStateValue;
  onChange: (state: PolyvagalStateValue) => void;
  disabled?: boolean;
}

const STATE_STYLES: Record<string, {
  active: string;
  inactive: string;
  ring: string;
  shadow: string;
  cueChip: string;
  focusRing: string;
}> = {
  cyan: {
    active: 'bg-cyan-950/60 border-cyan-400/30',
    inactive: 'bg-stone-950/40 border-stone-800/30 hover:border-cyan-900/40 hover:bg-cyan-950/20',
    ring: 'ring-2 ring-cyan-400/20',
    shadow: 'shadow-xl shadow-cyan-900/30',
    cueChip: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    focusRing: 'focus:ring-cyan-400/30',
  },
  amber: {
    active: 'bg-amber-950/60 border-amber-400/30',
    inactive: 'bg-stone-950/40 border-stone-800/30 hover:border-amber-900/40 hover:bg-amber-950/20',
    ring: 'ring-2 ring-amber-400/20',
    shadow: 'shadow-xl shadow-amber-900/30',
    cueChip: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    focusRing: 'focus:ring-amber-400/30',
  },
  indigo: {
    active: 'bg-indigo-950/60 border-indigo-400/30',
    inactive: 'bg-stone-950/40 border-stone-800/30 hover:border-indigo-900/40 hover:bg-indigo-950/20',
    ring: 'ring-2 ring-indigo-400/20',
    shadow: 'shadow-xl shadow-indigo-900/30',
    cueChip: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    focusRing: 'focus:ring-indigo-400/30',
  },
};

const STATES: { key: PolyvagalStateValue }[] = [
  { key: 'ventral' },
  { key: 'sympathetic' },
  { key: 'dorsal' },
];

export function AutonomicLadder({ value, onChange, disabled = false }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full" role="radiogroup" aria-label="Autonomic nervous system state">
      {STATES.map(({ key }) => {
        const marker = STATE_MARKERS[key];
        const styles = STATE_STYLES[marker.color];
        const isActive = value === key;
        return (
          <button
            key={key}
            data-state={key}
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(key)}
            className={`
              w-full rounded-2xl p-5 sm:p-6 text-left border transition-all duration-400 ease-out
              backdrop-blur-md focus:outline-none focus:ring-2 ${styles.focusRing}
              disabled:cursor-not-allowed disabled:opacity-40
              ${isActive
                ? `${styles.active} ${styles.ring} ${styles.shadow} scale-[1.01]`
                : `${styles.inactive} opacity-80 hover:opacity-100`
              }
            `}
          >
            <p className="font-serif text-lg text-stone-100">{marker.label}</p>
            <p className="text-sm italic text-stone-400 mt-1 leading-relaxed">{marker.somatic}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {marker.body_cues.map(cue => (
                <span key={cue} className={`text-xs px-2.5 py-1 rounded-full ${styles.cueChip}`}>{cue}</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
