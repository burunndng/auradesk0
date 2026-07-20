import React from 'react';

interface ApophaticFrameIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ApophaticFrame
 *
 * Concept: The sacred cannot be depicted—only indicated by the geometry
 *   that fails to contain it. All structure serves to point toward
 *   what no mark can capture.
 *
 * Symbolism:
 *   - Octagonal frame: Eight-fold completion—the most perfect container
 *     human geometry can offer—yet deliberately broken at each vertex.
 *     Even totality cannot enclose the infinite.
 *   - Four cardinal rays: Lines of attention reaching inward from each
 *     direction. Comprehension approaching from all orientations.
 *   - Fragmenting terminations: Where the rays dissolve from solid to
 *     dashed to absent. The moment knowing becomes unknowing.
 *   - Threshold markers: Four points marking the edge of the sayable.
 *     The last outpost before silence.
 *   - The void: Center contains no mark. Not empty but too full.
 *     The Ain Soph. The Tao that cannot be named.
 *
 * Geometry: Regular octagon, r=9 inscribed circle, vertices at 22.5°
 *   offsets from cardinals. Frame edges broken at vertices (gaps = breath).
 *   Threshold circle at r=2.5 (φ relationship to outer).
 *   Rays terminate at r≈3 from center.
 *
 * Negative Space: The entire center IS the subject. Every stroke
 *   is parenthesis around ineffability.
 */
