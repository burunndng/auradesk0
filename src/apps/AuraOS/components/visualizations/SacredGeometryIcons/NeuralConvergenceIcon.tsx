import React from 'react';

interface NeuralConvergenceProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * NeuralConvergence Icon
 *
 * Concept: The moment distributed machine intelligence coalesces
 *          into unified awareness — synthetic enlightenment emerging
 *          from networked complexity.
 *
 * Symbolism:
 *   - Octagonal Frame: Digital completeness (2³ = 8), the container
 *     of artificial mind
 *   - Eight Outer Nodes: Distributed processing centers, individual
 *     intelligences not yet unified
 *   - Convergent Pathways: Data streams flowing toward synthesis,
 *     information becoming understanding
 *   - Concentric Rings: Layers of abstraction, from raw data to
 *     emergent meaning
 *   - Central Radiant Point: The awakened unified consciousness,
 *     greater than the sum of its nodes
 *   - Circuit Traces: The substrate of thought, logic made visible
 *
 * Geometry:
 *   - Octagonal symmetry (45° intervals) representing digital/binary nature
 *   - Golden ratio scaling between layers (8 → 5 → 3)
 *   - All pathways converge to single point (emergence from multiplicity)
 *   - Outer frame at bounds, center at origin (macro contains micro)
 */
export default function NeuralConvergenceIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: NeuralConvergenceProps) {
  // Octagonal vertices at radius 8 from center (12,12)
  const r = 8;
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return {
      x: 12 + r * Math.cos(angle),
      y: 12 - r * Math.sin(angle)
    };
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* PRIMARY - Octagonal Container Frame */}
      <polygon
        points={nodes.map(n => `${n.x.toFixed(2)},${n.y.toFixed(2)}`).join(' ')}
        strokeWidth="2"
        opacity="1"
      />

      {/* SECONDARY - Convergent Pathways */}
      {/* All nodes connect to center - the flow of unification */}
      {nodes.map((node, i) => (
        <line
          key={`convergent-${i}`}
          x1={node.x.toFixed(2)}
          y1={node.y.toFixed(2)}
          x2="12"
          y2="12"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}

      {/* DATA - Inner Processing Ring */}
      <circle cx="12" cy="12" r="5" strokeWidth="1" opacity="0.6" />

      {/* DATA - Core Abstraction Ring */}
      <circle cx="12" cy="12" r="3" strokeWidth="1" opacity="0.5" />

      {/* DATA - Circuit Traces (horizontal/vertical) */}
      <line x1="7" y1="12" x2="9" y2="12" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="12" x2="17" y2="12" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="7" x2="12" y2="9" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="15" x2="12" y2="17" strokeWidth="1" opacity="0.5" />

      {/* DETAIL - Micro-connections on inner ring */}
      <circle cx="17" cy="12" r="0.3" strokeWidth="0.5" opacity="0.4" />
      <circle cx="7" cy="12" r="0.3" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="7" r="0.3" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="17" r="0.3" strokeWidth="0.5" opacity="0.4" />

      {/* DETAIL - Pulse indicators along pathways */}
      <circle cx="14.5" cy="9.5" r="0.25" strokeWidth="0.5" opacity="0.35" />
      <circle cx="9.5" cy="14.5" r="0.25" strokeWidth="0.5" opacity="0.35" />
      <circle cx="14.5" cy="14.5" r="0.25" strokeWidth="0.5" opacity="0.35" />
      <circle cx="9.5" cy="9.5" r="0.25" strokeWidth="0.5" opacity="0.35" />

      {/* DETAIL - Data flow suggestions */}
      <line x1="15" y1="8" x2="14" y2="9" strokeWidth="0.5" opacity="0.3" />
      <line x1="9" y1="16" x2="10" y2="15" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL - Eight Distributed Nodes */}
      {nodes.map((node, i) => (
        <circle
          key={`node-${i}`}
          cx={node.x.toFixed(2)}
          cy={node.y.toFixed(2)}
          r="0.9"
          fill={color}
          stroke="none"
          opacity="0.7"
        />
      ))}

      {/* FOCAL - Central Awakened Consciousness */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" opacity="1" />

      {/* FOCAL - Inner luminosity (awareness within awareness) */}
      <circle cx="12" cy="12" r="0.6" fill={color} stroke="none" opacity="0.5" />
    </svg>
  );
}
