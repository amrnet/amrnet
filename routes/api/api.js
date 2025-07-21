import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';
import { client } from '../../config/db.js';

const dbAndCollectionNames = {
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  ngono: { dbName: 'ngono', collectionName: 'merge_rawdata_ng' },
  ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
  decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
  shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
  senterica: { dbName: 'senterica', collectionName: 'sentericatest' },
  sentericaints: { dbName: 'sentericaints', collectionName: 'merge_rawdata_sients' },
  unr: { dbName: 'unr', collectionName: 'unr' },
};

const sentericaintsFieldsToAdd = {
  AMINOGLYCOSIDE: '$extraData.AMINOGLYCOSIDE',
  'BETA-LACTAM': '$extraData.BETA-LACTAM',
  SULFONAMIDE: '$extraData.SULFONAMIDE',
  TETRACYCLINE: '$extraData.TETRACYCLINE',
  QUINOLONE: '$extraData.QUINOLONE',
  'QUATERNARY AMMONIUM': '$extraData.QUATERNARY AMMONIUM',
  'QUINOLONE/TRICLOSAN': '$extraData.QUINOLONE/TRICLOSAN',
  TRIMETHOPRIM: '$extraData.TRIMETHOPRIM',
  PHENICOL: '$extraData.PHENICOL',
  FOSFOMYCIN: '$extraData.FOSFOMYCIN',
  BLEOMYCIN: '$extraData.BLEOMYCIN',
  MACROLIDE: '$extraData.MACROLIDE',
  'AMINOGLYCOSIDE/QUINOLONE': '$extraData.AMINOGLYCOSIDE/QUINOLONE',
  RIFAMYCIN: '$extraData.RIFAMYCIN',
  'LINCOSAMIDE/MACROLIDE/STREPTOGRAMIN': '$extraData.LINCOSAMIDE/MACROLIDE/STREPTOGRAMIN',
  STREPTOTHRICIN: '$extraData.STREPTOTHRICIN',
  MULTIDRUG: '$extraData.MULTIDRUG',
  'PHENICOL/QUINOLONE': '$extraData.PHENICOL/QUINOLONE',
  'MACROLIDE/STREPTOGRAMIN': '$extraData.MACROLIDE/STREPTOGRAMIN',
  COLISTIN: '$extraData.COLISTIN',
  LINCOSAMIDE: '$extraData.LINCOSAMIDE',
  'LINCOSAMIDE/MACROLIDE': '$extraData.LINCOSAMIDE/MACROLIDE',
  STREPTOGRAMIN: '$extraData.STREPTOGRAMIN',
  'PHENICOL/LINCOSAMIDE/OXAZOLIDINONE/PLEUROMUTILIN/STREPTOGRAMIN':
    '$extraData.PHENICOL/LINCOSAMIDE/OXAZOLIDINONE/PLEUROMUTILIN/STREPTOGRAMIN',
  NITROIMIDAZOLE: '$extraData.NITROIMIDAZOLE',
};

const kpneumoFieldsToIgnore = {
  Amrnet_id: 0,
  Amrnet_version: 0,
  Amrnetdb_date: 0,
  Amrnetdb_version: 0,
  Pathogenwatch_id: 0,
  'MLST (7-locus)': 0,
  'Genome Length': 0,
  'non-ATCG': 0,
  'GC Content': 0,
  'LIN code': 0,
  'Clonal Group': 0,
  latitude: 0,
  longitude: 0,
  day: 0,
  month: 0,
  'Environmental sample': 0,
  'Sample accession': 0,
  'Study accession': 0,
  'Secondary sample accession': 0,
  'Purpose of Sampling': 0,
  'Experiment accession': 0,
  'Collection date': 0,
  'Run accession': 0,
  contig_count: 0,
  N50: 0,
  largest_contig: 0,
  total_size: 0,
  gapA: 0,
  infB: 0,
  mdh: 0,
  pgi: 0,
  phoE: 0,
  rpoB: 0,
  tonB: 0,
  YbST: 0,
  ybtS: 0,
  ybtX: 0,
  ybtQ: 0,
  ybtP: 0,
  ybtA: 0,
  irp2: 0,
  irp1: 0,
  ybtU: 0,
  ybtT: 0,
  ybtE: 0,
  fyuA: 0,
  CbST: 0,
  Colibactin: 0,
  clbA: 0,
  clbB: 0,
  clbC: 0,
  clbD: 0,
  clbE: 0,
  clbF: 0,
  clbG: 0,
  clbH: 0,
  clbI: 0,
  clbL: 0,
  clbM: 0,
  clbN: 0,
  clbO: 0,
  clbP: 0,
  clbQ: 0,
  AbST: 0,
  iucA: 0,
  iucB: 0,
  iucC: 0,
  iucD: 0,
  iutA: 0,
  SmST: 0,
  Salmochelin: 0,
  iroB: 0,
  iroC: 0,
  iroD: 0,
  iroN: 0,
  RmST: 0,
  rmpA: 0,
  rmpD: 0,
  rmpC: 0,
  Ciprofloxacin_profile_support: 0,
  Ciprofloxacin_profile: 0,
  Ciprofloxacin_MIC_prediction: 0,
  wzi: 0,
  K_type: 0,
  K_locus_confidence: 0,
  O_type: 0,
  O_locus_confidence: 0,
  Contig: 0,
  'Match ID': 0,
  Group: 0,
  'Inc Match': 0,
  'Contig Start': 0,
  'Contig End': 0,
  'Reference Start': 0,
  'Reference End': 0,
  _id: 0,
};

