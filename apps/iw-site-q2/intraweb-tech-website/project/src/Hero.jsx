function Hero({ variant = 'diagram', intensity = 1 }) {
  const heroRef = React.useRef(null);
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    if (intensity === 0) return;
    const onMove = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!heroRef.current) return;
        const r = heroRef.current.getBoundingClientRect();
        setMouse({
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        });
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [intensity]);

  return (
    <section ref={heroRef} id="hero" data-screen-label="01 Hero" style={{
      position: 'relative',
      minHeight: '100vh',
      paddingTop: 140,
      paddingBottom: 80,
      overflow: 'hidden',
    }}>
      {/* Cursor-reactive aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(500px 500px at ${mouse.x*100}% ${mouse.y*100}%, rgba(52,231,208,0.18), transparent 60%),
          radial-gradient(600px 400px at ${(1-mouse.x)*100}% ${mouse.y*100}%, rgba(255,161,85,0.10), transparent 60%)
        `,
        transition: 'background 200ms linear',
      }} />

      {/* ambient orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '60%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 65%)',
        filter: 'blur(40px)',
        animation: 'orb-float 12s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%',
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,231,208,0.18), transparent 65%)',
        filter: 'blur(40px)',
        animation: 'orb-float 14s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }}/>

      {/* grid under hero */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(147,197,253,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
      }}/>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Top row: marker + announcement */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <span className="section-marker">[ 01 — HERO ]</span>
          <a href="#cta" className="mono" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: 11, color: 'var(--iw-fg-1)',
            padding: '8px 14px',
            border: '1px solid var(--iw-hairline)',
            borderRadius: 999,
            background: 'rgba(16,26,46,0.5)',
            backdropFilter: 'blur(10px)',
          }}>
            <StatusDot color="var(--iw-amber)" size={5} />
            <span style={{ letterSpacing: '0.12em' }}>Q2 2026 · Diagnostic slots: 3 remaining</span>
            <Ic.arrow width={12} height={12} />
          </a>
        </div>

        {/* Main hero — two column on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: 60,
          alignItems: 'center',
        }}>
          {/* Left: headline */}
          <div>
            <Reveal>
              <Eyebrow n="02">Implementation layer for AI</Eyebrow>
            </Reveal>

            <Reveal delay={120}>
              <h1 style={{
                fontSize: 'clamp(48px, 7.5vw, 108px)',
                lineHeight: 0.96,
                letterSpacing: '-0.035em',
                fontWeight: 700,
                marginTop: 28,
                marginBottom: 36,
              }}>
                <span style={{ display: 'block', color: 'var(--iw-fg)' }}>95% of AI pilots</span>
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(100deg, var(--iw-fg-2) 0%, var(--iw-fg-2) 30%, var(--iw-fg-3) 60%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>fail to deliver ROI.</span>
                <span style={{
                  display: 'block',
                  background: `linear-gradient(95deg, var(--iw-fg) 0%, var(--accent) 50%, var(--iw-amber) 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(52,231,208,0.2))',
                }}>We fix that.</span>
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p style={{ fontSize: 19, lineHeight: 1.55, maxWidth: 520, color: 'var(--iw-fg-1)', marginBottom: 40 }}>
                IntraWeb is the implementation layer between AI tools and your operations. We build the workflows, integrations, and exception handling that turn AI pilots into measurable operational savings.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Btn variant="primary" href="#cta">Start with a diagnostic</Btn>
                <Btn variant="secondary" href="#process" icon={false}>
                  <Ic.play width={14} height={14} /> <span>See how we work</span>
                </Btn>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div style={{
                marginTop: 60,
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                borderTop: '1px solid var(--iw-hairline)',
                paddingTop: 24,
                gap: 20,
              }}>
                {[
                  ['2–3 wk', 'Diagnostic'],
                  ['6 mo', 'Min retainer'],
                  ['20–150', 'Employees'],
                ].map(([v, l], i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--iw-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{v}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-2)', marginTop: 4, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: the live visual */}
          <Reveal delay={200}>
            <div style={{ position: 'relative' }}>
              {variant === 'diagram' && <HeroDiagram intensity={intensity} />}
              {variant === 'kinetic' && <HeroKinetic />}
              {variant === 'terminal' && <HeroTerminal />}
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div style={{
          marginTop: 80,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'var(--iw-mono)', fontSize: 11, color: 'var(--iw-fg-3)',
        }}>
          <div style={{ width: 40, height: 1, background: 'var(--iw-hairline)' }}/>
          <span>Scroll to explore</span>
          <Ic.arrowDown width={14} height={14} />
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
