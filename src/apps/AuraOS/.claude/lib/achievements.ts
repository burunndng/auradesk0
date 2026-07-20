import { QuizResult } from '../../types';
import { UserGamificationState, Achievement } from './quizGamification';

export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    condition: (state: UserGamificationState, lastResult?: QuizResult) => boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    // --- Completion Achievements ---
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: 'Footprints',
        rarity: 'common',
        condition: (state) => state.totalQuizzesTaken >= 1
    },
    {
        id: 'dedicated_student',
        name: 'Dedicated Student',
        description: 'Complete 10 quizzes',
        icon: 'BookOpen',
        rarity: 'common',
        condition: (state) => state.totalQuizzesTaken >= 10
    },
    {
        id: 'master_practitioner',
        name: 'Master Practitioner',
        description: 'Complete 50 quizzes',
        icon: 'Brain',
        rarity: 'rare',
        condition: (state) => state.totalQuizzesTaken >= 50
    },

    // --- Score Achievements ---
    {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Get 100% on a quiz',
        icon: 'Star',
        rarity: 'common',
        condition: (_, result) => !!result && result.score === 100
    },
    {
        id: 'hat_trick',
        name: 'Hat Trick',
        description: 'Get 100% on 3 consecutive quizzes',
        icon: 'Trophy',
        rarity: 'rare',
        condition: (state) => {
            // This requires history which we don't fully have in just 'state', 
            // relying on simplistic check for now or would need to look at localstorage history
            // For phase 1/2, let's keep it simple. If we want complex history checks, we need to read 'aura-quiz-results'
            return false; // difficult to implement without history access in args
        }
    },

    // --- Streak Achievements ---
    {
        id: 'building_momentum',
        name: 'Building Momentum',
        description: 'Reach a 3-day streak',
        icon: 'Flame',
        rarity: 'common',
        condition: (state) => state.streakDays >= 3
    },
    {
        id: 'weekly_warrior',
        name: 'Weekly Warrior',
        description: 'Reach a 7-day streak',
        icon: 'Zap',
        rarity: 'rare',
        condition: (state) => state.streakDays >= 7
    },
    {
        id: 'monthly_master',
        name: 'Monthly Master',
        description: 'Reach a 30-day streak',
        icon: 'Crown',
        rarity: 'epic',
        condition: (state) => state.streakDays >= 30
    },

    // --- Level Achievements ---
    {
        id: 'level_5',
        name: 'High Five',
        description: 'Reach Level 5',
        icon: 'TrendingUp',
        rarity: 'common',
        condition: (state) => state.level >= 5
    },
    {
        id: 'level_10',
        name: 'Double Digits',
        description: 'Reach Level 10',
        icon: 'Award',
        rarity: 'rare',
        condition: (state) => state.level >= 10
    },
    {
        id: 'level_25',
        name: 'Quarter Century',
        description: 'Reach Level 25',
        icon: 'Medal',
        rarity: 'epic',
        condition: (state) => state.level >= 25
    },

    // --- Concept Mastery ---
    {
        id: 'concept_novice',
        name: 'Concept Novice',
        description: 'Master your first concept',
        icon: 'Lightbulb',
        rarity: 'common',
        condition: (state) => (state.conceptProgress?.totalConceptsMastered || 0) >= 1
    },
    {
        id: 'concept_collector',
        name: 'Concept Collector',
        description: 'Master 10 concepts',
        icon: 'Library',
        rarity: 'rare',
        condition: (state) => (state.conceptProgress?.totalConceptsMastered || 0) >= 10
    },
    {
        id: 'knowledge_nexus',
        name: 'Knowledge Nexus',
        description: 'Master 25 concepts',
        icon: 'Network',
        rarity: 'epic',
        condition: (state) => (state.conceptProgress?.totalConceptsMastered || 0) >= 25
    }
];

export const checkAchievements = (
    state: UserGamificationState,
    lastResult?: QuizResult
): Achievement[] => {
    const newAchievements: Achievement[] = [];
    const today = new Date().toISOString();

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
        // Check if already unlocked
        if (state.achievements.some(a => a.id === def.id)) {
            return;
        }

        // Check condition
        if (def.condition(state, lastResult)) {
            newAchievements.push({
                id: def.id,
                name: def.name,
                description: def.description,
                icon: def.icon,
                unlockedDate: today
            });
        }
    });

    return newAchievements;
};
