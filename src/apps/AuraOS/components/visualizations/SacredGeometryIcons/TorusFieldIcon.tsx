import React from 'react';

export interface TorusFieldIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TorusFieldIcon
 * 
 * Concept: The continuous self-referential flow system of energy.
 * 
 * Symbolism:
 *  - Overlapping ellipses generating the illusion of a 3D magnetic/energy field
 *  - The singularity and the event horizon
 * 
 * Use Cases: Spirit Tools, energetic boundaries, systemic processing.
 */
export default function TorusFieldIcon({
  size = 64, color = 'currentColor', className = '', style
}: TorusFieldIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      <circle cx="12" cy="12" r="9" strokeWidth={0.5} opacity={0.15} />
      <circle cx="12" cy="12" r="7" strokeWidth={0.5} opacity={0.25} />
      
      <g strokeWidth={1} opacity={0.7}>
        <ellipse cx="12" cy="12" rx="3" ry="9" />
        <ellipse cx="12" cy="12" rx="9" ry="3" />
        <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(45 12 12)" />
        <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(-45 12 12)" />
        
        {/* Secondary rotations */}
        <ellipse cx="12" cy="12" rx="2" ry="8" opacity={0.5} transform="rotate(22.5 12 12)" />
        <ellipse cx="12" cy="12" rx="2" ry="8" opacity={0.5} transform="rotate(-22.5 12 12)" />
        <ellipse cx="12" cy="12" rx="2" ry="8" opacity={0.5} transform="rotate(67.5 12 12)" />
        <ellipse cx="12" cy="12" rx="2" ry="8" opacity={0.5} transform="rotate(-67.5 12 12)" />
      </g>

      <circle cx="12" cy="12" r="1.5" strokeWidth={1.5} opacity={0.9} />
      <circle cx="12" cy="12" r="0.5" fill={color} stroke="none" />

    </svg>
  );
}
