type TerminalBlockProps = {
  lines: string[];
  caption?: string;
  className?: string;
};

/**
 * Ink terminal evidence plane. Named publishing primitive (Build Manifest).
 */
export function TerminalBlock({
  lines,
  caption,
  className = "",
}: TerminalBlockProps) {
  return (
    <figure className={`m-0 ${className}`.trim()}>
      {caption ? (
        <figcaption className="mb-3 font-sans text-xs text-atlas-body">
          {caption}
        </figcaption>
      ) : null}
      <div
        tabIndex={0}
        role="region"
        aria-label="Terminal output"
        className="overflow-x-auto rounded-[2px] bg-atlas-ink p-4"
      >
        <pre className="m-0 font-mono text-xs leading-5 text-atlas-elevated">
          <span className="mb-3 block font-mono text-[10px] font-medium text-atlas-secondary">
            TERMINAL
          </span>
          <code className="font-mono text-xs leading-5 whitespace-pre text-atlas-elevated">
            {lines.join("\n")}
          </code>
        </pre>
      </div>
    </figure>
  );
}
