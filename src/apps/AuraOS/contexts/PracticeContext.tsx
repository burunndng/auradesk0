import React, { createContext, useContext, ReactNode } from 'react';
import { usePracticeManager } from '../hooks/usePracticeManager';

const PracticeContext = createContext<ReturnType<typeof usePracticeManager> | undefined>(undefined);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const practiceManager = usePracticeManager();
  return (
    <PracticeContext.Provider value={practiceManager}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePracticeContext() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePracticeContext must be used within a PracticeProvider');
  }
  return context;
}
