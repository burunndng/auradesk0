import React from 'react';

/**
 * DecisionForkIcon
 * Two diverging paths from a single node, enclosed in a circle — the choice point.
 * Used for: Decision Wizard
 */

interface DecisionForkIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function DecisionForkIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: DecisionForkIconProps) {
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
            {/* CONTAINING CIRCLE (2px) */}
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            {/* TRUNK — path leading to fork (1.5px) */}
            <path d="M12 20V13" strokeWidth="1.5" />
            {/* LEFT FORK (1.5px) */}
            <path d="M12 13C12 13 8 10 6 6" strokeWidth="1.5" />
            {/* RIGHT FORK (1.5px) */}
            <path d="M12 13C12 13 16 10 18 6" strokeWidth="1.5" />
            {/* FORK NODE — decision point (filled) */}
            <circle cx="12" cy="13" r="1.5" fill={color} stroke="none" />
            {/* DESTINATION NODES (1px) */}
            <circle cx="6" cy="6" r="1" strokeWidth="1" />
            <circle cx="18" cy="6" r="1" strokeWidth="1" />
            {/* WEIGHT LINES (0.5px) */}
            <line x1="8" y1="11" x2="7" y2="10" strokeWidth="0.5" opacity="0.4" />
            <line x1="16" y1="11" x2="17" y2="10" strokeWidth="0.5" opacity="0.4" />
        </svg>
    );
}
