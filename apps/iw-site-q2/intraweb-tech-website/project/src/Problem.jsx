function Problem() {
  return (
    <section id="problem" data-screen-label="02 Problem" style={{ padding: '140px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span className="section-marker">[ 02 — THE PROBLEM ]</span>
          <span className="section-marker">// pilot→prod gap</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <Reveal>
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1.05, fontWeight: 700, marginTop: 24 }}>
                Your team bought the tools. You ran the pilots.{' '}
                <span style={{ color: 'var(--iw-fg-2)' }}>You're still drowning in Slack threads and manual handoffs.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                ['Pilots never made it past a demo', 'Prototypes are not production.'],
                ['Edge cases aren\'t handled', 'What happens when the model gets it wrong?'],
                ['No owner after handoff', 'Consultants leave, your team re-learns.'],
                ['Tool sprawl, no coherence', 'Six AI tools, none of them integrated.'],
              ].map(([h, p], i) => (
                <div key={i} style={{
                  padding: '24px 0',
                  borderTop: '1px solid var(--iw-hairline)',
                  display: 'grid', gridTemplateColumns: '40px 1fr', gap: 20, alignItems: 'start',
                }}>
                  <div className="mono" style={{ color: 'var(--iw-fg-3)', fontSize: 11, paddingTop: 4 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--iw-display)', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 6 }}>
                      {h}
                    </div>
                    <div style={{ color: 'var(--iw-fg-2)', fontSize: 14 }}>{p}</div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--iw-hairline)' }}/>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

window.Problem = Problem;
