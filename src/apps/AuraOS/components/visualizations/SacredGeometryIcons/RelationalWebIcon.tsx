import React from 'react';

/**
 * RelationalWebIcon
 * Three interconnected nodes forming a triangle with radiating threads — relational patterns.
 * Used for: Relational Pattern Tracker
 */

interface RelationalWebIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function RelationalWebIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: RelationalWebIconProps) {
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
            {/* PRIMARY TRIANGLE — relational field (2px) */}
            <path d="M12 3L21 19H3Z" strokeWidth="2" />
            {/* CONNECTING THREADS — relationship lines (1px) */}
            <line x1="12" y1="3" x2="12" y2="13" strokeWidth="1" />
            <line x1="3" y1="19" x2="12" y2="13" strokeWidth="1" />
            <line x1="21" y1="19" x2="12" y2="13" strokeWidth="1" />
            {/* PRIMARY NODES — self and two others (filled) */}
            <circle cx="12" cy="3" r="1.5" fill={color} stroke="none" />
            <circle cx="3" cy="19" r="1.5" fill={color} stroke="none" />
            <circle cx="21" cy="19" r="1.5" fill={color} stroke="none" />
            {/* CENTER — the relational self (1.5px) */}
            <circle cx="12" cy="13" r="2" strokeWidth="1.5" />
            <circle cx="12" cy="13" r="0.6" fill={color} stroke="none" />
            {/* SECONDARY THREADS (0.5px) */}
            <line x1="7" y1="11" x2="5" y2="10" strokeWidth="0.5" opacity="0.4" />
            <line x1="17" y1="11" x2="19" y2="10" strokeWidth="0.5" opacity="0.4" />
            <line x1="12" y1="17" x2="12" y2="19" strokeWidth="0.5" opacity="0.4" />
        </svg>
    );
}
