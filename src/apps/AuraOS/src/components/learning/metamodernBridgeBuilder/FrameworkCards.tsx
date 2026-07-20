import React from 'react';
import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import { typography } from '../../../../theme';
import type { MetamodernFramework } from './bridgeData';

interface FrameworkCardsProps {
  frameworks: MetamodernFramework[];
  onDeepDive?: () => void;
}

export const FrameworkCards: React.FC<FrameworkCardsProps> = ({ frameworks, onDeepDive }) => {
  return (
    <div className="space-y-4">
      {frameworks.map(framework => (
        <div
          key={framework.id}
          className={`rounded-xl bg-gradient-to-br ${framework.gradient} border-2 border-slate-700/50 p-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {framework.name}
              </h3>
              <div className="text-sm text-slate-400 mb-2">{framework.author}</div>
              <div className={`text-lg font-medium ${framework.color} italic`}>
                {framework.tagline}
              </div>
            </div>
          </div>

          <p className={typography.body + ' text-slate-300 mb-4'}>{framework.shortDescription}</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-950/50 rounded-lg p-4">
              <div className="font-semibold text-green-300 mb-2">
                <CheckCircle size={12} className="inline mr-1.5" aria-hidden="true" /> Core Moves:
              </div>
              <ul className="space-y-1 text-slate-300">
                {framework.pillars.map((pillar, index) => (
                  <li key={index}>• {pillar}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4">
              <div className="font-semibold text-rose-300 mb-2">
                <AlertTriangle size={12} className="inline mr-1.5" aria-hidden="true" /> Watch For:
              </div>
              <ul className="space-y-1 text-slate-300">
                {framework.tensions.map((tension, index) => (
                  <li key={index}>• {tension}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4">
              <div className="font-semibold text-teal-300 mb-2">
                <Wrench size={12} className="inline mr-1.5" aria-hidden="true" /> Bridge Moves:
              </div>
              <ul className="space-y-1 text-slate-300">
                {framework.bridgeMoves.map((move, index) => (
                  <li key={index}>• {move}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {onDeepDive && (
        <button
          onClick={onDeepDive}
          className="w-full text-left px-5 py-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 hover:bg-fuchsia-950/40 hover:border-fuchsia-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-fuchsia-500/70 mb-1">Full Academic Survey</p>
              <p className="text-slate-300 text-sm group-hover:text-slate-100 transition-colors font-medium">
                Metamodern Frameworks: Deep Dive →
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
