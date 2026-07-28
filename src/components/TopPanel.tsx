import { useState, useEffect, useCallback, memo, useRef } from "react";
import { format } from "date-fns";
import { Power } from "lucide-react";
import { useOS } from "@/hooks/useOSStore";
import { GlyphSmall } from "@/components/Scarab";
import { gsap, useGSAP, EASE, DUR, prefersReducedMotion } from "@/lib/gsap";

const TopPanel = memo(function TopPanel() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState(new Date());
  const [sysMenuOpen, setSysMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from(panelRef.current, {
        y: -44,
        autoAlpha: 0,
        duration: DUR.slow,
        ease: EASE.decelerate,
        delay: 0.1,
      });
    },
    { scope: panelRef }
  );

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sysMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSysMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sysMenuOpen]);

  const handleActivities = useCallback(() => {
    dispatch({ type: "TOGGLE_APP_LAUNCHER" });
  }, [dispatch]);

  const clock = format(time, "HH:mm");

  return (
    <div
      ref={panelRef}
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between select-none"
      style={{
        height: 44,
        padding: "0 22px",
        background: "linear-gradient(180deg, rgba(15,11,7,0.85), rgba(15,11,7,0.2))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border-default)",
        color: "var(--gold)",
      }}
    >
      {/* Left: glyph + name + menu */}
      <div className="flex items-center" style={{ gap: 16 }}>
        <GlyphSmall size={22} />
        <span
          className="font-display"
          style={{ letterSpacing: "0.35em", fontSize: "0.85rem", color: "var(--gold-bright)" }}
        >
          SERK3TOS
        </span>
        <div className="flex" style={{ gap: 22 }}>
          {["Sanctum"].map((m) => (
            <span
              key={m}
              onClick={handleActivities}
              className="font-mono"
              style={{
                fontSize: "0.74rem",
                letterSpacing: "0.22em",
                color: "var(--gold-dim)",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold-bright)";
                e.currentTarget.style.textShadow = "0 0 10px var(--gold-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--gold-dim)";
                e.currentTarget.style.textShadow = "none";
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Right: stats + clock */}
      <div
        className="flex items-center font-mono"
        style={{ gap: 18, fontSize: "0.76rem", letterSpacing: "0.2em" }}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="status-dot" />
          PHASE III
        </div>
        <div className="stat hide-m" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          ⚡ 88%
        </div>
        <div className="stat hide-m">◈ RESONANT</div>
        <div
          id="clock"
          style={{ color: "var(--gold-bright)", fontVariantNumeric: "tabular-nums" }}
        >
          {clock}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setSysMenuOpen(!sysMenuOpen)}
            className="hover:bg-[var(--bg-hover)] transition-colors"
            style={{ padding: 5, borderRadius: 4, color: "var(--gold-dim)" }}
            title="Codex"
          >
            <Power size={14} />
          </button>

          {sysMenuOpen && (
            <div
              className="absolute top-full right-0 mt-1 py-1 z-[5000] surface-glass"
              style={{
                borderRadius: 12,
                boxShadow: "var(--shadow-lg)",
                width: 244,
              }}
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
                    boxShadow: "var(--glow-violet)",
                  }}
                >
                  <span className="font-display font-bold" style={{ fontSize: 12, color: "#1a120a" }}>
                    {(state.auth.userName[0] || "S").toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display truncate"
                    style={{ fontSize: 12, color: "var(--gold-bright)", letterSpacing: "0.1em" }}
                  >
                    {state.auth.userName}
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.16em",
                      color: "var(--gold-dim)",
                      textTransform: "uppercase",
                    }}
                  >
                    SEEKER-Ω · PHASE III
                  </div>
                </div>
              </div>

              <div className="hairline mx-2" />

              {[
                { label: "Veil Channel", on: true },
                { label: "Sacred Aura", on: true },
                { label: "Ambient Resonance", on: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <span
                    className="font-mono flex-1"
                    style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--gold)" }}
                  >
                    {item.label}
                  </span>
                  <div
                    style={{
                      width: 26,
                      height: 14,
                      borderRadius: 999,
                      background: item.on ? "var(--gold-dim)" : "rgba(216,178,106,0.12)",
                      position: "relative",
                      boxShadow: item.on ? "0 0 10px var(--gold-glow)" : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: item.on ? "var(--gold-bright)" : "var(--gold-dim)",
                        left: item.on ? 14 : 2,
                        transition: "left 150ms ease",
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="hairline mx-2" />

              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors font-mono"
                style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--gold)" }}
                onClick={() => {
                  setSysMenuOpen(false);
                  dispatch({ type: "LOGOUT" });
                }}
              >
                ◳ Seal the Veil
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors font-mono"
                style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--accent-crimson)" }}
                onClick={() => setSysMenuOpen(false)}
              >
                ⏻ Descent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TopPanel;
