"use client";

import { useEffect, useState } from "react";

/**
 * Sage reading progress under sticky nav. Client island — scroll only.
 */
export function ReadingProgress() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setValue(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pct = Math.round(value * 100);

  return (
    <div
      className="pointer-events-none sticky top-[var(--atlas-nav-h)] z-40 h-0.5 w-full bg-atlas-border/40"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className="h-full bg-atlas-sage transition-[width] duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
