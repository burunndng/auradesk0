import React from 'react';

interface MahakalaSealIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function MahakalaSealIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: MahakalaSealIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Wrathful Face */}
      <path d="M4 8L12 4L20 8V14L16 18H8L4 14V8Z" strokeWidth="2" />
      {/* THE SKULL CROWN (1px) - Mastery Over Death */}
      <circle cx="8" cy="5" r="1.5" strokeWidth="1" />
      <line x1="7.5" y1="5.5" x2="8.5" y2="5.5" strokeWidth="0.5" opacity="0.7" />
      <circle cx="12" cy="3" r="1.5" strokeWidth="1" />
      <line x1="11.5" y1="3.5" x2="12.5" y2="3.5" strokeWidth="0.5" opacity="0.7" />
      <circle cx="16" cy="5" r="1.5" strokeWidth="1" />
      <line x1="15.5" y1="5.5" x2="16.5" y2="5.5" strokeWidth="0.5" opacity="0.7" />
      {/* THE THREE EYES (1px) - Wrathful Perception */}
      <path d="M7 10L9 9L11 10L9 11L7 10Z" strokeWidth="1" />
      <circle cx="9" cy="10" r="0.5" fill={color} stroke="none" />
      <path d="M13 10L15 9L17 10L15 11L13 10Z" strokeWidth="1" />
      <circle cx="15" cy="10" r="0.5" fill={color} stroke="none" />
      <path d="M10 7.5L12 7L14 7.5L12 8L10 7.5Z" strokeWidth="1" />
      <circle cx="12" cy="7.5" r="0.5" fill={color} stroke="none" />
      {/* THE MAW (1.5px) */}
      <path d="M8 13L10 12L12 14L14 12L16 13" strokeWidth="1.5" />
      {/* THE FANGS (1px) */}
      <line x1="10" y1="13" x2="10.5" y2="15" strokeWidth="1" />
      <line x1="14" y1="13" x2="13.5" y2="15" strokeWidth="1" />
      {/* FLAME AUREOLE (0.5px) */}
      <path d="M3 6C2 4 3 2 4 3" strokeWidth="0.5" opacity="0.5" />
      <path d="M2 10C1 8 1 6 2 7" strokeWidth="0.5" opacity="0.4" />
      <path d="M21 6C22 4 21 2 20 3" strokeWidth="0.5" opacity="0.5" />
      <path d="M22 10C23 8 23 6 22 7" strokeWidth="0.5" opacity="0.4" />
      <path d="M8 2C7 1 9 0 10 1" strokeWidth="0.5" opacity="0.3" />
      <path d="M16 2C17 1 15 0 14 1" strokeWidth="0.5" opacity="0.3" />
      {/* GROUNDING CHAIN (0.5px) */}
      <path d="M8 18V20L10 20" strokeWidth="0.5" opacity="0.5" />
      <path d="M16 18V20L14 20" strokeWidth="0.5" opacity="0.5" />
      <path d="M10 20L12 21L14 20" strokeWidth="0.5" opacity="0.5" />
      {/* DHARMA ANCHOR (Filled) */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}
