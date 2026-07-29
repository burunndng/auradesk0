export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GrimoireCategory {
  id: string;
  name: string;
  glyph: string;
  color: string;
  description: string;
}

export const GRIMOIRE_CATEGORIES: GrimoireCategory[] = [
  {
    id: 'aos',
    name: 'AOS Practice',
    glyph: '☿',
    color: 'var(--lapis)',
    description: 'Astral projection & out-of-body techniques',
  },
  {
    id: 'reality',
    name: 'Reality Architecture',
    glyph: '⌬',
    color: 'var(--gilt)',
    description: 'Lesson notes & consciousness exploration',
  },
  {
    id: 'dreams',
    name: 'Dream Journal',
    glyph: '◉',
    color: 'var(--accent-success)',
    description: 'Recorded dreams and insights',
  },
  {
    id: 'obe',
    name: 'OBE Records',
    glyph: '↑',
    color: 'var(--accent-info)',
    description: 'Out-of-body experience logs',
  },
  {
    id: 'general',
    name: 'General',
    glyph: '◐',
    color: 'var(--text-tertiary)',
    description: 'Miscellaneous notes',
  },
];

export const getCategoryById = (id: string): GrimoireCategory =>
  GRIMOIRE_CATEGORIES.find((c) => c.id === id) ?? GRIMOIRE_CATEGORIES[4];

export const getAllNoteTags = (notes: Note[]): string[] => {
  const tagSet = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
};
