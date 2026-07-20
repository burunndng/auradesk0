import React from 'react';
import { DailyChallenge } from '../../../.claude/lib/dailyChallenge';
import { ChevronRight } from 'lucide-react';
import { typography } from '../../../theme';
import {
  OctagramIcon,
  GrowthSpiralIcon,
  HexagramIcon,
} from '../../../components/shared/SacredNavIcons';

interface DailyChallengeCardProps {
    challenge: DailyChallenge;
    onStart: () => void;
    isCompleted?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ challenge, onStart, isCompleted }) => {
    return (
        <div
            className="relative group cursor-pointer"
            onClick={onStart}
        >
            {/* Subtle ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-amber-900/10 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative overflow-hidden bg-stone-900/60 backdrop-blur-sm border border-stone-800/80 rounded-xl p-5 transition-all duration-300 group-hover:border-stone-700 group-hover:bg-stone-900/80">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-950/80 border border-stone-800 flex items-center justify-center group-hover:border-stone-700 transition-colors duration-300">
                            <OctagramIcon size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <div className={typography.label + ' text-amber-500/80 mb-0.5 uppercase tracking-widest text-[10px]'}>Daily Practice</div>
                            <h3 className={typography.h4 + ' text-stone-200'}>{challenge.title}</h3>
                        </div>
                    </div>
                    {isCompleted && (
                        <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-800/50 uppercase tracking-widest">
                            Complete
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className={typography.body + ' text-stone-500 mb-5'}>
                    {challenge.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="flex items-center gap-2 bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50">
                        <GrowthSpiralIcon size={14} className="text-emerald-500" />
                        <span className="text-xs text-stone-400">Target: <span className="font-medium text-emerald-400">{challenge.targetScore}%</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50">
                        <HexagramIcon size={14} className="text-amber-500" />
                        <span className="text-xs text-stone-400">Bonus: <span className="font-medium text-amber-400">+{challenge.bonusXP} XP</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50 col-span-2">
                        <span className="text-xs text-stone-500">{challenge.questions.length} Questions</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 group-hover:border-stone-600 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-stone-200 transition-all duration-200">
                    {isCompleted ? 'Practice Again' : 'Begin Practice'}
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};
