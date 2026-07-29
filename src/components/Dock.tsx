// ============================================================
// Dock — Floating spatial-glass dock with pinned apps, open indicators, trash
// ============================================================

import { useCallback, memo, useState, useEffect, useRef } from "react";
import { useOS } from "@/hooks/useOSStore";
import { getAppById } from "@/apps/registry";
import { LayoutGrid, Trash2 } from "lucide-react";
import { AppIcon as DynamicIcon } from "@/components/AppIcon";
import { gsap, useGSAP, EASE, DUR, prefersReducedMotion } from "@/lib/gsap";

const Dock = memo(function Dock() {
  const { state, dispatch } = useOS();
  const { dockItems } = state;
  const [bouncingItems, setBouncingItems] = useState<Set<string>>(new Set());
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [, setTooltipPos] = useState({ x: 0, y: 0 });
  const bounceDispatchedRef = useRef<Set<string>>(new Set());
  const dockRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from(dockRef.current, {
        y: 60,
        autoAlpha: 0,
        duration: DUR.slow,
        ease: EASE.spring,
        delay: 0.2,
      });

      if (iconsRef.current) {
        const iconEls = iconsRef.current.querySelectorAll(":scope > div");
        gsap.from(iconEls, {
          y: 20,
          autoAlpha: 0,
          duration: DUR.normal,
          ease: EASE.springStrong,
          stagger: 0.05,
          delay: 0.4,
        });
      }
    },
    { scope: dockRef }
  );

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
    bouncing.forEach((id) => dispatch({ type: "BOUNCE_DOCK_ITEM", appId: id }));
    const timer = setTimeout(() => {
      setBouncingItems(new Set());
      bouncing.forEach((id) => bounceDispatchedRef.current.delete(id));
    }, 400);
    return () => clearTimeout(timer);
  }, [dockItems, dispatch]);

  const handleAppClick = useCallback(
    (appId: string) => {
      const hasOpenWindow = state.windows.some((w) => w.appId === appId && w.state !== "minimized");
      if (hasOpenWindow) {
        const win = state.windows.find((w) => w.appId === appId && w.state !== "minimized");
        if (win) dispatch({ type: "FOCUS_WINDOW", windowId: win.id });
      } else {
        dispatch({ type: "OPEN_WINDOW", appId, viewport: { width: window.innerWidth, height: window.innerHeight } });
      }
    },
    [dispatch, state.windows]
  );

  const handleShowApps = useCallback(() => {
    dispatch({ type: "TOGGLE_APP_LAUNCHER" });
  }, [dispatch]);

  const handleTrashClick = useCallback(() => {
    dispatch({ type: "OPEN_WINDOW", appId: "auraos", viewport: { width: window.innerWidth, height: window.innerHeight } });
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
        {/* Tooltip — glass pill */}
        {isHovered && (
          <div
            className="absolute bottom-full mb-2.5 whitespace-nowrap z-[4000] font-mono pointer-events-none"
            style={{
              padding: "3px 10px",
              background: "var(--bg-tooltip)",
              color: "var(--lapis-dim)",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {isTrash ? "Recycle" : app?.name || appId}
          </div>
        )}

        {/* Icon */}
        <button
          onClick={() => (isTrash ? handleTrashClick() : handleAppClick(appId))}
          className="flex items-center justify-center"
          style={{
            width: 42,
            height: 42,
            borderRadius: "var(--radius-md)",
            background: isHovered ? "var(--bg-hover)" : "transparent",
            border: `1px solid ${isHovered ? "var(--border-strong)" : "transparent"}`,
            boxShadow: isHovered
              ? "inset 0 0 16px rgba(127,161,255,0.18), var(--glow-lapis), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "inset 0 1px 0 rgba(255,255,255,0.03)",
            transform: isBouncing
              ? "translateY(-8px)"
              : isHovered
                ? "scale(1.16)"
                : "scale(1)",
            transition: isBouncing
              ? "transform 400ms var(--ease-spring)"
              : "transform var(--duration-normal) var(--ease-spring), background var(--duration-fast) var(--ease-default), box-shadow var(--duration-normal) var(--ease-default), border-color var(--duration-fast) var(--ease-default)",
            opacity: isTrash ? 0.7 : isOpen ? 1 : 0.82,
          }}
        >
          {isTrash ? (
            <Trash2
              size={20}
              style={{
                color: isHovered ? "var(--lapis-bright)" : "var(--text-secondary)",
                transition: "color var(--duration-fast) var(--ease-default)",
              }}
            />
          ) : (
            <DynamicIcon
              name={app?.icon || "HelpCircle"}
              size={20}
              style={{
                color: isHovered ? "var(--lapis-bright)" : "var(--text-secondary)",
                filter: isOpen ? "drop-shadow(0 0 6px var(--lapis-glow))" : "none",
                transition: "color var(--duration-fast) var(--ease-default)",
              }}
            />
          )}
        </button>

        {/* Active / running indicator — precious gilt */}
        {isOpen && (
          <div
            className="absolute"
            style={{
              bottom: -3,
              width: isFocused ? 16 : 5,
              height: isFocused ? 3 : 5,
              borderRadius: "var(--radius-full)",
              background: isFocused ? "var(--gilt-bright)" : "var(--gilt)",
              boxShadow: isFocused ? "var(--glow-gilt)" : "0 0 6px var(--gilt-glow)",
              transition: "width var(--duration-normal) var(--ease-spring), height var(--duration-normal) var(--ease-spring)",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={dockRef}
      className="fixed left-1/2 -translate-x-1/2 z-[150] flex items-center gap-0.5 px-2.5"
      style={{
        bottom: 14,
        height: 56,
        background: "var(--bg-panel)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-default)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), var(--shadow-lg)",
      }}
    >
      {/* Show Applications button */}
      <button
        onClick={handleShowApps}
        className="flex items-center justify-center"
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--radius-md)",
          background: state.appLauncherOpen ? "var(--bg-active)" : "transparent",
          border: `1px solid ${state.appLauncherOpen ? "var(--border-strong)" : "transparent"}`,
          color: state.appLauncherOpen ? "var(--lapis-bright)" : "var(--text-secondary)",
          boxShadow: state.appLauncherOpen ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
          transition: "background var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default)",
        }}
      >
        <LayoutGrid size={19} />
      </button>

      {/* Separator */}
      <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 26 }} />

      {/* Pinned apps */}
      <div ref={iconsRef} className="flex items-center gap-0.5">
        {pinnedItems.map((item) => renderDockIcon(item.appId))}
      </div>

      {/* Separator (if there are open unpinned apps) */}
      {openUnpinned.length > 0 && (
        <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 26 }} />
      )}

      {/* Open unpinned apps */}
      {openUnpinned.map((item) => renderDockIcon(item.appId))}

      {/* Separator */}
      <div className="mx-1 shrink-0 hairline" style={{ width: 1, height: 26 }} />

      {/* Trash */}
      {renderDockIcon("trash", true)}
    </div>
  );
});

export default Dock;
