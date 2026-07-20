import React, { useState, useEffect, useMemo } from 'react';

const MODULES = ['Body', 'Mind', 'Shadow', 'Spirit'];
const QUADRANTS = ['UL', 'UR', 'LR', 'LL'];

const moduleData = {
  Body: {
    color: '#34d399',
    colorDark: '#065f46',
    colorGlow: 'rgba(52, 211, 153, 0.4)',
    description: 'Somatic development',
    practices: {
      UL: { title: 'Felt Sense', examples: ['Interoceptive awareness', 'Body scanning', 'Subtle energy'] },
      UR: { title: 'Physical Training', examples: ['Strength practice', 'Movement', 'Nutrition'] },
      LL: { title: 'Embodied Relating', examples: ['Partner yoga', 'Contact improv', 'Somatic attunement'] },
      LR: { title: 'Body Systems', examples: ['Healthcare access', 'Ergonomic spaces', 'Infrastructure'] },
    }
  },
  Mind: {
    color: '#60a5fa',
    colorDark: '#1e3a8a',
    colorGlow: 'rgba(96, 165, 250, 0.4)',
    description: 'Cognitive development',
    practices: {
      UL: { title: 'Inner Inquiry', examples: ['Contemplative reading', 'Reframing', 'Reflection'] },
      UR: { title: 'Brain Training', examples: ['Memory work', 'Skill acquisition', 'Cognitive challenge'] },
      LL: { title: 'Collective Inquiry', examples: ['Dialogue circles', 'Study groups', 'Shared investigation'] },
      LR: { title: 'Knowledge Systems', examples: ['Libraries', 'Education', 'Information architecture'] },
    }
  },
  Shadow: {
    color: '#fbbf24',
    colorDark: '#92400e',
    colorGlow: 'rgba(251, 191, 36, 0.4)',
    description: 'Psychological integration',
    practices: {
      UL: { title: 'Self-Inquiry', examples: ['Journaling projections', '3-2-1 process', 'Dream work'] },
      UR: { title: 'Somatic Release', examples: ['TRE', 'Somatic Experiencing', 'EMDR'] },
      LL: { title: 'Relational Shadow', examples: ['Group therapy', 'Couples shadow work', 'Circles'] },
      LR: { title: 'Therapeutic Systems', examples: ['Mental health access', 'Cultural healing', 'Support'] },
    }
  },
  Spirit: {
    color: '#a78bfa',
    colorDark: '#5b21b6',
    colorGlow: 'rgba(167, 139, 250, 0.4)',
    description: 'Contemplative development',
    practices: {
      UL: { title: 'Contemplation', examples: ['Silent meditation', 'Centering prayer', 'Nondual inquiry'] },
      UR: { title: 'State Practice', examples: ['Breathwork', 'Chanting', 'Embodied states'] },
      LL: { title: 'Collective Practice', examples: ['Sangha', 'Group meditation', 'Ritual'] },
      LR: { title: 'Sacred Structures', examples: ['Retreat centers', 'Lineages', 'Access to teachers'] },
    }
  }
};

const quadrantData = {
  UL: { label: 'I', name: 'Interior Individual', desc: 'Subjective' },
  UR: { label: 'It', name: 'Exterior Individual', desc: 'Objective' },
  LL: { label: 'We', name: 'Interior Collective', desc: 'Intersubjective' },
  LR: { label: 'Its', name: 'Exterior Collective', desc: 'Interobjective' },
};

const quadrantAngles = { UL: 225, UR: 315, LL: 135, LR: 45 };

