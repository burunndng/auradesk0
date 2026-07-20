import React, { useState, useEffect, useRef } from 'react';

interface Cue {
  pct: number;
  text: string;
}

interface CountdownTimerProps {
  minDuration: number;
  maxDuration: number;
  defaultDuration: number;
  onStop: () => void;
  cues?: Cue[];
}

const DEFAULT_CUES: Cue[] = [
  { pct: 0, text: 'Enter the water slowly and deliberately.' },
  { pct: 0.25, text: 'Focus on the sensation — observe it as data, not danger.' },
  { pct: 0.5, text: 'Breathe slowly. Control the breath, control the mind.' },
  { pct: 0.75, text: 'Almost there — stay present.' },
  { pct: 1, text: 'Exit safely. Well done.' },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function CountdownTimer({ minDuration, maxDuration, defaultDuration, onStop, cues }: CountdownTimerProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCues = cues ?? DEFAULT_CUES;
  const progress = duration > 0 ? 1 - timeLeft / duration : 1;
  const currentCue = activeCues.reduce((best, c) => (c.pct <= progress ? c : best), activeCues[0]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const start = () => {
    setTimeLeft(duration);
    setFinished(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    setTimeLeft(val);
    setRunning(false);
    setFinished(false);
  };

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {!running && !finished && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{minDuration}s</span>
            <span className="font-bold text-white">{formatTime(duration)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            step={10}
            value={duration}
            onChange={e => handleDurationChange(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      )}

      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <svg className="absolute inset-0" width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="90" fill="none" stroke="rgb(30,41,59)" strokeWidth="6" />
          <circle
            cx="110" cy="110" r="90" fill="none"
            stroke={finished ? 'rgb(34,197,94)' : 'rgb(6,182,212)'}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
          {finished && <span className="text-sm text-green-400 font-semibold mt-1">Complete!</span>}
        </div>
      </div>

      <p className="text-sm text-slate-400 text-center max-w-xs italic px-4">{currentCue.text}</p>

      <div className="flex gap-3">
        {!running && !finished && (
          <button onClick={start} className="px-6 py-2 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white transition-all active:scale-95">
            Start
          </button>
        )}
        {(running || finished) && (
          <button onClick={reset} className="px-6 py-2 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95">
            Reset
          </button>
        )}
        <button onClick={onStop} className="px-6 py-2 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95">
          Done
        </button>
      </div>
    </div>
  );
}
