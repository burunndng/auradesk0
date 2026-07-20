import React, { useState, useEffect, ReactNode } from 'react';
import { WizardProvider } from './WizardContext';

/**
 * Wrapper that defers WizardProvider mounting until after initial render
 * Prevents loading 20+ session histories from blocking dashboard mount
 *
 * Dashboard doesn't need wizards on initial load - they're only opened on demand
 */
export function LazyWizardProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Mount WizardProvider after initial render completes
    setIsReady(true);
  }, []);

  // While waiting for WizardProvider to mount, render children without it
  if (!isReady) {
    return <>{children}</>;
  }

  // After initial render, wrap with WizardProvider (which loads histories)
  return (
    <WizardProvider>
      {children}
    </WizardProvider>
  );
}
