"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StatusDot } from "@/components/primitives";

type NodeKind = "source" | "step" | "ai" | "human" | "sink";

type DiagramNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  kind: NodeKind;
};

type Edge = { from: string; to: string };

type Token = {
  id: number;
  edge: Edge;
  p: number;
  payload: string;
  color: string;
};

export function HeroDiagram({ intensity = 1 }: { intensity?: number }) {
  const [frame, setFrame] = useState<{
    now: number;
    tokens: Token[];
    active: Record<string, number>;
  }>({ now: 0, tokens: [], active: {} });

  const nodes = useMemo<DiagramNode[]>(
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

  const edges = useMemo<Edge[]>(
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
    if (intensity === 0) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(60, t - last);
      last = t;

      if (t - lastSpawnRef.current > 700 / intensity) {
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

      const speed = 0.0006 * intensity;
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
  }, [edges, intensity]);

  const edgePath = (e: Edge) => {
    const a = nodeById[e.from];
    const b = nodeById[e.to];
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };

  const nodeColor = (n: DiagramNode) => {
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
