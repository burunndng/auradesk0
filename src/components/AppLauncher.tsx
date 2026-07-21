// ============================================================
// AppLauncher — Full-screen overlay with search + app grid
// ============================================================

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useOS } from '@/hooks/useOSStore';
import { getAppById } from '@/apps/registry';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : null;
};

const CATEGORIES = ['Favorites', 'All', 'System', 'Productivity', 'Practice', 'Audio'];

const AppLauncher = memo(function AppLauncher() {
  const { state, dispatch } = useOS();
  const { appLauncherOpen, apps, dockItems } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appLauncherOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [appLauncherOpen]);

  // Close on Escape
  useEffect(() => {
    if (!appLauncherOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_APP_LAUNCHER', open: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appLauncherOpen, dispatch]);

  const handleLaunch = useCallback(
    (appId: string) => {
      dispatch({ type: 'SET_APP_LAUNCHER', open: false });
      // Small delay so launcher closes first
      setTimeout(() => {
        dispatch({ type: 'OPEN_WINDOW', appId, viewport: { width: window.innerWidth, height: window.innerHeight } });
      }, 150);
    },
    [dispatch]
  );

  const filteredApps = apps.filter((app) => {
    const matchesSearch = !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || activeCategory === 'Favorites'
      ? true
      : app.category === activeCategory;
    const matchesFavorites = activeCategory !== 'Favorites' || dockItems.some((d) => d.appId === app.id && d.isPinned);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const frequentApps = dockItems
    .filter((d) => d.isPinned)
    .map((d) => getAppById(d.appId))
    .filter(Boolean);

  if (!appLauncherOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex flex-col items-center"
      style={{
        background: 'var(--bg-app-grid)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        animation: 'launcherFade 300ms ease',
        paddingTop: 40,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dispatch({ type: 'SET_APP_LAUNCHER', open: false });
      }}
    >
      {/* eyebrow */}
      <div
        className="font-mono"
        style={{
          fontSize: 9,
          letterSpacing: '0.28em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          animation: 'searchSlideDown 300ms ease 50ms both',
        }}
      >
        ◈ SIGNAL MEMBRANE / SELECT APPLICATION
      </div>

      {/* Search bar */}
      <div
        className="relative w-[480px] max-w-[90vw] mt-5"
        style={{
          animation: 'searchSlideDown 400ms cubic-bezier(0, 0, 0.2, 1) 100ms both',
        }}
      >
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="query the lattice..."
          className="font-mono outline-none transition-all"
          style={{
            width: '100%',
            height: 44,
            borderRadius: 6,
            paddingLeft: 42,
            paddingRight: 40,
            fontSize: 12,
            letterSpacing: '0.1em',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(128,92,255,0.18), 0 0 24px rgba(128,92,255,0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Frequent apps */}
      {!searchQuery && frequentApps.length > 0 && (
        <div className="mt-7 w-[480px] max-w-[90vw]" style={{ animation: 'searchSlideDown 300ms ease 200ms both' }}>
          <p className="eyebrow mb-3">▣ FREQUENT NODES</p>
          <div className="flex gap-4">
            {frequentApps.slice(0, 6).map((app) => (
              <button
                key={app!.id}
                onClick={() => handleLaunch(app!.id)}
                className="flex flex-col items-center gap-1.5 w-16 group"
              >
                <div
                  className="flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(107,70,223,0.10)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <DynamicIcon name={app!.icon} size={22} style={{ color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 8px rgba(128,92,255,0.5))' }} />
                </div>
                <span className="font-mono text-center truncate" style={{ fontSize: 8, letterSpacing: '0.08em', color: 'var(--text-secondary)', maxWidth: 64 }}>{app!.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      {!searchQuery && (
        <div
          className="flex items-center gap-0 mt-7 overflow-x-auto max-w-[90vw]"
          style={{ animation: 'searchSlideDown 300ms ease 250ms both' }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-mono whitespace-nowrap transition-colors relative"
              style={{
                padding: '6px 14px',
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                borderBottom: activeCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* App grid */}
      <div
        className="mt-7 w-[760px] max-w-[90vw] overflow-y-auto custom-scrollbar"
        style={{
          maxHeight: 'calc(100vh - 250px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
          gap: 16,
          animation: 'gridAppear 300ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both',
        }}
      >
        {filteredApps.map((app, index) => (
          <button
            key={app.id}
            onClick={() => handleLaunch(app.id)}
            className="flex flex-col items-center gap-2 p-2.5 group transition-all"
            style={{
              borderRadius: 12,
              animation: `iconPop 250ms cubic-bezier(0.34, 1.56, 0.64, 1) ${200 + index * 15}ms both`,
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(107,70,223,0.12)';
              e.currentTarget.style.borderColor = 'var(--border-glow)';
              e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(107,70,223,0.18), rgba(4,3,11,0.4))',
                border: '1px solid var(--border-default)',
              }}
            >
              <DynamicIcon name={app.icon} size={28} style={{ color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 10px rgba(128,92,255,0.55))' }} />
            </div>
            <span className="font-mono text-center truncate" style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-primary)', maxWidth: 76 }}>
              {app.name}
            </span>
          </button>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <Search size={44} className="mb-4 opacity-30" />
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em' }}>NO SIGNAL FOUND</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes launcherFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes searchSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridAppear {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes iconPop {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
});

export default AppLauncher;
