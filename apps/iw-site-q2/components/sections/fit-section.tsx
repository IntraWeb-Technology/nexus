"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StatusDot } from "@/components/primitives";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

type NodeKind = "source" | "step" | "ai" | "human" | "sink";

type FitNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  kind: NodeKind;
};

type FitEdge = { from: string; to: string };

const FIT_INDICATORS = [
  "Teams of 20–150 people",
  "Operations, Finance, RevOps, or technology leaders",
  "Companies with workflow friction across multiple systems",
  "Organizations ready to fix root causes, not symptoms",
] as const;

const WHERE_STARTS = [
  "Reporting depends on manual assembly",
  "Client handoffs live across email, Slack, and memory",
  "Follow-up ownership changes before action happens",
  "Teams rely on workarounds because systems do not connect",
] as const;

/** Matches Proof section (`proof-section.tsx`) */
const SECTION_BG = "#0a0a0a";
const SECTION_SURFACE = [
  "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(36, 56, 74, 0.18) 100%)",
  "linear-gradient(180deg, #0c0d10 0%, #0a0a0a 38%, #070707 72%, #030303 88%, #000000 100%)",
].join(", ");

function FitDiagram() {
  const INTENSITY: number = 0.9;

  type Token = {
    id: number;
    edge: FitEdge;
    p: number;
    payload: string;
    color: string;
  };

  const [frame, setFrame] = useState<{
    now: number;
    tokens: Token[];
    active: Record<string, number>;
  }>({ now: 0, tokens: [], active: {} });

  const nodes = useMemo<FitNode[]>(
    () => [
      { id: "inbox", x: 60, y: 80, label: "INBOX", sub: "email.webhook", kind: "source" },
      { id: "crm", x: 60, y: 220, label: "CRM", sub: "hubspot.sync", kind: "source" },
      { id: "parse", x: 220, y: 150, label: "PARSE", sub: "extract.fields", kind: "step" },
      { id: "agent", x: 380, y: 150, label: "AGENT", sub: "gpt-orch", kind: "ai" },
      { id: "rules", x: 380, y: 50, label: "RULES", sub: "exceptions", kind: "step" },
      { id: "approve", x: 540, y: 90, label: "APPROVE", sub: "human.review", kind: "human" },
      { id: "db", x: 540, y: 220, label: "DATABASE", sub: "ops.records", kind: "sink" },
      { id: "alert", x: 380, y: 310, label: "ALERT", sub: "slack.channel", kind: "sink" },
      { id: "audit", x: 60, y: 340, label: "AUDIT LOG", sub: "immutable", kind: "sink" },
    ],
    [],
  );

  const edges = useMemo<FitEdge[]>(
    () => [
      { from: "inbox", to: "parse" },
      { from: "crm", to: "parse" },
      { from: "parse", to: "agent" },
      { from: "agent", to: "rules" },
      { from: "rules", to: "approve" },
      { from: "agent", to: "approve" },
      { from: "agent", to: "db" },
      { from: "agent", to: "alert" },
      { from: "parse", to: "audit" },
      { from: "agent", to: "audit" },
    ],
    [],
  );

  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const tokensRef = useRef<Token[]>([]);
  const lastSpawnRef = useRef(0);
  const activeUntilRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (INTENSITY === 0) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(60, t - last);
      last = t;

      if (t - lastSpawnRef.current > 700 / INTENSITY) {
        lastSpawnRef.current = t;
        const startEdges = edges.filter((e) => ["inbox", "crm"].includes(e.from));
        const start = startEdges[Math.floor(Math.random() * startEdges.length)];
        tokensRef.current.push({
          id: Math.random(),
          edge: start,
          p: 0,
          payload:
            ["order #", "ticket #", "lead #", "invoice #"][Math.floor(Math.random() * 4)] +
            (1000 + Math.floor(Math.random() * 9000)),
          color: Math.random() > 0.8 ? "var(--iw-amber)" : "var(--accent)",
        });
      }

      const speed = 0.0006 * INTENSITY;
      tokensRef.current = tokensRef.current.flatMap((tok) => {
        const np = tok.p + dt * speed;
        if (np >= 1) {
          activeUntilRef.current[tok.edge.to] = t + 400;
          const outs = edges.filter((e) => e.from === tok.edge.to);
          if (outs.length === 0) return [];
          const picks = outs.filter(() => Math.random() > 0.35);
          const chosen = picks.length ? picks : [outs[Math.floor(Math.random() * outs.length)]];
          return chosen.map((e) => ({ ...tok, id: Math.random(), edge: e, p: 0 }));
        }
        return [{ ...tok, p: np }];
      });

      if (tokensRef.current.length > 30) {
        tokensRef.current = tokensRef.current.slice(-30);
      }

      setFrame({
        now: t,
        tokens: tokensRef.current.slice(),
        active: { ...activeUntilRef.current },
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [edges]);

  const edgePath = (e: FitEdge) => {
    const a = nodeById[e.from];
    const b = nodeById[e.to];
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };

  const nodeColor = (n: FitNode) => {
    if (n.kind === "ai") return "var(--iw-amber)";
    if (n.kind === "human") return "var(--iw-plum)";
    return "var(--accent)";
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "560 / 400",
        maxWidth: 720,
      }}
    >
      <svg viewBox="0 0 600 400" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="gridp" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(147,197,253,0.04)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="600" height="400" fill="url(#gridp)" />

        {edges.map((e, i) => (
          <path
            key={`e-${i}`}
            d={edgePath(e)}
            stroke="rgba(147,197,253,0.12)"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {frame.tokens.map((tok) => {
          const a = nodeById[tok.edge.from];
          const b = nodeById[tok.edge.to];
          const mx = (a.x + b.x) / 2;
          return (
            <path
              key={`h${tok.id}`}
              d={`M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`}
              stroke={tok.color}
              strokeWidth="1.25"
              fill="none"
              opacity={0.4}
            />
          );
        })}

        {frame.tokens.map((tok) => {
          const a = nodeById[tok.edge.from];
          const b = nodeById[tok.edge.to];
          const mx = (a.x + b.x) / 2;
          const p = tok.p;
          const cx =
            (1 - p) * (1 - p) * (1 - p) * a.x +
            3 * (1 - p) * (1 - p) * p * mx +
            3 * (1 - p) * p * p * mx +
            p * p * p * b.x;
          const cy =
            (1 - p) * (1 - p) * (1 - p) * a.y +
            3 * (1 - p) * (1 - p) * p * a.y +
            3 * (1 - p) * p * p * b.y +
            p * p * p * b.y;
          return (
            <g key={tok.id}>
              <circle cx={cx} cy={cy} r="3.5" fill={tok.color} filter="url(#glow)" />
              <circle cx={cx} cy={cy} r="1.5" fill="white" />
            </g>
          );
        })}

        {nodes.map((n) => {
          const active = (frame.active[n.id] || 0) > frame.now;
          const c = nodeColor(n);
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              {active && <circle r="26" fill={c} opacity="0.18" filter="url(#glow)" />}
              <rect
                x={-46}
                y={-18}
                width={92}
                height={36}
                rx="4"
                fill="#0A1222"
                stroke={active ? c : "rgba(147,197,253,0.18)"}
                strokeWidth={active ? 1.5 : 1}
              />
              <circle cx={-36} cy={0} r="3" fill={c} />
              <text
                x={-28}
                y={-2}
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize="9"
                fontWeight="600"
                fill="#EEF3FA"
                letterSpacing="0.5"
              >
                {n.label}
              </text>
              <text
                x={-28}
                y={9}
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize="7"
                fill="#7A879D"
              >
                {n.sub}
              </text>
            </g>
          );
        })}

        {(
          [
            [8, 8],
            [592, 8],
            [8, 392],
            [592, 392],
          ] as const
        ).map(([x, y], i) => {
          const dx = x < 300 ? 1 : -1;
          const dy = y < 200 ? 1 : -1;
          return (
            <g key={i} stroke="rgba(147,197,253,0.3)" strokeWidth="1" fill="none">
              <path d={`M ${x} ${y + 10 * dy} L ${x} ${y} L ${x + 10 * dx} ${y}`} />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: -14,
          right: 0,
          display: "flex",
          gap: 12,
          fontFamily: "var(--iw-mono)",
          fontSize: 10,
          color: "var(--iw-fg-2)",
        }}
      >
        <span>
          <StatusDot size={5} /> <span style={{ marginLeft: 6 }}>LIVE</span>
        </span>
        <span>
          NODES <span style={{ color: "var(--iw-fg)" }}>{nodes.length}</span>
        </span>
        <span>
          FLOWS <span style={{ color: "var(--accent)" }}>{frame.tokens.length}</span>
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--iw-mono)",
          fontSize: 10,
          color: "var(--iw-fg-3)",
        }}
      >
        <span>{"// workflow :: ops.order-intake"}</span>
        <span>uptime 99.98%</span>
      </div>
    </div>
  );
}

