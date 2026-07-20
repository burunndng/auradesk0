import React, { useState } from 'react';
import { X, Languages, Loader, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageKey, LanguageLabResult } from '../../types.ts';
import { generateLanguage, loadHistory } from '../../services/languageLabService.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES: Array<{ key: LanguageKey; label: string; color: string; description: string }> = [
  { key: 'neo-latin', label: 'Neo-Latin', color: 'amber', description: 'Classical morphology + modern vocabulary' },
  { key: 'living-sanskrit', label: 'Living Sanskrit', color: 'orange', description: 'Paninian grammar, Devanagari' },
  { key: 'quenya', label: 'Quenya', color: 'emerald', description: 'Tolkien\'s Elvish, attested corpus only' },
  { key: 'evolved-esperanto', label: 'Evolved Esperanto', color: 'green', description: 'Systematic, completely regular' },
];

const PILL_COLORS: Record<string, string> = {
  amber: 'border-amber-500/50 text-amber-300 bg-amber-900/30 hover:bg-amber-800/50 data-[active=true]:bg-amber-700/60 data-[active=true]:border-amber-400',
  blue: 'border-blue-500/50 text-blue-300 bg-blue-900/30 hover:bg-blue-800/50 data-[active=true]:bg-blue-700/60 data-[active=true]:border-blue-400',
  orange: 'border-orange-500/50 text-orange-300 bg-orange-900/30 hover:bg-orange-800/50 data-[active=true]:bg-orange-700/60 data-[active=true]:border-orange-400',
  slate: 'border-slate-400/50 text-slate-300 bg-slate-800/40 hover:bg-slate-700/50 data-[active=true]:bg-slate-600/60 data-[active=true]:border-slate-300',
  emerald: 'border-emerald-500/50 text-emerald-300 bg-emerald-900/30 hover:bg-emerald-800/50 data-[active=true]:bg-emerald-700/60 data-[active=true]:border-emerald-400',
  green: 'border-green-500/50 text-green-300 bg-green-900/30 hover:bg-green-800/50 data-[active=true]:bg-green-700/60 data-[active=true]:border-green-400',
};

export default function LanguageLabPortal({ isOpen, onClose }: Props) {
  const [selectedLang, setSelectedLang] = useState<LanguageKey>('neo-latin');
  const [inputPhrase, setInputPhrase] = useState('');
  const [result, setResult] = useState<LanguageLabResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<LanguageLabResult[]>([]);

  const handleGenerate = async () => {
    if (!inputPhrase.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const r = await generateLanguage(selectedLang, inputPhrase.trim());
      setResult(r);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHistory = () => {
    if (!showHistory) setHistory(loadHistory());
    setShowHistory(h => !h);
  };

  const handleLoadFromHistory = (item: LanguageLabResult) => {
    setSelectedLang(item.languageKey);
    setInputPhrase(item.inputPhrase);
    setResult(item);
    setShowHistory(false);
  };

  if (!isOpen) return null;

  const langMeta = LANGUAGES.find(l => l.key === selectedLang) || LANGUAGES[0]; // Fallback to the first language

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-indigo-950/97 via-purple-950/97 to-slate-950/97 border border-indigo-500/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-indigo-500/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Languages size={28} className="text-indigo-300" style={{ filter: 'drop-shadow(0 0 10px rgba(165,180,252,0.6))' }} />
            <div>
              <h2 className="text-xl font-bold font-mono text-indigo-100">Language Lab</h2>
              <p className="text-indigo-400/70 text-xs">Neo-revival & speculative linguistics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-400 hover:text-indigo-100 p-2 rounded-full hover:bg-indigo-800/30 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.4) transparent' }}>
          {/* Language selector */}
          <div>
            <p className="text-indigo-400/60 text-xs uppercase tracking-wider mb-2">Select Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.key}
                  data-active={selectedLang === lang.key}
                  onClick={() => { setSelectedLang(lang.key); setResult(null); setError(null); }}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${PILL_COLORS[lang.color]}`}
                  title={lang.description}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="text-indigo-400/50 text-xs mt-1.5 italic">{langMeta.description}</p>
          </div>

          {/* Input */}
          <div>
            <p className="text-indigo-400/60 text-xs uppercase tracking-wider mb-2">English Phrase</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputPhrase}
                onChange={e => setInputPhrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. The mind is the measure of all things"
                className="flex-1 bg-indigo-950/50 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-indigo-100 placeholder-indigo-500/40 text-sm focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !inputPhrase.trim()}
                className="bg-indigo-600/60 hover:bg-indigo-600/80 disabled:opacity-40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-indigo-100 text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                {isLoading ? <Loader size={16} className="animate-spin" /> : <Languages size={16} />}
                Generate
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/40 border border-red-600/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-indigo-400/60 text-xs uppercase tracking-wider">
                <span className="text-indigo-400/60 text-xs uppercase tracking-wider">
                  {(LANGUAGES.find(l => l.key === result.languageKey)?.label || 'Unknown Language')} — "{result.inputPhrase}"
                </span>
                </span>
                <button
                  onClick={() => { setResult(null); handleGenerate(); }}
                  className="text-indigo-400 hover:text-indigo-200 flex items-center gap-1 text-xs transition-all"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>

              {/* Romanization */}
              <div>
                <p className="text-indigo-500/60 text-xs mb-1">Romanization</p>
                <p className="text-indigo-100 text-lg font-serif italic">{result.romanization}</p>
              </div>

              {/* Native Script */}
              {result.nativeScript && (
                <div>
                  <p className="text-indigo-500/60 text-xs mb-1">Native Script</p>
                  <p className="text-indigo-200 text-xl">{result.nativeScript}</p>
                </div>
              )}

              {/* Grammatical Notes */}
              <div>
                <p className="text-indigo-500/60 text-xs mb-1">Grammatical Notes</p>
                <p className="text-indigo-300/80 text-sm leading-relaxed">{result.grammaticalNotes}</p>
              </div>

              {/* Example Sentences */}
              <div>
                <p className="text-indigo-500/60 text-xs mb-2">Example Sentences</p>
                <div className="space-y-3">
                  {result.exampleSentences.map((s, i) => (
                    <div key={i} className="bg-indigo-900/20 border border-indigo-500/15 rounded-lg p-3 space-y-0.5">
                      <p className="text-indigo-100 text-sm font-serif italic">{s.original}</p>
                      <p className="text-indigo-500/70 text-xs font-mono">{s.gloss}</p>
                      <p className="text-indigo-300/70 text-xs">{s.translation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revival Philosophy */}
              <div className="border-t border-indigo-500/15 pt-3">
                <p className="text-indigo-500/60 text-xs mb-1">Linguistic Approach</p>
                <p className="text-indigo-400/70 text-xs italic leading-relaxed">{result.revivalPhilosophy}</p>
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <button
              onClick={handleToggleHistory}
              className="flex items-center gap-1.5 text-indigo-400/60 hover:text-indigo-300 text-xs transition-all"
            >
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Recent generations
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {history.length === 0 && <p className="text-indigo-500/40 text-xs italic">No history yet.</p>}
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleLoadFromHistory(item)}
                    className="w-full text-left bg-indigo-950/30 border border-indigo-500/15 rounded-lg px-3 py-2 hover:border-indigo-500/40 transition-all"
                  >
                    <span className="text-indigo-400/70 text-xs">{(LANGUAGES.find(l => l.key === item.languageKey)?.label || 'Unknown Language')}</span>
                    <span className="text-indigo-300/60 text-xs mx-1.5">·</span>
                    <span className="text-indigo-200/70 text-xs">{item.inputPhrase}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
