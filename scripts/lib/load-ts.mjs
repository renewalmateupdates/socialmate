/**
 * Loads a TypeScript module from this repo in plain Node, for scripts and
 * tests: transpiles it, and follows its relative and "@/..." imports.
 * Type-only imports cost nothing; a package import resolves from node_modules.
 * JSON imports work. Anything that needs Next or the browser will not.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const nodeRequire = createRequire(join(root, 'package.json'))
const ts = nodeRequire('typescript')
const cache = new Map()

function resolveFile(spec, fromDir) {
  const base = spec.startsWith('@/') ? join(root, spec.slice(2)) : resolve(fromDir, spec)
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

export function loadTs(file) {
  const full = resolve(file)
  if (cache.has(full)) return cache.get(full).exports
  const mod = { exports: {} }
  cache.set(full, mod)
  if (full.endsWith('.json')) {
    mod.exports = JSON.parse(readFileSync(full, 'utf8'))
    return mod.exports
  }
  const { outputText } = ts.transpileModule(readFileSync(full, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: full,
  })
  const localRequire = (spec) => {
    if (spec.startsWith('.') || spec.startsWith('@/')) {
      const target = resolveFile(spec, dirname(full))
      if (!target) throw new Error(`load-ts: cannot resolve ${spec} from ${full}`)
      return loadTs(target)
    }
    return nodeRequire(spec)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

export const repoRoot = root
