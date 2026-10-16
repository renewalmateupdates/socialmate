/**
 * The meta description for a blog post: its excerpt, or failing that the opening
 * of the post itself. 56 rows in `blog_posts` have no excerpt, so their pages went
 * out with no description at all and search engines wrote their own.
 */

export const DESCRIPTION_MAX = 155

export function describePost(post: { excerpt?: string | null; content?: string | null }): string {
  const own = (post.excerpt || '').trim()
  if (own) return own
  const text = plainOpening(post.content || '')
  if (text.length <= DESCRIPTION_MAX) return text
  // End on a full sentence inside the limit when one is long enough, else on a word.
  const window = text.slice(0, DESCRIPTION_MAX + 1)
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '))
  if (sentenceEnd >= 80) return window.slice(0, sentenceEnd + 1)
  const wordEnd = window.lastIndexOf(' ')
  return window.slice(0, wordEnd > 0 ? wordEnd : DESCRIPTION_MAX).replace(/[\s,;:.-]+$/, '') + '…'
}

/** The first paragraph that reads as prose: not a heading, list, quote, table or code. */
function plainOpening(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n/)
  for (const raw of blocks) {
    const block = raw.trim()
    if (!block || /^(#|[-*+] |\d+\. |>|\||```)/.test(block)) continue
    const text = clean(block)
    // A short block is a bold sub-heading ("**Why TikTok Works**"), not an opening.
    if (text.length >= 40) return text
  }
  return clean(markdown.replace(/^#+\s.*$/gm, ''))
}

function clean(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links keep their text
    .replace(/[*_`~#>]+/g, '')                // emphasis, code ticks, stray markers
    .replace(/\s+/g, ' ')
    .trim()
}
