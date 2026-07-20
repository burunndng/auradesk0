import React from 'react';

interface RecursionWellIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Recursion Well Icon
 * Concept: Infinite depth within finite form, the fractal architecture of consciousness
 * Symbolism: Nested squares, each rotated 45° and scaled by 1/√2, creating infinite regress
 *            The eye looking inward finds no bottom—only deeper reflection
 * Usage: Deep meditation, shadow descent, infinite self-inquiry, the bottomless question
 * Mathematical Note: Each inner square's area is exactly half the outer—
 *                    descent through the octave of form
 */
export default function RecursionWellIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: RecursionWellIconProps) {
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
      {/* PRIMARY (2px) - First Square: the boundary of manifest form */}
      <rect x="4" y="4" width="16" height="16" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Second Square: rotated 45°, touching midpoints */}
      <rect
        x="5.86"
        y="5.86"
        width="12.28"
        height="12.28"
        transform="rotate(45 12 12)"
        strokeWidth="1.5"
      />

      {/* DATA LINES (1px) - Third Square: aligned again, half area of first */}
      <rect x="6.5" y="6.5" width="11" height="11" strokeWidth="1" opacity="0.8" />

      {/* DATA LINES (1px) - Fourth Square: rotated, continuing descent */}
      <rect
        x="7.76"
        y="7.76"
        width="8.48"
        height="8.48"
        transform="rotate(45 12 12)"
        strokeWidth="1"
        opacity="0.7"
      />

      {/* DETAILS (0.75px) - Fifth Square: we begin to lose resolution */}
      <rect x="8.5" y="8.5" width="7" height="7" strokeWidth="0.75" opacity="0.55" />

      {/* DETAILS (0.5px) - Sixth Square: the descent continues */}
      <rect
        x="9.38"
        y="9.38"
        width="5.24"
        height="5.24"
        transform="rotate(45 12 12)"
        strokeWidth="0.5"
        opacity="0.45"
      />

      {/* DETAILS (0.5px) - Seventh Square: approaching the infinite */}
      <rect x="10" y="10" width="4" height="4" strokeWidth="0.5" opacity="0.35" />

      {/* DETAILS (0.5px) - Eighth Square: final visible iteration */}
      <rect
        x="10.58"
        y="10.58"
        width="2.84"
        height="2.84"
        transform="rotate(45 12 12)"
        strokeWidth="0.5"
        opacity="0.25"
      />

      {/* DATA LINES (1px) - Diagonal descent lines, marking the spiral path */}
      <line x1="4" y1="4" x2="10" y2="10" strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="4" x2="14" y2="10" strokeWidth="1" opacity="0.3" />
      <line x1="4" y1="20" x2="10" y2="14" strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="20" x2="14" y2="14" strokeWidth="1" opacity="0.3" />

      {/* FOCAL POINTS (filled) - Vertices marking the path of descent */}
      {/* Outer corners */}
      <circle cx="4" cy="4" r="0.9" fill={color} stroke="none" />
      <circle cx="20" cy="4" r="0.9" fill={color} stroke="none" />
      <circle cx="4" cy="20" r="0.9" fill={color} stroke="none" />
      <circle cx="20" cy="20" r="0.9" fill={color} stroke="none" />

      {/* Second square vertices (midpoints of first) */}
      <circle cx="12" cy="4" r="0.7" fill={color} stroke="none" opacity="0.85" />
      <circle cx="20" cy="12" r="0.7" fill={color} stroke="none" opacity="0.85" />
      <circle cx="12" cy="20" r="0.7" fill={color} stroke="none" opacity="0.85" />
      <circle cx="4" cy="12" r="0.7" fill={color} stroke="none" opacity="0.85" />

      {/* THE INFINITE POINT - the well's bottom that is no bottom */}
      <circle cx="12" cy="12" r="1.8" fill={color} stroke="none" />

      {/* Inner light - the eye looking back */}
      <circle cx="12" cy="12" r="0.6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
}
