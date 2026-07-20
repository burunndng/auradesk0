/**
 * ==============================================================================
 * 🛑 DO NOT DELETE THIS FILE 🛑
 * ==============================================================================
 * 
 * This file (schemaTherapyService.original.ts) contains the core scoring logic, 
 * metadata, and analysis functions for the Schema Therapy and Mode tests. 
 * 
 * It is currently acting as a "shim" target for `schemaTherapyService.ts`.
 * 
 * 🚀 MIGRATION PATH:
 * This 3,000+ line file is scheduled for a phased refactor into smaller, focused modules 
 * within the `services/schema/` directory.
 * 
 * Phase 1 (Completed): 
 * - Extracted base test questions to `schema/schemaTestData.ts`.
 * 
 * Phase 2 (Pending): 
 * - Extract `EMSA_90_ITEMS` and remaining test data to `schema/schemaTestData.ts` or `schema/emsData.ts`.
 * - Extract scoring logic (`calculateSchemaScore`, `scoreEMSTest`, `scoreModeTest`, etc.) to `schema/schemaScoring.ts`.
 * 
 * Phase 3 (Pending):
 * - Extract synthesis and analysis logic (`analyzeSchemaTestResponses`, `generateEMSNarrative`, etc.) to `schema/schemaAnalysis.ts`.
 * 
 * Until Phase 2 and 3 are complete, DO NOT DELETE this file, as `schemaTherapyService.ts` 
 * relies on it for critical application functionality.
 * ==============================================================================
 * 
 * Schema Therapy Service
 * 
 * Deterministic scoring system for Early Maladaptive Schemas (EMS) and Schema Modes
 * based on Jeffrey Young's Schema Therapy framework.
 * 
 * Features:
 * - Full 90-item EMS questionnaire (5 questions × 18 schemas)
 * - Full 160-item Schema Mode questionnaire organized by category
 * - Deterministic Likert (1-6) scoring with severity bands
 * - Domain aggregation for EMS (5 domains)
 * - Mode profile analysis (Low to Dominant)
 * - Healthy Adult special interpretation
 * - Narrative scaffolding for UI presentation without LLM calls
 */

import type {
  SchemaTestId,
  SchemaTestResponse,
  SchemaTestResult,
  SchemaUnifiedProfile,
  SchemaSession,
  SchemaTestDefinition,
  SchemaName,
  SchemaDomain,
  SchemaMode,
  CopingStyle,
  IdentifiedSchema,
  IdentifiedMode,
  IdentifiedCopingPattern,
  TriggerPattern,
  SchemaScore,
  DomainAnalysis,
  ModeScore,
  ModeProfile,
  SchemaSeverity,
  SchemaSeverityLevel
} from '../types';
const PROXY_URL = '/api/openrouter-proxy';

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
// Scoring Functions: Early Maladaptive Schemas (EMS)
// ============================================================================

/**
 * Calculate schema score from 5 Likert (1-6) responses
 * Severity bands: None (<10), Low (10-14), Medium (15-19), High (20-24), Very High (25-30)
 * Active threshold: ≥15
 */
export function calculateSchemaScore(
  schema: SchemaName,
  domain: SchemaDomain,
  responses: number[]
): SchemaScore {
  if (responses.length !== 5) {
    throw new Error(`Schema scoring requires exactly 5 responses, got ${responses.length}`);
  }

  const rawScore = responses.reduce((sum, val) => sum + val, 0);
  const percentile = ((rawScore - 5) / (30 - 5)) * 100; // (score - min) / (max - min)

  let severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High';
  if (rawScore < 10) severity = 'None';
  else if (rawScore < 15) severity = 'Low';
  else if (rawScore < 20) severity = 'Medium';
  else if (rawScore < 25) severity = 'High';
  else severity = 'Very High';

  const isActive = rawScore >= 15;

  const interpretation = generateSchemaInterpretation(schema, severity, rawScore);

  return {
    schemaName: schema,
    name: schema,
    domain,
    rawScore,
    score: rawScore,
    normalizedScore: (rawScore - 5) / 25,
    severity,
    meetsThreshold: isActive,
    isActive,
    percentile: Math.round(percentile),
    interpretation,
    questionIds: [], // Metadata not available in this context
    responses: [], // Metadata not available in this context
    averageScore: rawScore / 5,
    description: interpretation,
    triggers: []
  };
}

/**
 * Generate interpretation text for schema score
 */
export function generateSchemaInterpretation(
  schema: SchemaName,
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High',
  rawScore: number
): string {
  const interpretations: Record<SchemaName, Record<string, string>> = {
    'abandonment': {
      'None': 'You have minimal concerns about abandonment. You generally feel secure in relationships.',
      'Low': 'You occasionally worry about being left, but these fears don\'t significantly impact your relationships.',
      'Medium': 'You have moderate abandonment concerns that sometimes influence your relationship behaviors and emotional responses.',
      'High': 'Strong abandonment fears frequently affect your relationships, leading to anxiety or clinging behaviors.',
      'Very High': 'Intense abandonment anxiety dominates your relationships, causing significant distress and relationship difficulties.'
    },
    'mistrust-abuse': {
      'None': 'You generally trust others and don\'t expect to be hurt or taken advantage of.',
      'Low': 'You have some wariness but can generally form trusting relationships.',
      'Medium': 'Moderate trust issues lead you to be cautious in relationships, though you can still connect with others.',
      'High': 'Significant trust problems make it hard to form close relationships; you often expect betrayal.',
      'Very High': 'Pervasive mistrust prevents authentic connection; you constantly expect others to hurt or exploit you.'
    },
    'emotional-deprivation': {
      'None': 'You feel your emotional needs are generally met in relationships.',
      'Low': 'You occasionally feel emotionally unfulfilled but can usually get your needs met.',
      'Medium': 'You often feel that others don\'t truly understand or nurture you emotionally.',
      'High': 'You frequently feel emotionally empty and deprived of the connection you need.',
      'Very High': 'You experience chronic emotional emptiness and believe no one can truly meet your emotional needs.'
    },
    'defectiveness-shame': {
      'None': 'You feel fundamentally acceptable and worthy as a person.',
      'Low': 'You have occasional feelings of inadequacy but generally accept yourself.',
      'Medium': 'You often feel flawed or shameful, which impacts your self-esteem and relationships.',
      'High': 'Strong feelings of defectiveness and shame significantly affect your self-worth and intimacy.',
      'Very High': 'Pervasive shame and sense of being fundamentally flawed dominate your self-perception.'
    },
    'social-isolation': {
      'None': 'You feel connected and like you belong in social contexts.',
      'Low': 'You occasionally feel different but generally feel part of social groups.',
      'Medium': 'You often feel alienated or like you don\'t fit in, even with familiar groups.',
      'High': 'Strong feelings of being different and isolated significantly impact your social life.',
      'Very High': 'Pervasive sense of alienation and not belonging affects all social interactions.'
    },
    'dependence-incompetence': {
      'None': 'You feel capable of managing daily life independently.',
      'Low': 'You occasionally doubt your competence but generally handle responsibilities well.',
      'Medium': 'You often feel you need help with daily decisions and tasks.',
      'High': 'Strong dependency needs make it difficult to function autonomously.',
      'Very High': 'You feel helpless and unable to cope without constant guidance and support.'
    },
    'vulnerability': {
      'None': 'You feel reasonably safe and don\'t worry excessively about catastrophe.',
      'Low': 'You have some safety concerns but don\'t let them dominate your life.',
      'Medium': 'You frequently worry about disasters or serious problems occurring.',
      'High': 'Pervasive anxiety about catastrophe significantly limits your activities and enjoyment.',
      'Very High': 'Constant fear of imminent disaster controls your life and decisions.'
    },
    'enmeshment': {
      'None': 'You maintain healthy boundaries and a clear sense of identity in relationships.',
      'Low': 'You occasionally struggle with boundaries but maintain reasonable independence.',
      'Medium': 'You often have difficulty separating your identity from close others.',
      'High': 'Significant enmeshment with parent(s) or partner limits your autonomy and identity.',
      'Very High': 'Extreme enmeshment prevents you from having a clear separate identity.'
    },
    'failure': {
      'None': 'You feel competent and capable in achievement areas.',
      'Low': 'You occasionally doubt your abilities but generally feel capable.',
      'Medium': 'You often feel inadequate compared to others in work or achievement.',
      'High': 'Strong feelings of incompetence significantly impact your career and achievement pursuits.',
      'Very High': 'Pervasive belief in your inadequacy prevents you from pursuing or succeeding in achievement areas.'
    },
    'entitlement-grandiosity': {
      'None': 'You accept normal limits and don\'t feel you deserve special treatment.',
      'Low': 'You occasionally bristle at restrictions but generally accept appropriate limits.',
      'Medium': 'You often feel special rules shouldn\'t apply to you, creating interpersonal friction.',
      'High': 'Strong entitlement beliefs frequently cause conflicts in relationships and work.',
      'Very High': 'Pervasive entitlement and grandiosity severely damage relationships and social functioning.'
    },
    'insufficient-self-control': {
      'None': 'You have good self-discipline and impulse control.',
      'Low': 'You occasionally struggle with discipline but generally complete tasks and control impulses.',
      'Medium': 'You often have difficulty with self-control, causing problems with follow-through.',
      'High': 'Significant self-control problems frequently lead to impulsive actions and incomplete tasks.',
      'Very High': 'Severe lack of self-discipline prevents goal achievement and causes major life problems.'
    },
    'subjugation': {
      'None': 'You express your needs and opinions freely in relationships.',
      'Low': 'You occasionally suppress your needs but can usually assert yourself.',
      'Medium': 'You often give in to others to avoid conflict or rejection.',
      'High': 'You frequently subjugate your needs, leading to resentment and loss of self.',
      'Very High': 'Complete suppression of your needs and self in relationships causes severe distress.'
    },
    'self-sacrifice': {
      'None': 'You maintain a healthy balance between helping others and caring for yourself.',
      'Low': 'You occasionally over-give but generally maintain balance.',
      'Medium': 'You often prioritize others\' needs at the expense of your own well-being.',
      'High': 'Excessive self-sacrifice leaves you depleted and resentful.',
      'Very High': 'Extreme self-sacrifice causes burnout and loss of self-identity.'
    },
    'approval-seeking': {
      'None': 'Your self-worth comes from within, not from others\' approval.',
      'Low': 'You occasionally seek approval but maintain independent self-esteem.',
      'Medium': 'You often make decisions based on what will gain approval from others.',
      'High': 'Strong approval-seeking drives most of your behaviors and choices.',
      'Very High': 'Your entire sense of worth depends on external validation and approval.'
    },
    'negativity-pessimism': {
      'None': 'You maintain a balanced, realistic outlook on life.',
      'Low': 'You occasionally worry about negative outcomes but can stay positive.',
      'Medium': 'You often focus on what could go wrong, affecting your enjoyment of life.',
      'High': 'Pervasive negativity and pessimism significantly diminish your quality of life.',
      'Very High': 'Constant expectation of disaster prevents you from relaxing or experiencing joy.'
    },
    'emotional-inhibition': {
      'None': 'You express your emotions freely and appropriately.',
      'Low': 'You occasionally hold back feelings but can generally express yourself.',
      'Medium': 'You often suppress emotions, appearing uptight or distant to others.',
      'High': 'Significant emotional inhibition prevents authentic connection and self-expression.',
      'Very High': 'Extreme emotional suppression makes you seem cold and prevents genuine intimacy.'
    },
    'unrelenting-standards': {
      'None': 'You maintain realistic standards and can accept "good enough."',
      'Low': 'You occasionally push yourself hard but can relax your standards.',
      'Medium': 'You often set very high standards that are difficult to meet.',
      'High': 'Perfectionistic standards cause chronic stress and dissatisfaction.',
      'Very High': 'Impossible standards prevent satisfaction and cause severe burnout.'
    },
    'punitiveness': {
      'None': 'You accept human imperfection in yourself and others with compassion.',
      'Low': 'You occasionally judge harshly but can generally forgive mistakes.',
      'Medium': 'You often believe mistakes require punishment, affecting relationships.',
      'High': 'Strong punitive beliefs cause harsh self-criticism and relationship problems.',
      'Very High': 'Extreme punitiveness leads to chronic self-hatred and inability to forgive.'
    }
  };

  return interpretations[schema][severity] || `Score: ${rawScore}/30`;
}

/**
 * Calculate all schema scores from EMS test responses
 */
export function scoreEMSTest(responses: Record<string, number>): SchemaScore[] {
  const scores: SchemaScore[] = [];

  Object.entries(EMS_QUESTIONS).forEach(([domain, schemas]) => {
    Object.entries(schemas).forEach(([schema, questions]) => {
      const schemaResponses = questions.map(q => responses[q.id] || 1);
      const score = calculateSchemaScore(
        schema as SchemaName,
        domain as SchemaDomain,
        schemaResponses
      );
      scores.push(score);
    });
  });

  return scores;
}

/**
 * Aggregate schemas by domain
 */
export function aggregateDomains(schemaScores: SchemaScore[]): DomainAnalysis[] {
  const domainMap: Record<SchemaDomain, SchemaScore[]> = {
    'disconnection-rejection': [],
    'impaired-autonomy': [],
    'impaired-limits': [],
    'other-directedness': [],
    'overvigilance-inhibition': []
  };

  schemaScores.forEach(score => {
    domainMap[score.domain].push(score);
  });

  const domainThemes: Record<SchemaDomain, string[]> = {
    'disconnection-rejection': [
      'Difficulty trusting and forming secure attachments',
      'Fears of abandonment and rejection',
      'Expectations that emotional needs won\'t be met',
      'Sense of being fundamentally flawed or unlovable'
    ],
    'impaired-autonomy': [
      'Difficulty functioning independently',
      'Excessive dependence on others',
      'Fear of catastrophe or inability to cope',
      'Lack of separate identity from family'
    ],
    'impaired-limits': [
      'Difficulty with self-discipline and goal-directed behavior',
      'Sense of being special or entitled',
      'Problems respecting others\' rights and boundaries',
      'Lack of internal limits on behavior'
    ],
    'other-directedness': [
      'Excessive focus on meeting others\' needs',
      'Suppression of own needs and feelings',
      'Seeking approval and avoiding disapproval',
      'Difficulty asserting self in relationships'
    ],
    'overvigilance-inhibition': [
      'Excessive control over emotions and impulses',
      'Pessimism and focus on negative outcomes',
      'Rigid internal rules about performance',
      'Difficulty relaxing and enjoying life'
    ]
  };

  return Object.entries(domainMap).map(([domain, scores]) => {
    const activeSchemas = scores.filter(s => s.isActive).map(s => s.schemaName);
    
    // Calculate aggregate scores
    const totalScore = scores.reduce((sum, s) => sum + s.rawScore, 0);
    const maxScore = scores.length * 30;
    const normalizedDomainScore = totalScore / maxScore;
    const aggregateScore = totalScore;

    const avgScore = totalScore / scores.length;
    const domainScore = Math.round(avgScore);

    let domainSeverity: SchemaSeverity = 'None';
    if (domainScore > 10) domainSeverity = 'Low';
    if (domainScore > 14) domainSeverity = 'Medium';
    if (domainScore > 20) domainSeverity = 'High';
    if (domainScore > 25) domainSeverity = 'Very High';

    const dominantSchema = scores.sort((a, b) => b.rawScore - a.rawScore)[0].schemaName;
    const dominantSchemas = scores.filter(s => s.meetsThreshold).map(s => s.schemaName);

    // Generate interpretation
    const domainKey = domain as SchemaDomain;
    let interpretation = `${getDomainLabel(domainKey)}: ${getSeverityDescription(domainSeverity)}. `;
    if (activeSchemas.length === 0) {
      interpretation += 'No significant schemas detected in this domain.';
    } else {
      interpretation += `${activeSchemas.length} schemas active.`;
    }

    return {
      domain: domainKey,
      domainLabel: getDomainLabel(domainKey),
      totalScore,
      schemasInDomain: scores,
      activeSchemas: scores.filter(s => s.meetsThreshold), // Populate full objects
      aggregateScore,
      normalizedDomainScore,
      dominantSchema,
      dominantSchemas,
      domainSeverity,
      interpretation,
      insights: [interpretation],
      coreThemes: activeSchemas, // Use names for themes
      prevalence: activeSchemas.length / scores.length
    };
  });
}

// ============================================================================
// Scoring Functions: Schema Modes
// ============================================================================

/**
 * Calculate mode score from Likert (1-6) responses
 * Activation levels: Low (<25th %), Moderate (25-50th %), High (50-75th %), Dominant (>75th %)
 */
