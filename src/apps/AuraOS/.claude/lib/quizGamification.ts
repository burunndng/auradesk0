import { QuizResult, ILPGraphCategory, QuizQuestion, ConceptMastery, ConceptProgress } from '../../types';
import { checkAchievements } from './achievements';
import { StorageManager } from './storageManager';

export interface UserGamificationState {
    totalXP: number;
    level: number;
    nextLevelXP: number;
    streakDays: number;
    lastPlayDate: string;
    totalQuizzesTaken: number;
    achievements: Achievement[];
    conceptProgress?: ConceptProgress;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedDate: string;
    icon: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export const XP_STORAGE_KEY = 'aura-quiz-xp-total';
export const QUIZ_RESULTS_STORAGE_KEY = 'aura-quiz-results';
export const CONCEPT_MASTERY_STORAGE_KEY = 'aura-quiz-concept-mastery';
export const ACHIEVEMENTS_STORAGE_KEY = 'aura-quiz-achievements';

// Base XP needed for level 1 -> 2. Scale up from there.
const BASE_LEVEL_XP = 500;
const LEVEL_MULTIPLIER = 1.2;

/**
 * Calculate user's current level based on total XP
 */
export const calculateLevel = (totalXP: number): { level: number; nextLevelXP: number; xpForCurrentLevel: number } => {
    let level = 1;
    let xpForNextLevel = BASE_LEVEL_XP;
    let accumulatedXP = 0;

    while (totalXP >= accumulatedXP + xpForNextLevel) {
        accumulatedXP += xpForNextLevel;
        level++;
        xpForNextLevel = Math.floor(xpForNextLevel * LEVEL_MULTIPLIER);
    }

    return {
        level,
        nextLevelXP: accumulatedXP + xpForNextLevel,
        xpForCurrentLevel: accumulatedXP,
    };
};

/**
 * Calculate streak days
 */
export const calculateStreak = (quizResults: QuizResult[]): number => {
    if (!quizResults || quizResults.length === 0) return 0;

    // Get unique dates
    const sortedDates = [...new Set(quizResults.map(r => r.date.split('T')[0]))].sort().reverse();

    if (sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If last play wasn't today or yesterday, streak is broken
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i]);
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Format concept ID to human readable name
 * e.g. "shadow-work" -> "Shadow Work"
 */
export const formatConceptName = (conceptId: string): string => {
    if (!conceptId) return '';
    return conceptId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Get concept mastery progress
 */
export const getConceptMastery = (): ConceptProgress => {
    const stored = StorageManager.getUntyped(CONCEPT_MASTERY_STORAGE_KEY) as ConceptProgress | null;
    if (!stored) {
        return {
            concepts: {},
            totalConceptsMastered: 0,
            totalConceptsExposed: 0
        };
    }
    return stored;
};

/**
 * Update concept mastery based on quiz result
 */
export const updateConceptMastery = (result: QuizResult, questions: QuizQuestion[]): ConceptProgress => {
    const progress = getConceptMastery();
    const today = new Date().toISOString();

    // Track which concepts we've updated in this session to avoid double counting exposures
    const conceptsUpdateInSession = new Set<string>();

    result.answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question || !question.relatedNodes) return;

        // Use relatedNodes as concepts
        question.relatedNodes.forEach(conceptId => {
            // Skip "ilp" as it's too generic, and category names if they are in relatedNodes
            if (conceptId === 'ilp' || conceptId === question.category) return;

            if (!progress.concepts[conceptId]) {
                progress.concepts[conceptId] = {
                    conceptId,
                    conceptName: formatConceptName(conceptId),
                    exposures: 0,
                    correctCount: 0,
                    totalCount: 0,
                    lastReviewDate: today,
                    nextReviewDate: today, // Simple logic for now
                    masteryScore: 0,
                    isMastered: false
                };
            }

            const concept = progress.concepts[conceptId];

            // Only increment exposure once per session per concept
            if (!conceptsUpdateInSession.has(conceptId)) {
                concept.exposures += 1;
                conceptsUpdateInSession.add(conceptId);
            }

            concept.totalCount += 1;
            if (answer.isCorrect) {
                concept.correctCount += 1;
            }
            concept.lastReviewDate = today;

            // Recalculate mastery score
            // Simple formula: (Correct / Total) * 100, but weighted by confidence/exposures
            // Minimum 3 exposures to be considered "mastered"
            const accuracy = (concept.correctCount / concept.totalCount) * 100;

            // Dampen score if low exposure count
            let confidenceFactor = 1;
            if (concept.totalCount < 3) confidenceFactor = 0.5;
            else if (concept.totalCount < 5) confidenceFactor = 0.8;

            concept.masteryScore = Math.round(accuracy * confidenceFactor);
            concept.isMastered = concept.masteryScore >= 80 && concept.totalCount >= 3;
        });
    });

    // Update totals
    progress.totalConceptsExposed = Object.keys(progress.concepts).length;
    progress.totalConceptsMastered = Object.values(progress.concepts).filter(c => c.isMastered).length;

    StorageManager.setUntyped(CONCEPT_MASTERY_STORAGE_KEY, progress);
    return progress;
};

