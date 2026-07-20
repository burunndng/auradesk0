import React, { useState } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import {
  phenomenonCardsSchema,
  mapChallengesSchema,
  socraticProbeSchema,
  tetrarArisingSynthesisSchema,
} from '../../services/ai/wizardSchemas';
import { generateInsightFromSession } from '../../services/insightGenerator';
import type {
  PhenomenonCard,
  PhenomenonPlacement,
  AIChallengeItem,
  SocraticMessage,
  PhenomenonMapperDraft,
  MapperMode,
  PhenomenonQuadrant,
} from '../../types';

// ─── Constants ───────────────────────────────────────────────────

type WizardStep =
  | 'INTRO'
  | 'SOURCING'
  | 'CARD_REVIEW'
  | 'PLACEMENT'
  | 'MAP_REVIEW'
  | 'AI_CHALLENGE'
  | 'SOCRATIC'
  | 'SYNTHESIS';

const STEPS: WizardStep[] = [
  'INTRO', 'SOURCING', 'CARD_REVIEW', 'PLACEMENT',
  'MAP_REVIEW', 'AI_CHALLENGE', 'SOCRATIC', 'SYNTHESIS',
];

const LIBRARY_TOPICS = [
  'Burnout at work',
  'A difficult relationship',
  'Grief or loss',
  'Climate grief',
  'Social anxiety',
  'Creative block',
  'Political conflict',
  'Physical illness',
];

const QUADRANT_META: Record<PhenomenonQuadrant, { label: string; pronoun: string; desc: string }> = {
  UL: { label: 'UL · Interior Individual', pronoun: 'I', desc: 'Thoughts, feelings, meaning, experience' },
  UR: { label: 'UR · Exterior Individual', pronoun: 'IT', desc: 'Body, behavior, neurology, observable acts' },
  LL: { label: 'LL · Interior Collective', pronoun: 'WE', desc: 'Culture, shared meaning, intersubjective space' },
  LR: { label: 'LR · Exterior Collective', pronoun: 'ITS', desc: 'Systems, structures, institutions, patterns' },
};

const DEFAULT_DRAFT: PhenomenonMapperDraft = {
  mode: '',
  sourcingMethod: '',
  selectedLibraryTopic: '',
  seedDescription: '',
  cards: [],
  placements: [],
  currentCardIndex: 0,
  aiChallenges: [],
  socraticHistory: [],
  synthesis: '',
};

// ─── Props ────────────────────────────────────────────────────────

interface PhenomenonMapperWizardProps {
  onClose: () => void;
  userId: string;
}

// ─── Main Component ───────────────────────────────────────────────

