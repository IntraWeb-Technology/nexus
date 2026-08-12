import type { DocsIndexFixture } from "@/content/doc";

type DocsProgressNoteProps = {
  data: DocsIndexFixture["progressNote"];
};

/**
 * Landing summary of per-document reading progress (Figma Page 22).
 * Actual progress chrome lives on documentation detail routes.
 */
export function DocsProgressNote({ data }: DocsProgressNoteProps) {
  return (
    <section
      aria-labelledby="docs-progress-title"
      className="bg-atlas-secondary"
    >
      <div className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] space-y-3 py-7">
        <h2
          id="docs-progress-title"
          className="m-0 font-mono text-[10px] tracking-[0.08em] text-atlas-body uppercase"
        >
          {data.chapter}
        </h2>
        <p className="m-0 max-w-[45rem] font-sans text-sm leading-[22px] text-atlas-body">
          {data.body}
        </p>
        <div
          className="h-[3px] w-full bg-atlas-border"
          aria-hidden="true"
        />
        <div
          className="h-[3px] w-full bg-atlas-border"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
