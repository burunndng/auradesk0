import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';

const NavigationContext = createContext<ReturnType<typeof useNavigation> | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigation();
  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
}
