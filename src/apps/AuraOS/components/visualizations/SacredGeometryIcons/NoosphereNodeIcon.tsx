import React from 'react';

interface NoosphereNodeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Noosphere Node Icon (v2 — Refined & Expanded)
 *
 * Concept: The Aperture of Discernment — Wisdom and Understanding in Perfect Union
 *
 * Symbolism:
 *   - Hexagonal Frame: The Hive Structure — collective intelligence container
 *   - Interwoven Hexagram: Fire (Chokmah/Wisdom ▲) weaving with Water (Binah/Understanding ▽)
 *   - Iris Blades: The focusing mechanism of perception, the pattern recognition engine
 *   - Central Void: Daath — where all knowledge streams converge into the Abyss
 *   - Six Terminals: The Sephiroth projected onto the plane of manifestation
 *   - Ghost Network: The hidden paths connecting outer structure to inner engine
 *
 * Geometry: Perfect hexagon (r=10), 60° interlocked hexagram with impossible-depth weaving,
 *           8-fold iris aperture, 6-fold radiance rays, concentric aura fields
 *
 * Usage: AI analysis, strategic insight, pattern recognition, noospheric interface, machine gnosis
 */
export default function NoosphereNodeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: NoosphereNodeIconProps) {
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
      {/* ════════════════════════════════════════════════════════════════
          PRIMARY (2px) — The Hive Frame
          The outermost container: collective structure of intelligence
          ════════════════════════════════════════════════════════════════ */}
      <path
        d="M12 2 L21 6.5 V17.5 L12 22 L3 17.5 V6.5 Z"
        strokeWidth="2"
        strokeLinejoin="miter"
      />

      {/* ════════════════════════════════════════════════════════════════
          SECONDARY (1.5px) — The Logic Engine (Interwoven Hexagram)
          Fire and Water in sacred geometric union
          ════════════════════════════════════════════════════════════════ */}

      {/* Upward Triangle — Fire / Wisdom / Chokmah — Solid, dominant */}
      <path
        d="M12 4.5 L18.5 15.5 H5.5 Z"
        strokeWidth="1.5"
      />

      {/* Downward Triangle — Water / Understanding / Binah — Woven behind
          Broken into segments where it passes behind the upward triangle */}
      <g strokeWidth="1.5">
        {/* Top edge: gap in center where upward triangle's sides cross */}
        <path d="M5.5 8.5 L9.3 8.5" />
        <path d="M14.7 8.5 L18.5 8.5" />

        {/* Left descending edge: gaps at intersections */}
        <path d="M5.5 8.5 L7.5 12" />
        <path d="M8.3 13.5 L9.8 16" />
        <path d="M10.5 17.2 L12 19.5" />

        {/* Right descending edge: mirror symmetry */}
        <path d="M18.5 8.5 L16.5 12" />
        <path d="M15.7 13.5 L14.2 16" />
        <path d="M13.5 17.2 L12 19.5" />
      </g>

      {/* ════════════════════════════════════════════════════════════════
          DATA LINES (1px) — The Aperture Blades
          8-fold iris mechanism — the focusing eye of perception
          ════════════════════════════════════════════════════════════════ */}
      <g strokeWidth="1">
        <path d="M12 6.5 Q14.5 8 16 7.5" />
        <path d="M16 7.5 Q17.2 9.5 17.2 12" />
        <path d="M17.2 12 Q17 14.5 15.5 16" />
        <path d="M15.5 16 Q13.5 17.5 12 17.5" />
        <path d="M12 17.5 Q10.5 17.5 8.5 16" />
        <path d="M8.5 16 Q7 14.5 6.8 12" />
        <path d="M6.8 12 Q6.8 9.5 8 7.5" />
        <path d="M8 7.5 Q9.5 8 12 6.5" />
      </g>

      {/* ════════════════════════════════════════════════════════════════
          DETAILS (0.5px) — Radiance Rays
          The illumination emanating from the iris center
          ════════════════════════════════════════════════════════════════ */}
      <g strokeWidth="0.5">
        <path d="M12 6.5 V4.5" />
        <path d="M16.5 8.5 L18 7.5" />
        <path d="M17 14.5 L18.5 15.5" />
        <path d="M12 17.5 V19.5" />
        <path d="M7 14.5 L5.5 15.5" />
        <path d="M7.5 8.5 L6 7.5" />
      </g>

      {/* ════════════════════════════════════════════════════════════════
          DETAILS (0.5px) — Ghost Network
          The hidden paths connecting the outer frame to the inner engine
          ════════════════════════════════════════════════════════════════ */}
      <g strokeWidth="0.5" opacity="0.35">
        <path d="M12 2 V4.5" />
        <path d="M21 6.5 L18.5 8.5" />
        <path d="M21 17.5 L18.5 15.5" />
        <path d="M12 22 V19.5" />
        <path d="M3 17.5 L5.5 15.5" />
        <path d="M3 6.5 L5.5 8.5" />
      </g>

      {/* ════════════════════════════════════════════════════════════════
          DETAILS (0.5px) — Aura Fields
          Concentric energy fields surrounding the core
          ════════════════════════════════════════════════════════════════ */}
      <circle cx="12" cy="12" r="9.5" strokeWidth="0.5" opacity="0.12" />
      <circle cx="12" cy="12" r="5" strokeWidth="0.5" opacity="0.2" />

      {/* ════════════════════════════════════════════════════════════════
          FOCAL — The Daath Point
          The pupil of the All-Seeing Eye — where knowledge becomes void
          ════════════════════════════════════════════════════════════════ */}
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />

      {/* Consciousness spark — the light of awareness within the void */}
      <circle
        cx="11.2"
        cy="11.2"
        r="0.6"
        fill="none"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.5"
      />

      {/* ════════════════════════════════════════════════════════════════
          FOCAL — Corner Terminals
          The six Sephirotic I/O nodes — interface points with the Hive
          ════════════════════════════════════════════════════════════════ */}
      <circle cx="12" cy="2" r="1" fill={color} stroke="none" />
      <circle cx="21" cy="6.5" r="1" fill={color} stroke="none" />
      <circle cx="21" cy="17.5" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="22" r="1" fill={color} stroke="none" />
      <circle cx="3" cy="17.5" r="1" fill={color} stroke="none" />
      <circle cx="3" cy="6.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}
