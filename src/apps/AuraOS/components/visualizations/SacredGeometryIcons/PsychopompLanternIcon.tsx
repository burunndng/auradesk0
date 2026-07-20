import React from 'react';

interface PsychopompLanternIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PsychopompLantern
 *
 * Concept: Light shaped not to comfort but to navigate — the lantern
 *   carried between worlds by a hand you will never see.
 *
 * Symbolism:
 *   - Carrying ring with ghost-fingers: The psychopomp is present
 *     only as implication. Two faint curved strokes around the ring
 *     suggest a grip — ancient, patient, not quite human. The guide
 *     is more real for being invisible.
 *   - Octagonal lantern body: The octagon mediates between square
 *     (earth, matter, the living) and circle (heaven, spirit, the
 *     dead). Eight faces for eight directions of the dead. Single
 *     continuous path — no seams, no escape.
 *   - Hexagram light-seed: Two interlocking triangles — as above,
 *     so below — the Seal of Solomon, key to all thresholds. The
 *     6-fold geometry vibrates against the 8-fold cage. This
 *     dissonance IS the liminal flicker.
 *   - Light cone (not rays): Light doesn't radiate — it POURS
 *     downward like liquid, pooling. A triangular descent region
 *     with gradient opacity. The underworld is below.
 *   - Slight lean (~1° rightward): A carried lantern sways. This
 *     asymmetry proves a living hand holds it. Perfection is death;
 *     the lean is life (or its memory).
 *   - Ground pool: An ellipse of arrived light. Not lines but a
 *     gathered shape — light collecting at the bottom of everything.
 *   - Empty interior: The lantern's inside is mostly void. The
 *     light-seed floats in darkness. Containment requires space.
 *
 * Geometry: Octagonal frame (45° intervals, √2 proportions for
 *   bevel lengths). Hexagram seed (60° intervals, equilateral
 *   triangles). The ratio of seed-radius to frame-radius ≈ 1:φ.
 *   Lean achieved via +0.2 x-offset on all elements below y=15.
 *
 * Negative Space: Void inside the lantern around the seed — the
 *   darkness the light lives within. The gap between ring and
 *   crown — the space of the invisible wrist. The darkness
 *   flanking the light cone — what remains unilluminated is
 *   infinite and watching.
 */
