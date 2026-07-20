import React, { createContext, useContext, ReactNode } from 'react';
import { useModalManager } from '../hooks/useModalManager';

const ModalContext = createContext<ReturnType<typeof useModalManager> | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const modalManager = useModalManager();
  return (
    <ModalContext.Provider value={modalManager}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}
