/**
 * Schema Therapy Assessment Items (REDUCED)
 *
 * Optimized item bank for the Schema Detective assessments based on Young's Schema Therapy.
 * Reduced to 200 total items across 4 assessments (max 50 per test):
 * - Core Schema Assessment (YSQ-S3): 50 items covering 18 schemas (2-3 per schema)
 * - Mode Identification: 50 items covering 13 modes
 * - Coping Style Assessment: 50 items covering 3 coping styles
 * - Trigger Pattern Analysis: 50 items covering 5 trigger categories
 *
 * Each item uses a 6-point Likert scale:
 * 1 = Completely untrue of me
 * 2 = Mostly untrue of me
 * 3 = Slightly more true than untrue
 * 4 = Moderately true of me
 * 5 = Mostly true of me
 * 6 = Describes me perfectly
 *
 * SCORING ADJUSTMENTS:
 * - Core Schema: Threshold reduced from 15 to 10 (per 3 items instead of 5)
 * - Mode: Thresholds adjusted per mode based on new item counts
 * - Coping: Thresholds adjusted proportionally
 * - Trigger: Thresholds adjusted per category
 */

import { SchemaTestId, SchemaName, SchemaMode, CopingStyle } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface SchemaItem {
  id: string;
  text: string;
  schema: SchemaName;
  reverseScored?: boolean;
}

export interface ModeItem {
  id: string;
  text: string;
  mode: SchemaMode;
  reverseScored?: boolean;
}

export interface CopingItem {
  id: string;
  text: string;
  copingStyle: CopingStyle;
  associatedSchema?: SchemaName;
  reverseScored?: boolean;
}

export interface TriggerItem {
  id: string;
  text: string;
  category: 'interpersonal' | 'performance' | 'intimacy' | 'autonomy' | 'rejection' | 'control';
  reverseScored?: boolean;
}

export interface SchemaTestItems {
  testId: SchemaTestId;
  label: string;
  instructions: string;
  likertLegend: Array<{ value: number; label: string }>;
  items: SchemaItem[] | ModeItem[] | CopingItem[] | TriggerItem[];
  batchSize?: number;
}

// ============================================================================
// Likert Scale Legend (used by all tests)
// ============================================================================

export const LIKERT_SCALE = [
  { value: 1, label: 'Completely untrue' },
  { value: 2, label: 'Mostly untrue' },
  { value: 3, label: 'Slightly true' },
  { value: 4, label: 'Moderately true' },
  { value: 5, label: 'Mostly true' },
  { value: 6, label: 'Perfectly describes me' }
];

// ============================================================================
// Core Schema Assessment (YSQ-S3) - 50 items (reduced from 90)
// 3 items per schema × 18 schemas (plus adjustments = 50 total)
// ============================================================================

