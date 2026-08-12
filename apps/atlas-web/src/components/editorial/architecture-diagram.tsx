import type { ArchitectureNode } from "@/content/case-study";

type ArchitectureDiagramProps = {
  requestPath: ArchitectureNode[];
  deliveryPath: ArchitectureNode[];
  tabletRequest: ArchitectureNode[];
  tabletDelivery: ArchitectureNode[];
  mobileNodes: ArchitectureNode[];
  legend: string[];
  caption: string;
  captionShort: string;
};

function NodeCard({
  node,
  compact = false,
}: {
  node: ArchitectureNode;
  compact?: boolean;
}) {
  const border = node.emphasis ? "border-atlas-sage" : "border-atlas-ink";
  const idColor = node.emphasis ? "text-atlas-sage" : "text-atlas-body";

  return (
    <div
      className={`flex flex-col justify-center gap-1 rounded-[2px] border-[1.5px] bg-atlas-elevated ${border} ${
        compact
          ? "h-12 min-w-[9.5rem] px-2 py-2 tablet:h-14 tablet:min-w-0 tablet:w-auto tablet:px-2.5"
          : "h-16 min-w-[9.5rem] px-3.5 py-3"
      }`}
    >
      <p
        className={`m-0 font-mono ${compact ? "text-[9px] tablet:text-[10px]" : "text-[11px]"} ${idColor}`}
      >
        {node.id}
      </p>
      <p
        className={`m-0 font-sans text-atlas-ink ${compact ? "text-[10px] tablet:text-[11px]" : "text-xs"}`}
      >
        {node.labelShort ?? node.label}
      </p>
    </div>
  );
}

/**
 * Editorial architecture diagram — hairline nodes, mono IDs, restrained connectors.
 * Recomposed per breakpoint (Figma Page 19).
 */
export function ArchitectureDiagram({
  requestPath,
  deliveryPath,
  tabletRequest,
  tabletDelivery,
  mobileNodes,
  legend,
  caption,
  captionShort,
}: ArchitectureDiagramProps) {
  return (
    <figure>
      {/* Desktop */}
      <div className="hidden border border-atlas-border bg-atlas-secondary p-12 desktop:block">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {requestPath.map((node, i) => (
              <div key={node.id} className="flex items-center gap-4">
                {i > 0 ? (
                  <div
                    className={`h-0.5 w-9 shrink-0 ${
                      requestPath[i - 1]?.emphasis && node.emphasis
                        ? "bg-atlas-sage"
                        : "bg-atlas-ink"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <NodeCard node={node} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {deliveryPath.map((node, i) => (
              <div key={node.id} className="flex items-center gap-6">
                {i > 0 ? (
                  <div
                    className="h-0.5 w-12 shrink-0 bg-atlas-ink"
                    aria-hidden="true"
                  />
                ) : null}
                <NodeCard node={node} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-8 font-mono text-[11px] text-atlas-body">
            {legend.map((line) => (
              <p key={line} className="m-0 whitespace-pre">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden border border-atlas-border bg-atlas-secondary px-6 py-7 tablet:block desktop:hidden">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            {tabletRequest.map((node) => (
              <NodeCard key={node.id} node={node} compact />
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {tabletDelivery.map((node) => (
              <NodeCard key={node.id} node={node} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile — stacked */}
      <div className="flex flex-col gap-2.5 border border-atlas-border bg-atlas-secondary px-4 py-5 tablet:hidden">
        {mobileNodes.map((node) => (
          <NodeCard key={node.id} node={node} compact />
        ))}
      </div>

      <figcaption className="mt-3 font-sans text-[11px] leading-normal text-atlas-body tablet:text-xs">
        <span className="hidden desktop:inline">{caption}</span>
        <span className="desktop:hidden">{captionShort}</span>
      </figcaption>
    </figure>
  );
}
