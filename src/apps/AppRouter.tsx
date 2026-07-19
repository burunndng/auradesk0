// ============================================================
// App Router — AuraDesk
// ============================================================

import { lazy, type FC } from 'react';
import NotImplemented from '@/components/NotImplemented';

// The two apps
const AuraOS = lazy(() => import('./AuraOS'));
const BLISS = lazy(() => import('./BLISS'));

interface AppRouterProps {
  appId: string;
  windowId: string;
}

const AppRouter: FC<AppRouterProps> = ({ appId, windowId }) => {
  switch (appId) {
    case 'auraos':
      return <AuraOS windowId={windowId} />;
    case 'bliss':
      return <BLISS windowId={windowId} />;
    default:
      return <NotImplemented appId={appId} />;
  }
};

export default AppRouter;
