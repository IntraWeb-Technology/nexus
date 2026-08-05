// Lightweight SVG icon set — matches Lucide style (1.75px stroke, 24 viewbox)
const iconBase = {
  xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24,
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
};

const Ic = {
  arrow: (p) => <svg {...iconBase} {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  arrowDown: (p) => <svg {...iconBase} {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  check: (p) => <svg {...iconBase} {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  x: (p) => <svg {...iconBase} {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  plus: (p) => <svg {...iconBase} {...p}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  minus: (p) => <svg {...iconBase} {...p}><path d="M5 12h14"/></svg>,
  search: (p) => <svg {...iconBase} {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  code: (p) => <svg {...iconBase} {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  sparkles: (p) => <svg {...iconBase} {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>,
  cloud: (p) => <svg {...iconBase} {...p}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
  palette: (p) => <svg {...iconBase} {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  rocket: (p) => <svg {...iconBase} {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  shield: (p) => <svg {...iconBase} {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>,
  gauge: (p) => <svg {...iconBase} {...p}><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>,
  chart: (p) => <svg {...iconBase} {...p}><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg>,
  zap: (p) => <svg {...iconBase} {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  cpu: (p) => <svg {...iconBase} {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
  git: (p) => <svg {...iconBase} {...p}><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 0-2 2v2"/></svg>,
  node: (p) => <svg {...iconBase} {...p}><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.5 10.5 6 15"/><path d="M17 7l-4.5 4.5"/></svg>,
  mail: (p) => <svg {...iconBase} {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  chevron: (p) => <svg {...iconBase} {...p}><path d="m6 9 6 6 6-6"/></svg>,
  linkedin: (p) => <svg {...iconBase} {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
  github: (p) => <svg {...iconBase} {...p}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.45 9 18v4"/></svg>,
  play: (p) => <svg {...iconBase} {...p}><polygon points="6 3 20 12 6 21 6 3"/></svg>,
};

window.Ic = Ic;