const CORE_SCHEMA_ITEMS: SchemaItem[] = [
  // Abandonment (3 items - keep 1, 3, 5)
  { id: 'ems_1', text: 'I worry that people I feel close to will leave me or abandon me.', schema: 'abandonment' },
  { id: 'ems_3', text: 'I worry that people I love will die soon, even when they are healthy.', schema: 'abandonment' },
  { id: 'ems_5', text: 'I am desperate to keep people from leaving me.', schema: 'abandonment' },

  // Mistrust/Abuse (3 items - keep 6, 8, 9)
  { id: 'ems_6', text: 'I feel that people will take advantage of me.', schema: 'mistrust-abuse' },
  { id: 'ems_8', text: 'I am suspicious of other people\'s intentions.', schema: 'mistrust-abuse' },
  { id: 'ems_9', text: 'I\'m usually on the lookout for people\'s ulterior motives.', schema: 'mistrust-abuse' },

  // Emotional Deprivation (3 items - keep 11, 13, 15)
  { id: 'ems_11', text: 'I haven\'t had one person who really loves me, or has been there for me.', schema: 'emotional-deprivation' },
  { id: 'ems_13', text: 'For much of my life, I haven\'t felt that I am special to someone.', schema: 'emotional-deprivation' },
  { id: 'ems_15', text: 'Most of the time, I have not had someone to really listen to me, understand me, or be sensitive to my needs.', schema: 'emotional-deprivation' },

  // Defectiveness/Shame (3 items - keep 16, 18, 20)
  { id: 'ems_16', text: 'I am fundamentally different from other people.', schema: 'defectiveness-shame' },
  { id: 'ems_18', text: 'I am inherently flawed and defective.', schema: 'defectiveness-shame' },
  { id: 'ems_20', text: 'I am too unacceptable in very basic ways to reveal myself to other people.', schema: 'defectiveness-shame' },

  // Social Isolation (3 items - keep 21, 23, 25)
  { id: 'ems_21', text: 'I don\'t fit in.', schema: 'social-isolation' },
  { id: 'ems_23', text: 'I don\'t belong; I\'m a loner.', schema: 'social-isolation' },
  { id: 'ems_25', text: 'I feel isolated and alone.', schema: 'social-isolation' },

  // Dependence/Incompetence (3 items - keep 26, 28, 30)
  { id: 'ems_26', text: 'I can\'t cope well by myself.', schema: 'dependence-incompetence' },
  { id: 'ems_28', text: 'I can\'t handle things on my own.', schema: 'dependence-incompetence' },
  { id: 'ems_30', text: 'My judgment cannot be relied upon in everyday situations.', schema: 'dependence-incompetence' },

  // Vulnerability to Harm or Illness (3 items - keep 31, 33, 35)
  { id: 'ems_31', text: 'I can\'t escape the feeling that something bad is about to happen.', schema: 'vulnerability' },
  { id: 'ems_33', text: 'I worry that I\'ll lose all my money and become destitute or very poor.', schema: 'vulnerability' },
  { id: 'ems_35', text: 'I am a fearful person.', schema: 'vulnerability' },

  // Enmeshment (3 items - keep 36, 38, 40)
  { id: 'ems_36', text: 'My parent(s) and I tend to be overinvolved in each other\'s lives and problems.', schema: 'enmeshment' },
  { id: 'ems_38', text: 'My parent(s) and I have to speak to each other almost every day, or else one of us feels guilty, hurt, disappointed, or alone.', schema: 'enmeshment' },
  { id: 'ems_40', text: 'I often feel that I do not have a separate identity from my parent(s) or partner.', schema: 'enmeshment' },

  // Failure (3 items - keep 41, 43, 45)
  { id: 'ems_41', text: 'I am incompetent when it comes to achievement.', schema: 'failure' },
  { id: 'ems_43', text: 'I\'m not as talented as most people are at their work.', schema: 'failure' },
  { id: 'ems_45', text: 'I am humiliated by my failures and inadequacies in the work sphere.', schema: 'failure' },

  // Entitlement/Grandiosity (3 items - keep 46, 48, 50)
  { id: 'ems_46', text: 'I feel that I shouldn\'t have to follow the normal rules and conventions other people do.', schema: 'entitlement-grandiosity' },
  { id: 'ems_48', text: 'I usually put my needs ahead of the needs of others.', schema: 'entitlement-grandiosity' },
  { id: 'ems_50', text: 'I\'m special and shouldn\'t have to accept many of the restrictions placed on other people.', schema: 'entitlement-grandiosity' },

  // Insufficient Self-Control (3 items - keep 51, 53, 55)
  { id: 'ems_51', text: 'I have a lot of trouble getting myself to do boring tasks.', schema: 'insufficient-self-control' },
  { id: 'ems_53', text: 'I have rarely been able to stick to my resolutions.', schema: 'insufficient-self-control' },
  { id: 'ems_55', text: 'I have a very difficult time sacrificing immediate gratification to achieve a long-range goal.', schema: 'insufficient-self-control' },

  // Subjugation (3 items - keep 56, 58, 60)
  { id: 'ems_56', text: 'I let other people have their way because I fear the consequences.', schema: 'subjugation' },
  { id: 'ems_58', text: 'In relationships, I let the other person have the upper hand.', schema: 'subjugation' },
  { id: 'ems_60', text: 'I feel the major decisions in my life were not really my own.', schema: 'subjugation' },

  // Self-Sacrifice (3 items - keep 61, 63, 65)
  { id: 'ems_61', text: 'I\'m the one who usually ends up taking care of the people I\'m close to.', schema: 'self-sacrifice' },
  { id: 'ems_63', text: 'At work, I\'m usually the one to volunteer to do extra tasks or to put in extra time.', schema: 'self-sacrifice' },
  { id: 'ems_65', text: 'I can get by on very little, because my needs are minimal.', schema: 'self-sacrifice' },

  // Approval-Seeking (2 items - keep 67, 68)
  { id: 'ems_67', text: 'Impressing others is a major goal in my life.', schema: 'approval-seeking' },
  { id: 'ems_68', text: 'I often make decisions based on what other people will think, rather than what I really want.', schema: 'approval-seeking' },

  // Negativity/Pessimism (3 items - keep 71, 73, 75)
  { id: 'ems_71', text: 'Even when things seem to be going well, I feel that it is only temporary.', schema: 'negativity-pessimism' },
  { id: 'ems_73', text: 'You can\'t be too careful; something will almost always go wrong.', schema: 'negativity-pessimism' },
  { id: 'ems_75', text: 'I usually anticipate the worst.', schema: 'negativity-pessimism' },

  // Emotional Inhibition (2 items - keep 76, 80)
  { id: 'ems_76', text: 'I control myself so much that people think I am unemotional.', schema: 'emotional-inhibition' },
  { id: 'ems_80', text: 'I find it hard to be warm and spontaneous.', schema: 'emotional-inhibition' },

  // Unrelenting Standards (2 items - keep 81, 84)
  { id: 'ems_81', text: 'I must be the best at most of what I do; I can\'t accept second best.', schema: 'unrelenting-standards' },
  { id: 'ems_84', text: 'I feel there is constant pressure for me to achieve and get things done.', schema: 'unrelenting-standards' },

  // Punitiveness (2 items - keep 86, 88)
  { id: 'ems_86', text: 'I tend to get very angry when people don\'t do what I think they should do.', schema: 'punitiveness' },
  { id: 'ems_88', text: 'If I make a mistake, I deserve to be punished.', schema: 'punitiveness' }
];

