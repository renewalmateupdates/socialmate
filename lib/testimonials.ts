// Real testimonials, shown on the landing page and /wall-of-love.
//
// Only add a quote the person sent in writing, with their written OK to show
// the details listed (the email is the permission; keep it). Never invent a
// rating, a quote or a detail they didn't give, and never show their email.
// `short` is the landing-page cut: trimmed with their OK, words unchanged except
// a bracketed clarification.

export interface Testimonial {
  name: string
  role: string
  company: string
  website?: string
  /** The full quote, exactly as sent. */
  quote: string
  /** Trimmed for the landing page. */
  short: string
  /** When they sent it (YYYY-MM-DD). */
  received: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ellen Harvey',
    role: 'Founder',
    company: 'Content Co',
    website: 'https://ellenharvey.com.au',
    quote:
      "I run a small content design business in Australia on the side, with help from a virtual assistant. Before SocialMate, every platform I tried charged a lot just to give her access to my socials, so I ended up doing it all myself – or, let's be honest, never doing it at all. Now I can invite her for free and she schedules my posts across platforms. I love that it's built in the open by someone who replies directly when you find a bug. That has made all the difference to me. If you're a small business owner who wants a bit of help without the big-company price tag, this is the one.",
    short:
      "Before SocialMate, every platform I tried charged a lot just to give [my assistant] access to my socials. Now I can invite her for free and she schedules my posts across platforms. If you're a small business owner who wants a bit of help without the big-company price tag, this is the one.",
    received: '2026-11-04',
  },
]

/** "Ellen Harvey" -> "EH" for the avatar circle. */
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}

/** "https://ellenharvey.com.au/" -> "ellenharvey.com.au" */
export function siteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
