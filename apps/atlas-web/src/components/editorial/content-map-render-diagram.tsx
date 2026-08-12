/**
 * Content → Map → Render workflow — composed from actual Atlas publishing architecture.
 * Stages: typed fixtures (content) → domain types (map) → RSC sections (render).
 * Diagram Language: 1.5px strokes, 2px radius, mono IDs, sage emphasis.
 */

type WorkflowNode = {
  id: string;
  label: string;
  detail: string;
  emphasis?: boolean;
};

const STAGE_A: WorkflowNode[] = [
  { id: "C-01", label: "Fixtures", detail: "content/*.ts", emphasis: true },
  { id: "C-02", label: "Domain types", detail: "case-study · article · doc" },
  { id: "C-03", label: "Registry", detail: "slug → fixture" },
];

const STAGE_B: WorkflowNode[] = [
  { id: "M-01", label: "Normalize", detail: "UI-ready shape", emphasis: true },
  { id: "M-02", label: "No CMS DTOs", detail: "boundary preserved" },
];

const STAGE_C: WorkflowNode[] = [
  { id: "R-01", label: "RSC page", detail: "app router", emphasis: true },
  { id: "R-02", label: "Sections", detail: "page-local" },
  { id: "R-03", label: "Primitives", detail: "Figure · Callout" },
];

function Node({
  node,
  compact = false,
}: {
  node: WorkflowNode;
  compact?: boolean;
}) {
  const border = node.emphasis ? "border-atlas-sage" : "border-atlas-ink";
  const idColor = node.emphasis ? "text-atlas-sage" : "text-atlas-body";
  return (
    <div
      className={`flex flex-col justify-center gap-0.5 rounded-[2px] border-[1.5px] bg-atlas-elevated ${border} ${
        compact ? "min-w-[7.5rem] px-2 py-2" : "min-w-[9rem] px-3 py-2.5"
      }`}
    >
      <p className={`m-0 font-mono text-[10px] ${idColor}`}>{node.id}</p>
      <p className="m-0 font-sans text-xs text-atlas-ink">{node.label}</p>
      <p className="m-0 font-sans text-[10px] text-atlas-body">{node.detail}</p>
    </div>
  );
}

function Arrow({ emphasis = false }: { emphasis?: boolean }) {
  return (
    <div
      className={`h-0.5 w-6 shrink-0 ${emphasis ? "bg-atlas-sage" : "bg-atlas-ink"}`}
      aria-hidden="true"
    />
  );
}

type ContentMapRenderDiagramProps = {
  caption: string;
  captionShort?: string;
};

/**
 * A-08 — Content → Map → Render. Composed UI (not a raster screenshot).
 */
export function ContentMapRenderDiagram({
  caption,
  captionShort,
}: ContentMapRenderDiagramProps) {
  return (
    <figure>
      <div className="hidden border border-atlas-border bg-atlas-secondary p-8 desktop:block">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 w-16 shrink-0 font-mono text-[11px] text-atlas-sage">
              CONTENT
            </p>
            {STAGE_A.map((node, i) => (
              <div key={node.id} className="flex items-center gap-3">
                {i > 0 ? <Arrow emphasis={i === 1} /> : null}
                <Node node={node} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 w-16 shrink-0 font-mono text-[11px] text-atlas-body">
              MAP
            </p>
            {STAGE_B.map((node, i) => (
              <div key={node.id} className="flex items-center gap-3">
                {i > 0 ? <Arrow /> : null}
                <Node node={node} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 w-16 shrink-0 font-mono text-[11px] text-atlas-body">
              RENDER
            </p>
            {STAGE_C.map((node, i) => (
              <div key={node.id} className="flex items-center gap-3">
                {i > 0 ? <Arrow /> : null}
                <Node node={node} />
              </div>
            ))}
          </div>
          <p className="m-0 font-mono text-[11px] text-atlas-body">
            Strapi mappers replace fixtures at M8 — domain types stay stable.
          </p>
        </div>
      </div>

      <div className="hidden border border-atlas-border bg-atlas-secondary px-5 py-6 tablet:block desktop:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {STAGE_A.map((node) => (
              <Node key={node.id} node={node} compact />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STAGE_B.map((node) => (
              <Node key={node.id} node={node} compact />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STAGE_C.map((node) => (
              <Node key={node.id} node={node} compact />
            ))}
          </div>
        </div>
      </div>

      <div className="border border-atlas-border bg-atlas-secondary px-4 py-5 tablet:hidden">
        <div className="flex flex-col gap-2">
          {[...STAGE_A, ...STAGE_B, ...STAGE_C].map((node) => (
            <Node key={node.id} node={node} compact />
          ))}
        </div>
      </div>

      <figcaption className="mt-3 font-sans text-xs leading-normal text-atlas-body">
        <span className="tablet:hidden">{captionShort ?? caption}</span>
        <span className="hidden tablet:inline">{caption}</span>
      </figcaption>
    </figure>
  );
}
