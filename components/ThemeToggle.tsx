'use client'
import { useTheme, ACCENT_THEMES } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme()
  const isDark = mode === 'dark'

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>

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
          // Default swatch shows a checkerboard pattern (white sidebar)
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
                // Show a subtle inner pattern for the default (white) swatch
                boxShadow:     isDefault ? 'inset 0 0 0 1px rgba(0,0,0,0.15)' : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
