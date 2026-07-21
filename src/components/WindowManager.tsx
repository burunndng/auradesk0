// ============================================================
// WindowManager — Renders all open windows, manages z-index
// ============================================================

import { memo, Suspense } from 'react';
import { useOS } from '@/hooks/useOSStore';
import WindowFrame from './WindowFrame';
import AppRouter from '@/apps/AppRouter';

function WindowLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg-window)' }}>
      <div
        className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
        style={{
          borderTopColor: 'var(--accent-primary)',
          borderRightColor: 'var(--accent-cyan)',
          filter: 'drop-shadow(0 0 8px rgba(128,92,255,0.5))',
        }}
      />
      <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
        summoning signal...
      </span>
    </div>
  );
}

const WindowManager = memo(function WindowManager() {
  const { state } = useOS();
  const visibleWindows = state.windows.filter((w) => w.state !== 'minimized');

  return (
    <>
      {visibleWindows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <Suspense fallback={<WindowLoading />}>
            <AppRouter appId={win.appId} windowId={win.id} />
          </Suspense>
        </WindowFrame>
      ))}
    </>
  );
});

export default WindowManager;
