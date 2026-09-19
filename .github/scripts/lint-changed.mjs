#!/usr/bin/env node
/*
 * Diff-aware ESLint for CI.
 *
 * Runs ESLint on the client source files changed in a PR, but only FAILS on
 * problems located on lines the PR actually added/changed. This lets us enforce
 * clean new code without being blocked by the repo's pre-existing lint backlog
 * in files a PR merely touches.
 *
 * Usage: node .github/scripts/lint-changed.mjs <baseSha> <headSha>
 *   - Fails (exit 1) if any ESLint *error* sits on a changed line.
 *   - Warnings on changed lines are printed but do not fail the run.
 */
import { execSync } from 'node:child_process';

const [, , BASE, HEAD = 'HEAD'] = process.argv;
if (!BASE) {
  console.error('Usage: lint-changed.mjs <baseSha> [headSha]');
  process.exit(2);
}

const sh = cmd => execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// 1. Changed client source files (added/copied/modified/renamed).
const changedFiles = sh(`git diff --name-only --diff-filter=ACMR ${BASE} ${HEAD} -- client/src`)
  .split('\n')
  .map(s => s.trim())
  .filter(f => /\.(jsx?|tsx?)$/.test(f));

if (changedFiles.length === 0) {
  console.log('No client source files changed — nothing to lint.');
  process.exit(0);
}

// 2. Added/changed line numbers (new-file side) per file, from unified=0 diff.
function changedLines(file) {
  const out = sh(`git diff --unified=0 ${BASE} ${HEAD} -- "${file}"`);
  const lines = new Set();
  for (const m of out.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(m[1]);
    const count = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < count; i++) lines.add(start + i);
  }
  return lines;
}
const changedLineMap = new Map(changedFiles.map(f => [f, changedLines(f)]));

// 3. Run ESLint (from client/, paths relative to client/) and get JSON.
const relFiles = changedFiles.map(f => f.replace(/^client\//, ''));
let results = [];
try {
  const json = execSync(
    `ESLINT_USE_FLAT_CONFIG=false npx eslint ${relFiles.map(f => `"${f}"`).join(' ')} -f json`,
    { cwd: 'client', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  results = JSON.parse(json);
} catch (e) {
  // ESLint exits non-zero when it finds problems; its JSON is still on stdout.
  if (e.stdout) {
    results = JSON.parse(e.stdout);
  } else {
    console.error('Failed to run ESLint:', e.message);
    process.exit(2);
  }
}

// 4. Keep only messages on changed lines.
let errorCount = 0;
let warnCount = 0;
for (const res of results) {
  const rel = res.filePath.split(/client[\\/]/).pop(); // -> src/...
  const key = `client/${rel}`;
  const onLines = changedLineMap.get(key);
  if (!onLines) continue;
  for (const msg of res.messages) {
    if (msg.line == null || !onLines.has(msg.line)) continue;
    const sev = msg.severity === 2 ? 'error' : 'warning';
    if (sev === 'error') errorCount++;
    else warnCount++;
    console.log(`${sev === 'error' ? '✖' : '⚠'} ${key}:${msg.line}:${msg.column}  ${sev}  ${msg.message}  (${msg.ruleId || '—'})`);
  }
}

console.log(`\nDiff-aware lint: ${errorCount} error(s), ${warnCount} warning(s) on changed lines.`);
process.exit(errorCount > 0 ? 1 : 0);
