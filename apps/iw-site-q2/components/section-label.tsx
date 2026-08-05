import type { ReactNode } from "react";

/** Small label above major sections — prototype: mono + teal when accent. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`section-label section-label--accent ${className}`.trim()}>{children}</p>;
}
