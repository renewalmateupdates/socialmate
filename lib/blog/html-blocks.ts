/**
 * Blog posts stored as HTML, read into plain blocks the post page draws itself.
 *
 * 200 rows in `blog_posts` (everything published from March to May 2026) keep
 * their body as HTML: <h2>, <p>, <strong>, lists, a few tables. The post page
 * only understood the line format the other posts use (## headings, **bold**
 * lines, - lists), so from the day they went up those 200 pages showed their
 * tags as text: "<h2>Video Creation and Editing</h2><p><strong>CapCut:</strong>"
 * in one long paragraph, to readers and to every crawler.
 *
 * Nothing from the database is ever inserted as HTML. Only the tags below are
 * understood, a link must be a site path or an http(s) URL, script and style
 * are dropped with their contents, and any other tag keeps only its text.
 */

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'strong' | 'em' | 'code'; children: Inline[] }
  | { kind: 'link'; href: string; children: Inline[] }
  | { kind: 'br' }

export type Block =
  | { kind: 'h2' | 'h3' | 'p' | 'quote'; children: Inline[] }
  | { kind: 'ul' | 'ol'; items: Inline[][] }
  | { kind: 'table'; head: Inline[][]; rows: Inline[][][] }

// The same test that found the 200 rows; none of the line-format posts match it.
const HTML_HINT = /<(p|h[1-6]|ul|ol|li|strong|br|table)\b[^>]*>/i

export function looksLikeHtml(content: string | null | undefined): boolean {
  return HTML_HINT.test(content ?? '')
}

type El = { tag: string; attrs: string; children: Node[] }
type Node = El | string

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'wbr', 'source', 'col'])
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'form', 'button', 'select', 'textarea', 'head', 'title'])
const INLINE = new Set(['strong', 'b', 'em', 'i', 'code', 'a', 'br', 'span', 'u', 'mark', 'small', 'sup', 'sub', 's', 'del', 'ins', 'abbr', 'cite', 'q', 'time', 'img'])
// Block tags met inside a paragraph or list item still separate words.
const SPACED = new Set(['p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'tr', 'td', 'th', 'table', 'section', 'article'])

function parse(html: string): Node[] {
  const root: El = { tag: '#root', attrs: '', children: [] }
  const stack: El[] = [root]
  // A start tag's name ends at a word boundary, so <br/> and <br /> both read as <br>.
  const token = /<!--[\s\S]*?-->|<!\w[^>]*>|<\/\s*([a-zA-Z][a-zA-Z0-9]*)\s*>|<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)|(<)/g
  let m: RegExpExecArray | null
  while ((m = token.exec(html))) {
    const top = stack[stack.length - 1]
    if (m[1]) {
      // A closing tag closes the nearest open element of its kind and anything left open inside it.
      const tag = m[1].toLowerCase()
      let at = stack.length - 1
      while (at > 0 && stack[at].tag !== tag) at--
      if (at > 0) stack.length = at
    } else if (m[2]) {
      const tag = m[2].toLowerCase()
      const attrs = m[3] ?? ''
      const el: El = { tag, attrs, children: [] }
      top.children.push(el)
      if (!VOID.has(tag) && !/\/\s*$/.test(attrs)) stack.push(el)
    } else if (m[4] !== undefined || m[5] !== undefined) {
      top.children.push(m[4] ?? m[5])
    }
    // Comments and doctypes are skipped.
  }
  return root.children
}

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', middot: '·', bull: '•',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  copy: '©', reg: '®', trade: '™', times: '×', rarr: '→', larr: '←', check: '✓',
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole
    }
    return NAMED[code.toLowerCase()] ?? whole
  })
}

function attr(attrs: string, name: string): string | null {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(attrs)
  return m ? decodeEntities(m[1] ?? m[2] ?? m[3] ?? '') : null
}

/** A link target the page may use: a site path ("/pricing") or an http(s) URL. Anything else is dropped. */
export function safeHref(raw: string | null | undefined): string | null {
  const href = (raw ?? '').trim()
  if (/^\/(?!\/)[^\s]*$/.test(href)) return href
  if (/^https?:\/\/[^\s/]+[^\s]*$/i.test(href)) return href
  return null
}

function inlines(nodes: Node[]): Inline[] {
  const out: Inline[] = []
  for (const n of nodes) {
    if (typeof n === 'string') { out.push({ kind: 'text', text: decodeEntities(n) }); continue }
    if (DROP.has(n.tag)) continue
    switch (n.tag) {
      case 'br': out.push({ kind: 'br' }); break
      case 'strong': case 'b': out.push({ kind: 'strong', children: inlines(n.children) }); break
      case 'em': case 'i': out.push({ kind: 'em', children: inlines(n.children) }); break
      case 'code': out.push({ kind: 'code', children: inlines(n.children) }); break
      case 'a': {
        const href = safeHref(attr(n.attrs, 'href'))
        const children = inlines(n.children)
        if (href) out.push({ kind: 'link', href, children })
        else out.push(...children)
        break
      }
      default:
        out.push(...inlines(n.children))
        if (SPACED.has(n.tag)) out.push({ kind: 'text', text: ' ' })
    }
  }
  return out
}

