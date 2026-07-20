import React, { useState } from 'react';
import { BioenergeneticsPractice, BioenergeneticsSession, IntegratedInsight } from '../../types.ts';
import BioenergeneticsMenu from '../shared/BioenergeneticsMenu.tsx';
import BioenergeneticsSubWizard from './BioenergeneticsSubWizard.tsx';
import { saveBioenergeneticsSession } from '../../services/bioenergeneticsSessionService.ts';
import { StorageManager } from '../../.claude/lib/storageManager.ts';
import { bioenergeneticsPractices as bioenergeneticsData } from '../../data/bioenergeneticsLibrary.ts';

interface BioenergeneticsWizardProps {
  onClose: () => void;
  onSessionSave?: (session: BioenergeneticsSession) => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

export default function BioenergeneticsWizard({ onClose, onSessionSave, insightContext, markInsightAsAddressed }: BioenergeneticsWizardProps) {
  const [selectedPractice, setSelectedPractice] = useState<BioenergeneticsPractice | null>(null);
  const [linkedInsightId] = useState<string | undefined>(insightContext?.id);
  const [bioenergeneticsPractices] = useState<BioenergeneticsPractice[]>(bioenergeneticsData);
  const [userId] = useState(() => {
    try {
      const id = StorageManager.getUntyped('userId') as string | null;
      return id || `user-${Math.random().toString(36).substr(2, 9)}`;
    } catch {
      return `user-${Math.random().toString(36).substr(2, 9)}`;
    }
  });


  const handlePracticeSelect = (practice: BioenergeneticsPractice) => {
    setSelectedPractice(practice);
  };

  const handleSessionSave = async (session: BioenergeneticsSession) => {
    try {
      await saveBioenergeneticsSession(session);
      if (onSessionSave) {
        onSessionSave(session);
      }
    } catch (error) {
      console.error('Failed to save bioenergetics session:', error);
    }
  };

  const handleBack = () => {
    setSelectedPractice(null);
  };

  return (
    <div>
      {!selectedPractice ? (
        <BioenergeneticsMenu
          practices={bioenergeneticsPractices}
          onSelectPractice={handlePracticeSelect}
          onClose={onClose}
        />
      ) : (
        <BioenergeneticsSubWizard
          practice={selectedPractice}
          userId={userId}
          onBack={handleBack}
          onSessionSave={handleSessionSave}
          linkedInsightId={linkedInsightId}
          markInsightAsAddressed={markInsightAsAddressed}
        />
      )}
    </div>
  );
}
