import type { CSSProperties } from 'react';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { SectionReveal } from '@/components/motion/section-reveal';
import { SECTION_GRADIENT_SEAM } from '@/lib/section-seam';

const TERRITORIES = [
  {
    title: 'Product Engineering',
    description: 'From design or partial build to working software.',
    offset: 'md:max-w-[28rem]',
  },
  {
    title: 'Systems Integration',
    description: 'Connect the tools and software that need to work together.',
    offset: 'md:ml-10 md:max-w-[30rem] lg:ml-16',
  },
  {
    title: 'Modernization & Rescue',
    description: 'Fix software that has become hard to change, maintain, or finish.',
    offset: 'md:ml-4 md:max-w-[32rem] lg:ml-8',
  },
  {
    title: 'Automation & AI',
    description: 'Use automation or AI where it removes repetitive steps or adds useful capability.',
    offset: 'md:ml-14 md:max-w-[31rem] lg:ml-20',
  },
  {
    title: 'Production Reliability',
    description: 'Make releases safer and software more dependable.',
    offset: 'md:ml-6 md:max-w-[28rem] lg:ml-12',
  },
] as const;

const ACCENT = '#ff8c00';
const LINE_MUTED = 'rgba(141, 154, 167, 0.45)';

function TerritoryRow({
  title,
  description,
  offset,
  index,
}: {
  title: string;
  description: string;
  offset: string;
  index: number;
}) {
  const railStyle: CSSProperties =
    index % 2 === 0
      ? {
          position: 'absolute',
          left: 0,
          top: 4,
          bottom: 4,
          width: 2,
          background: ACCENT,
          borderRadius: 1,
        }
      : {
          position: 'absolute',
          left: 0,
          top: 4,
          bottom: 4,
          width: 2,
          background: `linear-gradient(to bottom, ${LINE_MUTED} 0%, ${LINE_MUTED} 55%, ${ACCENT} 55%, ${ACCENT} 100%)`,
          borderRadius: 1,
        };

  return (
    <article className={offset} style={{ position: 'relative', paddingLeft: '1.15rem' }}>
      <div aria-hidden style={railStyle} />
      <h3
        style={{
          fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
          fontSize: 'clamp(1.1rem, 1.4vw, 1.3rem)',
          fontWeight: 650,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: '#ffffff',
          margin: '0 0 0.55rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)',
          fontWeight: 400,
          lineHeight: 1.6,
          color: 'var(--iw-fg-2)',
          margin: 0,
        }}
      >
        {description}
      </p>
    </article>
  );
}

/** Five overlapping capability territories — editorial stagger, not a service catalog. */
export function CapabilityTerritorySection() {
  return (
    <SectionWrapper id="pillars" spacing="pillars">
      <div
        className="container"
        style={{ paddingTop: 'var(--spacing-pillars)', paddingBottom: 'var(--spacing-pillars)' }}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-x-12 lg:items-start">
          <SectionReveal>
            <div>
              <h2
                id="capabilities-heading"
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: ACCENT,
                  fontWeight: 600,
                  margin: '0 0 0.75rem',
                }}
              >
                What we take on
              </h2>
            </div>
          </SectionReveal>

          <div
            id="capabilities"
            className="flex flex-col gap-8 md:gap-9"
            aria-labelledby="capabilities-heading"
          >
            {TERRITORIES.map((t, i) => (
              <TerritoryRow key={t.title} {...t} index={i} />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </SectionWrapper>
  );
}
