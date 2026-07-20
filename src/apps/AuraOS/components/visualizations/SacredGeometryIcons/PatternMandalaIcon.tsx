import React from 'react';

/**
 * PatternMandalaIcon
 *
 * Concept: Pattern recognition and crystallization of order from chaos
 * Geometry: Mandala-like structure with 6-fold radial symmetry
 * Symbolism: Hexagonal core radiating into outer rings with intersection points
 *
 * Design: Central hexagon surrounded by radiating lines forming petal-like chambers,
 * representing the emergence of organized structure from perceived disorder.
 */

interface PatternMandalaIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function PatternMandalaIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: PatternMandalaIconProps) {
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
      {/* OUTER MANDALA RING (2px) */}
      <circle cx="12" cy="12" r="10" strokeWidth="2" />

      {/* MIDDLE MANDALA RING (1.5px) */}
      <circle cx="12" cy="12" r="6.5" strokeWidth="1.5" />

      {/* HEXAGONAL CORE (2px) - 6-fold symmetry */}
      <path
        d="M12 4 L16.2 6 L16.2 10 L12 12 L7.8 10 L7.8 6 Z"
        strokeWidth="2"
        fill="none"
      />

      {/* SIX RADIATING PETALS (1.5px) */}
      {/* Petal 1 - Top */}
      <path d="M12 4 L12 2" strokeWidth="1.5" />
      <path d="M12 2 L11 3.5 M12 2 L13 3.5" strokeWidth="1.5" />

      {/* Petal 2 - Top-Right */}
      <path d="M16.2 6 L18.8 4.5" strokeWidth="1.5" />
      <path d="M18.8 4.5 L19.2 6.2 M18.8 4.5 L17.6 5.2" strokeWidth="1.5" />

      {/* Petal 3 - Bottom-Right */}
      <path d="M16.2 10 L19.2 13.2" strokeWidth="1.5" />
      <path d="M19.2 13.2 L18.2 12.4 M19.2 13.2 L18.5 14.2" strokeWidth="1.5" />

      {/* Petal 4 - Bottom */}
      <path d="M12 12 L12 14.5" strokeWidth="1.5" />
      <path d="M12 14.5 L11 13.2 M12 14.5 L13 13.2" strokeWidth="1.5" />

      {/* Petal 5 - Bottom-Left */}
      <path d="M7.8 10 L4.8 13.2" strokeWidth="1.5" />
      <path d="M4.8 13.2 L5.8 12.4 M4.8 13.2 L5.5 14.2" strokeWidth="1.5" />

      {/* Petal 6 - Top-Left */}
      <path d="M7.8 6 L5.2 4.5" strokeWidth="1.5" />
      <path d="M5.2 4.5 L4.8 6.2 M5.2 4.5 L6.4 5.2" strokeWidth="1.5" />

      {/* INTERSECTION POINT NODES (1px) */}
      <circle cx="12" cy="12" r="0.8" fill={color} stroke="none" />
      <circle cx="12" cy="6.5" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="16.2" cy="8" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="16.2" cy="8" r="0.6" fill={color} stroke="none" opacity="0.7" />
      <circle cx="12" cy="12" r="0.8" fill={color} stroke="none" />

      {/* INNER PATTERN DETAIL (0.5px) */}
      <circle cx="12" cy="12" r="2" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
