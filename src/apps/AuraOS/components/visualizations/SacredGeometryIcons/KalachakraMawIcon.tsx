import React from 'react';

interface KalachakraMawIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function KalachakraMawIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: KalachakraMawIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Outer Rim */}
      <path d="M12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22" strokeWidth="2" />
      <path d="M12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2" strokeWidth="1.5" opacity="0.7" />
      {/* THE TEETH (1.5px) - Inward-Facing Consumption */}
      <path d="M12 2L13.5 5" strokeWidth="1.5" />
      <path d="M20 6L17 7.5" strokeWidth="1.5" />
      <path d="M22 12L19 12.5" strokeWidth="1.5" />
      <path d="M20 18L17 16.5" strokeWidth="1.5" />
      <path d="M12 22L10.5 19" strokeWidth="1.5" />
      <path d="M4 18L7 16.5" strokeWidth="1.5" />
      <path d="M2 12L5 11.5" strokeWidth="1.5" />
      <path d="M4 6L7 7.5" strokeWidth="1.5" />
      {/* THE GRINDING VORTEX (1px) */}
      <path d="M9 7C7 9 7 11 8 12" strokeWidth="1" opacity="0.7" />
      <path d="M15 7C17 9 17 11 16 12" strokeWidth="1" opacity="0.7" />
      <path d="M9 17C7 15 7 13 8 12" strokeWidth="1" opacity="0.7" />
      <path d="M15 17C17 15 17 13 16 12" strokeWidth="1" opacity="0.7" />
      {/* THE VOID CENTER */}
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
      {/* DEBRIS FIELD (0.5px) */}
      <line x1="9" y1="4" x2="10" y2="5" strokeWidth="0.5" opacity="0.4" />
      <line x1="19" y1="9" x2="18" y2="10" strokeWidth="0.5" opacity="0.4" />
      <line x1="15" y1="20" x2="14" y2="19" strokeWidth="0.5" opacity="0.4" />
      <line x1="5" y1="15" x2="6" y2="14" strokeWidth="0.5" opacity="0.4" />
      {/* THE WOBBLE MARKER */}
      <circle cx="13" cy="11" r="0.5" fill={color} stroke="none" opacity="0.5" />
    </svg>
  );
}
