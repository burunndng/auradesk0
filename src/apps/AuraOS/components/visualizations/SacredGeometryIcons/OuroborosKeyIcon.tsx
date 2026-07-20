import React from 'react';

interface OuroborosKeyIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * OuroborosKey Icon
 * Concept: The key that unlocks itself — liberation through completion
 * Symbolism:
 *   - Serpent bow: The eternal cycle forms the handle
 *   - Key shaft: The path of seeking, the method
 *   - Returning blade: The answer was always in the question
 *   - Consumption point: Where seeker and sought become one
 * Geometry: Circular return, vertical axis, paradox of tool and goal
 * Emotional Resonance: Cosmic humor, liberation, completion, paradox resolved
 */
export default function OuroborosKeyIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: OuroborosKeyIconProps) {
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
      {/* DETAIL - Outer aura suggesting completeness */}
      <circle cx="12" cy="8" r="7" strokeWidth="0.5" opacity="0.1" />

      {/* PRIMARY (2px) - Serpent body forming the bow */}
      <path
        d="M8 11
           Q4 11 4 7
           Q4 3 8 3
           L16 3
           Q20 3 20 7
           Q20 11 16 11"
        strokeWidth="2"
      />

      {/* SECONDARY (1.5px) - Serpent head (left side, consuming) */}
      <path
        d="M8 11
           Q6 11 6 13
           Q6 14.5 8 14.5
           Q9 14.5 9 13.5"
        strokeWidth="1.5"
      />

      {/* PRIMARY (2px) - Key shaft (right side descends) */}
      <path d="M16 11 L16 17" strokeWidth="2" />

      {/* SECONDARY (1.5px) - Key blade base */}
      <path d="M14 17 L18 17" strokeWidth="1.5" />

      {/* DATA (1px) - Key teeth (being consumed / diminishing) */}
      <g strokeWidth="1">
        <path d="M14 17 L14 19" />
        <path d="M16 17 L16 20" />
        <path d="M18 17 L18 18" opacity="0.6" />
      </g>

      {/* DATA (1px) - Blade curving back toward serpent mouth */}
      <path
        d="M14 19
           Q10 19 9 17
           Q8 15 9 13.5"
        strokeWidth="1"
        opacity="0.7"
      />

      {/* DETAIL (0.5px) - Serpent scales/texture on body */}
      <g strokeWidth="0.5" opacity="0.3">
        <path d="M6 5 Q7 4 8 5" />
        <path d="M10 3.5 Q11 3 12 3.5" />
        <path d="M14 3.5 Q15 3 16 3.5" />
        <path d="M18 5 Q19 4 19 6" />
        <path d="M19 8 Q20 9 19 10" />
      </g>

      {/* DETAIL (0.5px) - Inner void of the bow */}
      <ellipse
        cx="12"
        cy="7"
        rx="5"
        ry="3"
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* DETAIL - Energy flow suggestion (the cycle) */}
      <g strokeWidth="0.5" opacity="0.25">
        <path d="M7 7 L9 7" />
        <path d="M15 7 L17 7" />
        <path d="M12 4.5 L12 5.5" />
      </g>

      {/* DETAIL - Consumption energy (where blade meets mouth) */}
      <g strokeWidth="0.5" opacity="0.4">
        <path d="M8 13 L10 14" />
        <path d="M8 15 L10 15" />
      </g>

      {/* FOCAL - Serpent eye (the witness consciousness) */}
      <circle cx="7" cy="12" r="0.8" fill={color} stroke="none" />

      {/* FOCAL - Point of consumption (transformation) */}
      <circle cx="9" cy="14" r="0.6" fill={color} stroke="none" />

      {/* FOCAL - Key teeth tips (crystallized intention) */}
      <circle cx="14" cy="19" r="0.5" fill={color} stroke="none" opacity="0.8" />
      <circle cx="16" cy="20" r="0.5" fill={color} stroke="none" />
      <circle cx="18" cy="18" r="0.4" fill={color} stroke="none" opacity="0.5" />

      {/* FOCAL - Crown of the bow (apex of the cycle) */}
      <circle cx="12" cy="3" r="0.6" fill={color} stroke="none" />

      {/* FOCAL - Bow terminals (where form meets form) */}
      <circle cx="8" cy="11" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="16" cy="11" r="0.5" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}
