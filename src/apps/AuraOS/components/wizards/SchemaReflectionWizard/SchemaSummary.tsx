/**
 * Schema Reflection Wizard - Summary Step
 * The weighted artifact — a produced document, not a confirmation screen.
 * Design: stone-950 system, violet secondary, amber primary.
 */

import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';
import { SchemaReflectionSession } from '../../../services/schemaReflectionService';

interface SchemaSummaryProps {
  session: SchemaReflectionSession;
  schemas: SchemaDefinition[];
  onClose: () => void;
}

export default function SchemaSummary({
  session,
  schemas,
  onClose
}: SchemaSummaryProps) {
  const primarySchema = schemas.find(s => s.schema_id === session.primary_schema);

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <FileText size={44} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Schema Portrait</h2>
        <p className="text-xs text-stone-500">
          {session.explored_schemas.length} patterns explored · Primary: {primarySchema?.plain_name || 'Unknown'}
        </p>
      </div>

      {/* Main Artifact Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/15 rounded-2xl p-5 space-y-4">
        {/* What you explored */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-3">Patterns Explored</p>
          <div className="space-y-2">
            {session.explored_schemas.map(exp => {
              const s = schemas.find(x => x.schema_id === exp.schema_id);
              return (
                <div key={exp.schema_id} className="flex items-center justify-between p-3 bg-stone-900/60 rounded-xl border border-stone-700/20">
                  <span className="text-sm text-stone-300 font-medium">{s?.plain_name}</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < exp.resonance_rating ? 'bg-amber-500' : 'bg-stone-700'}`} />
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-1">{exp.resonance_rating}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-stone-800" />

        {/* Primary Pattern */}
        {primarySchema && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">Your Primary Pattern</p>
            <p className="text-base font-serif text-stone-100 mb-1">{primarySchema.plain_name}</p>
            <p className="text-sm text-stone-400 leading-relaxed">{primarySchema.short_description}</p>
          </div>
        )}

        {/* AI Analysis Insights */}
        {session.ai_analysis && (
          <>
            <div className="h-px bg-stone-800" />

            {/* Key Themes */}
            {session.ai_analysis.key_themes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Themes That Emerged</p>
                <div className="space-y-1.5">
                  {session.ai_analysis.key_themes.slice(0, 3).map((theme, i) => (
                    <div key={i} className="flex gap-2 text-sm text-stone-300">
                      <span className="text-violet-400 shrink-0">◆</span>
                      <span className="leading-relaxed">{theme}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Severity */}
            {session.ai_analysis.severity_assessment && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Severity</p>
                <p className="text-sm text-stone-400 leading-relaxed">{session.ai_analysis.severity_assessment}</p>
              </div>
            )}

            {/* Top Recommendations */}
            {session.ai_analysis.personalized_recommendations.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">What Might Help</p>
                <div className="space-y-1.5">
                  {session.ai_analysis.personalized_recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex gap-2 text-sm text-stone-300">
                      <span className="text-violet-400 font-mono shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-stone-600 italic">
              Full analysis has been saved to your Insights for future reference.
            </p>
          </>
        )}

        {/* Reflection preview */}
        {session.reflection_text && (
          <>
            <div className="h-px bg-stone-800" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">Your Reflection</p>
              <p className="text-sm text-stone-400 leading-relaxed line-clamp-4">{session.reflection_text}</p>
              {session.reflection_text.length > 200 && (
                <p className="text-xs text-stone-600 mt-1">(Saved in full to your Insights)</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actionable practice */}
      <div className="bg-amber-950/25 border border-amber-500/20 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">This Week's Practice</p>
        <p className="text-sm text-stone-300 leading-relaxed">
          Notice when {primarySchema?.plain_name || 'this pattern'} shows up this week. When it does, pause and name it: "I'm noticing the {primarySchema?.plain_name?.toLowerCase() || 'pattern'} schema." Awareness is the first step.
        </p>
      </div>

      {/* Insight line */}
      <div className="bg-stone-900/60 border border-stone-700/30 rounded-xl p-4 text-center">
        <p className="text-base font-serif text-amber-300">
          "The schema that protects you is not your enemy — it's an outdated contract worth renegotiating."
        </p>
      </div>

      {/* Meta-awareness footnote */}
      <div className="text-center py-2">
        <p className="text-xs text-stone-600 italic">
          "Categorising emotional patterns into schemas is itself a schema — a map, not the territory."
        </p>
      </div>

      {/* Routing suggestions */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Where to Go Next</p>
        {[
          { label: 'Notice when this pattern shows up this week — awareness is transformative', link: false },
          { label: 'Explore your pattern history: where did it begin? What protected you about it?', link: false },
          { label: 'Consider working with a Schema Therapist if this pattern deeply affects your life', link: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-stone-900/40 border border-stone-700/30 rounded-xl px-4 py-3">
            <ArrowRight size={14} className="text-amber-400 shrink-0" />
            <p className="text-sm text-stone-300 flex-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Professional resource */}
      <div className="text-center pt-2 border-t border-stone-800/50">
        <p className="text-xs text-stone-600 mb-2">Want to explore with a professional?</p>
        <a
          href="https://www.psychologytoday.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900/60 hover:bg-stone-800/60 border border-stone-700/30 rounded-xl text-xs text-stone-400 hover:text-stone-200 transition-colors"
        >
          Find a Therapist
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
