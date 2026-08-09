import { Figure } from "@/components/editorial/figure";
import type { CaseFigure } from "@/content/case-study";

type CaseHeroArtifactProps = {
  figure: CaseFigure;
};

export function CaseHeroArtifact({ figure }: CaseHeroArtifactProps) {
  return (
    <div className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] pb-6 tablet:pb-8 desktop:px-12 desktop:pb-6">
      <Figure
        tone={figure.tone}
        alt={figure.alt}
        caption={figure.caption}
        label={figure.label}
        panels
        className="hidden desktop:block"
        mediaClassName="min-h-[640px] w-full"
      />
      <Figure
        tone={figure.tone}
        alt={figure.alt}
        caption={figure.captionShort ?? figure.caption}
        label={figure.label}
        className="hidden tablet:block desktop:hidden"
        mediaClassName="min-h-[360px] w-full"
      />
      <Figure
        tone={figure.tone}
        alt={figure.alt}
        caption={figure.captionShort ?? figure.caption}
        label="IMG"
        className="tablet:hidden"
        mediaClassName="min-h-[220px] w-full"
      />
    </div>
  );
}
