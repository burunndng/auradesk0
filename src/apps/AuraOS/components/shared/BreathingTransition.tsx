import React, { useState, useEffect, useRef } from 'react';
import { Wind } from 'lucide-react';

interface BreathingTransitionProps {
  label: string;
  onComplete: () => void;
  onSkip: () => void;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  numCycles?: number;
}

export const BreathingTransition: React.FC<BreathingTransitionProps> = ({
  label,
  onComplete,
  onSkip,
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 4000,
  numCycles = 1
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sequence = [
      { phase: 'inhale' as const, duration: inhaleDuration },
      { phase: 'hold' as const, duration: holdDuration },
      { phase: 'exhale' as const, duration: exhaleDuration },
    ];
    let idx = 0;

    const tick = () => {
      const { phase: p, duration } = sequence[idx % 3];
      setPhase(p);

      if (idx > 0 && idx % 3 === 0) {
        setCurrentCycle(c => {
          if (c + 1 >= numCycles) {
            onComplete();
            return c;
          }
          return c + 1;
        });
      }

      timerRef.current = setTimeout(() => {
        idx++;
        tick();
      }, duration);
    };

    tick();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete, inhaleDuration, holdDuration, exhaleDuration, numCycles]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-serif text-slate-100">{label}</h3>
        <p className="text-sm text-slate-400">Taking a moment to ground the nervous system...</p>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Breathing Circle */}
        <div
          className={`w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
            phase === 'inhale' ? 'scale-150 bg-purple-500/20' : 
            phase === 'hold' ? 'scale-150 bg-purple-500/30' : 
            'scale-100 bg-purple-500/10'
          }`}
        >
          <Wind className={`text-purple-400 transition-opacity duration-500 ${phase === 'hold' ? 'opacity-100' : 'opacity-50'}`} size={32} />
        </div>

        {/* Phase Text */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <p className="text-lg font-medium text-purple-300 uppercase tracking-widest animate-pulse">
            {phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
          </p>
        </div>
      </div>

      <div className="pt-8">
        <button
          onClick={onSkip}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest border-b border-transparent hover:border-slate-700"
        >
          Skip Transition
        </button>
      </div>
    </div>
  );
};
