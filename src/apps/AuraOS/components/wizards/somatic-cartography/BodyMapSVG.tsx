/**
 * Somatic Cartography — BodyMapSVG
 * Interactive SVG body map with 28 named zones.
 * Front view only for V1. Historical overlay shows accumulated patterns.
 */

import React, { useMemo } from 'react';
import type { ZoneMark, BodyMapHistoryEntry } from './types';
import { BODY_ZONES, ZONE_LABELS, ZONE_SVG_COORDS, ZONE_GROUPS, type SomaticBodyZone } from './constants';

interface BodyMapSVGProps {
  marks: ZoneMark[];
  historicalMarks?: BodyMapHistoryEntry[];
  onZoneTap: (zone: string) => void;
  selectedZone?: string | null;
  interactive: boolean;
}

export default function BodyMapSVG({
  marks,
  historicalMarks = [],
  onZoneTap,
  selectedZone,
  interactive,
}: BodyMapSVGProps) {
  // Count historical frequency per zone
  const historicalFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    historicalMarks.forEach((entry) =>
      entry.marks.forEach((m) => {
        freq[m.zone] = (freq[m.zone] || 0) + 1;
      })
    );
    return freq;
  }, [historicalMarks]);

  const maxFreq = useMemo(
    () => Math.max(1, ...Object.values(historicalFreq)),
    [historicalFreq]
  );

  // Current session marks by zone
  const currentMarksByZone = useMemo(() => {
    const map: Record<string, ZoneMark> = {};
    marks.forEach((m) => { map[m.zone] = m; });
    return map;
  }, [marks]);

  // Zone hit handler
  const handleZoneInteraction = (zone: string) => {
    if (interactive) onZoneTap(zone);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG body map */}
      <svg
        viewBox="0 0 120 220"
        className="w-full max-w-[280px]"
        aria-label="Interactive body map"
        role="img"
      >
        {/* Body silhouette — abstract, non-gendered */}
        <g opacity="0.15" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-emerald-500">
          {/* Head */}
          <ellipse cx="60" cy="16" rx="12" ry="14" />
          {/* Neck */}
          <rect x="55" y="29" width="10" height="8" rx="3" />
          {/* Torso */}
          <path d="M38 48 Q28 52 30 95 Q32 115 35 118 L50 118 L50 145 L70 145 L70 118 L85 118 Q88 115 90 95 Q92 52 82 48 Z" />
          {/* Left arm */}
          <path d="M38 52 Q28 58 24 80 Q22 95 25 105 Q28 112 32 110 Q36 108 38 90 L40 52 Z" />
          {/* Right arm */}
          <path d="M82 52 Q92 58 96 80 Q98 95 95 105 Q92 112 88 110 Q84 108 82 90 L80 52 Z" />
          {/* Left leg */}
          <path d="M50 118 Q44 130 44 155 Q44 178 46 200 Q48 210 52 210 Q56 210 57 200 L58 155 L50 118 Z" />
          {/* Right leg */}
          <path d="M70 118 Q76 130 76 155 Q76 178 74 200 Q72 210 68 210 Q64 210 63 200 L62 155 L70 118 Z" />
        </g>

        {/* Historical frequency overlay */}
        {BODY_ZONES.map((zone) => {
          const freq = historicalFreq[zone] || 0;
          if (freq === 0) return null;
          const opacity = Math.min(0.55, (freq / maxFreq) * 0.55);
          const coords = ZONE_SVG_COORDS[zone];
          return (
            <circle
              key={`hist-${zone}`}
              cx={coords.cx}
              cy={coords.cy}
              r="8"
              fill="#10b981"
              opacity={opacity}
              className="pointer-events-none"
            />
          );
        })}

        {/* Current session marks */}
        {marks.map((mark) => {
          const coords = ZONE_SVG_COORDS[mark.zone as SomaticBodyZone];
          if (!coords) return null;
          const r = 4 + mark.intensity * 2;
          return (
            <circle
              key={`mark-${mark.zone}`}
              cx={coords.cx}
              cy={coords.cy}
              r={r}
              fill="#10b981"
              opacity={0.85}
              className="pointer-events-none"
            />
          );
        })}

        {/* Zone hit areas (interactive, transparent) */}
        {interactive && BODY_ZONES.map((zone) => {
          const coords = ZONE_SVG_COORDS[zone];
          const isSelected = selectedZone === zone;
          const hasMark = !!currentMarksByZone[zone];
          return (
            <circle
              key={`hit-${zone}`}
              cx={coords.cx}
              cy={coords.cy}
              r="12"
              fill={isSelected ? 'rgba(16,185,129,0.2)' : hasMark ? 'rgba(16,185,129,0.08)' : 'transparent'}
              stroke={isSelected || hasMark ? 'rgba(16,185,129,0.4)' : 'transparent'}
              strokeWidth="0.5"
              className="cursor-pointer transition-all duration-150"
              onClick={() => handleZoneInteraction(zone)}
              onKeyDown={(e) => e.key === 'Enter' && handleZoneInteraction(zone)}
              role="button"
              tabIndex={0}
              aria-label={`${ZONE_LABELS[zone]}${hasMark ? ' (marked)' : ''}`}
            >
              <title>{ZONE_LABELS[zone]}</title>
            </circle>
          );
        })}
      </svg>

      {/* Intensity legend */}
      {marks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="3" fill="#10b981" opacity="0.8" />
            </svg>
            <span>low</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="#10b981" opacity="0.8" />
            </svg>
            <span>high intensity</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text list alternative (used when silhouettePreference === 'text_list')
// ---------------------------------------------------------------------------

interface ZoneTextListProps {
  marks: ZoneMark[];
  onZoneTap: (zone: string) => void;
  interactive: boolean;
}

export function ZoneTextList({ marks, onZoneTap, interactive }: ZoneTextListProps) {
  const markedZones = new Set(marks.map((m) => m.zone));

  return (
    <div className="space-y-4">
      {ZONE_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-600 mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.zones.map((zone) => (
              <button
                key={zone}
                onClick={() => interactive && onZoneTap(zone)}
                disabled={!interactive}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 ${
                  markedZones.has(zone)
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : interactive
                    ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    : 'bg-neutral-900/30 border-neutral-900 text-neutral-600 cursor-default'
                }`}
              >
                {ZONE_LABELS[zone]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
