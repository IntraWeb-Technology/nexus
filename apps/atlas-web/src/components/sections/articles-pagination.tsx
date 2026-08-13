import Link from "next/link";
import type { ArticlesPagination } from "@/content/article";

type ArticlesPaginationProps = {
  data: ArticlesPagination;
};

/**
 * Centered archive pagination — accessible nav with aria-current on the current page.
 */
export function ArticlesPaginationNav({ data }: ArticlesPaginationProps) {
  return (
    <nav
      aria-label={data.label}
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x border-t border-atlas-border py-6 tablet:py-7 desktop:py-8">
        <p className="m-0 mb-4 text-center font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
          {data.label}
        </p>

        <div className="flex items-center justify-between gap-3">
          {data.newerHref ? (
            <Link
              href={data.newerHref}
              className="font-sans text-sm text-atlas-body no-underline"
            >
              ← Newer
            </Link>
          ) : (
            <span className="font-sans text-sm text-atlas-muted" aria-disabled="true">
              ← Newer
            </span>
          )}

          <ul className="m-0 flex list-none items-center gap-1.5 p-0">
            {data.pages.map((page) => {
              const current = page === data.currentPage;
              return (
                <li key={page}>
                  <Link
                    href={current ? "#" : `?page=${page}`}
                    aria-label={`Page ${page}`}
                    aria-current={current ? "page" : undefined}
                    className={
                      current
                        ? "flex size-[34px] items-center justify-center rounded-full border border-atlas-umber bg-atlas-umber font-sans text-xs font-medium text-atlas-paper no-underline"
                        : "flex size-[34px] items-center justify-center rounded-full border border-atlas-border bg-atlas-paper font-sans text-xs font-medium text-atlas-ink no-underline"
                    }
                  >
                    {page}
                  </Link>
                </li>
              );
            })}
          </ul>

          {data.olderHref ? (
            <Link
              href={data.olderHref}
              className="font-sans text-sm font-semibold text-atlas-umber no-underline"
            >
              Older →
            </Link>
          ) : (
            <span className="font-sans text-sm text-atlas-muted" aria-disabled="true">
              Older →
            </span>
          )}
        </div>

        <p className="m-0 mt-4 text-center font-sans text-sm text-atlas-body">
          Page {data.currentPage} of {data.totalPages}
        </p>
      </div>
    </nav>
  );
}
