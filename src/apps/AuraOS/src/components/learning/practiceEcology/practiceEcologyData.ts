export type QuadrantId = 'I' | 'WE' | 'IT' | 'ITS';

export type PracticeEcologyTag = 'Body' | 'Mind' | 'Spirit' | 'Shadow' | 'Relational' | 'Systems';

export type EcologyTimeHorizon = 'shortTerm' | 'longTerm';

export interface EcologyQuadrant {
  id: QuadrantId;
  label: string;
  name: string;
  description: string;
  gradient: string; // Tailwind gradient classes: "from-x to-y"
}

export interface QuadrantEffect {
  shortTerm: number; // 0–5
  longTerm: number; // 0–5
  summary: string;
}

export interface QuadrantPropagation {
  from: QuadrantId;
  to: QuadrantId;
  strength: 1 | 2 | 3;
  note: string;
}

export interface PracticeEcologyPractice {
  id: string;
  name: string;
  tags: PracticeEcologyTag[];
  primaryQuadrant: QuadrantId;
  description: string;
  typicalSideEffects: string[];
  recommendedComplements: string[]; // practice ids
  effects: Record<QuadrantId, QuadrantEffect>;
  propagation: QuadrantPropagation[];
}

export interface PracticeEcologyRecipe {
  id: string;
  name: string;
  intention: string;
  description: string;
  practiceIds: string[];
}

