import React from 'react';

interface CrucibleIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function CrucibleIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: CrucibleIconProps) {
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
      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" strokeWidth="2" />
      {/* THE FLOW (1px) */}
      <path d="M7 6L12 12L17 18" strokeWidth="1" />
      <path d="M4 12H8" strokeWidth="0.5" opacity="0.5" />
      <path d="M16 12H20" strokeWidth="0.5" opacity="0.5" />
      {/* THE DUALITY */}
      <circle cx="8" cy="7" r="2" strokeWidth="1.5" />
      <rect x="15" y="15" width="3" height="3" fill={color} stroke="none" />
      {/* CATALYST MARKS (0.5px) */}
      <line x1="10" y1="4" x2="11" y2="5" strokeWidth="0.5" opacity="0.6" />
      <line x1="14" y1="4" x2="13" y2="5" strokeWidth="0.5" opacity="0.6" />
      <line x1="10" y1="20" x2="11" y2="19" strokeWidth="0.5" opacity="0.6" />
      <line x1="14" y1="20" x2="13" y2="19" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}
