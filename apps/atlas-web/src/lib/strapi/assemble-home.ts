import type { HomePage, Project } from "@repo/strapi-client";
import type { HomepageFixture } from "@/content/homepage";
import { homepageFixture } from "@/content/homepage";
import { siteChrome } from "@/content/chrome";
import { mediaFields } from "@/lib/strapi/media";
import { AtlasContentError } from "@/lib/strapi/errors";

function projectBySlug(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** CMS HomePage (+ projects for card media) → HomepageFixture domain model. */
export function assembleHomepage(
  home: HomePage,
  projects: Project[],
): HomepageFixture {
  const heroMedia = mediaFields(home.hero.media);
  const featuredMedia = mediaFields(home.featured.figure);
  const heroFallback = homepageFixture.hero;
  const featuredFallback = homepageFixture.featured;

  return {
    site: { key: "personal", name: "Atlas" },
    nav: {
      brand: { ...siteChrome.brand },
      links: [...siteChrome.navLinks],
    },
    hero: {
      mediaLabel: heroMedia.label ?? heroFallback.mediaLabel,
      mediaNote: home.hero.mediaNote ?? heroFallback.mediaNote,
      mediaAlt:
        heroMedia.alt ?? home.hero.media?.alt ?? heroFallback.mediaAlt,
      mediaSrc: heroMedia.src ?? heroFallback.mediaSrc,
      mediaWidth: heroMedia.width ?? heroFallback.mediaWidth,
      mediaHeight: heroMedia.height ?? heroFallback.mediaHeight,
      mediaSizes: heroMedia.sizes ?? heroFallback.mediaSizes,
      chapter: home.hero.chapter,
      title: home.hero.title,
      deck: home.hero.deck,
      primaryCta: {
        label: home.hero.primaryCta.label,
        href: home.hero.primaryCta.href,
      },
      secondaryCta: {
        label: home.hero.secondaryCta.label,
        href: home.hero.secondaryCta.href,
      },
    },
    featured: {
      chapter: home.featured.chapter,
      title: home.featured.title,
      meta: home.featured.meta ?? "",
      status: home.featured.status ?? "",
      figureAlt:
        featuredMedia.alt ??
        home.featured.figure?.alt ??
        featuredFallback.figureAlt,
      figureCaption: featuredMedia.caption ?? featuredFallback.figureCaption,
      figureSrc: featuredMedia.src ?? featuredFallback.figureSrc,
      figureWidth: featuredMedia.width ?? featuredFallback.figureWidth,
      figureHeight: featuredMedia.height ?? featuredFallback.figureHeight,
      figureSizes: featuredMedia.sizes ?? featuredFallback.figureSizes,
      problemLabel: home.featured.problemLabel,
      problem: home.featured.problem,
      outcomeLabel: home.featured.outcomeLabel,
      outcome: home.featured.outcome,
      highlightsLabel: home.featured.highlightsLabel ?? "",
      highlights: home.featured.highlights ?? [],
      cta: {
        label: home.featured.cta.label,
        href: home.featured.cta.href,
      },
    },
    selected: {
      chapter: "SELECTED WORK",
      headline: "Additional dimensions.",
      projects: home.selected.map((item) => {
        const slug = item.project.slug;
        const full = projectBySlug(projects, slug);
        const card = mediaFields(item.project.cardMedia ?? full?.cardMedia ?? null);
        return {
          id: slug,
          layout: item.layout,
          eyebrow: item.eyebrow ?? full?.category ?? "",
          title: item.project.name,
          outcome: item.outcome,
          href: `/work/${slug}`,
          ctaLabel: item.ctaLabel ?? full?.ctaLabel ?? "View →",
          mediaAlt: card.alt,
          mediaSrc: card.src,
          mediaWidth: card.width,
          mediaHeight: card.height,
          mediaSizes: card.sizes,
        };
      }),
    },
    philosophy: {
      chapter: home.philosophy.chapter,
      quote: home.philosophy.quote,
      diagramCaption: home.philosophy.diagramCaption ?? "",
      stages: home.philosophy.stages,
      principles: home.philosophy.principles.map((p) => ({
        title: p.title,
        body: p.body,
      })),
    },
    writing: {
      chapter: home.writingChapter,
      items: home.writingItems.map((item) => ({
        title: item.article.title,
        note: item.note,
        href: `/articles/${item.article.slug}`,
      })),
    },
    about: {
      chapter: home.aboutTeaser.chapter,
      summary: home.aboutTeaser.summary ?? home.aboutTeaser.body ?? "",
      href: home.aboutTeaser.href ?? home.aboutTeaser.cta?.href ?? "/about",
      ctaLabel:
        home.aboutTeaser.ctaLabel ?? home.aboutTeaser.cta?.label ?? "About →",
    },
    contact: {
      chapter: home.contactBridge.chapter,
      title: home.contactBridge.title ?? "",
      body: home.contactBridge.body ?? "",
      cta: {
        label: home.contactBridge.cta?.label ?? "Start a conversation",
        href: home.contactBridge.cta?.href ?? "/contact",
      },
      meta: home.contactBridge.meta ?? "",
    },
    footer: {
      links: [...siteChrome.footerLinks],
      mark: siteChrome.mark,
    },
  };
}

export function requireHomePage(home: HomePage | null): HomePage {
  if (!home) {
    throw new AtlasContentError(
      "SINGLETON_MISSING",
      "Home page singleton missing for site key personal",
    );
  }
  return home;
}
