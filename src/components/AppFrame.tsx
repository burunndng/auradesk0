import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, RotateCw } from 'lucide-react';
import type { AppDefinition } from '@/types';
import { AppIcon } from '@/components/AppIcon';

interface AppFrameProps {
  app: AppDefinition;
}

export default function AppFrame({ app }: AppFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  const allow =
    (app.permissions ?? []).length > 0
      ? [...new Set([...(app.permissions ?? []), 'fullscreen'])].join('; ')
      : undefined;

  useEffect(() => {
    loadedRef.current = false;
    setLoaded(false);
    setFailed(false);
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, 14000);
    return () => window.clearTimeout(timer);
  }, [app.url]);

  const reload = useCallback(() => {
    if (iframeRef.current) {
      loadedRef.current = false;
      setLoaded(false);
      setFailed(false);
      iframeRef.current.src = app.url || '';
    }
  }, [app.url]);

  const handleLoad = useCallback(() => {
    loadedRef.current = true;
    setLoaded(true);
    setFailed(false);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg-window)' }}>
      {!loaded && !failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(145deg, rgba(127,161,255,0.16), rgba(5,8,17,0.7))',
              border: '1px solid var(--border-default)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 32px rgba(127,161,255,0.2)',
            }}
          >
            <AppIcon
              name={app.icon}
              size={34}
              strokeWidth={1.35}
              style={{ color: 'var(--lapis-bright)', filter: 'drop-shadow(0 0 14px rgba(127,161,255,0.7))' }}
            />
          </div>
          <div className="flex flex-col items-center gap-2 px-6">
            <div className="eyebrow">▣ BINDING {app.name.toUpperCase()} MEMBRANE</div>
            {app.description && (
              <p className="font-mono text-center" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-tertiary)', maxWidth: 320 }}>
                {app.description}
              </p>
            )}
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: 'var(--lapis)',
              borderRightColor: 'var(--gilt-bright)',
              filter: 'drop-shadow(0 0 8px rgba(127,161,255,0.45))',
            }}
          />
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5" style={{ background: 'var(--bg-window)' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.28)',
              color: 'var(--accent-error)',
            }}
          >
            <AppIcon name={app.icon} size={28} strokeWidth={1.35} />
          </div>
          <div className="flex flex-col items-center gap-2 px-6">
            <p className="font-mono text-center" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent-error)', textTransform: 'uppercase' }}>
              {app.name} membrane unreachable
            </p>
            <p className="font-mono text-center" style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-tertiary)', maxWidth: 360, wordBreak: 'break-all' }}>
              {app.url}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reload}
              className="font-mono flex items-center gap-2"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: 10,
                letterSpacing: '0.14em',
                background: 'rgba(127,161,255,0.12)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
              }}
            >
              <RotateCw size={12} />
              Retry
            </button>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono flex items-center gap-2"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: 10,
                letterSpacing: '0.14em',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
              }}
            >
              <ExternalLink size={12} />
              Open Tab
            </a>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 opacity-25 hover:opacity-100"
        style={{ transition: 'opacity 280ms cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <button
          onClick={reload}
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--bg-tooltip)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
          title="Reload app"
        >
          <RotateCw size={12} />
        </button>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--bg-tooltip)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
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
          allowFullScreen
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: loaded && !failed ? 1 : 0,
            transition: 'opacity 450ms cubic-bezier(0.32, 0.72, 0, 1)',
            background: 'transparent',
          }}
        />
      )}
    </div>
  );
}