export function calculateModeScore(
  mode: SchemaMode,
  category: 'child' | 'coping' | 'parent' | 'healthy',
  responses: number[]
): ModeScore {
  const rawScore = responses.reduce((sum, val) => sum + val, 0);
  const itemCount = responses.length;
  const maxScore = itemCount * 6;
  const percentile = ((rawScore - itemCount) / (maxScore - itemCount)) * 100;

  let activationLevel: 'Low' | 'Moderate' | 'High' | 'Dominant';
  if (percentile < 25) activationLevel = 'Low';
  else if (percentile < 50) activationLevel = 'Moderate';
  else if (percentile < 75) activationLevel = 'High';
  else activationLevel = 'Dominant';

  const interpretation = generateModeInterpretation(mode, activationLevel, category);
  const { triggers, behaviors } = getModeTriggersBehaviors(mode);

  return {
    mode,
    modeName: mode,
    category,
    rawScore,
    normalizedScore: percentile / 100,
    percentile: Math.round(percentile),
    severity: activationLevel === 'Dominant' ? 'Very High' : activationLevel === 'High' ? 'High' : activationLevel === 'Moderate' ? 'Medium' : 'Low',
    activationLevel,
    interpretation,
    questionIds: [], // Metadata not available in this context
    responses: [], // Metadata not available in this context
    averageScore: rawScore / itemCount,
    activationFrequency: activationLevel === 'Dominant' ? 'constant' : activationLevel === 'High' ? 'frequent' : activationLevel === 'Moderate' ? 'occasional' : 'rare',
    description: interpretation,
    typicalTriggers: triggers,
    typicalBehaviors: behaviors
  };
}

/**
 * Generate interpretation for mode score
 */
export function generateModeInterpretation(
  mode: SchemaMode,
  level: 'Low' | 'Moderate' | 'High' | 'Dominant',
  category: 'child' | 'coping' | 'parent' | 'healthy'
): string {
  if (mode === 'healthy-adult') {
    const healthyInterpretations = {
      'Low': 'Your Healthy Adult mode is underdeveloped. You may struggle with self-regulation, setting boundaries, and making balanced decisions. Strengthening this mode is a key therapeutic goal.',
      'Moderate': 'Your Healthy Adult mode is emerging but not yet consistent. You can access healthy functioning in some situations but may regress under stress.',
      'High': 'Your Healthy Adult mode is moderately developed. You often make balanced decisions and regulate emotions effectively, though vulnerable child or coping modes may sometimes take over.',
      'Dominant': 'Your Healthy Adult mode is well-developed. You consistently make balanced decisions, regulate emotions, set boundaries, and nurture yourself and others appropriately.'
    };
    return healthyInterpretations[level];
  }

  const levelDescriptions = {
    'Low': 'rarely activates - minimal influence on your functioning',
    'Moderate': 'activates occasionally - noticeable but not dominating',
    'High': 'activates frequently - significant influence on emotions and behaviors',
    'Dominant': 'is highly active - strongly influences your day-to-day functioning'
  };

  return `This mode ${levelDescriptions[level]}.`;
}

/**
 * Get typical triggers and behaviors for each mode
 */
export function getModeTriggersBehaviors(mode: SchemaMode): { triggers: string[]; behaviors: string[] } {
  const modePatterns: Record<SchemaMode, { triggers: string[]; behaviors: string[] }> = {
    'vulnerable-child': {
      triggers: ['Rejection or criticism', 'Being alone', 'Perceived abandonment', 'Overwhelming tasks', 'Lack of support'],
      behaviors: ['Crying or feeling tearful', 'Seeking reassurance', 'Feeling helpless', 'Withdrawing emotionally', 'Expressing neediness']
    },
    'angry-child': {
      triggers: ['Unmet needs', 'Feeling controlled', 'Injustice or unfairness', 'Frustration', 'Feeling invalidated'],
      behaviors: ['Yelling or aggressive outbursts', 'Breaking things', 'Verbal attacks', 'Slamming doors', 'Expressing rage']
    },
    'impulsive-child': {
      triggers: ['Boredom', 'Desire for pleasure', 'Stress', 'Opportunity for excitement', 'Lack of structure'],
      behaviors: ['Acting without thinking', 'Risk-taking', 'Substance use', 'Impulsive purchases', 'Sexual impulsivity']
    },
    'undisciplined-child': {
      triggers: ['Boring tasks', 'Long-term goals', 'Difficulty', 'Lack of immediate reward', 'Need for discipline'],
      behaviors: ['Procrastination', 'Giving up easily', 'Making excuses', 'Avoiding responsibilities', 'Choosing easy over important']
    },
    'happy-child': {
      triggers: ['Feeling safe and loved', 'Playful environments', 'Connection with others', 'Success', 'Relaxation'],
      behaviors: ['Laughing and playing', 'Expressing joy', 'Being spontaneous', 'Connecting authentically', 'Feeling content']
    },
    'compliant-surrender': {
      triggers: ['Potential conflict', 'Others\' demands', 'Fear of rejection', 'Assertiveness needed', 'Disagreement'],
      behaviors: ['Saying yes when wanting to say no', 'Suppressing opinions', 'Acting submissive', 'Avoiding confrontation', 'People-pleasing']
    },
    'detached-protector': {
      triggers: ['Emotional intensity', 'Vulnerability', 'Intimacy demands', 'Painful feelings', 'Stress'],
      behaviors: ['Emotional shutdown', 'Social withdrawal', 'Feeling numb', 'Avoiding closeness', 'Going on autopilot']
    },
    'detached-self-soother': {
      triggers: ['Emotional pain', 'Stress', 'Loneliness', 'Boredom', 'Anxiety'],
      behaviors: ['Substance use', 'Binge eating', 'Excessive screen time', 'Compulsive shopping', 'Other addictive behaviors']
    },
    'self-aggrandizer': {
      triggers: ['Feeling inadequate', 'Comparison with others', 'Need for validation', 'Threats to status', 'Insecurity'],
      behaviors: ['Boasting', 'Seeking admiration', 'Competitive behavior', 'Putting others down', 'Exaggerating achievements']
    },
    'bully-attack': {
      triggers: ['Feeling threatened', 'Criticism', 'Challenges to control', 'Vulnerability', 'Others\' success'],
      behaviors: ['Intimidation', 'Blaming others', 'Aggressive attacks', 'Manipulation', 'Hostile criticism']
    },
    'punitive-parent': {
      triggers: ['Mistakes or failures', 'Falling short of standards', 'Feeling flawed', 'Shame activation', 'Self-disappointment'],
      behaviors: ['Harsh self-criticism', 'Self-punishment', 'Negative self-talk', 'Self-blame', 'Feeling worthless']
    },
    'demanding-parent': {
      triggers: ['Rest or relaxation', 'Not meeting goals', 'Others succeeding', 'Imperfection', 'Time off'],
      behaviors: ['Driving self relentlessly', 'Ignoring needs', 'Perfectionism', 'Working when exhausted', 'Feeling guilty for rest']
    },
    'healthy-adult': {
      triggers: ['Calm environments', 'Supportive relationships', 'Self-reflection opportunities', 'Balanced living', 'Personal growth work'],
      behaviors: ['Setting boundaries', 'Self-care', 'Balanced decisions', 'Emotional regulation', 'Assertive communication']
    }
  };

  return modePatterns[mode];
}

/**
 * Calculate all mode scores from mode test responses
 */
export function scoreModeTest(responses: Record<string, number>): ModeScore[] {
  const scores: ModeScore[] = [];

  Object.entries(MODE_QUESTIONS).forEach(([category, modes]) => {
    Object.entries(modes).forEach(([mode, questions]) => {
      const modeResponses = questions.map(q => responses[q.id] || 1);
      const score = calculateModeScore(
        mode as SchemaMode,
        category as 'child' | 'coping' | 'parent' | 'healthy',
        modeResponses
      );
      scores.push(score);
    });
  });

  return scores;
}

/**
 * Generate comprehensive mode profile with category analysis
 */
export function generateModeProfile(modeScores: ModeScore[]): ModeProfile {
  const childScores = modeScores.filter(s => s.category === 'child');
  const copingScores = modeScores.filter(s => s.category === 'coping');
  const parentScores = modeScores.filter(s => s.category === 'parent');
  const healthyScore = modeScores.find(s => s.mode === 'healthy-adult')!;

  const getDominant = (scores: ModeScore[]): SchemaMode | null => {
    const sorted = [...scores].sort((a, b) => b.percentile - a.percentile);
    return sorted[0]?.percentile > 50 ? sorted[0].mode : null;
  };

  const allSorted = [...modeScores].sort((a, b) => b.percentile - a.percentile);
  const dominantMode = allSorted[0]?.percentile > 60 ? allSorted[0].mode : null;

  const dominantChild = getDominant(childScores);
  const dominantCoping = getDominant(copingScores);
  const dominantParent = getDominant(parentScores);

  // Healthy Adult strength classification
  let strengthLevel: 'Underdeveloped' | 'Emerging' | 'Moderate' | 'Strong' | 'Well-Developed';
  const haPercentile = healthyScore.percentile;
  if (haPercentile < 20) strengthLevel = 'Underdeveloped';
  else if (haPercentile < 40) strengthLevel = 'Emerging';
  else if (haPercentile < 60) strengthLevel = 'Moderate';
  else if (haPercentile < 80) strengthLevel = 'Strong';
  else strengthLevel = 'Well-Developed';

  // Generate category interpretations
  const childInterpretation = dominantChild
    ? `Your ${dominantChild} mode is most prominent among child modes. ${
        dominantChild === 'happy-child'
          ? 'This is positive - you can access joy and playfulness.'
          : 'This suggests emotional needs from childhood that still require attention.'
      }`
    : 'No single child mode dominates. You may experience various child states depending on context.';

  const copingInterpretation = dominantCoping
    ? `Your primary coping strategy is ${dominantCoping.replace('-', ' ')}. This mode helps you avoid pain but may prevent authentic connection and growth.`
    : 'You use various coping modes depending on the situation, without strong reliance on any single strategy.';

  const parentInterpretation = dominantParent
    ? `Your ${dominantParent} mode is active, creating internal pressure through ${
        dominantParent === 'punitive-parent' ? 'harsh self-criticism' : 'relentless demands'
      }. This mode needs to be compassionately challenged.`
    : parentScores.some(s => s.activationLevel === 'High' || s.activationLevel === 'Dominant')
    ? 'Both punitive and demanding parent modes are active, creating internal conflict and pressure.'
    : 'Parent modes are relatively quiet. You may have less harsh internal criticism.';

  const haInterpretation = `Your Healthy Adult is ${strengthLevel.toLowerCase()}. ${
    strengthLevel === 'Well-Developed' || strengthLevel === 'Strong'
      ? 'This is your greatest strength - you can regulate emotions, set boundaries, and make balanced decisions.'
      : strengthLevel === 'Moderate'
      ? 'You have access to healthy functioning but may regress under stress. Continue strengthening this mode.'
      : 'Developing your Healthy Adult is a key therapeutic goal. This mode can learn to nurture your child modes and set limits on maladaptive modes.'
  }`;

  // Overall balance assessment
  const overallBalance = generateOverallBalance(healthyScore, childScores, copingScores, parentScores);

  // Developmental recommendations
  const recommendations = generateModeRecommendations(
    healthyScore,
    dominantChild,
    dominantCoping,
    dominantParent,
    strengthLevel
  );

  return {
    scores: modeScores,
    modeScores: modeScores,
    dominantMode,
    dominantModes: allSorted.slice(0, 3).map(s => ({
      modeName: s.mode,
      score: s,
      relativeStrength: s.percentile / 100
    })),
    childModes: {
      scores: childScores,
      dominantChild,
      interpretation: childInterpretation
    },
    copingModes: {
      scores: copingScores,
      dominantCoping,
      interpretation: copingInterpretation
    },
    parentModes: {
      scores: parentScores,
      dominantParent,
      interpretation: parentInterpretation
    },
    healthyAdult: {
      score: healthyScore,
      interpretation: haInterpretation,
      strengthLevel
    },
    overallBalance,
    developmentalRecommendations: recommendations,
    
    // Legacy support fields
    categoryBreakdown: {
      child: childScores.reduce((sum, s) => sum + s.rawScore, 0),
      coping: copingScores.reduce((sum, s) => sum + s.rawScore, 0),
      parent: parentScores.reduce((sum, s) => sum + s.rawScore, 0),
      healthy: healthyScore.rawScore
    },
    overallAnalysis: overallBalance
  };
}

/**
 * Generate overall balance narrative
 */
export function generateOverallBalance(
  healthyScore: ModeScore,
  childScores: ModeScore[],
  copingScores: ModeScore[],
  parentScores: ModeScore[]
): string {
  const haStrong = healthyScore.percentile > 60;
  const childHigh = childScores.some(s => s.activationLevel === 'Dominant' || s.activationLevel === 'High');
  const copingHigh = copingScores.some(s => s.activationLevel === 'Dominant' || s.activationLevel === 'High');
  const parentHigh = parentScores.some(s => s.activationLevel === 'Dominant' || s.activationLevel === 'High');

  if (haStrong && !parentHigh && !copingHigh) {
    return 'Your mode profile shows good balance with a strong Healthy Adult. You have the capacity to nurture your child modes and respond to life challenges effectively.';
  }

  if (!haStrong && (parentHigh || copingHigh)) {
    return 'Your profile shows more active maladaptive modes than Healthy Adult functioning. The primary therapeutic goal is strengthening your Healthy Adult to better manage child emotions and limit maladaptive coping.';
  }

  if (childHigh && copingHigh) {
    return 'You experience strong emotional child modes that trigger intense coping responses. Strengthening your Healthy Adult can help you respond to child needs more directly without resorting to avoidance or detachment.';
  }

  if (parentHigh && childHigh) {
    return 'Your profile shows conflict between critical parent modes and vulnerable child modes. This creates internal suffering. The Healthy Adult can mediate this conflict with self-compassion.';
  }

  return 'Your mode profile shows a mix of active modes. Understanding which modes activate in different situations will help you develop more flexibility and choice in responses.';
}

/**
 * Generate developmental recommendations based on mode profile
 */
export function generateModeRecommendations(
  healthyScore: ModeScore,
  dominantChild: SchemaMode | null,
  dominantCoping: SchemaMode | null,
  dominantParent: SchemaMode | null,
  haStrength: 'Underdeveloped' | 'Emerging' | 'Moderate' | 'Strong' | 'Well-Developed'
): string[] {
  const recommendations: string[] = [];

  // Healthy Adult development
  if (haStrength === 'Underdeveloped' || haStrength === 'Emerging') {
    recommendations.push(
      'Practice Healthy Adult behaviors: Set one boundary per day, even a small one.',
      'Develop self-nurturing: Create a daily self-care ritual, even if brief.',
      'Build assertiveness: Practice expressing one need or preference each day.'
    );
  }

  // Child mode work
  if (dominantChild === 'vulnerable-child') {
    recommendations.push(
      'Use imagery to nurture your Vulnerable Child - imagine your Healthy Adult comforting the child part.',
      'Practice self-soothing when the Vulnerable Child is activated.',
      'Challenge beliefs that you are helpless or can\'t cope - look for evidence of your competence.'
    );
  } else if (dominantChild === 'angry-child') {
    recommendations.push(
      'Acknowledge the Angry Child\'s feelings but express them through the Healthy Adult.',
      'Use physical exercise or safe expression (writing, punching pillow) to release anger safely.',
      'Identify unmet needs driving the anger and address them directly when possible.'
    );
  }

  // Coping mode work
  if (dominantCoping === 'detached-protector') {
    recommendations.push(
      'Notice when you emotionally shut down and gently encourage connection.',
      'Practice staying present with uncomfortable emotions for brief periods.',
      'Experiment with safe vulnerability in trusted relationships.'
    );
  } else if (dominantCoping === 'detached-self-soother') {
    recommendations.push(
      'Identify triggers that lead to addictive soothing behaviors.',
      'Develop alternative healthy soothing activities (exercise, creative expression, nature).',
      'Address underlying emotions instead of numbing them.'
    );
  } else if (dominantCoping === 'compliant-surrender') {
    recommendations.push(
      'Practice saying "no" to small requests to build assertiveness.',
      'Notice when you suppress your needs and practice expressing them.',
      'Challenge beliefs that you must comply to be loved or accepted.'
    );
  }

  // Parent mode work
  if (dominantParent === 'punitive-parent') {
    recommendations.push(
      'Externalize and challenge harsh self-critical thoughts - talk back to the Punitive Parent.',
      'Practice self-compassion exercises daily.',
      'Replace punishment with learning: "What can I learn?" instead of "I deserve to suffer."'
    );
  } else if (dominantParent === 'demanding-parent') {
    recommendations.push(
      'Set realistic, flexible standards instead of perfectionistic ones.',
      'Practice self-care as a priority, not a reward for achievement.',
      'Challenge beliefs that worth comes from constant productivity.'
    );
  }

  // General recommendations
  recommendations.push(
    'Keep a mode diary: Track which modes activate in different situations.',
    'Practice mode awareness: Pause several times daily and ask "Which mode am I in right now?"'
  );

  return recommendations;
}

