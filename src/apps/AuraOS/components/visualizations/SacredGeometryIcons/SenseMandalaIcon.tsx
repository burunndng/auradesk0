import React from 'react';

interface SenseMandalaIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function SenseMandalaIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SenseMandalaIconProps) {
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
      <path d="M12 2L21.5 9.5L18 21H6L2.5 9.5L12 2Z" strokeWidth="2" />
      {/* THE CONVERGENCE (1.5px) */}
      <line x1="12" y1="2" x2="12" y2="9" strokeWidth="1" />
      <line x1="21.5" y1="9.5" x2="15" y2="11" strokeWidth="1" />
      <line x1="18" y1="21" x2="14" y2="15" strokeWidth="1" />
      <line x1="6" y1="21" x2="10" y2="15" strokeWidth="1" />
      <line x1="2.5" y1="9.5" x2="9" y2="11" strokeWidth="1" />
      {/* SENSE NODES */}
      <circle cx="12" cy="2" r="1.5" strokeWidth="1" />
      <circle cx="21.5" cy="9.5" r="1.5" strokeWidth="1" />
      <circle cx="18" cy="21" r="1.5" strokeWidth="1" />
      <circle cx="6" cy="21" r="1.5" strokeWidth="1" />
      <circle cx="2.5" cy="9.5" r="1.5" strokeWidth="1" />
      {/* THE PROCESSOR */}
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      {/* INNER STAR (0.5px) */}
      <path d="M12 7L15.5 10L14 14.5H10L8.5 10L12 7Z" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
