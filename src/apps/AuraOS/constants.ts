
// FIX: Corrected import path for types
import { PracticesData, ModuleInfo, StarterStacksData, ModuleKey, SomaticPracticeType, PracticeTypeInfo, SomaticPreset, GroundingOption, ZoneDefinition } from './types.ts';

/**
 * WIZARD INSIGHT POLICY
 *
 * Controls which wizards are allowed to generate insights.
 * Prevents utility/non-interactive wizards from creating noise while
 * enabling rich analytical data from interactive wizards.
 */
export const WIZARD_INSIGHT_POLICY = {
  /**
   * Interactive Wizards: Users provide valuable analytical/reflective data
   * These generate high-quality insights for personal development
   */
  interactive: [
    '3-2-1 Reflection',
    'IFS Session',
    'Bias Detective',
    'Subject-Object Explorer',
    'Perspective-Shifter',
    'Polarity Mapper',
    'Kegan Assessment',
    'Big Mind Process',
    'Memory Reconsolidation',
    'Eight Zones',
    'Adaptive Cycle Mapper',
    'Somatic Practice',
    'Attachment Assessment',
    'Shadow Journaling',
    'Immunity to Change',
    'DBT Coach',
    'Schema Detective',
    'Bioenergetics',
    'Decision Wizard',
    'Relational Pattern',
    'Role Alignment',
    'Adaptive Cycle Lens',
    'Context AI Root Cause',
    'Bias Finder',
    'Tree of Life Coaching',
    'Advaita Master Coach',
    'Golden Shadow',
    'States Training',
    'Attachment Practice',
    'Contemplative Inquiry',
    'Moral Reasoning',
    'Interoception',
    'Ultimate Concern',
    'cbm-interpretation-lens',
    'Practice Designer',
    'Coherence Audit',
    'Relational Field Mapper',
    'Life Architecture Wizard',
    'Cultural Shadow Excavator',
    '4-Quadrant Catalyst',
    'Chronobiology Protocol',
    'Relational Blueprint',
    'Mourning Field',
    'Examining Core Belief',
    'Daily Integration Check-in',
    'Psychedelic Journey',
    'Polyvagal Trainer',
    'Reality Tunnel',
    'Defusion Lab',
    'AXIS',
    'Enneagram Compass',
    'Epistemic Crucible',
    'Generativity Map',
    'Tonglen',
    'Integral Civic Practice',
    'Phenomenon Mapper',
    'Structure of Feeling',
    'Return of Ritual',
    'Quantified Self',
    'Inner Compass',
    'Archetypal Contemplation',
    'Somatic Cartography',
  ] as const,

  /**
   * Assessment Wizards: Provide structured data
   * - Integral Body Plan: Assessment-based
   * - Workout Program: Fitness tracking
   */
  assessment: [
    'Integral Body Plan',
    'Workout Program',
  ] as const,

  /**
   * Utility Wizards: Non-analytical, no meaningful personal data
   * These do NOT generate insights - they're tools, not analysis
   */
  utility: [
    'Export Data',        // Data export tool
    'Forum Thread',       // Social sharing tool
    'Meditation Finder',  // Quick reference/recommender
    'Sexology Coach',     // Private sexual health coaching (no insights)
    'Jhana Guide',        // Visual tracker / notes — no pattern analysis
  ] as const,

  /**
   * Check if a wizard should generate an insight based on policy
   * @param wizardType The wizard type to check
   * @param context Optional context (e.g., 'practice-log' for Jhana Tracker)
   * @returns true if insight should be generated, false if should be skipped
   */
  shouldGenerateInsight: (wizardType: string, context?: string): boolean => {
    // Interactive wizards always generate insights
    if ((WIZARD_INSIGHT_POLICY.interactive as readonly string[]).includes(wizardType)) {
      return true;
    }

    // Assessment wizards generate insights
    if ((WIZARD_INSIGHT_POLICY.assessment as readonly string[]).includes(wizardType)) {
      return true;
    }

    // Utility wizards never generate insights
    if ((WIZARD_INSIGHT_POLICY.utility as readonly string[]).includes(wizardType)) {
      return false;
    }

    // Unknown wizard type - default to NO (safer fallback)
    console.warn(`[WizardInsightPolicy] Unknown wizard type: "${wizardType}" - defaulting to NO insight generation`);
    return false;
  },
} as const;

