import React from 'react';

interface UmbraFragmentIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function UmbraFragmentIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: UmbraFragmentIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Persona (Left) */}
      <path d="M12 22L4 17V7L12 2V22Z" strokeWidth="2" />
      {/* THE FRACTURE (1.5px) - The Shadow (Right) */}
      <path d="M16 4L20 7V12" strokeWidth="1.5" />
      <path d="M18 19L20 17" strokeWidth="1.5" />
      {/* THE SHARDS (Filled) */}
      <circle cx="18" cy="15" r="1.5" fill={color} stroke="none" />
      <circle cx="15" cy="20" r="1" fill={color} stroke="none" />
      <rect x="19" y="9" width="2" height="2" rx="0.5" fill={color} stroke="none" />
      {/* GHOST LINES (0.5px) */}
      <path d="M12 22L20 17V7L12 2" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
      {/* TENSION LINE (1px) */}
      <path d="M14 6L15 8L13 10L14 12" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
