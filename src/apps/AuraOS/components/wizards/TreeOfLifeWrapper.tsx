import React, { lazy, Suspense, useState } from 'react';
const TreeOfLifeVisualization = lazy(() => import('../visualizations/TreeOfLifeVisualization'));
import TreeOfLifeWizard from './TreeOfLifeWizard';

interface TreeOfLifeWrapperProps {
  onClose: () => void;
  userId?: string;
}

export default function TreeOfLifeWrapper({ onClose, userId }: TreeOfLifeWrapperProps) {
  const [selectedSephiraId, setSelectedSephiraId] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState(true);

  const handleSelectSephira = (sephiraId: string) => {
    setSelectedSephiraId(sephiraId);
    setShowVisualization(false);
  };

  const handleSkip = () => {
    setSelectedSephiraId(null);
    setShowVisualization(false);
  };

  if (showVisualization) {
    return (
      <div className="fixed inset-0 bg-stone-950 z-50">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-stone-500 text-sm">Loading visualization…</div>}>
          <TreeOfLifeVisualization
            onSelectSephira={handleSelectSephira}
            onSkip={handleSkip}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <TreeOfLifeWizard
      onClose={onClose}
      userId={userId}
      initialSephiraId={selectedSephiraId}
    />
  );
}