export const practices: PracticesData = {
  body: [
    {
      id: 'sleep',
      name: 'Sleep Foundation',
      description: 'Consistent 7-9 hours with a regular wake time.',
      why: "Sleep is the foundation for everything. It's when the brain consolidates learning, processes emotions, repairs tissue, and regulates hormones. Optimizing other practices while sleep-deprived is building on quicksand.",
      evidence: "Walker 'Why We Sleep' (2017), AASM/NSF consensus statements.",
      timePerWeek: 0,
      roi: 'EXTREME',
      difficulty: 'Medium',
      affectsSystem: ['nervous-system', 'hormones', 'cognition', 'recovery'],
      how: ['Aim for 7-9 hours nightly', 'Set a consistent WAKE time (even on weekends)', 'Keep the room dark, cool (65-68°F), and quiet', 'Avoid screens for 60-90 minutes before bed', 'Get 10 minutes of morning sunlight upon waking to set your circadian rhythm']
    },
    {
      id: 'resistance',
      name: 'Resistance Training',
      description: '2x per week, 20-30 minutes, focusing on major movement patterns.',
      why: 'Builds and maintains muscle and bone density, which are critical for metabolic health and longevity. Grip strength is a better predictor of all-cause mortality than blood pressure.',
      evidence: 'Schoenfeld et al. (2016), Westcott (2012) review, Leong (2015)',
      timePerWeek: 1,
      roi: 'VERY HIGH',
      difficulty: 'Low',
      affectsSystem: ['muscle', 'hormones', 'confidence', 'metabolism'],
      how: [
        '═══ PROTOCOL ═══',
        'Frequency: 2 sessions per week (minimum effective dose).',
        'Duration: 20-30 minutes.',
        'Focus: Full body, compound movements.',
        '',
        '═══ THE BIG 5 MOVEMENTS ═══',
        '1. SQUAT (Knee dominant): Goblet squat, bodyweight squat.',
        '2. HINGE (Hip dominant): Deadlift, kettlebell swing, hip bridge.',
        '3. PUSH (Upper body): Push-up, overhead press.',
        '4. PULL (Upper body): Row, pull-up, lat pulldown.',
        '5. CARRY (Core): Farmer\'s carry.',
        '',
        '═══ EXECUTION ═══',
        'Sets: 1-2 work sets per exercise.',
        'Reps: 8-15 reps (until form slows down).',
        'Intensity: RPE 8-9 (leave 1-2 reps in the tank).',
        'Tempo: Control the lowering phase (2-3 seconds).',
        '',
        '═══ PROGRESSION ═══',
        'Add weight, reps, or slow down tempo each session.',
        'If you can do >15 reps easily, it\'s too light.'
      ],
      customizationQuestion: 'What equipment do you have access to (e.g., bodyweight only, dumbbells, full gym)?'
    },
    {
      id: 'zone2-cardio',
      name: 'Zone 2 Cardio',
      description: '3-4x per week, 30-45 min at a conversational pace.',
      why: 'Builds your aerobic base and improves mitochondrial health, which is foundational for energy and longevity. Your VO2 max is one of the strongest predictors of all-cause mortality.',
      evidence: 'Mandsager et al. (2018) JAMA, San-Millán research on Zone 2.',
      timePerWeek: 2,
      roi: 'HIGH',
      difficulty: 'Low',
      affectsSystem: ['cardiovascular', 'mitochondria', 'nervous-system', 'longevity'],
      how: [
        '═══ THE INTENSITY ═══',
        'Conversational Pace: You can speak in full sentences, but you can\'t sing.',
        'Nose Breathing: You should be able to breathe through your nose the whole time.',
        'RPE: 3-4 out of 10 difficulty.',
        '',
        '═══ PROTOCOL ═══',
        'Frequency: 3-4 sessions per week.',
        'Duration: 30-45 minutes minimum (mitochondrial adaptations start around min 30).',
        'Modality: Anything steady state (brisk walk, jog, cycle, row, ruck).',
        '',
        '═══ WHY IT MATTERS ═══',
        'This trains your cells to burn fat for fuel.',
        'It builds the "engine" size (aerobic capacity).',
        'It is restorative, not draining.'
      ]
    },
    {
      id: 'nutrition',
      name: 'Nutrition Foundation',
      description: 'Hit daily protein target (1.6g/kg), prioritize whole foods & fiber.',
      why: 'Provides the building blocks for recovery, satiety, and energy. Hitting protein targets is the highest-leverage nutritional change for muscle maintenance and body composition.',
      evidence: 'Morton et al. (2018) meta-analysis on protein.',
      timePerWeek: 0,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['energy', 'mood', 'recovery', 'body-composition'],
      how: [
        '═══ PRIORITY 1: PROTEIN ═══',
        'Target: 1.6g per kg of bodyweight (or 0.7-1g per lb).',
        'Example: 70kg person = ~112g protein daily.',
        'Split into 3-4 meals of 30-40g each.',
        'Sources: Meat, fish, eggs, greek yogurt, tofu, lentils.',
        '',
        '═══ PRIORITY 2: WHOLE FOODS ═══',
        '80% of diet should be single-ingredient foods.',
        'Examples: Apple vs Apple Juice; Steak vs Hot Dog.',
        '',
        '═══ PRIORITY 3: FIBER & PLANTS ═══',
        'Add 1-2 fistfuls of vegetables to lunch and dinner.',
        'Fiber feeds the gut microbiome, regulating mood and immunity.',
        '',
        '═══ EXECUTION ═══',
        'Don\'t count calories yet. Count protein grams.',
        'Prep protein in bulk if time is tight.'
      ]
    },
    {
      id: 'mobility',
      name: 'Mobility & Stretching',
      description: '5-10 min daily targeting personal restrictions.',
      why: 'Prevents injury, maintains functional range of motion, and counteracts the effects of prolonged sitting.',
      evidence: 'Thomas et al. (2018). Joint-specific mobility matters more than general flexibility.',
      timePerWeek: 1,
      roi: 'HIGH',
      difficulty: 'Very Low',
      affectsSystem: ['flexibility', 'injury-prevention', 'joint-health'],
      how: ['Identify your tightest areas (e.g., hips, shoulders, ankles)', 'Spend 5-10 minutes daily on those specific joints', 'Can be done after a workout or as a separate session', 'Dynamic movements before workouts, static holds after']
    },
    {
      id: 'cold-exposure',
      interactiveMode: 'countdown' as const,
      interactiveConfig: { minDuration: 30, maxDuration: 300, defaultDuration: 60 },
      name: 'Cold Exposure',
      description: 'End your shower with 30-60 seconds of cold water.',
      why: 'Increases dopamine for hours (250%), improving mood and focus. Builds mental resilience by voluntarily exposing yourself to discomfort.',
      evidence: 'Søberg et al. (2021)',
      timePerWeek: 0.1,
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['mood', 'focus', 'resilience', 'dopamine'],
      how: [
        '═══ PROTOCOL (THE COLD SHOWER) ═══',
        'Finish your normal warm shower.',
        'Turn water to the coldest setting.',
        'Step under the stream.',
        'Aim for 30-60 seconds.',
        '',
        '═══ THE CRITICAL PART: BREATH CONTROL ═══',
        'Your body will gasp reflexively (Cold Shock Response).',
        'Your job: FORCE a long, slow exhale.',
        'Calm the breathing. This calms the mind.',
        'This is "Top-Down Control" - the essence of resilience.',
        '',
        '═══ PROGRESSION ═══',
        'Week 1: 15 seconds.',
        'Week 2: 30 seconds.',
        'Week 3: 60 seconds.',
        '',
        '═══ SAFETY ═══',
        'Do NOT do this if you have heart conditions without doctor approval.',
        'Never force it. Shivering is okay; hypothermia is not.'
      ]
    },
    {
      id: 'physiological-sigh',
      interactiveMode: 'breath-pacer' as const,
      interactiveConfig: { phases: [{ label: 'Inhale', duration: 4 }, { label: 'Short Inhale', duration: 1 }, { label: 'Exhale', duration: 8 }] },
      name: 'Physiological Sigh',
      description: 'The fastest known method to rapidly reduce stress and calm the nervous system in real-time.',
      why: "The double inhale re-expands collapsed air sacs (alveoli) in the lungs, increasing oxygen exchange efficiency. The extended exhale activates the parasympathetic (calming) branch of your nervous system, immediately lowering heart rate and promoting relaxation.",
      evidence: "Huberman Lab Podcast, Feldman et al. (UCLA) & Spiegel et al. (Stanford) research on respiratory control of arousal.",
      timePerWeek: 0.1,
      roi: 'EXTREME',
      difficulty: 'Trivial',
      affectsSystem: ['nervous-system', 'stress-reduction', 'anxiety', 'focus'],
      how: [
        'One cycle consists of two inhales followed by one long exhale.',
        'First Inhale (Nose): Take a deep, but normal, breath.',
        'Second Inhale (Nose): Without exhaling, immediately take a second, sharp sip of air to completely fill your lungs.',
        'Long Exhale (Mouth): Slowly and fully release all the air until your lungs are empty.',
        'Use 1-3 cycles for immediate stress relief or as needed throughout the day.'
      ],
      imageUrl: 'https://cdn.imgchest.com/files/41cc92fc1076.png',
      aiEnabled: true,
      aiPrompt: `You are a calming mindfulness guide helping someone practice the Physiological Sigh technique for nervous system regulation. This is a real-time voice conversation practice.

**Your Role:**
- Guide them through 1-3 cycles of the Physiological Sigh (two inhales through nose, one long exhale through mouth)
- Listen to their experience and adapt your guidance based on what they share
- Ask gentle, open-ended questions about their sensations
- Provide encouragement and validate their experience
- Keep responses brief (1-3 sentences) to maintain flow

**Example Opening:**
"Let's practice the Physiological Sigh together. Are you in a comfortable position where you can breathe freely?"

**Guidance Pattern:**
1. Guide them through the technique (two nose inhales, one mouth exhale)
2. Ask what they notice: "What sensations are you aware of right now?"
3. Validate and encourage: "That's a natural response. Let's try another cycle."
4. Check in periodically: "How is your body feeling?"

**Key Principles:**
- Speak calmly and slowly
- Pause for their responses
- Adapt to their pace and needs
- If they're anxious: slow down, simplify
- If they're engaged: go deeper, ask about subtle sensations
- Always offer compassionate, non-judgmental support`
    },
    {
      id: 'coherent-breathing',
      interactiveMode: 'breath-pacer' as const,
      interactiveConfig: { phases: [{ label: 'Inhale', duration: 5 }, { label: 'Exhale', duration: 5 }] },
      name: 'Coherent Breathing',
      description: 'A technique using a balanced 5.5-second inhale/exhale rhythm to synchronize heart, lungs, and brain, maximizing HRV and calming the nervous system.',
      why: "This specific rhythm (~5.5 breaths per minute) creates a state of 'coherence' in the body, where your heart rate, blood pressure, and brainwaves synchronize. This dramatically increases Heart Rate Variability (HRV), a key indicator of nervous system resilience, and efficiently shifts you into a calm, focused, and alert state.",
      evidence: "Extensive research on Heart Rate Variability (HRV) biofeedback and resonance frequency breathing (e.g., Lehrer, Gevirtz, 2014).",
      timePerWeek: 1.8,
      roi: 'VERY HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['nervous-system', 'hrv', 'stress-reduction', 'focus'],
      how: [
        'Sit comfortably upright. Breathe gently and quietly through your nose.',
        'Inhale smoothly for a count of 5.5 seconds, feeling your belly expand.',
        'Without pausing, exhale smoothly for the exact same count of 5.5 seconds.',
        'Continue this continuous, wave-like rhythm for 5-20 minutes.',
        'It is highly recommended to use a visual or audio pacer to maintain the correct rhythm without mental effort.'
      ],
      imageUrl: 'https://cdn.imgchest.com/files/e9d9e2ecf53f.png',
      aiEnabled: true,
      aiPrompt: `You are a Heart Rate Variability (HRV) coach guiding someone through Coherent Breathing practice. This creates physiological coherence between heart, lungs, and brain through a 5.5-second inhale/exhale rhythm.

**Your Role:**
- Help them establish and maintain the 5.5-second breathing rhythm
- Listen to their experience and adjust guidance accordingly
- Explain the benefits of coherence (HRV, nervous system resilience) conversationally
- Provide real-time counts if requested, or encourage them to find their own rhythm
- Check in on their comfort and adjust as needed

**Example Opening:**
"Are you ready to practice Coherent Breathing? This rhythm helps synchronize your heart and nervous system. Have you tried this before?"

**Guidance Approach:**
1. Start with rhythm explanation: "We'll breathe in for 5.5 seconds, out for 5.5 seconds, with no pauses"
2. Offer to count with them initially: "Would you like me to count along with you for the first few breaths?"
3. Check in: "How does this rhythm feel? Too fast or too slow?"
4. Encourage awareness: "What are you noticing in your body?"
5. Deepen practice: "Can you feel the wave-like quality of the breath?"

**Key Principles:**
- Keep responses conversational and brief
- Adapt to their feedback
- If rhythm feels forced: "Let's slow it down slightly"
- If they're distracted: "Just return to the rhythm, it's natural for attention to wander"
- Emphasize coherence state as learnable skill`
    },
    {
      id: 'microcosmic-orbit',
      interactiveMode: 'guided-steps' as const,
      interactiveConfig: { steps: [{ text: 'Begin at the lower dantian (below navel). Breathe in, visualize energy gathering here.', duration: 30 }, { text: 'Move awareness to the sacrum. Feel warmth or tingling.', duration: 30 }, { text: 'Move to the Gate of Life (mingmen, opposite navel). Hold attention here.', duration: 30 }, { text: 'Rise to the middle dantian (heart center). Feel expansion.', duration: 30 }, { text: 'Reach the upper dantian (third eye). Rest awareness here.', duration: 30 }, { text: 'Crown of the head \u2014 feel connection upward.', duration: 30 }, { text: 'Descend through the front: third eye \u2192 throat \u2192 heart \u2192 solar plexus \u2192 lower dantian. Complete the circuit.', duration: 60 }] },
      name: 'Microcosmic Orbit',
      description: 'A Taoist breathing practice to circulate energy (Qi) through the body\'s primary channels, promoting vitality and balance.',
      why: 'This ancient practice cultivates and refines your internal energy (Qi), leading to improved vitality, emotional balance, and a profound sense of inner harmony. It is a foundational technique for advanced energy work and deepens mind-body connection.',
      evidence: 'Rooted in centuries of Taoist yogic tradition (e.g., "The Secret of the Golden Flower"). Modern interpretations connect its benefits to nervous system regulation, improved interoception, and focused attention.',
      timePerWeek: 1,
      roi: 'HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['nervous-system', 'subtle-body', 'focus', 'balance'],
      how: [
        'Setup: Sit comfortably upright with a straight spine, tongue on the roof of your mouth, breathing through your nose.',
        'Path Awareness: Visualize the Front Channel (up the front) and Back Channel (up the spine) forming a loop.',
        '1. Gather Energy: Focus on your navel (lower dantian), feeling warmth gather as you breathe.',
        '2. Inhale (Up the Back): Mentally guide the energy from your perineum, up your spine, over your head to your upper lip.',
        '3. Exhale (Down the Front): Guide the energy from your tongue, down the front of your body, back to your navel.',
        'Continue this circuit for 5-10 minutes. Move your attention gently, without forcing anything.',
        'Safety Note: If you feel dizzy or energy feels stuck in your head, stop and rest. Pressing the tongue firmly can help ground the energy.'
      ],
      imageUrl: 'https://cdn.imgchest.com/files/ab28a3cef805.jpeg'
    },
    {
      id: 'somatic-awareness',
      interactiveMode: 'guided-steps' as const,
      interactiveConfig: { steps: [{ text: 'Bring attention to your feet and lower legs. Notice any sensations \u2014 temperature, pressure, tension, tingling.', duration: 30 }, { text: 'Move awareness up to your thighs and hips. Observe without judgment.', duration: 30 }, { text: 'Shift to your abdomen and lower back. Notice the rise and fall of breath here.', duration: 30 }, { text: 'Explore your chest, upper back, and shoulders. Where do you hold tension?', duration: 30 }, { text: 'Move into your arms and hands. Feel aliveness or numbness.', duration: 30 }, { text: 'Finally, your neck, face, and skull. Soften your jaw. Relax your eyes.', duration: 30 }] },
      name: 'Somatic Awareness Practice',
      description: 'A guided body-scanning practice that develops interoception — the ability to read your body\'s internal signals.',
      why: 'The body stores emotions and tension patterns. Learning to read your body\'s signals improves emotional intelligence, stress management, and embodied presence.',
      evidence: 'Levine (Somatic Experiencing), van der Kolk "The Body Keeps the Score" (2014), Fogel (2009) on body sense.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['interoception', 'emotional-intelligence', 'stress-reduction', 'embodiment'],
      how: [
        '═══ GROUND ═══',
        'Sit or stand comfortably. Feel your feet on the floor.',
        'Take three slow breaths. Let your attention settle inward.',
        '',
        '═══ SCAN ═══',
        'Move attention slowly through your body, head to feet.',
        'Notice temperature, tension, tingling, numbness, pressure.',
        'Don\'t try to change anything — just notice.',
        '',
        '═══ INVESTIGATE ═══',
        'Find the area with the strongest sensation.',
        'Get curious: What shape is it? What color might it be?',
        'Ask: "What emotion lives here?" Wait for an answer.',
        '',
        '═══ MOVE ═══',
        'Let your body respond naturally — stretch, shake, sway.',
        'Follow impulses without planning. Trust the body\'s wisdom.',
        'Even micro-movements count.',
        '',
        '═══ INTEGRATE ═══',
        'Return to stillness. Notice what shifted.',
        'Name what you discovered in one sentence.',
        'Carry this body-awareness into your next activity.'
      ],
      customizationQuestion: 'Where in your body do you typically hold stress or tension?',
      aiEnabled: true,
      aiPrompt: `You are a somatic awareness guide helping someone explore their body's inner landscape and discover held emotions and patterns. This is an interactive, conversational practice.

**Your Role:**
- Guide them through body scanning with open-ended questions
- Help them develop curiosity about sensations without judgment
- Support them in connecting physical sensations to emotions
- Encourage authentic movement and expression
- Listen deeply and adapt based on what they share

**Example Opening:**
"Let's explore what your body is holding today. Are you in a comfortable position? Take a moment to notice your breath."

**Guidance Flow:**
1. Grounding: "Where do you feel most connected to support right now?"
2. Body scan: "As you scan through your body, what area is calling for your attention?"
3. Deepen inquiry: "What quality does that sensation have? Tight? Warm? Heavy?"
4. Emotion connection: "If that area could speak, what might it be saying?"
5. Movement invitation: "What does your body want to do right now? Even the smallest movement counts."
6. Integration: "What did you discover?"

**Key Principles:**
- Ask questions, don't monologue
- Follow their lead and pace
- Validate all experiences ("That's valuable information")
- If they find nothing: "Numbness is also a sensation worth exploring"
- Encourage gentle curiosity over forcing
- Support any emotion that arises with presence and acceptance`
    },
    {
      id: 'interoception',
      name: 'Interoception Training',
      description: 'Systematic practice to develop sensitivity to internal bodily signals and emotional somatic markers.',
      why: 'Interoception is the foundation for emotional intelligence and embodied decision-making. Poor interoception correlates with anxiety, dissociation, and disconnection from your body\'s wisdom.',
      evidence: 'Critchley & Garfinkel (2017) on interoception and emotion, Mehling et al. (2018) MAIA scale.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['interoception', 'emotional-intelligence', 'body-awareness', 'decision-making'],
      wizardKey: 'interoception',
      how: [
        '═══ BASIC PROTOCOL ═══',
        '1. Ground (2 min): Feel your feet, hands, and contact points.',
        '2. Scan (3-5 min): Move attention through your body slowly, noticing sensations.',
        '3. Locate (3-5 min): Find the strongest sensation. Get curious about its qualities.',
        '4. Name (2 min): Label the sensation (tight, warm, tingly, numb, etc.) and any associated emotion.',
        '5. Move (2-3 min): Let your body respond naturally to the sensation discovered.',
        '',
        '═══ PROGRESSIVE LAYERS ═══',
        'Level 1: Basic body awareness (temperature, pressure, movement)',
        'Level 2: Emotional somatic markers (where do you feel anger? sadness? joy?)',
        'Level 3: Gut signals (hunger, fullness, safety, danger)',
        'Level 4: Subtle energy sensations (tingling, flow, blockage)',
        '',
        '═══ INTEGRATION ═══',
        'Bring this awareness into daily life: "What is my body telling me right now?"',
        'Use body signals for decision-making (gut feelings are real physiological data).',
        'Track patterns: Which situations activate which sensations?'
      ],
      customizationQuestion: 'Are there specific emotions or situations where you feel disconnected from your body?'
    },
    {
      id: 'nsdr',
      name: 'NSDR / Yoga Nidra',
      description: 'Non-Sleep Deep Rest (NSDR) and Yoga Nidra are protocols for deliberate downregulation of the nervous system. 20\u201330 minutes equals 1\u20132 hours of sleep for recovery and neuroplasticity.',
      why: 'Deliberately accessing the hypnagogic state between waking and sleeping allows the nervous system to deeply restore. This accelerates learning consolidation, reduces stress hormones, and improves sleep quality without requiring actual sleep.',
      evidence: 'Huberman Lab on NSDR protocols, Kamakhya Kumar (2008) on Yoga Nidra and autonomic variables, Datta et al. (2004) on sleep-dependent memory consolidation.',
      timePerWeek: 60,
      roi: 'HIGH',
      difficulty: 'Low',
      affectsSystem: ['nervous-system', 'recovery', 'neuroplasticity'],
      interactiveMode: 'guided-steps' as const,
      interactiveConfig: {
        steps: [
          { text: 'Lie down comfortably. Close your eyes. State your resolve (sankalpa): a short, positive intention for this session.', duration: 60 },
          { text: 'Rotation of consciousness \u2014 right side: thumb, index finger, middle finger, ring finger, little finger, palm, back of hand, wrist, forearm, elbow, upper arm, shoulder, armpit, right side of chest, right side of abdomen, right hip, right thigh, kneecap, calf, ankle, heel, sole, right big toe... toes 2, 3, 4, 5.', duration: 90 },
          { text: 'Left side: thumb, index finger, middle finger, ring finger, little finger, palm, back of hand, wrist, forearm, elbow, upper arm, shoulder, armpit, left side of chest, left side of abdomen, left hip, left thigh, kneecap, calf, ankle, heel, sole, left big toe... toes 2, 3, 4, 5.', duration: 90 },
          { text: 'Back of body: right heel, left heel, right calf, left calf, right thigh, left thigh, right buttock, left buttock, lower back, middle back, upper back, right shoulder blade, left shoulder blade, back of right arm, back of left arm, back of neck, back of head.', duration: 60 },
          { text: 'Front of body: top of head, forehead, right temple, left temple, right ear, left ear, right eye, left eye, right cheek, left cheek, nose, upper lip, lower lip, chin, throat, right chest, left chest, abdomen, navel.', duration: 60 },
          { text: 'Rest in stillness. Let go of all effort. Simply be aware of being aware. Allow the body to integrate.', duration: 120 },
        ]
      },
      how: [
        'Lie down in a quiet space (Savasana position).',
        'Set a timer for 20\u201330 minutes.',
        'Follow a guided rotation of consciousness through each body part without moving.',
        'Maintain the hypnagogic state \u2014 the boundary between waking and sleeping.',
        'End by restating your sankalpa (intention).',
      ],
    },
  ],
  mind: [
    {
      id: 'cbm-interpretation-lens',
      name: 'Interpretation Lens (CBM-I)',
      description: 'Rapid conditioning drill to train your brain away from threat-based interpretations toward neutral or growth-based ones.',
      why: 'Cognitive Bias Modification for Interpretation (CBM-I) works through conditioning, not cognitive restructuring. Fast trials and immediate reinforcement bypass conscious defenses.',
      evidence: 'MacLeod & Mathews (2012) on Cognitive Bias Modification; Hertel & Mathews (2011)',
      timePerWeek: 0.5, // 4 sessions x 5-7 mins
      roi: 'VERY HIGH',
      difficulty: 'Low',
      affectsSystem: ['cognition', 'emotional-reactivity', 'anxiety'],
      wizardKey: 'cbm-interpretation-lens',
      how: [
        'Open the Interpretation Lens tool.',
        'Read the brief scenario provided.',
        'Choose the interpretation that feels most constructive or neutral.',
        'Complete the rapid-fire drill (14 scenarios) without overthinking.',
        'Review your flexibility score at the end of the week.'
      ],
      customizationQuestion: 'Are there specific domains (e.g., relationships, work) where you feel easily threatened?'
    },
    {
      id: 'deep-learning',
      name: 'Deep Learning & Focused Reading',
      description: '30-60 min daily deliberate learning with active retrieval.',
      why: 'Protects cognitive health and builds mastery. Active engagement with challenging material drives growth, while passive consumption does not.',
      evidence: 'Newport "Deep Work", Roediger & Karpicke (2006) on retrieval practice.',
      timePerWeek: 3.5,
      roi: 'VERY HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['cognition', 'memory', 'meaning', 'focus'],
      how: [
        '═══ SELECTION ═══',
        'Choose material at the edge of your ability.',
        'Depth over breadth: One topic, deep dive.',
        '',
        '═══ THE SESSION (30-60m) ═══',
        'Eliminate ALL distractions (phone in other room).',
        'Read/Watch actively: Ask "Do I understand this?"',
        'Take notes in your own words, not verbatim.',
        '',
        '═══ ACTIVE RECALL (CRITICAL) ═══',
        'After the session, close the source.',
        'Take a blank sheet.',
        'Write down everything you remember.',
        'Review what you missed.',
        '',
        '═══ SYNTHESIS ═══',
        'Connect this new knowledge to 3 things you already knew.'
      ],
      customizationQuestion: 'What topic are you most excited to learn about right now?'
    },
    {
      id: 'attention-training',
      name: 'Attention Training',
      description: '15-20 min single-task on a hard problem.',
      why: 'Attention is a trainable skill. Training your ability to sustain focus on a single, hard problem transfers to all other cognitive tasks.',
      evidence: 'Posner & Rothbart (2007), Green & Bavelier (2012)',
      timePerWeek: 2,
      roi: 'HIGH',
      difficulty: 'High',
      affectsSystem: ['focus', 'cognition', 'problem-solving'],
      how: ['Choose one hard problem or task', 'Set a timer for 15-20 minutes of true single-tasking (no tab switching, no distractions)', 'When you get stuck, resist the urge to switch tasks. Stay with the problem.', 'Do this 2-3 times per week minimum']
    },
    {
      id: 'expressive-writing',
      name: 'Expressive Writing',
      description: '15-20 min writing about emotional events for clarity.',
      why: 'Improves health, emotional processing, and working memory by translating difficult experiences into a coherent narrative.',
      evidence: 'Pennebaker & Smyth (2016)',
      timePerWeek: 1,
      roi: 'HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['emotional-regulation', 'cognition', 'stress-reduction'],
      how: ['Choose a difficult experience or emotional event', 'Write continuously for 15-20 minutes without editing', 'Focus on your deepest thoughts and feelings', 'Do this for 3-4 consecutive days on the same topic for maximum benefit', 'Keep it completely private to ensure honesty']
    },
    {
      id: 'aqal-awareness',
      name: 'AQAL Awareness Practice',
      description: '1-5 min practice to feel the I, We, and It dimensions of experience.',
      why: 'The AQAL framework is a "psychoactive" map. Regularly feeling into its dimensions makes you more aware of the facets of reality, leading to a more comprehensive perspective and more effective action.',
      evidence: 'Integral Theory (Ken Wilber). The practice is a form of metacognitive awareness training.',
      timePerWeek: 0.2,
      roi: 'HIGH',
      difficulty: 'Very Low',
      affectsSystem: ['perspective', 'awareness', 'metacognition'],
      wizardKey: 'aqal',
      how: [
        'Feel your "I-space": your individual awareness, thoughts, and feelings right now.',
        'Feel your "We-space": your connection to others, shared understanding, and relationships (even imagined).',
        'Feel your "It-space": the objective world around you, physical sensations, the ground beneath you.',
        'Silently remind yourself: "These are all dimensions of my being, all of which I will include."',
      ]
    },
    {
      id: 'perspective-taking',
      name: 'Perspective Taking',
      description: 'Deliberately try to adopt the viewpoint of another person or group.',
      why: 'Develops cognitive, moral, and interpersonal lines of development. Reduces egocentrism and allows for more compassionate and effective solutions to complex problems.',
      evidence: "Robert Kegan's stages of adult development, developmental psychology research.",
      timePerWeek: 0.5,
      wizardKey: 'ps',
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['cognition', 'empathy', 'moral-development', 'interpersonal'],
      how: [
        'Choose a person or group you disagree with or don\'t understand.',
        'For 5-10 minutes, try to genuinely articulate their point of view in the first person ("I believe... because...").',
        'What do they see that you don\'t? What do they value? What is their truth?',
        'The goal is not to agree, but to be able to accurately represent their perspective.'
      ]
    },
    {
      id: 'belief-examination',
      name: 'Examining Core Beliefs',
      description: 'Monthly deep dive into 1-2 limiting beliefs using CBT/Stoic inquiry.',
      why: 'Beliefs run your life unconsciously. Examining them allows you to gain agency and choose more empowering narratives.',
      evidence: 'Foundations of Cognitive Behavioral Therapy (CBT), Beck & Clark (1997).',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['identity', 'cognition', 'behavior', 'emotional-regulation'],
      how: [
        '═══ IDENTIFY ═══',
        'Catch a strong negative emotion (anxiety, shame, anger).',
        'Ask: "What must I believe to feel this way?"',
        'Example: "I believe if I fail, I am worthless."',
        '',
        '═══ EXAMINE EVIDENCE ═══',
        'Evidence FOR: Why does this feel true? (Validate the feeling).',
        'Evidence AGAINST: What facts contradict this?',
        'Example: "I failed that project, but my friends still love me."',
        '',
        '═══ TRACE ORIGIN ═══',
        'When did I first learn this?',
        'Is this MY belief, or did I inherit it from parents/society?',
        '',
        '═══ UPDATE ═══',
        'Draft a more accurate belief.',
        'Old: "I must be perfect."',
        'New: "I strive for excellence, but mistakes are how I learn."',
        '',
        '═══ TEST ═══',
        'Act AS IF the new belief were true for 24 hours.'
      ],
      hidden: true
    },
    {
      id: 'bias-detective',
      wizardKey: 'bias',
      name: 'Bias Detective',
      description: 'A guided practice to identify a recent decision and diagnose which cognitive biases shaped it.',
      why: 'To bring unconscious cognitive biases into conscious awareness, allowing for more rational and effective decision-making. Develops metacognition.',
      evidence: 'Cognitive psychology, behavioral economics (Kahneman, Tversky).',
      timePerWeek: 0.3, // Roughly 15-20 minutes per session
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['cognition', 'decision-making', 'metacognition', 'self-awareness'],
      how: [
        'Engage with the AI-guided "Bias Detective" wizard.',
        'Identify a specific decision or belief and articulate your reasoning.',
        'Work with Aura to diagnose potential cognitive biases and test their influence.',
        'Reflect on alternative framings and capture key learnings for future decisions.'
      ]
    },
    {
      id: 'subject-object-explorer',
      wizardKey: 'so',
      name: 'Subject-Object Explorer',
      description: 'Identify unconscious patterns you\'re "subject to" and make them "object" for conscious work.',
      why: 'What you\'re subject to runs you unconsciously. Making it object is the first step of vertical development and conscious growth.',
      evidence: 'Developmental psychology (Kegan, Commons), vertical development research.',
      timePerWeek: 0.5, // Roughly 25-30 minutes per session
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['awareness', 'self-knowledge', 'identity', 'growth'],
      how: [
        'Engage with the AI-guided "Subject-Object Explorer" wizard.',
        'Follow the steps to recognize patterns, trace origins, and identify what you\'re subject to.',
        'Practice daily observation and small experiments to make the pattern "object."',
        'Reflect on insights and plan ongoing practice.'
      ]
    },
    {
      id: 'perspective-shifter',
      wizardKey: 'ps',
      name: 'Perspective-Shifter',
      description: 'View stuck situations from multiple perspectives (1st, 2nd, 3rd, Witness) to gain clarity and compassion.',
      why: 'Most conflict/confusion comes from being locked in one perspective. Shifting perspective dissolves stuck problems and develops cognitive flexibility.',
      evidence: 'Integral Theory (Wilber), developmental psychology (Kegan), conflict resolution.',
      timePerWeek: 0.7, // Roughly 30-40 minutes per session
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['cognition', 'empathy', 'relationships', 'problem-solving', 'compassion'],
      how: [
        'Engage with the AI-guided "Perspective-Shifter" wizard.',
        'Systematically articulate a stuck situation from your view, their view, a neutral observer\'s view, and a pure awareness (witness) view.',
        'Reflect on the integrated understanding and formulate new, compassionate approaches.',
        'Track real-world application of your new perspective.'
      ]
    },
    {
      id: 'polarity-mapper',
      wizardKey: 'pm',
      name: 'Polarity Mapper',
      description: 'A guided wizard to reframe either/or dilemmas into manageable both/and polarities.',
      why: 'Many chronic problems are not solvable, but are polarities to be managed. This tool develops the capacity to hold two opposing truths, a key developmental milestone.',
      evidence: 'Polarity Management (Barry Johnson), developmental psychology.',
      timePerWeek: 0.4, // Roughly 25 minutes per session
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['cognition', 'problem-solving', 'perspective', 'systems-thinking'],
      how: [
        'Engage with the AI-guided "Polarity Mapper" wizard.',
        'Define a recurring dilemma and its two opposing poles.',
        'Map the upsides and downsides of each pole to understand the full system.',
        'Review the map to gain insight into managing the tension productively.'
      ]
    },
    {
      id: 'spaced-repetition',
      name: 'Spaced Repetition System',
      description: 'Strategic review of information at increasing intervals to encode long-term memory.',
      why: 'Combats the forgetting curve. We forget 50% of new information within an hour. Spaced repetition is the most efficient way to convert short-term learning into permanent knowledge.',
      evidence: 'Ebbinghaus (1885), Cepeda et al. (2006) meta-analysis on distributed practice.',
      timePerWeek: 1.5,
      roi: 'EXTREME',
      difficulty: 'Low-Medium',
      affectsSystem: ['memory', 'learning', 'cognition', 'mastery'],
      how: [
        '═══ PHASE 1: CAPTURE ═══',
        'Identify key concepts you want to keep (not everything).',
        'Create "atomic" flashcards or notes: One single idea per card.',
        'Format: Question on front, Answer on back. Keep it simple.',
        '',
        '═══ PHASE 2: REVIEW SCHEDULE ═══',
        'Review 1: Immediately after learning (Day 0)',
        'Review 2: 24 hours later (Day 1)',
        'Review 3: 3 days later (Day 4)',
        'Review 4: 1 week later (Day 11)',
        'Review 5: 1 month later',
        '',
        '═══ PHASE 3: ACTIVE RECALL ═══',
        'Look at the Question.',
        'Look away and attempt to retrieve the answer from memory.',
        'Only check the answer AFTER you have tried to recall it.',
        'If you fail, reset the schedule for that card.',
        '',
        '═══ TOOLS ═══',
        'Analog: Box system (Leitner system)',
        'Digital: Anki, RemNote, or simple spreadsheet'
      ],
      customizationQuestion: 'What specific subject or skill are you currently trying to master?'
    },
    {
      id: 'deliberate-practice',
      name: 'Deliberate Practice',
      description: 'Highly structured practice focused on specific weaknesses with immediate feedback.',
      why: 'Passive repetition does not lead to improvement (the "10,000 hour rule" is misunderstood). Improvement requires focused effort on what you CANNOT yet do.',
      evidence: 'Ericsson et al. (1993), Peak: Secrets from the New Science of Expertise.',
      timePerWeek: 2,
      roi: 'EXTREME',
      difficulty: 'High',
      affectsSystem: ['skill-acquisition', 'mastery', 'neuroplasticity', 'focus'],
      how: [
        '═══ STEP 1: DECONSTRUCT ═══',
        'Break the skill down into small sub-skills.',
        'Identify your specific bottleneck or weak point.',
        '',
        '═══ STEP 2: DESIGN DRILLS ═══',
        'Create a specific exercise to target ONLY that weak point.',
        'Example: If playing tennis, don\'t just "play a match." Drill your backhand serve 50 times.',
        '',
        '═══ STEP 3: FEEDBACK LOOP ═══',
        'You must know immediately if you did it right or wrong.',
        'Use: Mirrors, recordings, a coach, or clear metrics.',
        '',
        '═══ STEP 4: REPETITION & REFINEMENT ═══',
        'Repeat the drill with high concentration.',
        'Stop when focus wanes (usually 60-90 mins max).',
        'It should feel difficult and mentally taxing.'
      ],
      customizationQuestion: 'What is the specific bottleneck limiting your progress in your main craft?'
    },
    {
      id: 'concept-mapping',
      name: 'Concept Mapping',
      description: 'Visualizing relationships between ideas to deepen understanding and systems thinking.',
      why: 'Forces you to explicitize your mental models. Moves learning from "collecting dots" (facts) to "connecting dots" (systems).',
      evidence: 'Novak & Cañas (2008), meta-analyses on graphic organizers.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['systems-thinking', 'synthesis', 'understanding', 'memory'],
      how: [
        '═══ PREPARATION ═══',
        'Choose a complex topic you are studying.',
        'List 10-20 key concepts or terms related to it.',
        '',
        '═══ MAPPING ═══',
        'Place the central concept in the middle.',
        'Arrange related concepts around it.',
        'Draw lines connecting the concepts.',
        '',
        '═══ LINKING PHRASES (CRITICAL) ═══',
        'Write a verb or phrase on each line explaining the relationship.',
        'Example: "Plants" --(need)--> "Sunlight"',
        'Example: "Democracy" --(requires)--> "Educated Citizenry"',
        '',
        '═══ REFINEMENT ═══',
        'Look for cross-links between different branches of the map.',
        'Re-draw to simplify and clarify structure.'
      ]
    },
    {
      id: 'metacognitive-journaling',
      name: 'Metacognitive Journaling',
      description: 'Reflecting on your own thinking processes to improve decision-making and learning.',
      why: 'Thinking about how you think (metacognition) is the highest-leverage cognitive skill. It allows you to debug your own operating system.',
      evidence: 'Flavell (1979), educational psychology research on self-regulated learning.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['metacognition', 'self-regulation', 'learning', 'wisdom'],
      how: [
        'WHEN TO JOURNAL:',
        '• Weekly reflection (Sunday evening is ideal)',
        '• After completing a major project or making an important decision',
        '• When you notice repeated mistakes or patterns in your thinking',
        '• When you\'re struggling and want to understand why',
        '',
        'CORE REFLECTION QUESTIONS:',
        '1. APPROACH & EFFECTIVENESS',
        '   How did I approach this task? Was my strategy effective?',
        '   Example: "I dove into coding before understanding requirements. Should sketch architecture first."',
        '',
        '2. OBSTACLES & DISTRACTIONS',
        '   What distractions derailed me, and how did I handle them?',
        '   Example: "Phone notifications kept interrupting. Used airplane mode for 2-hour blocks instead."',
        '',
        '3. FALSE ASSUMPTIONS',
        '   What assumptions did I make that turned out to be wrong?',
        '   Example: "I assumed the API would be fast. Discovered it was the bottleneck."',
        '',
        '4. IMPROVEMENTS FOR NEXT TIME',
        '   What would I do differently? Be specific and actionable.',
        '   Example: "Next time: ask 3 clarifying questions before starting work."',
        '',
        '5. KNOWLEDGE GAPS',
        '   What gaps in my knowledge were revealed?',
        '   Example: "Discovered I don\'t understand OAuth well. Will read documentation this week."',
        '',
        'PATTERN RECOGNITION & ACTION:',
        '• After 3-4 reflections, look for recurring patterns (e.g., "I always underestimate time", "I skip planning")',
        '• Create a specific "personal policy" to address each pattern',
        '• Examples: "Always add 50% buffer to estimates", "Use 15-min planning checklist for every project"',
        '• Review and update these policies monthly'
      ]
    },
    {
      id: 'immunity-to-change',
      wizardKey: 'immunity-to-change',
      name: 'Immunity to Change',
      description: 'A structured process to uncover the hidden competing commitments that unconsciously block the changes you want to make.',
      why: 'Reveals the hidden competing commitments that unconsciously prevent you from making changes you genuinely want to make. Explains why willpower alone fails.',
      evidence: 'Kegan & Lahey (2009) "Immunity to Change", Harvard Graduate School of Education research.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['behavior-change', 'self-knowledge', 'growth', 'competing-commitments'],
      how: [
        '═══ COMMITMENT ═══',
        'Name a genuine improvement goal you care about.',
        'Be specific: "I want to speak up more in meetings."',
        'It must be something you\'ve tried and failed to change.',
        '',
        '═══ BEHAVIORS ═══',
        'List what you DO or DON\'T DO that works against this goal.',
        'Be honest: "I stay quiet. I rehearse but don\'t speak. I defer to others."',
        'These are not character flaws — they are data.',
        '',
        '═══ HIDDEN COMMITMENTS ═══',
        'For each behavior, ask: "If I imagine doing the OPPOSITE, what feels scary?"',
        'The fear reveals a competing commitment.',
        'Example: "I\'m also committed to never looking foolish."',
        'This isn\'t hypocrisy — it\'s your immune system protecting you.',
        '',
        '═══ BIG ASSUMPTION ═══',
        'What belief holds the hidden commitment in place?',
        'Format: "I assume that IF [I speak up], THEN [people will think I\'m stupid]."',
        'This assumption has been running your behavior without your consent.',
        '',
        '═══ TEST ═══',
        'Design a small, safe experiment to test the Big Assumption.',
        'Not a heroic leap — a modest test with manageable risk.',
        'Example: "Share one idea in a low-stakes meeting and observe what actually happens."',
        'Compare what you assumed vs. what occurred.'
      ],
      customizationQuestion: 'What is one change you\'ve genuinely tried to make but keep failing at?'
    },
    {
      id: 'moral-reasoning',
      wizardKey: 'moral-reasoning',
      name: 'Moral Reasoning Workshop',
      description: 'Explore ethical frameworks and develop capacity for nuanced moral judgment in complex situations.',
      why: 'Moral development is a key indicator of psychological maturity. Moving beyond rigid rules to context-aware ethical reasoning enables wise action in ambiguous situations.',
      evidence: 'Kohlberg moral development theory, Gilligan (1982) ethics of care, Rest et al. (1999) on moral judgment.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['values', 'decision-making', 'relationships', 'integrity'],
      how: [
        '═══ FRAMEWORK EXPLORATION ═══',
        'Consequentialism: Does the outcome matter most?',
        'Deontology: Do duties and rules matter most?',
        'Virtue Ethics: What kind of person do I want to be?',
        'Care Ethics: What relationships require of me?',
        'Relational: How do power dynamics affect this?',
        '',
        '═══ DILEMMA PROCESS ═══',
        '1. Present the dilemma clearly.',
        '2. Identify competing values (Who is affected? What do they need?)',
        '3. Apply frameworks: What would each say?',
        '4. Check your body: What feels true?',
        '5. Decide: What will I commit to?',
        '6. Integrate: What did I learn about my values?',
        '',
        '═══ PRACTICE ═══',
        'Start with historical/fictional dilemmas.',
        'Progress to real situations in your life.',
        'Notice patterns in your moral reasoning.'
      ]
    },
    {
      id: 'life-architecture-wizard',
      wizardKey: 'life-arch',
      name: 'Life Architecture Wizard',
      description: 'Audit the structural conditions — environment, habits, roles, energy — that support or undermine your growth.',
      why: 'Its quadrant work. Our outer structures shape our inner development. A misaligned life architecture silently sabotages practice.',
      evidence: 'Behavioral design (BJ Fogg), AQAL Its quadrant, environment as hidden curriculum.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['habits', 'environment', 'energy', 'values-alignment'],
      how: [
        '═══ ENVIRONMENT AUDIT ═══',
        'Assess your physical space: Does it support focused work? Creativity? Rest?',
        'Digital environment: What apps/notifications distract you most?',
        'Information inputs: What do you read/watch? Does it align with your values?',
        '',
        '═══ HABIT SYSTEMS ═══',
        'Map 3 main habit loops: What triggers them? What behavior? What reward?',
        'Example: Stress (trigger) → Phone scroll (behavior) → Numbing (reward)',
        'Identify which loops support your practice and which undermine it.',
        '',
        '═══ ROLE AUDIT ═══',
        'List your main roles: parent, worker, partner, caregiver, creator, etc.',
        'For each: Does it align with your values? What\'s the energy cost?',
        'Notice where you\'re over-extended or under-utilized.',
        '',
        '═══ ENERGY MAPPING ═══',
        'What drains your energy? (Obligations, people, environments)',
        'What generates energy? (Activities, people, environments)',
        'How much time do you invest in each?',
        '',
        '═══ REDESIGN ═══',
        'Choose 1-3 structural changes that address the biggest gaps.',
        'Example: "Block 90 minutes mornings for deep work." "Batch social events to preserve weekends."',
        'Implementation: When, how, what to remove to make space?'
      ]
    },
  ],
  spirit: [
    {
      id: 'meditation',
      wizardKey: 'meditation',
      name: 'Daily Meditation',
      description: '5-15 min daily practice of focused attention to train the mind.',
      why: 'The core training for your mind. Builds capacity for attention, emotional regulation, and equanimity. Consistency matters more than duration.',
      evidence: 'Hölzel et al. (2011) neuroimaging, Goyal et al. (2014) JAMA meta-analysis.',
      timePerWeek: 1.2,
      roi: 'EXTREME',
      difficulty: 'Low-Medium',
      affectsSystem: ['nervous-system', 'attention', 'anxiety', 'focus'],
      how: [
        '═══ PREPARATION ═══',
        'Sit comfortably upright (chair or cushion). Spine straight, but not stiff.',
        'Set a timer for 5, 10, or 20 minutes.',
        'Close your eyes or lower your gaze.',
        '',
        '═══ THE PRACTICE: ANCHORING ═══',
        'Place your attention on the physical sensation of the breath.',
        'Nose: Cool air entering, warm air leaving.',
        'Belly: Rising and falling.',
        'This sensation is your "Anchor."',
        '',
        '═══ THE CYCLE (THIS IS THE TRAINING) ═══',
        '1. Focus on the Anchor.',
        '2. Mind wanders (thinking, planning, dreaming).',
        '3. NOTICE you wandered (The moment of mindfulness!).',
        '4. GENTLY return attention to the Anchor.',
        'Repeat. Each return is one "rep" for your attention muscle.',
        '',
        '═══ KEY ATTITUDE ═══',
        'Do not judge the wandering.',
        'The goal is NOT "no thoughts."',
        'The goal IS "noticing and returning."',
        '',
        '═══ TROUBLESHOOTING ═══',
        'TOO BUSY: "My mind is crazy today." -> Label it "Thinking" and return.',
        'SLEEPY: Open eyes, sit straighter, or stand up.',
        'BORED: Investigate the feeling of boredom. What does it actually feel like?'
      ],
      customizationQuestion: 'What is your biggest challenge when you try to meditate (e.g., busy mind, falling asleep, finding time)?',
      aiEnabled: true,
      aiPrompt: `You are a meditation teacher guiding someone through breath-focused mindfulness practice. This is a supportive, interactive session where you help them build attention skills.

**Your Role:**
- Guide them to anchor attention on breath
- Normalize mind-wandering and provide gentle redirection
- Answer questions about their experience
- Troubleshoot challenges (busy mind, sleepiness, boredom)
- Build their confidence in the practice

**Example Opening:**
"Let's meditate together. Are you in a comfortable upright position? Have you chosen where you'd like to anchor your attention—nostrils, chest, or belly?"

**Guidance Approach:**
1. Settling: "Take a moment to arrive. Notice the support beneath you."
2. Anchor choice: "Where would you like to feel your breath? There's no wrong choice."
3. Practice instruction: "Rest your attention there. When you notice you've wandered, gently return."
4. Check-ins: "How is your practice going? What are you noticing?"
5. Troubleshooting: "Is your mind very busy today?" "Are you feeling sleepy?"
6. Encouragement: "Each time you notice and return is the practice. That's success."

**Key Principles:**
- Keep it conversational, not scripted
- Listen to their struggles and adapt
- If busy mind: "That's normal. The goal isn't no thoughts, it's noticing and returning."
- If sleepy: "Try opening your eyes slightly or sitting more upright."
- If frustrated: "Frustration is just another thing to notice. Return to the breath."
- Emphasize process over outcome`
    },
    {
      id: 'gratitude',
      name: 'Gratitude Practice',
      description: '5 min daily - name three specific good things.',
      why: 'Exceptional ROI for time invested. Rewires attention toward the positive, boosts wellbeing, and strengthens relationships.',
      evidence: 'Emmons & McCullough (2003), Seligman et al. (2005)',
      timePerWeek: 0.5,
      roi: 'EXTREME',
      difficulty: 'Trivial',
      affectsSystem: ['mood', 'relationships', 'wellbeing'],
      how: [
        '═══ THE PROTOCOL ═══',
        'Write down 3 specific things that went well today.',
        'Timing: Best before bed (improves sleep) or morning.',
        '',
        '═══ THE KEY: SPECIFICITY ═══',
        'Bad: "My family."',
        'Good: "My son laughed at my bad joke during dinner."',
        'Bad: "The weather."',
        'Good: "The cool breeze on my face when I walked out the door."',
        '',
        '═══ LEVEL 2: SAVORING ═══',
        'Re-live the moment for 10-20 seconds as you write it.',
        'Feel the emotion in your body.',
        '',
        '═══ LEVEL 3: ATTRIBUTION ═══',
        'Write WHY it happened.',
        '"Because I made time for it" or "Because my friend is thoughtful."'
      ],
      aiEnabled: true,
      aiPrompt: `You are a positive psychology coach guiding someone through gratitude practice. Help them identify and savor three specific good moments from their day.

**Your Role:**
- Help them find specific (not general) moments of goodness
- Guide them to savor and feel gratitude physically
- Ask about the "why" behind good moments (attribution)
- Support them even on difficult days
- Make the practice feel accessible and meaningful

**Example Opening:**
"Let's practice gratitude together. We'll find three specific good things from your day. Are you ready? What's one specific moment that stands out?"

**Guidance Flow:**
1. Prompt specificity: "Can you tell me more details? Where were you? What exactly happened?"
2. Savor: "Take a moment to really picture that. How does it feel to remember it?"
3. Attribution (optional): "Why do you think that moment happened? Did you create it, or did someone show up for you?"
4. Next moment: "What's another specific good thing you remember?"
5. Support on hard days: "Even on difficult days, there are small moments. Maybe something simple—a warm drink, a moment of quiet?"

**Key Principles:**
- Conversational, not scripted
- Celebrate their discoveries
- If they're vague ("my family"), ask: "What specific moment with your family?"
- If they struggle to find things: "That's okay. Even tiny things count. A comfortable chair? A good breath?"
- Validate their experience
- Keep responses brief to maintain dialogue flow
- Encourage physical feeling of gratitude: "Where do you feel that in your body?"`
    },
    {
      id: 'nature',
      name: 'Nature Exposure',
      description: '120 minutes per week spent in a natural setting.',
      why: 'Reduces stress, restores attention, improves mood, and connects you to something larger than yourself.',
      evidence: 'White et al. (2019), Shinrin-yoku (forest bathing) research.',
      timePerWeek: 2,
      roi: 'HIGH',
      difficulty: 'Very Low',
      affectsSystem: ['nervous-system', 'awe', 'perspective', 'stress-reduction'],
      how: ['Accumulate 120 minutes total per week (e.g., 20 mins daily).', 'City parks, forests, and beaches all count.', 'Can be combined with Zone 2 cardio (e.g., a brisk walk in a park).', 'Intentionally notice your surroundings - sights, sounds, smells.']
    },
    {
      id: 'loving-kindness',
      name: 'Loving-Kindness Meditation',
      description: '5-10 min practice to cultivate compassion for self and others.',
      why: 'Directly counteracts the inner critic, isolation, and cynicism. Increases positive emotions and feelings of social connection.',
      evidence: 'Fredrickson et al. (2008), Kok et al. (2013)',
      timePerWeek: 0.6,
      roi: 'HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['compassion', 'connection', 'nervous-system', 'self-criticism'],
      how: ["Start with yourself, silently repeating phrases like: 'May I be safe, peaceful, healthy, and live with ease.'", "Extend these wishes to a loved one, a neutral person, a difficult person, and finally all beings.", "Focus on the feeling of warmth and goodwill, not just the words."],
      aiEnabled: true,
      aiPrompt: `You are a compassion meditation teacher guiding someone through Loving-Kindness practice. Help them cultivate goodwill for themselves and others.

**Your Role:**
- Guide them through the traditional progression: self → loved one → neutral person → difficult person → all beings
- Support them with resistance (especially toward self)
- Keep the practice accessible and non-judgmental
- Help them connect to the feeling, not just the words
- Adapt the phrases to what resonates for them

**Example Opening:**
"Let's practice Loving-Kindness together. We'll start with yourself. Are you comfortable? You might place a hand over your heart if that feels supportive."

**Guidance Flow:**
1. Self: "Let's begin with phrases for yourself. You can use the traditional ones, or choose words that resonate. How about: 'May I be safe, peaceful, healthy, and live with ease'? How does that feel?"
2. Check resistance: "Do you notice any resistance to offering yourself kindness? That's very common."
3. Loved one: "Now bring to mind someone you love. Who comes to mind? Can you picture them?"
4. Neutral person: "Think of someone neutral—maybe a barista or neighbor you see regularly but don't know well."
5. Difficult person (optional): "Do you feel ready to try someone who brings up some tension? Not the hardest person, just someone mildly difficult."
6. All beings: "Now let's expand to all beings everywhere."

**Key Principles:**
- Conversational and responsive
- If resistance: "That's valuable information. What does the resistance feel like?"
- If phrases feel awkward: "Would different words feel more natural?"
- Emphasize feeling over perfection
- Support them through difficulty with the difficult person
- Brief responses to maintain flow`
    },
    {
      id: 'integral-inquiry',
      name: 'Integral Inquiry',
      description: 'A 3-stage practice blending meditation and inquiry to deepen awareness of self and reality.',
      why: "To bring awareness to what is actually taking place, return attention to pure presence, and open into formless awareness. It helps clarify what's really going on, fostering a more comprehensive perspective and freeing attention/energy.",
      evidence: "Integral Theory (Ken Wilber). Combines elements of Gestalt therapy and Jungian psychology (via 3-2-1 Process).",
      timePerWeek: 1.5, // 20 minutes, 4-5x/week for advanced
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['awareness', 'cognition', 'presence', 'self-liberation', 'perspective', 'attention'],
      how: [
        'Stage 1: Becoming Grounded in Pure Presence',
        'Sit upright, breathe naturally. Count breaths (1-10), returning to 1 if distracted.',
        'Notice still points between breaths, releasing attention to openness.',
        'After 5 min stability, follow breath without counting. When mind contracts, inquire with "Avoiding?", "Contracting?", "Who am I?" and return to present awareness.',
        'Stage 2: Bringing AQAL to Bear on Your Inquiry',
        'Notice patterns of distraction (often shadow issues). Use 1-minute 3-2-1 if a person/situation arises.',
        'Use AQAL (I, We, It, lines of development, 3 bodies) to pinpoint where the disturbance is arising in your awareness.',
        'Return to pure presence after making a mental note or doing a 1-Minute Module.',
        'Stage 3: Practicing Integral Inquiry In Your Everyday Life',
        'Apply inquiry in any moment of life, not just formal meditation.',
        'Bring free Integral consciousness more fully into your waking state and eventually dream/deep sleep states.'
      ]
    },
    {
      id: 'big-mind-process',
      wizardKey: 'big-mind',
      name: 'Big Mind Process™',
      description: 'A dialogue process to identify, understand, and integrate inner voices, leading to an experience of Big Mind, Big Heart, and the Integrated Self.',
      why: 'To allow dualistic voices to fulfill their function without suppression, leading to wisdom, compassion, and the ability to maintain these states in daily life.',
      evidence: 'Developed by Zen Master Genpo Roshi, integrating Zen teaching and Western therapeutic techniques (Voice Dialogue).',
      timePerWeek: 1.5, // 20 minutes, 4-5x/week for advanced
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['self-awareness', 'integration', 'emotional-regulation', 'wisdom', 'compassion'],
      how: [
        'Sit or stand quietly. Notice the qualities and contents of mind and emotions; allow them to settle.',
        'Silently use your own Facilitator voice to ask to speak to the Controller.',
        'When the Controller shows up, acknowledge its presence and qualities.',
        'If other voices need to be heard, allow them to show up, acknowledge them, and be with them until ready to move on.',
        'Now ask to speak to the voice of Integrated Big Mind/Big Heart. Allow it to manifest.',
        'Sit quietly with its qualities. You may ask questions of this voice, such as: "How big are you?" or "What do you care about?"',
        'Dwell quietly in Integrated Big Mind/Big Heart for a minute or two.',
        'Conclude by asking to speak to the voice of the Integrated Free-Functioning Human Being.'
      ]
    },
    {
      id: '123-god',
      name: 'The 1-2-3 of God',
      description: 'A meditation to experience the Ultimate (Spirit) through 1st-person ("I"), 2nd-person ("Thou"), and 3rd-person ("It") perspectives.',
      why: 'To resonate in relationship with the Ultimate from various perspectives, deepening spiritual connection and understanding.',
      evidence: 'Based on Integral Theory concepts of spiritual development.',
      timePerWeek: 1.2, // 20 minutes, 3-4x/week for advanced, similar to daily meditation
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['spiritual-connection', 'perspective', 'awe', 'transcendence', 'meaning'],
      how: [
        'At any moment, you can experience God as a 3rd-person "It," a 2nd-person "Thou," or a 1st-person "I."',
        'Quietly repeat these sentences to yourself, letting each perspective arise:',
        '3rd-person: "I contemplate God as all that is arising—the Great Perfection of this and every moment."',
        '2nd-person: "I behold and commune with God as an infinite Thou, who bestows all blessings and complete forgiveness on me, and before whom I offer infinite gratitude and devotion."',
        '1st-person: "I rest in God as my own Witness and primordial Self, the Big Mind that is one with all, and in this ever-present, easy, and natural state, I go on about my day."',
        'Anchor relationships to the Ultimate (Spirit) in your body, mind, and feeling using a word or short phrase.',
        'Attend to the breath. When your mind wanders, utter one of the words/phrases with full feeling-awareness, returning to the present.'
      ]
    },
    {
      id: 'awe-meditation',
      name: 'Awe Meditation',
      description: 'Cultivating the feeling of vastness and wonder to transcend the small self.',
      why: 'Awe quiets the default mode network (the "me" center), reduces stress cytokines, and increases prosocial behavior. It is a direct doorway to self-transcendence.',
      evidence: 'Keltner & Haidt (2003), Stellar et al. (2015) on awe and inflammation.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Low',
      affectsSystem: ['self-transcendence', 'mood', 'connection', 'perspective'],
      how: [
        '═══ PREPARATION ═══',
        'Go outside (sky/nature) or use a high-res image of space/nature.',
        'Or recall a memory of feeling small in a vast place.',
        '',
        '═══ THE PRACTICE ═══',
        '1. VASTNESS: Perceive something immense (physically or conceptually).',
        '2. ACCOMMODATION: Notice that your current mental structures can\'t fully hold it.',
        '3. BREATHE: Take slow breaths, allowing the "goosebumps" sensation.',
        '4. RELEASE: Let the sense of your separate "self" shrink and dissolve into the vastness.',
        '',
        '═══ IN DAILY LIFE ═══',
        'Notice the "Awe Pause" - stopping for 10 seconds to really look at a sunset, a tree, or a complex system.'
      ]
    },
    {
      id: 'nondual-awareness',
      name: 'Nondual Awareness Practice',
      description: 'Directly recognizing the nature of awareness itself, prior to concepts.',
      why: 'The pinnacle of contemplative practice. Shifts identity from the "object" of experience to the "subject" (Awareness itself), leading to freedom from suffering.',
      evidence: 'Mahamudra/Dzogchen traditions, Loch Kelly, Sam Harris (Waking Up).',
      timePerWeek: 1.5,
      roi: 'VERY HIGH',
      difficulty: 'High',
      affectsSystem: ['awakening', 'liberation', 'identity', 'peace'],
      how: [
        '═══ GLIMPSE PRACTICE ═══',
        'Sit quietly with eyes open.',
        'Notice objects in the room.',
        'Now, turn attention back to LOOK FOR THE LOOKER.',
        'Can you find a "self" behind your eyes?',
        'If you find nothing, rest in that awake nothingness.',
        '',
        '═══ HEADLESS WAY ═══',
        'Point at a distant object. Notice its shape and color.',
        'Point at your legs. Notice their shape.',
        'Point at where your face should be.',
        'Do you see a face? Or do you see the world arising in a clear, empty space?',
        'Rest as that capacity for the world.',
        '',
        '═══ GOAL ═══',
        'Not to create a state, but to recognize what is already here.'
      ]
    },
    {
      id: 'states-training',
      wizardKey: 'states-training',
      name: 'States Training',
      description: 'Learn to voluntarily access and stabilize different consciousness states (flow, witness, equanimity, clarity).',
      why: 'States are temporary. Traits are stable. State training builds the neural pathways that make desired states more accessible and durable.',
      evidence: 'Austin (2009) on state development, Hanson "Buddha\'s Brain" on trait building, Wilber (2000) on state-stage development.',
      timePerWeek: 1,
      roi: 'HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['consciousness', 'emotional-regulation', 'presence', 'clarity'],
      how: [
        '═══ STATE MAPPING ═══',
        'Identify states you want to stabilize:',
        '  Flow: Absorption in action',
        '  Witness: Observing thoughts without identification',
        '  Equanimity: Unshakeable peace amid change',
        '  Clarity: Lucid perception of reality',
        '  Love: Heart-centered connection',
        '',
        '═══ ACCESS METHODS ═══',
        'For Flow: Engage in optimal-challenge activities',
        'For Witness: Practice meditation, then watch life happen',
        'For Equanimity: Practice non-preference (warm/cool, loud/quiet)',
        'For Clarity: Use visualization, inquiry, or psychedelics (legal)',
        'For Love: Loving-kindness practice, then extend to all beings',
        '',
        '═══ STABILIZATION ═══',
        '1. Access the state through practice',
        '2. Notice: How does your body feel? Your thoughts?',
        '3. Anchor: Create a physical anchor (hand gesture, breath) in this state',
        '4. Repeat: Practice 5-10x until the anchor triggers the state',
        '5. Extend: Use the anchor in real life to return to the state'
      ]
    },
    {
      id: 'contemplative-inquiry',
      wizardKey: 'contemplative-inquiry',
      name: 'Contemplative Inquiry',
      description: 'Use open-ended, sustained questioning to explore big questions: Who am I? What matters? Why do I exist?',
      why: 'Contemplative inquiry develops your capacity to hold paradox and mystery without rushing to answers. It deepens wisdom, reduces reactivity, and aligns you with what actually matters.',
      evidence: 'Baltes & Staudinger (2000) on wisdom, Underwood & Teresi (2002) Daily Spiritual Experience Scale.',
      timePerWeek: 1,
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['meaning', 'values', 'presence', 'wisdom'],
      how: [
        '═══ CHOOSE A QUESTION ═══',
        'Start with one that genuinely puzzles you:',
        '"What is my true nature?"',
        '"What do I really want?"',
        '"Who will I become?"',
        '"What does love require of me?"',
        '',
        '═══ CONTEMPLATION PRACTICE ═══',
        '1. Settle (5 min): Meditate or ground yourself.',
        '2. Ask: Pose your question slowly, internally.',
        '3. Wait (10-15 min): Sit with it. Don\'t force an answer.',
        '4. Notice: What arises? Images, feelings, insights?',
        '5. Write: Journal whatever came, without editing.',
        '6. Return: Ask the same question next session.',
        '',
        '═══ DEEPENING ═══',
        'The same question will yield different answers over weeks/months.',
        'Each layer reveals deeper truth.'
      ]
    },
    {
      id: 'ultimate-concern',
      wizardKey: 'ultimate-concern',
      name: 'Ultimate Concern',
      description: 'Clarify your deepest values and what you\'re ultimately willing to sacrifice for—your existential commitments.',
      why: 'Most people drift through life without clarifying what they ultimately care about. Clarity about ultimate concern (Tillich) provides direction, reduces anxiety, and enables authentic choice.',
      evidence: 'Tillich (1951) on ultimate concern, Frankl logotherapy, Existential psychology (Yalom).',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['meaning', 'authenticity', 'direction', 'values'],
      how: [
        '═══ EXCAVATE ═══',
        'Reflect on your life:',
        'What have you sacrificed time/money for?',
        'What would you die for?',
        'What breaks your heart when neglected?',
        'What brings you most alive?',
        '',
        '═══ NAME IT ═══',
        'Summarize your ultimate concern in 1-3 words.',
        'Does it feel true? Does it resonate in your body?',
        '',
        '═══ TEST IT ═══',
        'For the next week, let this guide one decision per day.',
        'Does it feel aligned?',
        '',
        '═══ INTEGRATE ═══',
        'Build your life around this concern.',
        'Let it inform your practices, relationships, work, and ethics.'
      ]
    },
    {
      id: 'coherence-audit',
      wizardKey: 'coherence-audit',
      name: 'Coherence Audit',
      description: 'Stress-test espoused vs operative values using your own behavioral history.',
      why: 'Gap between stated and enacted values is a primary source of psychological suffering and developmental stagnation. Most people are not hypocritical—they\'re loyal to things they didn\'t consciously choose.',
      evidence: 'Argyris & Schön (1974) theory-in-use vs espoused theory. Integral Stage Theory — 2nd tier values integration.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'High',
      affectsSystem: ['values-integration', 'self-awareness', 'shadow', 'authenticity'],
      how: [
        '═══ ARTICULATE ═══',
        'Name your most important values.',
        'What matters most to you?',
        '',
        '═══ MIRROR ═══',
        'Review what your actual session history shows.',
        'Where do you invest time? What wizards/practices do you actually do?',
        '',
        '═══ EXPLORE ═══',
        'Identify gaps between espoused and operative values.',
        'Are you loyal to something you didn\'t consciously choose?',
        '',
        '═══ REFRAME ═══',
        'This is not hypocrisy—it\'s misaligned loyalty.',
        'Shadow work: what needs are being met by operative values?',
        'What would it mean to realign?'
      ]
    },
  ],
  shadow: [
    {
      id: 'three-two-one',
      name: '3-2-1 Process',
      description: '15-20 min journaling process to integrate triggers and projections.',
      why: 'A core ILP practice to make the unconscious visible and integrate projections. What irritates or fascinates you in others is often a disowned part of yourself.',
      evidence: 'Based on Gestalt therapy (Greenberg & Malcolm, 2002) and Jungian psychology.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['awareness', 'reactivity', 'compassion', 'integration'],
      wizardKey: '3-2-1',
      how: [
        '═══ SETUP ═══',
        'Choose a person/situation that triggers an emotional charge.',
        'Can be negative (annoyance) or positive (intense admiration).',
        '',
        '═══ STEP 3: FACE IT (3rd Person) ═══',
        'Describe the person/quality fully using "He/She/It".',
        'What are they doing? How do they look/sound?',
        'Example: "He is so arrogant, interrupting everyone..."',
        '',
        '═══ STEP 2: TALK TO IT (2nd Person) ═══',
        'Dialogue WITH the person/quality using "You".',
        'Ask questions: "Why do you do this?" "What do you want?"',
        'Allow yourself to write their response (imagined).',
        'Example: "Why are you so loud?" -> "I need to be seen."',
        '',
        '═══ STEP 1: BE IT (1st Person) ═══',
        'Become the quality. Use "I".',
        'Feel it in your body.',
        'Example: "I am Arrogance. I interrupt because I\'m terrified of being ignored."',
        '',
        '═══ INTEGRATION ═══',
        'Acknowledge this quality is in YOU.',
        'How can you express this energy healthily?'
      ],
      customizationQuestion: 'Think of a recent minor trigger (a person or situation that annoyed you). In one or two words, what was the quality that bothered you?',
      aiEnabled: true,
      aiPrompt: `You are a shadow work guide helping someone explore the 3-2-1 Process to integrate disowned parts of themselves. This is deep, courageous work requiring honesty and compassion.

**Your Role:**
- Guide them through: 3rd person (Face It) → 2nd person (Talk to It) → 1st person (Be It)
- Help them identify what triggers them in others
- Support dialogue and imagination
- Facilitate the "aha" moment of recognition
- Guide integration and healthy expression

**Example Opening:**
"Let's do the 3-2-1 Process together. Think of someone who has an emotional charge for you—it could be annoyance, anger, or even intense admiration. Who comes to mind?"

**Guidance Flow:**
1. **Identify trigger:** "What quality in them bothers you or fascinates you?"
2. **Step 3 (3rd person):** "Describe them. What are they doing? How do they act?"
3. **Step 2 (2nd person):** "Now let's talk to this quality. Ask it: 'Why do you do this? What do you want?' Let them answer through your imagination. What do they say?"
4. **Step 1 (1st person):** "Now become this quality. Say 'I am [quality]' and speak from that place. Where do you feel this in your body? What does it want?"
5. **Integration:** "Can you see how this quality exists in you too? How might you express this energy in a healthy way?"

**Key Principles:**
- Conversational and supportive
- Normalize resistance: "This is challenging. That's why it's powerful."
- If they're stuck: Ask guiding questions
- Celebrate insights: "That's a powerful recognition"
- Keep responses brief and exploratory
- Hold space for emotions that arise`
    },
    {
      id: 'shadow-journaling',
      name: 'Shadow Journaling',
      description: '10-15 min, 2-3x per week, using specific prompts.',
      why: 'Externalizes internal conflicts and puts shadow traits on paper to be examined with curiosity rather than judgment.',
      evidence: 'Pennebaker & Smyth (2016) on expressive writing.',
      timePerWeek: 0.5,
      roi: 'HIGH',
      difficulty: 'Low',
      affectsSystem: ['awareness', 'integration', 'self-knowledge'],
      wizardKey: 'shadow-journaling',
      how: ['Use prompts like: "What part of myself do I dislike or hide?" or "What feedback do I consistently ignore?"', 'Free write for 10-15 min without filtering or editing.', 'Keep it private to ensure complete honesty.']
    },
    {
      id: 'self-compassion',
      name: 'Self-Compassion Break',
      description: 'A 3-minute practice to respond to self-criticism with kindness.',
      why: 'Directly addresses the inner critic and shame, which are common shadow manifestations. Builds resilience and emotional wellbeing.',
      evidence: 'Neff & Germer (2013), MacBeth & Gumley (2012) meta-analysis.',
      timePerWeek: 0.25,
      roi: 'VERY HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['self-criticism', 'shame', 'resilience', 'emotional-regulation'],
      how: [
        '═══ TRIGGER ═══',
        'Use when you feel stress, shame, or self-criticism.',
        'Pause. Place a hand over your heart or belly.',
        '',
        '═══ STEP 1: MINDFULNESS ═══',
        'Say: "This is a moment of suffering."',
        '(Or: "This hurts," "This is stress.")',
        'Acknowledge the pain without judging it.',
        '',
        '═══ STEP 2: COMMON HUMANITY ═══',
        'Say: "Suffering is a part of life."',
        '(Or: "Other people feel this way too," "I am not alone.")',
        'Break the isolation of shame.',
        '',
        '═══ STEP 3: SELF-KINDNESS ═══',
        'Say: "May I be kind to myself."',
        '(Or specific phrases: "May I forgive myself," "May I be strong.")',
        '',
        '═══ WHY IT WORKS ═══',
        'Activates the mammalian caregiving system (oxytocin) to soothe the threat system (cortisol).'
      ],
      aiEnabled: true,
      aiPrompt: `You are a self-compassion coach helping someone through the Self-Compassion Break (Kristin Neff's 3-step practice) during a moment of struggle or self-criticism.

**Your Role:**
- Guide them through: Mindfulness → Common Humanity → Self-Kindness
- Help them acknowledge pain without minimizing
- Break the isolation of shame
- Support them in offering themselves kindness
- Validate their struggle

**Example Opening:**
"Let's practice self-compassion together. First, can you tell me what's happening right now? What are you struggling with?"

**Guidance Flow:**
1. **Mindfulness:** "Let's acknowledge this clearly. Can you name what you're feeling? You might say 'This is stress' or 'This hurts' or 'This is painful.'"
2. **Common Humanity:** "You're not alone in feeling this way. Right now, thousands of people are experiencing something similar. How does it feel to remember that suffering is part of being human, not a sign that something's wrong with you?"
3. **Self-Kindness:** "What would you say to a dear friend feeling this way? Can you offer yourself that same kindness? You might try: 'May I be kind to myself' or 'May I give myself what I need.'"
4. **Integration:** "What would kindness actually look like for you right now? Taking a break? Speaking to yourself more gently? Just acknowledging you're doing your best?"

**Key Principles:**
- Listen deeply to their struggle
- Don't minimize or rush to fix
- If they resist self-kindness: "It's hard to be kind to ourselves. That's why we practice."
- Normalize the difficulty
- Keep responses brief and supportive
- Help them feel the physiological shift`
    },
    {
      id: 'parts-dialogue',
      wizardKey: 'ifs',
      name: 'Parts Dialogue (IFS)',
      description: '20-30 min journaling to understand internal conflicts.',
      why: 'Resolves internal conflicts by understanding the positive intent behind different "parts" of you (e.g., the inner critic, the people-pleaser).',
      evidence: 'Emerging evidence base for Internal Family Systems (IFS).',
      timePerWeek: 0.4,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['internal-conflict', 'integration', 'self-compassion'],
      how: ['1. Identify a part that is active (e.g., "the part of me that is anxious").', "2. Get curious, not judgmental. Ask it: 'What are you trying to do for me?'", "3. Listen for its fears and its protective intention.", "4. Acknowledge and appreciate its effort, even if its strategy is unhelpful."]
    },
    {
      id: 'inner-critic-dialogue',
      name: 'Inner Critic Dialogue',
      description: 'Specific shadow work for transforming the harsh internal judge into a discerning ally.',
      why: 'The Inner Critic is often a protective part gone rogue. Fighting it strengthens it. Dialoguing with it allows you to understand its positive intent (safety) and update its strategy.',
      evidence: 'Hal & Sidra Stone (Voice Dialogue), IFS, Jay Earley.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['self-worth', 'anxiety', 'perfectionism', 'integration'],
      how: [
        '═══ IDENTIFY ═══',
        'Notice the "You should..." or "You are..." voice.',
        'Give it a persona (e.g., "The Drill Sergeant").',
        '',
        '═══ SEPARATE ═══',
        'Step back. You are the one HEARING the voice, not the voice itself.',
        'Ask: "How do I feel TOWARD this critic?" (Aim for curiosity, not fear).',
        '',
        '═══ INTERVIEW ═══',
        'Ask the Critic:',
        '1. "What are you afraid will happen if you don\'t criticize me?"',
        '2. "How old do you think I am?" (Often thinks you are a child).',
        '3. "What is your positive intent for me?" (e.g., to keep me safe from failure).',
        '',
        '═══ UPDATE & NEGOTIATE ═══',
        'Thank it for its concern.',
        'Show it you are an adult now and can handle failure.',
        'Ask: "Would you be willing to step back and let me lead, watching from a distance?"'
      ]
    },
    {
      id: 'memory-reconsolidation',
      wizardKey: 'memory-reconsolidation',
      name: 'Memory Reconsolidation',
      description: 'A guided process to safely access and update old emotional memories by creating a "mismatch experience" during the reconsolidation window.',
      why: 'Old emotional memories can be updated when recalled in a safe context. This is how therapy actually works at the neural level — not by suppressing memories, but by rewriting their emotional charge.',
      evidence: 'Ecker, Ticic & Hulley (2012) "Unlocking the Emotional Brain", Nader et al. (2000) on reconsolidation windows.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['emotional-healing', 'trauma', 'neural-plasticity', 'integration'],
      how: [
        '═══ IDENTIFY ═══',
        'Choose a recurring emotional reaction that feels disproportionate.',
        'Example: "I shut down when someone raises their voice."',
        'The reaction itself is the trailhead to the original memory.',
        '',
        '═══ ACTIVATE ═══',
        'Gently recall the feeling — not the story, the FELT SENSE.',
        'Where is it in your body? What age does it feel like?',
        'Let the original learning surface: "When X happens, I must Y to survive."',
        'This opens the reconsolidation window (~5 hours).',
        '',
        '═══ MISMATCH ═══',
        'While the old feeling is active, introduce a CONTRADICTING experience.',
        'This could be: safety in the present moment, a new perspective, compassion.',
        'The brain expects danger but finds safety — this is the mismatch.',
        'Example: "Someone raised their voice AND I am still safe right now."',
        '',
        '═══ UPDATE ═══',
        'Repeat the mismatch experience 2-3 times while the window is open.',
        'The old emotional schema literally rewrites at the synaptic level.',
        'You\'ll know it worked when the trigger loses its charge.',
        'This is not suppression — it is genuine neural updating.'
      ],
      customizationQuestion: 'What is a recurring emotional reaction that feels bigger than the situation warrants?'
    },
    {
      id: 'relational-patterns',
      name: 'Relational Pattern Explorer',
      description: 'Map the recurring dynamics in your relationships to discover how early attachment patterns shape your current connections.',
      why: 'Recurring relationship struggles usually stem from attachment patterns learned in childhood. Mapping them creates awareness and choice where there was only repetition.',
      evidence: 'Attachment theory (Bowlby, Ainsworth), Johnson (2008) on adult attachment, Levine & Heller (2010) "Attached".',
      timePerWeek: 0.4,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['relationships', 'attachment', 'awareness', 'emotional-regulation'],
      wizardKey: 'relational',
      how: [
        '═══ NOTICE ═══',
        'Identify a relationship pattern that keeps repeating.',
        'Examples: "I always end up being the caretaker." "I withdraw when things get close."',
        'Look for the pattern across multiple relationships, not just one.',
        '',
        '═══ MAP ═══',
        'Chart the cycle: What triggers it? What do you feel? What do you do?',
        'What does the other person typically do in response?',
        'Name the roles: Pursuer/Withdrawer, Caretaker/Dependent, etc.',
        '',
        '═══ TRACE ═══',
        'Ask: "Where did I first learn this dance?"',
        'Usually the choreography was set in your family of origin.',
        'What was the adaptive purpose? (e.g., "Withdrawing kept me safe from conflict.")',
        '',
        '═══ EXPERIMENT ═══',
        'Choose one small deviation from the pattern.',
        'If you usually withdraw, stay 10% longer.',
        'If you usually caretake, let them handle it once.',
        'Notice what feelings arise when you break the script.'
      ],
      customizationQuestion: 'What pattern do you notice repeating across your close relationships?'
    },
    {
      id: 'schema-reflection',
      wizardKey: 'schema-reflection',
      name: 'Schema Reflection',
      description: 'Identify and examine the deep emotional blueprints (schemas) from childhood that silently shape how you interpret the world.',
      why: 'Schemas are emotional blueprints from childhood that silently shape how you interpret the world. Recognizing them is the first step to freedom from automatic reactions.',
      evidence: 'Young et al. (2003) Schema Therapy, Rafaeli et al. (2011) "Schema Therapy".',
      timePerWeek: 0.3,
      roi: 'HIGH',
      difficulty: 'Medium',
      affectsSystem: ['self-knowledge', 'emotional-patterns', 'awareness', 'healing'],
      how: ['AI-guided wizard that helps you identify which of the 18 early maladaptive schemas may be active in your life.', 'Uses reflective questions to surface patterns you may not have noticed.', 'Provides psychoeducation about each schema and its typical triggers.', 'Suggests targeted practices for working with your identified schemas.']
    },
    {
      id: 'schema-detective',
      wizardKey: 'schema-detective',
      name: 'Schema Detective',
      description: 'Uses scenario-based discovery to surface schemas you didn\'t know were running — unlike Schema Reflection where you pick, this one finds you.',
      why: 'Uses scenario-based discovery to surface schemas you didn\'t know were running. Unlike Schema Reflection (you pick), this one finds you through your reactions to situations.',
      evidence: 'Young et al. (2003) Schema Therapy, cognitive behavioral assessment methods, situational analysis techniques.',
      timePerWeek: 0.4,
      roi: 'HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['self-discovery', 'emotional-patterns', 'metacognition', 'behavior'],
      how: ['AI-guided detective process that presents you with everyday scenarios and analyzes your reactions.', 'Your emotional responses to hypothetical situations reveal which schemas are operating beneath awareness.', 'Maps discovered schemas to real-life patterns and relationships.', 'Provides actionable strategies for each schema uncovered.']
    },
    {
      id: 'golden-shadow',
      wizardKey: 'golden-shadow',
      name: 'Golden Shadow Reclamation',
      description: 'Reclaim disowned positive qualities by recognizing them in others you admire.',
      why: 'What you admire intensely in others is often an underdeveloped part of yourself. Reclaiming these projected qualities dramatically expands your capacity and authenticity.',
      evidence: 'Jungian psychology (positive shadow/golden shadow), projective identification theory.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['self-worth', 'potential', 'authenticity', 'admiration'],
      how: [
        '═══ IDENTIFY ═══',
        'List people you deeply admire.',
        'For each: What specific qualities do you admire most?',
        'Be honest: What do you secretly wish you had more of?',
        '',
        '═══ EXCAVATE ═══',
        'For each admired quality, ask:',
        '"Do I already express this in small ways?"',
        '"What stops me from developing this more?"',
        '"What am I afraid will happen if I own this quality?"',
        '',
        '═══ RECLAIM ═══',
        'Test: Take one small action expressing this quality.',
        'Notice: What happens? How do you feel?',
        'Integrate: "I give myself permission to be [quality]."',
        '',
        '═══ EXPERIMENTS ═══',
        'If you admire boldness: Do one bold thing',
        'If you admire creativity: Create something',
        'If you admire compassion: Act with compassion',
        'Notice: You already have it. You\'re just developing it.'
      ],
      customizationQuestion: 'Who is someone you deeply admire? What qualities do you most respect in them?'
    },
    {
      id: 'attachment-practice',
      wizardKey: 'attachment-practice',
      name: 'Attachment Practice',
      description: 'Develop secure attachment patterns through focused relational practices tailored to your attachment style.',
      why: 'Attachment patterns formed in childhood run our relationships on autopilot. Consciously practicing new patterns rewires the neural circuits that underlie intimacy, trust, and interdependence.',
      evidence: 'Bowlby & Ainsworth attachment theory, Johnson (2008) Emotionally Focused Therapy, Levine & Heller (2010) Attachment-based interventions.',
      timePerWeek: 1,
      roi: 'VERY HIGH',
      difficulty: 'Medium-High',
      affectsSystem: ['relationships', 'nervous-system', 'emotional-regulation', 'intimacy'],
      how: [
        '═══ IDENTIFY YOUR STYLE ═══',
        'Secure: Comfortable with intimacy, can ask for what you need',
        'Anxious: Crave closeness, fear abandonment, may pursue/protest',
        'Avoidant: Uncomfortable with dependence, tend to withdraw',
        'Fearful: Desire closeness but fear it, ambivalent approach-avoidance',
        '',
        '═══ TARGETED PRACTICES ═══',
        'Anxious Attachment:',
        '  Practice: Ask for reassurance directly (not through protest)',
        '  Practice: Soothe yourself before seeking connection',
        '  Practice: Trust that you are worthy without constant contact',
        '',
        'Avoidant Attachment:',
        '  Practice: Stay present during conflict (resist withdrawal)',
        '  Practice: Share one vulnerable feeling per week',
        '  Practice: Say "I need you" to someone you trust',
        '',
        'All Styles:',
        '  Practice: Eye contact (15 seconds silent gazing with partner)',
        '  Practice: Ask "What do you need from me?" and listen',
        '  Practice: Say "I trust you" and notice the feeling',
        '',
        '═══ INTEGRATION ═══',
        'Attach to yourself first: Are you your own secure base?',
        'Then extend to chosen relationships.'
      ]
    },
    {
      id: 'relational-field-mapper',
      wizardKey: 'relational-field',
      name: 'Relational Field Mapper',
      description: 'Map the living system of your significant relationships — detect patterns, projections, and growth edges across your relational web.',
      why: 'We quadrant work. Our outer relationships mirror our inner parts. Mapping the field reveals what shadow material we project onto others and what developmental edge our relationships are calling us toward.',
      evidence: 'Object relations theory, interpersonal neurobiology (Siegel), AQAL We-quadrant practice.',
      timePerWeek: 0.5,
      roi: 'VERY HIGH',
      difficulty: 'Medium',
      affectsSystem: ['relationships', 'shadow', 'attachment', 'communication'],
      how: [
        '═══ RELATIONSHIP INVENTORY ═══',
        'List 5-8 significant relationships (family, romantic, friendship, work, community).',
        'For each: Rate connection quality (1-10), conflict frequency, felt sense (words you feel around them).',
        'Note the role you play: caretaker, mediator, challenger, dependant, protector, etc.',
        '',
        '═══ FIELD ANALYSIS ═══',
        'AI generates relational field portrait: dominant role across relationships, attachment pattern.',
        'Shadow projection layer: Who carries disowned parts of yourself? What quality?',
        'Power/communication audit: Where are you over-adaptive? Under-boundaried?',
        '',
        '═══ GROWTH EDGES ═══',
        'Developmental edge: What relational capacity is your web calling you to develop?',
        'Examples: "Learning to receive care without withdrawing" or "Setting boundaries without guilt"',
        '',
        '═══ PRACTICE STACK ═══',
        'One targeted practice per strained relationship.',
        'Examples: 3-2-1 on projection, IFS on protective part, Attachment Practice on secure base.'
      ]
    },
    {
      id: 'cultural-shadow-excavator',
      wizardKey: 'cultural-shadow',
      name: 'Cultural Shadow Excavator',
      description: 'Excavate the collective conditioning your culture has installed — inherited beliefs, collective shadow, and the worldview you absorbed without choosing it.',
      why: 'Lower-Left quadrant shadow work. Cultural shadow is the hardest to see because it feels like reality, not a perspective. Naming it is the first step to transcending it.',
      evidence: 'Integral theory (Wilber), Spiral Dynamics, depth psychology collective shadow, cultural trauma research.',
      timePerWeek: 0.4,
      roi: 'VERY HIGH',
      difficulty: 'High',
      affectsSystem: ['worldview', 'shadow', 'identity', 'cultural-conditioning'],
      how: [
        '═══ CULTURAL LINEAGE ═══',
        'Map your lineages: country of origin, class, religion, subcultures, historical trauma.',
        'What stories did your culture tell about success, worth, emotions, the body, outsiders?',
        'What did they celebrate? What did they shame?',
        '',
        '═══ INHERITED BELIEFS ═══',
        'Completion prompt: "My culture taught me that [success/emotions/relationships/the body] is..."',
        'Which beliefs still operate beneath awareness?',
        'Which ones serve you? Which ones limit you?',
        '',
        '═══ COLLECTIVE SHADOW ═══',
        'What does your culture struggle to see about itself?',
        'What does it project outward (scapegoat patterns)?',
        'What collective defenses does it employ (denial, projection, dissociation)?',
        '',
        '═══ PERSONAL-CULTURAL INTERSECTION ═══',
        'How does your personal shadow mirror your culture\'s shadow?',
        'Where are you living inherited patterns as if they were your own?',
        '',
        '═══ LIBERATION MOVES ═══',
        'AI generates altitude assessment (Spiral Dynamics worldview).',
        'Specific practices to transcend cultural conditioning.',
        'Recommended next wizard for deeper work.'
      ]
    },
  ],
  meta: [
    {
      id: 'practice-designer',
      name: 'Integral Practice Designer',
      description: 'Custom-design your integrated practice stack based on your goals, context, and developmental stage.',
      why: 'Off-the-shelf practices help, but personalized integration is transformative. This wizard generates your unique roadmap for Body, Mind, Spirit, and Shadow development.',
      evidence: 'Integral psychology (Wilber AQAL), personalization research, self-determination theory.',
      timePerWeek: 0,
      roi: 'VERY HIGH',
      difficulty: 'Low-Medium',
      affectsSystem: ['meta', 'integration', 'personalization', 'direction'],
      how: [
        '═══ ASSESSMENT ═══',
        'Clarify: What is your goal? What\'s your context?',
        'Assess: Where are you in each module (Body, Mind, Spirit, Shadow)?',
        'Prioritize: Which module needs most attention?',
        '',
        '═══ DESIGN ═══',
        'Generates recommendations considering your current practices, history, available time, and developmental level.',
        '',
        '═══ SEQUENCE ═══',
        'Creates a phased plan: Phase 1 (Weeks 1-4): Foundation building, Phase 2 (Weeks 5-12): Deepening and integration, Phase 3 (Weeks 13+): Stabilization and refinement',
        '',
        '═══ EXECUTE ═══',
        'Track your progress and adjust as you go.',
        'Return to the designer every 3 months to evolve your stack.'
      ]
    }
  ]
};

