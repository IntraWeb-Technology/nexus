// Terminal-style hero variant — an agent running live in a console
function HeroTerminal() {
  const lines = [
    { t: 0, txt: '$ iw diagnostic --target acme-corp', class: 'cmd' },
    { t: 400, txt: '→ mapping workflows...', class: 'dim' },
    { t: 900, txt: '  ✓ 47 processes identified', class: 'ok' },
    { t: 1300, txt: '  ✓ 12 automation candidates', class: 'ok' },
    { t: 1700, txt: '→ scoring by ROI...', class: 'dim' },
    { t: 2400, txt: '  ⚡ order-intake   ← est. 42h/wk saved', class: 'hot' },
    { t: 2700, txt: '  ⚡ invoice-recon  ← est. 18h/wk saved', class: 'hot' },
    { t: 3000, txt: '  ⚡ csm-handoff    ← est. 11h/wk saved', class: 'hot' },
    { t: 3500, txt: '→ generating roadmap...', class: 'dim' },
    { t: 4200, txt: '  ✓ roadmap.pdf written', class: 'ok' },
    { t: 4500, txt: '', class: '' },
    { t: 4700, txt: 'diagnostic complete. next: iw implement', class: 'accent' },
  ];
  const [shown, setShown] = React.useState([]);
  React.useEffect(() => {
    const timers = lines.map(l => setTimeout(() => setShown(s => [...s, l]), l.t + 400));
    const reset = setTimeout(() => setShown([]), 7500);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, []);
  React.useEffect(() => {
    if (shown.length >= lines.length) {
      const r = setTimeout(() => setShown([]), 2500);
      return () => clearTimeout(r);
    }
  }, [shown.length]);

  const colorFor = (c) => ({
    cmd: 'var(--iw-fg)', dim: 'var(--iw-fg-2)',
    ok: 'var(--accent)', hot: 'var(--iw-amber)', accent: 'var(--iw-fg)',
  }[c] || 'var(--iw-fg-1)');

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '560/400',
      maxWidth: 720,
      background: '#070C18',
      border: '1px solid var(--iw-hairline)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {/* window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--iw-hairline)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3f4a' }}/>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3f4a' }}/>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3f4a' }}/>
        <span className="mono" style={{ marginLeft: 14, fontSize: 10, color: 'var(--iw-fg-3)' }}>~/intraweb/engagements/acme-corp</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--iw-mono)', fontSize: 10, color: 'var(--iw-fg-2)' }}>
          <StatusDot size={5} /> LIVE
        </span>
      </div>
      <div style={{ padding: '16px 18px', fontFamily: 'var(--iw-mono)', fontSize: 12.5, lineHeight: 1.7 }}>
        {shown.map((l, i) => (
          <div key={i} style={{ color: colorFor(l.class), opacity: 0, animation: 'reveal-up 400ms var(--ease-out) forwards' }}>
            {l.txt || '\u00A0'}
          </div>
        ))}
        {shown.length < lines.length && (
          <span style={{
            display: 'inline-block', width: 8, height: 14, background: 'var(--accent)',
            animation: 'pulse-dot 1.2s steps(1) infinite', verticalAlign: 'middle',
          }}/>
        )}
      </div>
    </div>
  );
}

window.HeroTerminal = HeroTerminal;