const fieldsToProject = Object.keys(sentericaintsFieldsToAdd).reduce(
  (acc, key) => ({ ...acc, [key]: 1 }),
  { NAME: 1 }, // always include NAME for matching
);

const readCsvFallback = (filePath, res) => {
  const results = [];
  fs.createReadStream(filePath)
    .on('error', err => {
      console.error(`Error reading fallback file ${filePath}:`, err);
      return res.json([]);
    })
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      return res.json(results);
    });
};

// Get all data from the clean file inside assets
// To optimize, ensure an index exists on the 'dashboard view' field in the 'merge_rawdata_st' collection.
// db.getSiblingDB('styphi').collection('merge_rawdata_st').createIndex({ 'dashboard view': 1 });
router.get('/getDataForSTyphi', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['styphi'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(`[STyphi API] Found ${result.length} documents for STyphi.`);
    if (result.length > 0) {
      return res.json(result);
    }
    console.warn("[STyphi API] No documents found in the database, falling back to CSV.");
    // Fallback to CSV if no data in DB
    return readCsvFallback(Tools.path_clean_st, res);
  } catch (error) {
    console.error(`[STyphi API] Error retrieving data for STyphi: ${error.message}`);
    res.status(500).json({ error: `Failed to retrieve STyphi data: ${error.message}` });
  }
});

