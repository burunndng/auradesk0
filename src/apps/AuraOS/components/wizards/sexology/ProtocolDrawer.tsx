import React from 'react';
import { X } from 'lucide-react';
import { SEXOLOGY_PROTOCOLS } from '../../../data/sexologyProtocols';
import type { SexologyProtocol, ProtocolStepType } from '../../../data/sexologyProtocols';

interface ProtocolDrawerProps {
  onSelectProtocol: (protocol: SexologyProtocol) => void;
  onClose: () => void;
}

const STEP_DOT_COLOR: Record<ProtocolStepType, string> = {
  instruction: 'bg-stone-500',
  breathe:     'bg-teal-400',
  notice:      'bg-amber-400',
  reflect:     'bg-purple-400',
  write:       'bg-blue-400',
  action:      'bg-rose-400',
};

const STEP_DOT_LABEL: Record<ProtocolStepType, string> = {
  instruction: 'ground',
  breathe:     'breathe',
  notice:      'notice',
  reflect:     'reflect',
  write:       'write',
  action:      'act',
};

function StepPips({ protocol }: { protocol: SexologyProtocol }) {
  const seen = new Set<ProtocolStepType>();
  const unique = protocol.steps.reduce<ProtocolStepType[]>((acc, s) => {
    if (!seen.has(s.type)) { seen.add(s.type); acc.push(s.type); }
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-1">
      {unique.map(type => (
        <span
          key={type}
          title={STEP_DOT_LABEL[type]}
          className={`w-1.5 h-1.5 rounded-full ${STEP_DOT_COLOR[type]} opacity-60`}
        />
      ))}
    </div>
  );
}

export default function ProtocolDrawer({ onSelectProtocol, onClose }: ProtocolDrawerProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-stone-950/98 backdrop-blur-sm rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-rose-500/10 flex-shrink-0">
        <div>
          <h2 className="text-base font-serif font-light text-stone-100 leading-tight">Clinical Protocols</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mt-0.5">
            {SEXOLOGY_PROTOCOLS.length} structured practices
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-800/60 rounded-xl transition-all duration-150"
          aria-label="Close"
        >
          <X size={18} className="text-stone-600 hover:text-stone-400 transition-colors duration-150" />
        </button>
      </div>

      {/* Subtitle */}
      <div className="px-5 pt-3 pb-1 flex-shrink-0">
        <p className="text-xs text-stone-600 leading-relaxed">
          Structured practices you can do right now. Scarlett will debrief with you after.
        </p>
      </div>

      {/* Protocol list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {SEXOLOGY_PROTOCOLS.map(protocol => (
          <button
            key={protocol.id}
            onClick={() => onSelectProtocol(protocol)}
            className="w-full text-left bg-stone-900/30 hover:bg-stone-900/60 border border-stone-700/20 hover:border-rose-500/20 rounded-xl px-4 py-3.5 transition-all duration-150 group"
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span className="text-sm font-serif font-light text-stone-200 group-hover:text-stone-100 transition-colors leading-snug">
                {protocol.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600 group-hover:text-rose-500/60 transition-colors whitespace-nowrap mt-0.5 flex-shrink-0">
                {protocol.duration}
              </span>
            </div>
            <p className="text-xs text-stone-500 group-hover:text-stone-400 transition-colors leading-relaxed mb-2.5">
              {protocol.forWhen}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-stone-600 italic leading-relaxed">
                {protocol.tagline}
              </p>
              <StepPips protocol={protocol} />
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-stone-800/50">
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
          {(Object.keys(STEP_DOT_COLOR) as ProtocolStepType[]).map(type => (
            <div key={type} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${STEP_DOT_COLOR[type]} opacity-50`} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-700">
                {STEP_DOT_LABEL[type]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
