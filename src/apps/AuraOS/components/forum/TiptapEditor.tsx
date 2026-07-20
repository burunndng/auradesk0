/**
 * TiptapEditor - Rich Text Editor for Forum Posts
 * Provides formatting options: bold, italic, blockquote, code, bullet lists
 */

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function BoldIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function BlockquoteIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4-3-7-3s-7 1.75-7 3v13c0 1.25 2 2 7 2z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-4-3-7-3s-7 1.75-7 3v13c0 1.25 2 2 7 2z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <line x1="5" y1="6" x2="5" y2="6.01" />
      <line x1="5" y1="12" x2="5" y2="12.01" />
      <line x1="5" y1="18" x2="5" y2="18.01" />
    </svg>
  );
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-950/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-stone-800 bg-stone-900/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-cyan-900/40 text-cyan-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-cyan-900/40 text-cyan-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon />
        </button>

        <div className="w-px h-5 bg-stone-700" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-cyan-900/40 text-cyan-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Blockquote"
        >
          <BlockquoteIcon />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-cyan-900/40 text-cyan-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Code block"
        >
          <CodeIcon />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-cyan-900/40 text-cyan-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Bullet list"
        >
          <ListIcon />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none px-4 py-3 text-sm text-stone-200 focus:outline-none"
        style={{
          minHeight: '120px',
        }}
      />
    </div>
  );
}
