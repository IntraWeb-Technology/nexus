"use client";

import { AppLink } from "@/components/chrome/app-link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { DocsCategoryCard, DocsIndexFixture } from "@/content/doc";

type DocsCategoriesProps = {
  data: DocsIndexFixture["categories"];
  /** Optional fixture-backed filter query from DocsSearch. */
  filterQuery?: string;
};

function matchesQuery(card: DocsCategoryCard, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    card.title.toLowerCase().includes(q) ||
    card.description.toLowerCase().includes(q)
  );
}

function CategoryCard({ card }: { card: DocsCategoryCard }) {
  return (
    <AppLink
      href={card.href}
      className="flex flex-col gap-2 rounded-[2px] border border-atlas-border bg-atlas-elevated px-4 py-[18px] no-underline"
    >
      <p className="m-0 font-mono text-[10px] font-medium text-atlas-sage">
        {card.eyebrow}
      </p>
      <p className="m-0 font-sans text-[15px] leading-5 font-semibold text-atlas-ink">
        {card.title}
      </p>
      <p className="m-0 font-sans text-[13px] leading-[18px] text-atlas-body">
        {card.description}
      </p>
    </AppLink>
  );
}

function CategoryRowMobile({ card }: { card: DocsCategoryCard }) {
  return (
    <li className="border-t border-atlas-border">
      <AppLink href={card.href} className="block space-y-1 py-3.5 no-underline">
        <p className="m-0 font-sans text-sm leading-[18px] font-semibold text-atlas-ink">
          {card.title}
        </p>
        <p className="m-0 font-sans text-[13px] leading-[18px] text-atlas-body">
          {card.description}
        </p>
      </AppLink>
    </li>
  );
}

/**
 * Category-driven IA grid (desktop/tablet cards; mobile list).
 * Distinct from Articles newest-first list.
 */
export function DocsCategories({ data, filterQuery = "" }: DocsCategoriesProps) {
  const items = data.items.filter((card) => matchesQuery(card, filterQuery));

  return (
    <section
      aria-labelledby="docs-categories-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x pt-4 pb-10">
        <ChapterMarker className="mb-4">{data.chapter}</ChapterMarker>
        <h2 id="docs-categories-title" className="sr-only">
          Categories
        </h2>

        {/* Desktop + tablet: 4-column / wrapping card grid */}
        <ul className="m-0 hidden list-none grid-cols-2 gap-4 p-0 tablet:grid desktop:grid-cols-4">
          {items.map((card) => (
            <li key={card.id}>
              <CategoryCard card={card} />
            </li>
          ))}
        </ul>

        {/* Mobile: stacked rows */}
        <ul className="m-0 list-none p-0 tablet:hidden">
          {items.map((card) => (
            <CategoryRowMobile key={card.id} card={card} />
          ))}
        </ul>

        {items.length === 0 ? (
          <p className="m-0 font-sans text-sm text-atlas-body">
            No categories match that filter.
          </p>
        ) : null}
      </div>
    </section>
  );
}
