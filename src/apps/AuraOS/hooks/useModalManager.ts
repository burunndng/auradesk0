import { useState } from 'react';
import { useStorage as useLocalStorage } from './useStorage';
import { Practice, ShadowSessionResult } from '../types';

export function useModalManager() {
  const [infoModalPractice, setInfoModalPractice] = useState<Practice | null>(null);
  const [explanationModal, setExplanationModal] = useState<{ isOpen: boolean; title: string; explanation: string }>({
    isOpen: false, title: '', explanation: ''
  });
  const [customizationModalPractice, setCustomizationModalPractice] = useState<Practice | null>(null);
  const [isCustomPracticeModalOpen, setIsCustomPracticeModalOpen] = useState(false);
  const [isGuidedPracticeGeneratorOpen, setIsGuidedPracticeGeneratorOpen] = useState(false);
  const [isEnergyWorkGuideOpen, setIsEnergyWorkGuideOpen] = useState(false);
  const [viewingShadowSession, setViewingShadowSession] = useState<ShadowSessionResult | null>(null);

  // Easter Egg States
  const [isFlabbergasterPortalOpen, setIsFlabbergasterPortalOpen] = useLocalStorage<boolean>('isFlabbergasterPortalOpen', false);
  const [hasUnlockedFlabbergaster, setHasUnlockedFlabbergaster] = useLocalStorage<boolean>('hasUnlockedFlabbergaster', false);
  const [isGeometricGameOpen, setIsGeometricGameOpen] = useState(false);
  const [isVideoGameOpen, setIsVideoGameOpen] = useState(false);
  const [hasDiscoveredHiddenMode, setHasDiscoveredHiddenMode] = useLocalStorage<boolean>('hasDiscoveredHiddenMode', false);

  const onSummonFlabbergaster = () => {
    setIsFlabbergasterPortalOpen(prev => !prev);
    if (!hasUnlockedFlabbergaster) {
      setHasUnlockedFlabbergaster(true);
    }
  };

  const onHiddenModeDiscovered = () => {
    if (!hasDiscoveredHiddenMode) {
      setHasDiscoveredHiddenMode(true);
    }
  };

  const [isExportWizardOpen, setIsExportWizardOpen] = useState(false);

  return {
    infoModalPractice, setInfoModalPractice,
    explanationModal, setExplanationModal,
    customizationModalPractice, setCustomizationModalPractice,
    isCustomPracticeModalOpen, setIsCustomPracticeModalOpen,
    isGuidedPracticeGeneratorOpen, setIsGuidedPracticeGeneratorOpen,
    isEnergyWorkGuideOpen, setIsEnergyWorkGuideOpen,
    viewingShadowSession, setViewingShadowSession,
    isExportWizardOpen, setIsExportWizardOpen,

    // Easter Eggs
    isFlabbergasterPortalOpen, setIsFlabbergasterPortalOpen,
    hasUnlockedFlabbergaster, setHasUnlockedFlabbergaster,
    isGeometricGameOpen, setIsGeometricGameOpen,
    isVideoGameOpen, setIsVideoGameOpen,
    hasDiscoveredHiddenMode, onHiddenModeDiscovered,
    onSummonFlabbergaster
  };
}
