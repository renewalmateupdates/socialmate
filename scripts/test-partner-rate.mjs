#!/usr/bin/env node
/**
 * Tests for lib/partner-rate.ts: 30%, then 40% from 100 active referrals, and
 * 40% kept after that ("40% forever").
 *
 *   node scripts/test-partner-rate.mjs
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

const source = readFileSync(join(root, 'lib/partner-rate.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { partnerRate, partnerTier, partnerFigures } = mod.exports

test('30% below 100 active referrals, 40% at 100', () => {
  assert.equal(partnerRate(0), 0.30)
  assert.equal(partnerRate(99), 0.30)
  assert.equal(partnerRate(100), 0.40)
  assert.equal(partnerRate(250), 0.40)
})

test('40% stays after the count drops below 100', () => {
  assert.equal(partnerRate(99, 0.40), 0.40)
  assert.equal(partnerRate(0, 0.40), 0.40)
  // Numeric columns can come back a hair under.
  assert.equal(partnerRate(10, 0.3999999), 0.40)
})

test('a stored 30% or nothing stored never raises the rate', () => {
  assert.equal(partnerRate(50, 0.30), 0.30)
  assert.equal(partnerRate(50, null), 0.30)
  assert.equal(partnerRate(50, undefined), 0.30)
})

test('the tier a partner sees', () => {
  assert.deepEqual(partnerTier(40), { rate: 0.30, label: '30%', nextTier: { rate: '40%', remaining: 60 } })
  assert.deepEqual(partnerTier(120), { rate: 0.40, label: '40%', nextTier: null })
  // Reached once, then churned below 100: still 40%, nothing left to reach.
  assert.deepEqual(partnerTier(97, 0.40), { rate: 0.40, label: '40%', nextTier: null })
})

test('list figures come from the affiliates row, earnings in cents', () => {
  assert.deepEqual(
    partnerFigures({ active_referral_count: 3, commission_rate: 0.3, total_earnings: 12.34, unpaid_earnings: 4.5 }),
    { active_referral_count: 3, commission_rate: 0.30, total_earnings_cents: 1234, available_balance_cents: 450 },
  )
  assert.deepEqual(
    partnerFigures(null),
    { active_referral_count: 0, commission_rate: 0.30, total_earnings_cents: 0, available_balance_cents: 0 },
  )
})
