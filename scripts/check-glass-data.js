#!/usr/bin/env node
/**
 * Check GLASS data availability and save a copy to MongoDB for offline use.
 * Run: node scripts/check-glass-data.js
 *
 * GLASS AMU/AMR is sourced ONLY from the WHO GHO OData API (direct from WHO).
 * The previous compiled CSV (scraped from the qleclerc/GLASS2022 GitHub repo,
 * itself extracted from the GLASS 2022 report PDF) was removed on data-governance
 * grounds — its provenance/status is unclear and GLASS data must come directly
 * from WHO under the WHO data terms:
 * https://www.who.int/about/policies/publishing/data-policy/terms-and-conditions
 */

import connectDB from '../config/db.js';

const GHO_API = 'https://ghoapi.azureedge.net/api';

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

// ─────────────────────────────────────────────────────────────
// Fetch GHO indicators (direct from WHO)
// ─────────────────────────────────────────────────────────────
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
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  GLASS Data Check & MongoDB Import');
  console.log('═══════════════════════════════════════\n');

  // ── Fetch all GHO indicators ──
  console.log('[1/2] Fetching GHO API indicators (direct from WHO)...');
  const ghoRecords = [];
  for (const [code] of Object.entries(GHO_INDICATORS)) {
    try {
      const records = await fetchGHOIndicator(code);
      ghoRecords.push(...records);
    } catch (err) {
      console.error(`  ✗ FAILED: ${code} — ${err.message}`);
    }
  }
  console.log(`  Total GHO records: ${ghoRecords.length}\n`);

  // ── Summary ──
  console.log('─── Summary ───');
  const consumption = ghoRecords.filter(r => r.indicator === 'GLASSAMC_TC');
  const consumptionCountries = [...new Set(consumption.map(r => r.country))];
  console.log(`Consumption (GLASSAMC_TC): ${consumption.length} records, ${consumptionCountries.length} countries`);

  for (const [code, label] of Object.entries(GHO_INDICATORS)) {
    if (code === 'GLASSAMC_TC') continue;
    const recs = ghoRecords.filter(r => r.indicator === code);
    const countries = [...new Set(recs.map(r => r.country))];
    console.log(`${label} (${code}): ${recs.length} records, ${countries.length} countries`);
  }

  // ── Save to MongoDB ──
  console.log('\n[2/2] Saving to MongoDB (amrnet_admin.glass_data)...');
  try {
    const client = await connectDB();
    const db = client.db('amrnet_admin');
    const col = db.collection('glass_data');

    await col.deleteMany({});

    const allRecords = ghoRecords.map(r => ({ ...r, source: 'GHO_API' }));

    if (allRecords.length > 0) {
      await col.insertMany(allRecords);
      console.log(`  ✓ Saved ${allRecords.length} GHO records`);
    }

    // Create indexes
    await col.createIndex({ source: 1, indicator: 1, country: 1 });
    console.log('  ✓ Indexes created');
  } catch (err) {
    console.error(`  ✗ MongoDB save failed: ${err.message}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  Done!');
  console.log('═══════════════════════════════════════');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
