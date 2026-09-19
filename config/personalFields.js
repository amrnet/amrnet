/**
 * Patient-level / quasi-identifier fields that are stored on styphi records but
 * are NOT used by any dashboard graph or filter. They must never be shipped to
 * the browser, the public REST API, or the S3 / file exports.
 *
 * A DB scan (scripts/gdpr-field-check.mjs) confirmed styphi is the only
 * collection where these fields are populated; the other organisms carry none,
 * so excluding these names on those collections is a harmless no-op.
 *
 * NOTE: `TRAVEL` (the local/travel/community category) is intentionally NOT
 * here — it drives the dashboard dataset filter and is not free-text/personal.
 */
export const STYPHI_PERSONAL_FIELDS = [
  'AGE',
  'CONTACT',
  'LAB',
  'SYMPTOM STATUS',
  'TRAVEL COUNTRY',
  'TRAVEL ASSOCIATED',
  'TRAVEL_LOCATION',
  'LOCATION',
  'REGION_IN_COUNTRY',
  'COUNTRY OF ORIGIN',
  'LATITUDE',
  'LONGITUDE',
];

// MongoDB exclusion projection, e.g. find(query, { projection: STYPHI_PERSONAL_FIELDS_EXCLUSION })
export const STYPHI_PERSONAL_FIELDS_EXCLUSION = Object.fromEntries(
  STYPHI_PERSONAL_FIELDS.map(field => [field, 0]),
);

// Remove the personal fields from a plain object (e.g. a row parsed from a
// CSV/TSV fallback that bypasses the DB projection). Mutates and returns it.
export function stripPersonalFields(row) {
  if (!row || typeof row !== 'object') return row;
  for (const field of STYPHI_PERSONAL_FIELDS) {
    delete row[field];
  }
  return row;
}
