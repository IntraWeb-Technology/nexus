"use client";

import { useId } from "react";

function M({ x, y, children, s = 9.5 }: { x: number; y: number; children: string; s?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill="#ffffff" style={{ fontFamily: "var(--iw-mono)", fontSize: s }}>
      {children}
    </text>
  );
}

export function OnboardingProcessDiagramDesktop() {
  const rid = useId().replace(/:/g, "");
  const mid = `ob-arr-${rid}`;
  return (
    <svg viewBox="0 0 700 260" width="100%" height="auto" role="img" aria-labelledby="ob-diagram-title">
      <title id="ob-diagram-title">Onboarding flow with eliminated documentation steps</title>
      <defs>
        <marker id={mid} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#d97706" />
        </marker>
      </defs>

      <rect x={12} y={102} width={124} height={48} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={74} y={130} s={9}>
        HR INTAKE
      </M>

      <rect x={164} y={88} width={104} height={42} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={216} y={112} s={9}>
        TOOL SETUP
      </M>

      <rect x={292} y={118} width={118} height={44} rx={3} fill="rgba(217,119,6,0.12)" stroke="#d97706" strokeWidth={1.8} />
      <M x={351} y={142} s={9}>
        ACCESS REQ
      </M>

      <rect x={438} y={72} width={96} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={486} y={94} s={8.5}>
        TRAINING
      </M>

      {/* Eliminated pair — docs + manager check */}
      <rect
        x={378}
        y={118}
        width={232}
        height={118}
        rx={4}
        fill="none"
        stroke="#ef3b24"
        strokeWidth={1.5}
        strokeDasharray="6 5"
      />
      <text x={388} y={134} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 11, fontWeight: 700 }}>
        ELIMINATED
      </text>

      <rect x={524} y={132} width={78} height={38} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={563} y={154} s={8}>
        DOCS
      </M>

      <rect x={392} y={188} width={132} height={42} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={458} y={212} s={8.5}>
        MANAGER CHK
      </M>

      <rect x={176} y={196} width={118} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1.2} />
      <M x={235} y={220} s={9}>
        FIRST TASK
      </M>

      <path d="M 136 126 H 158" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 268 118 L 324 126" stroke="#d97706" strokeWidth={1.8} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 410 132 L 434 94" stroke="#d97706" strokeWidth={1.6} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 486 112 L 548 132" stroke="#d97706" strokeWidth={1.3} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 563 170 L 458 188" stroke="#d97706" strokeWidth={1.2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 458 230 L 294 218" stroke="#d97706" strokeWidth={1.5} fill="none" markerEnd={`url(#${mid})`} />

      <path d="M 351 162 L 351 188" stroke="#ef3b24" strokeWidth={1.4} strokeDasharray="4 5" fill="none" />
      <text x={300} y={172} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 11, fontWeight: 700 }} transform="rotate(-12 300 172)">
        LOST IN TRANSITION
      </text>
    </svg>
  );
}

export function OnboardingProcessDiagramMobile() {
  const rid = useId().replace(/:/g, "");
  const mid = `obm-arr-${rid}`;
  return (
    <svg viewBox="0 0 300 540" width="100%" height="auto" role="img" aria-labelledby="ob-diagram-m-title">
      <title id="ob-diagram-m-title">Onboarding handoffs — mobile</title>
      <defs>
        <marker id={mid} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#d97706" />
        </marker>
      </defs>
      <rect x={72} y={12} width={156} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={150} y={36} s={9}>
        HR INTAKE
      </M>

      <rect x={88} y={76} width={124} height={40} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={150} y={100} s={9}>
        TOOL SETUP
      </M>

      <rect x={82} y={136} width={136} height={42} rx={3} fill="rgba(217,119,6,0.12)" stroke="#d97706" strokeWidth={2} />
      <M x={150} y={162} s={9}>
        ACCESS REQ
      </M>

      <rect x={96} y={198} width={108} height={38} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={150} y={220} s={8.5}>
        TRAINING
      </M>

      <rect x={48} y={252} width={204} height={120} rx={4} fill="none" stroke="#ef3b24" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={58} y={272} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 10, fontWeight: 700 }}>
        ELIMINATED
      </text>

      <rect x={104} y={282} width={92} height={36} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={150} y={304} s={8}>
        DOCS
      </M>

      <rect x={72} y={328} width={156} height={38} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1} />
      <M x={150} y={350} s={8.5}>
        MANAGER CHK
      </M>

      <rect x={82} y={388} width={136} height={44} rx={3} fill="rgba(18,18,18,0.98)" stroke="#d97706" strokeWidth={1.2} />
      <M x={150} y={414} s={9}>
        FIRST TASK
      </M>

      <path d="M 150 56 V 72" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 116 V 132" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 178 V 194" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 236 V 278" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 318 V 326" stroke="#d97706" strokeWidth={1.8} fill="none" markerEnd={`url(#${mid})`} />
      <path d="M 150 366 V 386" stroke="#d97706" strokeWidth={2} fill="none" markerEnd={`url(#${mid})`} />

      <text x={160} y={268} fill="#ef3b24" style={{ fontFamily: "var(--iw-body)", fontSize: 10, fontWeight: 700 }}>
        LOST IN TRANSITION
      </text>
    </svg>
  );
}
