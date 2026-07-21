import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Monitor, Music, RotateCw, SquareArrowOutUpRight } from 'lucide-react';
import type { AppDefinition } from '@/types';

interface AppFrameProps {
  app: AppDefinition;
}

const buildFeatures = (w: number, h: number) => {
  const left = Math.max(0, Math.round((window.screen.availWidth - w) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - h) / 2));
  return `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes`;
};

export default function AppFrame({ app }: AppFrameProps) {
  const popupRef = useRef<Window | null>(null);
  const [status, setStatus] = useState<'idle' | 'open' | 'blocked'>('idle');
  const intervalRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const launch = useCallback(() => {
    if (!app.url) return;
    const w = app.defaultSize.width;
    const h = app.defaultSize.height;
    const win = window.open(app.url, `${app.id}-window`, buildFeatures(w, h));
    if (!win) {
      setStatus('blocked');
      return;
    }
    win.focus();
    popupRef.current = win;
    setStatus('open');
    stopPolling();
    intervalRef.current = window.setInterval(() => {
      if (popupRef.current?.closed) {
        setStatus('idle');
        popupRef.current = null;
        stopPolling();
      }
    }, 800);
  }, [app.url, app.id, app.defaultSize.width, app.defaultSize.height, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const isAudio = app.category === 'Audio';
  const Hero = isAudio ? Music : Monitor;

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ background: 'radial-gradient(circle at center, rgba(20,13,42,0.6), var(--bg-window) 70%)' }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(107,70,223,0.22), rgba(4,3,11,0.5))',
          border: '1px solid var(--border-default)',
          boxShadow: 'inset 0 0 28px rgba(112,71,255,0.18), 0 0 28px rgba(102,61,244,0.18)',
          animation: 'corePulse 3s ease-in-out infinite',
        }}
      >
        <Hero size={32} style={{ color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 12px rgba(128,92,255,0.7))' }} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="eyebrow">▣ EXTERNAL MEMBRANE</div>
        <div className="font-display font-bold" style={{ fontSize: 20, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          {app.name}
        </div>
        <p className="font-mono max-w-[340px]" style={{ fontSize: 10, lineHeight: 1.8, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          {app.description}
        </p>
        <p className="font-mono max-w-[340px]" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
          // OPENS IN A DEDICATED WINDOW FOR FULL-FIDELITY SESSION
        </p>
      </div>

      {status === 'open' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="font-mono flex items-center gap-2" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--accent-success)', textTransform: 'uppercase' }}>
            <span className="status-dot" />
            LINK ACTIVE
          </div>
          <button
            onClick={() => {
              if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.focus();
              } else {
                launch();
              }
            }}
            className="font-mono flex items-center gap-2 transition-transform hover:scale-[1.03]"
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              background: 'rgba(107,70,223,0.14)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <RotateCw size={12} />
            Focus Window
          </button>
        </div>
      ) : (
        <button
          onClick={launch}
          className="font-display flex items-center gap-2.5 transition-transform hover:scale-[1.03]"
          style={{
            padding: '13px 24px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #6245d9, #805cff)',
            border: '1px solid var(--border-glow)',
            color: 'white',
            boxShadow: '0 0 32px rgba(128,92,255,0.4)',
          }}
        >
          <SquareArrowOutUpRight size={15} />
          Awaken {app.name}
        </button>
      )}

      {status === 'blocked' && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono max-w-[300px]" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--accent-crimson)', textTransform: 'uppercase' }}>
            ⚠ POPUP GATED — ALLOW POPUPS OR OPEN DIRECTLY
          </p>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono flex items-center gap-1.5"
            style={{ padding: '8px 14px', borderRadius: 6, fontSize: 9, letterSpacing: '0.14em', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          >
            <ExternalLink size={11} />
            Open {app.url}
          </a>
        </div>
      )}

      {app.url && status !== 'open' && (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono underline"
          style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}
        >
          {app.url}
        </a>
      )}

      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.2 }} />
    </div>
  );
}
