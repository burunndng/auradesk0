/**
 * LANGUAGE LAB GENERATION RULES
 *
 * Rigorous morphological and phonological rules for neo-revival and speculative
 * language composition. All rules attested in scholarly sources or reconstructions.
 *
 * Purpose: Generate plausible neologisms (modern vocabulary) using systematic,
 * rule-based derivation from attested root morphemes.
 */

// ============================================================================
// NEO-LATIN GENERATION RULES
// ============================================================================
// Source: Allen & Greenough Ars Grammatica, Matasović 2004, neolatin.org

export const neoLatinRules = {
  description: 'Classical Latin morphology with systematic neologism derivation',

  // DERIVATIONAL SUFFIXES (productive in neologism formation)
  derivationSuffixes: [
    {
      suffix: '-atio, -onis (f.3)',
      meaning: 'action, result of action',
      example: 'computatio (computation), transmissio (transmission)',
      usage: 'Append to verb stem: computare → computatio'
    },
    {
      suffix: '-tor, -toris (m.3)',
      meaning: 'agent, one who does',
      example: 'calculator (calculator), translator (translator)',
      usage: 'Append to verb stem: computare → computator'
    },
    {
      suffix: '-trix, -tricis (f.3)',
      meaning: 'female agent',
      example: 'calculatrix (female calculator)',
      usage: 'Female form of -tor: computator → computatrix'
    },
    {
      suffix: '-ium, -ii (n.2)',
      meaning: 'thing, object, machine',
      example: 'computatrum (computing machine), telephonium (telephone)',
      usage: 'Append to verb or noun: telefon + -ium → telephonium'
    },
    {
      suffix: '-alis, -ale (adj.)',
      meaning: 'relating to',
      example: 'naturalis (natural), digitalis (digital)',
      usage: 'Append to noun: digitus → digitalis'
    },
    {
      suffix: '-icus, -ica, -icum (adj.)',
      meaning: 'relating to, characteristic of',
      example: 'publicus (public), electricus (electrical)',
      usage: 'Common in scientific terms: electrum → electricus'
    },
    {
      suffix: '-ensis, -ense (adj.)',
      meaning: 'of, from, belonging to',
      example: 'Americanus → Americanus (American)',
      usage: 'Geo-political adjectives'
    },
    {
      suffix: '-mentum, -i (n.2)',
      meaning: 'result, means, instrument',
      example: 'instrumentum (instrument), medicamentum (medicine)',
      usage: 'Append to verb: computare → computamentum (computing device)'
    },
    {
      suffix: '-entia, -iae (f.1)',
      meaning: 'state, quality, condition',
      example: 'scientia (knowledge), potentia (power)',
      usage: 'Abstract nouns: sapiens → sapientia'
    },
    {
      suffix: '-tus, -a, -um (adj.)',
      meaning: 'having undergone action (past participle)',
      example: 'computatus (computed), transmissus (transmitted)',
      usage: 'Perfect passive participle: verb in -atus form'
    },
    {
      suffix: '-tus, -i (m.2/n.3)',
      meaning: 'state, condition, collection',
      example: 'status (state), habitatus (dwelling)',
      usage: 'Abstract noun or collection: habitus (dwelling)'
    },
    {
      suffix: '-ia, -iae (f.1)',
      meaning: 'collection, abstract quality',
      example: 'batalia (battle), militia (military)',
      usage: 'Often from -ia adjectives: militaris → militia'
    },
    {
      suffix: '-ose, -osus (adj.)',
      meaning: 'full of, abounding in',
      example: 'verbosus (verbose), arborosus (tree-like)',
      usage: 'Quality adjectives: verbum → verbosus'
    },
    {
      suffix: '-bilis, -bile (adj.)',
      meaning: 'capable of, worthy of',
      example: 'computabilis (computable), intelligibilis (intelligible)',
      usage: 'Possibility: computare → computabilis'
    },
    {
      suffix: '-anus, -ana, -anum (adj.)',
      meaning: 'relating to, belonging to',
      example: 'humanus (human), mundanus (worldly)',
      usage: 'Relational adjectives: homo → humanus'
    },
  ],

  // PREFIXES (productive in neologism formation)
  derivationPrefixes: [
    {
      prefix: 're-',
      meaning: 'again, back',
      example: 'recomputo (recompute), remitto (send back)',
      usage: 'Prepend to verb: computare → recomputare'
    },
    {
      prefix: 'pre-',
      meaning: 'before',
      example: 'praefectus (prefect), praecognitus (foreknown)',
      usage: 'Prepend to verb/adj: cognitus → praecognitus'
    },
    {
      prefix: 'post-',
      meaning: 'after',
      example: 'postmeridiem (after noon)',
      usage: 'Temporal: meridiem → postmeridiem'
    },
    {
      prefix: 'anti-',
      meaning: 'against, opposite',
      example: 'antiquus (ancient), antichrystus (antichrist)',
      usage: 'Opposition: christus → antichrystus'
    },
    {
      prefix: 'pro-',
      meaning: 'forward, instead of',
      example: 'proficio (advance), proconsul (proconsul)',
      usage: 'Forward motion: ficere → proficere'
    },
    {
      prefix: 'contra-',
      meaning: 'against',
      example: 'contravenio (contradict)',
      usage: 'Opposition: venio → contravenio'
    },
    {
      prefix: 'inter-',
      meaning: 'between, among',
      example: 'interrete (internet, between-net)',
      usage: 'Spatial: rete → interrete'
    },
    {
      prefix: 'trans-',
      meaning: 'across, through',
      example: 'transmissio (transmission)',
      usage: 'Crossing: mittere → transmittere'
    },
    {
      prefix: 'super-',
      meaning: 'above, over',
      example: 'superputidus (super rotten)',
      usage: 'Intensity/excess: putidus → superputidus'
    },
    {
      prefix: 'sub-',
      meaning: 'under, below',
      example: 'subdivido (subdivide)',
      usage: 'Under/below: dividere → subdividere'
    },
    {
      prefix: 'dis-',
      meaning: 'not, opposite',
      example: 'displicentia (displeasure)',
      usage: 'Negation: plicentia → displicentia'
    },
    {
      prefix: 'in-/im-/ir-/il-',
      meaning: 'not, in, into',
      example: 'immortalis (immortal), impossibilis (impossible)',
      usage: 'Negation/direction: mortalis → immortalis'
    },
  ],

  // COMPOUND RULES
  compoundRules: [
    {
      rule: 'Noun + Noun (genitive linking)',
      example: 'computatrix reginaedae (queen calculator)',
      pattern: 'N1 + N2(gen.sg.) or N1(adj.form) + N2',
      usage: 'Create complex nouns: rex + computator = computator regis'
    },
    {
      rule: 'Adjective + Noun (agreement)',
      example: 'computatrum digitale (digital computer)',
      pattern: 'Adj + N (must agree in case/gender/number)',
      usage: 'Attribute: computatrum (n.2) + digitale (adj.n.2.sg.)'
    },
    {
      rule: 'Verb + Object (synthetic compound)',
      example: 'flumen+ferre → fluminifera (water-bearing)',
      pattern: 'V.stem + object, often with connecting vowel',
      usage: 'Rare in Classical Latin, productive in scientific neologisms'
    },
  ],

  // PHONOLOGICAL RULES (Ecclesiastical Latin)
  phonologyRules: [
    {
      rule: 'Long vowel marking',
      marker: 'Macron (ā ē ī ō ū)',
      example: 'ārēna (sand), sōl (sun)',
      usage: 'Essential in classical texts; modern neologisms may omit'
    },
    {
      rule: 'C always /k/ (never /s/)',
      example: 'computare /kom-pu-TAH-reh/, not /kom-PYU-...',
      usage: 'Ecclesiastical pronunciation'
    },
    {
      rule: 'V = /w/ or /v/ (depending on position)',
      example: 'vivus /WI-wus/ or /VEE-vus/',
      usage: 'Ecclesiastical: usually /w/ at start, /v/ medial'
    },
    {
      rule: 'Double consonants held longer',
      example: 'mittere /mit-TEH-reh/ (geminate -tt-)',
      usage: 'Phonetic emphasis on doubled consonants'
    },
    {
      rule: 'Word stress on penultimate if heavy, antepenultimate if light',
      example: 'computátor (heavy penult: -TOR), témpora (light penult: -RA)',
      usage: 'Accentual pattern (not phonemic in Latin, but rhythmic)'
    },
  ],

  // CASE SYSTEM (essential for composition)
  caseForms: {
    nominative: { marker: '-', example: 'homo (man)', usage: 'Subject, predicate nominative' },
    genitive: { marker: '-is/-ae/-i/-orum/-arum', example: 'hominis (of a man)', usage: 'Possession, partitive' },
    dative: { marker: '-o/-ae/-i/-ibus', example: 'homini (to a man)', usage: 'Indirect object' },
    accusative: { marker: '-em/-am/-um/-os/-as', example: 'hominem (a man-ACC)', usage: 'Direct object' },
    ablative: { marker: '-o/-a/-o/-ibus', example: 'homine (by/with a man)', usage: 'Means, manner, place' },
    vocative: { marker: '-e/-a/-um (same as nominative for m.2, m.3, n.)', example: 'O homo! (O man!)', usage: 'Direct address' },
  },

  // DECLENSION PATTERNS (for understanding inflection)
  declensionPatterns: [
    {
      number: '1st declension',
      gender: 'Feminine (mostly)',
      nominativeStem: '-a/-ae',
      example: 'terra (earth)',
      pattern: 'terra, terrae, terrae, terram, terrā, terra'
    },
    {
      number: '2nd declension',
      gender: 'Masculine/Neuter',
      nominativeStem: '-us/-i (m.), -um/-i (n.)',
      example: 'mundus (world), bellum (war)',
      pattern: 'mundus, mundi, mundo, mundum, mundo, munde'
    },
    {
      number: '3rd declension',
      gender: 'All genders',
      nominativeStem: '-is/-em (consonant stems), -e/-em (i-stems)',
      example: 'homo (man), civitas (city)',
      pattern: 'homo, hominis, homini, hominem, homine, homo'
    },
    {
      number: '4th declension',
      gender: 'Masculine/Neuter',
      nominativeStem: '-us/-us (m.), -u/-u (n.)',
      example: 'manus (hand), genu (knee)',
      pattern: 'manus, manus, manui, manum, manu, manus'
    },
    {
      number: '5th declension',
      gender: 'Feminine (mostly)',
      nominativeStem: '-es/-ei',
      example: 'dies (day), res (thing)',
      pattern: 'dies, diei, diei, diem, die, dies'
    },
  ],

  // CONJUGATION PATTERNS (for verb composition)
  conjugationPatterns: [
    {
      number: '1st conjugation',
      vowel: 'ā',
      infinitive: '-āre',
      example: 'amāre (to love)',
      present: 'amō, amās, amat, amāmus, amātis, amant',
      rules: 'Productive in modern coinages (computāre, transmittāre)'
    },
    {
      number: '2nd conjugation',
      vowel: 'ē',
      infinitive: '-ēre',
      example: 'monēre (to warn)',
      present: 'moneō, monēs, monet, monēmus, monētis, monent',
      rules: 'Less productive; used in compounds (vidēre → providēre)'
    },
    {
      number: '3rd conjugation',
      vowel: '-i- (present)',
      infinitive: '-ere',
      example: 'legere (to read)',
      present: 'legō, legis, legit, legimus, legitis, legunt',
      rules: 'Diverse; mix of -ō and -i stems'
    },
    {
      number: '4th conjugation',
      vowel: 'ī',
      infinitive: '-īre',
      example: 'audīre (to hear)',
      present: 'audiō, audīs, audit, audīmus, audītis, audiunt',
      rules: 'Smaller class; productive in some domains'
    },
  ],

  generationAlgorithm: `
    To generate a Neo-Latin neologism:

    1. IDENTIFY CONCEPT: e.g., "telephone" = long-distance sound
    2. FIND ROOT MORPHEMES:
       - Root: "tele" (Greek, but adopted) or "longinquus" (far) + "phonē" (sound)
       - Latin: longus (long) + vox (voice) = "longavox" or via Greek "telephonium"
    3. APPLY DERIVATION RULES:
       - If you need a noun: apply -ium, -atio, -tus
       - If you need an adjective: apply -alis, -icus, -osus
       - If you need an agent: apply -tor, -trix
    4. INFLECT CORRECTLY:
       - Determine gender/declension from ending
       - Apply case endings matching syntax context
    5. APPLY PHONOLOGICAL RULES:
       - Mark long vowels with macrons (optional in modern usage)
       - Ensure C = /k/ (never /s/)
       - Double consonants for emphasis
    6. VERIFY ATTESTATION:
       - Check if similar compounds exist in classical texts
       - If not, document derivation path clearly

    EXAMPLE: "computer"
    - Root: computāre (to calculate) < cum (with) + putāre (to reckon)
    - Agent form: computātor (one who computes)
    - Machine form: computātrum (computing machine, adding -um device suffix)
    - Adjective: computātōrius (relating to computation)
  `
};

