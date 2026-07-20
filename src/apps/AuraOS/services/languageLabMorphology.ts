import { LexiconEntry } from './languageLabLexicons';

export interface MorphologyResult {
  romanization: string;
  nativeScript?: string;
  grammaticalNotes: string;
  forms: Array<{ word: string; role: string; gloss: string }>;
}

export interface InflectionTable {
  headword: string;
  paradigm: Record<string, string>;
}

// ============================================================================
// NEO-LATIN ENGINE
// ============================================================================

const NEO_LATIN_DECLENSIONS: Record<string, Record<string, string>> = {
  'n.f.1': {
    'nom.sg': 'a', 'gen.sg': 'ae', 'dat.sg': 'ae', 'acc.sg': 'am', 'abl.sg': 'ā', 'voc.sg': 'a',
    'nom.pl': 'ae', 'gen.pl': 'ārum', 'dat.pl': 'īs', 'acc.pl': 'ās', 'abl.pl': 'īs', 'voc.pl': 'ae'
  },
  'n.m.2': {
    'nom.sg': 'us', 'gen.sg': 'ī', 'dat.sg': 'ō', 'acc.sg': 'um', 'abl.sg': 'ō', 'voc.sg': 'e',
    'nom.pl': 'ī', 'gen.pl': 'ōrum', 'dat.pl': 'īs', 'acc.pl': 'ōs', 'abl.pl': 'īs', 'voc.pl': 'ī'
  },
  'n.n.2': {
    'nom.sg': 'um', 'gen.sg': 'ī', 'dat.sg': 'ō', 'acc.sg': 'um', 'abl.sg': 'ō', 'voc.sg': 'um',
    'nom.pl': 'a', 'gen.pl': 'ōrum', 'dat.pl': 'īs', 'acc.pl': 'a', 'abl.pl': 'īs', 'voc.pl': 'a'
  },
  'n.m.3': {
    'nom.sg': '', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': 'em', 'abl.sg': 'e', 'voc.sg': '',
    'nom.pl': 'ēs', 'gen.pl': 'um', 'dat.pl': 'ibus', 'acc.pl': 'ēs', 'abl.pl': 'ibus', 'voc.pl': 'ēs'
  },
  'n.f.3': {
    'nom.sg': '', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': 'em', 'abl.sg': 'e', 'voc.sg': '',
    'nom.pl': 'ēs', 'gen.pl': 'um', 'dat.pl': 'ibus', 'acc.pl': 'ēs', 'abl.pl': 'ibus', 'voc.pl': 'ēs'
  },
  'n.n.3': {
    'nom.sg': '', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': '', 'abl.sg': 'e', 'voc.sg': '',
    'nom.pl': 'a', 'gen.pl': 'um', 'dat.pl': 'ibus', 'acc.pl': 'a', 'abl.pl': 'ibus', 'voc.pl': 'a'
  },
  'n.m.3i': {
    'nom.sg': 'is', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': 'em', 'abl.sg': 'e', 'voc.sg': 'is',
    'nom.pl': 'ēs', 'gen.pl': 'ium', 'dat.pl': 'ibus', 'acc.pl': 'ēs', 'abl.pl': 'ibus', 'voc.pl': 'ēs'
  },
  'n.f.3i': {
    'nom.sg': 's', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': 'em', 'abl.sg': 'e', 'voc.sg': 's',
    'nom.pl': 'ēs', 'gen.pl': 'ium', 'dat.pl': 'ibus', 'acc.pl': 'ēs', 'abl.pl': 'ibus', 'voc.pl': 'ēs'
  },
  'n.n.3i': {
    'nom.sg': 'e', 'gen.sg': 'is', 'dat.sg': 'ī', 'acc.sg': 'e', 'abl.sg': 'ī', 'voc.sg': 'e',
    'nom.pl': 'ia', 'gen.pl': 'ium', 'dat.pl': 'ibus', 'acc.pl': 'ia', 'abl.pl': 'ibus', 'voc.pl': 'ia'
  }
};

function getNeoLatinStem(entry: LexiconEntry): string {
  if (entry.stem) return entry.stem;
  if (entry.g.startsWith('n.f.1')) return entry.w.slice(0, -1);
  if (entry.g.startsWith('n.m.2') || entry.g.startsWith('n.n.2')) return entry.w.slice(0, -2);
  if (entry.g.startsWith('n.m.3i') || entry.g.startsWith('n.f.3i')) return entry.w.slice(0, -2);
  if (entry.g.startsWith('n.n.3i')) return entry.w.slice(0, -1);
  return entry.w; // Fallback for 3rd declension without explicit stem
}

export function analyzePhraseNeoLatin(tokens: string[], lex: LexiconEntry[]): MorphologyResult {
  const result: MorphologyResult = {
    romanization: '',
    grammaticalNotes: 'Neo-Latin Morphology: ',
    forms: []
  };

  const analyzed = tokens.map(t => {
    const entry = lex.find(l => l.w === t || l.e === t);
    if (!entry) return { word: t, role: 'unknown', gloss: '??' };

    const stem = getNeoLatinStem(entry);
    const decl = NEO_LATIN_DECLENSIONS[entry.g];
    
    if (decl) {
      const nomSg = entry.g.includes('.3') ? entry.w : stem + decl['nom.sg'];
      result.grammaticalNotes += `${entry.w} (${entry.g}) is inflected. `;
      return { word: nomSg, role: 'noun.nom.sg', gloss: entry.e };
    }

    return { word: entry.w, role: entry.g, gloss: entry.e };
  });

  result.romanization = analyzed.map(a => a.word).join(' ');
  result.forms = analyzed;
  return result;
}

