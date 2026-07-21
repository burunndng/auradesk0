// ============================================================
// Desktop — Wallpaper + draggable desktop icons + context menu
// ============================================================

import { useCallback, memo, useState, useRef } from 'react';
import { useOS } from '@/hooks/useOSStore';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Icons.HelpCircle {...props} />;
};

const GRID_X = 80;
const GRID_Y = 90;

const Desktop = memo(function Desktop() {
  const { state, dispatch } = useOS();
  const { desktopIcons, theme } = state;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleIconDoubleClick = useCallback(
    (icon: typeof desktopIcons[0]) => {
      if (icon.appId) {
        dispatch({ type: 'OPEN_WINDOW', appId: icon.appId, viewport: { width: window.innerWidth, height: window.innerHeight } });
      }
    },
    [dispatch]
  );

  const handleIconMouseDown = useCallback(
    (e: React.MouseEvent, icon: typeof desktopIcons[0]) => {
      e.stopPropagation();
      dispatch({ type: 'SELECT_DESKTOP_ICON', id: icon.id });
      if (icon.appId) {
        setDraggingId(icon.id);
        setDragOffset({ x: e.clientX, y: e.clientY });
      }
    },
    [dispatch]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId) return;
      const dx = e.clientX - dragOffset.x;
      const dy = e.clientY - dragOffset.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

      const icon = desktopIcons.find((i) => i.id === draggingId);
      if (!icon) return;

      const nx = Math.round((icon.position.x + dx) / GRID_X) * GRID_X + 16;
      const ny = Math.round((icon.position.y + dy) / GRID_Y) * GRID_Y + 16;

      dispatch({
        type: 'UPDATE_DESKTOP_ICON_POSITION',
        id: draggingId,
        position: { x: Math.max(16, nx), y: Math.max(16, ny) },
      });
      setDragOffset({ x: e.clientX, y: e.clientY });
    },
    [draggingId, dragOffset, desktopIcons, dispatch]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
    },
    []
  );

  return (
    <div
      ref={desktopRef}
      className="fixed inset-0 z-10"
      style={{
        top: 30,
        bottom: 50,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => dispatch({ type: 'SELECT_DESKTOP_ICON', id: null })}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute flex flex-col items-center gap-1.5 cursor-pointer group"
          style={{
            left: icon.position.x,
            top: icon.position.y,
            width: 68,
            opacity: draggingId === icon.id ? 0.5 : 1,
            animation: 'iconAppear 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onMouseDown={(e) => handleIconMouseDown(e, icon)}
          onContextMenu={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div
            className="flex items-center justify-center transition-all"
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: icon.isSelected
                ? 'rgba(128,92,255,0.22)'
                : 'rgba(107,70,223,0.06)',
              border: icon.isSelected
                ? '1px solid var(--border-glow)'
                : '1px solid var(--border-subtle)',
              boxShadow: icon.isSelected
                ? 'inset 0 0 20px rgba(112,71,255,0.25), 0 0 18px rgba(128,92,255,0.3)'
                : 'none',
            }}
          >
            <DynamicIcon
              name={icon.icon}
              size={26}
              style={{
                color: icon.isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(128,92,255,0.4))',
              }}
            />
          </div>
          <span
            className="font-mono text-center px-1.5 py-0.5 truncate leading-tight"
            style={{
              fontSize: 9,
              letterSpacing: '0.1em',
              maxWidth: 76,
              color: '#E8E4FF',
              textShadow: '0 1px 4px rgba(0,0,0,0.95)',
              background: icon.isSelected ? 'rgba(128,92,255,0.30)' : 'transparent',
              borderRadius: 3,
            }}
          >
            {icon.name}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes iconAppear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});

export default Desktop;
