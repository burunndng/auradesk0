import React from 'react';
import { Tool } from '../../data/toolsData';

interface OrbitingIconsProps {
  tools: Tool[];
  color: 'teal' | 'purple' | 'emerald' | 'amber' | 'blue';
  radius?: number;
}

const colorMap = {
  teal: 'rgb(45, 212, 191)',
  purple: 'rgb(168, 85, 247)',
  emerald: 'rgb(52, 211, 153)',
  amber: 'rgb(251, 146, 60)',
  blue: 'rgb(59, 130, 246)'
};

export default function OrbitingIcons({
  tools,
  color,
  radius = 60
}: OrbitingIconsProps) {
  const iconColor = colorMap[color];
  const toolsToShow = tools.slice(0, 5); // Show max 5 icons
  const angleStep = 360 / toolsToShow.length;

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orbit circle */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={iconColor}
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* Orbiting icons */}
      {toolsToShow.map((tool, index) => {
        const angle = (index * angleStep) * (Math.PI / 180);
        const x = 100 + radius * Math.cos(angle);
        const y = 100 + radius * Math.sin(angle);

        return (
          <g
            key={tool.id}
            style={{
              animation: `rotate 8s linear infinite`,
              transformOrigin: '100px 100px',
              transformBox: 'fill-box'
            }}
          >
            <circle
              cx={x}
              cy={y}
              r="12"
              fill={iconColor}
              opacity="0.3"
            />
            <circle
              cx={x}
              cy={y}
              r="10"
              fill="none"
              stroke={iconColor}
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill={iconColor}
              opacity="0.9"
              fontWeight="bold"
            >
              {tool.name.charAt(0)}
            </text>
          </g>
        );
      })}

      <defs>
        <style>{`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(-360deg);
            }
          }
        `}</style>
      </defs>
    </svg>
  );
}
