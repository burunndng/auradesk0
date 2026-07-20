import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useNavigationContext } from '../../../contexts/NavigationContext';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import { typography } from '../../../theme';
import { TabShell } from '../../../components/shared/TabShell';
import {
  anchorCategories,
  integralAnchors,
  metamodernFrameworks,
  bridgeNarratives,
  bridgeRecipes,
  type AnchorCategory,
  type BridgeNarrative
} from './metamodernBridgeBuilder/bridgeData';
import { BridgeMatrix } from './metamodernBridgeBuilder/BridgeMatrix';
import { FrameworkCards } from './metamodernBridgeBuilder/FrameworkCards';
import { BridgeRecipesSection } from './metamodernBridgeBuilder/BridgeRecipesSection';

/**
 * METAMODERN BRIDGE BUILDER - Visual Design Document
 *
 * Theme: "Bridge / Gradient / Dialog"
 *
 * This tab uses a distinctive liminal/transitional visual identity:
 * 1. Violet-to-amber gradient as the dominant palette (bridging cool and warm)
 * 2. Horizontal flowing wave patterns evoking connections and transitions
 * 3. Gradient blend backgrounds suggesting liminal, in-between states
 * 4. Dialog-like card treatments with soft edges and cross-fading borders
 * 5. Gentle pulse animations suggesting ongoing synthesis
 *
 * This distinguishes it from:
 * - PracticeEcology (emerald/teal, ecology/systems focus, dot-grid pattern)
 * - IntegralTheory (purple/indigo, mandala/cosmic focus, concentric rings)
 *
 * Interactive matrix that maps Integral Theory constructs (quadrants, lines, states, polarities)
 * to metamodern frameworks (Game B, Hanzi, Bonnitta Roy, Nordic Bildung, Proto-B spaces).
 * Provides bridging narratives, tensions/synergies, and mini-practice recipes.
 */

const BRIDGE_GRADIENTS = {
  // Violet→amber liminal gradient, varies by opacity level
  subtle: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(217, 119, 6, 0.06) 50%, rgba(139, 92, 246, 0.05) 100%)',
  medium: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(217, 119, 6, 0.12) 50%, rgba(139, 92, 246, 0.10) 100%)',
  strong: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(217, 119, 6, 0.15) 50%, rgba(139, 92, 246, 0.20) 100%)',
  keyInsight: 'linear-gradient(135deg, rgba(139, 92, 246, 0.20) 0%, rgba(217, 119, 6, 0.15) 100%)',
} as const;

