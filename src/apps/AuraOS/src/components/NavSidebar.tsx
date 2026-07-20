import React from 'react';
import type { ActiveTab } from '../types';

export default function NavSidebar(props: {
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
}) {
  const { activeTab, setActiveTab } = props;

  return (
    <div>
      {/* existing nav entries above... */}

      <button
        type="button"
        onClick={() => setActiveTab('sensemaking-lab')}
        aria-current={activeTab === 'sensemaking-lab' ? 'page' : undefined}
        style={{ fontWeight: activeTab === 'sensemaking-lab' ? 700 : 400 }}
      >
        Sensemaking Lab
      </button>

      {/* existing nav entries below... */}
    </div>
  );
}
