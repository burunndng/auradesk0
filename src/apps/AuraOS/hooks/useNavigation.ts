import { useState, useCallback, useEffect } from 'react';
import { useStorage as useLocalStorage } from './useStorage';
import { ActiveTab, NavigationEntry } from '../types';

// ── ILP module type ─────────────────────────────────────────────────────────
export type ILPModule = 'shadow' | 'mind' | 'body' | 'spirit';

/**
 * Maps every tab ID to its canonical ILP module.
 * Tabs without a clear module affinity map to null — these inherit lastNonDashboardModule.
 */
export const TAB_TO_MODULE: Record<string, ILPModule | null> = {
  'shadow-tools':              'shadow',
  'mind-tools':                'mind',
  'sensemaking-lab':           'mind',
  'framework-encyclopedia':    'mind',
  'integral-theory':           'mind',
  'aqal-learning':             'mind',
  'integral-history':          'mind',
  'metamodern-bridge':         'mind',
  'practice-ecology':          'mind',
  'aqal':                      'mind',
  'quiz':                      'mind',
  'body-tools':                'body',
  'tracker':                   'body',
  'spirit-tools':              'spirit',
  'journey':                   'spirit',
  // Neutral — inherit lastNonDashboardModule
  'dashboard':       null,
  'practice-hub':    null,
  'browse':          null,
  'stack':           null,
  'tools':           null,
  'insights-hub':    null,
  'my-insights':     null,
  'recommendations': null,
  'learn-hub':       null,
  'library':         null,
  'forum':           null,
  'profile':         null,
  'outro':           null,
  'print-report':    null,
  'tool-guide':      null,
};

const FALLBACK_MODULE: ILPModule = 'shadow';

export function useNavigation() {
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>('activeTab', 'dashboard');
  const [activeWizard, _setActiveWizard] = useLocalStorage<string | null>('activeWizard', null);
  const [navigationStack, setNavigationStack] = useState<NavigationEntry[]>([]);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastClosedWizard, setLastClosedWizard] = useState<string | null>(null);

  const [lastNonDashboardModule, setLastNonDashboardModule] = useLocalStorage<ILPModule>(
    'aura-last-module',
    FALLBACK_MODULE
  );

  const directModule = TAB_TO_MODULE[activeTab];
  const activeModule: ILPModule = directModule ?? lastNonDashboardModule;

  useEffect(() => {
    if (directModule !== null && directModule !== undefined) {
      setLastNonDashboardModule(directModule);
    }
  }, [activeTab, directModule, setLastNonDashboardModule]);

  const setActiveWizard = useCallback((wizardId: string | null) => {
    if (wizardId === null && activeWizard !== null) {
      setLastClosedWizard(activeWizard);
    }
    _setActiveWizard(wizardId);
  }, [activeWizard, _setActiveWizard]);

  const navigateTo = useCallback((
    newTab: ActiveTab,
    wizardId?: string | null,
    insightId?: string | null
  ) => {
    const currentEntry: NavigationEntry = {
      tab: activeTab,
      activeWizard: activeWizard,
      linkedInsightId: linkedInsightId,
      timestamp: Date.now(),
    };
    setNavigationStack(prev => [...prev, currentEntry].slice(-9));
    setActiveTab(newTab);
    setActiveWizard(wizardId ?? null);
    setLinkedInsightId(insightId ?? undefined);
  }, [activeTab, activeWizard, linkedInsightId, setActiveTab, setActiveWizard]);

  const navigateBack = useCallback(() => {
    if (navigationStack.length === 0) { setActiveWizard(null); return; }
    setNavigationStack(prev => {
      const newStack = [...prev];
      const previousEntry = newStack.pop();
      if (previousEntry) {
        setActiveTab(previousEntry.tab);
        setActiveWizard(previousEntry.activeWizard ?? null);
        setLinkedInsightId(previousEntry.linkedInsightId);
      }
      return newStack;
    });
  }, [navigationStack, setActiveTab, setActiveWizard]);

  const setActiveWizardAndLink = useCallback((wizardName: string | null, insightId?: string) => {
    navigateTo(activeTab, wizardName, insightId);
  }, [activeTab, navigateTo]);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    navigateTo(tab);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [navigateTo]);

  return {
    activeTab, setActiveTab,
    activeWizard, setActiveWizard,
    navigationStack,
    linkedInsightId, setLinkedInsightId,
    sidebarOpen, setSidebarOpen,
    navigateTo, navigateBack,
    setActiveWizardAndLink, handleTabChange,
    lastClosedWizard, setLastClosedWizard,
    /** Current ILP module — drives data-module and --module-accent throughout the UI */
    activeModule,
    lastNonDashboardModule,
  };
}
