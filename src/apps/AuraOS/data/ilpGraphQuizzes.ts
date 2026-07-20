import { QuizQuestion, ILPGraphCategory, ConceptProgress } from '../types';

export const ilpGraphQuizzes: QuizQuestion[] = [
  // ==================== CORE CONCEPTS (15 questions) ====================

  // Beginner (5)
  {
    id: 'core-1',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'beginner',
    question: 'You discover an ancient text mentioning "ILP" as a path to integrated development. What does this acronym represent?',
    answers: [
      { id: 'a', text: 'Intuitive Life Path', isCorrect: false },
      { id: 'b', text: 'Integral Life Practice', isCorrect: true },
      { id: 'c', text: 'Intellectual Learning Program', isCorrect: false },
      { id: 'd', text: 'Integrated Liberation Protocol', isCorrect: false },
    ],
    correctExplanation: 'ILP stands for **Integral Life Practice**. Think of it as a "operating system" for your life that helps you exercise body, mind, and spirit in a balanced way, rather than just focusing on one area.',
    relatedNodes: ['ilp', 'core-concepts'],
    points: 10,
  },
  {
    id: 'core-2',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'beginner',
    question: 'Your guide explains that ILP is like "cross-training" for the soul. Why uses this metaphor?',
    answers: [
      { id: 'a', text: 'Focuses on aerobic and anaerobic exercise', isCorrect: false },
      { id: 'b', text: 'Engages multiple life dimensions simultaneously', isCorrect: true },
      { id: 'c', text: 'Requires training with multiple partners', isCorrect: false },
      { id: 'd', text: 'Combines Eastern and Western methods only', isCorrect: false },
    ],
    correctExplanation: 'Just as cross-training makes an athlete more resilient by working different muscle groups, **ILP engages multiple dimensions** (Body, Mind, Spirit, Shadow) simultaneously. If you only meditate but ignore your body, or only exercise but ignore your emotions, you become lopsided.',
    relatedNodes: ['ilp', 'integrated-practice'],
    points: 10,
  },
  {
    id: 'core-3',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'beginner',
    question: 'You successfully complete a "1-Minute Module". What key principle have you just demonstrated?',
    answers: [
      { id: 'a', text: 'All practices must last exactly one minute', isCorrect: false },
      { id: 'b', text: 'Consistency matters more than duration', isCorrect: true },
      { id: 'c', text: 'Shorter practices are more effective', isCorrect: false },
      { id: 'd', text: 'Modules should be rotated every minute', isCorrect: false },
    ],
    correctExplanation: 'The **1-Minute Module** proves that **consistency matters more than duration**. It\'s better to do a 1-minute meditation every day than a 1-hour session once a month. It builds the neural pathways of practice.',
    relatedNodes: ['ilp', 'practice-consistency'],
    points: 10,
  },
  {
    id: 'core-4',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'beginner',
    question: 'The scroll reveals the ultimate goal of ILP. It is not just to wake up, but to:',
    answers: [
      { id: 'a', text: 'Achieve permanent enlightened states', isCorrect: false },
      { id: 'b', text: 'Master advanced meditation techniques', isCorrect: false },
      { id: 'c', text: 'Facilitate both awakening and development', isCorrect: true },
      { id: 'd', text: 'Replace traditional spiritual practices', isCorrect: false },
    ],
    correctExplanation: 'ILP aims for both **Waking Up** (enlightenment/states) and **Growing Up** (maturity/stages). You can be spiritually awake but emotionally immature; ILP ensures you develop fully on all fronts.',
    relatedNodes: ['ilp', 'awakening', 'development'],
    points: 10,
  },
  {
    id: 'core-5',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'beginner',
    question: 'You are awarded a "Gold Star Practice". What makes this technique special?',
    answers: [
      { id: 'a', text: 'The most advanced techniques available', isCorrect: false },
      { id: 'b', text: 'Brief, effective, and scalable methods', isCorrect: true },
      { id: 'c', text: 'Practices requiring certified instruction', isCorrect: false },
      { id: 'd', text: 'Techniques reserved for experienced practitioners', isCorrect: false },
    ],
    correctExplanation: ' **Gold Star Practices** are the "biggest bang for your buck" techniques—simple, effective methods (like 3-2-1 Shadow Work or Big Mind) that deliver high impact in short timeframes.',
    relatedNodes: ['ilp', 'gold-star-practices'],
    points: 10,
  },

  // Intermediate (5)
  {
    id: 'core-6',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'intermediate',
    question: 'ILP transforms evolution into "Conscious Evolution" by:',
    answers: [
      { id: 'a', text: 'Rejecting all unconscious processes', isCorrect: false },
      { id: 'b', text: 'Deliberately engaging developmental processes', isCorrect: true },
      { id: 'c', text: 'Accelerating biological adaptation', isCorrect: false },
      { id: 'd', text: 'Focusing exclusively on spiritual growth', isCorrect: false },
    ],
    correctExplanation: 'Conscious Evolution means intentionally engaging with developmental processes rather than letting them happen unconsciously.',
    relatedNodes: ['ilp', 'conscious-evolution'],
    points: 15,
  },
  {
    id: 'core-7',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'intermediate',
    question: 'Why are ongoing "practices" emphasized over "peak experiences"?',
    answers: [
      { id: 'a', text: 'Peak experiences are psychologically harmful', isCorrect: false },
      { id: 'b', text: 'Practices convert states into traits', isCorrect: true },
      { id: 'c', text: 'Peak experiences require less effort', isCorrect: false },
      { id: 'd', text: 'Practices are easier to teach', isCorrect: false },
    ],
    correctExplanation: 'Consistent practices integrate temporary experiences (states) into stable capacities (traits) that become part of your baseline consciousness.',
    relatedNodes: ['ilp', 'states-vs-traits', 'practice'],
    points: 15,
  },
  {
    id: 'core-8',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'intermediate',
    question: '"Waking Up" in ILP primarily involves:',
    answers: [
      { id: 'a', text: 'Progressing through developmental stages', isCorrect: false },
      { id: 'b', text: 'Moving through states of consciousness', isCorrect: true },
      { id: 'c', text: 'Increasing awareness of social issues', isCorrect: false },
      { id: 'd', text: 'Developing cognitive capabilities', isCorrect: false },
    ],
    correctExplanation: 'Waking up addresses consciousness itself—accessing deeper, more open states of awareness beyond ordinary waking consciousness.',
    relatedNodes: ['ilp', 'waking-up', 'consciousness'],
    points: 15,
  },
  {
    id: 'core-9',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'intermediate',
    question: '"Growing Up" in ILP primarily involves:',
    answers: [
      { id: 'a', text: 'Physical maturation over time', isCorrect: false },
      { id: 'b', text: 'Accessing temporary spiritual states', isCorrect: false },
      { id: 'c', text: 'Progressing through developmental stages', isCorrect: true },
      { id: 'd', text: 'Accumulating knowledge and information', isCorrect: false },
    ],
    correctExplanation: 'Growing up involves psychological and cognitive development through stages (from egocentric to socially aware to self-authoring and beyond).',
    relatedNodes: ['ilp', 'growing-up', 'development-stages'],
    points: 15,
  },
  {
    id: 'core-10',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'intermediate',
    question: 'The "1-2-3 of God" practice addresses:',
    answers: [
      { id: 'a', text: 'Three meditation techniques', isCorrect: false },
      { id: 'b', text: 'Spirit in three perspectives', isCorrect: true },
      { id: 'c', text: 'Three levels of enlightenment', isCorrect: false },
      { id: 'd', text: 'Trinity in Christian theology', isCorrect: false },
    ],
    correctExplanation: 'The 1-2-3 of God explores spirit as 1st person (I), 2nd person (Thou), and 3rd person (It) perspectives.',
    relatedNodes: ['ilp', 'spirit-module', 'perspectives'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'core-11',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'advanced',
    question: 'An ILP "catalyst" differs from a "practice" because it:',
    answers: [
      { id: 'a', text: 'Produces more rapid transformation', isCorrect: false },
      { id: 'b', text: 'Initiates rather than sustains development', isCorrect: true },
      { id: 'c', text: 'Works only in the Spirit module', isCorrect: false },
      { id: 'd', text: 'Requires professional guidance', isCorrect: false },
    ],
    correctExplanation: 'A catalyst creates a sudden shift or opening, while practices sustain and deepen development over time.',
    relatedNodes: ['ilp', 'catalysts', 'practices'],
    points: 15,
  },
  {
    id: 'core-12',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'advanced',
    question: 'The "Primacy of Practice" principle addresses:',
    answers: [
      { id: 'a', text: 'The superiority of action over theory', isCorrect: false },
      { id: 'b', text: 'The risk of disembodied intellectualization', isCorrect: true },
      { id: 'c', text: 'The precedence of physical training', isCorrect: false },
      { id: 'd', text: 'The importance of daily routines', isCorrect: false },
    ],
    correctExplanation: 'Primacy of Practice emphasizes that learning must be embodied through actual practice, not just intellectual understanding.',
    relatedNodes: ['ilp', 'primacy-of-practice'],
    points: 15,
  },
  {
    id: 'core-13',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'advanced',
    question: 'ILP addresses the Pre/Trans Fallacy by:',
    answers: [
      { id: 'a', text: 'Rejecting all pre-rational states', isCorrect: false },
      { id: 'b', text: 'Integrating both vertical and horizontal development', isCorrect: true },
      { id: 'c', text: 'Equating pre-rational and trans-rational', isCorrect: false },
      { id: 'd', text: 'Focusing on rational cognition exclusively', isCorrect: false },
    ],
    correctExplanation: 'The Pre/Trans Fallacy error conflates pre-rational (underdeveloped) with trans-rational (transcendent) states. ILP distinguishes them through developmental stages.',
    relatedNodes: ['ilp', 'pre-trans-fallacy', 'development'],
    points: 15,
  },
  {
    id: 'core-14',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'advanced',
    question: 'The "Integral Self" or "Central Coordinator" is:',
    answers: [
      { id: 'a', text: 'The highest developmental structure achieved', isCorrect: false },
      { id: 'b', text: 'The awareness that designs practice', isCorrect: true },
      { id: 'c', text: 'A certified ILP instructor', isCorrect: false },
      { id: 'd', text: 'The most developed intelligence line', isCorrect: false },
    ],
    correctExplanation: 'The Integral Self is the observing awareness that witnesses and orchestrates your practices and development.',
    relatedNodes: ['ilp', 'integral-self', 'witness'],
    points: 15,
  },
  {
    id: 'core-15',
    type: 'multiple-choice',
    category: 'core',
    difficulty: 'advanced',
    question: '"Kosmic Karma Yoga" refers to:',
    answers: [
      { id: 'a', text: 'Traditional Hindu service practices', isCorrect: false },
      { id: 'b', text: 'Work as evolutionary spiritual practice', isCorrect: true },
      { id: 'c', text: 'Physical yoga for cosmic consciousness', isCorrect: false },
      { id: 'd', text: 'Meditation on universal compassion', isCorrect: false },
    ],
    correctExplanation: 'Kosmic Karma Yoga is the practice of engaging work and action as conscious spiritual development.',
    relatedNodes: ['ilp', 'karma-yoga', 'action'],
    points: 15,
  },

  // ==================== BODY MODULE (16 questions) ====================

  // Beginner (5)
  {
    id: 'body-1',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'beginner',
    question: 'A common "Gross Body" practice is:',
    answers: [
      { id: 'a', text: 'Studying anatomy and physiology', isCorrect: false },
      { id: 'b', text: 'Weightlifting or cardiovascular exercise', isCorrect: true },
      { id: 'c', text: 'Psychological shadow work', isCorrect: false },
      { id: 'd', text: 'Cognitive perspective-taking', isCorrect: false },
    ],
    correctExplanation: 'Gross Body practices work with the physical body through exercise, movement, and physical conditioning.',
    relatedNodes: ['body-module', 'gross-body', 'exercise'],
    points: 10,
  },
  {
    id: 'body-2',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'beginner',
    question: 'The Body Module primarily aims to:',
    answers: [
      { id: 'a', text: 'Achieve aesthetic physical perfection', isCorrect: false },
      { id: 'b', text: 'Build foundational health and energy', isCorrect: true },
      { id: 'c', text: 'Prepare for athletic competition', isCorrect: false },
      { id: 'd', text: 'Develop immunity to illness', isCorrect: false },
    ],
    correctExplanation: 'The Body Module supports health, vitality, and the capacity to hold spiritual and psychological development.',
    relatedNodes: ['body-module', 'health', 'vitality'],
    points: 10,
  },
  {
    id: 'body-3',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'beginner',
    question: 'A balanced Body Module includes:',
    answers: [
      { id: 'a', text: 'Study, contemplation, and reflection', isCorrect: false },
      { id: 'b', text: 'Strength, cardio, and flexibility', isCorrect: true },
      { id: 'c', text: 'Diet, supplements, and medication', isCorrect: false },
      { id: 'd', text: 'Yoga, Tai Chi, and Qigong', isCorrect: false },
    ],
    correctExplanation: 'A comprehensive body practice integrates strength training, cardiovascular conditioning, and mobility work.',
    relatedNodes: ['body-module', 'exercise-balance'],
    points: 10,
  },
  {
    id: 'body-4',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'beginner',
    question: 'Subtle energy is also called:',
    answers: [
      { id: 'a', text: 'Muscular tension or armoring', isCorrect: false },
      { id: 'b', text: 'Chi, ki, or prana', isCorrect: true },
      { id: 'c', text: 'Adrenaline or cortisol', isCorrect: false },
      { id: 'd', text: 'Metabolic heat production', isCorrect: false },
    ],
    correctExplanation: 'Subtle energy (chi/ki/prana) is the energetic dimension of the body accessed through breathwork and meditation.',
    relatedNodes: ['body-module', 'subtle-body', 'energy'],
    points: 10,
  },
  {
    id: 'body-5',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'beginner',
    question: 'F.I.T. in exercise represents:',
    answers: [
      { id: 'a', text: 'Fast, Intense, Total workout', isCorrect: false },
      { id: 'b', text: 'Frequency, Intensity, Time parameters', isCorrect: true },
      { id: 'c', text: 'Fitness, Integration, Training approach', isCorrect: false },
      { id: 'd', text: 'Functional, Integrated, Transformative practice', isCorrect: false },
    ],
    correctExplanation: 'F.I.T. is a foundational framework for structuring effective exercise programming.',
    relatedNodes: ['body-module', 'exercise-design', 'fit-principle'],
    points: 10,
  },

  // Intermediate (6)
  {
    id: 'body-6',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: 'The "three bodies" in ILP are:',
    answers: [
      { id: 'a', text: 'Physical, mental, and emotional', isCorrect: false },
      { id: 'b', text: 'Gross, subtle, and causal', isCorrect: true },
      { id: 'c', text: 'Upper, middle, and lower torso', isCorrect: false },
      { id: 'd', text: 'Ectomorph, mesomorph, and endomorph', isCorrect: false },
    ],
    correctExplanation: 'The three bodies represent different dimensions of embodied experience: gross (physical), subtle (energetic), and causal (formless).',
    relatedNodes: ['body-module', 'three-bodies'],
    points: 15,
  },
  {
    id: 'body-7',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: 'Pranayama and Qigong primarily address:',
    answers: [
      { id: 'a', text: 'Gross physical conditioning', isCorrect: false },
      { id: 'b', text: 'Subtle energy cultivation', isCorrect: true },
      { id: 'c', text: 'Causal formless awareness', isCorrect: false },
      { id: 'd', text: 'Social relational dynamics', isCorrect: false },
    ],
    correctExplanation: 'Pranayama (breath work) and Qigong work with the subtle body and its energy channels.',
    relatedNodes: ['body-module', 'pranayama', 'qigong', 'subtle-body'],
    points: 15,
  },
  {
    id: 'body-8',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: 'The Causal Body correlates with:',
    answers: [
      { id: 'a', text: 'Ordinary waking consciousness', isCorrect: false },
      { id: 'b', text: 'Dream and visionary states', isCorrect: false },
      { id: 'c', text: 'Deep sleep and formlessness', isCorrect: true },
      { id: 'd', text: 'High-anxiety stress states', isCorrect: false },
    ],
    correctExplanation: 'The Causal Body is the formless dimension accessed in deep sleep and advanced meditation.',
    relatedNodes: ['body-module', 'causal-body', 'sleep'],
    points: 15,
  },
  {
    id: 'body-9',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: 'Diet in the Body Module:',
    answers: [
      { id: 'a', text: 'Is irrelevant to spiritual practice', isCorrect: false },
      { id: 'b', text: 'Affects both gross and subtle bodies', isCorrect: true },
      { id: 'c', text: 'Matters only for weight management', isCorrect: false },
      { id: 'd', text: 'Is purely a cultural phenomenon', isCorrect: false },
    ],
    correctExplanation: 'Nutrition directly impacts physical health and energy levels needed to sustain spiritual practice.',
    relatedNodes: ['body-module', 'nutrition', 'diet'],
    points: 15,
  },
  {
    id: 'body-10',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: 'The three bodies are related as:',
    answers: [
      { id: 'a', text: 'Completely independent systems', isCorrect: false },
      { id: 'b', text: 'Interpenetrating simultaneous dimensions', isCorrect: true },
      { id: 'c', text: 'Sequential developmental stages', isCorrect: false },
      { id: 'd', text: 'Hierarchical levels only', isCorrect: false },
    ],
    correctExplanation: 'The three bodies exist simultaneously and interconnectedly, not sequentially.',
    relatedNodes: ['body-module', 'three-bodies', 'integration'],
    points: 15,
  },
  {
    id: 'body-11',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'intermediate',
    question: '"Conscious exercise" means:',
    answers: [
      { id: 'a', text: 'Thinking about form and technique', isCorrect: false },
      { id: 'b', text: 'Bringing awareness to sensation and energy', isCorrect: true },
      { id: 'c', text: 'Counting repetitions accurately', isCorrect: false },
      { id: 'd', text: 'Exercising in natural settings', isCorrect: false },
    ],
    correctExplanation: 'Conscious exercise infuses movement with present-moment awareness and sensitivity to the body.',
    relatedNodes: ['body-module', 'conscious-exercise', 'awareness'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'body-12',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'advanced',
    question: 'Integral exercise differs from conventional training by:',
    answers: [
      { id: 'a', text: 'Using lighter weights and more reps', isCorrect: false },
      { id: 'b', text: 'Infusing movement with presence and awareness', isCorrect: true },
      { id: 'c', text: 'Focusing on intimidation and display', isCorrect: false },
      { id: 'd', text: 'Disregarding proper biomechanics', isCorrect: false },
    ],
    correctExplanation: 'Integral exercise combines physical conditioning with conscious awareness and spiritual presence.',
    relatedNodes: ['body-module', 'integral-exercise'],
    points: 15,
  },
  {
    id: 'body-13',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'advanced',
    question: 'The ultimate Causal Body practice is:',
    answers: [
      { id: 'a', text: 'Achieving eight hours nightly sleep', isCorrect: false },
      { id: 'b', text: 'Resting as formless awareness', isCorrect: true },
      { id: 'c', text: 'Performing high-intensity intervals', isCorrect: false },
      { id: 'd', text: 'Practicing witness meditation techniques', isCorrect: false },
    ],
    correctExplanation: 'Resting in formless awareness—accessing the causal dimension of consciousness—is the pinnacle of causal body practice.',
    relatedNodes: ['body-module', 'causal-body', 'formlessness'],
    points: 15,
  },
  {
    id: 'body-14',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'advanced',
    question: 'Somatics emphasizes the body as:',
    answers: [
      { id: 'a', text: 'Objective third-person phenomenon', isCorrect: false },
      { id: 'b', text: 'Subjective first-person experience', isCorrect: true },
      { id: 'c', text: 'Cultural symbol and meaning', isCorrect: false },
      { id: 'd', text: 'Social and systemic force', isCorrect: false },
    ],
    correctExplanation: 'Somatics focuses on subjective lived experience of the body rather than objective analysis.',
    relatedNodes: ['body-module', 'somatics', 'embodiment'],
    points: 15,
  },
  {
    id: 'body-15',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'advanced',
    question: 'The Subtle Body relates to Gross Body as:',
    answers: [
      { id: 'a', text: 'Separate non-interacting systems', isCorrect: false },
      { id: 'b', text: 'Energetic template organizing matter', isCorrect: true },
      { id: 'c', text: 'Effect created by physical exercise', isCorrect: false },
      { id: 'd', text: 'Metaphorical description without reality', isCorrect: false },
    ],
    correctExplanation: 'The subtle body is the energetic blueprint that organizes and animates the physical body.',
    relatedNodes: ['body-module', 'subtle-body', 'gross-body'],
    points: 15,
  },
  {
    id: 'body-16',
    type: 'multiple-choice',
    category: 'body',
    difficulty: 'advanced',
    question: 'Chronic physical tension often reflects:',
    answers: [
      { id: 'a', text: 'Optimal health and vitality', isCorrect: false },
      { id: 'b', text: 'Unresolved psychological material', isCorrect: true },
      { id: 'c', text: 'Superior intelligence markers', isCorrect: false },
      { id: 'd', text: 'Advanced spiritual development', isCorrect: false },
    ],
    correctExplanation: 'Chronic tension typically stores unprocessed emotions and psychological patterns that need integration.',
    relatedNodes: ['body-module', 'somatic-psychology', 'tension'],
    points: 15,
  },

  // ==================== MIND MODULE (15 questions) ====================

  // Beginner (5)
  {
    id: 'mind-1',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'beginner',
    question: 'A core Mind Module practice is:',
    answers: [
      { id: 'a', text: 'Physical strength training', isCorrect: false },
      { id: 'b', text: 'Perspective-taking and study', isCorrect: true },
      { id: 'c', text: 'Breath awareness techniques', isCorrect: false },
      { id: 'd', text: 'Nutritional planning', isCorrect: false },
    ],
    correctExplanation: 'The Mind Module develops cognitive and perspective-taking capacities through study and reflection.',
    relatedNodes: ['mind-module', 'perspective-taking', 'study'],
    points: 10,
  },
  {
    id: 'mind-2',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'beginner',
    question: 'The Mind Module primarily supports:',
    answers: [
      { id: 'a', text: 'Waking Up to spiritual states', isCorrect: false },
      { id: 'b', text: 'Growing Up through stages', isCorrect: true },
      { id: 'c', text: 'Cleaning Up shadow material', isCorrect: false },
      { id: 'd', text: 'Showing Up in relationships', isCorrect: false },
    ],
    correctExplanation: 'The Mind Module facilitates psychological and cognitive development through stages.',
    relatedNodes: ['mind-module', 'growing-up', 'development'],
    points: 10,
  },
  {
    id: 'mind-3',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'beginner',
    question: 'Reading challenging worldviews supports:',
    answers: [
      { id: 'a', text: 'Body Module development', isCorrect: false },
      { id: 'b', text: 'Spirit Module practices', isCorrect: false },
      { id: 'c', text: 'Mind Module expansion', isCorrect: true },
      { id: 'd', text: 'Shadow Module integration', isCorrect: false },
    ],
    correctExplanation: 'Engaging different worldviews develops cognitive flexibility and perspective-taking capacity.',
    relatedNodes: ['mind-module', 'perspective-taking', 'study'],
    points: 10,
  },
  {
    id: 'mind-4',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'beginner',
    question: 'Cognitive development in ILP includes:',
    answers: [
      { id: 'a', text: 'Only formal academic education', isCorrect: false },
      { id: 'b', text: 'Conventional and post-conventional thinking', isCorrect: true },
      { id: 'c', text: 'Memory enhancement techniques', isCorrect: false },
      { id: 'd', text: 'Rapid reading skills', isCorrect: false },
    ],
    correctExplanation: 'ILP supports development from conventional (rule-based, externally validated) to post-conventional (self-authored, integral) thinking.',
    relatedNodes: ['mind-module', 'cognitive-development'],
    points: 10,
  },
  {
    id: 'mind-5',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'beginner',
    question: '"Perspective-taking" means:',
    answers: [
      { id: 'a', text: 'Agreeing with all viewpoints', isCorrect: false },
      { id: 'b', text: 'Understanding multiple worldviews', isCorrect: true },
      { id: 'c', text: 'Maintaining no fixed opinion', isCorrect: false },
      { id: 'd', text: 'Developing debate skills', isCorrect: false },
    ],
    correctExplanation: 'Perspective-taking is the capacity to understand and hold multiple viewpoints simultaneously.',
    relatedNodes: ['mind-module', 'perspective-taking'],
    points: 10,
  },

  // Intermediate (5)
  {
    id: 'mind-6',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'intermediate',
    question: 'Studying developmental stages helps by:',
    answers: [
      { id: 'a', text: 'Proving intellectual superiority', isCorrect: false },
      { id: 'b', text: 'Enabling judgment of others', isCorrect: false },
      { id: 'c', text: 'Cultivating multi-perspectival awareness', isCorrect: true },
      { id: 'd', text: 'Guaranteeing spiritual awakening', isCorrect: false },
    ],
    correctExplanation: 'Understanding developmental stages builds empathy and the ability to recognize where people are in their development.',
    relatedNodes: ['mind-module', 'developmental-stages'],
    points: 15,
  },
  {
    id: 'mind-7',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'intermediate',
    question: 'The "Q" in AQAL refers to:',
    answers: [
      { id: 'a', text: 'Four seasonal cycles', isCorrect: false },
      { id: 'b', text: 'Four fundamental perspectives', isCorrect: true },
      { id: 'c', text: 'Four meditation types', isCorrect: false },
      { id: 'd', text: 'Four ILP modules', isCorrect: false },
    ],
    correctExplanation: 'The Q in AQAL stands for Quadrants—the four fundamental perspectives (I, We, It, Its) for understanding reality.',
    relatedNodes: ['mind-module', 'aqal', 'quadrants'],
    points: 15,
  },
  {
    id: 'mind-8',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'intermediate',
    question: 'Authentic perspective-taking involves:',
    answers: [
      { id: 'a', text: 'Defending your current position', isCorrect: false },
      { id: 'b', text: 'Seeing through another\'s worldview', isCorrect: true },
      { id: 'c', text: 'Creating visual artwork', isCorrect: false },
      { id: 'd', text: 'Avoiding all conflict', isCorrect: false },
    ],
    correctExplanation: 'Authentic perspective-taking means actually understanding the world from another\'s vantage point, not just intellectually.',
    relatedNodes: ['mind-module', 'perspective-taking', 'empathy'],
    points: 15,
  },
  {
    id: 'mind-9',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'intermediate',
    question: 'The "Mind" in ILP is:',
    answers: [
      { id: 'a', text: 'The source of all problems', isCorrect: false },
      { id: 'b', text: 'An object to witness and transcend', isCorrect: true },
      { id: 'c', text: 'Irrelevant to spiritual growth', isCorrect: false },
      { id: 'd', text: 'A fixed unchanging essence', isCorrect: false },
    ],
    correctExplanation: 'The mind can be transcended and observed—it\'s not the deepest level of consciousness, but it can be developed and transformed.',
    relatedNodes: ['mind-module', 'consciousness'],
    points: 15,
  },
  {
    id: 'mind-10',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'intermediate',
    question: '"Construct-aware" thinking involves:',
    answers: [
      { id: 'a', text: 'Building physical structures', isCorrect: false },
      { id: 'b', text: 'Recognizing how models shape perception', isCorrect: true },
      { id: 'c', text: 'Architectural design principles', isCorrect: false },
      { id: 'd', text: 'Enhanced memory techniques', isCorrect: false },
    ],
    correctExplanation: 'Construct-aware thinking recognizes that our mental models shape what we perceive and experience.',
    relatedNodes: ['mind-module', 'mental-models'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'mind-11',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'advanced',
    question: 'Moving from "multi-perspectival" to "integral-aperspectival" means:',
    answers: [
      { id: 'a', text: 'Rejecting all perspectives equally', isCorrect: false },
      { id: 'b', text: 'Seeing patterns connecting perspectives', isCorrect: true },
      { id: 'c', text: 'Defending one perspective rigorously', isCorrect: false },
      { id: 'd', text: 'Maintaining no perspective whatsoever', isCorrect: false },
    ],
    correctExplanation: 'Integral-aperspectival thinking goes beyond holding multiple perspectives to seeing the deeper patterns that connect them.',
    relatedNodes: ['mind-module', 'integral-thinking'],
    points: 15,
  },
  {
    id: 'mind-12',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'advanced',
    question: 'Mind Module supports Shadow work by:',
    answers: [
      { id: 'a', text: 'Rationalizing projections away intellectually', isCorrect: false },
      { id: 'b', text: 'Understanding projection mechanisms cognitively', isCorrect: true },
      { id: 'c', text: 'Replacing shadow work entirely', isCorrect: false },
      { id: 'd', text: 'Judging shadow as pathological', isCorrect: false },
    ],
    correctExplanation: 'Understanding projection intellectually helps us recognize and work with our shadow material.',
    relatedNodes: ['mind-module', 'shadow-work', 'projection'],
    points: 15,
  },
  {
    id: 'mind-13',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'advanced',
    question: '"Tracking your center of gravity" means:',
    answers: [
      { id: 'a', text: 'Monitoring physical balance', isCorrect: false },
      { id: 'b', text: 'Identifying your dominant stage', isCorrect: true },
      { id: 'c', text: 'Finding geographical coordinates', isCorrect: false },
      { id: 'd', text: 'Practicing mindfulness meditation', isCorrect: false },
    ],
    correctExplanation: 'Your center of gravity is your most consistent developmental stage—your baseline of consciousness.',
    relatedNodes: ['mind-module', 'developmental-stages', 'center-of-gravity'],
    points: 15,
  },
  {
    id: 'mind-14',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'advanced',
    question: '"Aperspectival madness" refers to:',
    answers: [
      { id: 'a', text: 'Belief in absolute truth', isCorrect: false },
      { id: 'b', text: 'Paralysis from excessive relativism', isCorrect: true },
      { id: 'c', text: 'Inability to take any perspective', isCorrect: false },
      { id: 'd', text: 'A psychotic disorder', isCorrect: false },
    ],
    correctExplanation: 'Aperspectival madness is the green-stage pathology of seeing all perspectives as equally valid, which paralyzes decision-making.',
    relatedNodes: ['mind-module', 'developmental-pathology'],
    points: 15,
  },
  {
    id: 'mind-15',
    type: 'multiple-choice',
    category: 'mind',
    difficulty: 'advanced',
    question: 'Mind Module versus Spirit Module uses mind to:',
    answers: [
      { id: 'a', text: 'Perform identical functions', isCorrect: false },
      { id: 'b', text: 'Look at world versus at itself', isCorrect: true },
      { id: 'c', text: 'Practice logic versus faith', isCorrect: false },
      { id: 'd', text: 'Develop belief versus disbelief', isCorrect: false },
    ],
    correctExplanation: 'Mind Module uses the mind to understand the world; Spirit Module uses awareness to look at consciousness itself.',
    relatedNodes: ['mind-module', 'spirit-module'],
    points: 15,
  },

  // ==================== SPIRIT MODULE (17 questions) ====================

  // Beginner (6)
  {
    id: 'spirit-1',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: 'A cornerstone Spirit Module practice is:',
    answers: [
      { id: 'a', text: 'Long-distance running', isCorrect: false },
      { id: 'b', text: 'Political debate', isCorrect: false },
      { id: 'c', text: 'Meditation or contemplation', isCorrect: true },
      { id: 'd', text: 'Emotional journaling', isCorrect: false },
    ],
    correctExplanation: 'Meditation and contemplation are fundamental practices for developing consciousness and spiritual awareness.',
    relatedNodes: ['spirit-module', 'meditation'],
    points: 10,
  },
  {
    id: 'spirit-2',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: 'The Spirit Module primarily addresses:',
    answers: [
      { id: 'a', text: 'Career development and success', isCorrect: false },
      { id: 'b', text: 'Relationship with ultimate reality', isCorrect: true },
      { id: 'c', text: 'Social skills enhancement', isCorrect: false },
      { id: 'd', text: 'Religious text analysis', isCorrect: false },
    ],
    correctExplanation: 'The Spirit Module addresses consciousness, meaning, and connection to the sacred or ultimate reality.',
    relatedNodes: ['spirit-module', 'consciousness', 'ultimate-reality'],
    points: 10,
  },
  {
    id: 'spirit-3',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: 'Spirit in ILP can be understood as:',
    answers: [
      { id: 'a', text: 'Supernatural ghost entities', isCorrect: false },
      { id: 'b', text: 'Highest level and ever-present ground', isCorrect: true },
      { id: 'c', text: 'Forces of good versus evil', isCorrect: false },
      { id: 'd', text: 'Optional belief or scientific fact', isCorrect: false },
    ],
    correctExplanation: 'Spirit is both the highest level of development and the ground of all being—transcendent and immanent.',
    relatedNodes: ['spirit-module', 'spirit-definition'],
    points: 10,
  },
  {
    id: 'spirit-4',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: 'The simplest meditation form is:',
    answers: [
      { id: 'a', text: 'Transcendental mantra technique', isCorrect: false },
      { id: 'b', text: 'Witnessing or mindfulness', isCorrect: true },
      { id: 'c', text: 'Ritual chanting', isCorrect: false },
      { id: 'd', text: 'Complex visualization', isCorrect: false },
    ],
    correctExplanation: 'Witnessing or mindfulness—simply observing what arises—is the most direct and accessible meditation.',
    relatedNodes: ['spirit-module', 'meditation', 'mindfulness'],
    points: 10,
  },
  {
    id: 'spirit-5',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: 'Spiritual intelligence involves:',
    answers: [
      { id: 'a', text: 'Religious doctrine knowledge', isCorrect: false },
      { id: 'b', text: 'Direct experience of spirit', isCorrect: true },
      { id: 'c', text: 'Psychic abilities', isCorrect: false },
      { id: 'd', text: 'Regular church attendance', isCorrect: false },
    ],
    correctExplanation: 'Spiritual intelligence is the capacity for direct experiential contact with consciousness and the sacred.',
    relatedNodes: ['spirit-module', 'spiritual-intelligence'],
    points: 10,
  },
  {
    id: 'spirit-6',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'beginner',
    question: '"Big Mind" meditation accesses:',
    answers: [
      { id: 'a', text: 'Enhanced cognitive function', isCorrect: false },
      { id: 'b', text: 'Witness consciousness', isCorrect: true },
      { id: 'c', text: 'Improved memory', isCorrect: false },
      { id: 'd', text: 'Creative problem-solving', isCorrect: false },
    ],
    correctExplanation: 'Big Mind meditation opens awareness to the witnessing consciousness that observes all experience.',
    relatedNodes: ['spirit-module', 'witness-consciousness', 'big-mind'],
    points: 10,
  },

  // Intermediate (6)
  {
    id: 'spirit-7',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: '"Witnessing" practice involves:',
    answers: [
      { id: 'a', text: 'Reporting crimes to authorities', isCorrect: false },
      { id: 'b', text: 'Judging thoughts as they arise', isCorrect: false },
      { id: 'c', text: 'Dis-identifying from mental contents', isCorrect: true },
      { id: 'd', text: 'Stopping all thoughts completely', isCorrect: false },
    ],
    correctExplanation: 'Witnessing is the practice of observing thoughts and experiences from a space of non-identification.',
    relatedNodes: ['spirit-module', 'witness-consciousness', 'meditation'],
    points: 15,
  },
  {
    id: 'spirit-8',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: 'States differ from stages in that:',
    answers: [
      { id: 'a', text: 'States are permanent achievements', isCorrect: false },
      { id: 'b', text: 'States are temporary, stages permanent', isCorrect: true },
      { id: 'c', text: 'Stages are temporary experiences', isCorrect: false },
      { id: 'd', text: 'Both are equally permanent', isCorrect: false },
    ],
    correctExplanation: 'States (meditation experiences) are temporary; stages are stable capacities that remain as baseline consciousness.',
    relatedNodes: ['spirit-module', 'states-vs-stages'],
    points: 15,
  },
  {
    id: 'spirit-9',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: '"State-training" aims to:',
    answers: [
      { id: 'a', text: 'Achieve specific emotional moods', isCorrect: false },
      { id: 'b', text: 'Stabilize states into traits', isCorrect: true },
      { id: 'c', text: 'Enter trance-like conditions', isCorrect: false },
      { id: 'd', text: 'Travel between geographical states', isCorrect: false },
    ],
    correctExplanation: 'State-training integrates temporary spiritual experiences into permanent capacities and traits.',
    relatedNodes: ['spirit-module', 'states', 'practice'],
    points: 15,
  },
  {
    id: 'spirit-10',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: 'The "Nondual" state involves:',
    answers: [
      { id: 'a', text: 'Feeling separate from world', isCorrect: false },
      { id: 'b', text: 'Unity of Spirit and Form', isCorrect: true },
      { id: 'c', text: 'Intellectual belief in God', isCorrect: false },
      { id: 'd', text: 'Deep dreamless sleep', isCorrect: false },
    ],
    correctExplanation: 'Nonduality is the state of experiencing ultimate reality as unified, with no separation between subject and object.',
    relatedNodes: ['spirit-module', 'nonduality'],
    points: 15,
  },
  {
    id: 'spirit-11',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: 'State-stages include:',
    answers: [
      { id: 'a', text: 'Only ordinary waking state', isCorrect: false },
      { id: 'b', text: 'Gross, subtle, causal, witness, nondual', isCorrect: true },
      { id: 'c', text: 'Happy and sad emotions', isCorrect: false },
      { id: 'd', text: 'Alpha, beta, theta brainwaves', isCorrect: false },
    ],
    correctExplanation: 'State-stages are distinct states of consciousness accessible through practice, from gross to increasingly subtle and unified.',
    relatedNodes: ['spirit-module', 'states', 'consciousness'],
    points: 15,
  },
  {
    id: 'spirit-12',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'intermediate',
    question: '"Pointing out instructions":',
    answers: [
      { id: 'a', text: 'Provide navigational directions', isCorrect: false },
      { id: 'b', text: 'Introduce awareness to itself', isCorrect: true },
      { id: 'c', text: 'Teach meditation posture', isCorrect: false },
      { id: 'd', text: 'Offer critical feedback', isCorrect: false },
    ],
    correctExplanation: 'Pointing out instructions directly introduce consciousness to its own true nature.',
    relatedNodes: ['spirit-module', 'meditation', 'pointing-out'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'spirit-13',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'advanced',
    question: '"Spiritual Bypassing" means:',
    answers: [
      { id: 'a', text: 'Skipping meditation sessions', isCorrect: false },
      { id: 'b', text: 'Using spirituality to avoid psychology', isCorrect: true },
      { id: 'c', text: 'Achieving effortless enlightenment', isCorrect: false },
      { id: 'd', text: 'Rejecting spiritual traditions', isCorrect: false },
    ],
    correctExplanation: 'Spiritual bypassing uses spiritual ideas or practices to avoid genuine psychological work and integration.',
    relatedNodes: ['spirit-module', 'spiritual-bypassing', 'integration'],
    points: 15,
  },
  {
    id: 'spirit-14',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'advanced',
    question: '"Involution" describes:',
    answers: [
      { id: 'a', text: 'Evolution from matter to mind', isCorrect: false },
      { id: 'b', text: 'Spirit\'s descent into manifestation', isCorrect: true },
      { id: 'c', text: 'Individual biographical development', isCorrect: false },
      { id: 'd', text: 'Advanced yoga postures', isCorrect: false },
    ],
    correctExplanation: 'Involution is the process of spirit descending into and through matter, creating the conditions for evolution.',
    relatedNodes: ['spirit-module', 'involution', 'evolution'],
    points: 15,
  },
  {
    id: 'spirit-15',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'advanced',
    question: 'Witness relates to Causal and Nondual as:',
    answers: [
      { id: 'a', text: 'Completely unrelated phenomena', isCorrect: false },
      { id: 'b', text: 'Gateway to Causal, opening to Nondual', isCorrect: true },
      { id: 'c', text: 'More advanced than Nondual', isCorrect: false },
      { id: 'd', text: 'Cognitive idea versus real experience', isCorrect: false },
    ],
    correctExplanation: 'Witness consciousness is the gateway to accessing causal states, which can open to nondual realization.',
    relatedNodes: ['spirit-module', 'witness', 'causal', 'nondual'],
    points: 15,
  },
  {
    id: 'spirit-16',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'advanced',
    question: 'In "Wake Up, Grow Up, Clean Up, Show Up," Spirit Module primarily addresses:',
    answers: [
      { id: 'a', text: 'Wake Up', isCorrect: true },
      { id: 'b', text: 'Grow Up', isCorrect: false },
      { id: 'c', text: 'Clean Up', isCorrect: false },
      { id: 'd', text: 'Show Up', isCorrect: false },
    ],
    correctExplanation: 'The Spirit Module addresses Waking Up—accessing states of consciousness and awakening to our true nature.',
    relatedNodes: ['spirit-module', 'wake-up', 'four-dimensions'],
    points: 15,
  },
  {
    id: 'spirit-17',
    type: 'multiple-choice',
    category: 'spirit',
    difficulty: 'advanced',
    question: 'The formless aspect of Spirit corresponds to:',
    answers: [
      { id: 'a', text: 'Gross physical body', isCorrect: false },
      { id: 'b', text: 'Subtle energy body', isCorrect: false },
      { id: 'c', text: 'Causal formless body', isCorrect: true },
      { id: 'd', text: 'No body correspondence', isCorrect: false },
    ],
    correctExplanation: 'The formless dimension of spirit corresponds to the causal body—beyond form and manifestation.',
    relatedNodes: ['spirit-module', 'causal', 'formless'],
    points: 15,
  },

  // ==================== SHADOW MODULE (16 questions) ====================

  // Beginner (5)
  {
    id: 'shadow-1',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'beginner',
    question: '"Shadow" in ILP refers to:',
    answers: [
      { id: 'a', text: 'Literal darkness and absence of light', isCorrect: false },
      { id: 'b', text: 'Repressed or disowned self-aspects', isCorrect: true },
      { id: 'c', text: 'Conscious fears and anxieties', isCorrect: false },
      { id: 'd', text: 'Evil dimensions of human nature', isCorrect: false },
    ],
    correctExplanation: 'The shadow contains aspects of ourselves we have disowned or repressed, whether "negative" traits or positive potentials.',
    relatedNodes: ['shadow-module', 'shadow-work'],
    points: 10,
  },
  {
    id: 'shadow-2',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'beginner',
    question: 'A common Shadow indicator is:',
    answers: [
      { id: 'a', text: 'Feeling calm and centered', isCorrect: false },
      { id: 'b', text: 'Strong irrational reactions to others', isCorrect: true },
      { id: 'c', text: 'Mathematical aptitude', isCorrect: false },
      { id: 'd', text: 'Enjoyment of hobbies', isCorrect: false },
    ],
    correctExplanation: 'Strong emotional reactions often signal projections—signs that shadow material is activated.',
    relatedNodes: ['shadow-module', 'projection', 'triggers'],
    points: 10,
  },
  {
    id: 'shadow-3',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'beginner',
    question: 'The primary ILP Shadow technique is:',
    answers: [
      { id: 'a', text: 'One-minute brief practices', isCorrect: false },
      { id: 'b', text: 'Physical strength training', isCorrect: false },
      { id: 'c', text: 'The 3-2-1 Process', isCorrect: true },
      { id: 'd', text: 'Reading psychology books', isCorrect: false },
    ],
    correctExplanation: 'The 3-2-1 Process is a foundational ILP shadow work technique for integrating disowned aspects.',
    relatedNodes: ['shadow-module', '3-2-1-process'],
    points: 10,
  },
  {
    id: 'shadow-4',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'beginner',
    question: 'Shadow work aims to:',
    answers: [
      { id: 'a', text: 'Eliminate negative self-parts', isCorrect: false },
      { id: 'b', text: 'Re-own and integrate disowned aspects', isCorrect: true },
      { id: 'c', text: 'Analyze others\' problems', isCorrect: false },
      { id: 'd', text: 'Prove personal perfection', isCorrect: false },
    ],
    correctExplanation: 'Shadow integration brings disowned aspects back into conscious awareness and wholeness.',
    relatedNodes: ['shadow-module', 'shadow-work', 'integration'],
    points: 10,
  },
  {
    id: 'shadow-5',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'beginner',
    question: 'Shadow projection typically appears as:',
    answers: [
      { id: 'a', text: 'Literal shadows on walls', isCorrect: false },
      { id: 'b', text: 'Strong charge toward others', isCorrect: true },
      { id: 'c', text: 'Dream content exclusively', isCorrect: false },
      { id: 'd', text: 'Physical illness symptoms', isCorrect: false },
    ],
    correctExplanation: 'Projection appears as intense emotional reactions to others—strong charge often signals disowned material.',
    relatedNodes: ['shadow-module', 'projection'],
    points: 10,
  },

  // Intermediate (6)
  {
    id: 'shadow-6',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: 'The final "1" step in 3-2-1 accomplishes:',
    answers: [
      { id: 'a', text: 'Confronting the charged person', isCorrect: false },
      { id: 'b', text: 'Understanding projection intellectually', isCorrect: false },
      { id: 'c', text: 'Embodying the projected quality', isCorrect: true },
      { id: 'd', text: 'Finding therapeutic support', isCorrect: false },
    ],
    correctExplanation: 'The final "1" step involves integrating and owning the projected quality as part of yourself.',
    relatedNodes: ['shadow-module', '3-2-1-process', 'integration'],
    points: 15,
  },
  {
    id: 'shadow-7',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: '"Projection" is:',
    answers: [
      { id: 'a', text: 'Mathematical geometric concept', isCorrect: false },
      { id: 'b', text: 'Seeing disowned qualities in others', isCorrect: true },
      { id: 'c', text: 'Honest emotional sharing', isCorrect: false },
      { id: 'd', text: 'Film screening technique', isCorrect: false },
    ],
    correctExplanation: 'Projection is the psychological defense mechanism of attributing our disowned aspects to others.',
    relatedNodes: ['shadow-module', 'projection'],
    points: 15,
  },
  {
    id: 'shadow-8',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: '"Golden Shadow" refers to:',
    answers: [
      { id: 'a', text: 'Negative quality projections', isCorrect: false },
      { id: 'b', text: 'Disowned positive qualities', isCorrect: true },
      { id: 'c', text: 'Narcissistic symptoms', isCorrect: false },
      { id: 'd', text: 'Valuable psychological insights', isCorrect: false },
    ],
    correctExplanation: 'The golden shadow contains positive qualities we cannot claim (confidence, power, beauty) that we project onto others.',
    relatedNodes: ['shadow-module', 'golden-shadow'],
    points: 15,
  },
  {
    id: 'shadow-9',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: 'Shadow work is essential for development because:',
    answers: [
      { id: 'a', text: 'Only trauma survivors need it', isCorrect: false },
      { id: 'b', text: 'Each stage has potential shadows', isCorrect: true },
      { id: 'c', text: 'It increases social popularity', isCorrect: false },
      { id: 'd', text: 'It guarantees financial success', isCorrect: false },
    ],
    correctExplanation: 'Everyone has shadow material at every developmental stage that needs integration for authentic growth.',
    relatedNodes: ['shadow-module', 'shadow-work', 'development'],
    points: 15,
  },
  {
    id: 'shadow-10',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: 'Meditation and shadow work:',
    answers: [
      { id: 'a', text: 'Are mutually exclusive practices', isCorrect: false },
      { id: 'b', text: 'Complement each other', isCorrect: true },
      { id: 'c', text: 'Oppose each other', isCorrect: false },
      { id: 'd', text: 'Are identical processes', isCorrect: false },
    ],
    correctExplanation: 'Meditation and shadow work are complementary—meditation opens awareness while shadow work processes what appears.',
    relatedNodes: ['shadow-module', 'meditation', 'shadow-work'],
    points: 15,
  },
  {
    id: 'shadow-11',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'intermediate',
    question: 'The 3-2-1-0 Process adds:',
    answers: [
      { id: 'a', text: 'Additional analytical complexity', isCorrect: false },
      { id: 'b', text: 'Rest in pure awareness', isCorrect: true },
      { id: 'c', text: 'Another person\'s perspective', isCorrect: false },
      { id: 'd', text: 'Written documentation exercises', isCorrect: false },
    ],
    correctExplanation: 'The "0" step involves resting awareness back in itself, witnessing the whole process.',
    relatedNodes: ['shadow-module', '3-2-1-process'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'shadow-12',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'advanced',
    question: 'The 3-2-1 process relates to quadrants by:',
    answers: [
      { id: 'a', text: 'Operating purely subjectively', isCorrect: false },
      { id: 'b', text: 'Moving 2nd/3rd person to 1st person', isCorrect: true },
      { id: 'c', text: 'Focusing on cultural quadrant only', isCorrect: false },
      { id: 'd', text: 'Using systems-theory interventions', isCorrect: false },
    ],
    correctExplanation: 'The 3-2-1 Process moves from third person (external) to second person (dialogue) to first person (integration).',
    relatedNodes: ['shadow-module', '3-2-1-process', 'quadrants'],
    points: 15,
  },
  {
    id: 'shadow-13',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'advanced',
    question: 'Social movements demonizing opposition likely engage in:',
    answers: [
      { id: 'a', text: 'Healthy democratic debate', isCorrect: false },
      { id: 'b', text: 'Collective shadow projection', isCorrect: true },
      { id: 'c', text: 'Effective systems change', isCorrect: false },
      { id: 'd', text: 'Second-tier integral perspective', isCorrect: false },
    ],
    correctExplanation: 'Demonizing opposition is collective shadow projection—groups projecting disowned aspects onto "enemies."',
    relatedNodes: ['shadow-module', 'collective-projection', 'shadow-work'],
    points: 15,
  },
  {
    id: 'shadow-14',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'advanced',
    question: 'Repression versus dissociation:',
    answers: [
      { id: 'a', text: 'Are identical defense mechanisms', isCorrect: false },
      { id: 'b', text: 'Pushing down versus splitting off', isCorrect: true },
      { id: 'c', text: 'Conscious versus unconscious processes', isCorrect: false },
      { id: 'd', text: 'Healthy versus unhealthy responses', isCorrect: false },
    ],
    correctExplanation: 'Repression pushes material into unconsciousness; dissociation splits or separates from experience.',
    relatedNodes: ['shadow-module', 'defense-mechanisms'],
    points: 15,
  },
  {
    id: 'shadow-15',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'advanced',
    question: 'Green stage shadow might include:',
    answers: [
      { id: 'a', text: 'Overly hierarchical judgmentalism', isCorrect: false },
      { id: 'b', text: 'Power-hungry exploitation', isCorrect: false },
      { id: 'c', text: 'Unacknowledged attachment to hierarchy', isCorrect: true },
      { id: 'd', text: 'Impulsive egocentrism', isCorrect: false },
    ],
    correctExplanation: 'Green stage shadow includes disowned hierarchical values, even while consciously embracing egalitarianism.',
    relatedNodes: ['shadow-module', 'developmental-shadow', 'spiral-dynamics'],
    points: 15,
  },
  {
    id: 'shadow-16',
    type: 'multiple-choice',
    category: 'shadow',
    difficulty: 'advanced',
    question: 'Shadow across developmental levels:',
    answers: [
      { id: 'a', text: 'Exists only at lower stages', isCorrect: false },
      { id: 'b', text: 'Has different content at each stage', isCorrect: true },
      { id: 'c', text: 'Has no relationship to stages', isCorrect: false },
      { id: 'd', text: 'Disappears at higher stages', isCorrect: false },
    ],
    correctExplanation: 'Shadow work is ongoing—each stage has its own shadow material unique to that level of development.',
    relatedNodes: ['shadow-module', 'developmental-shadow', 'development'],
    points: 15,
  },

  // ==================== INTEGRAL THEORY (16 questions) ====================

  // Beginner (5)
  {
    id: 'integral-1',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'beginner',
    question: 'AQAL stands for:',
    answers: [
      { id: 'a', text: 'All Questions, All Levels', isCorrect: false },
      { id: 'b', text: 'All Quadrants, Levels, Lines, States, Types', isCorrect: true },
      { id: 'c', text: 'Always Question, Always Learn', isCorrect: false },
      { id: 'd', text: 'A Quality And Level', isCorrect: false },
    ],
    correctExplanation: 'AQAL is the comprehensive framework encompassing all dimensions of reality and human experience.',
    relatedNodes: ['integral-theory', 'aqal'],
    points: 10,
  },
  {
    id: 'integral-2',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'beginner',
    question: 'The Four Quadrants represent:',
    answers: [
      { id: 'a', text: 'Cardinal geographical directions', isCorrect: false },
      { id: 'b', text: 'I, We, It, Its perspectives', isCorrect: true },
      { id: 'c', text: 'Body, Mind, Spirit, Shadow', isCorrect: false },
      { id: 'd', text: 'Past, Present, Future, Eternity', isCorrect: false },
    ],
    correctExplanation: 'The quadrants map interior/exterior and individual/collective dimensions of experience.',
    relatedNodes: ['integral-theory', 'quadrants'],
    points: 10,
  },
  {
    id: 'integral-3',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'beginner',
    question: 'Upper-Left "I" Quadrant addresses:',
    answers: [
      { id: 'a', text: 'Subjective consciousness and experience', isCorrect: true },
      { id: 'b', text: 'Physical brain and organism', isCorrect: false },
      { id: 'c', text: 'Culture and worldviews', isCorrect: false },
      { id: 'd', text: 'Societal functional systems', isCorrect: false },
    ],
    correctExplanation: 'The Upper-Left quadrant is interior-individual: subjective experience, consciousness, and psychology.',
    relatedNodes: ['integral-theory', 'quadrants'],
    points: 10,
  },
  {
    id: 'integral-4',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'beginner',
    question: 'Upper-Right "It" Quadrant addresses:',
    answers: [
      { id: 'a', text: 'Personal feelings and thoughts', isCorrect: false },
      { id: 'b', text: 'Objective empirical reality', isCorrect: true },
      { id: 'c', text: 'Shared cultural values', isCorrect: false },
      { id: 'd', text: 'Societal functional systems', isCorrect: false },
    ],
    correctExplanation: 'The Upper-Right quadrant is exterior-individual: the objective physical body and organisms.',
    relatedNodes: ['integral-theory', 'quadrants'],
    points: 10,
  },
  {
    id: 'integral-5',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'beginner',
    question: '"Holons" are:',
    answers: [
      { id: 'a', text: 'Theoretical gaps or holes', isCorrect: false },
      { id: 'b', text: 'Whole/parts simultaneously', isCorrect: true },
      { id: 'c', text: 'Sacred religious objects', isCorrect: false },
      { id: 'd', text: 'Meditation cushions or seats', isCorrect: false },
    ],
    correctExplanation: 'Holons are entities that are both whole (when viewed as units) and parts (when viewed as constituents of larger wholes).',
    relatedNodes: ['integral-theory', 'holons'],
    points: 10,
  },

  // Intermediate (6)
  {
    id: 'integral-6',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: 'Levels or Stages represent:',
    answers: [
      { id: 'a', text: 'Different building floors', isCorrect: false },
      { id: 'b', text: 'Progressive developmental stages', isCorrect: true },
      { id: 'c', text: 'Temporary emotional moods', isCorrect: false },
      { id: 'd', text: 'Gender-based differences', isCorrect: false },
    ],
    correctExplanation: 'Levels are progressive stages of development through which consciousness and capacity evolve.',
    relatedNodes: ['integral-theory', 'developmental-stages'],
    points: 15,
  },
  {
    id: 'integral-7',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: 'Lines of development are:',
    answers: [
      { id: 'a', text: 'Different walkable paths', isCorrect: false },
      { id: 'b', text: 'Distinct capacities growing through levels', isCorrect: true },
      { id: 'c', text: 'Written text in books', isCorrect: false },
      { id: 'd', text: 'Genetic family lineages', isCorrect: false },
    ],
    correctExplanation: 'Lines of development (cognitive, emotional, spiritual, moral, etc.) are distinct capacities that develop semi-independently.',
    relatedNodes: ['integral-theory', 'lines-of-development'],
    points: 15,
  },
  {
    id: 'integral-8',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: 'The Pre/Trans Fallacy involves:',
    answers: [
      { id: 'a', text: 'Believing evolution has purpose', isCorrect: false },
      { id: 'b', text: 'Confusing pre-rational with trans-rational', isCorrect: true },
      { id: 'c', text: 'Assuming all perspectives equal', isCorrect: false },
      { id: 'd', text: 'Ignoring empirical evidence', isCorrect: false },
    ],
    correctExplanation: 'The Pre/Trans Fallacy is confusing pre-rational (underdeveloped) with trans-rational (transcendent) states.',
    relatedNodes: ['integral-theory', 'pre-trans-fallacy'],
    points: 15,
  },
  {
    id: 'integral-9',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: 'Lower-Left "We" Quadrant addresses:',
    answers: [
      { id: 'a', text: 'Individual brain neurochemistry', isCorrect: false },
      { id: 'b', text: 'Culture and shared values', isCorrect: true },
      { id: 'c', text: 'Technology and infrastructure', isCorrect: false },
      { id: 'd', text: 'Private individual thoughts', isCorrect: false },
    ],
    correctExplanation: 'The Lower-Left quadrant is interior-collective: culture, worldviews, and shared meanings.',
    relatedNodes: ['integral-theory', 'quadrants'],
    points: 15,
  },
  {
    id: 'integral-10',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: '"Center of gravity" refers to:',
    answers: [
      { id: 'a', text: 'Dominant state of consciousness', isCorrect: false },
      { id: 'b', text: 'Most consistent developmental level', isCorrect: true },
      { id: 'c', text: 'Body mass index', isCorrect: false },
      { id: 'd', text: 'Myers-Briggs personality type', isCorrect: false },
    ],
    correctExplanation: 'Center of gravity is your baseline developmental stage—your most consistent level of functioning.',
    relatedNodes: ['integral-theory', 'center-of-gravity', 'development'],
    points: 15,
  },
  {
    id: 'integral-11',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'intermediate',
    question: '"Types" in AQAL are:',
    answers: [
      { id: 'a', text: 'Computer or device models', isCorrect: false },
      { id: 'b', text: 'Horizontal differences across stages', isCorrect: true },
      { id: 'c', text: 'Difficulty levels of practice', isCorrect: false },
      { id: 'd', text: 'Good versus bad categories', isCorrect: false },
    ],
    correctExplanation: 'Types are horizontal variations (personality types, body types) that exist within and across developmental stages.',
    relatedNodes: ['integral-theory', 'aqal', 'types'],
    points: 15,
  },

  // Difficult (5)
  {
    id: 'integral-12',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'advanced',
    question: '"Tetra-meshed" phenomena:',
    answers: [
      { id: 'a', text: 'Are excessively complicated', isCorrect: false },
      { id: 'b', text: 'Require four measurements', isCorrect: false },
      { id: 'c', text: 'Arise simultaneously in all quadrants', isCorrect: true },
      { id: 'd', text: 'Are caught in nets', isCorrect: false },
    ],
    correctExplanation: 'Tetra-meshed means phenomena simultaneously arise across all four quadrants as an integrated whole.',
    relatedNodes: ['integral-theory', 'quadrants', 'tetra-meshed'],
    points: 15,
  },
  {
    id: 'integral-13',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'advanced',
    question: '"Second Tier" consciousness:',
    answers: [
      { id: 'a', text: 'Rejects all previous stages', isCorrect: false },
      { id: 'b', text: 'Values all preceding stages', isCorrect: true },
      { id: 'c', text: 'Believes in mythical deities', isCorrect: false },
      { id: 'd', text: 'Rejects science and rationality', isCorrect: false },
    ],
    correctExplanation: 'Second-tier consciousness (yellow/teal) integrates and honors all previous stages rather than rejecting them.',
    relatedNodes: ['integral-theory', 'spiral-dynamics', 'second-tier'],
    points: 15,
  },
  {
    id: 'integral-14',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'advanced',
    question: 'Integral Methodological Pluralism uses:',
    answers: [
      { id: 'a', text: 'Four quadrants from two perspectives', isCorrect: true },
      { id: 'b', text: 'Quadrants at first and second tier', isCorrect: false },
      { id: 'c', text: 'Four modules plus four quadrants', isCorrect: false },
      { id: 'd', text: 'Eight different spiritual traditions', isCorrect: false },
    ],
    correctExplanation: 'Integral Methodological Pluralism applies the four quadrants from both objective and interpretive perspectives.',
    relatedNodes: ['integral-theory', 'methodological-pluralism'],
    points: 15,
  },
  {
    id: 'integral-15',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'advanced',
    question: '"Structures versus contents" means:',
    answers: [
      { id: 'a', text: 'Architecture versus interior design', isCorrect: false },
      { id: 'b', text: 'Container differs from what\'s contained', isCorrect: true },
      { id: 'c', text: 'All stages think identically', isCorrect: false },
      { id: 'd', text: 'Structure doesn\'t exist', isCorrect: false },
    ],
    correctExplanation: 'Structures (developmental stages) are containers that shape what contents (values, beliefs) can be held.',
    relatedNodes: ['integral-theory', 'structures-contents'],
    points: 15,
  },
  {
    id: 'integral-16',
    type: 'multiple-choice',
    category: 'integral-theory',
    difficulty: 'advanced',
    question: 'Waking Up without Growing Up risks:',
    answers: [
      { id: 'a', text: 'Permanent psychological damage', isCorrect: false },
      { id: 'b', text: 'Interpreting states through immature stages', isCorrect: true },
      { id: 'c', text: 'Making spiritual states unreal', isCorrect: false },
      { id: 'd', text: 'Preventing any awakening', isCorrect: false },
    ],
    correctExplanation: 'Without psychological development, awakening experiences are filtered through immature understanding, leading to distorted applications.',
    relatedNodes: ['integral-theory', 'wake-up', 'grow-up'],
    points: 15,
  },

  // ==================== BODY MODULE - ULTRA (20 questions) ====================
  { id: 'ultra-body-1', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Wilhelm Reich\'s concept of "character armoring" proposes that:', answers: [{ id: 'a', text: 'Muscular tension is purely biomechanical', isCorrect: false }, { id: 'b', text: 'Chronic muscular patterns embody psychological defenses', isCorrect: true }, { id: 'c', text: 'Armor must be physically removed through surgery', isCorrect: false }, { id: 'd', text: 'Only athletes develop body armor', isCorrect: false },], correctExplanation: 'Reich discovered that psychological defenses become somatically encoded as chronic muscular tension patterns. These "armors" protect against both external threat and internal feelings, requiring both psychological and somatic approaches to dissolve.', relatedNodes: ['body-module', 'reich', 'somatic-psychology', 'shadow-module'], points: 25, },
  { id: 'ultra-body-2', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'According to Thomas Hanna\'s Somatics, "sensory-motor amnesia" refers to:', answers: [{ id: 'a', text: 'Forgetting how to perform physical exercises', isCorrect: false }, { id: 'b', text: 'Loss of conscious voluntary control over habitually contracted muscles', isCorrect: true }, { id: 'c', text: 'Memory loss from head injuries', isCorrect: false }, { id: 'd', text: 'Inability to feel pain', isCorrect: false },], correctExplanation: 'Hanna identified that chronic stress patterns become so habituated that we lose awareness and voluntary control of affected muscles. The soma "forgets" these areas, creating chronic tension, pain, and postural distortion that require conscious re-education.', relatedNodes: ['body-module', 'somatics', 'hanna', 'awareness'], points: 25, },
  { id: 'ultra-body-3', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Stephen Porges\' Polyvagal Theory suggests that the ventral vagal state is associated with:', answers: [{ id: 'a', text: 'Fight-or-flight activation', isCorrect: false }, { id: 'b', text: 'Social engagement and safe connection', isCorrect: true }, { id: 'c', text: 'Freeze and shutdown responses', isCorrect: false }, { id: 'd', text: 'Purely cognitive processing', isCorrect: false },], correctExplanation: 'Polyvagal Theory identifies three autonomic states: dorsal vagal (freeze/shutdown), sympathetic (fight/flight), and ventral vagal (social engagement/safety). Body practices that cultivate ventral vagal tone support relational connection and embodied presence.', relatedNodes: ['body-module', 'polyvagal', 'porges', 'nervous-system'], points: 25, },
  { id: 'ultra-body-4', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The subtle body is the immediate interior of the gross body in the same way that:', answers: [{ id: 'a', text: 'Feelings are the interior of brain states', isCorrect: true }, { id: 'b', text: 'Culture is the interior of social systems', isCorrect: false }, { id: 'c', text: 'Dreams are the interior of deep sleep', isCorrect: false }, { id: 'd', text: 'Sentences are the interior of ink patterns', isCorrect: false },], correctExplanation: 'In Wilber\'s formulation, every exterior (UR) has an immediate interior (UL). Subtle energy/prana is the felt interior dimension of the gross physical body, just as felt experience is the interior of neural activity.', relatedNodes: ['body-module', 'subtle-body', 'quadrants', 'interiors'], points: 25, },
  { id: 'ultra-body-5', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Peter Levine\'s Somatic Experiencing approach to trauma emphasizes:', answers: [{ id: 'a', text: 'Detailed verbal recounting of traumatic memories', isCorrect: false }, { id: 'b', text: 'Titrated discharge of survival energy trapped in the body', isCorrect: true }, { id: 'c', text: 'Complete emotional catharsis in each session', isCorrect: false }, { id: 'd', text: 'Purely cognitive reframing of events', isCorrect: false },], correctExplanation: 'Levine observed that animals discharge survival energy through trembling/shaking after threat. Trauma occurs when this discharge is incomplete. SE works with small increments ("titration") of activation to gradually release trapped survival responses.', relatedNodes: ['body-module', 'trauma', 'levine', 'somatic-experiencing'], points: 25, },
  { id: 'ultra-body-6', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The three bodies (gross, subtle, causal) relate to states of consciousness as:', answers: [{ id: 'a', text: 'Gross=waking, subtle=dreaming, causal=deep sleep', isCorrect: true }, { id: 'b', text: 'All three function only in waking state', isCorrect: false }, { id: 'c', text: 'Causal body only functions during exercise', isCorrect: false }, { id: 'd', text: 'The correlation is purely metaphorical', isCorrect: false },], correctExplanation: 'This is the classical Vedantic correlation adopted by Wilber: gross body predominates in waking, subtle body in dream/visionary states, causal body in deep dreamless sleep and formless absorption. Each body is a vehicle for its corresponding state.', relatedNodes: ['body-module', 'three-bodies', 'states', 'vedanta'], points: 25, },
  { id: 'ultra-body-7', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Moshe Feldenkrais\' approach to somatic education is based primarily on:', answers: [{ id: 'a', text: 'Building maximum muscular strength', isCorrect: false }, { id: 'b', text: 'Increasing neuroplasticity through novel movement explorations', isCorrect: true }, { id: 'c', text: 'Stretching muscles to their maximum length', isCorrect: false }, { id: 'd', text: 'Memorizing correct postural positions', isCorrect: false },], correctExplanation: 'Feldenkrais emphasized that the brain, not the muscles, organizes movement. Through slow, curious exploration of novel movement variations, the nervous system develops new options and more efficient organization—improving function through awareness.', relatedNodes: ['body-module', 'feldenkrais', 'neuroplasticity', 'movement'], points: 25, },
  { id: 'ultra-body-8', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The distinction between "körper" and "leib" in phenomenological body theory represents:', answers: [{ id: 'a', text: 'Living body versus dead body', isCorrect: false }, { id: 'b', text: 'Objective body (3rd person) versus lived body (1st person)', isCorrect: true }, { id: 'c', text: 'Healthy body versus diseased body', isCorrect: false }, { id: 'd', text: 'Physical body versus astral body', isCorrect: false },], correctExplanation: 'German phenomenology distinguishes körper (the body as object, seen from outside) from leib (the living body experienced from within). This parallels the UR/UL quadrant distinction and grounds somatic approaches in first-person experience.', relatedNodes: ['body-module', 'phenomenology', 'quadrants', 'lived-experience'], points: 25, },
  { id: 'ultra-body-9', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'A practitioner experiences profound subtle energy phenomena but suffers chronic physical illness. Integrally, this suggests:', answers: [{ id: 'a', text: 'Spiritual advancement transcending physical form', isCorrect: false }, { id: 'b', text: 'Subtle body development outpacing its gross body foundation', isCorrect: true }, { id: 'c', text: 'Necessary purification through illness', isCorrect: false }, { id: 'd', text: 'The subtle experiences are illusory', isCorrect: false },], correctExplanation: 'The gross body is the foundation for subtle development. Neglecting physical health while pursuing subtle practices violates "transcend and include"—the subtle body needs a healthy gross body to ground and sustain its unfoldment.', relatedNodes: ['body-module', 'gross-body', 'subtle-body', 'transcend-include'], points: 25, },
  { id: 'ultra-body-10', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Reich\'s "orgone energy" and Asian concepts of "chi/prana" share what integral interpretation?', answers: [{ id: 'a', text: 'They are identical scientifically verified phenomena', isCorrect: false }, { id: 'b', text: 'Both point to subtle body dimensions requiring quadrant-appropriate investigation', isCorrect: true }, { id: 'c', text: 'Both are completely disproven concepts', isCorrect: false }, { id: 'd', text: 'They have no relationship whatsoever', isCorrect: false },], correctExplanation: 'While their specific claims differ, both Reich and Eastern traditions point to subtle dimensions of embodiment. Integral theory holds that subtle body phenomena are real but require appropriate methodologies (UL/UR) for investigation—neither purely objective nor purely subjective.', relatedNodes: ['body-module', 'subtle-body', 'reich', 'chi', 'methodology'], points: 25, },
  { id: 'ultra-body-11', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'In yoga philosophy, the "koshas" (sheaths) represent:', answers: [{ id: 'a', text: 'Physical layers of muscle and fascia', isCorrect: false }, { id: 'b', text: 'Progressive dimensions from gross to subtle to causal', isCorrect: true }, { id: 'c', text: 'Different yoga poses or asanas', isCorrect: false }, { id: 'd', text: 'Schools of yoga practice', isCorrect: false },], correctExplanation: 'The five koshas (annamaya, pranamaya, manomaya, vijnanamaya, anandamaya) map the spectrum from gross physical body through energy, mind, wisdom, to bliss body—correlating with Wilber\'s three-body model and offering practices for each level.', relatedNodes: ['body-module', 'koshas', 'yoga', 'vedanta'], points: 25, },
  { id: 'ultra-body-12', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'During intensive breathwork, a practitioner experiences spontaneous emotional release and trembling. This indicates:', answers: [{ id: 'a', text: 'Dangerous hyperventilation requiring immediate cessation', isCorrect: false }, { id: 'b', text: 'The breath accessing stored survival responses and shadow material', isCorrect: true }, { id: 'c', text: 'Failure of proper breathing technique', isCorrect: false }, { id: 'd', text: 'Purely physical muscle fatigue', isCorrect: false },], correctExplanation: 'Breathwork can access the subtle body and release stored somatic-emotional material. Trembling (neurogenic tremors) often indicates discharge of held survival energy. This demonstrates the breath as a bridge between gross and subtle dimensions.', relatedNodes: ['body-module', 'breathwork', 'subtle-body', 'trauma-release'], points: 25, },
  { id: 'ultra-body-13', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The concept of "nadis" in yoga and "meridians" in Chinese medicine are best understood integrally as:', answers: [{ id: 'a', text: 'Identical to physical nerves and blood vessels', isCorrect: false }, { id: 'b', text: 'Subtle body geography requiring phenomenological and empirical investigation', isCorrect: true }, { id: 'c', text: 'Pure mythology with no experiential basis', isCorrect: false }, { id: 'd', text: 'Only accessible through drugs', isCorrect: false },], correctExplanation: 'Nadis and meridians represent subtle body maps—experientially real patterns that may correlate with but aren\'t reducible to gross anatomy. Integral approach investigates these through both first-person (UL) and third-person (UR) methodologies.', relatedNodes: ['body-module', 'nadis', 'meridians', 'subtle-body', 'methodology'], points: 25, },
  { id: 'ultra-body-14', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Stanley Keleman\'s "Emotional Anatomy" proposes that:', answers: [{ id: 'a', text: 'Emotions have no bodily component', isCorrect: false }, { id: 'b', text: 'Postural and tissue patterns embody our emotional history and character', isCorrect: true }, { id: 'c', text: 'Anatomy is purely genetic and unchangeable', isCorrect: false }, { id: 'd', text: 'Only facial expressions convey emotion', isCorrect: false },], correctExplanation: 'Keleman, building on Reich, showed how life experiences shape our physical form—posture, tissue density, movement style. The body is a "frozen history" of emotional responses. Somatic work can reshape both structure and emotional patterns.', relatedNodes: ['body-module', 'keleman', 'emotional-anatomy', 'somatics'], points: 25, },
  { id: 'ultra-body-15', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Integral body practice addresses the Lower-Right quadrant by considering:', answers: [{ id: 'a', text: 'Only individual exercise programs', isCorrect: false }, { id: 'b', text: 'Systems, environments, and social determinants of embodiment', isCorrect: true }, { id: 'c', text: 'Personal feelings about the body', isCorrect: false }, { id: 'd', text: 'Cultural body ideals only', isCorrect: false },], correctExplanation: 'The LR quadrant includes healthcare systems, environmental factors, food systems, economic access, and ecological relationships. Integral body practice considers these systemic dimensions—not just individual exercise or subjective experience.', relatedNodes: ['body-module', 'quadrants', 'lower-right', 'systems'], points: 25, },
  { id: 'ultra-body-16', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The "somatic shadow" at higher developmental stages might manifest as:', answers: [{ id: 'a', text: 'Only lower chakra blockages', isCorrect: false }, { id: 'b', text: 'Subtle resistance to fully embodying causal/nondual realization', isCorrect: true }, { id: 'c', text: 'Simple muscular tension', isCorrect: false }, { id: 'd', text: 'Inability to exercise', isCorrect: false },], correctExplanation: 'At higher stages, somatic shadow becomes increasingly subtle—resistance to bringing formless realization fully into form, or subtle dissociation from the body "in the name of" transcendence. True nondual realization embraces the body completely.', relatedNodes: ['body-module', 'shadow-module', 'somatic-shadow', 'nondual'], points: 25, },
  { id: 'ultra-body-17', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'A trauma-informed approach to body practices recognizes that:', answers: [{ id: 'a', text: 'All practices are equally safe for everyone', isCorrect: false }, { id: 'b', text: 'Intense practices may destabilize without proper titration and resourcing', isCorrect: true }, { id: 'c', text: 'Trauma survivors should avoid all body practices', isCorrect: false }, { id: 'd', text: 'Only cognitive therapy addresses trauma', isCorrect: false },], correctExplanation: 'Trauma-informed body work recognizes that certain practices can access traumatic material. Without proper pacing (titration), resourcing, and support, this can retraumatize rather than heal. Safety and stabilization precede deep processing.', relatedNodes: ['body-module', 'trauma', 'safety', 'titration'], points: 25, },
  { id: 'ultra-body-18', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'Sri Aurobindo\'s concept of the "supramental body" represents:', answers: [{ id: 'a', text: 'A metaphor with no practical application', isCorrect: false }, { id: 'b', text: 'Complete divinization of the physical, transforming even cellular consciousness', isCorrect: true }, { id: 'c', text: 'Abandonment of the physical body', isCorrect: false }, { id: 'd', text: 'Superior athletic performance', isCorrect: false },], correctExplanation: 'Aurobindo\'s Integral Yoga aims at transformation of the body itself—not escape from it. The supramental transformation would bring divine consciousness into cellular matter, representing the most radical version of "transcend and include" at the body level.', relatedNodes: ['body-module', 'aurobindo', 'supramental', 'transformation'], points: 25, },
  { id: 'ultra-body-19', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: '"Interoception" in body awareness practice refers to:', answers: [{ id: 'a', text: 'Awareness of the external environment', isCorrect: false }, { id: 'b', text: 'Sense of internal bodily states (heartbeat, breath, gut feelings)', isCorrect: true }, { id: 'c', text: 'Coordination between body parts', isCorrect: false }, { id: 'd', text: 'Visual perception of one\'s body', isCorrect: false },], correctExplanation: 'Interoception is the sense of the internal physiological condition of the body. Research shows interoceptive awareness correlates with emotional intelligence, embodied self-awareness, and the capacity to feel and regulate internal states.', relatedNodes: ['body-module', 'interoception', 'awareness', 'embodiment'], points: 25, },
  { id: 'ultra-body-20', type: 'multiple-choice', category: 'body', difficulty: 'ultra', question: 'The ultimate ILP body practice at advanced stages moves from "exercise" toward:', answers: [{ id: 'a', text: 'No physical practice at all', isCorrect: false }, { id: 'b', text: 'The body as vehicle for embodying all quadrants, states, and stages simultaneously', isCorrect: true }, { id: 'c', text: 'Only subtle body practices', isCorrect: false }, { id: 'd', text: 'Purely witnessing the body from outside', isCorrect: false },], correctExplanation: 'At advanced stages, body practice becomes "kosmic address embodiment"—the living body as the site where awakening, development, and integration are simultaneously enacted across all dimensions. The body becomes transparent to Spirit while remaining fully physical.', relatedNodes: ['body-module', 'advanced-practice', 'embodiment', 'integration'], points: 25, },

  // ==================== MIND MODULE - ULTRA (20 questions) ====================
  { id: 'ultra-mind-1', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Robert Kegan\'s "subject-object" theory proposes that development occurs when:', answers: [{ id: 'a', text: 'We acquire more information', isCorrect: false }, { id: 'b', text: 'What we were subject to (embedded in) becomes object (can be observed)', isCorrect: true }, { id: 'c', text: 'Objects become subjects', isCorrect: false }, { id: 'd', text: 'We reject all previous perspectives', isCorrect: false },], correctExplanation: 'Kegan\'s core insight: at each stage, we are "subject to" (embedded in, can\'t see) certain structures. Development means making subject into object—what we were embedded in becomes something we can see, reflect on, and operate upon.', relatedNodes: ['mind-module', 'kegan', 'subject-object', 'development'], points: 25, },
  { id: 'ultra-mind-2', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Piaget\'s "formal operational" thinking is limited compared to post-formal thinking because it:', answers: [{ id: 'a', text: 'Cannot use abstract logic', isCorrect: false }, { id: 'b', text: 'Operates within a single system without awareness of multiple paradigms', isCorrect: true }, { id: 'c', text: 'Is pre-rational', isCorrect: false }, { id: 'd', text: 'Lacks any cognitive capacity', isCorrect: false },], correctExplanation: 'Piaget\'s formal operations allows abstract, hypothetical reasoning—but within one logical system. Post-formal/post-conventional thinking (Commons, Basseches) can compare systems, tolerate paradox, and operate across paradigms.', relatedNodes: ['mind-module', 'piaget', 'formal-operations', 'post-formal'], points: 25, },
  { id: 'ultra-mind-3', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Susanne Cook-Greuter\'s research on ego development identifies the "Construct-Aware" stage as:', answers: [{ id: 'a', text: 'Simply pluralistic perspective-taking', isCorrect: false }, { id: 'b', text: 'Awareness that all meaning-making is constructed, including one\'s own', isCorrect: true }, { id: 'c', text: 'Rejection of all constructs', isCorrect: false }, { id: 'd', text: 'The final possible stage', isCorrect: false },], correctExplanation: 'Cook-Greuter extended Loevinger\'s ego development research. At Construct-Aware stage, one recognizes the constructed nature of all meaning-making—including one\'s own maps and models—while still functioning through constructs.', relatedNodes: ['mind-module', 'cook-greuter', 'construct-aware', 'ego-development'], points: 25, },
  { id: 'ultra-mind-4', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Jean Gebser\'s "integral-aperspectival" structure differs from "mental-rational" primarily in:', answers: [{ id: 'a', text: 'Rejecting rationality entirely', isCorrect: false }, { id: 'b', text: 'Integrating previous structures while adding transparent awareness of perspective itself', isCorrect: true }, { id: 'c', text: 'Being pre-rational', isCorrect: false }, { id: 'd', text: 'Using only intuition', isCorrect: false },], correctExplanation: 'Gebser saw mental-rational as perspectival (single viewpoint). Integral-aperspectival integrates all previous structures (archaic, magical, mythic, mental) while adding transparency—awareness of the nature of perspectives as such.', relatedNodes: ['mind-module', 'gebser', 'integral-aperspectival', 'structures'], points: 25, },
  { id: 'ultra-mind-5', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Kohlberg\'s highest stages of moral reasoning (post-conventional) are characterized by:', answers: [{ id: 'a', text: 'Following rules set by authorities', isCorrect: false }, { id: 'b', text: 'Principled reasoning based on universal ethical principles', isCorrect: true }, { id: 'c', text: 'Acting for personal gain', isCorrect: false }, { id: 'd', text: 'Conforming to social expectations', isCorrect: false },], correctExplanation: 'Kohlberg\'s Stages 5-6 transcend conventional morality (rules, social approval). Stage 5 reasons from social contract; Stage 6 from universal ethical principles. These require formal and post-formal cognitive capacities.', relatedNodes: ['mind-module', 'kohlberg', 'moral-development', 'post-conventional'], points: 25, },
  { id: 'ultra-mind-6', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The "cognitive line leads" principle means:', answers: [{ id: 'a', text: 'Cognitive development guarantees moral development', isCorrect: false }, { id: 'b', text: 'Cognition sets the upper limit for other lines, but doesn\'t guarantee their development', isCorrect: true }, { id: 'c', text: 'Emotion develops before cognition', isCorrect: false }, { id: 'd', text: 'All lines develop equally', isCorrect: false },], correctExplanation: 'You cannot reason at a moral stage beyond your cognitive capacity—but high cognition doesn\'t guarantee moral development. A brilliant philosopher can defend egocentric behavior. Cognition is necessary but not sufficient.', relatedNodes: ['mind-module', 'lines-of-development', 'cognitive-line', 'moral-line'], points: 25, },
  { id: 'ultra-mind-7', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Michael Commons\' Model of Hierarchical Complexity identifies post-formal stages as:', answers: [{ id: 'a', text: 'Systematic, metasystematic, paradigmatic, cross-paradigmatic', isCorrect: true }, { id: 'b', text: 'Sensorimotor, preoperational, concrete, formal', isCorrect: false }, { id: 'c', text: 'Archaic, magic, mythic, rational', isCorrect: false }, { id: 'd', text: 'Beige, purple, red, blue', isCorrect: false },], correctExplanation: 'Commons\' MHC extends Piaget with empirically-validated post-formal stages: systematic (operating on formal systems), metasystematic (comparing systems), paradigmatic (creating paradigms), and cross-paradigmatic (integrating paradigms).', relatedNodes: ['mind-module', 'commons', 'mhc', 'post-formal'], points: 25, },
  { id: 'ultra-mind-8', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The Pre/Trans Fallacy leads to two opposite errors. PTF-1 and PTF-2 are:', answers: [{ id: 'a', text: 'Both elevate pre-rational to trans-rational', isCorrect: false }, { id: 'b', text: 'PTF-1 elevates pre to trans; PTF-2 reduces trans to pre', isCorrect: true }, { id: 'c', text: 'Both reduce trans-rational to pre-rational', isCorrect: false }, { id: 'd', text: 'They are identical errors', isCorrect: false },], correctExplanation: 'PTF-1 (Romanticism) elevates pre-rational states to trans-rational status—seeing childhood or "primitives" as enlightened. PTF-2 (Reductionism) reduces trans-rational to pre-rational—dismissing mystical experience as regression.', relatedNodes: ['mind-module', 'pre-trans-fallacy', 'ptf-1', 'ptf-2'], points: 25, },
  { id: 'ultra-mind-9', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Kegan\'s distinction between "informational" and "transformational" learning is:', answers: [{ id: 'a', text: 'Informational adds to existing mind; transformational changes the form of mind', isCorrect: true }, { id: 'b', text: 'Both add more information', isCorrect: false }, { id: 'c', text: 'Transformational is about emotional change only', isCorrect: false }, { id: 'd', text: 'They are synonymous', isCorrect: false },], correctExplanation: 'Informational learning fills the existing container of mind with more content. Transformational learning changes the container itself—the structure of meaning-making. ILP aims at transformation, not just information accumulation.', relatedNodes: ['mind-module', 'kegan', 'transformation', 'learning'], points: 25, },
  { id: 'ultra-mind-10', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: '"Aperspectival madness" specifically refers to:', answers: [{ id: 'a', text: 'Clinical psychosis', isCorrect: false }, { id: 'b', text: 'Green stage paralysis from inability to privilege any perspective', isCorrect: true }, { id: 'c', text: 'Integral consciousness', isCorrect: false }, { id: 'd', text: 'Pre-rational confusion', isCorrect: false },], correctExplanation: 'This Green-stage pathology holds that no perspective can be ranked—all are equally valid. But this claim itself ranks egalitarianism as superior—a performative contradiction that leads to decision paralysis and covert hierarchy.', relatedNodes: ['mind-module', 'green-stage', 'aperspectival-madness', 'pathology'], points: 25, },
  { id: 'ultra-mind-11', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'William Perry\'s scheme of intellectual development identifies the transition from "dualism" to "multiplicity" as:', answers: [{ id: 'a', text: 'Realizing that authorities don\'t have all answers, so all opinions are equally valid', isCorrect: true }, { id: 'b', text: 'Achieving integral consciousness', isCorrect: false }, { id: 'c', text: 'Returning to simple right/wrong thinking', isCorrect: false }, { id: 'd', text: 'Developing formal operations', isCorrect: false },], correctExplanation: 'Perry found college students move from dualism (right/wrong, authority knows) to multiplicity (uncertainty means all views equal) to relativism (context-dependent evaluation) to commitment (choosing within relativism).', relatedNodes: ['mind-module', 'perry', 'intellectual-development', 'relativism'], points: 25, },
  { id: 'ultra-mind-12', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The difference between "taking a perspective" and "being taken by a perspective" is:', answers: [{ id: 'a', text: 'Purely grammatical', isCorrect: false }, { id: 'b', text: 'Whether the perspective is object (can be seen) or subject (seeing through it)', isCorrect: true }, { id: 'c', text: 'Active versus passive tense', isCorrect: false }, { id: 'd', text: 'No real difference', isCorrect: false },], correctExplanation: 'When you "take" a perspective, it\'s object—you can see, examine, and potentially transcend it. When you\'re "taken by" a perspective, it\'s subject—invisible, operating through you unconsciously. Development makes subject into object.', relatedNodes: ['mind-module', 'subject-object', 'kegan', 'development'], points: 25, },
  { id: 'ultra-mind-13', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Clare Graves\' original research, which became Spiral Dynamics, was investigating:', answers: [{ id: 'a', text: 'Personality types', isCorrect: false }, { id: 'b', text: 'Adult biopsychosocial development in response to life conditions', isCorrect: true }, { id: 'c', text: 'Childhood cognitive stages', isCorrect: false }, { id: 'd', text: 'Spiritual states of consciousness', isCorrect: false },], correctExplanation: 'Graves researched how adults develop different value systems in response to life conditions. His "Emergent Cyclical Levels of Existence Theory" (ECLET) described levels of psychological maturity, later popularized as Spiral Dynamics by Beck and Cowan.', relatedNodes: ['mind-module', 'graves', 'spiral-dynamics', 'values'], points: 25, },
  { id: 'ultra-mind-14', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Loevinger\'s ego development theory differs from Kohlberg\'s moral development in that:', answers: [{ id: 'a', text: 'They are identical theories', isCorrect: false }, { id: 'b', text: 'Ego development includes character, interpersonal style, and overall meaning-making', isCorrect: true }, { id: 'c', text: 'Moral development is more comprehensive', isCorrect: false }, { id: 'd', text: 'Ego development only addresses childhood', isCorrect: false },], correctExplanation: 'While Kohlberg focused specifically on moral reasoning, Loevinger\'s ego development is broader—including impulse control, character development, interpersonal style, conscious preoccupations, and overall framework of meaning-making.', relatedNodes: ['mind-module', 'loevinger', 'kohlberg', 'ego-development'], points: 25, },
  { id: 'ultra-mind-15', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The relationship between horizontal (translation) and vertical (transformation) development is:', answers: [{ id: 'a', text: 'Transformation is always superior to translation', isCorrect: false }, { id: 'b', text: 'Both are needed—stability within stages and growth between them', isCorrect: true }, { id: 'c', text: 'Translation prevents transformation', isCorrect: false }, { id: 'd', text: 'They are identical', isCorrect: false },], correctExplanation: 'Translation provides healthy functioning within a stage. Transformation moves between stages. Exclusive focus on transformation without translation leads to instability; exclusive translation leads to stagnation. Both are essential.', relatedNodes: ['mind-module', 'translation', 'transformation', 'development'], points: 25, },
  { id: 'ultra-mind-16', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Meta-aware cognition at indigo/violet stages is aware of:', answers: [{ id: 'a', text: 'Only the current paradigm being used', isCorrect: false }, { id: 'b', text: 'The paradigm being used to be aware of paradigms', isCorrect: true }, { id: 'c', text: 'Only lower paradigms', isCorrect: false }, { id: 'd', text: 'Nothing—pure emptiness', isCorrect: false },], correctExplanation: 'True construct-awareness is radically self-reflexive: it sees the seer seeing the seeing. It recognizes that even the framework identifying this level is itself a construct—yet operates through it with increasing transparency.', relatedNodes: ['mind-module', 'meta-awareness', 'construct-aware', 'indigo'], points: 25, },
  { id: 'ultra-mind-17', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The "cognitive shadow" might include:', answers: [{ id: 'a', text: 'Only repressed emotions', isCorrect: false }, { id: 'b', text: 'Disowned modes of knowing—a rationalist may shadow intuition, an intuitive may shadow logic', isCorrect: true }, { id: 'c', text: 'Correct ideas that others reject', isCorrect: false }, { id: 'd', text: 'Only primitive impulses', isCorrect: false },], correctExplanation: 'Cognitive shadow contains disowned ways of knowing. A hyper-rational person may project their intuition; an intuitive type may dismiss their analytical capacity. Both "positive" and "negative" cognitive capacities can be shadowed.', relatedNodes: ['mind-module', 'shadow-module', 'cognitive-shadow', 'projection'], points: 25, },
  { id: 'ultra-mind-18', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: '"Structures versus contents" in developmental theory means:', answers: [{ id: 'a', text: 'There is no difference between how we think and what we think', isCorrect: false }, { id: 'b', text: 'Developmental structures (stages) shape what contents (beliefs) can be held', isCorrect: true }, { id: 'c', text: 'All structures contain identical content', isCorrect: false }, { id: 'd', text: 'Content is more important than structure', isCorrect: false },], correctExplanation: 'Structures are the "containers" of mind—how we make meaning. Contents are what fills them—specific beliefs, values, information. Two people at the same stage can hold very different contents; same content can be held from different stages.', relatedNodes: ['mind-module', 'structures', 'contents', 'development'], points: 25, },
  { id: 'ultra-mind-19', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'Wilber\'s phrase "no one is smart enough to be wrong all the time" implies:', answers: [{ id: 'a', text: 'All perspectives are equally valid', isCorrect: false }, { id: 'b', text: 'Every perspective has grasped some partial truth to be integrated', isCorrect: true }, { id: 'c', text: 'Intelligence testing is unreliable', isCorrect: false }, { id: 'd', text: 'We should never criticize anyone', isCorrect: false },], correctExplanation: 'This principle underlies integral epistemology: every perspective has disclosed some truth about reality. The task is to find the partial truth in each view and integrate it—not simply accept or reject wholesale. Criticism still applies to partial claims of totality.', relatedNodes: ['mind-module', 'epistemology', 'partial-truth', 'integration'], points: 25, },
  { id: 'ultra-mind-20', type: 'multiple-choice', category: 'mind', difficulty: 'ultra', question: 'The highest function of Mind Module in Wilber\'s later work is:', answers: [{ id: 'a', text: 'Mastering integral semiotics', isCorrect: false }, { id: 'b', text: 'Becoming transparent—mind as vehicle for supermind/spirit', isCorrect: true }, { id: 'c', text: 'Collecting all paradigms', isCorrect: false }, { id: 'd', text: 'Permanent meta-systematic thinking', isCorrect: false },], correctExplanation: 'Ultimately, mind becomes transparent to what moves through it—increasingly a clear vehicle for spirit/supermind rather than an end in itself. The goal is not better thinking but transformed thinking transparent to awareness itself.', relatedNodes: ['mind-module', 'transparency', 'supermind', 'spirit'], points: 25, },

  // ==================== SPIRIT MODULE - ULTRA (20 questions) ====================
  { id: 'ultra-spirit-1', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The crucial difference between Witness consciousness and Nondual awareness in Wilber\'s late formulation is:', answers: [{ id: 'a', text: 'Witness is Buddhist; Nondual is Hindu', isCorrect: false }, { id: 'b', text: 'Witness maintains subtle subject-object duality; Nondual collapses even this final distinction', isCorrect: true }, { id: 'c', text: 'Witness is experiential; Nondual is merely conceptual', isCorrect: false }, { id: 'd', text: 'They are identical experiences with different cultural names', isCorrect: false },], correctExplanation: 'The Witness (causal) observes all objects from a place of freedom—but there remains a witness separate from what is witnessed. In nondual awareness, even this final duality collapses: no witness apart from the witnessed, just seamless suchness. This is "One Taste" versus pure causal absorption.', relatedNodes: ['spirit-module', 'witness', 'nondual', 'causal', 'one-taste'], points: 25, },
  { id: 'ultra-spirit-2', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The Wilber-Combs Lattice demonstrates that:', answers: [{ id: 'a', text: 'States and stages are identical dimensions of development', isCorrect: false }, { id: 'b', text: 'Any state can be experienced from any stage, but interpretation differs by structure-stage', isCorrect: true }, { id: 'c', text: 'Higher stages automatically produce higher states', isCorrect: false }, { id: 'd', text: 'State development must precede stage development', isCorrect: false },], correctExplanation: 'The Wilber-Combs Lattice shows states (horizontal) and stages (vertical) as relatively independent dimensions. A person at any developmental stage can access gross, subtle, causal, or nondual states—but will interpret them through their current structure-stage, creating different "flavors" of the same state.', relatedNodes: ['spirit-module', 'wilber-combs', 'states', 'stages', 'interpretation'], points: 25, },
  { id: 'ultra-spirit-3', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Evelyn Underhill\'s classic stages of mystical development (Awakening, Purgation, Illumination, Dark Night, Union) primarily map:', answers: [{ id: 'a', text: 'Cognitive developmental stages', isCorrect: false }, { id: 'b', text: 'State-stages of contemplative unfolding within a devotional framework', isCorrect: true }, { id: 'c', text: 'Pathological psychological conditions', isCorrect: false }, { id: 'd', text: 'Only Christian experience with no universal application', isCorrect: false },], correctExplanation: 'Underhill\'s "Mysticism" (1911) mapped the contemplative journey through state-stages. While framed in Christian terms, her stages parallel descriptions across traditions—from initial awakening through purification, subtle illumination, causal emptying (Dark Night), to unitive realization.', relatedNodes: ['spirit-module', 'underhill', 'mysticism', 'state-stages', 'dark-night'], points: 25, },
  { id: 'ultra-spirit-4', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Daniel P. Brown\'s research on meditation stages across traditions found:', answers: [{ id: 'a', text: 'Each tradition has completely unique stages with no overlap', isCorrect: false }, { id: 'b', text: 'Remarkably similar stage-sequences despite different cultural frameworks', isCorrect: true }, { id: 'c', text: 'Only Tibetan Buddhism has valid meditation stages', isCorrect: false }, { id: 'd', text: 'Meditation stages are purely cultural constructs', isCorrect: false },], correctExplanation: 'Brown\'s "Pointing Out the Great Way" compared Theravada, Mahamudra, and Hindu yoga texts, finding convergent stage-sequences: preliminary practices → concentration → insight stages → awareness itself. This suggests universal deep structures of contemplative development beneath cultural variations.', relatedNodes: ['spirit-module', 'daniel-brown', 'meditation-stages', 'cross-cultural'], points: 25, },
  { id: 'ultra-spirit-5', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Bernadette Roberts\' description of the "experience of no-self" differs from typical enlightenment accounts by emphasizing:', answers: [{ id: 'a', text: 'Dramatic bliss and cosmic consciousness', isCorrect: false }, { id: 'b', text: 'The falling away of the divine self/union itself, leaving only "what is"', isCorrect: true }, { id: 'c', text: 'Maintaining a subtle witnessing self', isCorrect: false }, { id: 'd', text: 'Return to ordinary egoic consciousness', isCorrect: false },], correctExplanation: 'Roberts, a former Carmelite nun, described stages beyond classical unitive mysticism. After union with God, even this divine self falls away—not nihilism, but "what remains when there is no self." Her account points to post-unitive territory rarely mapped in Western mysticism.', relatedNodes: ['spirit-module', 'bernadette-roberts', 'no-self', 'post-unitive'], points: 25, },
  { id: 'ultra-spirit-6', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Franklin Merrell-Wolff distinguished "introception" from ordinary perception as:', answers: [{ id: 'a', text: 'A form of sensory enhancement', isCorrect: false }, { id: 'b', text: 'Direct recognition of consciousness by consciousness, without subject-object division', isCorrect: true }, { id: 'c', text: 'Internal visualization practice', isCorrect: false }, { id: 'd', text: 'Purely conceptual philosophical analysis', isCorrect: false },], correctExplanation: 'Merrell-Wolff, a mathematician-philosopher, coined "introception" for the direct knowledge of awareness by awareness—not perception of an object, but consciousness recognizing its own nature. This non-objective knowing is central to nondual realization.', relatedNodes: ['spirit-module', 'merrell-wolff', 'introception', 'nondual', 'direct-knowledge'], points: 25, },
  { id: 'ultra-spirit-7', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The relationship between involution and evolution in integral spirituality is:', answers: [{ id: 'a', text: 'Involution is failed evolution', isCorrect: false }, { id: 'b', text: 'Involution creates the conditions for evolution; evolution is Spirit returning to itself consciously', isCorrect: true }, { id: 'c', text: 'They are competing theories from different traditions', isCorrect: false }, { id: 'd', text: 'Involution is physical; evolution is spiritual', isCorrect: false },], correctExplanation: 'Involution is Spirit\'s "forgetting" or descent into matter—creating potentials latent in manifestation. Evolution is the reverse arc—Spirit "remembering" itself through matter, life, mind, soul, and spirit. They are two movements of one eternal process.', relatedNodes: ['spirit-module', 'involution', 'evolution', 'aurobindo', 'wilber'], points: 25, },
  { id: 'ultra-spirit-8', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Shinzen Young\'s "See-Hear-Feel" framework contributes to integral spirituality by:', answers: [{ id: 'a', text: 'Replacing traditional meditation entirely', isCorrect: false }, { id: 'b', text: 'Providing systematic sensory clarity training compatible with multiple traditions', isCorrect: true }, { id: 'c', text: 'Focusing only on visual meditation', isCorrect: false }, { id: 'd', text: 'Rejecting contemplative depth for surface techniques', isCorrect: false },], correctExplanation: 'Shinzen developed a systematic approach training sensory clarity, concentration, and equanimity across visual, auditory, and somatic channels. This provides rigorous technique compatible with various traditions—and measurable skills applicable in scientific research.', relatedNodes: ['spirit-module', 'shinzen-young', 'unified-mindfulness', 'sensory-clarity'], points: 25, },
  { id: 'ultra-spirit-9', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Sri Aurobindo\'s "Supermind" differs from ordinary spiritual realization in that it:', answers: [{ id: 'a', text: 'Transcends matter entirely, leaving the body behind', isCorrect: false }, { id: 'b', text: 'Integrates and transforms all levels including matter itself', isCorrect: true }, { id: 'c', text: 'Is purely mental/cognitive achievement', isCorrect: false }, { id: 'd', text: 'Represents a regression to magical thinking', isCorrect: false },], correctExplanation: 'Aurobindo distinguished Supermind (supramental consciousness) from Overmind and lower spiritual realizations. Supermind doesn\'t merely transcend matter—it transforms it. His Integral Yoga aimed at "descent" of supramental consciousness to divinize even physical existence.', relatedNodes: ['spirit-module', 'aurobindo', 'supermind', 'transformation', 'descent'], points: 25, },
  { id: 'ultra-spirit-10', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: '"Pointing out" instructions in Dzogchen and Mahamudra traditions aim to:', answers: [{ id: 'a', text: 'Explain meditation theory in detail', isCorrect: false }, { id: 'b', text: 'Directly introduce awareness to its own nature without gradual path', isCorrect: true }, { id: 'c', text: 'Point to physical objects for concentration', isCorrect: false }, { id: 'd', text: 'Provide ethical behavioral guidelines', isCorrect: false },], correctExplanation: 'Pointing out instructions (Tib: ngo sprod) directly introduce the practitioner to rigpa/nature of mind—not gradual cultivation but immediate recognition. The teacher "points out" what is already present, inviting recognition rather than creation of awareness.', relatedNodes: ['spirit-module', 'pointing-out', 'dzogchen', 'mahamudra', 'recognition'], points: 25, },
  { id: 'ultra-spirit-11', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The "causal" realm in perennial philosophy is characterized by:', answers: [{ id: 'a', text: 'Cause-and-effect logic', isCorrect: false }, { id: 'b', text: 'Formless absorption, the unmanifest source prior to all phenomena', isCorrect: true }, { id: 'c', text: 'Vivid visionary imagery', isCorrect: false }, { id: 'd', text: 'Karmic causation from past lives', isCorrect: false },], correctExplanation: 'The causal realm is the formless dimension—pure unmanifest potentiality from which both gross and subtle phenomena arise. It is "causal" as creative ground, not as cause-effect mechanism. Accessed in deep dreamless sleep naturally, and formless samadhi deliberately.', relatedNodes: ['spirit-module', 'causal', 'formless', 'unmanifest', 'samadhi'], points: 25, },
  { id: 'ultra-spirit-12', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Thomas Merton\'s later writings on contemplation emphasized:', answers: [{ id: 'a', text: 'Exclusive focus on Christian practice without dialogue', isCorrect: false }, { id: 'b', text: 'Deep convergence between Christian contemplation and Zen/Sufi realization at experiential depths', isCorrect: true }, { id: 'c', text: 'Rejection of all Eastern approaches', isCorrect: false }, { id: 'd', text: 'Purely academic comparative study', isCorrect: false },], correctExplanation: 'Merton, a Trappist monk, engaged deeply with Zen (D.T. Suzuki) and Sufism, finding experiential convergence beneath doctrinal differences. His work modeled integral spirituality before the term existed—honoring both contemplative depth and inter-traditional dialogue.', relatedNodes: ['spirit-module', 'merton', 'interfaith', 'contemplation', 'zen'], points: 25, },
  { id: 'ultra-spirit-13', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The "1-2-3 of God" practice integrates:', answers: [{ id: 'a', text: 'Three different deities from different religions', isCorrect: false }, { id: 'b', text: 'Spirit as 1st person (I AM), 2nd person (Thou), and 3rd person (It/Nature)', isCorrect: true }, { id: 'c', text: 'Body, mind, and spirit sequentially', isCorrect: false }, { id: 'd', text: 'Three meditation postures', isCorrect: false },], correctExplanation: 'This ILP practice approaches Spirit through all three perspectives: 1st person (I AM/Buddha-nature within), 2nd person (Thou/devotional relationship with the Divine), and 3rd person (It/Nature/Great Web of Life). This prevents reducing Spirit to any single face.', relatedNodes: ['spirit-module', '1-2-3-of-god', 'perspectives', 'faces-of-god'], points: 25, },
  { id: 'ultra-spirit-14', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'A. H. Almaas\' Diamond Approach differs from traditional spiritual paths by:', answers: [{ id: 'a', text: 'Rejecting all spiritual experience', isCorrect: false }, { id: 'b', text: 'Integrating psychological inquiry with direct spiritual realization', isCorrect: true }, { id: 'c', text: 'Focusing only on cognitive understanding', isCorrect: false }, { id: 'd', text: 'Requiring monastic renunciation', isCorrect: false },], correctExplanation: 'Almaas developed the Diamond Approach integrating depth psychology (object relations, ego development) with direct inquiry into essential nature. This addresses both psychological structures AND spiritual realization—preventing spiritual bypassing while honoring transcendent dimensions.', relatedNodes: ['spirit-module', 'almaas', 'diamond-approach', 'integration', 'essence'], points: 25, },
  { id: 'ultra-spirit-15', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: '"Cleaning Up" relates to "Waking Up" in that:', answers: [{ id: 'a', text: 'They are identical processes with different names', isCorrect: false }, { id: 'b', text: 'Shadow material can distort awakening; awakening can illuminate shadow for integration', isCorrect: true }, { id: 'c', text: 'Cleaning Up must be 100% complete before any Waking Up', isCorrect: false }, { id: 'd', text: 'They are completely independent with no interaction', isCorrect: false },], correctExplanation: 'Waking Up and Cleaning Up are distinct but interactive dimensions. Unexamined shadow distorts even genuine awakening (enlightened ego). Conversely, awakening can illuminate previously unconscious material. Neither substitutes for the other—both are needed.', relatedNodes: ['spirit-module', 'shadow-module', 'wake-up', 'clean-up', 'integration'], points: 25, },
  { id: 'ultra-spirit-16', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Wilber\'s final position on "permanent realization" (recent teachings) emphasizes:', answers: [{ id: 'a', text: 'A permanent state that a few special beings achieve', isCorrect: false }, { id: 'b', text: 'Ever-present awareness with decreasing distortion—no "state" to attain, only obscurations to release', isCorrect: true }, { id: 'c', text: 'Permanent witness as the goal', isCorrect: false }, { id: 'd', text: 'Impossibility of any stable realization', isCorrect: false },], correctExplanation: 'Wilber increasingly emphasizes: awareness is always already present and "permanent"—it\'s not achieved but recognized. What changes is decreasing distortion/obscuration. There is no separate "enlightened state" to attain—just release of what obscures what always already is.', relatedNodes: ['spirit-module', 'permanent-realization', 'ever-present', 'recognition'], points: 25, },
  { id: 'ultra-spirit-17', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The "subtle" realm is characterized by:', answers: [{ id: 'a', text: 'Complete formlessness and emptiness', isCorrect: false }, { id: 'b', text: 'Light, luminosity, archetypal imagery, interior illumination, and trans-personal intuition', isCorrect: true }, { id: 'c', text: 'Only ordinary waking perception', isCorrect: false }, { id: 'd', text: 'Purely conceptual philosophical thought', isCorrect: false },], correctExplanation: 'The subtle realm includes interior luminosity, light, bliss, love, archetypal forms, savikalpa samadhi, visionary experience, and transpersonal intuition. It\'s experienced naturally in dreams and deliberately through meditation. It\'s "subtler" than gross, "grosser" than causal.', relatedNodes: ['spirit-module', 'subtle', 'luminosity', 'archetypes', 'dream'], points: 25, },
  { id: 'ultra-spirit-18', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'Meister Eckhart\'s notion of "Gelassenheit" (releasement/letting-be) anticipates:', answers: [{ id: 'a', text: 'Active striving for spiritual achievement', isCorrect: false }, { id: 'b', text: 'Nondual effortlessness—releasing effort while remaining present', isCorrect: true }, { id: 'c', text: 'Complete spiritual passivity and inaction', isCorrect: false }, { id: 'd', text: 'Purely intellectual philosophical analysis', isCorrect: false },], correctExplanation: 'Eckhart\'s "Gelassenheit" describes releasing attachment to will, achievement, and even "God" as object—allowing the ground of being to presence itself. This anticipates nondual teachings: not passive withdrawal, but released presence. Heidegger later adopted this term.', relatedNodes: ['spirit-module', 'eckhart', 'gelassenheit', 'nondual', 'effortlessness'], points: 25, },
  { id: 'ultra-spirit-19', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'State-training aims to:', answers: [{ id: 'a', text: 'Collect peak experiences without integration', isCorrect: false }, { id: 'b', text: 'Stabilize temporary states into permanent traits through repeated practice', isCorrect: true }, { id: 'c', text: 'Achieve one dramatic experience that changes everything', isCorrect: false }, { id: 'd', text: 'Avoid all altered states', isCorrect: false },], correctExplanation: 'State-training is the practice of repeatedly accessing and stabilizing states until they become traits—stable capacities available as baseline rather than peak experiences. This is "converting states to stages" or "state to trait" through consistent practice.', relatedNodes: ['spirit-module', 'state-training', 'states', 'traits', 'practice'], points: 25, },
  { id: 'ultra-spirit-20', type: 'multiple-choice', category: 'spirit', difficulty: 'ultra', question: 'The assertion "Spirit has no opposite" points to:', answers: [{ id: 'a', text: 'Spirit doesn\'t actually exist', isCorrect: false }, { id: 'b', text: 'Nondual Spirit includes and transcends all dualities, not being one pole of any pair', isCorrect: true }, { id: 'c', text: 'Good and evil don\'t exist conventionally', isCorrect: false }, { id: 'd', text: 'Spiritual practice is pointless', isCorrect: false },], correctExplanation: 'Spirit in its nondual nature is not one term in a duality (spirit vs. matter, sacred vs. profane). It is the ground including all dualities—the space in which all polarities arise. This doesn\'t erase conventional distinctions but recognizes their ultimate context.', relatedNodes: ['spirit-module', 'nondual', 'spirit', 'dualities', 'transcend-include'], points: 25, },

  // ==================== SHADOW MODULE - ULTRA (20 questions) ====================
  { id: 'ultra-shadow-1', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Carl Jung\'s original formulation of the "shadow" included:', answers: [{ id: 'a', text: 'Only negative, evil qualities', isCorrect: false }, { id: 'b', text: 'All repressed contents—both "negative" and "positive" unlived potentials', isCorrect: true }, { id: 'c', text: 'Only childhood trauma', isCorrect: false }, { id: 'd', text: 'Purely collective, never personal material', isCorrect: false },], correctExplanation: 'Jung\'s shadow contains everything the ego doesn\'t identify with—both "negative" traits and unlived positive potentials (what ILP calls "golden shadow"). The shadow is simply the unconscious complement to conscious identity, not inherently negative.', relatedNodes: ['shadow-module', 'jung', 'shadow', 'golden-shadow', 'unconscious'], points: 25, },
  { id: 'ultra-shadow-2', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Wilhelm Reich\'s contribution to shadow work was recognizing that:', answers: [{ id: 'a', text: 'Shadow is purely mental/cognitive', isCorrect: false }, { id: 'b', text: 'Psychological defenses become somatically armored in chronic muscular patterns', isCorrect: true }, { id: 'c', text: 'Shadow doesn\'t affect the body', isCorrect: false }, { id: 'd', text: 'Only verbal analysis can access shadow', isCorrect: false },], correctExplanation: 'Reich discovered that psychological repressions become embodied as chronic muscular tension ("character armor"). This means shadow work often requires somatic approaches—the body stores what the mind represses. This insight bridges Shadow and Body modules.', relatedNodes: ['shadow-module', 'body-module', 'reich', 'armoring', 'somatic'], points: 25, },
  { id: 'ultra-shadow-3', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'The 3-2-1 Process\'s movement from 3rd to 2nd to 1st person mirrors:', answers: [{ id: 'a', text: 'Movement through the four quadrants', isCorrect: false }, { id: 'b', text: 'Reversing projection by shifting from externalized object to owned subject', isCorrect: true }, { id: 'c', text: 'Traditional psychoanalytic free association', isCorrect: false }, { id: 'd', text: 'Sequential chakra activation', isCorrect: false },], correctExplanation: 'Projection pushes 1st person material to 3rd person ("that person is angry"). The 3-2-1 Process reverses this: face it (3rd), talk to it (2nd), be it (1st). This systematically reclaims what was disowned, restoring wholeness.', relatedNodes: ['shadow-module', '3-2-1-process', 'projection', 'subject-object'], points: 25, },
  { id: 'ultra-shadow-4', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Object relations theory contributes to shadow understanding by showing:', answers: [{ id: 'a', text: 'Shadow is purely instinctual', isCorrect: false }, { id: 'b', text: 'Internalized relationship patterns create split-off self and object representations', isCorrect: true }, { id: 'c', text: 'Only oedipal conflicts create shadow', isCorrect: false }, { id: 'd', text: 'Shadow doesn\'t involve relationships', isCorrect: false },], correctExplanation: 'Object relations theorists (Klein, Fairbairn, Winnicott) showed how early relationships are internalized as self-object representations. "Bad" aspects get split off and repressed, creating shadow. Integration involves reclaiming these split-off internal objects.', relatedNodes: ['shadow-module', 'object-relations', 'klein', 'splitting', 'internalization'], points: 25, },
  { id: 'ultra-shadow-5', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'The "Golden Shadow" is particularly challenging because:', answers: [{ id: 'a', text: 'It only contains negative qualities', isCorrect: false }, { id: 'b', text: 'Owning positive qualities (power, beauty, brilliance) triggers vulnerability and imposter fears', isCorrect: true }, { id: 'c', text: 'It doesn\'t actually exist', isCorrect: false }, { id: 'd', text: 'It requires no integration work', isCorrect: false },], correctExplanation: 'Golden shadow contains disowned positive qualities—power, beauty, intelligence, wisdom. Reclaiming these means facing fears of visibility, success, envy, and the vulnerability of "being seen." Many find it harder to own their light than their darkness.', relatedNodes: ['shadow-module', 'golden-shadow', 'projection', 'positive-qualities'], points: 25, },
  { id: 'ultra-shadow-6', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'John Welwood coined "spiritual bypassing" to describe:', answers: [{ id: 'a', text: 'Skipping preliminary meditation practices', isCorrect: false }, { id: 'b', text: 'Using spiritual ideas/practices to avoid facing psychological wounds', isCorrect: true }, { id: 'c', text: 'Achieving enlightenment too quickly', isCorrect: false }, { id: 'd', text: 'Rejecting all spiritual traditions', isCorrect: false },], correctExplanation: 'Welwood observed how spiritual truths ("there is no self," "all is one") can become defenses against genuine psychological work. Spiritual bypassing uses authentic spiritual insights to avoid—rather than integrate—shadow material. This creates "spiritual shadow."', relatedNodes: ['shadow-module', 'spirit-module', 'welwood', 'spiritual-bypassing'], points: 25, },
  { id: 'ultra-shadow-7', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Each developmental stage has its own characteristic shadow because:', answers: [{ id: 'a', text: 'Shadow only exists at lower stages', isCorrect: false }, { id: 'b', text: 'Each stage\'s identity structure disowns what contradicts its self-image', isCorrect: true }, { id: 'c', text: 'Shadow disappears at integral stages', isCorrect: false }, { id: 'd', text: 'Development has no relationship to shadow', isCorrect: false },], correctExplanation: 'Every stage has a self-identity that excludes certain qualities. Orange shadows dependency; Green shadows hierarchy; Teal shadows its own subtle superiority. Development creates new shadows even while integrating old ones. Shadow work is never "finished."', relatedNodes: ['shadow-module', 'developmental-shadow', 'stages', 'identity'], points: 25, },
  { id: 'ultra-shadow-8', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Robert Bly\'s description of the "long bag we drag behind us" refers to:', answers: [{ id: 'a', text: 'Physical possessions accumulated over life', isCorrect: false }, { id: 'b', text: 'Qualities stuffed into the shadow from childhood onwards', isCorrect: true }, { id: 'c', text: 'Past life karma', isCorrect: false }, { id: 'd', text: 'Genetic inheritance', isCorrect: false },], correctExplanation: 'Poet Robert Bly described how we spend the first decades of life putting parts of ourselves into a "long bag"—qualities rejected by family, culture, and self. The second half of life involves retrieving what we\'ve hidden there. Shadow work is emptying the bag.', relatedNodes: ['shadow-module', 'bly', 'repression', 'retrieval'], points: 25, },
  { id: 'ultra-shadow-9', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'The difference between repression and dissociation is:', answers: [{ id: 'a', text: 'They are identical defense mechanisms', isCorrect: false }, { id: 'b', text: 'Repression pushes down but maintains connection; dissociation splits off more radically', isCorrect: true }, { id: 'c', text: 'Repression is more severe', isCorrect: false }, { id: 'd', text: 'Dissociation is always healthy', isCorrect: false },], correctExplanation: 'Repression pushes material into unconsciousness while maintaining some connection—it can be retrieved. Dissociation more radically splits material off, fragmenting self-experience. Dissociated material requires gentler, trauma-informed approaches than repressed content.', relatedNodes: ['shadow-module', 'repression', 'dissociation', 'defense-mechanisms', 'trauma'], points: 25, },
  { id: 'ultra-shadow-10', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Collective shadow projection in social movements often manifests as:', answers: [{ id: 'a', text: 'Healthy democratic debate', isCorrect: false }, { id: 'b', text: 'Demonizing opposition while being blind to one\'s own shadow dynamics', isCorrect: true }, { id: 'c', text: 'Second-tier integral perspective-taking', isCorrect: false }, { id: 'd', text: 'Effective systemic change', isCorrect: false },], correctExplanation: 'Groups, like individuals, have shadows. Movements often project disowned qualities onto "enemies"—seeing all evil "out there" while denying similar dynamics within. Authentic activism includes collective shadow awareness and self-examination.', relatedNodes: ['shadow-module', 'collective-shadow', 'projection', 'activism'], points: 25, },
  { id: 'ultra-shadow-11', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'A practitioner intensely idolizes their spiritual teacher. Shadow-wise, this likely involves:', answers: [{ id: 'a', text: 'Healthy devotion requiring no examination', isCorrect: false }, { id: 'b', text: 'Golden shadow projection—disowning one\'s own wisdom and projecting it onto the teacher', isCorrect: true }, { id: 'c', text: 'Recognition of the teacher\'s actual perfection', isCorrect: false }, { id: 'd', text: 'Automatic transmission of realization', isCorrect: false },], correctExplanation: 'Intense idealization often signals golden shadow projection—one\'s own disowned wisdom, power, or realization projected onto the teacher. While devotion can be authentic, intense charge suggests projection. Eventually, these qualities must be reclaimed.', relatedNodes: ['shadow-module', 'golden-shadow', 'projection', 'teacher-relationship', 'idealization'], points: 25, },
  { id: 'ultra-shadow-12', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'The 3-2-1-0 Process adds "0" to represent:', answers: [{ id: 'a', text: 'Returning to numbness and dissociation', isCorrect: false }, { id: 'b', text: 'Resting in witnessing awareness/Big Mind that holds all aspects', isCorrect: true }, { id: 'c', text: 'Starting the process over', isCorrect: false }, { id: 'd', text: 'Zero tolerance for shadow material', isCorrect: false },], correctExplanation: 'The "0" step returns to witnessing awareness—the spacious openness that can hold all aspects without identification or rejection. This grounds shadow work in spiritual awareness, preventing both avoidance and overwhelm.', relatedNodes: ['shadow-module', '3-2-1-process', 'witness', 'big-mind', 'integration'], points: 25, },
  { id: 'ultra-shadow-13', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Green stage shadow often includes disowned:', answers: [{ id: 'a', text: 'Egalitarianism and sensitivity', isCorrect: false }, { id: 'b', text: 'Hierarchical judgment and desire to rank perspectives', isCorrect: true }, { id: 'c', text: 'Magical thinking', isCorrect: false }, { id: 'd', text: 'Scientific rationality', isCorrect: false },], correctExplanation: 'Green consciously embraces egalitarianism but often shadows its own hierarchical judgments. The irony: declaring "all perspectives equal" is itself a ranking (egalitarianism > hierarchy). This covert hierarchy becomes shadow, emerging as "green meanness."', relatedNodes: ['shadow-module', 'green-stage', 'developmental-shadow', 'hierarchy'], points: 25, },
  { id: 'ultra-shadow-14', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Peter Levine\'s Somatic Experiencing relates to shadow work by showing:', answers: [{ id: 'a', text: 'Shadow is purely psychological', isCorrect: false }, { id: 'b', text: 'Trauma creates frozen survival responses that function like somatic shadow', isCorrect: true }, { id: 'c', text: 'Body has no role in shadow', isCorrect: false }, { id: 'd', text: 'Only talk therapy addresses shadow', isCorrect: false },], correctExplanation: 'Levine showed that incomplete survival responses become frozen in the body—functioning as somatic shadow material. These aren\'t just psychological but physiological patterns requiring body-based approaches for integration.', relatedNodes: ['shadow-module', 'body-module', 'levine', 'somatic-experiencing', 'trauma'], points: 25, },
  { id: 'ultra-shadow-15', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Meditation and shadow work are complementary because:', answers: [{ id: 'a', text: 'They are identical processes', isCorrect: false }, { id: 'b', text: 'Meditation develops witnessing capacity; shadow work processes what awareness reveals', isCorrect: true }, { id: 'c', text: 'Meditation replaces the need for shadow work', isCorrect: false }, { id: 'd', text: 'They should never be combined', isCorrect: false },], correctExplanation: 'Meditation develops the witness capacity that can observe arising material without being overwhelmed or identified. Shadow work provides specific methods to process and integrate what awareness reveals. Neither substitutes for the other.', relatedNodes: ['shadow-module', 'spirit-module', 'meditation', 'witness', 'integration'], points: 25, },
  { id: 'ultra-shadow-16', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Re-owning shadow does NOT mean:', answers: [{ id: 'a', text: 'Acknowledging disowned qualities consciously', isCorrect: false }, { id: 'b', text: 'Acting out every repressed impulse without restraint', isCorrect: true }, { id: 'c', text: 'Integrating denied aspects into wholeness', isCorrect: false }, { id: 'd', text: 'Becoming more psychologically complete', isCorrect: false },], correctExplanation: 'Re-owning shadow means conscious acknowledgment and integration—not acting out. One can own aggressive energy without violence, sexual energy without exploitation. Integration means having access to previously denied energy, with conscious choice about expression.', relatedNodes: ['shadow-module', 'integration', 're-owning', 'acting-out', 'conscious-choice'], points: 25, },
  { id: 'ultra-shadow-17', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Difficulty completing 3-2-1 process (getting stuck at one step) often indicates:', answers: [{ id: 'a', text: 'The material is not actually shadow', isCorrect: false }, { id: 'b', text: 'Significant dissociation or trauma requiring gentler, titrated approach', isCorrect: true }, { id: 'c', text: 'The practice has failed permanently', isCorrect: false }, { id: 'd', text: 'More forceful effort is needed', isCorrect: false },], correctExplanation: 'When practitioners cannot move through 3-2-1 steps, it often signals significant dissociation or trauma. This material requires titration (small doses), resourcing, and possibly professional support—not force. The system is protecting itself.', relatedNodes: ['shadow-module', '3-2-1-process', 'dissociation', 'trauma', 'titration'], points: 25, },
  { id: 'ultra-shadow-18', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: '"Spiritual narcissism" at second-tier typically manifests as:', answers: [{ id: 'a', text: 'Humble service to all perspectives', isCorrect: false }, { id: 'b', text: 'Belief that higher altitude makes one ontologically special rather than more responsible', isCorrect: true }, { id: 'c', text: 'Complete shadow integration', isCorrect: false }, { id: 'd', text: 'Rejection of all hierarchy', isCorrect: false },], correctExplanation: 'Second-tier shadow includes subtle spiritual superiority—feeling "special" because of developmental altitude rather than recognizing that higher development means greater responsibility and service. This is a particularly seductive shadow for integral practitioners.', relatedNodes: ['shadow-module', 'second-tier', 'spiritual-narcissism', 'developmental-shadow'], points: 25, },
  { id: 'ultra-shadow-19', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'The final shadow that even many nondual teachers carry is:', answers: [{ id: 'a', text: 'Attachment to material possessions', isCorrect: false }, { id: 'b', text: 'Disowned personal self—the relative individual pushed away "in the name of" transcendence', isCorrect: true }, { id: 'c', text: 'Fear of emptiness', isCorrect: false }, { id: 'd', text: 'Excessive devotion to students', isCorrect: false },], correctExplanation: 'Even after genuine realization, many teachers subtly disown the relative, personal self—pushing away the body-mind "in the name of" nonduality. This creates a shadow. True One Taste embraces the relative as fully as the absolute—no aspect excluded.', relatedNodes: ['shadow-module', 'nondual', 'spiritual-shadow', 'relative-self', 'one-taste'], points: 25, },
  { id: 'ultra-shadow-20', type: 'multiple-choice', category: 'shadow', difficulty: 'ultra', question: 'Marie-Louise von Franz, Jung\'s close collaborator, emphasized that shadow work ultimately serves:', answers: [{ id: 'a', text: 'Elimination of all darkness from the psyche', isCorrect: false }, { id: 'b', text: 'Individuation—the integration of all psychic contents into a larger wholeness', isCorrect: true }, { id: 'c', text: 'Social conformity and normalization', isCorrect: false }, { id: 'd', text: 'Purely intellectual self-understanding', isCorrect: false },], correctExplanation: 'Von Franz, extending Jung, saw shadow work as essential to individuation—the lifelong process of integrating all aspects of the psyche into conscious wholeness. The goal isn\'t eliminating shadow but integrating it—becoming more whole, not more "good."', relatedNodes: ['shadow-module', 'von-franz', 'jung', 'individuation', 'wholeness'], points: 25, },

  // ==================== CORE CONCEPTS - ULTRA (20 questions) ====================
  { id: 'ultra-core-1', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The meta-principle underlying all ILP practices is best described as:', answers: [{ id: 'a', text: 'Accumulate as many practices as possible', isCorrect: false }, { id: 'b', text: 'Engage multiple life dimensions with intention; quality and consistency trump quantity', isCorrect: true }, { id: 'c', text: 'Choose one modality and master it exclusively', isCorrect: false }, { id: 'd', text: 'Practices work automatically without practitioner effort', isCorrect: false },], correctExplanation: 'ILP\'s core principle: intentional, consistent engagement across body/mind/spirit/shadow yields integrated growth far beyond any single practice. This is not "do more" but "do with presence across dimensions."', relatedNodes: ['core-concepts', 'integrated-practice', 'consistency'], points: 25, },
  { id: 'ultra-core-2', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'ILP\'s relationship to traditional spiritual paths is:', answers: [{ id: 'a', text: 'To replace them entirely with new techniques', isCorrect: false }, { id: 'b', text: 'To honor depth practices while adding breadth—including body, psychology, and shadow', isCorrect: true }, { id: 'c', text: 'To reject all traditional approaches', isCorrect: false }, { id: 'd', text: 'To make spiritual practice purely individual without cultural roots', isCorrect: false },], correctExplanation: 'ILP doesn\'t replace traditional paths but contextualizes them. A Buddhist meditation practice is deepened by body work, psychology, and shadow integration. ILP is integral—including AND transcending, not excluding.', relatedNodes: ['core-concepts', 'tradition', 'integration'], points: 25, },
  { id: 'ultra-core-3', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The distinction between "waking up," "growing up," and "cleaning up" in ILP serves:', answers: [{ id: 'a', text: 'To confuse practitioners with unnecessary terminology', isCorrect: false }, { id: 'b', text: 'To clarify that spiritual realization, developmental growth, and psychological integration are distinct dimensions needing distinct work', isCorrect: true }, { id: 'c', text: 'To rank which dimension is most important', isCorrect: false }, { id: 'd', text: 'To suggest one dimension excludes the others', isCorrect: false },], correctExplanation: 'These three vectors—waking up (states/consciousness), growing up (stages/development), and cleaning up (shadow/psychology)—are orthogonal. You can be highly awakened yet underdeveloped or shadowed. Each requires attention.', relatedNodes: ['core-concepts', 'waking-up', 'growing-up', 'cleaning-up'], points: 25, },
  { id: 'ultra-core-4', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'ILP\'s emphasis on "practice" over "belief" reflects:', answers: [{ id: 'a', text: 'Rejection of all philosophical frameworks', isCorrect: false }, { id: 'b', text: 'Transformation through direct experience, not just intellectual assent', isCorrect: true }, { id: 'c', text: 'Disdain for contemplative traditions', isCorrect: false }, { id: 'd', text: 'That beliefs are entirely unimportant', isCorrect: false },], correctExplanation: 'ILP prioritizes embodied practice because understanding "I am one with all" intellectually differs vastly from realizing it through meditation, body awareness, and shadow work. Practice is not anti-intellectual but trans-intellectual.', relatedNodes: ['core-concepts', 'practice', 'direct-experience', 'transformation'], points: 25, },
  { id: 'ultra-core-5', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The role of "temporary experiences" (states) in ILP is to:', answers: [{ id: 'a', text: 'Become addictively attached to peak experiences', isCorrect: false }, { id: 'b', text: 'Serve as "flashlights" illuminating stable capacities and growth edges', isCorrect: true }, { id: 'c', text: 'Replace developmental growth', isCorrect: false }, { id: 'd', text: 'Validate enlightenment claims', isCorrect: false },], correctExplanation: 'Meditation, breathwork, or ceremony can produce temporary expansions. ILP uses these experiences as pointers: "Notice what that expanded awareness showed you. Now can you stably access that capacity?" States point to possible stages.', relatedNodes: ['core-concepts', 'states', 'stages', 'state-training'], points: 25, },
  { id: 'ultra-core-6', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'ILP\'s stance toward "enlightenment" or "spiritual attainment" is best characterized as:', answers: [{ id: 'a', text: 'Enlightenment is a permanent, final achievement available to special beings', isCorrect: false }, { id: 'b', text: 'Development is ongoing; deepening into already-present awareness with decreasing distortion', isCorrect: true }, { id: 'c', text: 'Enlightenment is impossible, so don\'t bother pursuing', isCorrect: false }, { id: 'd', text: 'All claims of realization should be skeptically rejected', isCorrect: false },], correctExplanation: 'ILP transcends both "achievementism" and cynicism. Realization happens—but as increasingly clear recognition of what already is, not as attaining something foreign. The metaphor shifts from "climbing a mountain" to "removing clouds from the sun."', relatedNodes: ['core-concepts', 'enlightenment', 'realization', 'already-present'], points: 25, },
  { id: 'ultra-core-7', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The practical implication of ILP\'s "both/and" approach (e.g., shadow AND spirit) is:', answers: [{ id: 'a', text: 'Do shadow work OR spiritual practice—never integrate', isCorrect: false }, { id: 'b', text: 'Authentic development requires working all dimensions simultaneously, not sequentially', isCorrect: true }, { id: 'c', text: 'Both/and thinking is paradoxical and impractical', isCorrect: false }, { id: 'd', text: 'One dimension can fully substitute for another', isCorrect: false },], correctExplanation: 'ILP\'s both/and isn\'t mere philosophy—it\'s practical. You can\'t "meditate away" unresolved psychological material. You can\'t "psychologically heal" without accessing deeper dimensions. True integration works multiple vectors simultaneously.', relatedNodes: ['core-concepts', 'both-and', 'integration', 'simultaneous-practice'], points: 25, },
  { id: 'ultra-core-8', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The reason ILP includes "body" as a primary dimension rather than secondary is:', answers: [{ id: 'a', text: 'Physical health is more important than consciousness', isCorrect: false }, { id: 'b', text: 'Consciousness is embodied; psychological and spiritual development are somatically enacted', isCorrect: true }, { id: 'c', text: 'Body practices can substitute for meditation', isCorrect: false }, { id: 'd', text: 'The body is an illusion to transcend', isCorrect: false },], correctExplanation: 'Modern neuroscience, Somatic Experiencing, and contemplative traditions confirm: development is inherently embodied. Trauma lives in the body; wisdom integrates body knowing. ILP therefore elevates body practice from accessory to central.', relatedNodes: ['body-module', 'core-concepts', 'embodied', 'somatic'], points: 25, },
  { id: 'ultra-core-9', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'When ILP practitioners encounter the phrase "no effort," it most accurately means:', answers: [{ id: 'a', text: 'Stop practicing and expect automatic enlightenment', isCorrect: false }, { id: 'b', text: 'Practice with full engagement but without grasping/striving; relaxed attention', isCorrect: true }, { id: 'c', text: 'All spiritual paths are equally pointless', isCorrect: false }, { id: 'd', text: 'Enlightenment comes only to lazy people', isCorrect: false },], correctExplanation: 'Paradox alert: ILP practices require disciplined engagement to develop genuine "effortlessness." This is Taoist wu-wei—not passivity but action flowing naturally without self-consciousness. You can\'t access this without practicing.', relatedNodes: ['core-concepts', 'effortlessness', 'wu-wei', 'relaxed-attention'], points: 25, },
  { id: 'ultra-core-10', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The integration of "individual" and "collective" dimensions in ILP means:', answers: [{ id: 'a', text: 'Personal practice is selfish and should be abandoned', isCorrect: false }, { id: 'b', text: 'Personal development and social engagement are mutually supportive, not mutually exclusive', isCorrect: true }, { id: 'c', text: 'Collective welfare means personal practices don\'t matter', isCorrect: false }, { id: 'd', text: 'ILP is purely individual with no social implications', isCorrect: false },], correctExplanation: 'ILP resists the old division: interior work (navel-gazing) vs. exterior activism. Authentic practice transforms how you show up in the world. Authentic activism is grounded in wisdom, compassion, and shadow awareness—not reactive rage.', relatedNodes: ['core-concepts', 'individual', 'collective', 'authentic-action'], points: 25, },
  { id: 'ultra-core-11', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'ILP practitioners who feel "stuck" or "not making progress" are often encountering:', answers: [{ id: 'a', text: 'Proof that ILP doesn\'t work', isCorrect: false }, { id: 'b', text: 'A developmental edge—the edge itself is the work, not something to skip over', isCorrect: true }, { id: 'c', text: 'A sign they should abandon practice entirely', isCorrect: false }, { id: 'd', text: 'Confirmation they\'re destined not to evolve', isCorrect: false },], correctExplanation: 'In ILP, "stuckness" is often the practice. Sitting with difficulty without bypassing, trying to understand it, bringing awareness to it—that\'s where transformation happens. The plateau IS the work.', relatedNodes: ['core-concepts', 'development', 'edges', 'plateaus'], points: 25, },
  { id: 'ultra-core-12', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The relationship between ILP and psychological diagnosis/treatment is:', answers: [{ id: 'a', text: 'ILP replaces psychotherapy and psychiatric medication', isCorrect: false }, { id: 'b', text: 'ILP complements professional mental health care; serious pathology requires professional support', isCorrect: true }, { id: 'c', text: 'Psychological conditions invalidate spiritual practice', isCorrect: false }, { id: 'd', text: 'All psychological issues can be resolved through meditation alone', isCorrect: false },], correctExplanation: 'ILP is not medicine. Depression, psychosis, trauma, and other conditions require professional assessment and treatment. ILP practices support mental health but cannot substitute for qualified care.', relatedNodes: ['core-concepts', 'mental-health', 'professional-care'], points: 25, },
  { id: 'ultra-core-13', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The principle "start where you are, use what you have, do what you can" in ILP reflects:', answers: [{ id: 'a', text: 'Lower standards and less efficacy than traditional practice', isCorrect: false }, { id: 'b', text: 'Radical accessibility—meeting people where they are, enabling genuine consistency', isCorrect: true }, { id: 'c', text: 'That harder practices are inferior', isCorrect: false }, { id: 'd', text: 'That intentionality doesn\'t matter', isCorrect: false },], correctExplanation: 'One minute of meditation practiced consistently beats one week of perfect practice never done. ILP democratizes development by honoring small, regular engagement. This principle removes the excuse of "not enough time" while maintaining rigor.', relatedNodes: ['core-concepts', 'accessibility', 'consistency', '1-minute-module'], points: 25, },
  { id: 'ultra-core-14', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'When ILP emphasizes "authenticity," it means:', answers: [{ id: 'a', text: 'Expressing every impulse without restraint', isCorrect: false }, { id: 'b', text: 'Acting from genuine understanding and integrated values, responsibly', isCorrect: true }, { id: 'c', text: 'Performing "authenticity" to impress others', isCorrect: false }, { id: 'd', text: 'Authenticity is impossible and shouldn\'t be attempted', isCorrect: false },], correctExplanation: 'Authentic action flows from integrated consciousness—awareness of genuine values, responsibility to others, shadow understanding. This is not reactive impulsivity masked as "being real" but conscious expression.', relatedNodes: ['core-concepts', 'authenticity', 'authentic-action', 'integration'], points: 25, },
  { id: 'ultra-core-15', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The reason ILP emphasizes multiple lineages (Buddhist, Hindu, Christian, etc.) rather than one "best" path is:', answers: [{ id: 'a', text: 'All paths are identical—choosing one is arbitrary', isCorrect: false }, { id: 'b', text: 'Different traditions access different depths and dimensions; integral practice includes multiple windows', isCorrect: true }, { id: 'c', text: 'Traditional paths are equally shallow', isCorrect: false }, { id: 'd', text: 'Mixing paths dilutes everything', isCorrect: false },], correctExplanation: 'Theravada emphasizes ethical foundation, Zen cuts through mind, Sufi emphasizes heart, Integral Yoga emphasizes transformation. ILP respects lineage depth while suggesting integral practitioners can learn from multiple windows on reality.', relatedNodes: ['core-concepts', 'lineages', 'traditions', 'integral-approach'], points: 25, },
  { id: 'ultra-core-16', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'ILP\'s emphasis on "stages" of development (like Kegan, spiral dynamics) implies:', answers: [{ id: 'a', text: 'Higher stages are inherently better or more worthy', isCorrect: false }, { id: 'b', text: 'Understanding your current stage reduces judgment and enables appropriate practice', isCorrect: true }, { id: 'c', text: 'All people are at the same stage', isCorrect: false }, { id: 'd', text: 'Stage development determines everything about a person', isCorrect: false },], correctExplanation: 'Stages are descriptive, not prescriptive. Understanding that someone is at Orange (achievement/individual) rather than Green (pluralistic/egalitarian) enables compassion and appropriate engagement—not judgment.', relatedNodes: ['core-concepts', 'stages', 'development', 'spiral-dynamics'], points: 25, },
  { id: 'ultra-core-17', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The deepest contribution of ILP as an approach is:', answers: [{ id: 'a', text: 'Teaching techniques more powerful than traditional practices', isCorrect: false }, { id: 'b', text: 'A framework showing how all human dimensions can develop together', isCorrect: true }, { id: 'c', text: 'Providing an escape from ordinary consciousness', isCorrect: false }, { id: 'd', text: 'Proving that enlightenment is impossible', isCorrect: false },], correctExplanation: 'ILP\'s power is as an integrative map—showing how consciousness (states), development (stages), body, psychology, and shadow form a whole. This prevents lopsided development and enables authentic transformation.', relatedNodes: ['core-concepts', 'integration', 'wholeness', 'map'], points: 25, },
  { id: 'ultra-core-18', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'When practitioners from different traditions encounter ILP principles, the result is typically:', answers: [{ id: 'a', text: 'Confusion and loss of their original practice', isCorrect: false }, { id: 'b', text: 'Deepening of their tradition through additional dimensions', isCorrect: true }, { id: 'c', text: 'Realization that all traditions are worthless', isCorrect: false }, { id: 'd', text: 'Abandonment of tradition for pure eclecticism', isCorrect: false },], correctExplanation: 'A dedicated Buddhist who adds body work, psychology, and shadow practice typically goes deeper into Buddhism, not away from it. ILP contextualizes traditions rather than competing with them.', relatedNodes: ['core-concepts', 'tradition', 'integration', 'deepening'], points: 25, },
  { id: 'ultra-core-19', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'The phrase "all the way up and all the way down" in ILP integral practice refers to:', answers: [{ id: 'a', text: 'Physical elevation and descent', isCorrect: false }, { id: 'b', text: 'Developing the highest consciousness AND addressing the deepest psychological roots', isCorrect: true }, { id: 'c', text: 'Reincarnation theory', isCorrect: false }, { id: 'd', text: 'Purely poetic language without practical meaning', isCorrect: false },], correctExplanation: 'All the way up = accessing highest states/stages of consciousness. All the way down = fully engaging shadow, body, and earliest developmental wounds. True wholeness addresses both—transcendence AND inclusion.', relatedNodes: ['core-concepts', 'wholeness', 'transcendence', 'inclusion'], points: 25, },
  { id: 'ultra-core-20', type: 'multiple-choice', category: 'core', difficulty: 'ultra', question: 'If someone were to summarize ILP in one sentence, the most accurate would be:', answers: [{ id: 'a', text: 'ILP is meditation practice plus ethical living', isCorrect: false }, { id: 'b', text: 'ILP is intentional engagement across all human dimensions—body, mind, spirit, and shadow—for integrated awakening and authentic action', isCorrect: true }, { id: 'c', text: 'ILP is a rejection of all traditional spiritual paths', isCorrect: false }, { id: 'd', text: 'ILP is self-help psychology without spiritual depth', isCorrect: false },], correctExplanation: 'This definition captures ILP\'s essence: integrated (all dimensions), intentional (deliberate engagement), and aimed at both awakening (consciousness) and authentic action (effectiveness in the world).', relatedNodes: ['core-concepts', 'ilp-definition', 'integration', 'wholeness'], points: 25, },

  // ==================== INTEGRAL THEORY - ULTRA (20 questions) ====================
  { id: 'ultra-integral-theory-1', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Ken Wilber\'s "four quadrants" model serves primarily to:', answers: [{ id: 'a', text: 'Prove that only one perspective is valid', isCorrect: false }, { id: 'b', text: 'Show that complete understanding requires both interior/exterior and individual/collective perspectives', isCorrect: true }, { id: 'c', text: 'Replace all traditional knowledge systems', isCorrect: false }, { id: 'd', text: 'Simplify reality by eliminating nuance', isCorrect: false },], correctExplanation: 'The four quadrants—intentional (upper-left), behavioral (upper-right), cultural (lower-left), social (lower-right)—prevent reductionism. A complete event has all four quadrant aspects; missing any quadrant creates blind spots.', relatedNodes: ['integral-theory', 'four-quadrants', 'perspective', 'completeness'], points: 25, },
  { id: 'ultra-integral-theory-2', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The significance of Wilber\'s "three strands" (waking up, growing up, cleaning up) in Integral thought is:', answers: [{ id: 'a', text: 'That one strand is more important than others', isCorrect: false }, { id: 'b', text: 'That human development cannot be reduced to any single dimension', isCorrect: true }, { id: 'c', text: 'That combining them creates confusion', isCorrect: false }, { id: 'd', text: 'That traditional spirituality already addresses all three equally', isCorrect: false },], correctExplanation: 'Each strand (consciousness realization, developmental stages, psychological integration) has independent logic. Trying to reduce enlightenment to stage, or stage to shadow, creates distortions. All three are necessary.', relatedNodes: ['integral-theory', 'three-strands', 'development', 'dimensions'], points: 25, },
  { id: 'ultra-integral-theory-3', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The "AQAL" framework (All Quadrants, All Levels, All Lines, All States, All Types) primarily addresses:', answers: [{ id: 'a', text: 'Overcomplicating simple ideas', isCorrect: false }, { id: 'b', text: 'Ensuring integral approaches don\'t accidentally exclude any major dimension of human experience', isCorrect: true }, { id: 'c', text: 'Making spiritual practice impossible by over-specifying', isCorrect: false }, { id: 'd', text: 'That one framework can explain everything perfectly', isCorrect: false },], correctExplanation: 'AQAL is a checklist preventing blind spots: Am I considering inner and outer? Individuals and collectives? All developmental levels? Multiple lines? Peak states AND baseline traits? Different personality types? If "no" to any, the view is partial.', relatedNodes: ['integral-theory', 'aqal', 'framework', 'completeness'], points: 25, },
  { id: 'ultra-integral-theory-4', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Wilber\'s "evolutionary framework" suggests that:', answers: [{ id: 'a', text: 'Natural selection alone explains all human development', isCorrect: false }, { id: 'b', text: 'Matter → life → mind → soul → spirit represents evolutionary emergence, with each level transcending yet including lower ones', isCorrect: true }, { id: 'c', text: 'Evolution stopped with human cognitive ability', isCorrect: false }, { id: 'd', text: 'Spiritual development is separate from natural evolution', isCorrect: false },], correctExplanation: 'Integral evolutionary theory sees continuous emergence: holons (whole/parts) at each level include lower capacities while adding new ones. Humans aren\'t evolution\'s end but likely intermediate between current and future stages.', relatedNodes: ['integral-theory', 'evolution', 'emergence', 'holons'], points: 25, },
  { id: 'ultra-integral-theory-5', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The distinction between "horizontal" and "vertical" development in integral psychology means:', answers: [{ id: 'a', text: 'One type of development is better than the other', isCorrect: false }, { id: 'b', text: 'Horizontal = expanding within a stage; vertical = moving to new stages', isCorrect: true }, { id: 'c', text: 'They cannot coexist in the same person', isCorrect: false }, { id: 'd', text: 'Only vertical development matters', isCorrect: false },], correctExplanation: 'A person at Green stage can expand horizontally (become more skilled at egalitarian perspective-taking) or move vertically (transcend Green for Teal). Both matter. Vertical jumps without horizontal development create immature higher stages.', relatedNodes: ['integral-theory', 'horizontal', 'vertical', 'development'], points: 25, },
  { id: 'ultra-integral-theory-6', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Wilber\'s concept of "transcend and include" means:', answers: [{ id: 'a', text: 'Higher stages completely replace lower ones', isCorrect: false }, { id: 'b', text: 'Each new stage goes beyond previous limitations while preserving lower capacities', isCorrect: true }, { id: 'c', text: 'All stages are simultaneously present with equal emphasis', isCorrect: false }, { id: 'd', text: 'Previous capacities must be rejected when developing', isCorrect: false },], correctExplanation: 'Higher stages don\'t negate instinct (Red), power (Orange), or egalitarianism (Green)—they contextualize these within larger perspectives. You keep the capacity while transcending the limitation.', relatedNodes: ['integral-theory', 'transcend-include', 'stages', 'development'], points: 25, },
  { id: 'ultra-integral-theory-7', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The "Wilber-Combs Lattice," showing states and stages as independent dimensions, implies:', answers: [{ id: 'a', text: 'Higher stages automatically produce higher states', isCorrect: false }, { id: 'b', text: 'A Violet stage adult can have either gross/subtle/causal states; a Red adult can also access these states but interpret them differently', isCorrect: true }, { id: 'c', text: 'States and stages are identical', isCorrect: false }, { id: 'd', text: 'Only enlightened people can access altered states', isCorrect: false },], correctExplanation: 'The lattice shows independence: anyone can access gross/subtle/causal/nondual states, but interpretation differs by structure. Red might interpret mystical experience as spirit possession; Teal contextualizes it within a larger map. Same state, different meanings.', relatedNodes: ['integral-theory', 'wilber-combs', 'states', 'stages'], points: 25, },
  { id: 'ultra-integral-theory-8', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The importance of "perspective-taking capacity" in integral stages suggests:', answers: [{ id: 'a', text: 'All perspectives are equally valid', isCorrect: false }, { id: 'b', text: 'Higher stages can hold and evaluate multiple perspectives more comprehensively', isCorrect: true }, { id: 'c', text: 'Perspectives don\'t affect how you understand things', isCorrect: false }, { id: 'd', text: 'Only one perspective reveals truth', isCorrect: false },], correctExplanation: 'Each stage can take certain perspectives: archaic (tribal), magic (spiritual), myth (order-based), rational (individual), pluralistic (all equal), integral (contextual). Higher capacity doesn\'t mean "all valid" but "can comprehend more accurately."', relatedNodes: ['integral-theory', 'perspective-taking', 'stages', 'understanding'], points: 25, },
  { id: 'ultra-integral-theory-9', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'In integral thought, "authenticity" means:', answers: [{ id: 'a', text: 'Expressing every feeling without filters', isCorrect: false }, { id: 'b', text: 'Acting from genuine development stage understanding with awareness of shadow', isCorrect: true }, { id: 'c', text: 'Conforming to what others expect', isCorrect: false }, { id: 'd', text: 'Authenticity is an illusion; all expression is performance', isCorrect: false },], correctExplanation: 'In integral terms, authentic action comes from your actual development stage (not pretending to be more evolved) combined with shadow awareness (not denying disowned material). This is both honest AND responsible.', relatedNodes: ['integral-theory', 'authenticity', 'development', 'shadow'], points: 25, },
  { id: 'ultra-integral-theory-10', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Wilber\'s later emphasis on "non-dual integral realization" suggests:', answers: [{ id: 'a', text: 'Traditional stages and states become irrelevant at enlightenment', isCorrect: false }, { id: 'b', text: 'Even nondual realization includes/transcends all previous stages and states', isCorrect: true }, { id: 'c', text: 'Nondual is superior to development and psychology', isCorrect: false }, { id: 'd', text: 'Non-dual means rejecting the relative world', isCorrect: false },], correctExplanation: 'Non-dual integral realization doesn\'t leave stages and states behind—it contextualizes them within non-dual awareness. The whole of reality appears in nondual clarity, not as transcended negation but as transparent manifestation.', relatedNodes: ['integral-theory', 'nondual', 'realization', 'transcend-include'], points: 25, },
  { id: 'ultra-integral-theory-11', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The "violence of reduction" in integral criticism refers to:', answers: [{ id: 'a', text: 'Criticizing perspectives you disagree with', isCorrect: false }, { id: 'b', text: 'Explaining complex phenomena by one variable alone, ignoring other dimensions', isCorrect: true }, { id: 'c', text: 'Any attempt to simplify for clarity', isCorrect: false }, { id: 'd', text: 'Violence is unrelated to epistemology', isCorrect: false },], correctExplanation: 'Reducing human suffering to only neurochemistry, only trauma, only poverty, or only spiritual lack commits violence by excluding truth. Integral approaches avoid this by honoring multiple dimensions simultaneously.', relatedNodes: ['integral-theory', 'reduction', 'violence', 'holism'], points: 25, },
  { id: 'ultra-integral-theory-12', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Spiral Dynamics colors (Purple, Red, Blue, Orange, Green, Teal, etc.) in integral thought represent:', answers: [{ id: 'a', text: 'Arbitrary categories with no psychological basis', isCorrect: false }, { id: 'b', text: 'Value systems and worldviews that emerge as consciousness develops', isCorrect: true }, { id: 'c', text: 'Only cultural variations with no developmental relationship', isCorrect: false }, { id: 'd', text: 'That each color is better than others', isCorrect: false },], correctExplanation: 'Colors map developmental stages where each brings new capacities and values: Purple (tribal), Red (individual power), Blue (order/God), Orange (achievement), Green (equality), Teal (integral). They emerge sequentially in both individuals and cultures.', relatedNodes: ['integral-theory', 'spiral-dynamics', 'value-systems', 'development'], points: 25, },
  { id: 'ultra-integral-theory-13', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The integral maxim "no one is smart enough to be wrong all the time" implies:', answers: [{ id: 'a', text: 'Every perspective contains some truth worth honoring', isCorrect: true }, { id: 'b', text: 'All perspectives are equally valid', isCorrect: false }, { id: 'c', text: 'Criticism should never be offered', isCorrect: false }, { id: 'd', text: 'Intelligent people never make mistakes', isCorrect: false },], correctExplanation: 'This principle says: every view has grasped some partial truth. Integral practice: find what\'s true in it, integrate that truth, critique the partial claims of totality. This enables respectful dialogue while maintaining discernment.', relatedNodes: ['integral-theory', 'partial-truth', 'integration', 'dialogue'], points: 25, },
  { id: 'ultra-integral-theory-14', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The relationship between integral theory and premodern traditions is that integral:', answers: [{ id: 'a', text: 'Proves premodern traditions were entirely wrong', isCorrect: false }, { id: 'b', text: 'Contextualizes their insights within a larger developmental map', isCorrect: true }, { id: 'c', text: 'Shows premodern wisdom is superior to modern science', isCorrect: false }, { id: 'd', text: 'Rejects all traditional knowledge entirely', isCorrect: false },], correctExplanation: 'Integral studies premodern medicine, psychology, and spirituality not as "primitive" or "superior" but as genuine insights from different developmental stages. Their truths are preserved in integral contexts.', relatedNodes: ['integral-theory', 'tradition', 'premodern', 'development'], points: 25, },
  { id: 'ultra-integral-theory-15', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'In integral philosophy, "holons" (whole/parts) are important because:', answers: [{ id: 'a', text: 'Everything is completely individual with no relationships', isCorrect: false }, { id: 'b', text: 'Every level of reality is simultaneously whole and part, revealing integrated structure', isCorrect: true }, { id: 'c', text: 'Only wholes matter; parts are irrelevant', isCorrect: false }, { id: 'd', text: 'Reductionism to parts is the complete truth', isCorrect: false },], correctExplanation: 'Holons show: your cells are wholes (with parts) and parts (of you); you\'re whole (with parts) and part (of society); society is whole and part (of humanity). This reveals why both reductionism and holism alone are incomplete.', relatedNodes: ['integral-theory', 'holons', 'whole-parts', 'systems'], points: 25, },
  { id: 'ultra-integral-theory-16', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The "good news/bad news" of integral theory is:', answers: [{ id: 'a', text: 'Good: simplicity; Bad: complexity; they\'re unrelated', isCorrect: false }, { id: 'b', text: 'Good: human potential and development are real; Bad: we must engage multiple dimensions to access it', isCorrect: true }, { id: 'c', text: 'Good: enlightenment is easy; Bad: nobody achieves it', isCorrect: false }, { id: 'd', text: 'Integral theory has no practical implications', isCorrect: false },], correctExplanation: 'The good news: development is possible, and we understand how it works. The bad news: it requires work across multiple dimensions—no shortcuts or single solutions. But the hard work produces genuine transformation.', relatedNodes: ['integral-theory', 'development', 'practice', 'reality'], points: 25, },
  { id: 'ultra-integral-theory-17', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'When integral practitioners acknowledge "we\'re all a bit enlightened and a bit insane," they mean:', answers: [{ id: 'a', text: 'Enlightenment and insanity are the same thing', isCorrect: false }, { id: 'b', text: 'Everyone has access to higher capacities AND shadow/developmental limitations', isCorrect: true }, { id: 'c', text: 'Some people are purely enlightened, others purely mad', isCorrect: false }, { id: 'd', text: 'The mind cannot be trusted at all', isCorrect: false },], correctExplanation: 'This acknowledges human paradox: you can have genuine wisdom (enlightened capacity) AND blind spots (insanity/shadow). No one has "fully arrived." Humility about shadow is essential, even for realized beings.', relatedNodes: ['integral-theory', 'paradox', 'shadow', 'realization'], points: 25, },
  { id: 'ultra-integral-theory-18', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'Integral epistemology\'s "Three Eyes of Knowing" (sensorimotor, conceptual-rational, contemplative-intuitive) means:', answers: [{ id: 'a', text: 'Only one way of knowing is valid', isCorrect: false }, { id: 'b', text: 'Complete truth requires perspectives from sensory, rational, AND intuitive domains', isCorrect: true }, { id: 'c', text: 'These three ways contradict each other', isCorrect: false }, { id: 'd', text: 'Intuition should override empirical evidence', isCorrect: false },], correctExplanation: 'The three eyes represent different valid ways of knowing: empirical (sensory), rational (conceptual), and contemplative (intuitive). Complete understanding uses all three—science + logic + meditation—not just one.', relatedNodes: ['integral-theory', 'epistemology', 'three-eyes', 'knowing'], points: 25, },
  { id: 'ultra-integral-theory-19', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The assertion that "no stage is bad; each is necessary" in integral development means:', answers: [{ id: 'a', text: 'All behaviors are acceptable regardless of stage', isCorrect: false }, { id: 'b', text: 'Each stage was necessary to humanity\'s evolution and remains valid in appropriate contexts', isCorrect: true }, { id: 'c', text: 'Higher stages don\'t exist or don\'t matter', isCorrect: false }, { id: 'd', text: 'Individual people should remain forever at their birth stage', isCorrect: false },], correctExplanation: 'Purple tribal consciousness enabled human bonding; Red enabled individual agency; Blue enabled order; Orange enabled science. Each stage solved problems previous stages couldn\'t solve. None are inherently evil—but limiting when transcended.', relatedNodes: ['integral-theory', 'stages', 'development', 'necessity'], points: 25, },
  { id: 'ultra-integral-theory-20', type: 'multiple-choice', category: 'integral-theory', difficulty: 'ultra', question: 'The ultimate goal of integral theory and practice is:', answers: [{ id: 'a', text: 'To prove that one perspective is the only valid one', isCorrect: false }, { id: 'b', text: 'To awaken to one\'s deepest nature while developing maximally and integrating shadow through authentic action', isCorrect: true }, { id: 'c', text: 'To create a perfect world without conflict', isCorrect: false }, { id: 'd', text: 'To achieve a static final state and remain there forever', isCorrect: false },], correctExplanation: 'Integral vision: awakening (consciousness), development (capacity), and integration (wholeness) together—enabling authentic action in the world. This is ongoing, not a final achievement, but a deepening spiral.', relatedNodes: ['integral-theory', 'goal', 'awakening', 'development', 'integration'], points: 25, },
];

// Quiz sessions storage key
export const QUIZ_SESSIONS_STORAGE_KEY = 'ilpGraphQuizSessions';
export const QUIZ_RESULTS_STORAGE_KEY = 'ilpGraphQuizResults';

// Utility function to get questions by category
export function getQuestionsByCategory(
  category: 'core' | 'body' | 'mind' | 'spirit' | 'shadow' | 'integral-theory' | 'all'
): QuizQuestion[] {
  if (category === 'all') {
    return ilpGraphQuizzes;
  }
  return ilpGraphQuizzes.filter((q) => q.category === category);
}

// Utility function to get questions by difficulty
export function getQuestionsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'ultra'
): QuizQuestion[] {
  return ilpGraphQuizzes.filter((q) => q.difficulty === difficulty);
}

// Utility function to shuffle questions
export function shuffleQuestions(
  questions: QuizQuestion[],
  count?: number
): QuizQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return count ? shuffled.slice(0, count) : shuffled;
}

// Utility function to shuffle answers within a question
export function shuffleAnswers(question: QuizQuestion): QuizQuestion {
  const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5);
  return { ...question, answers: shuffledAnswers };
}

// Utility function to get questions for a quiz session
export function getQuizQuestions(
  category: 'core' | 'body' | 'mind' | 'spirit' | 'shadow' | 'integral-theory' | 'all',
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'ultra',
  count: number = 15
): QuizQuestion[] {
  let questions = getQuestionsByCategory(category);

  // Strict difficulty matching - each level gets ONLY its own questions
  // This ensures "advanced" mode only shows advanced questions, not easy ones
  if (difficulty !== 'ultra') {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }
  // 'ultra' mode = all difficulties mixed (the real challenge mode with full variety)

  const selectedQuestions = shuffleQuestions(questions, Math.min(count, questions.length));

  // Shuffle answers for each question to randomize correct answer position
  return selectedQuestions.map((q) => shuffleAnswers(q));
}

// Utility function to get all concepts from questions
export function getAllConcepts(category?: ILPGraphCategory | 'all'): string[] {
  const questions = category && category !== 'all'
    ? getQuestionsByCategory(category as any)
    : ilpGraphQuizzes;

  const concepts = new Set<string>();
  questions.forEach(q => {
    if (q.relatedNodes) {
      q.relatedNodes.forEach(c => {
        // Exclude generic terms and category names
        if (c !== 'ilp' && c !== q.category) {
          concepts.add(c);
        }
      });
    }
  });

  return Array.from(concepts).sort();
}

// Get category stats
export function getCategoryStats() {
  return {
    core: getQuestionsByCategory('core').length,
    body: getQuestionsByCategory('body').length,
    mind: getQuestionsByCategory('mind').length,
    spirit: getQuestionsByCategory('spirit').length,
    shadow: getQuestionsByCategory('shadow').length,
    'integral-theory': getQuestionsByCategory('integral-theory').length,
    total: ilpGraphQuizzes.length,
  };
}
// Get questions based on weakest concepts
export function getWeakSpotQuestions(progress: ConceptProgress, count: number = 10): QuizQuestion[] {
  // 1. Identify weakest concepts
  const conceptEntries = Object.values(progress.concepts);
  if (conceptEntries.length === 0) {
    // Fallback if no progress data exists yet
    return getQuizQuestions('core', 'beginner', count);
  }

  // Sort by mastery score (ascending), then by exposures (ascending)
  const sortedConcepts = [...conceptEntries].sort((a, b) => {
    if (a.masteryScore !== b.masteryScore) return a.masteryScore - b.masteryScore;
    return a.exposures - b.exposures;
  });

  // Get top 8 weakest concept IDs for a wider pool
  const weakConceptIds = new Set(sortedConcepts.slice(0, 8).map(c => c.conceptId));

  // 2. Filter questions that target these concepts
  const targetQuestions = ilpGraphQuizzes.filter(q =>
    q.relatedNodes && q.relatedNodes.some(node => weakConceptIds.has(node))
  );

  // 3. If pool is too small, add some general core questions
  let finalPool = [...targetQuestions];
  if (finalPool.length < count) {
    const coreQuestions = ilpGraphQuizzes.filter(q => q.category === 'core' && !finalPool.find(fq => fq.id === q.id));
    finalPool = [...finalPool, ...coreQuestions.slice(0, count - finalPool.length)];
  }

  // 4. Shuffle and return
  const selected = shuffleQuestions(finalPool, Math.min(count, finalPool.length));
  return selected.map(q => shuffleAnswers(q));
}
