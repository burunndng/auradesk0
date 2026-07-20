import React from 'react';

interface AOSClockProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * AOSClock
 * Concept: Time emerges from eternity—the sacred pattern exists before the clock
 * Symbolism:
 *   - Outer circle: The boundary between eternal and temporal
 *   - Vesica piscis at center: The womb of creation, where time is born
 *   - Two hands at φ ratio: Golden proportion governs temporal flow
 *   - Six-fold hour markers: Hexagonal symmetry (creation pattern)
 *   - Center void: The still point around which time rotates
 * Geometry: Vesica piscis (r=4, centers offset by r), φ ratio hands, 60° markers
 */
export default function AOSClock({
  size = 64,
  color = 'currentColor',
  className = ''
}: AOSClockProps) {
  // φ (golden ratio) for hand proportions
  const phi = 1.618;
  const minuteLength = 6;
  const hourLength = minuteLength / phi; // ≈ 3.7

  // Hand angles (10:10 position - classic, also forms upward V)
  const minuteAngle = -60; // pointing to 2
  const hourAngle = -150; // pointing to 10

  // Convert polar to cartesian
  const minuteEnd = {
    x: 12 + minuteLength * Math.cos((minuteAngle - 90) * Math.PI / 180),
    y: 12 + minuteLength * Math.sin((minuteAngle - 90) * Math.PI / 180)
  };
  const hourEnd = {
    x: 12 + hourLength * Math.cos((hourAngle - 90) * Math.PI / 180),
    y: 12 + hourLength * Math.sin((hourAngle - 90) * Math.PI / 180)
  };

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
      {/* PRIMARY - Outer circle: boundary of measured time */}
      <circle
        cx="12"
        cy="12"
        r="9"
        strokeWidth="2"
        opacity="1"
      />

      {/* SECONDARY - Vesica piscis: the womb where time emerges */}
      {/* Left circle of vesica */}
      <circle
        cx="10"
        cy="12"
        r="3.5"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Right circle of vesica */}
      <circle
        cx="14"
        cy="12"
        r="3.5"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* DATA - Hour hand (φ ratio length) */}
      <line
        x1="12"
        y1="12"
        x2={hourEnd.x.toFixed(1)}
        y2={hourEnd.y.toFixed(1)}
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* DATA - Minute hand (longer by φ) */}
      <line
        x1="12"
        y1="12"
        x2={minuteEnd.x.toFixed(1)}
        y2={minuteEnd.y.toFixed(1)}
        strokeWidth="1"
        opacity="0.8"
      />

      {/* DETAIL - Six-fold hour markers (hexagonal, 60° intervals) */}
      {/* 12 o'clock */}
      <line x1="12" y1="4" x2="12" y2="5.5" strokeWidth="0.5" opacity="0.5" />
      {/* 2 o'clock */}
      <line x1="18.9" y1="8" x2="17.6" y2="8.8" strokeWidth="0.5" opacity="0.5" />
      {/* 4 o'clock */}
      <line x1="18.9" y1="16" x2="17.6" y2="15.2" strokeWidth="0.5" opacity="0.5" />
      {/* 6 o'clock */}
      <line x1="12" y1="20" x2="12" y2="18.5" strokeWidth="0.5" opacity="0.5" />
      {/* 8 o'clock */}
      <line x1="5.1" y1="16" x2="6.4" y2="15.2" strokeWidth="0.5" opacity="0.5" />
      {/* 10 o'clock */}
      <line x1="5.1" y1="8" x2="6.4" y2="8.8" strokeWidth="0.5" opacity="0.5" />

      {/* FOCAL - Center: the still point, empty (time rotates around void) */}
      <circle
        cx="12"
        cy="12"
        r="0.8"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.9"
      />
    </svg>
  );
}
