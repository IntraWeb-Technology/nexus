import React from 'react';

export const AnnotationLabel: React.FC<{
  position: { x: number; y: number };
  text: string;
  weight?: 'primary' | 'secondary';
}> = ({ position, text, weight = 'secondary' }) => {
  return (
    <text
      x={position.x}
      y={position.y}
      className={
        weight === 'primary'
          ? 'font-mono text-xs fill-fg-primary'
          : 'font-mono text-xs fill-fg-secondary'
      }
    >
      {text}
    </text>
  );
};
