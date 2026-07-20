import React from 'react';
import MerkabaIcon from '../visualizations/SacredGeometryIcons/MerkabaIcon';

type AccentColor = 'teal' | 'emerald' | 'amber' | 'purple' | 'stone';

interface LoadingFallbackProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  accent?: AccentColor;
}

const accentColors: Record<AccentColor, string> = {
  teal:    'text-teal-400/60',
  emerald: 'text-emerald-400/60',
  amber:   'text-amber-400/60',
  purple:  'text-purple-400/60',
  stone:   'text-stone-400/40',
};

const iconSizes: Record<string, number> = {
  small:  24,
  medium: 36,
  large:  48,
};

const heightClasses: Record<string, string> = {
  small:  'h-32',
  medium: 'h-64',
  large:  'h-[100dvh]',
};

export default function LoadingFallback({
  text,
  size = 'medium',
  accent = 'stone',
}: LoadingFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center ${heightClasses[size]}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`animate-pulse-gentle ${accentColors[accent]}`} aria-hidden="true">
          <MerkabaIcon size={iconSizes[size]} color="currentColor" />
        </div>
        {text && (
          <p className="text-stone-500 text-xs font-mono tracking-widest uppercase">{text}</p>
        )}
        <span className="sr-only">{text ?? 'Loading'}</span>
      </div>
    </div>
  );
}

export function TabLoadingFallback() {
  return <LoadingFallback size="large" accent="stone" />;
}

export function WizardLoadingFallback() {
  return <LoadingFallback size="medium" accent="stone" />;
}

export function ModalLoadingFallback() {
  return <LoadingFallback size="small" accent="stone" />;
}
