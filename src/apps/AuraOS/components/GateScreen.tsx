import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import AethonGatewayIcon from './visualizations/SacredGeometryIcons/AethonGatewayIcon';

const GateSeedOfLife3D = lazy(() => import('./visualizations/GateSeedOfLife3D'));
const GateDust = lazy(() => import('./visualizations/GateDust'));
const GateMerkaba = lazy(() => import('./visualizations/GateMerkaba'));

// ── Configuration ──────────────────────────────────────────────────────────
const CORRECT_CODE = 'enter';
const AMBIENT_TRACK = 'https://files.catbox.moe/6sliv3.mp3';
const FADE_INITIAL_VOLUME = 0.35;
const FADE_DURATION_MS = 800;
const FADE_INTERVAL_MS = 40;
const FADE_STEP = FADE_INITIAL_VOLUME / (FADE_DURATION_MS / FADE_INTERVAL_MS);

const DRAW_FRAMES = 300;      // ~5s at 60fps — slower, more ceremonial draw
const HOLD_FRAMES = 30;       // ~0.5s pause before rays spawn
const DISSOLVE_FRAMES = 240;  // ~4s at 60fps — sacred geometry dissolution
const INHALE_FRAMES = 24;     // ~0.4s contraction before dissolution burst
const PARALLAX_PX = 8;        // max mouse-parallax offset in pixels
const IDLE_THROTTLE = 1;      // render every frame for smooth shimmer (was 3)
const OCTAGRAM_SCALE = 0.16;  // radius as fraction of min(W,H)
const OCTAGRAM_Y_OFFSET = 0.44; // vertical center as fraction of height
const RAYS_PER_VERTEX = 4;
const RAYS_FROM_CENTER = 10;
const RAY_SPREAD = 1.3;       // radians of angular spread per vertex ray

// ── Golden ratio constants ───────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;       // 1.618033…
const PHI_INV = 1 / PHI;                  // 0.618033…
const TAU = Math.PI * 2;

// ── Dissolution ceremony tuning ──────────────────────────────────────────────
const BURST_END = 0.6;                    // eased progress where burst phase ends
const SPIRAL_TURNS = 2.4;                 // radians of spiral rotation (~1.3 full turns)
const BURST_DRIFT_SCALE = 1.2;            // drift distance as multiple of r
const SHOCKWAVE_INNER_EXPANSION = 2.5;    // inner circle expansion factor
const SHOCKWAVE_OUTER_EXPANSION = 3.0;    // outer circle expansion factor
const AFTERIMAGE_START = 0.45;            // fade progress for afterimage flash
const AFTERIMAGE_END = 0.55;              // fade progress for afterimage flash end

// ── Idle animation tuning ────────────────────────────────────────────────────
const IDLE_TIME_FACTOR = 0.012;           // frame-to-time multiplier for shimmer

// ── Canonical Gold Palette (Tier 1: structural) ────────────────────────────
const GOLD = {
  DARK: { r: 210, g: 185, b: 115 },    // structure, shadows
  MID: { r: 220, g: 195, b: 130 },     // primary strokes, glows
  LIGHT: { r: 240, g: 225, b: 165 },   // active edges, highlights
  WHITE: { r: 255, g: 248, b: 220 },   // glint, peak luminance
};

// Pitch black void background
const DARK_BG = { r: 2, g: 2, b: 2 };
const DARK_VIGNETTE_BASE = { r: 1, g: 1, b: 1 };

// Deny tone base frequency (Tier 3: technical)
const DENY_TONE_START_HZ = 240; // raised from 160 for audibility

// Easing for organic octagram drawing — fast start, gentle end
const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;

// ── Types ──────────────────────────────────────────────────────────────────
interface GateScreenProps {
  onAccessGranted: () => void;
}

type Phase = 'animating' | 'input' | 'strobing' | 'granted';

