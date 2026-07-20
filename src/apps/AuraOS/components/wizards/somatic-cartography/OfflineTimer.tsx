/**
 * Somatic Cartography — OfflineTimer
 * Dim-screen felt-sensing period. Timer is timestamp-anchored so it survives backgrounding.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COME_BACK_HOLD_MS } from './constants';

interface OfflineTimerProps {
  durationMs: number;
  /** ISO timestamp when the offline period began — source of truth */
  startedAt: string;
  /** Memorizable prompt ≤15 words */
  prompt: string;
  onComplete: (returnedAt: string) => void;
  onEarlyReturn: (returnedAt: string) => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export default function OfflineTimer({
  durationMs,
  startedAt,
  prompt,
  onComplete,
  onEarlyReturn,
}: OfflineTimerProps) {
  const computeRemaining = useCallback(() => {
    return Math.max(0, durationMs - (Date.now() - new Date(startedAt).getTime()));
  }, [durationMs, startedAt]);

  const [remainingMs, setRemainingMs] = useState(() => computeRemaining());
  const [brightness, setBrightness] = useState(0); // 0 = dark, 1 = bright (for return transition)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  // Tick — re-compute from timestamp on every interval (not from accumulated count)
  useEffect(() => {
    const remaining = computeRemaining();

    // Already elapsed before render
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(new Date().toISOString());
      return;
    }

    const interval = setInterval(() => {
      const rem = computeRemaining();
      setRemainingMs(rem);
      if (rem <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        onComplete(new Date().toISOString());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [computeRemaining, onComplete]);

  // "Come Back" hold interaction
  const startHold = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onEarlyReturn(new Date().toISOString());
      }
    }, COME_BACK_HOLD_MS);
  }, [onEarlyReturn]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const percent = Math.max(0, Math.min(1, 1 - remainingMs / durationMs));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6"
      style={{ backgroundColor: 'rgb(4, 4, 6)' }}
    >
      {/* Prompt — large enough to read without glasses */}
      <div className="flex-1 flex items-center justify-center">
        <p
          className="text-center text-neutral-200 leading-relaxed max-w-xs"
          style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', opacity: 0.7 }}
        >
          {prompt}
        </p>
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        {/* Circular progress */}
        <svg width="80" height="80" viewBox="0 0 80 80" className="mb-3 mx-auto">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(16,185,129,0.4)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - percent)}`}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <text x="40" y="44" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14" fontFamily="monospace">
            {formatRemaining(remainingMs)}
          </text>
        </svg>
      </div>

      {/* Come Back button */}
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className="relative px-8 py-5 rounded-2xl border border-emerald-500/20 text-neutral-400 text-sm tracking-widest font-mono uppercase select-none"
        style={{
          minWidth: '200px',
          animation: 'pulseGentle 3s ease-in-out infinite',
        }}
        aria-label="Hold to come back early"
      >
        Come Back ⚓
        <span className="block text-xs text-neutral-600 mt-0.5 normal-case tracking-normal font-sans">
          Hold to return
        </span>
      </button>
    </div>
  );
}
