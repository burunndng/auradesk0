import React from 'react';

interface SeedOfLifeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Seed of Life Icon
 * Concept: The genesis pattern — seven circles of creation, the blueprint before the Flower
 * Symbolism: First seven days, the womb of sacred geometry, all form emerges from this motif
 * Usage: Creative beginnings, generative practices, foundational blueprints, origin work
 */
export default function SeedOfLifeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SeedOfLifeIconProps) {
  const r = 4.5;

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
      {/* DETAILS (0.5px) — Outer containment: the egg / boundary of potential */}
      <circle cx="12" cy="12" r="10.5" strokeWidth="0.5" opacity="0.3" />

      {/* DATA LINES (1px) — Six petal circles: the days of creation */}
      <circle cx="12" cy="7.5" r={r} strokeWidth="1" />
      <circle cx="15.9" cy="9.75" r={r} strokeWidth="1" />
      <circle cx="15.9" cy="14.25" r={r} strokeWidth="1" />
      <circle cx="12" cy="16.5" r={r} strokeWidth="1" />
      <circle cx="8.1" cy="14.25" r={r} strokeWidth="1" />
      <circle cx="8.1" cy="9.75" r={r} strokeWidth="1" />

      {/* PRIMARY (2px) — Central circle: the first day, the origin point */}
      <circle cx="12" cy="12" r={r} strokeWidth="2" />

      {/* SECONDARY (1.5px) — Inner hexagon: the crystalline structure that emerges */}
      <polygon
        points="12,7.5 15.9,9.75 15.9,14.25 12,16.5 8.1,14.25 8.1,9.75"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* DETAILS (0.5px) — Hex-center spokes: subtle connective tissue */}
      <line x1="12" y1="12" x2="12" y2="7.5" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="12" x2="15.9" y2="9.75" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="12" x2="15.9" y2="14.25" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="12" x2="12" y2="16.5" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="12" x2="8.1" y2="14.25" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="12" x2="8.1" y2="9.75" strokeWidth="0.5" opacity="0.25" />

      {/* FOCAL — The seed: origin of all form */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* FOCAL — Petal centers: the six generative points */}
      <circle cx="12" cy="7.5" r="0.6" fill={color} stroke="none" />
      <circle cx="15.9" cy="9.75" r="0.6" fill={color} stroke="none" />
      <circle cx="15.9" cy="14.25" r="0.6" fill={color} stroke="none" />
      <circle cx="12" cy="16.5" r="0.6" fill={color} stroke="none" />
      <circle cx="8.1" cy="14.25" r="0.6" fill={color} stroke="none" />
      <circle cx="8.1" cy="9.75" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
