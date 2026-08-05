// Kinetic typography hero variant — large rotating phrase over a morphing grid
function HeroKinetic() {
  const phrases = ['actually works.', 'ships to prod.', 'moves the P&L.', 'survives contact with ops.'];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % phrases.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: 'relative',
      width: '100%', aspectRatio: '560/400',
      maxWidth: 720,
      background: 'radial-gradient(circle at 50% 50%, rgba(52,231,208,0.12), transparent 70%)',
      border: '1px solid var(--iw-hairline)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      display: 'grid', placeItems: 'center',
    }}>
      <svg viewBox="0 0 600 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
        <defs>
          <pattern id="kg" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(147,197,253,0.12)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#kg)" />
      </svg>
      <div style={{ position: 'relative', textAlign: 'center', padding: 40 }}>
        <div style={{ fontFamily: 'var(--iw-mono)', fontSize: 11, color: 'var(--iw-fg-2)', letterSpacing: '0.2em', marginBottom: 20 }}>
          AI IMPLEMENTATION THAT —
        </div>
        <div style={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          {phrases.map((p, idx) => (
            <div key={p} style={{
              position: 'absolute', inset: 0,
              fontFamily: 'var(--iw-display)', fontWeight: 800, fontSize: 'clamp(34px, 5vw, 56px)',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, var(--iw-fg) 0%, var(--accent) 120%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              opacity: idx === i ? 1 : 0,
              transform: idx === i ? 'translateY(0)' : (idx < i ? 'translateY(-30px)' : 'translateY(30px)'),
              transition: 'all 600ms var(--ease-out)',
            }}>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.HeroKinetic = HeroKinetic;
