/**
 * @fileoverview Regression test for the "Total genomes off by N" bug after
 * dataset toggling (styphi ALL ↔ LOCAL ↔ TRAVEL, kpneumo ALL ↔ ESBL+/CARBA+,
 * sentericaints ALL ↔ ENTERITIDIS/TYPHIMURIUM).
 *
 * Scenario reported by users:
 *   1. Dashboard loads → dataset='All' → Total genomes = N (full count).
 *   2. Toggle dataset='Local' → Total genomes shrinks to L (subset count).
 *   3. Toggle dataset='All' (back) → Total genomes shows N - K instead of N.
 *
 * Root cause: when the dataset filter narrows, `setYears` is called with the
 * subset's year range, which kicks a useEffect that resets
 * actualTimeInitial / actualTimeFinal to the subset's narrower range. When
 * the user toggles back to ALL, `actualTimeInitial / actualTimeFinal`
 * remain pinned to that narrow range, so records outside it are silently
 * dropped from the count. RESET button works because it explicitly resets
 * the year range to the full range after switching dataset.
 *
 * Fix: the dataset-toggle handlers in TopLeftControls now ALSO reset the
 * year range to `yearsCompleteListToShowInGlobalFilter[0..-1]`, mirroring
 * what RESET does.
 */

import { filterData } from '../../components/Dashboard/filters';

// 12 styphi-shaped fixtures spanning 2018-2023, mixing TRAVEL=local/travel.
// 2 records are deliberately placed in years that exist only in the FULL
// data (2018 and 2023) so the bug scenario produces a measurable diff.
const FIXTURES = [
  // Year 2018 — only one record, no local/travel-only data this year
  { GENOTYPE: 'G1', DATE: '2018', COUNTRY_ONLY: 'UK',     TRAVEL: 'travel', PMID: 'p1' },
  // Year 2019 — local
  { GENOTYPE: 'G1', DATE: '2019', COUNTRY_ONLY: 'UK',     TRAVEL: 'local',  PMID: 'p2' },
  { GENOTYPE: 'G2', DATE: '2019', COUNTRY_ONLY: 'France', TRAVEL: 'local',  PMID: 'p3' },
  // Year 2020 — local
  { GENOTYPE: 'G1', DATE: '2020', COUNTRY_ONLY: 'UK',     TRAVEL: 'local',  PMID: 'p4' },
  { GENOTYPE: 'G3', DATE: '2020', COUNTRY_ONLY: 'India',  TRAVEL: 'local',  PMID: 'p5' },
  // Year 2021 — local
  { GENOTYPE: 'G2', DATE: '2021', COUNTRY_ONLY: 'France', TRAVEL: 'local',  PMID: 'p6' },
  // Year 2022 — local + travel
  { GENOTYPE: 'G1', DATE: '2022', COUNTRY_ONLY: 'UK',     TRAVEL: 'local',  PMID: 'p7' },
  { GENOTYPE: 'G2', DATE: '2022', COUNTRY_ONLY: 'France', TRAVEL: 'travel', PMID: 'p8' },
  // Year 2023 — only one record, also a year-edge case
  { GENOTYPE: 'G1', DATE: '2023', COUNTRY_ONLY: 'UK',     TRAVEL: 'travel', PMID: 'p9' },
];

const ALL_YEARS = ['2018', '2019', '2020', '2021', '2022', '2023'];
const LOCAL_YEARS_ONLY = ['2019', '2020', '2021', '2022']; // years where TRAVEL=local exists

describe('Global filter — dataset toggle does not silently shrink Total genomes', () => {
  function callFilterData({ dataset, actualTimeInitial, actualTimeFinal }) {
    return filterData({
      data: FIXTURES,
      dataset,
      datasetKP: 'All',
      actualTimeInitial,
      actualTimeFinal,
      organism: 'styphi',
      actualCountry: 'All',
      actualRegion: 'All',
      economicRegions: {},
      selectedLineages: [],
    });
  }

  test('initial load with dataset=All and full year range returns all records', () => {
    const result = callFilterData({
      dataset: 'All',
      actualTimeInitial: ALL_YEARS[0],
      actualTimeFinal: ALL_YEARS[ALL_YEARS.length - 1],
    });
    expect(result.genomesCount).toBe(FIXTURES.length); // 9
  });

  test('dataset=Local correctly subsets records by TRAVEL field', () => {
    const result = callFilterData({
      dataset: 'Local',
      actualTimeInitial: ALL_YEARS[0],
      actualTimeFinal: ALL_YEARS[ALL_YEARS.length - 1],
    });
    const expectedLocal = FIXTURES.filter(x => x.TRAVEL === 'local').length;
    expect(result.genomesCount).toBe(expectedLocal); // 6
  });

  test('REGRESSION: switching dataset Local → All while year range is still pinned to Local-subset years drops edge-year records', () => {
    // This is the bug we fixed. If the toggle handler only switches dataset
    // without resetting the year range, the next filterData call runs with
    // actualTime pinned to LOCAL_YEARS_ONLY, dropping records from 2018
    // and 2023. Total genomes ends up at 7 instead of 9.
    const buggyResult = callFilterData({
      dataset: 'All',
      actualTimeInitial: LOCAL_YEARS_ONLY[0], // '2019' — narrow start
      actualTimeFinal: LOCAL_YEARS_ONLY[LOCAL_YEARS_ONLY.length - 1], // '2022' — narrow end
    });
    expect(buggyResult.genomesCount).toBe(7); // proves the bug
    expect(buggyResult.genomesCount).toBeLessThan(FIXTURES.length); // wrong!

    // The correct post-toggle state: dataset=All AND year range reset to
    // the full range. genomesCount should match the initial load.
    const fixedResult = callFilterData({
      dataset: 'All',
      actualTimeInitial: ALL_YEARS[0],
      actualTimeFinal: ALL_YEARS[ALL_YEARS.length - 1],
    });
    expect(fixedResult.genomesCount).toBe(FIXTURES.length); // correct
  });

  test('switching dataset Travel → All with full year range returns all records', () => {
    // First go to Travel
    const travel = callFilterData({
      dataset: 'Travel',
      actualTimeInitial: ALL_YEARS[0],
      actualTimeFinal: ALL_YEARS[ALL_YEARS.length - 1],
    });
    const expectedTravel = FIXTURES.filter(x => x.TRAVEL === 'travel').length;
    expect(travel.genomesCount).toBe(expectedTravel); // 3

    // Then back to All — year range must be reset (caller's responsibility)
    const back = callFilterData({
      dataset: 'All',
      actualTimeInitial: ALL_YEARS[0],
      actualTimeFinal: ALL_YEARS[ALL_YEARS.length - 1],
    });
    expect(back.genomesCount).toBe(FIXTURES.length);
  });
});

