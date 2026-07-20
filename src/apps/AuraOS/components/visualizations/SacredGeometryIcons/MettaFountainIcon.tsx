import React from 'react';

export interface MettaFountainIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function MettaFountainIcon({ size = 24, color = 'currentColor', className = '', ...props }: MettaFountainIconProps) {
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
      <path d="M12 16V10" strokeWidth="2" />
      <path d="M12 6 A7 7 0 0 0 4 10" strokeWidth="2" />
      <path d="M12 6 A7 7 0 0 1 20 10" strokeWidth="2" />
      <path d="M4 10 A8 8 0 0 0 7 15" strokeWidth="1" opacity="0.6" />
      <path d="M20 10 A8 8 0 0 1 17 15" strokeWidth="1" opacity="0.6" />
      <path d="M7 15C9 17 11 17 12 16" strokeWidth="1" opacity="0.5" />
      <path d="M17 15C15 17 13 17 12 16" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="10" r="2" fill={color} stroke="none" />
      <circle cx="12" cy="4.5" r="1.5" fill={color} stroke="none" opacity="0.6" />
      <path d="M7 15C7 18 9 20 12 20C15 20 17 18 17 15" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