// ============================================================================
// QUENYA GENERATION RULES
// ============================================================================
// Source: Tolkien Silmarillion, LotR Appendix E, Parma Eldalamberon

export const quenyaRules = {
  description: 'Tolkien\'s Elvish: Only attested roots + systematic derivation',

  attestedRoots: [
    // Documented from Silmarillion & LotR
    { root: 'EL', meaning: 'star', examples: ['elen (star)', 'Eldar (people of stars)'] },
    { root: 'VAlya', meaning: 'power', examples: ['vala (power/authority)', 'Valar (powers)'] },
    { root: 'MIR', meaning: 'jewel', examples: ['mîr (jewel)', 'Silmarilli'] },
    { root: 'OL', meaning: 'light/radiance', examples: ['olos (tree of light)'] },
    { root: 'NIR', meaning: 'white', examples: ['nirë (white)'] },
    { root: 'KAL', meaning: 'light', examples: ['cala (bright)'] },
    { root: 'TYR', meaning: 'master', examples: ['tyro (master)', 'turco (mighty)'] },
    { root: 'MAR', meaning: 'dwelling', examples: ['marë (dwelling)', 'mara (home)'] },
    { root: 'PEN', meaning: 'have', examples: ['i penas (those who have)'] },
    { root: 'MEN', meaning: 'go', examples: ['menta (went)', 'mende (going)'] },
  ],

  derivationRules: [
    {
      rule: 'Noun pluralization',
      pattern: '-ë → -i (vowel stems), Consonant → -i or -r',
      examples: ['elen (star) → eleni (stars)', 'vala (power) → valar (powers)'],
      usage: 'Stem vowel changes on pluralization'
    },
    {
      rule: 'Genitive (possession)',
      pattern: 'Noun + -o ending (or stem change)',
      examples: ['elen → eleno (of a star)', 'valar → valarin (of the powers)'],
      usage: 'Shows possession or relation'
    },
    {
      rule: 'Locative (place)',
      pattern: 'Noun + -ssë ending',
      examples: ['Arda → Ardassë (in Arda)', 'Valinor → Valinoressa (in Valinor)'],
      usage: 'Shows location'
    },
    {
      rule: 'Dative/Allative (direction/giving to)',
      pattern: 'Noun + -n (dative) or -nna (allative)',
      examples: ['elen → elenan (to/for the star)', 'Varda → Vardan (to Varda)'],
      usage: 'Indirect object, direction toward'
    },
    {
      rule: 'Ablative (from)',
      pattern: 'Noun + -llo or -llo-ending',
      examples: ['Arda → Ardallo (from Arda)'],
      usage: 'Source or separation'
    },
    {
      rule: 'Adjectives (descriptive)',
      pattern: 'Root + -a or -ia ending; NO gender agreement',
      examples: ['elen-a (starry)', 'vala-ia (powerful)', 'alta (great)'],
      usage: 'Adjectives do not agree with nouns in Quenya'
    },
    {
      rule: 'Agent nouns (doer)',
      pattern: 'Verb stem + -a suffix (agent participle)',
      examples: ['quetë (speak) → queta (speaker)', 'cala (shine) → cala (shining one)'],
      usage: 'One who does the action'
    },
    {
      rule: 'Abstract nouns (quality)',
      pattern: 'Root + -ë ending (often feminine)',
      examples: ['silë (light)', 'síla (shines) → silë (radiance)', 'vaila (powerful) → vailë (power)'],
      usage: 'Abstract qualities or states'
    },
    {
      rule: 'Diminutives',
      pattern: 'Root + -on or -in ending',
      examples: ['elen (star) → elon (little star)', 'mellon (friend) → melin (dear friend)'],
      usage: 'Small or endearing version'
    },
    {
      rule: 'Verbalization',
      pattern: 'Noun/adj + -a (to make, to become)',
      examples: ['cala (bright) → calaita (to brighten)', 'silë (light) → sileita (to illuminate)'],
      usage: 'Turn noun/adj into verb'
    },
  ],

  phonologyRules: [
    {
      rule: 'Vowel inventory',
      phonemes: 'a, e, i, o, u (5 vowels, no length distinction in modern Quenya)',
      pronunciation: 'All short (Classical Quenya had length; modern simplified)',
      usage: 'Always clear, distinct vowels'
    },
    {
      rule: 'Consonant phonotactics',
      constraint: 'CV (consonant-optional); prefer open syllables',
      examples: ['e-len (2 syllables)', 'ma-ri-ë (3 syllables)', 'a-men-ëa (4)'],
      usage: 'Each syllable ideally ends in vowel'
    },
    {
      rule: 'Stress (accentuation)',
      pattern: 'Penultimate syllable always stressed',
      examples: ['EL-en (star)', 'va-LAR (powers)', 'men-ti-EL-va (eternal meeting)'],
      usage: 'Rhythmic pattern; no tone changes meaning'
    },
    {
      rule: 'Consonant clusters',
      restriction: 'Limited; typically stop + liquid (tr-, dr-, pr-) at syllable boundary',
      examples: ['Elentíri (star-watchers: el-en-TÍ-ri)', 'Quenta (narrative: KWEN-ta)'],
      usage: 'No sibilant clusters; harmony preferred'
    },
    {
      rule: 'Nasal + stop assimilation',
      pattern: 'n → ŋ before k/g, assimilates to stop',
      examples: ['Anguianta (iron-maiden: A-ŋ-ghi-AN-ta)'],
      usage: 'Phonetic rule, not orthographic'
    },
  ],

  dialectVariations: [
    {
      dialect: 'High Quenya (Valinor standard)',
      characteristics: 'Full vowel harmony, classical phonology, conservative morphology',
      examples: ['elen (star), valar (powers), Valinor']
    },
    {
      dialect: 'Exilic Quenya (Noldor/Teleri)',
      characteristics: 'Some phonological drift, loanwords from Sindarin, modified case endings',
      examples: ['Beleriand influences, some nasal assimilations']
    },
  ],

  generationAlgorithm: `
    To generate Quenya neologism (extended vocabulary):

    1. START WITH ATTESTED ROOT:
       - Must be documented in Tolkien's published works
       - Choose root from Silmarillion appendices or LotR App. E
    2. APPLY DERIVATION RULES:
       - If noun: use nominative singular (base form)
       - If adjective: add -a or -ia suffix to root
       - If agent: add -a to verb stem
       - If quality: add -ë to root
    3. BUILD COMPOUNDS (rare but possible):
       - Root1 + Root2 (linked by vowel harmony)
       - Example: elen (star) + tîr (master) = Elentîr (star-master)
    4. INFLECT FOR CASE:
       - Nominative: base form (elen)
       - Genitive: -o (eleno) or stem change (valar ← vala)
       - Locative: -ssë (Ardassë)
       - Dative: -n (Vardan)
       - Ablative: -llo (Ardallo)
    5. APPLY PHONOLOGY:
       - Penultimate stress (EL-en, va-LAR)
       - Maintain CV syllable structure
       - No sibilant clusters
    6. VERIFY QUENYA AUTHENTICITY:
       - Every morpheme must be attested in Tolkien
       - Every derivation rule must be documented in secondary sources
       - When in doubt, cite source

    EXAMPLE: "ancient light"
    - Root: "calon" (light, radiance) — attested in LotR App. E
    - Adjective: "calonëa" (full of light, luminous)
    - Compound: calonëa oilossë (luminous eternal-things)
    - Stress: ca-lo-NËA oi-LOS-së
  `
};

