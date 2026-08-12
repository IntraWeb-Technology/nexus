import type { AboutPage } from "@repo/strapi-client";
import type { AboutFixture } from "@/content/about";

/** CMS AboutPage → AboutFixture domain model. */
export function assembleAbout(about: AboutPage): AboutFixture {
  const bridge = about.contactBridge;

  return {
    seo: {
      title: about.seo.metaTitle ?? "About",
      description: about.seo.metaDescription ?? "",
    },
    opening: {
      chapter: about.opening.chapter,
      title: about.opening.title,
      deck: about.opening.deck,
      deckCondensed: about.opening.deckCondensed ?? about.opening.deck,
      meta: about.opening.meta ?? "",
      metaCondensed: about.opening.metaCondensed ?? "",
      marginNote: {
        label: about.opening.marginNoteLabel ?? "MARGIN NOTE",
        body: about.opening.marginNoteBody ?? "",
      },
    },
    philosophy: {
      chapter: about.philosophy.chapter,
      quote: about.philosophy.quote,
      quoteCondensed: about.philosophy.quoteCondensed ?? about.philosophy.quote,
      attribution: about.philosophy.attribution ?? "",
      body: about.philosophy.body,
    },
    approach: {
      chapter: about.approach.chapter,
      chapterCondensed: about.approach.chapterCondensed ?? about.approach.chapter,
      title: about.approach.title,
      body: about.approach.body,
      bodyCondensed: about.approach.bodyCondensed ?? about.approach.body,
      stages: about.approach.stages,
      figureCaption: about.approach.figureCaption ?? "",
    },
    style: {
      chapter: about.style.chapter,
      title: about.style.title,
      items: about.style.items,
    },
    principles: {
      chapter: about.principles.chapter,
      title: about.principles.title,
      items: about.principles.items,
    },
    timeline: {
      chapter: about.timeline.chapter,
      title: about.timeline.title,
      entries: about.timeline.entries,
    },
    focus: {
      chapter: about.focus.chapter,
      title: about.focus.title,
      body: about.focus.body,
      bodyCondensed: about.focus.bodyCondensed ?? about.focus.body,
      statusLabel: about.focus.statusLabel ?? "STATUS",
      status: about.focus.status ?? "",
      themesLabel: about.focus.themesLabel ?? "Themes",
      themes: about.focus.themes ?? "",
    },
    reading: {
      chapter: about.reading.chapter,
      title: about.reading.title,
      items: about.reading.items,
    },
    architecture: {
      chapter: about.architecture.chapter,
      title: about.architecture.title,
      body: about.architecture.body,
      layers: about.architecture.layers,
      figureCaption: about.architecture.figureCaption ?? "",
    },
    notes: {
      chapter: about.notes.chapter,
      pullQuote: about.notes.pullQuote,
      body: about.notes.body,
      bodyCondensed: about.notes.bodyCondensed ?? about.notes.body,
    },
    contact: {
      chapter: bridge.chapter,
      title: bridge.title ?? "A conversation, not a pitch.",
      body: bridge.body ?? "",
      bodyCondensed: bridge.bodyCompact ?? bridge.body ?? "",
      cta: bridge.cta ?? { label: "Start a conversation", href: "/contact" },
      meta: bridge.meta ?? "",
    },
  };
}