// ============================================================================
// Mode Identification Assessment - 50 items (reduced from 124)
// Strategic selection of 3-4 most representative items per mode
// ============================================================================

const MODE_IDENTIFICATION_ITEMS: ModeItem[] = [
  // Vulnerable Child (4 items - keep 1, 3, 5, 10)
  { id: 'mode_1', text: 'I feel small, helpless, and powerless.', mode: 'vulnerable-child' },
  { id: 'mode_3', text: 'I feel lonely and isolated, like nobody cares about me.', mode: 'vulnerable-child' },
  { id: 'mode_5', text: 'I feel abandoned and alone.', mode: 'vulnerable-child' },
  { id: 'mode_10', text: 'I feel desperate for affection and reassurance.', mode: 'vulnerable-child' },

  // Angry Child (4 items - keep 11, 13, 15, 17)
  { id: 'mode_11', text: 'I feel furious and want to attack or destroy something.', mode: 'angry-child' },
  { id: 'mode_13', text: 'I want to scream, yell, or break things.', mode: 'angry-child' },
  { id: 'mode_15', text: 'I feel resentful and want revenge.', mode: 'angry-child' },
  { id: 'mode_17', text: 'I feel like I want to hurt someone who has hurt me.', mode: 'angry-child' },

  // Impulsive Child (3 items - keep 21, 24, 28)
  { id: 'mode_21', text: 'I act on my impulses without thinking about consequences.', mode: 'impulsive-child' },
  { id: 'mode_24', text: 'I seek immediate pleasure or excitement.', mode: 'impulsive-child' },
  { id: 'mode_28', text: 'I make rash decisions that cause problems later.', mode: 'impulsive-child' },

  // Undisciplined Child (3 items - keep 29, 32, 36)
  { id: 'mode_29', text: 'I can\'t force myself to do boring or routine tasks.', mode: 'undisciplined-child' },
  { id: 'mode_32', text: 'I lack the self-discipline to finish what I start.', mode: 'undisciplined-child' },
  { id: 'mode_36', text: 'I do only what I feel like doing in the moment.', mode: 'undisciplined-child' },

  // Happy Child (3 items - keep 37, 40, 43)
  { id: 'mode_37', text: 'I feel joyful and carefree.', mode: 'happy-child' },
  { id: 'mode_40', text: 'I feel optimistic and hopeful about life.', mode: 'happy-child' },
  { id: 'mode_43', text: 'I feel energized and alive.', mode: 'happy-child' },

  // Compliant Surrender (4 items - keep 45, 48, 51, 54)
  { id: 'mode_45', text: 'I act passive and submissive around others.', mode: 'compliant-surrender' },
  { id: 'mode_48', text: 'I let others make decisions for me.', mode: 'compliant-surrender' },
  { id: 'mode_51', text: 'I feel I have no voice or choice in my life.', mode: 'compliant-surrender' },
  { id: 'mode_54', text: 'I feel resigned to accepting less than I want.', mode: 'compliant-surrender' },

  // Detached Protector (4 items - keep 55, 58, 61, 66)
  { id: 'mode_55', text: 'I cut myself off emotionally and feel numb.', mode: 'detached-protector' },
  { id: 'mode_58', text: 'I feel disconnected from my emotions.', mode: 'detached-protector' },
  { id: 'mode_61', text: 'I feel emotionally dead or empty inside.', mode: 'detached-protector' },
  { id: 'mode_66', text: 'I act like things don\'t bother me even when they do.', mode: 'detached-protector' },

  // Detached Self-Soother (3 items - keep 67, 70, 76)
  { id: 'mode_67', text: 'I use substances (alcohol, drugs) to numb my feelings.', mode: 'detached-self-soother' },
  { id: 'mode_70', text: 'I watch TV or use screens excessively to avoid reality.', mode: 'detached-self-soother' },
  { id: 'mode_76', text: 'I can\'t relax without using substances or compulsive activities.', mode: 'detached-self-soother' },

  // Self-Aggrandizer (3 items - keep 77, 80, 85)
  { id: 'mode_77', text: 'I act superior and look down on others.', mode: 'self-aggrandizer' },
  { id: 'mode_80', text: 'I feel entitled to have things my way.', mode: 'self-aggrandizer' },
  { id: 'mode_85', text: 'I act arrogant or self-centered.', mode: 'self-aggrandizer' },

  // Bully and Attack (3 items - keep 88, 90, 94)
  { id: 'mode_88', text: 'I attack others verbally when I\'m angry.', mode: 'bully-attack' },
  { id: 'mode_90', text: 'I act aggressive and controlling.', mode: 'bully-attack' },
  { id: 'mode_94', text: 'I can be cruel or vindictive when crossed.', mode: 'bully-attack' },

  // Punitive Parent (4 items - keep 97, 100, 105, 109)
  { id: 'mode_97', text: 'I am extremely harsh and critical of myself.', mode: 'punitive-parent' },
  { id: 'mode_100', text: 'I blame myself for everything that goes wrong.', mode: 'punitive-parent' },
  { id: 'mode_105', text: 'I feel I don\'t deserve happiness or good things.', mode: 'punitive-parent' },
  { id: 'mode_109', text: 'I believe I\'m fundamentally bad or evil.', mode: 'punitive-parent' },

  // Demanding Parent (3 items - keep 111, 115, 119)
  { id: 'mode_111', text: 'I push myself relentlessly to meet impossibly high standards.', mode: 'demanding-parent' },
  { id: 'mode_115', text: 'I feel constant pressure to perform and excel.', mode: 'demanding-parent' },
  { id: 'mode_119', text: 'I should be able to do everything perfectly without help.', mode: 'demanding-parent' },

  // Healthy Adult (2 items - keep 121, 123)
  { id: 'mode_121', text: 'I can identify and meet my needs in a balanced way.', mode: 'healthy-adult' },
  { id: 'mode_123', text: 'I can regulate my emotions and respond thoughtfully rather than react impulsively.', mode: 'healthy-adult' }
];

