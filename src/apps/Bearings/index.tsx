import { useState } from 'react';
import { Compass, ExternalLink, Copy, Check } from 'lucide-react';

const BEARINGS_URL = 'https://bearings-lsd.vercel.app/';

export default function Bearings() {
  const [copied, setCopied] = useState(false);

  const launch = () => window.open(BEARINGS_URL, '_blank', 'noopener,noreferrer');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(BEARINGS_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 50% 42%, rgba(255,200,94,0.05) 0%, rgba(10,8,14,0.5) 60%, var(--bg-window) 100%)',
      }}
    >
      {/* Compass ambient ring — one true-north mote */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: '1px solid rgba(255,200,94,0.16)',
          boxShadow: '0 0 40px rgba(255,200,94,0.12), inset 0 0 30px rgba(255,200,94,0.05)',
          animation: 'corePulse 4s ease-in-out infinite',
        }}
      >
        <Compass
          size={44}
          style={{
            color: 'var(--gilt-bright)',
            filter: 'drop-shadow(0 0 16px rgba(255,200,94,0.55))',
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="eyebrow" style={{ color: 'var(--gold-dim)' }}>
          ◈ A PLACE TO GET YOUR BEARINGS
        </div>
        <div
          className="font-display font-bold"
          style={{ fontSize: 28, letterSpacing: '0.08em', color: 'var(--text-primary)' }}
        >
          Bearings
        </div>
        <p
          className="font-mono max-w-[440px]"
          style={{ fontSize: 11, lineHeight: 1.9, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}
        >
          Preparation and reflection for intense experiences — before, in between, or after. Bearings is hosted
          on Vercel — launch it in a dedicated tab.
        </p>
        <p
          className="font-mono max-w-[340px]"
          style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}
        >
          // bearings · vercel app
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={launch}
          className="font-mono flex items-center gap-2"
          style={{
            padding: '12px 26px',
            borderRadius: 999,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background: 'rgba(255,200,94,0.12)',
            border: '1px solid rgba(255,200,94,0.35)',
            color: 'var(--gilt-bright)',
            boxShadow: '0 0 24px rgba(255,200,94,0.16)',
            cursor: 'pointer',
          }}
        >
          <ExternalLink size={14} />
          <span>Launch Bearings</span>
        </button>
        <button
          onClick={copyLink}
          className="font-mono flex items-center gap-2"
          style={{
            padding: '12px 18px',
            borderRadius: 999,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          title="Copy link"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
      </div>

      <p
        className="font-mono"
        style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          color: 'var(--text-tertiary)',
          wordBreak: 'break-all',
          maxWidth: 380,
        }}
      >
        {BEARINGS_URL}
      </p>

      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.1 }} />
    </div>
  );
}
