import PlatformIcon from './PlatformIcon'
import { Sparkles, ImageIcon, CalendarClock, Check } from 'lucide-react'

// The hero product mockup — a hand-built "app window" showing the core loop:
// write once → publish to every platform. Pure JSX + CSS keyframes, so it
// costs ZERO image bytes and zero JS (it's server-rendered; the animations are
// CSS-only and respect prefers-reduced-motion via the motion-safe variants in
// globals.css). Crisper than a screenshot, always matches the dark theme, and
// it's ours — not a Buffer clone.
const CHIP_PLATFORMS = ['Bluesky', 'Discord', 'Telegram', 'Mastodon', 'X', 'LinkedIn', 'TikTok']

export default function HeroMockup() {
  return (
    <div className="relative max-w-3xl mx-auto mt-16 lm-float" aria-hidden="true">
      {/* Glow behind the window */}
      <div
        className="absolute -inset-8 -z-10 rounded-[40px] pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(245,158,11,0.10), transparent 72%)' }}
      />

      {/* Browser chrome */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden text-left">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="ml-3 flex-1 max-w-xs h-6 rounded-md bg-gray-800/80 flex items-center px-3">
            <span className="text-[10px] text-gray-500 font-medium truncate">socialmate.studio/compose</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px]">
          {/* Compose pane */}
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">New post</p>

            <div className="rounded-xl border border-gray-700/80 bg-gray-950/60 p-4 mb-4">
              <p className="text-sm text-gray-200 leading-relaxed">
                Big news — our latest drop is live! 🎉 Same post, every platform, zero copy-pasting.
                <span className="lm-caret" />
              </p>
            </div>

            {/* Platform chips — pop in one by one */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {CHIP_PLATFORMS.map((p, i) => (
                <span
                  key={p}
                  className="lm-chip inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/80 px-2 py-1 text-[10px] font-semibold text-gray-300"
                  style={{ animationDelay: `${400 + i * 220}ms` }}
                >
                  <PlatformIcon name={p} size={11} />
                  {p}
                  <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3.5} />
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-[11px] font-bold text-black">
                <CalendarClock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Schedule to 7 platforms
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-[11px] font-semibold text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
                AI caption
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-[11px] font-semibold text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                Media
              </span>
            </div>
          </div>

          {/* Mini queue rail */}
          <div className="hidden sm:block border-l border-gray-800 bg-gray-950/40 p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Queue</p>
            <div className="space-y-2">
              {[
                { t: 'Today · 6:00 PM', c: 'bg-amber-500' },
                { t: 'Tomorrow · 9:15 AM', c: 'bg-purple-500' },
                { t: 'Fri · 12:30 PM', c: 'bg-blue-500' },
                { t: 'Sat · 7:45 PM', c: 'bg-green-500' },
              ].map((q, i) => (
                <div
                  key={q.t}
                  className="lm-queue-item rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 py-2"
                  style={{ animationDelay: `${900 + i * 260}ms` }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${q.c}`} />
                    <span className="text-[9px] font-bold text-gray-400">{q.t}</span>
                  </div>
                  <div className="h-1.5 rounded bg-gray-800 w-full mb-1" />
                  <div className="h-1.5 rounded bg-gray-800 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating "Published" toast */}
      <div className="lm-toast absolute -right-2 sm:right-6 -bottom-4 inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-gray-900 px-3.5 py-2.5 shadow-xl shadow-black/40">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
          <Check className="w-3 h-3 text-green-400" strokeWidth={3.5} />
        </span>
        <span className="text-[11px] font-bold text-gray-200">Published to 7 platforms</span>
      </div>
    </div>
  )
}