export const ecologyQuadrants: EcologyQuadrant[] = [
  {
    id: 'I',
    label: 'I',
    name: 'Interior–Individual',
    description: 'Attention, emotions, meaning-making, shadow, inner development.',
    gradient: 'from-purple-500 to-fuchsia-500',
  },
  {
    id: 'WE',
    label: 'WE',
    name: 'Interior–Collective',
    description: 'Relationships, shared meaning, culture, belonging, trust.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'IT',
    label: 'IT',
    name: 'Exterior–Individual',
    description: 'Body, habits, nervous system, measurable behaviors, skills.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ITS',
    label: 'ITS',
    name: 'Exterior–Collective',
    description: 'Systems, institutions, environments, incentives, ecological context.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export const practiceEcologyPractices: PracticeEcologyPractice[] = [
  {
    id: 'meditation',
    name: 'Meditation (Attention Training)',
    tags: ['Mind', 'Spirit'],
    primaryQuadrant: 'I',
    description:
      'Systematically trains attention and metacognition. Short-term: more space around thoughts. Long-term: more capacity to choose responses, stabilize values, and relate wisely.',
    typicalSideEffects: [
      'Early agitation as suppressed material surfaces',
      'Overemphasis on interior work (spiritual bypass risk)',
    ],
    recommendedComplements: ['strength-training', 'authentic-relating', 'community-organizing'],
    effects: {
      I: {
        shortTerm: 4,
        longTerm: 5,
        summary: 'Decentering + emotional regulation + increased insight.',
      },
      WE: {
        shortTerm: 1,
        longTerm: 3,
        summary: 'More presence and less reactivity in conversation over time.',
      },
      IT: {
        shortTerm: 1,
        longTerm: 3,
        summary: 'Downshifts stress physiology; supports sleep and behavior change.',
      },
      ITS: {
        shortTerm: 0,
        longTerm: 2,
        summary: 'Improves systems participation through clearer priorities and steadiness.',
      },
    },
    propagation: [
      { from: 'I', to: 'WE', strength: 2, note: 'Presence reduces relational escalation; increases repair.' },
      { from: 'I', to: 'IT', strength: 2, note: 'Stress physiology downshifts; habits become more choiceful.' },
      { from: 'WE', to: 'ITS', strength: 1, note: 'Healthier norms scale into healthier teams over time.' },
    ],
  },
  {
    id: 'shadow-work',
    name: 'Shadow Work (IFS / 3-2-1)',
    tags: ['Shadow', 'Mind'],
    primaryQuadrant: 'I',
    description:
      'Turns projections into ownership. Builds emotional honesty and integration. Often unlocks capacity in other practices by reducing internal friction and self-sabotage.',
    typicalSideEffects: [
      'Can feel destabilizing without strong resourcing',
      'Relational turbulence if insights are shared prematurely',
    ],
    recommendedComplements: ['meditation', 'somatic-awareness', 'authentic-relating'],
    effects: {
      I: {
        shortTerm: 3,
        longTerm: 5,
        summary: 'Integration of exiled parts; reduced reactivity; increased self-leadership.',
      },
      WE: {
        shortTerm: 2,
        longTerm: 4,
        summary: 'Fewer projections; clearer requests; more repair capacity.',
      },
      IT: {
        shortTerm: 1,
        longTerm: 3,
        summary: 'Less compulsive behavior; improved self-care consistency.',
      },
      ITS: {
        shortTerm: 0,
        longTerm: 2,
        summary: 'Less drama leakage into systems; better boundaries and role clarity.',
      },
    },
    propagation: [
      { from: 'I', to: 'WE', strength: 3, note: 'Owning projections transforms conflict into contact.' },
      { from: 'I', to: 'IT', strength: 2, note: 'Reduced internal sabotage increases behavior follow-through.' },
      { from: 'WE', to: 'ITS', strength: 1, note: 'Cleaner relationships reduce organizational friction.' },
    ],
  },
  {
    id: 'somatic-awareness',
    name: 'Somatic Awareness (Body Scan / Yoga)',
    tags: ['Body', 'Mind'],
    primaryQuadrant: 'IT',
    description:
      'Refines interoception and nervous system regulation. Often acts as a bridge: embodiment makes inner work more grounded and relational work less reactive.',
    typicalSideEffects: ['Can surface stored emotion', 'Perfectionism around form/discipline'],
    recommendedComplements: ['meditation', 'shadow-work', 'sleep-hygiene'],
    effects: {
      I: {
        shortTerm: 2,
        longTerm: 4,
        summary: 'Improves affect tolerance; stabilizes attention through embodiment.',
      },
      WE: {
        shortTerm: 1,
        longTerm: 3,
        summary: 'More regulated nervous system improves co-regulation and attunement.',
      },
      IT: {
        shortTerm: 4,
        longTerm: 5,
        summary: 'Mobility + breath + parasympathetic tone; strong foundational capacity.',
      },
      ITS: {
        shortTerm: 0,
        longTerm: 2,
        summary: 'Fewer stress-driven failures in routines and roles.',
      },
    },
    propagation: [
      { from: 'IT', to: 'I', strength: 2, note: 'Embodiment reduces dissociation; increases emotional granularity.' },
      { from: 'IT', to: 'WE', strength: 2, note: 'Regulation improves repair and co-regulation.' },
      { from: 'WE', to: 'ITS', strength: 1, note: 'Better co-regulation supports healthier group norms.' },
    ],
  },
  {
    id: 'strength-training',
    name: 'Strength Training',
    tags: ['Body'],
    primaryQuadrant: 'IT',
    description:
      'Builds physical capacity and confidence through progressive overload. A reliable “keystone” habit that upgrades energy, posture, and agency.',
    typicalSideEffects: ['Ego fixation or comparison', 'Overtraining without recovery'],
    recommendedComplements: ['sleep-hygiene', 'meditation', 'community-organizing'],
    effects: {
      I: { shortTerm: 1, longTerm: 3, summary: 'Improves mood, confidence, and stress resilience.' },
      WE: { shortTerm: 1, longTerm: 2, summary: 'More energy and self-respect can improve boundaries.' },
      IT: { shortTerm: 4, longTerm: 5, summary: 'Strength, metabolism, posture, injury resistance, consistency.' },
      ITS: { shortTerm: 1, longTerm: 2, summary: 'Higher capacity improves role reliability and system participation.' },
    },
    propagation: [
      { from: 'IT', to: 'I', strength: 2, note: 'Physiology influences mood and meaning-making.' },
      { from: 'IT', to: 'WE', strength: 1, note: 'Energy upgrades improve patience and boundaries.' },
      { from: 'IT', to: 'ITS', strength: 1, note: 'Capacity increases reliability across commitments.' },
    ],
  },
  {
    id: 'sleep-hygiene',
    name: 'Sleep Hygiene (Rhythm & Recovery)',
    tags: ['Body'],
    primaryQuadrant: 'IT',
    description:
      'Protects circadian rhythm and recovery. Often the hidden bottleneck: sleep upgrades amplify almost every other practice and reduces cost of self-regulation.',
    typicalSideEffects: ['Lifestyle friction (social schedule changes)', 'Over-control / anxiety about sleep'],
    recommendedComplements: ['strength-training', 'meditation', 'somatic-awareness'],
    effects: {
      I: { shortTerm: 2, longTerm: 3, summary: 'Improves mood stability and cognitive clarity.' },
      WE: { shortTerm: 1, longTerm: 2, summary: 'Less irritability and better empathy bandwidth.' },
      IT: { shortTerm: 3, longTerm: 5, summary: 'Recovery, immune function, energy, metabolic regulation.' },
      ITS: { shortTerm: 0, longTerm: 2, summary: 'Better reliability and decision-making in complex systems.' },
    },
    propagation: [
      { from: 'IT', to: 'I', strength: 2, note: 'Sleep supports metacognition and emotion regulation.' },
      { from: 'IT', to: 'WE', strength: 1, note: 'More patience and repair capacity when rested.' },
    ],
  },
  {
    id: 'authentic-relating',
    name: 'Authentic Relating',
    tags: ['Relational', 'Shadow'],
    primaryQuadrant: 'WE',
    description:
      'Structured practices for contact, truth, and repair. Trains relational sensitivity and cultural norms that make honesty safe and generative.',
    typicalSideEffects: ['Rawness during early truth-telling', 'Oversharing without consent'],
    recommendedComplements: ['shadow-work', 'meditation', 'study-circle'],
    effects: {
      I: { shortTerm: 1, longTerm: 4, summary: 'Improves self-awareness via interpersonal mirrors.' },
      WE: { shortTerm: 4, longTerm: 5, summary: 'Trust, intimacy, culture of repair, shared meaning.' },
      IT: { shortTerm: 1, longTerm: 2, summary: 'More consistent behaviors through accountability.' },
      ITS: { shortTerm: 1, longTerm: 3, summary: 'Relational skill supports teams and institutions.' },
    },
    propagation: [
      { from: 'WE', to: 'I', strength: 2, note: 'Relational mirrors accelerate self-knowledge.' },
      { from: 'WE', to: 'ITS', strength: 2, note: 'Norms of repair scale into teams and governance.' },
      { from: 'I', to: 'IT', strength: 1, note: 'Clearer self-contact improves follow-through.' },
    ],
  },
  {
    id: 'study-circle',
    name: 'Sensemaking Study Circle',
    tags: ['Mind', 'Relational'],
    primaryQuadrant: 'WE',
    description:
      'A recurring group for shared inquiry (books, frameworks, peer-coaching). Upgrades cultural meaning-making and stabilizes learning through social reinforcement.',
    typicalSideEffects: ['Consensus drift', 'Intellectualization without enactment'],
    recommendedComplements: ['community-organizing', 'strength-training', 'meditation'],
    effects: {
      I: { shortTerm: 1, longTerm: 3, summary: 'Better models, language, and reflective capacity.' },
      WE: { shortTerm: 3, longTerm: 5, summary: 'Shared meaning, trust, and culture of learning.' },
      IT: { shortTerm: 0, longTerm: 2, summary: 'Behavior change via accountability and commitments.' },
      ITS: { shortTerm: 1, longTerm: 3, summary: 'Collective sensemaking improves system navigation.' },
    },
    propagation: [
      { from: 'WE', to: 'I', strength: 2, note: 'Shared language increases internal coherence.' },
      { from: 'WE', to: 'ITS', strength: 2, note: 'Collective learning improves institutional strategy.' },
      { from: 'ITS', to: 'IT', strength: 1, note: 'Better systems knowledge produces better habits and routines.' },
    ],
  },
  {
    id: 'community-organizing',
    name: 'Community Organizing',
    tags: ['Systems', 'Relational'],
    primaryQuadrant: 'ITS',
    description:
      'Builds durable change by shaping structures, incentives, and coalitions. The fastest way to discover whether your inner work can survive real-world complexity.',
    typicalSideEffects: ['Burnout without boundaries', 'Cynicism from slow change'],
    recommendedComplements: ['sleep-hygiene', 'authentic-relating', 'meditation'],
    effects: {
      I: { shortTerm: 1, longTerm: 2, summary: 'Purpose and meaning; tests ego structure under pressure.' },
      WE: { shortTerm: 2, longTerm: 4, summary: 'Coalitions, belonging, trust-building, conflict navigation.' },
      IT: { shortTerm: 1, longTerm: 2, summary: 'Skill development: communication, logistics, stamina.' },
      ITS: { shortTerm: 3, longTerm: 5, summary: 'Institutional change, policy impact, ecological/systemic outcomes.' },
    },
    propagation: [
      { from: 'ITS', to: 'WE', strength: 2, note: 'Structures shape culture; roles and incentives set norms.' },
      { from: 'WE', to: 'I', strength: 1, note: 'Belonging stabilizes identity and resilience.' },
      { from: 'ITS', to: 'IT', strength: 1, note: 'Systems demands train skills and routines.' },
    ],
  },
];

export const practiceEcologyRecipes: PracticeEcologyRecipe[] = [
  {
    id: 'nervous-system-reset',
    name: 'Nervous System Reset',
    intention: 'Reduce stress load and rebuild baseline capacity.',
    description:
      'A recovery-first stack that makes other growth work cheaper by improving regulation, sleep, and energy.',
    practiceIds: ['sleep-hygiene', 'somatic-awareness', 'meditation'],
  },
  {
    id: 'depth-relational-repair',
    name: 'Depth & Relational Repair',
    intention: 'Turn conflict into contact and restore trust.',
    description:
      'Shadow integration plus relational practice to reduce projection and increase repair skills.',
    practiceIds: ['shadow-work', 'authentic-relating', 'meditation'],
  },
  {
    id: 'civic-bridgebuilder',
    name: 'Civic Bridgebuilder',
    intention: 'Build WE + ITS capacity without losing the inner thread.',
    description:
      'A stack for people doing systems work who want coherence, trust, and sustainable energy.',
    practiceIds: ['study-circle', 'community-organizing', 'authentic-relating', 'sleep-hygiene'],
  },
  {
    id: 'embodied-agency',
    name: 'Embodied Agency',
    intention: 'Build IT foundation that supports I/WE/ITS expression.',
    description:
      'A simple but potent “strength + regulation” bundle that increases agency and reliability across life domains.',
    practiceIds: ['strength-training', 'sleep-hygiene', 'somatic-awareness'],
  },
];
