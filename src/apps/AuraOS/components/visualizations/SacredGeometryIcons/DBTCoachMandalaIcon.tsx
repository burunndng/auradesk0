/**
 * DBT Coach Master Mandala - Integration of All Paths
 * Concept: The complete DBT journey integrating mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness
 * Symbolism: Four-fold symmetry (quaternary), mandala structure, sacred center, integration
 * Geometry: Mandala with square (4 modules) and circle (wholeness), golden ratio spirals
 * Colors: Purple and indigo in harmonic alternation, center point of transcendence
 */

import React from 'react';

interface DBTCoachMandalaIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function DBTCoachMandalaIcon({
  size = 24,
  className = '',
  color = 'currentColor'
}: DBTCoachMandalaIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle - Wholeness */}
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Four Petals - Four Modules */}
      {/* Top Petal - Mindfulness */}
      <circle cx="12" cy="4" r="2" fill={color} opacity="0.7" />
      <path
        d="M 10 6 Q 12 8 14 6"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
        fill="none"
      />

      {/* Right Petal - Distress Tolerance */}
      <circle cx="20" cy="12" r="2" fill={color} opacity="0.7" />
      <path
        d="M 18 10 Q 20 12 18 14"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
        fill="none"
      />

      {/* Bottom Petal - Emotion Regulation */}
      <circle cx="12" cy="20" r="2" fill={color} opacity="0.7" />
      <path
        d="M 14 18 Q 12 16 10 18"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
        fill="none"
      />

      {/* Left Petal - Interpersonal */}
      <circle cx="4" cy="12" r="2" fill={color} opacity="0.7" />
      <path
        d="M 6 10 Q 4 12 6 14"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
        fill="none"
      />

      {/* Inner Square - Structure and boundaries */}
      <path
        d="M 8 8 L 16 8 L 16 16 L 8 16 Z"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />

      {/* Inner Circle - Unity */}
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Central Point - Sacred Center */}
      <circle cx="12" cy="12" r="1.2" fill={color} opacity="1" />

      {/* Harmonic Cross - Cardinal directions */}
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="23"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.2"
      />
      <line
        x1="1"
        y1="12"
        x2="23"
        y2="12"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.2"
      />

      {/* Diagonal Harmonics - Spiraling journey */}
      <line
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        stroke={color}
        strokeWidth="0.3"
        opacity="0.15"
      />
      <line
        x1="20"
        y1="4"
        x2="4"
        y2="20"
        stroke={color}
        strokeWidth="0.3"
        opacity="0.15"
      />
    </svg>
  );
}
