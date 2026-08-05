function Footer() {
  return (
    <footer data-screen-label="10 Footer" style={{
      padding: '80px 0 40px',
      borderTop: '1px solid var(--iw-hairline)',
      position: 'relative',
    }}>
      <div className="container">
        {/* giant wordmark */}
        <div style={{
          fontFamily: 'var(--iw-display)',
          fontSize: 'clamp(80px, 16vw, 240px)',
          fontWeight: 800, letterSpacing: '-0.055em',
          lineHeight: 0.9,
          background: 'linear-gradient(180deg, var(--iw-fg-1) 0%, transparent 120%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 60,
          userSelect: 'none',
        }}>
          IntraWeb<span style={{ color: 'var(--accent)', WebkitTextFillColor: 'var(--accent)' }}>.</span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 40, paddingBottom: 60, borderBottom: '1px solid var(--iw-hairline)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 24, height: 24, background: 'var(--iw-fg)', borderRadius: 3,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--iw-display)', fontWeight: 800, fontSize: 12, color: 'var(--iw-void)',
              }}>IW</div>
              <span style={{ fontFamily: 'var(--iw-display)', fontWeight: 700, fontSize: 15 }}>IntraWeb Technologies</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--iw-fg-2)', maxWidth: 340, lineHeight: 1.55 }}>
              The implementation layer between AI tools and operations. Based in New Jersey, working nationally.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              {[Ic.mail, Ic.linkedin, Ic.github].map((I, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, border: '1px solid var(--iw-hairline)',
                  borderRadius: 4, display: 'grid', placeItems: 'center',
                  color: 'var(--iw-fg-1)', transition: 'all 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--iw-hairline)'; e.currentTarget.style.color = 'var(--iw-fg-1)'; }}
                ><I width={16} height={16}/></a>
              ))}
            </div>
          </div>

          {[
            { h: 'Company', links: ['About', 'Process', 'Careers', 'Contact'] },
            { h: 'Services', links: ['AI Engineering', 'AI Transformation', 'Agent Readiness', 'Implementation'] },
            { h: 'Resources', links: ['FAQ', 'Website Intake', 'Privacy', 'Terms'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-3)', letterSpacing: '0.2em', marginBottom: 16 }}>
                {col.h.toUpperCase()}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize: 14, color: 'var(--iw-fg-1)' }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: 30, display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          fontFamily: 'var(--iw-mono)', fontSize: 11, color: 'var(--iw-fg-3)',
          letterSpacing: '0.1em',
        }}>
          <span>© 2026 INTRAWEB TECHNOLOGIES, LLC</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <span><StatusDot size={5}/> SYSTEM OPERATIONAL</span>
            <span>v26.1.0</span>
            <span>NJ · USA</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
