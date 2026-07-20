import React from 'react';

interface QuantumEntanglementProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * QuantumEntanglement Icon
 *
 * Concept: Two particles eternally linked across any distance —
 *          the universe's deepest intimacy, where separation
 *          is illusion and information transcends spacetime.
 *
 * Symbolism:
 *   - Twin Orbital Rings: The individual identity/wave function
 *     of each entangled particle
 *   - Infinity Bridge: The non-local connection that defies
 *     classical physics — what affects one instantly affects the other
 *   - Mirrored Particles: Perfect correlation, opposite spin states,
 *     complementary existence
 *   - Wave Halos: Probability clouds, quantum uncertainty,
 *     superposition before measurement
 *   - Central Void: The space that appears to separate but doesn't —
 *     distance as illusion
 *   - Fluctuation Lines: Heisenberg uncertainty, the shimmer of
 *     quantum reality
 *
 * Geometry:
 *   - Bilateral (mirror) symmetry representing entangled duality
 *   - Golden ratio positioning of particle centers from origin
 *   - Infinity symbol (lemniscate) as the eternal unbroken bond
 *   - Circular orbits = complete, whole, yet part of larger unity
 */
export default function QuantumEntanglementIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: QuantumEntanglementProps) {
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
      {/* PRIMARY - Particle A Orbital Ring */}
      <circle cx="6" cy="12" r="3.5" strokeWidth="2" opacity="1" />

      {/* PRIMARY - Particle B Orbital Ring (mirror) */}
      <circle cx="18" cy="12" r="3.5" strokeWidth="2" opacity="1" />

      {/* SECONDARY - Entanglement Bridge (Infinity/Lemniscate) */}
      {/* The non-local connection transcending space */}
      <path
        d="M 6 12
           C 6 9, 9 9, 12 12
           C 15 15, 18 15, 18 12
           C 18 9, 15 9, 12 12
           C 9 15, 6 15, 6 12"
        strokeWidth="1.5"
        opacity="0.8"
        fill="none"
      />

      {/* DATA - Wave Function Halo A */}
      <circle
        cx="6"
        cy="12"
        r="4.5"
        strokeWidth="1"
        opacity="0.4"
        strokeDasharray="1.5 1"
      />

      {/* DATA - Wave Function Halo B */}
      <circle
        cx="18"
        cy="12"
        r="4.5"
        strokeWidth="1"
        opacity="0.4"
        strokeDasharray="1.5 1"
      />

      {/* DATA - Correlation Indicator Lines */}
      <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1" opacity="0.3" />
      <line x1="10" y1="10.5" x2="14" y2="13.5" strokeWidth="1" opacity="0.25" />
      <line x1="10" y1="13.5" x2="14" y2="10.5" strokeWidth="1" opacity="0.25" />

      {/* DETAIL - Quantum Fluctuations around A */}
      <line x1="3.5" y1="10" x2="4" y2="10.5" strokeWidth="0.5" opacity="0.4" />
      <line x1="3" y1="12" x2="3.5" y2="12" strokeWidth="0.5" opacity="0.35" />
      <line x1="3.5" y1="14" x2="4" y2="13.5" strokeWidth="0.5" opacity="0.4" />

      {/* DETAIL - Quantum Fluctuations around B (mirrored) */}
      <line x1="20.5" y1="10" x2="20" y2="10.5" strokeWidth="0.5" opacity="0.4" />
      <line x1="21" y1="12" x2="20.5" y2="12" strokeWidth="0.5" opacity="0.35" />
      <line x1="20.5" y1="14" x2="20" y2="13.5" strokeWidth="0.5" opacity="0.4" />

      {/* DETAIL - Uncertainty shimmer at center */}
      <circle cx="12" cy="11" r="0.2" strokeWidth="0.5" opacity="0.3" />
      <circle cx="12" cy="13" r="0.2" strokeWidth="0.5" opacity="0.3" />
      <circle cx="11" cy="12" r="0.15" strokeWidth="0.5" opacity="0.25" />
      <circle cx="13" cy="12" r="0.15" strokeWidth="0.5" opacity="0.25" />

      {/* DETAIL - Probability dots in halos */}
      <circle cx="5" cy="8" r="0.2" strokeWidth="0.5" opacity="0.3" />
      <circle cx="7.5" cy="16" r="0.2" strokeWidth="0.5" opacity="0.3" />
      <circle cx="19" cy="8" r="0.2" strokeWidth="0.5" opacity="0.3" />
      <circle cx="16.5" cy="16" r="0.2" strokeWidth="0.5" opacity="0.3" />

      {/* FOCAL - Entangled Particle A */}
      <circle cx="6" cy="12" r="1.2" fill={color} stroke="none" opacity="1" />

      {/* FOCAL - Entangled Particle B (mirror twin) */}
      <circle cx="18" cy="12" r="1.2" fill={color} stroke="none" opacity="1" />

      {/* FOCAL - Spin indication A (up) */}
      <line x1="6" y1="11" x2="6" y2="9.5" strokeWidth="1.5" opacity="0.9" />

      {/* FOCAL - Spin indication B (down - opposite/correlated) */}
      <line
        x1="18"
        y1="13"
        x2="18"
        y2="14.5"
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* FOCAL - Central link point (the mystery) */}
      <circle cx="12" cy="12" r="0.5" fill={color} stroke="none" opacity="0.6" />
    </svg>
  );
}
