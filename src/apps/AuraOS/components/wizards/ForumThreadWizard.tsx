/**
 * ForumThreadWizard - Create New Forum Thread
 * 2-step wizard: 1) Title + Category, 2) Description + Review
 * AI Coach replies only to user posts (not on thread creation)
 */

import React, { useState } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { ForumCategory, CreateThreadInput } from '../../types';
import { createThread } from '../../services/forumService';
import {
  NetworkNodesIcon,
  SeedOfLifeIcon,
  EndlessKnotIcon,
  FlowerOfLifeIcon,
} from '../shared/SacredNavIcons';
import TiptapEditor from '../forum/TiptapEditor';

interface ForumThreadWizardProps {
  onClose: () => void;
  onSuccess: (threadId: string) => void;
}

const categoryOptions: Array<{
  value: ForumCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}> = [
  {
    value: 'practice-sharing',
    label: 'Practice Sharing',
    description: 'Share your practice experiences and learn from others',
    icon: <SeedOfLifeIcon size={20} />,
    colorClass: 'text-emerald-400',
  },
  {
    value: 'insights',
    label: 'Insights',
    description: 'Deep reflections and breakthrough moments',
    icon: <NetworkNodesIcon size={20} />,
    colorClass: 'text-teal-400',
  },
  {
    value: 'questions',
    label: 'Questions',
    description: 'Ask questions and get guidance from the community',
    icon: <EndlessKnotIcon size={20} />,
    colorClass: 'text-amber-400',
  },
  {
    value: 'community',
    label: 'Community',
    description: 'Connect, collaborate, and build relationships',
    icon: <FlowerOfLifeIcon size={20} />,
    colorClass: 'text-rose-400',
  },
];

export default function ForumThreadWizard({ onClose, onSuccess }: ForumThreadWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleNext = () => {
    if (currentStep === 1 && title.trim() && category) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleCreate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !category) return;

    setCreating(true);
    const input: CreateThreadInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
    };

    const newThread = await createThread(input);
    if (newThread) {
      onSuccess(newThread.id);
    } else {
      alert('Failed to create thread. Please try again.');
    }
    setCreating(false);
  };

  const isStep1Valid = title.trim().length >= 10 && category !== null;
  const isStep2Valid = true; // Description is optional

  return (
    <WizardFrame
      title="Start New Discussion"
      currentStep={currentStep}
      totalSteps={2}
      isLoading={creating}
      showBackButton={currentStep > 1}
      nextButtonText={currentStep === 2 ? 'Create Thread' : 'Next'}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="teal"
    >
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="thread-title" className="block text-sm font-medium text-slate-200 mb-2">
              Discussion Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="thread-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              className="
                w-full px-4 py-3 rounded-lg
                bg-slate-800 border border-slate-700
                text-slate-100 placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                transition-all duration-200
                text-base
              "
              maxLength={200}
              autoFocus
            />
            <p className="mt-2 text-xs text-slate-500">
              {title.length}/200 characters (minimum 10)
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCategory(option.value)}
                  className={`
                    p-4 rounded-lg text-left
                    border-2 transition-all duration-200
                    ${
                      category === option.value
                        ? 'border-cyan-500 bg-teal-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${option.colorClass} mt-0.5`}>{option.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">{option.label}</h4>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!isStep1Valid && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400">
                Please enter a title (at least 10 characters) and select a category to continue.
              </p>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Review Title & Category */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Review</div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">{title}</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-cyan-500/30">
              <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">
                {categoryOptions.find((c) => c.value === category)?.label}
              </span>
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Description <span className="text-slate-500">(Optional)</span>
            </label>
            <TiptapEditor
              content={description}
              onChange={setDescription}
              placeholder="Add more context, background, or specific questions..."
            />
            <p className="mt-2 text-xs text-slate-500">
              Content formatting supported: bold, italic, blockquote, code, bullet lists
            </p>
          </div>

          {/* Guidance */}
          <div className="p-4 rounded-lg bg-teal-500/5 border border-cyan-500/20">
            <p className="text-sm text-slate-400 leading-relaxed">
              <strong className="text-teal-400">Tip:</strong> Clear, specific posts tend to get more
              helpful responses. Consider sharing what you've already tried, what's working, and
              what you're curious about.
            </p>
          </div>
        </div>
      )}
    </WizardFrame>
  );
}
