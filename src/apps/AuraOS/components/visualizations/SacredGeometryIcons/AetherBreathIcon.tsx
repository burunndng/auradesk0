import React from 'react';

interface AetherBreathIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AetherBreath Icon
 * Concept: The toroidal rhythm of life force, breath as spiritual circulation
 * Symbolism: Prana flowing through and around the body-field
 * Technique: Organic curves, flow direction, still center point
 */
export default function AetherBreathIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: AetherBreathIconProps) {
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
      {/* PRIMARY (2px) - Central channel — the spine of breath */}
      <path
        d="M12 20 Q11.5 16 12 12 Q12.5 8 12 4"
        strokeWidth="2"
      />

      {/* SECONDARY (1.5px) - Outer torus circulation */}
      <path
        d="M12 4 Q5 4 4 10 Q3 14 4 16 Q5 20 12 20"
        strokeWidth="1.5"
      />
      <path
        d="M12 4 Q19 4 20 10 Q21 14 20 16 Q19 20 12 20"
        strokeWidth="1.5"
      />

      {/* DATA (1px) - Flow indicators */}
      <path d="M6 8L5 10M6 16L5 14" strokeWidth="1" />
      <path d="M18 8L19 10M18 16L19 14" strokeWidth="1" />
      <path d="M11 14L12 12L13 14" strokeWidth="1" />

      {/* DETAIL (0.5px) - Crown and root convergence */}
      <path d="M8 5Q10 3 12 4Q14 3 16 5" strokeWidth="0.5" opacity="0.6" />
      <path d="M8 19Q10 21 12 20Q14 21 16 19" strokeWidth="0.5" opacity="0.6" />

      {/* DETAIL - Radiating field */}
      <path d="M2 12H4M20 12H22" strokeWidth="0.5" opacity="0.4" />

      {/* FOCAL - Heart center (the still point) */}
      <circle cx="12" cy="11" r="1.5" fill={color} />

      {/* SECONDARY FOCAL - Crown and root points */}
      <circle cx="12" cy="4" r="0.8" fill={color} />
      <circle cx="12" cy="20" r="0.8" fill={color} />
    </svg>
  );
}
