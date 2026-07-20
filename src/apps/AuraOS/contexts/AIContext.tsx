import React, { createContext, useContext, ReactNode } from 'react';
import { useAIServices } from '../hooks/useAIServices';
import { usePracticeContext } from './PracticeContext';
import { useUserContext } from './UserContext';
import { useInsightsContext } from './InsightsContext';
import { practices as corePractices } from '../constants';

const AIContext = createContext<ReturnType<typeof useAIServices> | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const { practiceStack, practiceNotes, completedToday } = usePracticeContext();
  const { userProfile, userId } = useUserContext();
  const { integratedInsights } = useInsightsContext();

  const aiServices = useAIServices(
    practiceStack,
    integratedInsights,
    corePractices,
    practiceNotes,
    completedToday,
    userProfile,
    userId
  );

  return (
    <AIContext.Provider value={aiServices}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}
