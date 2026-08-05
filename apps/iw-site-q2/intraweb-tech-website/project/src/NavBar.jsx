function NavBar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['Process', '#process'],
    ['Services', '#services'],
    ['About', '#about'],
    ['FAQ', '#faq'],
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 50,
      padding: scrolled ? '10px 0' : '18px 0',
      background: scrolled ? 'rgba(5, 9, 18, 0.72)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--iw-hairline)' : '1px solid transparent',
      transition: 'all 280ms var(--ease)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, position: 'relative',
            display: 'grid', placeItems: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, var(--iw-teal) 0%, var(--iw-amber) 100%)',
              borderRadius: 4,
              filter: 'blur(8px)', opacity: 0.6,
            }} />
            <div style={{
              position: 'relative', width: 24, height: 24,
              background: 'var(--iw-fg)',
              borderRadius: 3,
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--iw-display)', fontWeight: 800,
              fontSize: 13, color: 'var(--iw-void)',
              letterSpacing: '-0.03em',
            }}>IW</div>
          </div>
          <span style={{ fontFamily: 'var(--iw-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
            IntraWeb
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-3)', marginLeft: 4, padding: '2px 6px', border: '1px solid var(--iw-hairline)', borderRadius: 3 }}>v26.1</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {links.map(([label, href]) => (
            <a key={href} href={href} style={{
              padding: '8px 14px',
              fontSize: 14,
              color: 'var(--iw-fg-1)',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--iw-fg)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--iw-fg-1)'}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mono" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: 'var(--iw-fg-2)',
            padding: '6px 10px',
            border: '1px solid var(--iw-hairline)',
            borderRadius: 3,
          }}>
            <StatusDot color="var(--iw-teal)" size={5} />
            <span>ACCEPTING Q2 ENGAGEMENTS</span>
          </div>
          <Btn variant="primary" icon={true} href="#cta">Start Diagnostic</Btn>
        </div>
      </div>
    </nav>
  );
}

window.NavBar = NavBar;
