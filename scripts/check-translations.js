// Check if non-English locales have real translations or English placeholders
// Shows namespaces where all values are identical to English (likely untranslated)
const fs = require('fs')
const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'))
const locales = ['es','de','fr','pt','ru','zh','ja','ko']

function allLeafKeys(obj, prefix) {
  prefix = prefix || ''
  let keys = []
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k
    if (typeof obj[k] === 'object' && obj[k] !== null) keys = keys.concat(allLeafKeys(obj[k], full))
    else keys.push(full)
  }
  return keys
}

function getVal(obj, key) {
  const parts = key.split('.')
  let v = obj
  for (const p of parts) v = v ? v[p] : undefined
  return v
}

// For each namespace, check what % of keys are identical to English in each locale
const namespaces = Object.keys(en)
const report = []

for (const ns of namespaces) {
  const nsKeys = allLeafKeys(en[ns], ns)
  for (const loc of locales) {
    const msgs = JSON.parse(fs.readFileSync('./messages/' + loc + '.json', 'utf8'))
    let sameAsEn = 0
    let total = nsKeys.length
    for (const key of nsKeys) {
      const enVal = getVal(en, key)
      const locVal = getVal(msgs, key)
      if (enVal === locVal) sameAsEn++
    }
    const pct = Math.round((sameAsEn / total) * 100)
    // Only report namespaces that are 100% English (untranslated) - skip trivially small ones
    if (pct === 100 && total >= 3) {
      report.push({ ns, loc, total, sameAsEn, pct })
    }
  }
}

if (report.length === 0) {
  console.log('All namespaces have at least some translations in each locale!')
} else {
  // Group by locale
  const byLoc = {}
  for (const r of report) {
    if (!byLoc[r.loc]) byLoc[r.loc] = []
    byLoc[r.loc].push(r)
  }
  for (const [loc, rows] of Object.entries(byLoc)) {
    console.log('\n=== ' + loc + ' - ' + rows.length + ' fully-untranslated namespaces ===')
    rows.forEach(r => console.log('  ' + r.ns + ' (' + r.total + ' keys)'))
  }
  console.log('\nNote: These namespaces have 100% English values - they need translation or are intentionally English.')
}
