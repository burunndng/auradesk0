import React, { useState } from 'react';
import { AqalReportData } from '../../types.ts';
import { Target, CheckCircle, Zap, Box } from 'lucide-react';
import { AscensionFlameIcon } from '../visualizations/SacredGeometryIcons';
import { SpiralDynamicsVisualization } from '../visualizations/SpiralDynamicsVisualization';
import AQALQuadrantsVisualization from '../visualizations/AQALQuadrantsVisualization';

interface AqalTabProps {
  report: AqalReportData | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

export default function AqalTab({ report, isLoading, error, onGenerate }: AqalTabProps) {
  const [showSpiral, setShowSpiral] = useState(false);
  const [showAqalViz, setShowAqalViz] = useState(false);

  const handleGenerate = () => {
    console.log('[AqalTab] Generate button clicked, calling onGenerate...');
    console.log('[AqalTab] onGenerate is:', typeof onGenerate, onGenerate);
    onGenerate();
  };

  if (showAqalViz) {
    return <AQALQuadrantsVisualization onClose={() => setShowAqalViz(false)} />;
  }

  if (showSpiral) {
    return <SpiralDynamicsVisualization onClose={() => setShowSpiral(false)} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-64">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-100 tracking-tighter">AQAL Report</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">Get a holistic, AI-powered analysis of your practice across all four quadrants of your being.</p>
      </header>

      <section className="card-glass bg-stone-950/80 border border-accent/30 rounded-2xl p-8 relative overflow-hidden text-center max-w-4xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
        <Target size={48} className="mx-auto text-accent mb-6 opacity-80" />
        <h2 className="text-3xl font-serif text-slate-100 mb-4 tracking-wide">Generate Your Integral Analysis</h2>
        <p className="text-slate-300 mb-10 max-w-lg mx-auto leading-relaxed font-light">Aura will review your current practice stack, completion data, and notes to provide insights on your development in the "I", "We", "It", and "Its" quadrants.</p>

        {/* NEW: Safe CSS-based AQAL Quadrants Visualization */}
        <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="bg-teal-900/20 border border-teal-500/30 p-4 rounded-lg flex flex-col items-center justify-center text-center h-32 hover:bg-teal-900/30 transition-colors">
            <span className="text-2xl font-bold text-teal-400">I</span>
            <span className="text-xs text-teal-300 uppercase tracking-wider mt-1">Interior Individual</span>
            <span className="text-[10px] text-slate-400 mt-2">Intentionality • Psychology</span>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg flex flex-col items-center justify-center text-center h-32 hover:bg-green-900/30 transition-colors">
            <span className="text-2xl font-bold text-green-400">It</span>
            <span className="text-xs text-green-300 uppercase tracking-wider mt-1">Exterior Individual</span>
            <span className="text-[10px] text-slate-400 mt-2">Behavior • Physiology</span>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg flex flex-col items-center justify-center text-center h-32 hover:bg-amber-900/30 transition-colors">
            <span className="text-2xl font-bold text-amber-400">We</span>
            <span className="text-xs text-amber-300 uppercase tracking-wider mt-1">Interior Collective</span>
            <span className="text-[10px] text-slate-400 mt-2">Culture • Shared Values</span>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex flex-col items-center justify-center text-center h-32 hover:bg-indigo-900/30 transition-colors">
            <span className="text-2xl font-bold text-indigo-400">Its</span>
            <span className="text-xs text-indigo-300 uppercase tracking-wider mt-1">Exterior Collective</span>
            <span className="text-[10px] text-slate-400 mt-2">Systems • Environment</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn-luminous font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition disabled:cursor-not-allowed mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Report...
            </>
          ) : (
            <>
              <AscensionFlameIcon size={16} /> Generate Report
            </>
          )}
        </button>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </section>

      {report && (
        <section className="space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">Overall Summary</h2>
              {report.generatedAt && (
                <span className="text-xs text-slate-500">
                  Generated {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 card-luminous-hover">
              <p className="text-slate-300 leading-relaxed">{report.summary}</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Quadrant Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`bg-slate-800/50 border ${report.quadrantScores && report.quadrantScores.I <= 2 ? 'border-orange-500/50' : 'border-slate-800'} rounded-lg p-5 card-luminous-hover`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-teal-300">I (Subjective)</h3>
                  {report.quadrantScores && (
                    <span className={`text-xs ${report.quadrantScores.I <= 2 ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                      {report.quadrantScores.I}/10 {report.quadrantScores.I <= 2 && '⚠️'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 italic mb-2">Interior-Individual: thoughts, feelings, consciousness</p>
                {report.quadrantScores && (
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${report.quadrantScores.I * 10}%` }}></div>
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{report.quadrantInsights.I}</p>
              </div>
              <div className={`bg-slate-800/50 border ${report.quadrantScores && report.quadrantScores.It <= 2 ? 'border-orange-500/50' : 'border-slate-800'} rounded-lg p-5 card-luminous-hover`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-green-300">It (Objective)</h3>
                  {report.quadrantScores && (
                    <span className={`text-xs ${report.quadrantScores.It <= 2 ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                      {report.quadrantScores.It}/10 {report.quadrantScores.It <= 2 && '⚠️'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 italic mb-2">Exterior-Individual: body, behaviors, physiology</p>
                {report.quadrantScores && (
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${report.quadrantScores.It * 10}%` }}></div>
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{report.quadrantInsights.It}</p>
              </div>
              <div className={`bg-slate-800/50 border ${report.quadrantScores && report.quadrantScores.We <= 2 ? 'border-orange-500/50' : 'border-slate-800'} rounded-lg p-5 card-luminous-hover`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-amber-300">We (Intersubjective)</h3>
                  {report.quadrantScores && (
                    <span className={`text-xs ${report.quadrantScores.We <= 2 ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                      {report.quadrantScores.We}/10 {report.quadrantScores.We <= 2 && '⚠️'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 italic mb-2">Interior-Collective: culture, relationships, shared meaning</p>
                {report.quadrantScores && (
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${report.quadrantScores.We * 10}%` }}></div>
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{report.quadrantInsights.We}</p>
              </div>
              <div className={`bg-slate-800/50 border ${report.quadrantScores && report.quadrantScores.Its <= 2 ? 'border-orange-500/50' : 'border-slate-800'} rounded-lg p-5 card-luminous-hover`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-indigo-300">Its (Interobjective)</h3>
                  {report.quadrantScores && (
                    <span className={`text-xs ${report.quadrantScores.Its <= 2 ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                      {report.quadrantScores.Its}/10 {report.quadrantScores.Its <= 2 && '⚠️'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 italic mb-2">Exterior-Collective: systems, environments, structures</p>
                {report.quadrantScores && (
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                    <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${report.quadrantScores.Its * 10}%` }}></div>
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{report.quadrantInsights.Its}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Recommendations</h2>
            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 card-luminous-hover">
              <ul className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <li key={`rec-${rec.substring(0, 30)}-${index}`} className="text-slate-300 flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Spiral Dynamics Visualization */}
      <section className="border border-slate-700/80 rounded-lg p-6 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Spiral Dynamics
            </h2>
            <p className="text-sm text-slate-400">
              Explore the nine stages of consciousness evolution, from survival instincts to integral awareness. A map of human developmental potential.
            </p>
          </div>
          <button
            onClick={() => setShowSpiral(true)}
            className="px-4 py-2 text-sm font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/30 transition whitespace-nowrap ml-4"
          >
            Explore
          </button>
        </div>
      </section>
    </div>
  );
}