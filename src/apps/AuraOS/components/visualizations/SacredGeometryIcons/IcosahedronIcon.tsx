import React from 'react';

export interface IcosahedronIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IcosahedronIcon
 * 
 * Concept: 20-sided regular polyhedron representing the Water element in alchemy.
 * 
 * Symbolism:
 *  - Flow, emotion, fluidity, but with structural facets.
 *  - Depth of the unconscious formed by distinct geometric ripples.
 * 
 * Use Cases: Body Tools, somatic tracking, emotional regulation.
 */
export default function IcosahedronIcon({
  size = 64, color = 'currentColor', className = '', style
}: IcosahedronIconProps) {
  // A clean 2D projection of an Icosahedron
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Outer Hexagon Boundary (The projection outline) */}
      <polygon points="12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7" strokeWidth={1.5} opacity={0.9} />
      
      {/* Inner Hexagon Shape (The front facing facets) */}
      <polygon points="12,6 17,9.5 17,14.5 12,18 7,14.5 7,9.5" strokeWidth={1} opacity={0.7} />
      
      {/* Central triangle (the facet closest to viewer) */}
      <polygon points="12,10 8.5,13.5 15.5,13.5" strokeWidth={1.2} opacity={0.8} />
      
      {/* Connecting rays */}
      {/* Top tip to inner points */}
      <line x1="12" y1="2" x2="12" y2="6" strokeWidth={1} opacity={0.6} />
      <line x1="12" y1="2" x2="7" y2="9.5" strokeWidth={1} opacity={0.6} />
      <line x1="12" y1="2" x2="17" y2="9.5" strokeWidth={1} opacity={0.6} />
      
      {/* Bottom tip to inner points */}
      <line x1="12" y1="22" x2="12" y2="18" strokeWidth={1} opacity={0.6} />
      <line x1="12" y1="22" x2="7" y2="14.5" strokeWidth={1} opacity={0.6} />
      <line x1="12" y1="22" x2="17" y2="14.5" strokeWidth={1} opacity={0.6} />
      
      {/* Left/Right points to inner structure */}
      <line x1="3.34" y1="7" x2="7" y2="9.5" strokeWidth={1} opacity={0.6} />
      <line x1="3.34" y1="17" x2="7" y2="14.5" strokeWidth={1} opacity={0.6} />
      <line x1="3.34" y1="7" x2="3.34" y2="17" strokeWidth={0.5} opacity={0.3} />
      <line x1="3.34" y1="12" x2="7" y2="12" strokeWidth={0.8} opacity={0.5} />
      
      <line x1="20.66" y1="7" x2="17" y2="9.5" strokeWidth={1} opacity={0.6} />
      <line x1="20.66" y1="17" x2="17" y2="14.5" strokeWidth={1} opacity={0.6} />
      <line x1="20.66" y1="7" x2="20.66" y2="17" strokeWidth={0.5} opacity={0.3} />
      <line x1="20.66" y1="12" x2="17" y2="12" strokeWidth={0.8} opacity={0.5} />
      
      {/* Central connective tissue */}
      <line x1="12" y1="6" x2="12" y2="10" strokeWidth={1.2} opacity={0.8} />
      <line x1="7" y1="14.5" x2="8.5" y2="13.5" strokeWidth={1.2} opacity={0.8} />
      <line x1="17" y1="14.5" x2="15.5" y2="13.5" strokeWidth={1.2} opacity={0.8} />

    </svg>
  );
}
