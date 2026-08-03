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

// Species abbreviation prepended to the numeric lineage label so genotype
// labels read unambiguously across all four Shigella species wherever they
// appear (plots, dropdowns, tables, downloads).
const SPECIES_PREFIX = {
  'Shigella sonnei': 'Ss',
  'Shigella flexneri': 'Sf',
  'S. dysenteriae': 'Sd',
  'S. boydii': 'Sb',
};

function withSpeciesPrefix(numeric, species) {
  const prefix = SPECIES_PREFIX[species];
  if (!numeric || !prefix) return numeric;
  // Some raw lineage labels (boydii/dysenteriae) already carry the prefix
  // (e.g. "Sb20"); don't double it up.
  if (numeric.startsWith(prefix)) return numeric;
  return `${prefix}${numeric}`;
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
  return {
    // species-prefixed (e.g. "Ss 3.7.25", "Sf 1.2.2.5") so the label is
    // unambiguous across all four Shigella species wherever it's displayed
    numeric: withSpeciesPrefix(entry.numeric, entry.species),
    species: entry.species,
  };
}

/**
 * Convenience wrapper combining lincode resolution and lineage derivation:
 * the species-prefixed numeric label for a genome record, or null.
 *
 * @param {object} item - a genome record
 * @returns {string|null}
 */
export function shigeGenotypeLabel(item) {
  return deriveShigeLincode(resolveShigeLincode(item)).numeric;
}
