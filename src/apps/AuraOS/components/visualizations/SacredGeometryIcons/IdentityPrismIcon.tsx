import React from 'react';

/**
 * IdentityPrismIcon
 * A triangular prism splitting a single ray into three — role refraction.
 * Used for: Role Alignment
 */

interface IdentityPrismIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function IdentityPrismIcon({
    size = 64,
    color = 'currentColor',
    className = ''
}: IdentityPrismIconProps) {
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
            {/* PRISM — equilateral triangle (2px) */}
            <path d="M12 3L21 19H3L12 3Z" strokeWidth="2" />
            {/* INCOMING RAY (1.5px) */}
            <line x1="2" y1="10" x2="9" y2="12" strokeWidth="1.5" />
            {/* REFRACTED RAYS — three identities (1px) */}
            <line x1="15" y1="10" x2="22" y2="6" strokeWidth="1" />
            <line x1="15" y1="12" x2="22" y2="12" strokeWidth="1" />
            <line x1="15" y1="14" x2="22" y2="18" strokeWidth="1" />
            {/* REFRACTION POINT (filled) */}
            <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
            {/* SPECTRAL HINTS (0.5px) */}
            <line x1="14" y1="11" x2="15" y2="10" strokeWidth="0.5" opacity="0.4" />
            <line x1="14" y1="13" x2="15" y2="14" strokeWidth="0.5" opacity="0.4" />
        </svg>
    );
}
