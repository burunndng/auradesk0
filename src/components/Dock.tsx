// ============================================================
// Dock — Bottom dock with pinned apps, open indicators, trash
// ============================================================

import { useCallback, memo, useState, useEffect, useRef } from 'react';
import { useOS } from '@/hooks/useOSStore';
import { getAppById } from '@/apps/registry';
import { LayoutGrid, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : null;
};

const Dock = memo(function Dock() {
  const { state, dispatch } = useOS();
  const { dockItems } = state;
  const [bouncingItems, setBouncingItems] = useState<Set<string>>(new Set());
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [, setTooltipPos] = useState({ x: 0, y: 0 });
  const bounceDispatchedRef = useRef<Set<string>>(new Set());

  // Bounce animation: when a dock item is flagged bounce:true in the store,
  // start its local animation and clear the flag so the effect doesn't loop.
  useEffect(() => {
    const bouncing = dockItems
      .filter((d) => d.bounce && !bounceDispatchedRef.current.has(d.appId))
      .map((d) => d.appId);
    if (bouncing.length === 0) return;
    bouncing.forEach((id) => bounceDispatchedRef.current.add(id));
    setBouncingItems((prev) => {
      const next = new Set(prev);
      bouncing.forEach((id) => next.add(id));
      return next;
    });
    bouncing.forEach((id) => dispatch({ type: 'BOUNCE_DOCK_ITEM', appId: id }));
    const timer = setTimeout(() => {
      setBouncingItems(new Set());
      bouncing.forEach((id) => bounceDispatchedRef.current.delete(id));
    }, 400);
    return () => clearTimeout(timer);
  }, [dockItems, dispatch]);

  const handleAppClick = useCallback(
    (appId: string) => {
      const hasOpenWindow = state.windows.some((w) => w.appId === appId && w.state !== 'minimized');
      if (hasOpenWindow) {
        // Focus existing window
        const win = state.windows.find((w) => w.appId === appId && w.state !== 'minimized');
        if (win) dispatch({ type: 'FOCUS_WINDOW', windowId: win.id });
      } else {
        dispatch({ type: 'OPEN_WINDOW', appId, viewport: { width: window.innerWidth, height: window.innerHeight } });
      }
    },
    [dispatch, state.windows]
  );

  const handleShowApps = useCallback(() => {
    dispatch({ type: 'TOGGLE_APP_LAUNCHER' });
  }, [dispatch]);

  const handleTrashClick = useCallback(() => {
    dispatch({ type: 'OPEN_WINDOW', appId: 'auraos', viewport: { width: window.innerWidth, height: window.innerHeight } });
  }, [dispatch]);

  const pinnedItems = dockItems.filter((d) => d.isPinned);
  const openUnpinned = dockItems.filter((d) => !d.isPinned && d.isOpen);

  const renderDockIcon = (appId: string, isTrash = false) => {
    const item = dockItems.find((d) => d.appId === appId);
    if (!item && !isTrash) return null;

    const app = getAppById(appId);
    const isBouncing = bouncingItems.has(appId);
    const isHovered = hoveredApp === appId;
    const isOpen = item?.isOpen || false;
    const isFocused = item?.isFocused || false;

    return (
      <div
        key={appId}
        className="relative flex flex-col items-center"
        onMouseEnter={(e) => {
          setHoveredApp(appId);
          setTooltipPos({ x: e.currentTarget.offsetLeft, y: 0 });
        }}
        onMouseLeave={() => setHoveredApp(null)}
      >
        {/* Tooltip */}
        {isHovered && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 whitespace-nowrap z-[4000] font-mono"
            style={{
              background: 'var(--bg-tooltip)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              animation: 'tooltipAppear 100ms ease',
            }}
          >
            {isTrash ? 'Recycle' : app?.name || appId}
          </div>
        )}

        {/* Icon */}
        <button
          onClick={() => isTrash ? handleTrashClick() : handleAppClick(appId)}
          className="flex items-center justify-center transition-all"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: isHovered ? 'rgba(107,70,223,0.14)' : 'transparent',
            border: `1px solid ${isHovered ? 'var(--border-glow)' : 'transparent'}`,
            boxShadow: isHovered ? 'inset 0 0 18px rgba(112,71,255,0.18), 0 0 14px rgba(102,61,244,0.16)' : 'none',
            transform: isBouncing ? 'translateY(-6px)' : 'scale(1)',
            transition: isBouncing ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'all 150ms ease',
            opacity: isTrash ? 0.65 : isOpen ? 1 : 0.78,
          }}
        >
          {isTrash ? (
            <Trash2 size={20} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <DynamicIcon
              name={app?.icon || 'HelpCircle'}
              size={20}
              style={{
                color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                filter: isOpen ? 'drop-shadow(0 0 6px rgba(128,92,255,0.6))' : 'none',
              }}
            />
          )}
        </button>

        {/* Active indicator */}
        {isOpen && (
          <div
            className="absolute -bottom-0.5"
            style={{
              width: isFocused ? 14 : 6,
              height: 2,
              borderRadius: 2,
              background: isFocused ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
              boxShadow: isFocused ? '0 0 8px var(--accent-cyan)' : 'none',
              transition: 'width 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-0.5 px-2"
      style={{
        height: 50,
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '14px 14px 0 0',
        border: '1px solid var(--border-subtle)',
        borderBottom: 'none',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        animation: 'dockSlideUp 300ms cubic-bezier(0, 0, 0.2, 1)',
      }}
    >
      {/* Show Applications button */}
      <button
        onClick={handleShowApps}
        className="flex items-center justify-center transition-all"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: state.appLauncherOpen ? 'rgba(107,70,223,0.18)' : 'transparent',
          border: `1px solid ${state.appLauncherOpen ? 'var(--border-glow)' : 'transparent'}`,
          color: state.appLauncherOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
        }}
      >
        <LayoutGrid size={19} />
      </button>

      {/* Separator */}
      <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 24 }} />

      {/* Pinned apps */}
      {pinnedItems.map((item) => renderDockIcon(item.appId))}

      {/* Separator (if there are open unpinned apps) */}
      {openUnpinned.length > 0 && (
        <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 24 }} />
      )}

      {/* Open unpinned apps */}
      {openUnpinned.map((item) => renderDockIcon(item.appId))}

      {/* Separator */}
      <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 24 }} />

      {/* Trash */}
      {renderDockIcon('trash', true)}

      <style>{`
        @keyframes dockSlideUp {
          from { transform: translateX(-50%) translateY(48px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes tooltipAppear {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotAppear {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
});

export default Dock;
