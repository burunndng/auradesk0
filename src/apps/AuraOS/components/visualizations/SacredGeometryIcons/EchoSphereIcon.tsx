import React from 'react';

interface EchoSphereIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * EchoSphere Icon
 * Concept: The ripple effect of consciousness — Indra's Net manifest
 * Symbolism:
 *   - Concentric rings: Every action radiates outward
 *   - Interference nodes: Where cause and effect crystallize
 *   - Standing waves: Reality stabilizes at harmonic distances
 *   - Radial lines: The eight directions, interconnection paths
 * Geometry: Radial symmetry, wave interference, nodal points
 * Emotional Resonance: Interconnection, cosmic responsibility, ripple effect
 */
export default function EchoSphereIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: EchoSphereIconProps) {
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
      {/* DETAIL - Faint outer boundary (the edge of influence) */}
      <circle cx="12" cy="12" r="10.5" strokeWidth="0.5" opacity="0.1" />

      {/* PRIMARY (2px) - Outermost ring (furthest reach) */}
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />

      {/* SECONDARY (1.5px) - Middle ring (active propagation zone) */}
      <circle cx="12" cy="12" r="6" strokeWidth="1.25" opacity="0.8" />

      {/* DATA (1px) - Inner ring (recent emanation) */}
      <circle cx="12" cy="12" r="3" strokeWidth="1" opacity="0.6" />

      {/* DATA (1px) - Radial connection lines (8 directions) */}
      <g strokeWidth="0.75" opacity="0.35">
        {/* Cardinals */}
        <path d="M12 9 L12 3" />
        <path d="M15 12 L21 12" />
        <path d="M12 15 L12 21" />
        <path d="M9 12 L3 12" />
        {/* Diagonals */}
        <path d="M14 10 L19 5" />
        <path d="M14 14 L19 19" />
        <path d="M10 14 L5 19" />
        <path d="M10 10 L5 5" />
      </g>

      {/* DETAIL (0.5px) - Wave crests between rings (interference) */}
      <g strokeWidth="0.5" opacity="0.25">
        {/* Between inner and middle rings (r=4.5) */}
        <circle cx="12" cy="12" r="4.5" strokeDasharray="2 2" />
        {/* Between middle and outer rings (r=7.5) */}
        <circle cx="12" cy="12" r="7.5" strokeDasharray="3 2" />
      </g>

      {/* DETAIL (0.5px) - Returning wave arcs (inward curves) */}
      <g strokeWidth="0.5" opacity="0.2">
        <path d="M3 10 Q5 12 3 14" />
        <path d="M21 10 Q19 12 21 14" />
        <path d="M10 3 Q12 5 14 3" />
        <path d="M10 21 Q12 19 14 21" />
      </g>

      {/* FOCAL - Center emanation point (the source) */}
      <circle cx="12" cy="12" r="1.3" fill={color} stroke="none" />

      {/* Secondary center ring */}
      <circle cx="12" cy="12" r="2" strokeWidth="0.5" opacity="0.5" />

      {/* FOCAL - Cardinal interference nodes (on middle ring) */}
      <circle cx="12" cy="6" r="0.9" fill={color} stroke="none" />
      <circle cx="18" cy="12" r="0.9" fill={color} stroke="none" />
      <circle cx="12" cy="18" r="0.9" fill={color} stroke="none" />
      <circle cx="6" cy="12" r="0.9" fill={color} stroke="none" />

      {/* FOCAL - Diagonal interference nodes (between rings) */}
      <circle cx="15" cy="9" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="15" cy="15" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="9" cy="15" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="9" cy="9" r="0.6" fill={color} stroke="none" opacity="0.7" />

      {/* FOCAL - Outer ring nodes (edge crystallization) */}
      <g opacity="0.5">
        <circle cx="12" cy="3" r="0.5" fill={color} stroke="none" />
        <circle cx="21" cy="12" r="0.5" fill={color} stroke="none" />
        <circle cx="12" cy="21" r="0.5" fill={color} stroke="none" />
        <circle cx="3" cy="12" r="0.5" fill={color} stroke="none" />
      </g>
    </svg>
  );
}
