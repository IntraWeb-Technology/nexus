// Shared primitives
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// In-view hook for entrance animations
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.15, ...options });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

// Scroll progress hook for scroll-driven effects
function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh;
      const passed = vh - r.top;
      const prog = Math.max(0, Math.min(1, passed / total));
      setP(prog);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

// Reveal wrapper
function Reveal({ children, delay = 0, y = 20, className = '', as: Tag = 'div' }) {
  const [ref, inView] = useInView();
  const style = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
    transition: `opacity 800ms var(--ease-out) ${delay}ms, transform 800ms var(--ease-out) ${delay}ms`,
  };
  return <Tag ref={ref} style={style} className={className}>{children}</Tag>;
}

// Eyebrow label
function Eyebrow({ children, n }) {
  return (
    <div className="eyebrow">
      {n && <span style={{ color: 'var(--iw-fg-3)', letterSpacing: '0.22em' }}>{n}</span>}
      <span>{children}</span>
    </div>
  );
}

// Button
function Btn({ children, variant = 'primary', onClick, href, icon = true }) {
  const Cmp = href ? 'a' : 'button';
  return (
    <Cmp className={`btn btn-${variant}`} onClick={onClick} href={href}>
      <span>{children}</span>
      {icon && <span className="arrow" aria-hidden>→</span>}
    </Cmp>
  );
}

// Status dot
function StatusDot({ color = 'var(--accent)', size = 6, pulse = true }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      background: color,
      borderRadius: '50%',
      boxShadow: `0 0 ${size*2}px ${color}`,
      animation: pulse ? 'pulse-dot 2s var(--ease) infinite' : 'none',
    }} />
  );
}

// Kinetic counter — animates to target when in view
function Counter({ to, suffix = '', duration = 1800, decimals = 0 }) {
  const [ref, inView] = useInView();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const loop = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{n.toFixed(decimals)}{suffix}</span>;
}

Object.assign(window, { useInView, useScrollProgress, Reveal, Eyebrow, Btn, StatusDot, Counter });
