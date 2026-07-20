import React from 'react';
import { History, Calendar, Target, Zap, ChevronRight } from 'lucide-react';
import { QuizResult } from '../../../types';
import { typography, getButtonClass } from '../../../theme';

interface SessionHistoryProps {
    results: QuizResult[];
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ results }) => {
    // Take last 10 results and reverse for chronological (newest first)
    const recentResults = [...results].reverse().slice(0, 10);

    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-stone-900/20 border border-dashed border-stone-800 rounded-xl">
                <History className="text-stone-700" size={48} />
                <div>
                    <h3 className={`text-stone-300 ${typography.h4}`}>No Mission History Yet</h3>
                    <p className={`${typography.body} text-stone-600 max-w-xs mx-auto mt-1`}>
                        Complete your first module to begin tracking your mastery path.
                    </p>
                </div>
            </div>
        );
    }

    const categoryLabels: Record<string, string> = {
        core: 'Core Concepts',
        body: 'Body Module',
        mind: 'Mind Module',
        spirit: 'Spirit Module',
        shadow: 'Shadow Module',
        'integral-theory': 'Integral Theory'
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-amber-500';
        if (score >= 70) return 'text-teal-500';
        if (score >= 50) return 'text-stone-300';
        return 'text-stone-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <History className="text-stone-400" size={20} />
                <div>
                    <h2 className={`text-stone-200 ${typography.h4}`}>Session Archives</h2>
                    <p className={`${typography.label} text-stone-500 uppercase tracking-widest mt-1`}>Timeline of your development</p>
                </div>
            </div>

            <div className="space-y-3">
                {recentResults.map((result, index) => (
                    <div
                        key={`${result.date}-${index}`}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-stone-900/40 border border-stone-800/50 hover:bg-stone-900/60 hover:border-stone-700/50 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-2 rounded-lg bg-stone-800/50 border border-stone-700/30 text-stone-500 mt-1">
                                <Calendar size={16} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className={`${typography.label} text-stone-200`}>
                                        {categoryLabels[result.category] || result.category}
                                    </h4>
                                    <span className={`${typography.caption} text-stone-600 uppercase font-mono`}>
                                        {new Date(result.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-4 ${typography.caption} text-stone-500 uppercase tracking-wider`}>
                                    <span className="flex items-center gap-1">
                                        <Target size={10} /> {result.correctAnswers}/{result.totalQuestions} Correct
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Zap size={10} className="text-amber-600" /> {Math.round(result.score * result.totalQuestions / 10)} XP
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-stone-800/30">
                            <div className="text-right">
                                <p className={`${typography.h4} font-serif ${getScoreColor(result.score)}`}>
                                    {result.score}<span className={`${typography.caption} ml-0.5 opacity-50`}>%</span>
                                </p>
                                <p className={`${typography.caption} text-stone-600 uppercase tracking-tighter`}>Mastery Level</p>
                            </div>
                            <ChevronRight className="text-stone-700 group-hover:text-stone-400 transition-colors hidden md:block" size={20} />
                        </div>
                    </div>
                ))}

                {results.length > 10 && (
                    <div className={`text-center py-4 ${typography.caption} text-stone-600 uppercase tracking-widest italic`}>
                        + {results.length - 10} earlier missions archived
                    </div>
                )}
            </div>
        </div>
    );
};
