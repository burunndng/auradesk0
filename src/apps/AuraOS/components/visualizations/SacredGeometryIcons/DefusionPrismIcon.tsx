import React from 'react';

/**
 * DefusionPrismIcon
 * A diamond with a thought-form separating from it — cognitive distance.
 * Used for: Defusion Lab
 */

interface DefusionPrismIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function DefusionPrismIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: DefusionPrismIconProps) {
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
            {/* DIAMOND — the thought container (2px) */}
            <path d="M12 4L19 12L12 20L5 12Z" strokeWidth="2" />
            {/* SEPARATING FORM — thought drifting away (1.5px) */}
            <path d="M16 6C18 4 21 5 21 7C21 9 18 10 16 8" strokeWidth="1.5" />
            {/* DISTANCE LINES — cognitive gap (1px) */}
            <line x1="14" y1="8" x2="16" y2="7" strokeWidth="1" opacity="0.6" />
            <line x1="15" y1="10" x2="17" y2="9" strokeWidth="0.5" opacity="0.4" />
            {/* INNER CLARITY DIAMOND (1px) */}
            <path d="M12 8L15 12L12 16L9 12Z" strokeWidth="1" />
            {/* OBSERVER POINT (filled) */}
            <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
            {/* AWARENESS RAYS (0.5px) */}
            <line x1="7" y1="7" x2="8" y2="8" strokeWidth="0.5" opacity="0.3" />
            <line x1="7" y1="17" x2="8" y2="16" strokeWidth="0.5" opacity="0.3" />
        </svg>
    );
}
