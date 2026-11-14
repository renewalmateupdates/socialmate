'use client'

// Browser-side helpers shared by the two image tools. Everything happens on a
// canvas in this browser; the only network request either tool makes is the
// page itself.

/** A canvas as a file. Null when the browser refuses (a tainted or zero-size canvas). */
export function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality = 0.92): Promise<Blob | null> {
  return new Promise(resolve => {
    try {
      canvas.toBlob(b => resolve(b), type, type === 'image/jpeg' ? quality : undefined)
    } catch {
      resolve(null)
    }
  })
}

/** Saves a blob through the browser's own download. */
export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Safari needs the URL a moment after the click.
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * A CSS custom property's font stack from the page, so the canvas uses the
 * site's own fonts. The font variables live on <body> (app/layout.tsx).
 */
export function pageFont(variable: string, fallback: string): string {
  try {
    const value = getComputedStyle(document.body).getPropertyValue(variable).trim()
    return value && !value.includes('var(') ? value : fallback
  } catch {
    return fallback
  }
}
