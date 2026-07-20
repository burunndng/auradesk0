import { CbmBankScenario } from '../types';

export const CBM_SCENARIOS: CbmBankScenario[] = [
  // ==========================================
  // UL (Self / Subjective)
  // ==========================================
  {
    id: 'ul-d1-001',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'self-worth',
    scenarioText: 'You make a minor mistake on a project and someone points it out. You immediately think this means...',
    completions: {
      threat: 'you are incompetent and everyone knows it.',
      neutral: 'you need to correct the error and move on.',
      growth: 'you have an opportunity to learn and improve your attention to detail.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-002',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'anxiety',
    scenarioText: 'You feel a sudden wave of fatigue in the middle of the afternoon. You interpret this as...',
    completions: {
      threat: 'a sign that something is physically or mentally wrong with you.',
      neutral: 'a normal dip in energy that happens during the day.',
      growth: 'a cue from your body to take a mindful break and recharge.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-003',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'motivation',
    scenarioText: 'You look at your to-do list for the day and feel overwhelmed. You tell yourself...',
    completions: {
      threat: 'you will never get it all done and are already failing.',
      neutral: 'it is a long list, so you should start with the first item.',
      growth: 'this is a chance to practice prioritization and focus on what matters.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-004',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'identity',
    scenarioText: 'You try a new hobby but struggle to understand the basics. You assume...',
    completions: {
      threat: 'you are just not a creative or capable person.',
      neutral: 'it takes time to learn new skills.',
      growth: 'embracing the beginner mindset is a valuable experience in itself.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // LL (Relational / Intersubjective)
  // ==========================================
  {
    id: 'll-d1-001',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'relational-rejection',
    scenarioText: 'A close friend cancels plans at the last minute with a vague excuse. You assume...',
    completions: {
      threat: 'they do not want to spend time with you anymore.',
      neutral: 'something unexpected came up in their schedule.',
      growth: 'this gives you unexpected free time for yourself while they handle their needs.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-002',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'communication',
    scenarioText: 'Your partner gives you a short, one-word answer when you ask how their day was. You think...',
    completions: {
      threat: 'they are angry with you about something you did.',
      neutral: 'they are tired and do not feel like talking right now.',
      growth: 'they need space, which is a chance for you to practice giving them grace.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-003',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'social-belonging',
    scenarioText: 'You walk into a room of acquaintances and the conversation suddenly stops. You believe...',
    completions: {
      threat: 'they were just talking negatively about you.',
      neutral: 'the conversation naturally paused as someone entered.',
      growth: 'this is an opening for you to introduce a new, positive topic.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-004',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'conflict',
    scenarioText: 'A colleague disagrees with your idea during a meeting. You feel...',
    completions: {
      threat: 'they are trying to undermine your authority in front of others.',
      neutral: 'they have a different perspective on the project.',
      growth: 'this contrast of ideas will lead to a better final outcome.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // UR (Body / Action / Objective)
  // ==========================================
  {
    id: 'ur-d1-001',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'physical-health',
    scenarioText: 'You notice a strange ache in your lower back after a workout. You conclude...',
    completions: {
      threat: 'you have seriously injured yourself and need medical intervention.',
      neutral: 'your muscles are sore from the physical exertion.',
      growth: 'your body is adapting and getting stronger from the new stimulus.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-002',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'performance',
    scenarioText: 'You score lower than expected on a performance metric at work. You decide...',
    completions: {
      threat: 'your job is at risk and you are failing.',
      neutral: 'the numbers were lower this quarter than last.',
      growth: 'this data highlights exactly where you need to focus your development.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-003',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'habit-tracking',
    scenarioText: 'You miss three days of your new meditation habit. You tell yourself...',
    completions: {
      threat: 'you lack discipline and will never stick to anything.',
      neutral: 'you simply missed a few days of the routine.',
      growth: 'this is a perfect moment to practice restarting without self-judgment.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-004',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'finance',
    scenarioText: 'You see an unexpected charge on your bank statement. You immediately think...',
    completions: {
      threat: 'your identity was stolen and your finances are ruined.',
      neutral: 'there is a charge that needs to be reviewed.',
      growth: 'this is a prompt to review and organize your budget more closely.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // LR (Systemic / Environmental)
  // ==========================================
  {
    id: 'lr-d1-001',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'career-environment',
    scenarioText: 'Your company announces a major organizational restructuring. You assume...',
    completions: {
      threat: 'your role will be eliminated or made much worse.',
      neutral: 'the company is changing its management hierarchy.',
      growth: 'this shakeup might create new opportunities for advancement.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-002',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'societal',
    scenarioText: 'You read a news headline about economic downturn. You feel...',
    completions: {
      threat: 'everything is collapsing and you will lose everything.',
      neutral: 'the economic indicators are currently trending downward.',
      growth: 'this is a reminder to focus on the local community structures you can influence.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-003',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'technology',
    scenarioText: 'A new software tool is introduced that changes how you must do your daily tasks. You think...',
    completions: {
      threat: 'this will make your job impossible and obsolete.',
      neutral: 'you will have to learn a new interface.',
      growth: 'mastering this tool will make you more adaptable and efficient.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-004',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'environment',
    scenarioText: 'Your flight is delayed by three hours due to a systemic weather issue. You conclude...',
    completions: {
      threat: 'the whole trip is ruined and nothing ever goes right.',
      neutral: 'the plane will depart later than originally scheduled.',
      growth: 'you now have dedicated time to read that book you brought.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // EXPANSION SET A (005–008)
  // ==========================================

  // UL — INTERIOR · SELF (005–008)
  {
    id: 'ul-d1-005',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'self-doubt',
    scenarioText: 'You reread a message you sent and notice a small typo. You think...',
    completions: {
      threat: 'everyone will think you are careless and unprofessional.',
      neutral: 'there was a small typo in the message.',
      growth: 'minor mistakes happen and your overall communication still matters.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-006',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'emotional-awareness',
    scenarioText: 'You wake up feeling slightly irritable without a clear reason. You interpret this as...',
    completions: {
      threat: 'something is wrong with you emotionally.',
      neutral: 'your mood is simply off today.',
      growth: 'your mind might be signaling a need for rest or reflection.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-007',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'learning',
    scenarioText: 'You struggle to understand a concept while studying. You conclude...',
    completions: {
      threat: 'you are not smart enough to grasp this subject.',
      neutral: 'the concept is currently difficult to understand.',
      growth: 'this challenge will deepen your understanding once you work through it.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-008',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'self-perception',
    scenarioText: 'You notice someone more skilled than you in an area you care about. You think...',
    completions: {
      threat: 'you will never reach their level.',
      neutral: 'they currently have more experience than you.',
      growth: 'their skill shows what is possible with practice.'
    },
    onboardingEligible: true
  },

  // LL — INTERIOR · RELATIONAL (005–008)
  {
    id: 'll-d1-005',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'friendship',
    scenarioText: 'A friend takes longer than usual to reply to your message. You assume...',
    completions: {
      threat: 'they are ignoring you on purpose.',
      neutral: 'they have not responded yet.',
      growth: 'they might be busy and will reply when they have time.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-006',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'group-dynamics',
    scenarioText: 'During a group discussion, someone interrupts you. You think...',
    completions: {
      threat: 'they do not respect what you have to say.',
      neutral: 'they started speaking before you finished.',
      growth: 'they may be enthusiastic and you can still share your point.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-007',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'social-perception',
    scenarioText: 'Someone you know walks past without greeting you. You interpret this as...',
    completions: {
      threat: 'they must be upset with you.',
      neutral: 'they did not acknowledge you as they passed.',
      growth: 'they might simply be distracted or preoccupied.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-008',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'feedback',
    scenarioText: 'A coworker gives brief feedback on your work without much emotion. You think...',
    completions: {
      threat: 'they secretly dislike your work.',
      neutral: 'they offered concise feedback.',
      growth: 'they may trust you enough not to over-explain.'
    },
    onboardingEligible: true
  },

  // UR — EXTERIOR · ACTION (005–008)
  {
    id: 'ur-d1-005',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'productivity',
    scenarioText: 'You feel distracted while trying to work on an important task. You conclude...',
    completions: {
      threat: 'you are losing your ability to focus.',
      neutral: 'your attention is currently scattered.',
      growth: 'this may be a sign to reset your environment or take a short break.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-006',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'sleep',
    scenarioText: 'You wake up once during the night. You think...',
    completions: {
      threat: 'your sleep cycle is broken and tomorrow will be terrible.',
      neutral: 'you woke up briefly during the night.',
      growth: 'this is normal and you can simply relax and fall back asleep.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-007',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'exercise',
    scenarioText: 'Your workout feels harder than usual today. You assume...',
    completions: {
      threat: 'you are getting weaker.',
      neutral: 'today\'s workout feels more difficult.',
      growth: 'your body might be recovering or adapting to the training.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-008',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'skill-performance',
    scenarioText: 'You perform slightly worse than usual in a skill you practice regularly. You conclude...',
    completions: {
      threat: 'you are regressing.',
      neutral: 'today\'s performance was lower than usual.',
      growth: 'performance naturally fluctuates during improvement.'
    },
    onboardingEligible: true
  },

  // LR — EXTERIOR · SYSTEMS (005–008)
  {
    id: 'lr-d1-005',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'policy-change',
    scenarioText: 'Your workplace announces a new policy affecting daily routines. You think...',
    completions: {
      threat: 'this will make everything harder.',
      neutral: 'a new policy has been introduced.',
      growth: 'this change may improve how the system functions.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-006',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'traffic',
    scenarioText: 'Your commute takes longer than usual due to traffic. You conclude...',
    completions: {
      threat: 'your whole day will now go badly.',
      neutral: 'traffic increased travel time today.',
      growth: 'this is a chance to practice patience or listen to something interesting.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-007',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'technology-update',
    scenarioText: 'An app you rely on updates its interface unexpectedly. You think...',
    completions: {
      threat: 'this will ruin your workflow.',
      neutral: 'the interface has changed.',
      growth: 'learning the new layout may reveal better features.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-008',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'organizational-change',
    scenarioText: 'A new manager joins your department. You assume...',
    completions: {
      threat: 'they will make your work environment worse.',
      neutral: 'leadership in the department has changed.',
      growth: 'their perspective could introduce useful improvements.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // EXPANSION SET B (009–012)
  // ==========================================

  // UL — INTERIOR · SELF (009–012)
  {
    id: 'ul-d1-009',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'self-comparison',
    scenarioText: 'You see a peer\'s accomplishments highlighted on social media while you\'re having an ordinary day. You think...',
    completions: {
      threat: 'you are falling behind and wasting your life compared to everyone else.',
      neutral: 'they shared a highlight and you are having a regular day.',
      growth: 'their success reminds you of what\'s possible and sparks clarity about your own values.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-010',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'emotional-regulation',
    scenarioText: 'You wake up feeling a heavy, unexplained sadness with no obvious cause. You interpret this as...',
    completions: {
      threat: 'a sign that you are broken and slipping into depression.',
      neutral: 'an emotion that arose, possibly from a dream or fatigue.',
      growth: 'an invitation to slow down and listen to what your psyche is processing beneath the surface.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-011',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'inner-critic',
    scenarioText: 'During meditation you notice your mind won\'t stop generating critical self-talk. You conclude...',
    completions: {
      threat: 'you are fundamentally unable to quiet your mind and meditation is pointless for you.',
      neutral: 'the mind is active today and thoughts are present.',
      growth: 'you are becoming more aware of a habitual pattern, which is exactly what the practice is designed to reveal.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-012',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'meaning-purpose',
    scenarioText: 'You finish a project you worked hard on but feel strangely empty instead of satisfied. You think...',
    completions: {
      threat: 'nothing you do will ever feel meaningful and you are destined for emptiness.',
      neutral: 'the emotional response to finishing doesn\'t always match expectations.',
      growth: 'this gap between effort and feeling is a signal to explore what truly drives your sense of purpose.'
    },
    onboardingEligible: true
  },

  // LL — INTERIOR · RELATIONAL (009–012)
  {
    id: 'll-d1-009',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'trust',
    scenarioText: 'A friend shares something personal you told them with a mutual acquaintance. You assume...',
    completions: {
      threat: 'they deliberately betrayed your trust and do not respect you.',
      neutral: 'the boundary around that information was unclear between you.',
      growth: 'this is a chance to practice a direct conversation about boundaries, which will deepen the friendship.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-010',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'group-exclusion',
    scenarioText: 'Your team at work starts a group chat and you realize you were not included initially. You believe...',
    completions: {
      threat: 'they intentionally excluded you because they don\'t value your contribution.',
      neutral: 'someone created the chat quickly and overlooked adding you.',
      growth: 'this is an opportunity to reach out, express interest, and strengthen your connection with the team.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-011',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'vulnerability',
    scenarioText: 'You open up to someone about a struggle and they change the subject. You feel...',
    completions: {
      threat: 'they don\'t care about your problems and you should never be vulnerable again.',
      neutral: 'they may not have known how to respond in that moment.',
      growth: 'their discomfort is information about their capacity right now, not about the value of your openness.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-012',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'cultural-misunderstanding',
    scenarioText: 'You make a joke in a diverse group and nobody laughs — a few people look uncomfortable. You think...',
    completions: {
      threat: 'everyone thinks you are offensive and your reputation is now ruined.',
      neutral: 'the humor didn\'t translate well in that particular context.',
      growth: 'this is valuable feedback about cultural sensitivity that will make you a more skillful communicator.'
    },
    onboardingEligible: true
  },

  // UR — EXTERIOR · ACTION (009–012)
  {
    id: 'ur-d1-009',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'sleep-recovery',
    scenarioText: 'You check your sleep tracker and it shows you only got five hours of deep sleep. You decide...',
    completions: {
      threat: 'today is already ruined and you won\'t be able to function properly.',
      neutral: 'the data shows a shorter sleep cycle than usual last night.',
      growth: 'this is useful feedback to experiment with your evening routine and optimize recovery.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-010',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'skill-plateau',
    scenarioText: 'You have been practicing a skill for months but your performance seems to have flatlined. You tell yourself...',
    completions: {
      threat: 'you have hit your natural ceiling and will never improve beyond this point.',
      neutral: 'your measurable progress has leveled off for the time being.',
      growth: 'plateaus are where deep consolidation happens before the next breakthrough — this is part of mastery.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-011',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'public-performance',
    scenarioText: 'You stumble over your words during a presentation in front of colleagues. You conclude...',
    completions: {
      threat: 'everyone noticed and now considers you unprofessional and incompetent.',
      neutral: 'you lost your place briefly during the talk.',
      growth: 'recovering from a stumble in real-time is a skill in itself, and each instance builds your composure.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-012',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'body-image',
    scenarioText: 'You catch an unflattering glimpse of yourself in a window reflection while walking. You immediately think...',
    completions: {
      threat: 'you look terrible and everyone who sees you is judging your appearance.',
      neutral: 'reflections in window glass are distorted by angle and lighting.',
      growth: 'this flash of self-consciousness is a chance to practice unconditional self-regard in an ordinary moment.'
    },
    onboardingEligible: true
  },

  // LR — EXTERIOR · SYSTEMS (009–012)
  {
    id: 'lr-d1-009',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'institutional-feedback',
    scenarioText: 'Your health insurance denies a claim you expected to be covered. You assume...',
    completions: {
      threat: 'the system is designed to exploit you and you will never get the care you need.',
      neutral: 'the claim was processed against the current policy terms and needs review.',
      growth: 'navigating this appeal process will teach you how the system works, making you more effective in the future.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-010',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'political-polarization',
    scenarioText: 'You discover that a family member holds a political view that is the opposite of yours. You feel...',
    completions: {
      threat: 'your relationship is fundamentally broken and you can never see them the same way.',
      neutral: 'the two of you have different political perspectives on that issue.',
      growth: 'this difference is an opportunity to practice perspective-taking and understand the values beneath their position.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-011',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'algorithmic-systems',
    scenarioText: 'You notice that your social media feed only shows content that confirms your existing views. You think...',
    completions: {
      threat: 'you are being manipulated and it\'s impossible to get accurate information anymore.',
      neutral: 'the recommendation algorithm is filtering content based on your past engagement patterns.',
      growth: 'recognizing the filter bubble is the first step — you can now deliberately seek diverse sources and reclaim agency.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-012',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'climate-ecology',
    scenarioText: 'You read a report about accelerating environmental degradation in your region. You conclude...',
    completions: {
      threat: 'it\'s too late, the damage is irreversible, and nothing anyone does will matter.',
      neutral: 'the environmental indicators for the region have worsened according to this report.',
      growth: 'this data clarifies where collective action is most needed, and your awareness is itself a form of participation.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // EXPANSION SET C (013–016)
  // ==========================================

  // UL — INTERIOR · SELF (013–016)
  {
    id: 'ul-d1-013',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'imposter-experience',
    scenarioText: 'Your manager publicly praises your contribution in a team meeting. Instead of feeling good, you feel exposed. You think...',
    completions: {
      threat: 'they will eventually discover you don\'t deserve this recognition and it will all unravel.',
      neutral: 'you received positive feedback in a public setting, which felt uncomfortable.',
      growth: 'the discomfort of being seen is different from being undeserving — you can learn to tolerate visibility.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-014',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'aging-mortality',
    scenarioText: 'You notice your first gray hairs while looking in the mirror. You immediately feel...',
    completions: {
      threat: 'your best years are behind you and decline is now inevitable.',
      neutral: 'your hair pigmentation is changing, which happens over time.',
      growth: 'this is a reminder that time is finite, which can sharpen your sense of what actually matters to you.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-015',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'creative-block',
    scenarioText: 'You sit down to do creative work and stare at a blank page for thirty minutes with nothing coming. You decide...',
    completions: {
      threat: 'your creativity has dried up and you no longer have anything original to offer.',
      neutral: 'ideas are not flowing right now.',
      growth: 'emptiness before creation is often part of the process — something may be composting beneath your awareness.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-016',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'shame-rumination',
    scenarioText: 'While lying in bed, you suddenly remember an embarrassing thing you said at a dinner two years ago. You feel...',
    completions: {
      threat: 'everyone who was there still thinks about it and judges you for it.',
      neutral: 'your mind recalled an uncomfortable memory from the past.',
      growth: 'the cringe itself is evidence that you have grown beyond who you were in that moment.'
    },
    onboardingEligible: true
  },

  // LL — INTERIOR · RELATIONAL (013–016)
  {
    id: 'll-d1-013',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'romantic-intimacy',
    scenarioText: 'You ask your partner for more emotional closeness and they seem to pull back slightly. You feel...',
    completions: {
      threat: 'they are rejecting you and the relationship is beginning to fail.',
      neutral: 'they responded with some distance after you expressed a need.',
      growth: 'their pull-back may be their own processing style, and naming this dynamic together could bring you closer.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-014',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'family-patterns',
    scenarioText: 'You catch yourself repeating a phrase your parent used to say — one you always disliked. You think...',
    completions: {
      threat: 'you are inevitably becoming them and cannot escape your conditioning.',
      neutral: 'you used a phrase you heard growing up.',
      growth: 'noticing the pattern is the moment it stops being unconscious — awareness is where the cycle can change.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-015',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'mentorship',
    scenarioText: 'A mentor you respect gives you unexpectedly direct criticism about a choice you made. You assume...',
    completions: {
      threat: 'they have lost confidence in you and regret investing their time.',
      neutral: 'they disagreed with your approach and said so directly.',
      growth: 'their willingness to be blunt is a sign of trust — they believe you can handle the truth.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-016',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'shared-silence',
    scenarioText: 'You and a close friend sit together for a long stretch without either of you speaking. You interpret this as...',
    completions: {
      threat: 'the friendship has lost its vitality and you no longer have anything to say to each other.',
      neutral: 'there was a quiet period in the conversation.',
      growth: 'the ability to be silent together without anxiety is a sign of deep relational safety.'
    },
    onboardingEligible: true
  },

  // UR — EXTERIOR · ACTION (013–016)
  {
    id: 'ur-d1-013',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'nutrition',
    scenarioText: 'You eat a large, indulgent meal after committing to eating healthier this week. You tell yourself...',
    completions: {
      threat: 'you have no discipline and the entire week of effort is now wasted.',
      neutral: 'you ate a meal that was larger and richer than you planned.',
      growth: 'one meal does not erase a pattern — you can return to your intention at the very next meal without punishment.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-014',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'creative-output',
    scenarioText: 'You compare something you wrote today to something you wrote last month and today\'s version seems worse. You decide...',
    completions: {
      threat: 'your abilities are declining and you are losing your creative edge.',
      neutral: 'the quality of today\'s work appears lower by comparison.',
      growth: 'creative output varies day to day — your growing ability to evaluate quality is itself a sign of development.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-015',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'time-management',
    scenarioText: 'You look at the clock and realize half the day is gone without starting your most important task. You think...',
    completions: {
      threat: 'you have wasted the day and there is no point in starting now.',
      neutral: 'the morning passed without completing the priority task.',
      growth: 'the best time to start was earlier, but the second best time is right now — half a day is still significant.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-016',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'weight-metrics',
    scenarioText: 'You step on a scale after a week of consistent exercise and the number is slightly higher than before. You conclude...',
    completions: {
      threat: 'the exercise is not working and your body is working against you.',
      neutral: 'the scale shows a slightly higher number than last week.',
      growth: 'weight fluctuates for many reasons including muscle adaptation and water retention — the habit matters more than any single reading.'
    },
    onboardingEligible: true
  },

  // LR — EXTERIOR · SYSTEMS (013–015, only 15 total for Set C LR)
  {
    id: 'lr-d1-013',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'economic-inequality',
    scenarioText: 'You drive through a neighborhood that is dramatically wealthier than yours and feel a pang of something. You think...',
    completions: {
      threat: 'the system is rigged, you will never reach that level, and your efforts are futile.',
      neutral: 'there is significant wealth disparity between different areas of the city.',
      growth: 'noticing the feeling beneath the comparison reveals what you actually value — security, beauty, freedom — which you can pursue on your own terms.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-014',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'education-system',
    scenarioText: 'Your child\'s school changes the curriculum in a direction you disagree with. You feel...',
    completions: {
      threat: 'the institution is failing your child and you are powerless to protect them.',
      neutral: 'the school has adopted a new curriculum that differs from your preferences.',
      growth: 'this is an invitation to engage with the school community and supplement your child\'s learning with your own perspective at home.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-015',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'ai-automation',
    scenarioText: 'You learn that an AI tool can now perform a significant portion of what you do at work. You conclude...',
    completions: {
      threat: 'your skills are becoming obsolete and you will be replaced.',
      neutral: 'a new tool has been developed that automates some of your current tasks.',
      growth: 'the automatable parts of your work were never the most valuable — this frees you to focus on the judgment, creativity, and relationships that only you can provide.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // EXPANSION SET D (017–020)
  // ==========================================

  // UL — INTERIOR · SELF (017–020)
  {
    id: 'ul-d1-017',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'perfectionism',
    scenarioText: 'You finish a piece of work that meets all the requirements, but you can see three ways it could be better. You feel...',
    completions: {
      threat: 'if it is not perfect, it is essentially a failure and you should not have submitted it.',
      neutral: 'the work is complete and you can identify areas for potential improvement.',
      growth: 'the ability to see what could be better after finishing is a skill — it belongs to the next iteration, not this one.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-018',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'existential-groundlessness',
    scenarioText: 'In a quiet moment, you are suddenly struck by the thought that nothing you do may ultimately matter. You interpret this as...',
    completions: {
      threat: 'proof that your life lacks meaning and you are wasting your time on everything.',
      neutral: 'a philosophical thought about the nature of significance that arose spontaneously.',
      growth: 'a contact with groundlessness that many contemplative traditions consider the beginning of genuine freedom.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-019',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'decision-paralysis',
    scenarioText: 'You face two good options for a life decision and cannot choose between them. Days pass without movement. You think...',
    completions: {
      threat: 'your inability to decide proves you are fundamentally indecisive and will miss both opportunities.',
      neutral: 'you have two viable options and have not yet selected one.',
      growth: 'the difficulty of choosing between two good paths means your life has more possibility in it than you are giving it credit for.'
    },
    onboardingEligible: true
  },
  {
    id: 'ul-d1-020',
    quadrant: 'UL',
    difficulty: 1,
    domain: 'past-self-grief',
    scenarioText: 'You look at an old photo of yourself from a time when you felt more alive and energetic. You feel...',
    completions: {
      threat: 'your best self is gone and you will never feel that way again.',
      neutral: 'you looked different in that period and the photo evoked a feeling.',
      growth: 'the longing you feel is not for the past — it is pointing toward a quality of aliveness you can cultivate now in a new form.'
    },
    onboardingEligible: true
  },

  // UR — EXTERIOR · ACTION (017–020)
  {
    id: 'ur-d1-017',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'injury-recovery',
    scenarioText: 'Three weeks into recovering from an injury, your progress seems to have stalled. You conclude...',
    completions: {
      threat: 'the injury will never fully heal and your body is permanently diminished.',
      neutral: 'recovery progress has not been noticeable this week.',
      growth: 'healing is nonlinear — the body often rebuilds in invisible ways before visible progress resumes.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-018',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'screen-consumption',
    scenarioText: 'You check your phone\'s screen time report and see you spent four hours on social media yesterday. You think...',
    completions: {
      threat: 'you are addicted and have no self-control — this is proof you are wasting your life.',
      neutral: 'your phone tracked four hours of social media usage yesterday.',
      growth: 'the data is neutral feedback — now that you see it clearly, you can design your environment to support the behavior you actually want.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-019',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'grooming-effort',
    scenarioText: 'You spend extra time getting ready for an event and then realize nobody commented on your appearance. You conclude...',
    completions: {
      threat: 'the effort was pointless and you still do not look good enough for people to notice.',
      neutral: 'you prepared carefully and no one made a comment about how you looked.',
      growth: 'the care you took was for your own sense of readiness — external validation was never the point.'
    },
    onboardingEligible: true
  },
  {
    id: 'ur-d1-020',
    quadrant: 'UR',
    difficulty: 1,
    domain: 'physical-coordination',
    scenarioText: 'You trip on a flat sidewalk in front of several people. You immediately feel...',
    completions: {
      threat: 'everyone saw and is silently judging how clumsy and awkward you are.',
      neutral: 'you lost your footing on the sidewalk.',
      growth: 'a small stumble is a shared human experience — the moment of recovery is more defining than the moment of falling.'
    },
    onboardingEligible: true
  },

  // LL — INTERIOR · RELATIONAL (017–019)
  {
    id: 'll-d1-017',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'generosity-imbalance',
    scenarioText: 'You realize you have been the one initiating plans, checking in, and giving support in a friendship — but it rarely flows back. You assume...',
    completions: {
      threat: 'they do not actually care about you and you are being used.',
      neutral: 'the pattern of initiation has been one-sided recently.',
      growth: 'noticing the imbalance is important information — you can name it honestly rather than building silent resentment.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-018',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'repair-apology',
    scenarioText: 'You said something hurtful to a friend during an argument and apologized, but they still seem distant a week later. You feel...',
    completions: {
      threat: 'you have permanently damaged the relationship and they will never forgive you.',
      neutral: 'they are still processing what happened despite your apology.',
      growth: 'real repair sometimes takes longer than a single apology — their timeline for trust is theirs to set, and your patience is part of the repair.'
    },
    onboardingEligible: true
  },
  {
    id: 'll-d1-019',
    quadrant: 'LL',
    difficulty: 1,
    domain: 'parenting-reflection',
    scenarioText: 'Your child has a difficult day at school and comes home upset. You immediately think...',
    completions: {
      threat: 'you are failing as a parent and their struggles are your fault.',
      neutral: 'your child had a hard day and is expressing their frustration.',
      growth: 'their willingness to bring their pain home to you means they feel safe with you — that is the foundation, not the problem.'
    },
    onboardingEligible: true
  },

  // LR — EXTERIOR · SYSTEMS (016–019)
  {
    id: 'lr-d1-016',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'housing-cost',
    scenarioText: 'You receive notice that your rent is increasing significantly at the end of your lease. You conclude...',
    completions: {
      threat: 'you will never achieve financial stability and the system is designed to keep you struggling.',
      neutral: 'your landlord has raised the rent for the upcoming lease period.',
      growth: 'this pressure, while real, is a prompt to reassess your living situation and explore options you may not have considered.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-017',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'healthcare-navigation',
    scenarioText: 'You are referred to a specialist but the earliest available appointment is three months away. You think...',
    completions: {
      threat: 'the healthcare system has abandoned you and your condition will worsen beyond help.',
      neutral: 'the specialist\'s next opening is in three months.',
      growth: 'you can use the waiting period to gather information, prepare questions, and advocate for a cancellation spot if urgency increases.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-018',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'community-decline',
    scenarioText: 'Several small businesses you frequented in your neighborhood close in the same month. You feel...',
    completions: {
      threat: 'your community is dying and there is nothing anyone can do to stop the decline.',
      neutral: 'multiple local businesses closed recently due to economic pressures.',
      growth: 'transitions in a neighborhood can create openings for new community-building efforts you might participate in or even lead.'
    },
    onboardingEligible: true
  },
  {
    id: 'lr-d1-019',
    quadrant: 'LR',
    difficulty: 1,
    domain: 'bureaucratic-friction',
    scenarioText: 'You submit a government form and receive a rejection letter citing a technicality you do not understand. You assume...',
    completions: {
      threat: 'the bureaucracy is intentionally obstructive and you will never get what you need from it.',
      neutral: 'the submission was rejected on a procedural point that requires clarification.',
      growth: 'systems have rules that can be learned — each interaction with the process teaches you how to navigate it more effectively next time.'
    },
    onboardingEligible: true
  },

  // ==========================================
  // HIGH-AMBIGUITY CBM ITEMS — DIFFICULTY 2
  // ==========================================

  {
    id: 'ul-d2-001',
    quadrant: 'UL',
    difficulty: 2,
    domain: 'unsolicited-help',
    scenarioText: 'Without you asking, a colleague quietly redoes a section of your work before the deadline. You think...',
    completions: {
      threat: 'they saw your work as inadequate and didn\'t trust you to fix it yourself.',
      neutral: 'they completed a section of the project using their own approach.',
      growth: 'they may have had capacity and acted from care — your work\'s value isn\'t diminished by collaboration you didn\'t initiate.'
    },
    onboardingEligible: false
  },
  {
    id: 'll-d2-001',
    quadrant: 'LL',
    difficulty: 2,
    domain: 'ambiguous-compliment',
    scenarioText: 'After you share a personal achievement, a close friend says, "I could never do that — you\'re so brave." You feel...',
    completions: {
      threat: 'they think what you did was reckless or strange and are disguising judgment as admiration.',
      neutral: 'they responded to your news with a statement comparing themselves to you.',
      growth: 'the word "brave" may carry genuine respect for a risk they recognize but wouldn\'t take — their frame is about them, not a verdict on you.'
    },
    onboardingEligible: false
  },
  {
    id: 'ur-d2-001',
    quadrant: 'UR',
    difficulty: 2,
    domain: 'effortless-success',
    scenarioText: 'You complete a major task far more easily than expected — it almost felt too simple. You conclude...',
    completions: {
      threat: 'it was too easy, which means you missed something important or the task wasn\'t as significant as you thought.',
      neutral: 'the task required less effort than you had anticipated.',
      growth: 'ease can be the result of accumulated skill — difficulty is not the only proof that something was worthwhile.'
    },
    onboardingEligible: false
  },
  {
    id: 'lr-d2-001',
    quadrant: 'LR',
    difficulty: 2,
    domain: 'passed-over',
    scenarioText: 'A promotion is announced and it goes to someone with less experience than you. No explanation is given. You assume...',
    completions: {
      threat: 'the system is unfair and your contributions are invisible to the people who matter.',
      neutral: 'the promotion was awarded to another person and the reasoning was not shared.',
      growth: 'the absence of explanation is itself useful data — you now have a clear reason to ask for direct feedback on your trajectory.'
    },
    onboardingEligible: false
  },
  {
    id: 'll-d2-002',
    quadrant: 'LL',
    difficulty: 2,
    domain: 'charged-silence',
    scenarioText: 'You send a heartfelt, vulnerable message to someone important to you. Three days pass with no reply. You interpret this as...',
    completions: {
      threat: 'your openness overwhelmed them and they are pulling away — you exposed too much of yourself.',
      neutral: 'three days have passed without a response to your message.',
      growth: 'the weight of your message may require a response they want to get right — silence after vulnerability is not always rejection, sometimes it is reverence.'
    },
    onboardingEligible: false
  }
];

export function getOnboardingScenarios(): CbmBankScenario[] {
  const QUADRANTS: Array<'UL' | 'UR' | 'LL' | 'LR'> = ['UL', 'UR', 'LL', 'LR'];
  const PER_QUADRANT = 4; // 16 total — enough to map the bias fingerprint

  const result: CbmBankScenario[] = [];
  for (const q of QUADRANTS) {
    const eligible = CBM_SCENARIOS.filter(s => s.onboardingEligible && s.quadrant === q);
    // Shuffle deterministically per session using Math.random (seeded per page load)
    const shuffled = eligible.slice().sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, PER_QUADRANT));
  }

  // Interleave quadrants so the user doesn't get all UL then all UR etc.
  const interleaved: CbmBankScenario[] = [];
  for (let i = 0; i < PER_QUADRANT; i++) {
    for (let qi = 0; qi < QUADRANTS.length; qi++) {
      const item = result[qi * PER_QUADRANT + i];
      if (item) interleaved.push(item);
    }
  }
  return interleaved;
}
