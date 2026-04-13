#!/usr/bin/env node
/**
 * Check GLASS data availability and save a copy to MongoDB for offline use.
 * Run: node scripts/check-glass-data.js
 */

import connectDB from '../config/db.js';

const GHO_API = 'https://ghoapi.azureedge.net/api';
const GLASS_CSV_URL = 'https://raw.githubusercontent.com/qleclerc/GLASS2022/master/compiled_WHO_GLASS_2022.csv';

const ISO3_TO_COUNTRY = {
  AFG: 'Afghanistan', ALB: 'Albania', DZA: 'Algeria', AGO: 'Angola', ARG: 'Argentina',
  ARM: 'Armenia', AUS: 'Australia', AUT: 'Austria', AZE: 'Azerbaijan', BGD: 'Bangladesh',
  BLR: 'Belarus', BEL: 'Belgium', BEN: 'Benin', BTN: 'Bhutan', BOL: 'Bolivia',
  BIH: 'Bosnia and Herzegovina', BRA: 'Brazil', BRN: 'Brunei', BGR: 'Bulgaria',
  BFA: 'Burkina Faso', KHM: 'Cambodia', CMR: 'Cameroon', CAN: 'Canada',
  CHL: 'Chile', CHN: 'China', COL: 'Colombia', CIV: "Côte d'Ivoire",
  HRV: 'Croatia', CUB: 'Cuba', CYP: 'Cyprus', CZE: 'Czechia',
  DNK: 'Denmark', DOM: 'Dominican Republic', ECU: 'Ecuador', EGY: 'Egypt',
  EST: 'Estonia', ETH: 'Ethiopia', FIN: 'Finland', FRA: 'France',
  GAB: 'Gabon', GEO: 'Georgia', DEU: 'Germany', GHA: 'Ghana', GRC: 'Greece',
  HND: 'Honduras', HUN: 'Hungary', ISL: 'Iceland', IND: 'India', IDN: 'Indonesia',
  IRN: 'Iran', IRQ: 'Iraq', IRL: 'Ireland', ISR: 'Israel', ITA: 'Italy',
  JPN: 'Japan', JOR: 'Jordan', KAZ: 'Kazakhstan', KEN: 'Kenya', KOR: 'South Korea',
  KWT: 'Kuwait', LAO: 'Laos', LVA: 'Latvia', LBN: 'Lebanon', LTU: 'Lithuania',
  LUX: 'Luxembourg', MDG: 'Madagascar', MWI: 'Malawi', MYS: 'Malaysia',
  MDV: 'Maldives', MLI: 'Mali', MLT: 'Malta', MAR: 'Morocco', MUS: 'Mauritius',
  MEX: 'Mexico', MNG: 'Mongolia', MNE: 'Montenegro', MOZ: 'Mozambique',
  MMR: 'Myanmar', NAM: 'Namibia', NPL: 'Nepal', NLD: 'Netherlands',
  NZL: 'New Zealand', NGA: 'Nigeria', MKD: 'North Macedonia', NOR: 'Norway',
  OMN: 'Oman', PAK: 'Pakistan', PSE: 'Palestine', PER: 'Peru', PHL: 'Philippines',
  POL: 'Poland', PRT: 'Portugal', QAT: 'Qatar', ROU: 'Romania', RUS: 'Russia',
  RWA: 'Rwanda', SAU: 'Saudi Arabia', SEN: 'Senegal', SGP: 'Singapore',
  SVK: 'Slovakia', SVN: 'Slovenia', ZAF: 'South Africa',
  ESP: 'Spain', LKA: 'Sri Lanka', SDN: 'Sudan', SWE: 'Sweden', CHE: 'Switzerland',
  TJK: 'Tajikistan', TZA: 'Tanzania', THA: 'Thailand',
  TUN: 'Tunisia', TUR: 'Turkey', UGA: 'Uganda',
  UKR: 'Ukraine', ARE: 'United Arab Emirates', GBR: 'United Kingdom',
  USA: 'United States of America', URY: 'Uruguay', VEN: 'Venezuela',
  VNM: 'Vietnam', ZMB: 'Zambia', ZWE: 'Zimbabwe',
  BHR: 'Bahrain', PNG: 'Papua New Guinea', SLV: 'El Salvador', PRY: 'Paraguay',
  HKG: 'Hong Kong',
};

