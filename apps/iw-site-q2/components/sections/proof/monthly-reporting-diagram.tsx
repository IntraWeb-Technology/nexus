"use client";

import { useId } from "react";

function MonoTxt({ x, y, children, size = 10 }: { x: number; y: number; children: string; size?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="#ffffff"
      style={{ fontFamily: "var(--iw-mono)", fontSize: size }}
    >
      {children}
    </text>
  );
}

export function MonthlyReportingDiagramDesktop() {
  const rid = useId().replace(/:/g, "");
  const mid = `mr-arr-${rid}`;
  return (
    <svg viewBox="0 0 680 280" width="100%" height="auto" role="img" aria-labelledby="mr-diagram-title">
      <title id="mr-diagram-title">Reporting inputs converge on one manual assembly point</title>
      <defs>
        <marker id={mid} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#d97706" />
        </marker>
      </defs>
      {/* feeder nodes — asymmetric */}
      <rect x={20} y={36} width={118} height={46} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={79} y={54} size={9}>
        EMAIL REQUESTS
      </MonoTxt>
      <MonoTxt x={79} y={68} size={9}>
        (scattered)
      </MonoTxt>

      <rect x={40} y={118} width={124} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={102} y={142} size={9.5}>
        DATA EXTRACTS
      </MonoTxt>

      <rect x={246} y={24} width={132} height={52} rx={3} fill="rgba(217,119,6,0.14)" stroke="#d97706" strokeWidth={2} />
      <MonoTxt x={312} y={44} size={10}>
        ONE PERSON
      </MonoTxt>
      <MonoTxt x={312} y={60} size={9}>
        (manual assembly)
      </MonoTxt>

      <rect x={460} y={78} width={116} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={518} y={102} size={9}>
        REPORT BUILD
      </MonoTxt>

      <rect x={430} y={168} width={128} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={494} y={192} size={9}>
        MANUAL CLEANUP
      </MonoTxt>

      <rect x={208} y={196} width={154} height={48} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={285} y={224} size={9}>
        STAKEHOLDER WAITING
      </MonoTxt>

      <path d="M 138 82 L 260 52" stroke="#d97706" strokeWidth={1.8} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 164 136 L 268 72" stroke="#d97706" strokeWidth={2.2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 378 76 L 452 96" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 518 122 L 504 168" stroke="#d97706" strokeWidth={1.4} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 430 190 L 362 210" stroke="#d97706" strokeWidth={1.2} fill="none" markerEnd={`url(#${mid})`} opacity={0.85} />

      <path d="M 200 42 L 285 42" stroke="#d97706" strokeWidth={1.2} fill="none" markerEnd={`url(#${mid})`} />
      <text x={208} y={34} fill="#d97706" style={{ fontFamily: "var(--iw-body)", fontSize: 11, fontWeight: 700 }}>
        THE BOTTLENECK
      </text>

      <path d="M 312 78 L 312 112" stroke="#ef3b24" strokeWidth={1.4} strokeDasharray="4 4" fill="none" />
      <text x={318} y={98} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 11, fontWeight: 700 }} transform="rotate(90 318 98)">
        DELAYS EVERYTHING
      </text>
    </svg>
  );
}

export function MonthlyReportingDiagramMobile() {
  const rid = useId().replace(/:/g, "");
  const mid = `mrm-arr-${rid}`;
  return (
    <svg viewBox="0 0 300 480" width="100%" height="auto" role="img" aria-labelledby="mr-diagram-m-title">
      <title id="mr-diagram-m-title">Manual reporting bottleneck</title>
      <defs>
        <marker id={mid} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#d97706" />
        </marker>
      </defs>
      <rect x={54} y={16} width={192} height={56} rx={3} fill="rgba(217,119,6,0.14)" stroke="#d97706" strokeWidth={2} />
      <MonoTxt x={150} y={40} size={10}>
        ONE PERSON
      </MonoTxt>
      <MonoTxt x={150} y={56} size={9}>
        (assembly)
      </MonoTxt>

      <rect x={32} y={100} width={112} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={88} y={124} size={8.5}>
        EMAIL REQ
      </MonoTxt>

      <rect x={156} y={100} width={112} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={212} y={124} size={8.5}>
        EXTRACTS
      </MonoTxt>

      <rect x={86} y={168} width={128} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={150} y={192} size={8.5}>
        REPORT BUILD
      </MonoTxt>

      <rect x={86} y={236} width={128} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={150} y={260} size={8.5}>
        CLEANUP
      </MonoTxt>

      <rect x={62} y={304} width={176} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <MonoTxt x={150} y={330} size={8.5}>
        STAKEHOLDER WAIT
      </MonoTxt>

      <path d="M 88 120 L 120 72" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 212 120 L 180 72" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 188 L 150 168" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 256 L 150 236" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 324 L 150 304" stroke="#d97706" strokeWidth={1.6} fill="none" markerEnd={`url(#${mid})`} />

      <text x={150} y={84} textAnchor="middle" fill="#d97706" style={{ fontFamily: "var(--iw-body)", fontSize: 10, fontWeight: 700 }}>
        THE BOTTLENECK
      </text>
      <text x={232} y={200} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 10, fontWeight: 700 }}>
        DELAYS EVERYTHING
      </text>
    </svg>
  );
}
