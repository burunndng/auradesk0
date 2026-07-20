import React from 'react';
import { X, Zap, Heart, Wind, Mountain, Volume2, ArrowRight, Clock, Activity } from 'lucide-react';
import { BioenergeneticsPractice } from '../../types.ts';

interface BioenergeneticsMenuProps {
  practices: BioenergeneticsPractice[];
  onSelectPractice: (practice: BioenergeneticsPractice) => void;
  onClose: () => void;
}

const getIconForPractice = (practiceId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'standing-meditation': <Mountain size={32} className="text-emerald-400" />,
    'heel-drops': <Zap size={32} className="text-amber-400" />,
    'forward-bend': <Wind size={32} className="text-sky-400" />,
    'the-bow': <Heart size={32} className="text-rose-400" />,
    'pelvic-rocking': <Activity size={32} className="text-orange-400" />,
    'connected-breathing': <Wind size={32} className="text-violet-400" />,
    'extended-exhalation': <Wind size={32} className="text-emerald-400" />,
    'sound-movement': <Volume2 size={32} className="text-pink-400" />
  };
  return iconMap[practiceId] || <Heart size={32} className="text-slate-400" />;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Intermediate':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Advanced':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-slate-700/40 text-slate-300 border-slate-600';
  }
};

export default function BioenergeneticsMenu({
  practices,
  onSelectPractice,
  onClose
}: BioenergeneticsMenuProps) {
  // Sort practices by difficulty level
  const sortedPractices = [...practices].sort((a, b) => {
    const difficultyOrder = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) -
           (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
  });

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-stone-900 border-x border-stone-800 sm:border rounded-none sm:rounded-3xl max-w-7xl w-full h-full sm:h-auto max-h-[100dvh] sm:max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 p-6 sm:p-8 flex items-start justify-between relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-stone-100 tracking-tight mb-2 font-serif italic">
              Bioenergetics & Breathing
            </h1>
            <p className="text-stone-400 max-w-2xl text-sm sm:text-lg leading-relaxed italic">
              Explore Reichian-Lowenian bodywork to release chronic tension and increase energy flow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-100 transition-colors hover:bg-stone-800 rounded-full z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>
        </div>

        {/* Practice Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPractices.map((practice) => (
              <button
                key={practice.id}
                onClick={() => onSelectPractice(practice)}
                className="group relative flex flex-col text-left bg-stone-950/40 hover:bg-stone-800/40 border border-stone-800/60 hover:border-amber-500/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 w-full">
                  <div className="p-3 bg-stone-900 rounded-xl group-hover:scale-110 transition-transform duration-500 border border-stone-800 shadow-inner">
                    {getIconForPractice(practice.id)}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {practice.id === 'standing-meditation' && (
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ⭐ Start Here
                      </span>
                    )}
                    <span
                      className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${getDifficultyColor(
                        practice.difficulty
                      )}`}
                    >
                      {practice.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-stone-100 mb-2 group-hover:text-amber-400 transition-colors font-serif italic">
                    {practice.name}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-3 italic">
                    {practice.intention}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-stone-800/60 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-stone-500 w-full">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-stone-600" />
                    <span>{practice.duration.min}-{practice.duration.max} min</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Begin Practice <ArrowRight size={12} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex-shrink-0 bg-stone-900/90 backdrop-blur-md border-t border-stone-800 p-5">
          <p className="text-[11px] text-stone-400 max-w-3xl mx-auto leading-relaxed border-l-2 border-amber-500/30 pl-4 italic">
            <strong className="text-amber-500 uppercase tracking-widest font-bold not-italic mr-2">Guidance:</strong> 
            Start with Standing Meditation to build foundational grounding before exploring intermediate or advanced charge/discharge techniques.
          </p>
        </div>
      </div>
    </div>
  );

}
