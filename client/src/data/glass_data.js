// WHO GLASS data fetched from GHO OData API (https://ghoapi.azureedge.net/api)
// No authentication required. Data is publicly available.
//
// Indicators used:
// - GLASSAMC_TC: Total antibiotic consumption (DDD/1000 inhabitants/day)
// - AMR_INFECT_ECOLI: E. coli bloodstream infection resistance to 3rd-gen cephalosporins (%)
// - AMR_INFECT_MRSA: MRSA bloodstream infection proportion (%)
// - GASPRSCIP: N. gonorrhoeae ciprofloxacin resistance (%)
// - GASPRSAZM: N. gonorrhoeae azithromycin resistance (%)
// - GASPRSCRO: N. gonorrhoeae ceftriaxone decreased susceptibility/resistance (%)
// - GASPRSCFM: N. gonorrhoeae cefixime decreased susceptibility/resistance (%)

// Use backend proxy to avoid CORS issues (server.js proxies to ghoapi.azureedge.net)
const GHO_API_BASE = '/api/gho';

// ISO3 to country name mapping for countries in AMRnet
const ISO3_TO_COUNTRY = {
  AFG: 'Afghanistan', ALB: 'Albania', DZA: 'Algeria', AGO: 'Angola', ARG: 'Argentina',
  ARM: 'Armenia', AUS: 'Australia', AUT: 'Austria', AZE: 'Azerbaijan', BGD: 'Bangladesh',
  BLR: 'Belarus', BEL: 'Belgium', BEN: 'Benin', BTN: 'Bhutan', BOL: 'Bolivia',
  BIH: 'Bosnia and Herzegovina', BRA: 'Brazil', BRN: 'Brunei', BGR: 'Bulgaria',
  BFA: 'Burkina Faso', KHM: 'Cambodia', CMR: 'Cameroon', CAN: 'Canada',
  CHL: 'Chile', CHN: 'China', COL: 'Colombia', CIV: "Côte d'Ivoire",
  HRV: 'Croatia', CUB: 'Cuba', CYP: 'Cyprus', CZE: 'Czechia',
  DNK: 'Denmark', DOM: 'Dominican Republic', ECU: 'Ecuador', EGY: 'Egypt',
  EST: 'Estonia', ETH: 'Ethiopia', FJI: 'Fiji', FIN: 'Finland', FRA: 'France',
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
  SVK: 'Slovakia', SVN: 'Slovenia', SOM: 'Somalia', ZAF: 'South Africa',
  ESP: 'Spain', LKA: 'Sri Lanka', SDN: 'Sudan', SWE: 'Sweden', CHE: 'Switzerland',
  SYR: 'Syria', TJK: 'Tajikistan', TZA: 'Tanzania', THA: 'Thailand',
  TLS: 'Timor-Leste', TUN: 'Tunisia', TUR: 'Turkey', UGA: 'Uganda',
  UKR: 'Ukraine', ARE: 'United Arab Emirates', GBR: 'United Kingdom',
  USA: 'United States of America', URY: 'Uruguay', VEN: 'Venezuela',
  VNM: 'Vietnam', YEM: 'Yemen', ZMB: 'Zambia', ZWE: 'Zimbabwe',
  BHR: 'Bahrain', PNG: 'Papua New Guinea', SLV: 'El Salvador', PRY: 'Paraguay',
  HKG: 'Hong Kong', XKX: 'Kosovo',
};

// Cache for fetched data
let glassDataCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function parseGHOResponse(data) {
  if (!data?.value || !Array.isArray(data.value)) return [];
  return data.value
    .filter(r => r.NumericValue != null && r.SpatialDim && r.SpatialDim !== 'GLOBAL')
    .map(r => ({
      countryCode: r.SpatialDim,
      country: ISO3_TO_COUNTRY[r.SpatialDim] || r.SpatialDim,
      year: parseInt(r.TimeDim),
      value: r.NumericValue,
    }))
    .filter(r => !isNaN(r.year));
}

