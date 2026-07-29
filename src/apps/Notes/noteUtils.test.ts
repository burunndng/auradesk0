import { describe, expect, it } from 'vitest';
import { countWords, getNoteLabel, getNotePreview, normalizeNotes, sortNotes } from './noteUtils';
import type { Note } from './types';

const note = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: 'A clear thought',
  content: 'A short note for testing.',
  pinned: false,
  createdAt: 100,
  updatedAt: 100,
  ...overrides,
});

describe('normalizeNotes', () => {
  it('keeps valid persisted notes and repairs older entries', () => {
    const normalized = normalizeNotes([
      { id: 'older', title: 'Still useful', content: 'Missing newer fields' },
      note(),
      { id: '', title: 'Invalid', content: 'Skip me' },
      null,
    ], 500);

    expect(normalized).toEqual([
      { id: 'older', title: 'Still useful', content: 'Missing newer fields', pinned: false, createdAt: 500, updatedAt: 500 },
      note(),
    ]);
  });
});

describe('note helpers', () => {
  it('sorts pinned notes before recently updated notes', () => {
    const notes = sortNotes([
      note({ id: 'old', updatedAt: 10 }),
      note({ id: 'pinned', pinned: true, updatedAt: 1 }),
      note({ id: 'recent', updatedAt: 20 }),
    ]);

    expect(notes.map((current) => current.id)).toEqual(['pinned', 'recent', 'old']);
  });

  it('builds useful labels and previews for untitled notes', () => {
    const untitled = note({ title: '   ', content: '\n  A first line becomes the label.\nA second line follows.' });

    expect(getNoteLabel(untitled)).toBe('A first line becomes the label.');
    expect(getNotePreview(untitled)).toBe('A first line becomes the label. A second line follows.');
    expect(countWords('  A compact count of five words.  ')).toBe(6);
    expect(countWords('   ')).toBe(0);
  });
});
