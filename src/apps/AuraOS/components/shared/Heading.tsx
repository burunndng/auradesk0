import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4;
  module?: 'mind' | 'shadow' | 'body' | 'spirit';
}

export default function Heading({
  level,
  module,
  className = '',
  children,
  ...props
}: HeadingProps) {
  const baseClass = 'font-serif font-bold text-slate-100';

  const sizeClasses = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
  };

  const moduleColors = {
    mind: 'text-amber-400',
    shadow: 'text-purple-400',
    body: 'text-emerald-400',
    spirit: 'text-amber-400',
  };

  const finalClass = `${baseClass} ${sizeClasses[level]} ${
    module ? moduleColors[module] : ''
  } ${className}`;

  const Tag = `h${level}` as const;
  return (
    <Tag className={finalClass} {...props}>
      {children}
    </Tag>
  );
}
