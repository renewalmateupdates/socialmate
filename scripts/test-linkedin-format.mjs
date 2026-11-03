#!/usr/bin/env node
/**
 * Tests for lib/tools/linkedin-format.ts (the free LinkedIn formatter at
 * /tools/linkedin-formatter).
 *
 *   node scripts/test-linkedin-format.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/tools/linkedin-format.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { styleText, plainText, toList, linkedinLength, seeMoreCut, SEE_MORE_CHARS } = mod.exports

test('bold maps letters and digits to sans-serif bold', () => {
  assert.equal(styleText('Ab9', 'bold'), '\u{1D5D4}\u{1D5EF}\u{1D7F5}')
})

test('italic and bold italic leave digits plain (the block has none)', () => {
  assert.equal(styleText('a1', 'italic'), '\u{1D622}1')
  assert.equal(styleText('Z2', 'boldItalic'), '\u{1D655}2')
})

test('punctuation, emoji, accents and spaces pass through untouched', () => {
  const s = 'Hi, café 🚀 #tag!'
  const bold = styleText(s, 'bold')
  assert.ok(bold.includes(', '), 'comma and space kept')
  assert.ok(bold.includes('🚀'), 'emoji kept')
  assert.ok(bold.includes('é'), 'accented letter kept (no styled form)')
  assert.ok(bold.includes('#'), 'hash kept')
})

test('plainText undoes every style', () => {
  const s = 'Launch day: 3 lessons from 10 years'
  for (const style of ['bold', 'italic', 'boldItalic']) assert.equal(plainText(styleText(s, style)), s)
})

test('re-styling replaces the old style instead of stacking', () => {
  assert.equal(styleText(styleText('Hello', 'bold'), 'italic'), styleText('Hello', 'italic'))
})

test('fuzz: styling then clearing never loses or changes text', () => {
  const chars = 'abcXYZ019 ,.!?\n🚀éñ漢字-—"\''
  for (let i = 0; i < 300; i++) {
    let s = ''
    const len = Math.floor(Math.random() * 60)
    for (let j = 0; j < len; j++) s += Array.from(chars)[Math.floor(Math.random() * Array.from(chars).length)]
    for (const style of ['bold', 'italic', 'boldItalic']) assert.equal(plainText(styleText(s, style)), s)
  }
})

test('lists number lines, skip blank ones and replace existing markers', () => {
  assert.equal(toList('one\n\ntwo\nthree', 'number'), '1. one\n\n2. two\n3. three')
  assert.equal(toList('• a\n2. b\n→ c', 'dot'), '• a\n• b\n• c')
  assert.equal(toList(toList('a\nb', 'arrow'), 'arrow'), '→ a\n→ b')
})

test('styled letters count double toward the limit (the safe side)', () => {
  assert.equal(linkedinLength('ab'), 2)
  assert.equal(linkedinLength(styleText('ab', 'bold')), 4)
})

test('see-more cut is the third line break or about 200 characters, whichever is first', () => {
  assert.equal(seeMoreCut('a\nb\nc\nd'), 5)
  assert.equal(seeMoreCut('x'.repeat(500)), SEE_MORE_CHARS)
  assert.equal(seeMoreCut('short'), 5)
})
