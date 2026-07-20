import React from 'react';

/**
 * MoralCompassIcon
 * Octagram star (8-pointed) with a plumb line — ethical weight and moral reckoning.
 * Used for: Moral Reasoning
 */

interface MoralCompassIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function MoralCompassIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: MoralCompassIconProps) {
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
            {/* OCTAGRAM — 8-pointed star (2px) */}
            <path d="M12 2L14 8L20 6L16 12L22 12L16 14L20 20L14 16L12 22L10 16L4 20L8 14L2 12L8 12L4 6L10 8Z" strokeWidth="2" />
            {/* PLUMB LINE — ethical weight (1.5px) */}
            <line x1="12" y1="6" x2="12" y2="18" strokeWidth="1.5" />
            {/* BALANCE BEAM (1px) */}
            <line x1="8" y1="10" x2="16" y2="10" strokeWidth="1" />
            {/* MORAL CENTER (filled) */}
            <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
            {/* WEIGHT MARKS (0.5px) */}
            <circle cx="12" cy="17" r="0.8" strokeWidth="0.5" opacity="0.6" />
        </svg>
    );
}
