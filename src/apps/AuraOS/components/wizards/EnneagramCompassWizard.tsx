import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { wizardSessionService } from '../../services/wizardSessionService';
import { updatePreferences } from '../../services/authService';
import { v4 as uuidv4 } from 'uuid';
import { insightDatabaseService } from '../../services/insightDatabaseService';
import { AstralCompassIcon, InquiryVortexIcon, ConsciousNodeIcon, MerkabaIcon } from '../visualizations/SacredGeometryIcons';
import type { EnneagramCompassSession, EnneagramCompassDraft } from '../../types';

// ─── Type definitions ────────────────────────────────────────────────────────

type Triad = 'Gut' | 'Heart' | 'Head';
type TypingConfidence = 'high' | 'medium' | 'low';

type WizardStep =
  | 'EPISTEMIC_FRAME'
  | 'INTRODUCTION'
  | 'TRIAD_FILTER'
  | 'TRIAD_VALIDATION'
  | 'MOTIVATION_MAP'
  | 'PATTERNS_IN_ACTION'
  | 'DISAMBIGUATION'
  | 'PORTRAIT'
  | 'GROWTH_AND_COMPLETION';

const STEP_ORDER: WizardStep[] = [
  'EPISTEMIC_FRAME',
  'INTRODUCTION',
  'TRIAD_FILTER',
  'TRIAD_VALIDATION',
  'MOTIVATION_MAP',
  'PATTERNS_IN_ACTION',
  'DISAMBIGUATION',
  'PORTRAIT',
  'GROWTH_AND_COMPLETION',
];

// ─── Lookup data ─────────────────────────────────────────────────────────────

const triadCandidates: Record<Triad, number[]> = {
  Gut: [8, 9, 1],
  Heart: [2, 3, 4],
  Head: [5, 6, 7],
};

interface ForcedChoicePair {
  q: string;
  options: { type: number; text: string }[];
}

const motivationPairs: Record<Triad, ForcedChoicePair[]> = {
  Head: [
    {
      q: "Which underlying fear feels more deeply familiar?",
      options: [
        { type: 5, text: "The fear of being depleted — of not having enough inner resources, knowledge, or private space to function competently if demands keep coming." },
        { type: 6, text: "The fear of being without support — of facing a threatening world alone, without trustworthy guidance or a secure foundation to fall back on." },
      ],
    },
    {
      q: "When things become painful or difficult, what is your most honest default?",
      options: [
        { type: 6, text: "I tend to brace for worst-case scenarios, look for what might go wrong, and seek reassurance or allies who can help me feel more secure." },
        { type: 7, text: "I tend to redirect toward what's exciting or possible, move toward what's pleasurable, and avoid sitting fully inside the difficulty." },
      ],
    },
    {
      q: "Which felt sense fits most?",
      options: [
        { type: 5, text: "I protect myself by withdrawing — minimizing my footprint, needing less, retreating into my inner world when the outer world demands too much." },
        { type: 7, text: "I protect myself by expanding — keeping options open, staying in motion, ensuring there's always something to look forward to." },
      ],
    },
    {
      q: "When you feel most like yourself, what are you doing?",
      options: [
        { type: 5, text: "Understanding something deeply — alone, undisturbed, with enough time to think it through completely." },
        { type: 6, text: "Belonging to something trustworthy — knowing where I stand, who's with me, and that the ground beneath me is solid." },
        { type: 7, text: "Experiencing something new — feeling the rush of possibility, freedom, and the sense that life is wide open." },
      ],
    },
  ],
  Heart: [
    {
      q: "Which need feels most central to how you've shaped your life?",
      options: [
        { type: 2, text: "The need to be genuinely needed — to feel that others couldn't manage without my care, presence, or support." },
        { type: 3, text: "The need to be genuinely successful — to feel that my accomplishments justify my existence and earn me the regard of people I respect." },
      ],
    },
    {
      q: "When you sense others don't value you, what is your first interior move?",
      options: [
        { type: 3, text: "I tend to pivot toward what I think will impress them — reframe myself, adjust my presentation, refocus on what I can achieve or demonstrate." },
        { type: 4, text: "I tend to feel it as a confirmation of something I already feared — that I am fundamentally different, flawed, or unseen in a way that can't simply be fixed." },
      ],
    },
    {
      q: "Which sentence lands as more uncomfortably honest?",
      options: [
        { type: 2, text: "I find it harder to receive care than to give it, and I often don't know what I need until I notice I'm exhausted and resentful." },
        { type: 4, text: "I feel more genuinely myself in longing and melancholy than in contentment — as if intensity of feeling is the truest proof I exist." },
      ],
    },
    {
      q: "What would be the most painful thing to discover about yourself?",
      options: [
        { type: 2, text: "That my generosity has been a strategy — that I give in order to be needed, not purely out of love." },
        { type: 3, text: "That without my achievements and image, there is nothing of substance underneath — that I have performed a self rather than lived one." },
        { type: 4, text: "That my sense of being uniquely flawed is itself ordinary — that my suffering is not special, and I am more like everyone else than I want to believe." },
      ],
    },
  ],
  Gut: [
    {
      q: "When conflict arises, which describes your first impulse?",
      options: [
        { type: 8, text: "To meet it directly — confront it, control the situation, assert my position. Avoidance feels like weakness." },
        { type: 9, text: "To smooth it over or withdraw from it. Conflict feels like a threat to the stability and peace I'm trying to protect." },
      ],
    },
    {
      q: "Which discomfort is more familiar?",
      options: [
        { type: 9, text: "Forgetting myself — merging with others' agendas and losing track of what I actually want or think until I feel invisible." },
        { type: 1, text: "Being unable to turn off the internal critic — a persistent awareness of what's wrong, imperfect, or could be better, in myself and the world." },
      ],
    },
    {
      q: "When you feel wronged or treated unjustly, what is your body's first response?",
      options: [
        { type: 8, text: "Anger that moves outward — an urge to confront, correct, or overpower whatever is causing the injustice." },
        { type: 1, text: "Anger that turns inward first — a grinding sense of moral wrongness, a need to understand who is at fault, including myself." },
      ],
    },
    {
      q: "Which of these feels like your life's deepest recurring struggle?",
      options: [
        { type: 8, text: "Trusting anyone enough to let down my guard — the vulnerability of needing someone feels more dangerous than any external threat." },
        { type: 9, text: "Knowing what I actually want — my own desires feel hazy, distant, or less urgent than keeping things harmonious." },
        { type: 1, text: "Accepting things as they are — the gap between how things should be and how they are feels like a wound that never fully closes." },
      ],
    },
  ],
};

