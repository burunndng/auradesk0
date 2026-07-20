import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';


// Core Components (always loaded)
import NavSidebar, { navItems } from './components/shared/NavSidebar.tsx';
import { CommandPalette, trackRecent } from './components/shared/CommandPalette.tsx';
import BottomNavBar from './components/shared/BottomNavBar.tsx';
import SettingsFloatingButton from './components/shared/SettingsFloatingButton.tsx';
import { TabLoadingFallback, WizardLoadingFallback } from './components/shared/LoadingFallback.tsx';
import { OfflineIndicator } from './components/shared/OfflineIndicator';
import { useVirtualKeyboard } from './hooks/useVirtualKeyboard';
import ErrorBoundary from './components/shared/ErrorBoundary.tsx';
import { ToastProvider } from './components/shared/ToastContext.tsx';
import { StorageQuotaWarning } from './components/shared/StorageQuotaWarning.tsx';
import { StorageManager } from './.claude/lib/storageManager';
import AuthCallback from './components/AuthCallback.tsx';
import GateScreen from './components/GateScreen.tsx';
import AppOnboarding from './components/shared/AppOnboarding.tsx';
import { useToast } from './components/shared/ToastContext.tsx';

// Lazy-loaded Core Enhancements
const AnimatedMerkabaCoach = lazy(() => import('./components/shared/AnimatedMerkabaCoach.tsx'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel.tsx'));

// Routing Components
import TabRoutes from './components/TabRoutes.tsx';
import WizardRoutes from './components/WizardRoutes.tsx';
import ModalRoutes from './components/ModalRoutes.tsx';

// Types & Constants
import { practices as corePractices, modules } from './constants.ts';
import { ActiveTab, CustomPractice, ModuleKey } from './types.ts';

// Services
import * as aiService from './services/aiService.ts';
import { getWizardSequenceContext } from './services/wizardSequenceContext.ts';
import { startForumBot, stopForumBot } from './services/forumBotService.ts';
import { supabase } from './services/supabaseClient.ts';

import {
  PracticeProvider,
  UserProvider,
  InsightsProvider,
  AIProvider,
  WizardProvider,
  NavigationProvider,
  ModalProvider,
  usePracticeContext,
  useNavigationContext,
  useUserContext,
  useInsightsContext,
  useAIContext,
  useWizardContext,
  useModalContext
} from './contexts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function AuraApp() {
  // Check if we're handling an auth callback
  const isAuthCallback = window.location.hash.includes('access_token') ||
    window.location.hash.includes('error=');

  // If handling auth callback, show callback component
  if (isAuthCallback) {
    return <AuthCallback />;
  }

  useVirtualKeyboard();

  // 1. Practice Management (only what App-level JSX needs directly)
  const practiceStore = usePracticeContext();
  const {
    practiceStack, practiceNotes, dailyNotes, completionHistory,
    completedToday, addToStack, getStreak,
  } = practiceStore;

  // 2. Navigation & UI
  const nav = useNavigationContext();
  const {
    activeTab, activeWizard, setActiveWizard,
    navigationStack, linkedInsightId,
    navigateBack, handleTabChange, activeModule
  } = nav;

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 3. Insights (now from context)
  const { integratedInsights, markInsightAsAddressed } = useInsightsContext();

  // 4. AI & User Session
  const user = useUserContext();
  const ai = useAIContext();

  // 5. Wizard Sessions
  const wizards = useWizardContext();

  // 6. Modals
  const modals = useModalContext();

  // 7. Toast
  const { addToast } = useToast();

  // 8. Admin
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.isAdmin === true;
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Handlers for ModalRoutes (explain/personalize/save custom practice)
  const handleExplainPractice = async (practice: any) => {
    modals.setExplanationModal({ isOpen: true, title: practice.name, explanation: "Aura is thinking..." });
    try {
      const explanation = await aiService.explainPractice(practice);
      modals.setExplanationModal({ isOpen: true, title: practice.name, explanation });
    } catch (e) {
      modals.setExplanationModal({ isOpen: true, title: practice.name, explanation: "Sorry, I couldn't generate an explanation." });
    }
  };

  const handlePersonalizePractice = (practiceId: string, personalizedSteps: string[]) => {
    practiceStore.savePersonalizedPractice(practiceId, personalizedSteps);
    modals.setCustomizationModalPractice(null);
  };

  const onSaveCustomPractice = (practice: CustomPractice, module: ModuleKey) => {
    practiceStore.handleSaveCustomPractice(practice, module);
    modals.setIsCustomPracticeModalOpen(false);
  };

  const handleExport = useCallback(() => {
    // ... (keep implementation)
    console.log('Exporting data...');
    try {
      const data = StorageManager.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Export complete');
    } catch (err) {
      console.error('Export failed:', err);
      addToast('Failed to export data', 'error');
    }
  }, [addToast]);

  const handleImport = useCallback(() => {
    // ... (keep implementation)
    console.log('Starting import...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          StorageManager.importAll(data);
          window.location.reload();
        } catch (err) {
          console.error('Import failed:', err);
          addToast('Failed to import data', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  // Note: Shadow tool handlers and allPractices are now handled inside TabRoutes via context.

  // Note: handleMobileTabChange removed — BottomNavBar uses handleTabChange from context directly.

  // Start automated forum bot when user is authenticated
  // Feature flag: VITE_ENABLE_FORUM_BOT (defaults to false)
  const forumBotEnabled = import.meta.env.VITE_ENABLE_FORUM_BOT === 'true';

  useEffect(() => {
    if (!forumBotEnabled) {
      console.log('[App] Forum bot is disabled (VITE_ENABLE_FORUM_BOT=false)');
      return;
    }

    // Try to start bot immediately (will skip if not authenticated)
    startForumBot();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('[App] User signed in, starting forum bot...');
        startForumBot();
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out, stopping forum bot...');
        stopForumBot();
      }
    });

    return () => {
      stopForumBot();
      authListener?.subscription?.unsubscribe();
    };
  }, [forumBotEnabled]);


  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans relative overflow-hidden"
      data-module={activeModule}>
      <OfflineIndicator />
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 opacity-60" />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 relative z-20">
        <NavSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSignIn={() => user.setShowAuthModal(true)}
          onExport={() => modals.setIsExportWizardOpen(true)}
          onImport={handleImport}
          onReset={() => { if (window.confirm('Reset all data?')) localStorage.clear(); window.location.reload(); }}
          onSummonFlabbergaster={modals.onSummonFlabbergaster}
          hasUnlockedFlabbergaster={modals.hasUnlockedFlabbergaster}
          isAdmin={isAdmin}
          onOpenAdmin={() => setShowAdminPanel(true)}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="flex items-center justify-between px-4 py-3 border-b border-accent/20 flex-shrink-0 min-h-[56px] lg:flex md:flex hidden">
          <div className="flex items-center gap-2">
            {navigationStack.length > 0 && (
              <button onClick={navigateBack} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-accent">
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 pb-32 lg:pb-8 relative z-10" style={{ background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.6) 100%)', backdropFilter: 'blur(4px)', WebkitOverflowScrolling: 'touch', scrollPaddingBottom: '8rem' }}>
          <Suspense fallback={<TabLoadingFallback />}>
            {/* TabRoutes reads all state from context directly - no props needed */}
            <TabRoutes />
          </Suspense>
        </div>
      </main>

      <AppOnboarding onStartWizard={(id) => setActiveWizard(id)} />

      <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Suspense fallback={
            <div className="w-[72px] h-[72px] rounded-full bg-slate-800/60 backdrop-blur-md border border-accent/20 shadow-2xl flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
            </div>
          }>
            <AnimatedMerkabaCoach
              userId={user.userId}
              practiceStack={practiceStack}
              completedCount={Object.values(completedToday).filter(Boolean).length}
              completionRate={practiceStack.length > 0 ? (Object.values(completedToday).filter(Boolean).length / practiceStack.length) * 100 : 0}
              timeCommitment={practiceStack.reduce((sum, p) => sum + p.timePerWeek, 0)}
              timeIndicator={"Balanced"}
              modules={modules}
              getStreak={getStreak}
              practiceNotes={practiceNotes}
              dailyNotes={dailyNotes}
              userProfile={user.userProfile}
              currentTab={activeTab}
              onUnlockFlabbergaster={modals.onSummonFlabbergaster}
              onNavigateToTab={handleTabChange}
              onAddPractice={addToStack}
              onOpenWizard={(id) => setActiveWizard(id as any)}
              onShowCelebration={() => addToast('🎉 Practice complete! Keep going!', 'success')}
            />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<WizardLoadingFallback />}>
        <WizardRoutes
          activeWizard={activeWizard}
          linkedInsightId={linkedInsightId}
          navigateBack={navigateBack}
          getWizardSequenceContext={getWizardSequenceContext}
          getActiveInsightContext={() => {
            if (!linkedInsightId) return null;
            return integratedInsights.find((insight: any) => insight.id === linkedInsightId) || null;
          }}

          // Structured Data
          handlers={wizards.handlers as any}
          drafts={wizards.drafts}
          history={wizards.history as any}

          // Additional Context
          partsLibrary={wizards.history.partsLibrary}
          markInsightAsAddressed={markInsightAsAddressed}
          userId={user.userId}
          practiceStack={practiceStack}
          completionHistory={completionHistory}
          addToStack={addToStack}
          integratedInsights={integratedInsights}
          corePractices={corePractices as any}
          currentPersonalizationSummary={null}
        />
      </Suspense>

      <ModalRoutes
        infoModalPractice={modals.infoModalPractice}
        setInfoModalPractice={modals.setInfoModalPractice}
        explanationModal={modals.explanationModal}
        setExplanationModal={modals.setExplanationModal}
        customizationModalPractice={modals.customizationModalPractice}
        setCustomizationModalPractice={modals.setCustomizationModalPractice}
        isCustomPracticeModalOpen={modals.isCustomPracticeModalOpen}
        setIsCustomPracticeModalOpen={modals.setIsCustomPracticeModalOpen}
        isGuidedPracticeGeneratorOpen={modals.isGuidedPracticeGeneratorOpen}
        setIsGuidedPracticeGeneratorOpen={modals.setIsGuidedPracticeGeneratorOpen}
        isEnergyWorkGuideOpen={modals.isEnergyWorkGuideOpen}
        setIsEnergyWorkGuideOpen={modals.setIsEnergyWorkGuideOpen}
        viewingShadowSession={modals.viewingShadowSession}
        setViewingShadowSession={modals.setViewingShadowSession}
        showAuthModal={user.showAuthModal}
        setShowAuthModal={user.setShowAuthModal}
        isFlabbergasterPortalOpen={modals.isFlabbergasterPortalOpen}
        setIsFlabbergasterPortalOpen={modals.setIsFlabbergasterPortalOpen}
        hasUnlockedFlabbergaster={modals.hasUnlockedFlabbergaster}
        onHiddenModeDiscovered={modals.onHiddenModeDiscovered}
        isGeometricGameOpen={modals.isGeometricGameOpen}
        setIsGeometricGameOpen={modals.setIsGeometricGameOpen}
        isVideoGameOpen={modals.isVideoGameOpen}
        setIsVideoGameOpen={modals.setIsVideoGameOpen}
        isExportWizardOpen={modals.isExportWizardOpen}
        setIsExportWizardOpen={modals.setIsExportWizardOpen}
        addToStack={addToStack}
        handleExplainPractice={handleExplainPractice}
        handlePersonalizePractice={handlePersonalizePractice}
        handleSaveCustomPractice={onSaveCustomPractice}
        userId={user.userId}
        practiceStack={practiceStack}
      />

      {/* Bottom Navigation Bar (Mobile Only) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Settings Floating Button (Mobile Only) */}
      <SettingsFloatingButton
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Admin floating button — only visible to admin users */}
      {isAdmin && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed bottom-4 left-4 z-40 w-9 h-9 rounded-full bg-slate-800 border border-red-900/50 flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors"
          title="Admin Panel"
          aria-label="Open admin panel"
        >
          <span className="text-base leading-none">⚙️</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <Suspense fallback={null}>
          <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
        </Suspense>
      )}

      {/* Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        navItems={navItems}
        onNavigate={(id) => {
          handleTabChange(id as ActiveTab);
        }}
      />
    </div>
  );
}

export default function App() {
  const [gateCleared, setGateCleared] = useState(() =>
    sessionStorage.getItem('aura-gate') === '1'
  );

  if (!gateCleared) {
    return (
      <GateScreen
        onAccessGranted={() => {
          sessionStorage.setItem('aura-gate', '1');
          setGateCleared(true);
        }}
      />
    );
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <StorageQuotaWarning />
        <AuthProvider>
          <SubscriptionProvider>
            <NavigationProvider>
              <PracticeProvider>
                <UserProvider>
                  <InsightsProvider>
                    <AIProvider>
                      <WizardProvider>
                        <ModalProvider>
                          <AuraApp />
                        </ModalProvider>
                      </WizardProvider>
                    </AIProvider>
                  </InsightsProvider>
                </UserProvider>
              </PracticeProvider>
            </NavigationProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}