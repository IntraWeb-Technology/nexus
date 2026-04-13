'use client'

import {
  PORTAL_THEME_STORAGE_KEY,
  type PortalTheme,
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
  setTheme: (theme: PortalTheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_CHANGE_EVENT = 'iw-portal-theme-change'

function dispatchThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== PORTAL_THEME_STORAGE_KEY || !isPortalTheme(e.newValue)) return
    document.documentElement.setAttribute('data-theme', e.newValue)
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

function getServerThemeSnapshot(): PortalTheme {
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readThemeFromDom, getServerThemeSnapshot)

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

  const toggleTheme = useCallback(() => {
    setTheme(readThemeFromDom() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
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