function normalizeCountry(name) {
  if (!name) return '';
  const map = {
    'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
    'Iran (Islamic Republic of)': 'Iran',
    'Republic of Korea': 'South Korea',
    'Republic of Moldova': 'Moldova',
    'Russian Federation': 'Russia',
    'Viet Nam': 'Vietnam',
    "Lao People's Democratic Republic": 'Laos',
    'Türkiye': 'Turkey',
    'Bolivia (Plurinational State of)': 'Bolivia',
    'Venezuela (Bolivarian Republic of)': 'Venezuela',
    'United Republic of Tanzania': 'Tanzania',
    'Brunei Darussalam': 'Brunei',
  };
  return map[name] || name.trim();
}

// ─────────────────────────────────────────────────────────────
// 1. Fetch GHO indicators
// ────────────────────────────────────────────────────────────���
const GHO_INDICATORS = {
  GLASSAMC_TC: 'Total ATB consumption (DDD/1000/day)',
  AMR_INFECT_ECOLI: 'E. coli 3GC resistance (%)',
  AMR_INFECT_MRSA: 'MRSA proportion (%)',
  GASPRSCIP: 'N. gonorrhoeae ciprofloxacin resistance (%)',
  GASPRSAZM: 'N. gonorrhoeae azithromycin resistance (%)',
  GASPRSCRO: 'N. gonorrhoeae ceftriaxone DS/R (%)',
  GASPRSCFM: 'N. gonorrhoeae cefixime DS/R (%)',
};

async function fetchGHOIndicator(code) {
  const url = `${GHO_API}/${code}`;
  console.log(`  Fetching ${code}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${code}`);
  const data = await res.json();
  const records = (data.value || [])
    .filter(r => r.NumericValue != null && r.SpatialDim && r.SpatialDim !== 'GLOBAL')
    .map(r => ({
      indicator: code,
      countryCode: r.SpatialDim,
      country: ISO3_TO_COUNTRY[r.SpatialDim] || r.SpatialDim,
      year: parseInt(r.TimeDim),
      value: r.NumericValue,
    }))
    .filter(r => !isNaN(r.year));
  console.log(`    → ${records.length} records`);
  return records;
}

// ─────────────────────────────────────────────────────────────
// 2. Fetch GLASS CSV
// ─────────────────────────────────────────────────────────────
async function fetchGLASSCSV() {
  console.log(`  Fetching GLASS CSV from GitHub...`);
  const res = await fetch(GLASS_CSV_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length < headers.length) continue;
    const row = {};
    headers.forEach((h, j) => { row[h] = values[j]; });

    if (['BLOOD', 'STOOL', 'URINE', 'GENITAL'].includes(row.Specimen)) {
      data.push({
        source: 'GLASS_CSV',
        country: normalizeCountry(row.CountryTerritoryArea),
        iso3: row.Iso3,
        region: row.WHORegionName,
        year: parseInt(row.Year),
        specimen: row.Specimen,
        pathogen: row.PathogenName,
        antibiotic: row.AbTargets,
        tested: parseInt(row.InterpretableAST) || 0,
        resistant: parseInt(row.Resistant) || 0,
        percentResistant: parseFloat(row.PercentResistant) || 0,
      });
    }
  }
  console.log(`    → ${data.length} records`);
  return data;
}

