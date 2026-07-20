import React, { useState, useRef } from 'react';
import {
  Zap, Loader, Copy, Download,
  ArrowRight, Check, X, Shield, Cpu, Terminal
} from 'lucide-react';
import ApophaticFrameIcon from '../visualizations/SacredGeometryIcons/ApophaticFrameIcon';
import { NoosphereNodeIcon } from '../visualizations/SacredGeometryIcons';
import StyledIconBox from '../shared/StyledIconBox';
import { StorageManager } from '../../.claude/lib/storageManager';
import { redactAndSummarizeData } from '../../services/printReportService';
import { callDeepseekReport } from '../../services/openRouterService';

interface ReportState {
  status: 'idle' | 'generating' | 'complete' | 'error';
  progress: number;
  wordCount: number;
  generatedAt: string;
}

export default function PrintReportTab() {
  const [reportText, setReportText] = useState<string>('');
  const [state, setState] = useState<ReportState>({
    status: 'idle',
    progress: 0,
    wordCount: 0,
    generatedAt: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = async () => {
    setState(prev => ({ ...prev, status: 'generating', progress: 0 }));
    setError(null);
    setReportText('');

    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 15, 95)
      }));
    }, 400);

    try {
      const exportedData = StorageManager.exportAll();
      const redactedSummary = redactAndSummarizeData(exportedData);
      const report = await callDeepseekReport(redactedSummary);

      const wordCount = report.split(/\s+/).length;
      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        wordCount,
        generatedAt: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      setReportText(report);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      setState(prev => ({ ...prev, status: 'error' }));
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleDownload = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aos-neural-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-stone-950 text-slate-200 selection:bg-purple-500/30"
    >
      {/* Dynamic Background System */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />

        {/* Animated Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* Glow Orbs */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header - Glass Blur */}
        <header className="px-8 py-6 border-b border-white/5 backdrop-blur-md bg-stone-950/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 p-[1px]">
                <div className="w-full h-full rounded-lg bg-stone-950 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Neural Synthesis</h1>
                <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">AOS // REPORT_MODULE_01</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">E2E Privacy Encrypted</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-12">
          <div className="max-w-5xl mx-auto space-y-12">

            {state.status === 'idle' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Intro Section */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white leading-[1.1]">
                      Deep Insight <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                        Practice Evolution
                      </span>
                    </h2>
                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                      Synthesize your entire local database into a hyper-personalized neural report. No data leaves your machine unredacted.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Cpu, label: 'Neural Processing', sub: 'Pattern discovery' },
                      { icon: Shield, label: 'Redaction Engine', sub: 'Anonymized data' },
                    ].map((feat, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <feat.icon className="w-5 h-5 text-purple-400 mb-2" />
                        <h4 className="text-sm font-bold text-slate-200">{feat.label}</h4>
                        <p className="text-xs text-slate-500">{feat.sub}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    className="group relative w-full sm:w-auto px-8 py-4 rounded-full overflow-hidden transition-all duration-300 transform active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative flex items-center justify-center gap-3 text-white font-bold tracking-wide">
                      <Zap className="w-5 h-5 fill-current" />
                      <span>INITIALIZE SYNTHESIS</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Aesthetic Visual Side */}
                <div className="hidden lg:block lg:col-span-5 relative">
                  <div className="aspect-square rounded-full border border-white/10 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
                    <StyledIconBox variant="large" className="p-3 relative z-10">
                      <ApophaticFrameIcon className="text-slate-100" size={140} />
                    </StyledIconBox>
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-[scan_3s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {state.status === 'generating' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-10">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full border border-purple-500/20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                    <Loader className="w-12 h-12 text-purple-400 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">Processing_Matrix</span>
                  </div>
                </div>

                <div className="w-full max-w-md space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white uppercase tracking-wider">Neural Synthesis In Progress</p>
                      <p className="text-xs text-slate-500 font-mono">Status: Reading memory buffers...</p>
                    </div>
                    <span className="text-xl font-black text-purple-400 font-mono">{Math.floor(state.progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Completion State */}
            {state.status === 'complete' && reportText && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Synthesis Complete</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">Neural Output Analysis</h3>
                    <p className="text-sm text-slate-500 font-mono">
                      GEN_ID: {state.generatedAt.replace(/\s/g, '_')} // {state.wordCount} WORDS
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-3 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/10 text-slate-300 transition-all flex items-center gap-2 text-sm font-semibold"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 rounded-lg bg-white text-black hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD REPORT
                    </button>
                  </div>
                </div>

                {/* The Report Body */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <NoosphereNodeIcon className="w-3 h-3" /> Key Indicators
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase">Context Depth</p>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[85%]" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase">Privacy Score</p>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[100%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 p-10 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden group">

                    <div className="relative prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-li:text-slate-300">
                      {reportText.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={idx} className="text-xl font-bold mb-4 mt-8 first:mt-0 text-purple-400 font-mono tracking-tight underline decoration-purple-500/30 underline-offset-8">{line.replace('## ', '')}</h2>;
                        } else if (line.startsWith('### ')) {
                          return <h3 key={idx} className="text-lg font-bold mb-3 mt-6 text-teal-400">{line.replace('### ', '')}</h3>;
                        } else if (line.startsWith('- ')) {
                          return <li key={idx} className="mb-2 list-none flex gap-2"><span className="text-purple-500">▹</span>{line.replace('- ', '')}</li>;
                        } else if (line.trim()) {
                          return <p key={idx} className="mb-4 text-slate-300/90 leading-relaxed font-sans">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {state.status === 'error' && error && (
              <div className="max-w-md mx-auto p-8 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">System Fault</h3>
                  <p className="text-sm text-slate-500 mt-2">{error}</p>
                </div>
                <button
                  onClick={handleGenerateReport}
                  className="px-6 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all uppercase tracking-widest"
                >
                  Force Retry
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.2);
        }

        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          50% { top: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
