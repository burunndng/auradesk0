// ============================================================
// App.tsx — Main AuraDesk Shell
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { OSProvider, useOS } from '@/hooks/useOSStore';
import BootSequence from '@/components/BootSequence';
import Desktop from '@/components/Desktop';
import TopPanel from '@/components/TopPanel';
import Dock from '@/components/Dock';
import AppLauncher from '@/components/AppLauncher';
import WindowManager from '@/components/WindowManager';
import ContextMenu from '@/components/ContextMenu';
import NotificationSystem from '@/components/NotificationSystem';
import NotificationCenter from '@/components/NotificationCenter';

function AppShell() {
  const { state, dispatch } = useOS();
  const { bootPhase } = state;
  const [bootComplete, setBootComplete] = useState(false);
  const altTabRef = useRef<{ holding: boolean }>({ holding: false });
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  // Boot sequence
  useEffect(() => {
    if (bootPhase === 'off') {
      dispatch({ type: 'SET_BOOT_PHASE', phase: 'logo' });
    }
  }, [bootPhase, dispatch]);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      // Super key toggles app launcher
      if (e.key === 'Meta' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_APP_LAUNCHER' });
        return;
      }

      // Super+D minimize all
      if ((e.metaKey || e.key === 'Meta') && e.key === 'd') {
        e.preventDefault();
        dispatch({ type: 'MINIMIZE_ALL' });
        return;
      }

      // Alt+Tab window switching
      if (e.key === 'Alt') {
        altTabRef.current.holding = true;
      }
      if (e.key === 'Tab' && e.altKey) {
        e.preventDefault();
        if (!s.isAltTabbing) {
          dispatch({ type: 'START_ALT_TAB' });
        } else {
          dispatch({ type: 'CYCLE_ALT_TAB' });
        }
      }

      // Escape closes app launcher
      if (e.key === 'Escape') {
        if (s.appLauncherOpen) {
          dispatch({ type: 'SET_APP_LAUNCHER', open: false });
        }
        if (s.notificationCenterOpen) {
          dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' });
        }
      }

      // Ctrl+W closes active window
      if (e.ctrlKey && e.key === 'w' && s.activeWindowId) {
        e.preventDefault();
        dispatch({ type: 'CLOSE_WINDOW', windowId: s.activeWindowId });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && stateRef.current.isAltTabbing) {
        dispatch({ type: 'END_ALT_TAB' });
        altTabRef.current.holding = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch]);

  // Direct to desktop after boot — no login gate
  const showDesktop = bootComplete;

  return (
    <div className={state.theme.mode === 'light' ? 'light' : ''} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Boot Sequence */}
      {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

      {/* Desktop Shell */}
      {showDesktop && (
        <div className="relative w-full h-full" style={{ background: 'var(--bg-desktop)' }}>
          {/* Wallpaper layer */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${state.theme.wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          />

          {/* Desktop Icons layer */}
          <Desktop />

          {/* Windows layer */}
          <WindowManager />

          {/* Top panel */}
          <TopPanel />

          {/* Dock */}
          <Dock />

          {/* Overlays */}
          <AppLauncher />
          <ContextMenu />
          <NotificationSystem />
          <NotificationCenter />

          {/* Alt+Tab switcher */}
          {state.isAltTabbing && (
            <div
              className="fixed inset-0 z-[5000] flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <div
                className="flex items-center gap-3 px-6 py-4 rounded-2xl pointer-events-auto"
                style={{
                  background: 'rgba(30,30,30,0.9)',
                  backdropFilter: 'blur(16px)',
                  animation: 'alttabAppear 150ms ease',
                }}
              >
                {state.windows
                  .filter((w) => w.state !== 'minimized')
                  .map((w, i) => {
                    const app = state.apps.find((a) => a.id === w.appId);
                    const isSelected = i === state.altTabIndex;
                    return (
                      <div
                        key={w.id}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                        style={{
                          background: isSelected ? 'var(--bg-hover)' : 'transparent',
                          border: isSelected ? '2px solid var(--accent-primary)' : '2px solid transparent',
                          width: 80,
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--bg-hover)' }}>
                          <span className="text-2xl">
                            {app?.icon === 'Monitor' && '🖥️'}
                            {app?.icon === 'Music' && '🎵'}
                            {!['Monitor', 'Music'].includes(app?.icon || '') && '📱'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-primary)] text-center truncate max-w-[64px]">
                          {w.title}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <style>{`
            @keyframes alttabAppear {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <AppShell />
    </OSProvider>
  );
}
