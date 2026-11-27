#!/usr/bin/env node
/**
 * Tests for lib/referral-code.ts and the four places that use it.
 *
 * Every referral code is stored in lowercase (297 of 297 on Nov 27, 2026), and
 * /refer/CODE and /z/CODE looked codes up uppercased, so both pages were a 404
 * for 288 of them, the one active partner included. /refer/CODE also set only a
 * 7-day cookie that nothing credits, so a visitor who left it and signed up
 * later was credited to no one.
 *
 *   node scripts/test-referral-code.mjs
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
const read = p => readFileSync(join(root, p), 'utf8')

const mod = { exports: {} }
new Function('module', 'exports', 'require', ts.transpileModule(read('lib/referral-code.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(mod, mod.exports, require)
const { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE_SECONDS, referralCodeCandidates, referralCodeFromUrl } = mod.exports

test('a code is looked up as given, in lowercase and in uppercase', () => {
  assert.deepEqual(referralCodeCandidates('a1b2c3d4'), ['a1b2c3d4', 'A1B2C3D4'])
  assert.deepEqual(referralCodeCandidates('A1B2C3D4'), ['A1B2C3D4', 'a1b2c3d4'])
  assert.deepEqual(referralCodeCandidates('ref_1a2b3c4d'), ['ref_1a2b3c4d', 'REF_1A2B3C4D'])
  assert.deepEqual(referralCodeCandidates('12345678'), ['12345678'])
  assert.deepEqual(referralCodeCandidates('  a1b2c3d4 '), ['a1b2c3d4', 'A1B2C3D4'])
})

test('anything that cannot be a code has nothing to look up', () => {
  for (const raw of ['', '   ', null, undefined, 'ab', 'chatgpt.com', 'a b c d', '<script>', 'x'.repeat(41), "a1'; drop"]) {
    assert.deepEqual(referralCodeCandidates(raw), [], String(raw))
  }
})

test('the referral a page view carries: ?ref= anywhere, or the /refer/ landing page', () => {
  const at = path => referralCodeFromUrl(new URL(`https://socialmate.studio${path}`))
  assert.equal(at('/?ref=a1b2c3d4'), 'a1b2c3d4')
  assert.equal(at('/pricing?ref=producthunt'), 'producthunt', '?ref= is taken as it comes, as it always was')
  assert.equal(at('/refer/a1b2c3d4'), 'a1b2c3d4')
  assert.equal(at('/refer/a1b2c3d4/'), 'a1b2c3d4')
  assert.equal(at('/refer/ref_1a2b3c4d'), 'ref_1a2b3c4d')
  assert.equal(at('/refer/A1B2C3D4'), 'A1B2C3D4', 'as typed: the lookups handle the case')
  assert.equal(at('/refer/aaa111?ref=bbb222'), 'bbb222', 'a ?ref= wins')
  for (const path of ['/', '/refer', '/refer/', '/refer/a1b2/extra', '/referral', '/refer/%3Cscript%3E', '/refer/%E0%A4%A', '/blog/refer/a1b2c3d4']) {
    assert.equal(at(path), null, path)
  }
})

test('the cookie keeps the 60 days partners are promised', () => {
  assert.equal(REFERRAL_COOKIE, 'sm_ref')
  assert.equal(REFERRAL_COOKIE_MAX_AGE_SECONDS, 60 * 24 * 60 * 60)
})

test('wiring: the proxy sets the cookie from either kind of link', () => {
  const proxy = read('proxy.ts')
  assert.match(proxy, /const refCode = referralCodeFromUrl\(request\.nextUrl\)/)
  assert.match(proxy, /response\.cookies\.set\(REFERRAL_COOKIE, refCode, \{/)
  assert.match(proxy, /maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS/)
  assert.match(proxy, /httpOnly: true/)
})

test('wiring: /refer, /z and the sign-in step look codes up through the candidates', () => {
  for (const file of ['app/refer/[code]/page.tsx', 'app/z/[code]/page.tsx']) {
    const src = read(file)
    assert.match(src, /const candidates = referralCodeCandidates\(code\)/, file)
    assert.match(src, /\.in\('referral_code', candidates\)\s*\.limit\(1\)\s*\.maybeSingle\(\)/, file)
    assert.doesNotMatch(src, /\.eq\('referral_code'|upperCode/, `${file} still looks the code up in one case`)
  }
  // /refer hands the stored spelling to the signup link and its cookie.
  const refer = read('app/refer/[code]/page.tsx')
  assert.match(refer, /code: storedCode,/)
  assert.match(refer, /const signupUrl = `\/signup\?ref=\$\{info\.code\}`/)

  const signIn = read('lib/sign-in.ts')
  assert.match(signIn, /\.in\('referral_code', candidates\)/)
  assert.match(signIn, /referral_code: {5}referrer\.referral_code \?\? refCode/)
  const callback = read('app/auth/callback/route.ts')
  assert.match(callback, /cookieStore\.get\(REFERRAL_COOKIE\)/)
  assert.match(callback, /cookieStore\.delete\(REFERRAL_COOKIE\)/)
})

test('no lookup anywhere uppercases a referral code, and only the helper names the cookie', () => {
  const files = []
  const walk = dir => {
    for (const name of readdirSync(join(root, dir))) {
      const rel = join(dir, name)
      if (statSync(join(root, rel)).isDirectory()) walk(rel)
      else if (/\.(ts|tsx)$/.test(name)) files.push(rel)
    }
  }
  walk('app'); walk('lib'); files.push('proxy.ts')
  for (const file of files) {
    const src = read(file)
    assert.doesNotMatch(src, /\.eq\('referral_code',[^)]*toUpperCase/, relative(root, join(root, file)))
    if (!file.replace(/\\/g, '/').endsWith('lib/referral-code.ts')) {
      assert.doesNotMatch(src, /'sm_ref'/, `${file} names the cookie itself`)
    }
  }
})
