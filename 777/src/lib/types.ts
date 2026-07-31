export interface SephiraSource {
  primary: string
  secondary?: string
}

export interface Sephira {
  /** 1–10 position on the Tree of Life */
  number: number
  /** Primary English name */
  name: string
  /** Romanization / transliteration */
  translit: string
  /** Hebrew script of the sphere name */
  hebrew_name: string
  /** Planet or cosmic body attributed to the sphere */
  planet: string
  /** Core meaning and divine/angelic titles */
  titles: string
  /** God-name attributed to the sphere */
  divine_name: string
  /** Archangel attributed to the sphere */
  archangel: string
  /** Choir / order of angels attributed to the sphere */
  angelic_order: string
  /** Pillar the sphere sits on */
  pillar: 'Severity' | 'Mercy' | 'Equilibrium'
  /** Macro-grouping (triad / quaternary) */
  triad: 'Supernal' | 'Ethical' | 'Astral'
  /** King / Queen scale color attributions (Golden Dawn) */
  color: { king: string; queen: string }
  /** Key symbols and images */
  symbols: string[]
  /** Tarot relationship — the four pip cards of this sphere */
  tarot: string
  /** A few curated deity or figure examples (not Crowley's full dump) */
  deities_figures: string[]
  /** Psychological virtue associated with the sphere */
  virtue: string
  /** Psychological vice / imbalance associated with the sphere */
  vice: string
  /** Why this cluster exists (2–3 sentences) */
  why: string
  /** How to use it: ritual + psychological / creative / associative (2–3 sentences) */
  how_to_use: string
  /** Optional one-line modern context note */
  modern_note?: string
  /** Source attribution */
  source: SephiraSource
}
