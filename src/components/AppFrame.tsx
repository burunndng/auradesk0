import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Monitor, Music, RotateCw } from 'lucide-react';
import type { AppDefinition } from '@/types';

interface AppFrameProps {
  app: AppDefinition;
}

export default function AppFrame({ app }: AppFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const allow = (app.permissions ?? []).join('; ') || undefined;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    // If the frame never fires onLoad (server down or blocked), show fallback.
    const timer = window.setTimeout(() => {
      if (!iframeRef.current?.contentWindow) setFailed(true);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [app.url]);

  const reload = useCallback(() => {
    if (iframeRef.current) {
      setLoaded(false);
      setFailed(false);
      iframeRef.current.src = app.url || '';
    }
  }, [app.url]);

  const isAudio = app.category === 'Audio';
  const Hero = isAudio ? Music : Monitor;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg-window)' }}>
      {/* Loading veil */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(216,178,106,0.22), rgba(4,3,11,0.5))',
              border: '1px solid var(--border-default)',
              boxShadow: 'inset 0 0 28px rgba(216,178,106,0.18), 0 0 28px rgba(216,178,106,0.18)',
              animation: 'corePulse 3s ease-in-out infinite',
            }}
          >
            <Hero size={32} style={{ color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 12px rgba(216,178,106,0.7))' }} />
          </div>
          <div className="eyebrow">▣ BINDING {app.name.toUpperCase()} MEMBRANE</div>
          <div
            className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: 'var(--accent-primary)',
              borderRightColor: 'var(--gold-bright)',
              filter: 'drop-shadow(0 0 8px rgba(216,178,106,0.5))',
            }}
          />
        </div>
      )}

      {/* Fallback when the embedded server is unreachable */}
      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-window)' }}>
          <p className="font-mono max-w-[340px] text-center" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent-crimson)', textTransform: 'uppercase' }}>
            ⚠ {app.name} membrane unreachable — is its dev server running?
          </p>
          <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
            {app.url}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={reload}
              className="font-mono flex items-center gap-2"
              style={{ padding: '9px 16px', borderRadius: 6, fontSize: 10, letterSpacing: '0.14em', background: 'rgba(216,178,106,0.14)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', textTransform: 'uppercase' }}
            >
              <RotateCw size={12} />
              Retry
            </button>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono flex items-center gap-2"
              style={{ padding: '9px 16px', borderRadius: 6, fontSize: 10, letterSpacing: '0.14em', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', textTransform: 'uppercase' }}
            >
              <ExternalLink size={12} />
              Open Tab
            </a>
          </div>
        </div>
      )}

      {/* Corner controls */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
        <button
          onClick={reload}
          className="flex items-center justify-center"
          style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-tooltip)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          title="Reload app"
        >
          <RotateCw size={12} />
        </button>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
          style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-tooltip)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          title={`Open ${app.name} in new tab`}
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {app.url && (
        <iframe
          ref={iframeRef}
          src={app.url}
          title={app.name}
          allow={allow}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        />
      )}
    </div>
  );
}
