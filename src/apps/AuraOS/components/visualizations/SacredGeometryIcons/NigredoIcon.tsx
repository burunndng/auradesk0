import React from 'react';

interface NigredoIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Nigredo
 *
 * Concept: The first death that makes all births possible — sacred
 *   putrefaction, the alchemical blackening, Sol Niger descending.
 *
 * Symbolism:
 *   - Alembic vessel: The sealed identity. A recognizable alchemical
 *     form — circular body, tapered neck — that can no longer contain
 *     what it holds. Form as prerequisite to shattering.
 *   - Sol Niger (Black Sun): The paradox at the heart of nigredo. Not
 *     absence of light but light so dense it appears dark. A filled
 *     disc with a corona void — the inversion of a solar eclipse.
 *   - Crystalline fracture: The crack follows mineral logic, branching
 *     at precise angles. Even destruction has geometry. The vessel
 *     breaks along lines that were always latent in its structure.
 *   - Three descending streams (Salt · Sulphur · Mercury): The tria
 *     prima separated by dissolution. Salt falls as particles (body),
 *     Sulphur descends as wave (soul), Mercury curves as fluid (spirit).
 *   - Raven pinions: Abstract wing-strokes flanking the vessel neck.
 *     The nigredo raven — the bird that thrives in darkness, whose
 *     blackness is iridescent when seen truly.
 *   - Ascending wisp: The secret teaching — even in putrefaction,
 *     volatile spirit rises. Nigredo is not pure death but distillation.
 *   - Ground strata: Prima materia is not a surface but a depth.
 *     The dissolved matter is received into layered earth.
 *
 * Geometry: Circular vessel body (unity before breaking). Fracture
 *   angles at 60° and 120° (hexagonal crystal lattice — the geometry
 *   hidden inside matter). Three streams at φ-ratio spacing. Sol
 *   Niger radius = vessel radius ÷ φ².
 *
 * Negative Space: The corona void around the Black Sun — darkness
 *   that is actually a ring of unseeable light. The widening crack —
 *   what was one becomes two. The spaces between strata — earth
 *   breathes too. The absent vessel bottom — it was always open
 *   beneath, we just couldn't see.
 */
export default function NigredoIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: NigredoIconProps) {
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
      {/* ═══ PRIMARY (2px) — The Alembic: sealed vessel of identity ═══ */}

      {/* Vessel body — left arc (intact) */}
      <path
        d="M8 10.2 A4 4 0 0 1 12 5.5"
        strokeWidth={2}
        fill="none"
      />
      {/* Vessel body — right arc (intact upper, fracture interrupts lower) */}
      <path
        d="M12 5.5 A4 4 0 0 1 16 9"
        strokeWidth={2}
        fill="none"
      />
      {/* Vessel body — right arc lower fragment (post-fracture) */}
      <path
        d="M15.6 10.5 A4 4 0 0 1 14.5 12.5"
        strokeWidth={2}
        fill="none"
      />
      {/* Vessel body — left lower quadrant to base opening */}
      <path
        d="M8 10.2 A4 4 0 0 0 9.5 12.5"
        strokeWidth={2}
        fill="none"
      />

      {/* Vessel neck — tapered, rising from body */}
      <line x1={10.8} y1={5.8} x2={11.2} y2={3.5}
        strokeWidth={2} />
      <line x1={13.2} y1={5.8} x2={12.8} y2={3.5}
        strokeWidth={2} />

      {/* Neck rim */}
      <line x1={11.2} y1={3.5} x2={12.8} y2={3.5}
        strokeWidth={2} />

      {/* ═══ SECONDARY (1.5px) — Crystalline fracture: destruction's geometry ═══ */}

      {/* Primary fracture — originates from Sol Niger, exits right wall */}
      <path
        d="M13 8.5 L14.8 9 L16 9.5"
        strokeWidth={1.5}
        opacity={0.9}
      />
      {/* Fracture branch — 60° downward from primary */}
      <path
        d="M14.8 9 L15 10.2 L15.6 10.5"
        strokeWidth={1.5}
        opacity={0.8}
      />
      {/* Secondary fracture — exits lower left */}
      <path
        d="M11 9 L10 10.5 L9.5 12.5"
        strokeWidth={1.2}
        opacity={0.7}
      />

      {/* Raven pinions — abstract wings flanking the neck */}
      <path
        d="M10.5 5 L8.5 3.8 L7.5 4.5"
        strokeWidth={1.5}
        opacity={0.7}
      />
      <path
        d="M13.5 5 L15.5 3.8 L16.5 4.5"
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* ═══ DATA (1px) — Three descending streams: tria prima ═══ */}

      {/* SALT — particulate descent (dotted, leftmost, body) */}
      <line
        x1={9.5} y1={13} x2={8.5} y2={19}
        strokeWidth={1}
        strokeDasharray="0.8 1.2"
        opacity={0.6}
      />

      {/* SULPHUR — wave descent (center, soul) */}
      <path
        d="M12 13 Q13 14.8 11.5 16.5 Q10.5 17.8 12 19.2"
        strokeWidth={1}
        opacity={0.7}
        fill="none"
      />

      {/* MERCURY — smooth curve descent (rightmost, spirit) */}
      <path
        d="M14.5 13 Q15.5 15.5 14 17.5 Q13.5 18.5 14.2 19"
        strokeWidth={1}
        opacity={0.55}
        fill="none"
      />

      {/* Ascending wisp — volatile spirit released upward */}
      <path
        d="M12 3.5 Q11.5 2.8 12 2.2"
        strokeWidth={1}
        opacity={0.45}
        fill="none"
      />

      {/* ═══ DETAIL (0.5px) — Ground strata, fine dissolution ═══ */}

      {/* Prima materia strata — layered receiving earth */}
      <line x1={5} y1={20} x2={19} y2={20}
        strokeWidth={0.75} opacity={0.4} />
      <line x1={6} y1={20.8} x2={18} y2={20.8}
        strokeWidth={0.5} opacity={0.28} />
      <line x1={7.5} y1={21.5} x2={16.5} y2={21.5}
        strokeWidth={0.5} opacity={0.18} />

      {/* Micro-fracture stress lines on intact vessel wall */}
      <line x1={8.8} y1={7.5} x2={9.2} y2={8.2}
        strokeWidth={0.5} opacity={0.2} />
      <line x1={9} y1={9} x2={9.4} y2={9.5}
        strokeWidth={0.5} opacity={0.15} />

      {/* Dissolution motes along stream paths */}
      <line x1={10.5} y1={14.5} x2={10.8} y2={14.8}
        strokeWidth={0.5} opacity={0.2} />
      <line x1={13.5} y1={15.5} x2={13.2} y2={15.8}
        strokeWidth={0.5} opacity={0.2} />
      <line x1={9} y1={16.5} x2={9.3} y2={16.8}
        strokeWidth={0.5} opacity={0.15} />

      {/* ═══ FOCAL (filled) — Points of concentrated meaning ═══ */}

      {/* Sol Niger — the Black Sun: corona void technique */}
      {/* Outer corona (stroked ring — the unseeable light) */}
      <circle
        cx={12} cy={8.5} r={1.8}
        strokeWidth={0.5}
        opacity={0.35}
        fill="none"
      />
      {/* Inner black sun (filled — dense dark light) */}
      <circle
        cx={12} cy={8.5} r={1.15}
        fill={color}
        stroke="none"
        opacity={0.95}
      />

      {/* Saturn seed — what descends reconcentrates below */}
      <circle
        cx={12} cy={19.8} r={0.55}
        fill={color}
        stroke="none"
        opacity={0.6}
      />
    </svg>
  );
}
