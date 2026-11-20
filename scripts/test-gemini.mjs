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
const {
  GEMINI_MODEL, GEMINI_MODELS, GEMINI_TIMEOUT_MS, GEMINI_ATTEMPT_MS, GEMINI_LONG_MS, GEMINI_LONG_ATTEMPT_MS, GEMINI_COOLDOWN_MS,
  geminiModel, modelsInOrder, forgetGeminiFailures, shouldTryNextModel, describeGeminiError, isGeminiTimeout, aiFailureMessage,
  redactKeys, stableFlashModels,
} = mod.exports
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
  forgetGeminiFailures()
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
  // The first two models' shares leave the last one time to answer.
  assert.ok(GEMINI_ATTEMPT_MS * 2 < GEMINI_TIMEOUT_MS - 5_000)
  // Longer answers still finish inside the 60 second Inngest and SOMA ingest functions.
  assert.ok(GEMINI_LONG_MS <= 45_000 && GEMINI_LONG_ATTEMPT_MS < GEMINI_LONG_MS)
})

// A fake Gemini API: each model answers as `behave[model]` says ('ok', 'hang',
// { delay: ms } before answering, or an HTTP error status; 503 by default), and
// every model asked is recorded in order.
function fakeGemini(behave) {
  forgetGeminiFailures()
  const asked = []
  const realFetch = globalThis.fetch
  globalThis.fetch = (url, init) => {
    const model = String(url).match(/models\/([^:]+):generateContent/)?.[1]
    asked.push(model)
    const how = behave[model] ?? 503
    const ok = () => new Response(JSON.stringify({
      candidates: [{ content: { role: 'model', parts: [{ text: `hello from ${model}` }] }, finishReason: 'STOP', index: 0 }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    if (how === 'ok') return Promise.resolve(ok())
    if (typeof how === 'object') {
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve(ok()), how.delay)
        init?.signal?.addEventListener('abort', () => { clearTimeout(t); reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })) })
      })
    }
    if (how === 'hang') {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })))
      })
    }
    const status = how
    const body = { error: { code: status, status: status === 503 ? 'UNAVAILABLE' : 'PERMISSION_DENIED', message: status === 503 ? 'This model is currently experiencing high demand.' : 'Your project has been denied access.' } }
    return Promise.resolve(new Response(JSON.stringify(body), { status, statusText: status === 503 ? 'Service Unavailable' : 'Forbidden', headers: { 'Content-Type': 'application/json' } }))
  }
  return { asked, restore: () => { globalThis.fetch = realFetch } }
}

test('a busy model hands the request to the next one, as on the evening of Nov 19', async () => {
  const [first, second] = GEMINI_MODELS
  const fake = fakeGemini({ [first]: 503, [second]: 'ok' })
  try {
    const result = await geminiModel('test-key').generateContent('hi')
    assert.equal(result.response.text(), `hello from ${second}`)
    assert.deepEqual(fake.asked, [first, second])
  } finally {
    fake.restore()
  }
})

test('a model that says nothing within its share of the time hands over, as 3.6 Flash did all day Nov 19', async () => {
  const [first, second] = GEMINI_MODELS
  const fake = fakeGemini({ [first]: 'hang', [second]: 'ok' })
  try {
    const started = Date.now()
    const result = await geminiModel('test-key', {}, 3_000, 200).generateContent('hi')
    assert.equal(result.response.text(), `hello from ${second}`)
    assert.ok(Date.now() - started < 1_500, 'it moved on after the first model\'s share, not the whole limit')
    assert.deepEqual(fake.asked, [first, second])
  } finally {
    fake.restore()
  }
})

test('a model that just failed is asked last for a few minutes, then first again', async () => {
  const [first, second] = GEMINI_MODELS
  const fake = fakeGemini({ [first]: 503, [second]: 'ok' })
  try {
    await geminiModel('test-key').generateContent('hi')
    assert.deepEqual(fake.asked, [first, second])

    // The next request skips the busy model, so it takes as long as the one
    // that answers: on Nov 20, 2026 every Write with AI waited 15 s on 3.8 first.
    fake.asked.length = 0
    const result = await geminiModel('test-key').generateContent('hi again')
    assert.equal(result.response.text(), `hello from ${second}`)
    assert.deepEqual(fake.asked, [second])
    assert.equal(modelsInOrder().at(-1), first)

    // After the cool-down it is asked first again.
    assert.deepEqual(modelsInOrder(Date.now() + GEMINI_COOLDOWN_MS + 1), [...GEMINI_MODELS])
  } finally {
    fake.restore()
  }
})

test('a slow answer inside the model\'s share is kept, not thrown away for the next model', async () => {
  const [first] = GEMINI_MODELS
  const fake = fakeGemini({ [first]: { delay: 150 } })
  try {
    const result = await geminiModel('test-key', {}, 3_000, 1_000).generateContent('hi')
    assert.equal(result.response.text(), `hello from ${first}`)
    assert.deepEqual(fake.asked, [first])
  } finally {
    fake.restore()
  }
})

