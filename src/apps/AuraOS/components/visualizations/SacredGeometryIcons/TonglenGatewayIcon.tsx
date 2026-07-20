import React from 'react';

export interface TonglenGatewayIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function TonglenGatewayIcon({ size = 24, color = 'currentColor', className = '', ...props }: TonglenGatewayIconProps) {
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
      <path d="M2 8 A10 10 0 0 1 12 14" strokeWidth="2" />
      <path d="M12 10 A10 10 0 0 1 22 16" strokeWidth="2" />
      <path d="M12 14C12.5 13 12.5 11 12 10" strokeWidth="1.5" />
      <path d="M22 16 A12 12 0 0 1 12 17" strokeWidth="1" opacity="0.4" />
      <path d="M2 8 A12 12 0 0 0 12 7" strokeWidth="1" opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" fill={color} stroke="none" />
      <circle cx="4" cy="8" r="1" fill={color} stroke="none" opacity="0.7" />
      <circle cx="7" cy="10" r="0.5" fill={color} stroke="none" opacity="0.5" />
      <circle cx="20" cy="16" r="1" strokeWidth="1" opacity="0.6" />
      <circle cx="17" cy="15" r="0.5" strokeWidth="1" opacity="0.4" />
      <path d="M3 10L2 8L4 8.5" strokeWidth="1" opacity="0.5" />
      <path d="M21 14L22 16L20 15.5" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
