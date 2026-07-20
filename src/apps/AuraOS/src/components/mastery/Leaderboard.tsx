import React from 'react';
import { Trophy, Medal, Users, ArrowUp } from 'lucide-react';
import { typography } from '../../../theme';

interface Pioneer {
    id: string;
    name: string;
    xp: number;
    level: number;
    isUser?: boolean;
    tier: 'pioneer' | 'seeker' | 'catalyst' | 'sage';
}

const MOCK_PIONEERS: Pioneer[] = [
    { id: 'p-1', name: 'Ken W.', xp: 45200, level: 68, tier: 'sage' },
    { id: 'p-2', name: 'Somatic Sage', xp: 28400, level: 42, tier: 'sage' },
    { id: 'p-3', name: 'Shadow Walker', xp: 21200, level: 35, tier: 'catalyst' },
    { id: 'p-4', name: 'Mind Weaver', xp: 18900, level: 31, tier: 'catalyst' },
    { id: 'p-5', name: 'Spirit Guide', xp: 15600, level: 28, tier: 'catalyst' },
    { id: 'p-6', name: 'Body Architect', xp: 12400, level: 24, tier: 'seeker' },
    { id: 'p-7', name: 'Nexus Nomad', xp: 9800, level: 19, tier: 'seeker' },
    { id: 'p-8', name: 'Integral Icon', xp: 8200, level: 17, tier: 'seeker' },
    { id: 'p-9', name: 'Prana Pilot', xp: 7100, level: 15, tier: 'seeker' },
    { id: 'p-10', name: 'Aura Awakened', xp: 5400, level: 12, tier: 'pioneer' },
    { id: 'p-11', name: 'Zen Zenith', xp: 4200, level: 10, tier: 'pioneer' },
    { id: 'p-12', name: 'Core Crusader', xp: 3100, level: 8, tier: 'pioneer' },
    { id: 'p-13', name: 'Truth Teller', xp: 2400, level: 6, tier: 'pioneer' },
    { id: 'p-14', name: 'Module Maven', xp: 1800, level: 5, tier: 'pioneer' },
];

interface LeaderboardProps {
    userXP: number;
    userName?: string;
    userLevel: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userXP, userName = 'You', userLevel }) => {
    // Integrate user into the list and sort
    const allEntries: Pioneer[] = [
        ...MOCK_PIONEERS,
        {
            id: 'user-current',
            name: userName,
            xp: userXP,
            level: userLevel,
            isUser: true,
            tier: (userLevel > 50 ? 'sage' : userLevel > 25 ? 'catalyst' : userLevel > 10 ? 'seeker' : 'pioneer') as 'pioneer' | 'seeker' | 'catalyst' | 'sage'
        }
    ].sort((a, b) => b.xp - a.xp);

    const userRank = allEntries.findIndex(p => p.isUser) + 1;

    const tierColors = {
        pioneer: 'text-stone-400 bg-stone-900/30 border-stone-800',
        seeker: 'text-teal-400 bg-teal-900/20 border-teal-800/30',
        catalyst: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
        sage: 'text-amber-400 bg-amber-900/20 border-amber-800/30',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Trophy className="text-amber-500" size={20} />
                    <div>
                        <h2 className={typography.h4}>The Pioneer Arena</h2>
                        <p className={`${typography.label} text-stone-500 mt-1`}>Integral Field Rankings</p>
                    </div>
                </div>

                <div className="bg-stone-900/40 px-4 py-2 rounded-lg border border-stone-800/50 flex items-center gap-4">
                    <div className="text-center">
                        <p className={`${typography.caption} text-stone-500`}>Your Rank</p>
                        <p className={`${typography.h3} text-amber-500`}>#{userRank}</p>
                    </div>
                    <div className="w-px h-8 bg-stone-800" />
                    <div className="text-center">
                        <p className={`${typography.caption} text-stone-500`}>Percentile</p>
                        <p className={`${typography.h3} text-stone-300`}>
                            {Math.max(1, Math.round(((allEntries.length - userRank) / allEntries.length) * 100))}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-stone-900/20 border border-stone-800/50 rounded-xl overflow-hidden">
                <div className={`grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-800/50 bg-stone-900/40 ${typography.label} text-stone-500`}>
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Pioneer</div>
                    <div className="col-span-2 text-center">Level</div>
                    <div className="col-span-4 text-right">Integral XP</div>
                </div>

                <div className="divide-y divide-stone-800/30">
                    {allEntries.map((pioneer, index) => {
                        const rank = index + 1;

                        return (
                            <div
                                key={pioneer.id}
                                className={`
                  grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors
                  ${pioneer.isUser ? 'bg-amber-500/[0.03] animate-pulse-subtle' : 'hover:bg-stone-800/20'}
                `}
                            >
                                <div className="col-span-1">
                                    {rank === 1 ? <Medal size={18} className="text-amber-500" /> :
                                        rank === 2 ? <Medal size={18} className="text-stone-400" /> :
                                            rank === 3 ? <Medal size={18} className="text-amber-700" /> :
                                                <span className="text-sm font-mono text-stone-600">#{rank}</span>}
                                </div>

                                <div className="col-span-5 flex items-center gap-3">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border
                    ${pioneer.isUser ? 'bg-amber-900/30 border-amber-500/50' : 'bg-stone-800 border-stone-700'}
                  `}>
                                        <Users size={14} className={pioneer.isUser ? 'text-amber-500' : 'text-stone-500'} />
                                    </div>
                                    <div>
                                        <p className={`${typography.body} font-medium ${pioneer.isUser ? 'text-amber-500' : 'text-stone-300'}`}>
                                            {pioneer.name} {pioneer.isUser && <span className={`${typography.caption} text-stone-600 ml-1 font-normal`}>(Current)</span>}
                                        </p>
                                        <span className={`${typography.caption} px-1.5 py-0.5 rounded-sm border ${tierColors[pioneer.tier]}`}>
                                            {pioneer.tier}
                                        </span>
                                    </div>
                                </div>

                                <div className={`col-span-2 text-center ${typography.body} font-mono text-stone-500`}>
                                    {pioneer.level}
                                </div>

                                <div className="col-span-4 text-right">
                                    <p className={`${typography.body} font-mono ${pioneer.isUser ? 'text-amber-500' : 'text-stone-400'}`}>
                                        {pioneer.xp.toLocaleString()}
                                    </p>
                                    {pioneer.isUser && (
                                        <div className={`flex items-center justify-end gap-1 ${typography.caption} text-green-500 mt-1`}>
                                            <ArrowUp size={8} /> Active Explorer
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className={`${typography.caption} text-stone-600 text-center italic mt-4`}>
                * Rankings represent the local Aura Pioneer Collective. Rankings are simulated to provide developmental context.
            </p>
        </div>
    );
};
