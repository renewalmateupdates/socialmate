#!/usr/bin/env node
/**
 * The main column beside the sidebar may shrink to the screen (Nov 19, 2026).
 *
 * Pages put their content in `md:ml-56 flex-1`, a flex item, and a flex item
 * will not shrink below its widest unbreakable line unless it has min-w-0 (or
 * scrolls). On a 375 px phone, opening the Queue's Scheduled card listed post
 * previews on one line each, and the whole page became 801 px wide. With
 * min-w-0 those lines truncate as written.
 *
 *   node scripts/test-layout-columns.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (name.endsWith('.tsx')) out.push(rel.replace(/\\/g, '/'))
  }
  return out
}

test('every main column beside the sidebar can shrink to the screen', () => {
  const offenders = []
  for (const f of [...walk('app'), ...walk('components')]) {
    const src = readFileSync(join(root, f), 'utf8')
    for (const m of src.matchAll(/className="([^"]*md:ml-56 flex-1[^"]*)"/g)) {
      if (!/\bmin-w-0\b|\boverflow-(auto|hidden|y-auto|x-auto|scroll)\b/.test(m[1])) offenders.push(`${f}: ${m[1]}`)
    }
  }
  assert.deepEqual(offenders, [], 'add min-w-0 to these columns')
})

test('the Queue keeps truncating its Next up previews', () => {
  const src = readFileSync(join(root, 'app/queue/page.tsx'), 'utf8')
  assert.match(src, /md:ml-56 flex-1 min-w-0/)
  assert.match(src, /<span className="truncate text-gray-700 dark:text-gray-300">\{item\.text \|\| 'No caption'\}<\/span>/)
})
