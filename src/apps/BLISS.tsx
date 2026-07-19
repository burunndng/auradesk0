// ============================================================
// BLISS App — Placeholder
// ============================================================

import { useEffect } from 'react';

interface BLISSProps {
  windowId: string;
}

export default function BLISS({ windowId }: BLISSProps) {
  useEffect(() => {
    // TODO: Import BLISS app tree
    // Current: placeholder while real code is being imported
  }, [windowId]);

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--bg-window)', color: 'var(--text-primary)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🎵</div>
        <div className="text-xl font-semibold mb-2">BLISS</div>
        <div className="text-sm opacity-60">Browser-based DAW + Psychedelic Visuals</div>
        <div className="mt-6 text-xs opacity-40">
          Importing from ~/Documents/BLISS...
        </div>
      </div>
    </div>
  );
}
