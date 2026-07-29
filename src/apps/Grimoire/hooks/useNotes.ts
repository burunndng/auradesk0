import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';

const STORAGE_KEY = 'grimoire_notes';

const generateId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return parsed.map((n) => ({
      ...n,
      createdAt: n.createdAt ?? Date.now(),
      updatedAt: n.updatedAt ?? Date.now(),
    }));
  } catch {
    return [];
  }
};

const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* quota or private mode — silently drop */
  }
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNote = useCallback((title = 'Untitled Note', tags: string[] = []) => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title,
      content: '',
      tags,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
    return note.id;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...patch, updatedAt: Date.now() }
          : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeNoteId, notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    notes: sortedNotes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
  };
};
