import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { typography } from '../../../../theme';

interface Axis {
  label: string;
  desc: string;
  example: string;
}

interface LinesProps {
  data: {
    title: string;
    concept: string;
    description: string;
    axes: Axis[];
    caption: string;
  };
}

export const LinesSection: React.FC<LinesProps> = ({ data }) => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [levels, setLevels] = useState<number[]>([70, 40, 60, 45, 80, 50, 65, 35]);

  const numAxes = data.axes.length;
  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  // Calculate polygon points from levels
  const calculatePoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  };

  // Calculate axis endpoint
  const calculateAxisPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      labelX: centerX + Math.cos(angle) * (radius + 40),
      labelY: centerY + Math.sin(angle) * (radius + 40)
    };
  };

  // Generate polygon path
  const polygonPoints = levels
    .map((level, index) => {
      const point = calculatePoint(index, level);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Generate grid circles
  const gridLevels = [25, 50, 75, 100];

  return (
    <section className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left: Text content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 text-teal-400 font-semibold uppercase tracking-wider text-sm">
          <TrendingUp size={16} />
          {data.concept}
        </div>
        <h2 className={typography.h2}>{data.title}</h2>
        <p className={typography.body}>
          {data.description}
        </p>

        {/* Lines list */}
        <div className="space-y-3 pt-6">
          {data.axes.map((axis, idx) => (
            <div
              key={idx}
              className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredLine === idx
                  ? 'bg-teal-500/10 border-teal-500/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
              onMouseEnter={() => setHoveredLine(idx)}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200">{axis.label}</span>
                <span className="text-xs text-slate-500">{levels[idx]}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{axis.desc}</p>
              {hoveredLine === idx && (
                <p className="text-xs text-teal-300 italic mt-2 pt-2 border-t border-slate-800">
                  {axis.example}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 italic border-l-2 border-teal-500/30 pl-4 leading-relaxed">
          {data.caption}
        </p>

        {/* Reflection prompt */}
        <div className="mt-6 p-5 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3">
          <div className="text-xs uppercase tracking-wider text-slate-500">Apply It</div>
          <h4 className="font-semibold text-slate-200 text-sm">Scenario: The Spiritual Teacher</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            A widely respected meditation teacher has guided thousands of people through genuine
            breakthroughs. Their students describe them as transformative. But over time, people close
            to the teacher notice a pattern: the teacher is dismissive in personal conflicts, avoids
            accountability, and struggles to maintain equal relationships with peers. Their spiritual
            and cognitive lines appear highly developed. Their interpersonal and emotional lines seem
            significantly lower.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            How does the lines framework help explain this without either dismissing the teacher's
            genuine gifts or excusing the harm? Now turn it inward: which of your strongest
            lines might be functioning as cover for a line you're avoiding developing? What does the
            radar chart on the right look like when it's honest about your actual profile—not the
            one you'd want to show others?
          </p>
          <p className="text-xs text-slate-500 italic">
            The psychograph is most useful when it's uncomfortable.
          </p>
        </div>
        {/* Cross-reference */}
        <div className="mt-6 border-l-2 border-violet-500/30 pl-6 space-y-2">
          <div className="text-xs uppercase tracking-wider text-violet-500/70">Connected to: States vs. Stages →</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Lines describe stable, structural development—the capacity you've built over years.
            But the next section addresses something different and easy to confuse with it: states.
            A peak meditation experience, a psychedelic insight, a moment of profound clarity—these
            are real and valuable, but they're temporary. Understanding why states aren't the same
            as stages is one of the most practically important distinctions in the entire framework,
            especially if you do any kind of contemplative or altered-state practice.
          </p>
        </div>
      </div>

      {/* Right: Interactive radar chart */}
      <div className="relative">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full"
            onMouseLeave={() => setHoveredLine(null)}
          >
            {/* Grid circles */}
            {gridLevels.map((level) => (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={(level / 100) * radius}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}

            {/* Axis lines */}
            {data.axes.map((axis, idx) => {
              const point = calculateAxisPoint(idx);
              const isHovered = hoveredLine === idx;

              return (
                <g key={idx}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke="#475569"
                    strokeWidth={isHovered ? "2" : "1"}
                    strokeOpacity={isHovered ? "0.8" : "0.3"}
                  />
                </g>
              );
            })}

            {/* Data polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radarGradient)"
              fillOpacity="0.3"
              stroke="#6366f1"
              strokeWidth="2"
            />

            {/* Data points */}
            {levels.map((level, idx) => {
              const point = calculatePoint(idx, level);
              const isHovered = hoveredLine === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredLine(idx)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "8" : "5"}
                    fill="#6366f1"
                    className="transition-all duration-200"
                  />
                  {isHovered && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="12"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}
                </g>
              );
            })}

            {/* Labels */}
            {data.axes.map((axis, idx) => {
              const point = calculateAxisPoint(idx);
              const isHovered = hoveredLine === idx;

              return (
                <text
                  key={idx}
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHovered ? "#a5b4fc" : "#94a3b8"}
                  fontSize="12"
                  fontWeight={isHovered ? "600" : "400"}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredLine(idx)}
                >
                  {axis.label}
                </text>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </radialGradient>
            </defs>
          </svg>

          {/* Interactive hint */}
          <div className="text-center mt-4 text-xs text-slate-500">
            Hover over lines to explore • This is a sample pattern
          </div>
        </div>

        {/* Example profiles */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setLevels([80, 35, 70, 30, 85, 40, 75, 25])}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
          >
            <div className="text-xs font-semibold text-slate-300 mb-1">The Intellectual</div>
            <div className="text-[10px] text-slate-500">High cognitive, low emotional</div>
          </button>
          <button
            onClick={() => setLevels([45, 85, 40, 80, 50, 75, 55, 70])}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
          >
            <div className="text-xs font-semibold text-slate-300 mb-1">The Empath</div>
            <div className="text-[10px] text-slate-500">High emotional, relational focus</div>
          </button>
          <button
            onClick={() => setLevels([65, 60, 55, 50, 70, 40, 45, 30])}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
          >
            <div className="text-xs font-semibold text-slate-300 mb-1">The Achiever</div>
            <div className="text-[10px] text-slate-500">Balanced but avoiding shadow</div>
          </button>
          <button
            onClick={() => setLevels([70, 65, 75, 70, 80, 60, 68, 85])}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
          >
            <div className="text-xs font-semibold text-slate-300 mb-1">The Integrator</div>
            <div className="text-[10px] text-slate-500">High development across lines</div>
          </button>
        </div>
      </div>
    </section>
  );
};
