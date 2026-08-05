function Services() {
  const items = [
    {
      n: '01', title: 'Automated workflow sequences',
      desc: 'Approvals, routing, escalation—the multi-step processes that currently require manual coordination.',
      tags: ['n8n', 'temporal', 'custom'],
      icon: 'code',
    },
    {
      n: '02', title: 'Agent integrations',
      desc: 'Connecting your AI tools to your systems with proper error handling and fallbacks.',
      tags: ['openai', 'anthropic', 'langgraph'],
      icon: 'sparkles',
    },
    {
      n: '03', title: 'Exception handling logic',
      desc: 'What happens when automation fails. Alerts, fallbacks, human-in-the-loop escalation.',
      tags: ['slack', 'pagerduty', 'human-in-loop'],
      icon: 'shield',
    },
    {
      n: '04', title: 'Documentation & handoff',
      desc: 'Everything written down so your team can maintain and extend it.',
      tags: ['runbooks', 'observability', 'training'],
      icon: 'code',
    },
  ];

  return (
    <section id="services" data-screen-label="03 Services" style={{ padding: '140px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span className="section-marker">[ 03 — WHAT WE BUILD ]</span>
          <span className="section-marker">// four capabilities</span>
        </div>

        <Reveal>
          <Eyebrow>What we build</Eyebrow>
          <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1.05, fontWeight: 700, marginTop: 20, maxWidth: 900 }}>
            We build and deploy — not just advise.
          </h2>
          <p style={{ fontSize: 18, color: 'var(--iw-fg-2)', maxWidth: 640, marginTop: 20 }}>
            Four capabilities make up every IntraWeb engagement. We ship what we design.
          </p>
        </Reveal>

        <div style={{
          marginTop: 64,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          background: 'var(--iw-hairline)',
          border: '1px solid var(--iw-hairline)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 80}>
              <ServiceCard item={it} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ item }) {
  const [hover, setHover] = React.useState(false);
  const IconEl = Ic[item.icon];
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: 40,
        background: 'var(--iw-void)',
        minHeight: 320,
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* hover gradient wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(400px 300px at 30% 0%, rgba(52,231,208,0.08), transparent 70%)',
        opacity: hover ? 1 : 0, transition: 'opacity 400ms',
      }}/>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div className="mono" style={{
          fontSize: 11, color: 'var(--iw-fg-3)', letterSpacing: '0.18em',
        }}>{item.n}</div>
        <div style={{
          width: 44, height: 44, borderRadius: 4,
          border: '1px solid var(--iw-hairline)',
          background: hover ? 'var(--accent)' : 'transparent',
          color: hover ? 'var(--iw-void)' : 'var(--accent)',
          display: 'grid', placeItems: 'center',
          transition: 'all 300ms var(--ease)',
        }}>
          {IconEl && <IconEl width={20} height={20} />}
        </div>
      </div>

      <h3 style={{
        position: 'relative',
        marginTop: 80,
        fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1,
      }}>
        {item.title}
      </h3>

      <p style={{ position: 'relative', marginTop: 16, color: 'var(--iw-fg-2)', fontSize: 15 }}>
        {item.desc}
      </p>

      <div style={{ position: 'relative', marginTop: 28, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.tags.map(t => (
          <span key={t} className="mono" style={{
            fontSize: 10, letterSpacing: '0.1em',
            padding: '4px 8px',
            border: '1px solid var(--iw-hairline)',
            borderRadius: 3,
            color: 'var(--iw-fg-2)',
            background: 'rgba(16,26,46,0.6)',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

window.Services = Services;