// ============================================================================
// Static Test Metadata (Updated to 2-test + stub)
// ============================================================================

/**
 * SCHEMA_TESTS: Metadata for Schema Detective assessments
 * 
 * Current lineup:
 * 1. ems-questionnaire: 90-item Early Maladaptive Schema assessment (deterministic scoring)
 * 2. mode-questionnaire: 160-item Schema Mode assessment (deterministic scoring)
 * 3. coping-style (STUB): Planned third assessment - definition present but not yet implemented
 */
export const SCHEMA_TESTS: Record<SchemaTestId, SchemaTestDefinition> = {
  'core-schema': {
    id: 'core-schema',
    label: 'Core Schema Assessment (EMSA 90-Item)',
    shortDescription: 'Complete the standardized 90-item Early Maladaptive Schema Assessment',
    longDescription: 'This comprehensive assessment uses 90 standardized items (5 per schema) across 18 Early Maladaptive Schemas organized into 5 domains. Rate each statement on a 6-point scale from "Completely untrue" to "Describes me perfectly". Schemas scoring ≥15 (out of 30) are considered present.',
    testType: 'structured',
    outputTypes: ['schemas'],
    requiresLLMAnalysis: false,
    supportsRealTimeScoring: true,
    promptFocus: 'Generate insights from EMSA 90-item assessment scores. Identify which schemas meet the threshold (≥15), analyze domain patterns, and provide evidence-based interpretations of the user\'s schema profile.',
    exampleQuestions: [], 
    recommendedOrder: 1,
    estimatedDuration: '20-25 minutes'
  },

  'ems': {
    id: 'ems',
    label: 'Core Schema Assessment (EMSA 90-Item)',
    shortDescription: 'Complete the standardized 90-item Early Maladaptive Schema Assessment',
    longDescription: 'This comprehensive assessment uses 90 standardized items (5 per schema) across 18 Early Maladaptive Schemas organized into 5 domains.',
    testType: 'structured',
    outputTypes: ['schemas'],
    requiresLLMAnalysis: false,
    supportsRealTimeScoring: true,
    recommendedOrder: 1,
    estimatedDuration: '20-25 minutes'
  },

  'mode-identification': {
    id: 'mode-identification',
    label: 'Schema Mode Assessment',
    shortDescription: 'Comprehensive 160-item questionnaire identifying active schema modes',
    longDescription: 'This assessment uses 160 questions to identify which schema modes you activate most frequently.',
    testType: 'structured',
    outputTypes: ['modes'],
    requiresLLMAnalysis: false,
    supportsRealTimeScoring: true,
    promptFocus: 'Deterministic scoring with Low-Moderate-High-Dominant activation bands.',
    exampleQuestions: [
      'I feel small, helpless, and powerless like a child.'
    ],
    recommendedOrder: 2,
    estimatedDuration: '25-30 minutes'
  },

  'schema-modes': {
    id: 'schema-modes',
    label: 'Schema Mode Assessment',
    shortDescription: 'Comprehensive questionnaire identifying active schema modes',
    longDescription: 'This assessment identifies which schema modes you activate most frequently.',
    testType: 'structured',
    outputTypes: ['modes'],
    requiresLLMAnalysis: false,
    supportsRealTimeScoring: true,
    recommendedOrder: 2,
    estimatedDuration: '25-30 minutes'
  },

  'coping-style': {
    id: 'coping-style',
    label: 'Coping Style Assessment (Coming Soon)',
    shortDescription: 'Identify your primary coping patterns: surrender, avoidance, or overcompensation',
    longDescription: 'When schemas are triggered, we typically respond with one of three coping styles.',
    testType: 'structured',
    outputTypes: ['coping'],
    requiresLLMAnalysis: false,
    supportsRealTimeScoring: true,
    promptFocus: 'STUB - Not yet implemented.',
    exampleQuestions: [],
    recommendedOrder: 3,
    estimatedDuration: '15-20 minutes'
  },

  'trigger-pattern': {
    id: 'trigger-pattern',
    label: 'Trigger Pattern Analysis (Legacy)',
    shortDescription: '[Legacy] LLM-based trigger pattern identification',
    longDescription: 'Original qualitative assessment using open-ended questions and LLM analysis.',
    testType: 'conversational',
    outputTypes: ['triggers'],
    requiresLLMAnalysis: true,
    supportsRealTimeScoring: false,
    promptFocus: 'Legacy LLM-based analysis.',
    exampleQuestions: [
      'What situations consistently trigger strong emotional reactions?'
    ],
    recommendedOrder: 4,
    estimatedDuration: '10-15 minutes'
  }
};

/**
 * Get metadata for a specific test
 */
export function getSchemaTestMetadata(testId: SchemaTestId): SchemaTestDefinition {
  return SCHEMA_TESTS[testId];
}

/**
 * Get all test definitions in recommended order
 */
export function getAllSchemaTests(): SchemaTestDefinition[] {
  return Object.values(SCHEMA_TESTS).sort((a, b) => a.recommendedOrder - b.recommendedOrder);
}

/**
 * Get only the active/implemented tests (excludes stub and legacy)
 */
export function getActiveSchemaTests(): SchemaTestDefinition[] {
  return getAllSchemaTests().filter(test =>
    test.id === 'core-schema' || test.id === 'mode-identification'
  );
}

// ============================================================================
// API Client Helpers (Legacy - for backwards compatibility with trigger-pattern)
// ============================================================================

/**
 * Call Grok 4.1 as primary LLM via proxy
 */
async function callGrokPrimary(prompt: string, maxTokens: number = 3000): Promise<string> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`Grok 4.1 primary failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Call Qwen as fallback via proxy
 */
async function callQwenFallback(
  prompt: string,
  maxTokens: number = 2000
): Promise<string> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      })
    });
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    const data = await response.json();

    const content = data.choices[0]?.message?.content || '';
    if (!content) {
      throw new Error('Proxy response returned empty text');
    }

    return content;
  } catch (error) {
    throw new Error(`Qwen fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * EMSA 90-Item Question Bank
 * 18 schemas × 5 items each, organized by 5 domains
 * Each item uses 6-point Likert scale: 1=Completely untrue, 6=Describes me perfectly
 */
interface EMSAItem {
  id: string;
  schemaName: SchemaName;
  domain: SchemaDomain;
  text: string;
}

export const EMSA_90_ITEMS: EMSAItem[] = [
  // Domain 1: Disconnection & Rejection (25 items)
  // Abandonment/Instability (5 items)
  { id: 'emsa_1', schemaName: 'abandonment', domain: 'disconnection-rejection', text: 'I worry that people I feel close to will leave me or abandon me.' },
  { id: 'emsa_2', schemaName: 'abandonment', domain: 'disconnection-rejection', text: 'I need other people too much.' },
  { id: 'emsa_3', schemaName: 'abandonment', domain: 'disconnection-rejection', text: 'I worry that people I love will find someone else they prefer and leave me.' },
  { id: 'emsa_4', schemaName: 'abandonment', domain: 'disconnection-rejection', text: 'When I feel someone I care for pulling away from me, I get desperate.' },
  { id: 'emsa_5', schemaName: 'abandonment', domain: 'disconnection-rejection', text: 'I am often preoccupied with the fear of being left alone.' },

  // Mistrust/Abuse (5 items)
  { id: 'emsa_6', schemaName: 'mistrust-abuse', domain: 'disconnection-rejection', text: 'I feel that people will take advantage of me if I am not careful.' },
  { id: 'emsa_7', schemaName: 'mistrust-abuse', domain: 'disconnection-rejection', text: 'I am quite suspicious of other people\'s motives.' },
  { id: 'emsa_8', schemaName: 'mistrust-abuse', domain: 'disconnection-rejection', text: 'I have been physically, emotionally, or sexually abused by important people in my life.' },
  { id: 'emsa_9', schemaName: 'mistrust-abuse', domain: 'disconnection-rejection', text: 'I am usually on the lookout for people\'s ulterior motives.' },
  { id: 'emsa_10', schemaName: 'mistrust-abuse', domain: 'disconnection-rejection', text: 'I find it hard to trust people.' },

  // Emotional Deprivation (5 items)
  { id: 'emsa_11', schemaName: 'emotional-deprivation', domain: 'disconnection-rejection', text: 'I haven\'t had one special person who loves me and cares what happens to me.' },
  { id: 'emsa_12', schemaName: 'emotional-deprivation', domain: 'disconnection-rejection', text: 'No one really understands me.' },
  { id: 'emsa_13', schemaName: 'emotional-deprivation', domain: 'disconnection-rejection', text: 'I find myself being drawn to people who are cold and ungiving.' },
  { id: 'emsa_14', schemaName: 'emotional-deprivation', domain: 'disconnection-rejection', text: 'I feel emotionally deprived.' },
  { id: 'emsa_15', schemaName: 'emotional-deprivation', domain: 'disconnection-rejection', text: 'I don\'t have people to give me warmth, holding, and affection.' },

  // Defectiveness/Shame (5 items)
  { id: 'emsa_16', schemaName: 'defectiveness-shame', domain: 'disconnection-rejection', text: 'I am inherently flawed and defective.' },
  { id: 'emsa_17', schemaName: 'defectiveness-shame', domain: 'disconnection-rejection', text: 'No man or woman I desire could love me once they saw my defects.' },
  { id: 'emsa_18', schemaName: 'defectiveness-shame', domain: 'disconnection-rejection', text: 'I am fundamentally different from other people.' },
  { id: 'emsa_19', schemaName: 'defectiveness-shame', domain: 'disconnection-rejection', text: 'I don\'t fit in.' },
  { id: 'emsa_20', schemaName: 'defectiveness-shame', domain: 'disconnection-rejection', text: 'I am unworthy of the love, attention, and respect of others.' },

  // Social Isolation/Alienation (5 items)
  { id: 'emsa_21', schemaName: 'social-isolation', domain: 'disconnection-rejection', text: 'I don\'t belong; I am a loner.' },
  { id: 'emsa_22', schemaName: 'social-isolation', domain: 'disconnection-rejection', text: 'I feel alienated from other people.' },
  { id: 'emsa_23', schemaName: 'social-isolation', domain: 'disconnection-rejection', text: 'I feel isolated and alone.' },
  { id: 'emsa_24', schemaName: 'social-isolation', domain: 'disconnection-rejection', text: 'I always feel on the outside of groups.' },
  { id: 'emsa_25', schemaName: 'social-isolation', domain: 'disconnection-rejection', text: 'No one really cares about me; I am alone in the world.' },

  // Domain 2: Impaired Autonomy & Performance (20 items)
  // Dependence/Incompetence (5 items)
  { id: 'emsa_26', schemaName: 'dependence-incompetence', domain: 'impaired-autonomy', text: 'I cannot cope on my own like other people.' },
  { id: 'emsa_27', schemaName: 'dependence-incompetence', domain: 'impaired-autonomy', text: 'I need other people to help me get by.' },
  { id: 'emsa_28', schemaName: 'dependence-incompetence', domain: 'impaired-autonomy', text: 'I do not feel capable of getting by on my own in everyday life.' },
  { id: 'emsa_29', schemaName: 'dependence-incompetence', domain: 'impaired-autonomy', text: 'I lack common sense.' },
  { id: 'emsa_30', schemaName: 'dependence-incompetence', domain: 'impaired-autonomy', text: 'My judgment cannot be relied upon in everyday situations.' },

  // Vulnerability to Harm or Illness (5 items)
  { id: 'emsa_31', schemaName: 'vulnerability', domain: 'impaired-autonomy', text: 'I feel that a disaster could strike at any time.' },
  { id: 'emsa_32', schemaName: 'vulnerability', domain: 'impaired-autonomy', text: 'I worry about being attacked.' },
  { id: 'emsa_33', schemaName: 'vulnerability', domain: 'impaired-autonomy', text: 'I worry that I will lose all my money and become destitute.' },
  { id: 'emsa_34', schemaName: 'vulnerability', domain: 'impaired-autonomy', text: 'I worry that I\'m developing a serious illness, even though nothing serious has been diagnosed by a physician.' },
  { id: 'emsa_35', schemaName: 'vulnerability', domain: 'impaired-autonomy', text: 'I am a fearful person.' },

  // Enmeshment/Undeveloped Self (5 items)
  { id: 'emsa_36', schemaName: 'enmeshment', domain: 'impaired-autonomy', text: 'I have not been able to separate myself from my parent(s) the way other people my age seem to.' },
  { id: 'emsa_37', schemaName: 'enmeshment', domain: 'impaired-autonomy', text: 'My parent(s) and I tend to be overinvolved in each other\'s lives and problems.' },
  { id: 'emsa_38', schemaName: 'enmeshment', domain: 'impaired-autonomy', text: 'It is very difficult for my parent(s) and me to keep intimate details private—to have a separate private life.' },
  { id: 'emsa_39', schemaName: 'enmeshment', domain: 'impaired-autonomy', text: 'I often feel that I do not have a separate identity from my parent(s) or partner.' },
  { id: 'emsa_40', schemaName: 'enmeshment', domain: 'impaired-autonomy', text: 'I often feel as if my parent(s) are living through me—I don\'t have a life of my own.' },

  // Failure (5 items)
  { id: 'emsa_41', schemaName: 'failure', domain: 'impaired-autonomy', text: 'I am incompetent when it comes to achievement.' },
  { id: 'emsa_42', schemaName: 'failure', domain: 'impaired-autonomy', text: 'Most other people are more capable than I am in areas of work and achievement.' },
  { id: 'emsa_43', schemaName: 'failure', domain: 'impaired-autonomy', text: 'I\'m not as talented as most people are at their work.' },
  { id: 'emsa_44', schemaName: 'failure', domain: 'impaired-autonomy', text: 'I\'m not as intelligent as most people when it comes to work (or school).' },
  { id: 'emsa_45', schemaName: 'failure', domain: 'impaired-autonomy', text: 'I am humiliated by my failures and inadequacies in the work sphere.' },

  // Domain 3: Impaired Limits (10 items)
  // Entitlement/Grandiosity (5 items)
  { id: 'emsa_46', schemaName: 'entitlement-grandiosity', domain: 'impaired-limits', text: 'I am special and shouldn\'t have to accept many of the restrictions placed on other people.' },
  { id: 'emsa_47', schemaName: 'entitlement-grandiosity', domain: 'impaired-limits', text: 'I hate to be constrained or kept from doing what I want.' },
  { id: 'emsa_48', schemaName: 'entitlement-grandiosity', domain: 'impaired-limits', text: 'I feel that I shouldn\'t have to follow the normal rules and conventions other people do.' },
  { id: 'emsa_49', schemaName: 'entitlement-grandiosity', domain: 'impaired-limits', text: 'I feel that what I have to offer is of greater value than the contributions of others.' },
  { id: 'emsa_50', schemaName: 'entitlement-grandiosity', domain: 'impaired-limits', text: 'I usually put my needs first.' },

  // Insufficient Self-Control/Self-Discipline (5 items)
  { id: 'emsa_51', schemaName: 'insufficient-self-control', domain: 'impaired-limits', text: 'I have a lot of trouble accepting "no" for an answer when I want something.' },
  { id: 'emsa_52', schemaName: 'insufficient-self-control', domain: 'impaired-limits', text: 'I can\'t discipline myself to complete routine, boring tasks.' },
  { id: 'emsa_53', schemaName: 'insufficient-self-control', domain: 'impaired-limits', text: 'I can\'t seem to escape the feeling that something bad is about to happen.' },
  { id: 'emsa_54', schemaName: 'insufficient-self-control', domain: 'impaired-limits', text: 'I have trouble controlling my impulses when I get upset.' },
  { id: 'emsa_55', schemaName: 'insufficient-self-control', domain: 'impaired-limits', text: 'I lose my temper too easily.' },

  // Domain 4: Other-Directedness (15 items)
  // Subjugation (5 items)
  { id: 'emsa_56', schemaName: 'subjugation', domain: 'other-directedness', text: 'I feel the major decisions in my life were not really my own.' },
  { id: 'emsa_57', schemaName: 'subjugation', domain: 'other-directedness', text: 'I worry a lot about pleasing other people so they won\'t reject me.' },
  { id: 'emsa_58', schemaName: 'subjugation', domain: 'other-directedness', text: 'I have a lot of trouble demanding that my rights be respected and my feelings be taken into account.' },
  { id: 'emsa_59', schemaName: 'subjugation', domain: 'other-directedness', text: 'I get angry when I think about the ways I have been mistreated by other people throughout my life.' },
  { id: 'emsa_60', schemaName: 'subjugation', domain: 'other-directedness', text: 'In relationships, I let the other person have the upper hand.' },

  // Self-Sacrifice (5 items)
  { id: 'emsa_61', schemaName: 'self-sacrifice', domain: 'other-directedness', text: 'I am the one who usually ends up taking care of the people I\'m close to.' },
  { id: 'emsa_62', schemaName: 'self-sacrifice', domain: 'other-directedness', text: 'I am a good person because I think of others more than of myself.' },
  { id: 'emsa_63', schemaName: 'self-sacrifice', domain: 'other-directedness', text: 'I\'m so busy doing things for the people that I care about that I have little time for myself.' },
  { id: 'emsa_64', schemaName: 'self-sacrifice', domain: 'other-directedness', text: 'I have been the most giving person in many of my relationships.' },
  { id: 'emsa_65', schemaName: 'self-sacrifice', domain: 'other-directedness', text: 'I allow others to take advantage of me because I feel guilty when I let people down.' },

  // Approval-Seeking/Recognition-Seeking (5 items)
  { id: 'emsa_66', schemaName: 'approval-seeking', domain: 'other-directedness', text: 'It is very important to me to be liked and admired by others.' },
  { id: 'emsa_67', schemaName: 'approval-seeking', domain: 'other-directedness', text: 'Status and recognition are very important to me.' },
  { id: 'emsa_68', schemaName: 'approval-seeking', domain: 'other-directedness', text: 'I worry a great deal about what others think of me.' },
  { id: 'emsa_69', schemaName: 'approval-seeking', domain: 'other-directedness', text: 'I spend a lot of time concerned with my appearance.' },
  { id: 'emsa_70', schemaName: 'approval-seeking', domain: 'other-directedness', text: 'Money and material possessions are one of my main goals in life.' },

  // Domain 5: Overvigilance & Inhibition (20 items)
  // Negativity/Pessimism (5 items)
  { id: 'emsa_71', schemaName: 'negativity-pessimism', domain: 'overvigilance-inhibition', text: 'I can\'t shake the feeling that something bad is about to happen.' },
  { id: 'emsa_72', schemaName: 'negativity-pessimism', domain: 'overvigilance-inhibition', text: 'Even when things seem to be going well, I feel that this is only temporary.' },
  { id: 'emsa_73', schemaName: 'negativity-pessimism', domain: 'overvigilance-inhibition', text: 'I find it difficult to enjoy the moment because I focus on the negative aspects of life.' },
  { id: 'emsa_74', schemaName: 'negativity-pessimism', domain: 'overvigilance-inhibition', text: 'I can\'t get over my pessimistic view of the future.' },
  { id: 'emsa_75', schemaName: 'negativity-pessimism', domain: 'overvigilance-inhibition', text: 'I focus much more on the negative aspects of life than on the positive aspects.' },

  // Emotional Inhibition (5 items)
  { id: 'emsa_76', schemaName: 'emotional-inhibition', domain: 'overvigilance-inhibition', text: 'I find it embarrassing to express my feelings to others.' },
  { id: 'emsa_77', schemaName: 'emotional-inhibition', domain: 'overvigilance-inhibition', text: 'I find it hard to be warm and spontaneous with others.' },
  { id: 'emsa_78', schemaName: 'emotional-inhibition', domain: 'overvigilance-inhibition', text: 'I control myself so much that people think I am unemotional.' },
  { id: 'emsa_79', schemaName: 'emotional-inhibition', domain: 'overvigilance-inhibition', text: 'I try very hard to keep my feelings under control.' },
  { id: 'emsa_80', schemaName: 'emotional-inhibition', domain: 'overvigilance-inhibition', text: 'I have trouble expressing warm feelings (e.g., affection, caring).' },

  // Unrelenting Standards/Hypercriticalness (5 items)
  { id: 'emsa_81', schemaName: 'unrelenting-standards', domain: 'overvigilance-inhibition', text: 'I must be the best at most of what I do; I can\'t accept second best.' },
  { id: 'emsa_82', schemaName: 'unrelenting-standards', domain: 'overvigilance-inhibition', text: 'I strive to keep everything in perfect order.' },
  { id: 'emsa_83', schemaName: 'unrelenting-standards', domain: 'overvigilance-inhibition', text: 'I must meet all my responsibilities.' },
  { id: 'emsa_84', schemaName: 'unrelenting-standards', domain: 'overvigilance-inhibition', text: 'I feel there is constant pressure for me to achieve and get things done.' },
  { id: 'emsa_85', schemaName: 'unrelenting-standards', domain: 'overvigilance-inhibition', text: 'I can\'t let myself off the hook easily or make excuses for my mistakes.' },

  // Punitiveness (5 items)
  { id: 'emsa_86', schemaName: 'punitiveness', domain: 'overvigilance-inhibition', text: 'People should be punished when they make mistakes.' },
  { id: 'emsa_87', schemaName: 'punitiveness', domain: 'overvigilance-inhibition', text: 'I get very angry when people don\'t do what I think they should.' },
  { id: 'emsa_88', schemaName: 'punitiveness', domain: 'overvigilance-inhibition', text: 'I have a lot of trouble forgiving people who have hurt me.' },
  { id: 'emsa_89', schemaName: 'punitiveness', domain: 'overvigilance-inhibition', text: 'I often get angry or irritated when people don\'t live up to my expectations.' },
  { id: 'emsa_90', schemaName: 'punitiveness', domain: 'overvigilance-inhibition', text: 'I am very hard on myself when I make a mistake.' }
];

