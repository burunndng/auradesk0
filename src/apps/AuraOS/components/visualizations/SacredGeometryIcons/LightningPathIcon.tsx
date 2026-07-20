import React from 'react';

interface LightningPathIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * LightningPath Icon
 * Concept: The Flaming Sword / Lightning Flash of Creation
 * Symbolism:
 *   - Descent: Divine light cascading from Kether to Malkuth
 *   - 10 Sephiroth: Stations of emanation along the Tree
 *   - Zigzag: Alternation between Mercy (right) and Severity (left)
 *   - The Three Pillars: Implicit structure holding the lightning
 * Geometry: Precise Tree proportions, hierarchical node sizing
 */
export default function LightningPathIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: LightningPathIconProps) {
  // Sephiroth positions (mathematically deliberate)
  // x: 6 (Severity), 12 (Balance), 18 (Mercy)
  // y: distributed to avoid clipping, respect visual balance
  const sephiroth = {
    kether:    { x: 12, y: 3 },
    chokmah:   { x: 18, y: 5 },
    binah:     { x: 6,  y: 5 },
    chesed:    { x: 18, y: 8 },
    geburah:   { x: 6,  y: 8 },
    tiphareth: { x: 12, y: 11 },
    netzach:   { x: 18, y: 14 },
    hod:       { x: 6,  y: 14 },
    yesod:     { x: 12, y: 17 },
    malkuth:   { x: 12, y: 20 },
  };

  const flashPath = `
    M${sephiroth.kether.x} ${sephiroth.kether.y}
    L${sephiroth.chokmah.x} ${sephiroth.chokmah.y}
    L${sephiroth.binah.x} ${sephiroth.binah.y}
    L${sephiroth.chesed.x} ${sephiroth.chesed.y}
    L${sephiroth.geburah.x} ${sephiroth.geburah.y}
    L${sephiroth.tiphareth.x} ${sephiroth.tiphareth.y}
    L${sephiroth.netzach.x} ${sephiroth.netzach.y}
    L${sephiroth.hod.x} ${sephiroth.hod.y}
    L${sephiroth.yesod.x} ${sephiroth.yesod.y}
    L${sephiroth.malkuth.x} ${sephiroth.malkuth.y}
  `;

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
      {/* DETAIL - Energy Aura (outer glow) */}
      <path
        d={flashPath}
        strokeWidth="4"
        opacity="0.08"
        strokeLinejoin="round"
      />
      <path
        d={flashPath}
        strokeWidth="2.5"
        opacity="0.12"
        strokeLinejoin="round"
      />

      {/* DETAIL (0.5px) - Three Pillars (structural guides) */}
      <g strokeWidth="0.5" opacity="0.2">
        <path d="M6 5V14" />
        <path d="M12 3V20" />
        <path d="M18 5V14" />
      </g>

      {/* DETAIL (0.5px) - Horizontal Equilibrium Paths */}
      <g strokeWidth="0.5" opacity="0.25">
        <path d="M6 5H18" />
        <path d="M6 8H18" />
        <path d="M6 14H18" />
      </g>

      {/* PRIMARY (1.5px) - The Lightning Flash */}
      <path
        d={flashPath}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* DATA - Minor Sephiroth */}
      <g fill={color} stroke="none">
        <circle cx={sephiroth.chokmah.x} cy={sephiroth.chokmah.y} r="0.9" />
        <circle cx={sephiroth.binah.x} cy={sephiroth.binah.y} r="0.9" />
        <circle cx={sephiroth.chesed.x} cy={sephiroth.chesed.y} r="0.8" />
        <circle cx={sephiroth.geburah.x} cy={sephiroth.geburah.y} r="0.8" />
        <circle cx={sephiroth.netzach.x} cy={sephiroth.netzach.y} r="0.8" />
        <circle cx={sephiroth.hod.x} cy={sephiroth.hod.y} r="0.8" />
        <circle cx={sephiroth.yesod.x} cy={sephiroth.yesod.y} r="0.9" />
      </g>

      {/* FOCAL - Major Sephiroth (Supernal Crown, Heart, Kingdom) */}
      {/* Kether - The Crown */}
      <circle cx={sephiroth.kether.x} cy={sephiroth.kether.y} r="1.6" fill={color} stroke="none" />
      <circle cx={sephiroth.kether.x} cy={sephiroth.kether.y} r="0.6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />

      {/* Tiphareth - The Heart/Sun */}
      <circle cx={sephiroth.tiphareth.x} cy={sephiroth.tiphareth.y} r="1.4" fill={color} stroke="none" />
      <circle cx={sephiroth.tiphareth.x} cy={sephiroth.tiphareth.y} r="2" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />

      {/* Malkuth - The Kingdom */}
      <circle cx={sephiroth.malkuth.x} cy={sephiroth.malkuth.y} r="1.5" fill={color} stroke="none" />

      {/* DETAIL - Daath (Hidden Sephirah) */}
      <circle cx="12" cy="6.5" r="0.5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" strokeDasharray="1 1" />
    </svg>
  );
}
