import React, { useEffect, useState } from 'react';
import { Filter, CheckCircle2, Zap, ArrowLeftRight } from 'lucide-react';
import type {
  AnchorCategory,
  IntegralAnchor,
  MetamodernFramework,
  BridgeNarrative
} from './bridgeData';

interface BridgeMatrixProps {
  anchorCategories: AnchorCategory[];
  anchors: IntegralAnchor[];
  frameworks: MetamodernFramework[];
  narratives: BridgeNarrative[];
  categoryFilter: AnchorCategory['id'] | 'all';
  onCategoryChange: (value: AnchorCategory['id'] | 'all') => void;
  selectedAnchor: string | null;
  selectedFramework: string | null;
  onSelectCell: (anchorId: string, frameworkId: string) => void;
}

export const BridgeMatrix: React.FC<BridgeMatrixProps> = ({
  anchorCategories,
  anchors,
  frameworks,
  narratives,
  categoryFilter,
  onCategoryChange,
  selectedAnchor,
  selectedFramework,
  onSelectCell,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filteredAnchors = categoryFilter === 'all'
    ? anchors
    : anchors.filter(anchor => anchor.categoryId === categoryFilter);

  const getBridge = (anchorId: string, frameworkId: string) =>
    narratives.find(n => n.anchorId === anchorId && n.frameworkId === frameworkId);

  const renderSignalIcon = (signal: BridgeNarrative['signal']) => {
    if (signal === 'synergy') return <CheckCircle2 size={12} className="mx-auto text-green-400" aria-label="Synergy" />;
    if (signal === 'tension') return <Zap size={12} className="mx-auto text-rose-400" aria-label="Tension" />;
    return <ArrowLeftRight size={12} className="mx-auto text-amber-400" aria-label="Translation" />;
  };

  const filterButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange('all')}
        aria-pressed={categoryFilter === 'all'}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          categoryFilter === 'all'
            ? 'bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white shadow-lg'
            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
        }`}
      >
        <Filter size={14} className="inline mr-1.5" />
        All Anchors
      </button>
      {anchorCategories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          aria-pressed={categoryFilter === cat.id}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            categoryFilter === cat.id
              ? `bg-gradient-to-r ${cat.accent} text-white shadow-lg`
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {filterButtons}

      {/* Mobile card-list layout */}
      {isMobileView && (
        <div className="space-y-4">
          {/* Sticky context indicator */}
          <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm py-2 text-xs text-slate-400 border-b border-slate-800">
            {categoryFilter === 'all'
              ? 'Showing all anchors'
              : `Filtered: ${anchorCategories.find(c => c.id === categoryFilter)?.label ?? categoryFilter}`}
          </div>

          {frameworks.map(framework => (
            <div key={framework.id} className="space-y-2">
              {/* Framework header */}
              <div className="bg-slate-900/60 rounded-lg px-4 py-3 border border-slate-700/50">
                <div className={`text-sm font-bold ${framework.color}`}>
                  {framework.name.split('·')[0].trim()}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{framework.tagline}</div>
              </div>

              {/* Anchor pills */}
              <div className="flex flex-wrap gap-2 pl-1">
                {filteredAnchors.map(anchor => {
                  const bridge = getBridge(anchor.id, framework.id);
                  const isSelected = selectedAnchor === anchor.id && selectedFramework === framework.id;

                  if (!bridge) {
                    return (
                      <span
                        key={`${anchor.id}-${framework.id}`}
                        className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-full text-xs font-medium bg-slate-800/40 border border-slate-700/30 text-slate-500 opacity-40 cursor-not-allowed"
                      >
                        {anchor.shortLabel}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={`${anchor.id}-${framework.id}`}
                      onClick={() => onSelectCell(anchor.id, framework.id)}
                      aria-pressed={isSelected}
                      className={`inline-flex items-center gap-1 min-h-[44px] px-3 py-2 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white border-2 border-white shadow-lg'
                          : bridge.signal === 'synergy'
                            ? 'bg-green-900/40 border border-green-500/50 text-green-200 hover:bg-green-800/60'
                            : bridge.signal === 'tension'
                              ? 'bg-rose-900/40 border border-rose-500/50 text-rose-200 hover:bg-rose-800/60'
                              : 'bg-amber-900/40 border border-amber-500/50 text-amber-200 hover:bg-amber-800/60'
                      }`}
                    >
                      {renderSignalIcon(bridge.signal)}
                      {anchor.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop grid layout */}
      {!isMobileView && (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `200px repeat(${filteredAnchors.length}, minmax(150px, 1fr))`,
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}
            >
              <div className="text-xs font-mono text-slate-500 flex items-end px-2 pb-2">
                Integral Anchors →<br />Metamodern Frameworks ↓
              </div>
              {filteredAnchors.map(anchor => (
                <div
                  key={anchor.id}
                  className="text-xs font-medium text-slate-300 text-center px-2 pb-2"
                >
                  <div className={`${anchor.color} font-bold`}>{anchor.shortLabel}</div>
                  <div className="text-slate-400 mt-0.5 line-clamp-2">{anchor.description}</div>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {frameworks.map(framework => (
              <div
                key={framework.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `200px repeat(${filteredAnchors.length}, minmax(150px, 1fr))`,
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                {/* Framework Label */}
                <div className="bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/50">
                  <div className={`text-sm font-bold ${framework.color}`}>
                    {framework.name.split('·')[0].trim()}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{framework.tagline}</div>
                </div>

                {/* Matrix Cells */}
                {filteredAnchors.map(anchor => {
                  const bridge = getBridge(anchor.id, framework.id);
                  const isSelected = selectedAnchor === anchor.id && selectedFramework === framework.id;

                  return (
                    <button
                      key={`${anchor.id}-${framework.id}`}
                      onClick={() => bridge && onSelectCell(anchor.id, framework.id)}
                      disabled={!bridge}
                      aria-pressed={isSelected}
                      className={`
                        relative rounded-lg px-2 py-3 text-xs transition-all duration-200 min-h-[44px]
                        ${bridge ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
                        ${isSelected
                          ? 'bg-gradient-to-br from-violet-600/60 to-fuchsia-600/60 border-2 border-white shadow-xl scale-105 z-10'
                          : bridge
                            ? bridge.signal === 'synergy'
                              ? 'bg-green-900/30 border border-green-500/40 hover:bg-green-800/50 hover:border-green-400/60'
                              : bridge.signal === 'tension'
                                ? 'bg-rose-900/30 border border-rose-500/40 hover:bg-rose-800/50 hover:border-rose-400/60'
                                : 'bg-amber-900/30 border border-amber-500/40 hover:bg-amber-800/50 hover:border-amber-400/60'
                            : 'bg-slate-900/30 border border-slate-800/30'
                        }
                      `}
                    >
                      {bridge && (
                        <>
                          <div className="font-semibold text-white mb-1">
                            {renderSignalIcon(bridge.signal)}
                          </div>
                          <div className="text-slate-300 line-clamp-2">
                            {bridge.headline}
                          </div>
                        </>
                      )}
                      {!bridge && <div className="text-slate-600 text-xs">—</div>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-900/50 border border-green-500/50" />
          <CheckCircle2 size={12} className="text-green-400" aria-hidden="true" />
          <span>Synergy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-900/50 border border-rose-500/50" />
          <Zap size={12} className="text-rose-400" aria-hidden="true" />
          <span>Tension</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-900/50 border border-amber-500/50" />
          <ArrowLeftRight size={12} className="text-amber-400" aria-hidden="true" />
          <span>Translation</span>
        </div>
      </div>
    </div>
  );
};
