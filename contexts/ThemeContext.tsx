'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeMode   = 'light' | 'dark'
export type ThemeAccent = 'default' | 'midnight' | 'forest' | 'rose' | 'slate' | 'amber'

export const ACCENT_THEMES: { id: ThemeAccent; label: string; color: string }[] = [
  { id: 'default',  label: 'Default',  color: '#000000' },
  { id: 'midnight', label: 'Midnight', color: '#3b5bdb' },
  { id: 'forest',   label: 'Forest',   color: '#2f9e44' },
  { id: 'rose',     label: 'Rose',     color: '#e64980' },
  { id: 'slate',    label: 'Slate',    color: '#495057' },
  { id: 'amber',    label: 'Amber',    color: '#f08c00' },
]

type ThemeContextType = {
  mode:      ThemeMode
  accent:    ThemeAccent
  setMode:   (m: ThemeMode)   => void
  setAccent: (a: ThemeAccent) => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode:      'light',
  accent:    'default',
  setMode:   () => {},
  setAccent: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode,   setModeState]   = useState<ThemeMode>('light')
  const [accent, setAccentState] = useState<ThemeAccent>('default')

  useEffect(() => {
    const savedMode   = localStorage.getItem('sm-theme-mode')   as ThemeMode   | null
    const savedAccent = localStorage.getItem('sm-theme-accent') as ThemeAccent | null
    if (savedMode)   setModeState(savedMode)
    if (savedAccent) setAccentState(savedAccent)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', mode)
    html.setAttribute('data-accent', accent)
    localStorage.setItem('sm-theme-mode', mode)
  }, [mode])

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-accent', accent)
    localStorage.setItem('sm-theme-accent', accent)
  }, [accent])

  const setMode = (m: ThemeMode) => setModeState(m)
  const setAccent = (a: ThemeAccent) => setAccentState(a)

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}