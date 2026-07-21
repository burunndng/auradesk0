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
    url: 'https://app.auraos.space',
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
    url: 'https://bliss.auraos.space',
    embeddable: true,
    permissions: ['microphone', 'camera'],
  },
];

export const getAppById = (id: string): AppDefinition | undefined =>
  APP_REGISTRY.find((a) => a.id === id);

export const getAppsByCategory = (category: string): AppDefinition[] =>
  APP_REGISTRY.filter((a) => a.category === category);

export const getDefaultDockApps = (): string[] => ['auraos', 'bliss'];
