import React from 'react';

interface EnsoTriunityIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Enso Triunity Icon
 * Concept: Eastern emptiness embracing Western sacred trinity
 * Symbolism: The Zen ensō (incomplete circle, suggesting openness/impermanence)
 *            holding a triquetra-like form—the three that are one
 * Usage: Non-dual awareness, integration of paradox, wholeness-in-openness, release practices
 * Philosophical Note: The gap in the circle is not absence but invitation—
 *                     the space through which consciousness breathes
 */
export default function EnsoTriunityIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: EnsoTriunityIconProps) {
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
      {/* PRIMARY (2px) - The Ensō: incomplete circle, brushstroke quality */}
      {/* Gap positioned at top-right, where the brush lifts in traditional form */}
      <path
        d="M20 8C21 10.5 21 14 19.5 17C17 21 12 22 7.5 20C3 17.5 2 12 4 7.5C6 3.5 11 2 15.5 3.5"
        strokeWidth="2.5"
      />

      {/* SECONDARY (1.5px) - The Inner Triunity: three interlocking arcs */}
      {/* Top arc */}
      <path
        d="M12 6C14.5 6 16.5 8 16.5 10.5C16.5 11.5 16 12.5 15 13"
        strokeWidth="1.5"
      />
      {/* Bottom-left arc */}
      <path
        d="M9 13C7.5 12 7 10 8 8C8.5 7 9.5 6.5 10.5 6.5"
        strokeWidth="1.5"
      />
      {/* Bottom-right arc */}
      <path
        d="M15 14.5C15.5 16 14.5 18 12 18.5C10.5 18.5 9 17.5 8.5 16"
        strokeWidth="1.5"
      />

      {/* DATA LINES (1px) - The inner triangle implied by arc endpoints */}
      <path d="M12 6L8.5 16L15.5 13.5Z" strokeWidth="1" opacity="0.5" />

      {/* DATA LINES (1px) - Breath lines radiating from gap */}
      <path d="M18 5L20 3" strokeWidth="1" opacity="0.6" />
      <path d="M19.5 6.5L21.5 5.5" strokeWidth="1" opacity="0.4" />
      <path d="M16.5 4L17.5 2" strokeWidth="1" opacity="0.5" />

      {/* DETAILS (0.5px) - Inner circulation, the movement of ch'i */}
      <circle cx="12" cy="12" r="3" strokeWidth="0.5" opacity="0.35" />

      {/* DETAILS (0.5px) - Subtle center spiral suggesting dynamic stillness */}
      <path
        d="M12 10.5C13 10.5 13.5 11 13.5 12C13.5 13 12.5 13.5 11.5 13C10.5 12.5 10.5 11.5 11 11"
        strokeWidth="0.5"
        opacity="0.4"
      />

      {/* FOCAL POINTS (filled) - The Three-as-One */}
      {/* Central unity point */}
      <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />

      {/* Three arc focal points forming the trinity */}
      <circle cx="12" cy="6.5" r="0.7" fill={color} stroke="none" />
      <circle cx="8.5" cy="15.5" r="0.7" fill={color} stroke="none" />
      <circle cx="15.5" cy="14" r="0.7" fill={color} stroke="none" />

      {/* The gap point - where form releases into formlessness */}
      <circle cx="17.5" cy="4.5" r="0.5" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}
