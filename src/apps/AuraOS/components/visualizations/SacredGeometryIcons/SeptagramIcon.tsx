import React from 'react';

export interface SeptagramIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SeptagramIcon
 * 
 * Concept: The heptagram or 7-pointed fairy star.
 * 
 * Symbolism:
 *  - Seven classical planets, days of the week, stages of alchemy
 *  - Represents the wild, uncontainable, asymmetrical divine
 * 
 * Use Cases: Shadow Tools, exploring anomalous material, dreamwork.
 */
export default function SeptagramIcon({
  size = 64, color = 'currentColor', className = '', style
}: SeptagramIconProps) {
  const cx = 12, cy = 12, r = 9;
  const toR = (deg: number) => (deg - 90) * Math.PI / 180;
  
  const pts = Array.from({ length: 7 }).map((_, i) => ({
    x: cx + r * Math.cos(toR(i * 360 / 7)),
    y: cy + r * Math.sin(toR(i * 360 / 7))
  }));

  // Reorder for the continuous sharp star (skip 2 for the 7/3 star)
  const starOrder = [0, 3, 6, 2, 5, 1, 4];
  const starPts = starOrder.map(i => pts[i]);
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      <circle cx={cx} cy={cy} r={r} strokeWidth={0.5} opacity={0.4} />
      <circle cx={cx} cy={cy} r={r - 1.5} strokeWidth={0.5} opacity={0.2} strokeDasharray="2 2" />

      {/* Primary Septagram */}
      <polygon points={starPts.map(p => `${p.x},${p.y}`).join(' ')} strokeWidth={1.5} opacity={0.9} />
      
      {/* Obtuse internal Septagram (skip 1 for 7/2 star) */}
      <polygon points={[0, 2, 4, 6, 1, 3, 5].map(i => `${pts[i].x},${pts[i].y}`).join(' ')} strokeWidth={0.8} opacity={0.5} />
      
      {/* Nodes */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1} fill={color} stroke="none" opacity={0.7} />
      ))}
      
      {/* Center resonance */}
      <circle cx={cx} cy={cy} r={1.5} strokeWidth={1} opacity={0.6} />

    </svg>
  );
}