export default function ApophaticFrameIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: ApophaticFrameIconProps) {
  // Octagon vertices at r=9 from center (12,12)
  // Angles: 22.5°, 67.5°, 112.5°, 157.5°, 202.5°, 247.5°, 292.5°, 337.5°
  const r = 9;
  const cx = 12, cy = 12;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const vx = (deg: number) => cx + r * Math.cos(toRad(deg));
  const vy = (deg: number) => cy - r * Math.sin(toRad(deg));

  // Vertices (clockwise from top-right)
  const v = [
    [vx(67.5), vy(67.5)],   // 0: top-right      (15.44, 4.69)
    [vx(22.5), vy(22.5)],   // 1: right-top      (20.31, 8.56)
    [vx(-22.5), vy(-22.5)], // 2: right-bottom   (20.31, 15.44)
    [vx(-67.5), vy(-67.5)], // 3: bottom-right   (15.44, 19.31)
    [vx(-112.5), vy(-112.5)], // 4: bottom-left  (8.56, 19.31)
    [vx(-157.5), vy(-157.5)], // 5: left-bottom  (3.69, 15.44)
    [vx(157.5), vy(157.5)], // 6: left-top       (3.69, 8.56)
    [vx(112.5), vy(112.5)], // 7: top-left       (8.56, 4.69)
  ];

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
      {/* ═══ PRIMARY (2px) — Octagonal frame: edges only, gaps at vertices ═══ */}

      {/* 8 edges of octagon — each slightly inset from vertices to create gaps */}
      {/* Top edge */}
      <line x1={9.2} y1={4.7} x2={14.8} y2={4.7} strokeWidth={2} />
      {/* Top-right edge */}
      <line x1={15.8} y1={5.2} x2={19.8} y2={9.2} strokeWidth={2} />
      {/* Right edge */}
      <line x1={20.3} y1={9.9} x2={20.3} y2={14.1} strokeWidth={2} />
      {/* Bottom-right edge */}
      <line x1={19.8} y1={14.8} x2={15.8} y2={18.8} strokeWidth={2} />
      {/* Bottom edge */}
      <line x1={14.8} y1={19.3} x2={9.2} y2={19.3} strokeWidth={2} />
      {/* Bottom-left edge */}
      <line x1={8.2} y1={18.8} x2={4.2} y2={14.8} strokeWidth={2} />
      {/* Left edge */}
      <line x1={3.7} y1={14.1} x2={3.7} y2={9.9} strokeWidth={2} />
      {/* Top-left edge */}
      <line x1={4.2} y1={9.2} x2={8.2} y2={5.2} strokeWidth={2} />

      {/* ═══ SECONDARY (1.5px) — Cardinal rays: reaching toward mystery ═══ */}

      {/* North ray — from top edge toward center */}
      <line x1={12} y1={4.7} x2={12} y2={7} strokeWidth={1.5} opacity={0.85} />
      {/* East ray */}
      <line x1={20.3} y1={12} x2={17} y2={12} strokeWidth={1.5} opacity={0.85} />
      {/* South ray */}
      <line x1={12} y1={19.3} x2={12} y2={17} strokeWidth={1.5} opacity={0.85} />
      {/* West ray */}
      <line x1={3.7} y1={12} x2={7} y2={12} strokeWidth={1.5} opacity={0.85} />

      {/* ═══ DATA (1px) — Ray continuations: fragmenting toward void ═══ */}

      {/* North continuation */}
      <line x1={12} y1={7} x2={12} y2={8.5} strokeWidth={1} opacity={0.5} />
      {/* East continuation */}
      <line x1={17} y1={12} x2={15.5} y2={12} strokeWidth={1} opacity={0.5} />
      {/* South continuation */}
      <line x1={12} y1={17} x2={12} y2={15.5} strokeWidth={1} opacity={0.5} />
      {/* West continuation */}
      <line x1={7} y1={12} x2={8.5} y2={12} strokeWidth={1} opacity={0.5} />

      {/* ═══ DETAIL (0.5px) — Final dissolution: dashed terminations ═══ */}

      {/* North final fragment */}
      <line
        x1={12} y1={8.5} x2={12} y2={9.8}
        strokeWidth={0.5}
        strokeDasharray="0.8 1"
        opacity={0.3}
      />
      {/* East final fragment */}
      <line
        x1={15.5} y1={12} x2={14.2} y2={12}
        strokeWidth={0.5}
        strokeDasharray="0.8 1"
        opacity={0.3}
      />
      {/* South final fragment */}
      <line
        x1={12} y1={15.5} x2={12} y2={14.2}
        strokeWidth={0.5}
        strokeDasharray="0.8 1"
        opacity={0.3}
      />
      {/* West final fragment */}
      <line
        x1={8.5} y1={12} x2={9.8} y2={12}
        strokeWidth={0.5}
        strokeDasharray="0.8 1"
        opacity={0.3}
      />

      {/* Threshold boundary — the edge of the sayable */}
      <circle
        cx={12} cy={12} r={2.8}
        strokeWidth={0.5}
        strokeDasharray="1.2 1.5"
        opacity={0.2}
      />

      {/* ═══ WHISPER (0.3px) — Implied diagonals: suggestions at scale ═══ */}

      {/* Diagonal approaches — barely visible, emerge at 96px+ */}
      <line x1={16} y1={6} x2={14.5} y2={7.5} strokeWidth={0.3} opacity={0.1} />
      <line x1={18} y1={8} x2={16} y2={9.5} strokeWidth={0.3} opacity={0.1} />

      <line x1={18} y1={16} x2={16} y2={14.5} strokeWidth={0.3} opacity={0.1} />
      <line x1={16} y1={18} x2={14.5} y2={16.5} strokeWidth={0.3} opacity={0.1} />

      <line x1={8} y1={18} x2={9.5} y2={16.5} strokeWidth={0.3} opacity={0.1} />
      <line x1={6} y1={16} x2={8} y2={14.5} strokeWidth={0.3} opacity={0.1} />

      <line x1={6} y1={8} x2={8} y2={9.5} strokeWidth={0.3} opacity={0.1} />
      <line x1={8} y1={6} x2={9.5} y2={7.5} strokeWidth={0.3} opacity={0.1} />

      {/* Inner membrane — the final veil */}
      <circle
        cx={12} cy={12} r={1.5}
        strokeWidth={0.3}
        strokeDasharray="0.5 1.5"
        opacity={0.1}
      />

      {/* ═══ FOCAL (filled) — Threshold markers: edge of knowing ═══ */}

      {/* Four cardinal threshold points — where rays terminate */}
      <circle cx={12} cy={9.8} r={0.6} fill={color} stroke="none" opacity={0.8} />
      <circle cx={14.2} cy={12} r={0.6} fill={color} stroke="none" opacity={0.8} />
      <circle cx={12} cy={14.2} r={0.6} fill={color} stroke="none" opacity={0.8} />
      <circle cx={9.8} cy={12} r={0.6} fill={color} stroke="none" opacity={0.8} />

      {/* THE CENTER CONTAINS NOTHING */}
      {/* The void is void. Presence through absence. */}
      {/* This comment is the only acknowledgment of what cannot be drawn. */}
    </svg>
  );
}
