import { QuizQuestion, ILPGraphCategory, DifficultyLevel } from '../../types';
import { ilpGraphQuizzes } from '../../data/ilpGraphQuizzes';

export interface DailyChallenge {
    id: string;
    date: string;
    type: 'speed_run' | 'perfect_score' | 'module_mastery' | 'mixed_bag';
    title: string;
    description: string;
    questions: QuizQuestion[];
    targetScore: number;
    timeLimit?: number; // seconds
    bonusXP: number;
}

/**
 * Simple seeded random number generator
 */
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

/**
 * Generate a deterministic daily challenge based on date
 */
export const getDailyChallenge = (): DailyChallenge => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Create numeric seed from date string (e.g., 2023-10-25 -> 20231025)
    const seed = parseInt(dateStr.replace(/-/g, ''), 10);

    // 4 Challenge Types
    const types = ['speed_run', 'perfect_score', 'module_mastery', 'mixed_bag'];
    const typeIndex = Math.floor(seededRandom(seed) * types.length);
    const type = types[typeIndex] as DailyChallenge['type'];

    let title = '';
    let description = '';
    let questions: QuizQuestion[] = [];
    let targetScore = 80;
    let timeLimit: number | undefined;
    let bonusXP = 100;

    const allQuestions = ilpGraphQuizzes;

    switch (type) {
        case 'speed_run':
            title = 'Speed Demon';
            description = 'Complete 10 questions in under 2 minutes!';
            questions = getRandomQuestions(allQuestions, 10, seed);
            targetScore = 70;
            timeLimit = 120;
            bonusXP = 150;
            break;

        case 'perfect_score':
            title = 'Perfectionist';
            description = 'Get 100% on these 5 tricky questions.';
            questions = getRandomQuestions(allQuestions, 5, seed);
            targetScore = 100;
            bonusXP = 200;
            break;

        case 'module_mastery':
            const categories: ILPGraphCategory[] = ['core', 'body', 'mind', 'spirit', 'shadow', 'integral-theory'];
            const catIndex = Math.floor(seededRandom(seed + 1) * categories.length);
            const category = categories[catIndex];

            title = `${category.charAt(0).toUpperCase() + category.slice(1)} Master`;
            description = `Focus deeply on ${category} concepts today.`;
            questions = allQuestions
                .filter(q => q.category === category)
                .slice(0, 10); // Take first 10 for consistency, or Randomize

            // If safely randomized:
            if (questions.length > 10) {
                questions = getRandomQuestions(questions, 10, seed);
            }

            targetScore = 80;
            bonusXP = 120;
            break;

        case 'mixed_bag':
        default:
            title = 'Integral Mix';
            description = 'A balanced set of questions from all modules.';
            questions = getRandomQuestions(allQuestions, 10, seed);
            targetScore = 80;
            bonusXP = 100;
            break;
    }

    return {
        id: `daily-${dateStr}`,
        date: dateStr,
        type,
        title,
        description,
        questions,
        targetScore,
        timeLimit,
        bonusXP
    };
};

/**
 * Helper to get random questions using seeded RNG
 */
const getRandomQuestions = (pool: QuizQuestion[], count: number, seed: number): QuizQuestion[] => {
    // Clone and shuffle
    const shuffled = [...pool].sort((a, b) => {
        const ra = seededRandom(seed + a.id.length);
        const rb = seededRandom(seed + b.id.length);
        return ra - rb;
    });
    return shuffled.slice(0, count);
};