router.get('/getDataForKpneumo', async function (req, res, next) {
  // To optimize, ensure an index exists on the 'dashboard view' field in the 'merge_rawdata_kp' collection.
  // db.getSiblingDB('kpneumo').collection('merge_rawdata_kp').createIndex({ 'dashboard view': 1 });
  const dbAndCollection = dbAndCollectionNames['kpneumo'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find(
        { 'dashboard view': 'Include' },
        {
          projection: kpneumoFieldsToIgnore,
        },
      )
      .toArray();

    console.log(`Found ${result.length} documents for Kpneumo.`);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForNgono', async function (req, res, next) {
  // To optimize, ensure an index exists on the 'dashboard view' field in the 'merge_rawdata_ng' collection.
  // db.getSiblingDB('ngono').collection('merge_rawdata_ng').createIndex({ 'dashboard view': 1 });
  const dbAndCollection = dbAndCollectionNames['ngono'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(`Found ${result.length} documents for Ngono.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_ng, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForEcoli', async function (req, res, next) {
  // To optimize, ensure indexes on 'dashboard view' and 'Name' fields for merge_rawdata_ec,
  // and on 'strain_name' for ecoli-output-full.
  // db.getSiblingDB('ecoli').collection('merge_rawdata_ec').createIndex({ 'dashboard view': 1, 'Name': 1 });
  // db.getSiblingDB('ecoli').collection('ecoli-output-full').createIndex({ 'strain_name': 1 });
  const dbAndCollection = dbAndCollectionNames['ecoli'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'include' } },
        {
          $addFields: {
            GENOTYPE: {
              $cond: {
                if: { $ne: ['$ST', null] },
                then: '$ST',
                else: 'Unknown',
              },
            },
          },
        },
        {
          $project: {
            ST: 0, // remove original field if renaming
          },
        },
      ])
      .toArray();

    console.log(`Found ${result.length} documents for Ecoli.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_ec, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForDEcoli', async function (req, res, next) {
  // To optimize, ensure indexes on 'dashboard view' and 'Name' fields for merge_rawdata_dec,
  // and on 'strain_name' for ecoli-output-full.
  // db.getSiblingDB('decoli').collection('merge_rawdata_dec').createIndex({ 'dashboard view': 1, 'Name': 1 });
  // db.getSiblingDB('decoli').collection('ecoli-output-full').createIndex({ 'strain_name': 1 });
  const dbAndCollection = dbAndCollectionNames['decoli'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'include' })
      .toArray();

    console.log(`Found ${result.length} documents for DEcoli.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_dec, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForShige', async function (req, res, next) {
  // To optimize, ensure indexes on 'dashboard view' and 'Name' fields for merge_rawdata_sh,
  // and on 'strain_name' for ecoli-output-full.
  // db.getSiblingDB('shige').collection('merge_rawdata_sh').createIndex({ 'dashboard view': 1, 'Name': 1 });
  // db.getSiblingDB('shige').collection('ecoli-output-full').createIndex({ 'strain_name': 1 });
  const dbAndCollection = dbAndCollectionNames['shige'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'include' })
      .toArray();

    console.log(`Found ${result.length} documents for Shige.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_sh, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSenterica', async function (req, res, next) {
  // To optimize, ensure indexes on 'dashboard view' and 'NAME' fields for sentericatest,
  // and on 'NAME' for senterica-output-full_bkp.
  // db.getSiblingDB('senterica').collection('sentericatest').createIndex({ 'dashboard view': 1, 'NAME': 1 });
  // db.getSiblingDB('senterica').collection('senterica-output-full_bkp').createIndex({ 'NAME': 1 });
  const dbAndCollection = dbAndCollectionNames['senterica'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $addFields: {
            GENOTYPE: {
              $cond: {
                if: { $ne: ['$MLST_Achtman', null] },
                then: '$MLST_Achtman',
                else: 'Unknown',
              },
            },
          },
        },
        {
          $project: {
            MLST_Achtman: 0, // remove original field if renaming
          },
        },
      ])
      .toArray();

    console.log(`Found ${result.length} documents for Senterica.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_se, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSentericaints', async function (req, res, next) {
  // To optimize, ensure indexes on 'dashboard view' and 'NAME' fields for merge_rawdata_sients,
  // and on 'NAME' for senterica-output-full.
  // db.getSiblingDB('sentericaints').collection('merge_rawdata_sients').createIndex({ 'dashboard view': 1, 'NAME': 1 });
  // db.getSiblingDB('sentericaints').collection('senterica-output-full').createIndex({ 'NAME': 1 });
  const dbAndCollection = dbAndCollectionNames['sentericaints'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $lookup: {
            from: 'senterica-output-full',
            let: { nameField: '$NAME' },
            pipeline: [{ $match: { $expr: { $eq: ['$NAME', '$$nameField'] } } }, { $project: fieldsToProject }],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();
    console.log(`Found ${result.length} documents for Sentericaints.`);
    if (result.length > 0) {
      return res.json(result);
    }
    return readCsvFallback(Tools.path_clean_seints, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getCollectionCounts', async function (req, res, next) {
  try {
    // Perform asynchronous counting of documents in parallel across databases
    const countPromises = Object.entries(dbAndCollectionNames).map(([key, { dbName, collectionName }]) => {
      return client
        .db(dbName)
        .collection(collectionName)
        .countDocuments({ 'dashboard view': ['shige', 'decoli', 'ecoli'].includes(key) ? 'include' : 'Include' });
    });

    // Wait for all counts to resolve
    const counts = await Promise.all(countPromises);

    // Get object with counts
    const result = Object.keys(dbAndCollectionNames).reduce((acc, key, index) => {
      acc[key] = counts[index].toLocaleString('fi-FI');
      return acc;
    }, {});

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getUNR', async function (req, res, next) {
  // This collection is small, but an index on queried fields would be good practice if it grows.
  // For find({}), no index is needed unless a sort is applied.
  const dbAndCollection = dbAndCollectionNames['unr'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({})
      .toArray();

    console.log(`Found ${result.length} documents for UNR.`);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
