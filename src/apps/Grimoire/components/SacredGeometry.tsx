import { memo } from 'react';

interface SacredGeometryProps {
  opacity?: number;
  className?: string;
}

export const SacredGeometry = memo(function SacredGeometry({
  opacity = 0.04,
  className,
}: SacredGeometryProps) {
  const points: [number, number][] = [];
  const rings = 3;
  const perRing = 6;
  const radius = 90;

  for (let r = 1; r <= rings; r++) {
    const rr = (radius * r) / rings;
    for (let i = 0; i < perRing; i++) {
      const angle = (i / perRing) * Math.PI * 2;
      points.push([
        120 + Math.cos(angle) * rr,
        120 + Math.sin(angle) * rr,
      ]);
    }
  }

  const center = 120;

  return (
    <svg
      className={className}
      width="240"
      height="240"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <g stroke="var(--gilt)" fill="none">
        {Array.from({ length: rings }).map((_, r) => {
          const rr = (radius * (r + 1)) / rings;
          return (
            <circle
              key={`ring-${r}`}
              cx={center}
              cy={center}
              r={rr}
              strokeWidth={0.5 + (1 - (r + 1) / rings) * 0.7}
              opacity={0.3 + (1 - (r + 1) / rings) * 0.4}
            />
          );
        })}

        {points.map(([x, y], i) => (
          <line
            key={`spoke-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            strokeWidth={0.5}
            opacity={0.25}
          />
        ))}

        <circle cx={center} cy={center} r={2} fill="var(--gilt)" opacity={0.5} />
      </g>
    </svg>
  );
});