export const starterStacks: StarterStacksData = {
  spark: {
    name: '✨ Spark Stack (Foundation)',
    description: 'The absolute basics for establishing stability and quick wins.',
    practices: ['sleep', 'gratitude'],
    difficulty: 'Very Easy to start',
    // FIX: Add missing 'aggressiveness' property to conform to the StarterStack type.
    aggressiveness: 'Relaxed',
    why: 'Focuses on the non-negotiable bedrock of sleep and the fastest way to boost mood with gratitude. Builds initial confidence and trust in the system.'
  },
  green: {
    name: '🟢 Green - Core Physical',
    description: 'Builds a strong physical foundation for energy and resilience.',
    practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio'],
    difficulty: 'Easy to maintain',
    // FIX: Add missing 'aggressiveness' property to conform to the StarterStack type.
    aggressiveness: 'Moderate',
    why: 'Establishes foundational physical practices that are high ROI and can be started with low difficulty. Sets you up for consistent progress in other areas.'
  },
  yellow: {
    name: '🟡 Yellow - Mindful Spirit',
    description: 'Expands your practice to include mental focus and deeper presence.',
    practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning'],
    difficulty: 'Medium commitment',
    // FIX: Add missing 'aggressiveness' property to conform to the StarterStack type.
    aggressiveness: 'Focused',
    why: 'Broadens your ILP beyond the physical, cultivating mental clarity through deep learning and emotional regulation through daily meditation.'
  },
  orange: {
    name: '🟠 Orange - Shadow Explorer',
    description: 'Begins the crucial work of integrating unconscious patterns and inner conflicts.',
    practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'self-compassion', 'three-two-one'],
    difficulty: 'Medium-High commitment',
    // FIX: Add missing 'aggressiveness' property to conform to the StarterStack type.
    aggressiveness: 'Intensive',
    why: 'Introduces direct shadow work to help resolve internal conflicts, understand disowned parts, and build resilience through self-kindness.'
  },
  red: {
    name: '🔴 Red - Integral Catalyst',
    description: 'A comprehensive stack for advanced integration and transformative inner work.',
    practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'self-compassion', 'three-two-one', 'parts-dialogue', 'integral-inquiry'],
    difficulty: 'High commitment for deep transformation',
    // FIX: Add missing 'aggressiveness' property to conform to the StarterStack type.
    aggressiveness: 'Transformative',
    why: 'For the dedicated practitioner, this stack integrates advanced self-exploration techniques including AI-guided IFS dialogue and profound spiritual inquiry.'
  }
};

