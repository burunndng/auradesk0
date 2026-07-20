import React from 'react';

export interface UpekkhaBalanceIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function UpekkhaBalanceIcon({ size = 24, color = 'currentColor', className = '', ...props }: UpekkhaBalanceIconProps) {
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
      <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="2" transform="rotate(-20 12 12)" />
      <ellipse cx="12" cy="12" rx="7" ry="3.5" strokeWidth="1" transform="rotate(12 12 12)" opacity="0.6" />
      <ellipse cx="12" cy="12" rx="4" ry="2.5" strokeWidth="1" transform="rotate(-5 12 12)" opacity="0.4" />
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
      <line x1="3" y1="8" x2="5" y2="9.5" strokeWidth="1" opacity="0.5" />
      <line x1="21" y1="16" x2="19" y2="14.5" strokeWidth="1" opacity="0.5" />
      <line x1="7" y1="2" x2="8" y2="4.5" strokeWidth="1" opacity="0.3" />
      <line x1="17" y1="22" x2="16" y2="19.5" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
