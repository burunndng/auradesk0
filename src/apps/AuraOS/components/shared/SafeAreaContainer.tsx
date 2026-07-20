import React from 'react';
import clsx from 'clsx';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  direction?: 'top' | 'bottom' | 'both' | 'none';
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  direction = 'both'
}) => {
  const className = clsx(
    direction === 'top' && 'safe-area-inset-top',
    direction === 'bottom' && 'safe-area-inset-bottom',
    direction === 'both' && 'safe-area-inset-top safe-area-inset-bottom'
  );

  return <div className={className}>{children}</div>;
};
