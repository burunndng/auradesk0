import React, { useState, useEffect } from 'react';
import { typography } from '../../../theme';
import { ModulePod, ModuleMastery } from './ModulePod';
import { ChevronRight, Flame, Target, PlayCircle } from 'lucide-react';
import {
  CompassRoseIcon,
  HexagramIcon,
  LotusIcon,
  YinYangIcon,
  MandalaIcon,
  EndlessKnotIcon,
  ScrollIcon,
  OctagramIcon,
  GrowthSpiralIcon,
} from '../../../components/shared/SacredNavIcons';
import { ILPGraphCategory, DifficultyLevel, QuizResult, QuizQuestion } from '../../../types';
import { QUIZ_RESULTS_STORAGE_KEY, getQuizQuestions, getWeakSpotQuestions } from '../../../data/ilpGraphQuizzes';
import { getUserGamificationProfile, UserGamificationState } from '../../../.claude/lib/quizGamification';
import { StorageManager } from '../../../.claude/lib/storageManager';
import { DailyChallengeCard } from './DailyChallengeCard';
import { getDailyChallenge } from '../../../.claude/lib/dailyChallenge';
import { ConceptMasteryGrid } from './ConceptMasteryGrid';
import { SessionHistory } from './SessionHistory';
import { Leaderboard } from './Leaderboard';
import { LoreLog } from './LoreLog';

interface MissionControlHubProps {
  onStartQuiz: (category: ILPGraphCategory, difficulty: DifficultyLevel, numQuestions: number) => void;
  onStartDailyChallenge?: (questions: QuizQuestion[]) => void;
  stats: {
    totalTaken: number;
    averageScore: number;
    bestScore: number;
    streak: number;
    categoryScores: Record<ILPGraphCategory, { attempts: number; bestScore: number }>;
  } | null;
  isLoading?: boolean;
}

