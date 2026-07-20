import { LanguageKey, LanguageLabResult } from '../types.ts';
import { neoLatinData, quenyaData, esperantoData, sanskritData } from './languageLabData.ts';
import { neoLatinLexicon, sanskritLexicon, quenyaLexicon, esperantoLexicon } from './languageLabLexicons';
import {
  analyzePhraseNeoLatin,
  analyzePhraseSanskrit,
  analyzePhraseQuenya,
  analyzePhraseEsperanto,
  MorphologyResult
} from './languageLabMorphology';
import { callGrokThenAIJson } from './ai/aiCore';
import { z } from 'zod';

const HISTORY_KEY = 'aura-language-lab-history';
const MAX_HISTORY = 20;

const LEXICONS = {
  'neo-latin': neoLatinLexicon,
  'living-sanskrit': sanskritLexicon,
  'quenya': quenyaLexicon,
  'evolved-esperanto': esperantoLexicon,
};

const ENGINES = {
  'neo-latin': analyzePhraseNeoLatin,
  'living-sanskrit': analyzePhraseSanskrit,
  'quenya': analyzePhraseQuenya,
  'evolved-esperanto': analyzePhraseEsperanto,
};

const DATASETS: Record<LanguageKey, any> = {
  'neo-latin': neoLatinData,
  'quenya': quenyaData,
  'evolved-esperanto': esperantoData,
  'living-sanskrit': sanskritData,
};

const CompositionSchema = z.object({
  composition: z.string().describe('The composed phrase in the target language'),
  grammaticalNotes: z.string().describe('Notes on grammar, agreement, and morphological rules applied'),
  wordForms: z.array(z.object({
    word: z.string(),
    role: z.string(),
    gloss: z.string()
  })).describe('Breakdown of each word in the composition'),
  nativeScript: z.string().optional().describe('Native script rendering (Devanagari for Sanskrit, Tengwar for Quenya)')
});

async function composeWithAI(
  inputPhrase: string,
  languageKey: LanguageKey,
  lexicon: any[]
): Promise<MorphologyResult | null> {
  try {
    const lexiconSummary = lexicon.slice(0, 50).map(e => `${e.w} (${e.g}): ${e.e}`).join('\n');
    const languageDescriptions: Record<LanguageKey, string> = {
      'neo-latin': 'Neo-Latin with 5-declension noun paradigms (nominative, genitive, dative, accusative, ablative, vocative × singular/plural), 4 verb conjugations, adjective agreement by case/gender/number',
      'living-sanskrit': 'Living Sanskrit with Devanagari script, external sandhi rules at word boundaries, a/ā/i-stem noun declension with 8 cases, verb conjugation, and traditional phonological rules',
      'quenya': 'Quenya (attested corpus only from Tolkien\'s works) with case endings from PE17 and LotR appendices. CRITICAL: Only use roots that are explicitly in the lexicon — do not invent unattested words. If no attested root exists, respond with bracketed error message',
      'evolved-esperanto': 'Evolved Esperanto with productive agglutination: noun root → -o (noun), -a (adjective), -i (verb infinitive); accusative -n propagates to adjectives; plural -j propagates'
    };

    const prompt = `You are a linguistic composition engine for ${languageKey.replace('-', ' ')}.

${languageDescriptions[languageKey]}

Available lexicon (sample of ${lexicon.length} entries):
${lexiconSummary}

Compose a natural phrase for this English input: "${inputPhrase}"

Rules:
1. Use ONLY words from the provided lexicon
2. Apply all morphological rules: case agreement, gender agreement, number agreement, conjugation, sandhi, attestation
3. For Quenya: If a concept has no attested root, respond with "[No attested root for '${inputPhrase}']"
4. Respond with valid JSON matching this structure (no markdown, no explanation):
{
  "composition": "the composed phrase with all morphological rules applied",
  "grammaticalNotes": "detailed explanation of grammar rules applied (case, number, gender, conjugation, sandhi, etc.)",
  "wordForms": [
    { "word": "form1", "role": "pos.case.number.gender", "gloss": "meaning" },
    { "word": "form2", "role": "pos.case.number", "gloss": "meaning" }
  ],
  "nativeScript": "native script version if applicable (Devanagari for Sanskrit, Tengwar CSUR for Quenya)"
}`;

    const response = await callGrokThenAIJson(
      'language-composition',
      prompt,
      'grok-4.1-fast',
      CompositionSchema
    );

    return {
      romanization: response.composition,
      nativeScript: response.nativeScript,
      grammaticalNotes: response.grammaticalNotes,
      forms: response.wordForms
    };
  } catch (error) {
    return null;
  }
}

export async function generateLanguage(
  languageKey: LanguageKey,
  inputPhrase: string
): Promise<LanguageLabResult> {
  const dataset = DATASETS[languageKey];
  const engine = ENGINES[languageKey];
  const lexicon = LEXICONS[languageKey];

  if (!engine || !lexicon) {
    return fallbackResult(languageKey, inputPhrase);
  }

  // Try AI composition first (Grok 4.1 Fast with morphological rules)
  const aiComposition = await composeWithAI(inputPhrase, languageKey, lexicon);
  const morph = aiComposition || (() => {
    // Fallback to rule-based morphology if AI fails
    const tokens = inputPhrase.toLowerCase().split(/\s+/).filter(Boolean);
    return engine(tokens, lexicon);
  })();

  const result: LanguageLabResult = {
    languageKey,
    inputPhrase,
    romanization: morph.romanization,
    nativeScript: morph.nativeScript,
    grammaticalNotes: morph.grammaticalNotes,
    exampleSentences: dataset?.exampleSentences?.slice(0, 3).map((s: any) => ({
      original: s.sanskrit || s.quenya || s.esperanto || s.latin,
      gloss: s.gloss,
      translation: s.english
    })) || [],
    revivalPhilosophy: dataset?.revivalPhilosophy || 'Revival focused on AI-guided morphological composition.',
    generatedAt: new Date().toISOString()
  };

  saveToHistory(result);
  return result;
}

function fallbackResult(languageKey: LanguageKey, inputPhrase: string): LanguageLabResult {
  return {
    languageKey,
    inputPhrase,
    romanization: inputPhrase,
    grammaticalNotes: 'Language dataset or engine unavailable.',
    exampleSentences: [
      { original: inputPhrase, gloss: '—', translation: inputPhrase }
    ],
    revivalPhilosophy: 'Curated lexicon data could not be loaded.',
    generatedAt: new Date().toISOString()
  };
}

export function loadHistory(): LanguageLabResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToHistory(result: LanguageLabResult) {
  try {
    const history = loadHistory();
    const trimmed = [result, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable
  }
}
