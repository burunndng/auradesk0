import React from 'react';

interface TwinPillarsIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * TwinPillars Icon
 * Concept: Boaz and Jachin — the gateway to the Temple of Mysteries
 * Symbolism:
 *   - Boaz (left/north): Severity, darkness, passive, Binah
 *   - Jachin (right/south): Mercy, light, active, Chokmah
 *   - The Void Between: The Middle Pillar, the path of equilibrium
 *   - The Veil: What lies beyond the threshold
 * Geometry: Structural contrast, charged negative space
 */
export default function TwinPillarsIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: TwinPillarsIconProps) {
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
      {/* PRIMARY (2px) - Pillar Frames */}
      {/* Boaz (Left) - Double outline for density */}
      <rect x="3" y="5" width="5" height="15" strokeWidth="1.5" />
      <rect x="4" y="6" width="3" height="13" strokeWidth="0.75" opacity="0.6" />
      {/* Jachin (Right) - Single outline, open */}
      <rect x="16" y="5" width="5" height="15" strokeWidth="1.5" />

      {/* SECONDARY (1.5px) - Capitals */}
      <path d="M2 5H9" strokeWidth="1.5" />
      <path d="M15 5H22" strokeWidth="1.5" />
      <path d="M3 4H8" strokeWidth="1" />
      <path d="M16 4H21" strokeWidth="1" />

      {/* SECONDARY - Base Platform */}
      <path d="M2 20H22" strokeWidth="2" />

      {/* SECONDARY - The Veil/Arch */}
      <path d="M5.5 5Q12 2 18.5 5" strokeWidth="1.5" />

      {/* DATA (1px) - Boaz Internal Structure (Severity Chambers) */}
      <g strokeWidth="0.5" opacity="0.5">
        <path d="M4 8H7" />
        <path d="M4 11H7" />
        <path d="M4 14H7" />
        <path d="M4 17H7" />
      </g>

      {/* DATA (1px) - Jachin Internal Structure (Open Light) */}
      <g strokeWidth="0.5" opacity="0.3">
        <path d="M18.5 8V17" strokeDasharray="1 2" />
      </g>

      {/* DATA (1px) - Threshold Energy (The Charged Void) */}
      <g strokeWidth="0.75" opacity="0.4">
        <path d="M9 8H15" />
        <path d="M10 11H14" />
        <path d="M9 14H15" />
        <path d="M10 17H14" />
      </g>

      {/* DETAIL (0.5px) - The Hidden Path */}
      <path
        d="M12 5V20"
        strokeWidth="0.5"
        strokeDasharray="1 2"
        opacity="0.3"
      />

      {/* DETAIL - Ascending sparks between pillars */}
      <g strokeWidth="0.5" opacity="0.35">
        <path d="M11 16L12 15L13 16" />
        <path d="M11 13L12 12L13 13" />
        <path d="M11 10L12 9L13 10" />
      </g>

      {/* FOCAL - Spheres on Capitals (Chokmah/Binah) */}
      <circle cx="5.5" cy="3" r="1.2" fill={color} stroke="none" />
      <circle cx="18.5" cy="3" r="1.2" fill={color} stroke="none" />

      {/* FOCAL - The Point of Initiation */}
      <circle cx="12" cy="18" r="0.8" fill={color} stroke="none" />

      {/* FOCAL - The Mystery Beyond */}
      <circle cx="12" cy="6" r="0.5" fill={color} stroke="none" opacity="0.6" />
    </svg>
  );
}
