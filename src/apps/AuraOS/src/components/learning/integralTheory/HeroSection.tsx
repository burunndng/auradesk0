import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { typography } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface HeroProps {
  data: {
    title: string;
    subtitle: string;
    body: string;
    koan: string;
  };
}

const quadrants = [
  {
    id: 'I',
    label: 'I',
    title: 'Interior-Individual',
    question: 'What am I actually experiencing right now?',
    color: 'from-purple-500 to-fuchsia-500',
    position: 'top-0 left-0',
    hint: 'Consciousness, thoughts, feelings, shadows'
  },
  {
    id: 'WE',
    label: 'WE',
    title: 'Interior-Collective',
    question: 'What shared meanings shape how we see the world?',
    color: 'from-pink-500 to-rose-500',
    position: 'top-0 right-0',
    hint: 'Culture, relationships, shared understanding'
  },
  {
    id: 'IT',
    label: 'IT',
    title: 'Exterior-Individual',
    question: 'What can be measured and observed?',
    color: 'from-blue-500 to-cyan-500',
    position: 'bottom-0 left-0',
    hint: 'Body, brain, behaviors, matter'
  },
  {
    id: 'ITS',
    label: 'ITS',
    title: 'Exterior-Collective',
    question: 'What systems am I embedded within?',
    color: 'from-emerald-500 to-teal-500',
    position: 'bottom-0 right-0',
    hint: 'Institutions, ecosystems, structures'
  }
];

export const HeroSection: React.FC<HeroProps> = ({ data }) => {
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setRotationY((mouseX / rect.width) * 10);
    setRotationX(-(mouseY / rect.height) * 10);
  };

  const handleMouseLeave = () => {
    setRotationX(0);
    setRotationY(0);
  };

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal-500/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="text-teal-400">
              {React.createElement(getIconComponent('RecursionWell') || Eye, { size: 16 })}
            </div>
            <span className="text-sm text-slate-300">{data.subtitle}</span>
          </div>

          <h1 className={typography.h1}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300">
              {data.title}
            </span>
          </h1>

          <p className={`${typography.body} text-slate-300 max-w-3xl mx-auto`}>
            {data.body}
          </p>
        </div>

        {/* Interactive 4-Quadrant Compass */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div
            className="relative w-full aspect-square"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: '1000px'
            }}
          >
            <div
              className="relative w-full h-full transition-transform duration-300 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`
              }}
            >
              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-32 h-32 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                  <div className="text-xs text-slate-500 font-mono text-center leading-tight">
                    AQAL<br/>
                    <span className="text-[10px] text-slate-600">All Quadrants<br/>All Levels</span>
                  </div>

                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping"
                       style={{ animationDuration: '3s' }} />
                </div>
              </div>

              {/* Quadrants */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
                {quadrants.map((quad) => (
                  <div
                    key={quad.id}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl"
                    onMouseEnter={() => setHoveredQuadrant(quad.id)}
                    onMouseLeave={() => setHoveredQuadrant(null)}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${quad.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                    {/* Border glow */}
                    <div className={`absolute inset-0 border-2 ${
                      hoveredQuadrant === quad.id
                        ? 'border-white/30'
                        : 'border-slate-700/50'
                    } rounded-2xl transition-all duration-300`} />

                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      <div>
                        <div className={`text-3xl font-black mb-2 bg-gradient-to-br ${quad.color} bg-clip-text text-transparent`}>
                          {quad.label}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mb-1">
                          {quad.title}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {quad.hint}
                        </div>
                      </div>

                      {/* Question appears on hover */}
                      <div className={`transition-all duration-300 ${
                        hoveredQuadrant === quad.id
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2'
                      }`}>
                        <div className="text-sm text-slate-200 italic leading-tight">
                          "{quad.question}"
                        </div>
                      </div>
                    </div>

                    {/* Hover particle effect */}
                    {hoveredQuadrant === quad.id && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`absolute w-1 h-1 bg-gradient-to-r ${quad.color} rounded-full animate-float`}
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hint text */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Hover over each quadrant to explore
          </div>
        </div>

        {/* Koan */}
        <div className="text-center">
          <div className="inline-block px-8 py-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-slate-600 mb-2">Koan</div>
            <p className={`${typography.body} text-slate-300 italic`}>
              {data.koan}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1.5);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
