function FAQ() {
  const items = [
    { q: 'What is the diagnostic?', a: 'The diagnostic is a 2–3 week engagement where we review your current workflows, identify automation opportunities, and deliver a prioritized implementation roadmap. It is a standalone service with no required long-term commitment.' },
    { q: 'How long does implementation take?', a: 'Implementation runs on a 6-month minimum retainer after the diagnostic. Final scope and timeline depend on roadmap priorities, existing systems, and integration complexity.' },
    { q: 'Who is IntraWeb right for?', a: 'Operations-focused SMBs, typically 20–150 employees, that need help implementing AI and workflow automation in day-to-day operations. Not the right fit for one-time projects, chatbot-only requests, or very small teams.' },
    { q: 'What sets you apart from consultants or dev shops?', a: 'We focus on implementation and operational rollout, not only strategy recommendations. The engagement includes workflow build, deployment, and iteration based on measurable business outcomes.' },
    { q: 'How do I get started?', a: 'Submit a request through the contact form to schedule a diagnostic call. We typically respond within one business day and confirm whether the engagement is a good fit.' },
  ];

  const [open, setOpen] = React.useState(0);

  return (
    <section id="faq" data-screen-label="09 FAQ" style={{ padding: '140px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span className="section-marker">[ 09 — FAQ ]</span>
          <span className="section-marker">// 05 entries</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'start' }}>
          <Reveal>
            <div style={{ position: 'sticky', top: 100 }}>
              <Eyebrow>FAQ</Eyebrow>
              <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.05, fontWeight: 700, marginTop: 20 }}>
                Common questions.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--iw-fg-2)', marginTop: 20, maxWidth: 360 }}>
                Still have one? Reach out — we respond within one business day.
              </p>
            </div>
          </Reveal>

          <div>
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={i} delay={i * 40}>
                  <div style={{ borderTop: '1px solid var(--iw-hairline)' }}>
                    <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
                      width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
                      color: 'inherit', cursor: 'pointer',
                      padding: '28px 0',
                      display: 'grid', gridTemplateColumns: '40px 1fr 32px', gap: 20, alignItems: 'center',
                    }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--iw-fg-3)', letterSpacing: '0.18em' }}>
                        {String(i+1).padStart(2,'0')}
                      </span>
                      <span style={{ fontFamily: 'var(--iw-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em' }}>
                        {it.q}
                      </span>
                      <span style={{
                        width: 32, height: 32, border: '1px solid var(--iw-hairline)',
                        borderRadius: '50%', display: 'grid', placeItems: 'center',
                        color: isOpen ? 'var(--accent)' : 'var(--iw-fg-1)',
                        borderColor: isOpen ? 'var(--accent)' : 'var(--iw-hairline)',
                        transition: 'all 300ms',
                      }}>
                        {isOpen ? <Ic.minus width={14} height={14}/> : <Ic.plus width={14} height={14}/>}
                      </span>
                    </button>
                    <div style={{
                      overflow: 'hidden',
                      maxHeight: isOpen ? 240 : 0,
                      opacity: isOpen ? 1 : 0,
                      transition: 'max-height 400ms var(--ease), opacity 300ms',
                    }}>
                      <div style={{
                        padding: '0 0 32px 60px',
                        fontSize: 16, color: 'var(--iw-fg-1)', lineHeight: 1.65, maxWidth: 720,
                      }}>{it.a}</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <div style={{ borderTop: '1px solid var(--iw-hairline)' }}/>
          </div>
        </div>
      </div>
    </section>
  );
}

window.FAQ = FAQ;