const moduleConfigs: Record<ILPGraphCategory, any> = {
  core: {
    name: 'Core Concepts',
    description: 'Foundations of Integral Life Practice',
    icon: CompassRoseIcon,
    color: {
      primary: '#d6a756',
      light: '#f59e0b',
      dark: '#92400e',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
  },
  body: {
    name: 'Body Module',
    description: 'Gross, subtle, and causal embodiment',
    icon: LotusIcon,
    color: {
      primary: '#34d399',
      light: '#6ee7b7',
      dark: '#065f46',
      glow: 'rgba(52, 211, 153, 0.2)',
    },
  },
  mind: {
    name: 'Mind Module',
    description: 'Cognitive development and perspective-taking',
    icon: HexagramIcon,
    color: {
      primary: '#60a5fa',
      light: '#93c5fd',
      dark: '#1e3a8a',
      glow: 'rgba(96, 165, 250, 0.2)',
    },
  },
  spirit: {
    name: 'Spirit Module',
    description: 'States, stages, and contemplative practice',
    icon: MandalaIcon,
    color: {
      primary: '#2dd4bf',
      light: '#5eead4',
      dark: '#134e4a',
      glow: 'rgba(45, 212, 191, 0.2)',
    },
  },
  shadow: {
    name: 'Shadow Module',
    description: 'Integration of disowned aspects',
    icon: YinYangIcon,
    color: {
      primary: '#c084fc',
      light: '#d8b4fe',
      dark: '#4c1d95',
      glow: 'rgba(192, 132, 252, 0.2)',
    },
  },
  'integral-theory': {
    name: 'Integral Theory',
    description: 'AQAL framework and metatheory',
    icon: EndlessKnotIcon,
    color: {
      primary: '#a78bfa',
      light: '#c4b5fd',
      dark: '#3b0764',
      glow: 'rgba(167, 139, 250, 0.2)',
    },
  },
};

const calculateModuleMastery = (
  category: ILPGraphCategory,
  results: QuizResult[]
): ModuleMastery => {
  const categoryResults = results.filter((r) => r.category === category);

  if (categoryResults.length === 0) {
    return {
      level: 0,
      tier: 'novice',
      questionsAttempted: 0,
      questionsCorrect: 0,
    };
  }

  const questionsAttempted = categoryResults.reduce(
    (sum, r) => sum + r.totalQuestions,
    0
  );
  const questionsCorrect = categoryResults.reduce(
    (sum, r) => sum + r.correctAnswers,
    0
  );
  const averageScore = Math.round(
    categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
  );

  const attemptsBoost = Math.min(categoryResults.length * 5, 30);
  const level = Math.min(Math.round(averageScore * 0.7 + attemptsBoost), 100);

  let tier: 'novice' | 'practitioner' | 'adept' | 'contemplative';
  if (level >= 90) tier = 'contemplative';
  else if (level >= 67) tier = 'adept';
  else if (level >= 34) tier = 'practitioner';
  else tier = 'novice';

  return {
    level,
    tier,
    questionsAttempted,
    questionsCorrect,
  };
};

const depthLabels: Record<DifficultyLevel, string> = {
  beginner: 'Foundation',
  intermediate: 'Practitioner',
  advanced: 'Integration',
  ultra: 'Contemplative',
};

export const MissionControlHub: React.FC<MissionControlHubProps> = ({
  onStartQuiz,
  onStartDailyChallenge,
  stats,
  isLoading,
}) => {
  const [dailyChallenge] = useState(getDailyChallenge());
  const [selectedCategory, setSelectedCategory] = useState<ILPGraphCategory>('core');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [availableQuestionCount, setAvailableQuestionCount] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'hub' | 'history' | 'arena' | 'archives'>('hub');
  const [allResults, setAllResults] = useState<QuizResult[]>([]);
  const [moduleMasteries, setModuleMasteries] = useState<Record<ILPGraphCategory, ModuleMastery>>({
    core: { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
    body: { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
    mind: { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
    spirit: { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
    shadow: { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
    'integral-theory': { level: 0, tier: 'novice', questionsAttempted: 0, questionsCorrect: 0 },
  });
  const [gamificationState, setGamificationState] = useState<UserGamificationState | null>(null);

  useEffect(() => {
    const availableQuestions = getQuizQuestions(selectedCategory, selectedDifficulty, 100);
    const count = availableQuestions.length;
    setAvailableQuestionCount(count);
    if (numQuestions > count) {
      setNumQuestions(Math.max(count, 1));
    }
  }, [selectedCategory, selectedDifficulty, numQuestions]);

  useEffect(() => {
    const results = StorageManager.getUntyped(QUIZ_RESULTS_STORAGE_KEY) as QuizResult[] | null;
    if (results && Array.isArray(results)) {
      setAllResults(results);
      const categories: ILPGraphCategory[] = [
        'core',
        'body',
        'mind',
        'spirit',
        'shadow',
        'integral-theory',
      ];

      const masteries: Record<ILPGraphCategory, ModuleMastery> = {} as Record<ILPGraphCategory, ModuleMastery>;
      categories.forEach((cat) => {
        masteries[cat] = calculateModuleMastery(cat, results);
      });

      setModuleMasteries(masteries);
    }

    setGamificationState(getUserGamificationProfile());
  }, []);

  const handleStartQuiz = () => {
    onStartQuiz(selectedCategory, selectedDifficulty, numQuestions);
  };

  return (
    <div className="space-y-8 sm:space-y-12">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-stone-100">
            ILP Quiz
          </h1>
          <p className="text-stone-500 text-sm max-w-xl leading-relaxed">
            Deepen your understanding of Integral Life Practice through contemplative inquiry and mastery tracking.
          </p>
        </div>

        {/* Gamification Card */}
        {gamificationState && (
          <div className="bg-stone-900/40 backdrop-blur-sm px-5 py-4 rounded-xl border border-stone-800/50 flex items-center gap-5 w-full sm:w-auto sm:self-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-11 h-11 rounded-full bg-amber-900/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <span className="text-base font-serif">L{gamificationState.level}</span>
              </div>
              <span className="text-[9px] text-stone-600 uppercase mt-1.5 font-mono tracking-wider">Level</span>
            </div>

            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="flex justify-between text-[10px] uppercase font-mono">
                <span className="text-stone-500 truncate">Mastery Progress</span>
                <span className="text-amber-500/70 shrink-0 ml-2">{gamificationState.totalXP} XP</span>
              </div>
              <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((gamificationState.totalXP / gamificationState.nextLevelXP) * 100, 100)}%` }}
                />
              </div>
              {gamificationState.streakDays > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-orange-500 font-mono">
                  <Flame size={11} fill="currentColor" />
                  <span>{gamificationState.streakDays} day streak</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone-800/50 overflow-x-auto pb-px scrollbar-none">
        {([
          { id: 'hub', icon: CompassRoseIcon, label: 'Practice' },
          { id: 'history', icon: ScrollIcon, label: 'History' },
          { id: 'arena', icon: OctagramIcon, label: 'Mastery' },
          { id: 'archives', icon: GrowthSpiralIcon, label: 'Lore' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-widest rounded-t-md whitespace-nowrap transition-all shrink-0 ${
              activeTab === id
                ? 'bg-stone-800 text-amber-500 border-b-2 border-amber-600'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Hub View */}
      {activeTab === 'hub' && (
        <div className="space-y-8 sm:space-y-12">

          {/* Daily Challenge */}
          {dailyChallenge && onStartDailyChallenge && (
            <div className="max-w-2xl">
              <DailyChallengeCard
                challenge={dailyChallenge}
                onStart={() => onStartDailyChallenge(dailyChallenge.questions)}
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 bg-stone-900/40 rounded-xl p-5 border border-stone-800/50 grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-serif text-stone-200">{stats?.totalTaken || 0}</div>
                <div className="text-[10px] text-stone-600 uppercase mt-1 tracking-wider">Sessions</div>
              </div>
              <div className="text-center border-l border-stone-800/50">
                <div className="text-lg sm:text-xl font-serif text-stone-200">{stats?.averageScore || 0}%</div>
                <div className="text-[10px] text-stone-600 uppercase mt-1 tracking-wider">Accuracy</div>
              </div>
              <div className="text-center border-l border-stone-800/50">
                <div className="text-lg sm:text-xl font-serif text-stone-200">
                  {gamificationState?.conceptProgress?.totalConceptsMastered || 0}
                </div>
                <div className="text-[10px] text-stone-600 uppercase mt-1 tracking-wider">Mastered</div>
              </div>
              <div className="text-center border-l border-stone-800/50">
                <div className="text-lg sm:text-xl font-serif text-stone-200">
                  {gamificationState?.conceptProgress?.totalConceptsExposed || 0}
                </div>
                <div className="text-[10px] text-stone-600 uppercase mt-1 tracking-wider">Explored</div>
              </div>
            </div>

            <button
              onClick={() => {
                const progress = gamificationState?.conceptProgress;
                if (!progress) { handleStartQuiz(); return; }
                const conceptList = Object.values(progress.concepts as Record<string, any>);
                if (conceptList.length === 0) { handleStartQuiz(); return; }
                const weakQuestions = getWeakSpotQuestions(progress, 10);
                if (weakQuestions.length > 0 && onStartDailyChallenge) {
                  onStartDailyChallenge(weakQuestions);
                } else {
                  handleStartQuiz();
                }
              }}
              className="bg-stone-900/20 border border-stone-800/50 hover:bg-amber-900/20 hover:border-amber-900/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 group min-h-[80px]"
            >
              <PlayCircle className="text-stone-600 group-hover:text-amber-500 transition-colors" size={22} />
              <div>
                <div className="text-[10px] font-bold text-stone-500 group-hover:text-amber-500 uppercase tracking-widest transition-colors">
                  Targeted
                </div>
                <div className="text-[9px] text-stone-700 mt-0.5 uppercase tracking-wider">Practice</div>
              </div>
            </button>
          </div>

          {/* Domain Mastery */}
          <div className="space-y-6">
            <h2 className="text-xs font-medium text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2.5">
              <span className="w-1 h-1 rounded-full bg-amber-600 shrink-0" />
              Domains of Integration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {(Object.keys(moduleConfigs) as ILPGraphCategory[]).map((category) => {
                const config = moduleConfigs[category];
                return (
                  <ModulePod
                    key={category}
                    id={category}
                    name={config.name}
                    description={config.description}
                    icon={config.icon}
                    mastery={moduleMasteries[category]}
                    color={config.color}
                    isSelected={selectedCategory === category}
                    onSelect={() => setSelectedCategory(category)}
                  />
                );
              })}
            </div>
          </div>

          {/* Concepts + Session Config */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT: Concepts */}
            <div className="space-y-4">
              <h2 className="text-xs font-medium text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                {moduleConfigs[selectedCategory].name} Concepts
              </h2>
              <ConceptMasteryGrid
                category={selectedCategory}
                color={moduleConfigs[selectedCategory].color.primary}
              />
            </div>

            {/* RIGHT: Session Config */}
            <div className="bg-stone-900/30 p-5 sm:p-7 rounded-2xl border border-stone-800/40 space-y-7">

              {/* Difficulty */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-medium text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={13} className="shrink-0" />
                  Depth Level
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['beginner', 'intermediate', 'advanced', 'ultra'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(d)}
                      className={`px-3 py-2.5 rounded-lg text-left transition-all border ${
                        selectedDifficulty === d
                          ? 'bg-stone-800 border-stone-600 text-amber-400'
                          : 'bg-stone-900/60 border-stone-800/60 text-stone-500 hover:text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-[11px] font-medium leading-none truncate">
                        {depthLabels[d]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Length */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-medium text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <PlayCircle size={13} className="shrink-0" />
                  Questions
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => {
                    const isDisabled = num > availableQuestionCount;
                    return (
                      <button
                        key={num}
                        disabled={isDisabled}
                        onClick={() => setNumQuestions(num)}
                        className={`py-2 rounded-lg text-sm font-mono transition-all border ${
                          isDisabled ? 'opacity-25 cursor-not-allowed border-stone-800/40 text-stone-700' : ''
                        } ${
                          numQuestions === num && !isDisabled
                            ? 'bg-stone-800 border-stone-600 text-amber-400'
                            : !isDisabled
                            ? 'bg-stone-900/60 border-stone-800/60 text-stone-500 hover:text-stone-300 hover:border-stone-700'
                            : ''
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={availableQuestionCount === 0 || isLoading}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:grayscale transition-all text-stone-950 font-semibold uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                Begin Practice <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs */}
      {activeTab === 'history' && <SessionHistory results={allResults} />}
      {activeTab === 'arena' && (
        <Leaderboard userXP={gamificationState?.totalXP || 0} userLevel={gamificationState?.level || 1} />
      )}
      {activeTab === 'archives' && <LoreLog userLevel={gamificationState?.level || 1} />}

      {/* Footer */}
      <div className="pt-8 border-t border-stone-800/30 flex justify-center">
        <p className="text-[10px] text-stone-700 uppercase tracking-[0.3em]">
          ILP Knowledge · Integral Life Practice
        </p>
      </div>
    </div>
  );
};
