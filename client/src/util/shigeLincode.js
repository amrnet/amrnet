// Shigella LINcode → lineage derivation.
//
// Each shige genome carries a 13-segment `LINcode` (e.g. "0-2-0-0-0-0-0-1-0-1-0").
// The lookup table (lincode_shigella_lineages.json, generated from the .tsv by
// scripts/build-shige-lincode-lookup.mjs) maps LINcode prefixes — at a given
// level (number of segments) — to two lineage dimensions:
//   - numeric : hierarchical LINcode lineage label (all Shigella species)
//   - alias   : named lineage alias (S. sonnei only; e.g. "CipR.SEA")
//
// A genome matches an entry when its LINcode truncated to `level` segments
// equals the entry `prefix`. Entries are pre-sorted longest-level-first so the
// most specific match wins.

import LINEAGES from '../data/lincode_shigella_lineages.json';

// Index the lineage table for fast lookup: instead of scanning all ~93 entries
// (each doing a string split) per genome, group entries by level and key them
// by prefix. To match a genome we truncate its LINcode at each distinct level
// (only a handful) and do an O(1) Map lookup. Levels are visited most-specific
// first so the finest match wins (mirrors the original longest-level-first scan).
const LEVELS = [...new Set(LINEAGES.map(e => e.level))].sort((a, b) => b - a);
const BY_LEVEL = new Map(LEVELS.map(lvl => [lvl, new Map()]));
for (const entry of LINEAGES) {
  const m = BY_LEVEL.get(entry.level);
  if (!m.has(entry.prefix)) m.set(entry.prefix, entry);
}

// Memoize the matched entry per LINcode string. The same prefixes recur across
// thousands of genomes (and across every filter re-derivation), so the cache
// turns repeated work into O(1) hits.
const matchCache = new Map();

function matchEntry(lincode) {
  if (!lincode || lincode === '-') return null;
  if (matchCache.has(lincode)) return matchCache.get(lincode);
  const segments = lincode.split('-');
  let found = null;
  for (const lvl of LEVELS) {
    if (segments.length < lvl) continue;
    const entry = BY_LEVEL.get(lvl).get(segments.slice(0, lvl).join('-'));
    if (entry) {
      found = entry;
      break;
    }
  }
  matchCache.set(lincode, found);
  return found;
}

/**
 * Resolve the best available LINcode string from a genome record.
 *
 * Records carry the full barcode in `LINcode` plus copies truncated at fixed
 * levels (`LINcode_11`, `LINcode_9`, ...). Prefer the finest (most segments)
 * available so the most specific lineage entry can match, falling back to
 * coarser levels when the finer ones are missing.
 *
 * @param {object} item - a genome record
 * @returns {string|null} the dash-joined LINcode, or null if none present
 */
export function resolveShigeLincode(item) {
  if (!item) return null;
  const candidates = [item.LINcode, item.LINcode_11, item.LINcode_9, item.LINcode_7, item.LINcode_5, item.LINcode_3];
  for (const c of candidates) {
    if (c && c !== '-') return c;
  }
  return null;
}

/**
 * Derive the LINcode lineage (the genotype mapped from the LINcode) for a
 * genome. The named alias dimension was removed in the July 2026 review — only
 * the LIN code and the genotype mapped from it are shown.
 *
 * @param {string} lincode - the genome's LINcode
 * @returns {{ numeric: string|null, species: string|null }}
 */
export function deriveShigeLincode(lincode) {
  const entry = matchEntry(lincode);
  if (!entry) return { numeric: null, species: null };
  return { numeric: entry.numeric, species: entry.species };
}

// Two-letter species code from the Pathovar field, per Kat's July 2026 review
// ('Ss 3.7.25', and EIEC lineages keyed by ST). Shigella species map to
// Ss/Sf/Sb/Sd; enteroinvasive E. coli maps to EIEC. Other pathotypes and
// non-target genomes return '' (no lineage label).
const SPECIES_CODES = [
  [/sonnei/i, 'Ss'],
  [/flexneri/i, 'Sf'],
  [/boydii/i, 'Sb'],
  [/dysenteriae/i, 'Sd'],
  [/EIEC/i, 'EIEC'],
];
export function shigeSpeciesCode(pathovar) {
  if (!pathovar) return '';
  for (const [re, code] of SPECIES_CODES) {
    if (re.test(pathovar)) return code;
  }
  return '';
}

/**
 * Lineage label for the 'Genotype prevalence' dimension, per the July 2026
 * review:
 *   - Shigella with a LINcode-mapped genotype -> species-prefixed genotype
 *     ('Ss 3.7.25'); labels that already carry the species code (e.g. 'Sb20')
 *     are left as-is to avoid doubling.
 *   - EIEC -> always an ST-based alias ('EIEC ST270'), since the LINcode
 *     genotype scheme is Shigella-centric and EIEC/Shigella share prefixes.
 *   - Shigella without a genotype match -> species-prefixed ST fallback.
 * Returns null for non-target genomes (no lineage label).
 *
 * @param {object} item - a genome record (needs Pathovar, GENOTYPE, LINcode*)
 * @returns {string|null}
 */
export function shigeGenotypeLabel(item) {
  if (!item) return null;
  const code = shigeSpeciesCode(item.Pathovar);
  const st = item.GENOTYPE && item.GENOTYPE !== '-' ? item.GENOTYPE : null;

  if (code === 'EIEC') return st ? `EIEC ${st}` : null;

  const { numeric } = deriveShigeLincode(resolveShigeLincode(item));
  if (numeric) {
    if (!code) return numeric;
    return numeric.toLowerCase().startsWith(code.toLowerCase()) ? numeric : `${code} ${numeric}`;
  }
  // Shigella species with no genotype match — fall back to the species-prefixed ST.
  return code && st ? `${code} ${st}` : null;
}
