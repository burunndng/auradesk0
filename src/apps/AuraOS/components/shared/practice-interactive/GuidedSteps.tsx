import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Step {
  text: string;
  duration?: number;
}

interface GuidedStepsProps {
  steps: Step[];
  onStop: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}

export default function GuidedSteps({ steps, onStop }: GuidedStepsProps) {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(steps[0]?.duration ?? null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[index];
  const hasDuration = step?.duration != null;
  const progress = hasDuration && step.duration! > 0 && timeLeft != null
    ? 1 - timeLeft / step.duration!
    : 0;

  useEffect(() => {
    setTimeLeft(steps[index]?.duration ?? null);
    setTimerRunning(false);
  }, [index, steps]);

  useEffect(() => {
    if (timerRunning && timeLeft !== null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  const goNext = () => { if (index < steps.length - 1) setIndex(i => i + 1); };
  const goPrev = () => { if (index > 0) setIndex(i => i - 1); };

  const startTimer = () => {
    setTimeLeft(step.duration!);
    setTimerRunning(true);
  };

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === index ? 'bg-accent w-4' : i < index ? 'bg-slate-600' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="flex items-start gap-4">
        {hasDuration && (
          <div className="flex-shrink-0 relative" style={{ width: 96, height: 96 }}>
            <svg className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgb(30,41,59)" strokeWidth="5" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke="rgb(139,92,246)"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {timeLeft !== null
                ? <span className="text-lg font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
                : <span className="text-sm text-slate-400">{formatTime(step.duration!)}</span>
              }
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Step {index + 1} of {steps.length}
          </p>
          <p className="text-slate-200 text-sm leading-relaxed">{step.text}</p>
        </div>
      </div>

      {hasDuration && (
        <button
          onClick={timerRunning ? () => setTimerRunning(false) : startTimer}
          disabled={timeLeft === 0}
          className={`self-center px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            timeLeft === 0
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : timerRunning
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {timeLeft === 0 ? 'Done ✓' : timerRunning ? 'Pause Timer' : 'Start Timer'}
        </button>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {index === steps.length - 1 ? (
          <button
            onClick={onStop}
            className="px-6 py-2 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-all active:scale-95"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
