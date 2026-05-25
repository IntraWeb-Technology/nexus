"use client";

import type { LucideIcon } from "lucide-react";
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
import { Reveal } from "@/components/primitives";
import { MOTION_REVEAL, MOTION_STAGGER } from "@/lib/motion-tokens";

const LINE = "#30363d";
const fadeY = `linear-gradient(to bottom, transparent 0%, ${LINE} 14%, ${LINE} 86%, transparent 100%)`;
const fadeX = `linear-gradient(to right, transparent 0%, ${LINE} 12%, ${LINE} 88%, transparent 100%)`;

const items: { icon: LucideIcon; text: string }[] = [
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

function FrictionCell({
  icon: Icon,
  text,
  delay,
}: {
  icon: LucideIcon;
  text: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} y={MOTION_REVEAL.y}>
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
        <Icon aria-hidden {...iconProps} style={{ color: "#ff8c00", flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: "#ffffff" }}>{text}</span>
      </div>
    </Reveal>
  );
}

function FrictionDesktopGrid() {
  const row1 = items.slice(0, 5);
  const row2 = items.slice(5, 9);

  return (
    <div
      className="hidden md:block"
      style={{
        paddingLeft: "clamp(1rem, 2.5vw, 1.75rem)",
        minWidth: 0,
      }}
    >
      <div>
        <div className="relative">
          <VerticalFades />
          <div className="relative z-[1] grid grid-cols-5">
            {row1.map(({ icon, text }, i) => (
              <FrictionCell
                key={text}
                icon={icon}
                text={text}
                delay={i * MOTION_STAGGER.lineMs}
              />
            ))}
          </div>
        </div>
        <div className="relative z-[1] py-2">
          <div style={{ height: 1, marginLeft: "4%", marginRight: "4%", background: fadeX }} aria-hidden />
        </div>
        <div className="relative">
          <VerticalFades />
          <div className="relative z-[1] grid grid-cols-5">
            {row2.map(({ icon, text }, i) => (
              <FrictionCell
                key={text}
                icon={icon}
                text={text}
                delay={(row1.length + i) * MOTION_STAGGER.lineMs}
              />
            ))}
            <div aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function FrictionMobileList() {
  return (
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
          {i > 0 ? (
            <div className="mx-1 mb-3 mt-3" style={{ height: 1, background: fadeX }} aria-hidden />
          ) : null}
          <Reveal delay={i * MOTION_STAGGER.lineMs} y={MOTION_REVEAL.y}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 2px 8px" }}>
              <Icon aria-hidden {...iconProps} style={{ color: "#ff8c00", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", lineHeight: 1.45 }}>{text}</span>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/** Client island — icons and staggered Reveal must not cross the RSC boundary. */
export function FrictionGridMotion() {
  return (
    <>
      <FrictionDesktopGrid />
      <FrictionMobileList />
    </>
  );
}
