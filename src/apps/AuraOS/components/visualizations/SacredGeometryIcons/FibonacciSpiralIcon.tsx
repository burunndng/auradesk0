import React from 'react';

export interface FibonacciSpiralIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * FibonacciSpiralIcon
 * 
 * Concept: The golden unfurling. The organic progression of consciousness.
 * 
 * Symbolism:
 *  - Golden ratio arcs representing emergent growth
 *  - The nautilus shape: returning to the same center but at a higher tier
 * 
 * Use Cases: Body Tools, developmental processes, natural integration.
 */
export default function FibonacciSpiralIcon({
  size = 64, color = 'currentColor', className = '', style
}: FibonacciSpiralIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Rectangles of phi proportions */}
      <g strokeWidth={0.3} opacity={0.3} strokeDasharray="1 1">
        <rect x="3" y="2" width="18" height="11.12" />
        <rect x="3" y="13.12" width="11.12" height="6.87" />
        <rect x="14.12" y="13.12" width="6.88" height="4.25" />
        <rect x="14.12" y="17.37" width="4.25" height="2.62" />
        <rect x="18.37" y="17.37" width="2.63" height="1.62" />
      </g>
      
      {/* The organic spiral */}
      <path 
        d="M21 13.12 A 18 18 0 0 0 3 13.12 
           A 11.12 11.12 0 0 0 14.12 20 
           A 6.87 6.87 0 0 0 21 13.12 
           A 4.25 4.25 0 0 0 16.75 8.87 
           A 2.62 2.62 0 0 0 14.13 11.5 
           A 1.62 1.62 0 0 0 15.75 13.12" 
        strokeWidth={1.5} 
        opacity={0.9} 
      />

      {/* Energetic core point */}
      <circle cx="15.75" cy="13.12" r="0.5" fill={color} stroke="none" opacity={0.9} />
      
      {/* Ethereal echoing spirals */}
      <path 
        d="M21 13.12 A 18 18 0 0 0 3 13.12 A 11.12 11.12 0 0 0 14.12 20 A 6.87 6.87 0 0 0 21 13.12" 
        strokeWidth={4} 
        opacity={0.1}
        filter="blur(1px)"
      />
    </svg>
  );
}
