// ============================================================
// App Router — AuraDesk
// ============================================================

import { type FC } from 'react';
import { getAppById } from '@/apps/registry';
import AppFrame from '@/components/AppFrame';
import NotImplemented from '@/components/NotImplemented';

const AppRouter: FC<{ appId: string; windowId: string }> = ({ appId }) => {
  const app = getAppById(appId);

  if (!app) return <NotImplemented appId={appId} />;

  // External / iframe apps render through the generic wrapper.
  if (app.url) return <AppFrame app={app} />;

  return <NotImplemented appId={appId} />;
};

export default AppRouter;
