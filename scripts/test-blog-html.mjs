#!/usr/bin/env node
/**
 * Tests for lib/blog/html-blocks.ts and the blog post page that uses it.
 *
 * 200 rows in blog_posts (all published March to May 2026) store their body as
 * HTML, and the post page only understood the line format (## headings, **bold**
 * lines, - lists), so each of those pages printed its tags as text. On Nov 27,
 * 2026 /blog/best-tools-tiktok-creators-2026 read
 * "<h2>Video Creation and Editing</h2><p><strong>CapCut:</strong>..." in one
 * paragraph.
 *
 *   node scripts/test-blog-html.mjs
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const read = p => readFileSync(join(root, p), 'utf8')

// Loads lib/*.ts the way the app would; these two only import each other.
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = id => (id.startsWith('./') ? load(join(dirname(rel), `${id.slice(2)}.ts`).replace(/\\/g, '/')) : require(id))
  new Function('module', 'exports', 'require', ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { looksLikeHtml, htmlToBlocks, blocksToText, inlineText, safeHref, decodeEntities } = load('lib/blog/html-blocks.ts')
const { describePost } = load('lib/blog/describe.ts')

const text = nodes => inlineText(nodes)

// Taken from the live row of /blog/best-tools-tiktok-creators-2026 on Nov 27, 2026.
const TIKTOK_TOOLS = '<p>Growing on TikTok in 2026 requires more than just good content.</p><h2>Video Creation and Editing</h2><p><strong>CapCut:</strong> The go-to TikTok editing app. Auto-captions, trending effects, sound matching. Free and mobile-native.</p><p><strong>ClipTalk:</strong> AI video from text. Give it a prompt, a script or a link and it makes a vertical video.</p><h2>Analytics</h2><p><strong>TikTok Analytics (native):</strong> Your first stop.</p>'

test('only HTML bodies take the HTML path', () => {
  assert.equal(looksLikeHtml(TIKTOK_TOOLS), true)
  assert.equal(looksLikeHtml('<ul><li>One</li></ul>'), true)
  for (const body of ['## Heading\n\n**Bold line**\n\n- item\n\nPlain text.', '', null, undefined, 'a < b and 3 > 2', 'I <3 posting', '[Start free](/signup)']) {
    assert.equal(looksLikeHtml(body), false, String(body))
  }
})

test('the TikTok tools post reads as headings and paragraphs, with the tool names in bold', () => {
  const blocks = htmlToBlocks(TIKTOK_TOOLS)
  assert.deepEqual(blocks.map(b => b.kind), ['p', 'h2', 'p', 'p', 'h2', 'p'])
  assert.equal(text(blocks[1].children), 'Video Creation and Editing')
  const capcut = blocks[2].children
  assert.equal(capcut[0].kind, 'strong')
  assert.equal(text(capcut[0].children), 'CapCut:')
  assert.equal(capcut[1].kind, 'text')
  assert.ok(capcut[1].text.startsWith(' The go-to TikTok editing app.'))
  assert.equal(text(blocks[3].children[0].children), 'ClipTalk:')
  for (const b of blocks) assert.ok(!text(b.children).includes('<'), 'no tag is left in the text')
})

test('entities become the characters they stand for', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &#x27;quoted&#x27; it&#39;s &mdash; &lt;b&gt; &copy; &bogus; &#0;'), "Tom & Jerry 'quoted' it's — <b> © &bogus; &#0;")
  const [p] = htmlToBlocks('<p>5&nbsp;posts &amp; 3&nbsp;videos</p>')
  assert.equal(text(p.children), '5 posts & 3 videos')
})

test('lists keep their items, numbered or not', () => {
  const blocks = htmlToBlocks('<ul><li>One</li><li><strong>Two</strong> more</li><li>   </li></ul><ol><li>First</li></ol>')
  assert.deepEqual(blocks.map(b => b.kind), ['ul', 'ol'])
  assert.deepEqual(blocks[0].items.map(text), ['One', 'Two more'])
  assert.deepEqual(blocks[1].items.map(text), ['First'])
})

test('tables keep a header row and body rows', () => {
  const [t] = htmlToBlocks('<table><thead><tr><th>Plan</th><th>Price</th></tr></thead><tbody><tr><td>Free</td><td>$0</td></tr><tr><td>Pro</td><td><strong>$8</strong></td></tr></tbody></table>')
  assert.equal(t.kind, 'table')
  assert.deepEqual(t.head.map(text), ['Plan', 'Price'])
  assert.deepEqual(t.rows.map(r => r.map(text)), [['Free', '$0'], ['Pro', '$8']])
  const [bare] = htmlToBlocks('<table><tr><td>a</td><td>b</td></tr></table>')
  assert.deepEqual(bare.head, [])
  assert.deepEqual(bare.rows.map(r => r.map(text)), [['a', 'b']])
})

test('links survive only as site paths or http(s) addresses', () => {
  const [p] = htmlToBlocks('<p><a href="/pricing">Pricing</a> <a href=\'https://example.com/a?b=1\'>Ex</a> <a href="javascript:alert(1)">bad</a> <a href="//evil.example">proto</a> <a href="data:text/html,x">data</a> <a>none</a></p>')
  const links = p.children.filter(n => n.kind === 'link')
  assert.deepEqual(links.map(l => l.href), ['/pricing', 'https://example.com/a?b=1'])
  assert.equal(text(p.children), 'Pricing Ex bad proto data none')
  assert.equal(safeHref(' /blog/x '), '/blog/x')
  for (const bad of ['javascript:alert(1)', '//evil.example', 'mailto:a@b.c', 'https://', '', null]) assert.equal(safeHref(bad), null, String(bad))
})

test('scripts and styles are dropped with their contents; other tags keep their text', () => {
  const blocks = htmlToBlocks('<p>Hi<script>alert(1)</script></p><style>p { color: red }</style><div><section><p>Inside</p></section></div><span>loose</span> text<iframe src="https://x">frame</iframe>')
  assert.deepEqual(blocks.map(b => [b.kind, text(b.children)]), [['p', 'Hi'], ['p', 'Inside'], ['p', 'loose text']])
})

test('line breaks count however they are written', () => {
  // Five live posts write <br/> with no space; it first came through as text.
  for (const br of ['<br>', '<br/>', '<br />', '<BR>']) {
    const [p] = htmlToBlocks(`<p>Morning (10 min):${br}Check notifications.</p>`)
    assert.deepEqual(p.children.map(n => n.kind), ['text', 'br', 'text'], br)
    assert.equal(text(p.children), 'Morning (10 min): Check notifications.', br)
  }
  const [img] = htmlToBlocks('<p>Before<img src="https://example.com/a.png"/>after</p>')
  assert.equal(text(img.children), 'Beforeafter')
})

test('whitespace collapses and broken nesting does not lose words', () => {
  assert.equal(text(htmlToBlocks('<p>\n  Many   spaces\n here  </p>')[0].children), 'Many spaces here')
  const blocks = htmlToBlocks('<p>Open <strong>bold</p><p>next</p></div></span>')
  assert.deepEqual(blocks.map(b => text(b.children)), ['Open bold', 'next'])
  assert.deepEqual(htmlToBlocks('<p></p><p> </p><!-- note --><hr>'), [])
})

test('as text, the blocks read in the line format', () => {
  const out = blocksToText(htmlToBlocks('<h2>Why</h2><p>Because.</p><ul><li>a</li><li>b</li></ul>'))
  assert.equal(out, '## Why\n\nBecause.\n\n- a\n- b')
})

test('a post stored as HTML gets a description without tags', () => {
  const description = describePost({ excerpt: null, content: '<h2>Intro</h2><p><strong>Short</strong></p><p>SocialMate schedules posts to seven platforms, and the free plan covers six of them.</p>' })
  assert.equal(description, 'SocialMate schedules posts to seven platforms, and the free plan covers six of them.')
  assert.equal(describePost({ excerpt: 'Own excerpt', content: '<p>ignored</p>' }), 'Own excerpt')
  assert.equal(describePost({ excerpt: null, content: 'A line-format post opens with a sentence long enough to count.' }), 'A line-format post opens with a sentence long enough to count.')
})

test('the post page draws HTML posts from blocks and never inserts their HTML', () => {
  const page = read('app/blog/[slug]/page.tsx')
  assert.match(page, /from '@\/lib\/blog\/html-blocks'/)
  assert.match(page, /looksLikeHtml\(content\) \? renderHtml\(content\) : renderLines\(content\)/)
  const inserts = page.match(/dangerouslySetInnerHTML/g) ?? []
  assert.equal(inserts.length, 1, 'only the JSON-LD script may use dangerouslySetInnerHTML')
  assert.match(page, /<script type="application\/ld\+json" dangerouslySetInnerHTML=\{\{ __html: JSON\.stringify\(articleSchema\) \}\} \/>/)
})