const disambiguationAxes: Record<string, { axis: string; probeDescription: string }> = {
  "1_6": { axis: "Internalized vs. externalized authority", probeDescription: "Ask about what happens when they violate their own standards — does the critical voice feel like their own internal moral compass, or like they are answering to something outside themselves" },
  "1_4": { axis: "Moral correction vs. felt deficiency", probeDescription: "Ask whether recurring discomfort is more about what is wrong in the world that needs fixing, or about something wrong or missing inside themselves" },
  "1_8": { axis: "Controlled anger vs. expressed anger", probeDescription: "Ask about the relationship with anger — is it something they try to contain and channel righteously, or something they express directly and without apology" },
  "1_9": { axis: "Inner critic activation vs. inner numbness", probeDescription: "Ask whether their default resting state is more like a persistent internal commentary about what needs improving, or more like a pleasant fog where their own opinions and desires become hard to locate" },
  "2_3": { axis: "Being needed vs. being admired", probeDescription: "Ask about a time they felt most fulfilled — was it when someone genuinely needed them and they could provide, or when they achieved something visible and received recognition" },
  "2_4": { axis: "Other-focused giving vs. self-focused longing", probeDescription: "Ask where their attention naturally goes in relationships — toward what the other person needs from them, or toward their own emotional experience and whether they feel truly seen" },
  "2_9": { axis: "Active giving vs. passive merging", probeDescription: "Ask whether their pattern of accommodating others feels driven more by warmth and a desire to be indispensable, or by difficulty saying no and a tendency to lose track of their own needs entirely" },
  "3_4": { axis: "Image management vs. authenticity longing", probeDescription: "Ask what happens when they sense others do not value them — do they pivot to impress and adjust their presentation, or do they feel confirmed in a fear of being fundamentally different or unseen" },
  "3_7": { axis: "Image-based worth vs. pain avoidance", probeDescription: "Ask about failure — is the first impulse to fix their reputation and demonstrate competence to others, or to move away from the feeling of failure toward something new and exciting" },
  "3_8": { axis: "Power through image vs. power through force", probeDescription: "Ask about disrespect — is their primary move to demonstrate competence and prove worth, or to assert force and reclaim control directly" },
  "4_5": { axis: "Emotional intensity vs. emotional detachment", probeDescription: "Ask how they handle overwhelming feelings — do they move deeper into the feeling, amplifying it as proof of their depth, or do they detach and retreat into analysis and observation" },
  "4_6": { axis: "Authenticity longing vs. security seeking", probeDescription: "Ask about the deeper fear — is it more about not being truly known for who they are, or about not having the support and guidance to face an uncertain world" },
  "4_9": { axis: "Emotional amplification vs. emotional flattening", probeDescription: "Ask what happens to strong emotions — do they intensify and become central to identity, or do they get dampened and smoothed over to maintain inner peace" },
  "5_6": { axis: "Withdrawal for competence vs. vigilance for security", probeDescription: "Ask what they do when they feel unprepared — do they retreat to study and accumulate knowledge until they feel sufficient, or do they seek allies, test scenarios, and scan for threats" },
  "5_7": { axis: "Depth withdrawal vs. breadth expansion", probeDescription: "Ask about their relationship with limitation — do they minimize needs and narrow their world to feel safe, or do they resist limitation by keeping options open and staying in motion" },
  "5_9": { axis: "Withdrawal for competence vs. withdrawal for peace", probeDescription: "Ask about pulling back from the world — is it more to replenish resources and knowledge, or more to avoid the friction of conflict and external expectation" },
  "6_7": { axis: "Worst-case scanning vs. best-case generating", probeDescription: "Ask what their mind does with uncertainty — does it generate threat scenarios and contingency plans, or does it generate exciting possibilities and escape routes from discomfort" },
  "6_8": { axis: "Counter-phobic testing vs. natural dominance", probeDescription: "Ask about moving toward threats — is it from a place of needing to face down fears before they face them, or from a place of confidence in their own strength and a refusal to be controlled" },
  "7_8": { axis: "Avoidance of pain vs. avoidance of vulnerability", probeDescription: "Ask what they find hardest to sit with — painful emotions and limitation, or the experience of being vulnerable and not in control" },
  "8_9": { axis: "Confrontation vs. accommodation", probeDescription: "Ask about a recent disagreement — did they push their position forcefully, or did they find themselves going along to keep the peace despite having a strong opinion" },
  "9_1": { axis: "Self-forgetting vs. self-criticizing", probeDescription: "Ask what their inner monologue sounds like on an ordinary day — is it relatively quiet, pleasant, and diffuse, or is it a running commentary evaluating what they and others should be doing better" },
};

const passionDescriptions: Record<number, { name: string; description: string }> = {
  1: { name: "Resentment", description: "A persistent, slow-burning irritation at imperfection — in the world, in others, and most painfully, in yourself." },
  2: { name: "Pride", description: "A deep investment in being indispensable — and a difficulty acknowledging the needs and desires that make you depend on others in return." },
  3: { name: "Self-Deception", description: "A tendency to lose contact with your own authentic feelings, replacing them with the performing self that earns approval and drives achievement." },
  4: { name: "Envy", description: "A recurring sense that others have something essential that you lack — a wholeness, a belonging, or a groundedness that feels perpetually just out of reach." },
  5: { name: "Avarice", description: "A compulsive hoarding of inner resources — time, energy, privacy, knowledge — as protection against a world that feels too demanding and depleting." },
  6: { name: "Fear", description: "A near-constant background vigilance — scanning for what could go wrong, who can be trusted, and what support is available if the worst happens." },
  7: { name: "Gluttony", description: "An insatiable appetite for experience, options, and stimulation — and a reflexive turning away from pain, limitation, or prolonged difficulty." },
  8: { name: "Lust", description: "An intensity that demands full contact with life — and an unconscious pattern of overwhelming situations, people, and even yourself in the pursuit of aliveness." },
  9: { name: "Sloth", description: "A profound self-forgetting — a habit of prioritizing others' agendas, avoiding inner friction, and drifting from your own priorities, desires, and presence." },
};

const growthEdges: Record<number, { edge: string; operationalTarget: string }> = {
  1: { edge: "Tolerating imperfection without immediately correcting it", operationalTarget: "Recognize the internal critic as a protective voice, not objective truth. Practice letting something be 'good enough' without revising it." },
  2: { edge: "Naming and advocating for personal needs without waiting for permission", operationalTarget: "Experiment with receiving care without deflecting or immediately reciprocating. Notice what you need before asking what others need." },
  3: { edge: "Staying present in failure or stillness without pivoting to achievement", operationalTarget: "Practice sharing something genuinely incomplete or inadequate with one trusted person. Sit in the discomfort of not performing." },
  4: { edge: "Moving toward ordinary engagement rather than awaiting perfect emotional conditions", operationalTarget: "Notice when idealization of the absent is protecting you against engaging with what is actually available. Act before the feeling arrives." },
  5: { edge: "Increasing emotional and relational engagement before feeling fully ready", operationalTarget: "Practice being in the room — emotionally and relationally — without the exit route of analysis or withdrawal. Share something before you've fully formulated it." },
  6: { edge: "Accessing inner authority rather than outsourcing guidance", operationalTarget: "Sit with uncertainty for a defined period without seeking reassurance, worst-case planning, or external validation. Trust your own assessment." },
  7: { edge: "Moving toward discomfort rather than generating alternatives to it", operationalTarget: "Practice staying in one thing — including pain or boredom — to completion. Notice the impulse to reframe, plan, or escape, and pause before acting on it." },
  8: { edge: "Tolerating vulnerability without converting it to strength, anger, or control", operationalTarget: "Allow others to be right, or to lead, without experiencing it as defeat. Let someone see you uncertain or soft without armoring up." },
  9: { edge: "Tracking and asserting personal agenda and preference in real time", operationalTarget: "Before asking what others want, identify what you actually want. Practice stating a clear preference in at least one interaction per day." },
};

const wizardPrescriptions: Record<number, { primary: { wizardId: string; label: string; reason: string }; secondary: { wizardId: string; label: string; reason: string } }> = {
  1: {
    primary: { wizardId: "schema-detective", label: "Schema Detective", reason: "to examine the Unrelenting Standards and Punitiveness schemas that fuel your inner critic" },
    secondary: { wizardId: "ifs", label: "IFS", reason: "to work directly with the Inner Critic as a protective part that can be appreciated and softened" },
  },
  2: {
    primary: { wizardId: "relational-blueprint", label: "Relational Blueprint", reason: "to map how your giving patterns shape your closest relationships and what they cost you" },
    secondary: { wizardId: "attachment-assessment", label: "Attachment Assessment", reason: "to explore the attachment dynamics beneath your pattern of making yourself indispensable" },
  },
  3: {
    primary: { wizardId: "kegan", label: "Kegan Stage Assessment", reason: "to explore how much of your identity is embedded in performance and achievement — and what lies beneath it" },
    secondary: { wizardId: "shadow-journaling", label: "Shadow Journaling", reason: "to reconnect with the authentic feelings that get overridden by the drive to succeed" },
  },
  4: {
    primary: { wizardId: "ifs", label: "IFS", reason: "to work with the part that holds the sense of deficiency or being fundamentally flawed" },
    secondary: { wizardId: "contemplative-inquiry", label: "Contemplative Inquiry", reason: "to explore the question of identity and belonging from a contemplative rather than emotional vantage point" },
  },
  5: {
    primary: { wizardId: "relational-pattern-chatbot", label: "Relational Pattern Chatbot", reason: "to explore your relational patterns — especially the withdrawal and self-sufficiency that may cost you connection" },
    secondary: { wizardId: "somatic", label: "Somatic Generator", reason: "to reconnect with bodily experience, which is often the first thing minimized when you retreat into your mind" },
  },
  6: {
    primary: { wizardId: "immunity-to-change", label: "Immunity to Change", reason: "to surface the competing commitment to safety that may be blocking the changes you want to make" },
    secondary: { wizardId: "dbt-coach", label: "DBT Coach", reason: "to build distress tolerance skills that reduce the need for external reassurance" },
  },
  7: {
    primary: { wizardId: "321", label: "3-2-1 Reflection", reason: "to work with the shadow of avoided pain and limitation — the feelings you reflexively move away from" },
    secondary: { wizardId: "memory-reconsolidation", label: "Memory Reconsolidation", reason: "to process specific memories where pain was bypassed rather than metabolized" },
  },
  8: {
    primary: { wizardId: "relational-blueprint", label: "Relational Blueprint", reason: "to examine how your intensity and need for control shape your most important relationships" },
    secondary: { wizardId: "big-mind", label: "Big Mind Process", reason: "to access the vulnerable, tender dimensions of experience that your protective strength normally overrides" },
  },
  9: {
    primary: { wizardId: "so", label: "Subject-Object Move", reason: "to identify where you are embedded in others' agendas — fused with them rather than freely choosing them" },
    secondary: { wizardId: "immunity-to-change", label: "Immunity to Change", reason: "to uncover the hidden commitments that keep you from asserting your own desires and priorities" },
  },
};

