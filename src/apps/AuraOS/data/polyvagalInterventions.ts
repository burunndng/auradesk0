// data/polyvagalInterventions.ts

export type NervousSystemState = 'ventral' | 'sympathetic' | 'dorsal';

export interface PolyvagalIntervention {
  id: string;
  name: string;
  duration: string; // e.g. "2-3 min"
  description: string;
  steps: string[];
  somatic_cue: string; // sensory anchor phrase
}

// Dorsal shutdown → must mobilize first
export const DORSAL_INTERVENTIONS: PolyvagalIntervention[] = [
  {
    id: 'orienting',
    name: 'Slow Orienting',
    duration: '2-3 min',
    description: 'Gentle sensory reconnection to the present environment',
    steps: [
      'Let your eyes travel slowly around the room — no goal, just noticing',
      'Name 3 objects you can see without judgment',
      'Feel the weight of your body on the surface beneath you',
      'Notice if any part of your body has even a small impulse to move',
    ],
    somatic_cue: 'I notice something',
  },
  {
    id: 'gentle-rocking',
    name: 'Gentle Rocking',
    duration: '1-2 min',
    description: 'Rhythmic movement to re-engage the social nervous system',
    steps: [
      'Sit or lie comfortably',
      'Begin a very small, slow rocking motion — front/back or side to side',
      'Let the rhythm be self-generated, not forced',
      'Notice any shift in sensation, breath, or aliveness',
    ],
    somatic_cue: 'I can move',
  },
  {
    id: 'somatic-scrub',
    name: 'Somatic Scrub',
    duration: '2-3 min',
    description: 'Brisk rubbing of arms and legs to bring energy to the physical boundary',
    steps: [
      'Rub your palms together briskly until they feel warm',
      'Firmly rub down your arms, from shoulder to fingertips',
      'Firmly rub down your legs, from hips to feet',
      'Notice the tingling or aliveness at the surface of your skin',
    ],
    somatic_cue: 'I can feel my edges',
  },
  {
    id: 'isometric-push',
    name: 'Wall Push',
    duration: '1-2 min',
    description: 'Isometric muscle engagement to spark sympathetic energy',
    steps: [
      'Stand facing a wall, about arm\'s length away',
      'Place both palms flat against the wall',
      'Push into the wall firmly, feeling the muscles in your arms and core engage',
      'Notice the strength and solidity in your body',
    ],
    somatic_cue: 'I have strength',
  },
  {
    id: 'deep-pressure',
    name: 'Deep Pressure / Self-Hug',
    duration: '1-3 min',
    description: 'Proprioceptive feedback to signal safety to the body',
    steps: [
      'Place your right hand briefly under your left armpit, and your left hand on your right bicep',
      'Squeeze firmly, giving yourself a containing hug',
      'Notice the pressure holding your body together',
      'Take a slow breath, letting the containment support you',
    ],
    somatic_cue: 'I am held',
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    duration: '4 min',
    description: 'Structured breath ratio that activates the parasympathetic nervous system without requiring mobilization',
    steps: [
      'Sit upright or lie down comfortably',
      'Exhale completely through your mouth with a whoosh sound',
      'Close your mouth and inhale quietly through your nose for a count of 4',
      'Hold your breath for a count of 7',
      'Exhale completely through your mouth with a whoosh sound for a count of 8',
      'Repeat 3-4 cycles. Each exhale is an invitation for your body to settle.',
    ],
    somatic_cue: 'My body knows how to rest',
  },
  {
    id: 'butterfly-hug',
    name: 'Butterfly Hug',
    duration: '5 min',
    description: 'EMDR-derived bilateral stimulation that provides gentle self-containment for freeze states',
    steps: [
      'Cross your arms over your chest, hands resting near your collarbones or shoulders',
      'Begin alternating gentle taps — left hand, right hand, left hand, right hand',
      'Keep the rhythm slow and even, like a slow heartbeat',
      'Notice any sensations, images, or feelings that arise without holding on to them',
      'Continue for 1-2 minutes, then pause and notice the shift in your body',
    ],
    somatic_cue: 'I can hold myself',
  },
  {
    id: '5-4-3-2-1-grounding',
    name: '5-4-3-2-1 Sensory Grounding',
    duration: '5 min',
    description: 'Orienting to present-moment sensory data to counter dissociation and freeze',
    steps: [
      'Name 5 things you can see right now — be specific (color, shape, texture)',
      'Name 4 things you can hear — near and far',
      'Name 3 things you can physically feel (fabric on skin, feet on floor, air temperature)',
      'Name 2 things you can smell, or recall a favorite scent',
      'Name 1 thing you can taste, or notice the moisture in your mouth',
      'Take one slow breath and notice: you are here, now, present.',
    ],
    somatic_cue: 'I am here, right now',
  },
];

