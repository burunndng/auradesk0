import React, { useEffect, useState } from 'react';
import { Achievement } from '../../../.claude/lib/quizGamification';
import {
    Trophy, Star, Medal, Award, Flame, Zap, Crown,
    Footprints, BookOpen, Brain, TrendingUp, Lightbulb,
    Library, Network
} from 'lucide-react';
import { getIconComponent } from '../../../.claude/lib/iconMap';

interface AchievementToastProps {
    achievement: Achievement;
    onDismiss: () => void;
}

const iconMap: Record<string, any> = {
    'Footprints': Footprints,
    'BookOpen': BookOpen,
    'Brain': Brain,
    'Star': Star,
    'Trophy': Trophy,
    'Flame': Flame,
    'Zap': Zap,
    'Crown': Crown,
    'TrendingUp': TrendingUp,
    'Award': Award,
    'Medal': Medal,
    'Lightbulb': Lightbulb,
    'Library': Library,
    'Network': Network
};

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    const Icon = iconMap[achievement.icon] || (getIconComponent('NeuralConvergence') || 'div');

    useEffect(() => {
        // Animate in
        const timer1 = setTimeout(() => setIsVisible(true), 100);

        // Auto dismiss
        const timer2 = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 500); // Wait for exit animation
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onDismiss]);

    const getRarityColor = (rarity?: string) => {
        switch (rarity) {
            case 'rare': return 'from-blue-500 to-cyan-400';
            case 'epic': return 'from-purple-500 to-pink-500';
            case 'legendary': return 'from-yellow-400 to-amber-600';
            default: return 'from-slate-400 to-slate-500'; // Common
        }
    };

    const getRarityBorder = (rarity?: string) => {
        switch (rarity) {
            case 'rare': return 'border-blue-400/50 shadow-blue-500/20';
            case 'epic': return 'border-purple-400/50 shadow-purple-500/20';
            case 'legendary': return 'border-yellow-400/50 shadow-yellow-500/20';
            default: return 'border-slate-400/50 shadow-slate-500/20';
        }
    };

    return (
        <div
            className={`fixed top-24 right-8 z-[100] transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 500);
            }}
        >
            <div className={`
        relative overflow-hidden
        w-80 p-4 rounded-xl
        bg-slate-900/90 backdrop-blur-xl
        border ${getRarityBorder(achievement.rarity)}
        shadow-lg
        cursor-pointer
        group
      `}>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                <div className="flex items-center gap-4 relative z-10">
                    {/* Icon Badge */}
                    <div className={`
            flex-shrink-0 w-12 h-12 rounded-full 
            flex items-center justify-center
            bg-gradient-to-br ${getRarityColor(achievement.rarity)}
            shadow-inner
          `}>
                        <Icon className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            Achievement Unlocked!
                        </h4>
                        <h3 className="text-lg font-bold text-white font-display leading-tight">
                            {achievement.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {achievement.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
