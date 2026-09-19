#!/usr/bin/env node
/*
 * Build the Shigella LINcode → lineage lookup JSON from the source TSV.
 *
 *   node scripts/build-shige-lincode-lookup.mjs
 *
 * Input : client/src/data/lincode_shigella_lineages.tsv  (source of truth)
 * Output: client/src/data/lincode_shigella_lineages.json
 *
 * Matching rule (see deriveShigeLincode in util/shigeLincode.js): a genome's
 * 13-segment LINcode is truncated to `level` segments and compared to `prefix`.
 *
 * Two "lincode" dimensions are produced per prefix:
 *   - numeric : the hierarchical LINcode lineage label (e.g. "3.6.1.1.1",
 *               "2.3.5", "Sb20") — available for all Shigella species.
 *   - alias   : the named lineage alias (e.g. "CipR.SEA", "Central Asia III")
 *               — only S. sonnei rows carry these.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const TSV = join(here, '../client/src/data/lincode_shigella_lineages.tsv');
const OUT = join(here, '../client/src/data/lincode_shigella_lineages.json');

const lines = readFileSync(TSV, 'utf8').trim().split('\n');
const header = lines[0].split('\t');
const col = name => header.indexOf(name);

const byPrefix = new Map();
for (const line of lines.slice(1)) {
  const f = line.split('\t');
  const species = f[col('species')];
  const label = f[col('lineage_label')];
  const prefix = f[col('prefix')];
  const level = parseInt(f[col('level')].replace(/^l/, ''), 10);
  if (!prefix || Number.isNaN(level)) continue;

  let e = byPrefix.get(prefix);
  if (!e) {
    e = { prefix, level, species, numeric: null, alias: null };
    byPrefix.set(prefix, e);
  }

  const isSonnei = species === 'Shigella sonnei';
  const startsWithDigit = /^\d/.test(label);
  if (!isSonnei) {
    // Non-sonnei: the lineage label IS the lincode (numeric slot), no alias.
    if (!e.numeric) e.numeric = label;
  } else if (startsWithDigit) {
    if (!e.numeric) e.numeric = label;
  } else if (!e.alias) {
    e.alias = label;
  }
}

// Most-specific (longest level) first, so derivation prefers finer matches.
const entries = [...byPrefix.values()].sort((a, b) => b.level - a.level);

writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n');
console.log(
  `Wrote ${entries.length} prefixes to ${OUT} ` +
    `(${entries.filter(e => e.numeric).length} with numeric, ${entries.filter(e => e.alias).length} with alias).`,
);
