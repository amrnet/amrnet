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

function truncateLincode(lincode, level) {
  if (!lincode || lincode === '-') return null;
  const segments = lincode.split('-');
  return segments.length >= level ? segments.slice(0, level).join('-') : null;
}

function hasPathovar(pathovar) {
  return pathovar != null && pathovar !== '' && pathovar !== '-';
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
  if (!lincode || lincode === '-') return { numeric: null, alias: null, species: null };
  for (const entry of LINEAGES) {
    if (truncateLincode(lincode, entry.level) === entry.prefix) {
      return {
        numeric: entry.numeric,
        alias: hasPathovar(pathovar) ? entry.alias : null,
        species: entry.species,
      };
    }
  }
  return { numeric: null, alias: null, species: null };
}