// Sympathetic activation → discharge before ventral
export const SYMPATHETIC_INTERVENTIONS: PolyvagalIntervention[] = [
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    duration: '1 min',
    description: 'Double inhale + long exhale — fastest known way to downregulate the nervous system',
    steps: [
      'Take a full inhale through the nose',
      'At the top, take a second short inhale to fully inflate the lungs',
      'Release in a long, slow exhale through the mouth',
      'Repeat 1-3 times. Notice the shift.',
    ],
    somatic_cue: 'I can slow down',
  },
  {
    id: 'voo-sound',
    name: 'Voo Vocalization',
    duration: '2-3 min',
    description: 'Low-frequency vocalization activates the vagal brake directly',
    steps: [
      'Take a comfortable breath in',
      'On the exhale, make a low "Vooooo" sound from your belly',
      'Feel the vibration in your chest and throat',
      'Let the sound end naturally when breath is gone. Pause. Repeat.',
    ],
    somatic_cue: 'I can sound',
  },
  {
    id: 'shake-discharge',
    name: 'Tremor Discharge',
    duration: '2-3 min',
    description: 'Allow the body\'s natural discharge mechanism to release stored activation',
    steps: [
      'Stand or sit with feet grounded',
      'Allow your legs or arms to begin a gentle, natural shake',
      'This is not performance — allow whatever arises without forcing',
      'Continue for 1-2 minutes, then pause and notice',
    ],
    somatic_cue: 'I can release',
  },
  {
    id: 'valsalva-maneuver',
    name: 'Hand Over Heart',
    duration: '1-2 min',
    description: 'Gentle somatic containment through pressure and breath',
    steps: [
      'Place one hand firmly over your heart, and the other on your belly',
      'Take a steady breath in',
      'Gently hold the breath for a few seconds, feeling the containment',
      'Release with a slow, audible sigh and notice the shift in your heart rate',
    ],
    somatic_cue: 'I can contain this',
  },
  {
    id: 'structured-release',
    name: 'Structured Stomping',
    duration: '1-2 min',
    description: 'Directing excess mobilized energy downward into the earth',
    steps: [
      'Stand up and feel your feet on the floor',
      'Begin to intentionally step or gently stomp your feet, right then left',
      'Let the energy move down through your legs and out into the ground',
      'Gradually slow the pace until you come to a standstill. Notice the settling.',
    ],
    somatic_cue: 'I can ground this energy',
  },
  {
    id: 'cold-exposure',
    name: 'Cold Reset',
    duration: '1 min',
    description: 'Triggering the mammalian dive reflex to quickly lower heart rate',
    steps: [
      'Go to a sink or get a glass of very cold water',
      'Splash the cold water directly onto your face, especially around the eyes/cheeks',
      'Alternatively, hold a cold object (like an ice cube or cold pack) to your wrists',
      'Notice the sharp sensory shift bringing you into the present',
    ],
    somatic_cue: 'I am right here',
  },
  {
    id: 'cyclic-sighing',
    name: 'Cyclic Sighing',
    duration: '5 min',
    description: 'Double inhale followed by extended exhale — Stanford 2023 research: most effective single-breath technique for rapid SNS downregulation',
    steps: [
      'Inhale through your nose until your lungs feel about 80% full',
      'Take a second, shorter "top-up" inhale through the nose to fully expand the lungs',
      'Open your mouth and release a long, slow, complete exhale — twice as long as your inhale',
      'Pause naturally at the bottom of the breath before the next inhale',
      'Repeat for 5 minutes. The relief comes from the extended exhale activating the vagal brake.',
    ],
    somatic_cue: 'The exhale is the landing',
  },
  {
    id: 'jaw-shoulder-release',
    name: 'Jaw & Shoulder Release',
    duration: '4 min',
    description: 'Sequential release of fight-flight muscle bracing patterns held in the jaw and shoulders',
    steps: [
      'Notice where your jaw is right now — is it clenched, tight, or held?',
      'Let your mouth drop open slightly. Let the lower jaw hang heavy.',
      'Slowly move your jaw side to side 3-4 times, very gently',
      'Now roll your shoulders up toward your ears — hold for 3 seconds',
      'Drop them down with a deliberate exhale. Repeat 3 times.',
      'Notice the difference in your neck, face, and breath.',
    ],
    somatic_cue: 'I can put down what I\'m holding',
  },
  {
    id: 'cold-water-dive',
    name: 'Cold Water Dive Reflex',
    duration: '2 min',
    description: 'Cold water on the face triggers the mammalian dive reflex — a rapid, hard-wired vagal brake response',
    steps: [
      'Fill a bowl or sink with cold water, or turn the tap to cold',
      'Take a breath and hold it',
      'Submerge your face (or splash generously around eyes and cheeks)',
      'Hold for 15-30 seconds if possible, or repeatedly splash',
      'Alternatively, press an ice pack or cold pack firmly to your forehead and cheeks',
      'Notice the immediate shift in heart rate and nervous system tone',
    ],
    somatic_cue: 'Cold brings me back',
  },
];

