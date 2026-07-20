import React from 'react';
import { ILPGraphCategory } from '../../../types';
import { getAllConcepts } from '../../../data/ilpGraphQuizzes';
import { getConceptMastery, formatConceptName } from '../../../.claude/lib/quizGamification';
import { ConceptMasteryRing } from './ConceptMasteryRing';
import { Target } from 'lucide-react';
import { typography, getButtonClass } from '../../../theme';

interface ConceptMasteryGridProps {
    category: ILPGraphCategory | 'all';
    color: string;
}

export const ConceptMasteryGrid: React.FC<ConceptMasteryGridProps> = ({
    category,
    color,
}) => {
    const allConcepts = getAllConcepts(category);
    const masteryData = getConceptMastery();

    if (allConcepts.length === 0) {
        return (
            <div className={`py-8 text-center text-stone-500 ${typography.label} italic`}>
                No concepts found for this domain.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allConcepts.map((conceptId) => {
                const progress = masteryData.concepts[conceptId];
                const masteryScore = progress ? progress.masteryScore : 0;
                const isMastered = progress ? progress.isMastered : false;
                const totalCount = progress ? progress.totalCount : 0;

                return (
                    <div
                        key={conceptId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-stone-900/30 border border-stone-800/40 hover:border-stone-700/60 transition-colors"
                    >
                        <ConceptMasteryRing
                            score={masteryScore}
                            color={color}
                            isMastered={isMastered}
                            size={36}
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className={`${typography.label} text-stone-300 truncate`}>
                                    {formatConceptName(conceptId)}
                                </span>
                                {isMastered && (
                                    <Target size={12} className="text-amber-500 shrink-0" />
                                )}
                            </div>
                            <div className={`${typography.caption} text-stone-600 mt-0.5`}>
                                {totalCount > 0
                                    ? `${totalCount} encounter${totalCount !== 1 ? 's' : ''} · ${masteryScore}% mastery`
                                    : 'Not encountered yet'}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