function IntegralMandala() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    // Track window resize for responsive layout
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let frame: number;
    const animate = () => {
      setTime(t => t + 0.012);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const cx = 320, cy = 320;
  const breath = Math.sin(time * 0.5) * 0.015 + 1;

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 200,
      speed: 0.1 + Math.random() * 0.2,
      size: 1 + Math.random() * 1.5,
      module: MODULES[i % 4],
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  const getNodePos = (quadrant: keyof typeof quadrantAngles, moduleIndex: number) => {
    const angle = quadrantAngles[quadrant] * (Math.PI / 180);
    const r = (75 + moduleIndex * 48) * breath;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    };
  };

  return (
    <div style={{
      color: '#e0e0e0',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      minHeight: '70dvh',
      flexWrap: 'wrap'
    }}>
      {/* Left: Mandala */}
      <div style={{
        flex: '1 1 400px',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>

        {/* The Mandala */}
        <svg
          width="640"
          height="640"
          viewBox="0 0 640 640"
          style={{ maxWidth: '100%', height: 'auto' }}
          role="img"
          aria-label="Interactive AQAL Mandala showing 16 intersections of Body, Mind, Shadow, and Spirit modules across four quadrants. Select any node to explore its practices."
        >
          <defs>
            {MODULES.map(mod => (
              <filter key={`glow-${mod}`} id={`glow-${mod}`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feFlood floodColor={moduleData[mod as keyof typeof moduleData].color} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Ambient particles */}
          <g>
            {particles.map(p => {
              const angle = p.angle + time * p.speed;
              const wobble = Math.sin(time + p.offset) * 15;
              const x = cx + Math.cos(angle) * (p.radius + wobble);
              const y = cy + Math.sin(angle) * (p.radius + wobble);
              const opacity = 0.25 + Math.sin(time * 0.5 + p.offset) * 0.15;
              return (
                <circle
                  key={p.id}
                  cx={x}
                  cy={y}
                  r={p.size}
                  fill={moduleData[p.module as keyof typeof moduleData].color}
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* Outer rings */}
          <circle cx={cx} cy={cy} r={290 * breath} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={295 * breath} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="30" strokeDasharray="2 8" />

          {/* Module rings */}
          {MODULES.map((mod, i) => {
            const r = (75 + i * 48) * breath;
            const pulse = Math.sin(time * 0.6 + i * 0.4) * 0.3 + 0.7;
            return (
              <g key={`ring-${mod}`}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={moduleData[mod as keyof typeof moduleData].color} strokeWidth="20" opacity={0.04 * pulse} filter="url(#softGlow)" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={moduleData[mod as keyof typeof moduleData].color} strokeWidth="1" opacity={0.3 * pulse} />
                <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke={moduleData[mod as keyof typeof moduleData].color} strokeWidth="0.5" opacity={0.12} strokeDasharray="1 6" />
              </g>
            );
          })}

          {/* Quadrant axes */}
          {QUADRANTS.map(q => {
            const angle = quadrantAngles[q as keyof typeof quadrantAngles] * (Math.PI / 180);
            return (
              <line
                key={`axis-${q}`}
                x1={cx + Math.cos(angle) * 40}
                y1={cy + Math.sin(angle) * 40}
                x2={cx + Math.cos(angle) * 280 * breath}
                y2={cy + Math.sin(angle) * 280 * breath}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Quadrant labels */}
          {QUADRANTS.map(q => {
            const angle = quadrantAngles[q as keyof typeof quadrantAngles] * (Math.PI / 180);
            const r = 268 * breath;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            return (
              <g key={`label-${q}`}>
                <text x={x} y={y - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" style={{ letterSpacing: '0.15em' }}>
                  {quadrantData[q as keyof typeof quadrantData].name.toUpperCase()}
                </text>
                <text x={x} y={y + 14} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="24" fontWeight="200">
                  {quadrantData[q as keyof typeof quadrantData].label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {QUADRANTS.map(q =>
            MODULES.map((mod, mi) => {
              const pos = getNodePos(q as keyof typeof quadrantAngles, mi);
              const key = `${q}-${mod}`;
              const isSelected = selected === key;
              const isHovered = hovered === key;
              const isFocused = focused === key;
              const data = moduleData[mod as keyof typeof moduleData];
              const baseR = 14;
              const r = isSelected ? baseR + 5 : isHovered ? baseR + 2 : baseR;

              return (
                <g
                  key={key}
                  onClick={() => setSelected(isSelected ? null : key)}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(isSelected ? null : key);
                    }
                    if (e.key === 'Escape') setSelected(null);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${mod} - ${quadrantData[q as keyof typeof quadrantData].name}`}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={r + 25} fill={data.colorGlow} filter="url(#softGlow)">
                      <animate attributeName="r" values={`${r + 20};${r + 35};${r + 20}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.2;0.4" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {isSelected && (
                    <>
                      <circle cx={pos.x} cy={pos.y} r={r + 10} fill="none" stroke={data.color} strokeWidth="1" opacity="0.5" />
                      <circle cx={pos.x} cy={pos.y} r={r + 18} fill="none" stroke={data.color} strokeWidth="0.5" opacity="0.25" />
                    </>
                  )}
                  {isHovered && !isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={r + 15} fill={data.colorGlow} opacity="0.3" filter="url(#softGlow)" />
                  )}
                  {isFocused && !isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={r + 20} fill="none" stroke={data.color} strokeWidth="2" opacity="0.6" />
                  )}
                  {/* Larger touch target (invisible) */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill="transparent"
                    style={{ pointerEvents: 'all' }}
                  />
                  {/* Sphere node */}
                  <g
                    transform={`translate(${pos.x}, ${pos.y}) scale(${r / 9})`}
                    filter={isSelected ? `url(#glow-${mod})` : undefined}
                    style={{ pointerEvents: 'none' }}
                  >
                    {/* Sphere fill background */}
                    <circle
                      cx={0} cy={0} r={9}
                      fill={isSelected ? data.color : data.colorDark}
                      opacity={isSelected ? 0.95 : 0.85}
                    />
                    {/* Outer boundary */}
                    <circle
                      cx={0} cy={0} r={9}
                      fill="none"
                      stroke={data.color}
                      strokeWidth={isSelected ? 1.8 : 1.2}
                      opacity="1"
                    />
                    {/* Tilted meridian */}
                    <path
                      d="M 3.07 -8.46 C 5 -3.5 5 1.5 -3.07 8.46"
                      fill="none"
                      stroke={isSelected ? '#030304' : data.color}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    <path
                      d="M -3.07 8.46 C -5 3.5 -5 -1.5 3.07 -8.46"
                      fill="none"
                      stroke={isSelected ? '#030304' : data.color}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {/* Equator */}
                    <line
                      x1="-9" y1="0" x2="9" y2="0"
                      stroke={isSelected ? '#030304' : data.color}
                      strokeWidth="0.8"
                      opacity="0.65"
                    />
                    {/* Lower latitude arc */}
                    <path
                      d="M -7.5 3 Q 0 6.5 7.5 3"
                      fill="none"
                      stroke={isSelected ? '#030304' : data.color}
                      strokeWidth="0.4"
                      opacity="0.35"
                    />
                    {/* Center dot */}
                    <circle
                      cx={0} cy={0} r={0.9}
                      fill={isSelected ? '#030304' : data.color}
                      opacity="0.9"
                    />
                  </g>
                  {/* Letter label */}
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? '#030304' : data.color}
                    fontSize="9"
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {mod[0]}
                  </text>
                </g>
              );
            })
          )}

          {/* Center */}
          <g>
            <circle cx={cx} cy={cy} r={35} fill="rgba(167, 139, 250, 0.05)" filter="url(#softGlow)" />
            <circle cx={cx} cy={cy} r={28} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <circle cx={cx} cy={cy} r={20} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <circle cx={cx} cy={cy} r={12} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.3)" />
            <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.6)" />
          </g>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
          {MODULES.map(mod => (
            <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: moduleData[mod as keyof typeof moduleData].color,
                boxShadow: `0 0 10px ${moduleData[mod as keyof typeof moduleData].colorGlow}`
              }} />
              <span style={{ fontSize: '12px', color: '#aaa' }}>{mod}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Panel - Stack on mobile/tablet, side-by-side on desktop */}
      <aside style={{
        flex: isDesktop ? '0 0 320px' : '1 1 100%',
        width: isDesktop ? '320px' : '100%',
        maxWidth: isDesktop ? '380px' : '100%',
        minWidth: '280px',
        borderLeft: isDesktop ? '1px solid rgba(255,255,255,0.05)' : 'none',
        borderTop: !isDesktop ? '1px solid rgba(255,255,255,0.05)' : 'none',
        backgroundColor: 'rgba(8,8,10,0.9)',
        backdropFilter: 'blur(20px)',
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: !isDesktop ? '50dvh' : undefined
      }}>
        {selected ? (
          <DetailPanel nodeKey={selected} onClose={() => setSelected(null)} />
        ) : (
          <EmptyPanel />
        )}
      </aside>
    </div>
  );
}

function DetailPanel({ nodeKey, onClose }: { nodeKey: string; onClose: () => void }) {
  const [quadrant, module] = nodeKey.split('-');
  const mod = moduleData[module as keyof typeof moduleData];
  const quad = quadrantData[quadrant as keyof typeof quadrantData];
  const practice = mod.practices[quadrant as keyof typeof mod.practices];

  // Handle escape key to close panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`${module} - ${quad.name}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}
    >
      <button
        onClick={onClose}
        aria-label="Close panel"
        title="Close (Esc)"
        style={{
          alignSelf: 'flex-end',
          marginBottom: '24px',
          padding: '8px',
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          flexShrink: 0,
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '24px', fontWeight: 200, color: mod.color, wordBreak: 'break-word' }}>{module}</span>
          <span style={{ fontSize: '18px', color: '#666' }}>/</span>
          <span style={{ fontSize: '20px', fontWeight: 200, color: '#aaa' }}>{quad.label}</span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 300, color: mod.color, marginBottom: '8px', wordBreak: 'break-word' }}>
          {practice.title}
        </h2>
        <p style={{ fontSize: '13px', color: '#999', marginBottom: '24px', wordBreak: 'break-word' }}>
          {mod.description} through {quad.desc.toLowerCase()} perspective
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: `${mod.colorDark}20`,
            border: `1px solid ${mod.colorDark}40`,
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Module</div>
            <div style={{ fontSize: '14px', color: mod.color, wordBreak: 'break-word' }}>{module}</div>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Quadrant</div>
            <div style={{ fontSize: '13px', color: '#ccc', wordBreak: 'break-word' }}>{quad.name}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Practices
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {practice.examples.map((ex, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: `${mod.colorDark}15`
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: mod.color,
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <span style={{ fontSize: '13px', color: '#bbb', wordBreak: 'break-word', minWidth: 0 }}>{ex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '11px',
        color: '#777',
        paddingTop: '20px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        lineHeight: 1.6,
        flexShrink: 0,
        wordBreak: 'break-word'
      }}>
        Integral practice touches all sixteen nodes — the same module through other perspectives,
        other modules through this perspective.
      </p>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        flexShrink: 0,
        background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)'
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
      </div>

      <p style={{ fontSize: '13px', color: '#999', marginBottom: '32px', maxWidth: '260px', lineHeight: 1.6, wordBreak: 'break-word' }}>
        Each glowing node marks where a module meets a quadrant —
        a unique territory of practice. Select any to explore.
      </p>

      <div style={{ width: '100%', textAlign: 'left', fontSize: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
          The Geometry
        </div>
        {[
          ['Center', 'Unity — source of all'],
          ['Axes', 'Four quadrants'],
          ['Rings', 'Four modules'],
          ['Nodes', 'Sixteen intersections'],
        ].map(([label, desc]) => (
          <div key={label} style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#888', width: '48px', flexShrink: 0, fontSize: '11px' }}>{label}</span>
            <span style={{ color: '#999', fontSize: '11px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AQALLearningTab() {
  return (
    <div className="min-h-[100dvh] bg-stone-950">
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/5 via-stone-950/0 to-stone-950/0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-12 pb-32">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Framework Explorer</span>
          </div>

          <div className="relative mb-4 inline-block">
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-100">
              The AQAL Mandala
            </h1>
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 opacity-0 pointer-events-none" aria-hidden="true" />
          </div>

          <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Four modules. Four quadrants. Sixteen intersections of integral practice.<br />
            <span className="text-stone-600 text-sm">Select any node to explore its territory.</span>
          </p>
        </header>

        {/* Mandala */}
        <div className="bg-stone-900/30 border border-stone-800/60 rounded-xl backdrop-blur-sm">
          <IntegralMandala />
        </div>

        {/* Footer ornament */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <div className="flex items-center gap-3 text-stone-700">
            <span className="text-[10px] uppercase tracking-[0.2em]">I</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">We</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">It</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Its</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>
      </div>
    </div>
  );
}
