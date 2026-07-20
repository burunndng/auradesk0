import React from 'react';

interface MasteryRingProps {
  progress: number; // 0-100
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  size?: 'sm' | 'md' | 'lg';
  moduleColor: string;
}

const tierColors = {
  bronze: {
    primary: '#CD7F32',
    glow: 'rgba(205, 127, 50, 0.4)',
  },
  silver: {
    primary: '#C0C0C0',
    glow: 'rgba(192, 192, 192, 0.4)',
  },
  gold: {
    primary: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
  platinum: {
    primary: '#E5E4E2',
    glow: 'rgba(229, 228, 226, 0.5)',
  },
};

const sizeConfig = {
  sm: { ringWidth: 4, offset: 6 },
  md: { ringWidth: 6, offset: 8 },
  lg: { ringWidth: 8, offset: 10 },
};

export const MasteryRing: React.FC<MasteryRingProps> = ({
  progress,
  tier,
  size = 'md',
  moduleColor,
}) => {
  const tierColor = tierColors[tier];
  const config = sizeConfig[size];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        inset: `-${config.offset}px`,
      }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        style={{
          transform: 'rotate(-90deg)',
          filter: `drop-shadow(0 0 ${config.ringWidth * 1.5}px ${tierColor.glow})`,
        }}
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={config.ringWidth}
        />

        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={tierColor.primary}
          strokeWidth={config.ringWidth}
          strokeLinecap="round"
          strokeDasharray={`${(progress / 100) * 289} 289`}
          className="transition-all duration-700 ease-out"
          style={{
            animation: 'rotate-slow 20s linear infinite',
          }}
        />

        {/* Tier indicator dot */}
        {progress > 0 && (
          <circle
            cx={50 + 46 * Math.cos((progress / 100) * 2 * Math.PI)}
            cy={50 + 46 * Math.sin((progress / 100) * 2 * Math.PI)}
            r={config.ringWidth * 0.8}
            fill={tierColor.primary}
            style={{
              filter: `drop-shadow(0 0 ${config.ringWidth}px ${tierColor.glow})`,
            }}
          />
        )}
      </svg>

      <style>
        {`
          @keyframes rotate-slow {
            from { transform: rotate(-90deg); }
            to { transform: rotate(270deg); }
          }
        `}
      </style>
    </div>
  );
};
