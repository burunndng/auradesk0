import React from 'react';

interface CrystalLatticeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Crystal Lattice Icon
 * Concept: Molecular sacred geometry, crystalline consciousness, atomic order
 * Symbolism: Hexagonal lattice with interconnected nodes forming stable structure
 * Usage: Structure analysis, pattern organization, clarity practices, systems mapping
 */
export default function CrystalLatticeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: CrystalLatticeIconProps) {
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
      {/* PRIMARY (2px) - Outer hexagonal boundary */}
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Central hexagonal cell */}
      <path d="M12 7L16 9.5V14.5L12 17L8 14.5V9.5L12 7Z" strokeWidth="1.5" />

      {/* DATA LINES (1px) - Lattice bond connections (radial) */}
      <line x1="12" y1="2" x2="12" y2="7" strokeWidth="1" />
      <line x1="12" y1="17" x2="12" y2="22" strokeWidth="1" />
      <line x1="3" y1="7" x2="8" y2="9.5" strokeWidth="1" />
      <line x1="21" y1="7" x2="16" y2="9.5" strokeWidth="1" />
      <line x1="3" y1="17" x2="8" y2="14.5" strokeWidth="1" />
      <line x1="21" y1="17" x2="16" y2="14.5" strokeWidth="1" />

      {/* DATA LINES (1px) - Horizontal cross-bonds */}
      <line x1="8" y1="9.5" x2="16" y2="9.5" strokeWidth="1" opacity="0.7" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" strokeWidth="1" opacity="0.7" />

      {/* DETAILS (0.5px) - Inner triangular facets */}
      <path d="M12 7L8 9.5L12 12L16 9.5Z" strokeWidth="0.5" opacity="0.5" />
      <path d="M12 17L8 14.5L12 12L16 14.5Z" strokeWidth="0.5" opacity="0.5" />

      {/* DETAILS (0.5px) - Outer containment field */}
      <circle cx="12" cy="12" r="10" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL POINTS (filled) - Atomic nodes */}
      {/* Center node */}
      <circle cx="12" cy="12" r="1.8" fill={color} stroke="none" />

      {/* Inner hexagon vertices */}
      <circle cx="12" cy="7" r="1" fill={color} stroke="none" />
      <circle cx="16" cy="9.5" r="1" fill={color} stroke="none" />
      <circle cx="16" cy="14.5" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="17" r="1" fill={color} stroke="none" />
      <circle cx="8" cy="14.5" r="1" fill={color} stroke="none" />
      <circle cx="8" cy="9.5" r="1" fill={color} stroke="none" />

      {/* Outer hexagon vertices */}
      <circle cx="12" cy="2" r="0.7" fill={color} stroke="none" />
      <circle cx="21" cy="7" r="0.7" fill={color} stroke="none" />
      <circle cx="21" cy="17" r="0.7" fill={color} stroke="none" />
      <circle cx="12" cy="22" r="0.7" fill={color} stroke="none" />
      <circle cx="3" cy="17" r="0.7" fill={color} stroke="none" />
      <circle cx="3" cy="7" r="0.7" fill={color} stroke="none" />
    </svg>
  );
}
