import Link from "next/link";

export type EvidenceKind =
  | "ci"
  | "deploy"
  | "test"
  | "coverage"
  | "performance"
  | "a11y"
  | "repository"
  | "documentation";

type EvidenceBlockProps = {
  kind: EvidenceKind;
  title: string;
  /** Explicit status text — never rely on color alone. */
  status: string;
  meta: Array<{ label: string; value: string }>;
  href?: string;
  hrefLabel?: string;
  className?: string;
};

const kindLabel: Record<EvidenceKind, string> = {
  ci: "CI",
  deploy: "DEPLOY",
  test: "TEST",
  coverage: "COVERAGE",
  performance: "PERFORMANCE",
  a11y: "ACCESSIBILITY",
  repository: "REPOSITORY",
  documentation: "DOCUMENTATION",
};

/**
 * Engineering evidence block — proof over decoration (Build Manifest / Page 26).
 * Status is always textual; sage accent marks the evidence plane, not pass/fail alone.
 */
export function EvidenceBlock({
  kind,
  title,
  status,
  meta,
  href,
  hrefLabel,
  className = "",
}: EvidenceBlockProps) {
  return (
    <aside
      className={`border border-atlas-border bg-atlas-elevated ${className}`.trim()}
      aria-label={`${kindLabel[kind]} evidence`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-atlas-border px-4 py-3">
        <p className="m-0 font-mono text-[10px] font-medium tracking-[0.14em] text-atlas-sage uppercase">
          {kindLabel[kind]}
        </p>
        <p className="m-0 font-mono text-[11px] text-atlas-ink">{status}</p>
      </div>

      <div className="space-y-4 px-4 py-4">
        <p className="m-0 font-sans text-sm font-semibold text-atlas-ink">
          {title}
        </p>

        <dl className="m-0 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="m-0 font-sans text-[10px] font-medium tracking-[0.14em] text-atlas-umber uppercase">
                {item.label}
              </dt>
              <dd className="m-0 font-mono text-xs leading-5 text-atlas-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {href ? (
          <p className="m-0">
            <Link
              href={href}
              className="font-sans text-[13px] font-medium text-atlas-umber no-underline"
            >
              {hrefLabel ?? "View evidence →"}
            </Link>
          </p>
        ) : null}
      </div>
    </aside>
  );
}
