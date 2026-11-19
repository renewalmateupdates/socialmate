#!/usr/bin/env node
/**
 * lib/gemini.ts and the routes that use it (Nov 19, 2026).
 *
 * That morning every Write with AI request hung until Vercel ended the function
 * at 300 seconds: five minutes of "Generating with Gemini...", then "Network
 * error", and the credits the route took first were never refunded, because
 * the catch block that refunds them never ran. These tests hold the time limit,
 * the one model name, and the admin health check that asks Gemini for real.
 *
 *   node scripts/test-gemini.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const read = rel => readFileSync(join(root, rel), 'utf8')

const { outputText } = ts.transpileModule(read('lib/gemini.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { GEMINI_MODEL, GEMINI_TIMEOUT_MS, geminiModel, isGeminiTimeout, aiFailureMessage, redactKeys } = mod.exports
const { GoogleGenerativeAIAbortError, GoogleGenerativeAIFetchError } = require('@google/generative-ai')

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel.replace(/\\/g, '/'))
  }
  return out
}

test('a Gemini call that never answers gives up at the time limit with an error the routes recognize', async () => {
  const realFetch = globalThis.fetch
  // A server that accepts the request and never answers, like production on Nov 19.
  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })))
  })
  try {
    const started = Date.now()
    const err = await geminiModel('test-key', {}, 60).generateContent('hi').then(() => null, e => e)
    assert.ok(err, 'the call should fail, not hang')
    assert.ok(Date.now() - started < 2000, 'it gave up near the limit')
    assert.ok(isGeminiTimeout(err), String(err))
    assert.match(aiFailureMessage(err), /took too long.*refunded/i)
  } finally {
    globalThis.fetch = realFetch
  }
})

test('timeouts are told apart from other Gemini failures', () => {
  assert.equal(isGeminiTimeout(new GoogleGenerativeAIAbortError('Request aborted when fetching x')), true)
  assert.equal(isGeminiTimeout(new Error('[GoogleGenerativeAI Error]: Request aborted when fetching https://x: This operation was aborted')), true)
  assert.equal(isGeminiTimeout(new GoogleGenerativeAIFetchError('[403 Forbidden] Your project has been denied access', 403, 'Forbidden')), false)
  assert.equal(isGeminiTimeout(undefined), false)
  assert.equal(aiFailureMessage(new Error('[404 Not Found] model gone')), 'AI generation failed — credits refunded')
})

test('a 40 second limit leaves the 60 second routes time to refund', () => {
  assert.equal(GEMINI_TIMEOUT_MS, 40_000)
  assert.match(GEMINI_MODEL, /^gemini-/)
})

test('anything shaped like an API key is removed from text shown to an admin', () => {
  const msg = "Permission denied: Consumer 'api_key:AIzaSyA1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvW' has been suspended."
  assert.equal(redactKeys(msg).includes('AIza'), false)
  assert.match(redactKeys(msg), /key removed/)
  assert.equal(redactKeys('PERMISSION_DENIED: Your project has been denied access.'), 'PERMISSION_DENIED: Your project has been denied access.')
})

test('the model name is written in one place: lib/gemini.ts', () => {
  const offenders = [...walk('app'), ...walk('lib')]
    .filter(f => f !== 'lib/gemini.ts')
    .filter(f => /['"`]gemini-\d/.test(read(f)))
  assert.deepEqual(offenders, [], 'import GEMINI_MODEL from @/lib/gemini instead')
})

test('every /api/ai route that calls Gemini has the time limit, maxDuration and the refund message', () => {
  const routes = walk('app/api/ai').filter(f => f.endsWith('/route.ts')).filter(f => /generateContent|geminiModel/.test(read(f)))
  assert.ok(routes.length >= 7, `found ${routes.length}`)
  for (const f of routes) {
    const src = read(f)
    assert.doesNotMatch(src, /new GoogleGenerativeAI\(/, `${f} builds its own model with no time limit`)
    assert.match(src, /geminiModel\(apiKey/, f)
    assert.match(src, /export const maxDuration = 60/, f)
    assert.match(src, /refundAiCredits\(/, f)
    assert.match(src, /aiFailureMessage\(aiErr\)/, f)
  }
})

test('Compose shows the route message when Write with AI fails', () => {
  assert.match(read('app/compose/page.tsx'), /setAiError\(data\.message \|\| 'Something went wrong\. Please try again\.'\)/)
})

test('the admin health check asks Gemini for real and never returns the key', () => {
  const src = read('app/api/admin/health/route.ts')
  assert.match(src, /models\/\$\{GEMINI_MODEL\}:generateContent/)
  assert.match(src, /redactKeys\(/)
  assert.match(src, /AbortSignal\.timeout\(/)
  // The key goes in the request header and nowhere else: not into the probe it returns.
  const code = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(code, /'x-goog-api-key': key\b/)
  assert.doesNotMatch(code, /probe\.\w+\s*=[^\n]*\bkey\b/, 'a probe field is built from the key')
  assert.doesNotMatch(code, /\{ \.\.\.probe,[^}]*\bkey\b/, 'the key is spread into the probe')
  assert.match(code, /type GeminiProbe = \{[^}]*\}/)
  assert.doesNotMatch(code.match(/type GeminiProbe = \{[^}]*\}/)[0], /\bkey\b/, 'the probe type has no key field')
})

console.log(`checked ${relative(root, join(root, 'lib/gemini.ts'))}`)
