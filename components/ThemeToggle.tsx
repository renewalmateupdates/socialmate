'use client'
import { useTheme, ACCENT_THEMES } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme()
  const isDark = mode === 'dark'

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>

      {/* Dark mode toggle — pill slider */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {isDark ? '🌙 Dark mode' : '☀️ Light mode'}
        </span>

        <button
          onClick={() => setMode(isDark ? 'light' : 'dark')}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
          style={{
            position:     'relative',
            display:      'inline-flex',
            alignItems:   'center',
            width:         44,
            height:        24,
            borderRadius:  12,
            border:        'none',
            cursor:        'pointer',
            padding:        0,
            flexShrink:     0,
            background:    isDark ? 'var(--accent, #3b82f6)' : '#d1d5db',
            transition:    'background 0.25s ease',
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
              boxShadow:    '0 1px 4px rgba(0,0,0,0.25)',
              transition:   'left 0.25s ease',
              display:      'block',
            }}
          />
        </button>
      </div>

      {/* Accent color swatches */}
      <div className="flex items-center gap-2 flex-wrap">
        {ACCENT_THEMES.map(t => {
          const isSelected = accent === t.id
          return (
            <button
              key={t.id}
              onClick={() => setAccent(t.id)}
              title={t.label}
              aria-label={`${t.label} accent color${isSelected ? ' (selected)' : ''}`}
              style={{
                width:           20,
                height:          20,
                borderRadius:    '50%',
                backgroundColor: t.color,
                border:          isSelected
                  ? '2px solid white'
                  : '2px solid transparent',
                outline:         isSelected
                  ? `2px solid ${t.color}`
                  : '2px solid transparent',
                outlineOffset:   1,
                transform:       isSelected ? 'scale(1.2)' : 'scale(1)',
                transition:      'transform 0.15s ease, outline 0.15s ease',
                cursor:          'pointer',
                flexShrink:       0,
              }}
            />
          )
        })}
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
        Accent color
      </p>
    </div>
  )
}
