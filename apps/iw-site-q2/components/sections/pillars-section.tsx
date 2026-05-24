import { SectionWrapper } from '@/components/layout/SectionWrapper';

const PILLARS = [
  {
    condition: 'The process depends on memory.',
    description: 'Someone knows what happens next, but the system does not.',
  },
  {
    condition: 'The handoff depends on availability.',
    description: 'Work moves when the right person notices, replies, or checks.',
  },
  {
    condition: 'The report depends on assembly.',
    description: 'The number exists only after someone gathers it from the places it lives.',
  },
] as const;

function PillarItem({
  condition,
  description,
}: {
  condition: string;
  description: string;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
          fontSize: 'clamp(1.05rem, 1.3vw, 1.2rem)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: 'var(--color-fg-primary)',
          marginBottom: '0.6em',
        }}
      >
        {condition}
      </p>
      <p
        style={{
          fontSize: 'clamp(0.9rem, 1.05vw, 1rem)',
          fontWeight: 400,
          lineHeight: 1.6,
          color: 'var(--iw-fg-2)',
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export function PillarsSection() {
  return (
    <SectionWrapper id="pillars" spacing="pillars">
      <div
        className="container"
        style={{
          paddingTop: 'var(--spacing-pillars)',
          paddingBottom: 'var(--spacing-pillars)',
        }}
      >
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-3 lg:gap-8">
          {PILLARS.map((pillar, i) => (
            <PillarItem key={i} {...pillar} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
