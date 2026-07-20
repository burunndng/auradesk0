import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Phase {
  label: string;
  duration: number;
}

interface BreathPacerProps {
  phases: Phase[];
  onStop: () => void;
}

export default function BreathPacer({ phases, onStop }: BreathPacerProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0]?.duration ?? 4);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = phases[phaseIndex];
  const totalDuration = phases.reduce((s, p) => s + p.duration, 0);
  const elapsed = phases.slice(0, phaseIndex).reduce((s, p) => s + p.duration, 0) + (currentPhase.duration - timeLeft);
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

  const isExpanding = currentPhase.label.toLowerCase().includes('inhale');
  const ringScale = running
    ? isExpanding
      ? 0.6 + 0.4 * (1 - timeLeft / currentPhase.duration)
      : 1 - 0.4 * (1 - timeLeft / currentPhase.duration)
    : 0.7;

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev > 1) {
        return prev - 1;
      }

      setPhaseIndex(pi => {
        const next = (pi + 1) % phases.length;
        if (next === 0) setCycles(c => c + 1);
        return next;
      });

      // Let the useEffect on phaseIndex handle resetting the timer duration.
      return 0;
    });
  }, [phases]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  // Reset timeLeft when phase changes
  useEffect(() => {
    setTimeLeft(phases[phaseIndex]?.duration ?? 4);
  }, [phaseIndex, phases]);

  const toggle = () => setRunning(r => !r);

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Cycle {cycles + 1}</p>

      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {/* Background ring */}
        <svg className="absolute inset-0" width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="90" fill="none" stroke="rgb(30,41,59)" strokeWidth="6" />
          <circle
            cx="110" cy="110" r="90" fill="none"
            stroke="rgb(99,102,241)" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Animated breath ring */}
        <div
          className="rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 transition-transform"
          style={{
            width: 160,
            height: 160,
            transform: `scale(${ringScale})`,
            transitionDuration: running ? `${currentPhase.duration * 1000}ms` : '300ms',
            transitionTimingFunction: isExpanding ? 'ease-in' : 'ease-out',
          }}
        />

        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-white tabular-nums">{timeLeft}</span>
          <span className="text-xs text-emerald-300 font-semibold mt-1">{currentPhase.label}</span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              i === phaseIndex && running
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {p.label} {p.duration}s
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggle}
          className="px-6 py-2 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onStop}
          className="px-6 py-2 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
}
