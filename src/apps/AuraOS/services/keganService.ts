// services/keganService.ts
// Meaning-Making Mirror — Revised Kegan Assessment Architecture
// Implements: narrative-first, three-strategy scoring, confound detection,
// cultural sensitivity, adaptive probes, counter-perspective injection

export const KEGAN_FORCED_CHOICE_QUESTIONS = [
  {
    id: 'fc-work-1',
    domain: 'Work',
    question: 'When you receive critical feedback at work, which response feels more natural to you?',
    optionA: 'I feel hurt or defensive at first, then try to figure out if they\'re right',
    optionB: 'I try to evaluate whether the feedback reflects a standard I actually endorse',
  },
  {
    id: 'fc-identity-1',
    domain: 'Identity',
    question: 'When someone close to you disapproves of a decision you\'ve made, you typically:',
    optionA: 'Feel genuinely troubled — their opinion matters deeply to how you feel about yourself',
    optionB: 'Feel the tension, but remain anchored in your own reasoning about the decision',
  },
  {
    id: 'fc-values-1',
    domain: 'Values',
    question: 'When two things you deeply believe seem to contradict each other, you tend to:',
    optionA: 'Feel confused or unsettled — it\'s hard to hold both at once',
    optionB: 'See the tension as useful information about the limits of each belief',
  },
  {
    id: 'fc-relationships-1',
    domain: 'Relationships',
    question: 'In close relationships, conflict typically feels like:',
    optionA: 'A threat to the relationship that needs to be resolved or avoided',
    optionB: 'An opportunity to understand each other more accurately',
  },
  {
    id: 'fc-work-2',
    domain: 'Work',
    question: 'When you disagree with your organization\'s direction, you are more likely to:',
    optionA: 'Feel conflicted — you want to be loyal but something feels off',
    optionB: 'Distinguish between your commitment to the work and your assessment of the decision',
  },
  {
    id: 'fc-identity-2',
    domain: 'Identity',
    question: 'Your sense of who you are feels:',
    optionA: 'Largely shaped by your relationships, roles, and what matters to the people around you',
    optionB: 'Grounded in a set of values and commitments you\'ve developed and own yourself',
  },
] as const;

import { z } from 'zod';
import { callGrokThenAIJson, generateText } from './ai/aiCore';

const MIN_RESPONSE_LENGTH_FOR_SECOND_PROBE = 40;
const MIN_COUNTER_PERSPECTIVE_LENGTH = 20;
import {
  KeganInterpretation,
  KeganNarrativeResponse,
  KeganDilemmaProbe,
  KeganConfoundAnalysis,
  KeganScoringResult,
  KeganStructuralCoding,
  KeganComparativeRating,
  KeganAdversarialScoring,
  KeganPracticeRecommendation,
  KeganForcedChoiceAnswer,
  KeganDilemmaSetup,
} from '../types';

// ─── Domain Selection Options ─────────────────────────────────────────────────

export const KEGAN_DOMAINS = [
  { id: 'work', label: 'Work & Career', description: 'Professional identity, leadership, organizational dynamics' },
  { id: 'relationships', label: 'Close Relationships', description: 'Partnerships, family, intimate friendships' },
  { id: 'self', label: 'Relationship with Yourself', description: 'Inner life, self-perception, personal struggles' },
  { id: 'groups', label: 'Groups & Institutions', description: 'Communities, culture, social belonging' },
  { id: 'meaning', label: 'Purpose & Meaning', description: 'Values, spirituality, life direction' },
] as const;

export type KeganDomainId = typeof KEGAN_DOMAINS[number]['id'];

// ─── Cultural Context ─────────────────────────────────────────────────────────

export const CULTURAL_CONTEXT_OPTIONS = [
  { id: 'western-individualist', label: 'Western / Individualist' },
  { id: 'east-asian', label: 'East Asian' },
  { id: 'south-asian', label: 'South Asian' },
  { id: 'latin-american', label: 'Latin American' },
  { id: 'african', label: 'African' },
  { id: 'middle-eastern', label: 'Middle Eastern' },
  { id: 'mixed', label: 'Mixed / Multicultural' },
  { id: 'other', label: 'Other' },
  { id: 'prefer-not', label: 'Prefer not to say' },
] as const;

export type CulturalContextId = typeof CULTURAL_CONTEXT_OPTIONS[number]['id'];

export const AGE_RANGE_OPTIONS = [
  '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Prefer not to say',
] as const;

export type AgeRange = typeof AGE_RANGE_OPTIONS[number];

export interface UserContext {
  ageRange: AgeRange | null;
  culturalContext: CulturalContextId | null;
}

// ─── Narrative Prompts by Domain ──────────────────────────────────────────────

export const NARRATIVE_PROMPTS: Record<KeganDomainId, string[]> = {
  work: [
    'Tell me about a time at work when you had to make a decision that felt significant — where you weren\'t sure what the right move was, or where different considerations pulled you in different directions.',
    'Describe a moment when you received feedback or criticism that really landed — whether you agreed with it or not. What happened, and what did you do with it?',
    'Tell me about a time when what your organization or team expected of you conflicted with your own sense of what was right or important.',
  ],
  relationships: [
    'Tell me about a conflict or tension in an important relationship — a moment when you and someone you care about saw things differently, or wanted different things.',
    'Describe a time when someone close to you needed something from you that was hard to give, or when you needed something from them that was hard to ask for.',
    'Tell me about a moment when you felt truly seen by someone — or when you realized they didn\'t see you the way you see yourself.',
  ],
  self: [
    'Tell me about a time when you surprised yourself — when you acted in a way you didn\'t expect, or discovered something about yourself you hadn\'t known.',
    'Describe a period when you felt lost or uncertain about who you were or what you wanted. What was that like? How did you navigate it?',
    'Tell me about something you believe about yourself that has changed significantly over time. What shifted, and how?',
  ],
  groups: [
    'Tell me about a time when you found yourself at odds with a group you belonged to — whether a community, organization, or cultural context. What happened?',
    'Describe a moment when belonging to a group felt particularly important or meaningful. What made it so?',
    'Tell me about a time when the values or expectations of your broader culture or community conflicted with something you personally felt was true or right.',
  ],
  meaning: [
    'Tell me about a time when you questioned something you had previously held as true or important — a belief, a value, a commitment. What prompted the questioning?',
    'Describe a moment when you felt a deep sense of purpose or meaning. What was happening? What made it feel that way?',
    'Tell me about a decision you made that was grounded in your values, especially if it came at some cost. What guided you?',
  ],
};

