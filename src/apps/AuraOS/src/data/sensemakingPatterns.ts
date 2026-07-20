/**
 * Sensemaking Patterns - Common stuck-points and recommended frameworks
 * Used in the Pattern Library section of Sensemaking Lab
 */

export interface SensemakingPattern {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  recognitionCues: string[];
  exampleScenarios: {
    situation: string;
    whatItLooksLike: string;
  }[];
  recommendedFrameworks: {
    frameworkId: string;
    frameworkName: string;
    why: string;
    successRate: number;
  }[];
  relatedPatterns: string[];
  complexity: 'common' | 'intermediate' | 'advanced';
}

export const sensemakingPatterns: SensemakingPattern[] = [
  {
    id: 'binary-thinking',
    name: 'Stuck in Binary Thinking',
    description: 'You see only two options (stay/leave, yes/no) when more exist.',
    icon: 'PolarityScale',
    color: '#3b82f6',
    colorBg: 'rgba(59, 130, 246, 0.1)',
    colorBorder: 'rgba(59, 130, 246, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'Using "either/or" language frequently',
      'Feeling torn between two extremes',
      'Others suggest options you hadn\'t considered',
    ],
    exampleScenarios: [
      {
        situation: 'Career decision',
        whatItLooksLike: '"I either stay in this job I hate or quit and risk everything."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Ideation generates multiple creative alternatives',
        successRate: 89,
      },
      {
        frameworkId: 'cynefin',
        frameworkName: 'Cynefin Framework',
        why: 'Helps identify if you\'re treating complex as simple',
        successRate: 85,
      },
    ],
    relatedPatterns: ['overwhelmed-by-complexity', 'cant-see-blind-spots'],
  },
  {
    id: 'cant-see-blind-spots',
    name: 'Can\'t See Blind Spots',
    description: 'You\'re unaware of critical perspectives invisible to you but obvious to others.',
    icon: 'ThirdEye',
    color: '#a855f7',
    colorBg: 'rgba(168, 85, 247, 0.1)',
    colorBorder: 'rgba(168, 85, 247, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'Surprised by feedback that seems obvious in hindsight',
      'Others consistently see things you don\'t',
    ],
    exampleScenarios: [
      {
        situation: 'Leadership',
        whatItLooksLike: '"My team says I micromanage, but I\'m just being thorough."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'johari',
        frameworkName: 'Johari Window',
        why: 'Specifically designed to surface blind spots',
        successRate: 92,
      },
    ],
    relatedPatterns: ['binary-thinking', 'inner-conflict'],
  },
  {
    id: 'inner-conflict',
    name: 'Inner Conflict / Self-Sabotage',
    description: 'Different parts of you want different things, creating paralysis.',
    icon: 'UmbraFragment',
    color: '#ec4899',
    colorBg: 'rgba(236, 72, 153, 0.1)',
    colorBorder: 'rgba(236, 72, 153, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'Sabotaging your own goals',
      'Contradictory desires pulling you in different directions',
    ],
    exampleScenarios: [
      {
        situation: 'Career ambition',
        whatItLooksLike: '"I want to be CEO, but I keep missing deadlines."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Reveals gaps between what you say and do',
        successRate: 88,
      },
    ],
    relatedPatterns: ['triggered-by-others', 'cant-see-blind-spots'],
  },
  {
    id: 'overwhelmed-by-complexity',
    name: 'Overwhelmed by Complexity',
    description: 'Too many variables, stakeholders, or moving parts — you can\'t find the thread.',
    icon: 'NetworkNode',
    color: '#f59e0b',
    colorBg: 'rgba(245, 158, 11, 0.1)',
    colorBorder: 'rgba(245, 158, 11, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'Every time you solve one thing, three new problems appear',
      'You don\'t know where to start so you don\'t start',
      'Lists, diagrams, and plans feel more overwhelming than helpful',
      'You\'re mentally exhausted before doing anything',
    ],
    exampleScenarios: [
      {
        situation: 'Project planning',
        whatItLooksLike: '"There\'s so much to coordinate — I freeze every time I open the file."',
      },
      {
        situation: 'Life transition',
        whatItLooksLike: '"Moving, new job, and relationship stress all at once — I can\'t prioritize."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'cynefin',
        frameworkName: 'Cynefin Framework',
        why: 'Distinguishes complicated from complex — changes your strategy entirely',
        successRate: 87,
      },
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Reframes the tangle into a focused "How might we?" entry point',
        successRate: 82,
      },
    ],
    relatedPatterns: ['binary-thinking', 'analysis-paralysis', 'avoidance-loop'],
  },
  {
    id: 'triggered-by-others',
    name: 'Triggered by Others',
    description: 'Emotional reactivity hijacks clear thinking — other people\'s behavior puts you on autopilot.',
    icon: 'FlameCore',
    color: '#ef4444',
    colorBg: 'rgba(239, 68, 68, 0.1)',
    colorBorder: 'rgba(239, 68, 68, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'You say or do things in the moment you later regret',
      'Certain people reliably "press your buttons"',
      'Your body reacts before your mind catches up',
      'Afterwards you can see clearly what you should have done',
    ],
    exampleScenarios: [
      {
        situation: 'Family dinner',
        whatItLooksLike: '"My dad makes one comment and suddenly I\'m 14 again, defensive and shut down."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'polarity',
        frameworkName: 'Polarity Mapping',
        why: 'Surfaces the underlying value driving your reactivity',
        successRate: 84,
      },
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Traces the governing belief that makes this trigger so powerful',
        successRate: 86,
      },
    ],
    relatedPatterns: ['inner-conflict', 'projecting-motives', 'past-foreclosing-future'],
  },
  {
    id: 'analysis-paralysis',
    name: 'Analysis Paralysis',
    description: 'Gathering more information feels productive, but it\'s a way of avoiding the decision itself.',
    icon: 'InfinityWeave',
    color: '#6366f1',
    colorBg: 'rgba(99, 102, 241, 0.1)',
    colorBorder: 'rgba(99, 102, 241, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'You\'ve researched this decision for weeks or months',
      'More information makes you feel less sure, not more',
      'You wait for certainty before acting',
      'Others think you\'re overthinking it',
    ],
    exampleScenarios: [
      {
        situation: 'Business decision',
        whatItLooksLike: '"I\'ve read 12 books on this and still don\'t know which direction to take."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'cynefin',
        frameworkName: 'Cynefin Framework',
        why: 'Shows when "probe first" beats "analyze first"',
        successRate: 88,
      },
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Prototyping breaks the research loop with small, reversible action',
        successRate: 85,
      },
    ],
    relatedPatterns: ['overwhelmed-by-complexity', 'perfectionism-stall', 'avoidance-loop'],
  },
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    description: 'Worst-case scenarios feel not just possible but inevitable — your mind runs to maximum danger.',
    icon: 'ShadowVortex',
    color: '#dc2626',
    colorBg: 'rgba(220, 38, 38, 0.1)',
    colorBorder: 'rgba(220, 38, 38, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'Small setbacks feel like total collapse',
      'You imagine chains of disaster from minor events',
      'Others tell you you\'re being dramatic — and they\'re usually right',
      'The feeling is so vivid it\'s hard to dismiss',
    ],
    exampleScenarios: [
      {
        situation: 'Health anxiety',
        whatItLooksLike: '"The doctor wants to run more tests — it\'s probably cancer."',
      },
      {
        situation: 'Work feedback',
        whatItLooksLike: '"My manager criticized one slide — they\'re going to fire me."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Surfaces the hidden assumption driving the catastrophic interpretation',
        successRate: 83,
      },
    ],
    relatedPatterns: ['past-foreclosing-future', 'scarcity-thinking', 'narrative-capture'],
  },
  {
    id: 'people-pleasing-at-cost',
    name: 'People-Pleasing at Cost',
    description: 'Others\' approval overrides your own clarity — you say yes when you mean no.',
    icon: 'MirrorReflection',
    color: '#0d9488',
    colorBg: 'rgba(13, 148, 136, 0.1)',
    colorBorder: 'rgba(13, 148, 136, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'You know what you want but say what others want to hear',
      'Resentment builds after agreeing to things you didn\'t want',
      'Conflict feels more dangerous than self-betrayal',
      'You need to know the other person\'s preference before forming your own',
    ],
    exampleScenarios: [
      {
        situation: 'Team meeting',
        whatItLooksLike: '"I disagreed with the plan but said nothing — now I\'m stuck implementing something I think is wrong."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Identifies the hidden commitment protecting the pleasing behavior',
        successRate: 87,
      },
      {
        frameworkId: 'polarity',
        frameworkName: 'Polarity Mapping',
        why: 'Maps the tension between connection and self-honoring as a both/and',
        successRate: 81,
      },
    ],
    relatedPatterns: ['over-responsibility', 'narrative-capture', 'cant-see-blind-spots'],
  },
  {
    id: 'narrative-capture',
    name: 'Narrative Capture',
    description: 'The story you tell about yourself has become a cage — it predicts your behavior before you choose.',
    icon: 'SerpentPath',
    color: '#7c3aed',
    colorBg: 'rgba(124, 58, 237, 0.1)',
    colorBorder: 'rgba(124, 58, 237, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      '"That\'s just who I am" ends conversations rather than starting them',
      'You tell the same story about yourself across different contexts',
      'The narrative protects you from something you don\'t want to look at',
      'Others see flexibility where you see fixed trait',
    ],
    exampleScenarios: [
      {
        situation: 'Relationship pattern',
        whatItLooksLike: '"I\'m just not a person who does intimacy — never have been."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Challenges the governing variable that\'s been narrated as permanent',
        successRate: 89,
      },
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Reveals what the narrative is protecting',
        successRate: 86,
      },
    ],
    relatedPatterns: ['identity-rigidity', 'cant-see-blind-spots', 'past-foreclosing-future'],
  },
  {
    id: 'comparison-trap',
    name: 'Comparison Trap',
    description: 'Measuring yourself against others derails your own path — you can\'t see your progress clearly.',
    icon: 'ScalesBalance',
    color: '#d97706',
    colorBg: 'rgba(217, 119, 6, 0.1)',
    colorBorder: 'rgba(217, 119, 6, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'Social media or peer success triggers deflation about your own',
      'You can\'t feel good about your progress unless it\'s relative to others',
      'You compare your insides to others\' outsides',
      'The benchmark keeps moving so satisfaction never lands',
    ],
    exampleScenarios: [
      {
        situation: 'Creative work',
        whatItLooksLike: '"I thought my work was good until I saw theirs — now mine feels worthless."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'johari',
        frameworkName: 'Johari Window',
        why: 'Grounds self-knowledge in your own map, not others\' performance',
        successRate: 80,
      },
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Refocuses on your own problem/user rather than competitor benchmarking',
        successRate: 78,
      },
    ],
    relatedPatterns: ['scarcity-thinking', 'perfectionism-stall', 'narrative-capture'],
  },
  {
    id: 'scarcity-thinking',
    name: 'Scarcity Thinking',
    description: 'An assumption that there\'s not enough — time, money, love, options — colors every choice.',
    icon: 'EmptyVessel',
    color: '#78716c',
    colorBg: 'rgba(120, 113, 108, 0.1)',
    colorBorder: 'rgba(120, 113, 108, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'Decisions feel zero-sum: gaining one thing means losing another',
      'Saying yes to anything feels like closing doors',
      'You hoard options, energy, or resources even when not needed',
      'Generosity feels risky rather than natural',
    ],
    exampleScenarios: [
      {
        situation: 'Career opportunity',
        whatItLooksLike: '"If I take this role, I\'ll never get another chance at the other direction."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'polarity',
        frameworkName: 'Polarity Mapping',
        why: 'Reframes either/or as a both/and — reveals the "and" that scarcity hides',
        successRate: 84,
      },
      {
        frameworkId: 'cynefin',
        frameworkName: 'Cynefin Framework',
        why: 'In complex systems, action creates options rather than consuming them',
        successRate: 79,
      },
    ],
    relatedPatterns: ['binary-thinking', 'catastrophizing', 'comparison-trap'],
  },
  {
    id: 'avoidance-loop',
    name: 'Avoidance Loop',
    description: 'You circle the problem repeatedly without entering it — proximity without engagement.',
    icon: 'SpiralDescent',
    color: '#0891b2',
    colorBg: 'rgba(8, 145, 178, 0.1)',
    colorBorder: 'rgba(8, 145, 178, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'The same item has been on your to-do list for weeks',
      'You think about the thing constantly but never directly address it',
      'Busyness feels like progress but nothing changes',
      'A low-grade dread follows you around',
    ],
    exampleScenarios: [
      {
        situation: 'Difficult conversation',
        whatItLooksLike: '"I\'ve been meaning to talk to my partner about this for months — I keep finding reasons not to."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Names the competing commitment that makes avoidance feel safer than entry',
        successRate: 90,
      },
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Low-fidelity prototype: the smallest possible version of entering the problem',
        successRate: 83,
      },
    ],
    relatedPatterns: ['analysis-paralysis', 'perfectionism-stall', 'inner-conflict'],
  },
  {
    id: 'perfectionism-stall',
    name: 'Perfectionism Stall',
    description: '"Good enough" never feels good enough — the standard keeps rising and action stays blocked.',
    icon: 'CrystalMatrix',
    color: '#84cc16',
    colorBg: 'rgba(132, 204, 22, 0.1)',
    colorBorder: 'rgba(132, 204, 22, 0.3)',
    complexity: 'common',
    recognitionCues: [
      'You wait until conditions are ideal before starting',
      'Finished work feels disappointing compared to your vision of it',
      'You revise endlessly and the work never ships',
      'Criticism feels existential rather than informational',
    ],
    exampleScenarios: [
      {
        situation: 'Creative project',
        whatItLooksLike: '"I\'ve been \'working on\' this essay for two years — it\'s still not ready."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'design-thinking',
        frameworkName: 'Design Thinking',
        why: 'Prototype mindset: shipping a rough version is the point, not the failure',
        successRate: 88,
      },
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Questions the assumption that imperfect output reflects imperfect self',
        successRate: 85,
      },
    ],
    relatedPatterns: ['analysis-paralysis', 'avoidance-loop', 'comparison-trap'],
  },
  {
    id: 'meaning-crisis',
    name: 'Meaning Crisis',
    description: 'Nothing feels worth doing — purpose has collapsed and the motivational structure has gone quiet.',
    icon: 'VoidGlyph',
    color: '#475569',
    colorBg: 'rgba(71, 85, 105, 0.1)',
    colorBorder: 'rgba(71, 85, 105, 0.3)',
    complexity: 'advanced',
    recognitionCues: [
      'You succeed at things and feel nothing',
      'Previously meaningful goals now seem arbitrary',
      'You\'re not depressed exactly — just hollow',
      'The question "why bother?" has no answer',
    ],
    exampleScenarios: [
      {
        situation: 'Post-achievement',
        whatItLooksLike: '"I got the promotion I worked toward for five years — and I feel completely empty."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'johari',
        frameworkName: 'Johari Window',
        why: 'Opens unknown-to-self territory where new meaning may be latent',
        successRate: 78,
      },
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Surfaces the hidden commitment blocking re-engagement with meaning',
        successRate: 81,
      },
    ],
    relatedPatterns: ['identity-rigidity', 'narrative-capture', 'past-foreclosing-future'],
  },
  {
    id: 'identity-rigidity',
    name: 'Identity Rigidity',
    description: '"That\'s just who I am" forecloses growth — the self-concept has become load-bearing.',
    icon: 'StoneColossus',
    color: '#92400e',
    colorBg: 'rgba(146, 64, 14, 0.1)',
    colorBorder: 'rgba(146, 64, 14, 0.3)',
    complexity: 'advanced',
    recognitionCues: [
      'Challenges to your self-view feel threatening, not interesting',
      'You\'ve stopped being surprised by yourself',
      'Growth would require admitting a prior version was wrong',
      'Others see more range in you than you allow yourself',
    ],
    exampleScenarios: [
      {
        situation: 'Interpersonal feedback',
        whatItLooksLike: '"I\'m just an introvert — I can\'t change how I am in groups."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'The "big assumption" underlying identity rigidity is exactly what this method surfaces',
        successRate: 91,
      },
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Puts the governing value itself under examination, not just behaviors',
        successRate: 87,
      },
    ],
    relatedPatterns: ['narrative-capture', 'cant-see-blind-spots', 'meaning-crisis'],
  },
  {
    id: 'projecting-motives',
    name: 'Projecting Motives',
    description: 'You attribute your own fears, desires, or assumptions to others — and react to the projection.',
    icon: 'ShadowDouble',
    color: '#b45309',
    colorBg: 'rgba(180, 83, 9, 0.1)',
    colorBorder: 'rgba(180, 83, 9, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'You know what others are thinking without asking',
      'You react to what you imagine they meant, not what they said',
      'When you check your assumptions, you\'re often wrong',
      'Strong negative reactions to traits you\'d never admit having yourself',
    ],
    exampleScenarios: [
      {
        situation: 'Workplace tension',
        whatItLooksLike: '"She didn\'t respond to my email — she\'s clearly trying to undermine me."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'johari',
        frameworkName: 'Johari Window',
        why: 'The blind spot quadrant is where projections live — this method makes them visible',
        successRate: 89,
      },
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Traces the "ladder of inference" from fact to conclusion',
        successRate: 86,
      },
    ],
    relatedPatterns: ['triggered-by-others', 'cant-see-blind-spots', 'narrative-capture'],
  },
  {
    id: 'past-foreclosing-future',
    name: 'Past Foreclosing Future',
    description: 'Prior wounds dictate present choices — old experience writes the rules for what\'s possible now.',
    icon: 'AnchorChain',
    color: '#1d4ed8',
    colorBg: 'rgba(29, 78, 216, 0.1)',
    colorBorder: 'rgba(29, 78, 216, 0.3)',
    complexity: 'advanced',
    recognitionCues: [
      'You decide what will happen next based on what happened before',
      'Optimism feels naive or dangerous',
      'New situations get filtered through old disappointments',
      'You protect yourself from a threat that no longer exists',
    ],
    exampleScenarios: [
      {
        situation: 'New relationship',
        whatItLooksLike: '"I can tell this person will eventually leave — everyone does."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'The "big assumption" is often a past wound generalized into a rule',
        successRate: 90,
      },
      {
        frameworkId: 'argyris',
        frameworkName: 'Double-Loop Learning',
        why: 'Questions whether the past data still applies to the present context',
        successRate: 84,
      },
    ],
    relatedPatterns: ['triggered-by-others', 'catastrophizing', 'identity-rigidity'],
  },
  {
    id: 'over-responsibility',
    name: 'Over-Responsibility',
    description: 'Taking ownership of things not yours to carry — other people\'s feelings, problems, and outcomes.',
    icon: 'AtlasWeight',
    color: '#059669',
    colorBg: 'rgba(5, 150, 105, 0.1)',
    colorBorder: 'rgba(5, 150, 105, 0.3)',
    complexity: 'intermediate',
    recognitionCues: [
      'You feel responsible for others\' emotional states',
      'You step in before others have a chance to handle their own problems',
      'Letting something fail on someone else\'s watch feels unbearable',
      'You\'re exhausted from holding more than your share',
    ],
    exampleScenarios: [
      {
        situation: 'Management role',
        whatItLooksLike: '"If someone on my team struggles, it means I\'ve failed — I have to fix it before it shows."',
      },
    ],
    recommendedFrameworks: [
      {
        frameworkId: 'polarity',
        frameworkName: 'Polarity Mapping',
        why: 'Maps responsibility and autonomy as a both/and — not a binary where care requires control',
        successRate: 83,
      },
      {
        frameworkId: 'immunity-to-change',
        frameworkName: 'Immunity to Change',
        why: 'Surfaces the hidden commitment that makes releasing responsibility feel dangerous',
        successRate: 86,
      },
    ],
    relatedPatterns: ['people-pleasing-at-cost', 'inner-conflict', 'scarcity-thinking'],
  },
];

export function getPatternById(id: string): SensemakingPattern | undefined {
  return sensemakingPatterns.find((p) => p.id === id);
}

export function searchPatterns(query: string): SensemakingPattern[] {
  const q = query.toLowerCase();
  return sensemakingPatterns.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.recognitionCues.some((c) => c.toLowerCase().includes(q))
  );
}
