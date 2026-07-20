import React from 'react';

interface FocusApertureIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function FocusApertureIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: FocusApertureIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) */}
      <path d="M4 8V4H8" strokeWidth="2" />
      <path d="M20 8V4H16" strokeWidth="2" />
      <path d="M4 16V20H8" strokeWidth="2" />
      <path d="M20 16V20H16" strokeWidth="2" />
      {/* THE ALIGNMENT RINGS (1px) */}
      <circle cx="12" cy="12" r="6" strokeWidth="1" />
      {/* THE SINGULARITY (Filled) */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
      {/* CROSSHAIR GUIDES (0.5px) */}
      <line x1="12" y1="2" x2="12" y2="5" strokeWidth="0.5" opacity="0.6" />
      <line x1="12" y1="19" x2="12" y2="22" strokeWidth="0.5" opacity="0.6" />
      <line x1="2" y1="12" x2="5" y2="12" strokeWidth="0.5" opacity="0.6" />
      <line x1="19" y1="12" x2="22" y2="12" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}
