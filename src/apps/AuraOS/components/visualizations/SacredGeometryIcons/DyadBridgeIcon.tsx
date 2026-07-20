import React from 'react';

interface DyadBridgeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Dyad Bridge Icon
 * Concept: Connection that preserves individuality — the sacred space between
 * Symbolism: Two pointed arches (gothic lancets) rising from shared ground,
 *            connected by a bridge at heart-height. The gap between them
 *            is not emptiness but the space where relationship lives.
 * Usage: Relationship work, empathy, attachment, partnership, compassion meditation
 */
export default function DyadBridgeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: DyadBridgeIconProps) {
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
      {/* PRIMARY (2px) - Left arch: the first individual */}
      <path d="M4 20L4 10Q4 4 8 4Q12 4 12 10" strokeWidth="2" />

      {/* PRIMARY (2px) - Right arch: the second individual */}
      <path d="M20 20L20 10Q20 4 16 4Q12 4 12 10" strokeWidth="2" />

      {/* PRIMARY (2px) - Shared ground */}
      <line x1="3" y1="20" x2="21" y2="20" strokeWidth="2" />

      {/* SECONDARY (1.5px) - The Bridge: connection at heart-height */}
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.5" />

      {/* DATA LINES (1px) - Inner vertical axes: each arch's center line */}
      <line x1="8" y1="5" x2="8" y2="20" strokeWidth="1" opacity="0.5" />
      <line x1="16" y1="5" x2="16" y2="20" strokeWidth="1" opacity="0.5" />

      {/* DATA LINES (1px) - Bridge depth markers */}
      <line x1="7" y1="12" x2="7" y2="14" strokeWidth="1" opacity="0.4" />
      <line x1="17" y1="12" x2="17" y2="14" strokeWidth="1" opacity="0.4" />

      {/* DATA LINES (1px) - The meeting point: where both arches touch */}
      <line x1="12" y1="10" x2="12" y2="14" strokeWidth="1" opacity="0.6" />

      {/* DETAILS (0.5px) - Inner echo arches */}
      <path d="M6 19V11Q6 6.5 8 6.5Q10 6.5 10 11" strokeWidth="0.5" opacity="0.3" />
      <path d="M18 19V11Q18 6.5 16 6.5Q14 6.5 14 11" strokeWidth="0.5" opacity="0.3" />

      {/* DETAILS (0.5px) - Horizontal strata below bridge (shared foundation layers) */}
      <line x1="5" y1="16" x2="19" y2="16" strokeWidth="0.5" opacity="0.25" />
      <line x1="6" y1="18" x2="18" y2="18" strokeWidth="0.5" opacity="0.2" />

      {/* FOCAL POINTS (filled) */}
      {/* Crown points: each arch's apex — individual identity */}
      <circle cx="8" cy="4" r="0.9" fill={color} stroke="none" />
      <circle cx="16" cy="4" r="0.9" fill={color} stroke="none" />

      {/* Meeting point: where the arches share a wall */}
      <circle cx="12" cy="10" r="1" fill={color} stroke="none" />

      {/* Bridge midpoint: the heart of connection */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* Root points: grounded in shared earth */}
      <circle cx="4" cy="20" r="0.7" fill={color} stroke="none" />
      <circle cx="20" cy="20" r="0.7" fill={color} stroke="none" />

      {/* Inner axis markers at bridge height */}
      <circle cx="8" cy="12" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="16" cy="12" r="0.5" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}
