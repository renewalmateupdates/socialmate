// Check all t() calls in tsx/ts files against en.json keys
// Only validates files that use useI18n() (fully-qualified keys).
// createT()-based files use namespace-relative keys and are skipped.
const fs = require('fs')
const path = require('path')
const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'))

function getVal(obj, key) {
  const parts = key.split('.')
  let v = obj
  for (const p of parts) v = v ? v[p] : undefined
  return v
}

function findFiles(dir) {
  let results = []
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const full = path.join(dir, item.name)
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        results = results.concat(findFiles(full))
      } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
        results.push(full)
      }
    }
  } catch {}
  return results
}

const dirs = ['./app', './components', './lib']
let files = []
for (const d of dirs) files = files.concat(findFiles(d))

// Only check files that use useI18n — these use fully-qualified keys like t('namespace.key')
// Skip createT-based files (LocalizedLanding) which use namespace-relative keys
const keyRegex = /\bt\(\s*['"`]([a-z_][a-z0-9_.]+)['"`]\s*\)/g
const broken = []

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8')
  if (!content.includes('useI18n')) continue   // only check useI18n files
  let match
  keyRegex.lastIndex = 0
  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1]
    if (!getVal(en, key)) {
      broken.push({ file: f.replace(process.cwd() + path.sep, ''), key })
    }
  }
}

if (broken.length === 0) {
  console.log('No broken t() keys found!')
} else {
  const byFile = {}
  for (const b of broken) {
    if (!byFile[b.file]) byFile[b.file] = []
    byFile[b.file].push(b.key)
  }
  for (const [file, keys] of Object.entries(byFile)) {
    console.log('\n' + file)
    keys.forEach(k => console.log('  BROKEN: ' + k))
  }
  console.log('\nTOTAL: ' + broken.length + ' broken keys')
}
