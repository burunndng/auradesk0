/**
 * DBT Distress Tolerance Icon - Protective Shelter
 * Concept: Resilience through acceptance of difficulty; finding strength in surrender
 * Symbolism: Shield (protection), waves (flow/acceptance), fortress stability
 * Geometry: Isosceles triangle shield with harmonic wave pattern (sine curve)
 * Colors: Deep purple for strength, indigo for acceptance, unified in resilience
 */

import React from 'react';

interface DBTDistressToleranceIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function DBTDistressToleranceIcon({
  size = 24,
  className = '',
  color = 'currentColor'
}: DBTDistressToleranceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield Outline - Triangle base */}
      <path
        d="M 12 2 L 20 7 L 20 13 Q 20 18 12 22 Q 4 18 4 13 L 4 7 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Wave Pattern 1 - Acceptance Flow */}
      <path
        d="M 6 10 Q 8 9 10 10 T 14 10 T 18 10"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
        fill="none"
      />

      {/* Wave Pattern 2 - Deeper acceptance */}
      <path
        d="M 6 13 Q 8 12 10 13 T 14 13 T 18 13"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
        fill="none"
      />

      {/* Central Core - Solid Ground */}
      <circle
        cx="12"
        cy="15"
        r="1.5"
        fill={color}
        opacity="0.9"
      />

      {/* Harmonic Ring - Strength through challenge */}
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}
