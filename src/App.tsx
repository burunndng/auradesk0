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
import SacredBackground from '@/components/SacredBackground';
import { ScarabDefs } from '@/components/Scarab';
import { AppIcon } from '@/components/AppIcon';

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
      {/* Scarab SVG symbol defs (hidden) */}
      <ScarabDefs />

      {/* Boot Sequence */}
      {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

      {/* Desktop Shell */}
      {showDesktop && (
        <div className="relative w-full h-full" style={{ background: 'var(--bg-desktop)' }}>
          {/* Sacred scarab wallpaper layer */}
          <SacredBackground />

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

          {/* Alt+Tab switcher */}
          {state.isAltTabbing && (
            <div
              className="fixed inset-0 z-[5000] flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(5, 8, 17, 0.62)' }}
            >
              <div
                className="flex items-center gap-3 px-6 py-4 pointer-events-auto surface-glass"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  animation: 'alttabAppear 220ms cubic-bezier(0.32, 0.72, 0, 1)',
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
                        className="flex flex-col items-center gap-2 p-3"
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          background: isSelected ? 'var(--bg-selected)' : 'transparent',
                          border: isSelected ? '1px solid var(--border-glow)' : '1px solid transparent',
                          boxShadow: isSelected ? 'var(--glow-lapis)' : 'none',
                          width: 88,
                          transition: 'background 200ms cubic-bezier(0.32, 0.72, 0, 1), border-color 200ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(127,161,255,0.16)' : 'var(--bg-hover)',
                            border: '1px solid var(--border-subtle)',
                            color: isSelected ? 'var(--lapis-bright)' : 'var(--text-secondary)',
                          }}
                        >
                          <AppIcon name={app?.icon || w.icon || 'Monitor'} size={22} strokeWidth={1.4} />
                        </div>
                        <span
                          className="font-mono text-center truncate"
                          style={{
                            fontSize: 8,
                            letterSpacing: '0.1em',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            maxWidth: 72,
                          }}
                        >
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
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
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
