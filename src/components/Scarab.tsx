import { memo } from 'react';

export const ScarabDefs = memo(function ScarabDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        {/* Main scarab — detailed sacred beetle from user's image */}
        <symbol id="scarab" viewBox="0 0 600 600">
          {/* Radiating spike lines behind scarab */}
          {Array.from({ length: 64 }).map((_, i) => {
            const angle = (i / 64) * Math.PI * 2;
            const sinA = Math.abs(Math.sin(angle));
            const r0 = 140 + (1 - sinA) * 15;
            const len = 80 + sinA * 160;
            const w = 1.2 + sinA * 1.4;
            const op = 0.35 + sinA * 0.45;
            return (
              <line
                key={`ray-${i}`}
                x1={300 + Math.cos(angle) * r0}
                y1={300 + Math.sin(angle) * r0}
                x2={300 + Math.cos(angle) * (r0 + len)}
                y2={300 + Math.sin(angle) * (r0 + len)}
                stroke="#c9a84c"
                strokeWidth={w}
                strokeLinecap="round"
                opacity={op}
              />
            );
          })}

          <g fill="none" stroke="#c9a84c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="300" cy="155" r="28" />
            {/* Crown / head crest */}
            <path d="M285 135 L275 110 L290 125 L300 95 L310 125 L325 110 L315 135" />

            {/* Eyes */}
            <circle cx="288" cy="155" r="5" fill="#c9a84c" />
            <circle cx="312" cy="155" r="5" fill="#c9a84c" />

            {/* Mandibles */}
            <path d="M280 165 C270 165 265 175 268 185" />
            <path d="M320 165 C330 165 335 175 332 185" />

            {/* Thorax / central body */}
            <path d="M270 185 C270 210 330 210 330 185" />
            <ellipse cx="300" cy="200" rx="18" ry="9" />
            {/* Thorax center circle */}
            <circle cx="300" cy="200" r="6" />

            {/* Wing cases / elytra */}
            <path d="M265 215 C250 250 250 310 270 360 C285 390 300 420 300 440 C300 420 315 390 330 360 C350 310 350 250 335 215 Z" />

            {/* Center divide */}
            <line x1="300" y1="215" x2="300" y2="440" />

            {/* Wing patterns — zigzag/scale lines */}
            <path d="M270 240 L300 250 L330 240" />
            <path d="M265 270 L300 282 L335 270" />
            <path d="M268 300 L300 312 L332 300" />
            <path d="M272 330 L300 340 L328 330" />
            <path d="M280 358 L300 366 L320 358" />

            {/* Inner wing detail lines */}
            <line x1="275" y1="240" x2="275" y2="340" strokeWidth="1" opacity="0.5" />
            <line x1="325" y1="240" x2="325" y2="340" strokeWidth="1" opacity="0.5" />

            {/* Left wing spikes */}
            <line x1="250" y1="230" x2="225" y2="215" strokeWidth="1.5" />
            <line x1="245" y1="260" x2="215" y2="250" strokeWidth="1.5" />
            <line x1="248" y1="290" x2="218" y2="285" strokeWidth="1.5" />
            <line x1="255" y1="320" x2="228" y2="320" strokeWidth="1.5" />
            <line x1="265" y1="348" x2="242" y2="352" strokeWidth="1.5" />

            {/* Right wing spikes */}
            <line x1="350" y1="230" x2="375" y2="215" strokeWidth="1.5" />
            <line x1="355" y1="260" x2="385" y2="250" strokeWidth="1.5" />
            <line x1="352" y1="290" x2="382" y2="285" strokeWidth="1.5" />
            <line x1="345" y1="320" x2="372" y2="320" strokeWidth="1.5" />
            <line x1="335" y1="348" x2="358" y2="352" strokeWidth="1.5" />

            {/* Legs — left */}
            <path d="M270 200 C255 200 240 190 225 200" />
            <path d="M268 225 C248 225 230 220 210 230" />
            <path d="M270 255 C250 260 232 265 215 275" />

            {/* Legs — right */}
            <path d="M330 200 C345 200 360 190 375 200" />
            <path d="M332 225 C352 225 370 220 390 230" />
            <path d="M330 255 C350 260 368 265 385 275" />

            {/* Bottom orb */}
            <circle cx="300" cy="475" r="28" />
            {/* Star in bottom orb */}
            <path d="M300 455 L304 468 L318 468 L307 477 L311 490 L300 481 L289 490 L293 477 L282 468 L296 468 Z" />
          </g>

          {/* Top star/cross symbol */}
          <g fill="none" stroke="#c9a84c" strokeWidth="2">
            <circle cx="300" cy="65" r="35" />
            <path d="M300 35 L300 95" />
            <path d="M270 65 L330 65" />
            <path d="M278 43 L322 87" />
            <path d="M322 43 L278 87" />
          </g>
        </symbol>

        {/* Small glyph for top panel */}
        <symbol id="glyphSmall" viewBox="0 0 24 24">
          <g fill="none" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="6" r="3.5" />
            <path d="M8 10 C8 16 16 16 16 10" />
            <path d="M12 12 L12 20" />
            <circle cx="12" cy="20" r="2.5" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
});

interface ScarabProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Scarab = memo(function Scarab({ size = 120, className, style }: ScarabProps) {
  return (
    <svg width={size} height={size} className={className} style={style}>
      <use href="#scarab" />
    </svg>
  );
});

export const GlyphSmall = memo(function GlyphSmall({ size = 22, className, style }: ScarabProps) {
  return (
    <svg width={size} height={size} className={className} style={style}>
      <use href="#glyphSmall" />
    </svg>
  );
});
