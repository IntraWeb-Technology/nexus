import { SectionWrapper } from '@/components/layout/SectionWrapper';

// Hard boundary — no scroll fade at band edges (F-09). Rupture stays abrupt.
// Capability territory lives outside this band.

export function ArgumentSection() {
  return (
    <SectionWrapper id="argument" spacing="argument" rupture="argument-band">
      <div className="container">
        <div
          style={{
            paddingTop: 'var(--spacing-argument-inner)',
            paddingBottom: 'var(--spacing-argument-inner)',
            maxWidth: '52ch',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
              margin: '0 0 1.25rem',
            }}
          >
            The standard
          </p>
          <h2
            id="argument-heading"
            style={{
              fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
              fontWeight: 500,
              lineHeight: 1.3,
              letterSpacing: '-0.025em',
              color: 'var(--color-fg-primary)',
              margin: 0,
            }}
          >
            Software has to hold up once people depend on it.
          </h2>
        </div>
      </div>
    </SectionWrapper>
  );
}
