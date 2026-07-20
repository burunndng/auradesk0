/**
 * Somatic Cartography — BodyMapHeatMap
 * Frequency-encoded heat map for the Pattern Journal.
 * Zone opacity scales with how often it appears in the history window.
 */

import React, { useMemo } from 'react';
import type { BodyMapHistoryEntry } from './types';
import { BODY_ZONES, ZONE_LABELS, ZONE_SVG_COORDS, type SomaticBodyZone } from './constants';

interface BodyMapHeatMapProps {
  history: BodyMapHistoryEntry[];
  selectedZone?: string | null;
  onZoneSelect: (zone: string | null) => void;
}

export default function BodyMapHeatMap({
  history,
  selectedZone,
  onZoneSelect,
}: BodyMapHeatMapProps) {
  const freq = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach((e) => e.marks.forEach((m) => {
      map[m.zone] = (map[m.zone] || 0) + 1;
    }));
    return map;
  }, [history]);

  const maxFreq = useMemo(() => Math.max(1, ...Object.values(freq)), [freq]);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 120 220"
        className="w-full max-w-[260px]"
        aria-label="Body pattern heat map"
      >
        {/* Silhouette outline */}
        <g opacity="0.1" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-emerald-500">
          <ellipse cx="60" cy="16" rx="12" ry="14" />
          <rect x="55" y="29" width="10" height="8" rx="3" />
          <path d="M38 48 Q28 52 30 95 Q32 115 35 118 L50 118 L50 145 L70 145 L70 118 L85 118 Q88 115 90 95 Q92 52 82 48 Z" />
          <path d="M38 52 Q28 58 24 80 Q22 95 25 105 Q28 112 32 110 Q36 108 38 90 L40 52 Z" />
          <path d="M82 52 Q92 58 96 80 Q98 95 95 105 Q92 112 88 110 Q84 108 82 90 L80 52 Z" />
          <path d="M50 118 Q44 130 44 155 Q44 178 46 200 Q48 210 52 210 Q56 210 57 200 L58 155 L50 118 Z" />
          <path d="M70 118 Q76 130 76 155 Q76 178 74 200 Q72 210 68 210 Q64 210 63 200 L62 155 L70 118 Z" />
        </g>

        {/* Heat zones */}
        {BODY_ZONES.map((zone) => {
          const count = freq[zone] || 0;
          if (count === 0) return null;
          const opacity = Math.min(0.85, 0.15 + (count / maxFreq) * 0.7);
          const coords = ZONE_SVG_COORDS[zone];
          const isSelected = selectedZone === zone;
          const r = 8 + (count / maxFreq) * 6;

          return (
            <circle
              key={zone}
              cx={coords.cx}
              cy={coords.cy}
              r={isSelected ? r + 2 : r}
              fill="#10b981"
              opacity={opacity}
              stroke={isSelected ? 'rgba(16,185,129,0.8)' : 'none'}
              strokeWidth={isSelected ? '1' : '0'}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onZoneSelect(isSelected ? null : zone)}
            >
              <title>{`${ZONE_LABELS[zone]}: ${count} time${count > 1 ? 's' : ''}`}</title>
            </circle>
          );
        })}

        {/* Zones with 0 frequency — faint hit areas for accessibility */}
        {BODY_ZONES.filter((z) => !freq[z]).map((zone) => {
          const coords = ZONE_SVG_COORDS[zone];
          return (
            <circle
              key={`empty-${zone}`}
              cx={coords.cx}
              cy={coords.cy}
              r="8"
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onZoneSelect(selectedZone === zone ? null : zone)}
            >
              <title>{ZONE_LABELS[zone]}: no data</title>
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-20" />
          <span>rare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-emerald-500 opacity-55" />
          <span>occasional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 opacity-85" />
          <span>frequent</span>
        </div>
      </div>
    </div>
  );
}
