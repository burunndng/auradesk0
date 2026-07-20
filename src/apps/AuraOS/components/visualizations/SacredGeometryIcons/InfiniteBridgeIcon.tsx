import React from 'react';

interface InfiniteBridgeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function InfiniteBridgeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: InfiniteBridgeIconProps) {
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
      {/* THE ABOVE (2px) */}
      <path d="M12 2L7 9H17L12 2Z" strokeWidth="2" />
      {/* THE BELOW (2px) */}
      <path d="M12 22L7 15H17L12 22Z" strokeWidth="2" />
      {/* THE BRIDGE (1.5px) */}
      <line x1="10" y1="9" x2="10" y2="15" strokeWidth="1.5" />
      <line x1="14" y1="9" x2="14" y2="15" strokeWidth="1.5" />
      {/* THE MEETING POINT (Filled) */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
      {/* RESONANCE RINGS (0.5px) */}
      <circle cx="12" cy="12" r="4" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="12" r="6" strokeWidth="0.5" opacity="0.2" />
      {/* LIGHT RAYS (0.5px) */}
      <line x1="12" y1="2" x2="12" y2="0" strokeWidth="0.5" opacity="0.5" />
      <line x1="12" y1="22" x2="12" y2="24" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