export default function PhenomenonMapperWizard({ onClose, userId }: PhenomenonMapperWizardProps) {
  const [step, setStep] = useState<WizardStep>('INTRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, updateDraft] = useWizardDraft<PhenomenonMapperDraft>(
    'aura-draft-phenomenon-mapper',
    DEFAULT_DRAFT,
  );

  const currentStepIndex = STEPS.indexOf(step);

  // ─── Navigation ─────────────────────────────────────────────────

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) { setStep(next); setError(''); }
  };

  const goBack = () => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev);
  };

  // ─── AI: Generate cards ──────────────────────────────────────────

  const handleGenerateCards = async () => {
    const topic = draft.sourcingMethod === 'library'
      ? draft.selectedLibraryTopic
      : draft.seedDescription;
    if (!topic.trim()) { setError('Please enter a topic first.'); return; }
    setLoading(true); setError('');
    try {
      const prompt = `You are helping an Integral Life Practice user map phenomena across Ken Wilber's AQAL four quadrants (UL/UR/LL/LR).

Topic: "${topic}"
Mode: ${draft.mode === 'practice' ? 'Personal practice — user is examining their own situation' : 'Learning — user wants to understand AQAL through this topic'}

Generate 4–6 phenomenon cards. Each card is a noun phrase naming one distinct dimension or aspect of this topic. Cards should span different scales: personal inner experience, bodily/behavioral, relational/cultural, and systemic. Keep names concise (3–7 words).

Respond with JSON: { "cards": [{ "id": "c1", "name": "...", "source": "ai" }, ...] }`;

      const result = await callGrokThenAIJson(
        'phenomenon-cards',
        prompt,
        undefined,
        phenomenonCardsSchema,
      );
      updateDraft({ cards: result.cards, placements: [], currentCardIndex: 0 });
      goNext();
    } catch {
      setError('Could not generate cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── AI: Generate challenges ─────────────────────────────────────

  const handleGenerateChallenges = async () => {
    setLoading(true); setError('');
    try {
      const cardMap = Object.fromEntries(draft.cards.map((c) => [c.id, c]));
      const placementSummary = draft.placements
        .map((p) => `"${cardMap[p.cardId]?.name}" → ${p.quadrant}${p.reasoning ? ` (reasoning: ${p.reasoning})` : ''}`)
        .join('\n');

      const prompt = `You are an Integral Theory expert reviewing an AQAL four-quadrant mapping exercise.

The user mapped these phenomena:
${placementSummary}

Quadrant definitions:
- UL (I): Interior individual — subjective experience, emotions, meaning
- UR (IT): Exterior individual — body, behavior, neurology, observable acts
- LL (WE): Interior collective — culture, shared meaning, intersubjective space
- LR (ITS): Exterior collective — systems, structures, institutions

Identify 2–3 of the most interesting tensions or opportunities:
- Counter-placements: where the card could also meaningfully belong in another quadrant
- Reductionism risks: where the placement might be collapsing one dimension into another
- Missing perspectives: a quadrant being overlooked that reveals something important

For each challenge, specify which card it targets (use the exact cardId), which counterQuadrant you're pointing to, and write a crisp 1–2 sentence challenge in second person.

Respond with JSON: { "challenges": [{ "cardId": "...", "counterQuadrant": "UL|UR|LL|LR", "challenge": "..." }, ...] }`;

      const result = await callGrokThenAIJson(
        'map-challenges',
        prompt,
        undefined,
        mapChallengesSchema,
      );
      updateDraft({ aiChallenges: result.challenges });
      goNext();
    } catch {
      updateDraft({ aiChallenges: [] });
      goNext();
    } finally {
      setLoading(false);
    }
  };

  // ─── AI: Socratic turn ───────────────────────────────────────────

  const handleSocraticTurn = async (userMessage: string) => {
    setLoading(true); setError('');
    const updatedHistory: SocraticMessage[] = [
      ...draft.socraticHistory,
      { role: 'user', content: userMessage },
    ];
    updateDraft({ socraticHistory: updatedHistory });
    try {
      const cardMap = Object.fromEntries(draft.cards.map((c) => [c.id, c]));
      const placementSummary = draft.placements
        .map((p) => `"${cardMap[p.cardId]?.name}" → ${p.quadrant}`)
        .join(', ');
      const challengeSummary = draft.aiChallenges
        .map((c) => `${cardMap[c.cardId]?.name}: ${c.challenge}`)
        .join('\n');
      const historyText = updatedHistory
        .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n');

      const prompt = `You are a Socratic guide helping an ILP practitioner deepen their AQAL mapping.

Their map: ${placementSummary}
Tensions identified: ${challengeSummary}
Conversation so far:
${historyText}

Ask one incisive Socratic question that opens up the richest unresolved tension. Never summarize what they said. Never give answers. End with a single question only (no preamble). Keep it under 40 words.

Respond with JSON: { "probe": "..." }`;

      const result = await callGrokThenAIJson(
        'socratic-probe',
        prompt,
        undefined,
        socraticProbeSchema,
      );
      const aiMessage: SocraticMessage = { role: 'ai', content: result.probe };
      updateDraft({ socraticHistory: [...updatedHistory, aiMessage] });
    } catch {
      const fallback: SocraticMessage = {
        role: 'ai',
        content: 'What would change in your understanding if you held all four quadrants simultaneously?',
      };
      updateDraft({ socraticHistory: [...updatedHistory, fallback] });
    } finally {
      setLoading(false);
    }
  };

  // ─── AI: Synthesis ───────────────────────────────────────────────

  const handleSynthesis = async () => {
    setLoading(true); setError('');
    try {
      const cardMap = Object.fromEntries(draft.cards.map((c) => [c.id, c]));
      const placementSummary = draft.placements
        .map((p) => `"${cardMap[p.cardId]?.name}" in ${p.quadrant}${p.reasoning ? `: ${p.reasoning}` : ''}`)
        .join('\n');
      const dialogueSummary = draft.socraticHistory.length > 0
        ? `\nSocratic dialogue:\n${draft.socraticHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}`
        : '';

      const prompt = `You are an Integral Theory guide synthesizing an AQAL mapping session.

The user mapped these phenomena:
${placementSummary}${dialogueSummary}

Write a tetra-arising synthesis (150–250 words) that:
1. Names at least one non-obvious connection between quadrants
2. Shows how the four dimensions co-arise and condition each other
3. Reveals what becomes visible only when holding all four simultaneously
4. Closes with what this integral view makes possible

Also write a one-sentence key insight capturing the most important revelation.

Voice: like a knowledgeable guide — direct, substantive, never clinical or cheerful.

Respond with JSON: { "synthesis": "...", "keyInsight": "..." }`;

      const result = await callGrokThenAIJson(
        'tetraarising-synthesis',
        prompt,
        undefined,
        tetrarArisingSynthesisSchema,
      );
      updateDraft({ synthesis: result.synthesis });

      // Register insight
      const topic = draft.selectedLibraryTopic || draft.seedDescription || 'Integral Map';
      await generateInsightFromSession({
        wizardType: 'Phenomenon Mapper',
        sessionId: `phenomenon-mapper-${Date.now()}`,
        sessionName: `Integral Map: ${topic}`,
        sessionReport: result.synthesis,
        sessionSummary: result.keyInsight,
        userId,
      });

      goNext();
    } catch {
      setError('Could not generate synthesis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Screens ─────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 'INTRO': return (
        <IntroScreen
          mode={draft.mode as MapperMode | ''}
          onSelectMode={(mode) => updateDraft({ mode })}
          onNext={() => { if (!draft.mode) { setError('Choose a mode to continue.'); return; } goNext(); }}
          error={error}
        />
      );
      case 'SOURCING': return (
        <SourcingScreen
          draft={draft}
          updateDraft={updateDraft}
          onGenerateCards={handleGenerateCards}
          onManualNext={() => { updateDraft({ sourcingMethod: 'manual', cards: [] }); goNext(); }}
          loading={loading}
          error={error}
          setError={setError}
        />
      );
      case 'CARD_REVIEW': return (
        <CardReviewScreen
          cards={draft.cards}
          updateDraft={updateDraft}
          onNext={goNext}
        />
      );
      case 'PLACEMENT': {
        const card = draft.cards[draft.currentCardIndex];
        if (!card) { goNext(); return null; }
        const placement = draft.placements.find((p) => p.cardId === card.id);
        return (
          <PlacementScreen
            card={card}
            cardIndex={draft.currentCardIndex}
            totalCards={draft.cards.length}
            placement={placement}
            onPlace={(quadrant, reasoning) => {
              const existing = draft.placements.findIndex((p) => p.cardId === card.id);
              const updated = existing >= 0
                ? draft.placements.map((p, i) => i === existing ? { ...p, quadrant, reasoning } : p)
                : [...draft.placements, { cardId: card.id, quadrant, reasoning }];
              updateDraft({ placements: updated });
            }}
            onNext={() => {
              const nextIndex = draft.currentCardIndex + 1;
              if (nextIndex < draft.cards.length) {
                updateDraft({ currentCardIndex: nextIndex });
              } else {
                goNext();
              }
            }}
          />
        );
      }
      case 'MAP_REVIEW': return (
        <MapReviewScreen
          cards={draft.cards}
          placements={draft.placements}
          onRevise={(cardIndex) => {
            updateDraft({ currentCardIndex: cardIndex });
            setStep('PLACEMENT');
          }}
          onNext={handleGenerateChallenges}
        />
      );
      case 'AI_CHALLENGE': return (
        <AIChallengeScreen
          cards={draft.cards}
          placements={draft.placements}
          challenges={draft.aiChallenges}
          onNext={goNext}
          onSkipToSynthesis={() => setStep('SYNTHESIS')}
        />
      );
      case 'SOCRATIC': return (
        <SocraticScreen
          history={draft.socraticHistory}
          onSend={handleSocraticTurn}
          onFinish={() => setStep('SYNTHESIS')}
          loading={loading}
        />
      );
      case 'SYNTHESIS': return (
        <SynthesisScreen
          synthesis={draft.synthesis}
          loading={loading}
          error={error}
          onGenerate={handleSynthesis}
          onClose={onClose}
        />
      );
      default: return null;
    }
  };

  return (
    <WizardFrame
      title="Integral Map"
      currentStep={currentStepIndex}
      totalSteps={STEPS.length}
      onNext={() => {}}
      onClose={onClose}
      onBack={step !== 'INTRO' ? goBack : () => {}}
      showBackButton={step !== 'INTRO'}
      accentColor="amber"
      nextButtonDisabled
    >
      {renderStep()}
    </WizardFrame>
  );
}

// ─── IntroScreen ─────────────────────────────────────────────────

function IntroScreen({ mode, onSelectMode, onNext, error }: {
  mode: MapperMode | '';
  onSelectMode: (m: MapperMode) => void;
  onNext: () => void;
  error: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 font-serif mb-2">Integral Map</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Every phenomenon simultaneously exists across four irreducible dimensions: your inner experience (I), your body and behavior (IT), shared culture (WE), and the systems around you (ITS). This mapping practice makes that visible.
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Choose your intention</p>
        <div className="grid grid-cols-1 gap-3">
          {(['learning', 'practice'] as MapperMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onSelectMode(m)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                mode === m
                  ? 'border-amber-400/50 bg-amber-500/10 text-slate-100'
                  : 'border-slate-700/50 bg-slate-900/40 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                {m === 'learning' ? 'Learning · Explore AQAL through a topic' : 'Practice · Examine a real situation'}
              </div>
              <div className="text-xs opacity-70">
                {m === 'learning'
                  ? 'Choose a concept or world event and see how AQAL illuminates it from every angle.'
                  : "Bring a challenge, relationship, or pattern you're living with and map it integrally."}
              </div>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}

// ─── SourcingScreen ───────────────────────────────────────────────

function SourcingScreen({ draft, updateDraft, onGenerateCards, onManualNext, loading, error, setError }: {
  draft: PhenomenonMapperDraft;
  updateDraft: (patch: Partial<PhenomenonMapperDraft>) => void;
  onGenerateCards: () => void;
  onManualNext: () => void;
  loading: boolean;
  error: string;
  setError: (e: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">What will you map?</h2>
        <p className="text-slate-400 text-xs">Choose how to generate your phenomenon cards.</p>
      </div>

      {/* Library */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Curated topics</p>
        <div className="flex flex-wrap gap-2">
          {LIBRARY_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => { updateDraft({ sourcingMethod: 'library', selectedLibraryTopic: topic, seedDescription: '' }); setError(''); }}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                draft.sourcingMethod === 'library' && draft.selectedLibraryTopic === topic
                  ? 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                  : 'border-slate-700/40 text-slate-400 hover:border-slate-600'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* AI from description */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Describe your situation</p>
        <textarea
          rows={3}
          placeholder={draft.mode === 'practice'
            ? 'e.g. "The pattern of withdrawing when I feel criticized..."'
            : 'e.g. "The rise of AI and its effects on creative work..."'}
          value={draft.seedDescription}
          onChange={(e) => { updateDraft({ seedDescription: e.target.value, sourcingMethod: 'ai', selectedLibraryTopic: '' }); setError(''); }}
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-amber-400/40"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-col gap-2">
        <button
          onClick={onGenerateCards}
          disabled={loading || (!draft.selectedLibraryTopic && !draft.seedDescription.trim())}
          className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-40"
        >
          {loading ? 'Generating cards…' : 'Generate phenomenon cards'}
        </button>
        <button
          onClick={onManualNext}
          className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Build cards manually instead
        </button>
      </div>
    </div>
  );
}

// ─── CardReviewScreen ─────────────────────────────────────────────

function CardReviewScreen({ cards, updateDraft, onNext }: {
  cards: PhenomenonCard[];
  updateDraft: (patch: Partial<PhenomenonMapperDraft>) => void;
  onNext: () => void;
}) {
  const [localCards, setLocalCards] = useState<PhenomenonCard[]>(cards);
  const [newCardName, setNewCardName] = useState('');

  const removeCard = (id: string) => setLocalCards((c) => c.filter((x) => x.id !== id));

  const updateName = (id: string, name: string) =>
    setLocalCards((c) => c.map((x) => (x.id === id ? { ...x, name } : x)));

  const addCard = () => {
    if (!newCardName.trim() || localCards.length >= 6) return;
    setLocalCards((c) => [...c, { id: `manual-${Date.now()}`, name: newCardName.trim(), source: 'manual' as const }]);
    setNewCardName('');
  };

  const handleConfirm = () => {
    if (localCards.length < 2) return;
    updateDraft({ cards: localCards, placements: [], currentCardIndex: 0 });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">Your phenomenon cards</h2>
        <p className="text-slate-400 text-xs">Edit names, remove cards, or add one more before you begin mapping.</p>
      </div>
      <div className="space-y-2">
        {localCards.map((card) => (
          <div key={card.id} className="flex items-center gap-2">
            <input
              value={card.name}
              onChange={(e) => updateName(card.id, e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400/40"
            />
            <button
              onClick={() => removeCard(card.id)}
              className="text-slate-600 hover:text-red-400 text-xs px-2 transition-colors"
              aria-label="Remove card"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {localCards.length < 6 && (
        <div className="flex gap-2">
          <input
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCard()}
            placeholder="Add a card…"
            className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-400 placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
          />
          <button
            onClick={addCard}
            disabled={!newCardName.trim()}
            className="px-3 py-2 text-xs text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>
      )}
      <button
        onClick={handleConfirm}
        disabled={localCards.length < 2}
        className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
      >
        Begin mapping ({localCards.length} cards)
      </button>
    </div>
  );
}

// ─── PlacementScreen ──────────────────────────────────────────────

function PlacementScreen({ card, cardIndex, totalCards, placement, onPlace, onNext }: {
  card: PhenomenonCard;
  cardIndex: number;
  totalCards: number;
  placement?: PhenomenonPlacement;
  onPlace: (quadrant: PhenomenonQuadrant, reasoning: string) => void;
  onNext: () => void;
}) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<PhenomenonQuadrant | ''>(placement?.quadrant ?? '');
  const [reasoning, setReasoning] = useState(placement?.reasoning ?? '');

  const handleConfirm = () => {
    if (!selectedQuadrant) return;
    onPlace(selectedQuadrant, reasoning);
    onNext();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          Card {cardIndex + 1} of {totalCards}
        </p>
      </div>
      <div className="bg-amber-500/8 border border-amber-400/20 rounded-xl p-4">
        <p className="text-xs text-amber-400/60 mb-1">Phenomenon</p>
        <p className="text-lg font-semibold text-slate-100 font-serif">{card.name}</p>
      </div>
      <p className="text-sm text-slate-400">Where does this primarily belong?</p>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(QUADRANT_META) as [PhenomenonQuadrant, typeof QUADRANT_META.UL][]).map(([q, meta]) => (
          <button
            key={q}
            onClick={() => setSelectedQuadrant(q)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedQuadrant === q
                ? 'border-amber-400/50 bg-amber-500/10'
                : 'border-slate-700/40 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <p className="text-xs text-slate-500 mb-1">{meta.label}</p>
            <p className="text-sm font-semibold text-slate-200">{meta.pronoun}</p>
            <p className="text-xs text-slate-500 mt-1">{meta.desc}</p>
          </button>
        ))}
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-2">Why this quadrant? (optional)</p>
        <textarea
          rows={2}
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="What makes this feel like the right home for this phenomenon?"
          className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-amber-400/40"
        />
      </div>
      <button
        onClick={handleConfirm}
        disabled={!selectedQuadrant}
        className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
      >
        {cardIndex < totalCards - 1 ? 'Place & continue →' : 'Place & review map'}
      </button>
    </div>
  );
}

// ─── MapReviewScreen ──────────────────────────────────────────────

function MapReviewScreen({ cards, placements, onRevise, onNext }: {
  cards: PhenomenonCard[];
  placements: PhenomenonPlacement[];
  onRevise: (cardIndex: number) => void;
  onNext: () => void;
}) {
  const quadrants: PhenomenonQuadrant[] = ['UL', 'UR', 'LL', 'LR'];
  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">Your integral map</h2>
        <p className="text-slate-400 text-xs">Tap any card to revisit its placement. When it looks right, continue.</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {quadrants.map((q) => {
          const meta = QUADRANT_META[q];
          const placed = placements.filter((p) => p.quadrant === q);
          return (
            <div key={q} className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-3 min-h-[80px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{meta.pronoun}</p>
              <p className="text-xs text-slate-400 font-medium mb-2">{meta.desc.split(',')[0]}</p>
              {placed.length === 0 && (
                <p className="text-[10px] text-slate-700 italic">empty</p>
              )}
              {placed.map((p) => {
                const card = cardMap[p.cardId];
                const cardIndex = cards.findIndex((c) => c.id === p.cardId);
                return card ? (
                  <button
                    key={p.cardId}
                    onClick={() => onRevise(cardIndex)}
                    className="block w-full text-left text-xs bg-amber-500/10 border border-amber-400/20 rounded-lg px-2 py-1 text-amber-200 mb-1 hover:bg-amber-500/20 transition-colors"
                  >
                    {card.name}
                  </button>
                ) : null;
              })}
            </div>
          );
        })}
      </div>
      {placements.length < cards.length && (
        <p className="text-amber-400/70 text-xs">
          {cards.length - placements.length} card(s) not yet placed — go back to complete them.
        </p>
      )}
      <button
        onClick={onNext}
        disabled={placements.length < cards.length}
        className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
      >
        Analyse this map
      </button>
    </div>
  );
}

// ─── AIChallengeScreen ────────────────────────────────────────────

function AIChallengeScreen({ cards, placements, challenges, onNext, onSkipToSynthesis }: {
  cards: PhenomenonCard[];
  placements: PhenomenonPlacement[];
  challenges: AIChallengeItem[];
  onNext: () => void;
  onSkipToSynthesis: () => void;
}) {
  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">Tensions in your map</h2>
        <p className="text-slate-400 text-xs">The AI found these tensions worth examining.</p>
      </div>
      {challenges.length === 0 && (
        <p className="text-slate-500 text-sm italic">Your map looks internally consistent — no major tensions flagged.</p>
      )}
      <div className="space-y-3">
        {challenges.map((c, i) => {
          const card = cardMap[c.cardId];
          const placement = placements.find((p) => p.cardId === c.cardId);
          return (
            <div key={i} className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-400/20 rounded px-2 py-0.5 shrink-0">
                  {card?.name ?? c.cardId}
                </span>
                {placement && (
                  <span className="text-xs text-slate-500">
                    {placement.quadrant} → also consider <span className="text-amber-300/70">{c.counterQuadrant}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{c.challenge}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 transition-colors"
        >
          Explore a tension further (Socratic)
        </button>
        <button
          onClick={onSkipToSynthesis}
          className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Skip to synthesis
        </button>
      </div>
    </div>
  );
}

// ─── SocraticScreen ───────────────────────────────────────────────

function SocraticScreen({ history, onSend, onFinish, loading }: {
  history: SocraticMessage[];
  onSend: (msg: string) => void;
  onFinish: () => void;
  loading: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || loading || history.length >= 10) return;
    onSend(input.trim());
    setInput('');
  };

  const firstProbe = history.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">Deeper inquiry</h2>
        <p className="text-slate-400 text-xs">A Socratic exchange around the richest tension in your map. Exit when ready.</p>
      </div>
      {firstProbe && !loading && (
        <button
          onClick={() => onSend('Begin the inquiry.')}
          className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700/40 text-slate-300 text-sm hover:border-amber-400/30 transition-colors"
        >
          Begin inquiry
        </button>
      )}
      {loading && history.length === 0 && (
        <p className="text-slate-500 text-sm animate-pulse">Formulating question…</p>
      )}
      {history.length > 0 && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {history.map((m, i) => (
            <div key={i} className={`text-sm leading-relaxed ${m.role === 'ai' ? 'text-slate-200' : 'text-slate-400 italic'}`}>
              {m.role === 'ai' ? m.content : `"${m.content}"`}
            </div>
          ))}
          {loading && <p className="text-slate-600 text-xs animate-pulse">…</p>}
        </div>
      )}
      {history.length > 0 && !loading && history.length < 10 && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Your response…"
            className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 text-xs text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-500/10 disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
      <button
        onClick={onFinish}
        className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
      >
        {history.length > 0 ? 'Move to synthesis →' : 'Skip to synthesis →'}
      </button>
    </div>
  );
}

// ─── SynthesisScreen ──────────────────────────────────────────────

function SynthesisScreen({ synthesis, loading, error, onGenerate, onClose }: {
  synthesis: string;
  loading: boolean;
  error: string;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-serif mb-1">Tetra-arising</h2>
        <p className="text-slate-400 text-xs">What becomes visible when you hold all four quadrants at once.</p>
      </div>
      {!synthesis && !loading && (
        <button
          onClick={onGenerate}
          className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-medium text-sm hover:bg-amber-500/30 transition-colors"
        >
          Generate synthesis
        </button>
      )}
      {loading && <p className="text-slate-500 text-sm animate-pulse">Synthesising your integral map…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {synthesis && (
        <div className="bg-slate-900/60 border border-amber-400/10 rounded-xl p-5">
          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{synthesis}</p>
        </div>
      )}
      {synthesis && (
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700/40 text-slate-300 font-medium text-sm hover:border-amber-400/20 transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}
