

import React, { useState, useMemo, useCallback } from 'react';


import { Practice, ModuleKey, AllPractice, AttachmentAssessmentSession } from '../../types.ts';


import { practices, modules } from '../../constants.ts';


import WorldEngineIcon from '../visualizations/SacredGeometryIcons/WorldEngineIcon';
import VoidEclipseIcon from '../visualizations/SacredGeometryIcons/VoidEclipseIcon';


import PracticeInfoModal from '../modals/PracticeInfoModal.tsx';


import PracticeChatbot from '../shared/PracticeChatbot.tsx';
import { SectionDivider } from '../shared/SectionDivider.tsx';
import { PracticeCard } from '../shared/PracticeCard.tsx';
import { useToast } from '../shared/ToastContext.tsx';





interface BrowseTabProps {


  practiceStack: AllPractice[];


  addToStack: (practice: Practice) => void;


  // FIX: Add onExplainClick and onPersonalizeClick to the component's props to resolve the TypeScript error in App.tsx.


  onExplainClick: (practice: Practice) => void;


  onPersonalizeClick: (practice: Practice) => void;


  highlightPracticeId?: string;


  linkedInsightId?: string;


  markInsightAsAddressedByPractice?: (insightId: string, practiceId: string, practiceName: string) => void;


  attachmentAssessment?: AttachmentAssessmentSession;

  onLaunchWizard?: (key: string) => void;

}





