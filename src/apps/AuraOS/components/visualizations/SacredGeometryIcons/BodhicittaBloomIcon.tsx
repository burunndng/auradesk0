import React from 'react';

export interface BodhicittaBloomIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function BodhicittaBloomIcon({ size = 24, color = 'currentColor', className = '', ...props }: BodhicittaBloomIconProps) {
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
      <path d="M12 2 A5 5 0 0 1 16.33 4.5" strokeWidth="2" />
      <path d="M16.33 4.5 A5 5 0 0 1 16.33 9.5" strokeWidth="2" />
      <path d="M16.33 9.5 A5 5 0 0 1 12 12" strokeWidth="2" />
      <path d="M12 12 A5 5 0 0 1 7.67 9.5" strokeWidth="2" />
      <path d="M7.67 9.5 A5 5 0 0 1 7.67 4.5" strokeWidth="2" />
      <path d="M7.67 4.5 A5 5 0 0 1 12 2" strokeWidth="2" />
      <line x1="12" y1="7" x2="12" y2="4" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="14.6" y2="5.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="14.6" y2="8.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="12" y2="10" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="9.4" y2="8.5" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="9.4" y2="5.5" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="7" r="2" fill={color} stroke="none" />
      <path d="M12 12C12 14 11.5 16 12 18" strokeWidth="1.5" />
      <path d="M12 18C10.5 19 9 18.5 8.5 19" strokeWidth="1" opacity="0.5" />
      <path d="M12 18C13.5 19 15 18.5 15.5 19" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
