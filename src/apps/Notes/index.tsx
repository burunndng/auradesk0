// ============================================================
// Notes — A quiet place to think and write
// ============================================================

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Feather, Plus, Search, Trash2, Pin, PinOff, Copy, Undo2, X,
  CloudOff, Keyboard,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotes } from '@/apps/Notes/hooks/useNotes';
import { getNoteLabel, getNotePreview, countWords } from '@/apps/Notes/noteUtils';
import type { Note } from '@/apps/Notes/types';

// ── Shortcut hints (platform-aware) ──────────────────────────

const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|od|ad)/.test(navigator.platform ?? '');
const MOD = isMac ? '⌘' : 'Ctrl+';

const SHORTCUTS = [
  { keys: `${MOD}N`, label: 'New note' },
  { keys: `${MOD}K`, label: 'Search' },
  { keys: `${MOD}⇧P`, label: 'Pin / unpin' },
  { keys: `${MOD}⌫`, label: 'Delete note' },
] as const;

// ── Undo toast timing ────────────────────────────────────────

const UNDO_MS = 6000;

function Notes() {
  const {
    notes,
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
  } = useNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived list ────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  // ── Actions ─────────────────────────────────────────────────
  const clearPendingDelete = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setPendingDelete(null);
  }, []);

  const scheduleClear = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setPendingDelete(null);
      undoTimerRef.current = null;
    }, UNDO_MS);
  }, []);

  const handleCreate = useCallback(() => {
    createNote();
    setSearchQuery('');
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [createNote]);

  const handleDelete = useCallback(
    (id: string) => {
      const removed = deleteNote(id);
      if (removed) {
        setPendingDelete(removed);
        scheduleClear();
      }
    },
    [deleteNote, scheduleClear]
  );

  const handleUndoDelete = useCallback(() => {
    if (pendingDelete) restoreNote(pendingDelete);
    clearPendingDelete();
  }, [pendingDelete, restoreNote, clearPendingDelete]);

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateNote(id);
      setSearchQuery('');
    },
    [duplicateNote]
  );

  const handleSelect = useCallback(
    (id: string) => {
      setActiveNoteId(id);
    },
    [setActiveNoteId]
  );

  // ── Global keyboard shortcuts ───────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // ⌘/Ctrl+N → new note
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreate();
        return;
      }

      // ⌘/Ctrl+K → focus search
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      // ⌘/Ctrl+Shift+P → pin/unpin active note
      if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
        if (activeNoteId) {
          e.preventDefault();
          togglePin(activeNoteId);
        }
        return;
      }

      // ⌘/Ctrl+Backspace → delete active note (undoable)
      if (mod && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (activeNoteId) {
          e.preventDefault();
          handleDelete(activeNoteId);
        }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleCreate, activeNoteId, togglePin, handleDelete]);

  // Cleanup undo timer on unmount
  useEffect(() => () => clearPendingDelete(), [clearPendingDelete]);

  // ── Auto-resize textarea ────────────────────────────────────
  const resizeTextarea = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [activeNoteId, activeNote?.content, resizeTextarea]);

  const wordCount = activeNote?.content ? countWords(activeNote.content) : 0;

  const pinnedCount = useMemo(() => notes.filter((n) => n.pinned).length, [notes]);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className="relative w-full h-full flex overflow-hidden"
      style={{ background: 'var(--bg-window)' }}
      role="application"
      aria-label="Notes"
    >
      {/* ══ Sidebar ════════════════════════════════════════════ */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 268,
          borderRight: '1px solid var(--border-subtle)',
          background: 'rgba(8, 11, 22, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 shrink-0"
          style={{ height: 52 }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Feather
              size={15}
              aria-hidden
              style={{
                color: 'var(--gilt)',
                filter: 'drop-shadow(0 0 8px rgba(224,185,109,0.5))',
                flexShrink: 0,
              }}
            />
            <span
              className="font-display truncate"
              style={{ fontSize: 15, letterSpacing: '0.12em', color: 'var(--text-primary)' }}
            >
              Notes
            </span>
          </div>
          <IconButton
            onClick={handleCreate}
            title={`New note  (${MOD}N)`}
            aria-label={`New note (${MOD}N)`}
            variant="accent"
          >
            <Plus size={14} />
          </IconButton>
        </div>

        {/* Search */}
        <div className="px-3 pb-3 shrink-0">
          <div className="relative">
            <Search
              size={13}
              aria-hidden
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              ref={searchRef}
              type="text"
              role="searchbox"
              aria-label="Search notes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchQuery) {
                  e.stopPropagation();
                  setSearchQuery('');
                }
              }}
              placeholder={`Search…  (${MOD}K)`}
              className="font-mono outline-none w-full"
              style={{
                height: 32,
                borderRadius: 8,
                paddingLeft: 32,
                paddingRight: 28,
                fontSize: 11,
                letterSpacing: '0.04em',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ width: 18, height: 18, borderRadius: 4, color: 'var(--text-tertiary)' }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        <div className="hairline mx-3 shrink-0" />

        {/* Meta row */}
        <div
          className="px-4 py-1.5 font-mono shrink-0"
          style={{
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
          }}
          aria-live="polite"
        >
          ◈ {filteredNotes.length} {filteredNotes.length === 1 ? 'NOTE' : 'NOTES'}
          {pinnedCount > 0 && (
            <span style={{ color: 'var(--gilt-dim)' }}> · {pinnedCount} PINNED</span>
          )}
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar"
          role="listbox"
          aria-label="Your notes"
        >
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-12 text-center">
              <Feather size={22} aria-hidden style={{ color: 'var(--text-disabled)' }} />
              <p
                className="font-mono"
                style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}
              >
                {searchQuery ? 'NO MATCHES' : 'NO NOTES YET'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-mono"
                  style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--lapis-dim)', textTransform: 'uppercase' }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSelect={() => handleSelect(note.id)}
                onDelete={handleDelete}
                onTogglePin={togglePin}
                onDuplicate={handleDuplicate}
              />
            ))
          )}
        </div>

        {/* Sidebar footer — shortcuts hint */}
        <div
          className="shrink-0 flex items-center justify-center gap-1.5 px-3"
          style={{
            height: 30,
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--text-disabled)',
          }}
        >
          <Keyboard size={10} aria-hidden />
          <span
            className="font-mono"
            style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            {SHORTCUTS.map((s) => s.keys).join('  ·  ')}
          </span>
        </div>
      </aside>

      {/* ══ Editor ═════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-8 shrink-0"
              style={{
                height: 56,
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(10, 14, 28, 0.25)',
              }}
            >
              <input
                ref={titleRef}
                type="text"
                aria-label="Note title"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Untitled"
                className="font-display outline-none flex-1 min-w-0"
                style={{
                  fontSize: 17,
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: 'none',
                }}
              />
              <div className="flex items-center gap-1 shrink-0">
                <IconButton
                  onClick={() => togglePin(activeNote.id)}
                  title={activeNote.pinned ? `Unpin  (${MOD}⇧P)` : `Pin to top  (${MOD}⇧P)`}
                  aria-label={activeNote.pinned ? 'Unpin note' : 'Pin note'}
                  aria-pressed={activeNote.pinned}
                  active={activeNote.pinned}
                  activeColor="gilt"
                >
                  {activeNote.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </IconButton>
                <IconButton
                  onClick={() => handleDuplicate(activeNote.id)}
                  title="Duplicate note"
                  aria-label="Duplicate note"
                >
                  <Copy size={13} />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(activeNote.id)}
                  title={`Delete note  (${MOD}⌫)`}
                  aria-label="Delete note"
                  danger
                >
                  <Trash2 size={13} />
                </IconButton>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="mx-auto" style={{ maxWidth: 680, padding: '36px 28px 96px' }}>
                <textarea
                  ref={contentRef}
                  aria-label="Note content"
                  value={activeNote.content}
                  onChange={(e) => {
                    updateNote(activeNote.id, { content: e.target.value });
                    resizeTextarea();
                  }}
                  placeholder="Begin writing…"
                  className="font-body outline-none w-full resize-none"
                  style={{
                    minHeight: 260,
                    fontSize: 15,
                    lineHeight: 1.85,
                    letterSpacing: '0.005em',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    tabSize: 2,
                  }}
                  spellCheck
                />
              </div>
            </div>

            {/* Footer status bar */}
            <div
              className="flex items-center justify-between gap-4 px-8 shrink-0"
              style={{
                height: 32,
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(10, 14, 28, 0.25)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="font-mono"
                  style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}
                >
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                {!storageAvailable && (
                  <span
                    className="font-mono flex items-center gap-1"
                    style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--accent-warning)', textTransform: 'uppercase' }}
                    role="status"
                  >
                    <CloudOff size={10} aria-hidden />
                    Not saved locally
                  </span>
                )}
              </div>
              <span
                className="font-mono shrink-0"
                style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}
                title={`Created ${formatDistanceToNow(activeNote.createdAt, { addSuffix: true })}`}
              >
                Edited {formatDistanceToNow(activeNote.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </>
        ) : (
          <EmptyState onCreate={handleCreate} />
        )}
      </main>

      {/* ══ Undo-delete toast ═══════════════════════════════════ */}
      {pendingDelete && (
        <div
          role="status"
          aria-live="polite"
          className="absolute surface-glass"
          style={{
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 8px 10px 16px',
            borderRadius: 12,
            animation: 'slideUp 250ms var(--ease-spring)',
            maxWidth: 'calc(100% - 32px)',
          }}
        >
          <span
            className="font-body truncate"
            style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}
          >
            Deleted <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{getNoteLabel(pendingDelete)}"</span>
          </span>
          <button
            onClick={handleUndoDelete}
            className="font-mono flex items-center gap-1.5 shrink-0 transition-all"
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: 'rgba(224,185,109,0.14)',
              border: '1px solid var(--border-gilt)',
              color: 'var(--gilt)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(224,185,109,0.22)';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(224,185,109,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(224,185,109,0.14)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Undo2 size={11} aria-hidden />
            Undo
          </button>
          <button
            onClick={clearPendingDelete}
            aria-label="Dismiss"
            className="flex items-center justify-center shrink-0 transition-colors"
            style={{ width: 24, height: 24, borderRadius: 6, color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Icon Button ─────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  active?: boolean;
  activeColor?: 'gilt' | 'lapis';
  danger?: boolean;
}

function IconButton({
  children,
  variant = 'default',
  active = false,
  activeColor = 'lapis',
  danger = false,
  ...rest
}: IconButtonProps) {
  const activeBg = activeColor === 'gilt' ? 'rgba(224,185,109,0.14)' : 'rgba(127,161,255,0.14)';
  const activeText = activeColor === 'gilt' ? 'var(--gilt)' : 'var(--lapis-bright)';

  return (
    <button
      {...rest}
      className="flex items-center justify-center transition-all shrink-0"
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: active
          ? activeBg
          : variant === 'accent'
            ? 'rgba(127,161,255,0.10)'
            : 'transparent',
        border: variant === 'accent' ? '1px solid var(--border-subtle)' : '1px solid transparent',
        color: active ? activeText : 'var(--text-tertiary)',
        ...(rest.style ?? {}),
      }}
      onMouseEnter={(e) => {
        if (active) return;
        if (danger) {
          e.currentTarget.style.color = 'var(--accent-error)';
          e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
        } else {
          e.currentTarget.style.color = variant === 'accent' ? 'var(--lapis-bright)' : 'var(--text-primary)';
          e.currentTarget.style.background = variant === 'accent' ? 'rgba(127,161,255,0.18)' : 'var(--bg-hover)';
        }
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (active) return;
        e.currentTarget.style.color = 'var(--text-tertiary)';
        e.currentTarget.style.background = variant === 'accent' ? 'rgba(127,161,255,0.10)' : 'transparent';
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}

// ── Note List Item ──────────────────────────────────────────

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function NoteListItem({
  note,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onDuplicate,
}: NoteListItemProps) {
  const label = getNoteLabel(note);
  const preview = getNotePreview(note);

  return (
    <div
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      className="group flex flex-col gap-1 cursor-pointer border-l-2 transition-all outline-none"
      style={{
        borderLeftColor: isActive ? 'var(--lapis-bright)' : 'transparent',
        background: isActive ? 'rgba(127,161,255,0.10)' : 'transparent',
        padding: '11px 12px 11px 14px',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(127,161,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
      onFocus={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(127,161,255,0.06)';
        e.currentTarget.style.borderLeftColor = isActive ? 'var(--lapis-bright)' : 'var(--border-default)';
      }}
      onBlur={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeftColor = 'transparent';
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex items-center gap-1.5 min-w-0 flex-1"
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: '0.01em',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {note.pinned && (
            <Pin
              size={9}
              aria-hidden
              fill="currentColor"
              style={{
                color: 'var(--gilt)',
                filter: 'drop-shadow(0 0 5px rgba(224,185,109,0.6))',
                flexShrink: 0,
              }}
            />
          )}
          <span className="truncate">{label}</span>
        </div>
        <div
          className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ListAction
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? 'Unpin' : 'Pin'}
            aria-label={note.pinned ? `Unpin ${label}` : `Pin ${label}`}
            gilt={note.pinned}
          >
            <Pin size={10} fill={note.pinned ? 'currentColor' : 'none'} />
          </ListAction>
          <ListAction
            onClick={() => onDuplicate(note.id)}
            title="Duplicate"
            aria-label={`Duplicate ${label}`}
          >
            <Copy size={10} />
          </ListAction>
          <ListAction
            onClick={() => onDelete(note.id)}
            title="Delete"
            aria-label={`Delete ${label}`}
            danger
          >
            <Trash2 size={10} />
          </ListAction>
        </div>
      </div>
      {preview && (
        <p
          className="line-clamp-2"
          style={{ fontSize: 11, lineHeight: 1.55, color: 'var(--text-tertiary)' }}
        >
          {preview}
        </p>
      )}
      <span
        className="font-mono"
        style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--text-disabled)', textTransform: 'uppercase' }}
      >
        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
      </span>
    </div>
  );
}

// ── List Action ─────────────────────────────────────────────

interface ListActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  gilt?: boolean;
  danger?: boolean;
}

function ListAction({ children, gilt = false, danger = false, ...rest }: ListActionProps) {
  return (
    <button
      {...rest}
      className="flex items-center justify-center transition-colors"
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        color: gilt ? 'var(--gilt)' : 'var(--text-tertiary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = danger
          ? 'var(--accent-error)'
          : gilt
            ? 'var(--gilt-bright)'
            : 'var(--text-primary)';
        e.currentTarget.style.background = danger ? 'rgba(248,113,113,0.10)' : 'var(--bg-hover)';
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = gilt ? 'var(--gilt)' : 'var(--text-tertiary)';
        e.currentTarget.style.background = 'transparent';
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}

// ── Empty State ─────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-7 p-8 text-center">
      <div
        className="flex items-center justify-center"
        aria-hidden
        style={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 0 40px rgba(127,161,255,0.12), inset 0 0 24px rgba(127,161,255,0.04)',
          animation: 'corePulse 5s ease-in-out infinite',
        }}
      >
        <Feather
          size={32}
          style={{
            color: 'var(--lapis-bright)',
            filter: 'drop-shadow(0 0 12px rgba(127,161,255,0.5))',
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <h3
          className="font-display"
          style={{ fontSize: 21, letterSpacing: '0.1em', color: 'var(--text-primary)' }}
        >
          A quiet space
        </h3>
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            lineHeight: 1.9,
            letterSpacing: '0.12em',
            color: 'var(--text-tertiary)',
            maxWidth: 320,
          }}
        >
          Capture a thought before it fades.
          Each note is kept on this device, close at hand.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="font-mono flex items-center gap-2 transition-all"
        style={{
          padding: '11px 24px',
          borderRadius: 999,
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          background: 'rgba(127,161,255,0.10)',
          border: '1px solid var(--border-default)',
          color: 'var(--lapis-bright)',
          boxShadow: '0 0 18px rgba(127,161,255,0.10)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 26px rgba(127,161,255,0.28)';
          e.currentTarget.style.background = 'rgba(127,161,255,0.16)';
          e.currentTarget.style.transform = 'scale(1.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 18px rgba(127,161,255,0.10)';
          e.currentTarget.style.background = 'rgba(127,161,255,0.10)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Plus size={12} aria-hidden />
        New Note
      </button>
    </div>
  );
}

export default Notes;
