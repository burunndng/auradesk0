// ============================================================
// WindowManager — Renders all open windows, manages z-index
// ============================================================

import { memo, Suspense } from 'react';
import { useOS } from '@/hooks/useOSStore';
import WindowFrame from './WindowFrame';
import AppRouter from '@/apps/AppRouter';

function WindowLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-window)' }}>
      <div
        className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
        style={{
          borderTopColor: 'var(--accent-primary)',
          borderRightColor: 'var(--accent-primary)',
        }}
      />
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
