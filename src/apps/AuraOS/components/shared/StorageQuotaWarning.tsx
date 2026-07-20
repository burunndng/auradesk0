import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { StorageManager } from '../../.claude/lib/storageManager';

export const StorageQuotaWarning: React.FC = () => {
  const [quota, setQuota] = useState(StorageManager.getQuota());
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Initial check
    const currentQuota = StorageManager.getQuota();
    setQuota(currentQuota);
    setShowWarning(currentQuota.percentUsed > 80);

    // Check every 30 seconds
    const interval = setInterval(() => {
      const updatedQuota = StorageManager.getQuota();
      setQuota(updatedQuota);
      setShowWarning(updatedQuota.percentUsed > 80);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!showWarning) return null;

  const handleCleanup = () => {
    StorageManager.cleanup();
    const updatedQuota = StorageManager.getQuota();
    setQuota(updatedQuota);
    setShowWarning(updatedQuota.percentUsed > 80);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-900/90 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-100 max-w-sm z-50 shadow-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle size={20} className="flex-shrink-0 text-yellow-400" />
        <div>
          <p className="font-semibold mb-1">Storage Almost Full</p>
          <p className="text-xs mb-2">
            You're using {quota.percentUsed.toFixed(0)}% of available storage.
            Old wizard sessions may be automatically removed.
          </p>
          <button
            onClick={handleCleanup}
            className="text-xs underline hover:no-underline text-yellow-200 hover:text-yellow-100"
          >
            Clean up now
          </button>
        </div>
      </div>
    </div>
  );
};
