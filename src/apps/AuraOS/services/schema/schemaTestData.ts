/**
 * Schema Therapy Test Data
 *
 * Contains all test items, Likert scales, constants, and raw data for:
 * - EMS (Early Maladaptive Schemas) 90-item questionnaire
 * - Schema Mode 160-item questionnaire
 * - Coping Style items
 * - Test metadata and definitions
 */

import type {
  SchemaTestId,
  SchemaTestDefinition,
  SchemaName,
  SchemaDomain,
  SchemaMode
} from '../../types';

// ============================================================================
// Question Banks
// ============================================================================

/**
 * EMS Question Bank: 90 items (5 per schema × 18 schemas)
 * Organized by domain and schema
 * Likert scale: 1 (Completely untrue) to 6 (Describes me perfectly)
 */
export const EMS_QUESTIONS = {
  'disconnection-rejection': {
    'abandonment': [
      { id: 'ems-ab-1', text: 'I worry that people I feel close to will leave me or abandon me.' },
      { id: 'ems-ab-2', text: 'I need other people too much, which makes them want to get away from me.' },
      { id: 'ems-ab-3', text: 'I become very anxious when I sense that someone important is withdrawing from me.' },
      { id: 'ems-ab-4', text: 'I feel desperate when someone I love seems to be losing interest in me.' },
      { id: 'ems-ab-5', text: 'Sometimes I am so worried about people leaving me that I drive them away.' }
    ],
    'mistrust-abuse': [
      { id: 'ems-ma-1', text: 'I feel that I cannot let my guard down in the presence of other people, or else they will intentionally hurt me.' },
      { id: 'ems-ma-2', text: 'I am quite suspicious of other people\'s motives.' },
      { id: 'ems-ma-3', text: 'I expect people to take advantage of me if I give them the chance.' },
      { id: 'ems-ma-4', text: 'I have a history of choosing partners who hurt me or abuse me.' },
      { id: 'ems-ma-5', text: 'People have abused, humiliated, or taken advantage of me throughout my life.' }
    ],
    'emotional-deprivation': [
      { id: 'ems-ed-1', text: 'I feel that I do not have enough love and affection in my life.' },
      { id: 'ems-ed-2', text: 'No one really understands me or can meet my emotional needs.' },
      { id: 'ems-ed-3', text: 'I have not had someone to nurture me, share him/herself with me, or care deeply about everything that happens to me.' },
      { id: 'ems-ed-4', text: 'Most of the time, I feel emotionally empty or numb inside.' },
      { id: 'ems-ed-5', text: 'I feel that there is no one who really listens to me or is emotionally tuned into my needs.' }
    ],
    'defectiveness-shame': [
      { id: 'ems-ds-1', text: 'I am fundamentally different from other people - flawed or defective in some way.' },
      { id: 'ems-ds-2', text: 'No man/woman I desire would want to stay close to me if they knew the real me.' },
      { id: 'ems-ds-3', text: 'If others found out about my flaws or shortcomings, I could not face them.' },
      { id: 'ems-ds-4', text: 'I am too unacceptable in very basic ways to reveal myself to other people.' },
      { id: 'ems-ds-5', text: 'When people like me, I feel like I am fooling them - they don\'t see the real defective me.' }
    ],
    'social-isolation': [
      { id: 'ems-si-1', text: 'I feel alienated from other people - different and set apart.' },
      { id: 'ems-si-2', text: 'I don\'t belong anywhere; I\'m a loner.' },
      { id: 'ems-si-3', text: 'I feel disconnected even from those I am close to - as if there is a barrier between us.' },
      { id: 'ems-si-4', text: 'I don\'t fit in at social gatherings; I feel awkward and out of place.' },
      { id: 'ems-si-5', text: 'My family or social group is very different from me in their values and interests.' }
    ]
  },
  'impaired-autonomy': {
    'dependence-incompetence': [
      { id: 'ems-di-1', text: 'I do not feel capable of getting by on my own in everyday life.' },
      { id: 'ems-di-2', text: 'I need other people to help me make decisions or tell me what to do.' },
      { id: 'ems-di-3', text: 'I have always let others make decisions for me because I do not trust my own judgment.' },
      { id: 'ems-di-4', text: 'I feel helpless when I am left alone to manage daily responsibilities.' },
      { id: 'ems-di-5', text: 'I think of myself as a dependent person, when it comes to everyday functioning.' }
    ],
    'vulnerability': [
      { id: 'ems-vu-1', text: 'I worry that something bad is about to happen - that I could have a medical, financial, or other catastrophe at any time.' },
      { id: 'ems-vu-2', text: 'I feel that the world is a dangerous place and that disaster could strike at any moment.' },
      { id: 'ems-vu-3', text: 'I worry excessively about getting a serious illness, even though nothing has been diagnosed.' },
      { id: 'ems-vu-4', text: 'I am overly cautious and take excessive precautions to avoid accidents or other disasters.' },
      { id: 'ems-vu-5', text: 'I am constantly anxious that a financial or natural catastrophe could occur at any moment.' }
    ],
    'enmeshment': [
      { id: 'ems-en-1', text: 'I am so involved with my parent(s) or partner that I do not have a clear sense of my own identity.' },
      { id: 'ems-en-2', text: 'It is very difficult for me to maintain any emotional distance from the people I am close to - I have trouble separating my viewpoint from theirs.' },
      { id: 'ems-en-3', text: 'I feel that I have very little privacy in my intimate relationships - the other person is too involved in every aspect of my life.' },
      { id: 'ems-en-4', text: 'At least one parent or I have been overly involved in each other\'s lives and problems.' },
      { id: 'ems-en-5', text: 'I have great difficulty separating my feelings and opinions from those of my parent(s) or partner.' }
    ],
    'failure': [
      { id: 'ems-fa-1', text: 'I am incompetent when it comes to achievement - school, work, sports, etc.' },
      { id: 'ems-fa-2', text: 'I am stupid or less intelligent than most people when it comes to work or school.' },
      { id: 'ems-fa-3', text: 'I feel humiliated by my failures in the work sphere.' },
      { id: 'ems-fa-4', text: 'I feel that I am less successful than others in areas of work or achievement.' },
      { id: 'ems-fa-5', text: 'Most other people are more capable than I am in areas of work and achievement.' }
    ]
  },
  'impaired-limits': {
    'entitlement-grandiosity': [
      { id: 'ems-eg-1', text: 'I feel that I am special and shouldn\'t have to accept many of the restrictions placed on other people.' },
      { id: 'ems-eg-2', text: 'I hate to be constrained or kept from doing what I want.' },
      { id: 'ems-eg-3', text: 'I feel that I shouldn\'t have to follow the normal rules and conventions that other people do.' },
      { id: 'ems-eg-4', text: 'I believe my opinions and values are more important than those of others.' },
      { id: 'ems-eg-5', text: 'I have great difficulty accepting "no" for an answer when I want something from other people.' }
    ],
    'insufficient-self-control': [
      { id: 'ems-is-1', text: 'I have trouble disciplining myself to complete routine or boring tasks.' },
      { id: 'ems-is-2', text: 'I have a hard time keeping my emotions under control when I get upset.' },
      { id: 'ems-is-3', text: 'I have difficulty controlling my impulses - I often do things impulsively that I later regret.' },
      { id: 'ems-is-4', text: 'I can\'t seem to stick to routines, plans, or commitments that I make.' },
      { id: 'ems-is-5', text: 'I have great difficulty concentrating on tasks until they are finished.' }
    ]
  },
  'other-directedness': {
    'subjugation': [
      { id: 'ems-su-1', text: 'I let other people have their way because I fear the consequences if I don\'t.' },
      { id: 'ems-su-2', text: 'I feel that I have no choice but to give in to other people\'s wishes, or else they will retaliate or reject me.' },
      { id: 'ems-su-3', text: 'In relationships, I let the other person have the upper hand.' },
      { id: 'ems-su-4', text: 'I worry that if I disagree with others, they will reject or criticize me.' },
      { id: 'ems-su-5', text: 'I feel that I have to suppress my own needs and feelings to maintain relationships.' }
    ],
    'self-sacrifice': [
      { id: 'ems-ss-1', text: 'I focus so much on the needs of others that I have little time for myself.' },
      { id: 'ems-ss-2', text: 'I am the one who usually ends up taking care of the people I am close to.' },
      { id: 'ems-ss-3', text: 'I feel guilty when I do things for myself rather than for others.' },
      { id: 'ems-ss-4', text: 'I am always the "giver" in relationships - others rarely give back to me as much as I give to them.' },
      { id: 'ems-ss-5', text: 'I believe that if I do what I want, I am being selfish.' }
    ],
    'approval-seeking': [
      { id: 'ems-as-1', text: 'I am overly concerned about pleasing others and gaining their approval.' },
      { id: 'ems-as-2', text: 'My sense of self-worth depends on what others think of me.' },
      { id: 'ems-as-3', text: 'I need recognition and attention from others to feel good about myself.' },
      { id: 'ems-as-4', text: 'I often make decisions based on what will make others like me rather than what I truly want.' },
      { id: 'ems-as-5', text: 'I am very sensitive to rejection and criticism from others.' }
    ]
  },
  'overvigilance-inhibition': {
    'negativity-pessimism': [
      { id: 'ems-np-1', text: 'I focus more on the negative aspects of life than on the positive aspects.' },
      { id: 'ems-np-2', text: 'I worry constantly that things will fall apart and problems will arise.' },
      { id: 'ems-np-3', text: 'Even when things are going well, I feel that it is only temporary - the other shoe will drop soon.' },
      { id: 'ems-np-4', text: 'I have trouble relaxing and enjoying myself because I am always worrying about what could go wrong.' },
      { id: 'ems-np-5', text: 'I anticipate making mistakes, failing, losing what I have, or being humiliated.' }
    ],
    'emotional-inhibition': [
      { id: 'ems-ei-1', text: 'I find it very difficult to express my feelings to others.' },
      { id: 'ems-ei-2', text: 'I have trouble letting myself show positive feelings like affection or caring.' },
      { id: 'ems-ei-3', text: 'People see me as emotionally uptight or inhibited.' },
      { id: 'ems-ei-4', text: 'I control myself so much that people think I am unemotional or cold.' },
      { id: 'ems-ei-5', text: 'I don\'t express anger or irritation because I am afraid of losing control or being seen negatively.' }
    ],
    'unrelenting-standards': [
      { id: 'ems-us-1', text: 'I must meet all my responsibilities and commitments - I can\'t let anything slide.' },
      { id: 'ems-us-2', text: 'I feel there is constant pressure on me to achieve and get things done.' },
      { id: 'ems-us-3', text: 'I have such high standards for myself that I can rarely live up to them.' },
      { id: 'ems-us-4', text: 'I sacrifice pleasure, health, or relationships in order to achieve my goals or meet my standards.' },
      { id: 'ems-us-5', text: 'I feel like nothing I do is ever good enough - there is always something more I should be doing.' }
    ],
    'punitiveness': [
      { id: 'ems-pu-1', text: 'I believe that people, including myself, should be punished for making mistakes.' },
      { id: 'ems-pu-2', text: 'I get very angry at myself when I don\'t meet my goals or responsibilities.' },
      { id: 'ems-pu-3', text: 'I have trouble forgiving myself or others for mistakes or shortcomings.' },
      { id: 'ems-pu-4', text: 'I am very hard on myself when I fail to live up to my standards.' },
      { id: 'ems-pu-5', text: 'I believe that people should pay for their mistakes - mercy just lets them off the hook.' }
    ]
  }
} as const;