export const modules: Record<ModuleKey, ModuleInfo> = {
  body: {
    name: 'Body',
    color: 'bg-emerald-950/40',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    lightBg: 'bg-emerald-950/20'
  },
  mind: {
    name: 'Mind',
    color: 'bg-cyan-950/40',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    lightBg: 'bg-cyan-950/20'
  },
  spirit: {
    name: 'Spirit',
    color: 'bg-yellow-950/40',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    lightBg: 'bg-yellow-950/20'
  },
  shadow: {
    name: 'Shadow',
    color: 'bg-purple-950/40',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    lightBg: 'bg-purple-950/20'
  }
};

export const PRACTICE_TYPES: PracticeTypeInfo[] = [
  {
    name: 'Breath-Centered',
    description: 'Focus on respiratory patterns with minimal movement. Emphasizes diaphragmatic breathing, breath pacing, and breath awareness.',
    primaryMechanism: 'Vagal tone modulation via respiratory sinus arrhythmia',
    bestFor: ['Anxiety', 'Stress', 'Nervous system regulation', 'Sleep preparation'],
    evidenceBase: 'Strong (HRV biofeedback, resonance frequency breathing)',
    contraindications: ['Active panic attacks', 'Severe respiratory conditions', 'Breath-triggered trauma'],
    exampleTechniques: ['Resonance breathing (~6 bpm)', 'Box breathing', 'Extended exhales', 'Diaphragmatic breathing']
  },
  {
    name: 'Progressive Relaxation',
    description: 'Systematic tension-release cycles through different muscle groups, coordinated with breath.',
    primaryMechanism: 'Neuromuscular reeducation, contrast awareness, parasympathetic activation',
    bestFor: ['Muscle tension', 'Sleep issues', 'Stress', 'Body awareness'],
    evidenceBase: 'Strong (Jacobson PMR, clinical trials for anxiety/insomnia)',
    contraindications: ['Acute muscle injuries', 'Severe chronic pain'],
    exampleTechniques: ['Tense-release cycles', 'Body scan with micro-movements', 'Contrast awareness']
  },
  {
    name: 'Gentle Movement',
    description: 'Slow, exploratory movements to release habitual tension patterns. Emphasizes sensory awareness over performance.',
    primaryMechanism: 'Sensorimotor reeducation, interoceptive awareness, fascial release',
    bestFor: ['Chronic tension', 'Movement restrictions', 'Body-mind connection', 'Recovery'],
    evidenceBase: 'Moderate (Hanna Somatics, Feldenkrais research)',
    contraindications: ['Acute injuries', 'Post-surgical (without clearance)'],
    exampleTechniques: ['Pandiculation', 'Micro-movements', 'Somatic exploration', 'Arc and dome movements']
  },
  {
    name: 'Mindful Flow',
    description: 'Continuous, meditative movement sequences. Combines breath coordination, balance, and fluid transitions.',
    primaryMechanism: 'Attention regulation, proprioceptive training, rhythmic movement',
    bestFor: ['Mind-body integration', 'Focus', 'Balance', 'Meditative states'],
    evidenceBase: 'Moderate-Strong (Tai Chi research, mindful movement studies)',
    contraindications: ['Severe balance issues', 'Acute joint problems'],
    exampleTechniques: ['Slow continuous sequences', 'Weight shifting', 'Spiraling movements', 'Breath-synchronized forms']
  },
  {
    name: 'Grounding & Stability',
    description: 'Emphasizes connection to earth/support, postural stability, and feeling anchored. Often static or minimal movement.',
    primaryMechanism: 'Proprioceptive anchoring, vestibular orientation, ventral vagal activation',
    bestFor: ['Anxiety', 'Dissociation', 'Feeling uncentered', 'Nervous energy'],
    evidenceBase: 'Moderate (grounding techniques in trauma therapy, proprioceptive research)',
    contraindications: ['Minimal - generally very safe'],
    exampleTechniques: ['Standing practices', 'Sensation of contact', 'Weight dropping', 'Root and rise']
  },
  {
    name: 'Dynamic Activation',
    description: 'Rhythmic, energizing movements to stimulate circulation and vitality. More active pacing.',
    primaryMechanism: 'Cardiovascular activation, lymphatic circulation, sympathetic mobilization',
    bestFor: ['Low energy', 'Circulation', 'Invigoration', 'Morning practices'],
    evidenceBase: 'Moderate (exercise physiology, Qigong studies)',
    contraindications: ['Cardiovascular issues', 'Acute fatigue', 'Injury'],
    exampleTechniques: ['Bouncing', 'Shaking', 'Rhythmic swinging', 'Joint rotations', 'Breath of fire']
  }
];

