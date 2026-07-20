// ============================================================
// BLISS App Entry Point
// ============================================================

import { Suspense } from 'react';
import BLISSDesktop from './App';

interface BLISSAppProps {
  windowId: string;
}

export default function BLISSApp({ windowId }: BLISSAppProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: 'var(--bg-window)' }}>
        <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--accent-primary)', borderRightColor: 'var(--accent-primary)' }} />
      </div>
    }>
      <BLISSDesktop windowId={windowId} />
    </Suspense>
  );
}
