function CTA() {
  return (
    <section id="cta" data-screen-label="08 CTA" style={{ padding: '140px 0', position: 'relative' }}>
      <div className="container">
        <div style={{
          position: 'relative',
          padding: '96px 64px',
          background: 'linear-gradient(135deg, rgba(52,231,208,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(255,161,85,0.08) 100%)',
          border: '1px solid rgba(52,231,208,0.25)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* orbs */}
          <div style={{
            position: 'absolute', top: -150, left: -150, width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,231,208,0.25), transparent 60%)',
            filter: 'blur(40px)', animation: 'orb-float 10s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', bottom: -150, right: -150, width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,161,85,0.22), transparent 60%)',
            filter: 'blur(40px)', animation: 'orb-float 12s ease-in-out infinite reverse',
          }}/>

          {/* grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(147,197,253,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}/>

          <div style={{ position: 'relative' }}>
            <Eyebrow>Ready when you are</Eyebrow>
            <h2 style={{
              fontSize: 'clamp(44px, 6vw, 88px)',
              fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.02,
              marginTop: 20, marginBottom: 20,
            }}>
              Ready to see if we're<br/>
              <span style={{
                background: 'linear-gradient(95deg, var(--accent), var(--iw-amber))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>the right fit?</span>
            </h2>
            <p style={{ fontSize: 19, color: 'var(--iw-fg-1)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.55 }}>
              2–3 weeks. You'll know exactly where automation will drive savings — and have a roadmap to act on.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn variant="primary" href="#">Book a diagnostic call</Btn>
              <Btn variant="secondary" href="#faq" icon={false}>Read the FAQ</Btn>
            </div>
            <div className="mono" style={{ marginTop: 40, fontSize: 11, color: 'var(--iw-fg-2)', letterSpacing: '0.15em' }}>
              NO COMMITMENT · IF WE'RE NOT THE FIT, WE'LL TELL YOU
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.CTA = CTA;
