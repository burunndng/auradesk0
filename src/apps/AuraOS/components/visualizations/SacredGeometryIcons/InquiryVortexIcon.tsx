import React from 'react';

/**
 * InquiryVortexIcon
 *
 * Concept: Navigation through confusion spiraling inward to clarity
 * Geometry: Spiral inquiry pattern with 4-fold radial symmetry
 * Symbolism: Inward-spiraling pathways converging to center point
 *
 * Design: Outer concentric circles with clockwise spiral tapering to center,
 * representing the journey from peripheral confusion to focused clarity.
 */

interface InquiryVortexIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function InquiryVortexIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: InquiryVortexIconProps) {
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
      {/* OUTER CONCENTRIC CIRCLES (2px) */}
      <circle cx="12" cy="12" r="10" strokeWidth="2" />

      {/* MIDDLE CONCENTRIC CIRCLE (1.5px) */}
      <circle cx="12" cy="12" r="7" strokeWidth="1.5" />

      {/* INNER CONCENTRIC CIRCLE (1px) */}
      <circle cx="12" cy="12" r="4" strokeWidth="1" />

      {/* SPIRAL PATHWAYS (1.5px) - 4-fold radial spiral */}
      {/* Top spiral arm */}
      <path
        d="M12 2 Q14 5 13 8 Q12 9 11 8"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Right spiral arm */}
      <path
        d="M22 12 Q19 14 16 13 Q15 12 16 11"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Bottom spiral arm */}
      <path
        d="M12 22 Q10 19 11 16 Q12 15 13 16"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Left spiral arm */}
      <path
        d="M2 12 Q5 10 8 11 Q9 12 8 13"
        strokeWidth="1.5"
        fill="none"
      />

      {/* CONVERGENCE CENTER (Filled) */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* RADIAL CLARITY GUIDES (0.5px) */}
      <line x1="12" y1="2" x2="12" y2="4" strokeWidth="0.5" opacity="0.5" />
      <line x1="22" y1="12" x2="20" y2="12" strokeWidth="0.5" opacity="0.5" />
      <line x1="12" y1="22" x2="12" y2="20" strokeWidth="0.5" opacity="0.5" />
      <line x1="2" y1="12" x2="4" y2="12" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
