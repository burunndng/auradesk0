import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { NOTES_STORAGE_KEY, normalizeNotes, sortNotes } from '../noteUtils';

const generateId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);

const loadNotes = (raw?: string | null): Note[] => {
  try {
    const stored = raw === undefined ? localStorage.getItem(NOTES_STORAGE_KEY) : raw;
    return stored ? normalizeNotes(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
};

const saveNotes = (notes: Note[]): boolean => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
};

export const useNotes = () => {
  const [initialState] = useState(() => {
    const notes = loadNotes();
    return { notes, activeNoteId: sortNotes(notes)[0]?.id ?? null };
  });
  const [notes, setNotes] = useState<Note[]>(initialState.notes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialState.activeNoteId);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    setStorageAvailable(saveNotes(notes));
  }, [notes]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== NOTES_STORAGE_KEY && event.key !== null) return;
      const incomingNotes = loadNotes(event.key === null ? null : event.newValue);
      setNotes(incomingNotes);
      setActiveNoteId((currentId) =>
        currentId && incomingNotes.some((note) => note.id === currentId)
          ? currentId
          : sortNotes(incomingNotes)[0]?.id ?? null
      );
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const createNote = useCallback(() => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: '',
      content: '',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
    return note.id;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        const next = { ...note, ...patch };
        return next.title === note.title && next.content === note.content && next.pinned === note.pinned
          ? note
          : { ...next, updatedAt: Date.now() };
      })
    );
  }, []);

  const deleteNote = useCallback((id: string): Note | null => {
    const deletedNote = notes.find((note) => note.id === id) ?? null;
    if (!deletedNote) return null;

    const remainingNotes = notes.filter((note) => note.id !== id);
    setNotes(remainingNotes);
    if (activeNoteId === id) setActiveNoteId(sortNotes(remainingNotes)[0]?.id ?? null);
    return deletedNote;
  }, [activeNoteId, notes]);

  const restoreNote = useCallback((note: Note) => {
    setNotes((prev) => prev.some((current) => current.id === note.id) ? prev : [note, ...prev]);
    setActiveNoteId(note.id);
  }, []);

  const duplicateNote = useCallback((id: string): Note | null => {
    const source = notes.find((note) => note.id === id);
    if (!source) return null;

    const now = Date.now();
    const duplicate: Note = {
      ...source,
      id: generateId(),
      title: source.title ? `${source.title} copy` : '',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [duplicate, ...prev]);
    setActiveNoteId(duplicate.id);
    return duplicate;
  }, [notes]);

  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: n.updatedAt } : n))
    );
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  const sortedNotes = sortNotes(notes);

  return {
    notes: sortedNotes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    duplicateNote,
    togglePin,
    storageAvailable,
  };
};
