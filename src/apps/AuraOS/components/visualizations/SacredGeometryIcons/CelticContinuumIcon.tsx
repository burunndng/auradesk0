import React from 'react';
import { IconProps } from './types';

/**
 * CelticContinuum
 * Concept: The eternal intertwining of mind, body, and spirit within the cosmic continuum.
 * Symbolism:
 *   - Triadic Circles: The threefold nature of existence (mind/body/spirit).
 *   - Bounding Ring: The macrocosm that contains and unifies all forces.
 *   - Inner Triangle: The hidden geometric tension bridging the three realms.
 * Geometry: Three circles of radius 4 forming a perfect Vesica triad, enclosed by a bounding circle of radius 8.
 */
export default function CelticContinuum({
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
      {/* PRIMARY - Main Triquetra formation (3 interconnected circles) */}
      <g strokeWidth={2} opacity={1}>
        {/* Top Circle */}
        <circle cx="12" cy="8" r="4" />
        {/* Bottom Left Circle */}
        <circle cx="8.536" cy="14" r="4" />
        {/* Bottom Right Circle */}
        <circle cx="15.464" cy="14" r="4" />
      </g>

      {/* SECONDARY - Bounding macrocosmic ring */}
      <g strokeWidth={1.5} opacity={0.8}>
        <circle cx="12" cy="12" r="8" />
      </g>

      {/* DATA - Hidden structural geometry connecting the centers */}
      <g strokeWidth={1} opacity={0.6} strokeDasharray="1 1.5">
        <polygon points="12,8 15.464,14 8.536,14" />
      </g>

      {/* DETAIL - Central intersecting energy paths */}
      <g strokeWidth={0.5} opacity={0.4}>
        <line x1="12" y1="12" x2="12" y2="4" />
        <line x1="12" y1="12" x2="18.928" y2="16" />
        <line x1="12" y1="12" x2="5.072" y2="16" />
      </g>

      {/* FOCAL - The origin void and the three primary nodes */}
      <g fill={color} stroke="none" opacity={0.9}>
        {/* Central Origin */}
        <circle cx="12" cy="12" r="1.5" />
        {/* Node 1 */}
        <circle cx="12" cy="8" r="0.75" />
        {/* Node 2 */}
        <circle cx="8.536" cy="14" r="0.75" />
        {/* Node 3 */}
        <circle cx="15.464" cy="14" r="0.75" />
      </g>
    </svg>
  );
}
