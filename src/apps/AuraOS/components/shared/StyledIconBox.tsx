import React from 'react';

interface StyledIconBoxProps {
  children: React.ReactNode;
  variant?: 'default' | 'large';
  className?: string;
}

/**
 * StyledIconBox - A reusable container for sacred geometry icons
 * Provides consistent styling with background, border, and purple glow shadow
 */
export default function StyledIconBox({
  children,
  variant = 'default',
  className = ''
}: StyledIconBoxProps) {
  const baseClasses = 'flex items-center justify-center transition-all duration-300';
  const variantClasses = variant === 'large' ? 'icon-box-lg' : 'icon-box';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}
