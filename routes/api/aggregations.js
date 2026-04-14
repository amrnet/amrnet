/**
 * Server-side aggregation endpoints for AMRnet.
 *
 * These replace the large client-side aggregation functions in filters.js
 * (getYearsData, getMapData, getDrugsCountriesData, getGenotypesData) by
 * running the equivalent logic as MongoDB $group pipelines.
 *
 * All endpoints accept common filter query params:
 *   dateFrom   – start year (inclusive), integer
 *   dateTo     – end year (inclusive), integer
 *   dataset    – 'community' | 'travel' | 'All'
 *   pathotype  – pathotype string (ecoli/decoli/shige only)
 *   serotype   – serovar substring match (sentericaints only)
 *   datasetKP  – kpneumo dataset filter column name
 *
 * Endpoints:
 *   GET /api/agg/:organism/yearly     – per-year drug counts + top genotype distribution
 *   GET /api/agg/:organism/countries  – per-country drug counts
 *   GET /api/agg/:organism/genotypes  – per-genotype drug counts (top 50)
 */

import express from 'express';
import connectDB from '../../config/db.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Database configuration per organism
// ---------------------------------------------------------------------------
const DB_CONFIG = {
  ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
  decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
  shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
  senterica: { dbName: 'senterica', collectionName: 'amrnetdb_senterica' },
  sentericaints: { dbName: 'sentericaints', collectionName: 'amrnetdb_ints' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  ngono: { dbName: 'ngono', collectionName: 'amrnetdb_ngono' },
  saureus: { dbName: 'saureus', collectionName: 'amrnetdb_saureus' },
  strepneumo: { dbName: 'strepneumo', collectionName: 'amrnetdb_spneumo' },
};

// ---------------------------------------------------------------------------
// Expression helpers
// ---------------------------------------------------------------------------

/**
 * Safe substring match expression for MongoDB aggregation.
 * Uses $regexMatch with $ifNull to handle null/missing fields gracefully.
 * Escapes special regex characters in the substring.
 */
function includesExpr(fieldExpr, substring) {
  const escaped = substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    $regexMatch: { input: { $ifNull: [fieldExpr, ''] }, regex: escaped },
  };
}

/** Read a hyphenated field name safely (requires MongoDB 5.0+). */
const getHyphenField = fieldName => ({ $getField: fieldName });

/**
 * Read a hyphenated field from a nested object.
 * e.g. getHyphenFieldFrom('BETA-LACTAM', '$extraData')
 */
const getHyphenFieldFrom = (fieldName, inputExpr) => ({
  $getField: { field: fieldName, input: inputExpr },
});

// ---------------------------------------------------------------------------
// Drug resistance conditions
// Drug conditions are MongoDB aggregation boolean expressions that mirror the
// frontend drugClassesRules.js logic exactly.
// Each condition evaluates to truthy (used inside $cond: [condition, 1, 0]).
// ---------------------------------------------------------------------------

/**
 * Shared drug conditions for ecoli, decoli, shige, senterica, sentericaints.
 * Resistant = column has a non-empty value (not '', '-', null).
 */
function buildEcoliConditions() {
  const drugColumns = [
    'Aminoglycoside',
    'Beta-lactam',
    'Sulfonamide',
    'Tetracycline',
    'Phenicol',
    'Quinolone',
    'Fosfomycin',
    'Trimethoprim',
    'Macrolide',
    'Lincosamide',
    'Streptothricin',
    'Rifamycin',
    'Colistin',
    'Bleomycin',
  ];

  // Helper: get field expression (Beta-lactam needs $getField due to hyphen)
  const fieldExpr = col => (col === 'Beta-lactam' ? { $getField: 'Beta-lactam' } : `$${col}`);

  // Resistant: field is not null, not '', not '-'
  const isResistant = col => ({
    $and: [{ $ne: [{ $ifNull: [fieldExpr(col), ''] }, ''] }, { $ne: [{ $ifNull: [fieldExpr(col), '-'] }, '-'] }],
  });

  // Susceptible: field is null, '', or '-'
  const isSusceptible = col => ({
    $or: [{ $eq: [{ $ifNull: [fieldExpr(col), ''] }, ''] }, { $eq: [fieldExpr(col), '-'] }],
  });

  const conditions = {};
  drugColumns.forEach(col => {
    conditions[col] = isResistant(col);
  });

  conditions['Trimethoprim-Sulfamethoxazole'] = {
    $and: [isResistant('Trimethoprim'), isResistant('Sulfonamide')],
  };

  conditions.Pansusceptible = {
    $and: drugColumns.map(col => isSusceptible(col)),
  };

  return conditions;
}

