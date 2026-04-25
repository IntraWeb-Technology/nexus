'use client'

import {
  PORTAL_ACCENT_STORAGE_KEY,
  PORTAL_DENSITY_STORAGE_KEY,
  PORTAL_THEME_STORAGE_KEY,
  type PortalAccent,
  type PortalDensity,
  type PortalTheme,
  isPortalAccent,
  isPortalDensity,
  isPortalTheme,
} from '@/lib/theme-storage'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

type ThemeContextValue = {
  theme: PortalTheme
  accent: PortalAccent
  density: PortalDensity
  setTheme: (theme: PortalTheme) => void
  setAccent: (accent: PortalAccent) => void
  setDensity: (density: PortalDensity) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_CHANGE_EVENT = 'iw-portal-theme-change'

function dispatchThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PORTAL_THEME_STORAGE_KEY && isPortalTheme(e.newValue)) {
      document.documentElement.setAttribute('data-theme', e.newValue)
    } else if (e.key === PORTAL_ACCENT_STORAGE_KEY && isPortalAccent(e.newValue)) {
      document.documentElement.setAttribute('data-accent', e.newValue)
    } else if (e.key === PORTAL_DENSITY_STORAGE_KEY && isPortalDensity(e.newValue)) {
      document.documentElement.setAttribute('data-density', e.newValue)
    } else {
      return
    }
    onChange()
  }
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

function readThemeFromDom(): PortalTheme {
  const raw = document.documentElement.getAttribute('data-theme')
  return raw === 'light' ? 'light' : 'dark'
}

function readAccentFromDom(): PortalAccent {
  const raw = document.documentElement.getAttribute('data-accent')
  return raw === 'orange' ? 'orange' : 'teal'
}

function readDensityFromDom(): PortalDensity {
  const raw = document.documentElement.getAttribute('data-density')
  return raw === 'comfortable' ? 'comfortable' : 'compact'
}

function getServerThemeSnapshot(): PortalTheme {
  return 'dark'
}

function getServerAccentSnapshot(): PortalAccent {
  return 'teal'
}

function getServerDensitySnapshot(): PortalDensity {
  return 'compact'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readThemeFromDom, getServerThemeSnapshot)
  const accent = useSyncExternalStore(subscribe, readAccentFromDom, getServerAccentSnapshot)
  const density = useSyncExternalStore(subscribe, readDensityFromDom, getServerDensitySnapshot)

  const setTheme = useCallback((next: PortalTheme) => {
    // Briefly enable the global color transition rule so all elements animate.
    document.documentElement.setAttribute('data-theme-transition', '')
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(PORTAL_THEME_STORAGE_KEY, next)
    } catch {
      // ignore private mode / blocked storage
    }
    dispatchThemeChange()
    // Remove after the transition completes (300ms + small buffer).
    setTimeout(() => {
      document.documentElement.removeAttribute('data-theme-transition')
    }, 320)
  }, [])

  const setAccent = useCallback((next: PortalAccent) => {
    document.documentElement.setAttribute('data-accent', next)
    try {
      localStorage.setItem(PORTAL_ACCENT_STORAGE_KEY, next)
    } catch {
      // ignore private mode / blocked storage
    }
    dispatchThemeChange()
  }, [])

  const setDensity = useCallback((next: PortalDensity) => {
    document.documentElement.setAttribute('data-density', next)
    try {
      localStorage.setItem(PORTAL_DENSITY_STORAGE_KEY, next)
    } catch {
      // ignore private mode / blocked storage
    }
    dispatchThemeChange()
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(readThemeFromDom() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  const value = useMemo(
    () => ({ theme, accent, density, setTheme, setAccent, setDensity, toggleTheme }),
    [theme, accent, density, setTheme, setAccent, setDensity, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
