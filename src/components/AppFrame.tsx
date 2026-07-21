import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Monitor, Music, RotateCw, SquareArrowOutUpRight } from 'lucide-react';
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
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center gap-5 p-8 text-center"
      style={{ background: 'var(--bg-window)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--bg-hover)' }}
      >
        <Hero size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-base font-semibold">{app.name}</div>
        <p className="text-xs max-w-[320px]" style={{ color: 'var(--text-secondary)' }}>
          {app.description}
        </p>
        <p className="text-[11px] mt-1 max-w-[320px]" style={{ color: 'var(--text-secondary)' }}>
          {app.name} runs in its own browser window so it loads at full speed and keeps your session.
        </p>
      </div>

      {status === 'open' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Loader2 size={13} className="animate-spin" />
            {app.name} is open in a separate window
          </div>
          <button
            onClick={() => {
              if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.focus();
              } else {
                launch();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
          >
            <RotateCw size={12} />
            Focus {app.name}
          </button>
        </div>
      ) : (
        <button
          onClick={launch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--accent-primary)', color: 'white' }}
        >
          <SquareArrowOutUpRight size={15} />
          Launch {app.name}
        </button>
      )}

      {status === 'blocked' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] max-w-[300px]" style={{ color: 'var(--text-secondary)' }}>
            Popup was blocked. Allow popups for this site, or open {app.name} directly:
          </p>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
          >
            <ExternalLink size={12} />
            Open {app.url}
          </a>
        </div>
      )}

      {app.url && status !== 'open' && (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          {app.url}
        </a>
      )}
    </div>
  );
}
