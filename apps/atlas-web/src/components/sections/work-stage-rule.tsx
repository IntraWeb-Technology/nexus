type StageRuleProps = {
  label: string;
};

/**
 * Desktop-only editorial stage band from Work Page 18.
 * Tablet/mobile compositions omit these — keep local to Work.
 */
export function StageRule({ label }: StageRuleProps) {
  return (
    <div
      className="hidden bg-atlas-secondary desktop:block"
      aria-hidden="true"
    >
      <p className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] py-3 font-mono text-[10px] text-atlas-body whitespace-pre">
        {label}
      </p>
    </div>
  );
}
