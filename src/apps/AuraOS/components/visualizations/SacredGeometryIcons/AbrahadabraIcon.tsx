import React from 'react';

interface AbrahadabraIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AbrahadabraIcon({
  size = 64,
  color = 'currentColor',
  className = '',
  style,
}: AbrahadabraIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-labelledby="abrahadabra-title abrahadabra-desc"
      role="img"
      className={className}
      style={style}
    >
      <title id="abrahadabra-title">Thelemic ABRAHADABRA Opus</title>
      <desc id="abrahadabra-desc">Final sigil of the Aeon: 93 current rising as living helix of Love &amp; Will through prominent unicursal hexagram heart into 11-flame RHK corona — ABRAHADABRA perfected.</desc>
      <defs>
        <mask id="abrahadabraMask">
          <rect width="64" height="64" fill="white" />
          <circle cx="32" cy="32" r="7.2" fill="black" />
        </mask>
      </defs>
      {/* Nuit sphere */}
      <circle cx="32" cy="32" r="29" fill="none" stroke={color} strokeWidth="1.05" opacity="0.22" />
      {/* Scaffolding (minimal) */}
      <line x1="32" y1="2.8" x2="32" y2="61.2" stroke={color} strokeWidth="0.95" opacity="0.18" />
      <line x1="2.8" y1="32" x2="61.2" y2="32" stroke={color} strokeWidth="0.95" opacity="0.18" />
      {/* Polar anchors */}
      <circle cx="32" cy="2.8" r="1.55" fill={color} opacity="0.26" />
      <circle cx="32" cy="61.2" r="1.55" fill={color} opacity="0.26" />
      {/* Axis Mundi (tapered ascent) */}
      <line x1="32" y1="8" x2="32" y2="56" stroke={color} strokeWidth="2.45" opacity="0.82" strokeLinecap="round" />
      {/* Living helix — under segments */}
      <path d="M32 53 C37.5 47 26 44 36 38.5" fill="none" stroke={color} strokeWidth="2.85" opacity="0.92" strokeLinecap="round" mask="url(#abrahadabraMask)" />
      <path d="M32 41 C38.5 36 25.5 33 35.5 27.5" fill="none" stroke={color} strokeWidth="2.85" opacity="0.92" strokeLinecap="round" mask="url(#abrahadabraMask)" />
      {/* Living helix — over segments */}
      <path d="M32 53 C26.5 47 38 44 28 38.5" fill="none" stroke={color} strokeWidth="2.85" opacity="0.92" strokeLinecap="round" />
      <path d="M32 41 C25.5 36 38.5 33 28.5 27.5" fill="none" stroke={color} strokeWidth="2.85" opacity="0.92" strokeLinecap="round" />
      {/* Prominent unicursal hexagram heart */}
      <path d="m32,24 2.9,6 6.35,0 -5.15,4 2.15,6.2 -5.75,-4.2 -5.75,4.2 2.15,-6.2 -5.15,-4 6.35,0 z" fill="none" stroke={color} strokeWidth="2.05" opacity="0.95" strokeLinejoin="round" strokeLinecap="round" />
      {/* 11-flame RHK corona */}
      <g opacity="0.73">
        <path d="M32 13 L32 6.5" stroke={color} strokeWidth="1.65" strokeLinecap="round" />
        <path d="M32 13 L37.2 7.8" stroke={color} strokeWidth="1.55" strokeLinecap="round" />
        <path d="M32 13 L26.8 7.8" stroke={color} strokeWidth="1.55" strokeLinecap="round" />
        <path d="M32 13 L41.5 8.5" stroke={color} strokeWidth="1.45" strokeLinecap="round" />
        <path d="M32 13 L22.5 8.5" stroke={color} strokeWidth="1.45" strokeLinecap="round" />
        <path d="M32 13 L44 9.5" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
        <path d="M32 13 L20 9.5" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
        <path d="M32 13 L40 10.8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
        <path d="M32 13 L24 10.8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
        <path d="M32 13 L37 12" stroke={color} strokeWidth="1.15" strokeLinecap="round" />
        <path d="M32 13 L27 12" stroke={color} strokeWidth="1.15" strokeLinecap="round" />
      </g>
      {/* Wings connecting helix to corona */}
      <path d="M32 15 Q19.5 9 17.5 16.5" fill="none" stroke={color} strokeWidth="2.1" opacity="0.83" strokeLinejoin="round" />
      <path d="M32 15 Q44.5 9 46.5 16.5" fill="none" stroke={color} strokeWidth="2.1" opacity="0.83" strokeLinejoin="round" />
      {/* Hadit core */}
      <circle cx="32" cy="32" r="2.65" fill={color} opacity="0.89" />
      <circle cx="32" cy="32" r="1.35" fill={color} opacity="0.55" />
      <circle cx="32" cy="32" r="0.75" fill={color} opacity="0.18" />
    </svg>
  );
}
