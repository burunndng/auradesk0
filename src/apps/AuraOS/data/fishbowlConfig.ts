export interface MetaphorTile {
  id: string;
  text: string;
  extensions?: Array<{ prompt: string; options: string[] }>;
  isConcrete?: boolean;
  isCustom?: boolean;
}

export interface Perspective {
  id: string;
  name: string;
  voice: string;
  neverDo: string;
}

export interface CardSet {
  id: string;
  primary: { tradition: string; content: string };
  counters: Array<{ tradition: string; content: string }>;
}

export const METAPHOR_TILES: MetaphorTile[] = [
  {
    id: 'carrying_heavy',
    text: 'Carrying something heavy that used to feel manageable',
    extensions: [
      {
        prompt: 'How long have you been carrying it?',
        options: ['A few days', 'A few weeks', 'Months', 'Longer than I can name']
      },
      {
        prompt: 'What happens when you try to put it down?',
        options: ['It comes back', 'I feel guilty', 'I don\'t know how', 'Something stops me']
      }
    ]
  },
  {
    id: 'fog',
    text: 'Standing in fog — can\'t see what\'s ahead',
    extensions: [
      {
        prompt: 'What do you most want to be able to see?',
        options: ['What I should do next', 'How someone else sees this', 'Whether it matters', 'What I actually want']
      },
      {
        prompt: 'What part of you is trying to navigate anyway?',
        options: ['Habit', 'Fear', 'Something like hope', 'I\'m not sure I am']
      }
    ]
  },
  {
    id: 'deep_water',
    text: 'Swimming in deep water — staying afloat but can\'t touch bottom',
    extensions: [
      {
        prompt: 'What are you swimming toward?',
        options: ['Safety', 'Something I want', 'I\'m just treading water', 'I\'ve stopped asking']
      },
      {
        prompt: 'Who else is in the water?',
        options: ['No one — I\'m alone', 'Someone I\'m trying to reach', 'Someone pulling me under', 'People watching from shore']
      }
    ]
  },
  {
    id: 'ground_shifted',
    text: 'The ground shifted and I haven\'t found my footing',
    extensions: [
      {
        prompt: 'What caused the shift?',
        options: ['Something that happened', 'Something I realized', 'Something that ended', 'I\'m not entirely sure']
      },
      {
        prompt: 'What would \'footing\' feel like?',
        options: ['Knowing what to do', 'Feeling less afraid', 'Trusting myself again', 'Something I can\'t name yet']
      }
    ]
  },
  {
    id: 'two_truths',
    text: 'Holding two things that can\'t both be true',
    extensions: [
      {
        prompt: 'Which of these feels closer?',
        options: ['I want to stay and I want to leave', 'I love this and it\'s hurting me', 'It\'s my fault and it\'s not my fault', 'Something else entirely']
      },
      {
        prompt: 'What happens when you pick one?',
        options: ['The other one won\'t go away', 'I feel like I\'m lying', 'I lose something important', 'Nothing ever gets resolved']
      }
    ]
  },
  {
    id: 'lost_language',
    text: 'In a room where everyone speaks a language I used to understand',
    extensions: [
      {
        prompt: 'When did you stop understanding?',
        options: ['After something changed in me', 'After something changed in them', 'Gradually, without noticing', 'I\'m not sure I ever fully did']
      },
      {
        prompt: 'What do you do in that room?',
        options: ['Pretend I still understand', 'Go quiet', 'Work harder to keep up', 'Look for the door']
      }
    ]
  },
  {
    id: 'blocking',
    text: 'Something trying to come through but I keep blocking it',
    extensions: [
      {
        prompt: 'What does the thing feel like?',
        options: ['Grief', 'Anger', 'Something I want', 'A truth I\'m not ready for']
      },
      {
        prompt: 'Why block it?',
        options: ['Afraid of what happens if I let it through', 'Not the right time', 'I don\'t trust it', 'Habit — I\'ve always blocked it']
      }
    ]
  },
  {
    id: 'concrete',
    text: 'Something concrete happened and I need help thinking about it',
    isConcrete: true
  },
  {
    id: 'custom',
    text: 'Say it your own way',
    isCustom: true
  }
];

export const PERSPECTIVES: Perspective[] = [
  {
    id: 'contemplative',
    name: 'Contemplative',
    voice: 'Observe without judgment. Speak to the spaciousness around the situation. Reference impermanence or witnessing awareness. Do not give advice.',
    neverDo: 'Never pathologize, never fix, never imply something is wrong with the person.'
  },
  {
    id: 'relational',
    name: 'Relational',
    voice: 'Focus on what this situation says about connection, belonging, or rupture. Speak to what the person might be longing for or protecting. Be warm but not saccharine.',
    neverDo: 'Never assume who is at fault. Never reduce to "have you talked to them?"'
  },
  {
    id: 'developmental',
    name: 'Developmental',
    voice: 'Frame this as a moment in a longer arc of growth. What capacity might be being asked to develop here? Speak to the edge of the person\'s current way of making meaning.',
    neverDo: 'Never imply the person is behind or needs to grow up. Never use jargon.'
  },
  {
    id: 'somatic',
    name: 'Somatic',
    voice: 'Track the body. What might be held, braced, or released? Speak to sensation, breath, posture, or physical memory. Ground the reflection in the physical.',
    neverDo: 'Never prescribe. Never say "just breathe." Never reduce to relaxation advice.'
  },
  {
    id: 'critical',
    name: 'Critical',
    voice: 'Ask what structures — social, relational, institutional — might be shaping this experience. What norms might the person be measuring themselves against? Gently denaturalize the obvious.',
    neverDo: 'Never lecture. Never politicize. Never dismiss personal responsibility.'
  }
];

