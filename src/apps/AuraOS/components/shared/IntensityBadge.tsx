import React from 'react';

export type IntensityLevel = 'light' | 'medium' | 'deep' | 'intensive';

interface IntensityBadgeProps {
  time: string;        // e.g. "~15 min"
  intensity: IntensityLevel;
  /** Module accent color in CSS — defaults to purple for shadow */
  accentColor?: string;
}

const INTENSITY_STYLES: Record<IntensityLevel, { label: string; opacity: string }> = {
  light:     { label: 'Light',     opacity: 'opacity-50' },
  medium:    { label: 'Medium',    opacity: 'opacity-60' },
  deep:      { label: 'Deep',      opacity: 'opacity-75' },
  intensive: { label: 'Intensive', opacity: 'opacity-90' },
};

export default function IntensityBadge({ time, intensity, accentColor }: IntensityBadgeProps) {
  const style = INTENSITY_STYLES[intensity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] ${style.opacity}`}
      style={accentColor ? { color: accentColor } : undefined}
    >
      <span className="text-purple-400/70" style={accentColor ? { color: 'inherit' } : undefined}>
        {time}
      </span>
      <span className="text-neutral-600">·</span>
      <span className="text-purple-400/50" style={accentColor ? { color: 'inherit', opacity: 0.7 } : undefined}>
        {style.label}
      </span>
    </span>
  );
}
