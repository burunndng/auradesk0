import React from 'react';
import { ModuleKey } from '../../../types';

export type VoidCSSProps = {
  module: ModuleKey;
  intensity?: 'subtle' | 'medium';
};

export const VoidCSS: React.FC<VoidCSSProps> = ({ module, intensity = 'subtle' }) => {
  const auraOpacity = intensity === 'subtle' ? 0.08 : 0.14;
  const geometryOpacity = intensity === 'subtle' ? 0.06 : 0.10;

  // Noise texture extracted from global styles
  const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" data-module={module}>
      {/* Layer 1 — Void base */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'var(--void-base)' }}
      />
      
      {/* Layer 2 — Radial aura */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, var(--module-glow) 0%, transparent 65%)',
          // var(--module-glow) has built-in 0.12 opacity, so to get auraOpacity, we simply multiply base by 1 
          // Wait, if var(--module-glow) is oklch(... / 0.12) and we wrap it in a div with opacity = auraOpacity / 0.12, 
          // then 0.12 * (0.08 / 0.12) = 0.08 effective opacity at center.
          opacity: auraOpacity / 0.12
        }}
      />

      {/* Layer 3 — Sacred geometry SVG */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center motion-safe:animate-[spin_200s_linear_infinite]"
        style={{ 
          opacity: geometryOpacity, 
          color: 'var(--module-accent)' 
        }}
      >
        <svg 
          viewBox="-40 -40 80 80" 
          width="150%" 
          height="150%" 
          className="max-w-[1200px] max-h-[1200px]"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.8"
        >
          {/* Seed of Life */}
          <circle cx="0" cy="0" r="10" />
          <circle cx="0" cy="-10" r="10" />
          <circle cx="8.660" cy="-5" r="10" />
          <circle cx="8.660" cy="5" r="10" />
          <circle cx="0" cy="10" r="10" />
          <circle cx="-8.660" cy="5" r="10" />
          <circle cx="-8.660" cy="-5" r="10" />
        </svg>
      </div>

      {/* Layer 4 — Edge vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, oklch(0.04 0 0deg / 0.5) 100%)'
        }}
      />

      {/* Layer 5 — Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: NOISE_BG,
          opacity: 0.04,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

export default VoidCSS;