// ============================================================================
// ESPERANTO ENGINE
// ============================================================================

export function analyzePhraseEsperanto(tokens: string[], lex: LexiconEntry[]): MorphologyResult {
  const result: MorphologyResult = {
    romanization: '',
    grammaticalNotes: 'Evolved Esperanto: Regular agglutination. ',
    forms: []
  };

  const analyzed = tokens.map(t => {
    // Prioritize exact matches
    let entry = lex.find(l => l.w === t || l.e === t);
    // Fallback to root matches
    if (!entry) {
      entry = lex.find(l => l.w.replace(/[oai]$/, '') === t.replace(/[oai]$/, ''));
    }
    
    if (!entry) return { word: t, role: 'unknown', gloss: '??' };

    let word = entry.w;
    const root = entry.w.replace(/[oai]$/, '');
    
    if (entry.g === 'v') word = root + 'as';
    if (entry.g === 'n') word = root + 'o';

    return { word, role: entry.g, gloss: entry.e };
  });

  result.romanization = analyzed.map(a => a.word).join(' ');
  result.forms = analyzed;
  return result;
}

// ============================================================================
// SANSKRIT ENGINE
// ============================================================================

const DEVANAGARI_MAP: Record<string, string> = {
  'a': 'अ', 'ā': 'आ', 'i': 'इ', 'ī': 'ई', 'u': 'उ', 'ū': 'ऊ', 'ṛ': 'ऋ', 'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
  'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ṅ': 'ङ',
  'c': 'च', 'ch': 'छ', 'j': 'ज', 'jh': 'झ', 'ñ': 'ञ',
  'ṭ': 'ट', 'ṭh': 'ठ', 'ḍ': 'ड', 'ḍh': 'ढ', 'ṇ': 'ण',
  't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
  'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
  'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'ś': 'श', 'ṣ': 'ष', 's': 'स', 'h': 'ह',
  'ṃ': 'ं', 'ḥ': 'ः'
};

function toDevanagari(text: string): string {
  let dev = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === ' ') {
      dev += ' ';
      i++;
      continue;
    }
    let found = false;
    for (let len = 2; len >= 1; len--) {
      const char = text.substring(i, i + len);
      if (DEVANAGARI_MAP[char]) {
        dev += DEVANAGARI_MAP[char];
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      dev += text[i];
      i++;
    }
  }
  return dev;
}

export function analyzePhraseSanskrit(tokens: string[], lex: LexiconEntry[]): MorphologyResult {
  const result: MorphologyResult = {
    romanization: '',
    nativeScript: '',
    grammaticalNotes: 'Living Sanskrit: Sandhi applied. ',
    forms: []
  };

  const analyzed = tokens.map(t => {
    const entry = lex.find(l => l.w === t || l.e === t);
    if (!entry) return { word: t, role: 'unknown', gloss: '??' };
    return { word: entry.w, role: entry.g, gloss: entry.e };
  });

  let roman = analyzed.map(a => a.word).join(' ');
  roman = roman.replace(/as\s+([aāiīuū])/g, 'o $1');

  result.romanization = roman;
  result.nativeScript = toDevanagari(roman);
  result.forms = analyzed;
  return result;
}

// ============================================================================
// QUENYA ENGINE
// ============================================================================

export function analyzePhraseQuenya(tokens: string[], lex: LexiconEntry[]): MorphologyResult {
  const result: MorphologyResult = {
    romanization: '',
    nativeScript: '',
    grammaticalNotes: 'Quenya: Attested corpus only. ',
    forms: []
  };

  const analyzed = tokens.map(t => {
    const entry = lex.find(l => l.w === t || l.e === t);
    if (!entry) return { word: `[No attested root for '${t}']`, role: 'error', gloss: '??' };
    return { word: entry.w, role: entry.g, gloss: entry.e };
  });

  result.romanization = analyzed.map(a => a.word).join(' ');
  result.forms = analyzed;
  return result;
}

export function generateParadigm(entry: LexiconEntry, lang: string): InflectionTable {
  const table: InflectionTable = {
    headword: entry.w,
    paradigm: {}
  };

  if (lang === 'neo-latin') {
    const decl = NEO_LATIN_DECLENSIONS[entry.g];
    if (decl) {
      const stem = getNeoLatinStem(entry);
      Object.entries(decl).forEach(([role, suffix]) => {
        table.paradigm[role] = (entry.g.includes('.3') && (role === 'nom.sg' || role === 'voc.sg')) ? entry.w : stem + suffix;
      });
    }
  }

  if (Object.keys(table.paradigm).length === 0) {
    table.paradigm['base'] = entry.w;
  }

  return table;
}
