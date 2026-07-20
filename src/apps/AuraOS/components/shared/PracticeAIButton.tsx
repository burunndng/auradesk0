import React, { useState } from 'react';
import ResonatorIcon from '../visualizations/SacredGeometryIcons/ResonatorIcon';
import { VoiceChatModal } from './VoiceChatModal';

interface PracticeAIButtonProps {
  aiPrompt: string;
  practiceName: string;
}

export const PracticeAIButton: React.FC<PracticeAIButtonProps> = ({ aiPrompt, practiceName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-xs font-bold text-teal-400 bg-teal-400/10 hover:bg-teal-400/20 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-400/20"
        title={`Live voice practice with AI for ${practiceName}`}
      >
        <ResonatorIcon size={14} className="text-teal-400" />
        <span>Voice Session</span>
      </button>

      <VoiceChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        systemInstruction={aiPrompt}
        practiceName={practiceName}
      />
    </>
  );
};