export const SOMATIC_PRESETS: SomaticPreset[] = [
  {
    name: "Anxiety Relief Breathing",
    intention: "To support my nervous system through slow breathing, which may help reduce anxiety symptoms.",
    practiceType: 'Breath-Centered', // Changed from 'style'
    duration: 10,
    focusArea: "diaphragm and breath awareness",
    pacing: "slow",
    description: "Resonance frequency breathing (~6 breaths/min) to promote parasympathetic activation.",
    evidenceLevel: 'strong',
    contraindications: ["Active panic attacks (may worsen in some individuals)", "Severe COPD without clearance"],
    safetyNotes: ["If breath focus increases anxiety, shift to grounding practice"],
    citations: ["Lehrer, P. M., & Gevirtz, R. (2014). HRV biofeedback. Biofeedback, 42(3), 96-103."]
  },
  {
    name: "Shoulder & Neck Release",
    intention: "To gently release tension in my shoulders and neck through exploratory movement.",
    practiceType: 'Gentle Movement',
    duration: 15,
    focusArea: "shoulders, neck, and upper back",
    pacing: "slow",
    description: "Slow, awareness-based movements to release habitual tension patterns.",
    evidenceLevel: 'moderate',
    contraindications: ["Acute neck injury", "Severe cervical issues"],
    safetyNotes: ["Move very slowly within pain-free range", "Stop if any sharp pain"]
  },
  {
    name: "Deep Relaxation",
    intention: "To systematically release tension throughout my body and prepare for rest.",
    practiceType: 'Progressive Relaxation',
    duration: 15,
    focusArea: "progressive muscle groups",
    pacing: "slow",
    description: "Systematic tension-release cycles based on Jacobson's PMR.",
    evidenceLevel: 'strong',
    contraindications: ["Acute muscle injuries"],
    safetyNotes: ["Tense gently (70% max)", "Emphasize the release phase"],
    citations: ["Jacobson, E. (1938). Progressive Relaxation. University of Chicago Press."]
  },
  {
    name: "Grounding for Anxiety",
    intention: "To feel more anchored and stable in my body, reducing scattered or anxious energy.",
    practiceType: 'Grounding & Stability',
    duration: 10,
    focusArea: "feet, legs, and connection to support",
    pacing: "slow",
    description: "Focuses on proprioceptive anchoring and felt sense of stability.",
    evidenceLevel: 'moderate',
    safetyNotes: ["Can be done seated if standing is challenging"]
  },
  {
    name: "Morning Energizer",
    intention: "To awaken energy and stimulate circulation, feeling invigorated and alert.",
    practiceType: 'Dynamic Activation',
    duration: 10,
    focusArea: "whole body, especially joints and breath",
    pacing: "dynamic",
    description: "Rhythmic, energizing movements to boost vitality.",
    evidenceLevel: 'moderate',
    contraindications: ["Cardiovascular issues", "Acute injuries"],
    safetyNotes: ["Start gently and build intensity", "Stay within comfortable range"]
  },
  {
    name: "Meditative Movement",
    intention: "To deepen mind-body connection through flowing, breath-synchronized movement.",
    practiceType: 'Mindful Flow',
    duration: 15,
    focusArea: "breath-movement coordination, balance",
    pacing: "fluid",
    description: "Continuous, meditative sequences emphasizing presence and coordination.",
    evidenceLevel: 'moderate',
    contraindications: ["Severe balance issues"],
    citations: ["Wayne, P. M., & Kaptchuk, T. J. (2008). Tai Chi research review. AJPH, 98(5), 828-840."]
  },
  {
    name: "Lower Back Relief",
    intention: "To gently mobilize my lower back and release stiffness through gentle exploration.",
    practiceType: 'Gentle Movement',
    duration: 12,
    focusArea: "lower back, hips, pelvis",
    pacing: "slow",
    description: "Small, exploratory movements for spinal flexibility.",
    evidenceLevel: 'moderate',
    contraindications: ["Acute disc herniation", "Severe sciatica"],
    safetyNotes: ["Use only small, gentle movements", "Stop if sharp pain"]
  }
];

