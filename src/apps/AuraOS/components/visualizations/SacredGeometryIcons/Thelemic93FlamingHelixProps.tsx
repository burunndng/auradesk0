import React from 'react';

interface Thelemic93FlamingHelixProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const Thelemic93FlamingHelix: React.FC<Thelemic93FlamingHelixProps> = ({
  width = 64,
  height = 64,
  className = '',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={width}
    height={height}
    className={className}
    aria-labelledby="title desc"
    role="img"
    {...props}
  >
    <title id="title">Thelemic 93 Flaming Helix</title>
    <desc id="desc">Double helix ascending into 11-flame corona — Cycle 3.</desc>
    <defs>
      <mask id="helixMask1">
        <rect width="64" height="64" fill="white" />
        <circle cx="32" cy="32" r="6.8" fill="black" />
      </mask>
      <mask id="helixMask2">
        <rect width="64" height="64" fill="white" />
        <circle cx="32" cy="32" r="6.8" fill="black" />
      </mask>
    </defs>
    <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.05" opacity="0.22" />
    <line x1="32" y1="2.8" x2="32" y2="61.2" stroke="currentColor" strokeWidth="0.95" opacity="0.18" />
    <line x1="2.8" y1="32" x2="61.2" y2="32" stroke="currentColor" strokeWidth="0.95" opacity="0.18" />
    <circle cx="32" cy="2.8" r="1.55" fill="currentColor" opacity="0.26" />
    <circle cx="32" cy="61.2" r="1.55" fill="currentColor" opacity="0.26" />
    <line x1="32" y1="7" x2="32" y2="57" stroke="currentColor" strokeWidth="2.45" opacity="0.82" strokeLinecap="round" />
    <path d="M32 55 C39.5 49 25.5 46 38.5 39 C49.5 32 23 29 36 22 C46 16 26 13 32 8" fill="none" stroke="currentColor" strokeWidth="2.85" opacity="0.92" strokeLinecap="round" strokeLinejoin="round" mask="url(#helixMask1)" />
    <path d="M32 55 C24.5 49 38.5 46 25.5 39 C16 32 41 29 28 22 C18 16 38 13 32 8" fill="none" stroke="currentColor" strokeWidth="2.85" opacity="0.92" strokeLinecap="round" strokeLinejoin="round" mask="url(#helixMask2)" />
    <g opacity="0.71">
      <path d="M32 11 L32 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M32 11 L37.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 11 L26.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 11 L41 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 11 L23 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </g>
    <path d="M32 13 Q19 7 16 15" fill="none" stroke="currentColor" strokeWidth="2.15" opacity="0.84" strokeLinejoin="round" />
    <path d="M32 13 Q45 7 48 15" fill="none" stroke="currentColor" strokeWidth="2.15" opacity="0.84" strokeLinejoin="round" />
    <line x1="26" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3.55" opacity="0.36" strokeLinecap="round" />
    <path d="m32,26 2.1,4.4 4.65,0 -3.8,2.95 1.55,4.55 -4.25,-3.1 -4.25,3.1 1.55,-4.55 -3.8,-2.95 4.65,0 z" fill="none" stroke="currentColor" strokeWidth="1.05" opacity="0.68" />
    <circle cx="32" cy="32" r="2.65" fill="currentColor" opacity="0.89" />
    <circle cx="32" cy="32" r="1.35" fill="currentColor" opacity="0.62" />
    <circle cx="32" cy="32" r="0.8" fill="#000" opacity="0.28" />
  </svg>
);

export default Thelemic93FlamingHelix;
