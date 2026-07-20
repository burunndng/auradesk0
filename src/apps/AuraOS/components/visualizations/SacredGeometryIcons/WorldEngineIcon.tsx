import React from 'react';

interface WorldEngineIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * World Engine Icon
 * Concept: The Polyhedral Core - manipulation of reality, network state
 * Symbolism: Geodesic sphere, power source, hexagonal stability
 * Usage: Networks, Global State, Infrastructure, Settings
 */
export default function WorldEngineIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: WorldEngineIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The "Hit Box" */}
      <path
        d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
        strokeWidth="2"
      />

      {/* SECONDARY DATA LINES (1px) - The "3D Mesh" */}
      <path d="M12 22V12" strokeWidth="1" />
      <path d="M12 12L21 7" strokeWidth="1" />
      <path d="M12 12L3 7" strokeWidth="1" />
      <path d="M7.5 4.5L16.5 19.5" strokeWidth="0.5" opacity="0.6" />
      <path d="M16.5 4.5L7.5 19.5" strokeWidth="0.5" opacity="0.6" />

      {/* THE CORE (The "Active" State) */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
    </svg>
  );
}
