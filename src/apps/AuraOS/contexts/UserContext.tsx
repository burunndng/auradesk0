import React, { createContext, useContext, ReactNode } from 'react';
import { useUserSession } from '../hooks/useUserSession';
import { usePracticeContext } from './PracticeContext';
import { usePreferenceSync } from '../hooks/usePreferenceSync';
import { useAuth } from './AuthContext';

const UserContext = createContext<ReturnType<typeof useUserSession> | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { practiceStack, setPracticeStack, dailyNotes, completionHistory } = usePracticeContext();
  const { user, isAuthenticated } = useAuth();

  // NOTE: integratedInsights moved to separate InsightsProvider (async loading)
  // This prevents blocking UserProvider mount with large data loads

  // useUserSession expects: integratedInsights, sessionHistory321, practiceStack, historyIFS, memoryReconHistory, dailyNotes, completionHistory
  // authUserId is passed to use auth.user.id if authenticated, otherwise falls back to localStorage
  const userSession = useUserSession(
    [], // integratedInsights - now loaded separately in InsightsProvider
    [], // sessionHistory321 - TODO: Wire up from WizardContext
    practiceStack,
    [], // historyIFS
    [], // memoryReconHistory
    dailyNotes,
    completionHistory,
    isAuthenticated ? user?.id : undefined // Use auth user ID if authenticated
  );

  // Sync practice stack with Supabase in the background
  usePreferenceSync(userSession.userId, practiceStack, setPracticeStack);

  return (
    <UserContext.Provider value={userSession}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
