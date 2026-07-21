// ============================================================
// WindowFrame — Draggable, resizable window chrome
// ============================================================

import { useCallback, useRef, useState, memo, useEffect } from 'react';
import type { Window } from '@/types';
import { useOS } from '@/hooks/useOSStore';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const TOP_PANEL_HEIGHT = 30;
const RESIZE_HANDLE = 8;
const MIN_W = 320;
const MIN_H = 200;

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Icons.HelpCircle {...props} />;
};

interface WindowFrameProps {
  window: Window;
  children: React.ReactNode;
}

const WindowFrame = memo(function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { dispatch } = useOS();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ isResizing: boolean; edge: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isMaximized = win.state === 'maximized';
  const isMinimized = win.state === 'minimized';
  const isFocused = win.isFocused;

  const focusThis = useCallback(() => {
    if (!win.isFocused && win.state !== 'minimized') {
      dispatch({ type: 'FOCUS_WINDOW', windowId: win.id });
    }
  }, [dispatch, win.id, win.isFocused, win.state]);

  const handleMouseDown = useCallback(() => {
    focusThis();
  }, [focusThis]);

  // ---- Drag ----
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized || e.target !== e.currentTarget) return;
      e.preventDefault();
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.position.x,
        origY: win.position.y,
      };
      setIsDragging(true);
    },
    [isMaximized, win.position.x, win.position.y]
  );

  // ---- Resize ----
  const getEdge = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let edge = '';
    if (y < RESIZE_HANDLE) edge += 'n';
    if (y > rect.height - RESIZE_HANDLE) edge += 's';
    if (x < RESIZE_HANDLE) edge += 'w';
    if (x > rect.width - RESIZE_HANDLE) edge += 'e';
    return edge;
  }, []);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMaximized) return;
      const edge = getEdge(e);
      if (!edge) return;
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        isResizing: true,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origW: win.size.width,
        origH: win.size.height,
        origX: win.position.x,
        origY: win.position.y,
      };
      setIsResizing(true);
    },
    [isMaximized, getEdge, win.size, win.position]
  );

  const getCursor = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return 'default';
    const edge = getEdge(e);
    const cursors: Record<string, string> = {
      n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
      nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    };
    return cursors[edge] || 'default';
  }, [isMaximized, getEdge]);

  // ---- Global mouse events for drag/resize ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current?.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        let nx = dragRef.current.origX + dx;
        let ny = dragRef.current.origY + dy;
        const vw = window.innerWidth;
        ny = Math.max(TOP_PANEL_HEIGHT, ny);
        nx = Math.min(Math.max(nx, -(win.size.width - 100)), vw - 100);
        dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: nx, y: ny } });
      }
      if (resizeRef.current?.isResizing) {
        const { edge, startX, startY, origW, origH, origX, origY } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let nx = origX, ny = origY, nw = origW, nh = origH;
        if (edge.includes('e')) nw = Math.max(MIN_W, origW + dx);
        if (edge.includes('s')) nh = Math.max(MIN_H, origH + dy);
        if (edge.includes('w')) {
          nw = Math.max(MIN_W, origW - dx);
          nx = origX + (origW - nw);
        }
        if (edge.includes('n')) {
          nh = Math.max(MIN_H, origH - dy);
          ny = origY + (origH - nh);
          ny = Math.max(TOP_PANEL_HEIGHT, ny);
        }
        dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: nx, y: ny } });
        dispatch({ type: 'RESIZE_WINDOW', windowId: win.id, size: { width: nw, height: nh } });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      setIsDragging(false);
      setIsResizing(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dispatch, win.id, win.size.width, win.size.height]);

  const handleMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'MINIMIZE_WINDOW', windowId: win.id });
    },
    [dispatch, win.id]
  );

  const handleMaximize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMaximized) {
        dispatch({ type: 'RESTORE_WINDOW', windowId: win.id });
      } else {
        dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id, viewport: { width: window.innerWidth, height: window.innerHeight } });
      }
    },
    [dispatch, win.id, isMaximized]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'CLOSE_WINDOW', windowId: win.id });
    },
    [dispatch, win.id]
  );

  const handleDoubleClickTitle = useCallback(() => {
    if (isMaximized) {
      dispatch({ type: 'RESTORE_WINDOW', windowId: win.id });
    } else {
      dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id, viewport: { width: window.innerWidth, height: window.innerHeight } });
    }
  }, [dispatch, win.id, isMaximized]);

  if (isMinimized) return null;

  return (
    <div
      ref={frameRef}
      className="absolute flex flex-col select-none"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        borderRadius: isMaximized ? 0 : 10,
        border: `1px solid ${isFocused ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
        boxShadow: isFocused
          ? '0 16px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(128,92,255,0.18), inset 0 0 0 1px rgba(128,92,255,0.04)'
          : '0 6px 20px rgba(0,0,0,0.5)',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 180ms ease, border-color 180ms ease',
        overflow: 'hidden',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handles wrapper — transparent overlay; only the edge strips
          capture pointer events so the window body stays interactive. */}
      <div
        className="absolute inset-0 z-50"
        style={{
          cursor: getCursor as unknown as string,
          pointerEvents: 'none',
        }}
        onMouseDown={handleResizeMouseDown}
      >
        <div style={{ position: 'absolute', top: 0, left: RESIZE_HANDLE, right: RESIZE_HANDLE, height: RESIZE_HANDLE, cursor: 'n-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', bottom: 0, left: RESIZE_HANDLE, right: RESIZE_HANDLE, height: RESIZE_HANDLE, cursor: 's-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', left: 0, top: RESIZE_HANDLE, bottom: RESIZE_HANDLE, width: RESIZE_HANDLE, cursor: 'w-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', right: 0, top: RESIZE_HANDLE, bottom: RESIZE_HANDLE, width: RESIZE_HANDLE, cursor: 'e-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'nw-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'ne-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'sw-resize', pointerEvents: 'auto' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'se-resize', pointerEvents: 'auto' }} />
      </div>

      {/* Title bar */}
      <div
        className="relative z-10 flex items-center justify-between shrink-0"
        style={{
          height: 34,
          background: isFocused
            ? 'linear-gradient(180deg, rgba(20,14,38,0.95), rgba(10,7,19,0.95))'
            : 'rgba(8,5,16,0.95)',
          borderBottom: `1px solid ${isFocused ? 'var(--border-default)' : 'var(--border-subtle)'}`,
          borderRadius: isMaximized ? 0 : '10px 10px 0 0',
          transition: 'background 150ms ease, border-color 150ms ease',
          cursor: isMaximized ? 'default' : 'grab',
        }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleDoubleClickTitle}
      >
        {/* scanline accent */}
        <div
          className="absolute inset-0 overlay-scanlines pointer-events-none"
          style={{ opacity: 0.25, borderRadius: isMaximized ? 0 : '10px 10px 0 0' }}
        />

        {/* Left: icon + title */}
        <div className="flex items-center gap-2 px-3 overflow-hidden relative z-10">
          <span className="font-mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}>
            ◈
          </span>
          <DynamicIcon
            name={win.icon}
            size={13}
            style={{
              color: isFocused ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              filter: isFocused ? 'drop-shadow(0 0 6px rgba(128,92,255,0.6))' : 'none',
            }}
          />
          <span
            className="font-mono truncate"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isFocused ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'color 150ms ease',
            }}
          >
            {win.title}
          </span>
        </div>

        {/* Right: window controls */}
        <div className="flex items-center shrink-0 relative z-10">
          <button
            onClick={handleMinimize}
            className="flex items-center justify-center transition-colors"
            style={{ width: 36, height: 34, color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(147,116,255,0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
            title="Minimize"
          >
            <Icons.Minus size={12} />
          </button>
          <button
            onClick={handleMaximize}
            className="flex items-center justify-center transition-colors"
            style={{ width: 36, height: 34, color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(147,116,255,0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Icons.Copy size={11} /> : <Icons.Square size={11} />}
          </button>
          <button
            onClick={handleClose}
            className="flex items-center justify-center transition-colors"
            style={{ width: 36, height: 34, color: 'var(--text-tertiary)', borderRadius: isMaximized ? 0 : '0 10px 0 0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-crimson)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255,49,91,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Close"
          >
            <Icons.X size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="relative z-10 flex-1 overflow-hidden"
        style={{
          background: 'var(--bg-window)',
          borderRadius: isMaximized ? 0 : '0 0 10px 10px',
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default WindowFrame;
