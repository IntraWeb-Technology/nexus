"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { DocsCategories } from "@/components/sections/docs-categories";
import { DocsProgressNote } from "@/components/sections/docs-progress-note";
import { formatArchiveDate } from "@/content/articles/summaries";
import type { DocSummary, DocsIndexFixture } from "@/content/doc";

type DocsLandingClientProps = {
  data: DocsIndexFixture;
};

function matchesDoc(doc: DocSummary, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    doc.title.toLowerCase().includes(q) ||
    doc.kind.toLowerCase().includes(q) ||
    doc.category.toLowerCase().includes(q) ||
    doc.excerpt.toLowerCase().includes(q)
  );
}

/**
 * Client island — search + filtered categories/recent rows.
 * Single state owner so the fixture-backed filter stays reliable.
 */
export function DocsLandingClient({ data }: DocsLandingClientProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const recentItems = data.recentlyUpdated.items.filter((doc) =>
    matchesDoc(doc, query),
  );

  return (
    <>
      <div className="mx-auto max-w-[var(--atlas-page)]">
        <div className="atlas-pad-x pt-5 pb-8 tablet:pt-5 tablet:pb-8 desktop:pt-5 desktop:pb-8">
          <label htmlFor={inputId} className="sr-only">
            Search documentation
          </label>
          <div className="flex items-center gap-3 rounded-[2px] border border-atlas-border bg-atlas-elevated px-4 py-3.5 text-atlas-body">
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={data.search.placeholder}
              autoComplete="off"
              className="m-0 w-full min-w-0 border-0 bg-transparent font-sans text-sm leading-[18px] text-atlas-ink outline-none placeholder:text-atlas-body [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 border-0 bg-transparent p-0 font-sans text-xs font-medium text-atlas-umber"
              >
                Clear
              </button>
            ) : (
              <kbd className="shrink-0 font-mono text-[11px] text-atlas-body">
                {data.search.shortcut}
              </kbd>
            )}
          </div>
        </div>
      </div>

      <DocsCategories data={data.categories} filterQuery={query} />

      <section
        id="recently-updated"
        aria-labelledby="docs-recent-title"
        className="mx-auto max-w-[var(--atlas-page)]"
      >
        <div className="atlas-pad-x pt-2 pb-10">
          <ChapterMarker className="mb-0">
            {data.recentlyUpdated.chapter}
          </ChapterMarker>
          <h2 id="docs-recent-title" className="sr-only">
            Recently updated
          </h2>

          <ul className="m-0 list-none p-0">
            {recentItems.map((doc) => (
              <li key={doc.id} className="border-t border-atlas-border">
                <Link
                  href={doc.href}
                  className="flex items-center gap-4 py-3.5 no-underline"
                >
                  <time
                    dateTime={doc.updatedDate}
                    className="w-[6.5rem] shrink-0 font-mono text-[11px] text-atlas-body"
                  >
                    {formatArchiveDate(doc.updatedDate)}
                  </time>
                  <span className="min-w-0 flex-1 font-sans text-sm leading-[18px] font-medium text-atlas-ink">
                    {doc.title}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[10px] text-atlas-sage tablet:inline">
                    {doc.kind}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {recentItems.length === 0 ? (
            <p className="m-0 border-t border-atlas-border pt-3.5 font-sans text-sm text-atlas-body">
              No handbook pages match that filter.
            </p>
          ) : null}
        </div>
      </section>

      <DocsProgressNote data={data.progressNote} />
    </>
  );
}
