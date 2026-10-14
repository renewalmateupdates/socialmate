/**
 * Fix all /vs/* pages that have both 'use client' AND export const metadata.
 * Moves the metadata to a layout.tsx per route (correct Next.js 15 pattern).
 */
const fs = require('fs');
const path = require('path');

const vsDir = path.join(__dirname, '..', 'app', 'vs');
const entries = fs.readdirSync(vsDir, { withFileTypes: true });

let fixed = 0;
let skipped = 0;

entries.forEach(entry => {
  if (!entry.isDirectory()) return;
  const pageFile = path.join(vsDir, entry.name, 'page.tsx');
  const layoutFile = path.join(vsDir, entry.name, 'layout.tsx');

  if (!fs.existsSync(pageFile)) return;

  let content = fs.readFileSync(pageFile, 'utf8');

  // Only process files that have BOTH 'use client' AND export const metadata
  const hasClient = content.includes("'use client'");
  const hasMeta = content.includes('export const metadata');
  if (!hasClient || !hasMeta) { skipped++; return; }
  // Skip if layout already exists
  if (fs.existsSync(layoutFile)) { skipped++; return; }

  // ── Extract the metadata block ──────────────────────────────────────────
  const metaStart = content.indexOf('export const metadata');
  if (metaStart === -1) { skipped++; return; }

  // Find the opening brace of the metadata object
  const braceStart = content.indexOf('{', metaStart);
  if (braceStart === -1) { skipped++; return; }

  // Walk forward counting braces to find the closing brace
  let depth = 0;
  let braceEnd = -1;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) { braceEnd = i; break; }
    }
  }
  if (braceEnd === -1) { skipped++; return; }

  const metaBlock = content.slice(metaStart, braceEnd + 1);

  // ── Build the layout.tsx ─────────────────────────────────────────────────
  const layoutContent = `import type { Metadata } from 'next'

${metaBlock}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`;

  fs.writeFileSync(layoutFile, layoutContent, 'utf8');

  // ── Clean the page.tsx ───────────────────────────────────────────────────
  // Remove the metadata block (including trailing newline)
  let cleaned = content.slice(0, metaStart) + content.slice(braceEnd + 1);

  // Remove the `import type { Metadata } from 'next'` line (no longer needed in page)
  cleaned = cleaned.replace(/^.*import type \{ Metadata \} from 'next'.*\n?/m, '');
  // Also handle the BOM variant
  cleaned = cleaned.replace(/^﻿?import type \{ Metadata \} from 'next'.*\n?/m, '');

  // Collapse extra blank lines left behind (max 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(pageFile, cleaned, 'utf8');
  fixed++;
  process.stdout.write(`✓ ${entry.name}\n`);
});

console.log(`\nDone: ${fixed} fixed, ${skipped} skipped`);
