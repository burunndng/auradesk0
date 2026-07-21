// ============================================================
// NotImplemented — Placeholder for unbuilt apps
// ============================================================

import { useEffect, useState } from 'react';
import { getAppById } from '@/apps/registry';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Props {
  appId: string;
}

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Icons.HelpCircle {...props} />;
};

export default function NotImplemented({ appId }: Props) {
  const app = getAppById(appId);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--text-secondary)' }}>
        <Icons.HelpCircle size={44} style={{ color: 'var(--accent-crimson)', filter: 'drop-shadow(0 0 12px rgba(255,49,91,0.5))' }} />
        <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>UNKNOWN SIGNAL</p>
        <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>ID: {appId}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none" style={{ color: 'var(--text-primary)' }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: 76,
          height: 76,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(107,70,223,0.18), rgba(4,3,11,0.4))',
          border: '1px solid var(--border-default)',
          animation: 'breathe 3.5s ease-in-out infinite',
        }}
      >
        <DynamicIcon name={app.icon} size={36} style={{ color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 12px rgba(128,92,255,0.6))' }} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="eyebrow">◈ DORMANT MEMBRANE</div>
        <h2 className="font-display font-bold" style={{ fontSize: 20, letterSpacing: '0.04em' }}>{app.name}</h2>
        <p className="font-mono max-w-[280px] text-center" style={{ fontSize: 10, lineHeight: 1.8, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          {app.description}
        </p>
      </div>
      <div
        className="font-mono flex items-center gap-2"
        style={{
          padding: '7px 14px',
          borderRadius: 999,
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          background: 'rgba(107,70,223,0.10)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <Icons.Hammer size={12} style={{ color: 'var(--accent-cyan)' }} />
        <span>Awaiting Manifestation{dots}</span>
      </div>
    </div>
  );
}
