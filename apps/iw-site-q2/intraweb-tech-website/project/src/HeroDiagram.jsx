// The centerpiece: a live, always-running workflow diagram.
// Nodes represent: Email, CRM, Slack, AI Agent, Approval, Database, Alert
// Animated "tokens" travel along edges carrying tiny labels, nodes light up when processing.

function HeroDiagram({ intensity = 1 }) {
  const canvasRef = React.useRef(null);
  const [tick, setTick] = React.useState(0);

  // Graph definition — hand-tuned coordinates on a 560x400 canvas
  const nodes = React.useMemo(() => [
    { id: 'inbox',   x:  60, y:  80, label: 'INBOX',      sub: 'email.webhook', icon: 'mail',    kind: 'source' },
    { id: 'crm',     x:  60, y: 220, label: 'CRM',        sub: 'hubspot.sync',  icon: 'node',    kind: 'source' },
    { id: 'parse',   x: 220, y: 150, label: 'PARSE',      sub: 'extract.fields',icon: 'cpu',     kind: 'step'   },
    { id: 'agent',   x: 380, y: 150, label: 'AGENT',      sub: 'gpt-orch',      icon: 'sparkles',kind: 'ai'     },
    { id: 'rules',   x: 380, y:  50, label: 'RULES',      sub: 'exceptions',    icon: 'shield',  kind: 'step'   },
    { id: 'approve', x: 540, y:  90, label: 'APPROVE',    sub: 'human.review',  icon: 'check',   kind: 'human'  },
    { id: 'db',      x: 540, y: 220, label: 'DATABASE',   sub: 'ops.records',   icon: 'node',    kind: 'sink'   },
    { id: 'alert',   x: 380, y: 310, label: 'ALERT',      sub: 'slack.channel', icon: 'zap',     kind: 'sink'   },
    { id: 'audit',   x:  60, y: 340, label: 'AUDIT LOG',  sub: 'immutable',     icon: 'shield',  kind: 'sink'   },
  ], []);

  const edges = React.useMemo(() => [
    { from: 'inbox', to: 'parse' },
    { from: 'crm',   to: 'parse' },
    { from: 'parse', to: 'agent' },
    { from: 'agent', to: 'rules' },
    { from: 'rules', to: 'approve' },
    { from: 'agent', to: 'approve' },
    { from: 'agent', to: 'db' },
    { from: 'agent', to: 'alert' },
    { from: 'parse', to: 'audit' },
    { from: 'agent', to: 'audit' },
  ], []);

  const nodeById = React.useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  // Tokens — flowing data packets on edges
  const tokensRef = React.useRef([]);
  const lastSpawnRef = React.useRef(0);

  // active status for node pulses
  const activeUntilRef = React.useRef({});

  // animation loop
  React.useEffect(() => {
    if (intensity === 0) return;
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min(60, t - last);
      last = t;

      // spawn tokens periodically
      if (t - lastSpawnRef.current > 700 / intensity) {
        lastSpawnRef.current = t;
        const startEdges = edges.filter(e => ['inbox','crm'].includes(e.from));
        const start = startEdges[Math.floor(Math.random() * startEdges.length)];
        tokensRef.current.push({
          id: Math.random(),
          edge: start,
          p: 0,
          payload: ['order #', 'ticket #', 'lead #', 'invoice #'][Math.floor(Math.random()*4)] + (1000 + Math.floor(Math.random()*9000)),
          color: Math.random() > 0.8 ? 'var(--iw-amber)' : 'var(--accent)',
        });
      }

      // advance tokens
      const speed = 0.0006 * intensity;
      tokensRef.current = tokensRef.current.flatMap(tok => {
        const np = tok.p + dt * speed;
        if (np >= 1) {
          // arrive at node -> activate, maybe forward
          activeUntilRef.current[tok.edge.to] = t + 400;
          const outs = edges.filter(e => e.from === tok.edge.to);
          if (outs.length === 0) return []; // sink
          // continue on 1-2 outgoing edges probabilistically
          const picks = outs.filter(() => Math.random() > 0.35);
          const chosen = picks.length ? picks : [outs[Math.floor(Math.random()*outs.length)]];
          return chosen.map(e => ({ ...tok, id: Math.random(), edge: e, p: 0 }));
        }
        return [{ ...tok, p: np }];
      });

      // trim
      if (tokensRef.current.length > 30) tokensRef.current = tokensRef.current.slice(-30);

      setTick(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [edges, intensity]);

  const now = tick;

  // helpers
  const edgePath = (e) => {
    const a = nodeById[e.from], b = nodeById[e.to];
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };

  const nodeColor = (n) => {
    if (n.kind === 'ai') return 'var(--iw-amber)';
    if (n.kind === 'human') return 'var(--iw-plum)';
    return 'var(--accent)';
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '560 / 400',
      maxWidth: 720,
    }}>
      <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="gridp" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(147,197,253,0.04)" strokeWidth="1"/>
          </pattern>
        </defs>

        {/* grid background */}
        <rect width="600" height="400" fill="url(#gridp)" />

        {/* edges */}
        {edges.map((e, i) => (
          <path key={i} d={edgePath(e)} stroke="rgba(147,197,253,0.12)" strokeWidth="1" fill="none" />
        ))}

        {/* active edge highlight based on tokens present */}
        {tokensRef.current.map(tok => {
          const a = nodeById[tok.edge.from], b = nodeById[tok.edge.to];
          const mx = (a.x + b.x) / 2;
          return (
            <path key={'h'+tok.id} d={`M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`}
              stroke={tok.color} strokeWidth="1.25" fill="none" opacity={0.4} />
          );
        })}

        {/* tokens */}
        {tokensRef.current.map(tok => {
          const a = nodeById[tok.edge.from], b = nodeById[tok.edge.to];
          const mx = (a.x + b.x) / 2;
          // evaluate bezier at p
          const p = tok.p;
          const cx = (1-p)*(1-p)*(1-p)*a.x + 3*(1-p)*(1-p)*p*mx + 3*(1-p)*p*p*mx + p*p*p*b.x;
          const cy = (1-p)*(1-p)*(1-p)*a.y + 3*(1-p)*(1-p)*p*a.y + 3*(1-p)*p*p*b.y + p*p*p*b.y;
          return (
            <g key={tok.id}>
              <circle cx={cx} cy={cy} r="3.5" fill={tok.color} filter="url(#glow)" />
              <circle cx={cx} cy={cy} r="1.5" fill="white" />
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map(n => {
          const active = (activeUntilRef.current[n.id] || 0) > now;
          const c = nodeColor(n);
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              {/* halo */}
              {active && <circle r="26" fill={c} opacity="0.18" filter="url(#glow)" />}
              {/* card */}
              <rect x={-46} y={-18} width={92} height={36} rx="4"
                fill="#0A1222"
                stroke={active ? c : 'rgba(147,197,253,0.18)'}
                strokeWidth={active ? 1.5 : 1}
                style={{ transition: 'all 200ms' }}
              />
              {/* dot */}
              <circle cx={-36} cy={0} r="3" fill={c} />
              {/* label */}
              <text x={-28} y={-2} fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" fill="#EEF3FA" letterSpacing="0.5">{n.label}</text>
              <text x={-28} y={9} fontFamily="JetBrains Mono" fontSize="7" fill="#7A879D">{n.sub}</text>
            </g>
          );
        })}

        {/* corner brackets for "instrument" feel */}
        {[[8,8],[592,8],[8,392],[592,392]].map(([x,y], i) => {
          const dx = x < 300 ? 1 : -1;
          const dy = y < 200 ? 1 : -1;
          return (
            <g key={i} stroke="rgba(147,197,253,0.3)" strokeWidth="1" fill="none">
              <path d={`M ${x} ${y + 10*dy} L ${x} ${y} L ${x + 10*dx} ${y}`} />
            </g>
          );
        })}
      </svg>

      {/* Overlay metrics */}
      <div style={{
        position: 'absolute', top: -14, right: 0,
        display: 'flex', gap: 12,
        fontFamily: 'var(--iw-mono)', fontSize: 10,
        color: 'var(--iw-fg-2)',
      }}>
        <span><StatusDot size={5}/> <span style={{ marginLeft: 6 }}>LIVE</span></span>
        <span>NODES <span style={{ color: 'var(--iw-fg)' }}>{nodes.length}</span></span>
        <span>FLOWS <span style={{ color: 'var(--accent)' }}>{tokensRef.current.length}</span></span>
      </div>

      <div style={{
        position: 'absolute', bottom: -20, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--iw-mono)', fontSize: 10,
        color: 'var(--iw-fg-3)',
      }}>
        <span>// workflow :: ops.order-intake</span>
        <span>uptime 99.98%</span>
      </div>
    </div>
  );
}

window.HeroDiagram = HeroDiagram;
