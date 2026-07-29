import { memo } from 'react';
import type { LucideProps } from 'lucide-react';

interface GrimoireIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GrimoireIcon = memo(function GrimoireIcon({
  size = 24,
  className,
  style,
}: GrimoireIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3 L12 21" strokeWidth="0.8" />
        <path d="M3 12 L21 12" strokeWidth="0.8" />
        <path d="M6.5 6.5 L17.5 17.5" strokeWidth="0.8" />
        <path d="M17.5 6.5 L6.5 17.5" strokeWidth="0.8" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </g>
    </svg>
  );
});

export default GrimoireIcon;
