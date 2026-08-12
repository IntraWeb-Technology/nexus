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
 * Used by case-study sections (Constraints / Delivery / Lessons).
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

type EditorialDataTableProps = {
  caption: string;
  columns: string[];
  rows: Array<{ id: string; cells: string[] }>;
  className?: string;
};

/**
 * Semantic comparison table for Articles / Docs publishing.
 * Overflow stays on the table region — never the page.
 */
export function EditorialDataTable({
  caption,
  columns,
  rows,
  className = "",
}: EditorialDataTableProps) {
  return (
    <figure className={`m-0 ${className}`.trim()}>
      <figcaption className="mb-3 font-sans text-xs text-atlas-body">
        {caption}
      </figcaption>
      <div
        tabIndex={0}
        role="region"
        aria-label={caption}
        className="overflow-x-auto border border-atlas-border"
      >
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-atlas-border bg-atlas-elevated">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 font-sans text-[10px] font-medium tracking-[0.14em] text-atlas-umber uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-atlas-border last:border-b-0">
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.id}-${index}`}
                    className={`px-4 py-3 align-top font-sans text-sm leading-5 text-atlas-body ${
                      index === 0 ? "font-medium text-atlas-ink" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
