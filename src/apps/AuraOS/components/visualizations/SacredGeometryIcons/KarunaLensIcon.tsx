import React from 'react';

export interface KarunaLensIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function KarunaLensIcon({ size = 24, color = 'currentColor', className = '', ...props }: KarunaLensIconProps) {
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
      {...props}
    >
      <path d="M3 4 A18 18 0 0 0 12 15 A18 18 0 0 0 21 4" strokeWidth="2" />
      <path d="M11.5 10L12 12.5L12.5 10" strokeWidth="1.5" />
      <line x1="6" y1="2" x2="7" y2="6" strokeWidth="1" opacity="0.6" />
      <line x1="9" y1="2" x2="10" y2="9" strokeWidth="1" opacity="0.6" />
      <line x1="12" y1="2" x2="12" y2="10" strokeWidth="1" opacity="0.7" />
      <line x1="15" y1="2" x2="14" y2="9" strokeWidth="1" opacity="0.6" />
      <line x1="18" y1="2" x2="17" y2="6" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="19" r="2.5" fill={color} stroke="none" />
      <path d="M7 6C9 11 11 16 12 19" strokeWidth="1" opacity="0.4" />
      <path d="M17 6C15 11 13 16 12 19" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="21.5" x2="12" y2="23" strokeWidth="1" opacity="0.5" />
      <line x1="10" y1="21" x2="8.5" y2="23" strokeWidth="1" opacity="0.4" />
      <line x1="14" y1="21" x2="15.5" y2="23" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
