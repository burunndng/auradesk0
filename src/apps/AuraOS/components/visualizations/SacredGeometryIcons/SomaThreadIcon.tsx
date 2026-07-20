import React from 'react';

/**
 * SomaThreadIcon
 * Spiral thread with pulse marks along a vertical axis — interoceptive signal.
 * Used for: Interoception Training
 */

interface SomaThreadIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function SomaThreadIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: SomaThreadIconProps) {
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
            {/* SPIRAL THREAD — ascending soma (2px) */}
            <path d="M12 22C12 22 8 19 8 16C8 13 16 13 16 10C16 7 8 7 8 4C8 3 10 2 12 2" strokeWidth="2" />
            {/* PULSE MARKS — interoceptive signals (1px) */}
            <line x1="5" y1="16" x2="7" y2="16" strokeWidth="1" opacity="0.7" />
            <line x1="17" y1="10" x2="19" y2="10" strokeWidth="1" opacity="0.7" />
            <line x1="5" y1="4" x2="7" y2="4" strokeWidth="1" opacity="0.7" />
            {/* SIGNAL NODES (filled) */}
            <circle cx="8" cy="16" r="0.8" fill={color} stroke="none" />
            <circle cx="16" cy="10" r="0.8" fill={color} stroke="none" />
            <circle cx="8" cy="4" r="0.8" fill={color} stroke="none" />
            {/* AWARENESS POINT at crown (1.5px) */}
            <circle cx="12" cy="2" r="1.2" strokeWidth="1.5" />
            {/* GROUNDING DOT (0.5px) */}
            <circle cx="12" cy="22" r="0.5" fill={color} stroke="none" opacity="0.5" />
        </svg>
    );
}
