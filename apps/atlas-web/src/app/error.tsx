"use client";

import { useEffect } from "react";

type AtlasErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Restrained runtime error surface for content or render failures.
 * Does not expose URLs, tokens, stack traces, or response bodies.
 */
export default function AtlasError({ error, reset }: AtlasErrorProps) {
  useEffect(() => {
    console.error("Atlas page error", error.digest ?? "unknown");
  }, [error]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto max-w-[var(--atlas-page)] outline-none atlas-pad-x py-16 tablet:py-20 desktop:py-24"
    >
      <div className="mx-auto max-w-[36rem] space-y-4 text-center">
        <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
          Unavailable
        </p>
        <h1 className="m-0 font-display text-2xl font-semibold text-atlas-ink">
          This page could not be loaded
        </h1>
        <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
          Content is temporarily unavailable. If you manage this site, confirm
          the configured content source and CMS reachability, then try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-2 inline-flex items-center justify-center rounded-[2px] border border-atlas-umber bg-atlas-umber px-4 py-2.5 font-sans text-sm font-medium text-atlas-paper"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
