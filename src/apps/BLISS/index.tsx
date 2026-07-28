import { Music, AudioLines } from 'lucide-react';

export default function BLISS() {
  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, rgba(15,10,30,0.4) 0%, var(--bg-window) 70%)',
      }}
    >
      {/* Waveform ambient ring */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: '1px solid rgba(127,161,255,0.15)',
          boxShadow: '0 0 40px rgba(127,161,255,0.15), inset 0 0 30px rgba(127,161,255,0.05)',
          animation: 'corePulse 4s ease-in-out infinite',
        }}
      >
        <Music size={42} style={{ color: 'var(--lapis)', filter: 'drop-shadow(0 0 16px rgba(127,161,255,0.7))' }} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="eyebrow" style={{ color: 'var(--lapis-dim)' }}>◈ AUDIO RESONANCE MEMBRANE</div>
        <div className="font-display font-bold" style={{ fontSize: 28, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
          BLISS
        </div>
        <p className="font-mono max-w-[420px]" style={{ fontSize: 11, lineHeight: 1.9, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          Browser-based DAW with psychedelic visuals. This shell is ready for your module integration.
        </p>
        <p className="font-mono max-w-[340px]" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
          // local render — external popup bypassed
        </p>
      </div>

      <div
        className="font-mono flex items-center gap-2"
        style={{
          padding: '10px 20px',
          borderRadius: 999,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          background: 'rgba(127,161,255,0.08)',
          border: '1px solid rgba(127,161,255,0.2)',
          color: 'var(--lapis)',
          boxShadow: '0 0 18px rgba(127,161,255,0.1)',
        }}
      >
        <AudioLines size={14} />
        <span>Integration Ready</span>
      </div>

      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.1 }} />
    </div>
  );
}
