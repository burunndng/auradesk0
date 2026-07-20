import React from 'react';
import { ILPGraphCategory } from '../../../types';

interface ThemedQuizEnvironmentProps {
  category: ILPGraphCategory;
  children: React.ReactNode;
}

interface ThemeConfig {
  background: string;
  accentColor: string;
}

const moduleThemes: Record<ILPGraphCategory, ThemeConfig> = {
  core: {
    background: 'linear-gradient(180deg, #1c1917 0%, #1a1816 50%, #171412 100%)',
    accentColor: '#d6a756',
  },
  body: {
    background: 'linear-gradient(180deg, #1c1917 0%, #1a1614 50%, #171210 100%)',
    accentColor: '#34d399',
  },
  mind: {
    background: 'linear-gradient(180deg, #1c1917 0%, #161a19 50%, #121615 100%)',
    accentColor: '#60a5fa',
  },
  spirit: {
    background: 'linear-gradient(180deg, #1c1917 0%, #191719 50%, #151315 100%)',
    accentColor: '#2dd4bf',
  },
  shadow: {
    background: 'linear-gradient(180deg, #1c1917 0%, #171717 50%, #121212 100%)',
    accentColor: '#c084fc',
  },
  'integral-theory': {
    background: 'linear-gradient(180deg, #1c1917 0%, #161a19 50%, #121615 100%)',
    accentColor: '#a78bfa',
  },
};

export const ThemedQuizEnvironment: React.FC<ThemedQuizEnvironmentProps> = ({
  category,
  children,
}) => {
  const theme = moduleThemes[category] || moduleThemes['core'];

  return (
    <div
      className="relative w-full"
      style={{
        background: theme.background,
      }}
    >
      {/* Subtle top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{ background: theme.accentColor }}
      />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
