import React from 'react';

interface AOSArrowProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AOSArrow
 * Concept: The axis mundi—the sacred direction that connects all planes
 * Symbolism:
 *   - Vertical shaft: The world axis, spine of reality, sushumna
 *   - Arrowhead: Aspiration, directed will, the point of intention
 *   - Horizontal crossing: The present moment, the crossroads of choice
 *   - Tail fletching: Grounding, what stabilizes the flight
 *   - Proportions: Shaft divided by φ at the crossing point
 * Geometry: Vertical axis, head at 30° angles, φ division at crossing
 */
export default function AOSArrow({
  size = 64,
  color = 'currentColor',
  className = ''
}: AOSArrowProps) {
  // Golden ratio division of the shaft
  const phi = 1.618;
  const totalLength = 16; // from y=4 to y=20
  const crossingFromTop = totalLength / phi; // ≈ 9.9
  const crossingY = 4 + crossingFromTop; // ≈ 13.9, round to 14

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
      {/* PRIMARY - Main shaft: the axis mundi */}
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        strokeWidth="2"
        opacity="1"
      />

      {/* PRIMARY - Arrowhead left */}
      <line
        x1="12"
        y1="4"
        x2="7"
        y2="9"
        strokeWidth="2"
        opacity="1"
      />

      {/* PRIMARY - Arrowhead right */}
      <line
        x1="12"
        y1="4"
        x2="17"
        y2="9"
        strokeWidth="2"
        opacity="1"
      />

      {/* SECONDARY - Horizontal crossing at φ point */}
      <line
        x1="8"
        y1="14"
        x2="16"
        y2="14"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* DATA - Tail fletching left */}
      <line
        x1="12"
        y1="20"
        x2="9"
        y2="17"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* DATA - Tail fletching right */}
      <line
        x1="12"
        y1="20"
        x2="15"
        y2="17"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* DETAIL - Energy lines along shaft */}
      <line x1="10.5" y1="10" x2="10.5" y2="13" strokeWidth="0.5" opacity="0.25" />
      <line x1="13.5" y1="10" x2="13.5" y2="13" strokeWidth="0.5" opacity="0.25" />

      {/* DETAIL - Inner arrowhead (depth) */}
      <line x1="12" y1="6" x2="9" y2="9" strokeWidth="0.5" opacity="0.3" />
      <line x1="12" y1="6" x2="15" y2="9" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL - The crossing point: here and now */}
      <circle
        cx="12"
        cy="14"
        r="1"
        fill={color}
        stroke="none"
        opacity="0.75"
      />

      {/* FOCAL - The tip: point of intention */}
      <circle
        cx="12"
        cy="4"
        r="0.7"
        fill={color}
        stroke="none"
        opacity="0.9"
      />
    </svg>
  );
}