// ── Component ──────────────────────────────────────────────────────────────
export default function GateScreen({ onAccessGranted }: GateScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const transitionedRef = useRef(false);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const frameControl = useRef({ frame: 0, skip: false });
  const dimRef = useRef({ pulse: 1.0, scale: 1.0 }); // Tier 2: interpolated dimming
  const errorFlashRef = useRef({ active: false, frame: 0 }); // Tier 1: error feedback
  const dissolveRef = useRef({ active: false, frame: 0 }); // dissolution phase counter

  const [phase, setPhase] = useState<Phase>('animating');
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);

  // Keep phase accessible in animation closure
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── Reduced motion: skip straight to input ──────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frameControl.current.skip = true;
      setPhase('input');
    }
  }, []);

  // ── Mouse + touch tracking for parallax (lerped for smoothness) ─────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouse.current.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = (touch.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // ── Audio: create on mount, autoplay with gesture fallback ──────────────
  useEffect(() => {
    const audio = new Audio(AMBIENT_TRACK);
    audio.loop = true;
    audio.volume = FADE_INITIAL_VOLUME;
    audioRef.current = audio;

    let started = false;

    const removeGesture = () => {
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };

    const tryPlay = () => {
      if (started) return;
      audio.play().then(() => {
        started = true;
        removeGesture();
      }).catch(() => {});
    };

    const onGesture = () => tryPlay();

    tryPlay();

    document.addEventListener('touchstart', onGesture, { passive: true });
    document.addEventListener('click', onGesture);
    document.addEventListener('keydown', onGesture);

    return () => {
      removeGesture();
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, []);

  // ── Audio fade-out when access granted ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'granted' || !audioRef.current) return;

    const audio = audioRef.current;
    const fadeOut = setInterval(() => {
      if (audio.volume > FADE_STEP) {
        audio.volume -= FADE_STEP;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOut);
      }
    }, FADE_INTERVAL_MS);

    return () => clearInterval(fadeOut);
  }, [phase]);

  // ── GSAP cinematic grant transition ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'granted') return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    // Kick off canvas-layer dissolution immediately
    dissolveRef.current = { active: true, frame: 0 };

    const tl = gsap.timeline();
    // Canvas fades out slowly after dissolution is well underway
    tl.to(canvas, { opacity: 0, duration: 2.0, ease: 'power1.inOut' }, 1.6)
      .to(root,   { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 2.8)
      .call(onAccessGranted, undefined, 3.8);

    return () => { tl.kill(); };
  }, [phase, onAccessGranted]);

  // ── Focus input when phase transitions to 'input' ──────────────────────
  useEffect(() => {
    if (phase === 'input') {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ── Cleanup pending timers and AudioContext on unmount ──────────────────
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // ── Error deny sound via Web Audio (reuses single context) ──────────────
  const playDenyTone = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ac = audioCtxRef.current;

      // Resume if suspended (required on mobile/Safari after tab switch)
      if (ac.state === 'suspended') {
        ac.resume();
      }

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      // Frequency sweep: ominous descent (raised for audibility on laptop speakers)
      osc.frequency.setValueAtTime(DENY_TONE_START_HZ, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.3);

      gain.gain.setValueAtTime(0.1, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);

      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.4);
    } catch {
      // Web Audio not available — silent fail
    }
  }, []);

  // ── Canvas animation ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let rafId: number;
    const dpr = window.devicePixelRatio || 1; // Full native resolution for crisp geometry

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();

    // ── Geometry helpers ──────────────────────────────────────
    type EdgeTier = 'star' | 'ring' | 'inner-ring' | 'spoke';
    interface RichEdge {
      a: number; b: number; tier: EdgeTier;
      width: number; alpha: number; blur: number;
      color: { r: number; g: number; b: number };
    }

    const octoPts = (cx: number, cy: number, r: number, rotOffset = 0) => {
      return Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i - Math.PI / 2 + rotOffset;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
    };

    // Inner ring vertices: r × φ⁻¹, offset by half-step (22.5°)
    const innerPts = (cx: number, cy: number, r: number, rotOffset = 0) => {
      return Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i - Math.PI / 2 + rotOffset + Math.PI / 8;
        return { x: cx + Math.cos(a) * r * PHI_INV, y: cy + Math.sin(a) * r * PHI_INV };
      });
    };

    // Merkaba: two interlocked equilateral triangles (same DNA as dashboard MerkabaIcon)
    // Ascending: vertex up; Descending: vertex down. Radius matches octagram r.
    const merkabaTriPts = (cx: number, cy: number, r: number, rotOffset = 0) => {
      const up   = Array.from({ length: 3 }, (_, i) => {
        const a = (TAU / 3) * i - Math.PI / 2 + rotOffset;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
      const down = Array.from({ length: 3 }, (_, i) => {
        const a = (TAU / 3) * i + Math.PI / 2 + rotOffset; // flipped
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
      return { up, down };
    };

    const drawMerkaba = (
      c: CanvasRenderingContext2D,
      cx: number, cy: number, r: number,
      alpha: number, rotOffset = 0
    ) => {
      const { up, down } = merkabaTriPts(cx, cy, r, rotOffset);
      const col = GOLD.DARK;
      c.save();
      c.lineWidth = 0.6;
      c.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
      c.shadowBlur = 8 * alpha;
      c.shadowColor = `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},${alpha * 0.4})`;
      // Ascending triangle
      c.beginPath();
      c.moveTo(up[0].x, up[0].y);
      c.lineTo(up[1].x, up[1].y);
      c.lineTo(up[2].x, up[2].y);
      c.closePath();
      c.stroke();
      // Descending triangle
      c.beginPath();
      c.moveTo(down[0].x, down[0].y);
      c.lineTo(down[1].x, down[1].y);
      c.lineTo(down[2].x, down[2].y);
      c.closePath();
      c.stroke();
      // Spin horizon ellipse (like MerkabaIcon)
      c.lineWidth = 0.4;
      c.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha * 0.5})`;
      c.shadowBlur = 0;
      c.beginPath();
      c.ellipse(cx, cy, r * 0.82, r * 0.22, rotOffset, 0, TAU);
      c.stroke();
      c.restore();
    };

    const buildEdges = (): RichEdge[] => {
      const e: RichEdge[] = [];
      // {8/3} star polygon — skip-3 connections
      for (let i = 0; i < 8; i++) e.push({ a: i, b: (i + 3) % 8, tier: 'star', width: 1.2, alpha: 1.0, blur: 10, color: GOLD.MID });
      // Outer ring
      for (let i = 0; i < 8; i++) e.push({ a: i, b: (i + 1) % 8, tier: 'ring', width: 0.9, alpha: 0.85, blur: 6, color: GOLD.LIGHT });
      // Inner ring (indices 8–15 map to innerPts)
      for (let i = 0; i < 8; i++) e.push({ a: 8 + i, b: 8 + ((i + 1) % 8), tier: 'inner-ring', width: 0.6, alpha: 0.65, blur: 4, color: GOLD.LIGHT });
      // Spokes: outer vertices to center (index 16 = center sentinel)
      for (let i = 0; i < 8; i++) e.push({ a: i, b: 16, tier: 'spoke', width: 0.4, alpha: 0.35, blur: 2, color: GOLD.DARK });
      return e;
    };

    // Resolve a point index to coordinates: 0–7 = outer, 8–15 = inner, 16 = center
    const resolvePoint = (
      idx: number,
      outer: { x: number; y: number }[],
      inner: { x: number; y: number }[],
      cx: number, cy: number
    ) => {
      if (idx < 8) return outer[idx];
      if (idx < 16) return inner[idx - 8];
      return { x: cx, y: cy };
    };


    // ── Screen dimensions ─────────────────────────────────────
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // ── Ray class ─────────────────────────────────────────────
    class Ray {
      x: number; y: number; angle: number;
      speed: number; len = 0; maxLen: number; done = false;
      opacity: number; width: number;

      constructor(x: number, y: number, angle: number) {
        this.x = x; this.y = y; this.angle = angle;
        this.speed = Math.random() * 4 + 2;
        this.maxLen = Math.random() * Math.max(W(), H()) * 0.5 + 80;
        this.opacity = Math.random() * 0.5 + 0.3;
        // Tier 2, item 10: Third ray width for depth perception (70% thin, 22% mid, 8% thick)
        const r = Math.random();
        this.width = r < 0.7 ? 0.4 : r < 0.92 ? 0.8 : 1.2;
      }

      update() {
        if (this.len < this.maxLen) this.len += this.speed;
        else this.done = true;
      }

      drawIdle(c: CanvasRenderingContext2D, shimmer: number) {
        const ex = this.x + Math.cos(this.angle) * this.maxLen;
        const ey = this.y + Math.sin(this.angle) * this.maxLen;
        const a = this.opacity * shimmer * 0.6;
        const g = c.createLinearGradient(this.x, this.y, ex, ey);
        g.addColorStop(0, `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},${a})`);
        g.addColorStop(0.5, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${a * 0.4})`);
        g.addColorStop(1, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0)`);
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(ex, ey);
        c.strokeStyle = g;
        c.lineWidth = this.width;
        c.shadowBlur = 2;
        c.shadowColor = `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},0.12)`;
        c.stroke();
        c.shadowBlur = 0;
      }

      draw(c: CanvasRenderingContext2D) {
        const ex = this.x + Math.cos(this.angle) * this.len;
        const ey = this.y + Math.sin(this.angle) * this.len;
        const g = c.createLinearGradient(this.x, this.y, ex, ey);
        g.addColorStop(0, `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},${this.opacity})`);
        g.addColorStop(0.5, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${this.opacity * 0.5})`);
        g.addColorStop(1, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0)`);
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(ex, ey);
        c.strokeStyle = g;
        c.lineWidth = this.width;
        c.shadowBlur = 4;
        c.shadowColor = `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},0.15)`;
        c.stroke();
        c.shadowBlur = 0;
      }

      drawDissolve(c: CanvasRenderingContext2D, progress: number) {
        const extendedLen = this.maxLen * (1 + progress * 2);
        const ex = this.x + Math.cos(this.angle) * extendedLen;
        const ey = this.y + Math.sin(this.angle) * extendedLen;
        const a = this.opacity * (1 - progress) * 0.8;
        if (a <= 0) return;
        const g = c.createLinearGradient(this.x, this.y, ex, ey);
        g.addColorStop(0, `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},${a})`);
        g.addColorStop(0.5, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${a * 0.3})`);
        g.addColorStop(1, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0)`);
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(ex, ey);
        c.strokeStyle = g;
        c.lineWidth = this.width;
        c.stroke();
      }
    }

    // ── Animation state ───────────────────────────────────────
    let rays: Ray[] = [];
    let raysSpawned = false;
    let idleFrame = 0;
    let holdFrame = 0;

    const edges = buildEdges();
    const totalEdges = edges.length;
    // Edge tier layout for layered draw-on
    // Dynamically derive tier layout from edge array
    const tierLengths: Record<EdgeTier, number> = { star: 0, ring: 0, 'inner-ring': 0, spoke: 0 };
    for (const edge of edges) tierLengths[edge.tier]++;
    const tierStarts: Record<EdgeTier, number> = {
      star: 0,
      ring: tierLengths.star,
      'inner-ring': tierLengths.star + tierLengths.ring,
      spoke: tierLengths.star + tierLengths.ring + tierLengths['inner-ring'],
    };

    const animate = () => {
      // Skip-animation support
      if (frameControl.current.skip && frameControl.current.frame < DRAW_FRAMES) {
        frameControl.current.frame = DRAW_FRAMES;
      } else {
        frameControl.current.frame++;
      }

      // Lerp mouse for smooth parallax
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.1;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.1;

      const frame = frameControl.current.frame;
      const baseCx = W() / 2;
      const baseCy = H() * OCTAGRAM_Y_OFFSET;
      const r = Math.min(W(), H()) * OCTAGRAM_SCALE;

      // Parallax offset
      const cx = baseCx + mouse.current.x * PARALLAX_PX;
      const cy = baseCy + mouse.current.y * PARALLAX_PX;

      // Phase-aware modulation
      const inInput = phaseRef.current === 'input';

      // ── Full clear each frame for crisp, HD rendering ──────────────────
      ctx.clearRect(0, 0, W(), H());
      // Lay down the dark background
      ctx.fillStyle = `rgb(${DARK_BG.r},${DARK_BG.g},${DARK_BG.b})`;
      ctx.fillRect(0, 0, W(), H());

      // ── Drawing phase ───────────────────────────────────────
      if (frame <= DRAW_FRAMES) {

        const outerV = octoPts(cx, cy, r);
        const innerV = innerPts(cx, cy, r);
        const rawProgress = frame / DRAW_FRAMES;
        const progress = easeInOutSine(rawProgress);
        const eDone = Math.floor(progress * totalEdges);
        const frac = (progress * totalEdges) - eDone;

        // Merkaba underlayer — fades in as octagram draws on
        drawMerkaba(ctx, cx, cy, r, progress * 0.12);

        // Helper: draw an edge with optional bloom pass
        const drawEdge = (pA: { x: number; y: number }, pB: { x: number; y: number }, edge: RichEdge, alphaMul: number) => {
          const c = edge.color;
          const a = edge.alpha * alphaMul;
          // Main stroke
          ctx.lineWidth = edge.width;
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a})`;
          ctx.shadowBlur = edge.blur;
          ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},${a * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
          // Bloom pass — subtle glow halo, tighter spread for HD clarity
          ctx.lineWidth = edge.width + 1;
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a * 0.1})`;
          ctx.shadowBlur = edge.blur * 0.6;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        };

        ctx.save();

        // Draw completed edges
        for (let i = 0; i < eDone; i++) {
          const edge = edges[i];
          const pA = resolvePoint(edge.a, outerV, innerV, cx, cy);
          const pB = resolvePoint(edge.b, outerV, innerV, cx, cy);
          drawEdge(pA, pB, edge, 1.0);
        }

        // Draw inscribed circles (appear as inner-ring tier draws)
        const innerRingProgress = Math.max(0, (eDone - tierStarts['inner-ring']) / tierLengths['inner-ring']);
        if (innerRingProgress > 0) {
          const circAlpha1 = 0.2 * innerRingProgress;
          const circAlpha2 = 0.1 * innerRingProgress;
          // First inscribed circle at r × φ⁻¹
          ctx.beginPath();
          ctx.arc(cx, cy, r * PHI_INV, 0, TAU);
          ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${circAlpha1})`;
          ctx.lineWidth = 0.4;
          ctx.shadowBlur = 4;
          ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${circAlpha1 * 0.3})`;
          ctx.stroke();
          // Second inscribed circle at r × φ⁻²
          ctx.beginPath();
          ctx.arc(cx, cy, r * PHI_INV * PHI_INV, 0, TAU);
          ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${circAlpha2})`;
          ctx.lineWidth = 0.3;
          ctx.shadowBlur = 3;
          ctx.stroke();
        }

        // Draw vertex jewels at completed vertices
        const completedOuterVerts = new Set<number>();
        const completedInnerVerts = new Set<number>();
        for (let i = 0; i < eDone; i++) {
          const edge = edges[i];
          if (edge.a < 8) completedOuterVerts.add(edge.a);
          else if (edge.a < 16) completedInnerVerts.add(edge.a - 8);
          if (edge.b < 8) completedOuterVerts.add(edge.b);
          else if (edge.b < 16) completedInnerVerts.add(edge.b - 8);
        }
        for (const vi of completedOuterVerts) {
          const p = outerV[vi];
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
          halo.addColorStop(0, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0.5)`);
          halo.addColorStop(1, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, TAU);
          ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0.95)`;
          ctx.shadowBlur = 0;
          ctx.fill();
        }
        for (const vi of completedInnerVerts) {
          const p = innerV[vi];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.0, 0, TAU);
          ctx.fillStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.8)`;
          ctx.shadowBlur = 0;
          ctx.fill();
        }

        // Partially-drawn current edge + glint
        if (eDone < totalEdges) {
          const edge = edges[eDone];
          const pA = resolvePoint(edge.a, outerV, innerV, cx, cy);
          const pB = resolvePoint(edge.b, outerV, innerV, cx, cy);
          const ex = pA.x + (pB.x - pA.x) * frac;
          const ey = pA.y + (pB.y - pA.y) * frac;
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.95)`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.35)`;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          // Glint dot
          ctx.beginPath();
          ctx.arc(ex, ey, 1.8, 0, TAU);
          ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0.95)`;
          ctx.shadowBlur = 16;
          ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.6)`;
          ctx.fill();

          // Bloom halo behind glint
          ctx.beginPath();
          ctx.arc(ex, ey, 18, 0, TAU);
          const glintHalo = ctx.createRadialGradient(ex, ey, 0, ex, ey, 18);
          glintHalo.addColorStop(0, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.2)`);
          glintHalo.addColorStop(1, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0)`);
          ctx.fillStyle = glintHalo;
          ctx.shadowBlur = 0;
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();

      } else {
        // ── Hold + rays + idle phase ──────────────────────────────
        holdFrame++;

        // Tier 1, item 4: Update error flash state
        if (errorFlashRef.current.active) {
          errorFlashRef.current.frame++;
          if (errorFlashRef.current.frame > 12) { // ~200ms at 60fps
            errorFlashRef.current.active = false;
          }
        }

        // Tier 2, item 5: Interpolate dimming over 600ms when input is visible
        const targetPulseMod = inInput ? 0.65 : 1.0;
        const targetScaleMod = inInput ? 0.95 : 1.0;
        dimRef.current.pulse += (targetPulseMod - dimRef.current.pulse) * 0.06; // lerp over ~36 frames
        dimRef.current.scale += (targetScaleMod - dimRef.current.scale) * 0.06;

        let pulseMod = dimRef.current.pulse;
        let scaleMod = dimRef.current.scale;
        const rayDim = inInput ? 0.5 : 1.0;

        // Tier 1, item 4: Contract octagram on error flash
        if (errorFlashRef.current.active) {
          const flashProgress = errorFlashRef.current.frame / 12;
          scaleMod *= (0.97 + (1 - flashProgress) * 0.03); // contracts from 1.0 to 0.97
        }

        const pulse = (0.85 + 0.15 * Math.sin(holdFrame * 0.08)) * pulseMod;
        const rotOffset = idleFrame > 0 ? idleFrame * 0.0003 : 0;
        const outerV = octoPts(cx, cy, r * scaleMod, rotOffset);
        const innerV = innerPts(cx, cy, r * scaleMod, rotOffset);
        const idleT = idleFrame * IDLE_TIME_FACTOR;

        // Merkaba underlayer — counter-rotates against octagram (classic Merkaba spin)
        drawMerkaba(ctx, cx, cy, r * scaleMod, 0.12 * pulse, -rotOffset * 0.7);

        ctx.save();
        for (const edge of edges) {
          const pA = resolvePoint(edge.a, outerV, innerV, cx, cy);
          const pB = resolvePoint(edge.b, outerV, innerV, cx, cy);
          const c = edge.color;
          const a = edge.alpha * pulse;
          // Main stroke
          ctx.lineWidth = edge.width;
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a})`;
          ctx.shadowBlur = edge.blur * pulse;
          ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},${a * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
          // Bloom pass — tighter for HD clarity
          ctx.lineWidth = edge.width + 1;
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a * 0.1})`;
          ctx.shadowBlur = edge.blur * 0.6;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        }

        // Inscribed circles (idle)
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${0.5 * pulse})`;
        ctx.shadowBlur = 3;
        ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${0.06 * pulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r * scaleMod * PHI_INV, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${0.3 * pulse})`;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r * scaleMod * PHI_INV * PHI_INV, 0, TAU);
        ctx.stroke();

        // Vertex jewel dots — pulsing subtly offset per vertex
        for (let vi = 0; vi < 8; vi++) {
          const p = outerV[vi];
          const jewAlpha = 1.0 * (0.85 + 0.15 * Math.sin(idleT + vi * 0.8)) * pulse;
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
          halo.addColorStop(0, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},${jewAlpha * 0.55})`);
          halo.addColorStop(1, `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0)`);
          ctx.fillStyle = halo;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, TAU);
          ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},${jewAlpha})`;
          ctx.fill();
        }
        for (let vi = 0; vi < 8; vi++) {
          const p = innerV[vi];
          const jewAlpha = 0.85 * (0.85 + 0.15 * Math.sin(idleT + (vi + 8) * 0.8)) * pulse;
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
          halo.addColorStop(0, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${jewAlpha * 0.5})`);
          halo.addColorStop(1, `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, TAU);
          ctx.fillStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${jewAlpha})`;
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();

        // Ambient glow from octagram center
        const glowR = r * 2.2;
        const glowAlpha = 0.08 * pulse;

        // Tier 1, item 4: Flash glow from gold to error terracotta on error
        let glowColor = { r: GOLD.MID.r, g: GOLD.MID.g, b: GOLD.MID.b };
        if (errorFlashRef.current.active) {
          const flashProgress = errorFlashRef.current.frame / 12;
          const t = 1 - flashProgress; // 1 at start, 0 at end (recovers to gold)
          glowColor = {
            r: Math.round(GOLD.MID.r * t + 190 * (1 - t)),
            g: Math.round(GOLD.MID.g * t + 90 * (1 - t)),
            b: Math.round(GOLD.MID.b * t + 70 * (1 - t)),
          };
        }

        const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        ambientGlow.addColorStop(0, `rgba(${glowColor.r},${glowColor.g},${glowColor.b},${glowAlpha})`);
        ambientGlow.addColorStop(1, `rgba(${glowColor.r},${glowColor.g},${glowColor.b},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = ambientGlow;
        ctx.fill();

        // Spawn rays after hold
        if (holdFrame >= HOLD_FRAMES && !raysSpawned) {
          raysSpawned = true;
          outerV.forEach(p => {
            for (let k = 0; k < RAYS_PER_VERTEX; k++) {
              const base = Math.atan2(p.y - cy, p.x - cx);
              rays.push(new Ray(p.x, p.y, base + (Math.random() - 0.5) * RAY_SPREAD));
            }
          });
          for (let k = 0; k < RAYS_FROM_CENTER; k++) {
            const a = Math.random() * TAU;
            const d = Math.random() * r * 0.3;
            rays.push(new Ray(cx + Math.cos(a) * d, cy + Math.sin(a) * d, a));
          }
        }

        if (raysSpawned) {
          let allDone = true;
          for (const ray of rays) {
            ray.update();
            ray.draw(ctx);
            if (!ray.done) allDone = false;
          }

          if (allDone) {
            if (!transitionedRef.current && phaseRef.current === 'animating') {
              transitionedRef.current = true;
              setTimeout(() => setPhase('input'), 300);
            }

            // ── Dissolution ceremony (granted phase) ──────────────
            if (dissolveRef.current.active) {
              dissolveRef.current.frame++;
              const dp = Math.min(dissolveRef.current.frame / DISSOLVE_FRAMES, 1);

              // 3-phase dissolution: Inhale (0–10%), Burst (10–60%), Fade (60–100%)
              const inhaleEnd = INHALE_FRAMES / DISSOLVE_FRAMES; // ~0.1
              const burstEnd = BURST_END;

              if (dp <= inhaleEnd) {
                // Phase A — Inhale: contract, intensify glow, accelerate rotation
                const ip = dp / inhaleEnd; // 0→1 within inhale
                const inhaleScale = 1.0 - ip * 0.08; // 1.0 → 0.92
                const inhaleGlowMul = 1.0 + ip * 1.0; // glow alpha ×2 at peak
                const inhaleRot = rotOffset + ip * 0.02;
                const iPts = octoPts(cx, cy, r * scaleMod * inhaleScale, inhaleRot);
                const iInner = innerPts(cx, cy, r * scaleMod * inhaleScale, inhaleRot);

                ctx.save();
                for (const edge of edges) {
                  const pA = resolvePoint(edge.a, iPts, iInner, cx, cy);
                  const pB = resolvePoint(edge.b, iPts, iInner, cx, cy);
                  const c = edge.color;
                  const a = edge.alpha * inhaleGlowMul;
                  ctx.lineWidth = edge.width;
                  ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a})`;
                  ctx.shadowBlur = edge.blur * inhaleGlowMul;
                  ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},${a * 0.4})`;
                  ctx.beginPath();
                  ctx.moveTo(pA.x, pA.y);
                  ctx.lineTo(pB.x, pB.y);
                  ctx.stroke();
                }
                // Inscribed circles contract too
                ctx.lineWidth = 0.4;
                ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${0.3 * inhaleGlowMul})`;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(cx, cy, r * scaleMod * inhaleScale * PHI_INV, 0, TAU);
                ctx.stroke();
                ctx.lineWidth = 0.3;
                ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${0.15 * inhaleGlowMul})`;
                ctx.beginPath();
                ctx.arc(cx, cy, r * scaleMod * inhaleScale * PHI_INV * PHI_INV, 0, TAU);
                ctx.stroke();
                // Intensified vertex jewels
                for (let vi = 0; vi < 8; vi++) {
                  const p = iPts[vi];
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 1.4, 0, TAU);
                  ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},${0.9 * inhaleGlowMul})`;
                  ctx.shadowBlur = 12 * inhaleGlowMul;
                  ctx.shadowColor = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0.5)`;
                  ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.restore();

              } else if (dp <= burstEnd) {
                // Phase B — Burst: spiral fragmentation
                const bp = (dp - inhaleEnd) / (burstEnd - inhaleEnd); // 0→1 within burst
                const eased = bp < 0.5 ? 2 * bp * bp : 1 - Math.pow(-2 * bp + 2, 2) / 2;

                ctx.save();
                for (const edge of edges) {
                  const pA = resolvePoint(edge.a, outerV, innerV, cx, cy);
                  const pB = resolvePoint(edge.b, outerV, innerV, cx, cy);
                  // Spiral path for each edge fragment
                  const midX = (pA.x + pB.x) / 2;
                  const midY = (pA.y + pB.y) / 2;
                  const baseAngle = Math.atan2(midY - cy, midX - cx);
                  const spiralAngle = baseAngle + eased * SPIRAL_TURNS; // ~1.3 full turns
                  const drift = eased * r * BURST_DRIFT_SCALE;
                  const driftX = Math.cos(spiralAngle) * drift;
                  const driftY = Math.sin(spiralAngle) * drift;
                  const c = edge.color;
                  const alpha = edge.alpha * (1 - eased);
                  if (alpha <= 0.001) continue;
                  ctx.lineWidth = edge.width;
                  ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
                  ctx.shadowBlur = (1 - eased) * 14;
                  ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},0.3)`;
                  ctx.beginPath();
                  ctx.moveTo(pA.x + driftX, pA.y + driftY);
                  ctx.lineTo(pB.x + driftX, pB.y + driftY);
                  ctx.stroke();
                }

                // Vertex spark particles trailing along spiral paths
                for (let vi = 0; vi < 8; vi++) {
                  const p = outerV[vi];
                  const angle = Math.atan2(p.y - cy, p.x - cx);
                  const sparkAngle = angle + eased * SPIRAL_TURNS;
                  const sparkDist = eased * r * 1.3;
                  const sx = p.x + Math.cos(sparkAngle) * sparkDist;
                  const sy = p.y + Math.sin(sparkAngle) * sparkDist;
                  const sparkAlpha = (1 - eased) * 0.8;
                  ctx.beginPath();
                  ctx.arc(sx, sy, 1.2 * (1 - eased * 0.5), 0, TAU);
                  ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},${sparkAlpha})`;
                  ctx.shadowBlur = 8 * (1 - eased);
                  ctx.shadowColor = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},0.4)`;
                  ctx.fill();
                }

                // Shockwave rings from inscribed circles expanding
                const ringAlpha = 0.2 * (1 - eased);
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${ringAlpha})`;
                ctx.shadowBlur = 6 * (1 - eased);
                ctx.shadowColor = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${ringAlpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(cx, cy, r * PHI_INV * (1 + eased * SHOCKWAVE_INNER_EXPANSION), 0, TAU);
                ctx.stroke();
                ctx.lineWidth = 0.3;
                ctx.strokeStyle = `rgba(${GOLD.LIGHT.r},${GOLD.LIGHT.g},${GOLD.LIGHT.b},${ringAlpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(cx, cy, r * PHI_INV * PHI_INV * (1 + eased * SHOCKWAVE_OUTER_EXPANSION), 0, TAU);
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.restore();

              } else {
                // Phase C — Fade: everything dissolves, afterimage pulse at 80%
                const fp = (dp - burstEnd) / (1 - burstEnd); // 0→1 within fade
                const fadeAlpha = (1 - fp) * 0.3;

                // Afterimage flash at ~80% total progress (50% of fade phase)
                if (fp > AFTERIMAGE_START && fp < AFTERIMAGE_END) {
                  const flashIntensity = 1 - Math.abs(fp - 0.5) / 0.05;
                  const afterAlpha = 0.03 * flashIntensity;
                  ctx.save();
                  for (const edge of edges) {
                    if (edge.tier === 'spoke') continue; // skip faint spokes in afterimage
                    const pA = resolvePoint(edge.a, outerV, innerV, cx, cy);
                    const pB = resolvePoint(edge.b, outerV, innerV, cx, cy);
                    ctx.lineWidth = edge.width;
                    ctx.strokeStyle = `rgba(${GOLD.MID.r},${GOLD.MID.g},${GOLD.MID.b},${afterAlpha})`;
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();
                  }
                  ctx.restore();
                }

                // Residual fading spark particles
                if (fadeAlpha > 0.001) {
                  for (let vi = 0; vi < 8; vi++) {
                    const p = outerV[vi];
                    const angle = Math.atan2(p.y - cy, p.x - cx);
                    const sparkAngle = angle + 2.4;
                    const sparkDist = r * 1.3 + fp * r * 0.5;
                    const sx = p.x + Math.cos(sparkAngle) * sparkDist;
                    const sy = p.y + Math.sin(sparkAngle) * sparkDist;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.8 * (1 - fp), 0, TAU);
                    ctx.fillStyle = `rgba(${GOLD.WHITE.r},${GOLD.WHITE.g},${GOLD.WHITE.b},${fadeAlpha})`;
                    ctx.fill();
                  }
                }
              }

              // Rays extend and dissolve throughout all phases
              const overallEased = dp < 0.5 ? 2 * dp * dp : 1 - Math.pow(-2 * dp + 2, 2) / 2;
              for (const ray of rays) {
                ray.drawDissolve(ctx, overallEased);
              }
            } else {
            idleFrame++;

            // Continuous rendering with time-smoothed shimmer
            const idleT2 = idleFrame * IDLE_TIME_FACTOR;
            for (const ray of rays) {
              let shimmer = (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(idleT2 + ray.angle * 3.7))) * rayDim;

              // Flicker rays arrhythmically during error flash
              if (errorFlashRef.current.active) {
                const flickerSeed = (ray.angle * 1000 + errorFlashRef.current.frame * 137) % 1;
                shimmer *= flickerSeed < 0.5 ? 0.3 : 0.8;
              }

              ray.drawIdle(ctx, shimmer);
            }
          }
        }
      }
      }

      rafId = requestAnimationFrame(animate);
    };

    // ── Pause RAF when tab is hidden (saves CPU/battery) ──────
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Form submission ────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 'granted') return;

    if (inputVal.trim().toLowerCase() === CORRECT_CODE) {
      setPhase('granted');
      // onAccessGranted is called by GSAP timeline at t=1.0s — no setTimeout needed
    } else {
      setInputVal('');
      playDenyTone();
      const skipStrobe = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (skipStrobe) {
        setError(true);
        errorFlashRef.current = { active: true, frame: 0 };
      } else {
        setError(false);
        setPhase('strobing');
        timerRef.current = setTimeout(() => {
          setPhase('input');
          setError(true);
        }, 2200);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    if (error) setError(false);
  };

  const handleSkip = () => {
    if (phase === 'animating') frameControl.current.skip = true;
    // no-op for 'input' and 'granted' phases
  };

  // ── Focus trap: keep focus within dialog ───────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && phase === 'input') {
      const focusables = [inputRef.current, submitRef.current].filter(
        Boolean
      ) as HTMLElement[];
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const show = phase === 'input' || phase === 'granted';

  return (
    <div
      ref={rootRef}
      className={`gate-root${phase === 'granted' ? ' gate-root--granted' : ''}`}
      onClick={handleSkip}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Access gate"
    >
      <Suspense fallback={null}>
        <GateSeedOfLife3D />
      </Suspense>
      <Suspense fallback={null}>
        <GateDust phase={phase} />
      </Suspense>
      {phase === 'granted' && (
        <Suspense fallback={null}>
          <GateMerkaba />
        </Suspense>
      )}
      <div className="gate-vignette" />
      <div className="gate-noise" />
      <canvas ref={canvasRef} aria-hidden="true" className="gate-canvas" />

      {phase === 'strobing' && (
        <div className="gate-strobe" aria-hidden="true">
          <div className="gate-strobe-light" />
        </div>
      )}

      <AnimatePresence>
        {show && (
          <motion.div
            className="gate-ui"
            style={{ pointerEvents: phase === 'input' ? 'auto' : 'none' }}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.02 }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26,
              mass: 0.9,
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="gate-backdrop" />
            <motion.p
              className="gate-label"
              initial={{ opacity: 0, letterSpacing: '2px' }}
              animate={{ opacity: [0.75, 1, 0.75], letterSpacing: '5px' }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              Enter Code
            </motion.p>
            <form onSubmit={handleSubmit} className="gate-form">
              <motion.input
                ref={inputRef}
                type="password"
                value={inputVal}
                onChange={handleChange}
                className={`gate-input${error ? ' gate-input--error' : ''}`}
                autoComplete="off"
                spellCheck={false}
                placeholder="..."
                aria-label="Access code"
                aria-invalid={error}
                /* Tier 1, item 4: Replace horizontal shake with scale pulse (subtler rejection) */
                animate={
                  error
                    ? { scale: [1, 0.98, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <button
                ref={submitRef}
                type="submit"
                className="gate-submit"
                aria-label="Submit code"
              >
                <AethonGatewayIcon size={28} color="rgba(210,185,115,0.85)" />
              </button>
            </form>
            <AnimatePresence>
              {error && (
                <motion.p
                  className="gate-denied"
                  role="alert"
                  aria-live="assertive"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  denied
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gate-root {
          position: fixed;
          inset: 0;
          background: oklch(0.05 0.01 280deg);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
        }
        .gate-root--granted {
          pointer-events: none;
        }

        .gate-canvas {
          position: absolute;
          inset: 0;
          z-index: 1;
          will-change: transform;
        }

        .gate-vignette {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          /* Tier 1: cool countertemperature + Tier 2, item 9: vignette mid-stop for smoother falloff */
          background: radial-gradient(
            ellipse at center,
            transparent 25%,
            rgba(4, 5, 12, 0.2) 45%,
            rgba(4, 5, 12, 0.5) 65%,
            rgba(4, 5, 12, 0.85) 100%
          );
        }

        .gate-noise {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── UI Container ─────────────────────────────────────── */
        .gate-ui {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          /* Octagram sits at 44vh — UI clears it with generous breathing room */
          margin-top: calc(44vh + 140px);
        }

        /* Tier 1, item 3: Sacred geometry backdrop — elliptical veil, no visible boundary */
        .gate-backdrop {
          position: absolute;
          inset: -28px -48px;
          z-index: -1;
          pointer-events: none;
          /* Radial veil with cool temperature — UI floats in a pool of shadow */
          background: radial-gradient(
            ellipse 400px 200px at center,
            rgba(4, 5, 12, 0.15) 0%,
            rgba(4, 5, 12, 0.35) 40%,
            rgba(4, 5, 12, 0.6) 100%
          );
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        .gate-label {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-weight: 400;
          /* Tier 2, item 7: Reduce letter-spacing for readability (still ceremonial) */
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(240, 230, 200, 0.95);
          margin: 0;
          user-select: none;
          text-shadow: 0 0 20px rgba(220, 195, 130, 0.3);
          pointer-events: none;
        }

        .gate-form {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ── Input ────────────────────────────────────────────── */
        .gate-input {
          background: rgba(10, 10, 12, 0.7);
          border: 1px solid rgba(200, 175, 110, 0.4);
          border-radius: 4px;
          color: rgba(245, 235, 200, 0.95);
          padding: 12px 24px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          letter-spacing: 6px;
          outline: none;
          text-align: center;
          width: 220px;
          caret-color: rgba(230, 210, 150, 0.8);
          transition: border-color 0.3s, box-shadow 0.3s;
          -webkit-font-smoothing: antialiased;
        }
        .gate-input::placeholder {
          color: rgba(200, 185, 140, 0.35);
          /* Tier 2, item 7: Reduce placeholder letter-spacing (still spacious) */
          letter-spacing: 8px;
        }
        .gate-input:focus {
          border-color: rgba(220, 195, 130, 0.65);
          box-shadow: 0 0 20px rgba(220, 195, 130, 0.1);
        }
        /* Tier 3, item 13: Remove !important — increase specificity naturally */
        .gate-form .gate-input.gate-input--error {
          border-color: rgba(190, 90, 70, 0.65);
          box-shadow: 0 0 16px rgba(190, 90, 70, 0.15);
        }

        /* ── Submit Button ────────────────────────────────────── */
        .gate-submit {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.75;
          transition: opacity 0.3s, filter 0.3s, transform 0.15s;
          filter: drop-shadow(0 0 6px rgba(210, 185, 115, 0.2));
          border-radius: 4px;
        }
        .gate-submit:hover {
          opacity: 1;
          filter: drop-shadow(0 0 12px rgba(220, 195, 130, 0.5));
        }
        .gate-submit:active {
          transform: scale(0.93);
        }
        .gate-submit:focus-visible {
          outline: 1px solid rgba(220, 195, 130, 0.6);
          outline-offset: 2px;
          opacity: 1;
        }

        /* ── Denied Message ───────────────────────────────────── */
        .gate-denied {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 5px;
          color: rgba(200, 100, 80, 0.8);
          margin: 0;
          text-transform: lowercase;
        }

        /* ── Responsive ───────────────────────────────────────── */
        @media (max-width: 640px) {
          .gate-ui {
            margin-top: calc(44vh + 100px);
          }
          .gate-input {
            width: 160px;
            padding: 12px 20px;
            font-size: 16px;
          }
          .gate-label {
            letter-spacing: 6px;
            font-size: 14px;
          }
        }

        /* ── Wrong-password strobe overlay ───────────────────── */
        .gate-strobe {
          position: fixed;
          inset: 0;
          z-index: 50;
          pointer-events: none;
          overflow: hidden;
        }

        .gate-strobe-light {
          position: absolute;
          inset: 0;
          animation: gate-strobe-flash 2.2s ease-out forwards;
        }

        /* White-gold radial burst — centered on the octagram */
        .gate-strobe-light::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 90% 72% at 50% 44%,
            rgba(255, 254, 250, 1)    0%,
            rgba(255, 244, 195, 0.92) 16%,
            rgba(255, 222, 118, 0.66) 42%,
            rgba(232, 184, 62,  0.26) 68%,
            transparent               88%
          );
        }

        /* Octagon tessellation — thin amber lines, barely perceptible through the light */
        .gate-strobe-light::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpolygon points='5.86,0 14.14,0 20,5.86 20,14.14 14.14,20 5.86,20 0,14.14 0,5.86' fill='none' stroke='%23c8991e' stroke-width='0.4'%2F%3E%3C%2Fsvg%3E");
          background-size: 20px 20px;
          opacity: 0.18;
        }

        /* 5 flashes (~2.3 Hz — below photosensitivity threshold), diminishing */
        @keyframes gate-strobe-flash {
          0%   { opacity: 0    }
          3%   { opacity: 1    }
          9%   { opacity: 0.03 }
          18%  { opacity: 0.97 }
          24%  { opacity: 0.04 }
          34%  { opacity: 0.91 }
          41%  { opacity: 0.08 }
          52%  { opacity: 0.78 }
          60%  { opacity: 0.18 }
          72%  { opacity: 0.56 }
          82%  { opacity: 0.24 }
          92%  { opacity: 0.32 }
          100% { opacity: 0    }
        }

        /* ── Reduced motion ───────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .gate-root {
            transition: opacity 400ms ease;
          }
          .gate-strobe {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
