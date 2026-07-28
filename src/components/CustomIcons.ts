// ============================================================
// Custom Icons — AuraDesk-specific icons
// ============================================================

import type { LucideProps } from 'lucide-react';
import { RealityArchitectureIcon } from '@/components/RealityArchitectureIcon';

// Map of custom icon names to their components
const CUSTOM_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  RealityArchitecture: RealityArchitectureIcon,
};

export const getCustomIcon = (name: string): React.ComponentType<LucideProps> | null => {
  return CUSTOM_ICONS[name] || null;
};

export const isCustomIcon = (name: string): boolean => {
  return name in CUSTOM_ICONS;
};