// Ventral anchors — for maintenance and handoff
export const VENTRAL_ANCHORS: PolyvagalIntervention[] = [
  {
    id: 'safe-place',
    name: 'Safe Place Anchor',
    duration: '2-3 min',
    description: 'Establish a somatic reference point for ventral safety',
    steps: [
      'Recall a moment — real or imagined — when you felt genuinely safe and at ease',
      'Notice what sensations arise in your body as you hold this memory',
      'Let the sensation deepen without trying to explain it',
      'Name the felt sense (e.g., "warmth in my chest", "lightness in my shoulders")',
      'This is your ventral anchor. You can return here anytime.',
    ],
    somatic_cue: 'I can rest here',
  },
  {
    id: 'tonal-humming',
    name: 'Tonal Humming',
    duration: '2-3 min',
    description: 'Engaging the ventral vagal system through the vocal cords',
    steps: [
      'Take a comfortable breath in',
      'On the exhale, make a gentle, closed-mouth humming sound (like a bumblebee)',
      'Feel the vibration in your lips and face',
      'Repeat gently. Notice the soothing rhythm.',
    ],
    somatic_cue: 'I can resonate',
  },
  {
    id: 'coherence-breathing',
    name: 'Aided Coherence Breathing',
    duration: '3 min',
    description: 'Balancing the nervous system with even, rhythmic breath',
    steps: [
      'Breathe in smoothly for a count of 5',
      'Breathe out smoothly for a count of 5',
      'Keep the breath continuous, like a wheel turning without stopping',
      'Notice the smooth, balanced flow of energy',
    ],
    somatic_cue: 'I am balanced',
  },
  {
    id: 'heart-coherence',
    name: 'Heart Coherence Breathing',
    duration: '6 min',
    description: 'HeartMath resonance frequency breathing — 5.5-second rhythm maximizes HRV coherence',
    steps: [
      'Place one or both hands gently over your heart',
      'Breathe in through your nose for a count of 5.5 seconds',
      'Breathe out through your nose for a count of 5.5 seconds',
      'Imagine your breath moving in and out through the heart center',
      'With each cycle, allow a feeling of appreciation or ease to arise — even subtle is enough',
      'Continue for 5-6 minutes. The rhythm itself is the medicine.',
    ],
    somatic_cue: 'My heart sets the pace',
  },
  {
    id: 'loving-kindness-anchor',
    name: 'Loving-Kindness Somatic Anchor',
    duration: '5 min',
    description: 'Metta phrases paired with hand-on-heart somatic anchoring to amplify ventral state',
    steps: [
      'Place both hands over your heart and take three slow breaths',
      'Silently repeat: "May I be safe." Feel the words in your chest.',
      'Silently repeat: "May I be at ease." Let the phrase land in the body.',
      'Silently repeat: "May I be at peace." Notice any warmth or openness.',
      'Allow the phrases to slow down — you\'re not reciting, you\'re receiving',
      'Rest in the felt sense of self-compassion for as long as feels nourishing',
    ],
    somatic_cue: 'I offer myself kindness',
  },
  {
    id: 'safe-resource-memory',
    name: 'Safe Resource Memory',
    duration: '5 min',
    description: 'Locating and amplifying a genuine felt sense of safety from lived experience',
    steps: [
      'Bring to mind a specific memory of feeling genuinely safe, connected, or at peace',
      'It can be simple — a quiet morning, a loved one\'s presence, a place in nature',
      'Notice where you feel this in your body. Put words to it: warmth? openness? steadiness?',
      'Let the felt sense grow by staying with it rather than analyzing it',
      'Gently anchor it with a touch — hand on heart, or hand on knee',
      'This is a resource you carry with you. Return here whenever needed.',
    ],
    somatic_cue: 'I have known safety',
  },
];

export const INTERVENTIONS_BY_STATE: Record<NervousSystemState, PolyvagalIntervention[]> = {
  dorsal: DORSAL_INTERVENTIONS,
  sympathetic: SYMPATHETIC_INTERVENTIONS,
  ventral: VENTRAL_ANCHORS,
};

// State-specific somatic marker language (Deb Dana's "I can / I must / I can't" framework)
export const STATE_MARKERS = {
  ventral: {
    label: 'Ventral Vagal — Safe & Social',
    color: 'cyan',
    somatic: 'I can connect, rest, think clearly',
    body_cues: ['Relaxed face', 'Even breath', 'Warm hands', 'Open posture'],
    cognitive_note: 'Full access to prefrontal cortex. Optimal for inner work.',
  },
  sympathetic: {
    label: 'Sympathetic — Mobilized',
    color: 'amber',
    somatic: 'I must act, fight, or flee',
    body_cues: ['Tight chest', 'Racing heart', 'Clenched jaw', 'Restlessness'],
    cognitive_note: 'Partial prefrontal access. Proceed gently — not optimal for shadow work.',
  },
  dorsal: {
    label: 'Dorsal Vagal — Shutdown',
    color: 'indigo',
    somatic: 'I can\'t — collapse, freeze, fog',
    body_cues: ['Heaviness', 'Numbness', 'Flatness', 'Dissociation', 'No energy'],
    cognitive_note: 'Prefrontal offline. Do NOT proceed to cognitive work. Mobilize first.',
  },
};
