import React from 'react';

export interface EnneagramStarIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * EnneagramStarIcon
 * 
 * Concept: The dynamic process model of consciousness and personality mapping.
 * 
 * Symbolism:
 *  - The Circle: The law of one, wholeness.
 *  - The Triangle: The law of three, forces of creation (3, 6, 9).
 *  - The Hexad: The law of seven, the process of change (1, 4, 2, 8, 5, 7).
 * 
 * Use Cases: Shadow Tools, personality deep-dives, ongoing process loops.
 */
export default function EnneagramStarIcon({
  size = 64, color = 'currentColor', className = '', style
}: EnneagramStarIconProps) {
  const cx = 12, cy = 12, r = 9;
  const toR = (deg: number) => (deg - 90) * Math.PI / 180;
  
  // 9 points: 0 is top. Angles: 0, 40, 80, 120, 160, 200, 240, 280, 320
  const pts = Array.from({ length: 9 }).map((_, i) => ({
    x: cx + r * Math.cos(toR(i * 40)),
    y: cy + r * Math.sin(toR(i * 40))
  }));

  // Triangle: 9 (0), 3 (3), 6 (6)
  const tri = [pts[0], pts[3], pts[6]];
  
  // Hexad path: 1 -> 4 -> 2 -> 8 -> 5 -> 7 -> 1
  // index:     (1) ->(4) ->(2) ->(8) ->(5) ->(7)
  const hexad = [pts[1], pts[4], pts[2], pts[8], pts[5], pts[7]];

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* The Bound / Circle */}
      <circle cx={cx} cy={cy} r={r} strokeWidth={1} opacity={0.6} strokeDasharray="4 2" />
      <circle cx={cx} cy={cy} r={r + 1.5} strokeWidth={0.3} opacity={0.2} />

      {/* The Inner Path (Law of Three) */}
      <polygon points={tri.map(p => `${p.x},${p.y}`).join(' ')} strokeWidth={1.5} opacity={0.9} />

      {/* The Dynamic Path (Law of Seven) */}
      <polygon points={hexad.map(p => `${p.x},${p.y}`).join(' ')} strokeWidth={1.2} opacity={0.75} />

      {/* Nodes */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.2} strokeWidth={1} fill="none" />
      ))}
      <circle cx={pts[0].x} cy={pts[0].y} r={1.5} fill={color} stroke="none" opacity={0.8} />

    </svg>
  );
}
