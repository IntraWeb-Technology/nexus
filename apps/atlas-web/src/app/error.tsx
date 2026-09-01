"use client";

import { useEffect } from "react";
import { StatePanel } from "@/components/editorial/state-panel";
import { contentUnavailableSurface } from "@/content/resilience";

type AtlasErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Story-First content-unavailable surface for CMS / render failures
 * (Figma 702:223). Does not expose URLs, tokens, stack traces, or bodies.
 */
export default function AtlasError({ error, reset }: AtlasErrorProps) {
  useEffect(() => {
    console.error("Atlas page error", error.digest ?? "unknown");
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <StatePanel data={contentUnavailableSurface} onRetry={reset} />
    </main>
  );
}