/** Collapses whitespace the way a browser would, and trims the ends of a block. */
function tidy(nodes: Inline[]): Inline[] {
  return trimEnds(collapse(nodes))
}

function collapse(nodes: Inline[]): Inline[] {
  const out: Inline[] = []
  for (const n of nodes) {
    if (n.kind === 'text') {
      const text = n.text.replace(/\s+/g, ' ')
      const last = out[out.length - 1]
      if (last && last.kind === 'text') last.text += text
      else if (text) out.push({ kind: 'text', text })
    } else if (n.kind === 'br') {
      out.push(n)
    } else {
      const children = collapse(n.children)
      if (children.length) out.push({ ...n, children })
    }
  }
  return out
}

function trimEnds(nodes: Inline[]): Inline[] {
  const out = nodes.slice()
  while (out.length && out[0].kind === 'br') out.shift()
  while (out.length && out[out.length - 1].kind === 'br') out.pop()
  const first = out[0]
  if (first?.kind === 'text') { first.text = first.text.replace(/^\s+/, ''); if (!first.text) out.shift() }
  const last = out[out.length - 1]
  if (last?.kind === 'text') { last.text = last.text.replace(/\s+$/, ''); if (!last.text) out.pop() }
  return out
}

export function inlineText(nodes: Inline[]): string {
  return nodes.map(n => (n.kind === 'text' ? n.text : n.kind === 'br' ? ' ' : inlineText(n.children))).join('')
}

const hasText = (nodes: Inline[]) => inlineText(nodes).trim().length > 0

function tableBlock(el: El): Block {
  const rows: { cells: Inline[][]; head: boolean }[] = []
  const walk = (node: El, inHead: boolean) => {
    for (const child of node.children) {
      if (typeof child === 'string') continue
      if (child.tag === 'tr') {
        const cells = child.children.filter((c): c is El => typeof c !== 'string' && (c.tag === 'td' || c.tag === 'th'))
        rows.push({ cells: cells.map(c => tidy(inlines(c.children))), head: inHead || (cells.length > 0 && cells.every(c => c.tag === 'th')) })
      } else if (child.tag === 'thead') walk(child, true)
      else if (child.tag === 'tbody' || child.tag === 'tfoot') walk(child, inHead)
    }
  }
  walk(el, false)
  const hasHead = rows.length > 1 && rows[0].head
  return { kind: 'table', head: hasHead ? rows[0].cells : [], rows: rows.slice(hasHead ? 1 : 0).map(r => r.cells) }
}

function collect(nodes: Node[], out: Block[]): Block[] {
  let loose: Node[] = []
  const flush = () => {
    const children = tidy(inlines(loose))
    if (hasText(children)) out.push({ kind: 'p', children })
    loose = []
  }
  for (const n of nodes) {
    if (typeof n === 'string' || INLINE.has(n.tag)) { loose.push(n); continue }
    if (DROP.has(n.tag)) continue
    flush()
    switch (n.tag) {
      case 'h1': case 'h2': {
        const children = tidy(inlines(n.children))
        if (hasText(children)) out.push({ kind: 'h2', children })
        break
      }
      case 'h3': case 'h4': case 'h5': case 'h6': {
        const children = tidy(inlines(n.children))
        if (hasText(children)) out.push({ kind: 'h3', children })
        break
      }
      case 'p': {
        const children = tidy(inlines(n.children))
        if (hasText(children)) out.push({ kind: 'p', children })
        break
      }
      case 'blockquote': {
        const children = tidy(inlines(n.children))
        if (hasText(children)) out.push({ kind: 'quote', children })
        break
      }
      case 'ul': case 'ol': {
        const items = n.children
          .filter((c): c is El => typeof c !== 'string' && c.tag === 'li')
          .map(li => tidy(inlines(li.children)))
          .filter(hasText)
        if (items.length) out.push({ kind: n.tag, items })
        break
      }
      case 'table': {
        const table = tableBlock(n)
        if (table.kind === 'table' && (table.head.length || table.rows.length)) out.push(table)
        break
      }
      case 'hr':
        break
      default:
        // div, section, article and the like: read what is inside.
        collect(n.children, out)
    }
  }
  flush()
  return out
}

export function htmlToBlocks(html: string): Block[] {
  return collect(parse(html), [])
}

/**
 * The blocks as plain text in the line format (## headings, - list items),
 * one block per paragraph, for what reads the opening of a post (the meta description).
 */
export function blocksToText(blocks: Block[]): string {
  return blocks.map(b => {
    switch (b.kind) {
      case 'h2': case 'h3': return `## ${inlineText(b.children).trim()}`
      case 'quote': return `> ${inlineText(b.children).trim()}`
      case 'p': return inlineText(b.children).trim()
      case 'ul': case 'ol': return b.items.map(i => `- ${inlineText(i).trim()}`).join('\n')
      case 'table': return [b.head, ...b.rows].map(r => `| ${r.map(c => inlineText(c).trim()).join(' | ')} |`).join('\n')
    }
  }).join('\n\n')
}
