import React, { lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { Practice, CustomPractice, ModuleKey, ShadowSessionResult } from '../types.ts';
import ModalLoadingFallback from './shared/LoadingFallback.tsx';
import TabLoadingFallback from './shared/LoadingFallback.tsx';
import FlabbergasterPortal from './modals/FlabbergasterPortal.tsx';
import GeometricResonanceGame from './modals/GeometricResonanceGame.tsx';
import VideoMinigame from './shared/VideoMinigame.tsx';
import ShadowSessionViewer from './shared/ShadowSessionViewer.tsx';

// Lazy-loaded Modal Components
const PracticeInfoModal = lazy(() => import('./modals/PracticeInfoModal.tsx'));
const PracticeExplanationModal = lazy(() => import('./modals/PracticeExplanationModal.tsx'));
const PracticeCustomizationModal = lazy(() => import('./modals/PracticeCustomizationModal.tsx'));
const CustomPracticeModal = lazy(() => import('./modals/CustomPracticeModal.tsx'));
const GuidedPracticeGenerator = lazy(() => import('./modals/GuidedPracticeGenerator.tsx'));
const EnergyWorkGuideModal = lazy(() => import('./modals/EnergyWorkGuideModal.tsx'));
const AuthModal = lazy(() => import('./modals/AuthModal.tsx'));
const UpgradeModal = lazy(() => import('./shared/UpgradeModal.tsx'));
const MigrationPrompt = lazy(() => import('./shared/MigrationPrompt.tsx'));
const ExportDataWizard = lazy(() => import('./wizards/ExportDataWizard.tsx'));

interface ModalRoutesProps {
  // Info Modal
  infoModalPractice: Practice | null;
  setInfoModalPractice: (practice: Practice | null) => void;

  // Explanation Modal
  explanationModal: { isOpen: boolean; title: string; explanation: string };
  setExplanationModal: (state: { isOpen: boolean; title: string; explanation: string }) => void;

  // Customization Modal
  customizationModalPractice: Practice | null;
  setCustomizationModalPractice: (practice: Practice | null) => void;

  // Custom Practice Modal
  isCustomPracticeModalOpen: boolean;
  setIsCustomPracticeModalOpen: (isOpen: boolean) => void;

  // Guided Practice Generator
  isGuidedPracticeGeneratorOpen: boolean;
  setIsGuidedPracticeGeneratorOpen: (isOpen: boolean) => void;

  // Energy Work Guide
  isEnergyWorkGuideOpen: boolean;
  setIsEnergyWorkGuideOpen: (isOpen: boolean) => void;

  // Shadow Session Viewer
  viewingShadowSession: ShadowSessionResult | null;
  setViewingShadowSession: (session: ShadowSessionResult | null) => void;

  // Auth Modal
  showAuthModal: boolean;
  setShowAuthModal: (isOpen: boolean) => void;

  // Flabbergaster Portal
  isFlabbergasterPortalOpen: boolean;
  setIsFlabbergasterPortalOpen: (isOpen: boolean) => void;
  hasUnlockedFlabbergaster: boolean;
  onHiddenModeDiscovered: () => void;

  // Geometric Game
  isGeometricGameOpen: boolean;
  setIsGeometricGameOpen: (isOpen: boolean) => void;

  // Video Game
  isVideoGameOpen: boolean;
  setIsVideoGameOpen: (isOpen: boolean) => void;

  // Export Wizard
  isExportWizardOpen: boolean;
  setIsExportWizardOpen: (isOpen: boolean) => void;

  // Event handlers
  addToStack: (practice: Practice) => void;
  handleExplainPractice: (practice: Practice) => void;
  handlePersonalizePractice: (practiceId: string, personalizedSteps: string[]) => void;
  handleSaveCustomPractice: (practice: CustomPractice, module: ModuleKey) => void;

  // Data
  userId: string;
  practiceStack: Practice[];
}

export default React.memo(function ModalRoutes(props: ModalRoutesProps) {
  const {
    infoModalPractice,
    setInfoModalPractice,
    explanationModal,
    setExplanationModal,
    customizationModalPractice,
    setCustomizationModalPractice,
    isCustomPracticeModalOpen,
    setIsCustomPracticeModalOpen,
    isGuidedPracticeGeneratorOpen,
    setIsGuidedPracticeGeneratorOpen,
    isEnergyWorkGuideOpen,
    setIsEnergyWorkGuideOpen,
    viewingShadowSession,
    setViewingShadowSession,
    showAuthModal,
    setShowAuthModal,
    isFlabbergasterPortalOpen,
    setIsFlabbergasterPortalOpen,
    hasUnlockedFlabbergaster,
    onHiddenModeDiscovered,
    isGeometricGameOpen,
    setIsGeometricGameOpen,
    isVideoGameOpen,
    setIsVideoGameOpen,
    isExportWizardOpen,
    setIsExportWizardOpen,
    addToStack,
    handleExplainPractice,
    handlePersonalizePractice,
    handleSaveCustomPractice,
    userId,
    practiceStack,
  } = props;

  return (
    <>
      {/* Practice Info Modal */}
      {infoModalPractice && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PracticeInfoModal
            practice={infoModalPractice}
            onClose={() => setInfoModalPractice(null)}
            onAdd={addToStack}
            isInStack={practiceStack.some(p => p.id === infoModalPractice.id)}
            onExplainClick={handleExplainPractice}
            onPersonalizeClick={setCustomizationModalPractice}
          />
        </Suspense>
      )}

      {/* Practice Explanation Modal */}
      {explanationModal.isOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PracticeExplanationModal
            isOpen={explanationModal.isOpen}
            onClose={() => setExplanationModal({ isOpen: false, title: '', explanation: '' })}
            title={explanationModal.title}
            explanation={explanationModal.explanation}
          />
        </Suspense>
      )}

      {/* Practice Customization Modal */}
      {customizationModalPractice && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PracticeCustomizationModal
            userId={userId}
            practice={customizationModalPractice}
            onClose={() => setCustomizationModalPractice(null)}
            onSave={(practiceId, personalizedSteps) => {
              handlePersonalizePractice(practiceId, personalizedSteps);
              setCustomizationModalPractice(null);
            }}
          />
        </Suspense>
      )}

      {/* Custom Practice Modal */}
      {isCustomPracticeModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <CustomPracticeModal
            isOpen={isCustomPracticeModalOpen}
            onClose={() => setIsCustomPracticeModalOpen(false)}
            onSave={handleSaveCustomPractice}
          />
        </Suspense>
      )}

      {/* Guided Practice Generator */}
      {isGuidedPracticeGeneratorOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <GuidedPracticeGenerator
            isOpen={isGuidedPracticeGeneratorOpen}
            onClose={() => setIsGuidedPracticeGeneratorOpen(false)}
            onLogPractice={() => alert('Practice logged!')}
          />
        </Suspense>
      )}

      {/* Energy Work Guide Modal */}
      {isEnergyWorkGuideOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <EnergyWorkGuideModal
            isOpen={isEnergyWorkGuideOpen}
            onClose={() => setIsEnergyWorkGuideOpen(false)}
          />
        </Suspense>
      )}

      {/* Shadow Session Viewer */}
      {viewingShadowSession && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <ShadowSessionViewer
            session={viewingShadowSession}
            onClose={() => setViewingShadowSession(null)}
          />
        </Suspense>
      )}

      {/* Auth Modal - Sign In/Register (Supabase Auth) */}
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>

      {/* Upgrade Modal - Premium subscription */}
      <Suspense fallback={null}>
        <UpgradeModal />
      </Suspense>

      {/* Migration Prompt - Data migration from localStorage to Supabase */}
      <Suspense fallback={null}>
        <MigrationPrompt />
      </Suspense>

      {/* Flabbergaster Portal */}
      <FlabbergasterPortal
        isOpen={isFlabbergasterPortalOpen}
        onClose={() => setIsFlabbergasterPortalOpen(false)}
        hasUnlocked={hasUnlockedFlabbergaster}
        onHiddenModeDiscovered={onHiddenModeDiscovered}
        onStartGeometricGame={() => {
          setIsFlabbergasterPortalOpen(false);
          setIsGeometricGameOpen(true);
        }}
        onStartVideoGame={() => {
          setIsFlabbergasterPortalOpen(false);
          setIsVideoGameOpen(true);
        }}
        onGameComplete={(data) => {
          if (data?.resonanceAchieved) {
            setIsFlabbergasterPortalOpen(true);
          }
        }}
      />

      {/* Geometric Resonance Game */}
      <GeometricResonanceGame
        isOpen={isGeometricGameOpen}
        onClose={(data) => {
          setIsGeometricGameOpen(false);
          if ((window as any).__handleGameCompletion) {
            (window as any).__handleGameCompletion(data);
          }
        }}
        onGameEvent={(event, data) => {
          console.log(`🎮 Game Event: ${event}`, data);
        }}
      />

      {/* Video Minigame */}
      <VideoMinigame
        isOpen={isVideoGameOpen}
        onClose={() => setIsVideoGameOpen(false)}
        videoSources={[
          { src: "https://files.catbox.moe/xl0g67.webp", type: "video/webp" },
          { src: "https://files.catbox.moe/phesm3.avif", type: "image/avif" },
          { src: "https://files.catbox.moe/hw4tg3.mp4", type: "video/mp4" }
        ]}
        title="Second Minigame (Coming Soon)"
      />

      {/* Export Data Wizard */}
      {isExportWizardOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <ExportDataWizard
            isOpen={isExportWizardOpen}
            onClose={() => setIsExportWizardOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
});
