import { useEffect, useState, memo } from 'react';

const PHASE_INTRO = 0;
const PHASE_LINK = 1;
const PHASE_REVEAL = 2;
const PHASE_DONE = 3;

const BOOT_LOG = [
  '> initializing obsidian lattice...',
  '> mounting neural membrane [0x3a:f1]...',
  '> veil channel ... OK',
  '> coherence sync ... 98.7%',
  '> NEURAL LINK ESTABLISHED',
];

const BootSequence = memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<number>(PHASE_INTRO);
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [coherence, setCoherence] = useState(0);

  useEffect(() => {
    if (phase !== PHASE_INTRO) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(PHASE_LINK), 600));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE_LINK) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 11 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress(p);
      setCoherence(p);
      setLogIndex(Math.min(BOOT_LOG.length - 1, Math.floor((p / 100) * BOOT_LOG.length)));
    }, 130);
    timers.push(interval as unknown as ReturnType<typeof setTimeout>);
    timers.push(setTimeout(() => setPhase(PHASE_REVEAL), 2600));
    timers.push(setTimeout(() => setPhase(PHASE_DONE), 3300));
    timers.push(setTimeout(() => onComplete(), 3600));
    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  if (phase === PHASE_DONE) return null;

  const revealing = phase === PHASE_REVEAL;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(circle at center, #140d2a 0%, #05030a 38%, #010104 78%)',
        transition: 'clip-path 700ms cubic-bezier(0,0,0.2,1), opacity 400ms ease',
        clipPath: revealing ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
        opacity: revealing ? 0 : 1,
      }}
    >
      {/* Rotating glyph mark */}
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          style={{
            animation: 'glyphRotate 8s linear infinite',
            filter: 'drop-shadow(0 0 22px rgba(128,92,255,0.7))',
          }}
        >
          <polygon
            points="70,12 128,70 70,128 12,70"
            fill="none"
            stroke="rgba(147,116,255,0.35)"
            strokeWidth="1"
          />
          <polygon
            points="70,28 112,70 70,112 28,70"
            fill="none"
            stroke="rgba(87,246,225,0.4)"
            strokeWidth="1"
          />
          <circle cx="70" cy="70" r="3" fill="#ece9ff" />
        </svg>
        <div
          className="absolute font-display font-extrabold"
          style={{
            fontSize: 38,
            color: '#ece9ff',
            textShadow: '0 0 24px rgba(128,92,255,0.9)',
            animation: 'corePulse 2.4s ease-in-out infinite',
          }}
        >
          S
        </div>
      </div>

      <h1
        className="font-display font-extrabold tracking-[0.06em] mt-8"
        style={{
          fontSize: 34,
          color: '#ece9ff',
          letterSpacing: '0.08em',
        }}
      >
        SERK3T<span style={{ color: '#8b84a7', fontWeight: 500 }}>OS</span>
      </h1>
      <p
        className="font-mono mt-2"
        style={{ fontSize: 10, letterSpacing: '0.3em', color: '#79718f', textTransform: 'uppercase' }}
      >
        THE OBSCURE INTERFACE
      </p>

      {/* Neural-link log */}
      {phase >= PHASE_LINK && (
        <div className="mt-9 flex flex-col items-center" style={{ minWidth: 320 }}>
          <div className="w-[280px] h-[2px] mb-3" style={{ background: 'rgba(128,92,255,0.18)' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6245d9, #805cff, #57f6e1)',
                boxShadow: '0 0 12px rgba(128,92,255,0.8)',
                transition: 'width 130ms linear',
              }}
            />
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: '#9388bd', letterSpacing: '0.12em', minHeight: 16 }}
          >
            {BOOT_LOG[logIndex]}
          </div>

          {/* Telemetry row */}
          <div
            className="flex items-center gap-6 mt-5 font-mono"
            style={{ fontSize: 9, letterSpacing: '0.18em', color: '#6e6780', textTransform: 'uppercase' }}
          >
            <span>
              CORE <b style={{ color: '#70ffd3' }}>ONLINE</b>
            </span>
            <span>
              COHERENCE <b style={{ color: '#805cff' }}>{coherence.toFixed(1)}%</b>
            </span>
          </div>
        </div>
      )}

      {/* scanlines */}
      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.35 }} />
      <div className="absolute inset-0 overlay-vignette pointer-events-none" />
    </div>
  );
});

export default BootSequence;
