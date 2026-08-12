/**
 * Atlas application boundary diagram for Documentation handbook (PA-DOC1).
 * Composed from real Nexus app edges — atlas-web, cms-strapi, atlas-docs.
 */

type BoundaryNode = {
  id: string;
  label: string;
  detail: string;
  emphasis?: boolean;
};

const NODES: BoundaryNode[] = [
  {
    id: "A-WEB",
    label: "atlas-web",
    detail: "public product surface",
    emphasis: true,
  },
  {
    id: "A-CMS",
    label: "cms-strapi",
    detail: "shared · site-keyed",
  },
  {
    id: "A-DOCS",
    label: "atlas-docs",
    detail: "product documentation",
  },
];

function Node({ node }: { node: BoundaryNode }) {
  const border = node.emphasis ? "border-atlas-sage" : "border-atlas-ink";
  const idColor = node.emphasis ? "text-atlas-sage" : "text-atlas-body";
  return (
    <div
      className={`flex min-w-[10rem] flex-col gap-0.5 rounded-[2px] border-[1.5px] bg-atlas-elevated px-3 py-2.5 ${border}`}
    >
      <p className={`m-0 font-mono text-[10px] ${idColor}`}>{node.id}</p>
      <p className="m-0 font-sans text-xs text-atlas-ink">{node.label}</p>
      <p className="m-0 font-sans text-[10px] text-atlas-body">{node.detail}</p>
    </div>
  );
}

type AtlasBoundaryDiagramProps = {
  caption: string;
  captionCompact?: string;
};

export function AtlasBoundaryDiagram({
  caption,
  captionCompact,
}: AtlasBoundaryDiagramProps) {
  return (
    <figure>
      <div className="hidden items-center justify-center gap-4 border border-atlas-border bg-atlas-secondary px-6 py-10 desktop:flex">
        {NODES.map((node, i) => (
          <div key={node.id} className="flex items-center gap-4">
            {i > 0 ? (
              <div className="h-0.5 w-10 shrink-0 bg-atlas-ink" aria-hidden="true" />
            ) : null}
            <Node node={node} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border border-atlas-border bg-atlas-secondary px-4 py-5 desktop:hidden">
        {NODES.map((node) => (
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
