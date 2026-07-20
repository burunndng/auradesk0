import React from 'react';

interface SomaticPillarIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Somatic Pillar Icon
 * Concept: The body as axis mundi — the vertical temple between earth and sky
 * Symbolism: A rooted column crossed by horizontal strata of decreasing width,
 *            anchored in earth below, opening to sky above. The body is not
 *            a container for consciousness — it is the axis consciousness moves along.
 * Usage: Body scan, grounding practices, somatic tracking, posture, embodiment
 */
export default function SomaticPillarIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SomaticPillarIconProps) {
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
      {/* PRIMARY (2px) - The Central Axis: spine, sushumna, world pillar */}
      <line x1="12" y1="4" x2="12" y2="19" strokeWidth="2" />

      {/* PRIMARY (2px) - Root platform: connection to earth */}
      <line x1="5" y1="19" x2="19" y2="19" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Somatic strata: zones of embodied experience */}
      {/* Root/pelvic stratum — widest, most grounded */}
      <line x1="6" y1="17" x2="18" y2="17" strokeWidth="1.5" />
      {/* Solar/abdominal stratum */}
      <line x1="7" y1="14" x2="17" y2="14" strokeWidth="1.5" />
      {/* Heart stratum */}
      <line x1="8" y1="11" x2="16" y2="11" strokeWidth="1.5" />
      {/* Throat stratum — narrowest bar */}
      <line x1="9" y1="8" x2="15" y2="8" strokeWidth="1.5" />

      {/* DATA LINES (1px) - Crown opening: diverging lines, the axis opens */}
      <line x1="12" y1="4" x2="9" y2="2.5" strokeWidth="1" />
      <line x1="12" y1="4" x2="15" y2="2.5" strokeWidth="1" />

      {/* DATA LINES (1px) - Root anchoring: lines descending into ground */}
      <line x1="12" y1="19" x2="9" y2="21.5" strokeWidth="1" />
      <line x1="12" y1="19" x2="15" y2="21.5" strokeWidth="1" />

      {/* DATA LINES (1px) - Subtle asymmetric energy markers on strata */}
      <line x1="6" y1="17" x2="6" y2="15.5" strokeWidth="1" opacity="0.4" />
      <line x1="18" y1="17" x2="18" y2="15.5" strokeWidth="1" opacity="0.4" />
      <line x1="8" y1="11" x2="8" y2="9.5" strokeWidth="1" opacity="0.4" />
      <line x1="16" y1="11" x2="16" y2="9.5" strokeWidth="1" opacity="0.4" />

      {/* DETAILS (0.5px) - Mid-strata markers: zones between the major lines */}
      <line x1="9.5" y1="15.5" x2="14.5" y2="15.5" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="12.5" x2="14" y2="12.5" strokeWidth="0.5" opacity="0.3" />
      <line x1="10.5" y1="9.5" x2="13.5" y2="9.5" strokeWidth="0.5" opacity="0.3" />

      {/* DETAILS (0.5px) - Crown radiance: faint outer divergence lines */}
      <line x1="12" y1="4" x2="7.5" y2="3" strokeWidth="0.5" opacity="0.25" />
      <line x1="12" y1="4" x2="16.5" y2="3" strokeWidth="0.5" opacity="0.25" />

      {/* FOCAL POINTS (filled) */}
      {/* Crown point: opening to the above */}
      <circle cx="12" cy="4" r="1.2" fill={color} stroke="none" />

      {/* Stratum intersection points: embodied awareness nodes */}
      <circle cx="12" cy="8" r="0.8" fill={color} stroke="none" />
      <circle cx="12" cy="11" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="14" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="17" r="1.2" fill={color} stroke="none" />

      {/* Root point: connection to ground */}
      <circle cx="12" cy="19" r="1.3" fill={color} stroke="none" />

      {/* Crown tips */}
      <circle cx="9" cy="2.5" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="15" cy="2.5" r="0.5" fill={color} stroke="none" opacity="0.7" />

      {/* Root tips */}
      <circle cx="9" cy="21.5" r="0.5" fill={color} stroke="none" opacity="0.6" />
      <circle cx="15" cy="21.5" r="0.5" fill={color} stroke="none" opacity="0.6" />
    </svg>
  );
}
