import type { CSSProperties } from 'react';

const PILLARS = [
  {
    variant: 'memory' as const,
    condition: 'The process depends on memory.',
    description: 'Someone knows what happens next, but the system does not.',
  },
  {
    variant: 'handoff' as const,
    condition: 'The handoff depends on availability.',
    description: 'Work moves when the right person notices, replies, or checks.',
  },
  {
    variant: 'assembly' as const,
    condition: 'The report depends on assembly.',
    description: 'The number exists only after someone gathers it from the places it lives.',
  },
] as const;

type PillarVariant = (typeof PILLARS)[number]['variant'];

const CARD_BG = 'rgba(14, 20, 30, 0.72)';
const ACCENT = '#ff8c00';
const LINE_MUTED = 'rgba(141, 154, 167, 0.55)';
const LINE_SLATE = 'rgba(51, 72, 92, 0.85)';

function cardShellStyle(variant: PillarVariant): CSSProperties {
  if (variant === 'memory') {
    return {
      background: CARD_BG,
      border: '1px dashed rgba(255, 255, 255, 0.14)',
      borderRadius: 0,
    };
  }

  return {
    background: CARD_BG,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  };
}

function accentRailStyle(variant: PillarVariant): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 2,
    borderRadius: 1,
  };

  if (variant === 'assembly') {
    return {
      ...base,
      background: `linear-gradient(to bottom, ${ACCENT} 0%, ${ACCENT} 42%, ${LINE_MUTED} 42%, ${LINE_MUTED} 100%)`,
    };
  }

  if (variant === 'handoff') {
    return {
      ...base,
      background: `linear-gradient(to bottom, ${LINE_SLATE} 0%, ${LINE_SLATE} 46%, ${LINE_MUTED} 46%, ${LINE_MUTED} 100%)`,
    };
  }

  return {
    ...base,
    background: LINE_MUTED,
  };
}

function separatorStyle(variant: PillarVariant): CSSProperties {
  return {
    width: 28,
    height: 1,
    margin: '0.85em 0 0.95em',
    background: variant === 'assembly' ? ACCENT : LINE_MUTED,
  };
}

function PillarCard({
  variant,
  condition,
  description,
  className,
}: {
  variant: PillarVariant;
  condition: string;
  description: string;
  className?: string;
}) {
  return (
    <article className={className} style={{ ...cardShellStyle(variant), padding: 'clamp(1.35rem, 2.2vw, 1.85rem)' }}>
      {variant === 'memory' ? (
        <div
          aria-hidden
          style={{
            width: 22,
            height: 2,
            marginBottom: '1.1rem',
            background: ACCENT,
            borderRadius: 1,
          }}
        />
      ) : null}

      <div style={{ position: 'relative', paddingLeft: '1.15rem' }}>
        <div aria-hidden style={accentRailStyle(variant)} />

        <p
          style={{
            fontFamily: 'var(--font-dm-sans), var(--iw-display), sans-serif',
            fontSize: 'clamp(1.05rem, 1.35vw, 1.25rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: 'var(--color-fg-primary)',
            margin: 0,
          }}
        >
          {condition}
        </p>

        <div aria-hidden style={separatorStyle(variant)} />

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
    </article>
  );
}

export function ArgumentPillarsGrid() {
  const [memory, handoff, assembly] = PILLARS;

  return (
    <div
      id="pillars"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6"
    >
      <PillarCard
        {...memory}
        className="md:row-span-2 md:flex md:flex-col md:justify-center"
      />
      <PillarCard {...handoff} />
      <PillarCard {...assembly} />
    </div>
  );
}
