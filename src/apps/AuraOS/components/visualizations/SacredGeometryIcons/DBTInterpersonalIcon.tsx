/**
 * DBT Interpersonal Effectiveness Icon - Connection
 * Concept: Authentic relating and interdependent community
 * Symbolism: Three nodes (self and others), connections, triangular stability
 * Geometry: Equilateral triangle with nodes and harmonic connections (Platonic geometry)
 * Colors: Purple for individual, indigo for others, unified in relationship
 */

import React from 'react';

interface DBTInterpersonalIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function DBTInterpersonalIcon({
  size = 24,
  className = '',
  color = 'currentColor'
}: DBTInterpersonalIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Node - Self */}
      <circle
        cx="12"
        cy="5"
        r="1.5"
        fill={color}
        opacity="0.9"
      />

      {/* Bottom Left Node - Other 1 */}
      <circle
        cx="6"
        cy="17"
        r="1.5"
        fill={color}
        opacity="0.8"
      />

      {/* Bottom Right Node - Other 2 */}
      <circle
        cx="18"
        cy="17"
        r="1.5"
        fill={color}
        opacity="0.8"
      />

      {/* Connection Lines - Equilateral Triangle */}
      <line
        x1="12"
        y1="6.5"
        x2="6"
        y2="15.5"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      <line
        x1="12"
        y1="6.5"
        x2="18"
        y2="15.5"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      <line
        x1="6"
        y1="17"
        x2="18"
        y2="17"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Central Heart - Reciprocal Care */}
      <path
        d="M 12 11 L 11 10 Q 10 9 9.5 10 Q 9 10.5 10 11.5 L 12 13 L 14 11.5 Q 15 10.5 14.5 10 Q 14 9 13 10 Z"
        fill={color}
        opacity="0.6"
      />

      {/* Harmonic Ring - Field of relationship */}
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.2"
      />
    </svg>
  );
}
