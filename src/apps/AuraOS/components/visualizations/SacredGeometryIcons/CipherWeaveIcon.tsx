import React from 'react';

interface CipherWeaveIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * CipherWeave Icon
 * Concept: The interconnectivity of all things / The Digital Akasha
 * Symbolism: Indra's Net, neural pathways, the structure of information
 * Geometry: Hexagonal node network with organic curved linkages
 * Emotional Resonance: Connectivity, complexity, intelligence, ancient wisdom meeting future tech
 */
export default function CipherWeaveIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: CipherWeaveIconProps) {
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
      {/* FOCAL - The Master Node (Source) */}
      <circle cx="12" cy="12" r="2" strokeWidth="2" />
      <circle cx="12" cy="12" r="0.8" fill={color} stroke="none" />

      {/* SECONDARY - Satellite Nodes (The Hexagon) */}
      {/* Top */}
      <circle cx="12" cy="4" r="1.2" strokeWidth="1.5" />
      {/* Bottom */}
      <circle cx="12" cy="20" r="1.2" strokeWidth="1.5" />
      {/* Top Left */}
      <circle cx="5" cy="8" r="1.2" strokeWidth="1.5" />
      {/* Top Right */}
      <circle cx="19" cy="8" r="1.2" strokeWidth="1.5" />
      {/* Bottom Left */}
      <circle cx="5" cy="16" r="1.2" strokeWidth="1.5" />
      {/* Bottom Right */}
      <circle cx="19" cy="16" r="1.2" strokeWidth="1.5" />

      {/* PRIMARY - The Weave (Connections) */}
      {/* Vertical Axis connections */}
      <path d="M12 6V10" strokeWidth="1" />
      <path d="M12 14V18" strokeWidth="1" />

      {/* Diagonal Connections - Straight lines for precision */}
      <g strokeWidth="1" opacity="0.8">
        {/* Center to Top-Right */}
        <path d="M13.5 11L18 9" />
        {/* Center to Top-Left */}
        <path d="M10.5 11L6 9" />
        {/* Center to Bottom-Right */}
        <path d="M13.5 13L18 15" />
        {/* Center to Bottom-Left */}
        <path d="M10.5 13L6 15" />
      </g>

      {/* DETAIL (0.5px) - The Outer Web (Perimeter) */}
      <g strokeWidth="0.5" opacity="0.4">
        <path d="M12 4L19 8" />
        <path d="M19 8L19 16" />
        <path d="M19 16L12 20" />
        <path d="M12 20L5 16" />
        <path d="M5 16L5 8" />
        <path d="M5 8L12 4" />
      </g>

      {/* DATA - Data Pulses (small dots on lines) */}
      <circle cx="15.5" cy="10" r="0.6" fill={color} stroke="none" />
      <circle cx="8.5" cy="14" r="0.6" fill={color} stroke="none" />

      {/* DETAIL - Inner harmonic resonance (faint circle) */}
      <circle cx="12" cy="12" r="5.5" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}
