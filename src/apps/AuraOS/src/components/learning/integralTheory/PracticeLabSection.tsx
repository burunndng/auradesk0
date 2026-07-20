import React, { useState } from 'react';
import { Check, RefreshCw, Download } from 'lucide-react';
import { typography, getButtonClass } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface PracticeModule {
  id: string;
  quadrant: 'I' | 'WE' | 'IT' | 'ITS';
  label: string;
  category: 'Body' | 'Mind' | 'Spirit' | 'Shadow';
  examples: string[];
  color: string;
}

const practiceModules: PracticeModule[] = [
  // I Quadrant (Interior-Individual)
  { id: 'i1', quadrant: 'I', label: 'Meditation', category: 'Spirit', examples: ['Mindfulness', 'Vipassana', 'Zazen', 'Loving-kindness'], color: 'from-purple-500 to-fuchsia-500' },
  { id: 'i2', quadrant: 'I', label: 'Shadow Work', category: 'Shadow', examples: ['3-2-1 Process', 'IFS', 'Journaling', 'Dream work'], color: 'from-purple-500 to-fuchsia-500' },
  { id: 'i3', quadrant: 'I', label: 'Contemplation', category: 'Mind', examples: ['Reading philosophy', 'Self-inquiry', 'Koan study'], color: 'from-purple-500 to-fuchsia-500' },
  { id: 'i4', quadrant: 'I', label: 'Somatic Awareness', category: 'Body', examples: ['Body scan', 'Felt sense', 'Interoception'], color: 'from-purple-500 to-fuchsia-500' },

  // WE Quadrant (Interior-Collective)
  { id: 'we1', quadrant: 'WE', label: 'Authentic Relating', category: 'Shadow', examples: ['Circling', 'T-Group', 'Dyad practice'], color: 'from-pink-500 to-rose-500' },
  { id: 'we2', quadrant: 'WE', label: 'Ritual & Ceremony', category: 'Spirit', examples: ['Group meditation', 'Sweat lodge', 'Fire circles'], color: 'from-pink-500 to-rose-500' },
  { id: 'we3', quadrant: 'WE', label: 'Study Groups', category: 'Mind', examples: ['Book clubs', 'Mastermind groups', 'Sangha'], color: 'from-pink-500 to-rose-500' },
  { id: 'we4', quadrant: 'WE', label: 'Partner Practices', category: 'Body', examples: ['Acro yoga', 'Partner stretching', 'Dance'], color: 'from-pink-500 to-rose-500' },

  // IT Quadrant (Exterior-Individual)
  { id: 'it1', quadrant: 'IT', label: 'Strength Training', category: 'Body', examples: ['Weightlifting', 'Calisthenics', 'Resistance training'], color: 'from-blue-500 to-cyan-500' },
  { id: 'it2', quadrant: 'IT', label: 'Cardio', category: 'Body', examples: ['Running', 'Swimming', 'Cycling', 'HIIT'], color: 'from-blue-500 to-cyan-500' },
  { id: 'it3', quadrant: 'IT', label: 'Skill Training', category: 'Mind', examples: ['Language learning', 'Music practice', 'Art'], color: 'from-blue-500 to-cyan-500' },
  { id: 'it4', quadrant: 'IT', label: 'Nutrition', category: 'Body', examples: ['Meal planning', 'Intermittent fasting', 'Supplements'], color: 'from-blue-500 to-cyan-500' },

  // ITS Quadrant (Exterior-Collective)
  { id: 'its1', quadrant: 'ITS', label: 'Activism', category: 'Mind', examples: ['Volunteering', 'Organizing', 'Advocacy'], color: 'from-emerald-500 to-teal-500' },
  { id: 'its2', quadrant: 'ITS', label: 'Ecological Practice', category: 'Spirit', examples: ['Composting', 'Permaculture', 'Conservation'], color: 'from-emerald-500 to-teal-500' },
  { id: 'its3', quadrant: 'ITS', label: 'Community Building', category: 'Shadow', examples: ['Neighborhood events', 'Co-housing', 'Mutual aid'], color: 'from-emerald-500 to-teal-500' },
  { id: 'its4', quadrant: 'ITS', label: 'Systems Work', category: 'Mind', examples: ['Policy advocacy', 'Organizational design', 'Education'], color: 'from-emerald-500 to-teal-500' },
];

