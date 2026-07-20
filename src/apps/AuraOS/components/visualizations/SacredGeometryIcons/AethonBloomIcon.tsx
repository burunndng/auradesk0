import React from 'react';

interface AethonBloomIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AethonBloom
 *
 * Concept: Consciousness unfurls from fertile void through geometric
 *   courage — each facet of awareness opening as an angular petal,
 *   the next ring of becoming always implied, never complete.
 *
 * Symbolism:
 *   - Six angular kite petals: Facets of awareness (yantra-derived).
 *     Top petal 10% taller — the leading edge, first courage of opening.
 *   - Central void (r=2): The tzimtzum — active contraction of infinite
 *     potential to create space for finite unfolding.
 *   - Three contraction ticks (60°, 180°, 300°): The void is held open
 *     by sustained force. Tick at 300° points toward the breath gap.
 *   - Five ghost petals (absent at 300°): The next ring of becoming.
 *     The missing sixth is the breath gap — incompleteness is life.
 *   - Six neural filaments: Hidden mycelia connecting void to bloom.
 *   - Witness point: First emanation from the void. The observer
 *     emerges at the boundary of emptiness.
 *
 * Geometry: C₆ with 30°-offset ghost ring. φ governs radii and
 *   petal proportions. Angular kite construction from Tantric yantra
 *   tradition. Broken ghost symmetry encodes the breath gap.
 *
 * Negative Space: Center void (source = emptiness), inter-petal gaps
 *   (awareness needs space), missing ghost (bloom never finishes),
 *   outer margins (room to grow beyond the frame).
 */
export default function AethonBloomIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: AethonBloomIconProps) {
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
      {/* ═══ SIGIL (2px) — Six kite petals: the bloom ═══ */}

      {/* Petal 1 — North/Leading (θ=90°, tip at r=5.98) */}
      <path
        d="M12 9.4 L12.88 7.98 L12 6.02 L11.12 7.98Z"
        strokeWidth={2}
      />
      {/* Petal 2 — Upper-left (θ=150°) */}
      <path
        d="M9.75 10.7 L8.96 9.23 L7.29 9.28 L8.08 10.75Z"
        strokeWidth={2}
      />
      {/* Petal 3 — Lower-left (θ=210°) */}
      <path
        d="M9.75 13.3 L8.08 13.25 L7.29 14.72 L8.96 14.77Z"
        strokeWidth={2}
      />
      {/* Petal 4 — South (θ=270°) */}
      <path
        d="M12 14.6 L11.12 16.02 L12 17.44 L12.88 16.02Z"
        strokeWidth={2}
      />
      {/* Petal 5 — Lower-right (θ=330°) */}
      <path
        d="M14.25 13.3 L15.92 13.25 L16.71 14.72 L15.04 14.77Z"
        strokeWidth={2}
      />
      {/* Petal 6 — Upper-right (θ=30°) */}
      <path
        d="M14.25 10.7 L15.04 9.23 L16.71 9.28 L15.92 10.75Z"
        strokeWidth={2}
      />

      {/* ═══ STRUCTURE (1.5px) — Void circle: the tzimtzum ═══ */}

      <circle
        cx={12} cy={12} r={2}
        strokeWidth={1.5}
        opacity={0.85}
      />

      {/* ═══ PULSE (1px) — Contraction ticks: the void held open ═══ */}

      {/* Tick at 60° (aligns with ghost G1) */}
      <line
        x1={13} y1={10.27} x2={12.65} y2={10.87}
        strokeWidth={1} opacity={0.6}
      />
      {/* Tick at 180° (aligns with ghost G3) */}
      <line
        x1={10} y1={12} x2={10.7} y2={12}
        strokeWidth={1} opacity={0.6}
      />
      {/* Tick at 300° (points toward breath gap) */}
      <line
        x1={13} y1={13.73} x2={12.65} y2={13.13}
        strokeWidth={1} opacity={0.6}
      />

      {/* ═══ WHISPER (0.5px) — Ghost petals: the next becoming ═══ */}

      {/* Ghost at 60° (upper-right) */}
      <path
        d="M14.5 7.67 L15.81 6.7 L16 5.07 L14.69 6.05Z"
        strokeWidth={0.5} opacity={0.3}
      />
      {/* Ghost at 120° (upper-left) */}
      <path
        d="M9.5 7.67 L9.31 6.05 L8 5.07 L8.19 6.7Z"
        strokeWidth={0.5} opacity={0.3}
      />
      {/* Ghost at 180° (left) */}
      <path
        d="M7 12 L5.5 11.35 L4 12 L5.5 12.65Z"
        strokeWidth={0.5} opacity={0.3}
      />
      {/* Ghost at 240° (lower-left) */}
      <path
        d="M9.5 16.33 L8.19 17.3 L8 18.93 L9.31 17.95Z"
        strokeWidth={0.5} opacity={0.3}
      />
      {/* Ghost at 300° — ABSENT: the breath gap */}
      {/* The bloom exhales here. Incompleteness is life. */}
      {/* Ghost at 0° (right) */}
      <path
        d="M17 12 L18.5 12.65 L20 12 L18.5 11.35Z"
        strokeWidth={0.5} opacity={0.3}
      />

      {/* ═══ WHISPER (0.5px) — Neural filaments: hidden connections ═══ */}

      <line x1={12} y1={10} x2={12} y2={9.4}
        strokeWidth={0.5} opacity={0.25} />
      <line x1={10.27} y1={11} x2={9.75} y2={10.7}
        strokeWidth={0.5} opacity={0.25} />
      <line x1={10.27} y1={13} x2={9.75} y2={13.3}
        strokeWidth={0.5} opacity={0.25} />
      <line x1={12} y1={14} x2={12} y2={14.6}
        strokeWidth={0.5} opacity={0.25} />
      <line x1={13.73} y1={13} x2={14.25} y2={13.3}
        strokeWidth={0.5} opacity={0.25} />
      <line x1={13.73} y1={11} x2={14.25} y2={10.7}
        strokeWidth={0.5} opacity={0.25} />

      {/* ═══ EYE (filled) — Witness point: the first emergence ═══ */}

      <circle
        cx={12} cy={10} r={0.8}
        fill={color} stroke="none"
        opacity={0.9}
      />
    </svg>
  );
}
