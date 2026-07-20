/**
 * DBT Mindfulness Icon - Wise Mind Integration
 * Concept: The synthesis of emotion mind and reasonable mind into unified awareness
 * Symbolism: Vesica Piscis (sacred intersection), integration, wholeness
 * Geometry: Two overlapping circles creating the almond-shaped intersection (ratio 1:√3)
 * Colors: Purple for emotion, indigo for reason, unified in center
 */

import React from 'react';

interface DBTMindfulnessIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function DBTMindfulnessIcon({
  size = 24,
  className = '',
  color = 'currentColor'
}: DBTMindfulnessIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Circle - Emotion Mind */}
      <circle
        cx="9"
        cy="12"
        r="6"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Right Circle - Reasonable Mind */}
      <circle
        cx="15"
        cy="12"
        r="6"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Center Sacred Intersection - Wise Mind (Vesica Piscis) */}
      <ellipse
        cx="12"
        cy="12"
        rx="2.5"
        ry="4.5"
        fill={color}
        opacity="0.9"
      />

      {/* Central Diamond - Integration Point */}
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill={color}
        opacity="1"
      />

      {/* Harmonics - subtle rings showing unity */}
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}
