// ============================================================
// Grimoire — Sacred Note App for AOS & Reality Architect
// ============================================================

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Trash2, Plus, Eye, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotes } from '@/apps/Grimoire/hooks/useNotes';
import { SacredGeometry } from '@/apps/Grimoire/components/SacredGeometry';
import { GRIMOIRE_CATEGORIES, getCategoryById, type Note } from '@/apps/Grimoire/types';
import ReactMarkdown from 'react-markdown';

const STORAGE_SEARCH_KEY = 'grimoire_search';

function Grimoire() {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_SEARCH_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [isPreview, setIsPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SEARCH_KEY, searchQuery);
    } catch {
      /* ignore */
    }
  }, [searchQuery]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    const cat = GRIMOIRE_CATEGORIES[0];
    createNote('Untitled Note', [cat.id]);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Seal this note? It cannot be recovered.')) {
      deleteNote(id);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { content: e.target.value });
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { title: e.target.value });
  };

  const toggleTag = (tagId: string) => {
    if (!activeNote) return;
    const tags = activeNote.tags.includes(tagId)
      ? activeNote.tags.filter((t) => t !== tagId)
      : [...activeNote.tags, tagId];
    updateNote(activeNote.id, { tags });
  };

  const resizeTextarea = useCallback(() => {
    if (contentRef.current && activeNote) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [activeNote]);

  useEffect(() => {
    resizeTextarea();
  }, [activeNote, resizeTextarea]);

  return (
    <div
      className="relative w-full h-full flex overflow-hidden"
      style={{ background: 'var(--bg-window)' }}
    >
      <SacredGeometry opacity={0.025} />
      <div className="absolute inset-0 overlay-scanlines" style={{ opacity: 0.03 }} />

      {/* ── Sidebar ── */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 300,
          borderRight: '1px solid var(--border-default)',
          background: 'rgba(8, 11, 22, 0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="query the grimoire..."
              className="font-mono outline-none w-full"
              style={{
                height: 34,
                borderRadius: 6,
                paddingLeft: 36,
                paddingRight: 12,
                fontSize: 11,
                letterSpacing: '0.08em',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* New Note Button */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={handleCreateNote}
            className="font-mono flex items-center justify-center gap-2 w-full transition-all"
            style={{
              height: 32,
              borderRadius: 6,
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              background: 'rgba(224, 185, 109, 0.10)',
              border: '1px solid var(--border-gilt)',
              color: 'var(--gilt)',
              boxShadow: '0 0 12px rgba(224, 185, 109, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 18px rgba(224, 185, 109, 0.3)';
              e.currentTarget.style.background = 'rgba(224, 185, 109, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 12px rgba(224, 185, 109, 0.15)';
              e.currentTarget.style.background = 'rgba(224, 185, 109, 0.10)';
            }}
          >
            <Plus size={12} />
            New Note
          </button>
        </div>

        {/* Note Count */}
        <div
          className="px-3 py-1 font-mono"
          style={{
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          ◈ {filteredNotes.length} {filteredNotes.length === 1 ? 'NOTE' : 'NOTES'}
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-4 text-center">
              <div style={{ opacity: 0.3 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
                  <path d="M12 3 L12 21 M3 12 L21 12" strokeWidth="0.8" opacity="0.5" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
              <p
                className="font-mono"
                style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}
              >
                No notes found
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSelect={() => setActiveNoteId(note.id)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            {/* Title */}
            <div
              className="p-4 border-b"
              style={{
                borderBottomColor: 'var(--border-subtle)',
                background: 'rgba(10, 14, 28, 0.3)',
              }}
            >
              <input
                ref={titleRef}
                type="text"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Note title..."
                className="font-display outline-none w-full"
                style={{
                  fontSize: 16,
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: 'none',
                }}
              />
            </div>

            {/* Tags */}
            <div
              className="flex items-center gap-1 p-3 border-b"
              style={{
                borderBottomColor: 'var(--border-subtle)',
                background: 'rgba(10, 14, 28, 0.2)',
              }}
            >
              {GRIMOIRE_CATEGORIES.map((cat) => {
                const isSelected = activeNote.tags.includes(cat.id);
                return (
                  <TagPill
                    key={cat.id}
                    category={cat}
                    selected={isSelected}
                    onClick={() => toggleTag(cat.id)}
                  />
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
              {isPreview ? (
                <div
                  className="h-full overflow-y-auto custom-scrollbar p-4"
                  style={{
                    background: 'rgba(8, 11, 22, 0.3)',
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ReactMarkdown>{activeNote.content || '*No content yet.*'}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  ref={contentRef}
                  value={activeNote.content}
                  onChange={handleContentChange}
                  placeholder="Record your insights, techniques, and observations..."
                  className="font-mono outline-none w-full resize-none"
                  style={{
                    minHeight: 200,
                    padding: '16px 20px',
                    fontSize: 12,
                    lineHeight: 1.7,
                    letterSpacing: '0.02em',
                    color: 'var(--text-primary)',
                    background: 'rgba(8, 11, 22, 0.3)',
                    border: 'none',
                    tabSize: 2,
                  }}
                  spellCheck
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(10, 14, 28, 0.3)',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              <span>
                ◈ Last sealed {formatDistanceToNow(activeNote.updatedAt, { addSuffix: true })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all"
                  style={{
                    background: isPreview
                      ? 'rgba(224, 185, 109, 0.14)'
                      : 'rgba(127, 161, 255, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: isPreview ? 'var(--gilt)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = isPreview ? 'var(--gilt)' : 'var(--text-secondary)';
                  }}
                >
                  {isPreview ? <Edit3 size={11} /> : <Eye size={11} />}
                  {isPreview ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={() => handleDelete(activeNote.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all"
                  style={{
                    background: 'rgba(248, 113, 113, 0.10)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--accent-error)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.18)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(248, 113, 113, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.10)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Trash2 size={11} />
                  Seal
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div style={{ opacity: 0.15 }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
                <path d="M12 3 L12 21 M3 12 L21 12" strokeWidth="0.8" opacity="0.4" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.3" />
                <path
                  d="M8 8 L16 16 M16 8 L8 16"
                  strokeWidth="0.8"
                  opacity="0.2"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h3
                className="font-display"
                style={{ fontSize: 18, letterSpacing: '0.1em', color: 'var(--text-primary)' }}
              >
                The Grimoire Awaits
              </h3>
              <p
                className="font-mono max-w-[320px]"
                style={{
                  fontSize: 10,
                  lineHeight: 1.8,
                  letterSpacing: '0.1em',
                  color: 'var(--text-tertiary)',
                }}
              >
                Record your AOS practices, Reality Architecture insights, and consciousness
                explorations. Each note is a sigil in the grand design.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="font-mono flex items-center gap-2 px-6 py-3 rounded-full transition-all"
              style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background: 'rgba(224, 185, 109, 0.12)',
                border: '1px solid var(--border-gilt)',
                color: 'var(--gilt)',
                boxShadow: '0 0 20px rgba(224, 185, 109, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(224, 185, 109, 0.35)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(224, 185, 109, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus size={12} />
              Begin Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Note List Item ──

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

function NoteListItem({ note, isActive, onSelect, onDelete }: NoteListItemProps) {
  const category = note.tags.length > 0 ? getCategoryById(note.tags[0]) : GRIMOIRE_CATEGORIES[4];
  const preview = note.content.replace(/\n/g, ' ').slice(0, 80);

  return (
    <div
      onClick={onSelect}
      className="flex flex-col gap-1.5 p-3 cursor-pointer border-l-2 transition-all group"
      style={{
        borderLeftColor: isActive ? 'var(--gilt)' : 'transparent',
        background: isActive
          ? 'rgba(224, 185, 109, 0.06)'
          : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(127, 161, 255, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: isActive ? 'var(--gilt-bright)' : 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ opacity: 0.5 }}>{category.glyph} </span>
            {note.title || 'Untitled Note'}
          </div>
          {preview && (
            <p
              className="font-mono mt-0.5"
              style={{
                fontSize: 9,
                lineHeight: 1.5,
                letterSpacing: '0.04em',
                color: 'var(--text-tertiary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {preview}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-error)';
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Trash2 size={10} />
        </button>
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 8,
          letterSpacing: '0.12em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
        }}
      >
        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
      </div>
    </div>
  );
}

// ── Tag Pill ──

interface TagPillProps {
  category: typeof GRIMOIRE_CATEGORIES[number];
  selected: boolean;
  onClick: () => void;
}

function TagPill({ category, selected, onClick }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all font-mono"
      style={{
        fontSize: 9,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: selected
          ? `${category.color}20`
          : 'rgba(127, 161, 255, 0.06)',
        border: selected
          ? `1px solid ${category.color}`
          : '1px solid var(--border-subtle)',
        color: selected ? category.color : 'var(--text-tertiary)',
        boxShadow: selected ? `0 0 12px ${category.color}40` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }
      }}
    >
      <span style={{ fontSize: 11 }}>{category.glyph}</span>
      {category.name}
    </button>
  );
}

export default Grimoire;
