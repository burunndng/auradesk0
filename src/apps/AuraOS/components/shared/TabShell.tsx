/**
 * TabShell Component
 *
 * Provides consistent page chrome (background, header) for Learning/Theory tabs
 * while preserving each tab's unique content and functionality.
 *
 * Colors are driven by `data-module` on the root div, which cascades
 * `--module-accent` and `--module-glow` from void-tokens.css.
 * No hardcoded Tailwind color strings — all accent references use CSS vars.
 */

import React, { ReactNode } from 'react';
import { getTabTheme, getLayoutClasses, type TabLayoutPreset } from './tabTheme';

export interface TabShellProps {
  tab: string;
  children: ReactNode;
  subtitle?: string;
  rightSlot?: ReactNode;
  layoutOverride?: TabLayoutPreset;
  contentClassName?: string;
}

export const TabShell: React.FC<TabShellProps> = ({
  tab,
  children,
  subtitle,
  rightSlot,
  layoutOverride,
  contentClassName = '',
}) => {
  const theme = getTabTheme(tab);

  if (!theme) {
    console.warn(`[TabShell] No theme found for tab: ${tab}`);
    return <>{children}</>;
  }

  const Icon = theme.icon;
  const layoutClasses = getLayoutClasses(layoutOverride || theme.preset);

  return (
    /*
     * data-module cascades --module-accent / --module-glow / --void-base
     * from void-tokens.css — no hardcoded accent colors needed below.
     */
    <div className="min-h-[100dvh] w-full relative" data-module={theme.module}>
      {/* Page background */}
      <div className={`fixed inset-0 ${theme.pageBg} -z-10`} />

      {/* Optional texture overlay */}
      {theme.texture && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ background: theme.texture }}
        />
      )}

      {/* Optional radial module glow */}
      {theme.glow && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ boxShadow: `inset ${theme.glow}` }}
        />
      )}

      {/* Main content container */}
      <div className={`relative z-0 ${layoutClasses}`}>
        {/* Header — token-driven accent colors */}
        <header
          className={`sticky top-0 z-20 bg-gradient-to-r ${theme.headerBg} backdrop-blur-md mb-8`}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
          }}
        >
          <div className="flex items-center justify-between py-4 sm:py-6 px-4 sm:px-0">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Icon badge — module-accent via CSS var */}
              <div
                className="p-2 sm:p-2.5 rounded-lg flex-shrink-0"
                style={{
                  background: 'var(--module-glow, rgba(168,85,247,0.12))',
                  border: '1px solid oklch(from var(--module-accent, oklch(0.58 0.18 290deg)) l c h / 0.20)',
                  boxShadow: '0 0 12px var(--module-glow, rgba(168,85,247,0.08))',
                }}
              >
                <Icon
                  size={theme.preset === 'canvas' ? 24 : 20}
                  style={{ color: 'var(--module-accent)' }}
                />
              </div>

              {/* Title + Subtitle */}
              <div className="min-w-0 flex-1">
                <h1
                  className="text-2xl sm:text-3xl font-bold font-display truncate"
                  style={{
                    color: 'var(--module-accent)',
                    textShadow: '0 0 20px var(--module-glow)',
                  }}
                >
                  {theme.label}
                </h1>
                {subtitle && (
                  <p
                    className="text-sm sm:text-base mt-0.5 truncate"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Optional slot */}
            {rightSlot && (
              <div className="flex-shrink-0 ml-4">
                {rightSlot}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className={`pb-12 sm:pb-16 ${contentClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
