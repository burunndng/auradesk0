// ============================================================
// App Registry — AuraDesk
// ============================================================

import type { AppDefinition } from '@/types';

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'auraos',
    name: 'AuraOS',
    icon: 'Monitor',
    category: 'Practice',
    description: 'Integral Life Practice — Body, Mind, Shadow, Spirit',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 640, height: 480 },
    singleton: true,
    url: 'https://auraos.space',
    embeddable: true,
  },
  {
    id: 'bliss',
    name: 'BLISS',
    icon: 'Music',
    category: 'Audio',
    description: 'Browser-based DAW with psychedelic visuals — session grid, step sequencer, FX racks, Web Audio API synthesis',
    defaultSize: { width: 1200, height: 800 },
    minSize: { width: 900, height: 600 },
    singleton: true,
    // BLISS's host (AI Studio) blocks in-app iframe embedding (X-Frame-Options),
    // so it launches in its own browser tab via the local BLISS launch screen.
    // See src/apps/BLISS/index.tsx.
    embeddable: false,
    permissions: ['microphone', 'autoplay'],
  },
  {
    id: 'enthea-viz',
    name: 'ENTHEA-VIZ',
    icon: 'MusicViz',
    category: 'Audio',
    description: 'Audio-reactive music visualization — spectral analysis and fluid dynamics rendering',
    defaultSize: { width: 1200, height: 780 },
    minSize: { width: 800, height: 520 },
    singleton: true,
    url: 'https://elder-plinius.github.io/ENTHEA/',
    embeddable: true,
    permissions: ['microphone', 'autoplay'],
    hidden: true,
  },
  {
    id: 'music-viz',
    name: 'Resonance',
    icon: 'MusicViz',
    category: 'Audio',
    description: 'Audio-reactive field visualizer — SerK3t signal membrane',
    defaultSize: { width: 1200, height: 780 },
    minSize: { width: 800, height: 520 },
    singleton: true,
    url: 'https://music-viz-sserket.vercel.app/visualizer',
    embeddable: true,
    permissions: ['microphone', 'autoplay'],
  },
  {
    id: 'reality-architecture',
    name: "Reality's Architecture",
    icon: 'RealityArchitecture',
    category: 'Practice',
    description: 'Micro-learning curriculum — 76 lessons across 10 weeks',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 640, height: 480 },
    singleton: true,
    url: 'https://phoked2.vercel.app/',
    embeddable: true,
  },
  {
    id: 'khyzel',
    name: 'KHYZEL',
    icon: 'SquareCode',
    category: 'DevTools',
    description: 'System Prompt Workbench — author, test, and refine system prompts',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 640, height: 480 },
    singleton: true,
    url: 'https://khyzel-s3rket.kimi.page',
    embeddable: true,
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: 'Feather',
    category: 'Productivity',
    description: 'A quiet place to think and write',
    defaultSize: { width: 880, height: 620 },
    minSize: { width: 560, height: 420 },
    singleton: true,
  },
  {
    id: 'ghostshare',
    name: 'GhostShare',
    icon: 'Globe',
    category: 'Internet',
    description: 'Anonymous file, media & link sharing tools',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 640, height: 480 },
    singleton: true,
    url: 'https://zlmao.shakespeare.wtf/',
    embeddable: true,
  },
  {
    id: 'cognibias',
    name: 'CogniBias',
    icon: 'Brain',
    category: 'Practice',
    description: 'Cognitive bias explorer — train your reasoning',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 640, height: 480 },
    singleton: true,
    url: 'https://burunndng.github.io/CoBi4s/',
    embeddable: true,
  },
];

export const getAppById = (id: string): AppDefinition | undefined =>
  APP_REGISTRY.find((a) => a.id === id);

export const getAppsByCategory = (category: string): AppDefinition[] =>
  APP_REGISTRY.filter((a) => a.category === category);

export const getDefaultDockApps = (): string[] =>
  ['auraos', 'bliss', 'music-viz', 'reality-architecture', 'khyzel'];
