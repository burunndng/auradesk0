export interface HealingAudio {
  id: string;
  title: string;
  description: string;
  url: string;
  duration?: string;
  category: 'grounding' | 'breathing' | 'hypnosis' | 'nervous-system' | 'meditation-practice';
  symbol: string; // Occult/alchemical symbol
  goal?: string;
  mechanism?: string;
}

export const healingAudios: HealingAudio[] = [
  {
    id: 'pendulation',
    title: 'Pendulation: Building Nervous System Resilience',
    description: 'A guided practice to develop nervous system resilience through gentle pendulation between sensations.',
    url: 'https://files.catbox.moe/hl3vo9.mp3',
    category: 'nervous-system',
    symbol: '🝅', // Alchemical symbol - essence/vibration
  },
  {
    id: 'grounding-5-4-3-2-1',
    title: 'Grounding: 5-4-3-2-1',
    description: 'A sensory grounding technique using the 5-4-3-2-1 method to anchor yourself in the present moment.',
    url: 'https://files.catbox.moe/f52h34.mp3',
    category: 'grounding',
    symbol: '🜉', // Alchemical earth symbol
  },
  {
    id: 'coherent-breathing',
    title: 'Coherent Breathing',
    description: 'A rhythmic breathing practice to synchronize your breath and cultivate coherence within body and mind.',
    url: 'https://files.catbox.moe/shtgh3.mp3',
    category: 'breathing',
    symbol: '🜈', // Alchemical air/wind symbol
  },
  {
    id: 'physiological-sigh-breathing',
    title: 'Physiological Sigh and Grounded Breathing',
    description: 'A guided practice combining the physiological sigh technique with grounding breathing to rapidly reduce stress and restore calm to your nervous system.',
    url: 'https://files.catbox.moe/70d2oo.mp3',
    category: 'breathing',
    symbol: '🜨', // Alchemical breath/spirit symbol
    goal: 'Rapidly reduce stress and restore nervous system calm',
    mechanism: '(B) Physiological Sigh - Evidence-based stress relief',
  },
  {
    id: 'self-hypnosis-esteem',
    title: 'Self-hypnosis: Self-Esteem & Natural Confidence',
    description: 'A hypnotic journey to strengthen your sense of worth and activate natural confidence from within.',
    url: 'https://files.catbox.moe/0x0nhh.mp3',
    category: 'hypnosis',
    symbol: '🝦', // Alchemical transformation symbol
  },
  {
    id: 'self-hypnosis-home',
    title: 'Self-hypnosis: Coming Home to Yourself',
    description: 'A guided hypnotic practice to reconnect with yourself and your sense of safety.',
    url: 'https://files.catbox.moe/zkplz4.mp3',
    category: 'hypnosis',
    symbol: '🜌', // Alchemical integration/center symbol
  },
  {
    id: 'untangled-mind',
    title: 'The Untangled Mind',
    description: 'Create distance from anxious thoughts via cognitive defusion using ACT-based techniques to observe thoughts without being entangled by them.',
    url: 'https://files.catbox.moe/oszgba.mp3',
    category: 'nervous-system',
    symbol: '🝪', // Alchemical separation/distillation symbol
    goal: 'Create distance from anxious thoughts via cognitive defusion',
    mechanism: '(C) Cognitive Reframing (ACT-based defusion)',
  },
  {
    id: 'vast-perspective',
    title: 'The Vast Perspective (Awe Induction)',
    description: 'A guided practice to experience awe and expand your perspective.',
    url: 'https://files.catbox.moe/ym0w5v.mp3',
    category: 'hypnosis',
    symbol: '🝮', // Alchemical expansion/infinity symbol
  },
  {
    id: 'effortless-drift',
    title: 'The Effortless Drift (Sleep Insomnia)',
    description: 'A gentle guided practice to release the struggle with sleep and allow yourself to drift naturally into restful slumber.',
    url: 'https://files.catbox.moe/xalace.mp3',
    category: 'hypnosis',
    symbol: '🜍', // Alchemical dissolution/sleep symbol
  },
  {
    id: 'skillful-wait',
    title: 'The Skillful Wait (Urge Surfing)',
    description: 'Master the art of urge surfing by learning to skillfully wait and ride the waves of intense sensations without acting on them.',
    url: 'https://files.catbox.moe/y3aoyc.mp3',
    category: 'nervous-system',
    symbol: '🝖', // Alchemical patience/time symbol
  },
  {
    id: 'emotional-update',
    title: 'The Emotional Update (Memory Reconsolidation)',
    description: 'A guided hypnotic practice to update emotional memories and shift your perspective on past experiences.',
    url: 'https://files.catbox.moe/xmh45t.mp3',
    category: 'hypnosis',
    symbol: '🝥', // Alchemical transformation/emotion symbol
    goal: 'Update emotional memories and rewrite past narratives',
    mechanism: '(N) Memory Reconsolidation',
  },
  {
    id: 'if-then-path',
    title: 'The If-Then Path (Cognitive Reframing)',
    description: 'Rewire your thinking patterns through guided cognitive reframing to shift perspective and transform limiting beliefs.',
    url: 'https://files.catbox.moe/eky8um.mp3',
    category: 'hypnosis',
    symbol: '🜅', // Alchemical mind/thought symbol
    goal: 'Shift perspective and transform limiting beliefs',
    mechanism: '(C) Cognitive Reframing',
  },
  {
    id: 'inner-ally',
    title: 'The Inner Ally (Self-Compassion for Stress)',
    description: 'Develop self-compassion and resilience for navigating stress with kindness.',
    url: 'https://files.catbox.moe/vcycla.mp3',
    category: 'hypnosis',
    symbol: '🜊', // Alchemical inner protection/compassion symbol
    goal: 'Cultivate self-compassion and resilience during stress',
    mechanism: '(C) Self-Compassion & Acceptance',
  },
  {
    id: 'vipassana-guided',
    title: 'Vipassana: Guided Insight Meditation',
    description: 'A comprehensive guided practice in Vipassana meditation, developing insight into the nature of reality through systematic body scanning and mindful observation of sensations and mental phenomena.',
    url: 'https://files.catbox.moe/9ubobv.m4a',
    category: 'meditation-practice',
    symbol: '🝐', // Alchemical insight/consciousness symbol
    goal: 'Develop insight and equanimity through direct observation',
    mechanism: '(M) Vipassana - Insight Meditation',
  },
  {
    id: 'metta-guided',
    title: 'Metta: Guided Loving-Kindness Meditation',
    description: 'A complete guided practice in Metta meditation, cultivating unconditional goodwill and compassion toward yourself and all sentient beings through systematic loving-kindness phrases.',
    url: 'https://files.catbox.moe/ryh654.m4a',
    category: 'meditation-practice',
    symbol: '🝥', // Alchemical heart/compassion symbol
    goal: 'Cultivate loving-kindness and compassion for all beings',
    mechanism: '(M) Metta - Loving-Kindness Meditation',
  },
  {
    id: 'identity-architect',
    title: 'The Identity Architect – Habit Installation & Future Self Integration',
    description: 'A transformative hypnotic journey to architect your identity, install empowering habits, and integrate with your optimal future self.',
    url: 'https://files.catbox.moe/2anfxq.mp3',
    category: 'hypnosis',
    symbol: '🝳', // Alchemical identity/architecture symbol
    goal: 'Install empowering habits and integrate with future self',
    mechanism: '(N) Identity Architecture & Self-Integration',
  },
];

export const audioCategories = {
  'grounding': 'Grounding Practices',
  'breathing': 'Breathing Techniques',
  'hypnosis': 'Self-Hypnosis Journeys',
  'nervous-system': 'Nervous System Practices',
  'meditation-practice': 'Guided Meditation Practices',
};
