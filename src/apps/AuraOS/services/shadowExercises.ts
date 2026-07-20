/**
 * Shadow Journaling Exercise Definitions
 * Fixed structured exercises with AI reflections
 */

export type ShadowExerciseId = 
  | 'projection-inventory'
  | 'golden-shadow-inventory'
  | 'trigger-tracking'
  | 'shame-archaeology'
  | 'letter-to-shadow'
  | 'integration-statement';

export type ShadowExercisePhase = 'discovery' | 'excavation' | 'dialogue' | 'integration';

export type ShadowExerciseFieldType = 'text' | 'textarea' | 'list' | 'scale';

export interface ShadowExerciseField {
  id: string;
  label: string;
  type: ShadowExerciseFieldType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  maxLength?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export interface ShadowExerciseTemplate {
  id: ShadowExerciseId;
  name: string;
  phase: ShadowExercisePhase;
  shortDescription: string;
  longInstructions: string;
  uiType: 'table' | 'qna' | 'letter' | 'formula';
  fields: ShadowExerciseField[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 6 Core Shadow Journaling Exercises
 */
export const SHADOW_EXERCISES: Record<ShadowExerciseId, ShadowExerciseTemplate> = {
  'projection-inventory': {
    id: 'projection-inventory',
    name: 'Projection Inventory',
    phase: 'discovery',
    shortDescription: 'Identify qualities you notice and judge in others.',
    longInstructions: `**What are projections?**

Projections are qualities we unconsciously disown in ourselves and "see" in others instead. When we have a strong emotional reaction to someone—especially judgment, envy, or irritation—it often signals a projection.

**Your Task:**

Think of 3 people who trigger a strong reaction in you (positive or negative). For each person, name:
- Who they are (or a label like "that coworker")
- The quality that triggers you
- Your emotional reaction (anger, envy, admiration, disgust, etc.)
- Why this quality bothers or attracts you

Be honest. This is shadow work—the point is to notice patterns, not to judge yourself.`,
    uiType: 'table',
    fields: [
      {
        id: 'person1',
        label: 'Person 1 (name or description)',
        type: 'text',
        required: true,
        placeholder: 'e.g., My manager'
      },
      {
        id: 'quality1',
        label: 'Quality that triggers you',
        type: 'text',
        required: true,
        placeholder: 'e.g., Arrogance, confidence, neediness'
      },
      {
        id: 'reaction1',
        label: 'Your emotional reaction',
        type: 'text',
        required: true,
        placeholder: 'e.g., Anger, envy, disgust'
      },
      {
        id: 'why1',
        label: 'Why does this bother/attract you?',
        type: 'textarea',
        required: true,
        placeholder: 'What is it about this quality that triggers you?',
        maxLength: 500
      },
      {
        id: 'person2',
        label: 'Person 2',
        type: 'text',
        required: true
      },
      {
        id: 'quality2',
        label: 'Quality that triggers you',
        type: 'text',
        required: true
      },
      {
        id: 'reaction2',
        label: 'Your emotional reaction',
        type: 'text',
        required: true
      },
      {
        id: 'why2',
        label: 'Why does this bother/attract you?',
        type: 'textarea',
        required: true,
        maxLength: 500
      },
      {
        id: 'person3',
        label: 'Person 3',
        type: 'text',
        required: true
      },
      {
        id: 'quality3',
        label: 'Quality that triggers you',
        type: 'text',
        required: true
      },
      {
        id: 'reaction3',
        label: 'Your emotional reaction',
        type: 'text',
        required: true
      },
      {
        id: 'why3',
        label: 'Why does this bother/attract you?',
        type: 'textarea',
        required: true,
        maxLength: 500
      }
    ],
    estimatedTime: '10-15 min',
    difficulty: 'beginner'
  },

  'golden-shadow-inventory': {
    id: 'golden-shadow-inventory',
    name: 'Golden Shadow Inventory',
    phase: 'discovery',
    shortDescription: 'Uncover positive qualities you disown and project onto others.',
    longInstructions: `**What is the Golden Shadow?**

Most shadow work focuses on negative qualities we reject. But we also disown *positive* qualities—brilliance, creativity, beauty, power—and project them onto others ("they're special, I'm not").

**Your Task:**

Think of 3 people you admire, envy, or put on a pedestal. For each:
- Who they are
- The quality you admire
- How you feel when you see this quality in them
- Where this quality might exist (even in small amounts) in yourself

This exercise helps you reclaim disowned gifts.`,
    uiType: 'table',
    fields: [
      {
        id: 'person1',
        label: 'Person 1 (name or description)',
        type: 'text',
        required: true,
        placeholder: 'e.g., A friend, author, or public figure'
      },
      {
        id: 'quality1',
        label: 'Quality you admire or envy',
        type: 'text',
        required: true,
        placeholder: 'e.g., Confidence, creativity, courage'
      },
      {
        id: 'feeling1',
        label: 'How you feel when you see this',
        type: 'text',
        required: true,
        placeholder: 'e.g., Inspired, envious, small'
      },
      {
        id: 'owned1',
        label: 'Where might this quality exist in you?',
        type: 'textarea',
        required: true,
        placeholder: 'Even if it feels hidden or small...',
        maxLength: 500
      },
      {
        id: 'person2',
        label: 'Person 2',
        type: 'text',
        required: true
      },
      {
        id: 'quality2',
        label: 'Quality you admire or envy',
        type: 'text',
        required: true
      },
      {
        id: 'feeling2',
        label: 'How you feel when you see this',
        type: 'text',
        required: true
      },
      {
        id: 'owned2',
        label: 'Where might this quality exist in you?',
        type: 'textarea',
        required: true,
        maxLength: 500
      },
      {
        id: 'person3',
        label: 'Person 3',
        type: 'text',
        required: true
      },
      {
        id: 'quality3',
        label: 'Quality you admire or envy',
        type: 'text',
        required: true
      },
      {
        id: 'feeling3',
        label: 'How you feel when you see this',
        type: 'text',
        required: true
      },
      {
        id: 'owned3',
        label: 'Where might this quality exist in you?',
        type: 'textarea',
        required: true,
        maxLength: 500
      }
    ],
    estimatedTime: '10-15 min',
    difficulty: 'beginner'
  },

  'trigger-tracking': {
    id: 'trigger-tracking',
    name: 'Trigger Tracking Log',
    phase: 'excavation',
    shortDescription: 'Track a recent trigger and excavate the underlying belief.',
    longInstructions: `**What is a trigger?**

A trigger is a moment when you feel an unusually strong emotional reaction—out of proportion to the situation. Triggers point to shadow material: unhealed wounds, unmet needs, or disowned parts.

**Your Task:**

Think of a recent trigger. Answer these questions to excavate what's underneath:
- What happened? (External event)
- What did you feel? (Emotion)
- What story did you tell yourself? (Thought loop)
- What core belief might this reveal? ("I'm not enough," "People will hurt me," etc.)
- What unmet need is underneath? (Safety, belonging, autonomy, etc.)

This exercise helps you move from reactivity to awareness.`,
    uiType: 'qna',
    fields: [
      {
        id: 'trigger_event',
        label: '1. What happened? (Describe the external event)',
        type: 'textarea',
        required: true,
        placeholder: 'Be specific: who, what, when, where...',
        maxLength: 500,
        description: 'Stick to observable facts, not interpretations.'
      },
      {
        id: 'trigger_emotion',
        label: '2. What did you feel? (Name the emotion)',
        type: 'text',
        required: true,
        placeholder: 'e.g., Rage, shame, betrayal, fear'
      },
      {
        id: 'trigger_intensity',
        label: '3. Intensity of reaction (1-10)',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'Mild', max: 'Overwhelming' }
      },
      {
        id: 'trigger_story',
        label: '4. What story did you tell yourself?',
        type: 'textarea',
        required: true,
        placeholder: 'What thoughts ran through your mind? What did this mean about you, them, or the world?',
        maxLength: 500
      },
      {
        id: 'trigger_belief',
        label: '5. What core belief might this reveal?',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "I\'m not safe," "People will abandon me," "I\'m not worthy of love"',
        maxLength: 300
      },
      {
        id: 'trigger_need',
        label: '6. What unmet need is underneath?',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., Safety, belonging, autonomy, recognition, respect',
        maxLength: 300
      }
    ],
    estimatedTime: '15-20 min',
    difficulty: 'intermediate'
  },

  'shame-archaeology': {
    id: 'shame-archaeology',
    name: 'Shame Archaeology Dig',
    phase: 'excavation',
    shortDescription: 'Excavate a shame story and the belief it created.',
    longInstructions: `**What is shame archaeology?**

Shame is the emotion that tells us "something is fundamentally wrong with me." It's different from guilt ("I did something bad"). Shame gets buried in the shadow, but it shapes our lives from underground.

**Your Task:**

Think of a moment when you felt deep shame—a moment that still stings when you remember it. Answer these questions:
- What happened?
- What did this moment make you believe about yourself?
- How has this belief shaped your life since?
- If you could speak to your younger self in that moment, what would you say?

This is deep work. Be gentle with yourself.`,
    uiType: 'qna',
    fields: [
      {
        id: 'shame_memory',
        label: '1. Describe the shame moment',
        type: 'textarea',
        required: true,
        placeholder: 'What happened? How old were you? Who was there?',
        maxLength: 800,
        description: 'Take your time. You can be as specific or vague as you need to feel safe.'
      },
      {
        id: 'shame_feeling',
        label: '2. What did you feel in that moment?',
        type: 'text',
        required: true,
        placeholder: 'e.g., Exposed, worthless, humiliated, small'
      },
      {
        id: 'shame_belief',
        label: '3. What did this moment make you believe about yourself?',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "I\'m not lovable," "I\'m broken," "I\'m too much"',
        maxLength: 500
      },
      {
        id: 'shame_impact',
        label: '4. How has this belief shaped your life since?',
        type: 'textarea',
        required: true,
        placeholder: 'How do you protect yourself? What do you avoid? How do you show up in relationships?',
        maxLength: 800
      },
      {
        id: 'shame_compassion',
        label: '5. What would you say to your younger self?',
        type: 'textarea',
        required: true,
        placeholder: 'Speak to them with the wisdom and compassion you have now...',
        maxLength: 500
      }
    ],
    estimatedTime: '20-30 min',
    difficulty: 'advanced'
  },

  'letter-to-shadow': {
    id: 'letter-to-shadow',
    name: 'Letter to Your Shadow',
    phase: 'dialogue',
    shortDescription: 'Write a letter to a disowned part of yourself.',
    longInstructions: `**What is a shadow dialogue?**

Instead of fighting or suppressing a shadow quality, you can dialogue with it. Shadow parts often carry important messages—they're trying to protect you or meet an unmet need.

**Your Task:**

Choose a shadow quality (anger, selfishness, neediness, arrogance, etc.) and write it a letter. Then, write a letter *from* that quality back to you.

- **Letter TO the shadow:** Acknowledge it. Ask what it needs. Ask what it's trying to protect.
- **Letter FROM the shadow:** Let it speak. What would it say if it could talk freely?

This exercise creates space for integration.`,
    uiType: 'letter',
    fields: [
      {
        id: 'shadow_quality',
        label: 'What shadow quality are you writing to?',
        type: 'text',
        required: true,
        placeholder: 'e.g., My anger, my neediness, my arrogance'
      },
      {
        id: 'letter_to_shadow',
        label: 'Letter TO your shadow',
        type: 'textarea',
        required: true,
        placeholder: 'Dear [shadow quality]...\n\nAcknowledge it. Ask what it needs. Ask what it\'s protecting.',
        maxLength: 1500,
        description: 'Write from your wisest, most compassionate self.'
      },
      {
        id: 'letter_from_shadow',
        label: 'Letter FROM your shadow',
        type: 'textarea',
        required: true,
        placeholder: 'Write as if you ARE the shadow quality. What does it want to say back to you?',
        maxLength: 1500,
        description: 'Let it speak without censoring. Shadow parts often carry surprising wisdom.'
      }
    ],
    estimatedTime: '20-30 min',
    difficulty: 'intermediate'
  },

  'integration-statement': {
    id: 'integration-statement',
    name: 'Integration Statement Practice',
    phase: 'integration',
    shortDescription: 'Craft a statement to re-own a disowned quality.',
    longInstructions: `**What is integration?**

Integration is the process of taking back a projection—owning a quality you've been disowning. It's not about *becoming* the shadow; it's about *including* it as part of your full humanity.

**Your Task:**

Choose a shadow quality you're ready to integrate. Use this formula:

1. Name the quality
2. Acknowledge where you've rejected it
3. Re-own it ("I am also...")
4. Set a boundary ("I can be X without...")
5. Commit to an action

**Example:**
"I've always judged people who are 'selfish.' I was taught that selfishness is bad. But I am also allowed to have needs and prioritize myself. I can care for myself without abandoning others. This week, I will say no to one request that drains me."`,
    uiType: 'formula',
    fields: [
      {
        id: 'quality',
        label: '1. The quality I\'m integrating',
        type: 'text',
        required: true,
        placeholder: 'e.g., Anger, selfishness, ambition, softness'
      },
      {
        id: 'rejection',
        label: '2. How I\'ve rejected this quality',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "I was taught this was bad," "I judged others for this," "I shut this down in myself"',
        maxLength: 500
      },
      {
        id: 'reowning',
        label: '3. Re-owning statement ("I am also...")',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "I am also allowed to feel angry," "I am also ambitious"',
        maxLength: 300
      },
      {
        id: 'boundary',
        label: '4. Boundary ("I can be X without...")',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "I can be angry without harming others," "I can be ambitious without being ruthless"',
        maxLength: 300
      },
      {
        id: 'action',
        label: '5. One small action this week',
        type: 'textarea',
        required: true,
        placeholder: 'What\'s one way you can embody this integration in the next 7 days?',
        maxLength: 300
      }
    ],
    estimatedTime: '15-20 min',
    difficulty: 'intermediate'
  }
};

/**
 * Get exercise by ID
 */
export function getExerciseById(id: ShadowExerciseId): ShadowExerciseTemplate {
  return SHADOW_EXERCISES[id];
}

/**
 * Get exercises by phase
 */
export function getExercisesByPhase(phase: ShadowExercisePhase): ShadowExerciseTemplate[] {
  return Object.values(SHADOW_EXERCISES).filter(ex => ex.phase === phase);
}

/**
 * Get all exercise IDs
 */
export function getAllExerciseIds(): ShadowExerciseId[] {
  return Object.keys(SHADOW_EXERCISES) as ShadowExerciseId[];
}
