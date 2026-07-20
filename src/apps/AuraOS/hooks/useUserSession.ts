import { useState, useEffect } from 'react';
import { useStorage as useLocalStorage } from './useStorage';
import { buildUserProfile, UserProfile } from '../utils/contextAggregator';
import { IntegratedInsight, PlanHistoryEntry, AllPractice } from '../types';

export function useUserSession(
  integratedInsights: IntegratedInsight[],
  integralBodyPlanHistory: PlanHistoryEntry[],
  practiceStack: AllPractice[],
  historyKegan: any[],
  historyAttachment: any[],
  dailyNotes: Record<string, string>,
  completionHistory: Record<string, string[]>,
  authUserId?: string // If authenticated, use auth.user.id instead of localStorage
) {
  const [localUserId] = useLocalStorage<string>('userId', (() => {
    const newId = `user-${Math.random().toString(36).substr(2, 9)}`;
    return newId;
  })());

  // Use authenticated user ID if available, otherwise fall back to localStorage
  const userId = authUserId || localUserId;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const buildProfile = async () => {
      try {
        console.time('[useUserSession] buildUserProfile');
        setIsProfileLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const completionRecords = Object.entries(completionHistory)
          .filter(([_, dates]) => dates.includes(today))
          .map(([practiceId, _]) => ({
            practiceId,
            date: today,
            completed: true,
          }));

        const wizardSessions = [];
        if (historyKegan.length > 0) wizardSessions.push({ type: 'keganAssessment', sessionData: historyKegan[0] });
        if (historyAttachment.length > 0) wizardSessions.push({ type: 'attachmentAssessment', sessionData: historyAttachment[0] });

        console.log('[useUserSession] integratedInsights count:', integratedInsights.length);
        const profile = await buildUserProfile(
          completionRecords,
          integratedInsights,
          integralBodyPlanHistory,
          practiceStack,
          wizardSessions,
          dailyNotes
        );
        console.timeEnd('[useUserSession] buildUserProfile');
        setUserProfile(profile);
      } catch (error) {
        console.error('[App] Error building user profile:', error);
        console.timeEnd('[useUserSession] buildUserProfile');
      } finally {
        setIsProfileLoading(false);
      }
    };

    buildProfile();
    // Only build profile on mount - data comes from localStorage and doesn't need constant recomputation
    // Historical analysis is stable and shouldn't trigger on every parent re-render
  }, []);

  return {
    userId,
    userProfile,
    setUserProfile,
    isProfileLoading,
    showAuthModal,
    setShowAuthModal
  };
}