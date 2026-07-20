import React from 'react';

interface TesseractIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Tesseract Icon
 * 4D Hypercube Projection - represents transcendence beyond 3D perception
 * Symbol: Two cubes (outer as diamond, inner as square) connected by 4D edges
 * Usage: Consciousness Development, Transcendence, Higher Perspectives
 */
export default function TesseractIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: TesseractIconProps) {
  const scale = size / 100;
  const strokeWidth = 1.2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Bounding sphere of higher dimensions */}
      <circle cx="50" cy="50" r="48" strokeWidth="0.3" opacity="0.4" />

      {/* Outer cell: 3-cube projected as diamond */}
      <polygon points="50,2 98,50 50,98 2,50" strokeWidth="1.2" />

      {/* Inner cell: 3-cube as axis-aligned square */}
      <rect x="20" y="20" width="60" height="60" strokeWidth="1.2" />

      {/* 4D connecting edges — the "impossible" dimension */}
      <line x1="50" y1="2" x2="20" y2="20" opacity="0.8" />
      <line x1="50" y1="2" x2="80" y2="20" opacity="0.8" />
      <line x1="98" y1="50" x2="80" y2="20" opacity="0.8" />
      <line x1="98" y1="50" x2="80" y2="80" opacity="0.8" />
      <line x1="50" y1="98" x2="80" y2="80" opacity="0.8" />
      <line x1="50" y1="98" x2="20" y2="80" opacity="0.8" />
      <line x1="2" y1="50" x2="20" y2="80" opacity="0.8" />
      <line x1="2" y1="50" x2="20" y2="20" opacity="0.8" />

      {/* Inner cube diagonals revealing depth */}
      <line x1="20" y1="20" x2="80" y2="80" strokeWidth="0.4" opacity="0.4" />
      <line x1="80" y1="20" x2="20" y2="80" strokeWidth="0.4" opacity="0.4" />
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="0.4" opacity="0.3" />
      <line x1="20" y1="50" x2="80" y2="50" strokeWidth="0.4" opacity="0.3" />

      {/* Outer vertices: cardinal emanations */}
      <circle cx="50" cy="2" r="2" fill={color} opacity="0.9" />
      <circle cx="98" cy="50" r="2" fill={color} opacity="0.9" />
      <circle cx="50" cy="98" r="2" fill={color} opacity="0.9" />
      <circle cx="2" cy="50" r="2" fill={color} opacity="0.9" />

      {/* Inner vertices: grounded reality */}
      <circle cx="20" cy="20" r="1.6" fill={color} opacity="0.7" />
      <circle cx="80" cy="20" r="1.6" fill={color} opacity="0.7" />
      <circle cx="80" cy="80" r="1.6" fill={color} opacity="0.7" />
      <circle cx="20" cy="80" r="1.6" fill={color} opacity="0.7" />

      {/* The origin: where all dimensions converge */}
      <circle cx="50" cy="50" r="4" strokeWidth="0.8" opacity="0.6" />
      <circle cx="50" cy="50" r="1.6" fill={color} />
    </svg>
  );
}
