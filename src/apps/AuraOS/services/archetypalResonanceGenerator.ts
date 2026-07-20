import { MajorArcanaCard } from '../data/majorArcana';

export interface PreviousSessionSummary {
  cardName: string;
  harvestSentence: string;
  preferredFace: string;
}

export interface ResonanceRequest {
  card: MajorArcanaCard;
  firstFaceResponse: string;
  secondFaceResponse: string;
  thirdFaceResponse: string;
  experienceLevel: 'new' | 'some' | 'experienced';
  previousSessionSummaries?: PreviousSessionSummary[];
}

export interface ResonanceResponse {
  psychological: string;
  mythological: string;
  contemplative: string;
}

export interface ClosingRequest {
  card: MajorArcanaCard;
  harvestSentence: string;
  preferredFace: string;
  sessionDepth: number;
  previousSessionSummaries?: PreviousSessionSummary[];
}

export interface ClosingResponse {
  crossPracticeConnection: string | null;
  suggestedNextPractice: string | null;
}

export function buildResonancePrompt(req: ResonanceRequest): string {
  const { card, firstFaceResponse, secondFaceResponse, thirdFaceResponse, experienceLevel } = req;

  const depthInstruction = experienceLevel === 'new'
    ? 'Use accessible, inviting language. Avoid jargon. Speak as a warm guide who respects the practitioner without assuming prior knowledge.'
    : experienceLevel === 'experienced'
      ? 'Use precise Jungian and transpersonal terminology freely. Assume familiarity with archetypal psychology, non-dual philosophy, and contemplative traditions.'
      : 'Use clear language with occasional technical terms, briefly contextualized.';

  return `You are a contemplative resonance guide working with the Major Arcana as tools for post-metaphysical meditation.

CARD METADATA:
- Name: ${card.name} (${card.number})
- Hebrew Letter: ${card.hebrewLetter} (${card.hebrewMeaning})
- Alchemical Process: ${card.alchemicalProcess}
- Hero's Journey Stage: ${card.heroJourneyStage}
- Jungian Archetype: ${card.jungianArchetype}
- Shadow Aspect: ${card.shadowAspect}
- Light Aspect: ${card.lightAspect}
- Rachel Pollack: "${card.pollackDescription}"

THE PRACTITIONER'S THREE FACES OF SPIRIT RESPONSES:

First Face (I-It) — observing the archetype as object:
"${firstFaceResponse}"

Second Face (I-Thou) — encountering the archetype directly:
"${secondFaceResponse}"

Third Face (I-I / It-Its) — the universal pattern:
"${thirdFaceResponse}"

${depthInstruction}

Respond with a JSON object containing exactly three fields:
- "psychological": A Jungian amplification of the archetype as it appeared in this practitioner's contemplation. 2-3 sentences connecting the card's archetypal dimension to what emerged in their responses. Speak to the archetype's movement, not the person's psychology.
- "mythological": Cross-cultural parallels — where this archetype appears in world mythology, folklore, or sacred narrative. 2-3 sentences that deepen the contemplation by placing it in a larger human context.
- "contemplative": A non-dual or Third Face insight — what this archetype reveals about the nature of awareness itself, the witness behind the witnessed. 2-3 sentences.

ABSOLUTE CONSTRAINTS:
1. No fortune-telling or divinatory framing
2. No predictions about the practitioner's future
3. No prescriptive advice ("you should", "try to")
4. Respect what was shared without analyzing the person — speak to the archetype, not the individual
5. Speak to the archetype's movement in consciousness, not the practitioner's personal situation
6. No therapy language (no "processing", "triggers", "healing journey")
7. Honor the contemplative frame — this is meditation, not interpretation

Return ONLY valid JSON, no markdown code blocks.`;
}

export function buildClosingPrompt(req: ClosingRequest): string {
  const { card, harvestSentence, preferredFace, sessionDepth, previousSessionSummaries } = req;

  const hasPriorSessions = previousSessionSummaries && previousSessionSummaries.length >= 2;

  const priorContext = hasPriorSessions
    ? `PREVIOUS SESSIONS:\n${previousSessionSummaries!.map((s, i) => `${i + 1}. Card: ${s.cardName} | Harvest: "${s.harvestSentence}" | Preferred Face: ${s.preferredFace}`).join('\n')}\n`
    : '';

  return `You are a contemplative practice guide. A practitioner has completed an Archetypal Contemplation session.

TODAY'S SESSION:
- Card: ${card.name}
- Harvest sentence: "${harvestSentence}"
- Preferred Face of Spirit: ${preferredFace}
- Session depth (1-5): ${sessionDepth}

${priorContext}

Respond with a JSON object containing exactly two fields:
- "crossPracticeConnection": ${hasPriorSessions ? 'A brief observation (2-3 sentences) about how today\'s card and harvest relate to the arc of previous sessions. Look for deepening themes, complementary archetypes, or evolving patterns across the contemplative journey.' : 'null (fewer than 2 prior sessions, so no meaningful cross-practice connection exists)'}
- "suggestedNextPractice": ${hasPriorSessions ? 'A brief suggestion (1-2 sentences) for what kind of contemplative attention might serve the practitioner next, based on the arc of sessions so far. Not prescriptive — an invitation.' : 'null'}

If there is no meaningful cross-practice connection (e.g., fewer than 2 prior sessions), return null for both fields rather than forcing a connection.

Return ONLY valid JSON, no markdown code blocks.`;
}

export function extractJSON(raw: string): string {
  // Handle ```json ... ``` blocks
  const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) return jsonBlockMatch[1].trim();

  // Handle ``` ... ``` blocks
  const codeBlockMatch = raw.match(/```\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  return raw.trim();
}