/**
 * Get full gamification profile
 */
export const getUserGamificationProfile = (): UserGamificationState => {
    const xpValue = StorageManager.getUntyped(XP_STORAGE_KEY);
    const resultsValue = StorageManager.getUntyped(QUIZ_RESULTS_STORAGE_KEY) as QuizResult[] | null;
    const achievementsValue = StorageManager.getUntyped(ACHIEVEMENTS_STORAGE_KEY) as Achievement[] | null;

    const totalXP = xpValue ? (typeof xpValue === 'string' ? parseInt(xpValue, 10) : Number(xpValue)) : 0;
    const results: QuizResult[] = resultsValue && Array.isArray(resultsValue) ? resultsValue : [];
    const achievements: Achievement[] = achievementsValue && Array.isArray(achievementsValue) ? achievementsValue : [];

    const levelInfo = calculateLevel(totalXP);
    const streakDays = calculateStreak(results);
    const conceptProgress = getConceptMastery();

    return {
        totalXP,
        level: levelInfo.level,
        nextLevelXP: levelInfo.nextLevelXP,
        streakDays,
        lastPlayDate: results.length > 0 ? results[results.length - 1].date : '',
        totalQuizzesTaken: results.length,
        achievements,
        conceptProgress,
    };
};

/**
 * Award XP for a session
 */
export const awardXP = (amount: number): UserGamificationState => {
    const xpValue = StorageManager.getUntyped(XP_STORAGE_KEY);
    const currentXP = xpValue ? (typeof xpValue === 'string' ? parseInt(xpValue, 10) : Number(xpValue)) : 0;
    const newXP = currentXP + amount;
    StorageManager.setUntyped(XP_STORAGE_KEY, newXP.toString());

    return getUserGamificationProfile();
};

/**
 * Process end of session gamification: updates concepts, awards XP, checks achievements
 */
export const processSessionGamification = (
    result: QuizResult,
    questions: QuizQuestion[],
    pointsEarned: number
): { newState: UserGamificationState, newAchievements: Achievement[] } => {

    // 1. Award XP
    if (pointsEarned > 0) {
        awardXP(pointsEarned);
    }

    // 2. Update Concept Mastery
    updateConceptMastery(result, questions);

    // 3. Check Achievements
    const currentState = getUserGamificationProfile();
    const newAchievements = checkAchievements(currentState, result);

    if (newAchievements.length > 0) {
        const allAchievements = [...currentState.achievements, ...newAchievements];
        StorageManager.setUntyped(ACHIEVEMENTS_STORAGE_KEY, allAchievements);
        currentState.achievements = allAchievements;
    }

    return { newState: currentState, newAchievements };
};
