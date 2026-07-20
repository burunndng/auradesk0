import React, { useId } from 'react';

interface IconProps {
    size?: number | string;
    className?: string;
    strokeWidth?: number;
    style?: React.CSSProperties;
}

// The Wrapper: Uses currentColor for reliable rendering across all contexts.
// The gradient is applied via CSS filter for glow effect when active.
const SacredIconWrapper: React.FC<IconProps & { children: React.ReactNode }> = ({
    size = 24,
    className = "",
    strokeWidth = 1.5,
    style,
    children
}) => {
    // Generate unique ID to avoid collisions when multiple icons render
    const uniqueId = useId();
    const gradientId = `sacred-grad-${uniqueId}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <defs>
                {/* Unique gradient ID per instance to avoid collisions */}
                <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" /> {/* Purple-400 - brighter for visibility */}
                    <stop offset="100%" stopColor="#fbbf24" /> {/* Amber-400 - brighter */}
                </linearGradient>
            </defs>
            {children}
        </svg>
    );
};

// --- 5 PRIMARY MOBILE NAV ICONS ---

export const VesicaPiscisIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="9" cy="12" r="7" />
        <circle cx="15" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" opacity="0.5" />
    </SacredIconWrapper>
);

export const SquaredCircleIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="8" />
        <rect x="5" y="5" width="14" height="14" rx="1" opacity="0.6" />
        <path d="M12 4V20 M4 12H20" opacity="0.3" />
    </SacredIconWrapper>
);

export const MetatronsCubeIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" />
        <path d="M12 22V12 M20.66 7L12 12 M3.34 7L12 12" opacity="0.7" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="2" r="1" />
        <circle cx="20.66" cy="7" r="1" />
        <circle cx="20.66" cy="17" r="1" />
        <circle cx="12" cy="22" r="1" />
        <circle cx="3.34" cy="17" r="1" />
        <circle cx="3.34" cy="7" r="1" />
    </SacredIconWrapper>
);

export const EyeOfHorusIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M2 12C2 12 6 5 12 5C18 5 22 12 22 12C22 12 18 19 12 19C6 19 2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 19V22 M12 22L16 22" />
        <path d="M22 12C20 12 18 14 16 16" opacity="0.6" />
    </SacredIconWrapper>
);

export const TreeOfLifeIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="12" cy="21" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="7" cy="7" r="1.5" />
        <circle cx="17" cy="7" r="1.5" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
        <path d="M12 4.5V20" opacity="0.5" />
        <path d="M7 8.5V15.5" opacity="0.5" />
        <path d="M17 8.5V15.5" opacity="0.5" />
        <path d="M7 7H17 M7 17H17" opacity="0.5" />
    </SacredIconWrapper>
);

// --- SIDEBAR / GROUP ICONS ---

export const LabyrinthIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 21 C6 21 2 16 2 12 C2 6 8 3 12 3 C17 3 20 7 20 12 C20 15 18 17 15 17 C11 17 9 14 9 12 C9 9 11 8 12 8 C14 8 15 10 15 12" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </SacredIconWrapper>
);

export const SolarWheelIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3V9 M12 15V21 M3 12H9 M15 12H21" />
        <path d="M5.6 5.6L9.2 9.2 M14.8 14.8L18.4 18.4" opacity="0.6" />
        <path d="M18.4 5.6L14.8 9.2 M9.2 14.8L5.6 18.4" opacity="0.6" />
    </SacredIconWrapper>
);

export const OctagramIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L14.5 9.5H22L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5H9.5L12 2Z" />
        <circle cx="12" cy="12" r="2" />
    </SacredIconWrapper>
);

export const TriquetraIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 4C14 8 20 9 20 14C20 19 15 20 12 17C9 20 4 19 4 14C4 9 10 8 12 4Z" />
        <circle cx="12" cy="12.5" r="6" opacity="0.5" />
    </SacredIconWrapper>
);

export const CompassRoseIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" />
        <circle cx="12" cy="12" r="2" />
    </SacredIconWrapper>
);

export const IcosahedronIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
        <path d="M4 7L20 7L12 22L4 7Z" opacity="0.7" />
        <path d="M12 2V22" opacity="0.4" />
    </SacredIconWrapper>
);

export const TetrahedronIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L3 20H21L12 2Z" />
        <path d="M12 2L12 14L3 20" opacity="0.6" />
        <path d="M12 14L21 20" opacity="0.6" />
    </SacredIconWrapper>
);

export const MerkabaNavIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L3 16H21L12 2Z" />
        <path d="M12 22L21 8H3L12 22Z" opacity="0.7" />
    </SacredIconWrapper>
);

export const TorusIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="5" />
        <ellipse cx="12" cy="12" rx="5" ry="10" />
        <circle cx="12" cy="12" r="3" />
    </SacredIconWrapper>
);

export const PentacleIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 3L15 11H21L16 15L18 21L12 17L6 21L8 15L3 11H9L12 3Z" />
    </SacredIconWrapper>
);

export const QuaternityIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3V21 M3 12H21" />
        <rect x="7.5" y="7.5" width="9" height="9" transform="rotate(45 12 12)" opacity="0.6" />
    </SacredIconWrapper>
);

export const AnkhIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 10C15 10 17 8 17 5C17 2 12 2 12 2C12 2 7 2 7 5C7 8 9 10 12 10Z" />
        <path d="M12 10V22" />
        <path d="M6 14H18" />
    </SacredIconWrapper>
);

export const EndlessKnotIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 4V20 M16 4V20 M4 8H20 M4 16H20" opacity="0.5" />
        <path d="M8 8H16V16H8V8Z" />
    </SacredIconWrapper>
);

export const HendecagramIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2V6 M12 18V22 M2 12H6 M18 12H22" />
        <path d="M5 5L8 8 M16 16L19 19 M5 19L8 16 M16 8L19 5" />
    </SacredIconWrapper>
);

export const MandalaIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="9" opacity="0.3" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 2V22 M2 12H22" opacity="0.5" />
        <circle cx="12" cy="7" r="2" />
        <circle cx="12" cy="17" r="2" />
        <circle cx="7" cy="12" r="2" />
        <circle cx="17" cy="12" r="2" />
    </SacredIconWrapper>
);

export const SeedOfLifeIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 6A4 4 0 0 1 12 18A4 4 0 0 1 12 6" opacity="0.6" />
        <path d="M6 9A4 4 0 0 1 18 9" opacity="0.6" />
        <path d="M6 15A4 4 0 0 1 18 15" opacity="0.6" />
    </SacredIconWrapper>
);

export const FlowerOfLifeIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C17 2 22 12 22 12C22 12 17 22 12 22C7 22 2 12 2 12C2 12 7 2 12 2Z" />
        <path d="M12 2V22" opacity="0.5" />
        <path d="M2 12H22" opacity="0.5" />
        <circle cx="12" cy="12" r="3" />
    </SacredIconWrapper>
);

export const NetworkNodesIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="3" opacity="0.5" />
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <line x1="7" y1="6" x2="10" y2="10" opacity="0.5" />
        <line x1="17" y1="6" x2="14" y2="10" opacity="0.5" />
        <line x1="7" y1="18" x2="10" y2="14" opacity="0.5" />
        <line x1="17" y1="18" x2="14" y2="14" opacity="0.5" />
    </SacredIconWrapper>
);

export const ScrollIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M6 3 Q2 3 2 6 L2 18 Q2 21 6 21" />
        <path d="M6 3 L18 3 Q22 3 22 6 L22 15 Q22 18 18 18 L9 18" />
        <path d="M6 21 L6 18 Q6 15 9 15 L9 18 Q9 21 6 21" />
        <line x1="8" y1="8" x2="18" y2="8" opacity="0.5" />
        <line x1="8" y1="12" x2="16" y2="12" opacity="0.5" />
    </SacredIconWrapper>
);

export const GrowthSpiralIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 22V14 Q8 10 12 6 Q16 2 20 6" />
        <circle cx="12" cy="6" r="2" />
        <path d="M8 18Q5 16 3 18" opacity="0.5" />
        <path d="M16 18Q19 16 21 18" opacity="0.5" />
    </SacredIconWrapper>
);

export const SealedDocumentIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="7" x2="16" y2="7" opacity="0.5" />
        <line x1="8" y1="10" x2="14" y2="10" opacity="0.5" />
        <circle cx="12" cy="16" r="3" />
    </SacredIconWrapper>
);

// --- EXPANSION PACK: ALCHEMY, BALANCE & COSMOS ---

// The Caduceus - Healing, Kundalini, Energy Work
export const CaduceusIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2V22" strokeLinecap="round" />
        <path d="M12 6C16 6 18 4 18 2" opacity="0.6" />
        <path d="M12 6C8 6 6 4 6 2" opacity="0.6" />
        <path d="M12 22C16 20 16 16 12 14C8 12 8 8 12 6" />
        <path d="M12 22C8 20 8 16 12 14C16 12 16 8 12 6" />
    </SacredIconWrapper>
);

// The Lotus - Enlightenment, Unfolding, Spirit
export const LotusIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 21V16" opacity="0.5" />
        <path d="M12 16C12 16 16 12 16 8C16 4 12 2 12 2C12 2 8 4 8 8C8 12 12 16 12 16Z" />
        <path d="M16 15C18 14 21 11 21 8C21 5 18 4 16 8" />
        <path d="M8 15C6 14 3 11 3 8C3 5 6 4 8 8" />
        <path d="M4 18C6 20 10 21 12 21C14 21 18 20 20 18" opacity="0.6" />
    </SacredIconWrapper>
);

// Yin Yang - Balance, Duality, Dao
export const YinYangIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C17.5 2 17.5 12 12 12C6.5 12 6.5 22 12 22" />
        <circle cx="12" cy="7" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="12" cy="17" r="1.5" />
    </SacredIconWrapper>
);

// The Hexagram (Star of David) - As Above So Below
export const HexagramIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L20.66 17H3.34L12 2Z" />
        <path d="M12 22L3.34 7H20.66L12 22Z" />
    </SacredIconWrapper>
);

// The Dodecahedron - The 5th Element (Ether), Spirit
export const DodecahedronIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L21.5 8.9L17.9 20.1H6.1L2.5 8.9L12 2Z" />
        <path d="M12 7L16.7 10.4L15 15.8H9L7.3 10.4L12 7Z" opacity="0.7" />
        <path d="M12 2L12 7" opacity="0.4" />
        <path d="M21.5 8.9L16.7 10.4" opacity="0.4" />
        <path d="M17.9 20.1L15 15.8" opacity="0.4" />
    </SacredIconWrapper>
);

// The Golden Spiral (Fibonacci) - Growth, Evolution
export const GoldenSpiralIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <rect x="3" y="3" width="18" height="18" rx="1" opacity="0.2" />
        <path d="M10 11C10 11.55 10.45 12 11 12H12" opacity="0.6" />
        <path d="M12 12C13.1 12 14 11.1 14 10V8" opacity="0.7" />
        <path d="M14 8C14 5.8 12.2 4 10 4H8" />
        <path d="M8 4C4.7 4 2 6.7 2 10V14" />
        <path d="M2 14C2 18.4 5.6 22 10 22H21" />
    </SacredIconWrapper>
);

// The Chalice / Grail - Feminine, Receptivity
export const ChaliceIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M18 6C18 11 15 14 12 14C9 14 6 11 6 6" />
        <path d="M12 14V20" />
        <path d="M7 20H17" />
        <ellipse cx="12" cy="6" rx="6" ry="2" />
    </SacredIconWrapper>
);

// The Sword - Masculine, Intellect, Discernment
export const SwordIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L14 4L13 16L12 20L11 16L10 4L12 2Z" />
        <path d="M8 16H16" />
        <path d="M12 20V22" strokeWidth={2} />
        <line x1="12" y1="2" x2="12" y2="16" opacity="0.5" />
    </SacredIconWrapper>
);

// Triskelion - Motion, Action, Cycles
export const TriskelionIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 12L12 6C12 4 14 2 16 4" />
        <path d="M12 12L17.2 15C18.9 16 19.9 18 18.2 19" />
        <path d="M12 12L6.8 15C5.1 16 4.1 18 5.8 19" />
    </SacredIconWrapper>
);

// Vector Equilibrium - Zero Point, Stillness
export const VectorEquilibriumIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2L18 6V12L12 16L6 12V6L12 2Z" />
        <path d="M12 22L6 18V12" opacity="0.5" />
        <path d="M12 22L18 18V12" opacity="0.5" />
        <path d="M6 6L18 6" />
        <path d="M6 12L18 12" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </SacredIconWrapper>
);

// Triple Moon - Goddess, Maiden/Mother/Crone
export const TripleMoonIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M6 8C4 9 3 10.5 3 12C3 13.5 4 15 6 16" />
        <path d="M18 8C20 9 21 10.5 21 12C21 13.5 20 15 18 16" />
    </SacredIconWrapper>
);

// The Enneagram - Personality, Integration
export const EnneagramIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L19 16H5L12 2Z" opacity="0.7" />
        <path d="M12 17L16 9L4 14H20L8 9L12 17" opacity="0.5" />
    </SacredIconWrapper>
);

// Infinity / Lemniscate - Eternal cycles
export const InfinityIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M6 12 C6 8 10 8 12 12 C14 16 18 16 18 12 C18 8 14 8 12 12 C10 16 6 16 6 12 Z" />
    </SacredIconWrapper>
);

// Heptagram (7-pointed Star) - Spiritual development
export const HeptagramIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <polygon points="12,2 14,8 20,6 18,12 22,18 12,16 2,18 6,12 4,6 10,8" />
    </SacredIconWrapper>
);

// Torus Cross Section - Self-sustaining energy
export const TorusCrossSectionIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="2" opacity="0.6" />
        <line x1="4" y1="12" x2="20" y2="12" opacity="0.4" />
        <line x1="12" y1="4" x2="12" y2="20" opacity="0.4" />
    </SacredIconWrapper>
);

// Triad Knot - Synthesis of opposites
export const TriadKnotIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <path d="M12 2 L18 12 L6 12 L12 2 M6 12 L12 22 L18 12" />
        <circle cx="12" cy="12" r="3" opacity="0.6" />
    </SacredIconWrapper>
);

// Flower Core - Universal connection
export const FlowerCoreIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props}>
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="8" opacity="0.4" />
        <circle cx="12" cy="8" r="4" opacity="0.6" />
        <circle cx="15.5" cy="10" r="4" opacity="0.6" />
        <circle cx="15.5" cy="14" r="4" opacity="0.6" />
        <circle cx="12" cy="16" r="4" opacity="0.6" />
        <circle cx="8.5" cy="14" r="4" opacity="0.6" />
        <circle cx="8.5" cy="10" r="4" opacity="0.6" />
    </SacredIconWrapper>
);

// --- ACTION / UI ICONS (sacred-geometry-proportioned, stroke-based) ---

/**
 * SacredCloseIcon
 * Concept: The Release — dissolution of form, threshold crossed
 * Geometry: Two diagonals inscribed in a 16×16 inner square, rotated 45°,
 *           with a faint outer circle (completion ring) at r=10
 */
export const SacredCloseIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" strokeWidth={0.6} opacity={0.25} />
        <line x1="7" y1="7" x2="17" y2="17" />
        <line x1="17" y1="7" x2="7" y2="17" />
    </SacredIconWrapper>
);

/**
 * SacredChevronLeftIcon
 * Concept: Return — retracing the path inward
 * Geometry: Chevron drawn through golden-ratio waypoints, flanked by a single
 *           horizontal axis line at reduced opacity for balance
 */
export const SacredChevronLeftIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <path d="M15 6L9 12L15 18" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="9" y1="12" x2="20" y2="12" strokeWidth={0.5} opacity={0.3} />
    </SacredIconWrapper>
);

/**
 * SacredChevronRightIcon
 * Concept: Advance — moving toward the next threshold
 */
export const SacredChevronRightIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <path d="M9 6L15 12L9 18" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="4" y1="12" x2="15" y2="12" strokeWidth={0.5} opacity={0.3} />
    </SacredIconWrapper>
);

/**
 * SacredAlertIcon
 * Concept: The Threshold Warning — attention required before crossing
 * Geometry: Triangle (tetrahedron cross-section) with inner circle (witness)
 *           and a vertical line + dot (axis mundi signal)
 */
export const SacredAlertIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.4}>
        <path d="M12 3L21.5 20H2.5L12 3Z" strokeLinejoin="round" />
        <line x1="12" y1="10" x2="12" y2="14.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </SacredIconWrapper>
);

/**
 * SacredSpinnerIcon
 * Concept: The Unfolding — process in motion, threshold not yet crossed
 * Geometry: Partial arc (270° open circle) inscribed with two node points —
 *           rotation applied via CSS animation class
 */
export const SacredSpinnerIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        {/* 270° arc — open at bottom-right */}
        <path d="M12 3 A9 9 0 1 1 20.3 16.5" strokeLinecap="round" />
        <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" opacity={0.7} />
    </SacredIconWrapper>
);

/**
 * SacredLockIcon
 * Concept: The Threshold Seal — passage requires initiation
 * Symbolism: Octagram (cosmic order), outer circle (completion), vesica piscis keyhole (gateway/threshold)
 * Geometry: 8-pointed star via two overlapping squares rotated 45°, inscribed circle r=10, keyhole as vesica piscis
 */
export const SacredLockIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1}>
        {/* Outer circle — the seal boundary */}
        <circle cx="12" cy="12" r="10" strokeWidth={0.75} opacity={0.5} />

        {/* Octagram — two squares rotated 45° */}
        {/* Square 1 */}
        <rect x="5.5" y="5.5" width="13" height="13" rx="0.5" strokeWidth={0.75} opacity={0.6} />
        {/* Square 2 — rotated 45° */}
        <rect x="5.5" y="5.5" width="13" height="13" rx="0.5" strokeWidth={0.75} opacity={0.6}
            transform="rotate(45 12 12)" />

        {/* Inner circle — inner sanctum */}
        <circle cx="12" cy="12" r="5.5" strokeWidth={1} />

        {/* Keyhole — vesica piscis motif */}
        {/* Circle portion of keyhole */}
        <circle cx="12" cy="10.5" r="2" strokeWidth={1} />
        {/* Triangular shaft of keyhole */}
        <path d="M10.5 12 L11.2 15 L12.8 15 L13.5 12" strokeWidth={1} strokeLinejoin="round" />

        {/* 8 radial tick marks at star points */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 12 + 7 * Math.cos(rad);
            const y1 = 12 + 7 * Math.sin(rad);
            const x2 = 12 + 9.5 * Math.cos(rad);
            const y2 = 12 + 9.5 * Math.sin(rad);
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={0.75} opacity={0.7} />;
        })}
    </SacredIconWrapper>
);

/**
 * OctagramStarIcon
 * Concept: The Star of Lakshmi — dual overlapping squares, full K8 connectivity
 * Symbolism: Two squares (matter + spirit), octagram (8-fold path), outer circle
 *            (completion), inner octagon (threshold), filled nodes at all vertices
 * Geometry: 100×100 viewBox. R=42 outer, R_IN=32.1 inner (exact intersection math).
 *           Full connectivity: octagon + skip-3 + long diagonals + two squares.
 *           All strokes/nodes size-adaptive via targetPx × 100/sz.
 */
export const OctagramStarIcon: React.FC<IconProps> = ({ size = 24, className, style }) => {
    const sz = typeof size === 'number' ? size : parseInt(size as string, 10) || 24;

    const CX = 50, CY = 50;
    const R = 42;      // outer vertex radius
    const R_IN = 32.1; // inner intersection ring (exact: sqrt(11.72²+28.28²) with R=42)

    const pt = (deg: number, r: number): [number, number] => {
        const rad = (deg - 90) * Math.PI / 180;
        return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
    };

    // 8 outer points [0]=T [1]=TR [2]=R [3]=BR [4]=B [5]=BL [6]=L [7]=TL
    const o = [0, 45, 90, 135, 180, 225, 270, 315].map(d => pt(d, R));
    // 8 inner intersection nodes (between adjacent outer pairs)
    const inn = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(d => pt(d, R_IN));

    const fmt = (pts: [number, number][]) =>
        pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

    // Size-adaptive stroke widths (targetPx × 100 / sz)
    const sw  = (0.85 * 100) / sz;  // primary — two squares
    const swM = (0.55 * 100) / sz;  // medium — inner octagon
    const swD = (0.38 * 100) / sz;  // thin — outer ring, diagonals, skip-3
    const nrO = (2.0  * 100) / sz;  // outer node radius
    const nrI = (1.35 * 100) / sz;  // inner node radius
    const nrC = (2.5  * 100) / sz;  // center node radius

    // Square 1: cardinal T,R,B,L (indices 0,2,4,6)
    const sq1 = [o[0], o[2], o[4], o[6]];
    // Square 2: diagonal TR,BR,BL,TL (indices 1,3,5,7)
    const sq2 = [o[1], o[3], o[5], o[7]];

    // Skip-3 connections (each vertex to vertex 3 steps away — 8 unique pairs)
    const skip3: [number, number][] = [[0,3],[1,4],[2,5],[3,6],[4,7],[0,5],[1,6],[2,7]];
    // Long diagonals — opposite vertices (4 pairs)
    const diags: [number, number][] = [[0,4],[1,5],[2,6],[3,7]];

    return (
        <svg width={sz} height={sz} viewBox="0 0 100 100" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>

            {/* Outermost circle */}
            <circle cx={CX} cy={CY} r={45} stroke="currentColor" strokeWidth={swD} opacity={0.22} />

            {/* Outer octagon — adjacent vertex ring */}
            <polygon points={fmt(o)} stroke="currentColor" strokeWidth={swD}
                fill="none" opacity={0.38} />

            {/* Long diagonals through center */}
            {diags.map(([a, b], i) => (
                <line key={`d${i}`} x1={o[a][0]} y1={o[a][1]} x2={o[b][0]} y2={o[b][1]}
                    stroke="currentColor" strokeWidth={swD} opacity={0.28} />
            ))}

            {/* Skip-3 connections — inner lattice */}
            {skip3.map(([a, b], i) => (
                <line key={`s${i}`} x1={o[a][0]} y1={o[a][1]} x2={o[b][0]} y2={o[b][1]}
                    stroke="currentColor" strokeWidth={swD} opacity={0.2} />
            ))}

            {/* Square 1 — cardinal axis */}
            <polygon points={fmt(sq1)} stroke="currentColor" strokeWidth={sw}
                fill="none" strokeLinejoin="miter" opacity={0.92} />

            {/* Square 2 — diagonal axis, rotated 45° */}
            <polygon points={fmt(sq2)} stroke="currentColor" strokeWidth={sw}
                fill="none" strokeLinejoin="miter" opacity={0.92} />

            {/* Inner octagon at intersection ring */}
            <polygon points={fmt(inn)} stroke="currentColor" strokeWidth={swM}
                fill="none" opacity={0.5} />

            {/* Outer vertex nodes */}
            {o.map(([x, y], i) => (
                <circle key={`on${i}`} cx={x} cy={y} r={nrO} fill="currentColor" opacity={0.95} />
            ))}

            {/* Inner intersection nodes */}
            {inn.map(([x, y], i) => (
                <circle key={`in${i}`} cx={x} cy={y} r={nrI} fill="currentColor" opacity={0.7} />
            ))}

            {/* Center — halo + dot */}
            <circle cx={CX} cy={CY} r={nrC * 1.7} stroke="currentColor"
                strokeWidth={swD} fill="none" opacity={0.38} />
            <circle cx={CX} cy={CY} r={nrC} fill="currentColor" opacity={0.92} />
        </svg>
    );
};

// --- UTILITY / SYSTEM ACTION ICONS ---
// Sacred-geometry-proportioned, 1.5px stroke, same visual language as nav icons.

export const SacredMenuIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <line x1="3" y1="7"  x2="21" y2="7"  strokeLinecap="round" />
        <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
        <line x1="3" y1="17" x2="21" y2="17" strokeLinecap="round" />
        <line x1="12" y1="4" x2="12" y2="20" strokeWidth={0.4} opacity={0.2} />
    </SacredIconWrapper>
);

export const SacredUserIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20C4 16 7.6 13 12 13C16.4 13 20 16 20 20" strokeLinecap="round" />
        <line x1="12" y1="2" x2="12" y2="4" strokeWidth={0.5} opacity={0.3} />
    </SacredIconWrapper>
);

export const SacredShieldIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <path d="M12 2L20 6V12C20 16.4 16.4 20.8 12 22C7.6 20.8 4 16.4 4 12V6L12 2Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.5" strokeWidth={1} opacity={0.6} />
        <line x1="12" y1="7" x2="12" y2="9.5" strokeWidth={0.6} opacity={0.4} />
    </SacredIconWrapper>
);

export const SacredScaleIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <line x1="12" y1="3" x2="12" y2="21" strokeLinecap="round" />
        <line x1="4" y1="8" x2="20" y2="8" strokeLinecap="round" />
        <path d="M4 8L2 14C2 14 4 16 6 14L4 8Z" strokeLinejoin="round" opacity={0.8} />
        <path d="M20 8L18 14C18 14 20 16 22 14L20 8Z" strokeLinejoin="round" opacity={0.8} />
        <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" opacity={0.7} />
        <line x1="9" y1="21" x2="15" y2="21" strokeLinecap="round" opacity={0.5} />
    </SacredIconWrapper>
);

export const SacredDownloadIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <line x1="12" y1="3" x2="12" y2="16" strokeLinecap="round" />
        <path d="M7 12L12 17L17 12" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="4" y1="20" x2="20" y2="20" strokeLinecap="round" />
        <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" opacity={0.5} />
    </SacredIconWrapper>
);

export const SacredUploadIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <line x1="12" y1="20" x2="12" y2="7" strokeLinecap="round" />
        <path d="M7 11L12 6L17 11" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="4" y1="20" x2="20" y2="20" strokeLinecap="round" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" opacity={0.5} />
    </SacredIconWrapper>
);

export const SacredTrashIcon: React.FC<IconProps> = (props) => (
    <SacredIconWrapper {...props} strokeWidth={1.5}>
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" strokeLinejoin="round" />
        <path d="M5 6L6.5 20C6.5 21 7.5 22 8.5 22H15.5C16.5 22 17.5 21 17.5 20L19 6" strokeLinejoin="round" />
        <line x1="10" y1="10" x2="10" y2="18" strokeLinecap="round" opacity={0.5} />
        <line x1="14" y1="10" x2="14" y2="18" strokeLinecap="round" opacity={0.5} />
    </SacredIconWrapper>
);
