import React from 'react';

export interface SriYantraIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SriYantraIcon
 * 
 * Concept: The ultimate fractal intersection mapping the cosmos and human body.
 * 
 * Symbolism:
 *  - 4 upward pointing triangles (Shiva - masculine/consciousness)
 *  - 5 downward pointing triangles (Shakti - feminine/energy)
 *  - Bindu: The unmanifest source point
 * 
 * Use Cases: Spirit Tools, non-dual realization, ultimate integration.
 */
export default function SriYantraIcon({
  size = 64, color = 'currentColor', className = '', style
}: SriYantraIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Outer Bhupura (Earth Square) simplified to concentric circles representing petals */}
      <circle cx="12" cy="12" r="10" strokeWidth={0.8} opacity={0.4} />
      <circle cx="12" cy="12" r="9" strokeWidth={0.5} opacity={0.2} strokeDasharray="1 1" />
      <circle cx="12" cy="12" r="8" strokeWidth={1} opacity={0.6} />

      {/* The interwoven triangles (stylized for 24x24 viewBox to stay readable) */}
      
      {/* Downward (Shakti) */}
      <polygon points="12,18 4,8 20,8" strokeWidth={0.8} opacity={0.8} />
      <polygon points="12,16 6,6 18,6" strokeWidth={0.8} opacity={0.7} />
      <polygon points="12,14 8,5 16,5" strokeWidth={0.8} opacity={0.6} />
      
      {/* Upward (Shiva) */}
      <polygon points="12,6 4,16 20,16" strokeWidth={0.8} opacity={0.8} />
      <polygon points="12,8 6,18 18,18" strokeWidth={0.8} opacity={0.7} />
      
      {/* Innermost interlocking */}
      <polygon points="12,11.5 9,14 15,14" strokeWidth={1} opacity={0.9} />
      <polygon points="12,15 10,10.5 14,10.5" strokeWidth={1} opacity={0.9} />

      {/* Bindu center */}
      <circle cx="12" cy="12.5" r="0.6" fill={color} stroke="none" />

    </svg>
  );
}
