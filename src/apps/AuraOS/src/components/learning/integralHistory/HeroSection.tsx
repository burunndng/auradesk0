import React, { useState } from 'react';
import { typography, getButtonClass } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface HeroProps {
  data: {
    title: string;
    subtitle: string;
    body: string;
    koan: string;
  };
}

const ERAS = [
  {
    id: 'roots',
    label: 'Pre-Integral Roots',
    range: '500 BCE – 1945',
    description: 'Mystics, philosophers, and early developmental theorists lay the groundwork for seeing reality as layered, evolving, and multi-perspectival.',
    focus: ['Vedanta & Buddhism', 'Neoplatonism', 'Evolutionary philosophy'],
    emphasis: 'Foundations'
  },
  {
    id: 'systemShock',
    label: 'Systems & Human Potential',
    range: '1945 – 1975',
    description: 'Post-war science, cybernetics, and the human potential movement explore holism, feedback loops, and altered states.',
    focus: ['General systems theory', 'Maslow & humanistic psych', 'Gestalt & Esalen'],
    emphasis: 'Integration'
  },
  {
    id: 'wilber',
    label: 'Wilberian Synthesis',
    range: '1975 – 2005',
    description: 'Ken Wilber consolidates developmental psychology, contemplative traditions, and cultural studies into the AQAL framework.',
    focus: ['Spectrum of Consciousness', 'AQAL', 'Integral Institute'],
    emphasis: 'AQAL'
  },
  {
    id: 'metamodern',
    label: 'Metamodern Era',
    range: '2005 – Present',
    description: 'Integral ideas cross-pollinate with metamodernism, regenerative design, and second-tier governance experiments.',
    focus: ['Integral Life Practice', 'Metamodern politics', 'Regenerative culture'],
    emphasis: 'Application'
  }
];

const heroStats = [
  { label: 'Developmental Lineages', value: '40+', detail: 'mapped inside Integral Psychology' },
  { label: 'Scholarly Citations', value: '4,500+', detail: 'referencing Wilber & AQAL' },
  { label: 'Applied Fields', value: '25+', detail: 'education, therapy, policy, design' }
];

export function HeroSection({ data }: HeroProps) {
  const [activeEra, setActiveEra] = useState(ERAS[2]);

  return (
    <section className="relative px-4 pt-12 sm:px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950 shadow-2xl">
        <div className="absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />
          <div className="absolute inset-y-0 -left-16 w-2/3 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.2),_transparent_60%)] blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 p-8 lg:p-12">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 ${typography.label} uppercase tracking-[0.3em] text-slate-200`}>
              {(() => {
                const Icon = getIconComponent('AscensionFlame');
                return Icon ? React.createElement(Icon, { size: 16, className: "text-amber-300" }) : null;
              })()}
              Living Lineage
            </div>
            <div>
              <p className={`${typography.label} text-slate-400 mb-2`}>{data.subtitle}</p>
              <h1 className={typography.h2}>
                {data.title}
              </h1>
            </div>
            <p className={`${typography.body} text-slate-300`}>
              {data.body}
            </p>
            <div className="rounded-2xl border border-teal-500/40 bg-teal-500/5 p-5 text-teal-100 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
              <p className={`${typography.label} text-teal-300 mb-2`}>Historical Koan</p>
              <p className={`${typography.h4} text-white`}>{data.koan}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/40 overflow-hidden">
                  <p className={`text-3xl font-semibold text-white`}>{stat.value}</p>
                  <p className={`${typography.label} uppercase tracking-widest text-slate-400 break-words`}>{stat.label}</p>
                  <p className={`mt-1 ${typography.body} text-slate-400`}>{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className={`flex items-center gap-3 ${typography.body} uppercase tracking-[0.4em] text-slate-300`}>
              {(() => {
                const Icon = getIconComponent('SenseMandala');
                return Icon ? React.createElement(Icon, { size: 18, className: "text-purple-300" }) : null;
              })()}
              Evolutionary Eras
            </div>
            <div className="grid gap-3">
              {ERAS.map(era => {
                const isActive = era.id === activeEra.id;
                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => setActiveEra(era)}
                    aria-pressed={isActive}
                    aria-label={`Select era: ${era.label}`}
                    className={`group rounded-2xl border transition-all duration-300 text-left p-4 md:p-5 w-full ${
                      isActive
                        ? 'border-purple-400/60 bg-purple-500/10 shadow-[0_0_25px_rgba(192,132,252,0.35)]'
                        : 'border-white/10 bg-white/5 hover:border-purple-300/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`${typography.label} font-semibold tracking-[0.2em] text-slate-400`}>{era.range}</p>
                      <span className={`rounded-full px-3 py-1 ${typography.label} font-semibold tracking-widest ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-200'
                      }`}>
                        {era.emphasis}
                      </span>
                    </div>
                    <p className={`mt-2 ${typography.h4} text-white`}>{era.label}</p>
                    <p className={`mt-2 ${typography.body} text-slate-300`}>{era.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {era.focus.map(item => (
                        <span key={item} className={`${typography.caption} uppercase tracking-[0.3em] rounded-full border px-3 py-1 ${
                          isActive ? 'border-teal-400/60 text-teal-200' : 'border-white/15 text-slate-400'
                        }`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-emerald-100 flex items-start gap-3">
              {React.createElement(getIconComponent('NoosphereNode') || 'div', { size: 32, className: "text-emerald-200" })}
              <p className={typography.body}>
                Each era is not replaced by the next—it is nested. Integral history is a holarchy: the present contains the past, refined by critical reflection and new capacities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
