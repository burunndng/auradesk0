/**
 * Schema Reflection Wizard - Step 3: Deep Dive
 * Rate resonance for each selected schema.
 * Design: stone-950 system, violet secondary, amber interactive.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';
import { SchemaResonance } from '../../../services/schemaReflectionService';

interface SchemaDeepDiveProps {
  schemas: SchemaDefinition[];
  selectedSchemas: SchemaResonance[];
  currentIndex: number;
  onRating: (schema_id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
}

export default function SchemaDeepDive({
  schemas,
  selectedSchemas,
  currentIndex,
  onRating
}: SchemaDeepDiveProps) {
  if (selectedSchemas.length === 0) {
    return <div className="text-stone-500 text-sm">No schemas selected</div>;
  }

  const current = selectedSchemas[currentIndex];
  const schema = schemas.find(s => s.schema_id === current.schema_id);

  if (!schema) {
    return <div className="text-stone-500 text-sm">Schema not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <Search size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">
          {schema.plain_name}
        </h2>
        <p className="text-xs text-stone-500 font-mono">
          Schema {currentIndex + 1} of {selectedSchemas.length}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-300 leading-relaxed">
        {schema.full_description}
      </p>

      {/* How it shows up */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">How This Might Show Up</p>
        <div className="space-y-2">
          {schema.example_manifestations.map((manifestation, i) => (
            <div key={i} className="flex gap-3 p-3 bg-stone-900/40 border border-stone-700/30 rounded-xl text-sm text-stone-300">
              <span className="text-violet-400 shrink-0">◆</span>
              <span className="leading-relaxed">{manifestation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Common origins */}
      <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Common Origins</p>
        <p className="text-sm text-stone-300 leading-relaxed">{schema.common_origins}</p>
      </div>

      {/* Resonance Rating */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">How much does this resonate?</p>
        <div className="flex items-center gap-3 justify-center">
          {([1, 2, 3, 4, 5] as const).map(rating => (
            <button
              key={rating}
              onClick={() => onRating(schema.schema_id, rating)}
              className={`w-12 h-12 rounded-full transition-all duration-150 text-sm font-mono font-bold ${current.resonance_rating >= rating
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/20 text-stone-950'
                  : 'bg-stone-900/60 border border-stone-700/40 text-stone-500 hover:border-stone-600'
                }`}
              title={`Rate ${rating}/5`}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="text-center mt-3">
          {current.resonance_rating > 0 ? (
            <p className="text-xs text-stone-500">
              Your rating: <span className="font-mono font-bold text-amber-400">{current.resonance_rating}/5</span>
            </p>
          ) : (
            <p className="text-xs text-stone-600">Tap a circle to rate</p>
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <p className="text-xs text-stone-600 italic text-center">
        {currentIndex === selectedSchemas.length - 1
          ? 'This is the last schema. Click Next to continue to reflection.'
          : 'Click Next to rate the next schema.'}
      </p>
    </div>
  );
}