interface CollapsiblePanelProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  subtitle,
  icon,
  color,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-300 ${
        isOpen
          ? `${color} border-opacity-40`
          : 'border-slate-800/60 hover:border-slate-700/60'
      }`}
    >
      {/* Bridge/liminal-themed panel background */}
      <div className="absolute inset-0 bg-slate-950/90" />
      {isOpen && (
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: BRIDGE_GRADIENTS.subtle }}
        />
      )}

      <button
        onClick={onToggle}
        className={`relative w-full px-6 py-5 flex items-center justify-between transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-violet-900/20 via-slate-900/30 to-amber-900/15'
            : 'bg-slate-900/30 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
            isOpen
              ? 'bg-violet-500/15 border border-violet-500/30 shadow-lg shadow-violet-500/10'
              : 'bg-slate-800/50 border border-slate-700/50'
          }`}>
            {icon}
          </div>
          <div className="text-left">
            <h2 className={typography.h4}>{title}</h2>
            <p className={typography.label + ' mt-0.5'}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          size={24}
          className={`text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="relative p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MetamodernBridgeBuilder() {
  const { setActiveTab } = useNavigationContext();
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(['orientation']));
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<AnchorCategory['id'] | 'all'>('all');

  const bridgeDetailRef = useRef<HTMLDivElement>(null);

  const togglePanel = (id: string) => {
    setOpenPanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectCell = (anchorId: string, frameworkId: string) => {
    setSelectedAnchor(anchorId);
    setSelectedFramework(frameworkId);
  };

  const handleClearSelection = () => {
    setSelectedAnchor(null);
    setSelectedFramework(null);
  };

  // Get bridge narrative for selected cell
  const activeBridge: BridgeNarrative | undefined =
    selectedAnchor && selectedFramework
      ? bridgeNarratives.find(
          b => b.anchorId === selectedAnchor && b.frameworkId === selectedFramework
        )
      : undefined;

  // Auto-open matrix panel when cell is selected
  useEffect(() => {
    if (activeBridge && !openPanels.has('matrix')) {
      setOpenPanels(prev => new Set([...prev, 'matrix']));
    }
  }, [activeBridge, openPanels]);

  useEffect(() => {
    if (selectedAnchor && categoryFilter !== 'all') {
      const stillVisible = integralAnchors.some(anchor => anchor.id === selectedAnchor && anchor.categoryId === categoryFilter);
      if (!stillVisible) {
        handleClearSelection();
      }
    }
  }, [categoryFilter, selectedAnchor]);

  useEffect(() => {
    if (activeBridge && bridgeDetailRef.current) {
      bridgeDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeBridge]);

  const sections = [
    {
      id: 'orientation',
      title: 'Metamodern Bridge Builder',
      subtitle: 'Translating Integral Theory into metamodern practice',
      icon: React.createElement(getIconComponent('ParadoxGate') || 'div', { size: 20, className: 'text-violet-400' }),
      color: 'border-violet-500',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className={typography.body}>
              Integral Theory and metamodern frameworks speak different dialects. They share DNA—both evolved beyond postmodern deconstruction—but Integral maps <em>structure</em> while metamodern movements prototype <em>emergence</em>.
            </p>
            <p className={typography.body}>
              This bridge builder connects AQAL anchors (quadrants, lines, states, polarities) with metamodern frameworks (Game B, Hanzi Freinacht's metamodernism, Bonnitta Roy's process structures, Nordic Bildung, Proto-B practice fields). Each intersection reveals a <strong>bridge statement</strong>, <strong>tension</strong>, <strong>synergy</strong>, and <strong>practice cue</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="group relative rounded-xl p-6 border border-violet-500/30 overflow-hidden">
              {/* Violet gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-slate-900/40 to-slate-900/30" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/5 to-transparent" />
              <div className="relative">
                <h3 className={typography.h4 + ' text-violet-300 mb-3'}>
                  Why This Matters
                </h3>
                <ul className={typography.body + ' space-y-2'}>
                  <li>• Integral thinkers gain metamodern <em className="text-violet-200">enactment</em> patterns</li>
                  <li>• Metamodern practitioners gain Integral <em className="text-amber-200">diagnostic</em> precision</li>
                  <li>• Both traditions avoid each other's blind spots</li>
                  <li>• Specific practices emerge from theoretical synthesis</li>
                </ul>
              </div>
            </div>

            <div className="group relative rounded-xl p-6 border border-amber-500/30 overflow-hidden">
              {/* Amber gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/25 via-slate-900/40 to-slate-900/30" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-500/5 to-transparent" />
              <div className="relative">
                <h3 className={typography.h4 + ' text-amber-300 mb-3'}>
                  How to Navigate
                </h3>
                <ul className={typography.body + ' space-y-2'}>
                  <li>• <strong className="text-amber-200">Matrix</strong>: Click cells to see bridging narratives</li>
                  <li>• <strong className="text-violet-200">Frameworks</strong>: Expand to learn each approach's core moves</li>
                  <li>• <strong className="text-amber-200">Recipes</strong>: Try mini-experiments that blend both traditions</li>
                  <li>• <strong className="text-violet-200">Filters</strong>: Focus on specific Integral categories</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bridging principle callout with liminal gradient */}
          <div className="relative mt-8 p-6 rounded-xl border border-violet-500/20 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ background: BRIDGE_GRADIENTS.medium }}
            />
            <div className="relative">
              <h3 className={typography.h4 + ' text-slate-200 mb-2'}>
                The Bridging Principle
              </h3>
              <p className={typography.body + ' italic'}>
                "Integral Theory without metamodern practice becomes intellectual mapping. Metamodern practice without Integral structure drifts into poetic vagueness. The bridge is <strong className="text-amber-200">where wisdom becomes actionable</strong> and <strong className="text-violet-200">action becomes wise</strong>."
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'matrix',
      title: 'Interactive Bridge Matrix',
      subtitle: 'Click any cell to explore the intersection',
      icon: React.createElement(getIconComponent('SingularityOrb') || 'div', { size: 20, className: 'text-teal-400' }),
      color: 'border-teal-500',
      component: (
        <div className="space-y-6">
          <BridgeMatrix
            anchorCategories={anchorCategories}
            anchors={integralAnchors}
            frameworks={metamodernFrameworks}
            narratives={bridgeNarratives}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            selectedAnchor={selectedAnchor}
            selectedFramework={selectedFramework}
            onSelectCell={handleSelectCell}
          />

          <div className="mt-6" ref={bridgeDetailRef}>
            {activeBridge ? (
              <div
                className="relative p-6 rounded-xl border-2 border-violet-500/40 shadow-2xl shadow-violet-500/10 overflow-hidden"
              >
                {/* Bridge detail panel background - liminal gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: BRIDGE_GRADIENTS.strong }}
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{activeBridge.headline}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {activeBridge.tags.map(tag => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleClearSelection}
                      aria-label="Close bridge detail"
                      className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-violet-500/20">
                      <div className="font-semibold text-violet-300 mb-1">Bridge Statement:</div>
                      <div className="text-slate-200">{activeBridge.bridgeStatement}</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-rose-950/40 rounded-lg p-4 border border-rose-500/30">
                        <div className="font-semibold text-rose-300 mb-1">Tension:</div>
                        <div className="text-slate-300">{activeBridge.tension}</div>
                      </div>
                      <div className="bg-green-950/40 rounded-lg p-4 border border-green-500/30">
                        <div className="font-semibold text-green-300 mb-1">Synergy:</div>
                        <div className="text-slate-300">{activeBridge.synergy}</div>
                      </div>
                    </div>

                    <div className="bg-amber-950/40 rounded-lg p-4 border border-amber-500/30">
                      <div className="font-semibold text-amber-300 mb-2">
                        Practice Cue:
                      </div>
                      <div className="text-slate-200 italic">{activeBridge.practiceCue}</div>
                    </div>

                    <div className="relative rounded-lg p-4 border border-violet-500/30 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{ background: BRIDGE_GRADIENTS.keyInsight }}
                      />
                      <div className="relative">
                        <div className="font-semibold text-violet-300 mb-2">
                          Key Insight:
                        </div>
                        <div className="text-slate-200 font-medium">"{activeBridge.keyInsight}"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative p-6 rounded-xl text-center overflow-hidden">
                <div className="absolute inset-0 border border-dashed border-slate-700 rounded-xl" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: BRIDGE_GRADIENTS.subtle }}
                />
                <p className="relative text-slate-400">
                  Select any matrix cell to see a bridging narrative, tension, synergy, and practice cue.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'frameworks',
      title: 'Metamodern Frameworks',
      subtitle: 'Deep dive into each approach',
      icon: React.createElement(getIconComponent('DescentChalice') || 'div', { size: 20, className: 'text-fuchsia-400' }),
      color: 'border-fuchsia-500',
      component: (
        <FrameworkCards frameworks={metamodernFrameworks} onDeepDive={() => setActiveTab('metamodern-frameworks-deep-dive')} />
      )
    },
    {
      id: 'recipes',
      title: 'Bridge Practice Recipes',
      subtitle: 'Mini-experiments to integrate both traditions',
      icon: React.createElement(getIconComponent('QuantumEntanglement') || 'div', { size: 20, className: "text-amber-400" }),
      color: 'border-amber-500',
      component: (
        <BridgeRecipesSection recipes={bridgeRecipes} />
      )
    }
  ];

  return (
    <TabShell
      tab="metamodern-bridge"
      subtitle="Interactive matrix mapping Integral Theory to metamodern frameworks"
    >
      {/* Flowing wave pattern - bridge/liminal feel */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="metamodern-waves" x="0" y="0" width="120" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M0 20 Q30 10 60 20 T120 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-violet-400"
            />
            <path
              d="M0 30 Q30 20 60 30 T120 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-amber-400"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#metamodern-waves)" />
      </svg>

      {/* Ambient gradient glows - bridge between violet and amber */}
      <div
        className="fixed top-0 left-1/3 w-[600px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
        }}
      />
      <div
        className="fixed top-1/2 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse, rgba(217, 119, 6, 0.06) 0%, transparent 60%)'
        }}
      />
      <div
        className="fixed bottom-0 left-1/4 w-96 h-96 rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.05) 0%, rgba(217, 119, 6, 0.03) 40%, transparent 60%)'
        }}
      />

      {/* Horizontal gradient bar suggesting bridge/liminal space */}
      <div
        className="fixed top-20 left-0 right-0 h-px pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 30%, rgba(217, 119, 6, 0.3) 70%, transparent 100%)'
        }}
      />

      <div className="space-y-4">
        {sections.map(section => (
          <CollapsiblePanel
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            color={section.color}
            isOpen={openPanels.has(section.id)}
            onToggle={() => togglePanel(section.id)}
          >
            {section.component}
          </CollapsiblePanel>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-white/5">
        <button
          onClick={() => setActiveTab('metamodern-frameworks-deep-dive')}
          className="w-full text-left px-5 py-4 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Advanced Reference</p>
              <p className="text-slate-300 text-sm group-hover:text-slate-100 transition-colors">
                Metamodern Frameworks: Full Academic Survey
              </p>
            </div>
            <span className="text-slate-600 group-hover:text-slate-400 text-xs">→</span>
          </div>
        </button>
      </div>
    </TabShell>
  );
}
