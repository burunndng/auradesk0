import { useCallback, useMemo } from 'react';
import { useStorage as useLocalStorage } from './useStorage';
import { AllPractice, Practice, CustomPractice, ModuleKey } from '../types';
import { practices as corePractices } from '../constants';

export function usePracticeManager() {
  const [practiceStack, setPracticeStack] = useLocalStorage<AllPractice[]>('practiceStack', []);
  const [practiceNotes, setPracticeNotes] = useLocalStorage<Record<string, string>>('practiceNotes', {});
  const [dailyNotes, setDailyNotes] = useLocalStorage<Record<string, string>>('dailyNotes', {});
  const [completionHistory, setCompletionHistory] = useLocalStorage<Record<string, string[]>>('completionHistory', {});

  const findModuleKey = useCallback((practiceId: string): ModuleKey => {
    const practice = practiceStack.find(p => p.id === practiceId);
    if (practice && 'isCustom' in practice && practice.isCustom) {
      return practice.module;
    }
    for (const key in corePractices) {
      if (corePractices[key as ModuleKey].some(p => p.id === practiceId)) {
        return key as ModuleKey;
      }
    }
    return 'mind'; // Default
  }, [practiceStack]);

  const addToStack = useCallback((practice: Practice) => {
    if (!practiceStack.some(p => p.id === practice.id)) {
      setPracticeStack(prev => [...prev, practice]);
    }
  }, [practiceStack, setPracticeStack]);

  const removeFromStack = useCallback((practiceId: string) => {
    setPracticeStack(prev => prev.filter(p => p.id !== practiceId));
  }, [setPracticeStack]);

  const handleSaveCustomPractice = useCallback((practice: CustomPractice, module: ModuleKey) => {
    setPracticeStack(prev => [...prev, { ...practice, module }]);
  }, [setPracticeStack]);

  const savePersonalizedPractice = useCallback((practiceId: string, personalizedSteps: string[]) => {
    setPracticeStack(prev => prev.map(p =>
      p.id === practiceId ? { ...p, how: personalizedSteps } : p
    ));
  }, [setPracticeStack]);

  const updatePracticeNote = useCallback((practiceId: string, note: string) => {
    setPracticeNotes(prev => ({ ...prev, [practiceId]: note }));
  }, [setPracticeNotes]);

  const updateDailyNote = useCallback((practiceId: string, note: string) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setDailyNotes(prev => ({ ...prev, [`${practiceId}-${todayKey}`]: note }));
  }, [setDailyNotes]);

  const togglePracticeCompletion = useCallback((practiceId: string) => {
    setCompletionHistory(prev => {
      const history = prev[practiceId] || [];
      const today = new Date().toISOString().split('T')[0];
      if (history.includes(today)) {
        return { ...prev, [practiceId]: history.filter(d => d !== today) };
      } else {
        return { ...prev, [practiceId]: [...history, today] };
      }
    });
  }, [setCompletionHistory]);

  const getStreak = useCallback((practiceId: string) => {
    const dates = completionHistory[practiceId] || [];
    if (dates.length === 0) return 0;
    const sortedDates = [...new Set(dates)].sort().reverse();
    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const dateStr of sortedDates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [completionHistory]);

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return Object.entries(completionHistory)
      .filter(([_, dates]) => dates.includes(today))
      .reduce((acc, [id, _]) => ({ ...acc, [id]: true }), {} as Record<string, boolean>);
  }, [completionHistory]);

  return {
    practiceStack,
    setPracticeStack,
    practiceNotes,
    setPracticeNotes,
    dailyNotes,
    setDailyNotes,
    completionHistory,
    setCompletionHistory,
    findModuleKey,
    addToStack,
    removeFromStack,
    handleSaveCustomPractice,
    savePersonalizedPractice,
    updatePracticeNote,
    updateDailyNote,
    togglePracticeCompletion,
    getStreak,
    completedToday,
  };
}