async function fetchIndicator(indicator) {
  try {
    const response = await fetch(`${GHO_API_BASE}/${indicator}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return parseGHOResponse(data);
  } catch (err) {
    console.warn(`[GLASS] Failed to fetch ${indicator}:`, err.message);
    return [];
  }
}

/**
 * Fetch all GLASS data from GHO OData API.
 * Returns cached data if available and fresh.
 */
export async function fetchGLASSData() {
  const now = Date.now();
  if (glassDataCache && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return glassDataCache;
  }

  // Fetch all GLASS indicators in parallel

  const [consumption, ecoliRes, mrsaRes, ngCip, ngAzm, ngCro, ngCfm] = await Promise.all([
    fetchIndicator('GLASSAMC_TC'),
    fetchIndicator('AMR_INFECT_ECOLI'),
    fetchIndicator('AMR_INFECT_MRSA'),
    fetchIndicator('GASPRSCIP'),
    fetchIndicator('GASPRSAZM'),
    fetchIndicator('GASPRSCRO'),
    fetchIndicator('GASPRSCFM'),
  ]);

  glassDataCache = {
    consumption,    // Total ATB consumption (DDD/1000/day)
    resistance: {
      ecoli_3gc: ecoliRes,     // E. coli 3rd-gen cephalosporin resistance
      mrsa: mrsaRes,           // MRSA proportion
      ng_ciprofloxacin: ngCip, // N. gonorrhoeae ciprofloxacin
      ng_azithromycin: ngAzm,  // N. gonorrhoeae azithromycin
      ng_ceftriaxone: ngCro,   // N. gonorrhoeae ceftriaxone
      ng_cefixime: ngCfm,      // N. gonorrhoeae cefixime
    },
    metadata: {
      source: 'WHO Global Health Observatory (GHO) OData API',
      apiBase: GHO_API_BASE,
      fetchedAt: new Date().toISOString(),
      indicators: {
        GLASSAMC_TC: 'Total antibiotic consumption (DDD/1000/day)',
        AMR_INFECT_ECOLI: 'E. coli bloodstream infection - 3GC resistance (%)',
        AMR_INFECT_MRSA: 'MRSA bloodstream infection proportion (%)',
        GASPRSCIP: 'N. gonorrhoeae ciprofloxacin resistance (%)',
        GASPRSAZM: 'N. gonorrhoeae azithromycin resistance (%)',
        GASPRSCRO: 'N. gonorrhoeae ceftriaxone DS/R (%)',
        GASPRSCFM: 'N. gonorrhoeae cefixime DS/R (%)',
      },
    },
  };

  lastFetchTime = now;

  // Also fetch the compiled GLASS phenotypic CSV (Klebsiella, Salmonella, etc.)
  try {
    const phenoResponse = await fetch('/api/glass-phenotypic');
    if (phenoResponse.ok) {
      const phenoData = await phenoResponse.json();
      glassDataCache.phenotypic = phenoData;
      // Phenotypic CSV data loaded successfully
    }
  } catch (err) {
    console.warn('[GLASS] Failed to fetch phenotypic CSV data:', err.message);
    glassDataCache.phenotypic = [];
  }

  return glassDataCache;
}

/**
 * Get GLASS phenotypic data for a specific organism and drug.
 * Uses the compiled CSV data (covers Klebsiella, Salmonella, S. pneumoniae, etc.)
 */
export function getGLASSPhenotypicByOrganismDrug(data, pathogenName, antibiotic, specimen) {
  if (!data?.phenotypic || !Array.isArray(data.phenotypic)) return [];
  return data.phenotypic
    .filter(r =>
      r.pathogen === pathogenName &&
      r.antibiotic === antibiotic &&
      r.tested >= 10 &&
      (!specimen || r.specimen === specimen),
    )
    .map(r => ({
      country: r.country,
      countryCode: r.iso3,
      year: r.year,
      value: r.percentResistant,
      tested: r.tested,
      resistant: r.resistant,
      specimen: r.specimen,
    }));
}

/**
 * Get consumption data for a specific country (latest year available)
 */
export function getConsumptionForCountry(data, country) {
  if (!data?.consumption) return null;
  const records = data.consumption
    .filter(r => r.country === country)
    .sort((a, b) => b.year - a.year);
  return records[0] || null;
}

/**
 * Get phenotypic resistance data matching an AMRnet organism
 */
export function getPhenotypicResistanceForOrganism(data, organism) {
  if (!data?.resistance) return [];
  switch (organism) {
    case 'ecoli':
      return data.resistance.ecoli_3gc || [];
    case 'saureus':
      return data.resistance.mrsa || [];
    case 'ngono':
      return {
        ciprofloxacin: data.resistance.ng_ciprofloxacin || [],
        azithromycin: data.resistance.ng_azithromycin || [],
        ceftriaxone: data.resistance.ng_ceftriaxone || [],
        cefixime: data.resistance.ng_cefixime || [],
      };
    // For organisms using GLASS CSV, use getGLASSIndicatorForOrganism + getGLASSPhenotypicByOrganismDrug
    default:
      return [];
  }
}

/**
 * Map AMRnet organism to the relevant GLASS phenotypic indicator
 */
export function getGLASSIndicatorForOrganism(organism) {
  switch (organism) {
    // E. coli (all) — GHO API has bloodstream 3GC resistance
    case 'ecoli':
      return { code: 'AMR_INFECT_ECOLI', label: 'E. coli bloodstream 3GC resistance (GLASS)', drug: 'ESBL', source: 'gho' };
    // Diarrheagenic E. coli — use GLASS CSV with STOOL specimen E. coli + ciprofloxacin
    case 'decoli':
      return { code: 'GLASS_CSV', label: 'E. coli ciprofloxacin resistance - stool (GLASS)', drug: 'Ciprofloxacin', source: 'csv', pathogen: 'Escherichia coli', antibiotic: 'Ciprofloxacin', specimen: 'STOOL' };
    // Shigella + EIEC — GLASS CSV has Shigella as separate pathogen
    case 'shige':
      return { code: 'GLASS_CSV', label: 'Shigella ciprofloxacin resistance (GLASS)', drug: 'Ciprofloxacin', source: 'csv', pathogen: 'Shigella', antibiotic: 'Ciprofloxacin' };
    // K. pneumoniae — GLASS CSV has carbapenem (meropenem) resistance in blood
    case 'kpneumo':
      return { code: 'GLASS_CSV', label: 'K. pneumoniae meropenem resistance - blood (GLASS)', drug: 'Carbapenems', source: 'csv', pathogen: 'Klebsiella pneumoniae', antibiotic: 'Meropenem', specimen: 'BLOOD' };
    // S. aureus — GHO API has MRSA bloodstream proportion
    case 'saureus':
      return { code: 'AMR_INFECT_MRSA', label: 'MRSA bloodstream prevalence (GLASS)', drug: 'Methicillin', source: 'gho' };
    // N. gonorrhoeae — GHO API has WHO-GASP ciprofloxacin resistance
    case 'ngono':
      return { code: 'GASPRSCIP', label: 'N. gonorrhoeae CIP resistance (WHO-GASP)', drug: 'Ciprofloxacin', source: 'gho' };
    // S. Typhi — GLASS CSV has Salmonella in BLOOD (includes Typhi + NTS mixed, caveat shown)
    // drugsCountriesData for styphi uses drugClassesRulesST keys: 'Ciprofloxacin' (not 'Ciprofloxacin NS')
    case 'styphi':
      return { code: 'GLASS_CSV', label: 'Salmonella CIP resistance - blood (GLASS, includes NTS)', drug: 'Ciprofloxacin', source: 'csv', pathogen: 'Salmonella', antibiotic: 'Ciprofloxacin', specimen: 'BLOOD' };
    // Non-typhoidal Salmonella — GLASS CSV Salmonella + ciprofloxacin (blood + stool)
    case 'senterica':
      return { code: 'GLASS_CSV', label: 'Salmonella CIP resistance (GLASS, includes Typhi)', drug: 'Ciprofloxacin', source: 'csv', pathogen: 'Salmonella', antibiotic: 'Ciprofloxacin' };
    // Invasive non-typhoidal Salmonella — GLASS CSV Salmonella BLOOD only
    case 'sentericaints':
      return { code: 'GLASS_CSV', label: 'Salmonella CIP resistance - blood (GLASS)', drug: 'Ciprofloxacin', source: 'csv', pathogen: 'Salmonella', antibiotic: 'Ciprofloxacin', specimen: 'BLOOD' };
    // S. pneumoniae — GLASS CSV has trimethoprim/sulfamethoxazole resistance
    case 'strepneumo':
      return { code: 'GLASS_CSV', label: 'S. pneumoniae SXT resistance (GLASS)', drug: 'Co-Trimoxazole', source: 'csv', pathogen: 'Streptococcus pneumoniae', antibiotic: 'Trimethoprim/sulfamethoxazole' };
    default:
      return null;
  }
}
