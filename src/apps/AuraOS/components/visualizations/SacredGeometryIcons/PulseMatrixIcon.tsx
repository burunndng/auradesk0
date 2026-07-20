import React from 'react';

interface PulseMatrixIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function PulseMatrixIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: PulseMatrixIconProps) {
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
      <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="2" />
      {/* THE PULSE (1.5px) */}
      <path d="M3 12H6L8 8L10 16L12 10L14 14L16 12H21" strokeWidth="1.5" />
      {/* NODE CLUSTERS (1px) */}
      <line x1="8" y1="5" x2="8" y2="7" strokeWidth="1" opacity="0.7" />
      <line x1="12" y1="5" x2="12" y2="7" strokeWidth="1" opacity="0.7" />
      <line x1="16" y1="5" x2="16" y2="7" strokeWidth="1" opacity="0.7" />
      <line x1="8" y1="17" x2="8" y2="19" strokeWidth="1" opacity="0.7" />
      <line x1="12" y1="17" x2="12" y2="19" strokeWidth="1" opacity="0.7" />
      <line x1="16" y1="17" x2="16" y2="19" strokeWidth="1" opacity="0.7" />
      {/* THE PEAK */}
      <circle cx="10" cy="16" r="1.5" fill={color} stroke="none" />
      {/* BASELINE HUM (0.5px) */}
      <line x1="5" y1="14" x2="7" y2="14" strokeWidth="0.5" opacity="0.4" />
      <line x1="17" y1="10" x2="19" y2="10" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
