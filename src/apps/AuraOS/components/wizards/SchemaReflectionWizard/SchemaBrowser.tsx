/**
 * Schema Reflection Wizard - Step 2: Browse
 * Browse and select schemas to explore.
 * Design: stone-950 system, violet secondary, amber interactive states.
 */

import React from 'react';
import { Layers } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';

interface SchemaBrowserProps {
  schemas: SchemaDefinition[];
  selectedSchemas: Map<string, number>;
  onToggle: (schema_id: string, selected: boolean) => void;
}

// Geometric icon generators
function TriangleIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 22 20 2 20" />
    </svg>
  );
}

function OctagonIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 2h10l5 5v10l-5 5H7l-5-5V7z" />
    </svg>
  );
}

function HexagonIconSimple() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 5l4-3 4 3 3 5-3 5-4 3-4-3-3-5z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" />
    </svg>
  );
}

function getIconComponent(iconType: string) {
  switch (iconType) {
    case 'triangle': return <TriangleIcon />;
    case 'octagon': return <OctagonIcon />;
    case 'hexagon': return <HexagonIconSimple />;
    case 'star': return <StarIcon />;
    case 'moon': return <MoonIcon />;
    case 'circle': return <CircleIcon />;
    case 'square': return <SquareIcon />;
    default: return <CircleIcon />;
  }
}

export default function SchemaBrowser({
  schemas,
  selectedSchemas,
  onToggle
}: SchemaBrowserProps) {
  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <Layers size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Explore Emotional Patterns</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Select one or more schemas that resonate with you. You'll dive deeper into each one.
        </p>
      </div>

      {/* Schema Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {schemas.map(schema => {
          const isSelected = selectedSchemas.has(schema.schema_id);
          return (
            <button
              key={schema.schema_id}
              onClick={() => onToggle(schema.schema_id, !isSelected)}
              className={`p-4 rounded-xl border transition-all duration-150 text-left ${isSelected
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-900/10'
                  : 'bg-stone-900/40 border-stone-700/30 hover:border-stone-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-stone-600'}`}>
                  {getIconComponent(schema.icon_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                    {schema.plain_name}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {schema.short_description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Sounds like me
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-900/40 rounded-xl border border-stone-700/30">
        <span className="text-sm text-stone-300">
          {selectedSchemas.size === 0 ? (
            <span className="text-stone-500">Select at least one to continue</span>
          ) : (
            <span>
              You've selected <span className="font-mono font-bold text-amber-400">{selectedSchemas.size}</span> schema{selectedSchemas.size !== 1 ? 's' : ''}
            </span>
          )}
        </span>
      </div>

      {selectedSchemas.size > 0 && (
        <p className="text-xs text-stone-600 italic text-center">
          Next, you'll rate how much each resonates with you on a scale of 1–5.
        </p>
      )}
    </div>
  );
}
