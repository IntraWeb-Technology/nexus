import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Brain, Layers, LayoutGrid, Network } from "lucide-react";

const COLUMNS: readonly {
  title: string;
  Icon: LucideIcon;
  items: readonly string[];
}[] = [
  {
    title: "Infrastructure",
    Icon: Layers,
    items: ["CRM architecture", "Operational data flows", "Reporting systems", "Multi-system integrations"],
  },
  {
    title: "Automation",
    Icon: Network,
    items: ["Workflow orchestration", "Triggered process chains", "Operational routing", "AI-native pipelines"],
  },
  {
    title: "Custom platforms",
    Icon: LayoutGrid,
    items: ["Client portals", "Internal tooling", "Operational dashboards", "Business intelligence surfaces"],
  },
  {
    title: "AI implementation",
    Icon: Brain,
    items: ["AI workflow design", "Model integration", "Operational AI infrastructure", "Intelligent automation"],
  },
] as const;

export function TaxonomyGrid() {
  return (
    <div className="about-builds-cards relative min-w-0">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[6px]" aria-hidden>
        <Image
          src="/hero-01.png"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-[center_35%] opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--about-bg)] from-0% via-transparent via-45% to-[color:var(--about-bg)] to-100% opacity-90" />
      </div>

      <div className="relative z-[1] grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 md:gap-6">
        {COLUMNS.map(({ title, Icon, items }) => (
          <div
            key={title}
            className="about-builds-card about-card group flex flex-col border border-[color:var(--about-border)] bg-[color:var(--about-surface)] p-5 shadow-[var(--about-shadow-sm)] md:p-6"
          >
            <div className="text-[color:var(--accent)]" aria-hidden>
              <Icon className="size-6" strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[color:var(--about-text)] md:text-[16px]">
              {title}
            </h3>
            <div className="mt-3 h-px w-full bg-[color:var(--about-border-inner)]" aria-hidden />
            <ul className="mt-4 space-y-2.5 text-[14px] leading-snug text-[color:var(--about-text-secondary)] md:text-[15px]">
              {items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    className="mt-[0.55em] h-px w-3 shrink-0 bg-[color:var(--accent)]"
                    aria-hidden
                  />
                  <span className="min-w-0 leading-[1.45]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
