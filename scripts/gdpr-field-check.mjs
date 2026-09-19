/**
 * GDPR field-population check for AMRnet.
 *
 * For each organism collection, reports:
 *   - total documents
 *   - how many docs have a NON-EMPTY value for each potentially-personal field
 *     (AGE, LATITUDE, LONGITUDE, CONTACT, TRAVEL COUNTRY, etc.)
 *   - LATITUDE/LONGITUDE granularity: distinct coordinate pairs vs distinct
 *     countries, plus sample values, to tell country-centroids (safe) apart
 *     from sub-national point coordinates (re-identification risk).
 *
 * Read-only. Makes no writes. Run against the production/staging Atlas:
 *
 *   MONGODB_URI="mongodb+srv://..." node scripts/gdpr-field-check.mjs
 *
 * (or rely on .env / your existing environment if MONGODB_URI is already set)
 */

import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI;
if (!URI) {
  console.error('ERROR: set MONGODB_URI before running.');
  process.exit(1);
}

// Same map the API uses (routes/api/api.js)
const COLLECTIONS = {
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  ngono: { dbName: 'ngono', collectionName: 'amrnetdb_ngono' },
  ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
  decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
  shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
  senterica: { dbName: 'senterica', collectionName: 'amrnetdb_senterica' },
  sentericaints: { dbName: 'sentericaints', collectionName: 'amrnetdb_ints' },
  saureus: { dbName: 'saureus', collectionName: 'amrnetdb_saureus' },
  strepneumo: { dbName: 'strepneumo', collectionName: 'amrnetdb_spneumo' },
};

// Potentially-personal / quasi-identifier fields to probe (exact DB names).
const FIELDS = [
  'AGE',
  'LATITUDE',
  'LONGITUDE',
  'CONTACT',
  'LAB',
  'SYMPTOM STATUS',
  'TRAVEL',
  'TRAVEL COUNTRY',
  'TRAVEL ASSOCIATED',
  'TRAVEL_LOCATION',
  'LOCATION',
  'REGION_IN_COUNTRY',
  'COUNTRY OF ORIGIN',
];

// Values that count as "empty" / placeholder (case-insensitive for strings).
const PLACEHOLDERS = ['', '-', 'na', 'n/a', 'unknown', 'not provided', 'null', 'none', 'not available'];

// Build a $group spec: one counter per field = docs where field is non-empty.
// A missing field compares equal to null in aggregation, so it is counted as empty.
function presenceCounters() {
  const spec = { _id: null, __total: { $sum: 1 } };
  for (const f of FIELDS) {
    const ref = '$' + f;
    spec['f_' + f] = {
      $sum: {
        $cond: [
          {
            $and: [
              // field must actually exist (missing fields must NOT count as present)
              { $ne: [{ $type: ref }, 'missing'] },
              { $ne: [ref, null] },
              // normalise strings: trim + lowercase, then check against placeholders
              {
                $not: [
                  {
                    $in: [
                      {
                        $cond: [
                          { $eq: [{ $type: ref }, 'string'] },
                          { $toLower: { $trim: { input: ref } } },
                          ref, // non-strings (e.g. numeric AGE/LAT) are "present" unless null
                        ],
                      },
                      PLACEHOLDERS,
                    ],
                  },
                ],
              },
            ],
          },
          1,
          0,
        ],
      },
    };
  }
  return spec;
}

function pct(n, total) {
  if (!total) return '0%';
  return ((100 * n) / total).toFixed(1) + '%';
}

async function checkGranularity(coll) {
  // Distinct coordinate pairs vs distinct countries → centroid vs point.
  const countryField = ['COUNTRY_ONLY', 'COUNTRY OF ORIGIN', 'COUNTRY ISOLATED', 'COUNTRY'];
  let distinctCountries = null;
  for (const cf of countryField) {
    try {
      const vals = await coll.distinct(cf);
      if (vals.length) {
        distinctCountries = { field: cf, n: vals.length };
        break;
      }
    } catch {
      /* field absent */
    }
  }

  const pairs = await coll
    .aggregate([
      { $match: { LATITUDE: { $nin: [null, ''] }, LONGITUDE: { $nin: [null, ''] } } },
      { $group: { _id: { lat: '$LATITUDE', lon: '$LONGITUDE' } } },
      { $count: 'n' },
    ])
    .toArray();
  const distinctPairs = pairs[0]?.n ?? 0;

  const samples = await coll
    .find({ LATITUDE: { $nin: [null, ''] } }, { projection: { _id: 0, LATITUDE: 1, LONGITUDE: 1 } })
    .limit(5)
    .toArray();

  return { distinctCountries, distinctPairs, samples };
}

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  console.log('Connected. Running GDPR field-population check (read-only)…\n');

  for (const [org, { dbName, collectionName }] of Object.entries(COLLECTIONS)) {
    const coll = client.db(dbName).collection(collectionName);
    let agg;
    try {
      agg = await coll.aggregate([{ $group: presenceCounters() }]).toArray();
    } catch (e) {
      console.log(`\n=== ${org} (${dbName}.${collectionName}) — ERROR: ${e.message} ===`);
      continue;
    }
    const r = agg[0];
    if (!r) {
      console.log(`\n=== ${org} (${dbName}.${collectionName}) — 0 documents ===`);
      continue;
    }
    const total = r.__total;
    console.log(`\n=== ${org}  (${dbName}.${collectionName})  —  ${total} docs ===`);
    for (const f of FIELDS) {
      const n = r['f_' + f] ?? 0;
      if (n > 0) {
        const flag = n > 0 ? '  ⚠️ POPULATED' : '';
        console.log(`   ${f.padEnd(20)} ${String(n).padStart(7)} non-empty  (${pct(n, total)})${flag}`);
      } else {
        console.log(`   ${f.padEnd(20)} ${String(0).padStart(7)} non-empty  (empty / unused)`);
      }
    }

    // Geo granularity only if any LAT present
    if ((r['f_LATITUDE'] ?? 0) > 0) {
      const g = await checkGranularity(coll);
      console.log(`   --- geo granularity ---`);
      if (g.distinctCountries) {
        console.log(`   distinct countries (${g.distinctCountries.field}): ${g.distinctCountries.n}`);
      }
      console.log(`   distinct LAT/LONG pairs: ${g.distinctPairs}`);
      const ratio =
        g.distinctCountries && g.distinctCountries.n
          ? (g.distinctPairs / g.distinctCountries.n).toFixed(1)
          : 'n/a';
      console.log(
        `   pairs-per-country ratio: ${ratio}  ` +
          `(≈1 → country/region centroids = low risk; ≫1 → sub-national points = re-id risk)`,
      );
      console.log(`   sample coords: ${JSON.stringify(g.samples)}`);
    }
  }

  await client.close();
  console.log('\nDone.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
