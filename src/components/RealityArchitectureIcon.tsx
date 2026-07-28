import { memo } from 'react';

interface RealityArchitectureIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const RealityArchitectureIcon = memo(function RealityArchitectureIcon({
  size = 24,
  className,
  style,
}: RealityArchitectureIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={style}
    >
      {/* Temple pillars */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Base platform */}
        <path d="M8 42 L24 38 L40 42" />
        <path d="M8 42 L8 38 L24 34 L40 38 L40 42" />

        {/* Left pillar */}
        <line x1="12" y1="38" x2="12" y2="16" />
        <line x1="16" y1="37" x2="16" y2="15" />

        {/* Right pillar */}
        <line x1="32" y1="37" x2="32" y2="15" />
        <line x1="36" y1="38" x2="36" y2="16" />

        {/* Architrave (top beam) */}
        <path d="M10 16 L24 12 L38 16" />
        <path d="M10 16 L10 13 L24 9 L38 13 L38 16" />

        {/* Pediment (triangle top) */}
        <path d="M14 13 L24 5 L34 13" />

        {/* Eye of Horus / All-seeing eye in pediment */}
        <circle cx="24" cy="10" r="2.5" />
        <circle cx="24" cy="10" r="0.8" fill="currentColor" />

        {/* Sacred geometry - inner lines */}
        <line x1="24" y1="16" x2="24" y2="38" />
        <line x1="16" y1="26" x2="32" y2="26" />

        {/* Diamond at center */}
        <path d="M24 20 L28 26 L24 32 L20 26 Z" />

        {/* Small star at apex */}
        <path d="M24 3 L24.8 4.5 L26.5 4.5 L25.2 5.5 L25.6 7 L24 6 L22.4 7 L22.8 5.5 L21.5 4.5 L23.2 4.5 Z" />

        {/* Radiating lines from eye */}
        <line x1="18" y1="10" x2="10" y2="6" strokeWidth="0.8" opacity="0.5" />
        <line x1="30" y1="10" x2="38" y2="6" strokeWidth="0.8" opacity="0.5" />
        <line x1="24" y1="5" x2="24" y2="1" strokeWidth="0.8" opacity="0.5" />
      </g>
    </svg>
  );
});

export default RealityArchitectureIcon;