export function FitSection() {
  return (
    <section
      id="fit"
      aria-labelledby="fit-heading"
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: SECTION_BG,
        backgroundImage: SECTION_SURFACE,
      }}
    >
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <h2 id="fit-heading" className="sr-only">
          Who we work with
        </h2>

        <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
          {/* Text column */}
          <div
            className="order-1 flex flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:order-1 lg:max-w-none lg:px-10 lg:pb-12 lg:pt-0"
          >
            <header className="flex flex-col gap-5">
              <p
                className="m-0 flex items-center gap-3"
                style={{
                  fontSize: "clamp(0.75rem, 0.9vw, 0.8125rem)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                <span aria-hidden className="h-3 w-0.5 shrink-0 rounded-[1px]" style={{ background: "var(--accent)" }} />
                Who we work with
              </p>
              <h3
                className="m-0 max-w-xl"
                style={{
                  fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                  fontSize: "clamp(1.65rem, 2.8vw, 2.35rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "#ffffff",
                }}
              >
                Teams scaling faster than their operations can keep up.
              </h3>
              <p
                className="m-0 max-w-xl"
                style={{
                  fontSize: "clamp(1rem, 1.15vw, 1.0625rem)",
                  lineHeight: 1.65,
                  color: "var(--iw-fg-2)",
                }}
              >
                We work with organizations where growth has exposed dependency, rework, slow handoffs, and fragmented systems.
              </p>
            </header>

            <div>
              <p
                className="m-0 mb-3"
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--iw-fg-3)",
                }}
              >
                Fit indicators
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:gap-3">
                {FIT_INDICATORS.map((text) => (
                  <li key={text} className="flex items-start gap-3 py-0.5 sm:py-1">
                    <span
                      aria-hidden
                      className="mt-2 h-px w-6 shrink-0"
                      style={{ background: "var(--accent)" }}
                    />
                    <span style={{ fontSize: 15, lineHeight: 1.55, color: "var(--iw-fg-1)" }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-1 px-5 py-6 sm:px-6 sm:py-7"
              style={{
                background: "var(--iw-panel)",
              }}
            >
              <h4
                className="m-0 mb-4 flex items-center gap-3"
                style={{
                  fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  color: "var(--iw-fg-1)",
                }}
              >
                <span aria-hidden className="h-4 w-0.5 shrink-0 rounded-[1px]" style={{ background: "var(--accent)" }} />
                Where this usually starts
              </h4>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {WHERE_STARTS.map((text) => (
                  <li
                    key={text}
                    className="relative pl-4"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--iw-fg-3)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full"
                      style={{ background: "var(--iw-fg-3)" }}
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="relative order-2 w-full lg:order-2"
            style={{
              paddingTop: 20,
              paddingBottom: 28,
            }}
          >
            <div className="relative mx-auto w-full max-w-[720px]">
              <FitDiagram />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </section>
  );
}
