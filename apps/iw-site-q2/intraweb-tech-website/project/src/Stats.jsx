function Stats() {
  const stats = [
    { n: 95, suffix: '%', label: 'AI pilots that fail to ROI', source: 'RAND, 2024' },
    { n: 42, suffix: 'h', label: 'Hours/wk saved per workflow', source: 'avg. client outcome' },
    { n: 6, suffix: ' mo', label: 'To measurable P&L impact', source: 'after diagnostic' },
    { n: 99.98, suffix: '%', label: 'Uptime on deployed flows', source: 'rolling 12 mo', decimals: 2 },
  ];

  return (
    <section id="stats" data-screen-label="06 Stats" style={{
      padding: '120px 0', position: 'relative',
      borderTop: '1px solid var(--iw-hairline)',
      borderBottom: '1px solid var(--iw-hairline)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(52,231,208,0.06), transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <span className="section-marker">[ 06 — BY THE NUMBERS ]</span>
          <span className="section-marker">// instrumented</span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2,
          background: 'var(--iw-hairline)',
          border: '1px solid var(--iw-hairline)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{
                padding: '40px 32px',
                background: 'var(--iw-void)',
                minHeight: 220,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative',
              }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-3)', letterSpacing: '0.2em' }}>
                  {String(i+1).padStart(2, '0')} / 04
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--iw-display)', fontSize: 'clamp(52px, 5.5vw, 88px)',
                    fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1,
                    background: i === 0
                      ? 'linear-gradient(180deg, var(--iw-amber) 0%, var(--iw-amber-hot) 100%)'
                      : 'linear-gradient(180deg, var(--iw-fg) 0%, var(--accent) 120%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    <Counter to={s.n} suffix={s.suffix} decimals={s.decimals || 0} />
                  </div>
                  <div style={{ marginTop: 14, fontSize: 14, color: 'var(--iw-fg-1)', lineHeight: 1.4 }}>
                    {s.label}
                  </div>
                  <div className="mono" style={{ marginTop: 8, fontSize: 10, color: 'var(--iw-fg-3)', letterSpacing: '0.15em' }}>
                    {s.source}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Stats = Stats;
