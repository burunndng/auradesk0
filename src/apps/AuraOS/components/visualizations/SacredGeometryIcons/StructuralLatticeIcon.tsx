import React from 'react';

/**
 * StructuralLatticeIcon
 *
 * Concept: Organized knowledge architecture and geodesic framework
 * Geometry: Interlocking geometric lattice with triangular/hexagonal tessellation
 * Symbolism: Interconnected nodes forming structural framework
 *
 * Design: Diamond grid pattern with nodes at intersections, 4-layer depth,
 * representing the foundational structure supporting complex systems.
 */

interface StructuralLatticeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function StructuralLatticeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: StructuralLatticeIconProps) {
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
      {/* OUTER STRUCTURAL FRAME (2px) */}
      <path d="M3 6 L12 2 L21 6 L21 18 L12 22 L3 18 Z" strokeWidth="2" fill="none" />

      {/* SECOND LAYER TESSELLATION (1.5px) */}
      {/* Horizontal divider */}
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.5" />

      {/* Diagonal left */}
      <line x1="3" y1="6" x2="12" y2="12" strokeWidth="1.5" />
      <line x1="12" y1="12" x2="21" y2="18" strokeWidth="1.5" />

      {/* Diagonal right */}
      <line x1="21" y1="6" x2="12" y2="12" strokeWidth="1.5" />
      <line x1="12" y1="12" x2="3" y2="18" strokeWidth="1.5" />

      {/* THIRD LAYER GRID (1px) */}
      {/* Vertical supports */}
      <line x1="7.5" y1="4" x2="7.5" y2="20" strokeWidth="1" opacity="0.7" />
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1" opacity="0.7" />
      <line x1="16.5" y1="4" x2="16.5" y2="20" strokeWidth="1" opacity="0.7" />

      {/* FOURTH LAYER DETAIL (0.5px) */}
      <line x1="5" y1="8" x2="19" y2="8" strokeWidth="0.5" opacity="0.5" />
      <line x1="5" y1="16" x2="19" y2="16" strokeWidth="0.5" opacity="0.5" />

      {/* INTERSECTION NODES (Filled) - Primary nodes */}
      <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
      <circle cx="3" cy="6" r="0.9" fill={color} stroke="none" opacity="0.8" />
      <circle cx="21" cy="6" r="0.9" fill={color} stroke="none" opacity="0.8" />
      <circle cx="3" cy="18" r="0.9" fill={color} stroke="none" opacity="0.8" />
      <circle cx="21" cy="18" r="0.9" fill={color} stroke="none" opacity="0.8" />
      <circle cx="12" cy="2" r="0.9" fill={color} stroke="none" opacity="0.8" />
      <circle cx="12" cy="22" r="0.9" fill={color} stroke="none" opacity="0.8" />

      {/* Secondary intersection nodes */}
      <circle cx="7.5" cy="9" r="0.6" fill={color} stroke="none" opacity="0.6" />
      <circle cx="16.5" cy="9" r="0.6" fill={color} stroke="none" opacity="0.6" />
      <circle cx="7.5" cy="15" r="0.6" fill={color} stroke="none" opacity="0.6" />
      <circle cx="16.5" cy="15" r="0.6" fill={color} stroke="none" opacity="0.6" />
    </svg>
  );
}
