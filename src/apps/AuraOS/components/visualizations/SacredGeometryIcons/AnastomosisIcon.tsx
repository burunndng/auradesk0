import React from 'react';

interface AnastomosisIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Anastomosis
 *
 * Concept: When the direct path is blocked, life divides to flow around,
 *   then reunifies—emerging woven with redundant strength.
 *
 * Symbolism:
 *   - Source (top): The undivided origin, before the wound
 *   - Diverging channels: Separation as survival strategy, not failure
 *   - The unnamed void: The obstacle exists only in negative space—
 *     we know it solely by the shape of what flows around it
 *   - Anastomotic bridges: Cross-connections creating redundancy;
 *     the network remembers all possible paths
 *   - Witness point: Marks the moment of maximum separation—
 *     the deepest point of going-around, placed asymmetrically
 *   - Reunion: Convergence downstream; what divided becomes one,
 *     carrying memory of both paths taken
 *
 * Geometry: Biological branching angles (~37°). Intentional asymmetry:
 *   left channel arcs 15% wider (the cautious path), right is more direct.
 *   Inner channels at 1/φ distance from outer. Void zone y ∈ [10, 14].
 *
 * Negative Space: Center zone is conspicuously empty. The obstacle
 *   is felt through the channels' avoidance—never drawn, never named.
 */
export default function AnastomosisIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: AnastomosisIconProps) {
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
      style={style}
    >
      {/* ═══ PRIMARY (2px) — Outer channels: main bypass routes ═══ */}

      {/* Left outer channel — cautious path, wider arc */}
      <path
        d="M12 3 Q4 6, 3.5 12 Q4 18, 12 21"
        strokeWidth={2}
      />

      {/* Right outer channel — direct path, tighter curve */}
      <path
        d="M12 3 Q20 6, 20 12 Q20 18, 12 21"
        strokeWidth={2}
      />

      {/* ═══ SECONDARY (1.5px) — Inner channels: redundant pathways ═══ */}

      {/* Left inner — φ ratio inward (distance from center: 12-7.4=4.6 → 12-2.85≈9.15) */}
      <path
        d="M12 4.5 Q7 7, 6.5 12 Q7 17, 12 19.5"
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* Right inner */}
      <path
        d="M12 4.5 Q17 7, 17.5 12 Q17 17, 12 19.5"
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* ═══ DATA (1px) — Anastomotic bridges: cross-connections ═══ */}

      {/* Upper bridge — early redundancy */}
      <path
        d="M4.8 8 Q6 8.5, 7.2 8"
        strokeWidth={1}
        opacity={0.4}
      />
      <path
        d="M19 8 Q17.8 8.5, 16.6 8"
        strokeWidth={1}
        opacity={0.4}
      />

      {/* Middle bridges — across the void's latitude */}
      <path
        d="M4 11 Q5.5 11.5, 6.8 11"
        strokeWidth={1}
        opacity={0.4}
      />
      <path
        d="M20 11 Q18.5 11.5, 17.2 11"
        strokeWidth={1}
        opacity={0.4}
      />
      <path
        d="M4 13 Q5.5 12.5, 6.8 13"
        strokeWidth={1}
        opacity={0.4}
      />
      <path
        d="M20 13 Q18.5 12.5, 17.2 13"
        strokeWidth={1}
        opacity={0.4}
      />

      {/* Lower bridge — late redundancy before convergence */}
      <path
        d="M4.8 16 Q6 15.5, 7.2 16"
        strokeWidth={1}
        opacity={0.4}
      />
      <path
        d="M19 16 Q17.8 15.5, 16.6 16"
        strokeWidth={1}
        opacity={0.4}
      />

      {/* ═══ DETAIL (0.5px) — Ghost path: memory of the direct route ═══ */}

      {/* Upper fragment — before the void */}
      <line
        x1={12} y1={4.5} x2={12} y2={7}
        strokeWidth={0.5}
        strokeDasharray="1 2"
        opacity={0.15}
      />

      {/* Lower fragment — after the void */}
      <line
        x1={12} y1={17} x2={12} y2={19.5}
        strokeWidth={0.5}
        strokeDasharray="1 2"
        opacity={0.15}
      />

      {/* ═══ WHISPER (0.3px) — Capillary network: visible at 96px+ ═══ */}

      {/* Fine vessels between inner and outer channels */}
      <path
        d="M5 9.5 Q5.8 9.8, 6.3 9.5"
        strokeWidth={0.3}
        opacity={0.1}
      />
      <path
        d="M5 14.5 Q5.8 14.2, 6.3 14.5"
        strokeWidth={0.3}
        opacity={0.1}
      />
      <path
        d="M19 9.5 Q18.2 9.8, 17.7 9.5"
        strokeWidth={0.3}
        opacity={0.1}
      />
      <path
        d="M19 14.5 Q18.2 14.2, 17.7 14.5"
        strokeWidth={0.3}
        opacity={0.1}
      />

      {/* Micro-vessels near convergence */}
      <line x1={9} y1={18.5} x2={10} y2={18.8} strokeWidth={0.3} opacity={0.1} />
      <line x1={15} y1={18.5} x2={14} y2={18.8} strokeWidth={0.3} opacity={0.1} />

      {/* The void's negative boundary — felt, not seen */}
      {/* (nothing here — that's the point) */}

      {/* ═══ FOCAL (filled) — Three nodes only ═══ */}

      {/* Source — the undivided origin */}
      <circle
        cx={12} cy={3}
        r={1.2}
        fill={color}
        stroke="none"
      />

      {/* Witness — the deepest point of circumnavigation */}
      {/* Placed on left (cautious) path, at void's latitude */}
      <circle
        cx={3.8} cy={12}
        r={0.7}
        fill={color}
        stroke="none"
        opacity={0.7}
      />

      {/* Reunion — convergence, carrying memory of both paths */}
      <circle
        cx={12} cy={21}
        r={1.2}
        fill={color}
        stroke="none"
      />
    </svg>
  );
}