// ─── Triad validation options ─────────────────────────────────────────────────

const triadEmotionOptions: Record<Triad, { type: number; text: string }[]> = {
  Gut: [
    { type: 1, text: "Anger is always present — a low-level current of frustration or moral intensity that I manage constantly, even when I look calm. It comes out as criticism, of others and especially of myself." },
    { type: 9, text: "I don't think of myself as angry. Conflict feels disruptive and I'd rather smooth things over. But when I do finally get angry, it surprises even me with its force." },
    { type: 8, text: "I know my anger well. I express it directly, sometimes before I've decided to. Holding it back feels dishonest or weak." },
  ],
  Heart: [
    { type: 2, text: "I manage my worth by being valuable to others — by giving, helping, being the person people rely on. The idea that I have needs that might burden others feels shameful." },
    { type: 3, text: "I manage my worth through achievement and image — by becoming whatever earns admiration. The fear isn't that I'm unlovable, but that without accomplishments there's nothing underneath." },
    { type: 4, text: "I feel the shame directly — a persistent sense that something essential is missing in me that others seem to have naturally. I manage it by deepening into my emotional life." },
  ],
  Head: [
    { type: 5, text: "I manage fear by retreating — minimizing my needs, accumulating knowledge, and maintaining strict boundaries around my time and energy. If I can understand something completely, it can't overwhelm me." },
    { type: 6, text: "Fear is my constant companion. I manage it by anticipating what could go wrong, testing loyalties, and preparing for worst cases. Sometimes I challenge fear head-on — but that's still a response to it." },
    { type: 7, text: "I manage fear by staying in motion — keeping options open, generating plans, reframing negatives as opportunities. Sitting still with fear or pain feels intolerable." },
  ],
};

const somaticOptions: { signal: Triad; text: string }[] = [
  { signal: 'Gut', text: "In my gut, chest, or jaw — a clenching, bracing, or physical sense of pushing against something." },
  { signal: 'Heart', text: "In my chest or throat — a tightening, flush, hollowness, or felt sense of longing or exposure." },
  { signal: 'Head', text: "In my head, shoulders, or upper body — a buzzing, tension, or sense of the mind racing while the body freezes." },
];

// ─── Patterns in Action options ───────────────────────────────────────────────

const stressOptions: Record<Triad, { type: number; text: string }[]> = {
  Gut: [
    { type: 8, text: "I become more controlling and confrontational — override others, force outcomes through sheer will, and cut off anything that feels like vulnerability." },
    { type: 9, text: "I become more checked out — go numb, zone out, distract myself with unimportant things, and passively resist by simply not responding." },
    { type: 1, text: "I become more rigid and critical — my standards get harsher, my patience evaporates, and I feel like I'm the only one who sees what needs fixing." },
  ],
  Heart: [
    { type: 2, text: "I become more intrusive in my giving — insist on helping when it's not wanted, keep score of my sacrifices, and grow resentful when they go unacknowledged." },
    { type: 3, text: "I become more image-focused and emotionally cut off — double down on performance, cut corners to maintain appearances, and lose contact with what I actually feel." },
    { type: 4, text: "I become more dramatic and self-absorbed — amplify my suffering, withdraw from ordinary life, and become consumed by the sense that no one truly understands me." },
  ],
  Head: [
    { type: 5, text: "I become more withdrawn and detached — reduce my world to what I can control alone, cut off emotions entirely, and treat others' needs as invasive demands." },
    { type: 6, text: "I become more reactive and suspicious — see threats everywhere, test people's loyalties, and vacillate between clinging to authority and attacking it." },
    { type: 7, text: "I become more scattered and escapist — overcommit, overindulge, talk compulsively, start things I won't finish, and flee from anything that feels limiting." },
  ],
};

const relationalOptions: Record<Triad, { type: number; text: string }[]> = {
  Gut: [
    { type: 8, text: "The protector. I take charge and make sure no one I care about is vulnerable. The cost: people feel controlled, and I rarely let anyone protect me." },
    { type: 9, text: "The peacekeeper. I absorb tension and prioritize harmony above my own opinions and desires. The cost: people don't know what I actually want, and sometimes neither do I." },
    { type: 1, text: "The improver. I see what could be better and can't stop pointing it out. The cost: people feel judged, and nothing ever feels good enough." },
  ],
  Heart: [
    { type: 2, text: "The giver. I anticipate needs, make myself essential, and define my worth through what I provide. The cost: I lose track of my own needs and my giving can become a form of control." },
    { type: 3, text: "The achiever-partner. I bring ambition and want my relationships to be as impressive as everything else. The cost: I can treat intimacy like a project and struggle to just be." },
    { type: 4, text: "The intense one. I crave depth and emotional honesty above all. The cost: ordinary moments feel insufficient and I can push people away by demanding intensity they can't sustain." },
  ],
  Head: [
    { type: 5, text: "The observer. I bring thoughtfulness and respect for boundaries, but often watch from a slight distance. The cost: people feel I'm withholding — and I often am." },
    { type: 6, text: "The loyal questioner. I bring fierce commitment but constantly check whether things are solid. The cost: my vigilance can feel like suspicion and I sometimes test people in ways that push them away." },
    { type: 7, text: "The energizer. I bring enthusiasm and refuse to let things get heavy. The cost: I avoid difficult conversations and partners feel I'm not fully present when things are hard." },
  ],
};

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const disambiguationSchema = z.object({ question: z.string() });
const portraitSchema = z.object({
  portrait: z.string(),
  provisionalType: z.number(),
  typingConfidence: z.enum(["high", "medium", "low"]),
});
const recommendationSchema = z.object({ recommendation: z.string() });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAxisKey(a: number, b: number): string {
  return [a, b].sort((x, y) => x - y).join('_');
}

function tallySignals(selections: { type: number }[]): [number, number] {
  const counts: Record<number, number> = {};
  for (const s of selections) {
    counts[s.type] = (counts[s.type] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]));
  const primary = sorted[0] ? Number(sorted[0][0]) : 0;
  const secondary = sorted[1] ? Number(sorted[1][0]) : 0;
  return [primary, secondary];
}

function computeSignalSummary(
  triadEmotionSignal: number,
  primaryFromMotivation: number,
  stressSignal: number,
  relationalSignal: number
): { signalSummary: string; primary: number; secondary: number } {
  const allSignals = [triadEmotionSignal, primaryFromMotivation, stressSignal, relationalSignal].filter(Boolean);
  const signalCounts: Record<number, number> = {};
  for (const sig of allSignals) {
    signalCounts[sig] = (signalCounts[sig] || 0) + 1;
  }
  const sorted = Object.entries(signalCounts).sort(([, a], [, b]) => b - a);
  const signalSummary = sorted
    .map(([type, count]) => `Type ${type}: ${count} of ${allSignals.length} signals`)
    .join('. ');
  const primary = sorted[0] ? Number(sorted[0][0]) : primaryFromMotivation;
  const secondary = sorted[1] ? Number(sorted[1][0]) : 0;
  return { signalSummary, primary, secondary };
}

