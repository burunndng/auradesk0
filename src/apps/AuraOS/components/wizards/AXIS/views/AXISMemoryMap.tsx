/**
 * AXIS Memory Map — persistent store of user-authored and AI-observed items
 * Design: stone-950 base · Violet secondary
 */

import React, { useEffect, useState } from 'react';
import { MemoryItem, MemoryItemKind } from '../../../../types';
import { readMemoryItems, writeMemoryItem, updateMemoryItem } from '../../../../services/AXISStorage';

const KIND_OPTIONS: MemoryItemKind[] = ['insight', 'pattern', 'commitment', 'belief', 'definition', 'other'];

const KIND_COLORS: Record<MemoryItemKind, string> = {
  insight: 'text-amber-400/80 border-amber-500/20',
  pattern: 'text-violet-400/80 border-violet-500/20',
  commitment: 'text-emerald-400/80 border-emerald-500/20',
  belief: 'text-sky-400/80 border-sky-500/20',
  definition: 'text-stone-400/80 border-stone-500/20',
  other: 'text-stone-500/80 border-stone-600/20',
};

interface AXISMemoryMapProps {
  anchorId?: string;
  onBack: () => void;
}

export default function AXISMemoryMap({ anchorId, onBack }: AXISMemoryMapProps) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [newText, setNewText] = useState('');
  const [newKind, setNewKind] = useState<MemoryItemKind>('insight');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const load = async () => {
    const all = await readMemoryItems();
    setItems(all);
  };

  useEffect(() => {
    load();
  }, []);

  const activeItems = items.filter(i => i.status === 'active');
  const archivedItems = items.filter(i => i.status === 'archived');
  const userItems = activeItems.filter(i => i.source === 'user');
  const axisItems = activeItems.filter(i => i.source === 'axis');

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const item: MemoryItem = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      kind: newKind,
      scope: 'global',
      status: 'active',
      source: 'user',
      userApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeMemoryItem(item);
    setNewText('');
    await load();
  };

  const handleArchive = async (id: string) => {
    await updateMemoryItem(id, { status: 'archived' });
    await load();
  };

  const handleEditSave = async (id: string) => {
    if (!editText.trim()) return;
    await updateMemoryItem(id, { text: editText.trim() });
    setEditingId(null);
    await load();
  };

  const renderItem = (item: MemoryItem) => {
    const kindStyle = KIND_COLORS[item.kind] ?? KIND_COLORS.other;
    const isEditing = editingId === item.id;
    return (
      <div key={item.id} className="flex gap-3 items-start group">
        <span className={`text-[10px] font-mono border rounded px-1.5 py-0.5 mt-0.5 shrink-0 ${kindStyle}`}>
          {item.kind}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleEditSave(item.id); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
                className="flex-1 bg-stone-900/80 border border-violet-500/30 rounded-lg px-2 py-1 text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
              />
              <button onClick={() => handleEditSave(item.id)} className="text-xs text-emerald-400 hover:text-emerald-300">Save</button>
              <button onClick={() => setEditingId(null)} className="text-xs text-stone-500 hover:text-stone-400">Cancel</button>
            </div>
          ) : (
            <p className="text-sm text-stone-300 leading-relaxed break-words">{item.text}</p>
          )}
          {!item.userApproved && (
            <span className="text-[10px] text-stone-600 italic">unreviewed</span>
          )}
        </div>
        {!isEditing && item.status === 'active' && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {item.source === 'user' && (
              <button
                onClick={() => { setEditingId(item.id); setEditText(item.text); }}
                className="text-[10px] text-stone-500 hover:text-stone-300 px-1 py-0.5"
              >
                edit
              </button>
            )}
            <button
              onClick={() => handleArchive(item.id)}
              className="text-[10px] text-stone-600 hover:text-stone-400 px-1 py-0.5"
            >
              archive
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-xs text-stone-500 hover:text-stone-300 transition-colors">← Back</button>
        <h2 className="text-lg font-serif font-light text-stone-100">Memory Map</h2>
      </div>

      {/* My Map — user-authored */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">My Map</p>
        {userItems.length === 0 && (
          <p className="text-xs text-stone-600 italic">Nothing named yet. Save insights from sessions to build your map.</p>
        )}
        <div className="space-y-2">
          {userItems.map(renderItem)}
        </div>

        {/* Add new item */}
        <div className="flex gap-2 items-center mt-3">
          <select
            value={newKind}
            onChange={e => setNewKind(e.target.value as MemoryItemKind)}
            className="text-xs bg-stone-900/80 border border-stone-700/40 rounded-lg px-2 py-1.5 text-stone-300 focus:outline-none focus:ring-1 focus:ring-violet-500/30 shrink-0"
          >
            {KIND_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Add a pattern, insight, or commitment…"
            className="flex-1 bg-stone-950/80 border border-stone-700/50 rounded-xl px-3 py-1.5 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 text-violet-200 border border-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* AXIS Observations */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">AXIS Observations</p>
        {axisItems.length === 0 && (
          <p className="text-xs text-stone-600 italic">No observations yet. Complete a session synthesis to generate observations.</p>
        )}
        <div className="space-y-2">
          {axisItems.map(renderItem)}
        </div>
      </div>

      {/* Archived */}
      {archivedItems.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowArchived(v => !v)}
            className="text-[10px] text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors"
          >
            {showArchived ? 'Hide archived' : `Show archived (${archivedItems.length})`}
          </button>
          {showArchived && (
            <div className="space-y-2 opacity-50">
              {archivedItems.map(renderItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
