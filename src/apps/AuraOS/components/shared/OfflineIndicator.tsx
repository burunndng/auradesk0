import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-900 text-amber-50 px-4 py-2 text-center text-sm z-50">
      You're offline. Some features are limited.
    </div>
  );
};
