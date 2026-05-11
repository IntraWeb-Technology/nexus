import type { ReactNode } from "react";

export function AboutSection({
  id,
  "aria-labelledby": ariaLabelledby,
  children,
  className = "",
  variant = "default",
}: {
  id?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
  className?: string;
  /** Subtle alternate band for vertical rhythm */
  variant?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`about-section border-b border-[color:var(--about-border)] last:border-b-0 ${variant === "muted" ? "about-section--muted" : ""} ${className}`}
    >
      <div className="about-container mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-[4.5rem] lg:py-[5.25rem]">{children}</div>
    </section>
  );
}
