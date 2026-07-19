// ============================================================
// AuraOS App — Placeholder
// ============================================================

import { useEffect } from 'react';

interface AuraOSProps {
  windowId: string;
}

export default function AuraOS({ windowId }: AuraOSProps) {
  useEffect(() => {
    // TODO: Import AuraOS app tree
    // Current: placeholder while real code is being imported
  }, [windowId]);

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--bg-window)', color: 'var(--text-primary)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🧠</div>
        <div className="text-xl font-semibold mb-2">AuraOS</div>
        <div className="text-sm opacity-60">Integral Life Practice</div>
        <div className="mt-6 text-xs opacity-40">
          Importing from ~/Documents/AOS...
        </div>
      </div>
    </div>
  );
}