// ============================================================================
// ESPERANTO GENERATION RULES
// ============================================================================
// Source: Zamenhof Unua Libro 1887, Akademio de Esperanto

export const esperantoRules = {
  description: 'Zamenhof\'s constructed language: Completely regular, no exceptions',

  partOfSpeechMarkers: [
    {
      type: 'Noun',
      marker: '-o (nominative), -oj (plural), -on (accusative), -ojn (acc.plural)',
      examples: ['homo (man), homoj (men), homon (man-ACC), homojn (men-ACC)'],
      rules: 'Universally regular; all nouns follow this pattern'
    },
    {
      type: 'Adjective',
      marker: '-a (nominative), -aj (plural), -an (accusative), -ajn (acc.plural)',
      examples: ['bona (good), bonaj (good-pl), bonan (good-ACC), bonajn (good-ACC-pl)'],
      rules: 'Must agree with noun in case and number'
    },
    {
      type: 'Adverb',
      marker: '-e (always)',
      examples: ['bone (well), rapide (quickly), mirinde (wonderfully)'],
      rules: 'No variation; always -e ending'
    },
    {
      type: 'Verb',
      marker: 'Tense infinitives: -i (inf.), -as (pres.), -is (past), -os (fut.), -us (cond.), -u (subj.)',
      examples: ['ami (to love), amas (loves), amis (loved), amos (will love), amus (would love), amu (may love)'],
      rules: 'Same conjugation for all verbs; no irregular verbs; no person/number marking'
    },
    {
      type: 'Participle',
      marker: '-ant(a/-o/-e), -int(a/-o/-e), -ont(a/-o/-e)',
      examples: ['amanta (loving), aminta (having loved), amonta (about to love)'],
      rules: 'Active participles; take adjective endings'
    },
    {
      type: 'Preposition',
      marker: 'invariant + accusative when transitional',
      examples: ['al (to), de (of), en (in), pri (about)'],
      rules: 'No agreement; case governed by preposition'
    },
  ],

  derivationPrefixes: [
    {
      prefix: 'mal-',
      meaning: 'negation, opposite, bad',
      examples: ['bono (good) → malbono (bad)', 'amiko (friend) → malamiko (enemy)'],
      rules: 'Highly productive; reverses meaning'
    },
    {
      prefix: 're-',
      meaning: 'again, back',
      examples: ['fari (to do) → refari (to redo)', 'veni (to come) → reveni (to return)'],
      rules: 'Repetition or reversal'
    },
    {
      prefix: 'dis-',
      meaning: 'apart, away',
      examples: ['metho (method) → dismetho (disorder)', 'konsidero (consideration) → diskonsidero (disregard)'],
      rules: 'Separation or undoing'
    },
    {
      prefix: 'ek-',
      meaning: 'out, forth, suddenly',
      examples: ['brili (to shine) → ekrilo (sudden brightness)', 'paroli (to speak) → ekparoli (to exclaim)'],
      rules: 'Sudden or emergent action'
    },
    {
      prefix: 'en-',
      meaning: 'in, into, cause to be',
      examples: ['domo (house) → endomo (indoor, housed)', 'furor (fury) → enfuror (to enrage)'],
      rules: 'Causative or locative'
    },
    {
      prefix: 'per-',
      meaning: 'through, thoroughly',
      examples: ['fari (to do) → perfari (to accomplish)', 'vidi (to see) → pervidi (to discern)'],
      rules: 'Completeness or thoroughness'
    },
    {
      prefix: 'pra-',
      meaning: 'before, anterior',
      examples: ['parolo (speech) → praparolo (foreword)', 'historia (history) → prahistoria (prehistory)'],
      rules: 'Temporal anteriority'
    },
    {
      prefix: 'antaŭ-',
      meaning: 'before, ahead of',
      examples: ['diro (saying) → antaŭdiro (prediction)', 'vido (seeing) → antaŭvido (foresight)'],
      rules: 'Spatial or temporal precedence'
    },
    {
      prefix: 'post-',
      meaning: 'after',
      examples: ['morto (death) → postmorto (afterlife)', 'milito (war) → postmilito (post-war)'],
      rules: 'Temporal posteriority'
    },
    {
      prefix: 'kontraŭ-',
      meaning: 'against',
      examples: ['atako (attack) → kontraŭatako (counterattack)', 'voto (vote) → kontraŭvoto (opposed vote)'],
      rules: 'Opposition'
    },
  ],

  derivationSuffixes: [
    {
      suffix: '-ajo',
      meaning: 'concrete result, thing',
      examples: ['fari (do) → faraĵo (deed/thing done)', 'mangxi (eat) → mangxaĵo (food)'],
      rules: 'Concrete noun from verb/adj'
    },
    {
      suffix: '-anto',
      meaning: 'one who does (agent)',
      examples: ['labori (work) → laboranto (worker)', 'dormi (sleep) → dormanto (sleeper)'],
      rules: 'Agent/professional noun'
    },
    {
      suffix: '-emo',
      meaning: 'inclination, tendency',
      examples: ['amo (love) → amemo (loving nature)', 'malo (bad) → malemo (dislike)'],
      rules: 'Abstract quality/tendency'
    },
    {
      suffix: '-eco',
      meaning: 'state, condition, quality',
      examples: ['bela (beautiful) → beleco (beauty)', 'forta (strong) → forteco (strength)'],
      rules: 'Quality noun (very productive)'
    },
    {
      suffix: '-ido',
      meaning: 'offspring, junior',
      examples: ['patro (father) → patrido (son)', 'katidino (daughter of cat)'],
      rules: 'Family relations (now rarely used)'
    },
    {
      suffix: '-aro',
      meaning: 'collection, group',
      examples: ['arbo (tree) → arbaro (forest)', 'verbo (word) → verbaro (vocabulary)'],
      rules: 'Collective nouns'
    },
    {
      suffix: '-isto',
      meaning: 'specialist, devotee',
      examples: ['muziko (music) → muzikisto (musician)', 'matematiko (math) → matematikisto (mathematician)'],
      rules: 'Professional or devotee'
    },
    {
      suffix: '-ismo',
      meaning: 'belief system, -ism',
      examples: ['socio (society) → socialismo (socialism)', 'komunismo (communism)'],
      rules: 'Ideology or system'
    },
    {
      suffix: '-um',
      meaning: 'collection, mass (non-agglutinative)',
      examples: ['leŝo (reading) → leŝumo (library)', 'medicino (medicine) → medicinumo (pharmacy)'],
      rules: 'Rare; modern Esperanto uses -ejo instead'
    },
    {
      suffix: '-ej',
      meaning: 'place, locale',
      examples: ['dormi (sleep) → dormejo (bedroom)', 'manĝi (eat) → manĝejo (restaurant)'],
      rules: 'Place where action occurs (very productive)'
    },
    {
      suffix: '-er',
      meaning: 'unit, element',
      examples: ['kelko (chaos) → kelero (confused bit)', 'aero (air) → aero (airy quality)'],
      rules: 'Rare; mainly in scientific coinages'
    },
    {
      suffix: '-il',
      meaning: 'tool, instrument',
      examples: ['tranĉi (cut) → tranĉilo (knife)', 'brusi (brush) → brusilo (brush)'],
      rules: 'Tool/instrument noun'
    },
    {
      suffix: '-ind',
      meaning: 'worthy of',
      examples: ['amo (love) → amindo (worthy of love)', 'respekto (respect) → respektinda (respectable)'],
      rules: 'Worthiness (adjective in -a, noun in -o)'
    },
    {
      suffix: '-ebl',
      meaning: 'capable of, possible',
      examples: ['leĝi (read) → legebla (readable)', 'kompreni (understand) → kompreneble (understandably)'],
      rules: 'Possibility (adj: -a, adv: -e)'
    },
    {
      suffix: '-ig',
      meaning: 'to cause, to make',
      examples: ['forta (strong) → fortigi (to strengthen)', 'varma (warm) → varmigi (to warm up)'],
      rules: 'Causative (verb formation)'
    },
    {
      suffix: '-iĝ',
      meaning: 'to become, to undergo',
      examples: ['varma (warm) → varmiĝi (to become warm)', 'malsa (healthy) → malsa-iĝi (to get sick)'],
      rules: 'Inchoative (change of state)'
    },
    {
      suffix: '-ad',
      meaning: 'continuous action, duration',
      examples: ['danci (dance) → dancado (dancing, sustained)', 'labori (work) → laborado (ongoing work)'],
      rules: 'Durative/iterative aspect'
    },
  ],

  compoundingRules: [
    {
      rule: 'Noun + Noun',
      pattern: 'N1 + N2, with N2 inflected for case/number',
      examples: ['homo (man) + aro (group) → homaro (humanity)', 'lingvo (language) + lernado (learning) → lingvolernado (language learning)'],
      usage: 'Very productive; first element determines semantics'
    },
    {
      rule: 'Adjective + Noun',
      pattern: 'Adj must agree: Adj-a/aj/an/ajn + Noun-o/oj/on/ojn',
      examples: ['granda (big) + domo (house) → grandadomo (mansion)', 'malnova (old) + libro (book) → malnovlibro (antique book)'],
      usage: 'Agreement essential'
    },
    {
      rule: 'Prefix + Root',
      pattern: 'Prefix (invariant) + Root + ending',
      examples: ['mal- + nova (new) → malnova (old)', 're- + veni (come) → reveni (return)'],
      usage: 'Highly productive'
    },
    {
      rule: 'Root + Suffix + Ending',
      pattern: 'Root + -aj-, -il-, -emo-, -aro-, etc. + -o/-a/-e/-i',
      examples: ['man̂g + -il + -o → manĝilo (spoon)', 'labor + -isto + -o → laboristo (worker)'],
      usage: 'Standard derivation'
    },
    {
      rule: 'Verb + -o (nominalization)',
      pattern: 'Verb stem + -o ending',
      examples: ['danci (dance) → dancado (the dancing)', 'paroli (speak) → parolo (speech)'],
      usage: 'Verbs become nouns'
    },
  ],

  phonologyRules: [
    {
      rule: 'Vowel inventory',
      phonemes: 'a e i o u (5 vowels, always pronounced /a ɛ i o u/)',
      description: 'Completely phonetic; no ambiguity',
      usage: 'Every vowel unambiguous'
    },
    {
      rule: 'Consonant inventory',
      phonemes: 'b c(ts) ĉ(tʃ) d f g ĝ(dʒ) h ĥ(x) j(j) ĵ(ʒ) k l m n p r s ŝ(ʃ) t ŭ(w) v z',
      description: '28 consonants; many with diacritics (ĉ ĝ ĥ ĵ ŝ ŭ)',
      usage: 'Unique letters prevent ambiguity'
    },
    {
      rule: 'Stress',
      pattern: 'Always on penultimate (next-to-last) syllable',
      examples: ['ES-pe-RAN-to (4 syllables)', 'LAB-O-ro (3)', 'AM-as (2)'],
      rules: 'Absolutely regular; no exceptions'
    },
    {
      rule: 'Syllable structure',
      pattern: 'Mostly CV or CCV; no final consonant clusters',
      examples: ['es-PE-ran-TO', 'la-BO-ro'],
      rules: 'Consonant clusters only at syllable boundaries'
    },
    {
      rule: 'No tone, pitch, or length distinctions',
      description: 'Esperanto is a stress-timed language; no phonemic length or tone',
      usage: 'Simplification compared to natural languages'
    },
    {
      rule: 'Orthography = Phonology (1:1 mapping)',
      description: 'What you write is exactly what you pronounce',
      examples: ['Kaj (and) = /KAJ/', 'Esperanto = /es-pe-RAN-to/'],
      usage: 'No spelling ambiguity; no silent letters'
    },
  ],

  generationAlgorithm: `
    To generate Esperanto neologism (new vocabulary):

    1. IDENTIFY THE CONCEPT:
       - Noun, adjective, verb, or adverb?
       - Example: "computer" (noun)
    2. FIND OR BUILD ROOT:
       - Use existing Esperanto root if available
       - Combine roots with affixes if needed
       - Example: "compute" → komput- (from International "compute")
    3. ADD PART-OF-SPEECH MARKER:
       - Noun: -o (komput-o)
       - Adjective: -a (komput-a)
       - Adverb: -e (komput-e)
       - Verb infinitive: -i (komput-i)
    4. APPLY DERIVATION SUFFIXES IF NEEDED:
       - Agent: -ant-o (komput-ant-o = computist)
       - Instrument: -il-o (komput-il-o = computing device)
       - Place: -ej-o (komput-ej-o = computer room)
       - Abstract quality: -ec-o (komput-ec-o = computerness)
    5. APPLY PREFIXES IF NEEDED:
       - Negation: mal-komput-i (to miscompute)
       - Repetition: re-komput-i (to recompute)
       - Causative: komput-ig-i (to cause to compute)
    6. INFLECT FOR CASE/NUMBER:
       - Nominative: komput-o (computer)
       - Accusative: komput-o-n (computer-ACC)
       - Plural: komput-o-j (computers)
       - Plural-accusative: komput-o-j-n (computers-ACC)
    7. APPLY PHONOLOGY:
       - Stress: KOM-put-O (penultimate)
       - Consonants from inventory
       - No clusters at morpheme boundaries
    8. VERIFY REGULARITY:
       - Every morpheme follows Zamenhof's rules exactly
       - No irregularities allowed
       - Completely predictable from component parts

    EXAMPLE: "internet" (network between)
    - Root: ret- (from "rete" = net, network)
    - Inter: inter- (between) + ret-o = interret-o
    - Nominative: interret-o (the inter-net)
    - Plural: interret-o-j (inter-nets)
    - Accusative: interret-o-n (inter-net-ACC)
    - Agent: interret-ant-o (network operator)
    - Place: interret-ej-o (computer room)
    - All inflections perfectly regular, no exceptions.
  `
};

