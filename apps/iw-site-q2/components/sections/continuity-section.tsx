import { SectionWrapper } from '@/components/layout/SectionWrapper';

const CONTINUITY_COPY = {
  opening:
    'The operation should not become fragile again the moment people get busy.',
  body: 'The systems that stabilize the work should continue running after the initial fixes are in place. Monitoring, routing, reporting, escalation, follow-through — these are not one-time deliverables. They are ongoing operational conditions.',
  closing:
    'When the infrastructure is working correctly, the company stops depending on memory, availability, and manual coordination to stay aligned.',
} as const;

export function ContinuitySection() {
  return (
    <SectionWrapper id="continuity" spacing="continuity">
      <div className="container">
        <div style={{ maxWidth: '62ch' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
              fontSize: 'clamp(1.1rem, 1.4vw, 1.3rem)',
              fontWeight: 500,
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              color: 'var(--color-fg-primary)',
              marginBottom: '1.25em',
              marginTop: 0,
            }}
          >
            {CONTINUITY_COPY.opening}
          </p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--iw-fg-1)',
              marginBottom: '1em',
              marginTop: 0,
            }}
          >
            {CONTINUITY_COPY.body}
          </p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--iw-fg-1)',
              margin: 0,
            }}
          >
            {CONTINUITY_COPY.closing}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