// ============================================================================
// Coping Style Assessment - 50 items (reduced from 90)
// ~17 items per coping style, selecting most distinctive
// ============================================================================

const COPING_STYLE_ITEMS: CopingItem[] = [
  // Surrender Coping (17 items - keep odd numbers + selected evens)
  { id: 'cope_1', text: 'When I feel abandoned, I become clingy and desperate.', copingStyle: 'surrender', associatedSchema: 'abandonment' },
  { id: 'cope_2', text: 'I accept that people will eventually leave me.', copingStyle: 'surrender', associatedSchema: 'abandonment' },
  { id: 'cope_4', text: 'I expect to be hurt or betrayed, and I\'m rarely surprised when it happens.', copingStyle: 'surrender', associatedSchema: 'mistrust-abuse' },
  { id: 'cope_6', text: 'I accept that no one will ever really love me.', copingStyle: 'surrender', associatedSchema: 'emotional-deprivation' },
  { id: 'cope_8', text: 'I accept that I\'m defective and unlovable.', copingStyle: 'surrender', associatedSchema: 'defectiveness-shame' },
  { id: 'cope_10', text: 'I accept that I don\'t fit in anywhere.', copingStyle: 'surrender', associatedSchema: 'social-isolation' },
  { id: 'cope_12', text: 'I rely on others to take care of me because I can\'t do it myself.', copingStyle: 'surrender', associatedSchema: 'dependence-incompetence' },
  { id: 'cope_14', text: 'I constantly worry about disasters and let that control my life.', copingStyle: 'surrender', associatedSchema: 'vulnerability' },
  { id: 'cope_16', text: 'I let my parent(s) control my life because I need them.', copingStyle: 'surrender', associatedSchema: 'enmeshment' },
  { id: 'cope_18', text: 'I accept that I\'m incompetent and will always fail.', copingStyle: 'surrender', associatedSchema: 'failure' },
  { id: 'cope_22', text: 'I let others dominate me and make my decisions.', copingStyle: 'surrender', associatedSchema: 'subjugation' },
  { id: 'cope_24', text: 'I put everyone else\'s needs before mine, even when it hurts me.', copingStyle: 'surrender', associatedSchema: 'self-sacrifice' },
  { id: 'cope_26', text: 'I constantly seek approval and validation from others.', copingStyle: 'surrender', associatedSchema: 'approval-seeking' },
  { id: 'cope_28', text: 'I expect the worst outcome in every situation.', copingStyle: 'surrender', associatedSchema: 'negativity-pessimism' },
  { id: 'cope_30', text: 'I accept that I\'m cold and unemotional; that\'s just who I am.', copingStyle: 'surrender', associatedSchema: 'emotional-inhibition' },
  { id: 'cope_20', text: 'I give up on my goals when they become difficult.', copingStyle: 'surrender', associatedSchema: 'insufficient-self-control' },
  { id: 'cope_3', text: 'I choose partners who are distant or unavailable.', copingStyle: 'surrender', associatedSchema: 'abandonment' },

  // Avoidance Coping (17 items - keep odd + selected evens)
  { id: 'cope_31', text: 'I avoid close relationships to prevent being abandoned.', copingStyle: 'avoidance', associatedSchema: 'abandonment' },
  { id: 'cope_33', text: 'I avoid trusting anyone to protect myself from betrayal.', copingStyle: 'avoidance', associatedSchema: 'mistrust-abuse' },
  { id: 'cope_35', text: 'I avoid situations where I might need emotional support.', copingStyle: 'avoidance', associatedSchema: 'emotional-deprivation' },
  { id: 'cope_37', text: 'I avoid intimacy so no one will discover my flaws.', copingStyle: 'avoidance', associatedSchema: 'defectiveness-shame' },
  { id: 'cope_39', text: 'I avoid social situations to prevent feeling excluded.', copingStyle: 'avoidance', associatedSchema: 'social-isolation' },
  { id: 'cope_41', text: 'I avoid making decisions independently to prevent mistakes.', copingStyle: 'avoidance', associatedSchema: 'dependence-incompetence' },
  { id: 'cope_43', text: 'I avoid anything that feels risky or uncertain.', copingStyle: 'avoidance', associatedSchema: 'vulnerability' },
  { id: 'cope_45', text: 'I avoid separating from my parent(s) or becoming too independent.', copingStyle: 'avoidance', associatedSchema: 'enmeshment' },
  { id: 'cope_47', text: 'I avoid challenging tasks to prevent failure.', copingStyle: 'avoidance', associatedSchema: 'failure' },
  { id: 'cope_51', text: 'I avoid conflict by never expressing my needs or opinions.', copingStyle: 'avoidance', associatedSchema: 'subjugation' },
  { id: 'cope_53', text: 'I avoid asking for help because I don\'t want to burden others.', copingStyle: 'avoidance', associatedSchema: 'self-sacrifice' },
  { id: 'cope_55', text: 'I avoid situations where I might be judged or criticized.', copingStyle: 'avoidance', associatedSchema: 'approval-seeking' },
  { id: 'cope_57', text: 'I avoid hoping for good outcomes to protect myself from disappointment.', copingStyle: 'avoidance', associatedSchema: 'negativity-pessimism' },
  { id: 'cope_59', text: 'I avoid expressing emotions to stay in control.', copingStyle: 'avoidance', associatedSchema: 'emotional-inhibition' },
  { id: 'cope_32', text: 'I keep people at a distance so they can\'t hurt me.', copingStyle: 'avoidance', associatedSchema: 'abandonment' },
  { id: 'cope_42', text: 'I stay dependent on others to avoid having to be responsible.', copingStyle: 'avoidance', associatedSchema: 'dependence-incompetence' },
  { id: 'cope_60', text: 'I suppress my feelings to avoid being vulnerable.', copingStyle: 'avoidance', associatedSchema: 'emotional-inhibition' },

  // Overcompensation Coping (16 items - keep odd)
  { id: 'cope_61', text: 'I act fiercely independent to prove I don\'t need anyone.', copingStyle: 'overcompensation', associatedSchema: 'abandonment' },
  { id: 'cope_63', text: 'I attack others before they can hurt me.', copingStyle: 'overcompensation', associatedSchema: 'mistrust-abuse' },
  { id: 'cope_65', text: 'I act like I don\'t need affection or care from anyone.', copingStyle: 'overcompensation', associatedSchema: 'emotional-deprivation' },
  { id: 'cope_67', text: 'I act superior and perfect to hide my flaws.', copingStyle: 'overcompensation', associatedSchema: 'defectiveness-shame' },
  { id: 'cope_69', text: 'I act like a lone wolf who doesn\'t need social connection.', copingStyle: 'overcompensation', associatedSchema: 'social-isolation' },
  { id: 'cope_71', text: 'I refuse help and do everything myself to prove I\'m capable.', copingStyle: 'overcompensation', associatedSchema: 'dependence-incompetence' },
  { id: 'cope_73', text: 'I take excessive risks to prove I\'m not afraid.', copingStyle: 'overcompensation', associatedSchema: 'vulnerability' },
  { id: 'cope_75', text: 'I rebel against my family and cut them off completely.', copingStyle: 'overcompensation', associatedSchema: 'enmeshment' },
  { id: 'cope_77', text: 'I become a workaholic to prove I\'m not a failure.', copingStyle: 'overcompensation', associatedSchema: 'failure' },
  { id: 'cope_79', text: 'I act entitled and demand special treatment.', copingStyle: 'overcompensation', associatedSchema: 'entitlement-grandiosity' },
  { id: 'cope_81', text: 'I become controlling and domineering.', copingStyle: 'overcompensation', associatedSchema: 'subjugation' },
  { id: 'cope_83', text: 'I refuse to help others and focus only on myself.', copingStyle: 'overcompensation', associatedSchema: 'self-sacrifice' },
  { id: 'cope_85', text: 'I act like I don\'t care what anyone thinks of me.', copingStyle: 'overcompensation', associatedSchema: 'approval-seeking' },
  { id: 'cope_87', text: 'I act overly optimistic to deny negative feelings.', copingStyle: 'overcompensation', associatedSchema: 'negativity-pessimism' },
  { id: 'cope_89', text: 'I act overly emotional and dramatic.', copingStyle: 'overcompensation', associatedSchema: 'emotional-inhibition' },
  { id: 'cope_62', text: 'I push people away first before they can leave me.', copingStyle: 'overcompensation', associatedSchema: 'abandonment' }
];

