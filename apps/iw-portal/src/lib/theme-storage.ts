/** localStorage key for portal light/dark theme (issue #2 / REFACTOR_GUIDE). */
export const PORTAL_THEME_STORAGE_KEY = 'iw-portal-theme'

export type PortalTheme = 'light' | 'dark'

export function isPortalTheme(value: unknown): value is PortalTheme {
  return value === 'light' || value === 'dark'
}

/** Inline before React to avoid theme flash (must stay in sync with ThemeProvider). */
export function portalThemeBootScript(): string {
  const k = JSON.stringify(PORTAL_THEME_STORAGE_KEY)
  return `(function(){try{var k=${k};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`
}
