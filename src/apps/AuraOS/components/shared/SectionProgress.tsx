import React from 'react';

interface SectionProgressProps {
  practiced: number;
  total: number;
  /** CSS color string for the fill bar — defaults to purple */
  accentColor?: string;
}

export default function SectionProgress({ practiced, total, accentColor }: SectionProgressProps) {
  if (total === 0) return null;
  const pct = Math.round((practiced / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-grow h-[2px] bg-neutral-900 rounded-full overflow-hidden max-w-[120px]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: accentColor || 'rgba(168, 85, 247, 0.5)',
          }}
        />
      </div>
      {practiced > 0 && (
        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.1em] whitespace-nowrap">
          {practiced} of {total} explored
        </span>
      )}
    </div>
  );
}
