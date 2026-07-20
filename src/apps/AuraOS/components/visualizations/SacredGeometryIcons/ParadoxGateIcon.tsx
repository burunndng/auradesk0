import React from 'react';

interface ParadoxGateIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * ParadoxGate Icon
 * Concept: The threshold that leads to itself, Möbius doorway
 * Symbolism: Inside becomes outside, exit becomes entrance, transformation loop
 * Technique: Impossible geometry, contradictory depth, front/back inversion
 */
export default function ParadoxGateIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ParadoxGateIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* PRIMARY (2px) - Stable horizontals (ground the paradox) */}
      <path d="M5 4 H19" strokeWidth="2" />
      <path d="M5 20 H19" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Left pillar FRONT (top half) */}
      <path d="M5 4 V12" strokeWidth="1.5" />

      {/* SECONDARY (1.5px) - Right pillar FRONT (bottom half) */}
      <path d="M19 12 V20" strokeWidth="1.5" />

      {/* DATA (1.5px) - Left pillar BEHIND (bottom half, reduced opacity) */}
      <path d="M5 12 V20" strokeWidth="1.5" opacity="0.35" />

      {/* DATA (1.5px) - Right pillar BEHIND (top half, reduced opacity) */}
      <path d="M19 4 V12" strokeWidth="1.5" opacity="0.35" />

      {/* DATA (1px) - The twist connector */}
      <path d="M5 12 L19 12" strokeWidth="1" opacity="0.5" />

      {/* DETAIL (0.5px) - Depth contradiction marks */}
      <path d="M4 11 L5 12 L4 13" strokeWidth="0.5" opacity="0.5" />
      <path d="M20 11 L19 12 L20 13" strokeWidth="0.5" opacity="0.5" />

      {/* DETAIL (0.5px) - Center infinity/crossing */}
      <path
        d="M10 11 Q12 10 14 11 Q12 12.5 10 13 Q12 14 14 13 Q12 11.5 10 11"
        strokeWidth="0.5"
        opacity="0.6"
      />

      {/* FOCAL - Transition nodes at twist points */}
      <circle cx="5" cy="12" r="0.8" fill={color} />
      <circle cx="19" cy="12" r="0.8" fill={color} />

      {/* FOCAL - Center void point (the paradox core) */}
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  );
}