// ─── Fixed Probe Questions ────────────────────────────────────────────────────

export const FIXED_PROBES = [
  'What felt most at stake for you in this situation?',
  'What do you think the other people involved would say was going on, if they were telling this story?',
  'Looking back, what if anything would you do differently, and why?',
] as const;

// ─── Adaptive Probe Types ─────────────────────────────────────────────────────

export const PROBE_TYPES = {
  perspectiveCoordination: {
    target: 'Can they hold multiple perspectives simultaneously vs. collapsing to one?',
    exemplars: [
      'You mentioned seeing it from [X]\'s point of view. Was there a moment where their view and yours felt genuinely irreconcilable? What did you do with that?',
      'You described understanding why they felt that way. But did understanding it change anything for you, or did you still see it differently?',
      'If someone you respect deeply held the opposite view, how would you make sense of that?',
    ],
  },
  valueOrigin: {
    target: 'Are values received/embedded or authored/examined?',
    exemplars: [
      'You said [value] was important here. Where does that value come from for you? Has there been a time when it didn\'t serve you well?',
      'When did you first realize that mattered to you? Was there a moment it became yours rather than something you inherited?',
      'If that value conflicted with another thing you care about, how would you decide which wins?',
    ],
  },
  frameReflexivity: {
    target: 'Can they see their own lens as a lens?',
    exemplars: [
      'You\'ve described how you made sense of this. Can you imagine someone you respect making sense of it in a fundamentally different way? What would that look like?',
      'What assumptions might you be making that someone else wouldn\'t share?',
      'Is there a way of seeing this situation that you\'ve considered but rejected? What made you reject it?',
    ],
  },
  authorityRelation: {
    target: 'How do they relate to external authority/norms?',
    exemplars: [
      'Was there a \'right answer\' here according to your organization, family, or culture? How did you relate to that?',
      'Did you look to anyone or anything external for guidance? What did you do with what you found?',
      'If an expert you trusted told you the opposite, what would you do with that?',
    ],
  },
  espousedVsLived: {
    target: 'Does their self-theory match their actual meaning-making?',
    exemplars: [
      'You mentioned valuing [X]. Can you tell me about a time recently when you *didn\'t* manage to live that? What happened inside?',
      'That\'s a clear principle. When is it hardest to hold onto? What happens then?',
      'You describe yourself as someone who [X]. Has there been a moment recently when that wasn\'t true? What was that like?',
    ],
  },
} as const;

export type ProbeType = keyof typeof PROBE_TYPES;

// ─── Scaffolded Story Builder ─────────────────────────────────────────────────

export interface ScaffoldedStoryParts {
  whoInvolved: string;
  whatHappened: string;
  whatYouDid: string;
  whatYouFelt: string;
  whatWasAtStake: string;
}

