// ============================================================
// Custom Icons — AuraDesk-specific icons
// ============================================================

import type { LucideProps } from 'lucide-react';
import { RealityArchitectureIcon } from '@/components/RealityArchitectureIcon';
import { MusicVizIcon } from '@/components/MusicVizIcon';

const CUSTOM_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  RealityArchitecture: RealityArchitectureIcon,
  MusicViz: MusicVizIcon,
};

export const getCustomIcon = (name: string): React.ComponentType<LucideProps> | null => {
  return CUSTOM_ICONS[name] || null;
};

export const isCustomIcon = (name: string): boolean => {
  return name in CUSTOM_ICONS;
};
