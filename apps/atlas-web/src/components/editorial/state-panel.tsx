import Link from "next/link";
import {
  atlasStoryPrimaryButtonClassName,
  atlasStorySecondaryButtonClassName,
} from "@/components/editorial/atlas-button";
import type { ResilienceSurface } from "@/content/resilience";

type StatePanelProps = {
  data: ResilienceSurface;
  /** Optional retry control for content-unavailable (error boundary). */
  onRetry?: () => void;
};

/**
 * Story-First empty/error state panel (Figma 705:100 + resilience pages).
 * Desktop: split column + warm panel. Mobile: stacked with large display first.
 */
export function StatePanel({ data, onRetry }: StatePanelProps) {
  const pathStyle = data.pathStyle ?? "nav";

  return (
    <section
      aria-labelledby="resilience-title"
      className="border-b border-atlas-border bg-atlas-elevated"
    >
      <div className="mx-auto grid max-w-[var(--atlas-page)] desktop:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        <div className="atlas-pad-x flex flex-col gap-5 bg-atlas-elevated py-12 tablet:gap-6 tablet:py-16 desktop:py-[7.5rem]">
          {/* Mobile/tablet: large display marker first (Figma mobile 404) */}
          <p
            className="m-0 font-display text-[4rem] leading-none font-semibold text-atlas-rust-ink desktop:hidden"
            aria-hidden="true"
          >
            {data.display}
          </p>

          <p className="m-0 hidden font-display text-[11px] font-semibold tracking-[0.08em] text-atlas-rust-ink uppercase desktop:block">
            {data.marker}
          </p>
          <h1
            id="resilience-title"
            className="m-0 max-w-[27.5rem] font-display text-[1.6875rem] leading-tight font-semibold text-atlas-ink tablet:text-[2.75rem]"
          >
            {data.title}
          </h1>
          <p className="m-0 max-w-[26.25rem] font-sans text-sm leading-[1.55] text-atlas-umber tablet:text-base">
            {data.body}
          </p>
          <div className="mt-2 flex flex-col gap-3 tablet:mt-4 tablet:flex-row tablet:flex-wrap tablet:items-start">
            <Link
              href={data.primary.href}
              className={`${atlasStoryPrimaryButtonClassName} w-full justify-center tablet:w-auto`}
            >
              {data.primary.label}
            </Link>
            <Link
              href={data.secondary.href}
              className={`${atlasStorySecondaryButtonClassName} w-full justify-center tablet:w-auto`}
            >
              {data.secondary.label}
            </Link>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className={`${atlasStorySecondaryButtonClassName} w-full justify-center tablet:w-auto`}
              >
                Try again
              </button>
            ) : null}
          </div>

          <div className="mt-8 border-t border-atlas-ink/20 pt-8 desktop:hidden">
            <PathList data={data} pathStyle={pathStyle} />
          </div>
        </div>

        <aside className="hidden bg-atlas-paper atlas-pad-x py-[7.5rem] desktop:block">
          <div className="flex max-w-[32.5rem] flex-col gap-6">
            <p
              className={`m-0 font-display font-semibold text-atlas-rust-ink ${
                data.display.length <= 3
                  ? "text-[7.375rem] leading-none"
                  : "text-[4.75rem] leading-none"
              }`}
              aria-hidden="true"
            >
              {data.display}
            </p>
            <div
              className="h-px w-full max-w-[32.5rem] bg-atlas-ink/20"
              aria-hidden="true"
            />
            <PathList data={data} pathStyle={pathStyle} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function PathList({
  data,
  pathStyle,
}: {
  data: ResilienceSurface;
  pathStyle: "nav" | "statement";
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
        {data.panelLabel}
      </p>
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
        {data.paths.map((path) => {
          if (pathStyle === "statement") {
            return (
              <li
                key={path.label}
                className="font-sans text-sm leading-[1.5] text-atlas-umber"
              >
                {path.label}
              </li>
            );
          }

          const line = (
            <>
              <span className="font-medium">{path.label}</span>
              {path.description ? ` — ${path.description}` : null}
            </>
          );

          return (
            <li key={`${path.label}-${path.href ?? path.description}`}>
              {path.href ? (
                <Link
                  href={path.href}
                  className="font-sans text-sm leading-[1.5] text-atlas-umber no-underline hover:text-atlas-ink"
                >
                  {line}
                </Link>
              ) : (
                <span className="font-sans text-sm leading-[1.5] text-atlas-umber">
                  {line}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
