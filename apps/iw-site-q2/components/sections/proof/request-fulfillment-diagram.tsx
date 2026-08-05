"use client";

import { Inter } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Cog,
  MailOpen,
  Package,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import type { RefObject } from "react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

const BG = "#0a0a0a";
const ACCENT = "#ff8c00";
const CARD_BG = "#161616";
const CARD_BORDER = "rgba(255,255,255,0.08)";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

type Side = "left" | "right" | "top" | "bottom";

function anchor(el: HTMLElement, container: HTMLElement, side: Side, inset = 0) {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  const left = r.left - c.left;
  const top = r.top - c.top;
  const cx = left + r.width / 2;
  const cy = top + r.height / 2;
  switch (side) {
    case "left":
      return { x: left + inset, y: cy };
    case "right":
      return { x: left + r.width - inset, y: cy };
    case "top":
      return { x: cx, y: top + inset };
    case "bottom":
      return { x: cx, y: top + r.height - inset };
    default:
      return { x: cx, y: cy };
  }
}

function shorten(a: { x: number; y: number }, b: { x: number; y: number }, ia = 6, ib = 10) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: a.x + ux * ia,
    y1: a.y + uy * ia,
    x2: b.x - ux * ib,
    y2: b.y - uy * ib,
  };
}

function StepCard({
  step,
  title,
  body,
  icon: Icon,
}: {
  step: number;
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 12,
        padding: "14px 12px 14px",
        minHeight: 172,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: ACCENT,
          color: "#000000",
          fontWeight: 700,
          fontSize: 12,
          display: "grid",
          placeItems: "center",
          fontFamily: inter.style.fontFamily,
        }}
      >
        {step}
      </div>
      <div style={{ marginTop: 10, marginBottom: 12, display: "flex", justifyContent: "center" }}>
        <Icon size={40} strokeWidth={1.35} color={ACCENT} aria-hidden />
      </div>
      <h4
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.25,
          fontFamily: inter.style.fontFamily,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: 12,
          fontWeight: 400,
          color: "#e5e5e5",
          textAlign: "center",
          lineHeight: 1.5,
          flex: 1,
          fontFamily: inter.style.fontFamily,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function ArrowSvg({
  containerRef,
  r1,
  r2,
  r3,
  r4,
  r5,
  r6,
  r7,
  r8,
  eliminatedRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  r1: RefObject<HTMLDivElement | null>;
  r2: RefObject<HTMLDivElement | null>;
  r3: RefObject<HTMLDivElement | null>;
  r4: RefObject<HTMLDivElement | null>;
  r5: RefObject<HTMLDivElement | null>;
  r6: RefObject<HTMLDivElement | null>;
  r7: RefObject<HTMLDivElement | null>;
  r8: RefObject<HTMLDivElement | null>;
  eliminatedRef: RefObject<HTMLDivElement | null>;
}) {
  const uid = useId().replace(/:/g, "");
  const markerSolid = `rf-ms-${uid}`;
  const markerDash = `rf-md-${uid}`;

  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState<{
    solid: string[];
    dashed: string;
  }>({ solid: [], dashed: "" });

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    if (w < 8 || h < 8) return;

    const ok = (ref: RefObject<HTMLDivElement | null>) => ref.current;
    if (!ok(r1) || !ok(r2) || !ok(r3) || !ok(r4) || !ok(r5) || !ok(r6) || !ok(r7) || !ok(r8) || !eliminatedRef.current) return;

    const seg = (from: HTMLElement, fs: Side, to: HTMLElement, ts: Side) => {
      const p0 = anchor(from, c, fs);
      const p1 = anchor(to, c, ts);
      const { x1, y1, x2, y2 } = shorten(p0, p1);
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    };

    const solid: string[] = [
      seg(r1.current!, "right", r2.current!, "left"),
      seg(r2.current!, "right", r3.current!, "left"),
      seg(r3.current!, "right", r4.current!, "left"),
      seg(r4.current!, "right", r5.current!, "left"),
      seg(r5.current!, "bottom", r6.current!, "top"),
      seg(r6.current!, "left", r7.current!, "right"),
      seg(r7.current!, "left", r8.current!, "right"),
    ];

    const el = eliminatedRef.current!;
    const s8 = r8.current!;
    const er = el.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    const s8r = s8.getBoundingClientRect();

    const erRight = er.right - cr.left;
    const elimMidY = er.top - cr.top + er.height / 2;

    const start = {
      x: s8r.left - cr.left + s8r.width * 0.14,
      y: s8r.top - cr.top + s8r.height * 0.9,
    };

    const jogX = erRight + 22;
    const endX = erRight + 3;
    const dashed =
      start.x > jogX
        ? `M ${start.x} ${start.y} L ${jogX} ${start.y} L ${jogX} ${elimMidY} L ${endX} ${elimMidY}`
        : `M ${start.x} ${start.y} L ${start.x - 40} ${start.y} L ${start.x - 40} ${elimMidY} L ${endX} ${elimMidY}`;

    setDims({ w, h });
    setPaths({ solid, dashed });
  }, [containerRef, r1, r2, r3, r4, r5, r6, r7, r8, eliminatedRef]);

  useLayoutEffect(() => {
    measure();
    const id = requestAnimationFrame(() => requestAnimationFrame(measure));
    const c = containerRef.current;
    if (!c || typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(id);
    }
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(c);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [measure, containerRef]);

  if (dims.w < 8 || dims.h < 8 || paths.solid.length === 0) return null;

  return (
    <svg
      width={dims.w}
      height={dims.h}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
      aria-hidden
    >
      <defs>
        <marker id={markerSolid} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={ACCENT} />
        </marker>
        <marker id={markerDash} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={ACCENT} />
        </marker>
      </defs>
      {paths.solid.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={ACCENT}
          strokeWidth={2}
          fill="none"
          markerEnd={`url(#${markerSolid})`}
        />
      ))}
      <path
        d={paths.dashed}
        stroke={ACCENT}
        strokeWidth={2}
        strokeDasharray="7 5"
        fill="none"
        markerEnd={`url(#${markerDash})`}
      />
    </svg>
  );
}

function RequestFulfillmentDiagramInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const r4 = useRef<HTMLDivElement>(null);
  const r5 = useRef<HTMLDivElement>(null);
  const r6 = useRef<HTMLDivElement>(null);
  const r7 = useRef<HTMLDivElement>(null);
  const r8 = useRef<HTMLDivElement>(null);
  const eliminatedRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={inter.className}
      style={{
        position: "relative",
        background: BG,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <ArrowSvg
        containerRef={containerRef}
        r1={r1}
        r2={r2}
        r3={r3}
        r4={r4}
        r5={r5}
        r6={r6}
        r7={r7}
        r8={r8}
        eliminatedRef={eliminatedRef}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        <div ref={r1} style={{ gridColumn: 1, gridRow: 1 }}>
          <StepCard
            step={1}
            title="Receive Request"
            body="Request is received from internal or external source."
            icon={MailOpen}
          />
        </div>
        <div ref={r2} style={{ gridColumn: 2, gridRow: 1 }}>
          <StepCard
            step={2}
            title="Sales Review"
            body="Sales reviews request details and confirms requirements."
            icon={User}
          />
        </div>
        <div ref={r3} style={{ gridColumn: 3, gridRow: 1 }}>
          <StepCard
            step={3}
            title="Ops Review"
            body="Operations validates feasibility, capacity, and timelines."
            icon={ClipboardCheck}
          />
        </div>
        <div ref={r4} style={{ gridColumn: 4, gridRow: 1 }}>
          <StepCard
            step={4}
            title="Manual Options"
            body="Evaluate and determine the best manual processing options."
            icon={Cog}
          />
        </div>
        <div ref={r5} style={{ gridColumn: 5, gridRow: 1 }}>
          <StepCard
            step={5}
            title="Vendor Coordination"
            body="Coordinate with vendor for resources, data, and execution."
            icon={Users}
          />
        </div>

        <div aria-hidden style={{ gridColumn: 1, gridRow: 2 }} />
        <div aria-hidden style={{ gridColumn: 2, gridRow: 2 }} />

        <div ref={r8} style={{ gridColumn: 3, gridRow: 2 }}>
          <StepCard
            step={8}
            title="Resource Check"
            body="Verify and allocate necessary resources for fulfillment."
            icon={Search}
          />
        </div>
        <div ref={r7} style={{ gridColumn: 4, gridRow: 2 }}>
          <StepCard
            step={7}
            title="Internal Approval"
            body="Internal stakeholders review and approve fulfillment details."
            icon={ShieldCheck}
          />
        </div>
        <div ref={r6} style={{ gridColumn: 5, gridRow: 2 }}>
          <StepCard
            step={6}
            title="Fulfillment"
            body="Execute fulfillment process and deliver to requester."
            icon={Package}
          />
        </div>

        <div ref={eliminatedRef} style={{ gridColumn: 1, gridRow: 3, marginTop: 4 }}>
          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12,
              padding: "14px 14px 16px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: ACCENT,
                display: "grid",
                placeItems: "center",
              }}
            >
              <X size={17} strokeWidth={2.75} color="#ffffff" aria-hidden />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: ACCENT,
                  fontFamily: inter.style.fontFamily,
                }}
              >
                Eliminated
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.5,
                  fontFamily: inter.style.fontFamily,
                }}
              >
                Request cannot be fulfilled or does not meet criteria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestFulfillmentDiagramDesktop() {
  return (
    <div role="img" aria-label="Request fulfillment process flow with eight steps and eliminated outcome">
      <RequestFulfillmentDiagramInner />
    </div>
  );
}

export function RequestFulfillmentDiagramMobile() {
  return (
    <div className="overflow-x-auto pb-1" style={{ marginInline: -4 }}>
      <div style={{ minWidth: 720 }}>
        <RequestFulfillmentDiagramDesktop />
      </div>
    </div>
  );
}
