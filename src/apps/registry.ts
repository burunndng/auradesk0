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
    description: 'Browser-based DAW with psychedelic visuals',
    defaultSize: { width: 1100, height: 700 },
    minSize: { width: 800, height: 500 },
    singleton: true,
    url: 'https://bliss-fghfghs-projects.vercel.app/',
    embeddable: true,
    permissions: ['microphone', 'camera'],
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
    id: 'grimoire',
    name: 'Grimoire',
    icon: 'Grimoire',
    category: 'Productivity',
    description: 'Sacred note app for AOS & Reality Architect practice',
    defaultSize: { width: 1024, height: 768 },
    minSize: { width: 720, height: 520 },
    singleton: true,
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
];

export const getAppById = (id: string): AppDefinition | undefined =>
  APP_REGISTRY.find((a) => a.id === id);

export const getAppsByCategory = (category: string): AppDefinition[] =>
  APP_REGISTRY.filter((a) => a.category === category);

export const getDefaultDockApps = (): string[] =>
  ['auraos', 'bliss', 'music-viz', 'reality-architecture', 'grimoire'];
