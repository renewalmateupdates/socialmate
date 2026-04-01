'use client'
import { useState, useEffect } from 'react'
import { useTheme, ACCENT_THEMES } from '@/contexts/ThemeContext'

const THEME_VIS_KEY = 'sidebar_theme_visible'

export default function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme()
  const isDark = mode === 'dark'
  const [themeVisible, setThemeVisible] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_VIS_KEY)
      if (stored !== null) setThemeVisible(stored !== 'false')
    } catch {}
  }, [])

  const toggleTheme = () => {
    setThemeVisible(prev => {
      const next = !prev
      try { localStorage.setItem(THEME_VIS_KEY, String(next)) } catch {}
      return next
    })
  }

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>

      {/* Collapse toggle */}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-1.5 px-1 py-0.5 mb-3 transition-all hover:opacity-70"
        title={themeVisible ? 'Hide theme options' : 'Show theme options'}
      >
        <span className="text-xs" style={{ color: 'var(--sidebar-faint)' }}>
          {themeVisible ? '▾' : '▸'}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--sidebar-faint)' }}>
          Theme
        </span>
      </button>

      {themeVisible && (
        <>
          {/* Dark mode toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold" style={{ color: 'var(--sidebar-muted)' }}>
              {isDark ? '🌙 Dark mode' : '☀️ Light mode'}
            </span>

            <button
              onClick={() => setMode(isDark ? 'light' : 'dark')}
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode"
              style={{
                position:   'relative',
                width:       44,
                height:      24,
                borderRadius: 12,
                border:      'none',
                cursor:      'pointer',
                padding:      0,
                flexShrink:   0,
                background:  isDark ? 'var(--sidebar-accent, #818cf8)' : 'rgba(255,255,255,0.25)',
                outline:     '1px solid var(--sidebar-border)',
                transition:  'background 0.25s ease',
              }}
            >
              <span
                style={{
                  position:     'absolute',
                  top:           3,
                  left:          isDark ? 23 : 3,
                  width:         18,
                  height:        18,
                  borderRadius: '50%',
                  background:   'white',
                  boxShadow:    '0 1px 4px rgba(0,0,0,0.3)',
                  transition:   'left 0.25s ease',
                  display:      'block',
                }}
              />
            </button>
          </div>

          {/* Sidebar theme swatches */}
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--sidebar-muted)' }}>
            Sidebar theme
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {ACCENT_THEMES.map(t => {
              const isSelected = accent === t.id
              const isDefault  = t.id === 'default'

              return (
                <button
                  key={t.id}
                  onClick={() => setAccent(t.id)}
                  title={t.label}
                  aria-label={`${t.label} sidebar theme${isSelected ? ' (active)' : ''}`}
                  style={{
                    width:        22,
                    height:       22,
                    borderRadius:  6,
                    backgroundColor: isDefault ? '#ffffff' : t.color,
                    border:        isSelected
                      ? '2px solid var(--sidebar-fg)'
                      : '2px solid var(--sidebar-border)',
                    outline:       isSelected ? '2px solid var(--sidebar-accent)' : 'none',
                    outlineOffset: 1,
                    transform:     isSelected ? 'scale(1.2)' : 'scale(1)',
                    transition:    'transform 0.15s ease, outline 0.15s ease, border 0.15s ease',
                    cursor:        'pointer',
                    flexShrink:     0,
                    boxShadow:     isDefault ? 'inset 0 0 0 1px rgba(0,0,0,0.15)' : 'none',
                  }}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
