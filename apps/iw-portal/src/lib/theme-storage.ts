/** localStorage key for portal light/dark theme (issue #2 / REFACTOR_GUIDE). */
export const PORTAL_THEME_STORAGE_KEY = 'iw-portal-theme'
export const PORTAL_ACCENT_STORAGE_KEY = 'iw-portal-accent'
export const PORTAL_DENSITY_STORAGE_KEY = 'iw-portal-density'

export type PortalTheme = 'light' | 'dark'
export type PortalAccent = 'teal' | 'orange'
export type PortalDensity = 'compact' | 'comfortable'

export function isPortalTheme(value: unknown): value is PortalTheme {
  return value === 'light' || value === 'dark'
}

export function isPortalAccent(value: unknown): value is PortalAccent {
  return value === 'teal' || value === 'orange'
}

export function isPortalDensity(value: unknown): value is PortalDensity {
  return value === 'compact' || value === 'comfortable'
}

/** Inline before React to avoid theme flash (must stay in sync with ThemeProvider). */
export function portalThemeBootScript(): string {
  const k = JSON.stringify(PORTAL_THEME_STORAGE_KEY)
  const ak = JSON.stringify(PORTAL_ACCENT_STORAGE_KEY)
  const dk = JSON.stringify(PORTAL_DENSITY_STORAGE_KEY)
  return `(function(){try{var k=${k},ak=${ak},dk=${dk};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var a=localStorage.getItem(ak);if(a!=="orange")a="teal";var d=localStorage.getItem(dk);if(d!=="comfortable")d="compact";document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-accent",a);document.documentElement.setAttribute("data-density",d);}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.setAttribute("data-accent","teal");document.documentElement.setAttribute("data-density","compact");}})();`
}
