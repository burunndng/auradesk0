/**
 * LibraryTab
 * Premium "Alchemical Void" aesthetic - matching Journey tab's design language
 * Curated resources with stone tones and geometric accents
 */

import React, { lazy, Suspense, useState, useMemo } from 'react';
import HealingAudios from '../shared/HealingAudios';
import VideoLibraryItem from '../shared/VideoLibraryItem';
import LibraryFilters from '../shared/LibraryFilters';
import { libraryVideos } from '../../data/libraryVideos';
import {
  PatternMandalaIcon,
  StructuralLatticeIcon,
  ConsciousNodeIcon,
  TransformativeArcIcon,
  EngramArchiveIcon,
  ResonatorIcon,
} from '../visualizations/SacredGeometryIcons';

const ILPKnowledgeGraph = lazy(() => import('../visualizations/ILPKnowledgeGraph.tsx').then(module => ({ default: module.ILPKnowledgeGraph })));

export default function LibraryTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'Theory', name: 'Theory' },
    { id: 'Mind', name: 'Mind' },
    { id: 'Body', name: 'Body' },
    { id: 'Shadow', name: 'Shadow' },
    { id: 'Spirit', name: 'Spirit' },
  ];

  const filteredVideos = useMemo(() => {
    return libraryVideos.filter(video => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        video.domain === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-[100dvh] bg-stone-950">
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-amber-900/5 via-stone-950/0 to-stone-950/0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-12 pb-32">

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Resource Archive</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 mb-4">
            The Library
          </h1>

          <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
            A curated ecosystem of intellectual maps, somatic recordings, and transformative teachings
            designed to deepen your integral practice.
          </p>
        </header>

        {/* Dynamic Filters */}
        <div className="mb-12">
          <LibraryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>

        {/* Practice Map Section */}
        <section id="knowledge-graph" className="scroll-mt-20 mb-12">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800">
              <PatternMandalaIcon size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-200 tracking-wide">Integral Practice Map</h2>
              <p className="text-xs text-stone-600">Explore the interconnected nodes of the knowledge architecture</p>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800/80 rounded-xl p-4 backdrop-blur-sm hover:border-stone-700/80 transition-colors">
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                  <PatternMandalaIcon size={32} className="text-stone-700 animate-pulse" />
                  <div className="text-stone-600 text-sm font-mono animate-pulse">Initializing Knowledge Manifest...</div>
                </div>
              </div>
            }>
              <ILPKnowledgeGraph />
            </Suspense>
          </div>
        </section>

        {/* Divider with ornament */}
        <div className="flex items-center gap-4 my-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <StructuralLatticeIcon size={10} className="text-stone-800" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>

        {/* Audio Practices Section */}
        {(selectedCategory === 'all' || selectedCategory === 'Body' || selectedCategory === 'Mind') && (
          <section id="audio-practices" className="scroll-mt-20 mb-12">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800">
                <ResonatorIcon size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-200 tracking-wide">Somatic Recordings</h2>
                <p className="text-xs text-stone-600">Audio practices for embodiment and healing</p>
              </div>
            </div>
            <HealingAudios />
          </section>
        )}

        {/* Divider with ornament */}
        <div className="flex items-center gap-4 my-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <ConsciousNodeIcon size={8} className="text-stone-800" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>

        {/* Videos Section */}
        <section id="video-library" className="scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800">
                <TransformativeArcIcon size={16} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-200 tracking-wide">Transformative Teachings</h2>
                <p className="text-xs text-stone-600">Deep dives into integral theory and developmental psychology</p>
              </div>
            </div>

            {filteredVideos.length > 0 && (
              <div className="text-[10px] font-mono text-stone-600 uppercase tracking-widest whitespace-nowrap">
                {filteredVideos.length} of {libraryVideos.length} resources
              </div>
            )}
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <VideoLibraryItem key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-stone-900/30 border border-dashed border-stone-800 rounded-xl">
              <EngramArchiveIcon size={32} className="text-stone-700 mb-3" />
              <div className="text-stone-600 text-sm mb-3">No resources found matching your criteria.</div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Footer ornament */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <div className="flex items-center gap-2 text-stone-700">
            <PatternMandalaIcon size={12} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Knowledge</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Practice</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Transformation</span>
            <StructuralLatticeIcon size={12} />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>

      </div>
    </div>
  );
}
