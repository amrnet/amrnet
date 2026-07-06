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

function hasPathovar(pathovar) {
  return pathovar != null && pathovar !== '' && pathovar !== '-';
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
 * The data does not carry a single `LINcode` field; it carries the LINcode
 * truncated at fixed levels (`LINcode_11`, `LINcode_9`, ...). We prefer the
 * finest (most segments) available so the most specific lineage entry can
 * match, falling back to coarser levels when the finer ones are missing.
 *
 * @param {object} item - a genome record
 * @returns {string|null} the dash-joined LINcode, or null if none present
 */
export function resolveShigeLincode(item) {
  if (!item) return null;
  const candidates = [item.LINcode_11, item.LINcode_9, item.LINcode_7, item.LINcode_5, item.LINcode_3, item.LINcode];
  for (const c of candidates) {
    if (c && c !== '-') return c;
  }
  return null;
}

/**
 * Derive the numeric LINcode lineage and the named alias for a genome.
 *
 * The named alias (e.g. "Global III", "CipR.SEA") is only assigned when the
 * genome has a pathotype (Pathovar) on record — per the rule that every lincode
 * alias must carry pathotype information. The numeric LINcode lineage is not
 * gated on pathovar.
 *
 * @param {string} lincode - the genome's full LINcode (LINcode field)
 * @param {string} [pathovar] - the genome's Pathovar (pathotype)
 * @returns {{ numeric: string|null, alias: string|null, species: string|null }}
 */
export function deriveShigeLincode(lincode, pathovar) {
  const entry = matchEntry(lincode);
  if (!entry) return { numeric: null, alias: null, species: null };
  return {
    // species-prefixed (e.g. "Ss 3.7.25", "Sf 1.2.2.5") so the label is
    // unambiguous across all four Shigella species wherever it's displayed
    numeric: withSpeciesPrefix(entry.numeric, entry.species),
    // alias gated on pathovar (S. sonnei named lineages only)
    alias: hasPathovar(pathovar) ? entry.alias : null,
    species: entry.species,
  };
}
