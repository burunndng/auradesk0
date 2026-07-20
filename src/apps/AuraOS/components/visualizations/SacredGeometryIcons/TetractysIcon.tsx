import React from 'react';

export interface TetractysIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TetractysIcon
 * 
 * Concept: The Pythagorean sacred 10-pointed triangle.
 * 
 * Symbolism:
 *  - 1 (Monad), 2 (Dyad), 3 (Triad), 4 (Tetrad) summing to 10.
 *  - Logic, structure, manifestation from singularity to solid form.
 * 
 * Use Cases: Mind Tools, systemic structural analysis, logic maps.
 */
export default function TetractysIcon({
  size = 64, color = 'currentColor', className = '', style
}: TetractysIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Background Frame */}
      <polygon points="12,3 21,19 3,19" strokeWidth={0.5} opacity={0.3} />
      <polygon points="12,7 18,17 6,17" strokeWidth={0.5} opacity={0.15} strokeDasharray="1 1" />
      
      {/* The 10 Points of the Tetractys, represented as stylized nodes and connecting webs */}
      <g fill={color} stroke="none" opacity={0.9}>
        {/* Row 1 */}
        <circle cx="12" cy="5" r="1.5" />
        
        {/* Row 2 */}
        <circle cx="9.5" cy="9.5" r="1.5" />
        <circle cx="14.5" cy="9.5" r="1.5" />
        
        {/* Row 3 */}
        <circle cx="7" cy="14" r="1.5" />
        <circle cx="12" cy="14" r="1.5" />
        <circle cx="17" cy="14" r="1.5" />
        
        {/* Row 4 */}
        <circle cx="4.5" cy="18.5" r="1.5" />
        <circle cx="9.5" cy="18.5" r="1.5" />
        <circle cx="14.5" cy="18.5" r="1.5" />
        <circle cx="19.5" cy="18.5" r="1.5" />
      </g>
      
      {/* Energetic weaving (The hidden lines of logic) */}
      <g strokeWidth={1} opacity={0.4}>
        <line x1="12" y1="5" x2="9.5" y2="9.5" />
        <line x1="12" y1="5" x2="14.5" y2="9.5" />
        <line x1="9.5" y1="9.5" x2="14.5" y2="9.5" />
        
        <line x1="9.5" y1="9.5" x2="7" y2="14" />
        <line x1="9.5" y1="9.5" x2="12" y2="14" />
        <line x1="14.5" y1="9.5" x2="12" y2="14" />
        <line x1="14.5" y1="9.5" x2="17" y2="14" />
        <line x1="7" y1="14" x2="17" y2="14" />
        
        <line x1="7" y1="14" x2="4.5" y2="18.5" />
        <line x1="7" y1="14" x2="9.5" y2="18.5" />
        <line x1="12" y1="14" x2="9.5" y2="18.5" />
        <line x1="12" y1="14" x2="14.5" y2="18.5" />
        <line x1="17" y1="14" x2="14.5" y2="18.5" />
        <line x1="17" y1="14" x2="19.5" y2="18.5" />
        <line x1="4.5" y1="18.5" x2="19.5" y2="18.5" />
      </g>

    </svg>
  );
}
