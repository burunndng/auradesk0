import React from 'react';

interface ConceptMasteryRingProps {
    score: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    isMastered?: boolean;
}

export const ConceptMasteryRing: React.FC<ConceptMasteryRingProps> = ({
    score,
    size = 40,
    strokeWidth = 3,
    color = '#8B7355',
    isMastered = false,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Ring */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(68, 64, 60, 0.3)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                    }}
                    strokeLinecap="round"
                    fill="transparent"
                    className={isMastered ? 'animate-pulse' : ''}
                />
            </svg>

            {/* Percentage or Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                {isMastered ? (
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                            background: color,
                            boxShadow: `0 0 8px ${color}`
                        }}
                    />
                ) : (
                    <span className="text-[10px] font-mono text-stone-400">
                        {Math.round(score)}
                    </span>
                )}
            </div>

            {/* Mastery Glow for Mastered Concepts */}
            {isMastered && (
                <div
                    className="absolute inset-0 rounded-full animate-pulse z-[-1]"
                    style={{
                        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                    }}
                />
            )}
        </div>
    );
};