export function assembleScaffoldedStory(parts: ScaffoldedStoryParts): string {
  const segments: string[] = [];
  if (parts.whatHappened.trim()) segments.push(parts.whatHappened.trim());
  if (parts.whoInvolved.trim()) segments.push(`The people involved were ${parts.whoInvolved.trim()}.`);
  if (parts.whatYouDid.trim()) segments.push(parts.whatYouDid.trim());
  if (parts.whatYouFelt.trim()) segments.push(`I felt ${parts.whatYouFelt.trim()}.`);
  if (parts.whatWasAtStake.trim()) segments.push(`What felt most at stake was ${parts.whatWasAtStake.trim()}.`);
  return segments.join(' ');
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const confoundAnalysisSchema = z.object({
  theoryFluency: z.number().min(0).max(3),
  performativeComplexity: z.number().min(0).max(3),
  aspirationalResponding: z.number().min(0).max(3),
  narrativeRichness: z.number().min(0).max(3),
  rationale: z.string(),
});

const adaptiveProbeSchema = z.object({
  probeType: z.enum([
    'perspectiveCoordination',
    'valueOrigin',
    'frameReflexivity',
    'authorityRelation',
    'espousedVsLived',
  ]),
  question: z.string(),
  rationale: z.string(),
});

const structuralCodingSchema = z.object({
  subjectFusion: z.string(),
  objectCapacity: z.string(),
  conflictHandling: z.string(),
  keyEvidence: z.array(z.object({
    quote: z.string(),
    annotation: z.string(),
  })),
  preliminaryScore: z.number(),
  confidence: z.enum(['high', 'medium', 'low']),
});

const comparativeRatingSchema = z.object({
  mostSimilarExemplar: z.number().min(1).max(4),
  similarities: z.array(z.object({
    exemplarNumber: z.number(),
    similarityScore: z.number().min(0).max(10),
    explanation: z.string(),
  })),
  suggestedScore: z.number(),
});

const adversarialScoringSchema = z.object({
  caseForStage2: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  caseForStage3: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  caseForTransition3to4: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  caseForStage4: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  caseForTransition4to5: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  caseForStage5: z.object({ strength: z.enum(['strong', 'moderate', 'weak', 'none']), evidence: z.string() }),
  disambiguationNeeded: z.string(),
});

const finalInterpretationSchema = z.object({
  centerOfGravityLabel: z.string(),
  numericScore: z.number(),
  confidenceLevel: z.enum(['clear_signal', 'suggestive_pattern', 'insufficient_data']),
  subjectObjectMap: z.object({
    subjectTo: z.string(),
    objectTo: z.string(),
  }),
  domainVariation: z.string(),
  consolidationStrengths: z.string(),
  growthFrontier: z.string(),
  tightness: z.string(),
  practiceRecommendation: z.object({
    storyReference: z.string(),
    practice: z.string(),
    observation: z.string(),
  }),
});

// ─── Helpers: Build Transcript ────────────────────────────────────────────────

function buildNarrativeTranscript(narratives: KeganNarrativeResponse[]): string {
  return narratives.map((n, i) => {
    const probeLines = n.adaptiveProbeResponses
      ?.map(p => `Adaptive probe (${p.probeType}): ${p.response}`)
      .join('\n') || '';

    return `
NARRATIVE ${i + 1} (${n.domain}):
Prompt: ${n.promptUsed}
Story: ${n.story}
Stakes: ${n.stakesResponse}
Perspective: ${n.perspectiveResponse}
Retrospective: ${n.retrospectiveResponse}
${probeLines}`.trim();
  }).join('\n\n---\n\n');
}

function buildDilemmaTranscript(dilemma?: KeganDilemmaProbe): string {
  if (!dilemma) return '';
  return `
DILEMMA PROBE:
Prompt: ${dilemma.dilemmaPrompt}
Situation described: ${dilemma.userDilemma}
Response: ${dilemma.narrativeResponse}
Counter-perspective offered: ${dilemma.counterPerspective}
Reaction to counter-perspective: ${dilemma.counterPerspectiveResponse || 'Not provided'}`.trim();
}

function buildCulturalCaveat(ctx?: UserContext | null): string {
  if (!ctx?.culturalContext || ctx.culturalContext === 'prefer-not') return '';
  const nonWestern = ctx.culturalContext !== 'western-individualist';
  if (!nonWestern) return '';
  return `
CULTURAL CONTEXT NOTE: The user identifies with a ${ctx.culturalContext} cultural background.
Be cautious about interpreting strong relational orientation as structural embeddedness (Stage 3).
Culturally mature relational prioritization can coexist with self-authored or even meta-systemic
meaning-making. Look for OTHER structural indicators (conflict handling, authority relation,
frame reflexivity) before scoring relational emphasis as evidence of Socialized Mind.`;
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const CONFOUND_FALLBACK: KeganConfoundAnalysis = {
  theoryFluency: 0,
  performativeComplexity: 0,
  aspirationalResponding: 1,
  narrativeRichness: 2,
  rationale: 'Unable to analyze confounds; using conservative defaults.',
};

const STRUCTURAL_FALLBACK: KeganStructuralCoding = {
  subjectFusion: 'Unable to determine from available data.',
  objectCapacity: 'Unable to determine from available data.',
  conflictHandling: 'Unable to determine from available data.',
  keyEvidence: [],
  preliminaryScore: 3.0,
  confidence: 'low',
};

const COMPARATIVE_FALLBACK: KeganComparativeRating = {
  mostSimilarExemplar: 2,
  similarities: [
    { exemplarNumber: 1, similarityScore: 5, explanation: 'Unable to compare' },
    { exemplarNumber: 2, similarityScore: 5, explanation: 'Unable to compare' },
    { exemplarNumber: 3, similarityScore: 5, explanation: 'Unable to compare' },
    { exemplarNumber: 4, similarityScore: 5, explanation: 'Unable to compare' },
  ],
  suggestedScore: 3.5,
};

const ADVERSARIAL_FALLBACK: KeganAdversarialScoring = {
  caseForStage2: { strength: 'none', evidence: 'Unable to analyze' },
  caseForStage3: { strength: 'moderate', evidence: 'Default conservative assumption' },
  caseForTransition3to4: { strength: 'weak', evidence: 'Unable to analyze' },
  caseForStage4: { strength: 'weak', evidence: 'Unable to analyze' },
  caseForTransition4to5: { strength: 'none', evidence: 'Unable to analyze' },
  caseForStage5: { strength: 'none', evidence: 'Unable to analyze' },
  disambiguationNeeded: 'More narrative data needed for confident scoring.',
};

const INTERPRETATION_FALLBACK: KeganInterpretation = {
  centerOfGravityLabel: 'Assessment Incomplete',
  numericScore: 3.0,
  confidenceLevel: 'insufficient_data',
  subjectObjectMap: { subjectTo: 'Unable to determine.', objectTo: 'Unable to determine.' },
  domainVariation: 'Insufficient data for domain analysis.',
  consolidationStrengths: 'More data needed.',
  growthFrontier: 'More data needed.',
  tightness: 'Unable to assess.',
  practiceRecommendation: {
    storyReference: '',
    practice: 'Consider retaking with more detailed narratives.',
    observation: '',
  },
};

// ─── Confound Detection ───────────────────────────────────────────────────────

export async function analyzeConfounds(
  narratives: KeganNarrativeResponse[],
  dilemmaResponse?: KeganDilemmaProbe
): Promise<KeganConfoundAnalysis> {
  const transcript = buildNarrativeTranscript(narratives);
  const dilemmaSection = buildDilemmaTranscript(dilemmaResponse);

  const prompt = `You are a methodological analyst reviewing developmental assessment data for potential confounds.

Analyze this transcript for the following confounds:

1. THEORY_FLUENCY: Does the user employ developmental theory terminology (e.g., "subject-object," "self-authoring," "perspective-taking" as technical terms, Kegan stage language, explicit developmental framework references)? Rate 0-3.
   0: No theory language
   1: Occasional therapy/growth language but not developmental theory
   2: Some developmental concepts used naturally
   3: Heavy use of technical developmental terminology

2. PERFORMATIVE_COMPLEXITY: Does the language complexity/abstraction level appear significantly higher than what the actual described behaviors and emotions suggest? Look for: sophisticated meta-commentary that doesn't match the concrete experience described; using complex frameworks to describe simple situations. Rate 0-3.
   0: Language matches experience level
   1: Slightly elevated abstraction
   2: Notable gap between language sophistication and experience described
   3: Clear performance of complexity beyond lived experience

3. ASPIRATIONAL_RESPONDING: Are there signals the user is describing who they want to be rather than how they actually experienced the situation? Look for: absence of struggle, overly neat resolutions, language like "I always" or "I've learned to," moral-of-the-story conclusions, positioning self as having figured it out. Rate 0-3.
   0: Raw, unprocessed, struggle-present experience
   1: Some processing but struggle still visible
   2: Notable smoothing/resolution of difficult material
   3: Clearly describing ideal self rather than actual experience

4. NARRATIVE_RICHNESS: How much concrete, specific, emotionally-textured detail is present vs. abstract generalization? Rate 0-3.
   0: Mostly abstract, thin on specifics
   1: Some concrete detail but largely general
   2: Good mix of concrete and reflective
   3: Rich, specific, emotionally present throughout

TRANSCRIPT:
${transcript}

${dilemmaSection}

Return JSON only:
{
  "theoryFluency": <0-3>,
  "performativeComplexity": <0-3>,
  "aspirationalResponding": <0-3>,
  "narrativeRichness": <0-3>,
  "rationale": "<brief explanation of key observations>"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<KeganConfoundAnalysis>(
      'AnalyzeKeganConfounds',
      prompt,
      'openrouter/free',
      confoundAnalysisSchema
    );
    return result || CONFOUND_FALLBACK;
  } catch (err) {
    console.error('[KeganService] analyzeConfounds failed:', err);
    return CONFOUND_FALLBACK;
  }
}

// ─── Adaptive Probe Generation ────────────────────────────────────────────────

export async function generateAdaptiveProbe(
  narrative: KeganNarrativeResponse,
  existingProbeTypes: ProbeType[]
): Promise<{ probeType: ProbeType; question: string }> {
  const fallback: { probeType: ProbeType; question: string } = {
    probeType: 'espousedVsLived',
    question: 'You\'ve described how you see this. Was there a moment when you didn\'t live up to that — when your actions didn\'t match what you\'ve said matters to you? What happened inside then?',
  };

  const availableTypes = (Object.keys(PROBE_TYPES) as ProbeType[]).filter(
    t => !existingProbeTypes.includes(t)
  );

  if (availableTypes.length === 0) return fallback;

  const probeTypesDescription = availableTypes.map(t => {
    const pt = PROBE_TYPES[t];
    return `${t}:\n  Target: ${pt.target}\n  Exemplars:\n${pt.exemplars.map(e => `    - "${e}"`).join('\n')}`;
  }).join('\n\n');

  const prompt = `You are a developmental interviewer trained in the Subject-Object Interview method.

The user has shared this narrative:

DOMAIN: ${narrative.domain}
STORY: ${narrative.story}
STAKES: ${narrative.stakesResponse}
PERSPECTIVE: ${narrative.perspectiveResponse}
RETROSPECTIVE: ${narrative.retrospectiveResponse}

Based on what's most structurally ambiguous or revealing in this narrative, select ONE probe type and generate a specific follow-up question.

AVAILABLE PROBE TYPES:
${probeTypesDescription}

Your question must:
- Reference concrete details from THEIR story (names, situations, feelings they mentioned)
- Target the structural feature that is most unclear or potentially revealing
- Feel like a genuine curious follow-up, not a test or a lecture
- Be one focused question, not compound

Return JSON only:
{
  "probeType": "<one of: ${availableTypes.join(', ')}>",
  "question": "<your specific question referencing their story>",
  "rationale": "<why this probe type for this narrative>"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<{ probeType: ProbeType; question: string; rationale: string }>(
      'GenerateAdaptiveProbe',
      prompt,
      'openrouter/free',
      adaptiveProbeSchema
    );
    if (result && availableTypes.includes(result.probeType)) {
      return { probeType: result.probeType, question: result.question };
    }
    return fallback;
  } catch (err) {
    console.error('[KeganService] generateAdaptiveProbe failed:', err);
    return fallback;
  }
}

// ─── Second Adaptive Probe (when signal is ambiguous) ─────────────────────────

export async function generateSecondAdaptiveProbe(
  narrative: KeganNarrativeResponse,
  firstProbe: { probeType: ProbeType; question: string; response: string },
  existingProbeTypes: ProbeType[]
): Promise<{ probeType: ProbeType; question: string } | null> {
  // Only generate a second probe if the first response was rich enough to warrant it
  if (firstProbe.response.trim().length < MIN_RESPONSE_LENGTH_FOR_SECOND_PROBE) return null;

  const allUsed = [...existingProbeTypes, firstProbe.probeType];
  const availableTypes = (Object.keys(PROBE_TYPES) as ProbeType[]).filter(
    t => !allUsed.includes(t)
  );

  if (availableTypes.length === 0) return null;

  const probeTypesDescription = availableTypes.map(t => {
    const pt = PROBE_TYPES[t];
    return `${t}: Target: ${pt.target}`;
  }).join('\n');

  const prompt = `You are a developmental interviewer. You've already asked one follow-up probe.

NARRATIVE (${narrative.domain}):
${narrative.story}

FIRST PROBE (${firstProbe.probeType}):
Q: ${firstProbe.question}
A: ${firstProbe.response}

Based on what remains structurally ambiguous, should you ask ONE more targeted question?

If the first probe response was already highly revealing and you have high confidence in the structural pattern, return: {"skip": true}

Otherwise select from these remaining probe types and generate a specific follow-up:
${probeTypesDescription}

Return JSON — either:
{"skip": true}
OR:
{
  "skip": false,
  "probeType": "<type>",
  "question": "<specific question referencing their story and first probe response>",
  "rationale": "<why>"
}

CRITICAL: Respond with ONLY valid JSON:`;

  try {
    const schema = z.union([
      z.object({ skip: z.literal(true) }),
      z.object({
        skip: z.literal(false),
        probeType: z.enum(availableTypes as [string, ...string[]]),
        question: z.string(),
        rationale: z.string(),
      }),
    ]);

    const result = await callGrokThenAIJson<
      | { skip: true }
      | { skip: false; probeType: ProbeType; question: string; rationale: string }
    >(
      'GenerateSecondAdaptiveProbe',
      prompt,
      'openrouter/free',
      schema
    );

    if (!result || result.skip) return null;
    return { probeType: result.probeType as ProbeType, question: result.question };
  } catch {
    return null; // Graceful: just skip second probe
  }
}

// ─── Dilemma Probe ────────────────────────────────────────────────────────────

export function generateDilemmaPrompt(selectedDomains: KeganDomainId[]): string {
  const domainContext = selectedDomains
    .map(d => KEGAN_DOMAINS.find(dom => dom.id === d)?.label || d)
    .join(' and ');

  return `Think of a time when what your important people (partner, family, team, community) believed was right, and what your own internal sense told you, were in real tension. Not a trivial disagreement — something where the stakes felt high, particularly in the context of ${domainContext}.

What happened? How did you navigate it? What was hardest about it?`;
}

export async function generateCounterPerspective(
  dilemma: string,
  response: string
): Promise<string> {
  const fallback = 'Some people in your situation might say that the tension you felt points to something important about how you\'re weighing these competing concerns. What do you make of that?';

  const prompt = `You are a developmental interviewer trained in the Subject-Object Interview.

The user was asked to describe a moment of tension between what their important people expected and their own inner sense:
"${dilemma}"

They responded:
"${response}"

Your task: Generate a counter-perspective that represents an ADJACENT developmental position to pressure-test their response.

Guidelines:
- If their response seems Socialized (prioritizing relationship/group, identity tied to others' expectations, distress at disappointing): offer a Self-Authored perspective — the value of standing in one's own truth even at relational cost.
- If their response seems Self-Authored (asserting own values, clear internal compass, can hold others' disappointment): offer either a Socialized perspective (the legitimate wisdom in relational attunement, not as weakness but as a different kind of intelligence) OR a Self-Transforming perspective (questioning whether their framework for evaluating this might itself be partial).
- If their response seems Self-Transforming (meta-awareness, holding paradox): probe whether this integration is intellectual or lived — what happens when the tension becomes acute.

The counter-perspective must:
- Be genuinely compelling, not a straw man
- Reference their specific situation
- Be framed as "Some people in your situation would say..." or similar
- End with an invitation: "How do you relate to that?" or similar
- Be 2-3 sentences maximum

Return ONLY the counter-perspective statement as plain text. No JSON, no explanation.`;

  try {
    const result = await generateText(prompt);
    const trimmed = result.trim();
    return trimmed.length > MIN_COUNTER_PERSPECTIVE_LENGTH ? trimmed : fallback;
  } catch (err) {
    console.error('[KeganService] generateCounterPerspective failed:', err);
    return fallback;
  }
}

// ─── Scoring Strategy A: Structural Coding ────────────────────────────────────

async function runStructuralCoding(
  narratives: KeganNarrativeResponse[],
  dilemmaResponse?: KeganDilemmaProbe,
  userContext?: UserContext | null
): Promise<KeganStructuralCoding> {
  const transcript = buildNarrativeTranscript(narratives);
  const dilemmaSection = buildDilemmaTranscript(dilemmaResponse);
  const culturalCaveat = buildCulturalCaveat(userContext);

  const prompt = `You are a developmental psychologist trained in Robert Kegan's Subject-Object Interview scoring.

Analyze this assessment data using direct structural coding.
${culturalCaveat}

TRANSCRIPT:
${transcript}

${dilemmaSection}

For each narrative, identify:

1. SUBJECT_FUSION: What is the person fused with / unable to step back from?
   - Stage 2: Their own needs, interests, concrete agenda
   - Stage 3: Others' expectations, relational roles, the need for approval/belonging
   - Stage 4: Their own authored ideology, self-constructed values and identity
   - Stage 5: Even their own framework is held lightly; fused with the dialectical process

2. OBJECT_CAPACITY: What can the person reflect on, examine, hold at arm's length?
   - Stage 2: Impulses, concrete perceptions
   - Stage 3: Own needs/interests (can subordinate them to relationships)
   - Stage 4: Relationships, roles, others' expectations (can evaluate them)
   - Stage 5: Own ideology, the self-authoring system itself

3. CONFLICT_HANDLING: When facing tension, does the person:
   - Seek to win / get what they need (Stage 2)
   - Seek to preserve relationship / belonging (Stage 3)
   - Seek to maintain integrity of authored values, tolerate relational cost (Stage 3→4 / Stage 4)
   - Hold the conflict itself as generative, examine own stake in it (Stage 4→5 / Stage 5)

4. KEY_EVIDENCE: Quote the 2-3 most structurally revealing sentences with brief annotation.

Scoring guide:
2.0-2.5: Imperial Mind
2.5-3.0: Transition Imperial → Socialized
3.0-3.5: Socialized Mind
3.5-4.0: Transition Socialized → Self-Authored
4.0-4.5: Self-Authored Mind
4.5-5.0: Transition Self-Authored → Self-Transforming / Self-Transforming

Anti-inflation: Most adults score 2.5-4.0. Stage 5 requires genuine meta-systemic awareness, not just "both sides have a point." When uncertain, score conservatively.

Return JSON only:
{
  "subjectFusion": "<what they're embedded in, with evidence>",
  "objectCapacity": "<what they can reflect on, with evidence>",
  "conflictHandling": "<their pattern, with evidence>",
  "keyEvidence": [
    {"quote": "<exact quote>", "annotation": "<structural significance>"}
  ],
  "preliminaryScore": <number 2.0-5.0>,
  "confidence": "<high/medium/low>"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<KeganStructuralCoding>(
      'StructuralCoding',
      prompt,
      'openrouter/free',
      structuralCodingSchema
    );
    return result || STRUCTURAL_FALLBACK;
  } catch (err) {
    console.error('[KeganService] runStructuralCoding failed:', err);
    return STRUCTURAL_FALLBACK;
  }
}

// ─── Scoring Strategy B: Comparative Exemplar Rating ──────────────────────────

async function runComparativeExemplarRating(
  narratives: KeganNarrativeResponse[],
  dilemmaResponse?: KeganDilemmaProbe,
  userContext?: UserContext | null
): Promise<KeganComparativeRating> {
  const transcript = buildNarrativeTranscript(narratives);
  const dilemmaSection = buildDilemmaTranscript(dilemmaResponse);
  const culturalCaveat = buildCulturalCaveat(userContext);

  const exemplars = `
EXEMPLAR 1 (Stage 3 — Socialized Mind):
"When my manager criticized my project in front of the team, I felt devastated. I kept thinking about what I could have done differently to make her happy. I ended up apologizing and asking her what she wanted me to change. Looking back, I realize I maybe should have stood up for my work more, but honestly the idea of her being disappointed in me was unbearable. I need her to see me as competent."

EXEMPLAR 2 (Stage 3→4 Transition):
"The feedback stung because I really value what my manager thinks. But I also knew my approach had merit — I'd thought it through carefully. I struggled with whether to push back or just adapt. In the end, I asked for a private conversation where I explained my reasoning while also trying to understand her concerns. It was uncomfortable holding both — wanting her approval but also not wanting to abandon my own judgment."

EXEMPLAR 3 (Stage 4 — Self-Authored Mind):
"I heard her criticism and took time to evaluate it against my own understanding of the project. Some of her points were valid and I incorporated them. Others I disagreed with based on my assessment. I explained my reasoning and we landed in different places on a few things. That's fine — I can't control her view, only ensure I'm acting from my own considered judgment. Her disappointment is uncomfortable but it doesn't change my sense of whether my approach was sound."

EXEMPLAR 4 (Stage 4→5 Transition):
"What struck me wasn't just whether she was right or I was right, but noticing how much my sense of being right was wrapped up in a particular way of seeing the problem. Her framing revealed assumptions I was making. I'm still not sure whose approach was 'better' — I think that question might be less interesting than what the tension between our views reveals about the complexity we're both trying to navigate."`;

  const prompt = `You are a developmental psychologist comparing a user's responses to calibration exemplars.
${culturalCaveat}

CALIBRATION EXEMPLARS:
${exemplars}

USER'S RESPONSES:
${transcript}

${dilemmaSection}

IMPORTANT: Compare HOW the user organizes meaning, not WHAT they talk about. A person can discuss any topic at any developmental stage. Look at:
- What they treat as given vs. what they can examine
- How they handle competing concerns
- Where their identity seems anchored
- How they metabolize challenge or criticism

For each exemplar, rate structural similarity (0-10):
0: Completely different organizational pattern
5: Some structural overlap but significant differences
10: Very similar meaning-making structure

Return JSON only:
{
  "mostSimilarExemplar": <1-4>,
  "similarities": [
    {"exemplarNumber": 1, "similarityScore": <0-10>, "explanation": "<structural comparison>"},
    {"exemplarNumber": 2, "similarityScore": <0-10>, "explanation": "<structural comparison>"},
    {"exemplarNumber": 3, "similarityScore": <0-10>, "explanation": "<structural comparison>"},
    {"exemplarNumber": 4, "similarityScore": <0-10>, "explanation": "<structural comparison>"}
  ],
  "suggestedScore": <score based on: Ex1→3.0, Ex2→3.5, Ex3→4.0, Ex4→4.5, interpolate as needed>
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<KeganComparativeRating>(
      'ComparativeExemplarRating',
      prompt,
      'openrouter/free',
      comparativeRatingSchema
    );
    return result || COMPARATIVE_FALLBACK;
  } catch (err) {
    console.error('[KeganService] runComparativeExemplarRating failed:', err);
    return COMPARATIVE_FALLBACK;
  }
}

// ─── Scoring Strategy C: Adversarial / Red-Team Scoring ───────────────────────

async function runAdversarialScoring(
  narratives: KeganNarrativeResponse[],
  dilemmaResponse?: KeganDilemmaProbe,
  userContext?: UserContext | null
): Promise<KeganAdversarialScoring> {
  const transcript = buildNarrativeTranscript(narratives);
  const dilemmaSection = buildDilemmaTranscript(dilemmaResponse);
  const culturalCaveat = buildCulturalCaveat(userContext);

  const prompt = `You are a developmental psychologist conducting adversarial/red-team scoring. Your job is to FIGHT FOR EACH STAGE — find the strongest possible evidence for every position, even the ones that seem unlikely.
${culturalCaveat}

Do NOT let the overall impression bias individual cases. A person can show Stage 3 in one story and Stage 4 in another.

ASSESSMENT DATA:
${transcript}

${dilemmaSection}

STAGE DEFINITIONS FOR EVIDENCE MATCHING:
- Stage 2 (Imperial): Subject to own needs/agenda. Others are instruments. Conflict = winning/getting needs met. Self-interest is the organizing principle, not because they're selfish but because they literally can't take another's perspective as constitutive of self.
- Stage 3 (Socialized): Subject to relationships/expectations. Identity = role/membership. Conflict = preserving harmony. Others' disappointment is existentially threatening. The relationship IS the self, not something the self HAS.
- Transition 3→4: Emerging internal compass but still heavily shaped by external. Guilt/anxiety when asserting self. Can articulate own views but the assertion feels costly and requires justification.
- Stage 4 (Self-Authored): Subject to own ideology/system. HAS relationships rather than BEING them. Can hold others' disappointment without being destabilized. Principles feel self-generated, not received.
- Transition 4→5: Begins to see own framework as one among many. Holds paradox without needing premature resolution. Self-authorship itself becomes visible as a constructed stance.
- Stage 5 (Self-Transforming): Examines own system as partial. Contradiction is generative. Seeks dialectical integration. Curiosity about own blind spots is genuine, not performed.

For each stage, provide:
- Strength: Strong / Moderate / Weak / None
- Evidence: Specific quotes and reasoning (or "No evidence found")

Anti-inflation: "Both sides have merit" is NOT Stage 5. Articulate philosophical tolerance is NOT Stage 5. Stage 5 requires genuine meta-systemic operation where the person's own framework becomes object.

Return JSON only:
{
  "caseForStage2": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "caseForStage3": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "caseForTransition3to4": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "caseForStage4": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "caseForTransition4to5": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "caseForStage5": {"strength": "<strong/moderate/weak/none>", "evidence": "<quotes and reasoning>"},
  "disambiguationNeeded": "<what additional information would help clarify>"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<KeganAdversarialScoring>(
      'AdversarialScoring',
      prompt,
      'openrouter/free',
      adversarialScoringSchema
    );
    return result || ADVERSARIAL_FALLBACK;
  } catch (err) {
    console.error('[KeganService] runAdversarialScoring failed:', err);
    return ADVERSARIAL_FALLBACK;
  }
}

// ─── Final Integration & Interpretation ───────────────────────────────────────

export async function analyzeKeganSessionFull(
  narratives: KeganNarrativeResponse[],
  dilemmaResponse: KeganDilemmaProbe | undefined,
  selectedDomains: KeganDomainId[],
  growthEdgeNote: string,
  userContext?: UserContext | null
): Promise<KeganScoringResult> {
  // Step 1: Confound detection (runs first as it gates confidence)
  const confounds = await analyzeConfounds(narratives, dilemmaResponse);

  // Step 2: Three-strategy scoring (parallel for performance)
  const [structuralResult, comparativeResult, adversarialResult] = await Promise.allSettled([
    runStructuralCoding(narratives, dilemmaResponse, userContext),
    runComparativeExemplarRating(narratives, dilemmaResponse, userContext),
    runAdversarialScoring(narratives, dilemmaResponse, userContext),
  ]);

  // Extract results with fallbacks for any that failed
  const structural = structuralResult.status === 'fulfilled'
    ? structuralResult.value : STRUCTURAL_FALLBACK;
  const comparative = comparativeResult.status === 'fulfilled'
    ? comparativeResult.value : COMPARATIVE_FALLBACK;
  const adversarial = adversarialResult.status === 'fulfilled'
    ? adversarialResult.value : ADVERSARIAL_FALLBACK;

  // Track which strategies succeeded for confidence calculation
  const strategiesSucceeded = [structuralResult, comparativeResult, adversarialResult]
    .filter(r => r.status === 'fulfilled').length;

  // Step 3: Integration prompt
  const culturalCaveat = buildCulturalCaveat(userContext);

  // Build story references for practice recommendation
  const storyRefs = narratives.map((n, i) =>
    `Story ${i + 1} (${n.domain}): "${n.story.slice(0, 100)}..."`
  ).join('\n');

  const integrationPrompt = `You are a developmental psychologist integrating three independent scoring strategies into a final Kegan assessment.
${culturalCaveat}

CONFOUND ANALYSIS:
- Theory fluency: ${confounds.theoryFluency}/3
- Performative complexity: ${confounds.performativeComplexity}/3
- Aspirational responding: ${confounds.aspirationalResponding}/3
- Narrative richness: ${confounds.narrativeRichness}/3
- Notes: ${confounds.rationale}

STRATEGY A — STRUCTURAL CODING:
- Subject fusion: ${structural.subjectFusion}
- Object capacity: ${structural.objectCapacity}
- Conflict handling: ${structural.conflictHandling}
- Key evidence: ${structural.keyEvidence.map(e => `"${e.quote}" → ${e.annotation}`).join('; ')}
- Preliminary score: ${structural.preliminaryScore}
- Confidence: ${structural.confidence}

STRATEGY B — COMPARATIVE EXEMPLAR:
- Most similar exemplar: ${comparative.mostSimilarExemplar} (1=Stage3, 2=3→4, 3=Stage4, 4=4→5)
- Similarity scores: ${comparative.similarities.map(s => `Ex${s.exemplarNumber}: ${s.similarityScore}/10 — ${s.explanation}`).join('; ')}
- Suggested score: ${comparative.suggestedScore}

STRATEGY C — ADVERSARIAL SCORING:
- Stage 2: ${adversarial.caseForStage2.strength} — ${adversarial.caseForStage2.evidence}
- Stage 3: ${adversarial.caseForStage3.strength} — ${adversarial.caseForStage3.evidence}
- 3→4: ${adversarial.caseForTransition3to4.strength} — ${adversarial.caseForTransition3to4.evidence}
- Stage 4: ${adversarial.caseForStage4.strength} — ${adversarial.caseForStage4.evidence}
- 4→5: ${adversarial.caseForTransition4to5.strength} — ${adversarial.caseForTransition4to5.evidence}
- Stage 5: ${adversarial.caseForStage5.strength} — ${adversarial.caseForStage5.evidence}
- Disambiguation: ${adversarial.disambiguationNeeded}

STRATEGIES THAT COMPLETED SUCCESSFULLY: ${strategiesSucceeded}/3

USER CONTEXT:
- Growth edge: "${growthEdgeNote}"
- Domains explored: ${selectedDomains.join(', ')}

STORY REFERENCES (for grounding practice recommendation):
${storyRefs}

INTEGRATION RULES:
1. Modal stage must agree across at least 2 of 3 strategies for clear_signal
2. Confound penalty: if (theoryFluency + performativeComplexity) >= 4, downgrade confidence by one level
3. Low narrative richness (< 2) → downgrade confidence
4. If only 1-2 strategies completed → maximum confidence is suggestive_pattern
5. If strategies significantly disagree (>0.5 apart) → suggestive_pattern or insufficient_data

CONFIDENCE LEVELS:
- clear_signal: 2+ strategies agree within 0.5, low confounds, adequate narrative richness
- suggestive_pattern: 2 strategies agree with moderate confounds, OR some disagreement, OR partial strategy failure
- insufficient_data: major disagreement, very low richness, or <2 strategies completed

STAGE LABELS (use exactly):
- 2.0-2.5: "Imperial Mind"
- 2.5-3.0: "Transitioning: Imperial to Socialized"
- 3.0-3.5: "Socialized Mind"
- 3.5-4.0: "Transitioning: Socialized to Self-Authored"
- 4.0-4.5: "Self-Authored Mind"
- 4.5-4.8: "Transitioning: Self-Authored to Self-Transforming"
- 4.8-5.0: "Self-Transforming Mind"

IMPORTANT FOR FEEDBACK LANGUAGE:
- Describe patterns phenomenologically first, not with stage labels (the label goes in centerOfGravityLabel)
- For subjectObjectMap: use their specific language and situations, not generic descriptions
- For consolidationStrengths: describe what their CURRENT pattern does well — its gifts and real-world advantages
- For growthFrontier: describe the specific next developmental move with concrete reference to something they said
- For practiceRecommendation: reference a SPECIFIC moment from one of their stories and suggest one concrete practice + what to observe

Return JSON only:
{
  "centerOfGravityLabel": "<stage label>",
  "numericScore": <2.0-5.0>,
  "confidenceLevel": "<clear_signal/suggestive_pattern/insufficient_data>",
  "subjectObjectMap": {
    "subjectTo": "<grounded in their specific responses>",
    "objectTo": "<grounded in their specific responses>"
  },
  "domainVariation": "<how meaning-making varied across explored domains, referencing specific stories>",
  "consolidationStrengths": "<gifts of current pattern, not backhanded compliments>",
  "growthFrontier": "<specific next developmental move, grounded in what they said>",
  "tightness": "<how consistent vs. variable their meaning-making was across stories>",
  "practiceRecommendation": {
    "storyReference": "<which story this references>",
    "practice": "<one specific, concrete practice>",
    "observation": "<what to notice internally while practicing>"
  }
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const interpretation = await callGrokThenAIJson<KeganInterpretation>(
      'IntegrateKeganScoring',
      integrationPrompt,
      'openrouter/free',
      finalInterpretationSchema
    );

    return {
      confounds,
      structuralCoding: structural,
      comparativeRating: comparative,
      adversarialScoring: adversarial,
      interpretation: interpretation || INTERPRETATION_FALLBACK,
    };
  } catch (err) {
    console.error('[KeganService] integration scoring failed:', err);
    return {
      confounds,
      structuralCoding: structural,
      comparativeRating: comparative,
      adversarialScoring: adversarial,
      interpretation: INTERPRETATION_FALLBACK,
    };
  }
}

// ─── Hybrid Assessment API (new wizard) ───────────────────────────────────────

const hybridInterpretationSchema = z.object({
  centerOfGravityLabel: z.string(),
  numericScore: z.number(),
  confidenceLevel: z.enum(['clear_signal', 'suggestive_pattern', 'insufficient_data']),
  subjectObjectMap: z.object({ subjectTo: z.string(), objectTo: z.string() }),
  domainVariation: z.string(),
  consolidationStrengths: z.string(),
  growthFrontier: z.string(),
  tightness: z.string(),
  practiceRecommendation: z.object({
    storyReference: z.string(),
    practice: z.string(),
    observation: z.string(),
  }),
});

const HYBRID_FALLBACK: KeganInterpretation = {
  centerOfGravityLabel: 'The Socialized Mind',
  numericScore: 3.0,
  confidenceLevel: 'insufficient_data',
  subjectObjectMap: {
    subjectTo: 'Others\' expectations and approval',
    objectTo: 'Some values and commitments',
  },
  domainVariation: 'Insufficient data to assess domain variation.',
  consolidationStrengths: 'Strong relational attunement and care for others.',
  growthFrontier: 'Developing a self-authored value system independent of external validation.',
  tightness: 'Insufficient data.',
  practiceRecommendation: {
    storyReference: 'General pattern',
    practice: 'Notice moments when you defer to others\' opinions over your own judgment.',
    observation: 'What does it feel like to hold your own position?',
  },
  domainSplit: 'Insufficient data.',
  growthEdge: 'Developing self-authorship.',
};

export async function generateKeganDilemmaOptions(dilemma: string): Promise<string[]> {
  const prompt = `You are helping someone explore a personal dilemma through Robert Kegan's developmental lens.

Dilemma: "${dilemma}"

Generate exactly 3 distinct options/paths the person could take. Each should be genuinely different in approach and values, not just surface variations. Make them concrete and realistic.

Return JSON only:
{
  "options": ["Option A text", "Option B text", "Option C text"]
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const schema = z.object({ options: z.array(z.string()).min(2).max(4) });
  try {
    const result = await callGrokThenAIJson<{ options: string[] }>('KeganDilemmaOptions', prompt, undefined, schema);
    return result?.options ?? ['Stay with the current path', 'Make a significant change', 'Seek outside perspective'];
  } catch {
    return ['Stay with the current path', 'Make a significant change', 'Seek outside perspective'];
  }
}

export async function generateKeganStressTest(dilemma: string, chosenOption: string): Promise<string> {
  const prompt = `Someone is working through a personal dilemma and has chosen a path.

Dilemma: "${dilemma}"
Chosen option: "${chosenOption}"

Generate ONE high-stakes question that stress-tests this choice — exposing the assumptions, values, or fears underneath it. The question should create productive discomfort and reveal something real about how they make meaning.

Return JSON only:
{
  "question": "Your stress test question here"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const schema = z.object({ question: z.string() });
  try {
    const result = await callGrokThenAIJson<{ question: string }>('KeganStressTest', prompt, undefined, schema);
    return result?.question ?? 'What would it cost you — in terms of who you are — if this choice turned out to be wrong?';
  } catch {
    return 'What would it cost you — in terms of who you are — if this choice turned out to be wrong?';
  }
}

export async function analyzeKeganSession(
  forcedChoiceAnswers: KeganForcedChoiceAnswer[],
  dilemmaSetup: KeganDilemmaSetup,
  stressTestResponse: string
): Promise<KeganInterpretation> {
  const fcSummary = forcedChoiceAnswers.map((a, i) => {
    const q = KEGAN_FORCED_CHOICE_QUESTIONS[i];
    const chosen = a.chosenOption === 'A' ? q?.optionA : q?.optionB;
    return `${a.questionDomain}: ${chosen ?? a.chosenOption}`;
  }).join('\n');

  const prompt = `You are scoring a developmental assessment based on Robert Kegan's Constructive-Developmental Theory.

FORCED CHOICE RESPONSES:
${fcSummary}

PERSONAL DILEMMA: "${dilemmaSetup.userDilemma}"
CHOSEN PATH: "${dilemmaSetup.generatedOptions[dilemmaSetup.selectedOptionIndex] ?? ''}"
STRESS TEST RESPONSE: "${stressTestResponse}"

Assess their current center of gravity (stage 2.0–5.0). Look for:
- Whether their sense of self is defined by others' expectations (socialized) or internally authored (self-authoring)
- How they relate to conflict, values, and external pressure
- Whether they can hold competing frameworks simultaneously (self-transforming)

Return JSON only:
{
  "centerOfGravityLabel": "The Socialized Mind",
  "numericScore": 3.0,
  "confidenceLevel": "suggestive_pattern",
  "subjectObjectMap": {
    "subjectTo": "What they cannot yet see as separate from themselves",
    "objectTo": "What they can reflect on and work with"
  },
  "domainVariation": "How their meaning-making varied across the domains explored",
  "consolidationStrengths": "Genuine gifts of their current developmental position",
  "growthFrontier": "The specific next developmental move available to them",
  "tightness": "How consistent their meaning-making was across the assessment",
  "practiceRecommendation": {
    "storyReference": "Reference to a specific moment in their responses",
    "practice": "One concrete practice",
    "observation": "What to notice while practicing"
  }
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  try {
    const result = await callGrokThenAIJson<KeganInterpretation>(
      'KeganHybridAnalysis', prompt, undefined, hybridInterpretationSchema
    );
    return result ?? HYBRID_FALLBACK;
  } catch {
    return HYBRID_FALLBACK;
  }
}
