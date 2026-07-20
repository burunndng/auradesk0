import React from 'react';

interface VoidEclipseIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function VoidEclipseIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: VoidEclipseIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - incomplete rings */}
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 10.5 20.6 9 20 8" strokeWidth="2" />
      <path d="M12 3C7.02944 3 3 7.02944 3 12C3 13.5 3.4 15 4 16" strokeWidth="2" />
      {/* THE OCCLUSION (Filled) */}
      <circle cx="12" cy="12" r="4" fill={color} stroke="none" />
      {/* DISTORTION FIELDS (1px) */}
      <path d="M19.5 16C18.5 18 16 19 14 19" strokeWidth="1" />
      <path d="M4.5 8C5.5 6 8 5 10 5" strokeWidth="1" />
      {/* THE GLITCH (0.5px) */}
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth="0.5" opacity="0.4" />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth="0.5" opacity="0.4" />
      <path d="M16 4L18 2" strokeWidth="0.5" opacity="0.3" />
      <path d="M8 20L6 22" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
