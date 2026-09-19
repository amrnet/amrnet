#!/usr/bin/env node
/**
 * Build an ST -> species/lineage/LINcode lookup from the AMRnet shige database
 * (shige.amrnetdb_shige), so the ST-based lineage aliases requested in the
 * July 2026 review can be derived from our own treated data rather than an
 * external O-serogroup table.
 *
 * For each 7-locus MLST sequence type (GENOTYPE) with >= MIN_N isolates it
 * reports the dominant Pathovar (species / E. coli pathotype), the dominant
 * L3 LINcode prefix, their purities, and a proposed ST-based alias
 * ("<species_code> <ST>", e.g. "EIEC ST270", "Ss ST152") per Kat's suggestion.
 *
 * Output: docs/lincode/shige_st_lineage_lookup.tsv (draft, for Kat/Ebenezer to
 * validate). Run: node scripts/build-shige-st-lineage-lookup.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import connectDB from '../config/db.js';

const MIN_N = 5;
const OUT = path.resolve('docs/lincode/shige_st_lineage_lookup.tsv');

function speciesCode(pv) {
  if (!pv) return '';
  const s = pv.toString();
  if (/sonnei/i.test(s)) return 'Ss';
  if (/flexneri/i.test(s)) return 'Sf';
  if (/boydii/i.test(s)) return 'Sb';
  if (/dysenteriae/i.test(s)) return 'Sd';
  if (/EIEC/i.test(s)) return 'EIEC';
  return s; // EPEC/EHEC/ETEC/STEC/E. albertii/"-" kept as-is
}

const client = await connectDB();
const col = client.db('shige').collection('amrnetdb_shige');

const rows = await col
  .aggregate(
    [
      { $match: { GENOTYPE: { $nin: [null, '', '-'] } } },
      {
        $group: {
          _id: { st: '$GENOTYPE', pv: '$Pathovar', l3: '$LINcode_3', cplx: '$MLST_Achtman_st_complex' },
          n: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.st',
          total: { $sum: '$n' },
          combos: { $push: { pv: '$_id.pv', l3: '$_id.l3', cplx: '$_id.cplx', n: '$n' } },
        },
      },
      { $match: { total: { $gte: MIN_N } } },
      { $sort: { total: -1 } },
    ],
    { allowDiskUse: true },
  )
  .toArray();

// Columns aligned with Ebenezer's 'ST -> Shigella species and lineage lookup'
// (st, st_complex, n, dominant_species, pct_dominant_species, dominant_l3) plus
// our species_code and proposed ST-based alias, so the two tables can be diffed.
const header = [
  'st',
  'st_complex',
  'n',
  'dominant_species',
  'pct_dominant_species',
  'species_code',
  'dominant_l3',
  'pct_dominant_l3',
  'proposed_alias',
];
const out = [header.join('\t')];

const dominant = obj => Object.entries(obj).sort((a, b) => b[1] - a[1])[0];

for (const r of rows) {
  const byPv = {};
  const byL3 = {};
  const byCplx = {};
  for (const c of r.combos) {
    byPv[c.pv ?? '-'] = (byPv[c.pv ?? '-'] || 0) + c.n;
    byL3[c.l3 ?? '-'] = (byL3[c.l3 ?? '-'] || 0) + c.n;
    byCplx[c.cplx ?? '-'] = (byCplx[c.cplx ?? '-'] || 0) + c.n;
  }
  const domPv = dominant(byPv);
  const domL3 = dominant(byL3);
  const domCplx = dominant(byCplx);
  const code = speciesCode(domPv[0]);
  const alias = code ? `${code} ${r._id}` : String(r._id);
  out.push(
    [
      r._id,
      domCplx[0],
      r.total,
      domPv[0],
      ((domPv[1] / r.total) * 100).toFixed(1),
      code,
      domL3[0],
      ((domL3[1] / r.total) * 100).toFixed(1),
      alias,
    ].join('\t'),
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join('\n') + '\n');
console.log(`Wrote ${rows.length} STs (>= ${MIN_N} isolates) to ${OUT}`);
process.exit(0);