// ============================================================================
// Trigger Pattern Assessment - 50 items (reduced from 120)
// 10 items per category
// ============================================================================

const TRIGGER_PATTERN_ITEMS: TriggerItem[] = [
  // Interpersonal Triggers (10 items)
  { id: 'trig_1', text: 'When someone cancels plans with me at the last minute.', category: 'interpersonal' },
  { id: 'trig_3', text: 'When I feel excluded from social gatherings.', category: 'interpersonal' },
  { id: 'trig_5', text: 'When people act distant or cold toward me.', category: 'interpersonal' },
  { id: 'trig_8', text: 'When I feel misunderstood or not listened to.', category: 'interpersonal' },
  { id: 'trig_11', text: 'When someone tries to control or dominate me.', category: 'interpersonal' },
  { id: 'trig_14', text: 'When someone dismisses my feelings or concerns.', category: 'interpersonal' },
  { id: 'trig_16', text: 'When people don\'t appreciate what I do for them.', category: 'interpersonal' },
  { id: 'trig_20', text: 'When I\'m left out of conversations or activities.', category: 'interpersonal' },
  { id: 'trig_24', text: 'When I feel like I\'m being taken advantage of.', category: 'interpersonal' },
  { id: 'trig_26', text: 'When someone I trust betrays my confidence.', category: 'interpersonal' },

  // Performance/Achievement Triggers (10 items)
  { id: 'trig_31', text: 'When I make a mistake at work or school.', category: 'performance' },
  { id: 'trig_33', text: 'When I receive critical feedback on my work.', category: 'performance' },
  { id: 'trig_35', text: 'When I\'m given a task I\'m not sure I can complete.', category: 'performance' },
  { id: 'trig_37', text: 'When I fail to achieve a goal I set for myself.', category: 'performance' },
  { id: 'trig_39', text: 'When I feel I\'m not good enough at something.', category: 'performance' },
  { id: 'trig_43', text: 'When I see others achieve things effortlessly that I struggle with.', category: 'performance' },
  { id: 'trig_47', text: 'When I\'m not the best at something I care about.', category: 'performance' },
  { id: 'trig_52', text: 'When I don\'t get recognition I feel I deserve.', category: 'performance' },
  { id: 'trig_54', text: 'When I feel I\'m falling behind others in my career or life.', category: 'performance' },
  { id: 'trig_55', text: 'When I have to admit I don\'t know something.', category: 'performance' },

  // Intimacy/Vulnerability Triggers (10 items)
  { id: 'trig_56', text: 'When someone gets emotionally close to me.', category: 'intimacy' },
  { id: 'trig_57', text: 'When I\'m asked to share my feelings.', category: 'intimacy' },
  { id: 'trig_59', text: 'When people see me cry or show weakness.', category: 'intimacy' },
  { id: 'trig_62', text: 'When I have to talk about my past or childhood.', category: 'intimacy' },
  { id: 'trig_64', text: 'When I feel dependent on someone.', category: 'intimacy' },
  { id: 'trig_66', text: 'When I\'m in situations that require emotional openness.', category: 'intimacy' },
  { id: 'trig_70', text: 'When romantic partners want to discuss "the relationship."', category: 'intimacy' },
  { id: 'trig_71', text: 'When I feel emotionally exposed or vulnerable.', category: 'intimacy' },
  { id: 'trig_73', text: 'When I have to express needs or ask for what I want.', category: 'intimacy' },
  { id: 'trig_75', text: 'When I have to admit I care deeply about someone.', category: 'intimacy' },

  // Autonomy/Control Triggers (10 items)
  { id: 'trig_76', text: 'When people tell me what to do.', category: 'autonomy' },
  { id: 'trig_77', text: 'When I feel my choices are being restricted.', category: 'autonomy' },
  { id: 'trig_79', text: 'When I have to follow rules that don\'t make sense to me.', category: 'autonomy' },
  { id: 'trig_81', text: 'When my freedom or independence is threatened.', category: 'autonomy' },
  { id: 'trig_84', text: 'When I feel trapped or stuck in a situation.', category: 'autonomy' },
  { id: 'trig_86', text: 'When I have to rely on others for basic needs.', category: 'autonomy' },
  { id: 'trig_88', text: 'When I can\'t do things my own way.', category: 'autonomy' },
  { id: 'trig_90', text: 'When I have to follow someone else\'s lead.', category: 'autonomy' },
  { id: 'trig_93', text: 'When someone checks up on me or monitors my activities.', category: 'autonomy' },
  { id: 'trig_95', text: 'When people don\'t respect my boundaries.', category: 'autonomy' },

  // Rejection/Criticism Triggers (10 items)
  { id: 'trig_96', text: 'When someone looks at me with disapproval.', category: 'rejection' },
  { id: 'trig_99', text: 'When someone says no to my requests.', category: 'rejection' },
  { id: 'trig_100', text: 'When I\'m ignored or overlooked.', category: 'rejection' },
  { id: 'trig_104', text: 'When feedback focuses on what I did wrong rather than right.', category: 'rejection' },
  { id: 'trig_105', text: 'When I\'m corrected or told I\'m mistaken.', category: 'rejection' },
  { id: 'trig_107', text: 'When people seem unimpressed by my accomplishments.', category: 'rejection' },
  { id: 'trig_110', text: 'When people don\'t validate my experiences or feelings.', category: 'rejection' },
  { id: 'trig_114', text: 'When people talk about plans in front of me that I\'m not part of.', category: 'rejection' },
  { id: 'trig_117', text: 'When I feel like people are talking about me behind my back.', category: 'rejection' },
  { id: 'trig_120', text: 'When people seem to prefer others over me.', category: 'rejection' }
];

