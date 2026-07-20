import React from 'react';

/**
 * PhaseWheelIcon
 * Four-phase Panarchy cycle (r→K→Ω→α) in a circle — adaptive renewal.
 * Used for: Adaptive Cycle
 */

interface PhaseWheelIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function PhaseWheelIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: PhaseWheelIconProps) {
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
            {/* CYCLE RING (2px) */}
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            {/* FOUR PHASE ARCS — the panarchy loop (1.5px) */}
            {/* Growth r — bottom-right to top-right */}
            <path d="M16 18C19 15 19 9 16 6" strokeWidth="1.5" />
            {/* Conservation K — top-right to top-left */}
            <path d="M16 6C13 4 11 4 8 6" strokeWidth="1.5" />
            {/* Release Ω — top-left to bottom-left */}
            <path d="M8 6C5 9 5 15 8 18" strokeWidth="1.5" />
            {/* Reorganization α — bottom-left to bottom-right */}
            <path d="M8 18C11 20 13 20 16 18" strokeWidth="1.5" />
            {/* PHASE NODES (filled) */}
            <circle cx="16" cy="18" r="1.2" fill={color} stroke="none" />
            <circle cx="16" cy="6" r="1" strokeWidth="1" />
            <circle cx="8" cy="6" r="1" strokeWidth="1" />
            <circle cx="8" cy="18" r="1" strokeWidth="1" />
            {/* DIRECTION ARROWS (0.5px) */}
            <line x1="18" y1="11" x2="18" y2="9" strokeWidth="0.5" opacity="0.5" />
            <line x1="18" y1="9" x2="17" y2="10" strokeWidth="0.5" opacity="0.5" />
            <line x1="12" y1="4" x2="10" y2="4.5" strokeWidth="0.5" opacity="0.5" />
            <line x1="10" y1="4.5" x2="11" y2="5.5" strokeWidth="0.5" opacity="0.5" />
        </svg>
    );
}
