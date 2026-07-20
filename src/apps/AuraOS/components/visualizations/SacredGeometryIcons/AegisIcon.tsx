import React from 'react';

interface AegisIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function AegisIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: AegisIconProps) {
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
      <path d="M12 2L3 6V12C3 16.5 6.5 20.5 12 22C17.5 20.5 21 16.5 21 12V6L12 2Z" strokeWidth="2" />
      {/* INNER FORTRESS (1.5px) */}
      <path d="M12 7L16 12L12 17L8 12L12 7Z" strokeWidth="1.5" />
      {/* BINDING CROSS (1px) */}
      <line x1="12" y1="7" x2="12" y2="17" strokeWidth="1" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1" />
      {/* THE KEYSTONE */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
      {/* WARD LINES (0.5px) */}
      <line x1="6" y1="7" x2="6" y2="14" strokeWidth="0.5" opacity="0.4" />
      <line x1="18" y1="7" x2="18" y2="14" strokeWidth="0.5" opacity="0.4" />
      <line x1="12" y1="3" x2="12" y2="5" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
