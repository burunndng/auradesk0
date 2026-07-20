import React from 'react';

interface VoidBloomIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * VoidBloom Icon
 * Concept: Creation emerging from nothing — ex nihilo manifestation
 * Symbolism:
 *   - Central void: The pregnant emptiness, Ain Soph
 *   - Six petals: First differentiation, hexagonal efficiency
 *   - Outward curves: Expansion, emanation, the Big Bang moment
 *   - Empty center: The source remains — creation surrounds, not replaces
 * Geometry: 6-fold symmetry, sacred hexagon, emergence dynamics
 * Emotional Resonance: Awe at origins, the sublime terror of the void, hope in emergence
 */
export default function VoidBloomIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: VoidBloomIconProps) {
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
      {/* DETAIL - Outer containment field */}
      <circle cx="12" cy="12" r="10" strokeWidth="0.5" opacity="0.15" />

      {/* DETAIL (0.5px) - Void boundary (dashed — unstable threshold) */}
      <circle
        cx="12"
        cy="12"
        r="2.5"
        strokeWidth="0.5"
        strokeDasharray="1.5 1"
        opacity="0.4"
      />

      {/* DATA (1px) - Emergence rays (6 directions) */}
      <g strokeWidth="0.75" opacity="0.4">
        <path d="M14.5 12 L19 12" />
        <path d="M13.25 10.5 L16 5" />
        <path d="M10.75 10.5 L8 5" />
        <path d="M9.5 12 L5 12" />
        <path d="M10.75 13.5 L8 19" />
        <path d="M13.25 13.5 L16 19" />
      </g>

      {/* SECONDARY (1.5px) - Inner hexagonal threshold */}
      <path
        d="M17 12 L14.5 7.5 L9.5 7.5 L7 12 L9.5 16.5 L14.5 16.5 Z"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* PRIMARY (2px) - Six outer petals (the first manifestation) */}
      {/* Petal 0° (right) */}
      <path d="M14.5 12 Q17 10 20 12 Q17 14 14.5 12" strokeWidth="1.5" />

      {/* Petal 60° (upper right) */}
      <path d="M13.25 10 Q16 7 16 4 Q13 7 13.25 10" strokeWidth="1.5" />

      {/* Petal 120° (upper left) */}
      <path d="M10.75 10 Q8 7 8 4 Q11 7 10.75 10" strokeWidth="1.5" />

      {/* Petal 180° (left) */}
      <path d="M9.5 12 Q7 10 4 12 Q7 14 9.5 12" strokeWidth="1.5" />

      {/* Petal 240° (lower left) */}
      <path d="M10.75 14 Q8 17 8 20 Q11 17 10.75 14" strokeWidth="1.5" />

      {/* Petal 300° (lower right) */}
      <path d="M13.25 14 Q16 17 16 20 Q13 17 13.25 14" strokeWidth="1.5" />

      {/* DETAIL - Petal spiral hints */}
      <g strokeWidth="0.5" opacity="0.3">
        <path d="M18 12 Q17 11 17 12" />
        <path d="M15 5 Q14 6 15 6" />
        <path d="M9 5 Q10 6 9 6" />
        <path d="M6 12 Q7 11 7 12" />
        <path d="M9 19 Q10 18 9 18" />
        <path d="M15 19 Q14 18 15 18" />
      </g>

      {/* FOCAL - Six petal tip nodes (where form first crystallizes) */}
      <circle cx="20" cy="12" r="0.7" fill={color} stroke="none" />
      <circle cx="16" cy="4" r="0.7" fill={color} stroke="none" />
      <circle cx="8" cy="4" r="0.7" fill={color} stroke="none" />
      <circle cx="4" cy="12" r="0.7" fill={color} stroke="none" />
      <circle cx="8" cy="20" r="0.7" fill={color} stroke="none" />
      <circle cx="16" cy="20" r="0.7" fill={color} stroke="none" />

      {/* FOCAL - Threshold nodes (where void meets form) */}
      <g opacity="0.6">
        <circle cx="14.5" cy="12" r="0.4" fill={color} stroke="none" />
        <circle cx="13.25" cy="9.5" r="0.4" fill={color} stroke="none" />
        <circle cx="10.75" cy="9.5" r="0.4" fill={color} stroke="none" />
        <circle cx="9.5" cy="12" r="0.4" fill={color} stroke="none" />
        <circle cx="10.75" cy="14.5" r="0.4" fill={color} stroke="none" />
        <circle cx="13.25" cy="14.5" r="0.4" fill={color} stroke="none" />
      </g>
    </svg>
  );
}
