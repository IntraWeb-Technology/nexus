"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduce(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduce;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(options: IntersectionObserverInit = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.2, ...options });
    io.observe(el);
    return () => io.disconnect();
  }, [options]);
  return [ref, inView] as const;
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [ref, inView] = useInView();
  const style: CSSProperties = reduce
    ? { opacity: 1, transform: "none" }
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

/** Hero content: fade + rise on mount (not scroll). */
export function HeroRise({
  children,
  delay = 0,
  duration = 500,
  y = 20,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  const reduce = usePrefersReducedMotion();
  const [on, setOn] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    const r = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(r);
  }, [reduce]);
  const visible = reduce || on;
  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${y}px)`,
    transition: reduce
      ? "none"
      : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  };
  return (
    <div style={style} data-hero-rise>
      {children}
    </div>
  );
}

export function Eyebrow({ children, n }: { children: ReactNode; n?: string }) {
  return (
    <div className="eyebrow">
      {n && <span style={{ color: "var(--iw-fg-3)", letterSpacing: "0.22em" }}>{n}</span>}
      <span>{children}</span>
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  onClick,
  href,
  icon = true,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  href?: string;
  icon?: boolean;
}) {
  const Cmp = href ? "a" : "button";
  const external = href?.startsWith("http");
  return (
    <Cmp
      className={`btn btn-${variant}`}
      onClick={onClick}
      href={href}
      type={href ? undefined : "button"}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <span>{children}</span>
      {icon && (
        <span className="arrow" aria-hidden>
          →
        </span>
      )}
    </Cmp>
  );
}

export function StatusDot({
  color = "var(--accent)",
  size = 6,
  pulse = true,
}: {
  color?: string;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: color,
        borderRadius: "50%",
        boxShadow: `0 0 ${size * 2}px ${color}`,
        animation: pulse ? "pulse-dot 2s var(--ease) infinite" : "none",
      }}
    />
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Counter({
  to,
  suffix = "",
  duration = 1800,
  decimals = 0,
  prefix = "",
  instantIfReduced = true,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  instantIfReduced?: boolean;
}) {
  const reduce = usePrefersReducedMotion() && instantIfReduced;
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) {
      queueMicrotask(() => setN(to));
      return;
    }
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = easeOutCubic(p);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
