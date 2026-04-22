// Tweaks panel — exposed via edit mode toggle
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "diagram",
  "motionIntensity": 1.0,
  "accent": "teal",
  "density": "comfortable"
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  teal:   { '--accent': '#34E7D0', '--accent-2': '#FFA155' },
  amber:  { '--accent': '#FFA155', '--accent-2': '#34E7D0' },
  plum:   { '--accent': '#A78BFA', '--accent-2': '#34E7D0' },
  electric:{ '--accent': '#60A5FA', '--accent-2': '#F472B6' },
};

function Tweaks({ state, setState }) {
  const [active, setActive] = React.useState(false);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setActive(true);
      if (e.data?.type === '__deactivate_edit_mode') setActive(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // apply accent vars on mount + change
  React.useEffect(() => {
    const vars = ACCENT_MAP[state.accent] || ACCENT_MAP.teal;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [state.accent]);

  const update = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      width: open ? 320 : 52,
      background: 'rgba(10,18,34,0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(52,231,208,0.3)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: 'var(--iw-body)',
      transition: 'width 300ms var(--ease)',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '14px 16px',
        background: 'transparent', border: 'none',
        color: 'var(--iw-fg)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
        borderBottom: open ? '1px solid var(--iw-hairline)' : 'none',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot size={6} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.2em' }}>TWEAKS</span>
        </span>
        {open && <Ic.chevron width={14} height={14} style={{ transform: 'rotate(180deg)' }}/>}
      </button>

      {open && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13 }}>
          <TweakGroup label="Hero variant">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                ['diagram', 'Live Flow'],
                ['terminal', 'Terminal'],
                ['kinetic', 'Kinetic'],
              ].map(([v, l]) => (
                <button key={v} onClick={() => update({ heroVariant: v })} style={{
                  padding: '8px 6px', fontSize: 11,
                  background: state.heroVariant === v ? 'var(--accent)' : 'transparent',
                  color: state.heroVariant === v ? 'var(--iw-void)' : 'var(--iw-fg-1)',
                  border: '1px solid',
                  borderColor: state.heroVariant === v ? 'var(--accent)' : 'var(--iw-hairline)',
                  borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--iw-mono)',
                }}>{l}</button>
              ))}
            </div>
          </TweakGroup>

          <TweakGroup label={`Motion intensity · ${state.motionIntensity.toFixed(1)}`}>
            <input type="range" min="0" max="2" step="0.1"
              value={state.motionIntensity}
              onChange={e => update({ motionIntensity: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </TweakGroup>

          <TweakGroup label="Accent">
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.keys(ACCENT_MAP).map(k => (
                <button key={k} onClick={() => update({ accent: k })} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2px solid',
                  borderColor: state.accent === k ? 'var(--iw-fg)' : 'var(--iw-hairline)',
                  background: ACCENT_MAP[k]['--accent'],
                  cursor: 'pointer',
                }} title={k}/>
              ))}
            </div>
          </TweakGroup>

          <TweakGroup label="Density">
            <div style={{ display: 'flex', gap: 6 }}>
              {['comfortable', 'compact'].map(d => (
                <button key={d} onClick={() => update({ density: d })} style={{
                  flex: 1, padding: '8px 6px', fontSize: 11,
                  background: state.density === d ? 'var(--accent)' : 'transparent',
                  color: state.density === d ? 'var(--iw-void)' : 'var(--iw-fg-1)',
                  border: '1px solid',
                  borderColor: state.density === d ? 'var(--accent)' : 'var(--iw-hairline)',
                  borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--iw-mono)', textTransform: 'capitalize',
                }}>{d}</button>
              ))}
            </div>
          </TweakGroup>
        </div>
      )}
    </div>
  );
}

function TweakGroup({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--iw-fg-2)', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

window.Tweaks = Tweaks;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;
