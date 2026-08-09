type EditorialTableRow = {
  id: string;
  label: string;
  body: string;
};

type EditorialTableProps = {
  rows: EditorialTableRow[];
  /** Mono/tracked labels (lessons) vs semibold title labels (constraints) */
  labelStyle?: "title" | "meta";
  className?: string;
};

/**
 * Two-column editorial matrix — hairline rows, stack on narrow viewports.
 */
export function EditorialTable({
  rows,
  labelStyle = "title",
  className = "",
}: EditorialTableProps) {
  const labelClass =
    labelStyle === "meta"
      ? "font-sans text-[11px] font-medium tracking-[0.16em] text-atlas-umber uppercase"
      : "font-sans text-sm font-semibold text-atlas-ink";

  return (
    <div className={className}>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid gap-3 border-t border-atlas-border py-5 tablet:grid-cols-[11rem_1fr] tablet:gap-8 tablet:py-[22px] desktop:grid-cols-[11.25rem_1fr]"
        >
          <p className={`m-0 ${labelClass}`}>{row.label}</p>
          <p className="m-0 font-sans text-[15px] leading-[23px] text-atlas-body">
            {row.body}
          </p>
        </div>
      ))}
      <div className="h-px bg-atlas-border" aria-hidden="true" />
    </div>
  );
}
