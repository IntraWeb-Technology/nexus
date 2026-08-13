"use client";

import { useState } from "react";
import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesTopicRowProps = {
  data: ArticlesIndexFixture["topics"];
};

/**
 * Interactive topic chips — selected state is visual-only for M9D.
 * Filtering against CMS taxonomy waits for a later milestone.
 */
export function ArticlesTopicRow({ data }: ArticlesTopicRowProps) {
  const defaultId =
    data.items.find((item) => item.active)?.id ?? data.items[0]?.id ?? "all";
  const [selectedId, setSelectedId] = useState(defaultId);

  return (
    <section
      aria-label="Topics"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-3 pt-2 pb-6 tablet:pb-5 desktop:pb-8">
        <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
          {data.label}
        </p>

        <div
          role="group"
          aria-label="Filter by topic"
          className="flex flex-wrap gap-2"
        >
          {data.items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                aria-current={selected ? "true" : undefined}
                onClick={() => setSelectedId(item.id)}
                className={
                  selected
                    ? "rounded-full border border-atlas-umber bg-atlas-umber px-3.5 py-1.5 font-sans text-xs font-medium text-atlas-paper"
                    : "rounded-full border border-atlas-border bg-atlas-paper px-3.5 py-1.5 font-sans text-xs font-medium text-atlas-ink"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
