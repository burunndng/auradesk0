import React from 'react';

interface CelestialRoseIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Celestial Rose Icon
 * 12-Fold Cosmic Order - based on Gothic rose window mathematics
 * Symbol: Zodiacal, hourly, and monthly cycles with hexagrammic core
 * Usage: Spirit Tools, Cosmic Order, Time Cycles, Integration
 */
export default function CelestialRoseIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: CelestialRoseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer sacred boundary */}
      <circle cx="50" cy="50" r="47" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="44" strokeWidth="0.3" opacity="0.5" />

      {/* 12 radiating axes (30° intervals) */}
      <g strokeWidth="0.5" opacity="0.6">
        <line x1="50" y1="3" x2="50" y2="16" />
        <line x1="73.5" y1="9.5" x2="66.5" y2="20.5" />
        <line x1="90.5" y1="26.5" x2="79.5" y2="34.5" />
        <line x1="97" y1="50" x2="84" y2="50" />
        <line x1="90.5" y1="73.5" x2="79.5" y2="65.5" />
        <line x1="73.5" y1="90.5" x2="66.5" y2="79.5" />
        <line x1="50" y1="97" x2="50" y2="84" />
        <line x1="26.5" y1="90.5" x2="33.5" y2="79.5" />
        <line x1="9.5" y1="73.5" x2="20.5" y2="65.5" />
        <line x1="3" y1="50" x2="16" y2="50" />
        <line x1="9.5" y1="26.5" x2="20.5" y2="34.5" />
        <line x1="26.5" y1="9.5" x2="33.5" y2="20.5" />
      </g>

      {/* 12 rosette circles: the zodiacal ring */}
      <circle cx="50" cy="22" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="64.2" cy="25.5" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="74.5" cy="35.8" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="78" cy="50" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="74.5" cy="64.2" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="64.2" cy="74.5" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="50" cy="78" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="35.8" cy="74.5" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="25.5" cy="64.2" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="22" cy="50" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="25.5" cy="35.8" r="4.5" opacity="0.7" strokeWidth="0.9" />
      <circle cx="35.8" cy="25.5" r="4.5" opacity="0.7" strokeWidth="0.9" />

      {/* Hexagram: ascending triangle (fire/masculine) */}
      <polygon points="50,30 67,60 33,60" strokeWidth="0.8" opacity="0.8" />

      {/* Hexagram: descending triangle (water/feminine) */}
      <polygon points="50,70 67,40 33,40" strokeWidth="0.8" opacity="0.8" />

      {/* Concentric inner sanctum */}
      <circle cx="50" cy="50" r="15" strokeWidth="0.6" opacity="0.7" />
      <circle cx="50" cy="50" r="9" strokeWidth="0.6" opacity="0.7" />
      <circle cx="50" cy="50" r="4" strokeWidth="0.5" opacity="0.6" />

      {/* Central point: the still center */}
      <circle cx="50" cy="50" r="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}
