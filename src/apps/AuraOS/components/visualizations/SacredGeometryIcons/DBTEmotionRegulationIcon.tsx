/**
 * DBT Emotion Regulation Icon - Equilibrium
 * Concept: Balance between acceptance of feeling and commitment to change
 * Symbolism: Heart (emotion), scales (balance), golden mean proportions
 * Geometry: Heart divided by harmonic line with balance points at φ (golden ratio)
 * Colors: Purple for feeling, indigo for action, unified in harmony
 */

import React from 'react';

interface DBTEmotionRegulationIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function DBTEmotionRegulationIcon({
  size = 24,
  className = '',
  color = 'currentColor'
}: DBTEmotionRegulationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart Outline */}
      <path
        d="M 12 21 C 12 21 4 15 4 10 C 4 7.5 5.5 6 7.5 6 C 8.5 6 9.5 6.5 10.5 7.5 C 11.2 8.2 11.8 8.2 12 8.5 C 12.2 8.2 12.8 8.2 13.5 7.5 C 14.5 6.5 15.5 6 16.5 6 C 18.5 6 20 7.5 20 10 C 20 15 12 21 12 21 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Horizontal Balance Line - Equilibrium */}
      <line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Left Balance Point - Acceptance */}
      <circle
        cx="8.5"
        cy="12"
        r="0.8"
        fill={color}
        opacity="0.7"
      />

      {/* Center Balance Point - Integration */}
      <circle
        cx="12"
        cy="12"
        r="1"
        fill={color}
        opacity="1"
      />

      {/* Right Balance Point - Change */}
      <circle
        cx="15.5"
        cy="12"
        r="0.8"
        fill={color}
        opacity="0.7"
      />

      {/* Harmonic Resonance - Vertical alignment */}
      <line
        x1="12"
        y1="6"
        x2="12"
        y2="20"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.2"
      />

      {/* Upper and lower curves - Flow of emotion through action */}
      <path
        d="M 9 10 Q 12 9 15 10"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M 9 14 Q 12 15 15 14"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />
    </svg>
  );
}
