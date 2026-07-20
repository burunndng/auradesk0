/**
 * Schema Reflection Wizard - Analysis Step
 * Display AI-generated insights about the schema responses.
 * Design: stone-950 system, violet secondary accent for depth work.
 */

import React, { useState } from 'react';
import { Scan, ChevronDown, Loader2 } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';
import { AIAnalysisResult } from '../../../services/schemaReflectionService';

interface SchemaAnalysisProps {
  schema: SchemaDefinition;
  analysis: AIAnalysisResult;
  isLoading: boolean;
}

export default function SchemaAnalysis({
  schema,
  analysis,
  isLoading
}: SchemaAnalysisProps) {
  const [expandedNarrative, setExpandedNarrative] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="inline-block text-amber-400/60 mb-2">
            <Scan size={40} />
          </div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Analysing Responses</h2>
        </div>
        <div className="flex items-center gap-3 p-4 bg-stone-900/60 border border-amber-500/10 rounded-xl">
          <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />
          <p className="text-xs text-stone-400 italic">Mapping the patterns in your responses to {schema.plain_name}…</p>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-6 bg-stone-800 rounded w-3/4" />
          <div className="h-4 bg-stone-800 rounded w-full" />
          <div className="h-4 bg-stone-800 rounded w-5/6" />
          <div className="h-4 bg-stone-800 rounded w-4/6" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-stone-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Severity badge styling
  const getSeverityStyle = (assessment: string): string => {
    const lower = assessment.toLowerCase();
    if (lower.includes('low')) return 'bg-emerald-950/30 text-emerald-300 border-emerald-500/20';
    if (lower.includes('moderate')) return 'bg-amber-950/30 text-amber-300 border-amber-500/20';
    if (lower.includes('significant')) return 'bg-orange-950/30 text-orange-300 border-orange-500/20';
    return 'bg-red-950/30 text-red-300 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <Scan size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Analysis of Your Responses</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Here's what emerged from your reflections on {schema.plain_name}
        </p>
      </div>

      {/* Key Themes */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Key Themes</p>
        <div className="space-y-2">
          {analysis.key_themes.map((theme, i) => (
            <div key={i} className="flex gap-3 p-3 bg-stone-900/40 border border-stone-700/30 rounded-xl">
              <span className="text-amber-400 font-bold shrink-0">✦</span>
              <span className="text-sm text-stone-300 leading-relaxed">{theme}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Assessment */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Severity Assessment</p>
        <div className={`border rounded-xl p-4 ${getSeverityStyle(analysis.severity_assessment)}`}>
          <p className="text-sm leading-relaxed">{analysis.severity_assessment}</p>
        </div>
      </div>

      {/* Protective Strategies */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Protective Strategies You're Already Using</p>
        <div className="space-y-2">
          {analysis.protective_strategies.map((strategy, i) => (
            <div key={i} className="flex gap-3 p-3 bg-emerald-950/15 rounded-xl border border-emerald-500/10">
              <span className="text-emerald-400 shrink-0">•</span>
              <span className="text-sm text-stone-300 leading-relaxed">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison to Typical */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">How This Compares to Typical Patterns</p>
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
          <p className="text-sm text-stone-300 leading-relaxed">{analysis.comparison_to_typical}</p>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Personalised Recommendations</p>
        <div className="space-y-2">
          {analysis.personalized_recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 p-4 bg-violet-950/15 rounded-xl border border-violet-500/10">
              <span className="text-violet-400 font-mono font-bold shrink-0">{i + 1}.</span>
              <span className="text-sm text-stone-300 leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Narrative (Expandable) */}
      <div>
        <button
          onClick={() => setExpandedNarrative(!expandedNarrative)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors"
        >
          Full Analysis Narrative
          <ChevronDown className={`w-3 h-3 transition-transform ${expandedNarrative ? 'rotate-180' : ''}`} />
        </button>
        {expandedNarrative && (
          <div className="mt-3 bg-stone-950/80 border border-stone-800 rounded-xl p-4">
            <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-wrap">{analysis.raw_analysis}</p>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-4">
        <p className="text-xs text-stone-500 italic leading-relaxed">
          This analysis is based on your responses and is meant for self-reflection. For professional guidance, consider working with a Schema Therapy-trained therapist.
        </p>
      </div>
    </div>
  );
}
