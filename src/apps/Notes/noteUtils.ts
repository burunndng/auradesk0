import type { Note } from './types';

export const NOTES_STORAGE_KEY = 'auradesk_notes';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asTimestamp = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const normalizeNotes = (value: unknown, now = Date.now()): Note[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((value) => {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) return [];

    return [{
      id: value.id,
      title: typeof value.title === 'string' ? value.title : '',
      content: typeof value.content === 'string' ? value.content : '',
      pinned: value.pinned === true,
      createdAt: asTimestamp(value.createdAt, now),
      updatedAt: asTimestamp(value.updatedAt, now),
    }];
  });
};

export const sortNotes = (notes: Note[]): Note[] =>
  [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

export const getNoteLabel = (note: Note): string => {
  const title = note.title.trim();
  if (title) return title;

  const firstLine = note.content.split('\n').find((line) => line.trim())?.trim();
  return firstLine ? firstLine.slice(0, 56) : 'Untitled note';
};

export const getNotePreview = (note: Note): string =>
  note.content.replace(/\s+/g, ' ').trim().slice(0, 110);

export const countWords = (content: string): number =>
  content.trim() ? content.trim().split(/\s+/).length : 0;
