import React from 'react';
import type { ActiveTab } from '../types';

// Existing imports...
import SensemakingLab from './learning/SensemakingLab';

// NOTE: This file likely already has other imports and a switch.
// The snippet below preserves existing structure while adding the new case.

export default function TabRoutes(props: any) {
  const activeTab: ActiveTab = props.activeTab;

  switch (activeTab) {
    // ...existing cases...

    case 'sensemaking-lab':
      return <SensemakingLab />;

    default:
      return null;
  }
}
