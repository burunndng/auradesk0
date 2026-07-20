import React from 'react';

interface OrbitEclipseIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * OrbitEclipse Icon
 * Concept: The syzygy/alignment of celestial bodies
 * Symbolism: Occult knowledge (hidden light), the moment of transformation
 * Geometry: Concentric circles with radiant corona interference
 * Emotional Resonance: Awe, silence, a moment of cosmic pause, revelation through obscuration
 */
export default function OrbitEclipseIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: OrbitEclipseIconProps) {
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
      {/* PRIMARY (2px) - The Obscuring Body (The Moon/Void) */}
      {/* Represented by the gap between the inner corona and outer field */}
      <circle cx="12" cy="12" r="5" strokeWidth="2" />

      {/* SECONDARY (1.5px) - The Corona (Solar Flare) */}
      {/* Dashed line suggests high frequency energy */}
      <circle
        cx="12"
        cy="12"
        r="8"
        strokeWidth="1.5"
        strokeDasharray="2 4"
        opacity="0.8"
      />

      {/* DETAIL (0.5px) - Orbital Paths */}
      {/* An elliptical orbit crossing the alignment */}
      <path
        d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <path
        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* DATA (1px) - Alignment Rays */}
      {/* Cardinal directions showing the 'Cross of Light' */}
      <g strokeWidth="1.5">
        <path d="M12 2V5" />
        <path d="M12 19V22" />
        <path d="M2 12H5" />
        <path d="M19 12H22" />
      </g>

      {/* FOCAL - The Diamond Ring Effect */}
      {/* A single bright spark at the top right, breaking the symmetry */}
      <circle cx="17.6" cy="6.4" r="1.2" fill={color} stroke="none" />

      {/* DETAIL - Internal Darkness/Depth */}
      <circle cx="12" cy="12" r="2" strokeWidth="0.5" opacity="0.4" />

      {/* DETAIL - Energy hints at cardinal points on inner circle */}
      <g fill={color} opacity="0.5">
        <circle cx="12" cy="7" r="0.4" />
        <circle cx="17" cy="12" r="0.4" />
        <circle cx="12" cy="17" r="0.4" />
        <circle cx="7" cy="12" r="0.4" />
      </g>
    </svg>
  );
}
