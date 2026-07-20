import React from 'react';

interface AlgorithmIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function AlgorithmIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: AlgorithmIconProps) {
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
      <path d="M12 2L2 12L12 22L22 12L12 2Z" strokeWidth="2" />
      {/* THE APERTURE (1.5px) */}
      <path d="M12 6L8 10" strokeWidth="1" />
      <path d="M12 6L16 10" strokeWidth="1" />
      <path d="M12 18L8 14" strokeWidth="1" />
      <path d="M12 18L16 14" strokeWidth="1" />
      {/* THE DATA PUPIL */}
      <rect x="11" y="11" width="2" height="2" fill={color} stroke="none" />
      {/* RAYS OF COMPUTE (0.5px) */}
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth="0.5" opacity="0.5" />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
