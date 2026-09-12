import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { SECTION_GRADIENT_SEAM } from '@/lib/section-seam';

export function ContinuitySection() {
  return (
    <SectionWrapper id="continuity" spacing="continuity">
      <div
        className="container"
        style={{
          paddingTop: 'var(--spacing-continuity)',
          paddingBottom: 'var(--spacing-continuity)',
        }}
      >
        <div style={{ maxWidth: '42rem' }}>
          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
              margin: '0 0 0.85rem',
            }}
          >
            Close to the work
          </p>
          <h2
            id="continuity-heading"
            style={{
              fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
              fontSize: 'clamp(1.35rem, 2.2vw, 1.85rem)',
              fontWeight: 650,
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
              color: 'var(--color-fg-primary)',
              margin: '0 0 1rem',
            }}
          >
            The people making the key decisions stay involved.
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--iw-fg-1)',
              margin: 0,
              maxWidth: '38rem',
            }}
          >
            From planning through implementation, responsibility stays close to the work.
          </p>
        </div>
      </div>
      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </SectionWrapper>
  );
}