/**
 * Schema Mode Question Bank: 160 items organized by mode category
 * Likert scale: 1 (Never/Not at all) to 6 (Always/Extremely)
 */
export const MODE_QUESTIONS = {
  child: {
    'vulnerable-child': [
      { id: 'mode-vc-1', text: 'I feel small, helpless, and powerless like a child.' },
      { id: 'mode-vc-2', text: 'I feel overwhelmed by everyday tasks and responsibilities.' },
      { id: 'mode-vc-3', text: 'I cry or feel like crying when things go wrong.' },
      { id: 'mode-vc-4', text: 'I feel lonely and empty inside.' },
      { id: 'mode-vc-5', text: 'I feel abandoned or unloved.' },
      { id: 'mode-vc-6', text: 'I need reassurance and comfort from others.' },
      { id: 'mode-vc-7', text: 'I feel anxious and insecure about the future.' },
      { id: 'mode-vc-8', text: 'I feel defective or ashamed of who I am.' },
      { id: 'mode-vc-9', text: 'I feel vulnerable to being hurt or rejected.' },
      { id: 'mode-vc-10', text: 'I feel like no one understands or cares about me.' }
    ],
    'angry-child': [
      { id: 'mode-ac-1', text: 'I feel furious when my needs are not met.' },
      { id: 'mode-ac-2', text: 'I want to lash out, yell, or throw things when I\'m angry.' },
      { id: 'mode-ac-3', text: 'I feel intense rage toward people who have hurt or disappointed me.' },
      { id: 'mode-ac-4', text: 'I have strong urges to destroy or break things when frustrated.' },
      { id: 'mode-ac-5', text: 'I feel enraged when people don\'t give me what I deserve.' },
      { id: 'mode-ac-6', text: 'I become verbally aggressive or hostile when angry.' },
      { id: 'mode-ac-7', text: 'I feel resentful and bitter about how I\'ve been treated.' },
      { id: 'mode-ac-8', text: 'I have fantasies of revenge against people who wronged me.' },
      { id: 'mode-ac-9', text: 'I lose my temper easily and explosively.' },
      { id: 'mode-ac-10', text: 'I feel justified in expressing my anger forcefully.' }
    ],
    'impulsive-child': [
      { id: 'mode-ic-1', text: 'I act on my desires without thinking about consequences.' },
      { id: 'mode-ic-2', text: 'I have difficulty waiting for what I want - I need it now.' },
      { id: 'mode-ic-3', text: 'I engage in reckless or thrill-seeking behaviors.' },
      { id: 'mode-ic-4', text: 'I make impulsive decisions that I later regret.' },
      { id: 'mode-ic-5', text: 'I seek immediate gratification and pleasure.' },
      { id: 'mode-ic-6', text: 'I have trouble controlling my urges and impulses.' },
      { id: 'mode-ic-7', text: 'I take risks without considering the potential harm.' },
      { id: 'mode-ic-8', text: 'I do things spontaneously without planning ahead.' },
      { id: 'mode-ic-9', text: 'I find it hard to delay gratification for long-term goals.' },
      { id: 'mode-ic-10', text: 'I feel restless and need constant stimulation or excitement.' }
    ],
    'undisciplined-child': [
      { id: 'mode-uc-1', text: 'I have trouble making myself do boring or routine tasks.' },
      { id: 'mode-uc-2', text: 'I give up easily when tasks become difficult.' },
      { id: 'mode-uc-3', text: 'I procrastinate and avoid responsibilities.' },
      { id: 'mode-uc-4', text: 'I lack the self-discipline to follow through on commitments.' },
      { id: 'mode-uc-5', text: 'I become frustrated and quit when things don\'t come easily.' },
      { id: 'mode-uc-6', text: 'I have difficulty organizing and completing tasks.' },
      { id: 'mode-uc-7', text: 'I feel lazy and unmotivated to work toward goals.' },
      { id: 'mode-uc-8', text: 'I avoid practicing or working on skills that need development.' },
      { id: 'mode-uc-9', text: 'I make excuses for not doing what I know I should do.' },
      { id: 'mode-uc-10', text: 'I would rather do something fun than what needs to be done.' }
    ],
    'happy-child': [
      { id: 'mode-hc-1', text: 'I feel joyful and content.' },
      { id: 'mode-hc-2', text: 'I experience spontaneous playfulness and fun.' },
      { id: 'mode-hc-3', text: 'I feel loved, valued, and secure.' },
      { id: 'mode-hc-4', text: 'I express my needs and feelings freely and confidently.' },
      { id: 'mode-hc-5', text: 'I feel connected to others and optimistic about life.' },
      { id: 'mode-hc-6', text: 'I experience genuine enthusiasm and excitement.' },
      { id: 'mode-hc-7', text: 'I feel safe to explore and be myself.' },
      { id: 'mode-hc-8', text: 'I have a sense of wonder and curiosity.' },
      { id: 'mode-hc-9', text: 'I laugh easily and enjoy simple pleasures.' },
      { id: 'mode-hc-10', text: 'I feel grateful and appreciative of what I have.' }
    ]
  },
  coping: {
    'compliant-surrender': [
      { id: 'mode-cs-1', text: 'I let others make decisions for me to avoid conflict.' },
      { id: 'mode-cs-2', text: 'I go along with what others want, even when I disagree.' },
      { id: 'mode-cs-3', text: 'I act passive and submissive in relationships.' },
      { id: 'mode-cs-4', text: 'I suppress my own needs to please others.' },
      { id: 'mode-cs-5', text: 'I feel powerless to change my situation, so I just accept it.' },
      { id: 'mode-cs-6', text: 'I tolerate mistreatment rather than standing up for myself.' },
      { id: 'mode-cs-7', text: 'I believe I have to give in to what others want.' },
      { id: 'mode-cs-8', text: 'I avoid expressing disagreement or asserting myself.' },
      { id: 'mode-cs-9', text: 'I feel I must be compliant to be loved or accepted.' },
      { id: 'mode-cs-10', text: 'I act helpless and dependent on others.' }
    ],
    'detached-protector': [
      { id: 'mode-dp-1', text: 'I emotionally disconnect from situations that upset me.' },
      { id: 'mode-dp-2', text: 'I feel numb or empty inside to avoid painful feelings.' },
      { id: 'mode-dp-3', text: 'I withdraw from social interactions and isolate myself.' },
      { id: 'mode-dp-4', text: 'I avoid getting close to people to protect myself from hurt.' },
      { id: 'mode-dp-5', text: 'I distract myself with activities to avoid thinking or feeling.' },
      { id: 'mode-dp-6', text: 'I feel like I\'m going through life on autopilot.' },
      { id: 'mode-dp-7', text: 'I detach from my body and feel disconnected from physical sensations.' },
      { id: 'mode-dp-8', text: 'I avoid intimate relationships to stay safe.' },
      { id: 'mode-dp-9', text: 'I shut down emotionally when things get intense.' },
      { id: 'mode-dp-10', text: 'I prefer being alone where I don\'t have to deal with emotions.' }
    ],
    'detached-self-soother': [
      { id: 'mode-ds-1', text: 'I use substances (alcohol, drugs) to numb my feelings.' },
      { id: 'mode-ds-2', text: 'I overeat or binge eat to comfort myself.' },
      { id: 'mode-ds-3', text: 'I engage in excessive shopping or spending to feel better.' },
      { id: 'mode-ds-4', text: 'I use sex or masturbation compulsively to soothe myself.' },
      { id: 'mode-ds-5', text: 'I spend hours on screens (TV, internet, gaming) to escape.' },
      { id: 'mode-ds-6', text: 'I sleep excessively to avoid dealing with life.' },
      { id: 'mode-ds-7', text: 'I engage in self-destructive behaviors when distressed.' },
      { id: 'mode-ds-8', text: 'I use addictive behaviors to disconnect from emotions.' },
      { id: 'mode-ds-9', text: 'I rely on distractions or numbing activities instead of addressing problems.' },
      { id: 'mode-ds-10', text: 'I have compulsive habits that temporarily make me feel better.' }
    ],
    'self-aggrandizer': [
      { id: 'mode-sa-1', text: 'I feel superior to others and believe I\'m special.' },
      { id: 'mode-sa-2', text: 'I expect others to give me special treatment.' },
      { id: 'mode-sa-3', text: 'I become arrogant or boastful about my achievements.' },
      { id: 'mode-sa-4', text: 'I feel entitled to have what I want without earning it.' },
      { id: 'mode-sa-5', text: 'I look down on people I consider inferior.' },
      { id: 'mode-sa-6', text: 'I exaggerate my abilities or accomplishments.' },
      { id: 'mode-sa-7', text: 'I become competitive and need to be the best.' },
      { id: 'mode-sa-8', text: 'I feel I shouldn\'t have to follow the same rules as others.' },
      { id: 'mode-sa-9', text: 'I seek admiration and recognition from others.' },
      { id: 'mode-sa-10', text: 'I use my status or achievements to compensate for insecurity.' }
    ],
    'bully-attack': [
      { id: 'mode-ba-1', text: 'I intimidate or threaten others to get what I want.' },
      { id: 'mode-ba-2', text: 'I attack or criticize people who challenge me.' },
      { id: 'mode-ba-3', text: 'I become aggressive or hostile to protect myself.' },
      { id: 'mode-ba-4', text: 'I control others through anger or intimidation.' },
      { id: 'mode-ba-5', text: 'I blame others harshly when things go wrong.' },
      { id: 'mode-ba-6', text: 'I use sarcasm or put-downs to assert dominance.' },
      { id: 'mode-ba-7', text: 'I feel powerful when I make others feel small.' },
      { id: 'mode-ba-8', text: 'I retaliate against people who hurt or frustrate me.' },
      { id: 'mode-ba-9', text: 'I manipulate or exploit others for my benefit.' },
      { id: 'mode-ba-10', text: 'I adopt a "strong" persona to hide vulnerability.' }
    ]
  },
  parent: {
    'punitive-parent': [
      { id: 'mode-pp-1', text: 'I criticize myself harshly for mistakes or failures.' },
      { id: 'mode-pp-2', text: 'I feel I deserve to be punished when I do something wrong.' },
      { id: 'mode-pp-3', text: 'I call myself names like "stupid," "worthless," or "pathetic."' },
      { id: 'mode-pp-4', text: 'I have an inner voice that tells me I\'m bad or defective.' },
      { id: 'mode-pp-5', text: 'I feel intense shame or self-hatred.' },
      { id: 'mode-pp-6', text: 'I punish myself through self-denial or deprivation.' },
      { id: 'mode-pp-7', text: 'I feel I should suffer for my shortcomings.' },
      { id: 'mode-pp-8', text: 'I can\'t forgive myself for past mistakes.' },
      { id: 'mode-pp-9', text: 'I have urges to hurt or harm myself when I fail.' },
      { id: 'mode-pp-10', text: 'I believe I\'m unlovable and don\'t deserve happiness.' }
    ],
    'demanding-parent': [
      { id: 'mode-dmp-1', text: 'I drive myself relentlessly to achieve and succeed.' },
      { id: 'mode-dmp-2', text: 'I feel I must be perfect or I\'m a failure.' },
      { id: 'mode-dmp-3', text: 'I push myself to work harder, even when exhausted.' },
      { id: 'mode-dmp-4', text: 'I feel guilty if I rest or take time for myself.' },
      { id: 'mode-dmp-5', text: 'I set unrealistically high standards for myself.' },
      { id: 'mode-dmp-6', text: 'I feel nothing I do is ever good enough.' },
      { id: 'mode-dmp-7', text: 'I ignore my own needs to meet obligations and expectations.' },
      { id: 'mode-dmp-8', text: 'I feel constant pressure to perform and excel.' },
      { id: 'mode-dmp-9', text: 'I believe I should always put duty before pleasure.' },
      { id: 'mode-dmp-10', text: 'I sacrifice my well-being to meet my responsibilities.' }
    ]
  },
  healthy: {
    'healthy-adult': [
      { id: 'mode-ha-1', text: 'I make balanced decisions that consider my needs and others\' needs.' },
      { id: 'mode-ha-2', text: 'I set healthy boundaries in relationships.' },
      { id: 'mode-ha-3', text: 'I nurture and comfort myself when distressed.' },
      { id: 'mode-ha-4', text: 'I pursue meaningful goals while maintaining work-life balance.' },
      { id: 'mode-ha-5', text: 'I communicate assertively and respectfully.' },
      { id: 'mode-ha-6', text: 'I take responsibility for my choices and actions.' },
      { id: 'mode-ha-7', text: 'I problem-solve effectively when challenges arise.' },
      { id: 'mode-ha-8', text: 'I regulate my emotions in healthy ways.' },
      { id: 'mode-ha-9', text: 'I maintain perspective and don\'t catastrophize.' },
      { id: 'mode-ha-10', text: 'I practice self-care and prioritize my well-being.' },
      { id: 'mode-ha-11', text: 'I feel compassion for myself and others.' },
      { id: 'mode-ha-12', text: 'I challenge unrealistic or harmful thoughts.' },
      { id: 'mode-ha-13', text: 'I seek connection while maintaining autonomy.' },
      { id: 'mode-ha-14', text: 'I engage in activities that bring fulfillment and joy.' },
      { id: 'mode-ha-15', text: 'I forgive myself and others for imperfections.' },
      { id: 'mode-ha-16', text: 'I stand up for my values and rights appropriately.' },
      { id: 'mode-ha-17', text: 'I validate my own feelings and experiences.' },
      { id: 'mode-ha-18', text: 'I plan for the future while living in the present.' },
      { id: 'mode-ha-19', text: 'I adapt flexibly to changing circumstances.' },
      { id: 'mode-ha-20', text: 'I feel authentic and true to myself in interactions.' }
    ]
  }
} as const;

