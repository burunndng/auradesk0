import React from 'react';

interface AscensionFlameIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function AscensionFlameIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: AscensionFlameIconProps) {
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
      <path d="M12 2C12 2 8 6 8 10C8 12 9 14 10 15C9 16 8 18 8 19C8 21 10 22 12 22C14 22 16 21 16 19C16 18 15 16 14 15C15 14 16 12 16 10C16 6 12 2 12 2Z" strokeWidth="2" />
      {/* THE INNER FLAME (1.5px) */}
      <path d="M12 7C12 7 10 9 10 11C10 12.5 11 14 12 14C13 14 14 12.5 14 11C14 9 12 7 12 7Z" strokeWidth="1.5" />
      {/* THE SPARK (Filled) */}
      <circle cx="12" cy="11" r="1.5" fill={color} stroke="none" />
      {/* ASCENSION RAYS (0.5px) */}
      <line x1="12" y1="2" x2="12" y2="0" strokeWidth="0.5" opacity="0.4" />
      <line x1="10" y1="3" x2="9" y2="1" strokeWidth="0.5" opacity="0.3" />
      <line x1="14" y1="3" x2="15" y2="1" strokeWidth="0.5" opacity="0.3" />
      {/* GROUNDING POINT (1px) */}
      <path d="M10 20C10 20 11 19 12 19C13 19 14 20 14 20" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
