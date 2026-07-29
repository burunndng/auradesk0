import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { getCustomIcon, isCustomIcon } from '@/components/CustomIcons';

export function AppIcon({ name, ...props }: { name: string } & LucideProps) {
  if (isCustomIcon(name)) {
    const Custom = getCustomIcon(name);
    if (Custom) return <Custom {...props} />;
  }
  const Comp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (Comp) return <Comp {...props} />;
  return <Icons.HelpCircle {...props} />;
}
