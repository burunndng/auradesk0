import React, { memo } from 'react';
import { Check, Plus, Clock, BarChart3, Activity, Brain, Ghost, Compass } from 'lucide-react';
import { Practice, ModuleKey } from '../../types';
import { PracticeAIButton } from './PracticeAIButton';

interface PracticeCardProps {
  practice: Practice;
  isInStack: boolean;
  isHighlighted: boolean;
  moduleKey: ModuleKey;
  onSelect: (practice: Practice) => void;
  onAdd?: (practice: Practice) => void;
}

const moduleIcons: Record<string, React.ReactNode> = {
  body: <Activity size={18} className="text-emerald-400" />,
  mind: <Brain size={18} className="text-teal-400" />,
  spirit: <Compass size={18} className="text-yellow-400" />,
  shadow: <Ghost size={18} className="text-purple-400" />
};

const moduleColors: Record<string, string> = {
  body: 'accent-orange',
  mind: 'accent-cyan',
  spirit: 'accent-yellow',
  shadow: 'accent-purple'
};

const moduleBorderColors: Record<string, string> = {
  body: 'border-l-emerald-500',
  mind: 'border-l-cyan-500',
  spirit: 'border-l-yellow-500',
  shadow: 'border-l-purple-500'
};

const moduleHoverGlow: Record<string, string> = {
  body: 'hover:shadow-emerald-500/10',
  mind: 'hover:shadow-cyan-500/10',
  spirit: 'hover:shadow-yellow-500/10',
  shadow: 'hover:shadow-purple-500/10'
};

const roiBadgeStyles: Record<string, string> = {
  EXTREME: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'VERY HIGH': 'bg-amber-500/10 text-amber-500/70 border-amber-500/10',
  HIGH: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
};

export const PracticeCard = memo(function PracticeCard({
  practice,
  isInStack,
  isHighlighted,
  moduleKey,
  onSelect,
  onAdd
}: PracticeCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd && !isInStack) {
      onAdd(practice);
    }
  };

  return (
    <div
      id={`practice-${practice.id}`}
      className={`card-accent ${moduleColors[moduleKey] || 'accent-neutral'} border-l-[3px] ${moduleBorderColors[moduleKey] || ''} p-5 flex flex-col justify-between cursor-pointer group animate-fade-in-up hover:shadow-lg ${moduleHoverGlow[moduleKey] || ''} transition-all ${isHighlighted ? 'ring-2 ring-accent shadow-lg shadow-accent/20' : ''}`}
      onClick={() => onSelect(practice)}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-lg bg-slate-900/50 group-hover:bg-slate-900 transition-colors">
            {moduleIcons[moduleKey] || <Activity size={18} />}
          </div>
          <div className="flex gap-2">
            {roiBadgeStyles[practice.roi] && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roiBadgeStyles[practice.roi]}`}>
                {practice.roi === 'EXTREME' ? 'Extreme' : practice.roi === 'VERY HIGH' ? 'Very High' : 'High'} ROI
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold font-mono text-slate-100 text-lg leading-tight group-hover:text-white transition-colors">
          {practice.name}
        </h3>

        <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
          {practice.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <BarChart3 size={12} />
            <span>{practice.difficulty}</span>
          </div>
          {practice.timePerWeek > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <Clock size={12} />
              <span>{practice.timePerWeek}h/wk</span>
            </div>
          )}
        </div>

        {practice.affectsSystem && practice.affectsSystem.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {practice.affectsSystem.slice(0, 3).map((system) => (
              <span key={system} className="text-[9px] font-medium text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                {system}
              </span>
            ))}
            {practice.affectsSystem.length > 3 && (
              <span className="text-[9px] font-medium text-slate-600 px-1 py-0.5">
                +{practice.affectsSystem.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/30">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{moduleKey}</span>

          {isInStack ? (
            <div className="text-xs font-bold text-green-400 flex items-center gap-1.5 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
              <Check size={14} /> <span>In Stack</span>
            </div>
          ) : (
            <button
              className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 px-4 py-2 rounded-full shadow-md"
              onClick={handleAddClick}
            >
              <Plus size={14} /> Add to Stack
            </button>
          )}
        </div>

        {practice.aiEnabled && practice.aiPrompt && (
          <div className="mt-3 flex justify-end">
            <PracticeAIButton aiPrompt={practice.aiPrompt} practiceName={practice.name} />
          </div>
        )}
      </div>
    </div>
  );
});
