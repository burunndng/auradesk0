
import React, { useId } from 'react';

interface MerkabaIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const MerkabaIcon: React.FC<MerkabaIconProps> = ({ size, ...props }) => {
  const glowId = useId();
  const finalWidth = size ?? props.width ?? 24;
  const finalHeight = size ?? props.height ?? 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      width={finalWidth}
      height={finalHeight}
      {...props}
    >
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        {/* Ascending tetrahedron face */}
        <polygon points="50,8 92,78 8,78" strokeWidth="1" />

        {/* Descending tetrahedron face */}
        <polygon points="50,92 8,22 92,22" strokeWidth="1" />

        {/* Spin horizon */}
        <ellipse cx="50" cy="50" rx="42" ry="11" strokeWidth="0.6" opacity="0.6" />

        {/* Central axis */}
        <line x1="50" y1="8" x2="50" y2="92" strokeWidth="0.5" opacity="0.4" />

        {/* Merkaba heart */}
        <circle cx="50" cy="50" r="2.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
};
