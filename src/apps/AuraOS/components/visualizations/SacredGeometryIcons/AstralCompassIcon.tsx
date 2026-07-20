import React from 'react';

interface AstralCompassIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Astral Compass Icon
 * Concept: Celestial navigation, stellar wisdom, cosmic orientation
 * Symbolism: Eight-pointed compass rose with orbital rings and stellar markers
 * Usage: Direction setting, alignment practices, navigation, celestial work
 */
export default function AstralCompassIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: AstralCompassIconProps) {
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
      {/* PRIMARY (2px) - Outer orbital ring */}
      <circle cx="12" cy="12" r="9" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Cardinal compass points (4 main directions) */}
      <path d="M12 3L14 8H10L12 3Z" strokeWidth="1.5" /> {/* North */}
      <path d="M21 12L16 14V10L21 12Z" strokeWidth="1.5" /> {/* East */}
      <path d="M12 21L10 16H14L12 21Z" strokeWidth="1.5" /> {/* South */}
      <path d="M3 12L8 10V14L3 12Z" strokeWidth="1.5" /> {/* West */}

      {/* DATA LINES (1px) - Intercardinal points (4 diagonal directions) */}
      <path d="M18.5 5.5L15 9L16 8L17 9L18.5 5.5Z" strokeWidth="1" /> {/* NE */}
      <path d="M18.5 18.5L15 15L16 16L17 15L18.5 18.5Z" strokeWidth="1" /> {/* SE */}
      <path d="M5.5 18.5L9 15L8 16L7 15L5.5 18.5Z" strokeWidth="1" /> {/* SW */}
      <path d="M5.5 5.5L9 9L8 8L7 9L5.5 5.5Z" strokeWidth="1" /> {/* NW */}

      {/* DATA LINES (1px) - Inner cross axes */}
      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1" opacity="0.7" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1" opacity="0.7" />

      {/* DETAILS (0.5px) - Inner orbital ring */}
      <circle cx="12" cy="12" r="5" strokeWidth="0.5" opacity="0.5" />

      {/* DETAILS (0.5px) - Celestial degree markers */}
      <circle cx="12" cy="12" r="7" strokeWidth="0.5" opacity="0.3" strokeDasharray="1.5 2" />

      {/* DETAILS (0.5px) - Diagonal axis lines */}
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" strokeWidth="0.5" opacity="0.4" />
      <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" strokeWidth="0.5" opacity="0.4" />

      {/* FOCAL POINTS (filled) - Center and cardinal stars */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />

      {/* Cardinal direction markers */}
      <circle cx="12" cy="3" r="0.8" fill={color} stroke="none" />
      <circle cx="21" cy="12" r="0.8" fill={color} stroke="none" />
      <circle cx="12" cy="21" r="0.8" fill={color} stroke="none" />
      <circle cx="3" cy="12" r="0.8" fill={color} stroke="none" />

      {/* Intercardinal star markers */}
      <circle cx="18.5" cy="5.5" r="0.6" fill={color} stroke="none" />
      <circle cx="18.5" cy="18.5" r="0.6" fill={color} stroke="none" />
      <circle cx="5.5" cy="18.5" r="0.6" fill={color} stroke="none" />
      <circle cx="5.5" cy="5.5" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