// ============================================================================
// Schema Mode Identification Items (165 items across 13 modes)
// Comprehensive assessment using 6-point Likert scale
// ============================================================================

interface SchemaModeItem {
  id: string;
  modeTarget: SchemaMode;
  modeCategory: 'child' | 'coping' | 'parent' | 'healthy';
  text: string;
  description?: string;
}

export const SCHEMA_MODE_ITEMS: SchemaModeItem[] = [
  // CHILD MODES (60 items: 12 per child mode)
  // Vulnerable Child (12 items)
  { id: 'mode_vc_1', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel small, helpless, and overwhelmed' },
  { id: 'mode_vc_2', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel deeply lonely, even around others' },
  { id: 'mode_vc_3', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel unloved and unwanted' },
  { id: 'mode_vc_4', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel scared that something bad will happen' },
  { id: 'mode_vc_5', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel like a sad, lost child inside' },
  { id: 'mode_vc_6', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel fragile and easily hurt' },
  { id: 'mode_vc_7', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel desperate for someone to take care of me' },
  { id: 'mode_vc_8', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel deep grief or emptiness I cannot explain' },
  { id: 'mode_vc_9', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel like I am not good enough at my core' },
  { id: 'mode_vc_10', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I feel abandoned or forgotten' },
  { id: 'mode_vc_11', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I withdraw and become passive when distressed' },
  { id: 'mode_vc_12', modeTarget: 'vulnerable-child', modeCategory: 'child', text: 'I seek reassurance and comfort from others' },

  // Angry Child (12 items)
  { id: 'mode_ac_1', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel angry that my needs are not being met' },
  { id: 'mode_ac_2', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel resentful about how I have been treated' },
  { id: 'mode_ac_3', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel frustrated when others do not understand me' },
  { id: 'mode_ac_4', modeTarget: 'angry-child', modeCategory: 'child', text: 'I have angry outbursts I later regret' },
  { id: 'mode_ac_5', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel bitter about my childhood or past' },
  { id: 'mode_ac_6', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel like screaming "It is not fair!"' },
  { id: 'mode_ac_7', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel rage when I am ignored or dismissed' },
  { id: 'mode_ac_8', modeTarget: 'angry-child', modeCategory: 'child', text: 'I sulk or withdraw when I am hurt' },
  { id: 'mode_ac_9', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel angry at people who seem to "have it easy"' },
  { id: 'mode_ac_10', modeTarget: 'angry-child', modeCategory: 'child', text: 'I hold grudges about past hurts' },
  { id: 'mode_ac_11', modeTarget: 'angry-child', modeCategory: 'child', text: 'I lash out verbally when frustrated' },
  { id: 'mode_ac_12', modeTarget: 'angry-child', modeCategory: 'child', text: 'I feel a strong urge to express my displeasure' },

  // Impulsive Child (12 items)
  { id: 'mode_ic_1', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I act on impulse without thinking' },
  { id: 'mode_ic_2', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I do things for instant gratification' },
  { id: 'mode_ic_3', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I throw tantrums when I do not get what I want' },
  { id: 'mode_ic_4', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I make reckless decisions based on feelings' },
  { id: 'mode_ic_5', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I interrupt others or demand immediate attention' },
  { id: 'mode_ic_6', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I abandon tasks when they are not fun anymore' },
  { id: 'mode_ic_7', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I spend money impulsively' },
  { id: 'mode_ic_8', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I say whatever I am thinking without filtering' },
  { id: 'mode_ic_9', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I jump into relationships or projects too quickly' },
  { id: 'mode_ic_10', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I have trouble waiting for things' },
  { id: 'mode_ic_11', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I act without considering consequences' },
  { id: 'mode_ic_12', modeTarget: 'impulsive-child', modeCategory: 'child', text: 'I seek thrills and excitement impulsively' },

  // Undisciplined Child (12 items)
  { id: 'mode_ud_1', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I avoid tasks that require sustained effort' },
  { id: 'mode_ud_2', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I give up easily when things get hard' },
  { id: 'mode_ud_3', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I cannot make myself do things I do not want to do' },
  { id: 'mode_ud_4', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I feel unable to tolerate boredom' },
  { id: 'mode_ud_5', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I lack persistence and follow-through' },
  { id: 'mode_ud_6', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I make excuses to avoid responsibilities' },
  { id: 'mode_ud_7', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I choose easy/comfortable over meaningful' },
  { id: 'mode_ud_8', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I procrastinate on important things' },
  { id: 'mode_ud_9', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I feel like I deserve to take the easy path' },
  { id: 'mode_ud_10', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I resent having to work hard for things' },
  { id: 'mode_ud_11', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I avoid challenges that require discipline' },
  { id: 'mode_ud_12', modeTarget: 'undisciplined-child', modeCategory: 'child', text: 'I struggle with delayed gratification' },

  // Happy/Contented Child (12 items - HEALTHY)
  { id: 'mode_hc_1', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel genuinely content and at peace' },
  { id: 'mode_hc_2', modeTarget: 'happy-child', modeCategory: 'child', text: 'I can be playful and spontaneous' },
  { id: 'mode_hc_3', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel safe and loved' },
  { id: 'mode_hc_4', modeTarget: 'happy-child', modeCategory: 'child', text: 'I experience joy without anxiety about it ending' },
  { id: 'mode_hc_5', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel free to be myself' },
  { id: 'mode_hc_6', modeTarget: 'happy-child', modeCategory: 'child', text: 'I can be silly and carefree' },
  { id: 'mode_hc_7', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel optimistic about life' },
  { id: 'mode_hc_8', modeTarget: 'happy-child', modeCategory: 'child', text: 'I trust that my needs will be met' },
  { id: 'mode_hc_9', modeTarget: 'happy-child', modeCategory: 'child', text: 'I can enjoy the present moment fully' },
  { id: 'mode_hc_10', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel connected to others in a warm way' },
  { id: 'mode_hc_11', modeTarget: 'happy-child', modeCategory: 'child', text: 'I experience natural joy and enthusiasm' },
  { id: 'mode_hc_12', modeTarget: 'happy-child', modeCategory: 'child', text: 'I feel alive and engaged with the world' },

  // PARENT MODES (24 items: 12 per parent mode)
  // Punitive Parent (12 items)
  { id: 'mode_pp_1', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I have a harsh inner voice that attacks me' },
  { id: 'mode_pp_2', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I tell myself I am worthless, stupid, or bad' },
  { id: 'mode_pp_3', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I believe I deserve to suffer or be punished' },
  { id: 'mode_pp_4', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I am disgusted with myself' },
  { id: 'mode_pp_5', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I think I do not deserve good things' },
  { id: 'mode_pp_6', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I mentally beat myself up for mistakes' },
  { id: 'mode_pp_7', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I feel I should be ashamed of who I am' },
  { id: 'mode_pp_8', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I treat myself more harshly than I would treat anyone else' },
  { id: 'mode_pp_9', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I believe I am fundamentally bad or evil' },
  { id: 'mode_pp_10', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I sabotage good things because I do not deserve them' },
  { id: 'mode_pp_11', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I criticize myself harshly for perceived failures' },
  { id: 'mode_pp_12', modeTarget: 'punitive-parent', modeCategory: 'parent', text: 'I use self-blame to process mistakes' },

  // Demanding Parent (12 items)
  { id: 'mode_dp_1', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I pressure myself to be perfect' },
  { id: 'mode_dp_2', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'Nothing I do is ever good enough' },
  { id: 'mode_dp_3', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I feel I must achieve more to have worth' },
  { id: 'mode_dp_4', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I criticize myself for any imperfection' },
  { id: 'mode_dp_5', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I push myself past healthy limits' },
  { id: 'mode_dp_6', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I feel guilty resting or having fun' },
  { id: 'mode_dp_7', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I set unrealistically high standards' },
  { id: 'mode_dp_8', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I focus on what is wrong rather than what is right' },
  { id: 'mode_dp_9', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I believe I should always be productive' },
  { id: 'mode_dp_10', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I feel like I am running on a treadmill I cannot stop' },
  { id: 'mode_dp_11', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I internalize unrealistic expectations' },
  { id: 'mode_dp_12', modeTarget: 'demanding-parent', modeCategory: 'parent', text: 'I drive myself relentlessly toward goals' },

  // COPING MODES (49 items)
  // Compliant Surrenderer (10 items)
  { id: 'mode_cs_1', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I go along with what others want to keep peace' },
  { id: 'mode_cs_2', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I do not assert my own needs or opinions' },
  { id: 'mode_cs_3', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I let others take advantage of me' },
  { id: 'mode_cs_4', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I become overly passive or submissive' },
  { id: 'mode_cs_5', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I agree with criticism even when it is unfair' },
  { id: 'mode_cs_6', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I apologize excessively' },
  { id: 'mode_cs_7', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I stay in situations that hurt me' },
  { id: 'mode_cs_8', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I defer to others\' judgment over my own' },
  { id: 'mode_cs_9', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I feel I have no right to speak up' },
  { id: 'mode_cs_10', modeTarget: 'compliant-surrender', modeCategory: 'coping', text: 'I play small to avoid conflict or rejection' },

  // Detached Protector (10 items)
  { id: 'mode_dp_1', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I shut down emotionally when stressed' },
  { id: 'mode_dp_2', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I feel numb or empty inside' },
  { id: 'mode_dp_3', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I withdraw from people and situations' },
  { id: 'mode_dp_4', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I feel like I am watching life from behind glass' },
  { id: 'mode_dp_5', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I disconnect from my body' },
  { id: 'mode_dp_6', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I avoid thinking about painful things' },
  { id: 'mode_dp_7', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I feel robotic or like I am going through motions' },
  { id: 'mode_dp_8', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I use distraction to avoid feelings' },
  { id: 'mode_dp_9', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I feel emotionally flat or unreachable' },
  { id: 'mode_dp_10', modeTarget: 'detached-protector', modeCategory: 'coping', text: 'I have trouble accessing feelings when I want to' },

  // Detached Self-Soother (10 items)
  { id: 'mode_dss_1', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use food to comfort or numb myself' },
  { id: 'mode_dss_2', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use substances to escape my feelings' },
  { id: 'mode_dss_3', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I binge on entertainment to avoid reality' },
  { id: 'mode_dss_4', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use work or busyness to avoid inner pain' },
  { id: 'mode_dss_5', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I engage in compulsive behaviors for relief' },
  { id: 'mode_dss_6', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I zone out with screens, games, or scrolling' },
  { id: 'mode_dss_7', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use shopping, gambling, or spending to feel better' },
  { id: 'mode_dss_8', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use sleep to escape' },
  { id: 'mode_dss_9', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I engage in self-harm to regulate emotions' },
  { id: 'mode_dss_10', modeTarget: 'detached-self-soother', modeCategory: 'coping', text: 'I use fantasy/daydreaming to escape reality' },

  // Self-Aggrandizer (10 items)
  { id: 'mode_sa_1', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I act like I am better than others' },
  { id: 'mode_sa_2', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I focus on status, winning, or being the best' },
  { id: 'mode_sa_3', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I put others down to feel better about myself' },
  { id: 'mode_sa_4', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I exaggerate my accomplishments' },
  { id: 'mode_sa_5', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I expect special treatment' },
  { id: 'mode_sa_6', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I become arrogant or dismissive of others' },
  { id: 'mode_sa_7', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I feel superior to "ordinary" people' },
  { id: 'mode_sa_8', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I need to be the center of attention' },
  { id: 'mode_sa_9', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I brag or show off' },
  { id: 'mode_sa_10', modeTarget: 'self-aggrandizer', modeCategory: 'coping', text: 'I feel contempt for people I see as weak' },

  // Bully and Attack (9 items)
  { id: 'mode_ba_1', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I attack others before they can hurt me' },
  { id: 'mode_ba_2', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I intimidate people to get my way' },
  { id: 'mode_ba_3', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I become cruel when I feel threatened' },
  { id: 'mode_ba_4', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I use criticism or sarcasm as a weapon' },
  { id: 'mode_ba_5', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I humiliate others when I am feeling weak' },
  { id: 'mode_ba_6', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I threaten or dominate in conflicts' },
  { id: 'mode_ba_7', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I become cold and ruthless when needed' },
  { id: 'mode_ba_8', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I see vulnerability as weakness to exploit' },
  { id: 'mode_ba_9', modeTarget: 'bully-attack', modeCategory: 'coping', text: 'I use anger to control situations and people' },

  // HEALTHY ADULT MODE (15 items)
  { id: 'mode_ha_1', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can observe my feelings without being overwhelmed' },
  { id: 'mode_ha_2', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I set appropriate boundaries' },
  { id: 'mode_ha_3', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I take responsibility for my behavior' },
  { id: 'mode_ha_4', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can comfort and soothe myself' },
  { id: 'mode_ha_5', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I balance my needs with others\' needs' },
  { id: 'mode_ha_6', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can think clearly even when emotional' },
  { id: 'mode_ha_7', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I pursue meaningful goals with persistence' },
  { id: 'mode_ha_8', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can ask for what I need appropriately' },
  { id: 'mode_ha_9', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I forgive myself and others for mistakes' },
  { id: 'mode_ha_10', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can see situations from multiple perspectives' },
  { id: 'mode_ha_11', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I make decisions based on values, not just feelings' },
  { id: 'mode_ha_12', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can tolerate distress without destructive coping' },
  { id: 'mode_ha_13', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I can connect warmly with others' },
  { id: 'mode_ha_14', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I protect my Vulnerable Child appropriately' },
  { id: 'mode_ha_15', modeTarget: 'healthy-adult', modeCategory: 'healthy', text: 'I counter my Punitive/Demanding Parent voices' }
];

// ============================================================================
// Coping Style Assessment Items (336 items across 3 coping styles)
// Comprehensive assessment using 6-point Likert scale
// ============================================================================

interface CopingStyleItem {
  id: string;
  copingTarget: CopingStyle;
  schemaTarget?: SchemaName;
  text: string;
}

export const COPING_STYLE_ITEMS: CopingStyleItem[] = [
  // SURRENDER/COMPLIANCE COPING (112 items)
  // General Surrender (10 items)
  { id: 'cop_sur_gen_1', copingTarget: 'surrender', text: 'I accept negative treatment because I feel I deserve it' },
  { id: 'cop_sur_gen_2', copingTarget: 'surrender', text: 'I choose partners/friends who treat me poorly' },
  { id: 'cop_sur_gen_3', copingTarget: 'surrender', text: 'I do not fight back when I am mistreated' },
  { id: 'cop_sur_gen_4', copingTarget: 'surrender', text: 'I believe my schemas are just "reality"' },
  { id: 'cop_sur_gen_5', copingTarget: 'surrender', text: 'I play out the same painful patterns repeatedly' },
  { id: 'cop_sur_gen_6', copingTarget: 'surrender', text: 'I confirm my worst beliefs about myself' },
  { id: 'cop_sur_gen_7', copingTarget: 'surrender', text: 'I stay in situations that reinforce my pain' },
  { id: 'cop_sur_gen_8', copingTarget: 'surrender', text: 'I let others define my worth' },
  { id: 'cop_sur_gen_9', copingTarget: 'surrender', text: 'I do not try to change because "this is just who I am"' },
  { id: 'cop_sur_gen_10', copingTarget: 'surrender', text: 'I feel helpless to create a different life' },

  // Abandonment Surrender (3 items)
  { id: 'cop_sur_abn_1', copingTarget: 'surrender', schemaTarget: 'abandonment', text: 'I become clingy and desperate in relationships' },
  { id: 'cop_sur_abn_2', copingTarget: 'surrender', schemaTarget: 'abandonment', text: 'I stay with unavailable/rejecting partners' },
  { id: 'cop_sur_abn_3', copingTarget: 'surrender', schemaTarget: 'abandonment', text: 'I tolerate neglect because any relationship is better than none' },

  // Mistrust Surrender (3 items)
  { id: 'cop_sur_mst_1', copingTarget: 'surrender', schemaTarget: 'mistrust-abuse', text: 'I let people betray or use me without leaving' },
  { id: 'cop_sur_mst_2', copingTarget: 'surrender', schemaTarget: 'mistrust-abuse', text: 'I stay in abusive situations' },
  { id: 'cop_sur_mst_3', copingTarget: 'surrender', schemaTarget: 'mistrust-abuse', text: 'I accept being controlled or manipulated' },

  // Emotional Deprivation Surrender (3 items)
  { id: 'cop_sur_edp_1', copingTarget: 'surrender', schemaTarget: 'emotional-deprivation', text: 'I choose emotionally unavailable partners' },
  { id: 'cop_sur_edp_2', copingTarget: 'surrender', schemaTarget: 'emotional-deprivation', text: 'I do not ask for what I need emotionally' },
  { id: 'cop_sur_edp_3', copingTarget: 'surrender', schemaTarget: 'emotional-deprivation', text: 'I accept relationships without emotional intimacy' },

  // Defectiveness Surrender (3 items)
  { id: 'cop_sur_def_1', copingTarget: 'surrender', schemaTarget: 'defectiveness-shame', text: 'I accept criticism as valid without question' },
  { id: 'cop_sur_def_2', copingTarget: 'surrender', schemaTarget: 'defectiveness-shame', text: 'I hide myself, expecting rejection if I am known' },
  { id: 'cop_sur_def_3', copingTarget: 'surrender', schemaTarget: 'defectiveness-shame', text: 'I settle for less because I am not worthy of more' },

  // Failure Surrender (3 items)
  { id: 'cop_sur_fai_1', copingTarget: 'surrender', schemaTarget: 'failure', text: 'I do not try because I will just fail anyway' },
  { id: 'cop_sur_fai_2', copingTarget: 'surrender', schemaTarget: 'failure', text: 'I underperform to match my self-image' },
  { id: 'cop_sur_fai_3', copingTarget: 'surrender', schemaTarget: 'failure', text: 'I give up at the first sign of difficulty' },

  // Subjugation Surrender (3 items)
  { id: 'cop_sur_subj_1', copingTarget: 'surrender', schemaTarget: 'subjugation', text: 'I suppress my needs to keep others happy' },
  { id: 'cop_sur_subj_2', copingTarget: 'surrender', schemaTarget: 'subjugation', text: 'I let others make decisions for me' },
  { id: 'cop_sur_subj_3', copingTarget: 'surrender', schemaTarget: 'subjugation', text: 'I do not express opinions that might cause conflict' },

  // Unrelenting Standards Surrender (3 items)
  { id: 'cop_sur_unr_1', copingTarget: 'surrender', schemaTarget: 'unrelenting-standards', text: 'I constantly push myself past healthy limits' },
  { id: 'cop_sur_unr_2', copingTarget: 'surrender', schemaTarget: 'unrelenting-standards', text: 'I obsess over details and perfection' },
  { id: 'cop_sur_unr_3', copingTarget: 'surrender', schemaTarget: 'unrelenting-standards', text: 'I can never rest because nothing is good enough' },

  // AVOIDANCE COPING (112 items)
  // Behavioral Avoidance (10 items)
  { id: 'cop_avo_beh_1', copingTarget: 'avoidance', text: 'I avoid situations that might trigger painful feelings' },
  { id: 'cop_avo_beh_2', copingTarget: 'avoidance', text: 'I withdraw from social situations' },
  { id: 'cop_avo_beh_3', copingTarget: 'avoidance', text: 'I do not pursue goals that risk failure or rejection' },
  { id: 'cop_avo_beh_4', copingTarget: 'avoidance', text: 'I leave relationships before getting too close' },
  { id: 'cop_avo_beh_5', copingTarget: 'avoidance', text: 'I avoid conflict at all costs' },
  { id: 'cop_avo_beh_6', copingTarget: 'avoidance', text: 'I do not take risks that might expose my weaknesses' },
  { id: 'cop_avo_beh_7', copingTarget: 'avoidance', text: 'I stay in my comfort zone' },
  { id: 'cop_avo_beh_8', copingTarget: 'avoidance', text: 'I quit things before I can be judged' },
  { id: 'cop_avo_beh_9', copingTarget: 'avoidance', text: 'I avoid intimacy to prevent getting hurt' },
  { id: 'cop_avo_beh_10', copingTarget: 'avoidance', text: 'I create a life that minimizes all triggers' },

  // Cognitive Avoidance (10 items)
  { id: 'cop_avo_cog_1', copingTarget: 'avoidance', text: 'I try not to think about painful things' },
  { id: 'cop_avo_cog_2', copingTarget: 'avoidance', text: 'I rationalize or minimize my problems' },
  { id: 'cop_avo_cog_3', copingTarget: 'avoidance', text: 'I use denial to protect myself from truth' },
  { id: 'cop_avo_cog_4', copingTarget: 'avoidance', text: 'I intellectualize emotions rather than feel them' },
  { id: 'cop_avo_cog_5', copingTarget: 'avoidance', text: 'I dissociate or space out when triggered' },
  { id: 'cop_avo_cog_6', copingTarget: 'avoidance', text: 'I create positive delusions about bad situations' },
  { id: 'cop_avo_cog_7', copingTarget: 'avoidance', text: 'I suppress or push down negative thoughts' },
  { id: 'cop_avo_cog_8', copingTarget: 'avoidance', text: 'I distract myself from painful realizations' },
  { id: 'cop_avo_cog_9', copingTarget: 'avoidance', text: 'I "forget" traumatic or painful memories' },
  { id: 'cop_avo_cog_10', copingTarget: 'avoidance', text: 'I live in fantasy rather than face reality' },

  // Emotional Avoidance (10 items)
  { id: 'cop_avo_emo_1', copingTarget: 'avoidance', text: 'I numb my emotions so I do not feel pain' },
  { id: 'cop_avo_emo_2', copingTarget: 'avoidance', text: 'I shut down when feelings get intense' },
  { id: 'cop_avo_emo_3', copingTarget: 'avoidance', text: 'I feel emotionally flat or empty' },
  { id: 'cop_avo_emo_4', copingTarget: 'avoidance', text: 'I disconnect from my body and sensations' },
  { id: 'cop_avo_emo_5', copingTarget: 'avoidance', text: 'I do not let myself get attached to avoid loss' },
  { id: 'cop_avo_emo_6', copingTarget: 'avoidance', text: 'I avoid situations that make me feel vulnerable' },
  { id: 'cop_avo_emo_7', copingTarget: 'avoidance', text: 'I mock or dismiss emotional expression' },
  { id: 'cop_avo_emo_8', copingTarget: 'avoidance', text: 'I pride myself on not being "emotional"' },
  { id: 'cop_avo_emo_9', copingTarget: 'avoidance', text: 'I feel things are "happening to someone else"' },
  { id: 'cop_avo_emo_10', copingTarget: 'avoidance', text: 'I can observe but not feel my emotions' },

  // Self-Soothing/Addictive Avoidance (10 items)
  { id: 'cop_avo_sso_1', copingTarget: 'avoidance', text: 'I use alcohol or drugs to cope with emotions' },
  { id: 'cop_avo_sso_2', copingTarget: 'avoidance', text: 'I overeat or restrict eating to manage feelings' },
  { id: 'cop_avo_sso_3', copingTarget: 'avoidance', text: 'I binge on entertainment/screens to escape' },
  { id: 'cop_avo_sso_4', copingTarget: 'avoidance', text: 'I use sex or pornography to avoid feelings' },
  { id: 'cop_avo_sso_5', copingTarget: 'avoidance', text: 'I use shopping or spending for emotional relief' },
  { id: 'cop_avo_sso_6', copingTarget: 'avoidance', text: 'I overwork to avoid facing personal life' },
  { id: 'cop_avo_sso_7', copingTarget: 'avoidance', text: 'I exercise excessively to regulate emotions' },
  { id: 'cop_avo_sso_8', copingTarget: 'avoidance', text: 'I use sleep to escape reality' },
  { id: 'cop_avo_sso_9', copingTarget: 'avoidance', text: 'I engage in thrill-seeking to feel alive/numb pain' },
  { id: 'cop_avo_sso_10', copingTarget: 'avoidance', text: 'I use social media compulsively for distraction' },

  // Abandonment Avoidance (3 items)
  { id: 'cop_avo_abn_1', copingTarget: 'avoidance', schemaTarget: 'abandonment', text: 'I avoid close relationships entirely' },
  { id: 'cop_avo_abn_2', copingTarget: 'avoidance', schemaTarget: 'abandonment', text: 'I leave relationships before they can leave me' },
  { id: 'cop_avo_abn_3', copingTarget: 'avoidance', schemaTarget: 'abandonment', text: 'I keep people at arm\'s length' },

  // Mistrust Avoidance (3 items)
  { id: 'cop_avo_mst_1', copingTarget: 'avoidance', schemaTarget: 'mistrust-abuse', text: 'I avoid any situation requiring trust' },
  { id: 'cop_avo_mst_2', copingTarget: 'avoidance', schemaTarget: 'mistrust-abuse', text: 'I never let anyone know the real me' },
  { id: 'cop_avo_mst_3', copingTarget: 'avoidance', schemaTarget: 'mistrust-abuse', text: 'I keep secrets and stay private' },

  // Emotional Deprivation Avoidance (3 items)
  { id: 'cop_avo_edp_1', copingTarget: 'avoidance', schemaTarget: 'emotional-deprivation', text: 'I avoid recognizing my emotional needs' },
  { id: 'cop_avo_edp_2', copingTarget: 'avoidance', schemaTarget: 'emotional-deprivation', text: 'I stay busy so I do not feel lonely' },
  { id: 'cop_avo_edp_3', copingTarget: 'avoidance', schemaTarget: 'emotional-deprivation', text: 'I convince myself I do not need anyone' },

  // Defectiveness Avoidance (3 items)
  { id: 'cop_avo_def_1', copingTarget: 'avoidance', schemaTarget: 'defectiveness-shame', text: 'I hide my true self from everyone' },
  { id: 'cop_avo_def_2', copingTarget: 'avoidance', schemaTarget: 'defectiveness-shame', text: 'I avoid intimacy so no one sees my flaws' },
  { id: 'cop_avo_def_3', copingTarget: 'avoidance', schemaTarget: 'defectiveness-shame', text: 'I avoid situations where I might be exposed' },

  // Failure Avoidance (3 items)
  { id: 'cop_avo_fai_1', copingTarget: 'avoidance', schemaTarget: 'failure', text: 'I do not try things I might fail at' },
  { id: 'cop_avo_fai_2', copingTarget: 'avoidance', schemaTarget: 'failure', text: 'I avoid competitive or achievement situations' },
  { id: 'cop_avo_fai_3', copingTarget: 'avoidance', schemaTarget: 'failure', text: 'I do not set goals so I cannot fail them' },

  // OVERCOMPENSATION COPING (112 items)
  // General Overcompensation (10 items)
  { id: 'cop_ovc_gen_1', copingTarget: 'overcompensation', text: 'I act the opposite of how I feel inside' },
  { id: 'cop_ovc_gen_2', copingTarget: 'overcompensation', text: 'I overdo things to prove my schemas wrong' },
  { id: 'cop_ovc_gen_3', copingTarget: 'overcompensation', text: 'I overcompensate for perceived weaknesses' },
  { id: 'cop_ovc_gen_4', copingTarget: 'overcompensation', text: 'I create a persona that hides my true self' },
  { id: 'cop_ovc_gen_5', copingTarget: 'overcompensation', text: 'I swing between extremes (e.g., inferior/superior)' },
  { id: 'cop_ovc_gen_6', copingTarget: 'overcompensation', text: 'I attack others to protect myself from hurt' },
  { id: 'cop_ovc_gen_7', copingTarget: 'overcompensation', text: 'I become controlling to manage my anxiety' },
  { id: 'cop_ovc_gen_8', copingTarget: 'overcompensation', text: 'I am rigid and inflexible to feel safe' },
  { id: 'cop_ovc_gen_9', copingTarget: 'overcompensation', text: 'I one-up people or compete excessively' },
  { id: 'cop_ovc_gen_10', copingTarget: 'overcompensation', text: 'I flip my vulnerabilities into pseudo-strengths' },

  // Abandonment Overcompensation (4 items)
  { id: 'cop_ovc_abn_1', copingTarget: 'overcompensation', schemaTarget: 'abandonment', text: 'I leave people before they can leave me' },
  { id: 'cop_ovc_abn_2', copingTarget: 'overcompensation', schemaTarget: 'abandonment', text: 'I reject others first to avoid being rejected' },
  { id: 'cop_ovc_abn_3', copingTarget: 'overcompensation', schemaTarget: 'abandonment', text: 'I act like I do not need anyone at all' },
  { id: 'cop_ovc_abn_4', copingTarget: 'overcompensation', schemaTarget: 'abandonment', text: 'I become controlling or possessive in relationships' },

  // Mistrust Overcompensation (4 items)
  { id: 'cop_ovc_mst_1', copingTarget: 'overcompensation', schemaTarget: 'mistrust-abuse', text: 'I become the one who exploits or uses others' },
  { id: 'cop_ovc_mst_2', copingTarget: 'overcompensation', schemaTarget: 'mistrust-abuse', text: 'I attack first before others can hurt me' },
  { id: 'cop_ovc_mst_3', copingTarget: 'overcompensation', schemaTarget: 'mistrust-abuse', text: 'I become hypervigilant and controlling' },
  { id: 'cop_ovc_mst_4', copingTarget: 'overcompensation', schemaTarget: 'mistrust-abuse', text: 'I try to have power over others so they cannot have power over me' },

  // Emotional Deprivation Overcompensation (4 items)
  { id: 'cop_ovc_edp_1', copingTarget: 'overcompensation', schemaTarget: 'emotional-deprivation', text: 'I become excessively demanding of attention' },
  { id: 'cop_ovc_edp_2', copingTarget: 'overcompensation', schemaTarget: 'emotional-deprivation', text: 'I act needy or entitled to care' },
  { id: 'cop_ovc_edp_3', copingTarget: 'overcompensation', schemaTarget: 'emotional-deprivation', text: 'I become the one who withholds emotionally' },
  { id: 'cop_ovc_edp_4', copingTarget: 'overcompensation', schemaTarget: 'emotional-deprivation', text: 'I pursue people aggressively to get my needs met' },

  // Defectiveness Overcompensation (4 items)
  { id: 'cop_ovc_def_1', copingTarget: 'overcompensation', schemaTarget: 'defectiveness-shame', text: 'I act superior, arrogant, or grandiose' },
  { id: 'cop_ovc_def_2', copingTarget: 'overcompensation', schemaTarget: 'defectiveness-shame', text: 'I criticize others before they can criticize me' },
  { id: 'cop_ovc_def_3', copingTarget: 'overcompensation', schemaTarget: 'defectiveness-shame', text: 'I present a perfect image to hide my flaws' },
  { id: 'cop_ovc_def_4', copingTarget: 'overcompensation', schemaTarget: 'defectiveness-shame', text: 'I become hypercritical of others\' imperfections' },

  // Failure Overcompensation (4 items)
  { id: 'cop_ovc_fai_1', copingTarget: 'overcompensation', schemaTarget: 'failure', text: 'I become an overachiever or workaholic' },
  { id: 'cop_ovc_fai_2', copingTarget: 'overcompensation', schemaTarget: 'failure', text: 'I need to be the best to prove I am not a failure' },
  { id: 'cop_ovc_fai_3', copingTarget: 'overcompensation', schemaTarget: 'failure', text: 'I am extremely competitive and cannot stand losing' },
  { id: 'cop_ovc_fai_4', copingTarget: 'overcompensation', schemaTarget: 'failure', text: 'I overvalue status and achievements' },

  // Subjugation Overcompensation (4 items)
  { id: 'cop_ovc_subj_1', copingTarget: 'overcompensation', schemaTarget: 'subjugation', text: 'I become rebellious and defy all authority' },
  { id: 'cop_ovc_subj_2', copingTarget: 'overcompensation', schemaTarget: 'subjugation', text: 'I refuse to do what anyone tells me' },
  { id: 'cop_ovc_subj_3', copingTarget: 'overcompensation', schemaTarget: 'subjugation', text: 'I become controlling toward others' },
  { id: 'cop_ovc_subj_4', copingTarget: 'overcompensation', schemaTarget: 'subjugation', text: 'I dominate relationships to avoid being controlled' },

  // Vulnerability Overcompensation (4 items)
  { id: 'cop_ovc_vuln_1', copingTarget: 'overcompensation', schemaTarget: 'vulnerability', text: 'I take excessive risks to prove I am not fragile' },
  { id: 'cop_ovc_vuln_2', copingTarget: 'overcompensation', schemaTarget: 'vulnerability', text: 'I act recklessly to prove I am not afraid' },
  { id: 'cop_ovc_vuln_3', copingTarget: 'overcompensation', schemaTarget: 'vulnerability', text: 'I refuse to take normal precautions' },
  { id: 'cop_ovc_vuln_4', copingTarget: 'overcompensation', schemaTarget: 'vulnerability', text: 'I mock people who are careful or worried' },

  // Dependence Overcompensation (4 items)
  { id: 'cop_ovc_dep_1', copingTarget: 'overcompensation', schemaTarget: 'dependence-incompetence', text: 'I refuse all help even when I need it' },
  { id: 'cop_ovc_dep_2', copingTarget: 'overcompensation', schemaTarget: 'dependence-incompetence', text: 'I become extremely self-reliant to a fault' },
  { id: 'cop_ovc_dep_3', copingTarget: 'overcompensation', schemaTarget: 'dependence-incompetence', text: 'I cannot delegate or trust others with tasks' },
  { id: 'cop_ovc_dep_4', copingTarget: 'overcompensation', schemaTarget: 'dependence-incompetence', text: 'I take on too much to prove I am capable' },

  // Emotional Inhibition Overcompensation (4 items)
  { id: 'cop_ovc_ehi_1', copingTarget: 'overcompensation', schemaTarget: 'emotional-inhibition', text: 'I have emotional outbursts or explosions' },
  { id: 'cop_ovc_ehi_2', copingTarget: 'overcompensation', schemaTarget: 'emotional-inhibition', text: 'I overshare to prove I am not repressed' },
  { id: 'cop_ovc_ehi_3', copingTarget: 'overcompensation', schemaTarget: 'emotional-inhibition', text: 'I swing between shutdown and overwhelm' },
  { id: 'cop_ovc_ehi_4', copingTarget: 'overcompensation', schemaTarget: 'emotional-inhibition', text: 'I force emotional expression that feels inauthentic' },

  // Unrelenting Standards Overcompensation (4 items)
  { id: 'cop_ovc_unr_1', copingTarget: 'overcompensation', schemaTarget: 'unrelenting-standards', text: 'I become deliberately sloppy or lazy' },
  { id: 'cop_ovc_unr_2', copingTarget: 'overcompensation', schemaTarget: 'unrelenting-standards', text: 'I rebel against any rules or expectations' },
  { id: 'cop_ovc_unr_3', copingTarget: 'overcompensation', schemaTarget: 'unrelenting-standards', text: 'I give up entirely on achievement or order' },
  { id: 'cop_ovc_unr_4', copingTarget: 'overcompensation', schemaTarget: 'unrelenting-standards', text: 'I devalue things I cannot be perfect at' }
];

/**
 * Get questions/items for a specific test
 * Returns either example questions or full item bank depending on test type
 */
export function getTestItems(testId: SchemaTestId): Array<{ id: string; text: string }> {
  if (testId === 'core-schema') {
    return EMSA_90_ITEMS.map(item => ({ id: item.id, text: item.text }));
  }
  if (testId === 'mode-identification') {
    return SCHEMA_MODE_ITEMS.map(item => ({ id: item.id, text: item.text }));
  }
  if (testId === 'coping-style') {
    return COPING_STYLE_ITEMS.map(item => ({ id: item.id, text: item.text }));
  }
  if (testId === 'trigger-pattern') {
    // For trigger pattern, return example questions as this uses narrative input
    const metadata = SCHEMA_TESTS[testId];
    return (metadata.exampleQuestions || []).map((text, idx) => ({
      id: `trigger_${idx}`,
      text
    }));
  }
  return [];
}

/**
 * Call Grok primary, fall back to Qwen with JSON parsing
 */
async function callGrokThenQwenJson<T>(
  testId: SchemaTestId,
  prompt: string,
  responseSchema?: any
): Promise<T> {
  try {
    // Try Grok 4.1 first
    const grokResponse = await callGrokPrimary(prompt);
    const cleanJson = grokResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson) as T;
  } catch (grokError) {
    console.warn(`[SchemaTherapyService] Grok 4.1 failed for ${testId}, falling back to Qwen:`, grokError);
    
    // Fallback to Qwen
    try {
      const qwenResponse = await callQwenFallback(prompt);
      const cleanJson = qwenResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (qwenError) {
      const grokMsg = String(grokError).substring(0, 100);
      const qwenMsg = String(qwenError).substring(0, 100);
      throw new Error(
        `[SchemaTherapyService] Both Grok (${grokMsg}) and Qwen (${qwenMsg}) failed for ${testId}`
      );
    }
  }
}

/**
 * Get item count for a test
 */
export function getTestItemCount(testId: SchemaTestId): number {
  if (testId === 'core-schema') return EMSA_90_ITEMS.length;
  if (testId === 'mode-identification') return SCHEMA_MODE_ITEMS.length;
  if (testId === 'coping-style') return COPING_STYLE_ITEMS.length;
  if (testId === 'trigger-pattern') return SCHEMA_TESTS[testId].exampleQuestions?.length || 5;
  return 0;
}

// ============================================================================
// EMSA Scoring Functions
// ============================================================================

/**
 * Calculate severity level based on schema score
 * @param score - Sum of 5 Likert items (range: 5-30)
 * @returns Severity level classification
 */
function calculateSeverityLevel(score: number): SchemaSeverityLevel {
  if (score <= 10) return 'None';
  if (score <= 14) return 'Low';
  if (score <= 20) return 'Medium';
  if (score <= 25) return 'High';
  return 'Very High';
}

/**
 * Get human-readable severity description
 */
function getSeverityDescription(severity: SchemaSeverityLevel): string {
  switch (severity) {
    case 'None':
      return 'Not Present';
    case 'Low':
      return 'Mild';
    case 'Medium':
      return 'Moderate';
    case 'High':
      return 'Strong';
    case 'Very High':
      return 'Very Strong';
  }
}

/**
 * Get human-readable domain label
 */
function getDomainLabel(domain: SchemaDomain): string {
  switch (domain) {
    case 'disconnection-rejection':
      return 'Disconnection & Rejection';
    case 'impaired-autonomy':
      return 'Impaired Autonomy & Performance';
    case 'impaired-limits':
      return 'Impaired Limits';
    case 'other-directedness':
      return 'Other-Directedness';
    case 'overvigilance-inhibition':
      return 'Overvigilance & Inhibition';
  }
}

/**
 * Calculate EMSA schema scores from Likert responses
 * @param answers - Array of SchemaTestResponse with numeric Likert values (1-6)
 * @returns Array of SchemaScore objects with calculated scores and interpretations
 */
export function calculateEMSAScores(answers: SchemaTestResponse[]): SchemaScore[] {
  // Group answers by schema
  const schemaAnswers = new Map<SchemaName, number[]>();
  
  EMSA_90_ITEMS.forEach((item) => {
    const answer = answers.find(a => a.questionId === item.id);
    if (answer && typeof answer.response === 'number') {
      const existing = schemaAnswers.get(item.schemaName) || [];
      existing.push(answer.response);
      schemaAnswers.set(item.schemaName, existing);
    }
  });

  // Calculate scores for each schema
  const scores: SchemaScore[] = [];
  
  schemaAnswers.forEach((responses, schemaName) => {
    // Sum the 5 Likert responses for this schema
    const score = responses.reduce((sum, val) => sum + val, 0);
    const severity = calculateSeverityLevel(score);
    const meetsThreshold = score >= 15;
    
    // Get domain for this schema
    const item = EMSA_90_ITEMS.find(i => i.schemaName === schemaName);
    const domain = item!.domain;

    // Get detailed info
    const schemaItems = EMSA_90_ITEMS.filter(i => i.schemaName === schemaName);
    const questionIds = schemaItems.map(i => i.id);
    
    // Build detailed responses
    const detailedResponses = schemaItems.map(item => {
      const answer = answers.find(a => a.questionId === item.id);
      return {
        questionId: item.id,
        questionText: item.text,
        response: (answer?.response as number) || 0
      };
    });

    // Calculate derived metrics
    const averageScore = score / 5;
    const normalizedScore = (score - 5) / (30 - 5); // 0-1 scale

    const interpretation = generateSchemaInterpretation(schemaName, severity, score);

    scores.push({
      schemaName,
      name: schemaName,
      domain,
      rawScore: score,
      score,
      normalizedScore,
      severity,
      meetsThreshold,
      isActive: meetsThreshold,
      interpretation,
      questionIds,
      responses: detailedResponses,
      averageScore,
      description: `Schema: ${schemaName}`, // Placeholder, ideal would be from metadata
      triggers: []
    });
  });

  return scores.sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Calculate domain-level aggregations from schema scores
 * @param schemaScores - Array of SchemaScore objects
 * @returns Array of DomainAnalysis objects with aggregated scores
 */
export function calculateDomainAnalyses(schemaScores: SchemaScore[]): DomainAnalysis[] {
  // Group scores by domain
  const domainGroups = new Map<SchemaDomain, SchemaScore[]>();
  
  schemaScores.forEach(score => {
    const existing = domainGroups.get(score.domain) || [];
    existing.push(score);
    domainGroups.set(score.domain, existing);
  });

  // Calculate domain analyses
  const analyses: DomainAnalysis[] = [];
  
  domainGroups.forEach((schemas, domain) => {
    const totalScore = schemas.reduce((sum, s) => sum + s.score, 0);
    const activeSchemas = schemas.filter(s => s.meetsThreshold);
    const dominantSchemas = activeSchemas.map(s => s.schemaName); // Use schemaName for correct type
    
    // Calculate additional metrics
    const maxPossibleScore = schemas.length * 30;
    const normalizedDomainScore = totalScore / maxPossibleScore;
    const aggregateScore = totalScore;
    
    // Determine dominant schema (highest score)
    const sortedSchemas = [...schemas].sort((a, b) => b.score - a.score);
    const dominantSchema = sortedSchemas[0].schemaName;
    
    // Determine domain severity
    const avgScore = totalScore / schemas.length;
    let domainSeverity: SchemaSeverity = 'None';
    if (avgScore > 10) domainSeverity = 'Low';
    if (avgScore > 14) domainSeverity = 'Medium';
    if (avgScore > 20) domainSeverity = 'High';
    if (avgScore > 25) domainSeverity = 'Very High';

    const prevalence = activeSchemas.length / schemas.length;

    let interpretation = `${getDomainLabel(domain)}: ${getSeverityDescription(domainSeverity)}. `;
    if (dominantSchemas.length === 0) {
      interpretation += 'No significant schemas detected in this domain.';
    } else {
      interpretation += `${dominantSchemas.length} schemas active.`;
    }

    analyses.push({
      domain,
      domainLabel: getDomainLabel(domain),
      totalScore,
      schemasInDomain: schemas,
      activeSchemas,
      aggregateScore,
      normalizedDomainScore,
      dominantSchema,
      dominantSchemas,
      domainSeverity,
      interpretation: interpretation,
      insights: [interpretation], // Minimal placeholder
      coreThemes: dominantSchemas, // Placeholder
      prevalence
    });
  });

  return analyses.sort((a, b) => b.totalScore - a.totalScore); // Sort by total score descending
}

// ============================================================================
// Core Service Functions
// ============================================================================

/**
 * Options for analyzing schema test responses
 */
export interface AnalyzeSchemaTestResponsesOptions {
  testId: SchemaTestId;
  answers: SchemaTestResponse[];
  narrative?: string;
  priorFindings?: SchemaUnifiedProfile | null;
  userId?: string | null;
}

/**
 * Analyze EMSA 90-item responses with structured scoring
 * 
 * Calculates schema scores, applies thresholds, generates domain analyses,
 * and uses LLM to provide narrative interpretation and recommendations.
 * 
 * @param options - Test analysis configuration
 * @returns Promise<SchemaTestResult> - Structured test results with EMSA scores
 * @throws Error with user-actionable message on failure
 */
async function analyzeEMSAResponses(
  options: AnalyzeSchemaTestResponsesOptions
): Promise<SchemaTestResult> {
  const { testId, answers, narrative, priorFindings, userId } = options;

  try {
    // Calculate EMSA scores
    const schemaScores = calculateEMSAScores(answers);
    const domainAnalyses = calculateDomainAnalyses(schemaScores);

    // Get schemas that meet threshold (≥15)
    const significantSchemas = schemaScores.filter(s => s.meetsThreshold);

    // Build context for LLM interpretation
    const scoresText = schemaScores
      .map(s => `${s.interpretation} ${s.meetsThreshold ? '✓ MEETS THRESHOLD' : ''}`)
      .join('\n');

    const domainText = domainAnalyses
      .map(d => `${d.interpretation} (Total: ${d.totalScore})`)
      .join('\n');

    const priorContext = priorFindings
      ? `\n\nPRIOR FINDINGS FROM OTHER TESTS:\n${JSON.stringify(priorFindings, null, 2)}`
      : '';

    const narrativeText = narrative
      ? `\n\nUSER'S ADDITIONAL NOTES:\n${narrative}`
      : '';

    // Generate LLM interpretation
    const prompt = `You are a Schema Therapy expert interpreting EMSA 90-item assessment results.

SCHEMA SCORES (18 schemas, scored 5-30 each):
${scoresText}

DOMAIN ANALYSES (5 domains):
${domainText}

SCHEMAS MEETING THRESHOLD (≥15):
${significantSchemas.length > 0 ? significantSchemas.map(s => `- ${s.interpretation}`).join('\n') : 'None'}
${narrativeText}${priorContext}

Your task is to provide a JSON object with interpretation and recommendations:

{
  "testId": "core-schema",
  "completedAt": "${new Date().toISOString()}",
  "keyInsights": [
    "Insight 1: Most prominent schemas and their patterns",
    "Insight 2: Domain-level patterns (which domains have most activation)",
    "Insight 3: Strengths or protective factors observed"
  ],
  "narrative": "A 2-3 paragraph narrative summary written in second person ('you') that:
  1) Highlights the schemas that meet threshold and what they mean
  2) Discusses domain patterns and how they might interact
  3) Acknowledges complexity and nuance
  4) Offers hope and direction for growth",
  "confidence": 0.85,
  "recommendedPractices": [
    {
      "practiceId": "practice-id-if-known",
      "practiceName": "Practice name",
      "rationale": "Why this practice addresses the schemas identified"
    }
  ],
  "recommendedMindTools": [
    {
      "toolName": "Mode Identification",
      "focus": "Understanding your schema modes",
      "reason": "Builds on core schema assessment to explore adaptive patterns"
    }
  ]
}

Be compassionate, specific, and actionable. Reference the actual scores in your narrative.
Return ONLY the JSON object, no other text.`;

    const llmResult = await callGrokThenQwenJson<Partial<SchemaTestResult>>(
      testId,
      prompt
    );

    // Build complete result with EMSA data
    const result: SchemaTestResult = {
      testId: 'core-schema',
      status: 'completed',
      responses: answers,
      responseCount: answers.length,
      completedAt: new Date().toISOString(),
      schemaScores,
      domainAnalyses,
      keyInsights: llmResult.keyInsights || [],
      narrative: llmResult.narrative || 'EMSA assessment completed. Review scores above.',
      confidence: llmResult.confidence || 0.9, // High confidence for standardized scoring
      recommendedPractices: llmResult.recommendedPractices || [],
      recommendedMindTools: llmResult.recommendedMindTools || [],
      userId: userId || null
    };

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SchemaTherapyService] analyzeEMSAResponses failed:', error);
    
    throw new Error(
      `Unable to analyze your EMSA responses. ${
        errorMessage.includes('network') || errorMessage.includes('fetch')
          ? 'Please check your internet connection and try again.'
          : 'There was an issue processing your scores. Please try again or contact support if the problem persists.'
      }`
    );
  }
}

/**
 * Analyze a single schema test's responses using LLM
 * 
 * Uses Grok 4.1 (primary) with Gemini fallback.
 * Returns structured SchemaTestResult with identified schemas/modes/coping/triggers.
 * 
 * @param options - Test analysis configuration
 * @returns Promise<SchemaTestResult> - Structured test results
 */
export async function analyzeSchemaTestResponses(
  options: AnalyzeSchemaTestResponsesOptions
): Promise<SchemaTestResult> {
  const { testId, answers, narrative, priorFindings, userId } = options;
  const testMetadata = SCHEMA_TESTS[testId];

  if (!testMetadata) {
    throw new Error(`Invalid test ID: ${testId}`);
  }

  if (!answers || answers.length === 0) {
    throw new Error('No answers provided for analysis. Please complete the test questions first.');
  }

  // Special handling for EMSA 90-item core-schema test
  if (testId === 'core-schema' && answers.length === 90) {
    return await analyzeEMSAResponses({ testId, answers, narrative, priorFindings, userId });
  }

  // Build the prompt
  const answersText = answers
    .map((a, i) => `Q${i + 1} (ID: ${a.questionId}): ${a.response}`)
    .join('\n');

  const priorContext = priorFindings
    ? `\n\nPRIOR FINDINGS FROM OTHER TESTS:\n${JSON.stringify(priorFindings, null, 2)}`
    : '';

  const narrativeText = narrative
    ? `\n\nUSER'S ADDITIONAL NARRATIVE:\n${narrative}`
    : '';

  const prompt = `You are a Schema Therapy expert analyzing a user's responses for the "${testMetadata.label}" assessment.

TEST FOCUS: ${testMetadata.promptFocus}

USER'S ANSWERS:
${answersText}${narrativeText}${priorContext}

Your task is to analyze these responses and return a JSON object with the following structure:

{
  "testId": "${testId}",
  "completedAt": "${new Date().toISOString()}",
  ${testId === 'core-schema' ? `"identifiedSchemas": [
    {
      "name": "schema-name",
      "domain": "domain-name",
      "confidence": 0.85,
      "description": "Brief description of how this schema manifests",
      "triggers": ["trigger 1", "trigger 2"],
      "emotionalResponses": ["emotion 1", "emotion 2"],
      "behavioralPatterns": ["pattern 1", "pattern 2"],
      "evidenceFromAnswers": ["evidence from Q1", "evidence from Q3"]
    }
  ],` : ''}
  ${testId === 'mode-identification' ? `"identifiedModes": [
    {
      "mode": "mode-name",
      "category": "child|coping|parent|healthy",
      "confidence": 0.80,
      "description": "How this mode manifests",
      "activationTriggers": ["trigger 1", "trigger 2"],
      "typicalBehaviors": ["behavior 1", "behavior 2"],
      "emotionalSignature": "Description of emotional experience",
      "evidenceFromAnswers": ["evidence 1", "evidence 2"]
    }
  ],` : ''}
  ${testId === 'coping-style' ? `"copingPatterns": [
    {
      "copingStyle": "surrender|avoidance|overcompensation",
      "confidence": 0.75,
      "description": "How this coping style is used",
      "manifestations": ["manifestation 1", "manifestation 2"],
      "schemasAssociated": ["schema-name-1", "schema-name-2"],
      "examples": ["example 1", "example 2"]
    }
  ],` : ''}
  ${testId === 'trigger-pattern' ? `"triggerPatterns": [
    {
      "trigger": "Specific triggering situation",
      "frequency": "rare|occasional|frequent|constant",
      "intensity": "low|medium|high|extreme",
      "typicalResponse": "How user typically responds",
      "associatedSchemas": ["schema-1", "schema-2"],
      "associatedModes": ["mode-1", "mode-2"],
      "copingStrategiesUsed": ["strategy 1", "strategy 2"]
    }
  ],` : ''}
  "keyInsights": [
    "Insight 1 about patterns observed",
    "Insight 2 about recurring themes",
    "Insight 3 about strengths or resources"
  ],
  "narrative": "A 2-3 paragraph narrative summary of findings, written in second person ('you'), that ties together the identified patterns and their impact on the user's life",
  "confidence": 0.80,
  "recommendedPractices": [
    {
      "practiceId": "practice-id-if-known-or-general-type",
      "practiceName": "Practice name",
      "rationale": "Why this practice would help"
    }
  ],
  "recommendedMindTools": [
    {
      "toolName": "Mind tool or wizard name",
      "focus": "What to focus on",
      "reason": "Why this tool would be helpful"
    }
  ]
}

Be specific and evidence-based. Reference the user's actual answers when making assessments. 
Confidence scores should reflect how clearly the pattern emerges from the data (0.0-1.0).
Provide actionable insights and compassionate, non-judgmental language.

Return ONLY the JSON object, no other text.`;

  try {
    const result = await callGrokThenQwenJson<SchemaTestResult>(
      testId,
      prompt
    );

    // Validate and normalize the result
    if (!result.testId || result.testId !== testId) {
      result.testId = testId;
    }

    if (!result.completedAt) {
      result.completedAt = new Date().toISOString();
    }

    if (!result.keyInsights) {
      result.keyInsights = [];
    }

    if (!result.narrative) {
      result.narrative = 'Analysis completed. Please review the detailed findings above.';
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      result.confidence = 0.7;
    }

    if (!result.recommendedPractices) {
      result.recommendedPractices = [];
    }

    if (!result.recommendedMindTools) {
      result.recommendedMindTools = [];
    }

    if (userId) {
      result.userId = userId;
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[SchemaTherapyService] analyzeSchemaTestResponses(${testId}) failed:`, error);
    
    throw new Error(
      `Unable to analyze your ${testMetadata.label} responses. ${
        errorMessage.includes('network') || errorMessage.includes('fetch')
          ? 'Please check your internet connection and try again.'
          : 'There was an issue processing your answers. Please try again or contact support if the problem persists.'
      }`
    );
  }
}

// ============================================================================
// Narrative Generation Helpers
// ============================================================================

export function generateEMSNarrative(
  schemaScores: SchemaScore[],
  domainAnalyses: DomainAnalysis[],
  activeSchemas: SchemaScore[]
): string {
  if (activeSchemas.length === 0) {
    return `Your Early Maladaptive Schema assessment shows no schemas currently meeting the activation threshold. This suggests you have relatively healthy emotional development in the areas measured by this assessment. While everyone has some schemas to varying degrees, yours appear to be at manageable levels that don't significantly disrupt your functioning.

It's worth noting that schemas can become activated during periods of stress, relationship transitions, or major life changes. Continuing to build awareness of your emotional patterns and maintaining healthy relationships can help prevent schema activation in the future.`;
  }

  const severityGroups = {
    'Very High': activeSchemas.filter(s => s.severity === 'Very High'),
    'High': activeSchemas.filter(s => s.severity === 'High'),
    'Medium': activeSchemas.filter(s => s.severity === 'Medium')
  };

  const domainSummary = domainAnalyses
    .filter(d => d.activeSchemas.length > 0)
    .map(d => `${d.domain.replace(/-/g, ' ')} (${d.activeSchemas.length} active)`)
    .join(', ');

  let narrative = `Your assessment reveals ${activeSchemas.length} active schemas across the following domains: ${domainSummary}. `;

  if (severityGroups['Very High'].length > 0) {
    narrative += `Schemas with Very High activation include: ${severityGroups['Very High'].map(s => s.schemaName).join(', ')}. These patterns likely have significant daily impact and would benefit from focused therapeutic attention. `;
  }

  if (severityGroups['High'].length > 0) {
    narrative += `High-severity schemas (${severityGroups['High'].map(s => s.schemaName).join(', ')}) also play a notable role in your emotional life. `;
  }

  const sortedActive = [...activeSchemas].sort((a, b) => b.rawScore - a.rawScore);
  if (sortedActive.length > 0) {
    const mostActive = sortedActive[0];
    narrative += `\n\nYour strongest schema is ${mostActive.schemaName} (score: ${mostActive.rawScore}/30). ${mostActive.interpretation} `;
  }

  const topDomain = [...domainAnalyses]
    .filter(d => d.activeSchemas.length > 0)
    .sort((a, b) => b.activeSchemas.length - a.activeSchemas.length)[0];
  
  if (topDomain) {
    narrative += `\n\nThe ${topDomain.domain.replace(/-/g, ' ')} domain shows the most schema activation. ${topDomain.interpretation} Common themes in this area include: ${topDomain.coreThemes.slice(0, 2).join('; ')}.`;
  }

  return narrative;
}

export function generateModeNarrative(profile: ModeProfile): string {
  let narrative = `Your Schema Mode assessment provides a comprehensive picture of the emotional states you tend to inhabit. `;

  narrative += `Your Healthy Adult mode is ${profile.healthyAdult.strengthLevel.toLowerCase()}. ${profile.healthyAdult.interpretation} `;

  if (profile.dominantMode && profile.dominantMode !== 'healthy-adult') {
    narrative += `\n\nYour most active mode overall is ${profile.dominantMode.replace(/-/g, ' ')}. `;
    const dominantScore = profile.scores.find(s => s.mode === profile.dominantMode);
    if (dominantScore) {
      narrative += `${dominantScore.interpretation} This mode activates in response to: ${dominantScore.typicalTriggers.slice(0, 2).join(', ')}. `;
    }
  }

  narrative += `\n\n${profile.childModes.interpretation} `;
  
  if (profile.copingModes.dominantCoping) {
    narrative += `${profile.copingModes.interpretation} `;
  }

  if (profile.parentModes.dominantParent) {
    narrative += `${profile.parentModes.interpretation} `;
  }

  narrative += `\n\n${profile.overallBalance}`;

  return narrative;
}

// ============================================================================
// Recommendation Helpers
// ============================================================================

export function generateEMSPracticeRecommendations(
  activeSchemas: SchemaScore[],
  domainAnalyses: DomainAnalysis[]
): Array<{ practiceId: string; practiceName: string; rationale: string }> {
  const recommendations: Array<{ practiceId: string; practiceName: string; rationale: string }> = [];

  // Domain-specific recommendations
  const activeDomains = domainAnalyses.filter(d => d.activeSchemas.length > 0);
  
  activeDomains.forEach(domain => {
    switch (domain.domain) {
      case 'disconnection-rejection':
        recommendations.push({
          practiceId: 'attachment-work',
          practiceName: 'Attachment-Focused Therapy or IFS Parts Work',
          rationale: 'Addresses abandonment, mistrust, and emotional deprivation schemas by reworking attachment patterns.'
        });
        break;
      case 'impaired-autonomy':
        recommendations.push({
          practiceId: 'autonomy-building',
          practiceName: 'Gradual Autonomy Building Exercises',
          rationale: 'Develops independence and competence through structured exposure to autonomous tasks.'
        });
        break;
      case 'impaired-limits':
        recommendations.push({
          practiceId: 'self-discipline',
          practiceName: 'Self-Discipline & Limit-Setting Practices',
          rationale: 'Builds internal structure and healthy boundaries through consistent practice.'
        });
        break;
      case 'other-directedness':
        recommendations.push({
          practiceId: 'assertiveness',
          practiceName: 'Assertiveness Training & Boundary Work',
          rationale: 'Helps balance self-care with caring for others through assertive communication.'
        });
        break;
      case 'overvigilance-inhibition':
        recommendations.push({
          practiceId: 'relaxation',
          practiceName: 'Mindfulness & Self-Compassion Practices',
          rationale: 'Reduces hypervigilance and self-criticism through mindful awareness and compassion.'
        });
        break;
    }
  });

  // General schema therapy practices
  recommendations.push({
    practiceId: 'imagery-rescripting',
    practiceName: 'Imagery Rescripting',
    rationale: 'Core schema therapy technique for healing childhood wounds and changing schema-driven patterns.'
  });

  return recommendations.slice(0, 5); // Return top 5
}

export function generateEMSMindToolRecommendations(
  activeSchemas: SchemaScore[]
): Array<{ toolName: string; focus: string; reason: string }> {
  const recommendations: Array<{ toolName: string; focus: string; reason: string }> = [];

  recommendations.push({
    toolName: 'IFS Wizard',
    focus: 'Parts work with schema-driven protective parts',
    reason: 'Internal Family Systems is highly compatible with schema therapy - identify parts carrying schemas.'
  });

  recommendations.push({
    toolName: 'Schema Mode Assessment',
    focus: 'Identify your active schema modes',
    reason: 'Complete the Mode assessment to understand which emotional states you shift between when schemas activate.'
  });

  recommendations.push({
    toolName: '3-2-1 Shadow Process',
    focus: 'Integrate disowned schema-driven behaviors',
    reason: 'Shadow work can help integrate aspects of self that schemas cause you to reject or disown.'
  });

  return recommendations;
}

export function generateModePracticeRecommendations(
  profile: ModeProfile
): Array<{ practiceId: string; practiceName: string; rationale: string }> {
  const recommendations: Array<{ practiceId: string; practiceName: string; rationale: string }> = [];

  // Healthy Adult development
  if (profile.healthyAdult.strengthLevel === 'Underdeveloped' || profile.healthyAdult.strengthLevel === 'Emerging') {
    recommendations.push({
      practiceId: 'healthy-adult-practice',
      practiceName: 'Healthy Adult Mode Strengthening',
      rationale: 'Daily practice of healthy adult behaviors: boundary-setting, self-nurturing, and assertive communication.'
    });
  }

  // Child mode work
  if (profile.childModes.dominantChild === 'vulnerable-child') {
    recommendations.push({
      practiceId: 'limited-reparenting',
      practiceName: 'Limited Reparenting / Inner Child Work',
      rationale: 'Use imagery to nurture and validate your vulnerable child mode, providing what was missing in childhood.'
    });
  }

  // Coping mode work
  if (profile.copingModes.dominantCoping === 'detached-protector') {
    recommendations.push({
      practiceId: 'experiential-techniques',
      practiceName: 'Experiential/Emotion-Focused Therapy Techniques',
      rationale: 'Gently challenge detachment by practicing staying present with emotions in safe, contained ways.'
    });
  } else if (profile.copingModes.dominantCoping === 'detached-self-soother') {
    recommendations.push({
      practiceId: 'addiction-recovery',
      practiceName: 'Healthy Coping Alternatives & Urge Surfing',
      rationale: 'Develop non-addictive ways to soothe yourself and practice mindfulness with urges.'
    });
  }

  // Parent mode work
  if (profile.parentModes.dominantParent === 'punitive-parent') {
    recommendations.push({
      practiceId: 'self-compassion',
      practiceName: 'Self-Compassion Training (Neff/Gilbert)',
      rationale: 'Directly counters the punitive parent with compassionate self-relating practices.'
    });
  } else if (profile.parentModes.dominantParent === 'demanding-parent') {
    recommendations.push({
      practiceId: 'rest-recovery',
      practiceName: 'Intentional Rest & Recovery Practices',
      rationale: 'Challenge the demanding parent by deliberately practicing rest, play, and self-care.'
    });
  }

  recommendations.push({
    practiceId: 'mode-awareness',
    practiceName: 'Mode Awareness & Tracking',
    rationale: 'Keep a daily mode diary to build awareness of which modes activate and what triggers them.'
  });

  return recommendations.slice(0, 5);
}

export function generateModeMindToolRecommendations(
  profile: ModeProfile
): Array<{ toolName: string; focus: string; reason: string }> {
  const recommendations: Array<{ toolName: string; focus: string; reason: string }> = [];

  recommendations.push({
    toolName: 'EMS Assessment',
    focus: 'Identify underlying schemas driving your modes',
    reason: 'Understanding which schemas fuel your modes provides deeper insight into the patterns.'
  });

  recommendations.push({
    toolName: 'IFS Wizard',
    focus: 'Work with parts that correspond to different modes',
    reason: 'IFS parts work complements schema mode work - modes and parts are similar concepts from different frameworks.'
  });

  if (profile.parentModes.scores.some(s => s.activationLevel === 'High' || s.activationLevel === 'Dominant')) {
    recommendations.push({
      toolName: 'Bias Detective',
      focus: 'Identify cognitive distortions in parent mode thinking',
      reason: 'Parent modes often use cognitive distortions - recognizing these can help challenge harsh internal voices.'
    });
  }

  return recommendations;
}

// ============================================================================
// Utility Helpers
// ============================================================================

function getDomainTriggers(domain: SchemaDomain): string[] {
  const triggers: Record<SchemaDomain, string[]> = {
    'disconnection-rejection': ['Relationship conflicts', 'Perceived rejection', 'Feeling unloved', 'Criticism'],
    'impaired-autonomy': ['Having to function independently', 'Making decisions alone', 'New challenges', 'Feeling unsupported'],
    'impaired-limits': ['Being told no', 'Facing consequences', 'Having to be disciplined', 'Needing to follow rules'],
    'other-directedness': ['Others being upset', 'Potential disapproval', 'Conflict', 'Having to assert own needs'],
    'overvigilance-inhibition': ['Relaxation or downtime', 'Making mistakes', 'Uncertainty', 'Positive emotions']
  };
  return triggers[domain];
}

function getDomainEmotions(domain: SchemaDomain): string[] {
  const emotions: Record<SchemaDomain, string[]> = {
    'disconnection-rejection': ['Fear', 'Anxiety', 'Sadness', 'Loneliness', 'Shame'],
    'impaired-autonomy': ['Anxiety', 'Fear', 'Helplessness', 'Dependence'],
    'impaired-limits': ['Frustration', 'Entitlement', 'Anger when constrained', 'Restlessness'],
    'other-directedness': ['Guilt', 'Anxiety about disapproval', 'Resentment', 'Self-neglect'],
    'overvigilance-inhibition': ['Tension', 'Worry', 'Shame', 'Emotional constriction', 'Pessimism']
  };
  return emotions[domain];
}

function getDomainBehaviors(domain: SchemaDomain): string[] {
  const behaviors: Record<SchemaDomain, string[]> = {
    'disconnection-rejection': ['Clinging', 'Testing relationships', 'Withdrawing', 'Seeking reassurance excessively'],
    'impaired-autonomy': ['Seeking help unnecessarily', 'Avoiding challenges', 'Over-relying on others', 'Excessive caution'],
    'impaired-limits': ['Acting entitled', 'Breaking rules', 'Being impulsive', 'Lacking follow-through'],
    'other-directedness': ['Over-giving', 'Suppressing own needs', 'People-pleasing', 'Avoiding conflict'],
    'overvigilance-inhibition': ['Perfectionism', 'Over-control', 'Emotional suppression', 'Worrying excessively']
  };
  return behaviors[domain];
}

function getEmotionalSignature(mode: SchemaMode): string {
  const signatures: Record<SchemaMode, string> = {
    'vulnerable-child': 'Feeling small, helpless, anxious, sad, or needy',
    'angry-child': 'Feeling rage, frustration, or intense anger',
    'impulsive-child': 'Feeling restless, excitement-seeking, or impulsive',
    'undisciplined-child': 'Feeling lazy, unmotivated, or resistance to effort',
    'happy-child': 'Feeling joyful, playful, spontaneous, and content',
    'compliant-surrender': 'Feeling submissive, powerless, or resigned',
    'detached-protector': 'Feeling numb, empty, or emotionally shut down',
    'detached-self-soother': 'Using addictive behaviors to avoid feelings',
    'self-aggrandizer': 'Feeling superior, special, or entitled',
    'bully-attack': 'Feeling aggressive, hostile, or attacking',
    'punitive-parent': 'Feeling self-hatred, shame, or harsh self-criticism',
    'demanding-parent': 'Feeling pressure, guilt about rest, or never good enough',
    'healthy-adult': 'Feeling balanced, capable, compassionate, and grounded'
  };
  return signatures[mode];
}

// ============================================================================
// Synthesis Functions (for unified profile - remains LLM-based)
// ============================================================================

/**
 * Options for synthesizing unified schema profile
 */
export interface SynthesizeSchemaProfileOptions {
  userId?: string | null;
  completedTests: SchemaTestId[];
  testResults: Record<SchemaTestId, SchemaTestResult>;
}

/**
 * Synthesize a unified schema profile from multiple completed tests
 * 
 * Requires at least 2 completed tests. Uses Grok 4.1 primary with Gemini fallback.
 * Returns SchemaUnifiedProfile with cross-test synthesis and recommendations.
 * 
 * @param options - Profile synthesis configuration
 * @returns Promise<SchemaUnifiedProfile> - Synthesized unified profile
 * @throws Error if insufficient tests or analysis fails
 */
export async function synthesizeSchemaProfile(
  options: SynthesizeSchemaProfileOptions
): Promise<SchemaUnifiedProfile> {
  const { userId, completedTests, testResults } = options;

  // Validate sufficient data
  if (completedTests.length < 2) {
    return {
      userId: userId || null,
      generatedAt: new Date().toISOString(),
      insufficientTests: true,
      testsIncluded: completedTests,
      dominantSchemas: [],
      dominantModes: [],
      primaryCopingStyles: [],
      recurringThemes: [],
      coreVulnerabilities: [],
      strengths: [],
      topTriggers: [],
      priorityInterventions: [],
      developmentalFocus: 'Complete at least 2 schema tests to receive a synthesized profile.',
      synthesisNarrative: 'Please complete additional schema assessments to generate a comprehensive unified profile.',
      confidence: 0.0
    };
  }

  // Build comprehensive context from all test results
  const testSummaries = completedTests
    .map(testId => {
      const result = testResults[testId];
      const meta = SCHEMA_TESTS[testId];
      return `
=== ${meta.label} (${testId}) ===
Completed: ${result.completedAt}
Confidence: ${result.confidence}

Key Insights:
${result.keyInsights.map(insight => `- ${insight}`).join('\n')}

Narrative:
${result.narrative}

${result.identifiedSchemas ? `Identified Schemas:
${JSON.stringify(result.identifiedSchemas, null, 2)}` : ''}

${result.identifiedModes ? `Identified Modes:
${JSON.stringify(result.identifiedModes, null, 2)}` : ''}

${result.copingPatterns ? `Coping Patterns:
${JSON.stringify(result.copingPatterns, null, 2)}` : ''}

${result.triggerPatterns ? `Trigger Patterns:
${JSON.stringify(result.triggerPatterns, null, 2)}` : ''}

Recommended Practices:
${result.recommendedPractices.map(p => `- ${p.practiceName}: ${p.rationale}`).join('\n')}

Recommended Mind Tools:
${result.recommendedMindTools.map(t => `- ${t.toolName} (${t.focus}): ${t.reason}`).join('\n')}
`;
    })
    .join('\n\n');

  // Check if all 4 tests are complete for enriched synthesis
  const allTestsComplete = completedTests.length === 4;
  
  const enrichedFields = allTestsComplete ? `
  "integratedSentence": "A single sentence summarizing how the top schema manifests as the dominant mode in response to triggers. Template: 'Your [schema name] schema manifests as [mode name] when [trigger context], leading you to [typical outcome].'",
  "somaticMap": [
    {
      "bodyRegion": "chest|throat|stomach|shoulders|jaw|head|back|limbs",
      "sensation": "tightness|heaviness|constriction|emptiness|pressure|tingling|numbness",
      "linkedSchemas": ["schema-1", "schema-2"]
    }
  ],
  "historicalOrigins": [
    {
      "schema": "schema-name",
      "likelyOrigin": "Specific childhood pattern or experience that likely formed this schema",
      "evidence": "Evidence from user's responses that points to this origin"
    }
  ],
  "copingFlexibilityScore": 65,
  "copingFlexibilityRationale": "Assessment of how adaptable user's coping strategies are. Higher score = more flexibility. Consider: do they use multiple coping styles appropriately, or rigidly stick to one?",
  "schemaToModeTriggerFlows": [
    {
      "schema": "schema-name",
      "triggeredModes": ["mode-1", "mode-2"],
      "commonTriggers": ["trigger situation 1", "trigger situation 2"],
      "typicalOutcome": "What usually happens when this pattern activates"
    }
  ],` : '';

  const prompt = `You are a Schema Therapy expert synthesizing a unified profile from multiple assessments.

The user has completed ${completedTests.length} schema tests. Your task is to identify patterns that emerge across these tests and create a coherent, actionable unified profile.

${allTestsComplete ? 'ALL 4 TESTS COMPLETE: Include enriched synthesis data (integratedSentence, somaticMap, historicalOrigins, copingFlexibilityScore, schemaToModeTriggerFlows).' : 'Partial assessment: Focus on available data.'}

TEST RESULTS:
${testSummaries}

Create a JSON object with the following structure:

{
  "userId": ${userId ? `"${userId}"` : 'null'},
  "generatedAt": "${new Date().toISOString()}",
  "testsIncluded": ${JSON.stringify(completedTests)},${enrichedFields}
  "dominantSchemas": [
    {
      "schema": "schema-name",
      "domain": "domain-name",
      "strength": 0.85,
      "description": "How this schema shows up",
      "howItManifests": ["manifestation 1", "manifestation 2"]
    }
  ],
  "dominantModes": [
    {
      "mode": "mode-name",
      "category": "child|coping|parent|healthy",
      "frequency": "Frequent|Occasional|Rare",
      "description": "When and how this mode activates"
    }
  ],
  "primaryCopingStyles": [
    {
      "style": "surrender|avoidance|overcompensation",
      "prevalence": 0.70,
      "whenUsed": "Situations where this coping style is used"
    }
  ],
  "recurringThemes": [
    "Theme 1 that appears across multiple tests",
    "Theme 2 showing consistent pattern"
  ],
  "coreVulnerabilities": [
    "Vulnerability 1",
    "Vulnerability 2"
  ],
  "strengths": [
    "Strength or resource 1",
    "Strength or resource 2"
  ],
  "topTriggers": [
    {
      "trigger": "Specific trigger",
      "impact": "How it affects the person",
      "linkedSchemas": ["schema-1", "schema-2"]
    }
  ],
  "priorityInterventions": [
    {
      "type": "practice|wizard|technique",
      "name": "Intervention name",
      "rationale": "Why this is priority",
      "expectedImpact": "What this will help with"
    }
  ],
  "developmentalFocus": "Overall guidance on what to focus on for growth",
  "synthesisNarrative": "A 3-4 paragraph narrative synthesizing all findings, written in second person, that tells a coherent story of the person's schema patterns",
  "confidence": 0.85
}

Focus on:
- Patterns that appear across multiple tests (higher confidence)
- How schemas, modes, and coping styles interact
- Actionable developmental priorities
- Compassionate, non-pathologizing language
- Strengths and resources, not just problems

Return ONLY the JSON object, no other text.`;

  try {
    const result = await callGrokThenQwenJson<SchemaUnifiedProfile>(
      // @ts-ignore - 'synthesis' is not in SchemaTestId union
      'synthesis',
      prompt
    );

    // Validation and normalization
    if (!result.generatedAt) {
      result.generatedAt = new Date().toISOString();
    }

    if (!result.testsIncluded) {
      result.testsIncluded = completedTests;
    }

    if (!result.dominantSchemas) result.dominantSchemas = [];
    if (!result.dominantModes) result.dominantModes = [];
    if (!result.primaryCopingStyles) result.primaryCopingStyles = [];
    if (!result.recurringThemes) result.recurringThemes = [];
    if (!result.coreVulnerabilities) result.coreVulnerabilities = [];
    if (!result.strengths) result.strengths = [];
    if (!result.topTriggers) result.topTriggers = [];
    if (!result.priorityInterventions) result.priorityInterventions = [];

    if (!result.developmentalFocus) {
      result.developmentalFocus = 'Focus on understanding your schema patterns and developing healthier responses.';
    }

    if (!result.synthesisNarrative) {
      result.synthesisNarrative = 'Your schema profile shows patterns across multiple assessments. Review the detailed findings for specific insights.';
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      result.confidence = 0.75;
    }

    if (userId) {
      result.userId = userId;
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SchemaTherapyService] synthesizeSchemaProfile() failed:', error);
    
    throw new Error(
      `Unable to synthesize your schema profile. ${
        errorMessage.includes('network') || errorMessage.includes('fetch')
          ? 'Please check your internet connection and try again.'
          : 'There was an issue processing your data. Please try again or contact support if the problem persists.'
      }`
    );
  }
}
