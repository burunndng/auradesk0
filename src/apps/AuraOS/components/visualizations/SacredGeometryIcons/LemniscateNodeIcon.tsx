import React from 'react';

export interface LemniscateNodeIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LemniscateNodeIcon
 * 
 * Concept: The figure-8 cycle of polarity and dialectics.
 * 
 * Symbolism:
 *  - Two distinct poles oscillating and resolving through a shared center
 *  - Infinite cyclic time
 * 
 * Use Cases: Mind Tools, dialectical synthesis, polarity resolution.
 */
export default function LemniscateNodeIcon({
  size = 64, color = 'currentColor', className = '', style
}: LemniscateNodeIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Outer infinity bounds */}
      <path d="M12 12 C12 12 10 4 5 4 C1 4 1 10 3 13 C5 16 10 20 12 12 C14 4 19 4 21 10 C22 13 22 18 19 19 C16 20 12 12 12 12" strokeWidth={1.5} opacity={0.8} />
      
      {/* Orthogonal structural grid cutting through polarity */}
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth={0.5} opacity={0.3} strokeDasharray="1 2" />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth={0.5} opacity={0.3} strokeDasharray="1 2" />

      {/* Internal recursive paths */}
      <path d="M12 12 C11 8 7.5 7 5.5 8 C3.5 9 4.5 13 6.5 14 C9.5 15.5 12 12 12 12 C13 16 16.5 17 18.5 16 C20.5 15 19.5 11 17.5 10 C14.5 8.5 12 12 12 12" strokeWidth={1} opacity={0.5} />

      {/* Central Node (Synthesis) */}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity={0.9} stroke="none" />
      <circle cx="12" cy="12" r="3" strokeWidth={1} opacity={0.6} />
      
      {/* Polar Nodes (Thesis & Antithesis) */}
      <circle cx="5" cy="9" r="1" />
      <circle cx="19" cy="15" r="1" />
      
    </svg>
  );
}
