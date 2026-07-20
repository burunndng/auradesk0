import React from 'react';

/**
 * NonDualEyeIcon
 * Vesica piscis with single point at center — non-dual awareness, the eye that sees itself.
 * Used for: Advaita Master Coach
 */

interface NonDualEyeIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function NonDualEyeIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: NonDualEyeIconProps) {
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
            {/* VESICA PISCIS — two overlapping circles (2px) */}
            <circle cx="9" cy="12" r="7" strokeWidth="2" />
            <circle cx="15" cy="12" r="7" strokeWidth="2" />
            {/* THE MANDORLA — intersection zone (1px) */}
            <path d="M12 5.5C10 8 10 16 12 18.5" strokeWidth="1" opacity="0.6" />
            <path d="M12 5.5C14 8 14 16 12 18.5" strokeWidth="1" opacity="0.6" />
            {/* THE SINGULARITY — non-dual point (filled) */}
            <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
            {/* AWARENESS RING (1px) */}
            <circle cx="12" cy="12" r="3" strokeWidth="1" />
            {/* EMANATION MARKS (0.5px) */}
            <line x1="12" y1="4" x2="12" y2="5" strokeWidth="0.5" opacity="0.3" />
            <line x1="12" y1="19" x2="12" y2="20" strokeWidth="0.5" opacity="0.3" />
        </svg>
    );
}
