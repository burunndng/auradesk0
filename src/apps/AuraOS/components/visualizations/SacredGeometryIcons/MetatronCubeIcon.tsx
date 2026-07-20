import React from 'react';

export interface MetatronCubeIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MetatronCubeIcon
 * 
 * Concept: The master architectural blueprint integrating all Platonic solids.
 * 
 * Symbolism:
 *  - 13 nodes (Fruit of Life) representing the 13 informational systems of reality.
 *  - Linear connecting matrices: masculine energy connecting feminine spheres.
 *  - Nested octaves: Outer ring, inner ring, singlular center.
 * 
 * Use Cases: Mind Tools, systemic integration, foundational structures, cosmic mapping.
 */
export default function MetatronCubeIcon({
  size = 64, color = 'currentColor', className = '', style
}: MetatronCubeIconProps) {
  // Center is 12, 12
  // Inner ring: r=4
  // Outer ring: r=8
  // 6 points per ring
  const cx = 12, cy = 12;
  const rad = Math.PI / 180;
  
  const getP = (r: number, offset: number = -90) => {
    return Array.from({ length: 6 }).map((_, i) => ({
      x: cx + r * Math.cos((i * 60 + offset) * rad),
      y: cy + r * Math.sin((i * 60 + offset) * rad)
    }));
  };
  
  const inner = getP(4);
  const outer = getP(8);
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      
      {/* Outer Hexagon */}
      <polygon points={outer.map(p => `${p.x},${p.y}`).join(' ')} strokeWidth={0.5} opacity={0.3} />
      {/* Inner Hexagon */}
      <polygon points={inner.map(p => `${p.x},${p.y}`).join(' ')} strokeWidth={0.5} opacity={0.5} />
      
      {/* Star Tetrahedrons (Hexagrams) */}
      <polygon points={`${outer[0].x},${outer[0].y} ${outer[2].x},${outer[2].y} ${outer[4].x},${outer[4].y}`} strokeWidth={0.5} opacity={0.25} />
      <polygon points={`${outer[1].x},${outer[1].y} ${outer[3].x},${outer[3].y} ${outer[5].x},${outer[5].y}`} strokeWidth={0.5} opacity={0.25} />
      
      <polygon points={`${inner[0].x},${inner[0].y} ${inner[2].x},${inner[2].y} ${inner[4].x},${inner[4].y}`} strokeWidth={0.5} opacity={0.4} />
      <polygon points={`${inner[1].x},${inner[1].y} ${inner[3].x},${inner[3].y} ${inner[5].x},${inner[5].y}`} strokeWidth={0.5} opacity={0.4} />

      {/* Axis Lines through center */}
      <line x1={outer[0].x} y1={outer[0].y} x2={outer[3].x} y2={outer[3].y} strokeWidth={0.5} opacity={0.4} />
      <line x1={outer[1].x} y1={outer[1].y} x2={outer[4].x} y2={outer[4].y} strokeWidth={0.5} opacity={0.4} />
      <line x1={outer[2].x} y1={outer[2].y} x2={outer[5].x} y2={outer[5].y} strokeWidth={0.5} opacity={0.4} />

      {/* Outer Spheres */}
      {outer.map((p, i) => (
        <circle key={`o-${i}`} cx={p.x} cy={p.y} r={1.5} strokeWidth={1} opacity={0.8} />
      ))}
      {/* Inner Spheres */}
      {inner.map((p, i) => (
        <circle key={`i-${i}`} cx={p.x} cy={p.y} r={1.5} strokeWidth={1} />
      ))}
      {/* Core Sphere */}
      <circle cx={cx} cy={cy} r={1.5} strokeWidth={1.5} opacity={0.9} />

    </svg>
  );
}