// ─────────────────────────────────────────────────────────────
// 3. Main
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  GLASS Data Check & MongoDB Import');
  console.log('═══════════════════════════════════════\n');

  // ── Fetch all GHO indicators ──
  console.log('[1/3] Fetching GHO API indicators...');
  const ghoRecords = [];
  for (const [code, label] of Object.entries(GHO_INDICATORS)) {
    try {
      const records = await fetchGHOIndicator(code);
      ghoRecords.push(...records);
    } catch (err) {
      console.error(`  ✗ FAILED: ${code} — ${err.message}`);
    }
  }
  console.log(`  Total GHO records: ${ghoRecords.length}\n`);

  // ── Fetch GLASS CSV ──
  console.log('[2/3] Fetching GLASS CSV (compiled_WHO_GLASS_2022)...');
  let csvRecords = [];
  try {
    csvRecords = await fetchGLASSCSV();
  } catch (err) {
    console.error(`  ✗ FAILED: ${err.message}`);
  }

  // ── Summary ──
  console.log('\n─── Summary ───');

  // GHO consumption
  const consumption = ghoRecords.filter(r => r.indicator === 'GLASSAMC_TC');
  const consumptionCountries = [...new Set(consumption.map(r => r.country))];
  console.log(`Consumption (GLASSAMC_TC): ${consumption.length} records, ${consumptionCountries.length} countries`);

  // GHO resistance
  for (const [code, label] of Object.entries(GHO_INDICATORS)) {
    if (code === 'GLASSAMC_TC') continue;
    const recs = ghoRecords.filter(r => r.indicator === code);
    const countries = [...new Set(recs.map(r => r.country))];
    console.log(`${label} (${code}): ${recs.length} records, ${countries.length} countries`);
  }

  // CSV pathogens
  const pathogens = [...new Set(csvRecords.map(r => r.pathogen))].sort();
  console.log(`\nGLASS CSV pathogens: ${pathogens.join(', ')}`);

  // Per pathogen+antibiotic combos
  const combos = {};
  csvRecords.forEach(r => {
    const key = `${r.pathogen} | ${r.antibiotic} | ${r.specimen}`;
    if (!combos[key]) combos[key] = { count: 0, countries: new Set() };
    combos[key].count++;
    combos[key].countries.add(r.country);
  });

  console.log('\nGLASS CSV breakdown (pathogen | antibiotic | specimen):');
  Object.entries(combos)
    .sort(([, a], [, b]) => b.count - a.count)
    .forEach(([key, { count, countries }]) => {
      console.log(`  ${key}: ${count} records, ${countries.size} countries`);
    });

  // ── Check overlap: consumption + resistance ──
  console.log('\n─── Consumption × Resistance overlap ───');
  const consumptionSet = new Set(consumptionCountries);

  const testCombos = [
    { label: 'Salmonella + Ciprofloxacin (BLOOD)', pathogen: 'Salmonella', antibiotic: 'Ciprofloxacin', specimen: 'BLOOD' },
    { label: 'Salmonella + Ciprofloxacin (all)', pathogen: 'Salmonella', antibiotic: 'Ciprofloxacin' },
    { label: 'E. coli + Ciprofloxacin (all)', pathogen: 'Escherichia coli', antibiotic: 'Ciprofloxacin' },
    { label: 'E. coli + Ceftriaxone (all)', pathogen: 'Escherichia coli', antibiotic: 'Ceftriaxone' },
    { label: 'K. pneumoniae + Meropenem (BLOOD)', pathogen: 'Klebsiella pneumoniae', antibiotic: 'Meropenem', specimen: 'BLOOD' },
    { label: 'Shigella + Ciprofloxacin (all)', pathogen: 'Shigella', antibiotic: 'Ciprofloxacin' },
    { label: 'S. pneumoniae + SXT (all)', pathogen: 'Streptococcus pneumoniae', antibiotic: 'Trimethoprim/sulfamethoxazole' },
    { label: 'Salmonella + Ampicillin (all)', pathogen: 'Salmonella', antibiotic: 'Ampicillin' },
    { label: 'Salmonella + Gentamicin (all)', pathogen: 'Salmonella', antibiotic: 'Gentamicin' },
    { label: 'Salmonella + Ceftriaxone (all)', pathogen: 'Salmonella', antibiotic: 'Ceftriaxone' },
  ];

  testCombos.forEach(({ label, pathogen, antibiotic, specimen }) => {
    const resCountries = new Set(
      csvRecords
        .filter(r => r.pathogen === pathogen && r.antibiotic === antibiotic && r.tested >= 10 && (!specimen || r.specimen === specimen))
        .map(r => r.country),
    );
    const overlap = [...resCountries].filter(c => consumptionSet.has(c));
    console.log(`  ${label}: ${resCountries.size} res countries, ${overlap.length} with consumption data`);
    if (overlap.length > 0 && overlap.length <= 5) console.log(`    → ${overlap.join(', ')}`);
  });

  // ── Save to MongoDB ──
  console.log('\n[3/3] Saving to MongoDB (amrnet_admin.glass_data)...');
  try {
    const client = await connectDB();
    const db = client.db('amrnet_admin');
    const col = db.collection('glass_data');

    await col.deleteMany({});

    const allRecords = [
      ...ghoRecords.map(r => ({ ...r, source: 'GHO_API' })),
      ...csvRecords,
    ];

    if (allRecords.length > 0) {
      await col.insertMany(allRecords);
      console.log(`  ✓ Saved ${allRecords.length} records (${ghoRecords.length} GHO + ${csvRecords.length} CSV)`);
    }

    // Create indexes
    await col.createIndex({ source: 1, indicator: 1, country: 1 });
    await col.createIndex({ source: 1, pathogen: 1, antibiotic: 1, country: 1 });
    console.log('  ✓ Indexes created');
  } catch (err) {
    console.error(`  ✗ MongoDB save failed: ${err.message}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  Done!');
  console.log('════════════════════════════════════��══');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
