import React from 'react';

/**
 * StackArchitectIcon
 * Four nested squares (body/mind/spirit/shadow) with connecting bridges — integral design.
 * Used for: Integral Practice Designer
 */

interface StackArchitectIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function StackArchitectIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: StackArchitectIconProps) {
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
            {/* OUTER SQUARE — full integral map (2px) */}
            <rect x="2" y="2" width="20" height="20" rx="1" strokeWidth="2" />
            {/* MIDDLE SQUARE (1.5px) */}
            <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth="1.5" />
            {/* INNER SQUARE (1px) */}
            <rect x="9" y="9" width="6" height="6" rx="1" strokeWidth="1" />
            {/* CONNECTING BRIDGES — the four modules (1px) */}
            <line x1="12" y1="2" x2="12" y2="6" strokeWidth="1" opacity="0.7" />
            <line x1="12" y1="18" x2="12" y2="22" strokeWidth="1" opacity="0.7" />
            <line x1="2" y1="12" x2="6" y2="12" strokeWidth="1" opacity="0.7" />
            <line x1="18" y1="12" x2="22" y2="12" strokeWidth="1" opacity="0.7" />
            {/* CENTER NODE (filled) */}
            <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
            {/* CORNER ANCHORS (0.5px) */}
            <circle cx="6" cy="6" r="0.5" fill={color} stroke="none" opacity="0.5" />
            <circle cx="18" cy="6" r="0.5" fill={color} stroke="none" opacity="0.5" />
            <circle cx="6" cy="18" r="0.5" fill={color} stroke="none" opacity="0.5" />
            <circle cx="18" cy="18" r="0.5" fill={color} stroke="none" opacity="0.5" />
        </svg>
    );
}
