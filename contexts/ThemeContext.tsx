'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export type ThemeMode    = 'light' | 'dark'
export type ThemeAccent  = 'default' | 'midnight' | 'forest' | 'rose' | 'slate' | 'amber' | 'ocean' | 'grape' | 'charcoal' | 'coffee' | 'candy' | 'mint' | 'lavender' | 'sky' | 'peach' | 'rainbow' | 'tiedye' | 'northern-lights' | 'acid' | 'cosmic' | 'psychedelic'

/** The swatch color is the sidebar background color for that theme */
export const ACCENT_THEMES: { id: ThemeAccent; label: string; color: string }[] = [
  { id: 'default',  label: 'Default',  color: '#ffffff' },   // white sidebar
  { id: 'midnight', label: 'Midnight', color: '#1e1b4b' },   // deep indigo
  { id: 'forest',   label: 'Forest',   color: '#14532d' },   // dark green
  { id: 'rose',     label: 'Rose',     color: '#881337' },   // deep crimson
  { id: 'slate',    label: 'Slate',    color: '#0f172a' },   // dark blue-slate
  { id: 'amber',    label: 'Amber',    color: '#78350f' },   // warm amber
  { id: 'ocean',    label: 'Ocean',    color: '#0c4a6e' },   // deep ocean blue
  { id: 'grape',    label: 'Grape',    color: '#4c1d95' },   // deep violet/grape
  { id: 'charcoal', label: 'Charcoal', color: '#1c1917' },   // near-black charcoal
  { id: 'coffee',   label: 'Coffee',   color: '#3b1a08' },   // warm espresso brown
  // Pastels & prismatic
  { id: 'candy',    label: 'Candy',    color: '#fce7f3' },   // cotton candy pink
  { id: 'mint',     label: 'Mint',     color: '#d1fae5' },   // pastel mint green
  { id: 'lavender', label: 'Lavender', color: '#ede9fe' },   // soft lavender
  { id: 'sky',      label: 'Sky',      color: '#e0f2fe' },   // pastel sky blue
  { id: 'peach',    label: 'Peach',    color: '#ffedd5' },   // soft peach
  { id: 'rainbow',  label: 'Rainbow',  color: '#1a0533' },   // dark base with rainbow shimmer
  // Trippy / Tie-Dye
  { id: 'tiedye',         label: 'Tie-Dye',        color: '#0d0d0d' },   // all-color spiral on black
  { id: 'northern-lights', label: 'Northern Lights', color: '#020b18' },  // aurora borealis
  { id: 'acid',           label: 'Acid',           color: '#050508' },   // lime/yellow psychedelic
  { id: 'cosmic',         label: 'Cosmic',         color: '#020010' },   // deep space nebula
  { id: 'psychedelic',    label: 'Psychedelic',    color: '#08000f' },   // trippy pink/orange/teal
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

function applyTheme(mode: ThemeMode, accent: ThemeAccent) {
  const html = document.documentElement

  // Dark mode — apply .dark class so Tailwind dark: variants work
  if (mode === 'dark') {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  }

  // Accent — set data-accent attribute for CSS [data-accent] selectors
  if (accent === 'default') {
    html.removeAttribute('data-accent')
  } else {
    html.setAttribute('data-accent', accent)
  }

  // Apply sidebar theme via data-sidebar attribute
  // CSS [data-sidebar="X"] rules in globals.css set all sidebar-specific vars
  if (accent === 'default') {
    html.removeAttribute('data-sidebar')
  } else {
    html.setAttribute('data-sidebar', accent)
  }
}

async function saveThemeToSupabase(mode: ThemeMode, accent: ThemeAccent) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('user_settings')
      .update({ theme_mode: mode, theme_accent: accent })
      .eq('user_id', user.id)
  } catch {
    // Silently fail — localStorage is the source of truth if Supabase is unavailable
  }
}

async function loadThemeFromSupabase(): Promise<{ mode: ThemeMode; accent: ThemeAccent } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('user_settings')
      .select('theme_mode, theme_accent')
      .eq('user_id', user.id)
      .single()
    if (data?.theme_mode) {
      return {
        mode:   (data.theme_mode  as ThemeMode)   || 'light',
        accent: (data.theme_accent as ThemeAccent) || 'default',
      }
    }
    return null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode,   setModeState]   = useState<ThemeMode>('light')
  const [accent, setAccentState] = useState<ThemeAccent>('default')
  const [loaded, setLoaded]      = useState(false)

  // On mount: Supabase → localStorage → system preference
  useEffect(() => {
    async function init() {
      // 1. Try Supabase (authoritative for logged-in users, cross-device)
      const supabaseTheme = await loadThemeFromSupabase()
      if (supabaseTheme) {
        setModeState(supabaseTheme.mode)
        setAccentState(supabaseTheme.accent)
        localStorage.setItem('sm-theme-mode',   supabaseTheme.mode)
        localStorage.setItem('sm-theme-accent', supabaseTheme.accent)
        applyTheme(supabaseTheme.mode, supabaseTheme.accent)
        setLoaded(true)
        return
      }

      // 2. Try localStorage
      const savedMode   = localStorage.getItem('sm-theme-mode')   as ThemeMode   | null
      const savedAccent = localStorage.getItem('sm-theme-accent') as ThemeAccent | null
      if (savedMode) {
        const m = savedMode
        const a = savedAccent || 'default'
        setModeState(m)
        setAccentState(a)
        applyTheme(m, a)
        setLoaded(true)
        return
      }

      // 3. System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemMode: ThemeMode = prefersDark ? 'dark' : 'light'
      setModeState(systemMode)
      setAccentState('default')
      applyTheme(systemMode, 'default')
      localStorage.setItem('sm-theme-mode',   systemMode)
      localStorage.setItem('sm-theme-accent', 'default')
      setLoaded(true)
    }
    init()
  }, [])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('sm-theme-mode', m)
    applyTheme(m, accent)
    saveThemeToSupabase(m, accent)
  }

  const setAccent = (a: ThemeAccent) => {
    setAccentState(a)
    localStorage.setItem('sm-theme-accent', a)
    applyTheme(mode, a)
    saveThemeToSupabase(mode, a)
  }

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
