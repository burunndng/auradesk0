import React from 'react';

interface ChronolithIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ChronolithIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ChronolithIconProps) {
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
      <path d="M8 22L6 8L12 2L18 8L16 22Z" strokeWidth="2" />
      {/* TEMPORAL STRATA (1px) */}
      <line x1="7" y1="18" x2="17" y2="18" strokeWidth="1" />
      <line x1="6.5" y1="13" x2="17.5" y2="13" strokeWidth="1" />
      <line x1="7" y1="8" x2="17" y2="8" strokeWidth="0.5" opacity="0.6" />
      {/* THE CURSOR (1.5px) */}
      <path d="M6.25 10.5L3 10.5L3 15.5L6.75 15.5" strokeWidth="1.5" />
      {/* THE APEX */}
      <circle cx="12" cy="5" r="1.5" fill={color} stroke="none" />
      {/* GHOST LAYER (0.5px) */}
      <line x1="8" y1="20" x2="16" y2="20" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
