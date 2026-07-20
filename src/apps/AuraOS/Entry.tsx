// ============================================================
// AuraOS App Entry Point
// ============================================================

import { Suspense } from 'react';
import AuraOSDesktop from './App';

interface AuraOSAppProps {
  windowId: string;
}

export default function AuraOSApp({ windowId }: AuraOSAppProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: 'var(--bg-window)' }}>
        <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--accent-primary)', borderRightColor: 'var(--accent-primary)' }} />
      </div>
    }>
      <AuraOSDesktop windowId={windowId} />
    </Suspense>
  );
}
