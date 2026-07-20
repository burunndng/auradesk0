/**
 * Schema Reflection Wizard - Static Content
 * 7 curated schemas for emotional pattern exploration
 * Based on Schema Therapy (Young, Klosko, Weishaar)
 */

export type SchemaIconType = 'triangle' | 'octagon' | 'hexagon' | 'star' | 'moon' | 'circle' | 'square';

export interface SchemaDefinition {
  schema_id: string;
  plain_name: string;
  short_description: string;
  full_description: string;
  example_manifestations: string[];
  common_origins: string;
  fallback_questions: string[];
  icon_type: SchemaIconType;
}

export const schemas: SchemaDefinition[] = [
  {
    schema_id: 'abandonment',
    plain_name: 'Fear of Losing People',
    short_description: 'An underlying anxiety that loved ones will eventually leave. A sense that relationships aren\'t truly secure or permanent.',
    full_description: 'The Abandonment schema shows up as a persistent fear that people close to you will leave—either suddenly or gradually. You might imagine worst-case scenarios about your relationships, or interpret small changes in behavior as signs of rejection. This pattern often leads to anxious checking-in, difficulty being alone, or alternating between pursuit and distance. At its heart is a deep doubt about whether anyone will truly stay.',
    example_manifestations: [
      'Feeling intense anxiety when a partner is distant or busy, interpreting it as rejection',
      'Imagining elaborate scenarios where people leave you over small incidents',
      'Difficulty enjoying time alone; constant urge to connect or check in'
    ],
    common_origins: 'Often develops in childhood when caregivers were physically or emotionally unavailable, inconsistent, or when family stability felt threatened.',
    fallback_questions: [
      'When did you last feel afraid that someone might leave you?',
      'How do you usually respond when someone is unavailable or distant?',
      'What would it feel like to trust that a relationship could survive conflict?'
    ],
    icon_type: 'triangle'
  },

  {
    schema_id: 'emotional_deprivation',
    plain_name: 'Never Enough Care',
    short_description: 'A belief that your emotional needs won\'t be met by others. A sense of chronic understimulation, loneliness, or being unseen.',
    full_description: 'The Emotional Deprivation schema is characterized by a core belief that no one will provide the emotional nourishment you need—whether that\'s empathy, understanding, affection, or genuine interest. You might feel chronically unseen or misunderstood, even in close relationships. This can lead to either giving up on connection, overshooting with emotional demands, or staying in one-sided relationships hoping things will change. The underlying assumption is that your emotional world simply doesn\'t matter to others.',
    example_manifestations: [
      'Feeling unseen or misunderstood even when people try to help',
      'Chronic sense of loneliness despite being around others',
      'Gravitating toward emotionally unavailable partners or friends, then feeling hurt'
    ],
    common_origins: 'Often rooted in childhood experiences where caregivers were preoccupied, dismissive of emotions, or focused on their own needs rather than attunement to the child.',
    fallback_questions: [
      'What emotional need feels most chronically unmet in your life?',
      'When have you felt truly seen and understood by someone?',
      'What would it mean to believe your emotional needs matter?'
    ],
    icon_type: 'circle'
  },

  {
    schema_id: 'defectiveness',
    plain_name: 'Feeling Flawed or Broken',
    short_description: 'A deep belief that something is fundamentally wrong with you. Shame about your worth, appearance, abilities, or social acceptability.',
    full_description: 'The Defectiveness schema manifests as a pervasive sense that you are fundamentally flawed, broken, or unlovable. You might focus obsessively on your perceived shortcomings—whether physical, emotional, intellectual, or social. This schema often drives shame (the feeling that "I am bad") rather than guilt (the feeling that "I did something bad"). People with this schema often hide parts of themselves, assume rejection before it happens, or work compulsively to appear perfect. The core belief is that if people really knew you, they\'d leave.',
    example_manifestations: [
      'Hyperfocus on perceived flaws; difficulty accepting compliments',
      'Assuming people will reject you once they know the "real you"',
      'Chronic shame about your body, mind, or social skills'
    ],
    common_origins: 'Often develops when children receive critical, shaming, or comparing messages from caregivers, or when they feel different from peers in ways that were emphasized as bad.',
    fallback_questions: [
      'What part of yourself do you most fear others discovering?',
      'Where did you first learn that something about you was wrong or broken?',
      'What would change if you believed you were fundamentally acceptable?'
    ],
    icon_type: 'square'
  },

  {
    schema_id: 'failure',
    plain_name: 'Incompetence or Failure',
    short_description: 'A conviction that you\'ll fail at important tasks. Doubt in your competence, intelligence, or ability to succeed.',
    full_description: 'The Failure schema is an internalized belief that you lack the competence or ability to succeed. You might avoid challenging tasks, give up easily, or feel paralyzed by perfectionism because the standard for "success" feels impossibly high. This schema can show up as procrastination, imposter syndrome, or a fatalistic belief that trying is pointless. You might overestimate the difficulty of tasks or underestimate your own capabilities. At the root is doubt about whether you can handle what life requires.',
    example_manifestations: [
      'Avoiding challenges or new situations due to assumed failure',
      'Imposter syndrome: feeling like a fraud despite accomplishments',
      'Perfectionism that prevents completion; "if I can\'t do it perfectly, why try"'
    ],
    common_origins: 'Often rooted in childhood experiences where you were criticized for mistakes, compared unfavorably to siblings, or given tasks beyond your developmental capacity without support.',
    fallback_questions: [
      'What task or goal do you most fear failing at?',
      'How do you typically respond when you make a mistake?',
      'What would you attempt if you knew failure was acceptable?'
    ],
    icon_type: 'hexagon'
  },

  {
    schema_id: 'unrelenting_standards',
    plain_name: 'Unrelenting Standards or Perfectionism',
    short_description: 'Internalized belief that you must meet impossibly high standards. Fear of criticism, mistakes, or being ordinary.',
    full_description: 'The Unrelenting Standards schema drives you to pursue unrealistically high goals and to be hypercritical of yourself when you fall short. This often manifests as perfectionism, workaholism, or constant self-monitoring. You might believe that self-sacrifice and achievement are the price of love or respect, or that relaxation is irresponsible. The underlying fear is that if you don\'t maintain these standards, you\'ll be mediocre, criticized, or unworthy. While this schema can drive productivity, it also leads to burnout, anxiety, and difficulty enjoying what you\'ve accomplished.',
    example_manifestations: [
      'Chronic overwork; difficulty relaxing without guilt',
      'Harsh self-criticism when performance falls short of impossible standards',
      'Belief that your worth depends on achievement, productivity, or perfection'
    ],
    common_origins: 'Often develops when parents modeled high-achievement culture, were conditional in their approval, or communicated that rest, play, or mediocrity were unacceptable.',
    fallback_questions: [
      'What standards do you hold yourself to that no one else demands?',
      'What would happen if you did something imperfectly?',
      'What would you do if you didn\'t have to be perfect?'
    ],
    icon_type: 'star'
  },

  {
    schema_id: 'self_sacrifice',
    plain_name: 'Excessive Self-Sacrifice',
    short_description: 'A pattern of prioritizing others\' needs over your own. Difficulty identifying or expressing your own needs and boundaries.',
    full_description: 'The Self-Sacrifice schema manifests as a habitual pattern of putting others\' needs, wants, and feelings ahead of your own. You might derive self-worth from being helpful or needed, struggle to say no, or feel guilty prioritizing yourself. This often stems from an internalized belief that your own needs are less important, or that love means self-denial. While generosity is healthy, this schema becomes problematic when it leads to resentment, burnout, or loss of self. You might not even know what you want anymore because you\'ve spent so long attending to others.',
    example_manifestations: [
      'Chronic difficulty saying no; overcommitting to others\' requests',
      'Resentment or bitterness that emerges after consistently self-sacrificing',
      'Loss of identity or sense of self; difficulty identifying your own needs'
    ],
    common_origins: 'Often rooted in family dynamics where the child was parentified (given adult responsibilities), or where love was conditional on being helpful or not causing trouble.',
    fallback_questions: [
      'What would you do if you prioritized your needs as much as others\'?',
      'When did you first learn that your needs were less important?',
      'What are you afraid would happen if you said no?'
    ],
    icon_type: 'moon'
  },

  {
    schema_id: 'subjugation',
    plain_name: 'Subjugation or Loss of Control',
    short_description: 'Excessive compliance or suppression of your own preferences. Fear of anger or conflict; difficulty expressing yourself.',
    full_description: 'The Subjugation schema is characterized by the belief that your own preferences, needs, and voice don\'t matter—and that maintaining relationships requires you to suppress who you are. You might go along with others\' decisions to avoid conflict, struggle to express disagreement, or feel your own emotions are invalid. This can manifest as passive-aggression, explosive anger (when you can no longer contain yourself), or depression (the weight of chronic self-suppression). At the core is a belief that either your preferences don\'t count, or that expressing them will result in abandonment or retaliation.',
    example_manifestations: [
      'Chronic difficulty expressing disagreement or saying what you really think',
      'Going along with plans, decisions, or treatment that doesn\'t align with you',
      'Explosive anger or resentment that builds from long periods of suppression'
    ],
    common_origins: 'Often develops in families where children\'s voices were shut down, where authority was dominating or punitive, or where there was an emphasis on obedience over autonomy.',
    fallback_questions: [
      'What would you do or say if you weren\'t afraid of the consequences?',
      'When was the last time you felt genuinely heard and respected?',
      'What are you most afraid would happen if you spoke your truth?'
    ],
    icon_type: 'octagon'
  }
];

/**
 * Get a schema definition by ID
 */
export function getSchemaById(schema_id: string): SchemaDefinition | undefined {
  return schemas.find(s => s.schema_id === schema_id);
}

/**
 * Get all schema IDs (for validation)
 */
export function getAllSchemaIds(): string[] {
  return schemas.map(s => s.schema_id);
}

/**
 * Get all schemas sorted by name
 */
export function getAllSchemasSorted(): SchemaDefinition[] {
  return [...schemas].sort((a, b) => a.plain_name.localeCompare(b.plain_name));
}
