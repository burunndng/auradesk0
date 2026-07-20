/**
 * Somatic Cartography — ZoneDetailPanel
 * Bottom sheet for marking/editing a zone: intensity, depth, quality tags.
 */

import React, { useState, useEffect } from 'react';
import type { ZoneMark } from './types';
import { ZONE_LABELS, QUALITY_TAGS, DEPTH_OPTIONS, type SomaticBodyZone } from './constants';

interface ZoneDetailPanelProps {
  zone: string;
  existingMark?: ZoneMark;
  onSave: (mark: ZoneMark) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function ZoneDetailPanel({
  zone,
  existingMark,
  onSave,
  onRemove,
  onClose,
}: ZoneDetailPanelProps) {
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(existingMark?.intensity ?? 3);
  const [depth, setDepth] = useState(existingMark?.depth ?? 'unclear');
  const [qualities, setQualities] = useState<string[]>(existingMark?.qualities ?? []);
  const [note, setNote] = useState(existingMark?.note ?? '');

  const zoneLabel = ZONE_LABELS[zone as SomaticBodyZone] ?? zone.replace(/_/g, ' ');

  const toggleQuality = (tag: string) => {
    setQualities((prev) =>
      prev.includes(tag) ? prev.filter((q) => q !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave({
      zone,
      intensity,
      depth: depth as ZoneMark['depth'],
      qualities,
      note: note.trim() || undefined,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 rounded-t-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        <div className="px-5 pb-8 space-y-6">
          {/* Zone name */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-neutral-100">{zoneLabel}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Intensity</p>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setIntensity(val)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-mono transition-all duration-150 ${
                    intensity === val
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-600 font-mono px-1">
              <span>mild</span>
              <span>intense</span>
            </div>
          </div>

          {/* Depth */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Depth</p>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDepth(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 ${
                    depth === value
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality tags */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Qualities</p>
            <div className="flex flex-wrap gap-2">
              {QUALITY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleQuality(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 ${
                    qualities.includes(tag)
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Optional note */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Note (optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any details about this area…"
              rows={2}
              className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {existingMark && (
              <button
                onClick={onRemove}
                className="flex-1 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 font-mono text-xs uppercase tracking-widest transition-all duration-150"
              >
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              className={`py-3.5 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs uppercase tracking-widest transition-all duration-200 ${existingMark ? 'flex-[2]' : 'flex-1'}`}
            >
              Save Zone
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