export const CARD_LIBRARY: CardSet[] = [
  {
    id: 'card_01',
    primary: { tradition: 'Zen', content: 'Before thinking, you already know. After thinking, you\'ve only guessed.' },
    counters: [
      { tradition: 'Cognitive Science', content: 'Intuition is fast pattern-matching. It\'s often right — and systematically wrong in predictable ways.' },
      { tradition: 'Relational', content: 'What you "already know" was shaped by every relationship you\'ve had. Knowing isn\'t neutral.' }
    ]
  },
  {
    id: 'card_02',
    primary: { tradition: 'Stoic', content: 'You don\'t control what happens. You control only how you respond.' },
    counters: [
      { tradition: 'Systemic', content: 'When response is the only lever you\'re offered, it\'s worth asking who benefits from that framing.' },
      { tradition: 'Somatic', content: 'Response isn\'t always a choice in the moment. The body responds before you decide to.' }
    ]
  },
  {
    id: 'card_03',
    primary: { tradition: 'Buddhist', content: 'Suffering comes from attachment to what cannot stay.' },
    counters: [
      { tradition: 'Psychodynamic', content: 'Some attachments are how we survived. Releasing them isn\'t always wisdom — sometimes it\'s loss.' },
      { tradition: 'Relational', content: 'Attachment to people isn\'t a mistake. It\'s how love works. The question is what kind.' }
    ]
  },
  {
    id: 'card_04',
    primary: { tradition: 'Existential', content: 'Anxiety is the dizziness of freedom.' },
    counters: [
      { tradition: 'Neurological', content: 'Anxiety is also the nervous system\'s response to uncertainty. Sometimes it needs regulation, not philosophy.' },
      { tradition: 'Feminist', content: 'Freedom isn\'t equal. Anxiety might be tracking real constraints, not existential vertigo.' }
    ]
  },
  {
    id: 'card_05',
    primary: { tradition: 'Taoist', content: 'The usefulness of a cup is in its emptiness.' },
    counters: [
      { tradition: 'Practical', content: 'Emptiness requires someone to fill it. Receptivity without boundaries isn\'t openness — it\'s erosion.' },
      { tradition: 'Developmental', content: 'Before a container can be useful, it has to be built. Not everyone is ready to be empty yet.' }
    ]
  },
  {
    id: 'card_06',
    primary: { tradition: 'Jungian', content: 'What you resist persists. What you accept transforms.' },
    counters: [
      { tradition: 'Behavioral', content: 'Acceptance without action can also be a way of staying stuck. Transformation sometimes requires friction.' },
      { tradition: 'Trauma-Informed', content: 'Some things shouldn\'t be accepted. Resistance is sometimes integrity.' }
    ]
  },
  {
    id: 'card_07',
    primary: { tradition: 'Contemplative', content: 'The observer and the observed are not two things.' },
    counters: [
      { tradition: 'Cognitive', content: 'The observer absolutely changes the observed — but they\'re still distinct. Collapsing them too fast skips important work.' },
      { tradition: 'Relational', content: 'There\'s something important about maintaining enough separateness to actually see. Not-two doesn\'t mean merged.' }
    ]
  },
  {
    id: 'card_08',
    primary: { tradition: 'Indigenous (Lakota)', content: 'We are all related. Mitakuye Oyasin.' },
    counters: [
      { tradition: 'Boundaries', content: 'Relatedness doesn\'t mean equal obligation. Some relationships need distance to remain healthy.' },
      { tradition: 'Individual', content: 'Before we can truly recognize others, we need to know where we end. Belonging requires a self.' }
    ]
  },
  {
    id: 'card_09',
    primary: { tradition: 'Sufi', content: 'Polish the mirror of the heart so it can reflect the sun.' },
    counters: [
      { tradition: 'Secular', content: 'What if the mirror doesn\'t need polishing — what if it\'s already reflecting accurately, and you don\'t like what you see?' },
      { tradition: 'Relational', content: 'No one polishes their mirror alone. Who has helped you see yourself more clearly?' }
    ]
  },
  {
    id: 'card_10',
    primary: { tradition: 'Stoic', content: 'Memento mori — remember you will die. Let that sharpen your living.' },
    counters: [
      { tradition: 'Psychological', content: 'Terror management isn\'t the only response to mortality. Grief and avoidance are responses too — and sometimes they\'re appropriate.' },
      { tradition: 'Relational', content: 'Remembering death alone is different from sitting with mortality alongside others. Which kind do you practice?' }
    ]
  },
  {
    id: 'card_11',
    primary: { tradition: 'Advaita Vedanta', content: 'The self seeking liberation is the obstacle to liberation.' },
    counters: [
      { tradition: 'Psychological', content: 'The self seeking healing is not an obstacle. It\'s the only thing actually doing the work.' },
      { tradition: 'Developmental', content: 'You have to have a self before you can see through it. The seeking might still be necessary.' }
    ]
  },
  {
    id: 'card_12',
    primary: { tradition: 'Confucian', content: 'The superior person examines themselves daily.' },
    counters: [
      { tradition: 'Self-Compassion', content: 'Daily self-examination without self-compassion becomes self-surveillance. The question is what you\'re looking for.' },
      { tradition: 'Systemic', content: 'Individual self-examination can also be a way of keeping structural problems personal. Not everything is yours to fix.' }
    ]
  },
  {
    id: 'card_13',
    primary: { tradition: 'Existential', content: 'We are condemned to be free.' },
    counters: [
      { tradition: 'Attachment', content: 'Freedom without secure attachment isn\'t freedom. It\'s isolation with good philosophy.' },
      { tradition: 'Political', content: 'The condemnation falls unevenly. Some freedoms require dismantling structures that limit others\' choices.' }
    ]
  },
  {
    id: 'card_14',
    primary: { tradition: 'Tibetan Buddhist', content: 'Enlightenment is not elsewhere. It is here, as the texture of this moment.' },
    counters: [
      { tradition: 'Phenomenological', content: 'This moment also includes the ache, the distraction, the half-formed thought. Here includes all of it.' },
      { tradition: 'Motivational', content: 'If it\'s all here already, what keeps us returning to practice? The texture of this moment sometimes requires cultivation.' }
    ]
  },
  {
    id: 'card_15',
    primary: { tradition: 'Pragmatist', content: 'Truth is what works.' },
    counters: [
      { tradition: 'Ethical', content: 'What works for whom? Useful truths can serve power. "It works" sometimes means "it benefits someone."' },
      { tradition: 'Contemplative', content: 'What works to end suffering and what\'s instrumentally effective can come apart. Efficiency isn\'t always the right measure.' }
    ]
  },
  {
    id: 'card_16',
    primary: { tradition: 'Developmental (Kegan)', content: 'We are not only shaped by our experience. We are the meaning we make of it.' },
    counters: [
      { tradition: 'Somatic', content: 'Some experience is stored below meaning-making. The body holds what the mind hasn\'t yet made sense of.' },
      { tradition: 'Critical', content: 'The frameworks we use to make meaning are themselves historically and culturally shaped. We don\'t make meaning in a vacuum.' }
    ]
  },
  {
    id: 'card_17',
    primary: { tradition: 'Christian Mysticism', content: 'God is closer to you than you are to yourself.' },
    counters: [
      { tradition: 'Secular', content: 'What if closeness isn\'t the problem — what if it\'s that the self keeps being a stranger to itself? Proximity doesn\'t guarantee intimacy.' },
      { tradition: 'Jungian', content: 'The divine image may live in the psyche. But that doesn\'t make it safe or unconditionally loving — it has shadow too.' }
    ]
  },
  {
    id: 'card_18',
    primary: { tradition: 'Systemic', content: 'You are not the problem. The system is producing the problem.' },
    counters: [
      { tradition: 'Personal Responsibility', content: 'Systems are made of people choosing. "The system" can also be a way of avoiding the specific choices we make.' },
      { tradition: 'Both/And', content: 'Individual agency and systemic shaping aren\'t mutually exclusive. The question is which you\'ve been more prone to ignore.' }
    ]
  },
  {
    id: 'card_19',
    primary: { tradition: 'Shamanic', content: 'Before asking what you want to become, ask what wants to emerge through you.' },
    counters: [
      { tradition: 'Humanist', content: 'Agency matters. You are not merely a vessel for emergence — you are also a chooser, a maker, a refuser.' },
      { tradition: 'Psychological', content: 'What "wants to emerge" can include old defenses, outdated patterns, the voice of a critical parent. Discernment matters.' }
    ]
  },
  {
    id: 'card_20',
    primary: { tradition: 'Ecological', content: 'You are not in nature. You are nature, temporarily organized.' },
    counters: [
      { tradition: 'Phenomenological', content: 'The experience of being a "temporarily organized" self is the only experience available to you. That particularity matters.' },
      { tradition: 'Ethical', content: 'If we are nature, so is cruelty. The insight needs an ethic alongside it — not all natural things are worth becoming.' }
    ]
  }
];

export const PRACTICE_VARIETY_CLASSES = [
  'conversation experiment',
  'boundary experiment',
  'attention experiment',
  'pacing experiment',
  'honesty experiment',
  'support-seeking experiment'
] as const;

export type PracticeVarietyClass = typeof PRACTICE_VARIETY_CLASSES[number];
