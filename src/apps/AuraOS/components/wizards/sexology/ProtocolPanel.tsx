import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SexologyProtocol, ProtocolStep, ProtocolStepType } from '../../../data/sexologyProtocols';

interface ProtocolPanelProps {
  protocol: SexologyProtocol;
  onComplete: (debriefContext: string) => void;
  onDismiss: () => void;
}

const STEP_TYPE_COLOR: Record<ProtocolStepType, string> = {
  instruction: 'text-stone-500  bg-stone-800/60  border-stone-700/30',
  breathe:     'text-teal-400   bg-teal-900/20   border-teal-500/20',
  notice:      'text-amber-400  bg-amber-900/20  border-amber-500/20',
  reflect:     'text-purple-400 bg-purple-900/20 border-purple-500/20',
  write:       'text-blue-400   bg-blue-900/20   border-blue-500/20',
  action:      'text-rose-400   bg-rose-950/30   border-rose-500/20',
};

const STEP_TYPE_LABEL: Record<ProtocolStepType, string> = {
  instruction: 'Ground',
  breathe:     'Breathe',
  notice:      'Notice',
  reflect:     'Reflect',
  write:       'Write',
  action:      'Act',
};

function StepTypeBadge({ type }: { type: ProtocolStepType }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-widest ${STEP_TYPE_COLOR[type]}`}>
      {STEP_TYPE_LABEL[type]}
    </span>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? 'w-2 h-1.5 bg-rose-500/60'
              : i === current
              ? 'w-3 h-1.5 bg-rose-400'
              : 'w-2 h-1.5 bg-stone-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function ProtocolPanel({ protocol, onComplete, onDismiss }: ProtocolPanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>(() =>
    new Array(protocol.steps.length).fill('')
  );

  const currentStep = protocol.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === protocol.steps.length - 1;
  const currentResponse = responses[stepIndex];

  const saveAndNavigate = (direction: 'next' | 'back') => {
    // response already kept in sync via setResponses on change
    if (direction === 'next') {
      if (isLast) {
        const context = protocol.steps
          .map((step, i) => (step.prompt && responses[i] ? `${step.prompt}\n→ ${responses[i]}` : null))
          .filter(Boolean)
          .join('\n\n');
        onComplete(context);
      } else {
        setStepIndex(i => i + 1);
      }
    } else {
      setStepIndex(i => i - 1);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponses(prev => {
      const updated = [...prev];
      updated[stepIndex] = value;
      return updated;
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-stone-950/98 backdrop-blur-sm rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-rose-500/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-0.5">Protocol</p>
            <h2 className="text-base font-serif font-light text-stone-100 leading-tight truncate">{protocol.name}</h2>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-2 hover:bg-stone-800/60 rounded-xl transition-all duration-150 flex-shrink-0 ml-3"
          title="Exit protocol"
          aria-label="Exit protocol"
        >
          <X size={18} className="text-stone-600 hover:text-stone-400 transition-colors duration-150" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-5 py-3 border-b border-stone-800/40 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <StepDots total={protocol.steps.length} current={stepIndex} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
            {stepIndex + 1} / {protocol.steps.length}
          </span>
        </div>
        <div className="h-px bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / protocol.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Type badge + instruction */}
        <div className="space-y-3">
          <StepTypeBadge type={currentStep.type} />
          <p className="text-stone-200 text-sm leading-relaxed">{currentStep.instruction}</p>
          {currentStep.duration && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
              ~ {currentStep.duration}
            </p>
          )}
        </div>

        {/* Prompt + response */}
        {currentStep.prompt && (
          <div className="space-y-2 mt-1">
            <p className="text-xs text-rose-400/70 leading-relaxed italic">{currentStep.prompt}</p>
            <textarea
              value={currentResponse}
              onChange={e => handleResponseChange(e.target.value)}
              placeholder="Your reflection (optional — stays on this device)"
              rows={3}
              className="w-full bg-stone-900/50 border border-stone-700/40 rounded-xl px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-500/25 focus:ring-1 focus:ring-rose-500/15 text-sm resize-none transition-all duration-150 leading-relaxed"
              style={{ minHeight: '72px', maxHeight: '180px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = '72px';
                t.style.height = Math.min(t.scrollHeight, 180) + 'px';
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 border-t border-rose-500/8 bg-stone-950/80 px-5 py-4 flex items-center justify-between gap-3">
        <button
          onClick={() => saveAndNavigate('back')}
          disabled={isFirst}
          className="px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-300 hover:bg-stone-800/60 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        <button
          onClick={() => saveAndNavigate('next')}
          className="px-5 py-2.5 rounded-xl text-sm bg-rose-600 hover:bg-rose-500 text-white transition-all duration-150 shadow-lg shadow-red-900/20 font-medium"
        >
          {isLast ? 'Complete →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
