import React from 'react';

/**
 * PolarityScaleIcon
 * Two interlocked triangles (up + down) on a horizontal axis — dialectical tension.
 * Used for: Polarity Mapper
 */

interface PolarityScaleIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function PolarityScaleIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: PolarityScaleIconProps) {
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
            {/* HORIZONTAL AXIS (2px) */}
            <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
            {/* UPWARD TRIANGLE — thesis (2px) */}
            <path d="M7 16L12 6L17 16" strokeWidth="2" />
            {/* DOWNWARD TRIANGLE — antithesis (1.5px) */}
            <path d="M7 8L12 18L17 8" strokeWidth="1.5" />
            {/* SYNTHESIS POINT (filled) */}
            <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
            {/* TENSION MARKS (0.5px) */}
            <line x1="4" y1="10" x2="5" y2="11" strokeWidth="0.5" opacity="0.5" />
            <line x1="4" y1="14" x2="5" y2="13" strokeWidth="0.5" opacity="0.5" />
            <line x1="20" y1="10" x2="19" y2="11" strokeWidth="0.5" opacity="0.5" />
            <line x1="20" y1="14" x2="19" y2="13" strokeWidth="0.5" opacity="0.5" />
        </svg>
    );
}
