import React from 'react';

interface ResonatorIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Resonator Icon
 * Represents harmonic vibration and standing waves
 * Symbol: The resonance chamber and vibrational nature of reality
 * Usage: Shadow Tools, Inner Vibration, Frequency Work
 */
export default function ResonatorIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ResonatorIconProps) {
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
      {/* The Resonance Chamber (Capsule) */}
      <rect x="6" y="2" width="12" height="20" rx="6" />

      {/* The Standing Wave Pattern (Frequency visualization) */}
      {/* Represents the oscillation between the two poles of the capsule */}
      <path d="M12 2V22" opacity="0.15" strokeWidth="0.8" />

      {/* Left wave path */}
      <path d="M12 2C10 6 10 8 12 12C14 16 14 18 12 22" opacity="0.7" />

      {/* Right wave path */}
      <path d="M12 2C14 6 14 8 12 12C10 16 10 18 12 22" opacity="0.7" />

      {/* Anti-nodal points (maximum vibration) */}
      <circle cx="12" cy="6" r="1" opacity="0.5" />
      <circle cx="12" cy="18" r="1" opacity="0.5" />

      {/* Nodal Points (The Silence amidst the noise) */}
      <circle cx="6" cy="12" r="0.9" fill={color} />
      <circle cx="18" cy="12" r="0.9" fill={color} />

      {/* Central resonance point */}
      <circle cx="12" cy="12" r="0.6" fill={color} opacity="0.8" />

      {/* Harmonic overtone circles */}
      <circle cx="12" cy="12" r="2" opacity="0.3" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="3.5" opacity="0.15" strokeWidth="0.8" />
    </svg>
  );
}
