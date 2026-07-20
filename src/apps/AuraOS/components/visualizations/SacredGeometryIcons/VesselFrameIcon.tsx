import React from 'react';

interface VesselFrameIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function VesselFrameIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: VesselFrameIconProps) {
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
      <line x1="12" y1="6" x2="12" y2="22" strokeWidth="2" />
      <circle cx="12" cy="4" r="2" strokeWidth="2" />
      {/* BILATERAL ARCHITECTURE (1.5px) */}
      <path d="M12 8L6 10L4 16" strokeWidth="1.5" />
      <path d="M12 8L18 10L20 16" strokeWidth="1.5" />
      {/* Lower extensions */}
      <path d="M12 18L7 22" strokeWidth="1.5" />
      <path d="M12 18L17 22" strokeWidth="1.5" />
      {/* THE CORE (1px) */}
      <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1" />
      {/* JOINT NODES */}
      <circle cx="6" cy="10" r="1" fill={color} stroke="none" />
      <circle cx="18" cy="10" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="18" r="1.5" fill={color} stroke="none" />
      {/* ENERGY FIELD (0.5px) */}
      <path d="M5 4C3 8 3 16 5 20" strokeWidth="0.5" opacity="0.4" />
      <path d="M19 4C21 8 21 16 19 20" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
