import React from 'react';

interface AethonGatewayIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AethonGateway
 * Concept: Structured absence — architecture framing the void through which
 *   consciousness crosses between states of being.
 * Symbolism:
 *   - Pointed mandorla: empty portal aperture, the gate IS what's not there
 *   - Keystone chevrons: threshold is built and held open, an act of will
 *   - Radiating lines: energy emanating into both worlds from the threshold
 *   - Corner brackets: the gateway within a larger unseen structure
 *   - Echo arcs: depth — not a flat door but a passage with extension
 *   - Crossing point: the eternal present tense of transition
 * Geometry: D₁ bilateral symmetry. Mandorla H:W ≈ φ. Gothic pointed arch
 *   via cubic beziers. Keystones echo AETHON angular language.
 * Negative Space: Entire mandorla interior — the void IS the gate.
 */
export default function AethonGatewayIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style
}: AethonGatewayIconProps) {
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
      {/* PRIMARY (2px) — Pointed mandorla: two bezier arcs forming the gate */}
      <path d="M12 6 C8.3 7.5, 8.3 16.5, 12 18" strokeWidth={2} />
      <path d="M12 6 C15.7 7.5, 15.7 16.5, 12 18" strokeWidth={2} />

      {/* SECONDARY (1.5px) — Keystones: the gate is held open by design */}
      <path d="M10.8 5.8 L12 4 L13.2 5.8" strokeWidth={1.5} opacity={0.85} fill="none" />
      <path d="M10.8 18.2 L12 20 L13.2 18.2" strokeWidth={1.5} opacity={0.85} fill="none" />

      {/* DATA (1px) — Radiating lines: threshold energy into both worlds */}
      <line x1={9.3} y1={9} x2={6.5} y2={9} strokeWidth={1} opacity={0.6} />
      <line x1={8.3} y1={12} x2={5.8} y2={12} strokeWidth={1} opacity={0.7} />
      <line x1={9.3} y1={15} x2={6.5} y2={15} strokeWidth={1} opacity={0.6} />
      <line x1={14.7} y1={9} x2={17.5} y2={9} strokeWidth={1} opacity={0.6} />
      <line x1={15.7} y1={12} x2={18.2} y2={12} strokeWidth={1} opacity={0.7} />
      <line x1={14.7} y1={15} x2={17.5} y2={15} strokeWidth={1} opacity={0.6} />

      {/* DETAIL (0.5px) — Corner brackets: the larger unseen frame */}
      <path d="M5.5 5 L4 5 L4 6.5" strokeWidth={0.5} opacity={0.3} fill="none" />
      <path d="M18.5 5 L20 5 L20 6.5" strokeWidth={0.5} opacity={0.3} fill="none" />
      <path d="M5.5 19 L4 19 L4 17.5" strokeWidth={0.5} opacity={0.3} fill="none" />
      <path d="M18.5 19 L20 19 L20 17.5" strokeWidth={0.5} opacity={0.3} fill="none" />

      {/* DETAIL (0.5px) — Inner echo arcs: depth resonance, tunnel effect */}
      <path d="M12 8 C10 9, 10 15, 12 16" strokeWidth={0.5} opacity={0.2} />
      <path d="M12 8 C14 9, 14 15, 12 16" strokeWidth={0.5} opacity={0.2} />

      {/* FOCAL (filled) — Crossing point: the event of transition */}
      <circle cx={12} cy={12} r={0.8} fill={color} stroke="none" opacity={0.9} />
    </svg>
  );
}
