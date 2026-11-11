#!/usr/bin/env node
/**
 * Tests for lib/device-class.ts, the device and in-app browser every funnel
 * event now carries.
 *
 *   node scripts/test-device-class.mjs
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

const source = readFileSync(join(root, 'lib/device-class.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { deviceClass, inAppBrowser } = mod.exports

const UA = {
  iphoneSafari:   'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  androidPhone:   'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  androidTablet:  'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  ipadOldUa:      'Mozilla/5.0 (iPad; CPU OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
  macSafari:      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  windowsChrome:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  tiktokInApp:    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_35.1.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US BytedanceWebview/d8a21c6',
  instagramInApp: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.20.94 (iPhone15,2; iOS 17_5; en_US; en)',
  facebookInApp:  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.40.75;]',
}

test('phones', () => {
  assert.equal(deviceClass(UA.iphoneSafari, 5), 'phone')
  assert.equal(deviceClass(UA.androidPhone, 5), 'phone')
  assert.equal(deviceClass(UA.tiktokInApp, 5), 'phone')
})

test('tablets, including an iPad that says it is a Mac', () => {
  assert.equal(deviceClass(UA.androidTablet, 10), 'tablet')
  assert.equal(deviceClass(UA.ipadOldUa, 5), 'tablet')
  assert.equal(deviceClass(UA.macSafari, 5), 'tablet')
})

test('desktops', () => {
  assert.equal(deviceClass(UA.macSafari, 0), 'desktop')
  assert.equal(deviceClass(UA.windowsChrome, 0), 'desktop')
  assert.equal(deviceClass('', 0), 'desktop')
})

test('in-app browsers', () => {
  assert.equal(inAppBrowser(UA.tiktokInApp), 'tiktok')
  assert.equal(inAppBrowser(UA.instagramInApp), 'instagram')
  assert.equal(inAppBrowser(UA.facebookInApp), 'facebook')
  assert.equal(inAppBrowser(UA.iphoneSafari), null)
  assert.equal(inAppBrowser(UA.windowsChrome), null)
})
