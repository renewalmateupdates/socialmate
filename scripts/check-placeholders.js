// Check that {param} placeholder names match en.json in all locale files
const fs = require('fs')
const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'))
const locales = ['es','de','fr','pt','ru','zh','ja','ko']
// zh, ja and ko don't inflect nouns for number, so a translation may drop the
// English-only {plural} suffix ("trade{plural}") and still read correctly.
const NO_PLURAL_LOCALES = new Set(['zh','ja','ko'])

function getVal(obj, key) {
  const parts = key.split('.')
  let v = obj
  for (const p of parts) v = v ? v[p] : undefined
  return v
}

function allKeys(obj, prefix) {
  prefix = prefix || ''
  let keys = []
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k
    if (typeof obj[k] === 'object' && obj[k] !== null) keys = keys.concat(allKeys(obj[k], full))
    else keys.push(full)
  }
  return keys
}

function getPlaceholders(str) {
  if (typeof str !== 'string') return []
  const matches = str.match(/\{(\w+)\}/g) || []
  return matches.map(m => m.slice(1, -1)).sort()
}

const enKeys = allKeys(en)
let mismatchCount = 0

for (const loc of locales) {
  const msgs = JSON.parse(fs.readFileSync('./messages/' + loc + '.json', 'utf8'))
  for (const key of enKeys) {
    const enVal = getVal(en, key)
    const locVal = getVal(msgs, key)
    const enPh = getPlaceholders(enVal)
    const locPh = getPlaceholders(locVal)
    const expected = NO_PLURAL_LOCALES.has(loc) && !locPh.includes('plural')
      ? enPh.filter(p => p !== 'plural')
      : enPh
    if (expected.length > 0 && JSON.stringify(expected) !== JSON.stringify(locPh)) {
      console.log('[' + loc + '] ' + key)
      console.log('  en:  ' + enVal)
      console.log('  ' + loc + ': ' + locVal)
      console.log('  en placeholders: ' + enPh.join(', '))
      console.log('  ' + loc + ' placeholders: ' + locPh.join(', '))
      mismatchCount++
    }
  }
}

if (mismatchCount === 0) console.log('All placeholders match across all locales!')
else console.log('\nTotal mismatches: ' + mismatchCount)
