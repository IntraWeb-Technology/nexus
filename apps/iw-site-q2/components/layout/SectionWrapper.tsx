import React from 'react';

export type SectionId =
  | 'hero'
  | 'friction'
  | 'argument'
  | 'pillars'
  | 'proof'
  | 'model'
  | 'continuity'
  | 'filter'
  | 'cta'
  | 'about-identity'
  | 'about-origin'
  | 'about-principles'
  | 'about-fit'
  | 'about-cta';

export type SectionSpacingToken =
  | 'hero'
  | 'friction'
  | 'argument'
  | 'pillars'
  | 'proof'
  | 'model'
  | 'continuity'
  | 'filter'
  | 'cta'
  | 'about-identity'
  | 'about-origin'
  | 'about-principles'
  | 'about-fit'
  | 'about-cta';

export const SectionWrapper: React.FC<{
  id: SectionId;
  spacing: SectionSpacingToken;
  rupture?: 'argument-band';
  children: React.ReactNode;
}> = ({ id, spacing, rupture, children }) => {
  return (
    <section
      id={id}
      data-spacing={spacing}
      data-rupture={rupture ?? undefined}
      className={rupture === 'argument-band' ? 'bg-bg-argument' : undefined}
    >
      {children}
    </section>
  );
};