// ============================================================================
// Helper: Get Flat Question List
// ============================================================================

/**
 * Get all EMS questions as a flat array with domain/schema metadata
 */
export function getAllEMSQuestions(): Array<{
  id: string;
  text: string;
  schema: SchemaName;
  domain: SchemaDomain;
}> {
  const questions: Array<{
    id: string;
    text: string;
    schema: SchemaName;
    domain: SchemaDomain;
  }> = [];

  Object.entries(EMS_QUESTIONS).forEach(([domain, schemas]) => {
    Object.entries(schemas).forEach(([schema, items]) => {
      items.forEach(item => {
        questions.push({
          id: item.id,
          text: item.text,
          schema: schema as SchemaName,
          domain: domain as SchemaDomain
        });
      });
    });
  });

  return questions;
}

/**
 * Get all mode questions as a flat array with mode/category metadata
 */
export function getAllModeQuestions(): Array<{
  id: string;
  text: string;
  mode: SchemaMode;
  category: 'child' | 'coping' | 'parent' | 'healthy';
}> {
  const questions: Array<{
    id: string;
    text: string;
    mode: SchemaMode;
    category: 'child' | 'coping' | 'parent' | 'healthy';
  }> = [];

  Object.entries(MODE_QUESTIONS).forEach(([category, modes]) => {
    Object.entries(modes).forEach(([mode, items]) => {
      items.forEach(item => {
        questions.push({
          id: item.id,
          text: item.text,
          mode: mode as SchemaMode,
          category: category as 'child' | 'coping' | 'parent' | 'healthy'
        });
      });
    });
  });

  return questions;
}

