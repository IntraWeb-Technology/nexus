import React from 'react';

export const Heading: React.FC<{
  level: 1 | 2 | 3;
  children: React.ReactNode;
}> = ({ level, children }) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  const scale: Record<1 | 2 | 3, string> = {
    1: 'text-4xl leading-tight tracking-tight',
    2: 'text-2xl leading-snug tracking-tight',
    3: 'text-xl leading-snug',
  };
  return <Tag className={scale[level]}>{children}</Tag>;
};

export const Body: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <p className="text-base leading-relaxed">{children}</p>
);

export const Annotation: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <span className="font-mono text-xs">{children}</span>
);

export const SystemLabel: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <span className="font-mono text-[10px] uppercase tracking-widest">{children}</span>
);
