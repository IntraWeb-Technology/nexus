function TargetClient() {
  return (
    <section id="about" data-screen-label="07 Target" style={{ padding: '140px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span className="section-marker">[ 07 — WHO WE WORK WITH ]</span>
          <span className="section-marker">// fit criteria</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <Reveal>
            <div>
              <Eyebrow>Who we work with</Eyebrow>
              <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.05, fontWeight: 700, marginTop: 20 }}>
                Operations-focused SMBs, 20–150 employees.
              </h2>
              <p style={{ fontSize: 18, color: 'var(--iw-fg-1)', marginTop: 24, lineHeight: 1.6 }}>
                We work with a small number of companies so we can deliver real capability. 15+ years of engineering — production systems, not prototypes. Based in New Jersey, working with growing companies nationally.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['New Jersey', 'National reach', 'Tool-agnostic', 'Senior team'].map(t => (
                  <span key={t} className="mono" style={{
                    fontSize: 11, letterSpacing: '0.1em',
                    padding: '6px 12px', border: '1px solid var(--iw-hairline)',
                    borderRadius: 3, color: 'var(--iw-fg-1)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--iw-hairline)', border: '1px solid var(--iw-hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{ padding: 28, background: 'var(--iw-void)' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>✓ FIT</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  {['20–150 employees', 'Ops-heavy workflows', 'Existing AI tool sprawl', 'Want production outcomes'].map(x => (
                    <li key={x} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                      <Ic.check width={14} height={14} style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0 }}/> {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ padding: 28, background: 'var(--iw-void)' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-3)', letterSpacing: '0.2em', marginBottom: 16 }}>✕ NOT A FIT</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'var(--iw-fg-2)' }}>
                  {['One-time projects', 'Chatbot-only scope', 'Very small teams', 'Pure strategy decks'].map(x => (
                    <li key={x} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                      <Ic.x width={14} height={14} style={{ color: 'var(--iw-fg-3)', marginTop: 3, flexShrink: 0 }}/> {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

window.TargetClient = TargetClient;