test('a refused key is not asked of every model, and every model failing still reaches the refund', async () => {
  const refused = fakeGemini({ [GEMINI_MODELS[0]]: 403 })
  try {
    const err = await geminiModel('test-key').generateContent('hi').then(() => null, e => e)
    assert.equal(err?.status, 403)
    assert.deepEqual(refused.asked, [GEMINI_MODELS[0]])
    assert.equal(shouldTryNextModel(err), false)
    // A refused key is not the model's fault, so it stays first.
    assert.equal(modelsInOrder()[0], GEMINI_MODELS[0])
  } finally {
    refused.restore()
  }

  const allBusy = fakeGemini({})
  try {
    const err = await geminiModel('test-key').generateContent('hi').then(() => null, e => e)
    assert.equal(err?.status, 503)
    assert.deepEqual(allBusy.asked, [...GEMINI_MODELS])
    assert.equal(aiFailureMessage(err), 'AI generation failed — credits refunded')
    // The log line keeps Google's reason, not the SDK's prefix and the URL.
    const said = describeGeminiError(err)
    assert.match(said, /^\[503 Service Unavailable\] This model is currently experiencing high demand/)
    assert.doesNotMatch(said, /googleapis|GoogleGenerativeAI/)
  } finally {
    allBusy.restore()
  }
})

// What /api/admin/health listed for the production key on Nov 19, 2026.
const NOV19_FLASH_MODELS = [
  'gemini-2.5-flash', 'gemini-2.5-flash-image', 'gemini-2.5-flash-lite', 'gemini-2.5-flash-native-audio-latest',
  'gemini-2.5-flash-native-audio-preview-09-2025', 'gemini-2.5-flash-native-audio-preview-12-2025',
  'gemini-2.5-flash-preview-tts', 'gemini-3-flash-preview', 'gemini-3.1-flash-image', 'gemini-3.1-flash-image-preview',
  'gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-image', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-live-preview',
  'gemini-3.1-flash-tts-preview', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash',
  'gemini-3.8-flash', 'gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'gemini-flash-latest',
  'gemini-flash-lite-latest', 'gemini-omni-1.1-flash', 'gemini-omni-1.2-flash', 'gemini-omni-flash-preview',
]

test('the fallback list is the stable text Flash models: no previews, aliases, image, speech or live ones', () => {
  assert.deepEqual(stableFlashModels(NOV19_FLASH_MODELS), [
    'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash',
    'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.8-flash',
  ])
})

test('the app runs on stable Flash models the key lists, not previews or aliases Google re-points', () => {
  assert.equal(GEMINI_MODEL, GEMINI_MODELS[0])
  assert.equal(new Set(GEMINI_MODELS).size, GEMINI_MODELS.length, 'a model is listed twice')
  assert.ok(GEMINI_MODELS.length >= 2, 'one model is not enough: see lib/gemini.ts')
  assert.deepEqual(stableFlashModels([...GEMINI_MODELS]), [...GEMINI_MODELS])
  for (const m of GEMINI_MODELS) assert.ok(NOV19_FLASH_MODELS.includes(m), m)
  // gemini-3.6-flash hung all day on Nov 19, 2026 (Google Cloud retired it that
  // day), so it is not the first choice; it answered that evening, so it stays
  // in the chain.
  assert.notEqual(GEMINI_MODEL, 'gemini-3.6-flash')
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
  assert.deepEqual(offenders, [], 'models are named in GEMINI_MODELS in lib/gemini.ts')
})

test('every Gemini call goes through the chain in lib/gemini.ts', () => {
  // A model built anywhere else asks one model with no fallback, and usually
  // no time limit: the two ways all AI went down on Nov 19, 2026.
  const offenders = [...walk('app'), ...walk('lib')]
    .filter(f => f !== 'lib/gemini.ts')
    .filter(f => /getGenerativeModel\(|new GoogleGenerativeAI\(/.test(read(f)))
  assert.deepEqual(offenders, [], 'use geminiModel() or geminiLongModel() from @/lib/gemini')
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
  assert.match(src, /models\/\$\{model\}:generateContent/)
  // Every model requests can fall back to is asked, not only the first.
  assert.match(src, /GEMINI_MODELS\.map\(m => askGemini\(m, headers\)\)/)
  assert.match(src, /redactKeys\(/)
  assert.match(src, /AbortSignal\.timeout\(/)
  // The key goes in the request header and nowhere else: not into what it returns.
  const code = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(code, /'x-goog-api-key': key\b/)
  assert.doesNotMatch(code, /(probe|answer)\.\w+\s*=[^\n]*\bkey\b/, 'a returned field is built from the key')
  assert.doesNotMatch(code, /\{ \.\.\.(probe|answer),[^}]*\bkey\b/, 'the key is spread into the result')
  for (const type of [/type GeminiAnswer = \{[^}]*\}/, /type GeminiProbe = \{[^}]*\}/]) {
    assert.match(code, type)
    assert.doesNotMatch(code.match(type)[0], /\bkey\b/, 'a returned type has a key field')
  }
})

test('the health check asks the other stable Flash models when the whole chain fails, and ?try= names only models', () => {
  const src = read('app/api/admin/health/route.ts')
  assert.match(src, /answered \? \[\] : stableFlashModels\(names \?\? \[\]\)/)
  assert.match(src, /filter\(s => MODEL_NAME\.test\(s\)\)/)
  const literal = src.match(/const MODEL_NAME = \/(.+)\/\r?$/m)
  assert.ok(literal, 'MODEL_NAME is a regex literal')
  const MODEL_NAME = new RegExp(literal[1])
  for (const ok of ['gemini-3.8-flash', 'gemini-3.5-flash-lite']) assert.ok(MODEL_NAME.test(ok), ok)
  for (const bad of ['../models', 'gemini-3.8-flash:generateContent', 'gemini-x?key=1', 'gemini-a/b', 'GEMINI-3', '']) {
    assert.equal(MODEL_NAME.test(bad), false, bad)
  }
})

console.log(`checked ${relative(root, join(root, 'lib/gemini.ts'))}`)
