import React from 'react';
import { IconProps } from './types';

/**
 * DharmaLotus
 * Concept: The blossoming of pure consciousness through righteous action.
 * Symbolism:
 *   - Dharmachakra: The Noble Eightfold path piercing through illusion.
 *   - Lotus Petals: Spiritual awakening unfolding symmetrically.
 *   - Bindu (Center): The unmoving truth of Nirvana at the core of all cycles.
 * Geometry: 8-fold octagonal symmetry with precise Bezier petals contained between concentric rings of r=3, 5, 7, and 9.
 */
export default function DharmaLotus({
  size = 64,
  color = 'currentColor',
  className = ''
}: IconProps) {
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
      {/* PRIMARY - The Great Wheel (Outer boundary and 8 spokes) */}
      <g strokeWidth={2} opacity={1}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="5.636" y1="5.636" x2="18.364" y2="18.364" />
        <line x1="5.636" y1="18.364" x2="18.364" y2="5.636" />
      </g>

      {/* SECONDARY - The Lotus Petals unfolding from the hub */}
      <g strokeWidth={1.5} opacity={0.8}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <path
            key={`petal-${angle}`}
            d="M 12 9 C 14.5 7, 14.5 5, 12 3 C 9.5 5, 9.5 7, 12 9 Z"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
      </g>

      {/* DATA - Concentric cycles of Samsara (Inner Rings) */}
      <g strokeWidth={1} opacity={0.6}>
        <circle cx="12" cy="12" r="5" strokeDasharray="2 3" />
        <circle cx="12" cy="12" r="7" strokeDasharray="4 2" />
      </g>

      {/* DETAIL - Vibrational nodes along the rim */}
      <g strokeWidth={0.5} opacity={0.5}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle
            key={`node-${angle}`}
            cx="12"
            cy="2.5"
            r="0.5"
            transform={`rotate(${angle} 12 12)`}
            fill={color}
          />
        ))}
      </g>

      {/* FOCAL - The Bindu (Nirvana/Stillness) */}
      <g fill={color} stroke="none" opacity={1}>
        <circle cx="12" cy="12" r="1.5" />
      </g>
    </svg>
  );
}
