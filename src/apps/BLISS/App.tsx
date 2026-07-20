// ============================================================
// BLISS Desktop Adapter — strips AI Studio scaffold, adapts for AuraDesk
// ============================================================

import React, { useState } from 'react';
import { DawProvider, useDaw } from './context/DawContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TransportBar } from './components/TransportBar';
import { SessionView } from './components/SessionView';
import { SequencerView } from './components/SequencerView';
import { PatchBayView } from './components/PatchBayView';
import { VisualizerView } from './components/VisualizerView';
import { HelpGuide } from './components/HelpGuide';
import { Download, Upload, Save, HelpCircle } from 'lucide-react';

function DawAppContent() {
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<string | null>('Welcome to BLISS! Boot the modular ambient engine below.');

  const { session, fxChains, importSession, audioStatus, startAudioEngine, activeTab, setActiveTab } = useDaw();

  useKeyboardShortcuts();

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const saveToLocalStorage = () => {
    try {
      const data = { session, fxChains };
      localStorage.setItem('bliss-session', JSON.stringify(data));
      triggerNotification('Session saved!');
    } catch (e) {
      triggerNotification('Save failed');
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('bliss-session');
      if (data) importSession(JSON.parse(data));
      triggerNotification('Session loaded!');
    } catch (e) {
      triggerNotification('Load failed');
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-white flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 shadow-lg">
          {notification}
        </div>
      )}

      {/* Transport Bar */}
      <TransportBar
        audioStatus={audioStatus}
        startAudioEngine={startAudioEngine}
        onShowHelp={() => setShowHelp(!showHelp)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'intro' ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎵</div>
                <div className="text-2xl font-bold mb-2">BLISS</div>
                <div className="text-sm text-zinc-400 mb-6">Browser-based DAW + Psychedelic Visuals</div>
                <button
                  onClick={startAudioEngine}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
                >
                  Boot Engine & Enter
                </button>
              </div>
            </div>
          ) : activeTab === 'grid' || activeTab === 'mixer' ? (
            <SessionView />
          ) : activeTab === 'viz' ? (
            <VisualizerView />
          ) : activeTab === 'editor' ? (
            <SequencerView />
          ) : (
            <PatchBayView />
          )}
        </div>

        {/* Help sidebar */}
        {showHelp && (
          <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 overflow-y-auto hidden xl:block select-none shrink-0">
            <HelpGuide />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
        <button onClick={saveToLocalStorage} className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors" title="Save to localStorage">
          <Save className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={loadFromLocalStorage} className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors" title="Load from localStorage">
          <Upload className="w-3.5 h-3.5" /> Load
        </button>
        <button onClick={() => setShowHelp(!showHelp)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors ml-auto">
          <HelpCircle className="w-3.5 h-3.5" /> Help
        </button>
      </div>
    </div>
  );
}

interface BLISSDesktopProps {
  windowId: string;
}

export default function BLISSDesktop({ windowId }: BLISSDesktopProps) {
  return (
    <DawProvider>
      <DawAppContent />
    </DawProvider>
  );
}
