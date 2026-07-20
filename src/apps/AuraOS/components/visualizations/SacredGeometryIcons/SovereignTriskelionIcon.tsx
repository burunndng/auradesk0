import React from 'react';

interface SovereignTriskelionIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function SovereignTriskelionIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SovereignTriskelionIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Central Axis */}
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />

      {/* THE TRINITY PRONGS (1.5px) - The Three Forces */}
      <path d="M12 7L7 2" strokeWidth="1.5" />
      <path d="M12 7L17 2" strokeWidth="1.5" />

      {/* THE BINDING COLLAR (1px) - Unity Source */}
      <rect x="10" y="6" width="4" height="3" rx="0.5" strokeWidth="1" />

      {/* POWER NODES (Filled) - The Three Aspects */}
      <circle cx="7" cy="2" r="1.5" fill={color} stroke="none" />
      <circle cx="17" cy="2" r="1.5" fill={color} stroke="none" />
      <circle cx="12" cy="2" r="1.5" fill={color} stroke="none" />

      {/* THE GRIP (1.5px) - Wielding Handle */}
      <rect x="10.5" y="18" width="3" height="4" rx="0.5" strokeWidth="1.5" />

      {/* DOMINION BANDS (0.5px) - Control Markers */}
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="0.5" opacity="0.6" />
      <line x1="10" y1="15" x2="14" y2="15" strokeWidth="0.5" opacity="0.6" />

      {/* LIGHTNING DISCHARGE (0.5px) - Active Power */}
      <path d="M7 2L6 4L5 3" strokeWidth="0.5" opacity="0.4" />
      <path d="M17 2L18 4L19 3" strokeWidth="0.5" opacity="0.4" />

      {/* GROUND ANCHOR (Filled) - Earth Connection */}
      <circle cx="12" cy="22" r="1.5" fill={color} stroke="none" />

      {/* RESONANCE FIELD (0.5px) - Sphere of Influence */}
      <circle cx="12" cy="12" r="10" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}
