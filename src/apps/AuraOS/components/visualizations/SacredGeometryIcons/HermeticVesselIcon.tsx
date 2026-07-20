import React from 'react';

interface HermeticVesselIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Hermetic Vessel Icon
 * Represents the Philosopher's Egg or alchemical alembic
 * Symbol: The soul container with quintessence within
 * Usage: Mind Tools, Consciousness Transformation
 */
export default function HermeticVesselIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: HermeticVesselIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* The Capsule Body (The Vessel) */}
      <rect x="7" y="2" width="10" height="20" rx="5" />

      {/* The Seal (Horizontal Barrier) */}
      <path d="M7 16H17" />

      {/* The Quintessence (Inner Spirit Geometry) */}
      {/* A diamond shape representing the crystallized soul suspended in the medium */}
      <path d="M12 5L14.5 9L12 13L9.5 9L12 5Z" />

      {/* The Reflection/Shine (Subtle glass effect) */}
      <path d="M14 4C16 4.5 17 6 17 9" opacity="0.5" />

      {/* Alchemical marker dots */}
      <circle cx="12" cy="18" r="0.75" fill={color} />
    </svg>
  );
}
