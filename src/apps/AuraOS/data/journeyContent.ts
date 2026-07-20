import { JourneyRegion } from '../types.ts';

export const journeyRegions: JourneyRegion[] = [
  {
    id: 'core',
    name: 'The Core Map',
    emoji: '✦',
    description: 'The essential coordinates of Integral Theory—orienting yourself within the territory of all perspectives.',
    cards: [
      {
        id: 'core-aqal',
        title: 'What is "Integral"?',
        keyIdea: 'Integral is a meta-framework for organizing perspectives, not a belief system or ideology.',
        explain: [
          'Reality is irreducibly perspectival—no single viewpoint captures the whole. "Integral" is the attempt to include all valid perspectives without reducing any to the others.',
          'The AQAL map (All Quadrants, All Levels, All Lines, All States, All Types) provides coordinates for navigating this territory.',
          'The orienting question is not "Which view is true?" but "What is each perspective revealing that others miss?"',
        ],
        example:
          'Treating anxiety integrally: Interior practice (meditation), Exterior intervention (exercise/medication), Cultural support (community/therapy), Systemic conditions (financial security, safety). Any single-quadrant approach is partial.',
        tryIt:
          'Take a persistent problem in your life. Map it across quadrants: What is happening internally? Behaviorally? Culturally? Systemically? Notice which dimension you habitually ignore.',
        check: {
          question: 'The integral orientation fundamentally shifts from asking "Which perspective is correct?" to asking...',
          answers: [
            'Which tradition has the best spiritual technology?',
            'What is each perspective revealing that others cannot see?',
            'How can we synthesize all views into one unified theory?',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'core-quadrants',
        title: 'The 4 Quadrants',
        keyIdea: 'Interior and Exterior, Individual and Collective—four irreducible dimensions of every occasion.',
        explain: [
          'Upper-Left (I): The interior of the individual—thoughts, feelings, intentions, phenomenal experience.',
          'Upper-Right (It): The exterior of the individual—brain states, behavior, physiology, observable action.',
          'Lower-Left (We): The interior of the collective—culture, shared meaning, intersubjective understanding.',
          'Lower-Right (Its): The exterior of the collective—systems, institutions, environments, techno-economic structures.',
        ],
        example:
          'A moment of insight: There is the felt sense of understanding (UL), the neural correlates firing (UR), the cultural context that made the idea intelligible (LL), and the books/technology that transmitted it (LR). All four are real; none reduces to another.',
        tryIt:
          'Observe your hand as an object (UR). Now feel the interior aliveness within it (UL). Notice how your cultural conditioning shapes what "hand" even means (LL). Consider the evolutionary/biological systems that produced it (LR).',
        check: {
          question: 'The claim that "consciousness is just neurons firing" represents which methodological error?',
          answers: [
            'Reducing Upper-Left (subjective experience) to Upper-Right (objective correlates)',
            'Confusing Lower-Left (culture) with Lower-Right (systems)',
            'Elevating individual perspectives over collective ones',
          ],
          correctIndex: 0,
        },
      },
      {
        id: 'core-pretrans',
        title: 'The Pre/Trans Fallacy',
        keyIdea: 'Non-rational is not one thing—it encompasses both pre-rational (not yet rational) and trans-rational (having included and transcended rationality).',
        explain: [
          'Development moves from Pre-Rational (magical, impulsive, egocentric) → Rational (logical, rule-governed, perspectival) → Trans-Rational (integral, holistic, including rationality).',
          'The Pre/Trans Fallacy: Confusing Pre and Trans because both are non-rational. This takes two forms:',
          'Reductionism (wtf-1): Reducing Trans to Pre—dismissing genuine spiritual insight as infantile regression or wishful fantasy.',
          'Elevationism (wtf-2): Elevating Pre to Trans—calling narcissistic impulses "authentic spontaneity" or magical thinking "higher wisdom."',
        ],
        example:
          'An infant has no ego boundaries (pre-personal). A sage has fluid boundaries (trans-personal). The surface similarity masks radically different structures: one has not yet differentiated; the other has differentiated and integrated.',
        tryIt:
          'Examine a "spiritual" behavior you admire. Ask honestly: Is this transcending reason because it includes and goes beyond logic? Or is it avoiding reason because rationality is difficult or uncomfortable?',
        check: {
          question: 'Someone claiming they don\'t need boundaries because they are "beyond such limitations" may be exhibiting...',
          answers: [
            'Genuine trans-rational wisdom',
            'Pre-rational regression mislabeled as trans-rational attainment',
            'A valid critique of conventional morality',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'mind',
    name: 'Mind & Development',
    emoji: '◇',
    description: 'The vertical dimension of consciousness—how structures of meaning-making evolve through increasingly inclusive perspectives.',
    cards: [
      {
        id: 'mind-levels',
        title: 'Levels (Structures) of Consciousness',
        keyIdea: 'Development expands the circle of identity and care: from self, to tribe, to all humanity, to all sentient beings.',
        explain: [
          'Egocentric (Archaic/Magic/Red): The world revolves around immediate needs. Power, survival, impulsivity.',
          'Ethnocentric (Mythic/Amber): Identity expands to one\'s group. Loyalty, order, tradition, conformity.',
          'Worldcentric (Rational/Orange, Pluralistic/Green): Identity expands to include all humans. Universal rights, scientific inquiry, multicultural sensitivity.',
          'Kosmocentric (Integral/Teal+): Identity expands to include the entire Kosmos. Systemic thinking, developmental empathy, capacity to hold multiple perspectives.',
        ],
        example:
          'The same behavior (not stealing) can arise from different altitudes: "I\'ll get punished" (egocentric), "It\'s against God\'s law" (ethnocentric), "It violates human rights" (worldcentric), "I understand the conditions that lead to theft while maintaining appropriate boundaries" (integral).',
        tryIt:
          'Take a political position you hold strongly. Can you identify the egocentric, ethnocentric, and worldcentric versions of that position? Notice how each level has partial truths.',
        check: {
          question: 'The transition from ethnocentric to worldcentric primarily involves...',
          answers: [
            'Replacing religious beliefs with scientific facts',
            'Extending moral consideration beyond one\'s in-group to all humans regardless of tribe',
            'Rejecting all traditional values as outdated',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'mind-lines',
        title: 'Lines (Multiple Intelligences)',
        keyIdea: 'Development is radically uneven—we can be at different altitudes in different capacities.',
        explain: [
          'Lines are relatively independent streams of development: cognitive, emotional, moral, interpersonal, kinesthetic, spiritual, aesthetic, and more.',
          'Your "psychograph" shows peaks and valleys. You might be cognitively sophisticated (high cognitive line) while emotionally reactive (low emotional line).',
          'Shadow often lives in the gap between our advanced lines and our lagging lines. We use our strengths to avoid our weaknesses.',
        ],
        example:
          'A renowned spiritual teacher with profound meditative attainment (high spiritual line) who exploits students sexually (low moral/psychosexual line). The scandal reveals the independence of lines, not the failure of spirituality itself.',
        tryIt:
          'Map your own psychograph. Where are you most developed (your "gifts")? Where are you lagging (your "growing edges")? Notice any defensiveness about the lagging lines.',
        check: {
          question: 'The existence of multiple developmental lines explains phenomena like...',
          answers: [
            'Why IQ tests perfectly predict life success',
            'Why brilliant intellectuals can behave like emotional toddlers',
            'Why development is fundamentally linear and predictable',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'body',
    name: 'Body & Energy',
    emoji: '◈',
    description: 'Integral Somatics: The body as ground, vehicle, and temple—across gross, subtle, and causal dimensions.',
    cards: [
      {
        id: 'body-3bodies',
        title: 'The Three Bodies',
        keyIdea: 'You inhabit three interpenetrating bodies: physical, energetic, and causal.',
        explain: [
          'Gross Body (Physical): Flesh, bone, organ systems. Domain of exercise, nutrition, sleep, physical health.',
          'Subtle Body (Energetic): Prana/Chi/Ki, energy channels (nadis/meridians), chakras, felt sense. Domain of breathwork, qigong, energetic attunement.',
          'Causal Body (Formless): The body of deep dreamless sleep, the ground of infinite openness. Accessed through formless meditation and radical rest.',
        ],
        example:
          'After intense exercise, notice: the physical fatigue (gross), the energetic "buzz" or flow sensation (subtle), and the spacious stillness beneath both (causal). All three are present when you attend to them.',
        tryIt:
          'Inhale deeply. Feel the physical expansion of lungs (gross). Sense the energy spreading through your body (subtle). Rest in the open awareness that contains both (causal).',
        check: {
          question: 'Pranayama, breathwork, and qigong primarily operate on which body?',
          answers: [
            'The gross body through muscular conditioning',
            'The subtle body through energetic cultivation',
            'The causal body through formless awareness',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'body-trauma',
        title: 'The Body Keeps the Score',
        keyIdea: 'Psychological material is stored somatically—insight alone cannot release what is locked in tissue and nervous system.',
        explain: [
          'Trauma, shadow, and emotional conditioning are encoded in the body: chronic tension, postural patterns, breath holding, defensive armoring.',
          'Cognitive understanding ("I know why I\'m anxious") rarely liberates somatic holding. The body needs body-level intervention.',
          'Descending practices (grounding, feeling, allowing, releasing) are as essential as ascending practices (transcending, witnessing).',
        ],
        example:
          'You\'ve done years of talk therapy and understand your patterns intellectually. Yet the same tension arises in your chest, the same collapse in your posture. The body hasn\'t received the memo.',
        tryIt:
          'Scan your body for one area of chronic tension. Rather than analyzing or trying to fix it, simply breathe into it and allow whatever sensation arises. Let the body speak.',
        check: {
          question: 'The phrase "top-down approaches are insufficient" in trauma work suggests...',
          answers: [
            'Hierarchy should be eliminated from all therapeutic relationships',
            'Cognitive and insight-based methods need to be complemented by somatic and body-based approaches',
            'Trauma is ultimately a delusion that can be reasoned away',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'spirit',
    name: 'Spirit & States',
    emoji: '✡',
    description: 'The territory of Waking Up: States of consciousness and the stabilization of awakening.',
    cards: [
      {
        id: 'spirit-states',
        title: 'States vs. Stages',
        keyIdea: 'States are temporary experiences; stages are permanent structures. The goal is state-stage integration.',
        explain: [
          'States (temporary): Peak experiences, flow, mystical openings, altered states. They come and go, require no development to access, and are "free" in that sense.',
          'Stages (permanent): Structures of consciousness that develop over time, create new baselines of functioning, and define how you interpret experience.',
          'The Wilber-Combs Lattice: Any state can be experienced from any stage. A person at an egocentric stage can have a unity experience—but will interpret it egocentrically.',
        ],
        example:
          'Psychedelic mystical experiences (state) are widely available. But integrating them into stable wisdom (stage) requires ongoing practice. The flash is not the same as the flame.',
        tryIt:
          'Recall a peak experience you\'ve had. How did you interpret it at the time? How do you interpret it now? Has your structural perspective (stage) changed?',
        check: {
          question: 'The Wilber-Combs Lattice reveals that a powerful spiritual state experienced by someone at an ethnocentric stage will likely be interpreted...',
          answers: [
            'In universal and inclusive terms since the state transcends development',
            'Through the ethnocentric lens that filters all their experience',
            'As evidence that stages don\'t actually exist',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'spirit-3faces',
        title: 'The Three Faces of Spirit',
        keyIdea: 'Spirit can be approached as 1st-person (I AM), 2nd-person (Thou), or 3rd-person (It/Web of Life).',
        explain: [
          '1st Person (Spirit as I): The Self, Pure Witness, Big Mind, I AM. Cultivated through meditation, self-inquiry, nondual pointing-out instructions.',
          '2nd Person (Spirit as Thou): The Beloved, God, the Great Other. Cultivated through prayer, devotion, relationship with the sacred.',
          '3rd Person (Spirit as It): Nature, the Web of Life, the Kosmos, the Great Mystery. Cultivated through nature immersion, awe, scientific wonder.',
          'All three are faces of one Spirit. An integral spirituality honors and practices all three.',
        ],
        example:
          'Resting as Awareness (1st-person). Praying to the Divine (2nd-person). Marveling at the cosmos (3rd-person). Same Ground, different faces.',
        tryIt:
          'Which face of spirit is most natural for you? Which do you avoid? Spend 60 seconds genuinely engaging the one you avoid.',
        check: {
          question: 'A spiritual practitioner who only meditates (1st-person) and never engages devotion (2nd-person) or nature (3rd-person) is...',
          answers: [
            'Practicing the purest form of spirituality',
            'Cultivating an unnecessarily narrow spiritual life',
            'Following the traditional path correctly',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'shadow',
    name: 'Shadow & Integration',
    emoji: '◆',
    description: 'Cleaning Up: Re-owning the disowned, integrating the split-off, reclaiming the projected.',
    cards: [
      {
        id: 'shadow-proj',
        title: 'Projection & the Mirror',
        keyIdea: 'What irritates you in others often points to what you\'ve disowned in yourself—and what you idealize may be your unlived potential.',
        explain: [
          'Repression: We push unacceptable parts of ourselves (or too-good-to-claim parts) out of awareness.',
          'Projection: What\'s repressed doesn\'t disappear—it gets projected onto others and perceived "out there."',
          'Recognition: Disproportionate emotional charge (fascination or revulsion) is the telltale sign that you\'re looking in a mirror.',
        ],
        example:
          'Intense irritation with someone\'s "arrogance" may reveal your own repressed sense of superiority. Fascination with someone\'s "wild freedom" may reveal your own caged vitality.',
        tryIt:
          'Think of someone who triggers you. Name the quality you react to. Now ask: "Where does this quality live in me?" Let the discomfort of the question be instructive.',
        check: {
          question: 'The phrase "If you spot it, you got it" in shadow work means...',
          answers: [
            'You should immediately confront others about their flaws',
            'Your strong emotional reaction to a quality in others often indicates that quality exists (disowned) in you',
            'You are always responsible for other people\'s behavior',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'shadow-321',
        title: 'The 3-2-1 Process',
        keyIdea: 'Re-own projections by moving from 3rd-person (It) to 2nd-person (You) to 1st-person (I).',
        explain: [
          '3rd Person (Face It): Describe the disturbance in third-person. "He is controlling." Observe it as an object.',
          '2nd Person (Talk to It): Address the disturbance directly as "You." "What do you want? What are you protecting?"',
          '1st Person (Be It): Become the disturbance, speaking as "I." "I am the controlling one. I need..." This re-owns the projected energy.',
        ],
        example:
          'A "critical voice" that seems to attack you from the outside. By becoming it ("I am the critic. I am trying to protect you from failure..."), the energy transforms from persecutor to ally.',
        tryIt:
          'Choose a minor irritation. Move through the three steps: describe it (It), speak to it (You), become it (I). Notice any shift in your relationship to it.',
        check: {
          question: 'The 3-2-1 process is complete when...',
          answers: [
            'The disturbance has been eliminated entirely',
            'The projected energy has been re-owned and integrated as part of your first-person perspective',
            'You have successfully analyzed the other person\'s psychology',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'integral',
    name: 'Integration',
    emoji: '⬡',
    description: 'Weaving it together: Designing a sustainable Integral Life Practice.',
    cards: [
      {
        id: 'integral-goldstar',
        title: 'Gold Star Practices',
        keyIdea: 'The most effective practices engage multiple modules simultaneously—maximum depth per minute invested.',
        explain: [
          'Time is finite. The integral practitioner looks for high-leverage practices that hit multiple targets.',
          '"Gold Star" practices are those that efficiently engage Body + Mind + Spirit, or combine Shadow work with relationship, or integrate ethics with action.',
          'The goal is not more practice, but more integral practice: cross-training the entire being.',
        ],
        example:
          'Mindful running: Body (aerobic), Mind (present-moment attention), Spirit (contact with ground and breath). Conscious dialogue: Mind (perspective-taking), Shadow (projection awareness), Relations (connection).',
        tryIt:
          'Take an activity you already do. How might you "upgrade" it to include an additional module? What small tweak would make it more integral?',
        check: {
          question: 'The principle behind "Gold Star" practices is...',
          answers: [
            'That the most time-consuming practices are always the most effective',
            'That practices engaging multiple dimensions of being provide higher return on time invested',
            'That spiritual practice should replace physical practice',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'integral-ethics',
        title: 'Integral Ethics',
        keyIdea: 'The greatest depth for the greatest span—honoring both the quality and the quantity of consciousness.',
        explain: [
          'Depth: The degree of consciousness, care, and complexity a being can embody.',
          'Span: The number of beings and the extent of the system considered.',
          'Integral Ethics: Not a utilitarian calculus (span only) nor an elitist ranking (depth only), but a dynamic balancing of both.',
        ],
        example:
          'Protecting biodiversity isn\'t just about "number of species" (span). It\'s about maintaining the conditions for consciousness to continue evolving (depth). Both matter.',
        tryIt:
          'Consider a difficult ethical choice you face. What would depth-only logic suggest? What would span-only logic suggest? How might you honor both?',
        check: {
          question: 'The formula "greatest depth for the greatest span" suggests that integral ethics must hold tension between...',
          answers: [
            'Tradition and innovation',
            'Qualitative development of consciousness and quantitative inclusivity of beings',
            'Eastern and Western philosophies',
          ],
          correctIndex: 1,
        },
      },
    ],
  },
];

export const journeyBadges = {
  'core-complete': {
    name: 'Cartographer',
    description: 'You have oriented to the Integral Map.',
    emoji: '✦',
  },
  'mind-complete': {
    name: 'Developmentalist',
    description: 'You see the vertical dimension of consciousness.',
    emoji: '◇',
  },
  'body-complete': {
    name: 'Soma Adept',
    description: 'You inhabit all three bodies consciously.',
    emoji: '◈',
  },
  'spirit-complete': {
    name: 'Awakener',
    description: 'You understand the territory of Waking Up.',
    emoji: '✡',
  },
  'shadow-complete': {
    name: 'Shadow Worker',
    description: 'You are reclaiming what was disowned.',
    emoji: '◆',
  },
  'integral-complete': {
    name: 'Weaver',
    description: 'You are integrating all dimensions of practice.',
    emoji: '⬡',
  },
};
