import React from 'react';

interface AOSRejectProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AOSReject
 * Concept: The banishing seal—active protection through conscious negation
 * Symbolism:
 *   - Four radiating arms: Forces pushing outward, creating safe space
 *   - Central void: What is protected—emptiness is not absence but potential
 *   - Crossing angles at 90°: Perfect opposition, complete closure
 *   - Outer extent: The boundary of the negation's reach
 *   - Inner diamond: The shape of the protected space (rotated square)
 * Geometry: 4-fold rotational symmetry, arms at 45° to vertical, inner diamond at φ scale
 */
export default function AOSReject({
  size = 64,
  color = 'currentColor',
  className = ''
}: AOSRejectProps) {
  const phi = 1.618;
  const innerRadius = 9 / phi; // ≈ 5.6

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
      {/* PRIMARY - Main X: diagonal from top-left */}
      <line
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        strokeWidth="2"
        opacity="1"
      />

      {/* PRIMARY - Main X: diagonal from top-right */}
      <line
        x1="20"
        y1="4"
        x2="4"
        y2="20"
        strokeWidth="2"
        opacity="1"
      />

      {/* SECONDARY - Inner diamond: the protected space */}
      <path
        d="M12 6.5 L17.5 12 L12 17.5 L6.5 12 Z"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* DATA - Outward energy marks (banishing force) */}
      <line x1="5.5" y1="5.5" x2="4" y2="4" strokeWidth="1" opacity="0.5" />
      <line x1="18.5" y1="5.5" x2="20" y2="4" strokeWidth="1" opacity="0.5" />
      <line x1="5.5" y1="18.5" x2="4" y2="20" strokeWidth="1" opacity="0.5" />
      <line x1="18.5" y1="18.5" x2="20" y2="20" strokeWidth="1" opacity="0.5" />

      {/* DETAIL - Cross-hatch at intersection (seal pattern) */}
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="0.5" opacity="0.3" />
      <line x1="12" y1="10" x2="12" y2="14" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL - Center void: the protected emptiness */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}
