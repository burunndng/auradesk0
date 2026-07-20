/**
 * InlineReplyForm - Inline Reply to Posts or Thread
 * Shared form for both top-level thread replies and replies to specific posts
 * Includes crisis detection and SafetyBanner
 */

import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import SafetyBanner from '../shared/SafetyBanner';
import { detectCrisisLevel, extractPlainText } from '../../utils/crisisDetection';

interface InlineReplyFormProps {
  threadId: string;
  parentPostId: string | null;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
}

type CrisisLevel = 'none' | 'concern' | 'high';

export default function InlineReplyForm({
  threadId,
  parentPostId,
  onSubmit,
  onCancel,
}: InlineReplyFormProps) {
  const [content, setContent] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [loading, setLoading] = useState(false);

  const handleContentChange = (html: string) => {
    setContent(html);

    const plainText = extractPlainText(html);
    const crisis = detectCrisisLevel(plainText);
    setCrisisLevel(crisis);
  };

  const handleSubmit = async () => {
    if (!content.trim() || loading || crisisLevel === 'high') return;

    setLoading(true);
    try {
      await onSubmit(content);
      setContent('');
      setCrisisLevel('none');
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800">
      {/* Crisis Detection Banner */}
      {crisisLevel !== 'none' && (
        <SafetyBanner crisisLevel={crisisLevel} />
      )}

      {/* Editor */}
      <TiptapEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Share your thoughts..."
      />

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading || crisisLevel === 'high'}
          className="px-4 py-2 rounded-lg bg-cyan-900/40 border border-cyan-600/50 text-cyan-300 hover:bg-cyan-900/60 transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </div>
  );
}
