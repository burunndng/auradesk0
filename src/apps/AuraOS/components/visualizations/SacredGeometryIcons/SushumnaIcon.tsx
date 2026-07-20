import React from 'react';

interface SushumnaIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Sushumna Icon
 * Represents the Central Energy Channel connecting Root to Crown
 * Symbol: The subtle body's primary energy conduit
 * Usage: Spirit Tools, Energy Work, Chakra Alignment
 */
export default function SushumnaIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: SushumnaIconProps) {
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
      {/* The Channel Boundaries (Capsule Walls) */}
      <path d="M7 7V17" />
      <path d="M17 7V17" />

      {/* The Top Cap (Crown) */}
      <path d="M7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7" />

      {/* The Bottom Cap (Root) */}
      <path d="M17 17C17 19.7614 14.7614 22 12 22C9.23858 22 7 19.7614 7 17" />

      {/* The Spinal Nodes (Three Primary Chakras) */}
      <circle cx="12" cy="7" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="12" cy="17" r="1.2" />

      {/* The Flow (Energy current) - Ida and Pingala spirals */}
      <path
        d="M12 2V5"
        opacity="0.6"
        strokeWidth="0.9"
      />
      <path
        d="M12 19V22"
        opacity="0.6"
        strokeWidth="0.9"
      />

      {/* Subtle energy waves */}
      <path
        d="M9.5 10C9.5 10 9 11 9.5 12C10 13 10.5 12 10.5 12"
        opacity="0.4"
        strokeWidth="0.8"
      />
      <path
        d="M13.5 10C13.5 10 14 11 13.5 12C13 13 12.5 12 12.5 12"
        opacity="0.4"
        strokeWidth="0.8"
      />
    </svg>
  );
}
