import React from 'react';
import type { CrisisLevel } from '../../types';

interface SafetyBannerProps {
  crisisLevel: CrisisLevel;
  className?: string;
}

export default function SafetyBanner({ crisisLevel, className = '' }: SafetyBannerProps) {
  if (crisisLevel === 'none') return null;

  const isHigh = crisisLevel === 'high';

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
        isHigh
          ? 'bg-red-950/60 border border-red-800/50 text-red-300'
          : 'bg-stone-900/60 border border-stone-700/40 text-stone-400'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isHigh ? 'bg-red-400' : 'bg-amber-600'}`} />
      {isHigh
        ? <>If you need immediate support, call or text <strong className="text-red-200">988</strong> (US) or go to your nearest emergency room.</>
        : <>If you need support beyond this session, <strong className="text-stone-300">988</strong> is available 24/7.</>
      }
    </div>
  );
}
