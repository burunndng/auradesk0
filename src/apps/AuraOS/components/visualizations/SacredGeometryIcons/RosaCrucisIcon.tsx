import React from 'react';

interface RosaCrucisIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * RosaCrucis Icon
 * Concept: The Rose upon the Cross of Gold — spirit flowering within matter
 * Symbolism:
 *   - Cross: The four elements, the body, manifest existence
 *   - Rose: Unfolding consciousness, the 22 paths, spiritual attainment
 *   - Union: The Great Work accomplished, Tiphareth realized
 * Geometry: 8-fold petal symmetry emerging from cross intersection
 */
export default function RosaCrucisIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: RosaCrucisIconProps) {
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
      {/* PRIMARY (2px) - The Cross of Elements */}
      <path d="M12 2V22" strokeWidth="2" />
      <path d="M2 12H22" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Elemental Terminals */}
      {/* Air (top) - upward triangle hint */}
      <path d="M10 3L12 2L14 3" strokeWidth="1.5" />
      {/* Earth (bottom) - downward triangle hint */}
      <path d="M10 21L12 22L14 21" strokeWidth="1.5" />
      {/* Water (left) - leftward triangle hint */}
      <path d="M3 10L2 12L3 14" strokeWidth="1.5" />
      {/* Fire (right) - rightward triangle hint */}
      <path d="M21 10L22 12L21 14" strokeWidth="1.5" />

      {/* DATA (1px) - Outer Petals (8-fold) */}
      <g strokeWidth="1">
        {/* Cardinal petals */}
        <path d="M12 6Q14 8 12 9Q10 8 12 6" />
        <path d="M12 18Q14 16 12 15Q10 16 12 18" />
        <path d="M6 12Q8 14 9 12Q8 10 6 12" />
        <path d="M18 12Q16 14 15 12Q16 10 18 12" />
        {/* Diagonal petals */}
        <path d="M8 8Q10 9 9 10Q8 9 8 8" opacity="0.8" />
        <path d="M16 8Q14 9 15 10Q16 9 16 8" opacity="0.8" />
        <path d="M8 16Q10 15 9 14Q8 15 8 16" opacity="0.8" />
        <path d="M16 16Q14 15 15 14Q16 15 16 16" opacity="0.8" />
      </g>

      {/* DETAIL (0.5px) - Inner Petal Ring */}
      <circle cx="12" cy="12" r="2.5" strokeWidth="0.5" opacity="0.5" />

      {/* DETAIL (0.5px) - Cross embellishments */}
      <g strokeWidth="0.5" opacity="0.4">
        <path d="M12 5V6M12 18V19" />
        <path d="M5 12H6M18 12H19" />
      </g>

      {/* FOCAL - Rose Heart (Tiphareth) */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* FOCAL - Elemental Points */}
      <circle cx="12" cy="2" r="0.6" fill={color} stroke="none" />
      <circle cx="12" cy="22" r="0.6" fill={color} stroke="none" />
      <circle cx="2" cy="12" r="0.6" fill={color} stroke="none" />
      <circle cx="22" cy="12" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
