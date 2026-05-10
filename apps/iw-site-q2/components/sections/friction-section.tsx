import Link from "next/link";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";
import {
  Shuffle,
  User,
  ListTree,
  TrendingUp,
  BarChart2,
  ScatterChart,
  Gauge,
  Cog,
  CircleAlert,
} from "lucide-react";

/** Snapshot styling — deep field + decorative fades (not a closed grid). */
const FRICTION_BG = "#0a0a0a";
/** Top → bottom: flat #0a0a0a at seam (matches hero floor), then cool depth — no orange/warm wash. */
const FRICTION_BG_GRADIENT = [
  "linear-gradient(180deg, transparent 0%, transparent 52%, rgba(36, 56, 74, 0.32) 100%)",
  "linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 32%, #090a0e 52%, #070708 78%, #050506 100%)",
].join(", ");
const LINE = "#30363d";
const ACCENT = "#ff8c00";
const SUBTEXT = "#888888";

const fadeY = `linear-gradient(to bottom, transparent 0%, ${LINE} 14%, ${LINE} 86%, transparent 100%)`;
const fadeX = `linear-gradient(to right, transparent 0%, ${LINE} 12%, ${LINE} 88%, transparent 100%)`;

const items = [
  { icon: Shuffle, text: "Workarounds are running the show" },
  { icon: User, text: "Critical work depends on specific people" },
  { icon: ListTree, text: "Systems don't talk. People do." },
  { icon: TrendingUp, text: "Manual steps create hidden bottlenecks" },
  { icon: BarChart2, text: "Growth exposes everything" },
  { icon: ScatterChart, text: "Data is scattered, reports are delayed" },
  { icon: Gauge, text: "Good people are stuck in maintenance" },
  { icon: Cog, text: "Priorities change, processes don't" },
  { icon: CircleAlert, text: "Decisions lack real-time operational truth" },
];

const iconProps = { width: 26, height: 26, strokeWidth: 1.35 } as const;

function VerticalFades({ className }: { className?: string }) {
  const pct = [20, 40, 60, 80];
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 bottom-0 ${className ?? ""}`}
      aria-hidden
    >
      {pct.map((left) => (
        <div
          key={left}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: "5%",
            bottom: "5%",
            width: 1,
            transform: "translateX(-50%)",
            background: fadeY,
          }}
        />
      ))}
    </div>
  );
}

function FrictionCell({ icon: Icon, text }: { icon: (typeof items)[0]["icon"]; text: string }) {
  return (
    <div
      style={{
        padding: "10px 8px 12px 10px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        minWidth: 0,
        minHeight: 72,
      }}
    >
      <Icon aria-hidden {...iconProps} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: "#ffffff" }}>{text}</span>
    </div>
  );
}

export function FrictionSection() {
  const row1 = items.slice(0, 5);
  const row2 = items.slice(5, 9);

  return (
    <section
      id="friction"
      aria-labelledby="friction-heading"
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: FRICTION_BG,
        backgroundImage: FRICTION_BG_GRADIENT,
      }}
    >
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {/* Section top — faded horizontal (decorative, not a full rule) */}
        <div className="mb-6 md:mb-8" style={{ height: 1, background: fadeX }} aria-hidden />

        <div className="md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:items-start md:gap-0 lg:grid-cols-[minmax(0,268px)_minmax(0,1fr)]">
          <div className="relative mb-5 md:mb-0 md:pr-7 lg:pr-8">
            {/* Intro / grid divider — vertical fade */}
            <div
              className="hidden md:block"
              aria-hidden
              style={{
                position: "absolute",
                top: "2%",
                bottom: "2%",
                right: 0,
                width: 1,
                background: fadeY,
              }}
            />
            <h2
              id="friction-heading"
              style={{
                fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.055em",
                margin: "0 0 8px",
              }}
            >
              The friction we see every day
            </h2>
            <p
              className="mb-5 md:mb-7"
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: SUBTEXT,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Different companies. Same patterns.
            </p>
            <Link
              href="/#proof"
              className="hidden md:inline-block"
              style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}
            >
              See all friction patterns →
            </Link>
          </div>

          {/* Desktop: open grid — faded column guides + row separator only */}
          <div
            className="hidden md:block"
            style={{
              paddingLeft: "clamp(1rem, 2.5vw, 1.75rem)",
              minWidth: 0,
            }}
          >
            <div>
              {/* Row 1 — column guides fade out top/bottom within this band only */}
              <div className="relative">
                <VerticalFades />
                <div className="relative z-[1] grid grid-cols-5">
                  {row1.map(({ icon, text }) => (
                    <FrictionCell key={text} icon={icon} text={text} />
                  ))}
                </div>
              </div>

              {/* Between-row horizontal — fades left/right; does not meet vertical guides */}
              <div className="relative z-[1] py-2">
                <div style={{ height: 1, marginLeft: "4%", marginRight: "4%", background: fadeX }} aria-hidden />
              </div>

              {/* Row 2 */}
              <div className="relative">
                <VerticalFades />
                <div className="relative z-[1] grid grid-cols-5">
                  {row2.map(({ icon, text }) => (
                    <FrictionCell key={text} icon={icon} text={text} />
                  ))}
                  <div aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <ul
          className="md:hidden"
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 14px",
          }}
        >
          {items.map(({ icon: Icon, text }, i) => (
            <li key={text}>
              {i > 0 ? <div className="mx-1 mb-3 mt-3" style={{ height: 1, background: fadeX }} aria-hidden /> : null}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 2px 8px" }}>
                <Icon aria-hidden {...iconProps} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", lineHeight: 1.45 }}>{text}</span>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/#proof" className="md:hidden" style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>
          See all friction patterns →
        </Link>
      </div>

      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </section>
  );
}