// ============================================================================
// SANSKRIT GENERATION RULES
// ============================================================================
// Source: Panini Ashtadhyayi, Monier-Williams Sanskrit Dictionary

export const sanskritRules = {
  description: 'Paninian grammar: Rigorous morphological rules, strict sandhi',

  phonologyRules: [
    {
      rule: 'Vowel system',
      inventory: 'a ā i ī u ū ṛ ṝ ḷ ḹ (short/long distinction critical)',
      meaning: 'Length affects meaning (kara = hand, kāra = black)',
      usage: 'Absolutely essential; mark with macrons or underscores'
    },
    {
      rule: 'Consonant classification',
      groups: 'Velar (k kh g gh ṅ), Palatal (c ch j jh ñ), Retroflex (ṭ ṭh ḍ ḍh ṇ), Dental (t th d dh n), Labial (p ph b bh m)',
      usage: 'Classification determines sandhi rules'
    },
    {
      rule: 'Anusvara (ṃ)',
      description: 'Nasalization; assimilates to following consonant\'s class',
      examples: ['kim + ca → kiñ ca (anusvara → ñ before c)', 'tam + khe → taṅ khe (anusvara → ṅ before k)'],
      usage: 'Mandatory assimilation per Panini'
    },
    {
      rule: 'Visarga (stop consonants)',
      classification: 'Unaspirated (k t p), Aspirated (kh th ph), Voiced (g d b), etc.',
      sandhi: 'Govern sandhi outcomes (e.g., aspirates → unaspirated before another stop)',
      usage: 'Critical for proper pronunciation and orthography'
    },
    {
      rule: 'Retroflex (ṭ ḍ ṇ ḷ ṛ ṣ)',
      condition: 'Triggered by preceding ā ā -ā, i-ī, u-ū, or ṛ-ṝ in same phrase',
      examples: ['kata (not retroflex; short -a) vs. kāta (retroflex: long -ā)'],
      usage: 'Phonetically conditioned; crucial for correct writing'
    },
    {
      rule: 'Stress (not phonemic in Sanskrit)',
      pattern: 'Vedic Sanskrit: initial stress; Classical: secondary stress on heavy syllables',
      usage: 'No tonal distinctions; rhythm is metrical'
    },
    {
      rule: 'Sandhi rules (7-8 major rules)',
      description: 'Word-boundary phonological changes per Panini Sutras',
      examples: [
        'Vowel + vowel: merge (a + i → e)',
        'Stop + stop: first → unaspirated (g + kha → k kha)',
        'Sibilant + sibilant: first → high sibilant (ṣ + sa → ṣ ṣa)',
        'Nasal + consonant: assimilate to consonant class'
      ],
      usage: 'Essential for spoken Sanskrit and correct recitation'
    },
  ],

  caseSystem: [
    { case: 'Nominative (1st)', function: 'Subject, predicate nominative', examples: ['naraḥ (a man-NOM)'] },
    { case: 'Accusative (2nd)', function: 'Direct object', examples: ['naraṃ (man-ACC)'] },
    { case: 'Instrumental (3rd)', function: 'Means, agent of passive', examples: ['nareṇa (by/with a man)'] },
    { case: 'Dative (4th)', function: 'Indirect object, beneficiary', examples: ['narāya (to/for a man)'] },
    { case: 'Ablative (5th)', function: 'Source, reason, comparison', examples: ['narāt (from a man)'] },
    { case: 'Genitive (6th)', function: 'Possession', examples: ['narasya (of a man)'] },
    { case: 'Locative (7th)', function: 'Place, time, context', examples: ['nare (in/at a man)'] },
    { case: 'Vocative (8th)', function: 'Direct address', examples: ['nara (O man!)'] },
  ],

  nounStems: [
    {
      name: 'a-stem (masculine)',
      example: 'nara (man)',
      nominative: 'naraḥ',
      accusative: 'naraṃ',
      genitive: 'narasya',
      locative: 'nare',
      examples: 'putra (son), dāsa (slave), karma (deed)'
    },
    {
      name: 'ā-stem (feminine)',
      example: 'nadī (river)',
      nominative: 'nadī',
      accusative: 'nadīm',
      genitive: 'nadyāḥ',
      locative: 'nadyām',
      examples: 'devī (goddess), rājñī (queen), buddhiḥ (intellect)'
    },
    {
      name: 'i-stem (feminine)',
      example: 'śakti (power)',
      nominative: 'śaktiḥ',
      accusative: 'śaktim',
      genitive: 'śakteḥ',
      locative: 'śaktau',
      examples: 'prīti (affection), kīrti (fame), bhakti (devotion)'
    },
    {
      name: 'u-stem (masculine/feminine)',
      example: 'guru (teacher)',
      nominative: 'guruḥ',
      accusative: 'gurum',
      genitive: 'guror',
      locative: 'guruvi',
      examples: 'pitṛ (father), tanū (body), dhenu (cow)'
    },
    {
      name: 'ṛ-stem (masculine)',
      example: 'pitṛ (father)',
      nominative: 'pitṛ',
      accusative: 'pitaram',
      genitive: 'pituḥ',
      locative: 'pitrau',
      examples: 'kartṛ (doer), kartavya (one who should do), sākṣin (witness)'
    },
    {
      name: 'consonant-stem (mixed genders)',
      example: 'nāma (name)',
      nominative: 'nāma',
      accusative: 'nāma',
      genitive: 'nāmnaḥ',
      locative: 'nāmni',
      examples: 'vāk (speech), rāj (king), sarit (river)'
    },
  ],

  verbSystem: [
    {
      lakara: 'Laṭ (present)',
      meaning: 'Now, habitual',
      example: 'bhavati (it is/becomes)',
      conjugation: 'bhava-ti (3sg.), bhava-tas (3du.), bhava-nti (3pl.)'
    },
    {
      lakara: 'Lṅ (imperfect)',
      meaning: 'Past, incompleteleted action',
      example: 'abhavat (it was)',
      conjugation: 'a-bhava-t (3sg.), a-bhava-tam (3du.), a-bhava-n (3pl.)'
    },
    {
      lakara: 'Liṭ (perfect)',
      meaning: 'Remote past, completed',
      example: 'babhūva (it has become)',
      conjugation: 'ba-bhū-va (3sg.), ba-bhū-vuh (3pl.)'
    },
    {
      lakara: 'Luṭ (future)',
      meaning: 'Future action',
      example: 'bhavitā (it will be)',
      conjugation: 'bhavi-tā (3sg.m.), bhavi-sya-ti (3sg. alternative)'
    },
    {
      lakara: 'Liṅ (conditional)',
      meaning: 'Possible, hypothetical',
      example: 'abhavat (it would be)',
      conjugation: 'a-bhava-ta (3sg.), a-bhava-ta-m (3sg. alternative)'
    },
    {
      lakara: 'Loṭ (imperative/subjunctive)',
      meaning: 'Command, wish',
      example: 'bhavatu (let it be)',
      conjugation: 'bhava-tu (3sg.), bhava-tam (3du.), bhava-ntu (3pl.)'
    },
  ],

  derivationRules: [
    {
      rule: 'Primary derivation (-ana, -anya, -ita)',
      examples: ['bhav (to be) → bhavana (being, happening)', 'vid (to know) → vidya (knowledge)', 'kar (to do) → krita (made, done)'],
      usage: 'Root + suffix → derived word stem'
    },
    {
      rule: 'Secondary derivation (-tā, -tva, -yā)',
      examples: ['sarva (all) → sarvatā (totality)', 'brahma (Brahman) → brahmatva (Brahmanhood)', 'mati (opinion) → matya (opinion-related)'],
      usage: 'Derived word + suffix → further derivation'
    },
    {
      rule: 'Adjective formation (-a, -in, -ila, -iman)',
      examples: ['budhi (intellect) → budhiman (intelligent)', 'tapas (heat/austerity) → tapin (ascetic)', 'śakti (power) → śakin (powerful)'],
      usage: 'Form adjectives from nouns'
    },
    {
      rule: 'Verbal noun formation (-ana, -ana, -ya)',
      examples: ['gamana (going)', 'bhojana (eating)', 'śravya (worth hearing)'],
      usage: 'Gerunds and infinitives'
    },
    {
      rule: 'Causative formation (-ayati, -apayati)',
      examples: ['bhav (be) → bhāvayati (cause to be)', 'vid (know) → vēdayati (cause to know)'],
      usage: 'Form causative verbs'
    },
    {
      rule: 'Desiderative formation (-itum, -issati)',
      examples: ['bhav (be) → bubhūṣati (desires to be)', 'vid (know) → vidisati (desires to know)'],
      usage: 'Desire or intention to act'
    },
    {
      rule: 'Intensive formation (-reduplicate + strengthen)',
      examples: ['bhav → babhuva (already became)', 'vid → vivid (already knew)'],
      usage: 'Emphasis or intensity'
    },
  ],

  compoundingRules: [
    {
      type: 'Tatpuruṣa (determinative compound)',
      pattern: 'Modifier + Head; head word determines gender/number',
      examples: ['rāja-putra (king-son = prince)', 'deva-dāsa (god-servant = devotee)'],
      usage: 'Most common type; head word is final'
    },
    {
      type: 'Dvandva (copulative compound)',
      pattern: 'Word1 and Word2; often dual or plural form',
      examples: ['deva-manuṣya (god and man)', 'putra-duhitṛ (son and daughter)'],
      usage: 'Coordinative; both components important'
    },
    {
      type: 'Bahuvrīhi (possessive compound)',
      pattern: 'N1 + N2; means "one who has N2 of N1"',
      examples: ['mahā-deva (great-god = Shiva, literally "one who has great divine power")', 'pañca-mukhī (five-faced = having five faces)'],
      usage: 'Exocentric; external meaning determines gender'
    },
    {
      type: 'Avyayībhāva (adverbial compound)',
      pattern: 'Particle/adverb + head; invariant meaning',
      examples: ['anu-gacchati (follows, like/according-to-going)', 'yathā-śakti (to the best of one\'s ability)'],
      usage: 'Adverbial relationships'
    },
  ],

  generationAlgorithm: `
    To generate Living Sanskrit neologism:

    1. IDENTIFY CONCEPT & ROOT:
       - Find attested Sanskrit root (dhātu)
       - Example: "computer" → √कर् (kar = to make, do)
    2. APPLY DERIVATIONAL MORPHOLOGY:
       - Verb → noun: kar + -aNa → karaṇa (instrument, tool) → computing device
       - Noun → adjective: karaṇ + -ika → karaṇika (relating to making)
       - Adjective → abstract: karaṇika + -tā → karaṇikatā (quality of computation)
    3. FORM COMPOUND IF NEEDED:
       - "electronic computer" = vidyut + karaṇa (lit. electricity-making)
       - tattoo: vidyut-karaṇa → vidyut (electricity, light) + karaṇa (instrument)
    4. APPLY SANDHI RULES:
       - Check word boundaries for vowel mergers, consonant assimilations
       - vidyut + karaṇa → vidyut-karaṇa (no change; consonant cluster permitted)
       - If: rāj + jana → rā-ñ-jana (retroflection triggered; assimilation of j)
    5. INFLECT FOR CASE & NUMBER:
       - Nominative: karaṇa (instrument)
       - Accusative: karaṇam (instrument-ACC)
       - Genitive: karaṇasya (of-instrument)
       - Locative: karaṇe (in/at-instrument)
       - Instrumental: karaṇena (by/with-instrument)
       - Dative: karaṇāya (for/to-instrument)
    6. WRITE IN DEVANAGARI:
       - karaṇa → करण (ka-ra-ṇa)
       - Ensure correct retroflexion marking (ṇ, ṭ, ḍ, ḷ)
    7. VERIFY PANINIAN CORRECTNESS:
       - Every morpheme follows Ashtadhyayi rules
       - Sandhi applied per Panini-approved methodology
       - Stem and inflection match documented paradigms

    EXAMPLE: "knowledge of computing"
       Root: √jña (to know) + kar (to make) = knowledge-making
       - jña + √kar + -aNa → jña-karaṇa (knowledge-making)
       - Add genitive: jña-karaṇa + -syaḥ... (of knowledge-making)
       - Devanagari: ज्ञान-करण (jñāna-karaṇa)
       - Full inflected: ज्ञान-करणस्य (jñāna-karaṇasya = of knowledge-making)
       - Sandhi check: -na + ka → no change (acceptable cluster)
  `
};
