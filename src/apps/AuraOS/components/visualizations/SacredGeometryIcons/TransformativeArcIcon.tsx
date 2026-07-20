import React from 'react';

/**
 * TransformativeArcIcon
 *
 * Concept: Intentional transformation trajectory with concentric progression
 * Geometry: Concentric arcs with radiating pathways (3-4 layers)
 * Symbolism: Arc showing upward transformation journey with radial alignment points
 *
 * Design: Series of concentric arcs opening upward, with vertical and radial guide lines,
 * representing the ascending transformation arc from current state to elevated possibility.
 */

interface TransformativeArcIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function TransformativeArcIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: TransformativeArcIconProps) {
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
      {/* OUTERMOST ARC (2px) - Opening upward */}
      <path
        d="M4 18 Q4 8 12 5 Q20 8 20 18"
        strokeWidth="2"
        fill="none"
      />

      {/* SECOND ARC (1.5px) */}
      <path
        d="M6 16 Q6 10 12 8 Q18 10 18 16"
        strokeWidth="1.5"
        fill="none"
      />

      {/* THIRD ARC (1px) */}
      <path
        d="M8 14 Q8 11 12 10 Q16 11 16 14"
        strokeWidth="1"
        fill="none"
      />

      {/* INNERMOST ARC (0.5px) */}
      <path
        d="M10 12 Q10 10.5 12 10 Q14 10.5 14 12"
        strokeWidth="0.5"
        fill="none"
        opacity="0.6"
      />

      {/* VERTICAL ALIGNMENT LINE (2px) */}
      <line x1="12" y1="5" x2="12" y2="22" strokeWidth="2" opacity="0.7" />

      {/* RADIAL GUIDE LINES (1px) */}
      {/* Top-left radial */}
      <line x1="12" y1="5" x2="6" y2="10" strokeWidth="1" opacity="0.5" />

      {/* Top-right radial */}
      <line x1="12" y1="5" x2="18" y2="10" strokeWidth="1" opacity="0.5" />

      {/* BOTTOM GROUNDING POINTS (0.5px) */}
      <line x1="10" y1="18" x2="14" y2="18" strokeWidth="0.5" opacity="0.5" />

      {/* TRANSFORMATION APEX (Filled) */}
      <circle cx="12" cy="5" r="1.2" fill={color} stroke="none" />

      {/* ANCHOR POINT (Filled) */}
      <circle cx="12" cy="18" r="0.8" fill={color} stroke="none" opacity="0.7" />

      {/* RADIAL NODE POINTS (0.6px) */}
      <circle cx="6" cy="10" r="0.5" fill={color} stroke="none" opacity="0.6" />
      <circle cx="18" cy="10" r="0.5" fill={color} stroke="none" opacity="0.6" />
    </svg>
  );
}
