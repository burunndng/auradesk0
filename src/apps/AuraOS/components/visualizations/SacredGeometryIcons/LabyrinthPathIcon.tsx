import React from 'react';

export interface LabyrinthPathIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LabyrinthPathIcon
 * 
 * Concept: The journey to the center and back. Unwavering but folded path.
 * 
 * Symbolism:
 *  - 7 circuits representing the inner descent
 *  - Navigating the shadow in a contained space
 * 
 * Use Cases: Shadow Tools, deep inward facing protocols, somatic processing.
 */
export default function LabyrinthPathIcon({
  size = 64, color = 'currentColor', className = '', style
}: LabyrinthPathIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Outer Boundary */}
      <path d="M12,21 C6.5,21 3,17.5 3,12 C3,6.5 6.5,3 12,3 C17.5,3 21,6.5 21,12 C21,17.5 17.5,21 15,21" strokeWidth={1.5} opacity={0.9} />

      {/* Inner Circuits */}
      <path d="M15,19 C18,19 19,16 19,12 C19,8 16,5 12,5 C8,5 5,8 5,12 C5,16 8,19 11,19 L11,9 C12,9 13,9.5 13,11" strokeWidth={1.2} opacity={0.7} />
      <path d="M13,19 L13,12 C13,10 11,10 9,10 C7,10 7,13 8,15 L10,15" strokeWidth={1.2} opacity={0.5} />
      
      {/* The Central Cross / Threshold */}
      <line x1="12" y1="12" x2="12" y2="15" strokeWidth={1.2} opacity={0.9} />
      <line x1="10" y1="15" x2="15" y2="15" strokeWidth={1.2} opacity={0.9} />
      <line x1="9" y1="13" x2="11" y2="13" strokeWidth={1} opacity={0.5} />
      
      {/* Goal dot */}
      <circle cx="12" cy="11" r="0.8" fill={color} stroke="none" opacity={0.9} />

      {/* Ethereal background circuits */}
      <circle cx="12" cy="12" r="2.5" strokeWidth={0.5} strokeDasharray="1 1" opacity={0.3} />
      <circle cx="12" cy="12" r="4.5" strokeWidth={0.5} strokeDasharray="1 1" opacity={0.2} />

    </svg>
  );
}
