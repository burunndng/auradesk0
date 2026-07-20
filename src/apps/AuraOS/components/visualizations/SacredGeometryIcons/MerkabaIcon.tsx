import React, { useId } from 'react';

interface MerkabaIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Merkaba Icon
 * Concept: Counter-rotating light vehicle, star tetrahedron projected onto plane
 * Symbolism: The marriage of ascending and descending force — spirit into matter, matter into spirit
 * Usage: Meditation vehicles, dimensional work, field activation, sacred union practices
 */
export default function MerkabaIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: MerkabaIconProps) {
  const glowId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      className={className}
    >
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        {/* Ascending tetrahedron face */}
        <polygon points="50,8 92,78 8,78" strokeWidth="1" />

        {/* Descending tetrahedron face */}
        <polygon points="50,92 8,22 92,22" strokeWidth="1" />

        {/* Spin horizon */}
        <ellipse cx="50" cy="50" rx="42" ry="11" strokeWidth="0.6" opacity="0.6" />

        {/* Central axis */}
        <line x1="50" y1="8" x2="50" y2="92" strokeWidth="0.5" opacity="0.4" />

        {/* Merkaba heart */}
        <circle cx="50" cy="50" r="2.5" fill={color} stroke="none" />
      </g>
    </svg>
  );
}
