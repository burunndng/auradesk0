import { BioenergeneticsPractice, BioenergeneticsStep } from '../types.ts';

export const bioenergeneticsPractices: BioenergeneticsPractice[] = [
  {
    id: 'standing-meditation',
    name: 'Standing Meditation',
    shortDescription: 'Feel your feet. Establish ground contact.',
    intention: 'Build foundational grounding and nervous system stability',
    duration: { min: 3, max: 5 },
    difficulty: 'Beginner',
    focusSegments: ['pelvic', 'legs'],
    primaryMechanism: 'Proprioceptive ground contact, vagal tone stabilization, parasympathetic activation',
    evidenceLevel: 'Strong',
    safetyNotes: [
      'Stop if you feel dizzy—sit down immediately',
      'If you feel numb or disconnected, open your eyes and look around the room'
    ],
    contraindications: [
      'Severe dizziness or vertigo',
      'Recent surgery or acute injury'
    ],

    explanation: {
      overview: `Standing Meditation is the foundation of all bioenergetics work. You're not trying to "feel energy" or achieve a special state. You're simply learning to feel your feet on the ground—your literal contact with the earth. This grounds your nervous system, activates your parasympathetic (calming) branch, and prepares you for deeper work.`,
      mechanism: `When you feel your feet clearly, proprioceptive neurons in your feet and legs send signals to your brain that you are supported and safe. This activates your ventral vagal system (the "social engagement" state), lowering your heart rate and anxiety. Many people spend their whole lives "up in their head"—disconnected from their body. This practice reverses that.`,
      benefits: [
        'Reduces anxiety and hypervigilance',
        'Improves balance and spatial awareness',
        'Prepares you for discharge work (grounding is a prerequisite)',
        'Feels calming within 1-2 minutes'
      ],
      whenToUse: 'Anytime, especially when anxious, scattered, or before other bioenergetics practices. Do this daily if possible.'
    },

    steps: [
      {
        order: 1,
        title: 'Find Your Stance',
        instructions: 'Stand feet hip-width apart, toes forward, knees softly bent. Your feet are your foundation.',
        cues: [
          'Feet parallel, toes forward',
          'Feel both heels contacting the ground equally',
          'Knees have a soft bend',
          'Weight balanced 50/50 between both feet',
          'Shoulders relaxed, not hunched'
        ]
      },
      {
        order: 2,
        title: 'Wake Up Your Feet',
        instructions: 'Close your eyes or soften your gaze. Take 3 slow breaths. Shift attention to your feet. Notice contact with the ground—temperature, pressure, texture.',
        duration: '60 seconds',
        cues: [
          'What texture is the ground? Hard? Warm?',
          'Can you feel the full arch, or just heel and ball?',
          'Is the contact solid or vague?',
          'Rock your weight slightly forward-back to wake sensation',
          'Numbness is normal—your feet will "turn on" with practice'
        ],
        ifModified: 'If numb, keep attention on feet for longer. Gentle rocking helps.'
      },
      {
        order: 3,
        title: 'Become the Earth',
        instructions: 'Imagine your bones are heavy like stone. Gravity pulls down through your legs and feet into the ground. Let your weight sink with each exhale. Breathe naturally, no control.',
        duration: '2-3 minutes',
        cues: [
          'Feel the ground pushing UP into your feet equally',
          'Trembling or vibration is your nervous system releasing—let it happen',
          'Keep your belly soft. Don\'t hold your breath.',
          'Jaw relaxed. Notice if you\'re clenching.',
          'As you settle, notice your breathing naturally slowing',
          'The earth holds you'
        ],
        ifModified: 'If tremoring is intense, soften your knees. Tremors are your body healing.'
      },
      {
        order: 4,
        title: 'Witness What Shifted',
        instructions: 'Slowly open your eyes. Take a moment. Notice what\'s different. Just witness—no right answer.',
        cues: [
          'Is your breathing faster, slower, or the same?',
          'Do you feel more grounded or anxious?',
          'Did your legs vibrate or tremble? Excellent if so.',
          'How does the ground feel now compared to before?',
          'Notice your emotional state without judgment'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'I don\'t feel anything in my feet. Am I doing it wrong?',
        answer: 'No. If you\'re dissociated or armored, sensation may be numb. This is normal. Keep your attention on your feet for longer—3-5 minutes. You can also gently rock your weight forward and back to wake up the sensation. Your feet will "turn on" over time.'
      },
      {
        question: 'My legs are shaking. Is this normal?',
        answer: 'Yes! Shaking or trembling is a sign your nervous system is activating and releasing. This is healthy. Don\'t try to stop it. Let it happen. This is the body healing itself.'
      },
      {
        question: 'How long should I do this?',
        answer: '3-5 minutes is ideal. If you\'re new, start with 3 minutes. Over time, you can extend to 5-10 minutes if you want. But even 1 minute of standing meditation is better than nothing.'
      },
      {
        question: 'Can I do this with my eyes open?',
        answer: 'Yes. Closed eyes help with internal focus, but open is fine too. Do whatever feels safest. If you feel anxious with eyes closed, keep them open.'
      },
      {
        question: 'Should I breathe in a special way?',
        answer: 'No. Breathe naturally. Don\'t control your breath. Let your belly move with the breath. If you hold your breath, your body can\'t release.'
      }
    ]
  },

  {
    id: 'heel-drops',
    name: 'Heel Drops',
    shortDescription: 'Activate your legs. Wake up the body.',
    intention: 'Build leg activation and neurogenic tremor discharge',
    duration: { min: 2, max: 3 },
    difficulty: 'Beginner',
    focusSegments: ['pelvic', 'legs', 'whole-body'],
    primaryMechanism: 'Impact-triggered proprioceptive feedback, shock absorption activating reflexive tremor',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if you feel sharp pain in knees or joints',
      'Make sure you have solid footing—nothing slippery'
    ],
    contraindications: [
      'Joint pain or arthritis in knees/ankles',
      'Recent knee/ankle injury',
      'Osteoporosis',
      'Pregnancy'
    ],

    explanation: {
      overview: `Heel Drops is simple: you stand on the balls of your feet and drop your heels sharply to the ground. The impact sends a shock through your body, waking up your legs and nervous system. This is a quick way to trigger the neurogenic tremor response—your body\'s natural way of releasing accumulated tension and activation.`,
      mechanism: `When you drop your heels, the impact is absorbed through your legs, triggering proprioceptive feedback that activates the tremor reflex. Your nervous system interprets this as "something just happened"—and responds by tremoring to discharge any held tension. This is the same mechanism as Traumatic Release Exercises (TRE).`,
      benefits: [
        'Rapid activation of leg tremoring',
        'Wakes up a numb or dissociated body',
        'Builds charge quickly',
        'Prepares you for deeper discharge work'
      ],
      whenToUse: 'When you feel numb, disconnected, or want to wake up your body. Before other practices.'
    },

    steps: [
      {
        order: 1,
        title: 'Get on Your Toes',
        instructions: 'Stand feet hip-width apart. Rise up onto the balls of your feet, heels off the ground.',
        duration: '10-15 seconds',
        cues: [
          'Feel your calf muscles working',
          'Keep your body upright',
          'Jaw loose'
        ]
      },
      {
        order: 2,
        title: 'Drop with Impact',
        instructions: 'Drop heels sharply to the ground, feel the shock rise through your legs. Immediately rise back up. Repeat 20-30 times rhythmically.',
        duration: '20-30 drops',
        cues: [
          'Each drop is sharp, not gentle',
          'Feel shock traveling up your legs',
          'Steady rhythm—like a drum',
          'Exhale as you drop'
        ]
      },
      {
        order: 3,
        title: 'Let Your Legs Vibrate',
        instructions: 'Plant feet flat on ground. Stand still. Let your legs shake and tremor naturally.',
        duration: '1-2 minutes',
        cues: [
          'Breathe naturally',
          'Let trembling happen',
          'Stand still—don\'t force it',
          'Can do another round if tremors stop'
        ]
      },
      {
        order: 4,
        title: 'Rest and Notice',
        instructions: 'Sit or stand still. Notice what changed in your body.',
        cues: [
          'How do you feel now?',
          'Are your legs still vibrating?',
          'What\'s different compared to before?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Should I do heel drops fast or slow?',
        answer: 'Rhythmic and steady—like a drum. Not frantically fast, but with a clear beat. Aim for 1 drop per second. This allows your nervous system to sync with the rhythm.'
      },
      {
        question: 'My legs aren\'t tremoring. What\'s wrong?',
        answer: 'Try one more round of drops, or increase the impact slightly. Some people tremor easily; others take more time. Be patient. If still nothing, your nervous system may need gentler work first. Try Standing Meditation instead.'
      },
      {
        question: 'Can I do this daily?',
        answer: 'Yes. Heel Drops are safe to do daily. They\'re a quick way to activate. But if you do them, integrate afterward (rest 5 minutes with slow breathing).'
      },
      {
        question: 'Is the sound okay?',
        answer: 'Yes. The dropping sound is part of it. If you live in an apartment and noise is an issue, you can do this on a mat and drop more gently.'
      }
    ]
  },

  {
    id: 'forward-bend',
    name: 'Forward Bend with Knee Bend',
    shortDescription: 'Release your lower body and unlock your breath.',
    intention: 'Deep pelvic and diaphragmatic release, full-body discharge',
    duration: { min: 1, max: 3 },
    difficulty: 'Beginner',
    focusSegments: ['pelvic', 'abdominal', 'diaphragmatic', 'legs'],
    primaryMechanism: 'Gravity-assisted spinal flexion, diaphragm release, neurogenic tremor in legs',
    evidenceLevel: 'Strong',
    safetyNotes: [
      'If dizzy, bend knees more or come up slowly',
      'Stop if you feel numb or dissociated (come up, open eyes)',
      'If pain (not stretch) appears, come up slowly'
    ],
    contraindications: [
      'Severe lower back pain or herniated disc',
      'Uncontrolled high blood pressure',
      'Recent spine surgery'
    ],

    explanation: {
      overview: `This is a Lowenian classic. You roll down forward, let your head hang, and breathe. Your legs may vibrate or tremble—this is discharge. The forward bend stretches the entire posterior chain (back, glutes, hamstrings) and allows the diaphragm to release. It\'s one of the fastest ways to induce neurogenic tremor and emotional release.`,
      mechanism: `When you hang forward, gravity pulls on your spine, creating traction. Your hamstrings and calves stretch, triggering proprioceptive feedback. The inversion (head below heart) also affects your vagal nerve, promoting parasympathetic activation. Combined with deep breathing, this often triggers tremoring in the legs—a sign your nervous system is discharging held tension.`,
      benefits: [
        'Rapid tremoring and discharge',
        'Releases lower back and hamstring tension',
        'Allows diaphragm to open',
        'Can trigger emotional release (tears, sighs, laughter)',
        'One of the most powerful beginner techniques'
      ],
      whenToUse: 'When you want deeper release than grounding alone. After Standing Meditation or Heel Drops. Great for pelvic armor release.'
    },

    steps: [
      {
        order: 1,
        title: 'Setup: Feet Parallel',
        instructions: 'Stand feet hip-width apart, toes forward. Keep knees soft—not locked.',
        cues: [
          'Feet parallel, not splayed',
          'Knees soft and ready to bend',
          'Jaw relaxed'
        ]
      },
      {
        order: 2,
        title: 'Roll Down Slowly',
        instructions: 'Slowly roll down from the top of your head, vertebra by vertebra. Let your neck and arms hang naturally.',
        duration: '10-20 seconds',
        cues: [
          'Go slowly—no jerking',
          'Feel each vertebra moving',
          'Let gravity do the work',
          'Exhale as you roll'
        ]
      },
      {
        order: 3,
        title: 'Bend Your Knees',
        instructions: 'Bend knees as much as needed. Head hangs free, lower back relaxed. This is NOT a stretch.',
        cues: [
          'Knees bent—no stiff stretching',
          'Head hangs loose, no neck tension',
          'Belly soft and relaxed',
          'Shoulders released'
        ],
        ifModified: 'Can\'t reach the floor? Rest hands on shins or thighs—this is fine.'
      },
      {
        order: 4,
        title: 'Breathe and Release',
        instructions: 'Stay here 1-3 minutes. Breathe naturally into your belly. Let your legs shake if they want to—don\'t force it.',
        duration: '1-3 minutes',
        cues: [
          'Breathe into your belly',
          'Feel your upper body hanging',
          'If legs tremor, let them happen',
          'Emotions (tears, sighs, laughter) are normal'
        ]
      },
      {
        order: 5,
        title: 'Roll Up Slowly',
        instructions: 'Slowly roll back up from your lower back, then middle back, upper back. Head comes up last. Pause standing.',
        duration: '10-20 seconds',
        cues: [
          'Roll slowly—don\'t rush',
          'Use your hands for support',
          'Head comes up last',
          'Stand still and notice the shift'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'My legs are tremoring. Should I stop?',
        answer: 'No! Keep going. Tremoring is exactly what we want. This is your nervous system discharging. Let it happen. The more you let it, the more release you\'ll feel.'
      },
      {
        question: 'I feel numb or disconnected. Is this normal?',
        answer: 'If numbness is mild, it may mean you\'re dissociated—your body protecting you. You can continue slowly, or come up. If you feel very floaty or far away, come up, stand, open your eyes, and ground your feet. You\'re safe.'
      },
      {
        question: 'I don\'t feel anything. Is the practice not working?',
        answer: 'Numbness/no feeling often means heavy armoring. This is normal. Keep showing up. Over multiple sessions, sensation will return. Your body will gradually trust that it\'s safe to feel.'
      },
      {
        question: 'Can I bounce or deepen the stretch?',
        answer: 'No bouncing. This isn\'t a stretching exercise. The goal is to relax and let tremoring happen. Bouncing interferes with the natural release. Just hang and breathe.'
      },
      {
        question: 'What if I cry or laugh?',
        answer: 'Perfect. Emotions surfacing is the work working. This is emotional release. Let it come. You\'re safe. Keep breathing. The emotion will pass.'
      }
    ]
  },

  {
    id: 'the-bow',
    name: 'The Bow (Arch)',
    shortDescription: 'Open your chest. Break heart armor.',
    intention: 'Release thoracic armor, build charge, express vulnerability',
    duration: { min: 1, max: 2 },
    difficulty: 'Intermediate',
    focusSegments: ['thoracic', 'diaphragmatic', 'oral'],
    primaryMechanism: 'Pectoral stretch with breathing + vocalization, thoracic charge building, emotional gateway activation',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'If dizzy, release the pose immediately',
      'If panic arises, come forward slowly',
      'Sound is part of the practice—don\'t suppress it even if embarrassed'
    ],
    contraindications: [
      'Uncontrolled high blood pressure',
      'Recent open-heart surgery or chest trauma',
      'Severe back pain or spondylolisthesis',
      'Advanced pregnancy'
    ],

    explanation: {
      overview: `The Bow is a signature Lowenian technique. It\'s deceptively powerful: you arch your back, open your chest, and make sound. The combination breaks through thoracic ("heart") armor—the chronic tension that protects against grief, longing, and vulnerability. Many people hold their breath and collapse their chest. The Bow forces you to feel differently. It\'s an advanced beginner practice.`,
      mechanism: `Thoracic armor is held by pectoral muscles, intercostals, and chronic shallow breathing. When you arch your back and open your chest, you stretch those muscles and expand the thoracic space. Adding sound (vocalization) provides internal vibration that breaks the muscular holding pattern. Your nervous system initially panics ("exposure!"), then releases ("I\'m safe to feel").`,
      benefits: [
        'Opens chest and allows full breathing',
        'Breaks through grief, longing, heartbreak',
        'Builds charge rapidly',
        'Can trigger sobbing, sighing, laughter',
        'Reclaims vulnerability as strength'
      ],
      whenToUse: 'After you\'ve practiced grounding (Standing Meditation) and want deeper emotional work. Best done with good support (safe space).'
    },

    steps: [
      {
        order: 1,
        title: 'Setup: Feet Grounded',
        instructions: 'Stand feet shoulder-width, toes inward (pigeon-toed), knees soft. This stabilizes your pelvis for upper back arch.',
        cues: [
          'Feet shoulder-width, toes inward',
          'Knees soft, not locked',
          'Pelvis neutral—don\'t tuck or thrust'
        ]
      },
      {
        order: 2,
        title: 'Place Your Fists',
        instructions: 'Make loose fists at your lower back, just above sacrum. Knuckles point back.',
        cues: [
          'Fists on lower back (sacrum area)',
          'Knuckles point backward',
          'Gentle support, not hard pressure'
        ]
      },
      {
        order: 3,
        title: 'Arch and Open',
        instructions: 'Push hips forward, let upper back arch backward. Open chest like a sail. Arch from mid-back, not lower back.',
        duration: '30-60 seconds per round',
        cues: [
          'Hips forward, not back',
          'Chest lifts and opens wide',
          'Shoulders relax down',
          'Breathe into your chest'
        ]
      },
      {
        order: 4,
        title: 'Make Sound',
        instructions: 'Hold the arch and make sound on exhale. Start with "AHHHHH" deep from chest. Sound vibrates and breaks armor.',
        cues: [
          'Sound from chest, not throat',
          'Start gentle and deepen',
          'Exhale fully',
          'Let emotion in—sadness, anger, longing'
        ]
      },
      {
        order: 5,
        title: 'Feel the Tremor',
        instructions: 'Continue 30-60 seconds until trembling starts. Soften the sound and feel. May cry, sigh, or wave of emotion—this is release.',
        cues: [
          'Feel chest vibrating',
          'Let emotions come up',
          'Don\'t judge what\'s happening',
          'Tears are cleansing, not a sign something is wrong'
        ]
      },
      {
        order: 6,
        title: 'Release Gently',
        instructions: 'When ready, slowly release the arch. Come upright. Take a few deep breaths. Place your hands on your chest and rest there for a moment.',
        cues: [
          'Notice how your chest feels now',
          'Can you breathe differently?',
          'What emotions are present?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'I don\'t feel anything when I arch. Am I doing it wrong?',
        answer: 'No. Heavy chest armor means numbness. The chest can take longer to wake up. Keep practicing. Each time, your nervous system gradually learns it\'s safe to feel. Stay patient.'
      },
      {
        question: 'I feel panic when I open my chest. Is that normal?',
        answer: 'Yes. For some, chest opening triggers fear ("I\'m exposed," "I might get hurt"). This is protective armor. You can soften the intensity—smaller arch, quieter sound. Or pause and ground (back to Standing Meditation). Over time, the panic subsides as your nervous system learns openness is safe.'
      },
      {
        question: 'Do I have to make sound?',
        answer: 'Sound is essential. It\'s not optional. Even if you feel self-conscious, try a quiet "ahhh." The internal vibration from sound is what breaks the armor. Without sound, it\'s just a stretch.'
      },
      {
        question: 'What if I start crying?',
        answer: 'Cry. This is the point. Chest armor often holds grief, heartbreak, or longing. When it releases, crying is natural. You\'re safe. Let it flow. It usually passes after a few minutes, and you\'ll feel lighter.'
      },
      {
        question: 'Can I do this if I have back pain?',
        answer: 'If your pain is structural (herniated disc, spondylolisthesis), consult your doctor first. If it\'s muscular tension, gentle arching may help. Start very mild. If pain increases, stop. Never push through joint pain—only through muscular discomfort.'
      }
    ]
  },

  {
    id: 'pelvic-rocking',
    name: 'Pelvic Rocking',
    shortDescription: 'Release pelvic armor. Wake up sensation and pleasure.',
    intention: 'Soften pelvic holding, reconnect with sexuality and aggression',
    duration: { min: 2, max: 3 },
    difficulty: 'Intermediate',
    focusSegments: ['pelvic', 'abdominal'],
    primaryMechanism: 'Rhythmic pelvic mobilization, sensorimotor reeducation, pelvic floor relaxation',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Shame and embarrassment are normal defenses—notice and continue',
      'If you freeze, stop and ground (Standing Meditation)',
      'Some urges to laugh are nervous system defense—keep going'
    ],
    contraindications: [
      'Recent pelvic surgery',
      'Severe pelvic pain or vaginismus (seek specialist)',
      'Acute trauma response'
    ],

    explanation: {
      overview: `Pelvic armor is one of the deepest holdings in the body. The pelvis is where sexual energy, aggression, and grounding live. Many people (especially from shame-based cultures or trauma backgrounds) hold their pelvis tight, tucked under, numb. Pelvic Rocking slowly softens this holding and restores sensation, pleasure, and vitality. It can feel odd or taboo at first. That\'s exactly why it\'s powerful.`,
      mechanism: `The pelvis is controlled by many muscle groups (pelvic floor, psoas, glutes, rectus femoris). When chronically tensed, these muscles restrict blood flow, numb sensation, and block sexual/aggressive impulses. Slow, rhythmic rocking mobilizes these muscles, restores blood flow, and gradually teaches your nervous system that pelvic sensation is safe. Over time, numbness gives way to aliveness.`,
      benefits: [
        'Restores sexual sensation and pleasure',
        'Allows grounded aggression and boundary-setting',
        'Releases deep pelvic tension',
        'Improves posture and ground contact',
        'Reconnects you with primal aliveness'
      ],
      whenToUse: 'After grounding (Standing Meditation). When you feel numb or disconnected from your body. To prepare for pelvic discharge work.'
    },

    steps: [
      {
        order: 1,
        title: 'Stand Grounded',
        instructions: 'Stand feet hip-width, knees bent, hands on hips. Feel your feet. Breathe. Shame or resistance may come up—that\'s normal.',
        duration: '10-20 seconds',
        cues: [
          'Feet grounded',
          'Knees soft',
          'Hands lightly on hips'
        ]
      },
      {
        order: 2,
        title: 'Begin the Rock',
        instructions: 'Slowly rock pelvis forward and back. Gentle, slow wave. Not big—subtle forward/back from hips, like a slow wave.',
        duration: 'Start slow, 1 rock per 2 seconds',
        cues: [
          'Hips forward, then back',
          'Slow wave through pelvis',
          'Gentle and rhythmic',
          'Breathe naturally'
        ],
        ifModified: 'Stiffness is armor. Keep moving gently—it softens with practice.'
      },
      {
        order: 3,
        title: 'Increase Depth',
        instructions: 'After 30-40 seconds, make movement slightly bigger. Still slow, still controlled. Pelvis warms up as you move.',
        duration: '1-2 minutes',
        cues: [
          'Movement gets bigger, but slow',
          'Let pleasure or sensation appear',
          'Numbness? Keep going—sensation returns',
          'Shame? Breathe and continue—that\'s the defense'
        ]
      },
      {
        order: 4,
        title: 'Allow Expression',
        instructions: 'Urges to laugh, moan, or make sound? Sexual arousal or aggression? This is pelvic energy waking up. Don\'t suppress it.',
        cues: [
          'What sensations are appearing?',
          'Sexual energy is healing',
          'Aggression is vitality',
          'Let your body speak'
        ]
      },
      {
        order: 5,
        title: 'Slow and Close',
        instructions: 'Slowly reduce movement. Make rocking smaller and slower. Return to neutral pelvis. Feel your feet. Notice the aliveness.',
        cues: [
          'What changed?',
          'Can you feel your pelvis more clearly?',
          'More sensation? Warmth?',
          'More aliveness?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'I feel embarrassed or shameful doing this. Is that a sign I should stop?',
        answer: 'No. Shame is often the armor protecting the pelvic area. The fact that you feel shame means you\'re touching something real. Shame is not a stop sign—it\'s information that this area needs healing. Breathe, notice the shame, and keep going gently.'
      },
      {
        question: 'I\'m not feeling anything sexual. Is my body broken?',
        answer: 'No. Pelvic numbness is common, especially after trauma or in shame-based environments. Sensation returns with repeated practice. Keep rocking gently, consistently. Your pelvis will wake up. Patience is key.'
      },
      {
        question: 'What if I feel sexual arousal?',
        answer: 'This is healthy. Sexual energy is life force. Let it be present. You don\'t need to do anything with it—just let it exist. Over time, as pelvic armor softens, you\'ll have more access to desire and pleasure.'
      },
      {
        question: 'Can I do this if I\'ve experienced sexual trauma?',
        answer: 'Carefully. Your pelvic area may be locked to protect you. Gentle pelvic rocking can help, but if intense emotion or flashbacks arise, stop immediately and ground. Consider working with a trauma-informed therapist alongside this practice.'
      },
      {
        question: 'How often should I do this?',
        answer: 'Daily if possible. Even 2-3 minutes daily will gradually soften armor. Consistency matters more than duration.'
      }
    ]
  },

  {
    id: 'connected-breathing',
    name: 'Connected Breathing',
    shortDescription: 'Build charge. Activate emotion. Full-body release.',
    intention: 'Activate nervous system, build charge, facilitate emotional discharge',
    duration: { min: 5, max: 15 },
    difficulty: 'Intermediate',
    focusSegments: ['thoracic', 'diaphragmatic', 'all'],
    primaryMechanism: 'Controlled hyperventilation increasing O2/CO2 ratio, autonomic nervous system activation, emotional gateway opening',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Can trigger hyperventilation or tetany (hand cramping)—this is temporary and safe, but slow down if intense',
      'Strong emotions may surface—this is the point, stay with it if you can',
      'If overwhelmed, slow breath or stop. You can always resume.'
    ],
    contraindications: [
      'Uncontrolled high blood pressure',
      'Heart arrhythmias or cardiac conditions',
      'Asthma (can be triggered)',
      'During acute panic (wait until stabilized)',
      'Pregnancy (use modified version)'
    ],

    explanation: {
      overview: `Connected Breathing is the "charge-building" practice. You breathe continuously (no pause between inhale and exhale) for 5-15 minutes, allowing your nervous system to activate and emotions to surface. It\'s based on Holotropic Breathwork and Reich\'s theories of charge/discharge. It\'s more intense than other practices—expect emotions, maybe tears, maybe rage or laughter. This is a "deep dive" practice.`,
      mechanism: `Normal breathing has pauses. Connected breathing removes those pauses, creating continuous activation. This increases oxygen and decreases CO2, shifting your nervous system toward sympathetic (activation) mode. Normally this would create anxiety, but combined with intention and safety, it opens emotional gateways—trauma, grief, rage, longing all can emerge for release. After emotional discharge, integration brings deep calm.`,
      benefits: [
        'Most powerful emotional release practice',
        'Breaks through emotional numbness quickly',
        'Full-body activation and tremoring',
        'Can facilitate trauma processing',
        'Deep calm and peace after integration'
      ],
      whenToUse: 'When you\'re ready for significant emotional work. After you\'ve practiced grounding. In a safe, private space. With time to rest afterward (integration).'
    },

    steps: [
      {
        order: 1,
        title: 'Setup: Lie Down',
        instructions: 'Lie on back. Knees bent, feet flat. Arms at sides, palms up. Warm and safe. Close eyes if comfortable.',
        duration: '30 seconds',
        cues: [
          'Comfortable position',
          'Knees bent',
          'Belly soft'
        ]
      },
      {
        order: 2,
        title: 'Set Intention',
        instructions: 'Take 3 normal breaths. Set simple intention: "Open to whatever moves through me" or "Release what no longer serves."',
        duration: '30 seconds',
        cues: [
          'Quiet your mind',
          'Feel your body on the floor',
          'Notice emotions already present'
        ]
      },
      {
        order: 3,
        title: 'Begin Connected Breathing',
        instructions: 'Open mouth. Breathe in through mouth, immediately breathe out (no pause). Full breath but not forced. Steady rhythm.',
        duration: '5-15 minutes (you choose)',
        cues: [
          'Mouth open, jaw relaxed',
          'Connected—no pause between inhale/exhale',
          'Full breath, not hyperventilation',
          'Steady rhythm throughout'
        ]
      },
      {
        order: 4,
        title: 'Let Whatever Comes',
        instructions: 'As you breathe, emotions surface. Cry, rage, laugh, sadness. Body may move or tremor. All correct. Let it move through. Keep breathing.',
        cues: [
          'What emotions are present?',
          'Let body move if it wants',
          'Sound is welcome (moaning, shouting, sobbing)',
          'Trust the process'
        ]
      },
      {
        order: 5,
        title: 'Close and Integrate',
        instructions: 'When done (or after 5-15 min), close mouth. Return to normal breathing. Lie still 5+ minutes. Eyes closed. Rest. Integration is essential.',
        duration: '5-10 minutes minimum',
        cues: [
          'Slow, natural breathing',
          'Notice the calm emerging',
          'Notice how different your body feels',
          'Rest fully'
        ]
      },
      {
        order: 6,
        title: 'Slowly Return',
        instructions: 'Open eyes slowly. Wiggle fingers and toes. Roll to side. Slowly push to sitting. Sit briefly. Then stand.',
        cues: [
          'Move slowly—you may feel spacious',
          'Drink water',
          'Rest for the next hour if possible'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'I\'m getting tingling in my hands and face. Is this dangerous?',
        answer: 'No. This is alkalosis from increased O2/CO2 ratio. It\'s temporary and harmless. Slow your breathing slightly. Shake your hands. It will pass. Continue at a gentler pace.'
      },
      {
        question: 'My hands are cramping (tetany). Should I stop?',
        answer: 'You can pause briefly, shake your hands, and resume. Or slow your breathing. Tetany is not dangerous—it\'s just a side effect of fast breathing. It goes away quickly.'
      },
      {
        question: 'Nothing happened. I didn\'t feel anything or cry.',
        answer: 'That\'s okay. Not everyone cries or discharges dramatically. Some people feel deep calm or subtle shifts. Trust what happened. Your nervous system knows what it needs. Try again next week.'
      },
      {
        question: 'I felt panic or fear. What should I do?',
        answer: 'This can happen if you have trauma. Slow your breathing immediately. Longer exhales (5-6 seconds) calm the nervous system. When calm, you can pause or continue gently. Or stop and ground. This is information that your nervous system needs gentler work.'
      },
      {
        question: 'How long should I do this?',
        answer: '5-15 minutes. Start with 5-7 minutes. As you become familiar, you can extend. But length isn\'t the goal—the practice is.'
      },
      {
        question: 'Should I do this daily?',
        answer: 'No. Once weekly or every 2 weeks is ideal. This is deep work. Your nervous system needs recovery time between sessions. Never do daily.'
      }
    ]
  },

  {
    id: 'extended-exhalation',
    name: 'Extended Exhalation',
    shortDescription: 'Calm your nervous system. Activate the vagal brake.',
    intention: 'Parasympathetic activation, vagal tone increase, stress reduction',
    duration: { min: 3, max: 5 },
    difficulty: 'Beginner',
    focusSegments: ['diaphragmatic', 'nervous-system'],
    primaryMechanism: 'Vagal afferent stimulation via extended exhale, parasympathetic activation, HRV increase',
    evidenceLevel: 'Strong',
    safetyNotes: [
      'Don\'t force the exhale—let it be smooth and natural',
      'Stop if you feel lightheaded'
    ],
    contraindications: [
      'None significant for healthy adults'
    ],

    explanation: {
      overview: `Extended Exhalation is the opposite of Connected Breathing. Instead of activating, it calms. When you exhale longer than you inhale, you stimulate your vagus nerve—specifically the parasympathetic (rest-and-digest) branch. This is backed by neuroscience (Polyvagal Theory). It\'s perfect for anxiety, as a complement to discharge work, or anytime you need to calm down.`,
      mechanism: `Your vagus nerve senses the breath. A long exhale signals to your brain: "All is well, slow down, rest." This shifts your autonomic nervous system from sympathetic (fight/flight) to parasympathetic (safe/calm). Your heart rate drops, digestion improves, anxiety decreases. This is vagal tone—your brain\'s ability to shift into calm.`,
      benefits: [
        'Immediate stress reduction (within 1 minute)',
        'Improves heart rate variability (HRV)',
        'Calms anxiety without dissociating',
        'Can be done anytime, anywhere',
        'No side effects'
      ],
      whenToUse: 'Anytime you feel anxious. After discharge work (to integrate). Before bed. Throughout the day for reset.'
    },

    steps: [
      {
        order: 1,
        title: 'Get Comfortable',
        instructions: 'Sit upright, spine straight. Hands on lap. Jaw relaxed. Close eyes or soften gaze.',
        duration: '10 seconds',
        cues: [
          'Relaxed jaw',
          'Supported posture',
          'Grounded'
        ]
      },
      {
        order: 2,
        title: 'Notice Natural Rhythm',
        instructions: 'Take 3 normal breaths. Observe your baseline without changing anything.',
        duration: '20 seconds',
        cues: [
          'Don\'t force or control',
          'Notice length of inhale and exhale'
        ]
      },
      {
        order: 3,
        title: 'Extended Exhale Ratio',
        instructions: 'Inhale: 4 counts. Exhale: 6-8 counts. Exhale is 1.5-2x longer than inhale—this activates calm.',
        duration: '3-5 minutes',
        cues: [
          'Inhale: 4 counts (or 3)',
          'Exhale: 6-8 counts (slow, complete)',
          'Repeat 10-15 cycles',
          'If 6-8 feels long, do 4-5 instead'
        ]
      },
      {
        order: 4,
        title: 'Feel the Shift',
        instructions: 'Continue the ratio. Notice shoulders dropping, jaw loosening, mind settling. You might feel warm or heavy—this is parasympathetic activation.',
        cues: [
          'Heart rate slowing',
          'Shoulders releasing',
          'Calm emerging naturally'
        ]
      },
      {
        order: 5,
        title: 'Return to Normal',
        instructions: 'After 10-15 cycles, stop the ratio. Return to natural breathing. Open eyes. Notice the difference.',
        cues: [
          'Compare to before',
          'More calm? Grounded?',
          'Body feels different?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'What if I can\'t exhale for 6-8 counts?',
        answer: 'That\'s fine. Start with what feels natural (like 4-5 counts). The ratio matters—exhale should be longer than inhale. As you practice, your lung capacity will improve.'
      },
      {
        question: 'Should I hold my breath?',
        answer: 'A brief 1-count hold is optional. If breath-holding triggers anxiety, skip the hold. Just exhale immediately after inhale.'
      },
      {
        question: 'I don\'t feel calm. Am I doing it wrong?',
        answer: 'Some people feel calm immediately; others take time. Keep practicing. The vagus nerve is like a muscle—it strengthens with repetition. After 3-5 sessions, you\'ll likely feel shifts.'
      },
      {
        question: 'Can I do this daily?',
        answer: 'Yes! Extended exhalation is safe daily. Morning and evening are ideal. Some people do it multiple times per day for anxiety.'
      },
      {
        question: 'Should I use this after Connected Breathing?',
        answer: 'Yes, perfect. After intense discharge work, extended exhalation helps with integration and prevents agitation. 5-10 minutes of extended exhalation after Connected Breathing is ideal.'
      }
    ]
  },

  {
    id: 'sound-movement',
    name: 'Sound + Movement Integration',
    shortDescription: 'Advanced discharge. Break armor with voice and vibration.',
    intention: 'Full-body armor release, emotional expression, advanced nervous system discharge',
    duration: { min: 5, max: 10 },
    difficulty: 'Advanced',
    focusSegments: ['oral', 'thoracic', 'diaphragmatic', 'pelvic', 'all'],
    primaryMechanism: 'Vibrational frequency breaking muscular armor, vocal expression of suppressed emotion, full-body neurogenic tremor',
    evidenceLevel: 'Emerging',
    safetyNotes: [
      'This is intense. Do only after solid grounding practice (weeks/months of prior work).',
      'Sound can trigger shame—lean into it, it\'s part of the armor',
      'You may sob, rage, scream. This is intentional. Private space is essential.',
      'If overwhelmed, stop, ground, breathe'
    ],
    contraindications: [
      'Active psychosis or mania',
      'Unresolved trauma (work with therapist first)',
      'Acute crisis state'
    ],

    explanation: {
      overview: `This is the most advanced practice in the MVP. It combines sound (vocalization), movement (shaking, thrashing, pelvic movement), and breath into a full-body discharge event. Based on Hyatt\'s "Undoing Yourself" and modern Somatic Experiencing, it\'s extraordinarily powerful for trauma release and armor breaking. It\'s NOT for beginners. You need solid grounding and emotional readiness first.`,
      mechanism: `Sound travels through the body as vibration, literally breaking rigid muscular patterns. Movement engages proprioception and allows frozen patterns to complete. Together, they create a "controlled catharsis"—your nervous system discharges years of held trauma and emotion. The result is often profound calm and freedom.`,
      benefits: [
        'Most powerful single-session armor release',
        'Completes frozen trauma responses',
        'Deep emotional purging',
        'Can shift identity and self-perception',
        'Often produces lasting peace and presence'
      ],
      whenToUse: 'Only after months of consistent grounding and breathing work. In a very safe, private space. With therapist support ideally. This is not beginner material.'
    },

    steps: [
      {
        order: 1,
        title: 'Prepare Space',
        instructions: 'Create a private, quiet space. Close doors/windows. No interruptions. Have water nearby.',
        duration: 'Setup (2-3 min)',
        cues: [
          'Private (no noise complaints)',
          'Uninterrupted',
          'Warm enough',
          'Water accessible'
        ]
      },
      {
        order: 2,
        title: 'Ground First',
        instructions: 'Do Standing Meditation (3-5 min). Feel your feet. Establish safety and calm before opening.',
        duration: '3-5 minutes',
        cues: [
          'Feet grounded clearly',
          'Nervous system calm',
          'Ready to express'
        ]
      },
      {
        order: 3,
        title: 'Begin with Sound',
        instructions: 'Open your mouth. Make a sound—"AHHHHH" from chest, not throat. Raw and honest, not singing.',
        duration: '1-2 minutes',
        cues: [
          'Sound from chest (heart-center)',
          'Raw, unpolished',
          'Emotion in the sound',
          'Shame may arise—that\'s armor, keep sounding'
        ]
      },
      {
        order: 4,
        title: 'Add Movement',
        instructions: 'Let body move as you sound. Shake, rock, swing. Don\'t choreograph—let it flow. Sound and movement together.',
        duration: '2-3 minutes',
        cues: [
          'Loose, uninhibited',
          'Whole body shaking',
          'Sound + movement sync',
          'Pelvic thrust, arm flail, shake freely'
        ]
      },
      {
        order: 5,
        title: 'Intensify',
        instructions: 'Go bigger: louder sound, wider movement. Stomp, punch pillows safely, shake harder. Let it all come.',
        duration: '3-5 minutes',
        cues: [
          'What wants to come?',
          'Anger, grief, longing—all welcome',
          'Full expression',
          'Channel safely (pillows, not walls)'
        ]
      },
      {
        order: 6,
        title: 'Let Peak Subside',
        instructions: 'Intensity naturally decreases. Sound quiets. Movement slows. Let it wind down—your body knows.',
        duration: '1-2 minutes',
        cues: [
          'Movement slowing naturally',
          'Sound quieting',
          'Feeling the release'
        ]
      },
      {
        order: 7,
        title: 'Deep Integration',
        instructions: 'Lie down, still, eyes closed. Rest 10-15 min. Nervous system reorganizing—this is essential.',
        duration: '10-15 minutes',
        cues: [
          'Lie flat',
          'Slow, natural breathing',
          'Rest fully',
          'Calm emerges naturally'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Is this safe? It sounds intense.',
        answer: 'Yes, it\'s safe when you\'re grounded first. The intensity is the point. Your body won\'t do more than it can handle. But do this only after months of prior grounding work, not as your first practice.'
      },
      {
        question: 'What if I cry uncontrollably?',
        answer: 'Cry. This is grief releasing. Let it flow. Crying is the body\'s way of completing emotional overwhelm. It\'s one of the most healing responses.'
      },
      {
        question: 'What if I feel rage and want to scream?',
        answer: 'Scream. Safely. This is suppressed aggression releasing. Rage is life force. Let it move. It\'s not violence—it\'s expression.'
      },
      {
        question: 'Is integration really necessary?',
        answer: 'Yes. Without integration, you may feel agitated or re-armored afterward. With integration, you feel deeply peaceful and free. Always integrate at least 10 minutes.'
      },
      {
        question: 'How often can I do this?',
        answer: 'Once a month, maximum. This is profound work. Your nervous system needs recovery. Too frequent can dysregulate you. Monthly is ideal.'
      },
      {
        question: 'Should I have a therapist before doing this?',
        answer: 'Ideally yes, especially if you have trauma history. This practice can mobilize deep material. Having professional support nearby is wise. At minimum, tell a trusted friend you\'re doing this.'
      }
    ]
  },

  // ===== NEW ADVANCED PRACTICES (6 complex additions) =====

  {
    id: 'belly-bowl-awakening',
    name: 'Belly Bowl Awakening',
    shortDescription: 'Soften your belly. Restore gut-brain dialogue.',
    intention: 'Awaken visceral intelligence, restore gut sensation, befriend the belly',
    duration: { min: 10, max: 18 },
    difficulty: 'Intermediate',
    focusSegments: ['abdominal', 'visceral', 'diaphragmatic'],
    primaryMechanism: 'Visceral interoception via polyvagal dorsal-vagal circuit, belly wall mobilization, gut-brain axis reintegration',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if sharp abdominal pain appears (not cramping, but sharp)',
      'Stop if extreme bloating or digestive distress',
      'Modify if pregnancy (consult healthcare provider first)'
    ],
    contraindications: [
      'Active digestive pathology (IBS during flare)',
      'Recent abdominal surgery (wait 6+ weeks)',
      'Severe bloating or constipation',
      'Pregnancy (without medical clearance)'
    ],

    explanation: {
      overview: `The belly is your second brain. The abdominal organs (gut, pancreas, liver) are densely innervated by the vagus nerve and contain 500 million neurons. Yet most people armored their bellies long ago—from shame, trauma, or cultural messages about bodies. Belly Bowl Awakening reverses that. You soften the belly, restore sensation, and reconnect with visceral wisdom. Your gut will "speak" again.`,
      mechanism: `Chronic belly tension (from shame, trauma, or "sucking in") restricts blood flow and nerve signaling. The polyvagal dorsal vagal circuit—which governs the gut—becomes dormant. When you massage and breathe into the belly, you reactivate proprioceptive feedback and restore vagal tone. Your gut instinct, which modern culture silences, returns. This is the "gut feeling" re-embodied.`,
      benefits: [
        'Restores gut-brain dialogue (literally)',
        'Improves digestion and IBS symptoms',
        'Increases body confidence and wholeness',
        'Accesses primal wisdom and instinct',
        'Softens shame held in the belly'
      ],
      whenToUse: 'After grounding (Standing Meditation). When you feel disconnected from your body. If IBS or digestive issues are present (complements medical care). 2+ hours after eating (empty stomach).'
    },

    steps: [
      {
        order: 1,
        title: 'Supine Setup',
        instructions: 'Lie on your back. Knees bent, feet flat on floor, hip-width apart. Hands rest on belly.',
        duration: '30 seconds',
        cues: [
          'Knees bent for comfort',
          'Palms on belly (touching your gut)',
          'Lower back not pressed into floor (maintain arch)',
          'Jaw relaxed'
        ]
      },
      {
        order: 2,
        title: 'Belly Breathing Warm-Up',
        instructions: 'Slow, full breaths into your belly. Belly rises on inhale, falls on exhale. Feel your hands move with your breath.',
        duration: '3 minutes',
        cues: [
          'Big, slow belly breaths',
          'Watch hands rise and fall',
          'No chest breathing—pure belly',
          'Slow your pace (count: inhale 4, exhale 4)',
          'Feel your belly wall warming'
        ]
      },
      {
        order: 3,
        title: 'Gentle Visceral Massage',
        instructions: 'With one or both hands, gently massage your belly in a spiral, starting below navel and moving clockwise around the abdomen.',
        duration: '4 minutes',
        cues: [
          'Clockwise spiral (colon flow)',
          'Gentle, not deep pressure',
          'Find tender spots—these are held areas',
          'Pause on tender spots, breathe into them',
          'What sensations appear? Numbness? Warmth? Emotion?',
          'Let feelings come up (this is armoring releasing)'
        ],
        ifModified: 'Numbness is common. Keep massaging slowly—sensation returns with repetition.'
      },
      {
        order: 4,
        title: 'Breath Pressure Waves',
        instructions: 'Return hands to belly. Take explosive exhales: "HA! HA! HA!" (short, powerful breaths). Belly contracts sharply with each "HA."',
        duration: '3 minutes',
        cues: [
          'Sharp, rhythmic "HA!" breaths',
          'Belly contracts with each exhale',
          'Like laughing or panting',
          '20-30 HA breaths in a row, pause, repeat',
          'You may feel tremoring start—let it happen'
        ]
      },
      {
        order: 5,
        title: 'Tremor and Shaking',
        instructions: 'Stop the HA breaths. Let your belly vibrate and shake naturally. It may feel like trembling from the inside out.',
        duration: '3 minutes',
        cues: [
          'Hands still on belly, feeling the vibration',
          'Just let the tremoring happen',
          'Breathe naturally (no forced breath)',
          'Belly may feel warm, tingly, or alive',
          'This is the nervous system releasing'
        ]
      },
      {
        order: 6,
        title: 'Gut Dialogue and Integration',
        instructions: 'Slow the tremoring. Return to slow, natural breathing. Place both hands on lower belly. Ask silently: "What are you holding? What do you know?"',
        duration: '3 minutes',
        cues: [
          'Pause. Listen internally.',
          'Your gut knows things your mind doesn\'t',
          'No thinking required—just sensing',
          'What words, images, or feelings appear?',
          'Your gut instinct is waking up'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Why does my belly feel so armored?',
        answer: 'The belly holds shame deeply. From childhood messages ("suck in your gut"), sexual trauma, or cultural fat-shaming. Your body armor-plated your belly to protect it. Bioenergetics reverses that protection by showing your system: "You\'re safe to feel here now."'
      },
      {
        question: 'I feel nothing in my belly. Is that normal?',
        answer: 'Yes. Numbness means heavy armoring. Keep doing this practice weekly. Sensation returns gradually—over weeks or months. Your belly will "wake up" with patience.'
      },
      {
        question: 'My belly is bloated. Can I still do this?',
        answer: 'Gentle massage can help with gas/bloating. But if it\'s extreme, rest first. Eat 2+ hours before practice. Light movement before helps. If chronic bloating, see a doctor—this complements medical care.'
      },
      {
        question: 'I feel emotional doing this. Why?',
        answer: 'The belly holds stored emotion—fear, shame, grief. As you touch it with kindness, these emotions surface for release. This is healing. Breathe, let the emotion move through, and continue.'
      },
      {
        question: 'Can I do this daily?',
        answer: 'Yes, gentle belly massage and breathing are safe daily. The full 18-minute version 2-3x per week is ideal. But even 5 minutes daily is powerful.'
      }
    ]
  },

  {
    id: 'jaw-release-expression',
    name: 'Jaw Release & Expression',
    shortDescription: 'Unclench your bite. Reclaim your voice and power.',
    intention: 'Release TMJ tension, unlock unexpressed anger, reclaim boundaries',
    duration: { min: 10, max: 18 },
    difficulty: 'Intermediate',
    focusSegments: ['oral', 'jaw', 'neck'],
    primaryMechanism: 'Trigeminal nerve (CN V) release, temporomandibular joint mobilization, vagal pathway via throat',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if sharp jaw pain (not tension, but sharp pain)',
      'Never force jaw open beyond comfortable range',
      'If lockjaw happens, stop and rest jaw for a day'
    ],
    contraindications: [
      'Severe TMJ disorder or jaw surgery history (consult dentist)',
      'Dental work in progress',
      'Jaw fracture history'
    ],

    explanation: {
      overview: `The jaw is where people "bite their words." Unexpressed anger, unspoken truths, and boundary violations all lock down the jaw. This is the "can\'t say no" or "swallowed scream" armor. The masseter (jaw muscle) becomes so chronically tense that pain and dysfunction result. Jaw Release mobilizes the TMJ, relaxes the masseter, and lets your voice and power return. You can say what needs to be said.`,
      mechanism: `The trigeminal nerve (CN V) innervates the jaw. The masseter muscle can become so tight it restricts blood flow, causes headaches, and locks the joint. The jaw also houses your oral segment—your capacity for expression, nourishment, and aggression. When it\'s armored, you can\'t eat, breathe, or speak fully. Releasing the jaw restores all three.`,
      benefits: [
        'Eliminates TMJ pain and tension',
        'Stops teeth grinding and jaw clenching',
        'Recovers voice and expressive capacity',
        'Unleashes healthy aggression and boundaries',
        'Reduces headaches from jaw tension'
      ],
      whenToUse: 'When you notice jaw clenching. Before speaking up (to unlock your voice). If TMJ pain is present. Daily if grinding/clenching is a habit.'
    },

    steps: [
      {
        order: 1,
        title: 'Body Scan and Awareness',
        instructions: 'Sit comfortably. Close eyes. Scan your body top-to-bottom. Notice where you\'re holding tension. The jaw is likely very tight.',
        duration: '2 minutes',
        cues: [
          'Where is your jaw right now?',
          'Clenched or relaxed?',
          'Any pain or soreness?',
          'Connected to what emotion? (anger? fear? shame?)'
        ]
      },
      {
        order: 2,
        title: 'TMJ Joint Massage',
        instructions: 'Place your fingers on the TMJ joint (just in front of ears, where jaw hinges). Gently press and massage in small circles.',
        duration: '3 minutes',
        cues: [
          'Locate the joint (in front of ear)',
          'Gentle circles, not hard',
          'Feel the joint moving',
          'Breathe into any tightness',
          'Can massage inner jaw too (inside mouth, along molars)'
        ],
        ifModified: 'Sore? Light touch. It gets easier with practice.'
      },
      {
        order: 3,
        title: 'Jaw Stretches',
        instructions: 'Slowly open mouth. Stretch down gently, not forcing. Let lower jaw hang heavy.',
        duration: '2 minutes',
        cues: [
          'Open slowly, find resistance point',
          'Don\'t force past comfort',
          'Hold 20-30 seconds at stretch',
          'Try side-to-side jaw movement (small figure-8s)',
          'Circles in both directions'
        ]
      },
      {
        order: 4,
        title: 'Resistance and Tension Building',
        instructions: 'Place your palm under your chin. Push your chin down into your hand (create resistance). Engage jaw muscles for 5-10 seconds. Release.',
        duration: '2 minutes',
        cues: [
          'Push chin down against hand',
          'Feel jaw muscles working',
          '5 seconds push, 5 seconds rest',
          'Repeat 10 times',
          'This builds charge before discharge'
        ]
      },
      {
        order: 5,
        title: 'Sound Release',
        instructions: 'Open your mouth wide. Make sounds from your throat: "ROARING" sounds, growls, "NO!", declarations. Let volume and intensity rise.',
        duration: '4 minutes',
        cues: [
          'Sounds like roaring, growling, guttural',
          'Not singing—raw and primal',
          '"NO!" "MINE!" "ENOUGH!"',
          'Let anger or power come through the voice',
          'Jaw vibrating, face engaged',
          'What words want to come? Let them out.'
        ]
      },
      {
        order: 6,
        title: 'Tremoring and Natural Release',
        instructions: 'Stop sounding. Let your jaw shake and chatter naturally. Facial muscles may vibrate. Let this happen.',
        duration: '2 minutes',
        cues: [
          'Jaw shakes or chatters',
          'Face may vibrate',
          'This is the armor releasing',
          'Breathe through it',
          'Yawning is welcome—that\'s deep release'
        ]
      },
      {
        order: 7,
        title: 'Integration and Awareness',
        instructions: 'Slowly close mouth. Take a moment. Notice your jaw now. How does it feel compared to before?',
        cues: [
          'Can you open wider now?',
          'Is pain lessened?',
          'Do you feel your voice more present?',
          'Anger or power felt? That\'s healthy.'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Why is my jaw so tight even when I\'m not stressed?',
        answer: 'Jaw tension is often chronic armor from unexpressed anger, years of "shutting up," or trauma. Your system learned long ago: "It\'s not safe to speak." Releasing the jaw means telling your nervous system: "It\'s safe to express now."'
      },
      {
        question: 'I have TMJ. Will this help or hurt?',
        answer: 'Gentle massage and slow stretches usually help TMJ. The release of tension actually reduces pain long-term. But if sharp pain appears during practice, stop immediately. Work with a dentist or physical therapist alongside this practice.'
      },
      {
        question: 'What if I feel anger surfacing?',
        answer: 'Perfect. Anger is energy. Let it come. It wants to be expressed. This anger has been trapped in your jaw. Let the sound carry it. Anger, fully felt and expressed, is not violence—it\'s power reclaimed.'
      },
      {
        question: 'I ground my teeth. Will this stop it?',
        answer: 'Often, yes. Teeth grinding is the jaw holding aggression. As the jaw releases through practice, grinding decreases. Consistent practice (2-3x per week) usually reduces grinding within weeks.'
      },
      {
        question: 'Can I do this with the Sound + Movement practice?',
        answer: 'Yes. In fact, jaw release is often done as part of Sound + Movement. If you advance to that practice, the jaw work becomes integrated.'
      }
    ]
  },

  {
    id: 'throat-opening-ritual',
    name: 'Throat Opening Ritual',
    shortDescription: 'Liberate your voice. Release the swallowed scream.',
    intention: 'Vagal activation via throat, voice reclamation, grief and truth expression',
    duration: { min: 12, max: 20 },
    difficulty: 'Intermediate',
    focusSegments: ['cervical', 'oral', 'thoracic'],
    primaryMechanism: 'Vagus nerve stimulation via pharyngeal vibration, laryngeal mobility, parasympathetic activation',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if severe throat soreness or pain',
      'Stop if choking sensation emerges',
      'Have water nearby',
      'Practice in private (loud vocalization)'
    ],
    contraindications: [
      'Active throat infection or strep',
      'Recent throat surgery',
      'Vocal cord pathology (polyps, nodules)',
      'Laryngitis'
    ],

    explanation: {
      overview: `The throat is where grief, truth, and the "swallowed scream" live. Many people learned early: "Don't speak up. Don't make waves. Stay quiet." The throat closed. Decades later, they have neck tension, thyroid issues, or complete voice loss. Throat Opening Ritual reactivates the vagus nerve via throat vibration and voice, allowing grief to flow and truth to emerge. Your voice—your authentic voice—returns.`,
      mechanism: `The vagus nerve passes through the throat, innervating the larynx and pharynx. Sound and vibration directly stimulate this nerve, activating the parasympathetic system and releasing trapped emotion. In polyvagal theory, the ventral vagal system (your "social engagement" system) operates through the throat. When you activate the throat, you activate connection and authentic expression.`,
      benefits: [
        'Releases neck and shoulder tension (often caused by voice suppression)',
        'Activates vagus nerve for parasympathetic calm',
        'Recovers authentic voice and expression',
        'Unlocks grief, allowing it to move',
        'Can reduce thyroid symptoms (when tension is the cause)',
        'Deep emotional catharsis'
      ],
      whenToUse: 'When you feel throat tightness. If you struggle to speak up. When grief needs expression. After jaw release (complements that practice). In a private space.'
    },

    steps: [
      {
        order: 1,
        title: 'Grounding and Throat Scan',
        instructions: 'Stand or sit upright. Feel your feet (ground yourself first). Close your eyes. Scan your throat. Where is it tight?',
        duration: '2 minutes',
        cues: [
          'Feet grounded, spine tall',
          'Throat tightness or numbness?',
          'Lump in throat?',
          'Connected to what emotion?',
          'Breathing through throat or chest?'
        ]
      },
      {
        order: 2,
        title: 'Neck Mobility Sequence',
        instructions: 'Slow head rolls. Forward, right side, back, left side. Release tension. Then gentle stretches (ear to shoulder).',
        duration: '3 minutes',
        cues: [
          'Slow, smooth circles',
          'No forcing',
          'Feel stiffness',
          'Ear to shoulder stretches (gentle)',
          'Breathe into any tightness'
        ]
      },
      {
        order: 3,
        title: 'Self-Massage of Throat',
        instructions: 'Gently massage your neck: sternocleidomastoid (muscle on side of neck), collarbone, throat. Light touch.',
        duration: '3 minutes',
        cues: [
          'Fingers along sides of neck (not crushing)',
          'Small circles on tight spots',
          'Collarbone area (tender often)',
          'Light, slow strokes down the front',
          'Breathe into sensation'
        ]
      },
      {
        order: 4,
        title: 'Humming and Vibration',
        instructions: 'Close mouth. Hum on a comfortable pitch. Feel vibration in throat, sinuses, chest.',
        duration: '4 minutes',
        cues: [
          'Closed mouth humming',
          'Steady tone (not too high or low)',
          'Feel the vibration travel',
          'Change pitch slowly (low to high)',
          'This vibration is vagal stimulation'
        ]
      },
      {
        order: 5,
        title: 'Toning and Vowel Sounds',
        instructions: 'Open mouth. Make long vowel sounds: "AHHHHH," "OHHHHH," "EEEEE." Each for 30 seconds.',
        duration: '4 minutes',
        cues: [
          'One vowel at a time',
          'Mouth relaxed and open',
          'Feel the sound in throat and chest',
          'Let the sound resonate',
          'What emotion comes with it?'
        ]
      },
      {
        order: 6,
        title: 'Grief and Truth Expression',
        instructions: 'From the throat, let emotion come. Wailing, keening, moaning—allow the voice to express what\'s held. "I have something to say..." or wordless expression.',
        duration: '4 minutes',
        cues: [
          'What wants to be said?',
          'Let the voice express it fully',
          'Cry into the sound',
          'Swallowed tears? Let them come',
          'Truth that\'s been silenced? Speak it.'
        ]
      },
      {
        order: 7,
        title: 'Integration Silence',
        instructions: 'Slowly let the sounds cease. Close mouth. Breathe through nose. Notice the shift.',
        duration: '3 minutes',
        cues: [
          'Silence after sound',
          'Feel your throat now',
          'Can you breathe differently?',
          'Does your voice feel clearer?',
          'What emotion remains?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Why does my throat feel so tight?',
        answer: 'Throat armor often comes from childhood silencing ("Be quiet," "Don\'t talk back"). Your nervous system learned: "Speaking is dangerous." Throat Opening shows your system: "Your voice is safe now. You can speak."'
      },
      {
        question: 'I feel too embarrassed to make these sounds.',
        answer: 'Embarrassment is part of the armor. Sound is essential—it breaks the holding pattern. Even if you feel self-conscious, try soft sounds first. The embarrassment lessens with practice. Private space helps.'
      },
      {
        question: 'I\'m grieving. Can this help?',
        answer: 'Yes. Grief gets stuck in the throat. Throat Opening is a direct path for grief to move. Wailing, keening, moaning—all grief expressions are welcome here. This is profound grief medicine.'
      },
      {
        question: 'I have thyroid issues. Will this help?',
        answer: 'Often, throat tension contributes to thyroid symptoms (though thyroid disease is medical). Releasing throat tension improves circulation and vagal function, which supports thyroid health. This complements—not replaces—medical care.'
      },
      {
        question: 'Can I combine this with jaw release?',
        answer: 'Absolutely. The jaw and throat are connected (same oral segment). Doing jaw release first, then throat opening, creates a powerful sequence.'
      }
    ]
  },

  {
    id: 'eye-liberation-practice',
    name: 'Eye Liberation Practice',
    shortDescription: 'Dissolve eye armor. Release fear of being seen.',
    intention: 'Oculomotor activation, fear release, restore full-spectrum seeing',
    duration: { min: 8, max: 15 },
    difficulty: 'Intermediate',
    focusSegments: ['ocular', 'nervous-system'],
    primaryMechanism: 'Oculomotor nerve (CN III) activation, vagal tone via eye movement, neuroceptive upgrade',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if severe dizziness occurs (sit down)',
      'Stop if dissociation intensifies (open eyes, ground)',
      'Intrusive flashbacks? Pause and ground'
    ],
    contraindications: [
      'Recent eye surgery (wait 6+ weeks)',
      'Severe vertigo or balance disorders',
      'Acute trauma response'
    ],

    explanation: {
      overview: `Eyes are windows to the soul—and windows reveal you. Many trauma survivors learned: "Being seen is dangerous." The eyes became guarded. You learned to look down, avoid contact, or go numb behind the eyes. Eye Liberation Practice is the only practice targeting the ocular segment specifically. It dissolves eye armor, restores the capacity to see and be seen, and upgrades your nervous system through the oculomotor system (the vagus nerve\'s cousin).`,
      mechanism: `In polyvagal theory, eye contact and gaze are signals of social safety. When armored, you can\'t make eye contact; your nervous system reads faces as threats. Oculomotor activation—through eye movement, tracking, and gaze exercises—directly signals to your brainstem: "People are safe. The world is safe to look at." This neuroceptive shift is profound.`,
      benefits: [
        'Restores capacity for eye contact and authentic connection',
        'Releases fear of being seen',
        'Improves visual processing and perception',
        'Upgrades nervous system through vagal activation',
        'Can reduce social anxiety',
        'Deep sense of "seeing and being seen"'
      ],
      whenToUse: 'When you struggle with eye contact. If you feel unsafe being perceived. Before social situations (to prepare). Daily is fine.'
    },

    steps: [
      {
        order: 1,
        title: 'Grounding and Eye Awareness',
        instructions: 'Sit comfortably. Feel your feet. Close eyes for 10 seconds and notice what you feel.',
        duration: '1 minute',
        cues: [
          'What\'s your baseline eye sensation?',
          'Heavy? Light? Numb?',
          'Relaxed or guarded?',
          'Fear of opening eyes?'
        ]
      },
      {
        order: 2,
        title: 'Eye Stretches and Mobility',
        instructions: 'Open eyes. Look far right (hold 3 seconds), then far left. Then up, then down. Explore full range slowly.',
        duration: '3 minutes',
        cues: [
          'Slow, deliberate movements',
          'Feel muscles around eyes working',
          'No straining, just mobilizing',
          'Diagonal movements (up-right, down-left)',
          'What feels stiff? What\'s easy?'
        ]
      },
      {
        order: 3,
        title: 'Figure-8 Eye Tracking',
        instructions: 'Imagine a figure-8 (infinity symbol) in front of you. Trace it with your eyes slowly, then faster.',
        duration: '2 minutes',
        cues: [
          'Large 8 shape',
          'Slow first (soothing)',
          'Then medium speed (engaging)',
          'Feel your eye muscles working',
          'This integrates both hemispheres'
        ]
      },
      {
        order: 4,
        title: 'Gaze Steadiness Practice',
        instructions: 'Look at a point (wall, horizon, mirror). Soften your gaze. Can you hold steady contact without tension?',
        duration: '3 minutes',
        cues: [
          'Pick a focal point',
          'Gaze steady, not hard',
          'Soften jaw and forehead',
          'Notice if you can feel "being seen"',
          'Fear or safety?'
        ]
      },
      {
        order: 5,
        title: 'Rapid Eye Flutter',
        instructions: 'Blink rapidly and deliberately. Flutter eyelids. Let tears come if they want to. Tremoring lids are normal.',
        duration: '2 minutes',
        cues: [
          'Rapid, gentle blinking',
          'Eyelids may tremor (this is release)',
          'Tears are welcome',
          'This stimulates vagal tone',
          'Feels purifying'
        ]
      },
      {
        order: 6,
        title: 'Mirror Gazing (Optional)',
        instructions: 'If available, look at yourself in a mirror. Can you meet your own eyes? What emotions come?',
        duration: '3 minutes',
        cues: [
          'Meet your own gaze',
          'Can you be kind to yourself through your eyes?',
          'Fear of self-seeing?',
          'Softness or defensiveness?',
          'This is profound self-relationship work'
        ]
      },
      {
        order: 7,
        title: 'Integration and Perception Shift',
        instructions: 'Close eyes. Notice how the world looks when you open them again. Softer? Clearer? More connected?',
        duration: '2 minutes',
        cues: [
          'Did your perception shift?',
          'Can you see more?',
          'Do people look friendlier?',
          'Do you feel safer being seen?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'I feel dizzy during eye movements. Is this normal?',
        answer: 'Mild dizziness can happen—eyes and balance are connected. Slow your movements. If severe dizziness, sit down and breathe. Start gently and build up. Dizziness usually lessens with practice.'
      },
      {
        question: 'Why do I feel panicked when looking at my own eyes?',
        answer: 'Self-seeing can trigger fear ("What if I see something I don\'t like?") or dissociation ("I don\'t recognize myself"). This is armor protecting you. Gently keep practicing. Self-compassion through your own eyes is powerful healing.'
      },
      {
        question: 'Can this help with social anxiety?',
        answer: 'Often, yes. Social anxiety stems from fear of being seen. Eye Liberation practice directly addresses that fear at the nervous system level. Over time, eye contact becomes easier and less threatening.'
      },
      {
        question: 'I cry easily during this. Why?',
        answer: 'Eyes are windows to the soul. When you unlock eye armor, stored emotion releases—often as tears. This is healing. The tears are grief or relief stored in the eyes.'
      },
      {
        question: 'Can I do this daily?',
        answer: 'Yes. Even 5 minutes daily of eye exercises is powerful. Unlike intense discharge practices, Eye Liberation is gentle enough for daily use.'
      }
    ]
  },

  {
    id: 'holotropic-spiral-breathing',
    name: 'Holotropic Spiral Breathing',
    shortDescription: 'Journey beyond consciousness. Deep catharsis and non-ordinary states.',
    intention: 'Transpersonal access, metabolize suppressed material, access non-ordinary states',
    duration: { min: 20, max: 45 },
    difficulty: 'Advanced',
    focusSegments: ['whole-body', 'nervous-system', 'transpersonal'],
    primaryMechanism: 'Hyperventilation-induced respiratory alkalosis, increased theta brainwaves, DMN suppression (default mode network), holotropic state activation',
    evidenceLevel: 'Emerging',
    requiresContraindicationScreen: true,
    musicPlaylists: [
      { title: 'Holotropic Journey', url: 'https://open.spotify.com/playlist/holotropic-breathwork' },
      { title: 'Grof Holotropic Collection', url: 'https://www.youtube.com/results?search_query=holotropic+breathwork' }
    ],
    safetyNotes: [
      'CRITICAL: Contraindication screening is MANDATORY before access.',
      'Stop if chest pain, severe tetany (hand cramping), or loss of consciousness risk',
      'Never exceed 60 minutes alone',
      'Support person recommended nearby',
      'Lie down entire time (standing/walking increases risk)',
      'Music integral (silence can be overwhelming)'
    ],
    contraindications: [
      'Cardiovascular disease (heart condition, hypertension on meds)',
      'Epilepsy or seizure history',
      'Severe asthma or respiratory disease',
      'Active psychosis or mania',
      'Pregnancy',
      'Unmanaged panic disorder or dissociative disorders'
    ],

    explanation: {
      overview: `Holotropic Spiral Breathing is the most advanced practice in this system. Based on Grof\'s Holotropic Breathwork, it\'s a 20-45 minute journey into non-ordinary consciousness through controlled hyperventilation. It\'s powerful, profound, and NOT for beginners. You metabolize years of suppressed material, access altered states, and often experience transpersonal phenomena (visions, spiritual experiences, past-life imagery). It\'s deep medicine—and it carries risks. Contraindication screening is non-negotiable.`,
      mechanism: `Continuous hyperventilation increases blood oxygen and decreases CO2, creating respiratory alkalosis. This shifts your brain into theta frequencies (associated with dreams, meditation, and non-ordinary states). Your default mode network (DMN—the "thinking mind") suppresses, allowing unconscious material to surface. Music creates a container, guiding you through the journey. When done safely, this is profound healing. When done carelessly, it can dysregulate vulnerable nervous systems.`,
      benefits: [
        'Metabolize years of suppressed emotion and trauma in one session',
        'Access non-ordinary consciousness and spiritual experiences',
        'Breakthrough insights and identity shifts',
        'Deep catharsis and nervous system reorganization',
        'Often produces lasting peace, presence, and meaning'
      ],
      whenToUse: 'ONLY after months of consistent grounding and breathing practice. In a safe, contained environment. With support person nearby recommended. Never alone your first time. After contraindication screening clearance only.'
    },

    steps: [
      {
        order: 1,
        title: 'Sacred Container Setup',
        instructions: 'Choose private, comfortable space. Dim lights. Prepare music (see playlists). Have water, tissues, eye mask nearby.',
        duration: '5 minutes',
        cues: [
          'Private (no interruptions)',
          'Comfortable temperature',
          'Music queued and ready',
          'Bathroom access',
          'Support person nearby (optional but recommended)',
          'Phone on silent'
        ]
      },
      {
        order: 2,
        title: 'Lie Down and Set Intention',
        instructions: 'Lie supine. Knees bent or straight (your choice). Hands at sides, palms up. Close eyes or eye mask on. Take 3 normal breaths. Set simple intention.',
        duration: '3 minutes',
        cues: [
          'Comfortable position',
          'Warm blanket optional',
          'Intention: "Show me what I need to see" or "Open me to healing"',
          'No complex intentions—simple is best',
          'Feel your body supported by floor'
        ]
      },
      {
        order: 3,
        title: 'Begin Music and Connected Breathing',
        instructions: 'Start music. Open mouth. Breathe in through mouth, immediately out (no pause). Full breath, steady rhythm. Aim for 80-120 breaths per minute.',
        duration: '5-10 minutes',
        cues: [
          'Mouth open, relaxed jaw',
          'Continuous breathing (no pause between in/out)',
          'Full breath but not forced',
          'Steady rhythm throughout',
          'Music guides you'
        ]
      },
      {
        order: 4,
        title: 'Peak Intensity Breathing',
        instructions: 'Maintain fast breathing. Your nervous system activates fully. Emotions, visions, body sensations all intensify. Keep breathing—don\'t stop.',
        duration: '10-25 minutes',
        cues: [
          'What arises? Emotion? Visions? Sensations?',
          'Tremoring, shaking—all normal',
          'Tetany (hand cramping)—normal, temporary',
          'Visions, past-life imagery, spiritual experiences—real for you',
          'Fear? Breathe through it.',
          'Music carries you—trust it'
        ]
      },
      {
        order: 5,
        title: 'Natural Descent and Closing Breath',
        instructions: 'When ready (or after 45 min), slow your breathing naturally. Return to normal breathing. Keep eyes closed.',
        duration: '5 minutes',
        cues: [
          'Slow gradually—don\'t stop abruptly',
          'Return to natural rhythm',
          'Rest with eyes closed',
          'Integration beginning'
        ]
      },
      {
        order: 6,
        title: 'Grounded Integration',
        instructions: 'Lie still with eyes closed for 10-15 minutes MINIMUM. Music playing softly. Your nervous system reorganizing. This is essential.',
        duration: '10-15 minutes minimum',
        cues: [
          'Absolute stillness',
          'No moving, no thinking',
          'Just be',
          'Notice the profound calm emerging',
          'Your system is healing itself'
        ]
      },
      {
        order: 7,
        title: 'Gentle Return to Waking',
        instructions: 'Slowly open eyes. Wiggle fingers and toes. Roll to side. Slowly push to sitting. Sit briefly. Then stand carefully.',
        duration: '5-10 minutes',
        cues: [
          'Move slowly—you may feel spacious or altered',
          'Drink water',
          'Journal insights if called to',
          'Rest for next 1-2 hours if possible',
          'Avoid driving until fully grounded'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Why do my hands cramp (tetany) during this?',
        answer: 'Alkalosis from fast breathing causes electrolyte shifts, triggering muscle contraction. It\'s temporary and harmless. You can pause, shake your hands, and resume. Or slow your breathing slightly. Tetany passes quickly.'
      },
      {
        question: 'I\'m having visions/spiritual experiences. Are they real?',
        answer: 'Yes and no. They\'re real experiences—your brain is generating them. In non-ordinary states, the unconscious becomes visible. Visions, past-life imagery, spiritual experiences—all are valid expressions of your psyche processing material. Don\'t dismiss them; integrate them.'
      },
      {
        question: 'Is this like hyperventilating into a panic attack?',
        answer: 'No. Panic is uncontrolled, unconscious. This is intentional, conscious, contained breathing with music support. The difference is agency, intention, and container.'
      },
      {
        question: 'Can I do this if I have trauma history?',
        answer: 'With caution. Trauma survivors should work with a therapist alongside this practice. Your first session should have a support person present. The practice can surface intense material—be prepared for emotional intensity. But it\'s also profoundly healing for trauma.'
      },
      {
        question: 'How often can I do this?',
        answer: 'Maximum every 2 weeks. This is profound work. Your nervous system needs recovery. Monthly is ideal for most people. Never do weekly—it can dysregulate.'
      },
      {
        question: 'What if I feel panicked during the breathing?',
        answer: 'Slow your breathing immediately. Do longer exhales (count: in 4, out 6) to calm your system. When calm, you can resume the practice or stop. Panic is information—your nervous system is saying "slow down."'
      }
    ]
  },

  {
    id: 'conscious-intensity-protocol',
    name: 'Conscious Intensity Protocol',
    shortDescription: 'Build nervous system capacity. Train your window of tolerance.',
    intention: 'Expand arousal capacity, metabolize freeze/fawn, train post-traumatic resilience',
    duration: { min: 15, max: 30 },
    difficulty: 'Advanced',
    focusSegments: ['whole-body', 'nervous-system', 'parasympathetic'],
    primaryMechanism: 'Deliberate sympathetic activation with conscious witnessing, vagal oscillation (polyvagal theory), window of tolerance expansion',
    evidenceLevel: 'Moderate',
    safetyNotes: [
      'Stop if panic, dissociation, or flashbacks intensify',
      'Stop if numbness/freeze occurs (indicator of overwhelm)',
      'Have "emergency brake" ready: slower breath, grounding, pause',
      'Practice in safe, familiar space'
    ],
    contraindications: [
      'Unresolved PTSD (work with therapist first)',
      'Cardiovascular contraindications',
      'Active dissociative episodes',
      'Acute trauma response'
    ],

    explanation: {
      overview: `Most bioenergetics work is about release and discharge. Conscious Intensity Protocol does something different: it BUILDS capacity. It deliberately activates your nervous system (sympathetic arousal) while you WITNESS the activation without collapsing. Over time, this trains your window of tolerance—your capacity to handle intensity without freezing or panicking. It\'s trauma-informed nervous system training for post-traumatic growth.`,
      mechanism: `Trauma survivors often have narrow windows of tolerance. Too much arousal → panic. Too little → dissociation/numbness. The Polyvagal solution: gradually expand that window through deliberate arousal + safe witnessing. You activate sympathetic (fast heart rate, alertness), then intentionally rebound to parasympathetic (calm). You\'re teaching your nervous system: "I can handle activation. I\'m safe."`,
      benefits: [
        'Expands window of tolerance (ability to handle intensity)',
        'Trains freeze/fawn trauma responses out of nervous system',
        'Builds resilience and post-traumatic growth',
        'Reclaims agency and capacity',
        'Complements traditional trauma therapy'
      ],
      whenToUse: 'After solid grounding practice. For trauma survivors rebuilding capacity. To train nervous system resilience. 2-3x per week (recovery time needed).'
    },

    steps: [
      {
        order: 1,
        title: 'Baseline Calibration',
        instructions: 'Sit or stand comfortably. Feel your resting state. Notice your heart rate, breathing, body temperature. Set your "too much" boundary (when you\'ll stop).',
        duration: '3 minutes',
        cues: [
          'What\'s your resting heart rate?',
          'Breath rate?',
          'Feeling calm or anxious?',
          'Define "too much": panic? Dissociation? Numbness?',
          'When you hit that, you pause or stop.'
        ]
      },
      {
        order: 2,
        title: 'Gradual Arousal Build',
        instructions: 'Begin slow, controlled activation. Fast breathing (not hyperventilation—controlled pace). Add stomping, shaking. Gradually increase intensity.',
        duration: '5 minutes',
        cues: [
          'Breath rate increasing',
          'Shake your body gently—arms, legs, torso',
          'Stomp your feet rhythmically',
          'Heart rate rising—notice it',
          'Incrementally increase—don\'t jump to max'
        ]
      },
      {
        order: 3,
        title: 'Peak Intensity Window',
        instructions: 'Reach your peak arousal (fast breathing, full-body shaking, maybe vocalization). WITNESS this state—you\'re activating, yet safe and conscious.',
        duration: '3-8 minutes',
        cues: [
          'Heart racing, breathing fast, body shaking',
          'STAY CONSCIOUS: feel the ground, see the room',
          'This arousal is safe—you generated it intentionally',
          'You\'re the witness to your own intensity',
          'Notice: "I can handle this."'
        ]
      },
      {
        order: 4,
        title: 'Conscious Discharge and Tremoring',
        instructions: 'From peak, allow full-body tremoring and natural discharge. Sound is welcome (moaning, growling). Let your system release.',
        duration: '4 minutes',
        cues: [
          'Full tremoring—legs, core, whole body',
          'Sound from your body',
          'This is discharge—your system releasing held activation',
          'Breathing naturally (not forced)',
          'You\'re witnessed and safe'
        ]
      },
      {
        order: 5,
        title: 'Parasympathetic Rebound',
        instructions: 'Slow your movement. Slower, deeper breaths (extended exhales). Feel your nervous system shift toward calm. This is the key part: the rebound.',
        duration: '5 minutes',
        cues: [
          'Slow, deliberate breathing (4 count in, 6-8 out)',
          'Movement slower, more grounded',
          'Heart rate decreasing',
          'Feel safety returning',
          'This rebound is training—your system learning: "Intensity passes. Calm returns."'
        ]
      },
      {
        order: 6,
        title: 'Integration and Reflection',
        instructions: 'Sit or lie down. Close eyes. Rest 5+ minutes. Reflect: "What did I learn about my capacity?"',
        duration: '5 minutes',
        cues: [
          'Stillness and rest',
          'Notice the calm',
          'Journal: "I can handle intensity. I can return to calm."',
          'What shifted in your window of tolerance?'
        ]
      }
    ],

    commonQuestions: [
      {
        question: 'Is this triggering myself on purpose?',
        answer: 'No. Triggering is unconscious and dysregulating. This is conscious activation with witnessed return to calm. The difference is agency. You control it. Triggers control you.'
      },
      {
        question: 'How is this different from hyperventilation or panic?',
        answer: 'Panic is unconscious activation you can\'t control. This is intentional activation you guide. You set the intensity, you witness it, you rebound. That conscious control is what trains resilience.'
      },
      {
        question: 'Will this help me freeze less?',
        answer: 'Yes. Freeze is your system\'s protective response to overwhelming arousal. By repeatedly activating + returning safely, you\'re telling your nervous system: "Arousal is survivable. You don\'t need to shut down." Over time, freeze responses diminish.'
      },
      {
        question: 'How often should I do this?',
        answer: 'Start 2x per week. Your nervous system needs recovery time between sessions. As capacity builds, you can experiment with frequency. But never more than 4x per week.'
      },
      {
        question: 'Can I do this alone?',
        answer: 'Yes, after you\'re familiar with it. But for first sessions, having a support person nearby is wise. They don\'t need to do it with you—just be present. As you build trust in your own capacity, solo practice is fine.'
      },
      {
        question: 'What if I freeze during this?',
        answer: 'Freezing is information: you\'ve exceeded your window. Stop immediately. Slow your breathing. Ground your feet. Open your eyes and look around. When calm, you can gently try again or rest. No judgment—this is learning.'
      }
    ]
  }
];

/**
 * Chatbot quick-reply buttons (context-dependent)
 * These appear as quick-access buttons in the chatbot sidebar
 */
export const universalChatbotQueries = [
  { text: 'I feel numb or disconnected', icon: '😶' },
  { text: 'I feel panicked or overwhelmed', icon: '😰' },
  { text: 'Is this normal?', icon: '❓' },
  { text: 'Can I modify this?', icon: '🛠️' },
  { text: 'Safety concerns', icon: '⚠️' },
  { text: 'How often should I do this?', icon: '📅' },
  { text: 'I\'m not feeling anything', icon: '😐' }
];