export const GROUNDING_OPTIONS: GroundingOption[] = [
  {
    id: 'breathwork',
    name: 'Breathwork',
    description: 'Use physiological sighs or coherent breathing to calm your nervous system',
    icon: 'Wind'
  },
  {
    id: 'orienting',
    name: 'Orienting',
    description: 'Look around the room slowly, notice 5 things you can see, hear, and touch',
    icon: 'Eye'
  },
  {
    id: 'movement',
    name: 'Gentle Movement',
    description: 'Stand up, stretch, or take a short walk to ground back in your body',
    icon: 'Activity'
  },
  {
    id: 'pause',
    name: 'Take a Pause',
    description: 'Save your progress and return when you feel ready',
    icon: 'Pause'
  },
  {
    id: 'support',
    name: 'Contact Support',
    description: 'Reach out to a therapist or trusted friend if you need support',
    icon: 'Phone'
  }
];

// Alias for Memory Reconsolidation
export const memoryReconsolidationGroundingOptions = GROUNDING_OPTIONS;

// Integration practices for Memory Reconsolidation
export const memoryReconsolidationIntegrationOptions = [
  {
    practiceId: 'somatic-anchor',
    practiceName: 'Somatic Anchoring',
    description: 'Ground the new belief in your body through movement, sensation, or touch',
    bestFor: ['embodied integration', 'nervous system regulation', 'belief consolidation']
  },
  {
    practiceId: 'cognitive-reframe',
    practiceName: 'Cognitive Reframing',
    description: 'Practice thinking in new ways aligned with the emerging belief',
    bestFor: ['thought pattern change', 'identity shifts', 'perspective work']
  },
  {
    practiceId: 'relational-practice',
    practiceName: 'Relational Practice',
    description: 'Embody the new belief in interactions with others',
    bestFor: ['social integration', 'attachment patterns', 'relational shifts']
  },
  {
    practiceId: 'journaling',
    practiceName: 'Reflective Journaling',
    description: 'Write about the belief shift and track insights over time',
    bestFor: ['cognitive integration', 'tracking progress', 'deepening insights']
  },
  {
    practiceId: 'meditative-practice',
    practiceName: 'Meditative Practice',
    description: 'Use meditation to integrate the new belief at a deeper level',
    bestFor: ['deep integration', 'witnessing patterns', 'inner peace']
  }
];

