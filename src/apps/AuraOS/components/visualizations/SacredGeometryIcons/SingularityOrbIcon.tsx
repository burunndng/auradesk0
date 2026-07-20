import React from 'react';

interface SingularityOrbIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function SingularityOrbIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SingularityOrbIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Outer Membrane */}
      <circle cx="12" cy="12" r="9" strokeWidth="2" />

      {/* DENSITY SHELLS - Layers of Compression */}
      <circle cx="12" cy="12" r="7" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="5" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="12" r="3" strokeWidth="1" opacity="0.3" />

      {/* THE CORE SINGULARITY (Filled) - The Zero Point */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />

      {/* ORBITAL RINGS (0.5px) - The Paths of Manifestation */}
      <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth="0.5" opacity="0.4" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth="0.5" opacity="0.4" transform="rotate(-30 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth="0.5" opacity="0.4" transform="rotate(90 12 12)" />

      {/* CARDINAL ANCHORS (Filled) - The Four Directions */}
      <circle cx="12" cy="3" r="0.5" fill={color} stroke="none" opacity="0.6" />
      <circle cx="21" cy="12" r="0.5" fill={color} stroke="none" opacity="0.6" />
      <circle cx="12" cy="21" r="0.5" fill={color} stroke="none" opacity="0.6" />
      <circle cx="3" cy="12" r="0.5" fill={color} stroke="none" opacity="0.6" />

      {/* PHOTON ESCAPE (0.5px) - Light Leaking */}
      <line x1="12" y1="3" x2="12" y2="1" strokeWidth="0.5" opacity="0.3" />
      <line x1="21" y1="12" x2="23" y2="12" strokeWidth="0.5" opacity="0.3" />
      <line x1="12" y1="21" x2="12" y2="23" strokeWidth="0.5" opacity="0.3" />
      <line x1="3" y1="12" x2="1" y2="12" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
