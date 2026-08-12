import { Figure } from "@/components/editorial/figure";
import type { CaseFigure } from "@/content/case-study";

type CaseHeroArtifactProps = {
  figure: CaseFigure;
};

export function CaseHeroArtifact({ figure }: CaseHeroArtifactProps) {
  const shared = {
    tone: figure.tone,
    alt: figure.alt,
    src: figure.src,
    width: figure.width,
    height: figure.height,
    sizes: figure.sizes,
    priority: figure.priority,
  };

  return (
    <div className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] pb-6 tablet:pb-8 desktop:px-12 desktop:pb-6">
      <Figure
        {...shared}
        caption={figure.caption}
        className="hidden desktop:block"
        mediaClassName="min-h-[640px] w-full"
      />
      <Figure
        {...shared}
        src={
          figure.src?.replace("-desktop.webp", "-tablet.webp") ?? figure.src
        }
        width={1536}
        height={864}
        sizes="100vw"
        caption={figure.captionShort ?? figure.caption}
        className="hidden tablet:block desktop:hidden"
        mediaClassName="min-h-[360px] w-full"
      />
      <Figure
        {...shared}
        src={
          figure.src?.replace("-desktop.webp", "-mobile.webp") ?? figure.src
        }
        width={780}
        height={520}
        sizes="100vw"
        caption={figure.captionShort ?? figure.caption}
        className="tablet:hidden"
        mediaClassName="min-h-[220px] w-full"
      />
    </div>
  );
}