// ============================================================================
// Exported Test Definitions
// ============================================================================

export const SCHEMA_TEST_ITEMS: any = {
  'core-schema': {
    testId: 'core-schema',
    label: 'Core Schema Assessment (YSQ-S3)',
    instructions: 'Rate each statement based on how well it describes you over your lifetime. There are no right or wrong answers. Please answer as honestly as possible.',
    likertLegend: LIKERT_SCALE,
    items: CORE_SCHEMA_ITEMS,
    batchSize: 15
  },
  'mode-identification': {
    testId: 'mode-identification',
    label: 'Mode Identification Assessment',
    instructions: 'Rate each statement based on how often you experience this mode or state. Think about different situations in your life and how you respond emotionally.',
    likertLegend: LIKERT_SCALE,
    items: MODE_IDENTIFICATION_ITEMS,
    batchSize: 15
  },
  'coping-style': {
    testId: 'coping-style',
    label: 'Coping Style Assessment',
    instructions: 'Rate each statement based on how often you use this coping strategy when you\'re triggered or stressed. Consider your typical patterns across different situations.',
    likertLegend: LIKERT_SCALE,
    items: COPING_STYLE_ITEMS,
    batchSize: 15
  },
  'trigger-pattern': {
    testId: 'trigger-pattern',
    label: 'Trigger Pattern Assessment',
    instructions: 'Rate how much each situation triggers strong emotional reactions in you. Consider both the frequency and intensity of your response.',
    likertLegend: LIKERT_SCALE,
    items: TRIGGER_PATTERN_ITEMS,
    batchSize: 15
  }
};

/**
 * Get test items for a specific test
 */
export function getSchemaTestItems(testId: SchemaTestId): SchemaTestItems {
  return SCHEMA_TEST_ITEMS[testId];
}

/**
 * Get item count for a specific test
 */
export function getTestItemCount(testId: SchemaTestId): number {
  return SCHEMA_TEST_ITEMS[testId].items.length;
}

/**
 * Get total item count across all tests
 */
export function getTotalItemCount(): number {
  return (Object.values(SCHEMA_TEST_ITEMS) as any[]).reduce((sum, test) => sum + (test.items?.length || 0), 0);
}
