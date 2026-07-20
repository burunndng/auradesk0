import React from 'react';

interface QliphothicPillarIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function QliphothicPillarIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: QliphothicPillarIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Cracked Central Pillar */}
      <path d="M12 2V8" strokeWidth="2" />
      <path d="M12.5 9L11.5 11" strokeWidth="2" />
      <path d="M12 12V15" strokeWidth="2" />
      <path d="M11.5 16L12.5 18" strokeWidth="2" />
      <path d="M12 19V22" strokeWidth="2" />
      {/* LEFT PILLAR OF SEVERITY (1.5px) */}
      <path d="M6 5L8 8" strokeWidth="1.5" />
      <path d="M4 14L7 12" strokeWidth="1.5" />
      <path d="M6 21L8 18" strokeWidth="1.5" />
      {/* RIGHT PILLAR OF MERCY (1.5px) */}
      <path d="M18 5L16 8" strokeWidth="1.5" />
      <path d="M20 14L17 12" strokeWidth="1.5" />
      <path d="M18 21L16 18" strokeWidth="1.5" />
      {/* THE SHELLS (1px) - Hollow Sephiroth */}
      <circle cx="12" cy="2" r="1.5" strokeWidth="1" />
      <circle cx="6" cy="5" r="1.5" strokeWidth="1" />
      <circle cx="18" cy="5" r="1.5" strokeWidth="1" />
      <circle cx="4" cy="14" r="1.5" strokeWidth="1" />
      <circle cx="20" cy="14" r="1.5" strokeWidth="1" />
      <circle cx="6" cy="21" r="1.5" strokeWidth="1" />
      <circle cx="18" cy="21" r="1.5" strokeWidth="1" />
      {/* THE ABYSS NODE (Filled) */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
      {/* Kingdom */}
      <circle cx="12" cy="22" r="1.5" strokeWidth="1" />
      {/* CROSS-PATHS (0.5px) */}
      <path d="M6 5L12 12" strokeWidth="0.5" opacity="0.4" />
      <path d="M18 5L12 12" strokeWidth="0.5" opacity="0.4" />
      <path d="M4 14L12 12" strokeWidth="0.5" opacity="0.4" />
      <path d="M20 14L12 12" strokeWidth="0.5" opacity="0.4" />
      <path d="M6 21L12 22" strokeWidth="0.5" opacity="0.3" />
      <path d="M18 21L12 22" strokeWidth="0.5" opacity="0.3" />
      {/* THE VEIL TEAR (0.5px) */}
      <path d="M10 9L14 9" strokeWidth="0.5" opacity="0.5" strokeDasharray="1 1" />
      <path d="M10 16L14 16" strokeWidth="0.5" opacity="0.5" strokeDasharray="1 1" />
    </svg>
  );
}