export default function PsychopompLanternIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: PsychopompLanternIconProps) {
  /* Slight lean: bottom elements shift +0.2 in x */
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
      {/* ═══ PRIMARY (2px) — Octagonal lantern body: single path ═══ */}

      <path
        d={[
          'M10 7',       // top-left
          'L14 7',       // top edge
          'L15.8 8.8',   // upper-right bevel
          'L15.8 13.2',  // right edge
          'L14 15',      // lower-right bevel
          'L10 15',      // bottom edge
          'L8.2 13.2',   // lower-left bevel
          'L8.2 8.8',    // left edge
          'Z'            // close
        ].join(' ')}
        strokeWidth={2}
      />

      {/* ═══ SECONDARY (1.5px) — Crown, staff, base ═══ */}

      {/* Lantern crown — angular cap */}
      <path
        d="M10 7 L11 5.8 L13 5.8 L14 7"
        strokeWidth={1.5}
        opacity={0.9}
      />

      {/* Crown finial — the point of aspiration */}
      <path
        d="M11.5 5.8 L12 5 L12.5 5.8"
        strokeWidth={1.5}
        opacity={0.8}
      />

      {/* Carrying staff */}
      <line x1={12} y1={5} x2={12} y2={4.2}
        strokeWidth={1.5} opacity={0.9} />

      {/* Lantern base — slightly shifted right for lean */}
      <path
        d="M9.8 15 L9.8 15.8 L14.4 15.8 L14.4 15"
        strokeWidth={1.5}
        opacity={0.85}
      />

      {/* ═══ DATA (1px) — Light cone & liminal markers ═══ */}

      {/* Light cone — left edge (leaning right) */}
      <path
        d="M10 15.8 L8 20.5"
        strokeWidth={1}
        opacity={0.35}
      />
      {/* Light cone — right edge */}
      <path
        d="M14.2 15.8 L16.5 20.5"
        strokeWidth={1}
        opacity={0.35}
      />
      {/* Light cone — center axis */}
      <path
        d="M12.1 15.8 L12.3 20.5"
        strokeWidth={0.75}
        opacity={0.45}
      />

      {/* Inner cone edges — second layer of light structure */}
      <path
        d="M10.8 15.8 L9.8 20"
        strokeWidth={0.75}
        opacity={0.25}
      />
      <path
        d="M13.4 15.8 L14.8 20"
        strokeWidth={0.75}
        opacity={0.25}
      />

      {/* Threshold chevrons — crossing-point markers on base */}
      <path d="M11 16 L11.3 16.5 L11.6 16"
        strokeWidth={1} opacity={0.5} />
      <path d="M12.6 16 L12.9 16.5 L13.2 16"
        strokeWidth={1} opacity={0.5} />

      {/* ═══ DETAIL (0.5px) — Ghost fingers, panel hints, ground pool ═══ */}

      {/* Ghost fingers on carrying ring — the unseen hand */}
      <path
        d="M10.6 3.2 Q10.2 2.5 10.5 2"
        strokeWidth={0.6}
        opacity={0.3}
        fill="none"
      />
      <path
        d="M10.9 3 Q10.8 2.3 11.2 1.8"
        strokeWidth={0.5}
        opacity={0.22}
        fill="none"
      />
      <path
        d="M13.4 3.2 Q13.8 2.5 13.5 2"
        strokeWidth={0.6}
        opacity={0.3}
        fill="none"
      />
      <path
        d="M13.1 3 Q13.2 2.3 12.8 1.8"
        strokeWidth={0.5}
        opacity={0.22}
        fill="none"
      />

      {/* Panel lattice hints — just enough to suggest structure */}
      <line x1={8.2} y1={11} x2={10.5} y2={11}
        strokeWidth={0.5} opacity={0.2} />
      <line x1={13.5} y1={11} x2={15.8} y2={11}
        strokeWidth={0.5} opacity={0.2} />

      {/* Vertical panel divisions — ghost lines */}
      <line x1={10.5} y1={7.5} x2={10.5} y2={14.5}
        strokeWidth={0.5} opacity={0.12} />
      <line x1={13.5} y1={7.5} x2={13.5} y2={14.5}
        strokeWidth={0.5} opacity={0.12} />

      {/* Ground light pool — elliptical */}
      <ellipse
        cx={12.3} cy={21} rx={3.8} ry={0.8}
        strokeWidth={0.5}
        opacity={0.22}
      />
      {/* Inner pool — brighter center */}
      <ellipse
        cx={12.3} cy={21} rx={1.8} ry={0.45}
        strokeWidth={0.5}
        opacity={0.35}
      />

      {/* ═══ FOCAL (filled) — Three points, strict hierarchy ═══ */}

      {/* Carrying ring — the grip of the invisible */}
      <circle
        cx={12} cy={3.5} r={1}
        strokeWidth={1.5}
        opacity={0.85}
        fill="none"
      />
      {/* Ring's weight point — where gravity pulls the ring against the staff */}
      <circle
        cx={12} cy={4.5} r={0.3}
        fill={color}
        stroke="none"
        opacity={0.6}
      />

      {/* Hexagram light-seed — Seal of Solomon, key to thresholds */}
      {/* Triangle pointing up (fire, ascent, the living) */}
      <path
        d="M12 9.2 L13.3 11.5 L10.7 11.5 Z"
        fill={color}
        stroke="none"
        opacity={0.6}
      />
      {/* Triangle pointing down (water, descent, the dead) */}
      <path
        d="M12 12.8 L10.7 10.5 L13.3 10.5 Z"
        fill={color}
        stroke="none"
        opacity={0.6}
      />

      {/* Ground arrival — single point where light fully arrives */}
      <circle
        cx={12.3} cy={21} r={0.45}
        fill={color}
        stroke="none"
        opacity={0.45}
      />
    </svg>
  );
}
