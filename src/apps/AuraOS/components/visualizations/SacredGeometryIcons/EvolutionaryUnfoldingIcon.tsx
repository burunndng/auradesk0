import React from 'react';

/**
 * EvolutionaryUnfoldingIcon
 *
 * Concept: Growth and developmental unfolding in spiraling expansion
 * Geometry: Ascending spiral with expanding concentric rings
 * Symbolism: Evolution expanding upward while maintaining spiral continuity
 *
 * Design: Counter-clockwise ascending spiral with each loop larger, ending at top point,
 * representing development that maintains coherence while continuously expanding capacity.
 */

interface EvolutionaryUnfoldingIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function EvolutionaryUnfoldingIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: EvolutionaryUnfoldingIconProps) {
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
      {/* OUTERMOST SPIRAL LOOP (2px) - Largest, counter-clockwise ascending */}
      <path
        d="M12 22 Q6 22 6 16 Q6 10 12 10 Q18 10 18 16 Q18 20 15 22"
        strokeWidth="2"
        fill="none"
      />

      {/* SECOND SPIRAL LOOP (1.5px) - Middle, expanding upward */}
      <path
        d="M12 19 Q8 19 8 15 Q8 11 12 11 Q16 11 16 15 Q16 18 13 19"
        strokeWidth="1.5"
        fill="none"
      />

      {/* THIRD SPIRAL LOOP (1px) - Smaller, continuing ascent */}
      <path
        d="M12 16 Q10 16 10 13.5 Q10 11.5 12 11.5 Q14 11.5 14 13.5 Q14 15.5 13 16"
        strokeWidth="1"
        fill="none"
      />

      {/* APEX POINT (2px) - Convergence at top */}
      <line x1="12" y1="16" x2="12" y2="3" strokeWidth="1.5" opacity="0.7" />

      {/* EXPANSION RINGS (0.5px) - Showing growth concentric structure */}
      <circle cx="12" cy="14" r="4" strokeWidth="0.5" opacity="0.5" />
      <circle cx="12" cy="14" r="5.5" strokeWidth="0.5" opacity="0.4" />

      {/* DEVELOPMENTAL NODES (Filled) */}
      {/* Top apex - Highest development point */}
      <circle cx="12" cy="3" r="1.1" fill={color} stroke="none" />

      {/* Core continuity point */}
      <circle cx="12" cy="11.5" r="0.9" fill={color} stroke="none" opacity="0.8" />

      {/* Expansion waypoints */}
      <circle cx="6" cy="16" r="0.6" fill={color} stroke="none" opacity="0.6" />
      <circle cx="18" cy="16" r="0.6" fill={color} stroke="none" opacity="0.6" />

      {/* GROWTH TRAJECTORY GUIDES (0.5px) */}
      <line x1="12" y1="3" x2="9" y2="11" strokeWidth="0.5" opacity="0.4" />
      <line x1="12" y1="3" x2="15" y2="11" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
