// Country-name localization via the browser's Intl.DisplayNames API.
//
// Why a helper:
//   The dashboard stores and aggregates country data using English
//   canonical names (e.g. 'United States of America', 'Dem. Rep. Congo')
//   produced by getCountryDisplayName() in Dashboard/filters.js. Those
//   names are used as object keys in mapData / dataByCountry / etc., so
//   they MUST stay English. Localization happens only at render time —
//   right before a country label hits the DOM (map tooltips, dropdowns,
//   chart tooltips, PDF metadata).
//
// How it works:
//   1. Build an EnglishName → ISO-3166-1 alpha-2 map once at module load,
//      iterating Intl.DisplayNames('en') across every alpha-2 code we
//      know of. Anything Intl produces under that English name maps to
//      the corresponding ISO code.
//   2. Layer on overrides for AMRnet's canonical names that diverge from
//      Intl's English output (e.g. 'Dem. Rep. Congo' instead of
//      'Congo - Kinshasa').
//   3. getLocalizedCountryName(canonical, locale) does ENG → ISO2 lookup
//      then ISO2 → localized name via a per-locale cached
//      Intl.DisplayNames instance. Falls back to the input name on miss.

// ISO 3166-1 alpha-2 codes (current as of 2024). Stable, browser-friendly
// way to seed the EnglishName → ISO2 reverse map without depending on
// Intl.supportedValuesOf which has uneven runtime support.
const ISO2_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS',
  'BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN',
  'CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE',
  'EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF',
  'GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM',
  'HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM',
  'JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC',
  'LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK',
  'ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA',
  'NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG',
  'PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS',
  'ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO',
  'TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI',
  'VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZW',
];

// Overrides for AMRnet canonical names that DON'T match Intl's English
// region label. Verified against client/src/util/countries.js (245 names)
// and getCountryDisplayName() in Dashboard/filters.js.
const CANONICAL_OVERRIDES = {
  'United States of America': 'US',
  'Russia': 'RU',
  'Czechia': 'CZ',
  'Czech Republic': 'CZ',
  'Cabo Verde': 'CV',
  'Cape Verde': 'CV',
  'Dem. Rep. Congo': 'CD',
  'Democratic Republic of the Congo': 'CD',
  'Republic of the Congo': 'CG',
  'North Macedonia': 'MK',
  'eSwatini': 'SZ',
  'Eswatini': 'SZ',
  'Swaziland': 'SZ',
  'Timor-Leste': 'TL',
  'East Timor': 'TL',
  'Türkiye': 'TR',
  'Turkey': 'TR',
  'Myanmar': 'MM',
  'Burma': 'MM',
  'Ivory Coast': 'CI',
  "Côte d'Ivoire": 'CI',
  'Cote d\'Ivoire': 'CI',
  'South Korea': 'KR',
  'Korea, Republic of': 'KR',
  'North Korea': 'KP',
  "Korea, Democratic People's Republic of": 'KP',
  'Iran': 'IR',
  'Syria': 'SY',
  'Vietnam': 'VN',
  'Laos': 'LA',
  'Moldova': 'MD',
  'Tanzania': 'TZ',
  'Brunei': 'BN',
  'Bolivia': 'BO',
  'Venezuela': 'VE',
  'Falkland Islands': 'FK',
  'Vatican City': 'VA',
  'Palestine': 'PS',
  'Hong Kong': 'HK',
  'Macao': 'MO',
  'Taiwan': 'TW',
  'United Kingdom': 'GB',
};

// Names we know we never resolve via Intl (regions, mappings without an
// ISO-3166-1 entry). Returning the canonical English here is the right
// answer; we just want to skip the lookup work.
const KNOWN_NON_ISO = new Set([
  'Channel Islands',
  'Kosovo', // XK is reserved but not always recognised by Intl.DisplayNames
  'Unknown',
]);

// Build the EnglishName → ISO2 map once. Re-runs are cheap (Intl is
// constant) but caching avoids the array iteration on every call.
let englishNameToIso2 = null;
function ensureMap() {
  if (englishNameToIso2) return englishNameToIso2;
  englishNameToIso2 = {};
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    // Old browsers — bail to overrides only.
    Object.assign(englishNameToIso2, CANONICAL_OVERRIDES);
    return englishNameToIso2;
  }
  const enDN = new Intl.DisplayNames('en', { type: 'region' });
  ISO2_CODES.forEach(code => {
    try {
      const name = enDN.of(code);
      if (name && name !== code) englishNameToIso2[name] = code;
    } catch {
      /* ignore unsupported codes */
    }
  });
  // Overrides win over Intl's English output.
  Object.assign(englishNameToIso2, CANONICAL_OVERRIDES);
  return englishNameToIso2;
}

// Per-locale Intl.DisplayNames cache so we don't reconstruct on every
// render of a tooltip / chart tick.
const localeDNCache = new Map();
function getLocaleDN(locale) {
  if (localeDNCache.has(locale)) return localeDNCache.get(locale);
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    localeDNCache.set(locale, null);
    return null;
  }
  try {
    const dn = new Intl.DisplayNames(locale, { type: 'region', fallback: 'code' });
    localeDNCache.set(locale, dn);
    return dn;
  } catch {
    localeDNCache.set(locale, null);
    return null;
  }
}

/**
 * Localize an AMRnet canonical English country name to the given locale
 * via Intl.DisplayNames. Returns the input unchanged if the canonical
 * name doesn't map to a known ISO-3166-1 code or if Intl is unavailable.
 *
 * @param {string} canonicalEnglishName  e.g. 'United States of America'
 * @param {string} locale                e.g. 'en' | 'pt' | 'es' | 'fr'
 * @returns {string}                     localized name (or English fallback)
 */
export function getLocalizedCountryName(canonicalEnglishName, locale = 'en') {
  if (!canonicalEnglishName) return canonicalEnglishName;
  if (locale === 'en') return canonicalEnglishName;
  if (KNOWN_NON_ISO.has(canonicalEnglishName)) return canonicalEnglishName;

  const map = ensureMap();
  const iso2 = map[canonicalEnglishName];
  if (!iso2) return canonicalEnglishName;

  const dn = getLocaleDN(locale);
  if (!dn) return canonicalEnglishName;

  try {
    const localized = dn.of(iso2);
    return localized || canonicalEnglishName;
  } catch {
    return canonicalEnglishName;
  }
}
