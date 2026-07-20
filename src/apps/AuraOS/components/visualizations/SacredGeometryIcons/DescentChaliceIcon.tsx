import React from 'react';

interface DescentChaliceIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function DescentChaliceIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: DescentChaliceIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Vessel Perimeter */}
      <path d="M4 4L20 4L12 20L4 4Z" strokeWidth="2" />

      {/* INTERNAL STRATIFICATION (1px) - The Pooling Depths */}
      <line x1="6.67" y1="8.67" x2="17.33" y2="8.67" strokeWidth="1" opacity="0.7" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1" opacity="0.8" />
      <line x1="9.33" y1="15.33" x2="14.67" y2="15.33" strokeWidth="1" opacity="0.9" />

      {/* THE CONCENTRATED ESSENCE (Filled) - The Sacred Drop */}
      <circle cx="12" cy="18" r="2" fill={color} stroke="none" />

      {/* RECEIVING APERTURE (2.5px) - The Open Mouth */}
      <line x1="4" y1="4" x2="20" y2="4" strokeWidth="2.5" strokeLinecap="square" />

      {/* DESCENT CURRENT (0.5px) - The Influx */}
      <line x1="8" y1="2" x2="9.33" y2="6" strokeWidth="0.5" opacity="0.5" />
      <line x1="12" y1="1" x2="12" y2="6" strokeWidth="0.5" opacity="0.6" />
      <line x1="16" y1="2" x2="14.67" y2="6" strokeWidth="0.5" opacity="0.5" />

      {/* CONTAINMENT AURA (0.5px) - The Sacred Boundary */}
      <path d="M3 3.5L21 3.5L12 21.5L3 3.5Z" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
