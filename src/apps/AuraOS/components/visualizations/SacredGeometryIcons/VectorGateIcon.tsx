import React from 'react';

interface VectorGateIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Vector Gate Icon
 * Concept: The Directed Flow - Penrose Triangle logic, stargate/API endpoint
 * Symbolism: Portal frame, directional flow, impossible geometry
 * Usage: Download/Upload, Transit, APIs, Transmutation, Pathways
 */
export default function VectorGateIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: VectorGateIconProps) {
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
      {/* PRIMARY STRUCTURE (2px) - The Portal Frame */}
      <path d="M4 21L7 6H17L20 21" strokeWidth="2" />

      {/* THE KEYSTONE (1.5px) */}
      <path d="M12 2L15 9H9L12 2Z" strokeWidth="1.5" />

      {/* THE ENERGY FIELD (0.5px) - Vertical striated lines */}
      <path d="M12 11V21" strokeWidth="1" />
      <path d="M9 12L7 21" strokeWidth="0.5" opacity="0.5" />
      <path d="M15 12L17 21" strokeWidth="0.5" opacity="0.5" />

      {/* BASE PLATE - Grounding the icon */}
      <line x1="2" y1="21" x2="22" y2="21" strokeWidth="2" />
    </svg>
  );
}
