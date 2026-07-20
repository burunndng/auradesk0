import React from 'react';

interface AOSConfirmProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AOSConfirm
 * Concept: Affirmation as ascending flame—yes that rises from grounded certainty
 * Symbolism:
 *   - Descending left stroke: The consideration, the weighing
 *   - Ascending right stroke: The decision, the commitment, the rise
 *   - Valley point: The moment of choice, the pivot
 *   - Flame suggestion: Life-force, will, active energy
 *   - Asymmetry: Affirmation has direction—it goes somewhere
 * Geometry: Left stroke at 60° (stability), right stroke at 30° (aspiration), φ length ratio
 */
export default function AOSConfirm({
  size = 64,
  color = 'currentColor',
  className = ''
}: AOSConfirmProps) {
  // The check proportions based on φ
  const phi = 1.618;
  const shortArm = 5;
  const longArm = shortArm * phi; // ≈ 8.1

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
      {/* PRIMARY - Main check stroke */}
      <path
        d="M4 12 L9 17 L20 6"
        strokeWidth="2"
        opacity="1"
        fill="none"
      />

      {/* SECONDARY - Inner echo (flame body) */}
      <path
        d="M6 12 L9 15 L18 7"
        strokeWidth="1"
        opacity="0.35"
        fill="none"
      />

      {/* DATA - Ascending energy lines (flame flicker) */}
      <line x1="16" y1="8" x2="18" y2="6" strokeWidth="0.75" opacity="0.4" />
      <line x1="14" y1="10" x2="15.5" y2="8.5" strokeWidth="0.75" opacity="0.35" />

      {/* DATA - Spark at apex */}
      <line x1="20" y1="6" x2="21" y2="4.5" strokeWidth="0.75" opacity="0.5" />

      {/* DETAIL - Root grounding (where certainty plants) */}
      <line x1="9" y1="17" x2="9" y2="19" strokeWidth="0.5" opacity="0.3" />
      <line x1="7.5" y1="18" x2="10.5" y2="18" strokeWidth="0.5" opacity="0.25" />

      {/* FOCAL - The pivot point: moment of choice */}
      <circle
        cx="9"
        cy="17"
        r="1.3"
        fill={color}
        stroke="none"
        opacity="0.8"
      />

      {/* FOCAL - The apex: where affirmation reaches */}
      <circle
        cx="20"
        cy="6"
        r="0.9"
        fill={color}
        stroke="none"
        opacity="0.65"
      />
    </svg>
  );
}
