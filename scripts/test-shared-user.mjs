#!/usr/bin/env node
/**
 * One sign-in check per page load (lib/shared-user.ts, Nov 20, 2026).
 *
 * A load of /accounts made nine getUser requests back to back before the page
 * could ask for its own data. These tests hold the shared check to its promise:
 * callers share a check in flight, only a signed-in answer is kept, and nothing
 * survives forget().
 *
 *   node scripts/test-shared-user.mjs
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
const read = rel => readFileSync(join(root, rel), 'utf8')
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

function load(rel) {
  const { outputText } = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
  return mod.exports
}

const { shareUserCheck } = load('lib/shared-user.ts')

const signedIn = id => ({ data: { user: { id } }, error: null })
const signedOut = () => ({ data: { user: null }, error: { name: 'AuthSessionMissingError' } })

// A fake getUser that answers when told to, and counts what it was asked.
function fakeAuth() {
  const calls = []
  const fetchUser = jwt => new Promise((resolve, reject) => calls.push({ jwt, resolve, reject }))
  return { calls, fetchUser }
}

test('callers arriving while a check is in flight share it', async () => {
  const { calls, fetchUser } = fakeAuth()
  const shared = shareUserCheck(fetchUser)
  const a = shared.getUser()
  const b = shared.getUser()
  const c = shared.getUser()
  assert.equal(calls.length, 1)
  calls[0].resolve(signedIn('u1'))
  const answers = await Promise.all([a, b, c])
  assert.ok(answers.every(r => r.data.user.id === 'u1'))
})

test('a signed-in answer is kept for a while, then asked again', async () => {
  let clock = 0
  const { calls, fetchUser } = fakeAuth()
  const shared = shareUserCheck(fetchUser, { keepMs: 1000, now: () => clock })
  const first = shared.getUser()
  calls[0].resolve(signedIn('u1'))
  await first
  clock = 999
  assert.equal((await shared.getUser()).data.user.id, 'u1')
  assert.equal(calls.length, 1, 'answered from what was kept')
  assert.equal(shared.keptUserId(), 'u1')
  clock = 1000
  const again = shared.getUser()
  assert.equal(calls.length, 2, 'asked again once the answer is old')
  calls[1].resolve(signedIn('u1'))
  await again
})

test('a signed-out or failed answer is never kept', async () => {
  const { calls, fetchUser } = fakeAuth()
  const shared = shareUserCheck(fetchUser)
  const first = shared.getUser()
  calls[0].resolve(signedOut())
  assert.equal((await first).data.user, null)
  const second = shared.getUser()
  assert.equal(calls.length, 2)
  calls[1].reject(new Error('network down'))
  await assert.rejects(second, /network down/)
  const third = shared.getUser()
  assert.equal(calls.length, 3, 'a thrown request does not block the next one')
  calls[2].resolve(signedIn('u2'))
  assert.equal((await third).data.user.id, 'u2')
  assert.equal(shared.keptUserId(), 'u2')
})

test('forget() drops the kept answer and the one in flight', async () => {
  const { calls, fetchUser } = fakeAuth()
  const shared = shareUserCheck(fetchUser)
  const first = shared.getUser()
  calls[0].resolve(signedIn('u1'))
  await first
  shared.forget()
  assert.equal(shared.keptUserId(), null)

  const inFlight = shared.getUser()
  assert.equal(calls.length, 2)
  shared.forget() // e.g. signed out while the check was running
  const afterSignOut = shared.getUser()
  assert.equal(calls.length, 3, 'a caller after forget() asks again')
  calls[1].resolve(signedIn('u1'))
  assert.equal((await inFlight).data.user.id, 'u1', 'its own callers still get an answer')
  assert.equal(shared.keptUserId(), null, 'but it is not kept')
  calls[2].resolve(signedOut())
  assert.equal((await afterSignOut).data.user, null)
})

test('checking a specific token always asks', async () => {
  const { calls, fetchUser } = fakeAuth()
  const shared = shareUserCheck(fetchUser)
  const plain = shared.getUser()
  calls[0].resolve(signedIn('u1'))
  await plain
  const withToken = shared.getUser('a.jwt.token')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].jwt, 'a.jwt.token')
  calls[1].resolve(signedIn('u9'))
  assert.equal((await withToken).data.user.id, 'u9')
  assert.equal(shared.keptUserId(), 'u1', 'a token check does not replace the kept answer')
})

test('the browser client shares the check, and only in the browser', () => {
  const src = code(read('lib/supabase.ts'))
  assert.match(src, /typeof window !== 'undefined'/)
  assert.match(src, /shareUserCheck\(auth\.getUser\.bind\(auth\)\)/)
  assert.match(src, /auth\.getUser = shared\.getUser/)
  assert.match(src, /onAuthStateChange/)
  assert.match(src, /shared\.forget\(\)/)
  // The override sits inside the browser-only block.
  assert.ok(src.indexOf('typeof window') < src.indexOf('auth.getUser = shared.getUser'))
})
