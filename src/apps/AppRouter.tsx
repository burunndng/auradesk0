// ============================================================
// App Router — AuraDesk
// ============================================================

import { type FC } from 'react';
import { getAppById } from '@/apps/registry';
import AppFrame from '@/components/AppFrame';
import NotImplemented from '@/components/NotImplemented';
import AuraOS from '@/apps/AuraOS';
import BLISS from '@/apps/BLISS';
import Notes from '@/apps/Notes';

const LOCAL_APPS: Record<string, FC> = {
  auraos: AuraOS,
  bliss: BLISS,
  notes: Notes,
};

const AppRouter: FC<{ appId: string; windowId: string }> = ({ appId }) => {
  const app = getAppById(appId);

  if (!app) return <NotImplemented appId={appId} />;

  // External / iframe apps render through the generic wrapper.
  if (app.url) return <AppFrame app={app} />;

  const LocalComponent = LOCAL_APPS[appId];
  if (LocalComponent) return <LocalComponent />;

  return <NotImplemented appId={appId} />;
};

export default AppRouter;