const categoryColors = {
  Body: 'bg-red-500/20 text-red-300 border-red-500/30',
  Mind: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Spirit: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Shadow: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export const PracticeLabSection: React.FC = () => {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSelectedModules(new Set());
  };

  const selectBalanced = () => {
    // Select one from each quadrant for balance
    const balanced = new Set([
      'i1', // Meditation
      'we1', // Authentic Relating
      'it1', // Strength Training
      'its2', // Ecological Practice
    ]);
    setSelectedModules(balanced);
  };

  const getQuadrantCount = (quadrant: string) => {
    return Array.from(selectedModules).filter(id => {
      const module = practiceModules.find(m => m.id === id);
      return module?.quadrant === quadrant;
    }).length;
  };

  const getCategoryCount = (category: string) => {
    return Array.from(selectedModules).filter(id => {
      const module = practiceModules.find(m => m.id === id);
      return module?.category === category;
    }).length;
  };

  const getBalance = () => {
    const counts = {
      I: getQuadrantCount('I'),
      WE: getQuadrantCount('WE'),
      IT: getQuadrantCount('IT'),
      ITS: getQuadrantCount('ITS'),
    };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    return counts;
  };

  const balance = getBalance();

  const exportPractice = () => {
    if (typeof window === 'undefined') return;

    const selected = Array.from(selectedModules).map(id => {
      const module = practiceModules.find(m => m.id === id);
      return `${module?.quadrant} - ${module?.label} (${module?.category})`;
    });

    const text = `MY INTEGRAL PRACTICE\n\nSelected Practices:\n${selected.join('\n')}\n\nQuadrant Balance:\n- I (Interior-Individual): ${getQuadrantCount('I')}\n- WE (Interior-Collective): ${getQuadrantCount('WE')}\n- IT (Exterior-Individual): ${getQuadrantCount('IT')}\n- ITS (Exterior-Collective): ${getQuadrantCount('ITS')}\n\nCategory Balance:\n- Body: ${getCategoryCount('Body')}\n- Mind: ${getCategoryCount('Mind')}\n- Spirit: ${getCategoryCount('Spirit')}\n- Shadow: ${getCategoryCount('Shadow')}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-integral-practice.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      {/* Section intro */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-900/30 border border-fuchsia-500/30">
          {React.createElement(getIconComponent('NeuralConvergence') || 'div', { size: 16, className: "text-fuchsia-400" })}
          <span className="text-sm text-fuchsia-300 font-medium">Design Your Practice</span>
        </div>
        <h3 className={typography.h3}>
          Your Integral Practice Lab
        </h3>
        <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Theory means nothing without practice. Click modules below to design your personalized integral routine. Watch your quadrant balance shift in real-time. The goal: <span className="text-fuchsia-400 font-semibold">balanced growth across all dimensions</span>.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={selectBalanced}
          className={`${getButtonClass('sm', 'primary')} flex items-center gap-2`}
        >
          {React.createElement(getIconComponent('QuantumEntanglement') || 'div', { size: 14 })}
          Suggest Balanced
        </button>
        <button
          onClick={clearAll}
          className={`${getButtonClass('sm', 'secondary')} flex items-center gap-2`}
        >
          <RefreshCw size={14} />
          Clear All
        </button>
        {selectedModules.size > 0 && (
          <button
            onClick={exportPractice}
            className={`${getButtonClass('sm', 'success')} flex items-center gap-2`}
          >
            <Download size={14} />
            Export ({selectedModules.size})
          </button>
        )}
      </div>

      {/* Balance visualization */}
      {balance && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h4 className="text-center text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
            Quadrant Balance
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {(['I', 'WE', 'IT', 'ITS'] as const).map(quad => {
              const count = balance[quad];
              const total = Object.values(balance).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors = {
                I: 'from-purple-500 to-fuchsia-500',
                WE: 'from-pink-500 to-rose-500',
                IT: 'from-blue-500 to-cyan-500',
                ITS: 'from-emerald-500 to-teal-500',
              };

              return (
                <div key={quad} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold bg-gradient-to-r ${colors[quad]} bg-clip-text text-transparent`}>
                      {quad}
                    </span>
                    <span className="text-xs text-slate-400">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[quad]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category balance */}
          <h4 className="text-center text-sm font-semibold text-slate-400 mb-3 mt-6 uppercase tracking-wider">
            Category Balance
          </h4>
          <div className="flex items-center justify-center gap-4">
            {(['Body', 'Mind', 'Spirit', 'Shadow'] as const).map(cat => (
              <div key={cat} className="text-center">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[cat]}`}>
                  {cat}
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {getCategoryCount(cat)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice modules grid */}
      <div className="space-y-8">
        {(['I', 'WE', 'IT', 'ITS'] as const).map(quadrant => {
          const modules = practiceModules.filter(m => m.quadrant === quadrant);
          const quadrantLabels = {
            I: 'Interior-Individual',
            WE: 'Interior-Collective',
            IT: 'Exterior-Individual',
            ITS: 'Exterior-Collective',
          };
          const quadrantColors = {
            I: 'from-purple-500 to-fuchsia-500',
            WE: 'from-pink-500 to-rose-500',
            IT: 'from-blue-500 to-cyan-500',
            ITS: 'from-emerald-500 to-teal-500',
          };

          return (
            <div
              key={quadrant}
              className={`rounded-2xl border-2 transition-all p-6 ${
                hoveredQuadrant === quadrant
                  ? 'border-white/20 bg-slate-900/50'
                  : 'border-slate-800 bg-slate-900/30'
              }`}
              onMouseEnter={() => setHoveredQuadrant(quadrant)}
              onMouseLeave={() => setHoveredQuadrant(null)}
            >
              {/* Quadrant header */}
              <div className="mb-6">
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${quadrantColors[quadrant]} bg-opacity-10`}>
                  <div className={`text-2xl font-black bg-gradient-to-r ${quadrantColors[quadrant]} bg-clip-text text-transparent`}>
                    {quadrant}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{quadrantLabels[quadrant]}</div>
                    <div className="text-xs text-slate-400">
                      {getQuadrantCount(quadrant)} selected
                    </div>
                  </div>
                </div>
              </div>

              {/* Module cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map(module => {
                  const isSelected = selectedModules.has(module.id);

                  return (
                    <button
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `border-white/30 bg-gradient-to-br ${module.color} bg-opacity-10 shadow-lg`
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm mb-1">
                            {module.label}
                          </div>
                          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${categoryColors[module.category]}`}>
                            {module.category}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-white border-white'
                            : 'border-slate-600'
                        }`}>
                          {isSelected && <Check size={14} className="text-slate-900" />}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        {module.examples.join(', ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing guidance */}
      {selectedModules.size === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-900/20 to-purple-900/20 border border-fuchsia-500/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-3xl" />
          <div className="relative text-center space-y-4">
            <h4 className={typography.h4}>Start Simple</h4>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Don't try to balance everything at once. Start with <span className="text-fuchsia-400 font-semibold">one practice per quadrant</span>. Build consistency before adding complexity. The "Suggest Balanced" button will give you a good starting point.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-900/20 to-purple-900/20 border border-fuchsia-500/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-3xl" />
          <div className="relative text-center space-y-4">
            <h4 className={typography.h4}>You've Built a Practice Stack</h4>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {balance && Object.values(balance).every(v => v > 0) ? (
                <>
                  <span className="text-emerald-400 font-semibold">Perfect balance!</span> You've selected practices across all four quadrants. This is holistic growth. Now the real work begins: <span className="text-fuchsia-400 font-semibold">actually doing them</span>.
                </>
              ) : (
                <>
                  You're building momentum. Notice which quadrants are <span className="text-fuchsia-400 font-semibold">missing</span> from your stack—those are your blind spots. Consider adding at least one practice from each quadrant for true integral balance.
                </>
              )}
            </p>
            <div className="pt-4">
              <button
                onClick={exportPractice}
                className={`${getButtonClass('lg', 'primary')} rounded-full flex items-center gap-2 mx-auto`}
              >
                <Download size={16} />
                Export Your Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
