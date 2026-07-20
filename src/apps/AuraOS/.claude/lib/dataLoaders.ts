/**
 * Data Loaders - Async module imports for lazy-loading large data files
 *
 * Dynamically imports large data files only when accessed, reducing initial bundle size by ~363KB.
 *
 * Files loaded:
 * - ilpGraphQuizzes: 177KB
 * - meditationPractices: 86KB
 * - bioenergeneticsLibrary: 52KB
 * - biasLibrary: 48KB
 *
 * Usage:
 * ```typescript
 * const quizzes = await loadILPQuizzes();
 * ```
 */

/**
 * Lazy-load ILP Graph Quizzes (177KB)
 * Used in: ILPKnowledgeGraphTab for interactive knowledge graph
 */
export const loadILPQuizzes = async () => {
  const module = await import('../data/ilpGraphQuizzes');
  return module.ilpGraphQuizzes;
};

/**
 * Lazy-load Meditation Practices (86KB)
 * Used in: MeditationTab for guided meditation options
 */
export const loadMeditationPractices = async () => {
  const module = await import('../data/meditationPractices');
  return module.meditationPractices;
};

/**
 * Lazy-load Bioenergetics Library (52KB)
 * Used in: BioenergeneticsTab for bodywork exercises
 */
export const loadBioenergeneticsLibrary = async () => {
  const module = await import('../data/bioenergeneticsLibrary');
  return module.bioenergeneticsPractices;
};

/**
 * Lazy-load Bias Library (48KB)
 * Used in: CognitiveDebiasTab for cognitive bias education
 */
export const loadBiasLibrary = async () => {
  const module = await import('../data/biasLibrary');
  return module.BIAS_LIBRARY;
};

/**
 * Lazy-load Healing Audios (varies)
 * Used in: LibraryTab for audio-based practices
 */
export const loadHealingAudios = async () => {
  const module = await import('../data/healingAudios');
  return module.healingAudios;
};

/**
 * Lazy-load All Practice Data (comprehensive load)
 * Use sparingly - only when importing entire practice library needed
 */
export const loadAllPracticeData = async () => {
  const [quizzes, meditation, bioenergetics, bias, audios] = await Promise.all([
    loadILPQuizzes(),
    loadMeditationPractices(),
    loadBioenergeneticsLibrary(),
    loadBiasLibrary(),
    loadHealingAudios()
  ]);

  return {
    quizzes,
    meditation,
    bioenergetics,
    bias,
    audios
  };
};
