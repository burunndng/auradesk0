import React from 'react';

interface AOSBrainProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AOSBrain
 * Concept: Consciousness arises from the union of dualities—two becoming one
 * Symbolism:
 *   - Two overlapping circles: Hemispheres, also logic/intuition, known/unknown
 *   - Vesica piscis intersection: The corpus callosum, bridge of integration
 *   - Central point: Pineal gland, the third eye, seat of awareness
 *   - Outer boundary: The skull, container of infinite inner space
 *   - Three neural paths: The three pillars (severity, mercy, balance)
 * Geometry: Two circles radius 5, centers at (9,12) and (15,12), overlap creates vesica
 */
export default function AOSBrain({
  size = 64,
  color = 'currentColor',
  className = ''
}: AOSBrainProps) {
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
      {/* PRIMARY - Left hemisphere circle */}
      <circle
        cx="9"
        cy="12"
        r="6"
        strokeWidth="2"
        opacity="1"
      />

      {/* PRIMARY - Right hemisphere circle */}
      <circle
        cx="15"
        cy="12"
        r="6"
        strokeWidth="2"
        opacity="1"
      />

      {/* SECONDARY - Upper neural fold (left) */}
      <path
        d="M5 9 Q7 7.5, 9 9"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />

      {/* SECONDARY - Upper neural fold (right) */}
      <path
        d="M15 9 Q17 7.5, 19 9"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />

      {/* SECONDARY - Lower neural fold (left) */}
      <path
        d="M5 15 Q7 16.5, 9 15"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />

      {/* SECONDARY - Lower neural fold (right) */}
      <path
        d="M15 15 Q17 16.5, 19 15"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />

      {/* DATA - Corpus callosum: the bridge */}
      <ellipse
        cx="12"
        cy="12"
        rx="1.5"
        ry="4"
        strokeWidth="0.75"
        opacity="0.4"
      />

      {/* DETAIL - Three vertical paths (three pillars of consciousness) */}
      <line x1="9" y1="7" x2="9" y2="17" strokeWidth="0.5" opacity="0.2" />
      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="0.5" opacity="0.3" />
      <line x1="15" y1="7" x2="15" y2="17" strokeWidth="0.5" opacity="0.2" />

      {/* FOCAL - Pineal gland: the third eye, seat of awareness */}
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill={color}
        stroke="none"
        opacity="0.85"
      />

      {/* FOCAL DETAIL - Inner light of pineal */}
      <circle
        cx="12"
        cy="12"
        r="0.5"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  );
}