const DRUG_CONDITIONS = {
  // Ecoli, DEcoli, Shige all use identical statKeysECOLI logic
  ecoli: buildEcoliConditions(),
  decoli: buildEcoliConditions(),
  shige: buildEcoliConditions(),

  senterica: buildEcoliConditions(),
  sentericaints: buildEcoliConditions(),

  // K. pneumoniae — drugRulesKP (any column != '-' = resistant)
  kpneumo: {
    Aminoglycosides: { $ne: ['$AGly_acquired', '-'] },

    Carbapenems: { $ne: ['$Bla_Carb_acquired', '-'] },

    ESBL: {
      $or: [
        { $ne: ['$Bla_ESBL_acquired', '-'] },
        { $ne: ['$Bla_Carb_acquired', '-'] },
        { $ne: ['$Bla_ESBL_inhR_acquired', '-'] },
      ],
    },

    'Ciprofloxacin R': {
      $or: [{ $ne: ['$Flq_acquired', '-'] }, { $ne: ['$Flq_mutations', '-'] }],
    },

    Colistin: {
      $or: [{ $ne: ['$Col_acquired', '-'] }, { $ne: ['$Col_mutations', '-'] }],
    },

    Fosfomycin: { $ne: ['$Fcyn_acquired', '-'] },
    Chloramphenicol: { $ne: ['$Phe_acquired', '-'] },
    Sulfonamides: { $ne: ['$Sul_acquired', '-'] },
    Tetracycline: { $ne: ['$Tet_acquired', '-'] },
    Tigecycline: { $ne: ['$Tgc_acquired', '-'] },
    Trimethoprim: { $ne: ['$Tmt_acquired', '-'] },

    'Trimethoprim-sulfamethoxazole': {
      $and: [{ $ne: ['$Tmt_acquired', '-'] }, { $ne: ['$Sul_acquired', '-'] }],
    },

    // num_resistance_classes may be stored as number or string '0'
    Pansusceptible: { $in: ['$num_resistance_classes', [0, '0']] },
  },

  // Salmonella Typhi — drugRulesST (column must equal specific values)
  // blaTEM-1D has a hyphen: must use $getField
  styphi: {
    'Ampicillin/Amoxicillin': { $eq: [getHyphenField('blaTEM-1D'), '1'] },
    Azithromycin: { $eq: ['$azith_pred_pheno', 'AzithR'] },
    Chloramphenicol: { $eq: ['$chloramphenicol_category', 'ChlR'] },
    'Trimethoprim-sulfamethoxazole': { $eq: ['$co_trim', '1'] },
    Ceftriaxone: { $eq: ['$ESBL_category', 'ESBL'] },
    'Ciprofloxacin NS': { $eq: ['$cip_pred_pheno', 'CipNS'] },
    'Ciprofloxacin R': { $eq: ['$cip_pred_pheno', 'CipR'] },
    Ciprofloxacin: { $in: ['$cip_pred_pheno', ['CipNS', 'CipR']] },
    Sulfonamides: { $eq: ['$sul_any', '1'] },
    Tetracycline: { $eq: ['$tetracycline_category', 'TetR'] },
    Trimethoprim: { $eq: ['$dfra_any', '1'] },
    MDR: { $eq: ['$MDR', 'MDR'] },
    XDR: { $eq: ['$XDR', 'XDR'] },
    Pansusceptible: { $eq: ['$amr_category', 'No AMR detected'] },
  },

  // N. gonorrhoeae — drugRulesNG (column === 1 or '1'; stored as integer in MongoDB)
  ngono: {
    Azithromycin: { $in: ['$Azithromycin', ['1', 1]] },
    Ceftriaxone: { $in: ['$CefR1', ['1', 1]] },
    Ciprofloxacin: { $in: ['$Ciprofloxacin', ['1', 1]] },
    Sulfonamides: { $in: ['$Sulfonamides', ['1', 1]] },
    Tetracycline: { $in: ['$Tetracycline', ['1', 1]] },
    Cefixime: { $in: ['$Cefixime', ['1', 1]] },
    Benzylpenicillin: { $in: ['$Penicillin', ['1', 1]] },
    'Susceptible to cat I/II drugs': { $in: ['$Susceptible', ['1', 1]] },
    Spectinomycin: { $in: ['$Spectinomycin', ['1', 1]] },
    MDR: { $in: ['$MDR', ['1', 1]] },
    XDR: { $in: ['$XDR', ['1', 1]] },
  },

  // S. aureus — resistance stored as 1 (resistant) / 0 (susceptible)
  saureus: {
    Amikacin: { $in: ['$Amikacin', ['1', 1]] },
    Gentamicin: { $in: ['$Gentamicin', ['1', 1]] },
    Tobramycin: { $in: ['$Tobramycin', ['1', 1]] },
    Kanamycin: { $in: ['$Kanamycin', ['1', 1]] },
    Methicillin: { $in: ['$Methicillin', ['1', 1]] },
    Penicillin: { $in: ['$Penicillin', ['1', 1]] },
    'Fusidic Acid': { $in: ['$Fusidic Acid', ['1', 1]] },
    Vancomycin: { $in: ['$Vancomycin', ['1', 1]] },
    Clindamycin: { $in: ['$Clindamycin', ['1', 1]] },
    Erythromycin: { $in: ['$Erythromycin', ['1', 1]] },
    Mupirocin: { $in: ['$Mupirocin', ['1', 1]] },
    Linezolid: { $in: ['$Linezolid', ['1', 1]] },
    Tetracycline: { $in: ['$Tetracycline', ['1', 1]] },
    Trimethoprim: { $in: ['$Trimethoprim', ['1', 1]] },
    Daptomycin: { $in: ['$Daptomycin', ['1', 1]] },
    Rifampicin: { $in: ['$Rifampicin', ['1', 1]] },
    Ciprofloxacin: { $in: ['$Ciprofloxacin', ['1', 1]] },
    Moxifloxacin: { $in: ['$Moxifloxacin', ['1', 1]] },
    Teicoplanin: { $in: ['$Teicoplanin', ['1', 1]] },
    // Pansusceptible: none of the drug fields equal 1
    Pansusceptible: {
      $and: [
        { $not: { $in: ['$Amikacin', ['1', 1]] } },
        { $not: { $in: ['$Gentamicin', ['1', 1]] } },
        { $not: { $in: ['$Tobramycin', ['1', 1]] } },
        { $not: { $in: ['$Kanamycin', ['1', 1]] } },
        { $not: { $in: ['$Methicillin', ['1', 1]] } },
        { $not: { $in: ['$Penicillin', ['1', 1]] } },
        { $not: { $in: ['$Fusidic Acid', ['1', 1]] } },
        { $not: { $in: ['$Vancomycin', ['1', 1]] } },
        { $not: { $in: ['$Clindamycin', ['1', 1]] } },
        { $not: { $in: ['$Erythromycin', ['1', 1]] } },
        { $not: { $in: ['$Mupirocin', ['1', 1]] } },
        { $not: { $in: ['$Linezolid', ['1', 1]] } },
        { $not: { $in: ['$Tetracycline', ['1', 1]] } },
        { $not: { $in: ['$Trimethoprim', ['1', 1]] } },
        { $not: { $in: ['$Daptomycin', ['1', 1]] } },
        { $not: { $in: ['$Rifampicin', ['1', 1]] } },
        { $not: { $in: ['$Ciprofloxacin', ['1', 1]] } },
        { $not: { $in: ['$Moxifloxacin', ['1', 1]] } },
        { $not: { $in: ['$Teicoplanin', ['1', 1]] } },
      ],
    },
  },

  // S. pneumoniae — resistance stored as 1 (resistant) / 0 (susceptible)
  strepneumo: {
    Chloramphenicol: { $in: ['$Chloramphenicol', ['1', 1]] },
    Clindamycin: { $in: ['$Clindamycin', ['1', 1]] },
    Erythromycin: { $in: ['$Erythromycin', ['1', 1]] },
    Fluoroquinolones: { $in: ['$Fluoroquinolones', ['1', 1]] },
    Kanamycin: { $in: ['$Kanamycin', ['1', 1]] },
    // Linezolid: { $in: ['$Linezolid', ['1', 1]] },
    Tetracycline: { $in: ['$Tetracycline', ['1', 1]] },
    Trimethoprim: { $in: ['$Trimethoprim', ['1', 1]] },
    Sulfamethoxazole: { $in: ['$Sulfamethoxazole', ['1', 1]] },
    'Co-Trimoxazole': { $in: ['$Co-Trimoxazole', ['1', 1]] },
    // Pansusceptible: none of the drug fields equal 1
    Pansusceptible: {
      $and: [
        { $not: { $in: ['$Chloramphenicol', ['1', 1]] } },
        { $not: { $in: ['$Clindamycin', ['1', 1]] } },
        { $not: { $in: ['$Erythromycin', ['1', 1]] } },
        { $not: { $in: ['$Fluoroquinolones', ['1', 1]] } },
        { $not: { $in: ['$Kanamycin', ['1', 1]] } },
        // { $not: { $in: ['$Linezolid', ['1', 1]] } },
        { $not: { $in: ['$Tetracycline', ['1', 1]] } },
        { $not: { $in: ['$Trimethoprim', ['1', 1]] } },
        { $not: { $in: ['$Sulfamethoxazole', ['1', 1]] } },
        { $not: { $in: ['$Co-Trimoxazole', ['1', 1]] } },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Pipeline helpers
// ---------------------------------------------------------------------------

/**
 * Build the initial $match stage from request query parameters.
 * Mirrors the filter logic in client/src/components/Dashboard/filters.js.
 *
 * Extra params handled here (beyond those in the original design):
 *   countries – comma-separated raw COUNTRY_ONLY values to restrict the query to.
 *               The client extracts these from already-filtered IndexedDB records, so
 *               they are the exact raw strings stored in the DB (no normalisation needed).
 */
function buildMatchStage(organism, query) {
  const { dateFrom, dateTo, dataset, pathotype, serotype, datasetKP, countries } = query;

  const match = {
    'dashboard view': { $regex: /^include$/i },
  };

  // GENOTYPE null filter (same as existing paginated endpoints)
  if (['kpneumo', 'ecoli', 'decoli'].includes(organism)) {
    match.GENOTYPE = { $ne: null };
  }

  // Date range — use $expr/$toInt so the filter works whether DATE is stored
  // as an integer (2001) or a string ('2001'), which varies across organisms.
  if (dateFrom || dateTo) {
    const dateFromInt = dateFrom ? parseInt(dateFrom, 10) : null;
    const dateToInt = dateTo ? parseInt(dateTo, 10) : null;
    const dateExprs = [];
    if (dateFromInt !== null && !isNaN(dateFromInt)) {
      dateExprs.push({ $gte: [{ $toInt: { $ifNull: ['$DATE', 0] } }, dateFromInt] });
    }
    if (dateToInt !== null && !isNaN(dateToInt)) {
      dateExprs.push({ $lte: [{ $toInt: { $ifNull: ['$DATE', 0] } }, dateToInt] });
    }
    if (dateExprs.length === 1) match.$expr = dateExprs[0];
    else if (dateExprs.length > 1) match.$expr = { $and: dateExprs };
  }

  // Country filter — raw COUNTRY_ONLY values (comma-separated string or array)
  if (countries) {
    const list = Array.isArray(countries)
      ? countries
      : countries
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);
    if (list.length === 1) {
      match.COUNTRY_ONLY = list[0];
    } else if (list.length > 1) {
      match.COUNTRY_ONLY = { $in: list };
    }
  }

  // Travel / community dataset filter (used by styphi; ignored by others where TRAVEL is absent)
  if (dataset && dataset !== 'All') {
    match.TRAVEL = dataset.toLowerCase();
  }

  // Pathotype filter (ecoli, decoli, shige) — accepts a single value or comma-separated list
  if (pathotype && pathotype !== 'All' && ['ecoli', 'decoli', 'shige'].includes(organism)) {
    const list = pathotype
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    match.Pathovar = list.length === 1 ? { $regex: list[0], $options: 'i' } : { $in: list };
  }

  // Serotype filter (sentericaints) — accepts a single value or comma-separated list
  if (serotype && serotype !== 'All' && organism === 'sentericaints') {
    const list = serotype
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    match.seqsero2 = list.length === 1 ? { $regex: list[0], $options: 'i' } : { $in: list };
  }

  // Kpneumo dataset filter — must carry a non-'-' value in the specified column
  // datasetKP is the display name; the actual column is resolved frontend-side, but
  // the column name can be passed as datasetKPColumn.
  if (datasetKP && datasetKP !== 'All' && organism === 'kpneumo' && query.datasetKPColumn) {
    const col = query.datasetKPColumn;
    match[col] = { $ne: '-' };
  }

  return { $match: match };
}

/**
 * Return organism-specific pipeline stages that must run between $match and $group.
 * Senterica needs GENOTYPE computation; sentericaints needs $lookup join.
 * Drug columns are now in new format (Aminoglycoside, Beta-lactam, etc.) for all organisms.
 */
function getPrepipelineStages(organism) {
  switch (organism) {
    case 'senterica':
      return [
        {
          $addFields: {
            GENOTYPE: {
              $cond: {
                if: { $ne: ['$GENOTYPE', null] },
                then: '$GENOTYPE',
                else: 'Unknown',
              },
            },
          },
        },
      ];

    case 'sentericaints':
      // Drug columns are now directly in amrnetdb_ints — no $lookup needed
      return [];

    default:
      return [];
  }
}

/**
 * Build the $group accumulator fields for all drug conditions of an organism.
 * Returns an object like:
 *   { Aminoglycosides: { $sum: { $cond: [condition, 1, 0] } }, ... }
 */
function buildDrugAccumulators(organism) {
  const conditions = DRUG_CONDITIONS[organism];
  if (!conditions) return {};
  return Object.fromEntries(
    Object.entries(conditions).map(([drug, condition]) => [drug, { $sum: { $cond: [condition, 1, 0] } }]),
  );
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/agg/:organism/yearly
 *
 * Returns:
 *   drugsData      – [{ name: year, count: total, Aminoglycosides: n, ESBL: n, ... }]
 *   genotypesData  – [{ name: year, count: total, ST131: n, ..., 'Other Genotypes': n }]
 *   uniqueGenotypes – string[] top 20 genotypes by overall count
 *   drugs          – string[] ordered list of drug keys
 */
router.get('/agg/:organism/yearly', async (req, res) => {
  const { organism } = req.params;
  const config = DB_CONFIG[organism];
  if (!config) return res.status(404).json({ error: `Unknown organism: ${organism}` });

  try {
    const client = await connectDB();
    const collection = client.db(config.dbName).collection(config.collectionName);

    const matchStage = buildMatchStage(organism, req.query);
    const prepipelineStages = getPrepipelineStages(organism);
    const drugAccumulators = buildDrugAccumulators(organism);
    const baseStages = [matchStage, ...prepipelineStages];

    // Step 1: run top-genotypes and yearly-drug-counts in parallel
    const [topGenoResult, yearlyDrugsResult] = await Promise.all([
      collection
        .aggregate([
          ...baseStages,
          { $group: { _id: '$GENOTYPE', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          // { $limit: 30 },
        ])
        .toArray(),

      collection
        .aggregate([
          ...baseStages,
          {
            $group: {
              _id: '$DATE',
              count: { $sum: 1 },
              ...drugAccumulators,
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
    ]);

    const topGenotypes = topGenoResult.map(g => g._id).filter(Boolean);
    const drugsKeys = Object.keys(drugAccumulators);

    // Step 2: per-year genotype counts for top 20 only (avoids huge $push arrays)
    const yearlyGenoResult = await collection
      .aggregate([
        ...baseStages,
        { $match: { GENOTYPE: { $in: topGenotypes } } },
        {
          $group: {
            _id: { year: '$DATE', genotype: '$GENOTYPE' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1 } },
      ])
      .toArray();

    // Build per-year total counts from yearlyDrugsResult (already has totals)
    const yearTotals = Object.fromEntries(yearlyDrugsResult.map(y => [y._id, y.count]));

    // Pivot yearlyGenoResult into { year → { genotype → count } }
    const genoByYear = {};
    for (const {
      _id: { year, genotype },
      count,
    } of yearlyGenoResult) {
      if (!genoByYear[year]) genoByYear[year] = {};
      genoByYear[year][genotype] = count;
    }

    // Build genotypesData: one entry per year with top-20 genotype counts as keys.
    // No "Other Genotypes" bucket — the client-side getYearsData never added that label
    // and graph components don't expect it.
    const allYears = [...new Set([...yearlyDrugsResult.map(y => y._id), ...Object.keys(genoByYear).map(Number)])]
      .filter(Boolean)
      .sort();

    const genotypesData = allYears.map(year => {
      const row = { name: year, count: yearTotals[year] ?? 0 };
      const genoMap = genoByYear[year] ?? {};
      for (const g of topGenotypes) row[g] = genoMap[g] ?? 0;
      return row;
    });

    // Build drugsData: one entry per year with drug resistance counts
    const drugsData = yearlyDrugsResult.map(y => {
      const row = { name: y._id, count: y.count };
      for (const drug of drugsKeys) row[drug] = y[drug] ?? 0;
      return row;
    });

    return res.json({
      drugsData,
      genotypesData,
      uniqueGenotypes: topGenotypes,
      drugs: drugsKeys,
    });
  } catch (error) {
    console.error(`[agg/${organism}/yearly]`, error.message);
    return res.status(500).json({ error: 'Aggregation failed', detail: error.message });
  }
});

/**
 * GET /api/agg/:organism/countries
 *
 * Returns:
 *   countriesData – [{ name, count, [drug]: n, [drug]_pct: %, topGenotype, topGenotypeCount }]
 *   drugs         – string[] ordered list of drug keys
 */
router.get('/agg/:organism/countries', async (req, res) => {
  const { organism } = req.params;
  const config = DB_CONFIG[organism];
  if (!config) return res.status(404).json({ error: `Unknown organism: ${organism}` });

  try {
    const client = await connectDB();
    const collection = client.db(config.dbName).collection(config.collectionName);

    const matchStage = buildMatchStage(organism, req.query);
    const prepipelineStages = getPrepipelineStages(organism);
    const drugAccumulators = buildDrugAccumulators(organism);
    const baseStages = [matchStage, ...prepipelineStages];
    const drugsKeys = Object.keys(drugAccumulators);

    // Country-level drug counts + top genotype via $facet
    const [facetResult] = await collection
      .aggregate([
        ...baseStages,
        {
          $facet: {
            // Total + drug counts per country
            drugsByCountry: [
              {
                $group: {
                  _id: '$COUNTRY_ONLY',
                  count: { $sum: 1 },
                  ...drugAccumulators,
                },
              },
              { $sort: { count: -1 } },
            ],
            // Top genotype per country (separate group → unwind approach)
            topGenoByCountry: [
              {
                $group: {
                  _id: { country: '$COUNTRY_ONLY', genotype: '$GENOTYPE' },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              {
                $group: {
                  _id: '$_id.country',
                  topGenotype: { $first: '$_id.genotype' },
                  topGenotypeCount: { $first: '$count' },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    // Merge the two facet results by country name
    const topGenoMap = Object.fromEntries(
      (facetResult.topGenoByCountry ?? []).map(r => [
        r._id,
        { topGenotype: r.topGenotype, topGenotypeCount: r.topGenotypeCount },
      ]),
    );

    const countriesData = (facetResult.drugsByCountry ?? [])
      .filter(r => r._id && r.count >= 5) // filter spurious entries with very few samples
      .map(r => {
        const row = {
          name: r._id,
          count: r.count,
          ...(topGenoMap[r._id] ?? {}),
        };
        for (const drug of drugsKeys) {
          row[drug] = r[drug] ?? 0;
          row[`${drug}_pct`] = r.count > 0 ? +(((r[drug] ?? 0) / r.count) * 100).toFixed(2) : 0;
        }
        return row;
      });

    return res.json({ countriesData, drugs: drugsKeys });
  } catch (error) {
    console.error(`[agg/${organism}/countries]`, error.message);
    return res.status(500).json({ error: 'Aggregation failed', detail: error.message });
  }
});

/**
 * GET /api/agg/:organism/genotypes
 *
 * Returns top 50 genotypes by count with per-genotype drug resistance breakdown.
 *
 * Returns:
 *   genotypesData – [{ name, count, [drug]: n, [drug]_pct: % }]
 *   drugs         – string[]
 */
router.get('/agg/:organism/genotypes', async (req, res) => {
  const { organism } = req.params;
  const config = DB_CONFIG[organism];
  if (!config) return res.status(404).json({ error: `Unknown organism: ${organism}` });

  try {
    const client = await connectDB();
    const collection = client.db(config.dbName).collection(config.collectionName);

    const matchStage = buildMatchStage(organism, req.query);
    const prepipelineStages = getPrepipelineStages(organism);
    const drugAccumulators = buildDrugAccumulators(organism);
    const drugsKeys = Object.keys(drugAccumulators);

    const results = await collection
      .aggregate([
        matchStage,
        ...prepipelineStages,
        {
          $group: {
            _id: '$GENOTYPE',
            count: { $sum: 1 },
            ...drugAccumulators,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ])
      .toArray();

    const genotypesData = results.map(r => {
      const row = { name: r._id ?? 'Unknown', count: r.count };
      for (const drug of drugsKeys) {
        row[drug] = r[drug] ?? 0;
        row[`${drug}_pct`] = r.count > 0 ? +(((r[drug] ?? 0) / r.count) * 100).toFixed(2) : 0;
      }
      return row;
    });

    return res.json({ genotypesData, drugs: drugsKeys });
  } catch (error) {
    console.error(`[agg/${organism}/genotypes]`, error.message);
    return res.status(500).json({ error: 'Aggregation failed', detail: error.message });
  }
});

export default router;
