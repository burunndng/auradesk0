import React from 'react';
import { ClipboardList, Coins } from 'lucide-react';
import { typography } from '../../../../theme';
import type { BridgeRecipe } from './bridgeData';

interface BridgeRecipesSectionProps {
  recipes: BridgeRecipe[];
}

export const BridgeRecipesSection: React.FC<BridgeRecipesSectionProps> = ({ recipes }) => {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
      {recipes.map(recipe => (
        <div
          key={recipe.id}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-xl border-2 border-amber-500/40 p-4 sm:p-6 hover:border-amber-400/60 transition-all"
        >
          <h3 className="text-lg font-bold text-white mb-2">{recipe.title}</h3>
          <p className={typography.body + ' text-slate-400 mb-3'}>{recipe.description}</p>

          <div className="flex items-center gap-3 mb-4 text-xs flex-wrap">
            <span className="px-2 py-1 rounded-full bg-violet-900/40 text-violet-300 font-medium">
              {recipe.duration}
            </span>
            {recipe.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-slate-800/60 text-slate-300">
                <span aria-hidden="true">#</span>{tag}
              </span>
            ))}
          </div>

          <div className="mb-4">
            <div className="font-semibold text-green-300 text-sm mb-2">
              <ClipboardList size={12} className="inline mr-1.5 text-green-300" aria-hidden="true" /> Steps:
            </div>
            <ol className="text-sm text-slate-300 space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-400 font-mono flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-500/30">
            <div className="font-semibold text-amber-300 text-xs mb-1">
              <Coins size={12} className="inline mr-1.5" aria-hidden="true" /> Payoff:
            </div>
            <div className="text-sm text-slate-200 italic">{recipe.payoff}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
