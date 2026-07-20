import React from 'react';

interface EngramArchiveIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function EngramArchiveIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: EngramArchiveIconProps) {
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
      <path d="M12 2L20 12L12 22L4 12L12 2Z" strokeWidth="2" />
      {/* INTERNAL FACETS (1px) */}
      <path d="M4 12H20" strokeWidth="1" />
      <path d="M12 2V22" strokeWidth="1" />
      {/* THE DATA CORE (Filled) */}
      <path d="M12 8L15 12L12 16L9 12L12 8Z" fill={color} stroke="none" />
      {/* REFLECTION LINES (0.5px) */}
      <line x1="7" y1="8" x2="10" y2="12" strokeWidth="0.5" opacity="0.5" />
      <line x1="7" y1="16" x2="10" y2="12" strokeWidth="0.5" opacity="0.5" />
      <line x1="17" y1="8" x2="14" y2="12" strokeWidth="0.5" opacity="0.5" />
      <line x1="17" y1="16" x2="14" y2="12" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
