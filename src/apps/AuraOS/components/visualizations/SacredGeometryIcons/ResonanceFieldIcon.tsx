import React from 'react';

interface ResonanceFieldIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Resonance Field Icon
 * Concept: The geometry of vibration — what sound looks like when matter listens
 * Symbolism: Cymatics — standing waves within a bounded circle creating nodal geometry.
 *            Three arcs at 120° intervals intersect to form a 6-fold pattern,
 *            the same geometry that appears on vibrating plates and singing bowls.
 * Usage: Breathwork resonance, mantra practice, vibrational alignment, somatic attunement
 */
export default function ResonanceFieldIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ResonanceFieldIconProps) {
  // Nodal points: 6 points on inner circle (r=5) at 60° intervals
  // Starting from top (270° in standard coords), going clockwise:
  // 0°→(12,7), 60°→(16.33,9.5), 120°→(16.33,14.5),
  // 180°→(12,17), 240°→(7.67,14.5), 300°→(7.67,9.5)

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
      {/* PRIMARY (2px) - Outer boundary: the field container */}
      <circle cx="12" cy="12" r="9" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Three crossing arcs creating standing-wave interference */}
      {/* Arc 1: sweeps from upper-left node through bottom to upper-right node */}
      <path
        d="M7.7 9.5Q12 19 16.3 9.5"
        strokeWidth="1.5"
      />
      {/* Arc 2: sweeps from top node through lower-left to lower-right node */}
      <path
        d="M12 7Q4 14 16.3 14.5"
        strokeWidth="1.5"
      />
      {/* Arc 3: sweeps from top node through lower-right to lower-left node */}
      <path
        d="M12 7Q20 14 7.7 14.5"
        strokeWidth="1.5"
      />

      {/* DATA LINES (1px) - Inner harmonic circle */}
      <circle cx="12" cy="12" r="5" strokeWidth="1" opacity="0.6" />

      {/* DATA LINES (1px) - Radial lines from center to nodal points */}
      <line x1="12" y1="12" x2="12" y2="7" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="12" x2="16.3" y2="9.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="12" x2="16.3" y2="14.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="12" x2="12" y2="17" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="12" x2="7.7" y2="14.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="12" x2="7.7" y2="9.5" strokeWidth="1" opacity="0.5" />

      {/* DETAILS (0.5px) - Secondary harmonic */}
      <circle cx="12" cy="12" r="2.5" strokeWidth="0.5" opacity="0.35" />

      {/* DETAILS (0.5px) - Connecting adjacent nodal points */}
      <path d="M12 7L16.3 9.5L16.3 14.5L12 17L7.7 14.5L7.7 9.5Z" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL POINTS (filled) - Nodal intersections */}
      {/* Center: fundamental frequency */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* Six nodal points where standing waves reinforce */}
      <circle cx="12" cy="7" r="0.8" fill={color} stroke="none" />
      <circle cx="16.3" cy="9.5" r="0.8" fill={color} stroke="none" />
      <circle cx="16.3" cy="14.5" r="0.8" fill={color} stroke="none" />
      <circle cx="12" cy="17" r="0.8" fill={color} stroke="none" />
      <circle cx="7.7" cy="14.5" r="0.8" fill={color} stroke="none" />
      <circle cx="7.7" cy="9.5" r="0.8" fill={color} stroke="none" />

      {/* Three arc midpoints: antinodal peaks */}
      <circle cx="12" cy="16" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="8.5" cy="10" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="15.5" cy="10" r="0.5" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}
