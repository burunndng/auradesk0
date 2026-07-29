import { memo } from 'react';
import type { LucideProps } from 'lucide-react';

/** Concentric field + waveform — Resonance / music-viz glyph */
export const MusicVizIcon = memo(function MusicVizIcon({
  size = 24,
  className,
  style,
  ...rest
}: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden
      {...rest}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.2" strokeWidth="1.15" opacity="0.28" />
        <circle cx="12" cy="12" r="6.4" strokeWidth="1.2" opacity="0.5" />
        <circle cx="12" cy="12" r="3.6" strokeWidth="1.15" opacity="0.75" />
        <path
          d="M4.8 13.2C6.2 9.8 7.4 7.6 8.5 12.1C9.5 16.2 10.5 9.2 12 12c1.5 2.8 2.5-3.6 3.5-.2 1 3.1 2.2-1.6 3.7.9"
          strokeWidth="1.45"
        />
        <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
        <path d="M12 2.6v2.1M12 19.3v2.1M2.6 12h2.1M19.3 12h2.1" strokeWidth="1.1" opacity="0.55" />
        <path d="M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M17.2 6.8l1.4-1.4M5.4 18.6l1.4-1.4" strokeWidth="1" opacity="0.35" />
      </g>
    </svg>
  );
});

export default MusicVizIcon;