export default function BrowseTab({ practiceStack, addToStack, onExplainClick, onPersonalizeClick, highlightPracticeId, linkedInsightId, markInsightAsAddressedByPractice, attachmentAssessment, onLaunchWizard }: BrowseTabProps) {


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleKey | undefined>(undefined);
  const [filterModule, setFilterModule] = useState<ModuleKey | 'all'>('all');
  const [practiceForAI, setPracticeForAI] = useState<Practice | null>(null);
  const { addToast } = useToast();

  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const [key, modulePractices] of Object.entries(practices)) {
      const visible = modulePractices.filter(p => !p.hidden).length;
      counts[key] = visible;
      counts.all += visible;
    }
    return counts;
  }, []);

  const filterChipColors: Record<string, string> = {
    all: 'bg-slate-700 text-slate-200 border-slate-600',
    body: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    mind: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    spirit: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    shadow: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const filterChipInactive: Record<string, string> = {
    all: 'bg-slate-900/50 text-slate-500 border-slate-800 hover:bg-slate-800/50',
    body: 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/20',
    mind: 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-teal-400 hover:border-teal-500/20',
    spirit: 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-yellow-400 hover:border-yellow-500/20',
    shadow: 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-purple-400 hover:border-purple-500/20',
  };





  // Auto-open practice if highlightPracticeId is provided


  React.useEffect(() => {


    if (highlightPracticeId) {


      // Find the practice across all modules


      for (const modulePractices of Object.values(practices)) {


        const practice = modulePractices.find(p => p.id === highlightPracticeId);


        if (practice) {


          setSelectedPractice(practice);


          // Scroll to it


          setTimeout(() => {


            const element = document.getElementById(`practice-${highlightPracticeId}`);


            if (element) {


              element.scrollIntoView({ behavior: 'smooth', block: 'center' });


            }


          }, 100);


          break;


        }


      }


    }


  }, [highlightPracticeId]);





  const stackIds = useMemo(() => new Set(practiceStack.map(p => p.id)), [practiceStack]);





  const filteredPractices = useMemo(() => {
    return Object.entries(practices).reduce((acc, [moduleKey, modulePractices]) => {
      if (filterModule !== 'all' && moduleKey !== filterModule) return acc;
      const filtered = modulePractices.filter(p =>
        !p.hidden && (
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      if (filtered.length > 0) {
        acc[moduleKey as ModuleKey] = filtered;
      }
      return acc;
    }, {} as typeof practices);
  }, [searchTerm, filterModule]);

  const totalFilteredCount = useMemo(() =>
    Object.values(filteredPractices).reduce((sum, arr) => sum + arr.length, 0),
  [filteredPractices]);





  const handlePracticeSelect = useCallback((practice: Practice, moduleKey?: ModuleKey) => {
    setSelectedPractice(practice);
    setSelectedModule(moduleKey);

    // Auto-scroll to top so modal is visible on mobile
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, []);

  const handleAddWithToast = useCallback((practice: Practice) => {
    addToStack(practice);
    addToast(`${practice.name} added to your stack`, 'success');
  }, [addToStack, addToast]);





  return (
    <div className="space-y-6 sm:space-y-8 pb-32 lg:pb-8">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-white tracking-tighter mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Practice Library
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {totalFilteredCount} curated protocols from the Integral Life Practice system.
              Select practices to build your custom growth stack.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <WorldEngineIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Filter practices..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </header>

      {/* Module Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'body', 'mind', 'spirit', 'shadow'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilterModule(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filterModule === key ? filterChipColors[key] : filterChipInactive[key]
            }`}
          >
            {key === 'all' ? 'All' : modules[key].name}
            <span className="ml-1.5 opacity-60">({moduleCounts[key] || 0})</span>
          </button>
        ))}
      </div>

      <SectionDivider />

      <div className="space-y-10">
        {Object.keys(filteredPractices).length === 0 && (
          <div className="text-center py-10 space-y-3">
            <p className="text-slate-500">No practices found{searchTerm ? ` for "${searchTerm}"` : ''}{filterModule !== 'all' ? ` in ${modules[filterModule].name}` : ''}.</p>
            {(searchTerm || filterModule !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterModule('all'); }}
                className="text-sm text-accent hover:underline flex items-center gap-1.5 mx-auto"
              >
                <VoidEclipseIcon size={14} /> Clear filters
              </button>
            )}
          </div>
        )}
        {(Object.entries(filteredPractices) as [ModuleKey, Practice[]][]).filter(([moduleKey]) => modules[moduleKey]).map(([moduleKey, modulePractices]) => (
          <div key={moduleKey}>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 flex items-center gap-3 ${modules[moduleKey].textColor}`}>
              <div className={`w-1.5 h-6 rounded-full ${modules[moduleKey].textColor.replace('text-', 'bg-')}`}></div>
              {modules[moduleKey].name}
              <span className="text-sm font-normal text-slate-500">({modulePractices.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulePractices.map(practice => (


                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  isInStack={stackIds.has(practice.id)}
                  isHighlighted={practice.id === highlightPracticeId}
                  moduleKey={moduleKey}
                  onSelect={(p) => handlePracticeSelect(p, moduleKey)}
                  onAdd={handleAddWithToast}
                />


              ))}


            </div>


          </div>


        ))}


      </div>





      <PracticeInfoModal


        practice={selectedPractice}
        moduleKey={selectedModule}

        onClose={() => setSelectedPractice(null)}


        onAdd={(p) => {
          handleAddWithToast(p);
          // Mark insight as addressed if this practice came from an insight (Route B)
          if (linkedInsightId && markInsightAsAddressedByPractice) {
            markInsightAsAddressedByPractice(linkedInsightId, p.id, p.name);
          }
          setSelectedPractice(null);
        }}


        isInStack={!!selectedPractice && stackIds.has(selectedPractice.id)}


        onExplainClick={onExplainClick}


        onPersonalizeClick={onPersonalizeClick}


        onPracticeWithAI={(p) => {


          setPracticeForAI(p);


          setSelectedPractice(null);


        }}


        hasAttachmentAssessment={!!attachmentAssessment}
        onLaunchWizard={onLaunchWizard}

      />





      {practiceForAI && attachmentAssessment && (


        <PracticeChatbot


          practice={practiceForAI}


          attachmentStyle={attachmentAssessment.style}


          anxietyScore={attachmentAssessment.scores.anxiety}


          avoidanceScore={attachmentAssessment.scores.avoidance}


          onClose={() => setPracticeForAI(null)}


          onComplete={(sessionNotes) => {


            setPracticeForAI(null);


            addToStack(practiceForAI);


          }}


        />


      )}


    </div>


  );


}

