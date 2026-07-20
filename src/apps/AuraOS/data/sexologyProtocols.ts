/**
 * Scarlett Vex — Clinical Protocols
 *
 * 8 structured practice protocols Scarlett can walk users through.
 * Medium depth: enough to actually do the practice, not so rigid it loses Scarlett's voice.
 */

export type ProtocolStepType = 'instruction' | 'breathe' | 'notice' | 'reflect' | 'write' | 'action';

export interface ProtocolStep {
  instruction: string;
  prompt?: string;       // optional reflection prompt for user to respond to
  duration?: string;     // e.g. "1–2 min"
  type: ProtocolStepType;
}

export interface SexologyProtocol {
  id: string;
  name: string;
  tagline: string;        // Scarlett's clinical one-liner
  forWhen: string;        // use-case description shown to user
  duration: string;       // total estimated time
  steps: ProtocolStep[];
  debriefPrompt: string;  // what Scarlett asks in chat after protocol ends
}

export const SEXOLOGY_PROTOCOLS: SexologyProtocol[] = [
  {
    id: 'dopamine-reset',
    name: 'Dopamine Reset',
    tagline: 'Recalibrate the arousal threshold.',
    forWhen: 'When real intimacy feels flat, or arousal only works through screens.',
    duration: '7–10 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Find a private, comfortable position. Close any tabs, silence your phone. For this session: no porn, no fantasy, no deliberate arousal.',
      },
      {
        type: 'breathe',
        instruction: 'Slow your breathing. 4 counts in, hold 2, 6 counts out. Do this 5 times.',
        duration: '2 min',
      },
      {
        type: 'notice',
        instruction: 'Without touching yourself sexually, notice your body\'s baseline state. Temperature. Tension. Where you hold tightness.',
        duration: '2 min',
      },
      {
        type: 'reflect',
        instruction: 'Think of something genuinely pleasurable but non-sexual — a meal, sunlight, a texture. Let yourself feel that without pushing it toward arousal.',
        prompt: 'What came up? Did your mind try to sexualize it immediately?',
        duration: '2 min',
      },
      {
        type: 'reflect',
        instruction: 'Now consider: how long since you felt aroused by something real — a person, a memory, an actual moment — rather than media?',
        prompt: 'Be honest with yourself. Days? Weeks? Longer?',
      },
      {
        type: 'action',
        instruction: 'Commit to one concrete change for the next 72 hours. Not abstinence necessarily — but a deliberate pause or limit.',
        prompt: 'What\'s the one thing you\'ll adjust?',
      },
    ],
    debriefPrompt: 'How did that land? What was uncomfortable about it — and what surprised you?',
  },

  {
    id: 'desire-mapping',
    name: 'Desire Mapping',
    tagline: 'Find what you actually want under what you think you should want.',
    forWhen: 'When your desires feel confusing, shameful, or unclear.',
    duration: '10–15 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Get somewhere private and comfortable. Nothing you write here is judged — this is a diagnostic, not a confession.',
      },
      {
        type: 'breathe',
        instruction: 'Three slow breaths. Let your shoulders drop.',
        duration: '1 min',
      },
      {
        type: 'write',
        instruction: 'List 5 sexual scenarios — real, fantasy, vague, specific, embarrassing, tame. Don\'t filter. Stream of consciousness.',
        prompt: 'Write them out. They don\'t have to make sense.',
        duration: '3 min',
      },
      {
        type: 'reflect',
        instruction: 'Look at your list. For each scenario, ask: do I actually want this, or do I think I should want it? Mark which is which.',
        prompt: 'Any surprises? Anything that felt more "performed" than real?',
      },
      {
        type: 'reflect',
        instruction: 'Pick one desire that carries some shame or confusion. Sit with it without acting on it or pushing it away.',
        prompt: 'Where does the shame come from — a specific message, a person, a rule you absorbed?',
        duration: '2–3 min',
      },
      {
        type: 'reflect',
        instruction: 'If shame weren\'t a factor, what would you actually pursue or explore?',
        prompt: 'Write one honest sentence.',
      },
    ],
    debriefPrompt: 'What emerged that you weren\'t expecting? And what are you still not saying?',
  },

  {
    id: 'somatic-scan',
    name: 'Somatic Scan',
    tagline: 'Map where your body is alive and where it isn\'t.',
    forWhen: 'When sex feels numb, disconnected, or like watching yourself from outside.',
    duration: '8–12 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Lie down or sit with your back supported. This is a body-listening practice, not arousal. Let go of any goal.',
      },
      {
        type: 'breathe',
        instruction: 'Breathe slowly into your belly — not your chest. Feel your abdomen rise and fall. Stay here for 2 minutes.',
        duration: '2 min',
      },
      {
        type: 'notice',
        instruction: 'Starting at your feet — notice sensation. Not pleasure, just *sensation*. Tingling, temperature, pressure, nothing at all.',
        duration: '1 min',
      },
      {
        type: 'notice',
        instruction: 'Move attention slowly upward: calves, thighs, pelvis, belly, chest, arms, throat, face. Pause where you notice either intensity or numbness.',
        duration: '3 min',
        prompt: 'Where is there the most sensation? Where is there the least?',
      },
      {
        type: 'reflect',
        instruction: 'Place your hand on your chest. Notice if that contact changes anything — warmer, tighter, softer.',
        duration: '1 min',
        prompt: 'Does touch from yourself land differently than you expect?',
      },
      {
        type: 'reflect',
        instruction: 'Without judgment: where in your body do you feel most cut off from during sex?',
        prompt: 'Name the area and describe what "cut off" feels like there.',
      },
    ],
    debriefPrompt: 'What did the scan show you? And what does the numbness protect you from?',
  },

  {
    id: 'breath-orgasm-training',
    name: 'Breath-Orgasm Training',
    tagline: 'Use breath to release what tension is locking down.',
    forWhen: 'Difficulty climaxing, holding breath during sex, high arousal that goes nowhere.',
    duration: '10–15 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Find privacy. Comfortable position — lying down works best. This practice works whether or not you\'re aroused right now.',
      },
      {
        type: 'breathe',
        instruction: 'Normal breathing first. Notice: do you breathe through your mouth or nose? Shallow or deep? Fast or slow? Just observe.',
        duration: '1 min',
      },
      {
        type: 'breathe',
        instruction: 'Now breathe in through your nose, fill your belly first then chest. Out through a relaxed open mouth. Slow, continuous, no pause between inhale and exhale.',
        duration: '3 min',
        prompt: 'Notice what changes in your body as you maintain this pattern.',
      },
      {
        type: 'notice',
        instruction: 'On each exhale, consciously release your jaw, your throat, your pelvic floor. Don\'t tighten — let go.',
        duration: '3 min',
        prompt: 'Where do you instinctively hold against the release?',
      },
      {
        type: 'breathe',
        instruction: 'Increase the breath pace slightly — still connected, no pause. Notice if sensation moves or builds anywhere.',
        duration: '2 min',
      },
      {
        type: 'reflect',
        instruction: 'Return to normal breathing. Notice what changed — in tension, in sensation, in your relationship to your body right now.',
        prompt: 'What did the breath unlock? What did it show you about where you tighten?',
      },
    ],
    debriefPrompt: 'What did you notice about how you habitually breathe during arousal? What would you do differently?',
  },

  {
    id: 'erotic-inventory',
    name: 'Erotic Inventory',
    tagline: 'Know what you want before you communicate it.',
    forWhen: 'Fuzzy sense of your own desires, difficulty asking for what you want, unclear limits.',
    duration: '10–12 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Private, no interruptions. This is for you — not for a partner. Honesty only works if no one else is reading over your shoulder.',
      },
      {
        type: 'write',
        instruction: 'Three columns. Label them: YES (want this), NO (don\'t want this), MAYBE (curious but uncertain).',
        prompt: 'You\'re going to sort experiences, acts, dynamics, and contexts into these columns. Ready?',
      },
      {
        type: 'write',
        instruction: 'Go through these categories and sort what comes to mind: physical acts, emotional dynamics (dominance, nurturing, vulnerability), settings/contexts, role play or power dynamics, touch types, presence of words/sounds.',
        prompt: 'Don\'t overthink. First response is the real one.',
        duration: '4 min',
      },
      {
        type: 'reflect',
        instruction: 'Look at your MAYBE column. Pick one. Ask: what would make it a YES? What would make it a NO?',
        prompt: 'Is the uncertainty about the act itself, or about safety, or about who you\'d do it with?',
      },
      {
        type: 'reflect',
        instruction: 'Look at your NO column. Is there anything that started as a NO but shifted? Anything you marked NO because you think you *should*, not because you actually feel it?',
        prompt: 'No pressure to change anything — just notice.',
      },
      {
        type: 'write',
        instruction: 'Write one thing you want that you\'ve never asked for. One line. Don\'t justify it.',
      },
    ],
    debriefPrompt: 'What was hardest to sort? And what did the MAYBE column tell you about where your edges actually are?',
  },

  {
    id: 'sensate-focus',
    name: 'Sensate Focus',
    tagline: 'Sensation before performance. Touch before goal.',
    forWhen: 'Performance anxiety, being in your head during sex, difficulty being present in your body.',
    duration: '10–15 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'This is a solo version of Sensate Focus (Masters & Johnson). No goal. No orgasm required. No performance. Just touch as information.',
      },
      {
        type: 'breathe',
        instruction: 'Settle your nervous system first. Five slow breaths. With each exhale, consciously drop the expectation of this going anywhere.',
        duration: '2 min',
      },
      {
        type: 'notice',
        instruction: 'Touch your arm — slowly, with the back of your hand. Notice texture, temperature, pressure. You\'re a scientist observing sensation, not pursuing pleasure.',
        duration: '2 min',
        prompt: 'What do you actually feel? Be specific.',
      },
      {
        type: 'notice',
        instruction: 'Expand to other parts of your body — not genitals yet. Face, neck, chest, belly. Vary speed and pressure. Stay curious, not goal-directed.',
        duration: '3 min',
        prompt: 'Where does touch feel most alive? Where does your mind wander back to performance?',
      },
      {
        type: 'reflect',
        instruction: 'Notice the difference between touching yourself to feel vs. touching yourself to produce an outcome. Which mode takes over automatically?',
        prompt: 'When the "performance" mode kicks in, what specifically changes?',
      },
      {
        type: 'reflect',
        instruction: 'If you included genital touch, include it now with the same curiosity — not to climax, just to observe sensation.',
        duration: '2–3 min',
        prompt: 'What sensations are actually there when you\'re not trying to get somewhere?',
      },
    ],
    debriefPrompt: 'What was it like to touch without a goal? And when did your mind try to redirect it?',
  },

  {
    id: 'edge-mapping',
    name: 'Edge Mapping',
    tagline: 'Learn the arc of your arousal before you\'re in it.',
    forWhen: 'Coming too fast, difficulty with arousal control, not knowing where your edges are.',
    duration: '15–20 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'You\'re going to map your arousal like a landscape — without needing to cross any particular threshold. Private time, no interruptions.',
      },
      {
        type: 'instruction',
        instruction: 'We\'ll use a 1–10 scale. 1 = baseline, no arousal. 5 = clearly aroused, engaged, responsive. 8 = high intensity. 10 = point of no return.',
      },
      {
        type: 'breathe',
        instruction: 'Start at baseline. Slow breathing. Notice where you are right now — what number, honestly?',
        duration: '1 min',
        prompt: 'Current number?',
      },
      {
        type: 'notice',
        instruction: 'Begin self-stimulation slowly. Your goal is not orgasm — it\'s observation. Check in with your number every 30 seconds.',
        duration: '3–5 min',
        prompt: 'As arousal builds: what physical sensations mark each level? What changes in breathing, muscle tension, thought?',
      },
      {
        type: 'action',
        instruction: 'When you reach 6–7: stop all stimulation completely. Breathe. Let the arousal recede somewhat.',
        duration: '1–2 min',
        prompt: 'How quickly does it drop? What does the receding feel like?',
      },
      {
        type: 'action',
        instruction: 'Resume. Bring yourself back up. Stop again at 7–8. Repeat this cycle 2–3 times.',
        duration: '5–8 min',
        prompt: 'Where is your actual edge — the point where stopping becomes very difficult? Be specific.',
      },
      {
        type: 'reflect',
        instruction: 'Note the specific physical signals that appear just *before* you reach the edge — before it\'s too late.',
        prompt: 'What are your early warning signals? This is what you\'re learning to read.',
      },
    ],
    debriefPrompt: 'What did you learn about your edge that you didn\'t know going in? And what was the hardest part — the stopping, or the noticing?',
  },

  {
    id: 'fantasy-writing',
    name: 'Fantasy Writing',
    tagline: 'Write it before you shame it.',
    forWhen: 'Guilt about fantasies, taboo shame, difficulty allowing your imagination to be honest.',
    duration: '15–20 min',
    steps: [
      {
        type: 'instruction',
        instruction: 'Fantasy is not desire for the real thing. This is a diagnostic truth. Writing a fantasy doesn\'t mean you want it to happen. It means you\'re being honest with your own mind.',
      },
      {
        type: 'breathe',
        instruction: 'Three deep breaths. Permission granted: nothing you write here is wrong, perverted, or a verdict on your character.',
        duration: '1 min',
      },
      {
        type: 'write',
        instruction: 'Write a sexual fantasy — one you\'ve had but possibly never shared or fully allowed yourself. Don\'t sanitize it. Write it in present tense, first person.',
        prompt: 'Take 5–8 minutes. Don\'t stop to judge, just write.',
        duration: '5–8 min',
      },
      {
        type: 'reflect',
        instruction: 'Read it back. Notice your reaction to your own words. Shame? Surprise? Relief? Arousal? Boredom?',
        prompt: 'What emotion is strongest? Where does it sit in your body?',
      },
      {
        type: 'reflect',
        instruction: 'Ask: what need does this fantasy serve? Control, safety, surrender, being seen, being wanted, escaping, being someone else?',
        prompt: 'Name the underlying need — not the surface content.',
      },
      {
        type: 'reflect',
        instruction: 'Is the shame about the fantasy itself — or about what you think it says about you?',
        prompt: 'What would you think if someone else told you they had this exact fantasy?',
      },
    ],
    debriefPrompt: 'What did writing it actually change about how it feels? And what does the shame protect you from knowing?',
  },
];

export const getProtocolById = (id: string): SexologyProtocol | undefined =>
  SEXOLOGY_PROTOCOLS.find(p => p.id === id);
