import localFont from 'next/font/local'

// Self-hosted, zero CDN round-trips. Three faces, three jobs:
//
//   Clash Display  — headlines only. Tight, geometric, confident.
//   Switzer        — body. Neutral enough to disappear, warm enough not to be Helvetica.
//   JetBrains Mono — the instrument. Timestamps, credit counts, prices, platform
//                    labels, the calendar grid, eyebrows. This is what makes the
//                    site read as equipment instead of marketing.
//
// Clash and Switzer ship as variable fonts (one file, every weight) because the
// variable file is smaller than the two static weights we'd otherwise load.
// JetBrains Mono is the latin subset (22KB/weight vs 92KB for the full family,
// which carries Cyrillic + Greek we will never render in a timestamp).
//
// Total font budget: ~124KB for all three families.

// Note the variable names below are the *source* vars (--font-clash etc), not the
// theme keys. globals.css maps them to --font-display / --font-body / --font-mono
// inside @theme; emitting them under the same name would be a circular reference.

export const fontDisplay = localFont({
  src: [{ path: './fonts/ClashDisplay-Variable.woff2', weight: '200 700', style: 'normal' }],
  variable: '--font-clash',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
})

export const fontBody = localFont({
  src: [{ path: './fonts/Switzer-Variable.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-switzer',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
})

export const fontMono = localFont({
  src: [
    { path: './fonts/JetBrainsMono-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/JetBrainsMono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-jbmono',
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})

export const fontVars = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`