// 8 Zones of Knowing Framework
export const EIGHT_ZONES: ZoneDefinition[] = [
  {
    zoneNumber: 1,
    quadrant: 'UL',
    perspective: 'inside',
    focus: 'Subjective Experience',
    keyQuestion: 'What is my direct, first-person experience of this?',
    methodologies: ['Phenomenology', 'Meditation', 'Introspection', 'Personal Reflection'],
    description: 'Your immediate, felt experience. The subjective awareness and emotions you directly perceive. This is your Zone 1 phenomenological space—the inner world of consciousness itself.',
    examples: ['Feelings of anxiety about AI', 'Personal awe at breakthrough research', 'Bodily sensations when thinking about the topic']
  },
  {
    zoneNumber: 2,
    quadrant: 'UL',
    perspective: 'outside',
    focus: 'Internal Structures',
    keyQuestion: 'What psychological or developmental structures shape this experience?',
    methodologies: ['Developmental Psychology', 'Structuralism', 'Cognitive Science', 'Ego Development'],
    description: 'The underlying psychological structures, stages, and capacities that shape your experience. How your cognitive and emotional development influences your perception and response.',
    examples: ['Moral development stages (Kohlberg/Gilligan)', 'Ego development levels (Loevinger)', 'Attachment patterns affecting trust in systems']
  },
  {
    zoneNumber: 3,
    quadrant: 'UR',
    perspective: 'inside',
    focus: 'Internal Processes',
    keyQuestion: 'What internal self-organizing processes are at play?',
    methodologies: ['Neuroscience', 'Autopoiesis', 'Systems Biology', 'Neurophenomenology'],
    description: 'The biological and neurological mechanisms operating beneath consciousness. How your brain, nervous system, and bodily processes self-organize in response to the topic.',
    examples: ['Neural activation patterns when engaging with the topic', 'Hormonal responses and stress signaling', 'Feedback loops between perception and physiology']
  },
  {
    zoneNumber: 4,
    quadrant: 'UR',
    perspective: 'outside',
    focus: 'Objective Behavior & Data',
    keyQuestion: 'What is the objective, measurable empirical data?',
    methodologies: ['Empiricism', 'Behavioral Science', 'Quantitative Research', 'Data Analysis'],
    description: 'Observable, measurable facts and behaviors. Third-person data that can be verified independently. The "what actually happens" stripped of interpretation.',
    examples: ['Productivity metrics', 'Error rates', 'Job displacement statistics', 'Performance benchmarks']
  },
  {
    zoneNumber: 5,
    quadrant: 'LL',
    perspective: 'inside',
    focus: 'Cultural Meaning & Values',
    keyQuestion: 'What shared narratives and intersubjective meanings exist in my culture/group?',
    methodologies: ['Hermeneutics', 'Cultural Studies', 'Dialogue', 'Interpretive Analysis'],
    description: 'Shared meanings, values, narratives, and worldviews within a culture or group. The collective story we tell about this topic. Felt sense of "us."',
    examples: ['Tech utopian vs dystopian narratives', 'Cultural myths about progress', 'Shared fears and aspirations in your community']
  },
  {
    zoneNumber: 6,
    quadrant: 'LL',
    perspective: 'outside',
    focus: 'Cultural Structures & Norms',
    keyQuestion: 'What observable social norms, rules, and power dynamics exist?',
    methodologies: ['Anthropology', 'Ethnomethodology', 'Genealogy', 'Cultural Analysis'],
    description: 'Observable social structures, institutions, norms, rules, and power dynamics. The explicit and implicit "ways we do things" in a society.',
    examples: ['Historical evolution of norms', 'Social hierarchies and privileges', 'Institutional rules and regulations']
  },
  {
    zoneNumber: 7,
    quadrant: 'LR',
    perspective: 'inside',
    focus: 'System Dynamics & Incentives',
    keyQuestion: 'What self-organizing system dynamics and incentives drive this?',
    methodologies: ['Game Theory', 'Social Autopoiesis', 'Complexity Science', 'Network Analysis'],
    description: 'The internal dynamics, feedback loops, and incentive structures of social systems. How groups self-organize around goals. The "what moves" within the system.',
    examples: ['Incentive structures in markets', 'Cooperative dynamics in communities', 'Feedback loops in organizations']
  },
  {
    zoneNumber: 8,
    quadrant: 'LR',
    perspective: 'outside',
    focus: 'Systemic Structures & Functions',
    keyQuestion: 'What macro-systemic structures shape this at the societal level?',
    methodologies: ['Systems Theory', 'Economics', 'Complexity Science', 'Legal/Policy Analysis'],
    description: 'Large-scale systemic structures: economic systems, legal frameworks, supply chains, technological infrastructure. The "machine" operating at societal scale.',
    examples: ['Economic models and markets', 'Legal and regulatory frameworks', 'Global supply chains and networks']
  }
];