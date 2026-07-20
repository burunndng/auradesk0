import React from 'react';

interface HyperTesseractIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * HyperTesseract Icon
 * Concept: 4th Dimensional geometry projected into 2D space
 * Symbolism: The hidden complexity of reality, "As above, so below"
 * Geometry: Nested squares with perspective vertices
 * Emotional Resonance: Intellectual expansion, structural integrity, hidden depth mystery
 */
export default function HyperTesseractIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: HyperTesseractIconProps) {
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
      {/* PRIMARY (2px) - The Outer Reality (Matter) */}
      <rect x="3" y="3" width="18" height="18" strokeWidth="2" />

      {/* PRIMARY (1.5px) - The Inner Reality (Spirit) */}
      {/* Centered exactly: (24-8)/2 = 8. So x=8, y=8 */}
      <rect x="8" y="8" width="8" height="8" strokeWidth="1.5" />

      {/* SECONDARY (1px) - The Dimensional Bridges */}
      {/* Connecting corners to corners */}
      <path d="M3 3L8 8" strokeWidth="1" />
      <path d="M21 3L16 8" strokeWidth="1" />
      <path d="M21 21L16 16" strokeWidth="1" />
      <path d="M3 21L8 16" strokeWidth="1" />

      {/* DETAIL (0.5px) - The Ghost Field (Suggestion of rotation) */}
      <g strokeWidth="0.5" opacity="0.4">
        <path d="M12 3V8" />
        <path d="M12 16V21" />
        <path d="M3 12H8" />
        <path d="M16 12H21" />
      </g>

      {/* FOCAL - The Singularity Point */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* DETAIL - Energy Nodes at Inner Vertices */}
      <g fill={color} opacity="0.6">
        <circle cx="8" cy="8" r="0.5" />
        <circle cx="16" cy="8" r="0.5" />
        <circle cx="16" cy="16" r="0.5" />
        <circle cx="8" cy="16" r="0.5" />
      </g>

      {/* DETAIL - Outer corner crystallization */}
      <g fill={color} opacity="0.4">
        <circle cx="3" cy="3" r="0.4" />
        <circle cx="21" cy="3" r="0.4" />
        <circle cx="21" cy="21" r="0.4" />
        <circle cx="3" cy="21" r="0.4" />
      </g>
    </svg>
  );
}
