import Image from "next/image";
import Link from "next/link";
import { Activity, BarChart3, LayoutDashboard, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

const ACCENT = "#ff8c00";
const STEP_ACCENT = "#f59e0b";
/** Step box width (px); spine runs through horizontal center */
const STEP_BOX_W = 44;

const steps = [
  {
    n: "01",
    title: "Diagnose",
    body: "We map the real operational flow, dependencies, bottlenecks, and hidden coordination patterns.",
  },
  {
    n: "02",
    title: "Design",
    body: "We architect systems that reduce friction and create operational visibility.",
  },
  {
    n: "03",
    title: "Implement",
    body: "We integrate automation, infrastructure, and workflow alignment directly into operations.",
  },
  {
    n: "04",
    title: "Optimize",
    body: "We refine performance, visibility, and organizational responsiveness over time.",
  },
] as const;

const modelFeatures = [
  {
    title: "Operational focus",
    body: "We prioritize how work actually moves before tooling or automation.",
    Icon: LayoutDashboard,
  },
  {
    title: "Systems thinking",
    body: "We connect dependencies, owners, and handoffs into one visible pattern.",
    Icon: Network,
  },
  {
    title: "Measurable outcomes",
    body: "We define leading indicators so progress is visible, not subjective.",
    Icon: BarChart3,
  },
  {
    title: "Compounding change",
    body: "We build infrastructure that improves as usage grows—not one-off projects.",
    Icon: Activity,
  },
] as const;

export function ModelSection() {
  return (
    <section
      id="model"
      aria-labelledby="model-heading"
      style={{
        position: "relative",
        paddingTop: 0,
        paddingBottom: 0,
        background: "#0a0a0a",
      }}
    >
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:items-stretch lg:gap-x-10 xl:gap-x-12">
          {/* Left — narrative + process (narrow column) */}
          <div className="min-w-0 lg:max-w-[420px] xl:max-w-[440px]">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT,
                fontWeight: 600,
                marginBottom: "0.65rem",
              }}
            >
              Our model
            </p>
            <h2
              id="model-heading"
              style={{
                fontSize: "clamp(1.45rem, 2.4vw, 1.95rem)",
                lineHeight: 1.15,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "1rem",
              }}
            >
              Infrastructure that creates operational clarity.
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                fontWeight: 400,
                color: "rgba(180,180,180,0.96)",
                marginBottom: "1.1rem",
              }}
            >
              A proven process that connects systems, removes friction, and creates compounding operational impact.
            </p>
            <Link href="/work" style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>
              See the full process →
            </Link>

            <ol className="relative m-0 mt-10 list-none space-y-10 p-0">
              {/* Dim vertical spine through step box centers */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-6 top-6 z-0 hidden w-px -translate-x-1/2 bg-white/[0.14] sm:block"
                style={{ left: STEP_BOX_W / 2 }}
              />

              {steps.map((s) => (
                <li key={s.n} className="relative z-[1] flex items-start gap-4">
                  <div
                    className="relative z-[1] flex shrink-0 items-center justify-center rounded-sm tabular-nums"
                    style={{
                      width: STEP_BOX_W,
                      height: STEP_BOX_W,
                      background: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 13,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: STEP_ACCENT,
                      fontFamily: "var(--iw-mono)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.n}
                  </div>
                  <div className="min-w-0 flex-1 pt-[9px]">
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#ffffff" }}>{s.title}</h3>
                    <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: "#9ca3af" }}>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right — hero visual + feature strip */}
          <div
            className="flex min-h-0 w-full flex-col overflow-hidden rounded-sm lg:h-full"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="relative aspect-[16/10] w-full min-h-[260px] flex-1 lg:aspect-auto lg:min-h-[min(480px,62vh)]">
              <Image
                src="/team-meeting.png"
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: "center 42%" }}
                sizes="(min-width: 1024px) 65vw, 100vw"
                priority={false}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.45) 100%)",
                  zIndex: 1,
                }}
              />
            </div>

            {/* Bottom feature row — full width of visual */}
            <div
              className="grid shrink-0 border-t border-white/[0.09] bg-[rgba(6,7,10,0.92)] sm:grid-cols-2 lg:grid-cols-4"
              style={{ backdropFilter: "blur(10px)" }}
            >
              {modelFeatures.map(({ title, body, Icon: FI }, i) => (
                <div
                  key={title}
                  className={cn(
                    "flex flex-col items-center border-white/[0.09] px-4 py-6 text-center lg:px-5 lg:py-7",
                    i > 0 && "border-t sm:border-t-0 lg:border-t-0",
                    i >= 2 && "sm:border-t lg:border-t-0",
                    i % 2 === 1 && "sm:border-l",
                    i > 0 && "lg:border-l",
                  )}
                >
                  <FI
                    aria-hidden
                    size={30}
                    strokeWidth={1.35}
                    style={{ color: ACCENT, flexShrink: 0, marginBottom: 14 }}
                  />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff", letterSpacing: "0.01em", maxWidth: 220 }}>
                    {title}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: "rgba(160,160,165,0.95)",
                      maxWidth: 240,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient seam → next section (matches Proof → Model hairline) */}
      <div
        aria-hidden
        style={{
          height: 1,
          backgroundImage: SECTION_GRADIENT_SEAM,
        }}
      />
    </section>
  );
}
