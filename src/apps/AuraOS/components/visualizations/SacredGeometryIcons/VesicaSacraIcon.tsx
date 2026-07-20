import React from 'react';

interface VesicaSacraIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Vesica Sacra Icon
 * Concept: The generative womb of all sacred proportion
 * Symbolism: Two circles in sacred union, their overlap (vesica piscis) containing
 *            the √3 ratio—mother of the equilateral triangle, hexagon, and all harmonic form
 * Usage: Inception work, creative genesis, union practices, birth/rebirth, threshold crossing
 * Geometric Note: The vesica's height:width ratio is √3:1, foundation of sacred architecture
 */
export default function VesicaSacraIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: VesicaSacraIconProps) {
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
      {/* PRIMARY (2px) - The Two Eternal Circles in Union */}
      <circle cx="8.5" cy="12" r="6.5" strokeWidth="2" />
      <circle cx="15.5" cy="12" r="6.5" strokeWidth="2" />

      {/* SECONDARY (1.5px) - The Vesica Boundary, the Sacred Almond */}
      <path
        d="M12 5.5C9.5 7.5 8.5 9.5 8.5 12C8.5 14.5 9.5 16.5 12 18.5C14.5 16.5 15.5 14.5 15.5 12C15.5 9.5 14.5 7.5 12 5.5Z"
        strokeWidth="1.5"
      />

      {/* DATA LINES (1px) - The Axis Mundi, vertical channel of emergence */}
      <line x1="12" y1="5.5" x2="12" y2="18.5" strokeWidth="1" />

      {/* DATA LINES (1px) - Horizontal axis, the plane of manifestation */}
      <line x1="8.5" y1="12" x2="15.5" y2="12" strokeWidth="1" opacity="0.7" />

      {/* DATA LINES (1px) - The √3 Proportion Lines (equilateral triangle inscribed) */}
      <path d="M12 5.5L8.5 12L12 18.5" strokeWidth="1" opacity="0.6" />
      <path d="M12 5.5L15.5 12L12 18.5" strokeWidth="1" opacity="0.6" />

      {/* DETAILS (0.5px) - Inner harmonic divisions */}
      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="0.5" opacity="0.4" />
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="0.5" opacity="0.4" />

      {/* DETAILS (0.5px) - The fish bladder's inner light */}
      <ellipse cx="12" cy="12" rx="2" ry="4.5" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL POINTS (filled) - The Three Sacred Centers */}
      {/* Center of the Vesica - the point of creation */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* Centers of the parent circles - the eternal witnesses */}
      <circle cx="8.5" cy="12" r="0.8" fill={color} stroke="none" />
      <circle cx="15.5" cy="12" r="0.8" fill={color} stroke="none" />

      {/* Poles of emergence - birth and rebirth */}
      <circle cx="12" cy="5.5" r="0.6" fill={color} stroke="none" />
      <circle cx="12" cy="18.5" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
