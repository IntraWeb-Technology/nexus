/**
 * RSC request-path editorial figure for Articles (PA-ART1).
 * Derived from the frozen RSC article narrative — not decorative filler.
 */

type RscNode = {
  id: string;
  label: string;
  detail: string;
  emphasis?: boolean;
};

const PATH: RscNode[] = [
  { id: "R-01", label: "Request", detail: "App Router", emphasis: true },
  { id: "R-02", label: "RSC tree", detail: "server composition" },
  { id: "R-03", label: "Cache tags", detail: "revalidate later" },
  { id: "R-04", label: "Streamed HTML", detail: "islands remain", emphasis: true },
];

function Node({ node }: { node: RscNode }) {
  const border = node.emphasis ? "border-atlas-sage" : "border-atlas-ink";
  const idColor = node.emphasis ? "text-atlas-sage" : "text-atlas-body";
  return (
    <div
      className={`flex min-w-[8.5rem] flex-col justify-center gap-0.5 rounded-[2px] border-[1.5px] bg-atlas-elevated px-3 py-2.5 ${border}`}
    >
      <p className={`m-0 font-mono text-[10px] ${idColor}`}>{node.id}</p>
      <p className="m-0 font-sans text-xs text-atlas-ink">{node.label}</p>
      <p className="m-0 font-sans text-[10px] text-atlas-body">{node.detail}</p>
    </div>
  );
}

type RscRequestPathDiagramProps = {
  caption: string;
  captionCompact?: string;
};

export function RscRequestPathDiagram({
  caption,
  captionCompact,
}: RscRequestPathDiagramProps) {
  return (
    <figure>
      <div className="hidden items-center justify-center gap-3 border border-atlas-border bg-atlas-secondary px-6 py-10 desktop:flex">
        {PATH.map((node, i) => (
          <div key={node.id} className="flex items-center gap-3">
            {i > 0 ? (
              <div
                className={`h-0.5 w-8 shrink-0 ${
                  PATH[i - 1]?.emphasis && node.emphasis
                    ? "bg-atlas-sage"
                    : "bg-atlas-ink"
                }`}
                aria-hidden="true"
              />
            ) : null}
            <Node node={node} />
          </div>
        ))}
      </div>

      <div className="hidden flex-wrap justify-center gap-2 border border-atlas-border bg-atlas-secondary px-4 py-7 tablet:flex desktop:hidden">
        {PATH.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </div>

      <div className="flex flex-col gap-2 border border-atlas-border bg-atlas-secondary px-4 py-5 tablet:hidden">
        {PATH.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </div>

      <figcaption className="mt-3 font-sans text-xs leading-normal text-atlas-body">
        <span className="tablet:hidden">{captionCompact ?? caption}</span>
        <span className="hidden tablet:inline">{caption}</span>
      </figcaption>
    </figure>
  );
}
