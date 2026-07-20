import React from 'react';

export interface MuditaResonanceIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function MuditaResonanceIcon({ size = 24, color = 'currentColor', className = '', ...props }: MuditaResonanceIconProps) {
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
      <path d="M8 12 A4 4 0 0 1 10 8" strokeWidth="2" />
      <path d="M6 12 A7 7 0 0 1 11 5" strokeWidth="1" opacity="0.5" />
      <path d="M16 12 A4 4 0 0 0 14 8" strokeWidth="2" />
      <path d="M18 12 A7 7 0 0 0 13 5" strokeWidth="1" opacity="0.5" />
      <path d="M8 12 A4 4 0 0 0 10 16" strokeWidth="2" />
      <path d="M6 12 A7 7 0 0 0 11 19" strokeWidth="1" opacity="0.5" />
      <path d="M16 12 A4 4 0 0 1 14 16" strokeWidth="2" />
      <path d="M18 12 A7 7 0 0 1 13 19" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="12" r="2" fill={color} stroke="none" />
      <circle cx="16" cy="12" r="2" fill={color} stroke="none" />
      <circle cx="12" cy="7.5" r="1.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="12" cy="16.5" r="1.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="12" cy="3" r="1" fill={color} stroke="none" opacity="0.4" />
      <circle cx="12" cy="21" r="1" fill={color} stroke="none" opacity="0.4" />
    </svg>
  );
}
