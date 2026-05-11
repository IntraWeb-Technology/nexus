const ROWS: readonly [string, string][] = [
  [
    "Scope is defined before the operational environment is understood.",
    "Diagnostic precedes scope. The operational environment determines what gets built.",
  ],
  [
    "Recommendations are delivered for the client to implement.",
    "Running infrastructure is delivered. The client owns working systems, not a framework.",
  ],
  ["AI is added onto existing workflows.", "AI is designed into operational infrastructure from the start."],
  ["The engagement ends at delivery.", "Operational continuity is built into the relationship."],
];

export function ComparisonTable() {
  return (
    <div className="about-compare overflow-hidden rounded-[4px] border border-[color:var(--about-border)] shadow-[var(--about-shadow-sm)]">
      <div className="overflow-x-auto">
        <table className="about-compare__table w-full min-w-[540px] border-collapse text-left text-[14px] leading-snug md:text-[15px]">
          <thead>
            <tr className="border-b border-[color:var(--about-border)] bg-[color:var(--about-surface-muted)]">
              <th
                scope="col"
                className="px-4 py-3.5 font-semibold tracking-[-0.01em] text-[color:var(--about-text)] md:px-5 md:py-4"
              >
                Most engagements
              </th>
              <th
                scope="col"
                className="border-l border-[color:var(--about-border)] bg-[color:var(--about-surface-elevated)] px-4 py-3.5 font-semibold tracking-[-0.01em] text-[color:var(--about-text)] md:px-5 md:py-4"
              >
                IntraWeb engagements
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([most, intra], i) => (
              <tr
                key={i}
                className={`border-b border-[color:var(--about-border-inner)] last:border-b-0 ${i % 2 === 1 ? "bg-[color:var(--about-row-alt)]" : ""}`}
              >
                <td className="align-top px-4 py-4 text-[color:var(--about-text-secondary)] md:px-5 md:py-[1.125rem]">
                  {most}
                </td>
                <td className="border-l border-[color:var(--about-border-inner)] bg-[color:var(--about-surface)] align-top px-4 py-4 text-[color:var(--about-text-secondary)] md:px-5 md:py-[1.125rem]">
                  {intra}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
