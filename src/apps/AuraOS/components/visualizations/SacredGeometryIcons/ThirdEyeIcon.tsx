import React from 'react';

interface ThirdEyeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Third Eye Icon
 * Geometric abstraction of the awakened eye - nested vesica piscis
 * Symbol: Layers of perception, inner vision, expanded awareness
 * Usage: Meditation, Inner Vision, Consciousness, Intuition
 */
export default function ThirdEyeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ThirdEyeIconProps) {
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
      {/* Upper rays of emanation */}
      <g strokeWidth="0.4" opacity="0.6">
        <line x1="50" y1="2" x2="50" y2="20" />
        <line x1="35" y1="5" x2="40" y2="22" />
        <line x1="20" y1="12" x2="30" y2="26" />
        <line x1="65" y1="5" x2="60" y2="22" />
        <line x1="80" y1="12" x2="70" y2="26" />
      </g>

      {/* Lower rays of emanation */}
      <g strokeWidth="0.4" opacity="0.6">
        <line x1="50" y1="98" x2="50" y2="80" />
        <line x1="35" y1="95" x2="40" y2="78" />
        <line x1="20" y1="88" x2="30" y2="74" />
        <line x1="65" y1="95" x2="60" y2="78" />
        <line x1="80" y1="88" x2="70" y2="74" />
      </g>

      {/* Outermost vesica piscis (eye boundary) */}
      <path
        d="M 3 50 Q 50 12 97 50 Q 50 88 3 50"
        strokeWidth="1.4"
        opacity="0.9"
      />

      {/* Second vesica layer */}
      <path
        d="M 10 50 Q 50 20 90 50 Q 50 80 10 50"
        strokeWidth="0.9"
        opacity="0.7"
      />

      {/* Third vesica layer */}
      <path
        d="M 18 50 Q 50 28 82 50 Q 50 72 18 50"
        strokeWidth="0.6"
        opacity="0.5"
      />

      {/* Iris: outer boundary */}
      <circle cx="50" cy="50" r="20" strokeWidth="1" opacity="0.8" />

      {/* Iris: inner structure */}
      <circle cx="50" cy="50" r="15" strokeWidth="0.5" opacity="0.6" />
      <circle cx="50" cy="50" r="11" strokeWidth="0.3" opacity="0.5" />

      {/* 8-fold iris radials */}
      <g strokeWidth="0.3" opacity="0.5">
        <line x1="50" y1="30" x2="50" y2="38" />
        <line x1="50" y1="70" x2="50" y2="62" />
        <line x1="30" y1="50" x2="38" y2="50" />
        <line x1="70" y1="50" x2="62" y2="50" />
        <line x1="35.9" y1="35.9" x2="41.3" y2="41.3" />
        <line x1="64.1" y1="35.9" x2="58.7" y2="41.3" />
        <line x1="35.9" y1="64.1" x2="41.3" y2="58.7" />
        <line x1="64.1" y1="64.1" x2="58.7" y2="58.7" />
      </g>

      {/* Pupil: the void of pure seeing */}
      <circle cx="50" cy="50" r="8" strokeWidth="1" opacity="0.7" />

      {/* Inner darkness: the void */}
      <circle cx="50" cy="50" r="5" fill={color} opacity="0.4" />

      {/* Light of consciousness - spark within the void */}
      <circle cx="46" cy="46" r="1.6" fill={color} opacity="0.9" />

      {/* Lid geometry: upper */}
      <path
        d="M 3 50 Q 30 40 50 38 Q 70 40 97 50"
        strokeWidth="0.4"
        opacity="0.4"
      />

      {/* Lid geometry: lower */}
      <path
        d="M 3 50 Q 30 60 50 62 Q 70 60 97 50"
        strokeWidth="0.4"
        opacity="0.4"
      />

      {/* Mystical halo */}
      <circle cx="50" cy="50" r="25" strokeWidth="0.2" opacity="0.25" />
    </svg>
  );
}
