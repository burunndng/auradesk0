import React from 'react';

interface OuroborosGateIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Ouroboros Gate Icon
 * Concept: Cyclical renewal, eternal return, self-consuming creation
 * Symbolism: Serpent devouring its tail forming infinite loop with inner sacred geometry
 * Usage: Cycle tracking, renewal practices, shadow integration, transformation
 */
export default function OuroborosGateIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: OuroborosGateIconProps) {
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
      {/* PRIMARY (2px) - Outer serpent ring (body) */}
      <circle cx="12" cy="12" r="9" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Serpent head consuming tail */}
      <path d="M20 9C21 11 21 13 20 15L18 13L20 11L18 9" strokeWidth="1.5" />

      {/* SECONDARY (1.5px) - Inner sacred triangle (upward) */}
      <path d="M12 6L17 15H7Z" strokeWidth="1.5" />

      {/* DATA LINES (1px) - Scale segments along serpent body */}
      <path d="M5 7L6.5 8.5" strokeWidth="1" />
      <path d="M3.5 11L5 11" strokeWidth="1" />
      <path d="M4 15L5.5 14" strokeWidth="1" />
      <path d="M7 18.5L8 17" strokeWidth="1" />
      <path d="M11 20L11.5 18.5" strokeWidth="1" />
      <path d="M15 19.5L14.5 18" strokeWidth="1" />

      {/* DATA LINES (1px) - Inner downward triangle (completing hexagram) */}
      <path d="M12 16L7.5 8H16.5Z" strokeWidth="1" opacity="0.7" />

      {/* DETAILS (0.5px) - Inner ring and axis */}
      <circle cx="12" cy="12" r="4" strokeWidth="0.5" opacity="0.5" />
      <line x1="12" y1="6" x2="12" y2="18" strokeWidth="0.5" opacity="0.4" />

      {/* FOCAL POINTS (filled) - Center and triangle vertices */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <circle cx="12" cy="6" r="0.8" fill={color} stroke="none" />
      <circle cx="7" cy="15" r="0.7" fill={color} stroke="none" />
      <circle cx="17" cy="15" r="0.7" fill={color} stroke="none" />

      {/* Head focal point */}
      <circle cx="19" cy="12" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
