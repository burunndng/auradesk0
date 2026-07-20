/**
 * Shadow Session Viewer Modal
 * Read-only view for previous shadow journaling sessions
 */

import React from 'react';
import { X, Download } from 'lucide-react';
import type { ShadowSessionResult } from '../../types';
import SafetyBanner from '../shared/SafetyBanner';

interface ShadowSessionViewerProps {
  session: ShadowSessionResult;
  onClose: () => void;
}

export default function ShadowSessionViewer({ session, onClose }: ShadowSessionViewerProps) {
  const handleDownload = () => {
    const content = `Shadow Journaling Session\n${new Date(session.createdAt).toLocaleString()}\n\nExercise: ${session.exerciseName} (${session.exercisePhase})\n\nUSER ENTRY:\n${session.normalizedEntry}\n\nGUIDE REFLECTION:\n${session.guideReflection}\n\n${session.wordToCarry ? `Word to carry: ${session.wordToCarry}\n` : ''}${session.selfCompassionStatement ? `Self-compassion: ${session.selfCompassionStatement}` : ''}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.exerciseName.replace(/\s+/g, '-').toLowerCase()}-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Shadow Journaling Session</div>
            <h2 className="text-2xl font-semibold text-slate-100 mt-1">{session.exerciseName}</h2>
            <p className="text-slate-400 text-sm">{new Date(session.createdAt).toLocaleString()} • {session.exercisePhase}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100" aria-label="Close viewer">
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {session.crisisLevel !== 'none' && <SafetyBanner crisisLevel={session.crisisLevel} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Word to carry</div>
              <div className="text-lg text-slate-100 mt-1">{session.wordToCarry || '—'}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Self-compassion</div>
              <div className="text-slate-100 mt-1 whitespace-pre-wrap text-sm">
                {session.selfCompassionStatement || '—'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Your Entry</h3>
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
              <pre className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">{session.normalizedEntry}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Guide Reflection</h3>
            <div className="bg-purple-950/30 border border-purple-700/40 rounded-lg p-4">
              <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                {session.guideReflection}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <Download size={16} />
            Download Session
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-100 text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
