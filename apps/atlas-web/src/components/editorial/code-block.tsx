type CodeBlockProps = {
  language: string;
  code: string;
  caption?: string;
  className?: string;
};

/**
 * Flat elevated code evidence. Named publishing primitive (Build Manifest).
 * No syntax highlighter this milestone — monospace honesty over chrome.
 */
export function CodeBlock({
  language,
  code,
  caption,
  className = "",
}: CodeBlockProps) {
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
        aria-label={`${language} code`}
        className="overflow-x-auto rounded-[2px] bg-atlas-elevated p-4"
      >
        <pre className="m-0 font-mono text-xs leading-5 text-atlas-ink">
          <span className="mb-3 block font-mono text-[10px] font-medium text-atlas-umber">
            {language}
          </span>
          <code className="font-mono text-xs leading-5 whitespace-pre text-atlas-ink">
            {code}
          </code>
        </pre>
      </div>
    </figure>
  );
}
