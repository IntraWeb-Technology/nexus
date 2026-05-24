import { SectionWrapper } from '@/components/layout/SectionWrapper';

export function ArgumentSection() {
  return (
    <SectionWrapper id="argument" spacing="argument" rupture="argument-band">
      <div className="container">
        <div
          style={{
            paddingTop: 'var(--spacing-argument-inner)',
            paddingBottom: 'var(--spacing-argument-inner)',
            maxWidth: '52ch',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
              fontWeight: 500,
              lineHeight: 1.3,
              letterSpacing: '-0.025em',
              color: 'var(--color-fg-primary)',
              maxWidth: '52ch',
              margin: 0,
              textAlign: 'left',
            }}
          >
            The operation is working.
            <br />
            It just depends on too many things that were never designed to hold it together.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
