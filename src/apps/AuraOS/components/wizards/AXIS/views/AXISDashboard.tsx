/**
 * AXIS Dashboard
 * Entry point with identity anchor and activity selection
 *
 * Design: stone-950 base · Violet secondary accent
 */

import React, { useState, useRef } from 'react';
import { ChevronRight, Edit2, Download, Upload, Crosshair, Compass, Zap, History as HistoryIcon } from 'lucide-react';
import type { AXISAnchor, AXISActivityType, AXISSynthesisBrief } from '../../../../types';
import AXISAnchorEditor from '../components/AXISAnchorEditor';
import AXISActivityPicker from '../components/AXISActivityPicker';
import { exportAllData, importAllData, downloadExportJSON, type AXISExportData } from '../../../../services/AXISStorage';
import type { AXISAnchorMode } from '../../../../types';

interface AXISDashboardProps {
  anchor: AXISAnchor | null;
  hasAnchor: boolean;
  sessionCount: number;
  openSessionCount: number;
  previousSynthesis?: AXISSynthesisBrief | null;
  onStartFraming: () => void;
  onStartNative?: () => void;
  onStartOffAxis?: () => void;
  onViewHistory: () => void;
  onViewMemoryMap?: () => void;
  onCreateAnchor: (content: string, mode?: AXISAnchorMode) => void;
  onEditAnchor: (content: string, mode?: AXISAnchorMode) => void;
  onDataImported?: () => void;
}

export default function AXISDashboard({
  anchor,
  hasAnchor,
  sessionCount,
  openSessionCount,
  previousSynthesis,
  onStartFraming,
  onStartNative,
  onStartOffAxis,
  onViewHistory,
  onViewMemoryMap,
  onCreateAnchor,
  onEditAnchor,
  onDataImported,
}: AXISDashboardProps) {
  const [isEditingAnchor, setIsEditingAnchor] = useState(!hasAnchor);
  const [anchorExpanded, setAnchorExpanded] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AXISActivityType | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    downloadExportJSON(data);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as AXISExportData;
      await importAllData(data);
      onDataImported?.();
    } catch (err) {
      setImportError('Invalid export file. Please use a valid AXIS export.');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleActivitySelect = (activity: AXISActivityType) => {
    setSelectedActivity(activity);
    onStartFraming();
  };

  if (isEditingAnchor && !hasAnchor) {
    return (
      <AXISAnchorEditor
        onSave={(content, mode) => {
          onCreateAnchor(content, mode);
          setIsEditingAnchor(false);
        }}
        isCreating={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><Crosshair size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">AXIS Dashboard</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          A longitudinal practice container — integrates Mind, Shadow, and Spirit dimensions across your sessions.
        </p>
      </div>

      {/* Your Anchor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Your Anchor</p>
          {hasAnchor && (
            <button
              onClick={() => setIsEditingAnchor(true)}
              className="p-1.5 hover:bg-stone-800/60 rounded-lg transition-all text-stone-500 hover:text-stone-300"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {isEditingAnchor ? (
          <AXISAnchorEditor
            initialValue={anchor?.content}
            initialMode={anchor?.mode}
            onSave={(content, mode) => {
              onEditAnchor(content, mode);
              setIsEditingAnchor(false);
            }}
            isCreating={false}
          />
        ) : (
          <div className="bg-stone-900/40 border border-violet-500/15 rounded-xl p-4">
            <p className={`text-sm text-stone-300 leading-relaxed mb-2 ${anchorExpanded ? '' : 'line-clamp-3'}`}>
              {anchor?.content}
            </p>
            {anchor?.content && anchor.content.length > 120 && (
              <button
                onClick={() => setAnchorExpanded(e => !e)}
                className="text-[10px] font-bold uppercase tracking-widest text-violet-400/50 hover:text-violet-300/80 transition-colors mb-2"
              >
                {anchorExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
            <div className="flex items-center justify-between">
              {anchor?.mode && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70">{anchor.mode.replace('-', ' ')}</span>
              )}
              {anchor?.updatedAt && (
                <p className="text-xs text-stone-600 ml-auto">
                  Updated {new Date(anchor.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Edge Check-in — surfaces prior hypothesis before new session */}
      {previousSynthesis?.nextSession?.hypothesisToTest && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">From Last Session</p>
          <p className="text-sm text-amber-200/90 font-serif italic leading-relaxed">"{previousSynthesis.nextSession.hypothesisToTest}"</p>
          <p className="text-xs text-stone-500 mt-2">Did you get a chance to explore this?</p>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-stone-800" />

      {/* Activity Selection */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">
          What Are You About to Do?
        </p>
        <AXISActivityPicker onSelect={handleActivitySelect} />
      </div>

      {/* Help Text */}
      <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
        <p className="text-sm text-stone-400 leading-relaxed">
          AXIS bookends any reflective experience with intention before and meaning capture after.
          Frame your session, do your thing, and return to harvest what mattered.
        </p>
      </div>

      {/* Off-Axis (Side Quest) */}
      {onStartOffAxis && hasAnchor && (
        <div className="rounded-xl border border-stone-700/30 bg-stone-900/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">Side Quest</p>
          <p className="text-xs text-stone-400 mb-3 leading-relaxed">
            Need to work through something unrelated to your anchor? Start an off-axis session — it won't affect your main synthesis chain.
          </p>
          <button
            onClick={onStartOffAxis}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800/60 rounded-lg border border-stone-700/40 hover:border-stone-600 transition-all"
          >
            <Zap size={12} />
            Start Off-Axis Session
          </button>
        </div>
      )}

      {/* History Section */}
      {sessionCount > 0 && (
        <>
          <div className="h-px bg-stone-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Sessions</p>
              <p className="text-xs text-stone-600">
                <span className="font-mono font-bold text-amber-400">{sessionCount}</span> total {openSessionCount > 0 && <>· <span className="text-amber-500/80">{openSessionCount} open</span></>}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onViewHistory}
                className="flex items-center gap-2 px-4 py-2.5 text-sm bg-stone-900/60 hover:bg-stone-800/60 text-stone-300 rounded-xl border border-stone-700/30 hover:border-stone-600 transition-all"
              >
                <HistoryIcon size={14} />
                View History
              </button>
              {onViewMemoryMap && (
                <button
                  onClick={onViewMemoryMap}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm bg-stone-900/60 hover:bg-stone-800/60 text-violet-300/80 rounded-xl border border-violet-700/20 hover:border-violet-600/30 transition-all"
                >
                  Memory Map
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Data Export / Import */}
      <div className="h-px bg-stone-800" />
      <div className="flex gap-2 items-center">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-300 bg-stone-900/40 hover:bg-stone-800/60 rounded-lg border border-stone-700/30 transition-all"
        >
          <Download size={12} />
          Export data
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-300 bg-stone-900/40 hover:bg-stone-800/60 rounded-lg border border-stone-700/30 transition-all"
        >
          <Upload size={12} />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
      {importError && (
        <p className="text-xs text-red-400 mt-1">{importError}</p>
      )}
    </div>
  );
}