// ============================================================================
// Test Metadata
// ============================================================================

/**
 * SCHEMA_TESTS: Metadata for Schema Detective assessments
 *
 * Current lineup:
 * 1. ems-questionnaire: 90-item Early Maladaptive Schema assessment (deterministic scoring)
 * 2. mode-questionnaire: 160-item Schema Mode assessment (deterministic scoring)
 * 3. coping-style (STUB): Planned third assessment - definition present but not yet implemented
 */
export const SCHEMA_TESTS: any = {
  'core-schema': {
    id: 'core-schema',
    label: 'Core Schema Assessment (EMSA 90-Item)',
    shortDescription: 'Complete the standardized 90-item Early Maladaptive Schema Assessment',
    longDescription: 'This comprehensive assessment uses 90 standardized items (5 per schema) across 18 Early Maladaptive Schemas organized into 5 domains. Rate each statement on a 6-point scale from "Completely untrue" to "Describes me perfectly". Schemas scoring ≥15 (out of 30) are considered present.',
    promptFocus: 'Generate insights from EMSA 90-item assessment scores. Identify which schemas meet the threshold (≥15), analyze domain patterns, and provide evidence-based interpretations of the user\'s schema profile.',
    exampleQuestions: [], // EMSA uses standardized items, not example questions
    recommendedOrder: 1,
    estimatedDuration: '20-25 minutes'
  },

  'mode-identification': {
    id: 'mode-identification',
    label: 'Schema Mode Assessment',
    shortDescription: 'Comprehensive 160-item questionnaire identifying active schema modes',
    longDescription: 'This assessment uses 160 questions to identify which schema modes you activate most frequently. Schema modes are emotional states you shift between - from vulnerable child and angry child modes, to maladaptive coping modes like the detached protector, to critical parent modes, and the healthy adult mode. Results provide detailed analysis of child modes, coping modes, parent modes, and your Healthy Adult development level, with activation levels ranging from Low to Dominant.',
    promptFocus: 'Deterministic scoring with Low-Moderate-High-Dominant activation bands. Special interpretation for Healthy Adult mode (Underdeveloped to Well-Developed). Comprehensive mode profile with category analysis and developmental recommendations.',
    exampleQuestions: [
      'I feel small, helpless, and powerless like a child.',
      'I feel furious when my needs are not met.',
      'I emotionally disconnect from situations that upset me.',
      'I criticize myself harshly for mistakes or failures.',
      'I make balanced decisions that consider my needs and others\' needs.'
    ],
    recommendedOrder: 2,
    estimatedDuration: '25-30 minutes'
  },

  'coping-style': {
    id: 'coping-style',
    label: 'Coping Style Assessment (Coming Soon)',
    shortDescription: 'Identify your primary coping patterns: surrender, avoidance, or overcompensation',
    longDescription: 'This assessment will identify your primary coping styles - the strategies you use to manage schemas when they are triggered. The three main coping styles are: Surrender (giving in to the schema), Avoidance (escaping schema activation through detachment or distraction), and Overcompensation (doing the opposite of what the schema predicts). Understanding your coping styles helps you recognize maladaptive patterns and develop healthier responses.',
    promptFocus: 'Not yet implemented. Future: Identify dominant coping styles across schemas, analyze flexibility vs. rigidity, and suggest healthier alternatives.',
    exampleQuestions: [
      'When I feel criticized, I withdraw and avoid the person.',
      'I become overly aggressive to prove I\'m not weak.',
      'I give in to others\' demands even when I don\'t agree.'
    ],
    recommendedOrder: 3,
    estimatedDuration: '15-20 minutes'
  },

  'trigger-pattern': {
    id: 'trigger-pattern',
    label: 'Trigger Pattern Mapping (Coming Soon)',
    shortDescription: 'Map specific situations that activate your schemas and modes',
    longDescription: 'This assessment will help you identify and map the specific trigger situations, contexts, and interpersonal dynamics that activate your schemas and shift you into maladaptive modes. By understanding your trigger patterns, you can anticipate schema activation and develop proactive coping strategies. Results include a detailed trigger map showing which situations activate which schemas/modes, and personalized recommendations for managing high-risk situations.',
    promptFocus: 'Not yet implemented. Future: Create detailed trigger maps linking situations to schemas/modes, identify high-risk patterns, and suggest preventive strategies.',
    exampleQuestions: [
      'When someone cancels plans last-minute, what thoughts and feelings arise?',
      'Describe a recent situation where you felt triggered.',
      'What types of people tend to activate your strongest reactions?'
    ],
    recommendedOrder: 4,
    estimatedDuration: '20-25 minutes'
  }
};

/**
 * Get schema test metadata by ID
 */
export function getSchemaTestMetadata(testId: SchemaTestId): SchemaTestDefinition {
  return SCHEMA_TESTS[testId];
}

/**
 * Get all schema tests
 */
export function getAllSchemaTests(): SchemaTestDefinition[] {
  return Object.values(SCHEMA_TESTS);
}

/**
 * Get only active/implemented schema tests
 */
export function getActiveSchemaTests(): SchemaTestDefinition[] {
  return (Object.values(SCHEMA_TESTS) as any[]).filter(test =>
    !test.label.includes('Coming Soon')
  );
}

// NOTE: Additional EMSA, Schema Mode, and Coping Style item arrays were present
// in the original file but are not exported/used. If needed later, they can
// be re-added from the original schemaTherapyService.ts file (lines 1312-1906).