// ─── Initial draft ────────────────────────────────────────────────────────────

const initialDraft: EnneagramCompassDraft = {
  triadSelection: null,
  candidateTypes: [],
  forcedChoiceSelections: [],
  primaryCandidate: 0,
  secondaryCandidate: 0,
  triadEmotionSignal: 0,
  somaticSignal: null,
  triadConfidence: 'medium',
  stressSignal: 0,
  relationalSignal: 0,
  patternNarrative: '',
  signalSummary: '',
  disambiguationQuestion: '',
  disambiguationResponse: '',
  portrait: '',
  provisionalType: 0,
  typingConfidence: 'medium',
  disconfirmationResponse: '',
  practiceRecommendation: '',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnneagramCompassWizard({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState<WizardStep>('EPISTEMIC_FRAME');
  const [draft, updateDraft, , clearDraft] = useWizardDraft<EnneagramCompassDraft>(
    'aura-draft-enneagram-compass',
    initialDraft
  );

  // Triad filter state
  const [showTiebreaker, setShowTiebreaker] = useState(false);
  const tiebreakerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Motivation map state
  const [pairIndex, setPairIndex] = useState(0);
  const [pairTransitioning, setPairTransitioning] = useState(false);

  // Triad validation local state
  const [triadEmotionSelection, setTriadEmotionSelection] = useState<number | null>(null);
  const [somaticSelection, setSomaticSelection] = useState<Triad | null>(null);

  // Patterns in action local state
  const [stressSelection, setStressSelection] = useState<number | null>(null);
  const [relationalSelection, setRelationalSelection] = useState<number | null>(null);
  const [patternNarrativeLocal, setPatternNarrativeLocal] = useState('');

  // AI loading states
  const [isGeneratingDisambig, setIsGeneratingDisambig] = useState(false);
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const completionFiredRef = useRef(false);

  // All hooks before early return
  useEffect(() => {
    return () => {
      if (tiebreakerTimerRef.current) clearTimeout(tiebreakerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === 'TRIAD_FILTER' && !showTiebreaker) {
      tiebreakerTimerRef.current = setTimeout(() => setShowTiebreaker(true), 30000);
      return () => {
        if (tiebreakerTimerRef.current) clearTimeout(tiebreakerTimerRef.current);
      };
    }
  }, [step, showTiebreaker]);

  // Reset pair index when entering motivation map
  useEffect(() => {
    if (step === 'MOTIVATION_MAP') {
      setPairIndex(0);
    }
  }, [step]);

  // completionFiredRef guards against double-fire only (save is triggered explicitly)

  if (!isOpen) return null;

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progress = Math.round((currentStepIndex / (STEP_ORDER.length - 1)) * 100);

  const pairs = draft.triadSelection ? motivationPairs[draft.triadSelection] : [];

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (step === 'MOTIVATION_MAP' && pairIndex > 0) {
      setPairIndex(i => i - 1);
      return;
    }
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const handleTriadSelect = (triad: Triad) => {
    if (tiebreakerTimerRef.current) clearTimeout(tiebreakerTimerRef.current);
    updateDraft({
      triadSelection: triad,
      candidateTypes: triadCandidates[triad],
      forcedChoiceSelections: [],
      primaryCandidate: 0,
      secondaryCandidate: 0,
    });
    // Reset triad validation state
    setTriadEmotionSelection(null);
    setSomaticSelection(null);
    setStep('TRIAD_VALIDATION');
  };

  const handleTriadValidationContinue = () => {
    if (triadEmotionSelection === null || somaticSelection === null || !draft.triadSelection) return;
    const candidateTypes = triadCandidates[draft.triadSelection];
    const triadEmotionMatchesTriad = candidateTypes.includes(triadEmotionSelection);
    const somaticMatchesTriad = somaticSelection === draft.triadSelection;
    const confirmations = [triadEmotionMatchesTriad, somaticMatchesTriad].filter(Boolean).length;
    const triadConfidence: TypingConfidence = confirmations === 2 ? 'high' : confirmations === 1 ? 'medium' : 'low';
    updateDraft({ triadEmotionSignal: triadEmotionSelection, somaticSignal: somaticSelection, triadConfidence });
    setPairIndex(0);
    setStep('MOTIVATION_MAP');
  };

  const handleForcedChoice = async (typeChosen: number) => {
    if (pairTransitioning) return;
    const newSelections = [...draft.forcedChoiceSelections, { pairIndex, type: typeChosen }];
    updateDraft({ forcedChoiceSelections: newSelections });

    if (pairIndex < pairs.length - 1) {
      setPairTransitioning(true);
      setTimeout(() => {
        setPairIndex(i => i + 1);
        setPairTransitioning(false);
      }, 300);
    } else {
      // Final pair — compute primary from motivation pairs only, then go to PATTERNS_IN_ACTION
      const [primary, secondary] = tallySignals(newSelections.map(s => ({ type: s.type })));
      updateDraft({ primaryCandidate: primary, secondaryCandidate: secondary, forcedChoiceSelections: newSelections });
      setStressSelection(null);
      setRelationalSelection(null);
      setPatternNarrativeLocal('');
      setStep('PATTERNS_IN_ACTION');
    }
  };

  const handlePatternsInActionContinue = async () => {
    if (stressSelection === null || relationalSelection === null || patternNarrativeLocal.trim().length < 25) return;

    // Compute signal summary from all signals
    const { signalSummary, primary, secondary } = computeSignalSummary(
      draft.triadEmotionSignal,
      draft.primaryCandidate,
      stressSelection,
      relationalSelection
    );

    updateDraft({
      stressSignal: stressSelection,
      relationalSignal: relationalSelection,
      patternNarrative: patternNarrativeLocal,
      signalSummary,
      primaryCandidate: primary,
      secondaryCandidate: secondary,
    });

    // Generate disambiguation question with updated signals
    await generateDisambiguationQuestion(primary, secondary, signalSummary, patternNarrativeLocal, draft.triadConfidence);
    setStep('DISAMBIGUATION');
  };

  // ─── AI calls ───────────────────────────────────────────────────────────────

  const generateDisambiguationQuestion = async (
    primary: number,
    secondary: number,
    signalSummary: string,
    patternNarrative: string,
    triadConfidence: TypingConfidence
  ) => {
    setIsGeneratingDisambig(true);
    try {
      const axisKey = getAxisKey(primary, secondary);
      const axisData = disambiguationAxes[axisKey];
      if (!axisData) {
        updateDraft({ disambiguationQuestion: "Describe a recent situation where you felt most challenged — what happened inside you first?" });
        return;
      }
      const prompt = `You are a psychologically trained assistant helping a user explore their motivational patterns. You are holding two hypotheses about the user's core pattern: Type ${primary} and Type ${secondary}.

The distinguishing axis between these two types is: ${axisData.axis}

CONTEXT FROM PRIOR SCREENS:
- Triad: ${draft.triadSelection} (confidence: ${triadConfidence})
- Signal summary across all structured questions: ${signalSummary}
- Stress narrative (user's own words): "${patternNarrative}"

Your task: Generate exactly ONE open-ended question that targets the distinguishing axis between these two types. The question must:
- Ask about a felt experience, a concrete situation, or an internal reaction — NOT a preference, value, or abstract self-description
- Use plain, conversational language — no Enneagram jargon, no type numbers, no technical psychology terms
- Be specific enough that the two types would answer it differently
- If triadConfidence is "low", the question should also subtly probe whether the user's center might differ from what they initially selected
- Be no longer than 2 sentences

Probe focus: ${axisData.probeDescription}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{"question": "your question here"}`;
      const result = await callGrokThenAIJson('EnneagramCompass.disambig', prompt, undefined, disambiguationSchema);
      updateDraft({ disambiguationQuestion: result.question });
    } catch (err) {
      console.error('[EnneagramCompass] Disambiguation question error:', err);
      updateDraft({ disambiguationQuestion: "Describe a recent situation where you felt most challenged — what happened inside you first?" });
    } finally {
      setIsGeneratingDisambig(false);
    }
  };

  const generatePortrait = async () => {
    setIsGeneratingPortrait(true);
    try {
      const prompt = `You are generating a provisional motivational portrait for a user who has completed a multi-stage Enneagram-informed self-reflection process.

ASSESSMENT DATA:
- Triad: ${draft.triadSelection} (confidence: ${draft.triadConfidence})
- Somatic signature: ${draft.somaticSignal}
- Forced-choice motivation signals: ${JSON.stringify(draft.forcedChoiceSelections)}
- Stress behavior signals: Type ${draft.stressSignal}
- Relational role signals: Type ${draft.relationalSignal}
- Signal summary: ${draft.signalSummary}
- Pattern narrative (user's own words): "${draft.patternNarrative}"
- Disambiguation question asked: "${draft.disambiguationQuestion}"
- Disambiguation response (user's own words): "${draft.disambiguationResponse}"

The type with the most signals across all structured questions is Type ${draft.primaryCandidate}. Use the free-text responses to confirm or complicate this assessment.

RULES — follow these exactly:
1. Write 5 to 7 sentences.
2. Do NOT use Enneagram type numbers or Enneagram jargon (no "fixation," "wing," "arrow," "integration," "disintegration").
3. Use the user's own words and phrasing from their free-text responses wherever possible. Draw specific phrases from their pattern narrative and disambiguation response. Do not translate their language into clinical or spiritual vocabulary.
4. The portrait must weave together at least three dimensions: the core motivation, how the pattern shows up under pressure, and how it plays out in relationships. A portrait that only addresses inner motivation is incomplete.
5. Frame as provisional — use "tends to," "often," "the pattern that appears most consistently." NEVER write "You are a..." as a statement of identity.
6. The portrait must be specific enough that a person with a genuinely different pattern would find it clearly inaccurate.
7. If signals are split or triadConfidence is "low," explicitly acknowledge the ambiguity rather than presenting false certainty.
8. Assess typingConfidence: "high" if the signal summary and free-text responses clearly converge on one type, "medium" if there is moderate convergence with some ambiguity, "low" if signals are genuinely split or contradictory.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{"portrait": "5-7 sentence portrait", "provisionalType": 6, "typingConfidence": "medium"}`;
      const result = await callGrokThenAIJson('EnneagramCompass.portrait', prompt, undefined, portraitSchema);
      updateDraft({
        portrait: result.portrait,
        provisionalType: result.provisionalType,
        typingConfidence: result.typingConfidence,
      });
    } catch (err) {
      console.error('[EnneagramCompass] Portrait generation error:', err);
      updateDraft({
        portrait: "The pattern that appears most consistently in your responses suggests a strong pull toward one of several core motivational structures. This portrait is provisional — treat it as a hypothesis to test against your lived experience over time.",
        provisionalType: draft.primaryCandidate,
        typingConfidence: 'low',
      });
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const generateRecommendation = async (): Promise<string> => {
    setIsGeneratingRec(true);
    const fallback = "The patterns surfaced here point toward two specific practices that will help you work with this material in a sustained way. Begin with whichever feels most accessible, and return to the other within a month.";
    try {
      const type = draft.provisionalType || draft.primaryCandidate;
      const growthEdge = growthEdges[type];
      const prescription = wizardPrescriptions[type];
      if (!growthEdge || !prescription) {
        updateDraft({ practiceRecommendation: fallback });
        return fallback;
      }
      const prompt = `You are writing a brief, personalized practice recommendation for a user who has just completed an Enneagram-informed self-reflection.

Provisional type: ${type}
Growth edge: "${growthEdge.edge}"
Operational target: "${growthEdge.operationalTarget}"
User's disconfirmation response: "${draft.disconfirmationResponse}"
User's pattern narrative: "${draft.patternNarrative}"
Primary recommended wizard: ${prescription.primary.wizardId} — ${prescription.primary.reason}
Secondary recommended wizard: ${prescription.secondary.wizardId} — ${prescription.secondary.reason}

Write a single cohesive paragraph (3-5 sentences) that:
1. Names the growth edge in the user's own language where possible, drawing from their pattern narrative
2. Explains why the two recommended practices are the right next step
3. Acknowledges the disconfirmation — if the user noted something the portrait missed, briefly note how that might also be worth exploring
4. Does NOT use Enneagram type numbers or jargon
5. Ends with honest acknowledgment that this work takes sustained practice, not platitudes

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{"recommendation": "your paragraph here"}`;
      const result = await callGrokThenAIJson('EnneagramCompass.recommendation', prompt, undefined, recommendationSchema);
      updateDraft({ practiceRecommendation: result.recommendation });
      return result.recommendation;
    } catch (err) {
      console.error('[EnneagramCompass] Recommendation error:', err);
      updateDraft({ practiceRecommendation: fallback });
      return fallback;
    } finally {
      setIsGeneratingRec(false);
    }
  };

  // ─── Completion save ──────────────────────────────────────────────────────────
  // Called directly with finalRecommendation to avoid stale-draft closure issues.

  const handleCompletion = async (finalRecommendation: string) => {
    if (completionFiredRef.current) return;
    completionFiredRef.current = true;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const type = draft.provisionalType || draft.primaryCandidate;
      const passion = passionDescriptions[type];
      const prescription = wizardPrescriptions[type];
      const confidenceScore = draft.typingConfidence === 'high' ? 0.8 : draft.typingConfidence === 'medium' ? 0.6 : 0.4;

      const sessionId = uuidv4();
      const sessionData: EnneagramCompassSession = {
        id: sessionId,
        date: new Date().toISOString(),
        wizardType: 'Enneagram Compass',
        triadSelection: draft.triadSelection!,
        candidateTypes: draft.candidateTypes,
        forcedChoiceSelections: draft.forcedChoiceSelections,
        primaryCandidate: draft.primaryCandidate,
        secondaryCandidate: draft.secondaryCandidate,
        triadEmotionSignal: draft.triadEmotionSignal,
        somaticSignal: draft.somaticSignal!,
        triadConfidence: draft.triadConfidence,
        stressSignal: draft.stressSignal,
        relationalSignal: draft.relationalSignal,
        patternNarrative: draft.patternNarrative,
        signalSummary: draft.signalSummary,
        disambiguationQuestion: draft.disambiguationQuestion,
        disambiguationResponse: draft.disambiguationResponse,
        portrait: draft.portrait,
        provisionalType: type,
        typingConfidence: draft.typingConfidence,
        disconfirmationResponse: draft.disconfirmationResponse,
        practiceRecommendation: finalRecommendation,
      };

      // Write 1: Integrated insight (via insightDatabaseService for localStorage fallback)
      const insightId = uuidv4();
      const insight = {
        id: insightId,
        mindToolType: 'enneagram_compass' as string,
        mindToolSessionId: sessionId,
        mindToolName: 'Enneagram Compass',
        mindToolReport: `Enneagram Compass session. Type ${type} (${draft.triadSelection} center). Triad confidence: ${draft.triadConfidence}. Typing confidence: ${draft.typingConfidence}. ${draft.portrait}`,
        mindToolShortSummary: `Type ${type} pattern identified — ${draft.typingConfidence} confidence.`,
        detectedPattern: `Motivational pattern most consistent with Type ${type} (${draft.triadSelection} center, triad confidence: ${draft.triadConfidence}, typing confidence: ${draft.typingConfidence}). Signal summary: ${draft.signalSummary}. ${draft.portrait}`,
        suggestedShadowWork: passion
          ? [{ practiceId: 'ifs', practiceName: 'IFS Session', rationale: `Work with the ${passion.name} pattern: ${passion.description}` }]
          : [],
        suggestedNextSteps: prescription
          ? [
              { practiceId: prescription.primary.wizardId, practiceName: prescription.primary.label, rationale: prescription.primary.reason },
              { practiceId: prescription.secondary.wizardId, practiceName: prescription.secondary.label, rationale: prescription.secondary.reason },
            ]
          : [],
        confidenceScore,
        lineageId: 'EnneagramCompass v1.1',
        dateCreated: new Date().toISOString(),
        status: 'pending' as const,
        shadowWorkSessionsAddressed: [],
        relatedPracticeSessions: [],
        practiceOutcome: [],
      };
      if (userId && userId !== 'anonymous') {
        await insightDatabaseService.saveInsight(userId, insight);
      }

      // Write 2: User preferences
      if (userId && userId !== 'anonymous') {
        await updatePreferences({
          enneagramType: type,
          enneagramTriad: draft.triadSelection as 'Gut' | 'Heart' | 'Head',
          enneagramPassion: passion?.name,
          enneagramTypingConfidence: draft.typingConfidence,
          enneagramLastUpdated: new Date().toISOString(),
        });
      }

      // Write session
      if (userId && userId !== 'anonymous') {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: sessionId,
          type: 'Enneagram Compass',
          content: sessionData,
          created_at: sessionData.date,
        });
      }

      clearDraft();
      setSaveSuccess(true);
    } catch (err) {
      console.error('[EnneagramCompass] Save error:', err);
      setSaveError('There was an error saving your session. Your session data is stored locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Screen renderers ────────────────────────────────────────────────────────

  const renderEpistemicFrame = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <AstralCompassIcon className="w-14 h-14 text-amber-400/75 mx-auto mb-6" />
        <h2 className="text-3xl font-serif text-amber-100 mb-6">Before We Begin</h2>
      </div>
      <div className="space-y-5 text-stone-300 leading-relaxed">
        <p>
          The Enneagram is a nine-pattern model of human motivation. It maps recurring fears, desires, and emotional habits — not personality traits or behaviors. It is not a diagnosis.
        </p>
        <p>
          A 2020 systematic review of 104 studies found meaningful correlations between Enneagram measures and self-awareness outcomes, alongside mixed support for its structural claims. Academic opinion ranges from cautiously open to skeptical. AOS treats it as one hypothesis-generating lens among many — not as settled science or a permanent verdict about who you are.
        </p>
        <p>
          You will leave this session with a candidate pattern — a working hypothesis to test against your lived experience over time. Recognition in a single session is not transformation. Transformation comes from sustained practice.
        </p>
        <p className="text-stone-400 text-sm">
          You can stop at any point. Choosing not to use the Enneagram will not affect your access to any other AOS practice.
        </p>
      </div>
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4 text-stone-300 text-sm">
        If you are currently in acute crisis, experiencing dissociation, or in the early stages of trauma processing, this session may surface difficult material without adequate support. Consider returning when you have more stability, or use this alongside a therapist.
      </div>
      <div className="pt-4">
        <button
          onClick={() => setStep('INTRODUCTION')}
          className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif text-lg rounded-xl transition-all duration-200"
        >
          I understand — let's begin
        </button>
      </div>
    </div>
  );

  const renderIntroduction = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <ConsciousNodeIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
        <h2 className="text-3xl font-serif text-amber-100 mb-2">Understanding the Enneagram</h2>
      </div>

      <div className="space-y-6 text-stone-300 leading-relaxed">
        <div>
          <h3 className="font-serif text-amber-200 text-lg mb-3">The Core Idea</h3>
          <p className="mb-3">
            The Enneagram describes nine recurring patterns of human motivation. Unlike personality systems that describe what you do or how you come across, the Enneagram is concerned with why — the core fear you organize your life around avoiding, the core desire you reach for, and the emotional habit that runs beneath your conscious awareness.
          </p>
          <p>
            Each pattern is a different answer to the question: What must I do or be in order to be okay? No pattern is better or worse than another. Each has its own intelligence, its own blind spots, and its own direction of growth.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-amber-200 text-lg mb-3">The Three Centers</h3>
          <p className="mb-4">
            The nine patterns are grouped into three centers, based on which intelligence dominates your automatic response to the world:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Body Center (Types 8, 9, 1)", text: "Organized around autonomy, boundaries, and the management of anger — whether expressed, suppressed, or forgotten." },
              { label: "Heart Center (Types 2, 3, 4)", text: "Organized around identity, image, and the management of shame — how you maintain a sense of worth in others' eyes and your own." },
              { label: "Head Center (Types 5, 6, 7)", text: "Organized around security, certainty, and the management of fear — how you create safety in an unpredictable world." },
            ].map((card) => (
              <div key={card.label} className="bg-stone-900/50 border border-amber-900/30 rounded-xl p-4">
                <div className="font-serif text-amber-200 text-sm mb-2">{card.label}</div>
                <p className="text-stone-400 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-950/15 border border-amber-900/25 rounded-xl p-5">
          <h3 className="font-serif text-amber-200 text-base mb-3">How This Session Works</h3>
          <p className="text-stone-300 text-sm mb-3">This process moves in stages:</p>
          <ol className="space-y-1 text-stone-400 text-sm">
            <li>1. Identify your center — Body, Heart, or Head</li>
            <li>2. Narrow to a specific pattern through questions about your core motivations</li>
            <li>3. Explore how your pattern shows up under stress and in relationships</li>
            <li>4. Generate a personalized portrait as a working hypothesis</li>
          </ol>
          <p className="text-stone-400 text-sm mt-3 leading-relaxed">
            There are no right answers. The goal is honest self-recognition — which sometimes means sitting with discomfort rather than choosing the answer that sounds best.
          </p>
        </div>
      </div>

      <p className="text-stone-600 text-xs leading-relaxed">
        The Enneagram has modest evidence for supporting self-awareness but limited support for its full theoretical structure. It is one useful map among many — not the territory itself.
      </p>

      <div className="pt-2">
        <button
          onClick={() => setStep('TRIAD_FILTER')}
          className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif text-lg rounded-xl transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderTriadFilter = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <ConsciousNodeIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-amber-100 mb-3">The First Question</h2>
        <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
          When something in your life feels fundamentally wrong or unsafe, what tends to activate first inside you?
        </p>
      </div>

      <div className="space-y-4" role="group" aria-label="Select your center">
        {[
          {
            triad: 'Gut' as Triad,
            label: 'A Physical Response',
            description: 'A bracing in your body — tension in your belly or chest, an urge to assert yourself or push back. A deep resistance to being controlled or overridden, even when you can\'t fully articulate why.',
          },
          {
            triad: 'Heart' as Triad,
            label: 'An Emotional Response',
            description: 'An immediate sensitivity to how this affects your connection to others, or how others are now seeing you. An urge to manage the relationship, your image, or the emotional temperature in the room.',
          },
          {
            triad: 'Head' as Triad,
            label: 'A Mental Response',
            description: 'A scanning, analyzing, planning activation. An urge to gather more information before acting, or to step back and observe the situation from a safe distance rather than entering it immediately.',
          },
        ].map(({ triad, label, description }) => (
          <motion.button
            key={triad}
            onClick={() => handleTriadSelect(triad)}
            whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left p-5 min-h-[44px] rounded-xl border border-stone-800 bg-slate-900/70 hover:bg-slate-800/60 hover:border-amber-600/50 transition-colors duration-200 group"
          >
            <div className="font-serif text-amber-200 text-lg mb-2 group-hover:text-amber-100 transition-colors">{label}</div>
            <div className="text-stone-400 text-sm leading-relaxed group-hover:text-stone-300 transition-colors">{description}</div>
          </motion.button>
        ))}
      </div>

      {!showTiebreaker && (
        <button
          onClick={() => setShowTiebreaker(true)}
          className="text-xs text-stone-500 hover:text-stone-400 transition-colors underline underline-offset-2 mt-2"
        >
          I genuinely can't choose
        </button>
      )}

      {showTiebreaker && (
        <div className="mt-6 p-5 bg-stone-900/60 border border-amber-900/40 rounded-xl animate-in fade-in duration-400">
          <p className="text-amber-200/80 font-serif text-base mb-4 leading-relaxed">
            When you imagine being completely at peace — what has disappeared?
          </p>
          <div className="space-y-3">
            {[
              { triad: 'Gut' as Triad, text: 'Conflict has stopped.' },
              { triad: 'Heart' as Triad, text: 'Everyone is okay and genuinely connected to me.' },
              { triad: 'Head' as Triad, text: 'All threats have been identified and accounted for.' },
            ].map(({ triad, text }) => (
              <motion.button
                key={triad}
                onClick={() => handleTriadSelect(triad)}
                whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left px-4 py-3 min-h-[44px] rounded-lg border border-stone-800 bg-slate-900/70 hover:bg-slate-800/60 hover:border-amber-600/50 text-stone-300 hover:text-amber-100 text-sm transition-colors duration-200"
              >
                {text}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTriadValidation = () => {
    if (!draft.triadSelection) return null;
    const emotionOpts = triadEmotionOptions[draft.triadSelection];
    const bothAnswered = triadEmotionSelection !== null && somaticSelection !== null;

    // Compute confidence for inline warning
    let showLowConfidenceNote = false;
    if (bothAnswered && draft.triadSelection) {
      const candidateTypes = triadCandidates[draft.triadSelection];
      const emotionMatches = triadEmotionSelection !== null && candidateTypes.includes(triadEmotionSelection);
      const somaticMatches = somaticSelection === draft.triadSelection;
      const confirmations = [emotionMatches, somaticMatches].filter(Boolean).length;
      showLowConfidenceNote = confirmations === 0;
    }

    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <InquiryVortexIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-amber-100 mb-2">Two More Questions</h2>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            These help us confirm the center you selected.
          </p>
        </div>

        {/* Section 1: Core Emotional Relationship */}
        <div className="space-y-4">
          <p className="text-stone-300 leading-relaxed text-sm">
            Each center has a core emotion that its patterns are organized around — not necessarily the emotion you feel most, but the one your personality is built to manage. Which of these fits?
          </p>
          <div className="space-y-3">
            {emotionOpts.map((opt) => (
              <motion.button
                key={opt.type}
                onClick={() => setTriadEmotionSelection(opt.type)}
                whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 min-h-[44px] rounded-xl border transition-colors duration-200 ${
                  triadEmotionSelection === opt.type
                    ? 'border-amber-600/50 bg-slate-800/60 text-stone-200'
                    : 'border-slate-800 bg-slate-900/70 text-stone-400 hover:border-amber-600/50 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-sm leading-relaxed">{opt.text}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section 2: Somatic Signature */}
        <div className="space-y-4">
          <p className="text-stone-300 leading-relaxed text-sm">
            When your pattern is running strongly — when you're in the grip of it rather than choosing it — where do you feel it most in your body?
          </p>
          <div className="space-y-3">
            {somaticOptions.map((opt) => (
              <motion.button
                key={opt.signal}
                onClick={() => setSomaticSelection(opt.signal)}
                whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 min-h-[44px] rounded-xl border transition-colors duration-200 ${
                  somaticSelection === opt.signal
                    ? 'border-amber-600/50 bg-slate-800/60 text-stone-200'
                    : 'border-slate-800 bg-slate-900/70 text-stone-400 hover:border-amber-600/50 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-sm leading-relaxed">{opt.text}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {showLowConfidenceNote && (
          <div className="bg-stone-900/60 border border-amber-900/30 rounded-xl p-4">
            <p className="text-amber-200/70 text-xs leading-relaxed">
              Your responses here point in a different direction than your initial selection. That's worth noting. We'll continue with your original choice and the portrait will account for this ambiguity.
            </p>
          </div>
        )}

        <button
          disabled={!bothAnswered}
          onClick={handleTriadValidationContinue}
          className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  };

  const renderMotivationMap = () => {
    if (!draft.triadSelection || pairs.length === 0) return null;
    const currentPair = pairs[pairIndex];
    if (!currentPair) return null;

    return (
      <div className={`space-y-6 max-w-2xl mx-auto transition-opacity duration-300 ${pairTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center mb-8">
          <InquiryVortexIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-amber-100 mb-3">Choose the Closer Truth</h2>
          <p className="text-stone-400 text-sm">Neither may fit perfectly. Choose the one that lands as more honest.</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 mb-6">
          <p className="text-stone-300 leading-relaxed font-serif">{currentPair.q}</p>
        </div>

        <div className="space-y-4">
          {currentPair.options.map((opt) => (
            <motion.button
              key={opt.type}
              onClick={() => handleForcedChoice(opt.type)}
              whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-5 min-h-[44px] rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800/60 hover:border-amber-600/50 transition-colors duration-200 group"
            >
              <p className="text-stone-300 text-sm leading-relaxed group-hover:text-stone-200 transition-colors">{opt.text}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderPatternsInAction = () => {
    if (!draft.triadSelection) return null;
    const stressOpts = stressOptions[draft.triadSelection];
    const relationalOpts = relationalOptions[draft.triadSelection];
    const canContinue = stressSelection !== null && relationalSelection !== null && patternNarrativeLocal.trim().length >= 25;

    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <InquiryVortexIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-amber-100 mb-2">Patterns in Action</h2>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            How your pattern shows up when it matters most.
          </p>
        </div>

        {/* Section 1: Under Stress */}
        <div className="space-y-4">
          <p className="text-stone-300 leading-relaxed text-sm">
            When you are under prolonged, genuine pressure — not a momentary frustration, but sustained stress — which of these do you tend to fall into?
          </p>
          <div className="space-y-3" role="group" aria-label="Stress response options">
            {stressOpts.map((opt) => (
              <motion.button
                key={opt.type}
                onClick={() => setStressSelection(opt.type)}
                aria-pressed={stressSelection === opt.type}
                whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 min-h-[44px] rounded-xl border transition-colors duration-200 ${
                  stressSelection === opt.type
                    ? 'border-amber-600/50 bg-slate-800/60 text-stone-200'
                    : 'border-slate-800 bg-slate-900/70 text-stone-400 hover:border-amber-600/50 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-sm leading-relaxed">{opt.text}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section 2: In Close Relationships */}
        <div className="space-y-4">
          <p className="text-stone-300 leading-relaxed text-sm">
            In your closest relationships — partners, deep friendships, family — what role do you most often fall into, even when you don't want to?
          </p>
          <div className="space-y-3" role="group" aria-label="Relational role options">
            {relationalOpts.map((opt) => (
              <motion.button
                key={opt.type}
                onClick={() => setRelationalSelection(opt.type)}
                aria-pressed={relationalSelection === opt.type}
                whileHover={{ scale: 1.01, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 min-h-[44px] rounded-xl border transition-colors duration-200 ${
                  relationalSelection === opt.type
                    ? 'border-amber-600/50 bg-slate-800/60 text-stone-200'
                    : 'border-slate-800 bg-slate-900/70 text-stone-400 hover:border-amber-600/50 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-sm leading-relaxed">{opt.text}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section 3: Pattern Narrative */}
        <div className="space-y-2">
          <label className="block text-sm text-stone-400">
            Briefly describe a pattern that keeps repeating in your life or relationships — what you tend to do, how others typically respond, and what it costs you.
          </label>
          <p className="text-stone-400 text-sm italic mb-3">Before writing, take a breath and notice where in your body you feel most activated right now. Let that sensation be present as you describe the pattern.</p>
          <textarea
            value={patternNarrativeLocal}
            onChange={e => setPatternNarrativeLocal(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none leading-relaxed"
            placeholder="Describe a recurring pattern in your own words..."
          />
          <div className="text-right text-xs text-stone-600">
            {patternNarrativeLocal.trim().length}/25 min
          </div>
        </div>

        <button
          disabled={!canContinue || isGeneratingDisambig}
          onClick={handlePatternsInActionContinue}
          className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGeneratingDisambig ? 'Preparing next question...' : 'Continue'}
        </button>
      </div>
    );
  };

  const renderDisambiguation = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <AstralCompassIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-amber-100 mb-3">One More Question</h2>
        <p className="text-stone-400 max-w-lg mx-auto text-sm leading-relaxed">
          Your responses so far point in two directions. This question helps distinguish between them.
        </p>
      </div>

      {isGeneratingDisambig ? (
        <div className="text-center py-12" aria-live="polite">
          <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">Generating question...</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-950/15 border border-amber-900/25 rounded-xl p-6">
            <p className="text-amber-100 font-serif text-lg leading-relaxed">{draft.disambiguationQuestion}</p>
          </div>

          <div>
            <label className="block text-sm text-stone-400 mb-2">
              Your response <span className="text-stone-600">(minimum 30 characters)</span>
            </label>
            <p className="text-stone-400 text-sm italic mb-3">Pause for a moment. Feel into your body before responding — notice any tightening, opening, or neutrality as you consider this question.</p>
            <textarea
              value={draft.disambiguationResponse}
              onChange={e => updateDraft({ disambiguationResponse: e.target.value })}
              className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500/50 min-h-[140px] resize-none leading-relaxed"
              placeholder="Take your time. Write in your own words — don't try to answer 'correctly'."
            />
            <div className="text-right text-xs text-stone-600 mt-1">
              {draft.disambiguationResponse.length}/30 min
            </div>
          </div>

          <button
            disabled={draft.disambiguationResponse.trim().length < 30 || isGeneratingPortrait}
            onClick={async () => {
              await generatePortrait();
              setStep('PORTRAIT');
            }}
            className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGeneratingPortrait ? 'Generating portrait...' : 'Continue'}
          </button>
        </>
      )}
    </div>
  );

  const renderPortrait = () => {
    const type = draft.provisionalType || draft.primaryCandidate;
    const passion = passionDescriptions[type];

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <AstralCompassIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-amber-100 mb-2">Your Provisional Portrait</h2>
          <p className="text-stone-500 text-xs uppercase tracking-widest">A working hypothesis — not a verdict</p>
        </div>

        {isGeneratingPortrait ? (
          <div className="text-center py-12" aria-live="polite">
            <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500 text-sm">Generating your portrait...</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
              <p className="text-stone-200 leading-relaxed font-serif text-base">{draft.portrait}</p>
            </div>

            {passion && (
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5">
                <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Associated pattern: the {passion.name}</div>
                <p className="text-stone-400 text-sm leading-relaxed">{passion.description}</p>
              </div>
            )}

            <div className="border-t border-stone-800/50 pt-4">
              <p className="text-stone-500 text-xs leading-relaxed italic">
                Recognition is not transformation. This portrait becomes useful through sustained practice — not through a single session of self-reflection.
              </p>
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-2">
                What does this portrait miss or get wrong?{' '}
                <span className="text-stone-600">(minimum 20 characters)</span>
              </label>
              <p className="text-stone-400 text-sm italic mb-3">Read your portrait once more. Notice your felt response — agreement, resistance, or ambivalence — before writing.</p>
              <textarea
                value={draft.disconfirmationResponse}
                onChange={e => updateDraft({ disconfirmationResponse: e.target.value })}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500/50 min-h-[100px] resize-none leading-relaxed"
                placeholder="Describe what doesn't fit, or what feels misrepresented..."
              />
              <div className="text-right text-xs text-stone-600 mt-1">
                {draft.disconfirmationResponse.length}/20 min
              </div>
            </div>

            <button
              disabled={draft.disconfirmationResponse.trim().length < 20 || isGeneratingRec}
              onClick={async () => {
                const rec = await generateRecommendation();
                await handleCompletion(rec);
                setStep('GROWTH_AND_COMPLETION');
              }}
              className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/40 hover:border-amber-600/60 text-amber-100 font-serif rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGeneratingRec ? 'Generating...' : 'Continue'}
            </button>
          </>
        )}
      </div>
    );
  };

  const renderGrowthAndCompletion = () => {
    const type = draft.provisionalType || draft.primaryCandidate;
    const growthEdge = growthEdges[type];
    const prescription = wizardPrescriptions[type];

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-stone-900/40 border border-amber-900/30 rounded-lg p-4 mb-6 text-stone-300 text-sm italic">
          A pattern has just been named. Before moving to growth, take a moment: What do you notice in your body? What feeling or memory does this portrait bring up? You don't need to write this — just allow it.
        </div>
        <div className="text-center mb-6">
          <MerkabaIcon className="w-12 h-12 text-amber-400/75 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-amber-100 mb-2">Your Growth Edge</h2>
          <p className="text-stone-500 text-xs uppercase tracking-widest">Where sustained practice begins</p>
        </div>

        {/* Section 1: Growth edge */}
        {growthEdge && (
          <>
            <div className="bg-amber-950/15 border border-amber-900/25 rounded-xl p-5">
              <div className="text-xs text-amber-500/70 uppercase tracking-widest mb-2">Growth edge</div>
              <p className="text-amber-100 font-serif leading-relaxed">{growthEdge.edge}</p>
            </div>
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
              <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Operational target</div>
              <p className="text-stone-300 text-sm leading-relaxed">{growthEdge.operationalTarget}</p>
            </div>
          </>
        )}

        {/* Section 2: AI practice recommendation */}
        {isGeneratingRec ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-stone-500 text-sm">Generating recommendation...</p>
          </div>
        ) : draft.practiceRecommendation ? (
          <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-5">
            <div className="text-xs text-stone-500 uppercase tracking-widest mb-3">Practice recommendation</div>
            <p className="text-stone-300 text-sm leading-relaxed">{draft.practiceRecommendation}</p>
          </div>
        ) : null}

        {/* Section 3: Wizard recommendation cards */}
        {prescription && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500 uppercase tracking-widest">Recommended next practices</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[prescription.primary, prescription.secondary].map((p, i) => (
                <div
                  key={p.wizardId}
                  className="p-4 bg-stone-900/40 border border-amber-900/30 rounded-xl"
                >
                  <div className="text-xs text-amber-500/70 uppercase tracking-widest mb-1">
                    {i === 0 ? 'Primary' : 'Secondary'}
                  </div>
                  <div className="text-amber-100 font-serif mb-2">{p.label}</div>
                  <p className="text-stone-400 text-xs leading-relaxed">{p.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Completion area */}
        <div className="space-y-4 border-t border-stone-800/50 pt-6">
          {isSaving ? (
            <p className="text-stone-400 text-sm text-center">Saving your session...</p>
          ) : saveError ? (
            <p className="text-rose-400 text-sm text-center">{saveError}</p>
          ) : saveSuccess ? (
            <div className="text-emerald-400 text-sm text-center mt-2">Session saved.</div>
          ) : null}

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <p className="text-stone-300 text-sm leading-relaxed font-serif italic">
              Recognition is not transformation. This portrait becomes useful through sustained practice over time — not through a single session of self-reflection.
            </p>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4">
            <p className="text-stone-400 text-xs leading-relaxed">
              If this exploration has touched something that feels too large to hold alone, the IFS wizard offers a more supported container for working with intense emotional material.
            </p>
          </div>

          {prescription && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[prescription.primary, prescription.secondary].map((p, i) => (
                <button
                  key={p.wizardId}
                  onClick={onClose}
                  className="p-4 bg-stone-900/40 border border-amber-900/30 hover:border-amber-500/40 rounded-xl transition-all duration-300 text-left group"
                >
                  <div className="text-xs text-amber-500/70 uppercase tracking-widest mb-1">
                    {i === 0 ? 'Begin here' : 'Then here'}
                  </div>
                  <div className="text-amber-100 font-serif group-hover:text-amber-50 transition-colors">{p.label}</div>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-stone-300 text-sm font-medium">How might this pattern show up in your closest relationship?</label>
            <textarea
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm resize-none focus:outline-none focus:border-amber-700"
              rows={3}
              placeholder="Optional — notice how this pattern shapes how you show up with others"
              value={draft.relationalReflection || ''}
              onChange={(e) => updateDraft({ relationalReflection: e.target.value })}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full px-8 py-3 min-h-[44px] bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-xl transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    switch (step) {
      case 'EPISTEMIC_FRAME': return renderEpistemicFrame();
      case 'INTRODUCTION': return renderIntroduction();
      case 'TRIAD_FILTER': return renderTriadFilter();
      case 'TRIAD_VALIDATION': return renderTriadValidation();
      case 'MOTIVATION_MAP': return renderMotivationMap();
      case 'PATTERNS_IN_ACTION': return renderPatternsInAction();
      case 'DISAMBIGUATION': return renderDisambiguation();
      case 'PORTRAIT': return renderPortrait();
      case 'GROWTH_AND_COMPLETION': return renderGrowthAndCompletion();
    }
  };

  const showBack = step !== 'EPISTEMIC_FRAME' && step !== 'GROWTH_AND_COMPLETION';

  return (
    <WizardFrame
      onClose={onClose}
      title="Enneagram Compass"
      accentColor="amber"
      currentStep={currentStepIndex + 1}
      totalSteps={9}
      onNext={() => {}}
      onBack={showBack ? handleBack : () => {}}
      showBackButton={showBack}
      nextButtonDisabled={true}
      nextButtonText=""
    >
      <div className="max-w-2xl mx-auto py-4 px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </WizardFrame>
  );
}
