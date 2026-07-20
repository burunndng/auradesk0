import React from 'react';

interface SynapseNetworkIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function SynapseNetworkIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SynapseNetworkIconProps) {
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
      <path d="M12 7L16 9.5V14.5L12 17L8 14.5V9.5L12 7Z" strokeWidth="2" />
      {/* EXPANSION NODES (1.5px) */}
      <line x1="12" y1="7" x2="12" y2="3" strokeWidth="1.5" />
      <line x1="16" y1="9.5" x2="20" y2="7" strokeWidth="1.5" />
      <line x1="16" y1="14.5" x2="20" y2="17" strokeWidth="1.5" />
      <line x1="12" y1="17" x2="12" y2="21" strokeWidth="1.5" />
      <line x1="8" y1="14.5" x2="4" y2="17" strokeWidth="1.5" />
      <line x1="8" y1="9.5" x2="4" y2="7" strokeWidth="1.5" />
      {/* SATELLITE NODES (Filled) */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <circle cx="20" cy="7" r="1" fill={color} stroke="none" />
      <circle cx="4" cy="17" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="21" r="1" fill={color} stroke="none" />
      {/* DATA FLOW (0.5px) */}
      <path d="M4 7L8 9.5" strokeWidth="0.5" opacity="0.5" />
      <path d="M20 17L16 14.5" strokeWidth="0.5" opacity="0.5" />
      <path d="M12 3V7" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
