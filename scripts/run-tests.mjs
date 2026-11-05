#!/usr/bin/env node
// Runs every scripts/test-*.mjs in its own Node process and fails if any fails.
// `npm test` calls this. Works the same on Windows and macOS/Linux, with no
// network and no install step beyond Node itself. The Python test for the
// schema-drift audit runs separately: python scripts/test-audit-schema-drift.py
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))
const files = readdirSync(dir).filter((f) => /^test-.*\.mjs$/.test(f)).sort()
let failed = 0
for (const f of files) {
  const r = spawnSync(process.execPath, [join(dir, f)], { encoding: 'utf8' })
  const ok = r.status === 0
  if (!ok) failed++
  console.log(`${ok ? 'pass' : 'FAIL'}  ${f}`)
  if (!ok) console.log((r.stdout || '') + (r.stderr || ''))
}
console.log(`\n${files.length - failed} of ${files.length} test files passed`)
process.exit(failed ? 1 : 0)
