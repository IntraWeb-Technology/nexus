type CalloutProps = {
  variant?: "tradeoff" | "note" | "warning";
  title: string;
  children: React.ReactNode;
  className?: string;
};

const variantLabel: Record<NonNullable<CalloutProps["variant"]>, string> = {
  tradeoff: "TRADEOFF",
  note: "NOTE",
  warning: "WARNING",
};

/**
 * Editorial callout — tradeoff / note / warning.
 * Named publishing primitive (Build Manifest). Sage accent on tradeoff.
 */
export function Callout({
  variant = "tradeoff",
  title,
  children,
  className = "",
}: CalloutProps) {
  return (
    <aside
      className={`border border-atlas-border border-l-2 border-l-atlas-sage bg-atlas-elevated p-4 ${className}`.trim()}
      aria-label={variantLabel[variant]}
    >
      <p className="m-0 font-mono text-[10px] font-medium text-atlas-sage">
        {variantLabel[variant]}
      </p>
      <p className="mt-2 mb-0 font-sans text-sm font-semibold text-atlas-ink">
        {title}
      </p>
      <div className="mt-2 font-sans text-sm leading-[22px] text-atlas-body">
        {children}
      </div>
    </aside>
  );
}
