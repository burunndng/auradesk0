// ============================================================
// AppFrame — Generic iframe wrapper for external/project apps
// ============================================================

import { useState } from 'react';
import { ExternalLink, Loader2, TriangleAlert } from 'lucide-react';
import type { AppDefinition } from '@/types';

interface AppFrameProps {
  app: AppDefinition;
}

export default function AppFrame({ app }: AppFrameProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'blocked'>('loading');
  const [error, setError] = useState<string | null>(null);

  const allowAttr = (app.permissions ?? []).join('; ');
  const sandbox = app.permissions?.length
    ? 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals'
    : 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock';

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg-window)' }}>
      {/* Open full app — top-right, only shown once loaded */}
      {status !== 'loading' && app.url && (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open full app in a new tab"
          className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
          style={{
            background: 'rgba(20,20,20,0.7)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          <ExternalLink size={12} />
          Open full app
        </a>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={28} className="animate-spin" />
          <span className="text-xs">Loading {app.name}…</span>
        </div>
      )}

      {status === 'blocked' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-8 text-center" style={{ color: 'var(--text-primary)' }}>
          <TriangleAlert size={32} className="opacity-70" />
          <div className="text-sm font-semibold">{app.name} can't be embedded here</div>
          <p className="text-xs opacity-70 max-w-[280px]">{error ?? 'This app blocks being framed. Open it in a new tab instead.'}</p>
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accent-primary)', color: 'white' }}
            >
              <ExternalLink size={12} />
              Open {app.name}
            </a>
          )}
        </div>
      )}

      {app.url && status !== 'blocked' && (
        <iframe
          src={app.url}
          title={app.name}
          className="w-full h-full border-0"
          style={{ display: status === 'loading' ? 'none' : 'block' }}
          allow={allowAttr}
          sandbox={sandbox}
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setStatus('ready')}
          onError={() => {
            setStatus('blocked');
            setError('The app refused the connection. It may block embedding.');
          }}
        />
      )}
    </div>
  );
}
