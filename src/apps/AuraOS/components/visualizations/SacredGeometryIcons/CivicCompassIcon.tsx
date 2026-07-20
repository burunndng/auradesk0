import React from 'react';

interface CivicCompassIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Civic Compass Icon
 * Concept: Four-quadrant compass rose — AQAL applied to civic life
 * Symbolism: Cardinal directions meeting at a central axis, concentric circles of influence
 * Usage: Integral Civic Practice wizard
 */
export default function CivicCompassIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: CivicCompassIconProps) {
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
      {/* Outer compass ring */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />

      {/* Inner sphere of influence ring */}
      <circle cx="12" cy="12" r="5.5" strokeWidth="0.75" opacity="0.5" />

      {/* Cardinal axes — the four quadrants */}
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="0.5" opacity="0.4" />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="0.5" opacity="0.4" />

      {/* Compass points — four directional arrows */}
      {/* North */}
      <path d="M12 2L14 5.5H10L12 2Z" fill={color} stroke="none" />
      {/* South */}
      <path d="M12 22L14 18.5H10L12 22Z" fill={color} stroke="none" opacity="0.5" />
      {/* East */}
      <path d="M22 12L18.5 14V10L22 12Z" fill={color} stroke="none" opacity="0.5" />
      {/* West */}
      <path d="M2 12L5.5 14V10L2 12Z" fill={color} stroke="none" />

      {/* Diagonal vesica lines — sacred geometry character */}
      <line x1="5" y1="5" x2="19" y2="19" strokeWidth="0.4" opacity="0.25" />
      <line x1="19" y1="5" x2="5" y2="19" strokeWidth="0.4" opacity="0.25" />

      {/* Central axis — the practitioner */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}