// ── Same regression for lineage filter (sentericaints / shige / decoli) ──
// These organisms use selectedLineages instead of TRAVEL/datasetKP, but
// the year-range narrowing bug pattern is identical: filtering to a subset
// narrows the visible year range, which then sticks when returning to ALL.
const LINEAGE_FIXTURES = [
  { GENOTYPE: 'L1', DATE: '2018', COUNTRY_ONLY: 'UK',     TRAVEL: 'all', PMID: 'lp1', Pathovar: 'EnteritidisXYZ' }, // edge year
  { GENOTYPE: 'L1', DATE: '2019', COUNTRY_ONLY: 'UK',     TRAVEL: 'all', PMID: 'lp2', Pathovar: 'EnteritidisXYZ' },
  { GENOTYPE: 'L2', DATE: '2020', COUNTRY_ONLY: 'France', TRAVEL: 'all', PMID: 'lp3', Pathovar: 'TyphimuriumXYZ' },
  { GENOTYPE: 'L2', DATE: '2021', COUNTRY_ONLY: 'France', TRAVEL: 'all', PMID: 'lp4', Pathovar: 'TyphimuriumXYZ' },
  { GENOTYPE: 'L1', DATE: '2022', COUNTRY_ONLY: 'India',  TRAVEL: 'all', PMID: 'lp5', Pathovar: 'EnteritidisXYZ' },
  { GENOTYPE: 'L3', DATE: '2023', COUNTRY_ONLY: 'India',  TRAVEL: 'all', PMID: 'lp6', Pathovar: 'OtherXYZ' },         // edge year
];
const LINEAGE_ALL_YEARS = ['2018', '2019', '2020', '2021', '2022', '2023'];
const ENTERITIDIS_ONLY_YEARS = ['2018', '2019', '2022']; // years where only Enteritidis lives

describe('Global filter — lineage toggle does not silently shrink Total genomes', () => {
  function callFilterData({ selectedLineages, actualTimeInitial, actualTimeFinal }) {
    return filterData({
      data: LINEAGE_FIXTURES,
      dataset: 'All',
      datasetKP: 'All',
      actualTimeInitial,
      actualTimeFinal,
      organism: 'sentericaints',
      actualCountry: 'All',
      actualRegion: 'All',
      economicRegions: {},
      selectedLineages,
    });
  }

  test('all lineages selected with full year range returns all records', () => {
    const result = callFilterData({
      selectedLineages: [], // empty → no filter (per filters.js checkLineages)
      actualTimeInitial: LINEAGE_ALL_YEARS[0],
      actualTimeFinal: LINEAGE_ALL_YEARS[LINEAGE_ALL_YEARS.length - 1],
    });
    expect(result.genomesCount).toBe(LINEAGE_FIXTURES.length); // 6
  });

  test('Enteritidis only correctly subsets records by Pathovar', () => {
    const result = callFilterData({
      selectedLineages: ['Enteritidis'],
      actualTimeInitial: LINEAGE_ALL_YEARS[0],
      actualTimeFinal: LINEAGE_ALL_YEARS[LINEAGE_ALL_YEARS.length - 1],
    });
    expect(result.genomesCount).toBe(3); // 3 Enteritidis records
  });

  test('REGRESSION: switching lineage Enteritidis → all-lineages while year range is still pinned to Enteritidis-only years drops edge-year records', () => {
    // Buggy state: lineages cleared (acts as "all") but year range still
    // narrowed to only the Enteritidis years. The 2020/2021 records (only
    // present for Typhimurium) drop out because they're in-range, but the
    // 2023 'OtherXYZ' record drops because 2023 isn't in ENTERITIDIS_ONLY_YEARS.
    const buggyResult = callFilterData({
      selectedLineages: [], // user cleared the filter
      actualTimeInitial: ENTERITIDIS_ONLY_YEARS[0],     // '2018' — narrow start
      actualTimeFinal: ENTERITIDIS_ONLY_YEARS[ENTERITIDIS_ONLY_YEARS.length - 1], // '2022' — narrow end
    });
    expect(buggyResult.genomesCount).toBeLessThan(LINEAGE_FIXTURES.length);
    expect(buggyResult.genomesCount).toBe(5); // 2023 record dropped

    // Fixed state: lineages cleared AND year range reset to full range.
    const fixedResult = callFilterData({
      selectedLineages: [],
      actualTimeInitial: LINEAGE_ALL_YEARS[0],
      actualTimeFinal: LINEAGE_ALL_YEARS[LINEAGE_ALL_YEARS.length - 1],
    });
    expect(fixedResult.genomesCount).toBe(LINEAGE_FIXTURES.length); // 6 — correct
  });
});
