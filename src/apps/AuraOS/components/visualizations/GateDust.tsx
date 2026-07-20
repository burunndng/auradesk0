import React, { useEffect, useRef } from 'react';
// Side-effect import: registers the unsafe-eval renderer, avoiding CSP eval block
import 'pixi.js/unsafe-eval';
import { Application, Graphics, Container } from 'pixi.js';

// ── Gold palette (matches GateScreen constants) ─────────────────────────────
const GOLD_MID   = 0xDCC382; // rgba(220,195,130)
const GOLD_LIGHT = 0xF0E1A5; // rgba(240,225,165)

// ── Dust physics constants ──────────────────────────────────────────────────
const IMPULSE_FORCE = 0.008;              // one-time radial burst on dissolution
const REPULSION_FORCE = 0.00002;          // continuous outward push during dissolution
const GRAVITATIONAL_FORCE = 0.00004;      // gentle inward pull during idle

interface Mote {
  gfx: Graphics;
  vx: number;
  vy: number;
}

export default function GateDust({ phase }: { phase?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  const prevPhaseRef = useRef(phase);
  const motesRef = useRef<Mote[]>([]);

  // Keep phase accessible in ticker closure
  phaseRef.current = phase;

  // Detect phase transition to 'granted' for one-time impulse
  useEffect(() => {
    if (phase === 'granted' && prevPhaseRef.current !== 'granted') {
      // Explosive radial repulsion impulse
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      for (const m of motesRef.current) {
        const dx = m.gfx.x - centerX;
        const dy = m.gfx.y - centerY;
        m.vx += dx * IMPULSE_FORCE;
        m.vy += dy * IMPULSE_FORCE;
      }
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    if (reducedMotion) return;

    const mount = mountRef.current;
    if (!mount) return;

    const count = isMobile ? 150 : 300;
    let app: Application | null = null;
    let destroyed = false;
    let initDone = false;

    const init = async () => {
      const instance = new Application();
      app = instance;

      await instance.init({
        backgroundAlpha: 0,          // transparent — gate-root dark bg shows through
        resizeTo: window,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });

      initDone = true;

      // If component unmounted during async init, destroy now that init is complete
      if (destroyed) {
        instance.destroy(true, { children: true });
        return;
      }

      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      mount.appendChild(canvas);

      // ── Build motes ──────────────────────────────────────────────────────
      const stage = new Container();
      app.stage.addChild(stage);

      const motes: Mote[] = [];

      for (let i = 0; i < count; i++) {
        const color  = Math.random() > 0.5 ? GOLD_LIGHT : GOLD_MID;
        const alpha  = 0.06 + Math.random() * 0.08;  // 0.06–0.14 — felt, not seen
        const radius = 0.8 + Math.random() * 1.4;    // 0.8–2.2 px

        const gfx = new Graphics();
        gfx.circle(0, 0, radius).fill({ color, alpha: 1 });
        gfx.x     = Math.random() * window.innerWidth;
        gfx.y     = Math.random() * window.innerHeight;
        gfx.alpha = alpha;

        stage.addChild(gfx);
        motes.push({
          gfx,
          // Brownian drift: ±0.08–0.3 px/frame per spec
          vx: (Math.random() - 0.5) * 0.44,
          vy: (Math.random() - 0.5) * 0.44,
        });
      }

      motesRef.current = motes;

      // ── Tick: drift + edge-wrap + phase-aware forces ───────────────────
      app.ticker.add(() => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const centerX = W / 2;
        const centerY = H / 2;
        const currentPhase = phaseRef.current;

        for (const m of motes) {
          // Phase-aware gravitational/repulsive forces
          if (currentPhase === 'granted') {
            // Slight outward push continues after initial impulse
            const dx = m.gfx.x - centerX;
            const dy = m.gfx.y - centerY;
            m.vx += dx * REPULSION_FORCE;
            m.vy += dy * REPULSION_FORCE;
          } else {
            // Default: weak gravitational attraction toward center
            m.vx += (centerX - m.gfx.x) * GRAVITATIONAL_FORCE;
            m.vy += (centerY - m.gfx.y) * GRAVITATIONAL_FORCE;
          }

          m.gfx.x += m.vx;
          m.gfx.y += m.vy;
          if (m.gfx.x < -2)     m.gfx.x = W + 2;
          if (m.gfx.x > W + 2)  m.gfx.x = -2;
          if (m.gfx.y < -2)     m.gfx.y = H + 2;
          if (m.gfx.y > H + 2)  m.gfx.y = -2;
        }
      });
    };

    init();

    return () => {
      destroyed = true;
      // Only destroy if init completed — if still pending, the destroyed flag
      // above causes the init callback to call destroy once it's safe to do so.
      if (app && initDone) {
        try { app.destroy(true, { children: true }); } catch { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,        // behind octagram canvas (z-index: 1), in front of R3F (z-index: -1 fixed)
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
