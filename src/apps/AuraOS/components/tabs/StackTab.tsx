
import React, { lazy, Suspense, useState } from 'react';
// FIX: Correct import React, { useState } from 'react';
import { AllPractice, ModuleKey, Practice, StarterStack } from '../../types.ts';

const PracticeFrequencyHeatmap = lazy(() => import('../visualizations/PracticeFrequencyHeatmap.tsx'));
import { modules, practices as corePractices } from '../../constants.ts';
import { X, GripVertical, Edit2, Save, Plus, CheckCircle2, Trash2, MessageSquare, CheckCircle } from 'lucide-react';
import { AlgorithmIcon, VoidBloomIcon } from '../visualizations/SacredGeometryIcons';

interface StackItemProps {
  practice: AllPractice;
  moduleKey: ModuleKey;
  onRemove: (practiceId: string) => void;
  notes: string;
  onNoteChange: (note: string) => void;
}

const moduleColors: Record<string, string> = {
  body: 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50',
  mind: 'border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50',
  spirit: 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50',
  shadow: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50'
};

const moduleIconColors: Record<string, string> = {
  body: 'text-orange-400',
  mind: 'text-teal-400',
  spirit: 'text-yellow-400',
  shadow: 'text-purple-400'
};

const StackItem: React.FC<StackItemProps> = ({ practice, moduleKey, onRemove, notes, onNoteChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(notes);
  const moduleInfo = modules[moduleKey];

  const handleSaveNote = () => {
    onNoteChange(note);
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative rounded-xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${moduleColors[moduleKey] || 'border-slate-700 bg-slate-800/50'}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-950/30 ${moduleIconColors[moduleKey]}`}>
              {moduleKey}
            </span>
          </div>
          <h3 className="font-bold font-mono text-lg text-slate-100 group-hover:text-white transition-colors">{practice.name}</h3>
          <p className="text-sm text-slate-300 mt-1 line-clamp-2">{practice.description}</p>
        </div>

        <button
          onClick={() => onRemove(practice.id)}
          className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Remove from stack"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/30">
        {isEditing ? (
          <div className="flex flex-col gap-2 animate-fade-in">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm bg-slate-950/50 border border-slate-700/80 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-y min-h-[80px]"
              placeholder="Add your personal 'why' or customization notes..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-300 hover:text-slate-200 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="bg-accent hover:bg-accent/80 text-white text-xs font-bold py-1.5 px-4 rounded-md flex items-center gap-1 transition-all"
              >
                <Save size={12} /> Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 group/notes cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="flex gap-2">
              <MessageSquare size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
              <p className={`text-sm ${note ? 'text-slate-300' : 'text-slate-500 italic'} whitespace-pre-wrap transition-colors group-hover/notes:text-slate-200`}>
                {note || "Add a personal note, intention, or customization..."}
              </p>
            </div>
            <button className="text-slate-500 hover:text-accent p-1 opacity-0 group-hover/notes:opacity-100 transition-all">
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Copied from StreaksTab — calculates current and longest streaks from a list of date strings
const calculateStreaks = (dates: string[]): { current: number; longest: number } => {
  if (!dates || dates.length === 0) return { current: 0, longest: 0 };
  const sortedDates = [...new Set(dates)].map(d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  }).sort((a, b) => b.getTime() - a.getTime());
  if (sortedDates.length === 0) return { current: 0, longest: 0 };
  let longestStreak = 1;
  let currentLongestRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) / (1000 * 3600 * 24);
    if (diff === 1) { currentLongestRun++; } else if (diff > 1) { currentLongestRun = 1; }
    if (currentLongestRun > longestStreak) longestStreak = currentLongestRun;
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1); yesterday.setHours(0, 0, 0, 0);
  const mostRecent = sortedDates[0];
  let currentStreak = 0;
  if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
    let expected = new Date(mostRecent); expected.setHours(0, 0, 0, 0);
    for (const date of sortedDates) {
      if (date.getTime() === expected.getTime()) { currentStreak++; expected.setDate(expected.getDate() - 1); } else break;
    }
    if (currentStreak === 1 && mostRecent.getTime() !== today.getTime()) currentStreak = 0;
  }
  return { current: currentStreak, longest: longestStreak };
};

interface StackTabProps {
  practiceStack: AllPractice[];
  removeFromStack: (practiceId: string) => void;
  practiceNotes: Record<string, string>;
  updatePracticeNote: (practiceId: string, note: string) => void;
  openCustomPracticeModal: () => void;
  openGuidedPracticeGenerator: () => void;
  starterStacks?: Record<string, StarterStack>;
  applyStarterStack?: (practiceIds: string[]) => void;
  completionHistory?: Record<string, string[]>;
  findModuleKey?: (practiceId: string) => ModuleKey;
}

export default function StackTab({ practiceStack, removeFromStack, practiceNotes, updatePracticeNote, openCustomPracticeModal, openGuidedPracticeGenerator, starterStacks = {}, applyStarterStack, completionHistory = {}, findModuleKey: _findModuleKey }: StackTabProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  const findModuleKey = (practice: AllPractice): ModuleKey => {
    if ('isCustom' in practice && practice.isCustom) {
      return practice.module;
    }
    for (const key in corePractices) {
      if (corePractices[key as ModuleKey].some(p => p.id === practice.id)) {
        return key as ModuleKey;
      }
    }
    return 'mind'; // Fallback
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">My Practice Stack</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">Your personal daily curriculum. Review, refine, and track your core practices here.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={openCustomPracticeModal}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all border border-slate-700 hover:border-slate-600 shadow-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Custom</span>
          </button>
          <button
            onClick={openGuidedPracticeGenerator}
            className="btn-luminous font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <AlgorithmIcon size={18} /> <span>Generate Practice</span>
          </button>
        </div>
      </header>

      {practiceStack.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 w-fit">
            <CheckCircle2 size={16} className="text-accent" />
            <span>{practiceStack.length} {practiceStack.length === 1 ? 'practice' : 'practices'} in your active stack</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {practiceStack.map(p => (
              <StackItem
                key={p.id}
                practice={p}
                moduleKey={findModuleKey(p)}
                onRemove={removeFromStack}
                notes={practiceNotes[p.id] || ''}
                onNoteChange={(note) => updatePracticeNote(p.id, note)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-16 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-glass border border-accent/30 rounded-2xl p-8 relative overflow-hidden bg-stone-950/80 text-center">
            {/* Subtle top decoration */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>

            <VoidBloomIcon size={48} className="text-accent mx-auto mb-6 opacity-80" />

            <h2 className="text-3xl font-serif text-slate-100 mb-4 tracking-wide">
              Design your practice stack
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto leading-relaxed font-light mb-8">
              Your stack is currently empty. Build your optimal practice ecology by browsing the library, generating a custom practice, or selecting a starter stack below.
            </p>

            <button
              onClick={openGuidedPracticeGenerator}
              className="group relative btn-luminous font-bold py-3 px-8 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <AlgorithmIcon size={18} />
              <span>Generate Practice Stack</span>
            </button>
          </div>
        </div>
      )}

      {/* Consistency Section */}
      {practiceStack.length > 0 && (
        <section className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Consistency</h2>
            <button
              onClick={() => setShowHeatmap(true)}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              View Heatmap
            </button>
          </div>
          <div className="space-y-1">
            {practiceStack.map(p => {
              const dates = completionHistory[p.id] || [];
              const { current, longest } = calculateStreaks(dates);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-900/40 transition-colors">
                  <span className="text-sm text-slate-300">{p.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{current} day · best: {longest}</span>
                </div>
              );
            })}
          </div>
          {showHeatmap && (
            <Suspense fallback={null}>
              <PracticeFrequencyHeatmap
                completionHistory={completionHistory}
                findModuleKey={(id) => {
                  const p = practiceStack.find(p => p.id === id);
                  return p ? findModuleKey(p) : 'mind';
                }}
                onClose={() => setShowHeatmap(false)}
              />
            </Suspense>
          )}
        </section>
      )}

      {/* Starter Stacks Section */}
      {Object.keys(starterStacks).length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 mb-6">Starter Stacks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(starterStacks).map(stack => (
              <div key={stack.name} className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 flex flex-col card-luminous-hover hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold font-mono text-slate-100">{stack.name}</h3>
                <p className="text-sm text-slate-300 mt-1">{stack.description}</p>
                <p className="text-xs text-slate-500 mt-2">Difficulty: {stack.difficulty}</p>
                <div className="mt-4 border-t border-slate-700/50 pt-3">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {stack.practices.map(pId => (
                      <li key={pId} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {pId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (applyStarterStack) {
                      applyStarterStack(stack.practices);
                    }
                  }}
                  className="mt-5 bg-teal-600/80 hover:bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition shadow-lg shadow-blue-900/20"
                >
                  Apply this Stack
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}