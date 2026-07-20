
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Practice, ModuleKey } from '../../types.ts';
import { X, Plus, Clock, BarChart3, Zap, Sparkles, Lightbulb, CheckCircle2, Info, BookOpen, Play, Wand2 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import PracticeSession from '../shared/practice-interactive/PracticeSession.tsx';

interface PracticeInfoModalProps {
  practice: Practice | null;
  moduleKey?: ModuleKey;
  onClose: () => void;
  onAdd: (practice: Practice) => void;
  isInStack: boolean;
  onExplainClick: (practice: Practice) => void;
  onPersonalizeClick: (practice: Practice) => void;
  onPracticeWithAI?: (practice: Practice) => void;
  hasAttachmentAssessment?: boolean;
  onLaunchWizard?: (key: string) => void;
}

const moduleColors: Record<string, string> = {
  body: 'text-orange-400 bg-orange-400/10',
  mind: 'text-teal-400 bg-teal-400/10',
  spirit: 'text-yellow-400 bg-yellow-400/10',
  shadow: 'text-purple-400 bg-purple-400/10'
};

export default function PracticeInfoModal({
  practice,
  moduleKey,
  onClose,
  onAdd,
  isInStack,
  onExplainClick,
  onPersonalizeClick,
  onPracticeWithAI,
  hasAttachmentAssessment,
  onLaunchWizard,
}: PracticeInfoModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    if (practice) {
      setSessionActive(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [practice]);

  const parsedSteps = useMemo(() => {
    if (!practice) return [];
    let stepNum = 0;
    return practice.how.reduce<Array<{ type: 'section'; title: string; key: number } | { type: 'step'; num: number; text: string; key: number }>>((acc, step, index) => {
      if (!step || step.trim() === '') return acc;
      const sectionMatch = step.match(/^═+\s*(.+?)\s*═+$/);
      if (sectionMatch) {
        stepNum = 0;
        acc.push({ type: 'section', title: sectionMatch[1], key: index });
      } else {
        stepNum++;
        acc.push({ type: 'step', num: stepNum, text: step, key: index });
      }
      return acc;
    }, []);
  }, [practice]);

  if (!practice) return null;

  const handleExplain = () => {
    onExplainClick(practice);
    onClose();
  };

  const handlePersonalize = () => {
    onPersonalizeClick(practice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <motion.div
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[80vh] md:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Header Section */}
        <div className="relative p-6 sm:p-8 border-b border-slate-800 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {moduleKey && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${moduleColors[moduleKey] || 'text-slate-400 bg-slate-800'}`}>
                  {moduleKey}
                </span>
              )}
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded uppercase tracking-widest">
                {practice.roi} ROI
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">{practice.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div ref={contentRef} className="flex-grow overflow-y-auto p-6 sm:p-8 scroll-smooth">
        {sessionActive ? (
          <PracticeSession practice={practice} onClose={() => setSessionActive(false)} />
        ) : (
          <div className="space-y-8">
          {practice.imageUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-950/50 p-2 border border-slate-800 shadow-inner">
              <img src={practice.imageUrl} alt={practice.name} className="w-full aspect-video object-cover rounded-xl" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800/50 text-center group hover:bg-slate-800 transition-colors">
              <Clock size={20} className="mx-auto text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-100">{practice.timePerWeek}h</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Per Week</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800/50 text-center group hover:bg-slate-800 transition-colors">
              <BarChart3 size={20} className="mx-auto text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-100">{practice.difficulty}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Difficulty</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800/50 text-center group hover:bg-slate-800 transition-colors">
              <Zap size={20} className="mx-auto text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-100">{practice.roi}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">ROI Rank</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-100 text-lg font-bold font-mono">
              <Info size={18} className="text-accent" />
              <h3>The "Why"</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base bg-slate-800/20 p-4 rounded-2xl border border-slate-800/30">
              {practice.why}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-100 text-lg font-bold font-mono">
              <Sparkles size={18} className="text-purple-400" />
              <h3>Protocol Steps</h3>
            </div>
            <ul className="space-y-3">
              {parsedSteps.map((item) =>
                item.type === 'section' ? (
                  <li key={item.key} className="pt-3 first:pt-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/50 pb-2 mb-1">
                      {item.title}
                    </div>
                  </li>
                ) : (
                  <li key={item.key} className="flex gap-4 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/30 group hover:border-slate-700 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-accent group-hover:text-white transition-colors">
                      {item.num}
                    </span>
                    <span className="text-slate-300 text-sm leading-relaxed">{item.text}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {practice.evidence && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold font-mono uppercase tracking-wider">
                <BookOpen size={16} />
                <span>Evidence & Origins</span>
              </div>
              <p className="text-slate-500 text-xs italic leading-relaxed">
                {practice.evidence}
              </p>
            </div>
          )}
          </div>
        )}
        </div>

        {/* Footer Section */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-950/50 border-t border-slate-800">
          {/* Top row: interactive + wizard buttons */}
          {(practice.interactiveMode || practice.wizardKey) && (
            <div className="flex gap-2 mb-3">
              {practice.interactiveMode && !sessionActive && (
                <button
                  onClick={() => setSessionActive(true)}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                >
                  <Play size={16} /> Begin Practice
                </button>
              )}
              {practice.wizardKey && onLaunchWizard && (
                <button
                  onClick={() => { onLaunchWizard(practice.wizardKey!); onClose(); }}
                  className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                >
                  <Wand2 size={16} /> Launch Wizard
                </button>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-col sm:flex-row flex-1 gap-2">
              <button
                onClick={handleExplain}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
              >
                <Lightbulb size={18} /> <span>Explain</span>
              </button>
              {practice.customizationQuestion && (
                <button
                  onClick={handlePersonalize}
                  className="flex-1 btn-luminous font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles size={18} /> <span>Personalize</span>
                </button>
              )}
            </div>

            {onPracticeWithAI && (
              <button
                onClick={() => onPracticeWithAI(practice)}
                disabled={!hasAttachmentAssessment}
                className={`sm:flex-[0.6] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  hasAttachmentAssessment
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
                title={!hasAttachmentAssessment ? 'Complete an Attachment Assessment first' : undefined}
              >
                <Sparkles size={18} /> <span>Practice with AI</span>
              </button>
            )}

            {isInStack ? (
              <div className="sm:flex-[0.6] bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-3 rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> <span>In Stack</span>
              </div>
            ) : (
              <button
                onClick={() => onAdd(practice)}
                className="sm:flex-[0.6] bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Plus size={18} /> <span>Add to Stack</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
