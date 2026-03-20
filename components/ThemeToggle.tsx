'use client'
import { useTheme, ACCENT_THEMES } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme()

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Dark mode toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {mode === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
        </span>
        <button
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
          className={`relative w-9 h-5 rounded-full transition-colors ${
            mode === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            mode === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Accent color picker */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {ACCENT_THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setAccent(t.id)}
            title={t.label}
            aria-label={`Set ${t.label} accent color`}
            className={`w-5 h-5 rounded-full transition-all ${
              accent === t.id
                ? 'ring-2 ring-offset-1 ring-blue-400 scale-110'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: t.color }}
          />
        ))}
      </div>
    </div>
  )
}
