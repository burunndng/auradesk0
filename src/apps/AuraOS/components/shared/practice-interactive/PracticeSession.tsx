import React from 'react';
import { Practice } from '../../../types.ts';
import BreathPacer from './BreathPacer.tsx';
import CountdownTimer from './CountdownTimer.tsx';
import GuidedSteps from './GuidedSteps.tsx';

interface PracticeSessionProps {
  practice: Practice;
  onClose: () => void;
}

export default function PracticeSession({ practice, onClose }: PracticeSessionProps) {
  const { interactiveMode, interactiveConfig } = practice;

  if (!interactiveMode || !interactiveConfig) return null;

  if (interactiveMode === 'breath-pacer' && interactiveConfig.phases?.length) {
    return <BreathPacer phases={interactiveConfig.phases} onStop={onClose} />;
  }

  if (interactiveMode === 'countdown') {
    return (
      <CountdownTimer
        minDuration={interactiveConfig.minDuration ?? 30}
        maxDuration={interactiveConfig.maxDuration ?? 300}
        defaultDuration={interactiveConfig.defaultDuration ?? 60}
        onStop={onClose}
        cues={interactiveConfig.cues}
      />
    );
  }

  if (interactiveMode === 'guided-steps' && interactiveConfig.steps?.length) {
    return <GuidedSteps steps={interactiveConfig.steps} onStop={onClose} />;
  }

  return null;
}
